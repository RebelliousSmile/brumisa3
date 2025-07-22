const BaseService = require('./BaseService');
const Oracle = require('../models/Oracle');
const OracleItem = require('../models/OracleItem');
const db = require('../database/db');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

/**
 * Service d'administration des oracles - Import/Export et gestion avancée
 */
class AdminOracleService extends BaseService {
    constructor() {
        super('AdminOracleService');
        this.oracleModel = new Oracle();
        this.oracleItemModel = new OracleItem();
        this.tempDir = path.join(__dirname, '../temp');
    }

    /**
     * Initialise le service (création dossier temporaire)
     */
    async init() {
        try {
            await fs.mkdir(this.tempDir, { recursive: true });
        } catch (error) {
            this.logError(error, { context: 'init_temp_directory' });
        }
    }

    /**
     * Importe un oracle depuis un fichier JSON
     * @param {Buffer} fileBuffer - Contenu du fichier
     * @param {string} filename - Nom du fichier
     * @param {string} importMode - Mode d'import (CREATE, REPLACE, MERGE)
     * @param {number} adminUserId - ID de l'administrateur
     * @returns {Promise<Object>} Résultat de l'import
     */
    async importFromJSON(fileBuffer, filename, importMode = 'CREATE', adminUserId) {
        const importRecord = {
            admin_user_id: adminUserId,
            filename: filename,
            file_size: fileBuffer.length,
            file_hash: crypto.createHash('sha256').update(fileBuffer).digest('hex'),
            import_type: 'JSON',
            import_mode: importMode,
            items_imported: 0,
            items_failed: 0,
            validation_errors: [],
            import_status: 'PENDING',
            start_time: Date.now()
        };

        try {
            // 1. Vérifier les doublons de hash
            const existingImport = await this._checkDuplicateImport(importRecord.file_hash);
            if (existingImport && importMode !== 'REPLACE') {
                throw new Error(`Fichier déjà importé le ${new Date(existingImport.created_at).toLocaleDateString()}`);
            }

            // 2. Parser et valider le JSON
            const jsonData = JSON.parse(fileBuffer.toString('utf-8'));
            const validationResult = await this._validateJSONStructure(jsonData);
            
            if (!validationResult.isValid) {
                importRecord.validation_errors = validationResult.errors;
                importRecord.import_status = 'FAILED';
                await this._saveImportRecord(importRecord);
                throw new Error(`Fichier JSON invalide: ${validationResult.errors.join(', ')}`);
            }

            // 3. Créer l'enregistrement d'import
            const importId = await this._saveImportRecord(importRecord);

            // 4. Traiter l'import selon le mode
            const result = await this._processJSONImport(jsonData, importMode, adminUserId, importId);

            // 5. Finaliser l'import
            const finalRecord = {
                ...importRecord,
                oracle_id: result.oracle.id,
                items_imported: result.imported,
                items_failed: result.failed,
                import_status: result.failed > 0 ? 'PARTIAL' : 'SUCCESS',
                processing_time_ms: Date.now() - importRecord.start_time,
                validation_errors: result.errors
            };

            await this._updateImportRecord(importId, finalRecord);

            this.log('info', 'Import JSON terminé', {
                oracle_id: result.oracle.id,
                items_imported: result.imported,
                items_failed: result.failed,
                admin_id: adminUserId
            });

            return {
                success: true,
                oracle: result.oracle,
                stats: {
                    imported: result.imported,
                    failed: result.failed,
                    total: result.imported + result.failed
                },
                errors: result.errors
            };

        } catch (error) {
            importRecord.import_status = 'FAILED';
            importRecord.processing_time_ms = Date.now() - importRecord.start_time;
            importRecord.validation_errors.push(error.message);
            
            if (importRecord.import_id) {
                await this._updateImportRecord(importRecord.import_id, importRecord);
            }

            this.logError(error, { filename, import_mode: importMode });
            throw error;
        }
    }

    /**
     * Importe un oracle depuis un fichier CSV
     * @param {Buffer} fileBuffer - Contenu du fichier
     * @param {string} filename - Nom du fichier
     * @param {string} importMode - Mode d'import
     * @param {number} adminUserId - ID de l'administrateur
     * @returns {Promise<Object>} Résultat de l'import
     */
    async importFromCSV(fileBuffer, filename, importMode = 'CREATE', adminUserId) {
        const importRecord = {
            admin_user_id: adminUserId,
            filename: filename,
            file_size: fileBuffer.length,
            file_hash: crypto.createHash('sha256').update(fileBuffer).digest('hex'),
            import_type: 'CSV',
            import_mode: importMode,
            items_imported: 0,
            items_failed: 0,
            validation_errors: [],
            import_status: 'PENDING',
            start_time: Date.now()
        };

        try {
            // 1. Parser le CSV
            const csvData = await this._parseCSV(fileBuffer.toString('utf-8'));
            const validationResult = await this._validateCSVStructure(csvData);

            if (!validationResult.isValid) {
                importRecord.validation_errors = validationResult.errors;
                importRecord.import_status = 'FAILED';
                await this._saveImportRecord(importRecord);
                throw new Error(`Fichier CSV invalide: ${validationResult.errors.join(', ')}`);
            }

            // 2. Créer l'enregistrement d'import
            const importId = await this._saveImportRecord(importRecord);

            // 3. Convertir CSV vers format JSON
            const jsonData = this._convertCSVToJSON(csvData, filename);

            // 4. Traiter l'import
            const result = await this._processJSONImport(jsonData, importMode, adminUserId, importId);

            // 5. Finaliser
            const finalRecord = {
                ...importRecord,
                oracle_id: result.oracle.id,
                items_imported: result.imported,
                items_failed: result.failed,
                import_status: result.failed > 0 ? 'PARTIAL' : 'SUCCESS',
                processing_time_ms: Date.now() - importRecord.start_time,
                validation_errors: result.errors
            };

            await this._updateImportRecord(importId, finalRecord);

            return {
                success: true,
                oracle: result.oracle,
                stats: {
                    imported: result.imported,
                    failed: result.failed,
                    total: result.imported + result.failed
                },
                errors: result.errors
            };

        } catch (error) {
            importRecord.import_status = 'FAILED';
            importRecord.processing_time_ms = Date.now() - importRecord.start_time;
            importRecord.validation_errors.push(error.message);
            
            if (importRecord.import_id) {
                await this._updateImportRecord(importRecord.import_id, importRecord);
            }

            this.logError(error, { filename, import_mode: importMode });
            throw error;
        }
    }

    /**
     * Exporte un oracle en format JSON
     * @param {string} oracleId - ID de l'oracle
     * @param {boolean} includeMetadata - Inclure les métadonnées
     * @returns {Promise<Object>} Données JSON
     */
    async exportToJSON(oracleId, includeMetadata = true) {
        try {
            const oracle = await this.oracleModel.findWithItems(oracleId, includeMetadata);
            if (!oracle) {
                throw new Error('Oracle introuvable');
            }

            const exportData = {
                oracle: {
                    name: oracle.name,
                    description: oracle.description,
                    premium_required: oracle.premium_required,
                    filters: oracle.filters || {},
                    is_active: oracle.is_active
                },
                items: oracle.items.map(item => ({
                    value: item.value,
                    weight: item.weight,
                    metadata: item.metadata || {},
                    is_active: item.is_active
                })),
                export_info: {
                    exported_at: new Date().toISOString(),
                    total_items: oracle.items.length,
                    total_weight: oracle.items.reduce((sum, item) => sum + item.weight, 0),
                    format_version: '1.0'
                }
            };

            this.log('info', 'Export JSON généré', {
                oracle_id: oracleId,
                items_count: exportData.items.length
            });

            return exportData;

        } catch (error) {
            this.logError(error, { oracle_id: oracleId });
            throw error;
        }
    }

    /**
     * Exporte un oracle en format CSV
     * @param {string} oracleId - ID de l'oracle
     * @returns {Promise<string>} Données CSV
     */
    async exportToCSV(oracleId) {
        try {
            const oracle = await this.oracleModel.findWithItems(oracleId, true);
            if (!oracle) {
                throw new Error('Oracle introuvable');
            }

            // Extraire toutes les clés de métadonnées possibles
            const metadataKeys = new Set();
            oracle.items.forEach(item => {
                if (item.metadata) {
                    Object.keys(item.metadata).forEach(key => metadataKeys.add(key));
                }
            });

            const metadataColumns = Array.from(metadataKeys);
            
            // En-têtes CSV
            const headers = ['value', 'weight', 'is_active', ...metadataColumns];
            
            // Lignes de données
            const rows = oracle.items.map(item => {
                const row = [
                    `"${item.value.replace(/"/g, '""')}"`, // Échapper les guillemets
                    item.weight,
                    item.is_active
                ];

                // Ajouter les colonnes de métadonnées
                metadataColumns.forEach(key => {
                    const value = item.metadata && item.metadata[key] ? item.metadata[key] : '';
                    row.push(`"${String(value).replace(/"/g, '""')}"`);
                });

                return row.join(',');
            });

            const csvContent = [headers.join(','), ...rows].join('\n');

            this.log('info', 'Export CSV généré', {
                oracle_id: oracleId,
                items_count: oracle.items.length,
                metadata_columns: metadataColumns.length
            });

            return csvContent;

        } catch (error) {
            this.logError(error, { oracle_id: oracleId });
            throw error;
        }
    }

    /**
     * Obtient l'historique des imports
     * @param {number} adminUserId - ID admin (optionnel pour filtrer)
     * @param {number} limit - Limite de résultats
     * @returns {Promise<Array>} Liste des imports
     */
    async getImportHistory(adminUserId = null, limit = 50) {
        try {
            let whereClause = '1=1';
            let params = [];
            
            if (adminUserId) {
                whereClause = 'admin_user_id = $1';
                params = [adminUserId];
            }

            const query = `
                SELECT 
                    oi.*,
                    o.name as oracle_name,
                    u.nom as admin_name
                FROM oracle_imports oi
                LEFT JOIN oracles o ON oi.oracle_id = o.id
                LEFT JOIN utilisateurs u ON oi.admin_user_id = u.id
                WHERE ${whereClause}
                ORDER BY oi.created_at DESC
                LIMIT ${limit}
            `;

            const results = await db.all(query, params);
            
            return results.map(record => ({
                ...record,
                processing_duration: record.processing_time_ms ? `${record.processing_time_ms}ms` : null,
                success_rate: record.items_imported + record.items_failed > 0 ? 
                    Math.round((record.items_imported / (record.items_imported + record.items_failed)) * 100) : 0
            }));

        } catch (error) {
            this.logError(error, { context: 'get_import_history' });
            throw error;
        }
    }

    /**
     * Rollback d'un import
     * @param {string} importId - ID de l'import à annuler
     * @param {number} adminUserId - ID de l'admin effectuant le rollback
     * @returns {Promise<Object>} Résultat du rollback
     */
    async rollbackImport(importId, adminUserId) {
        return await db.transaction(async (tx) => {
            try {
                // Récupérer les infos de l'import
                const importRecord = await tx.get(
                    'SELECT * FROM oracle_imports WHERE id = $1',
                    [importId]
                );

                if (!importRecord) {
                    throw new Error('Import introuvable');
                }

                if (importRecord.import_status !== 'SUCCESS' && importRecord.import_status !== 'PARTIAL') {
                    throw new Error('Seuls les imports réussis peuvent être annulés');
                }

                // Supprimer l'oracle et ses données associées (si mode CREATE)
                if (importRecord.import_mode === 'CREATE' && importRecord.oracle_id) {
                    await tx.run('DELETE FROM oracle_draws WHERE oracle_id = $1', [importRecord.oracle_id]);
                    await tx.run('DELETE FROM oracle_items WHERE oracle_id = $1', [importRecord.oracle_id]);
                    await tx.run('DELETE FROM oracles WHERE id = $1', [importRecord.oracle_id]);
                }

                // Marquer l'import comme annulé
                await tx.run(
                    'UPDATE oracle_imports SET import_status = $1 WHERE id = $2',
                    ['CANCELLED', importId]
                );

                // Enregistrer l'action de rollback dans l'historique
                await tx.run(`
                    INSERT INTO oracle_edit_history (
                        oracle_id, admin_user_id, action_type, entity_type, 
                        change_reason, ip_address
                    ) VALUES ($1, $2, $3, $4, $5, $6)
                `, [
                    importRecord.oracle_id,
                    adminUserId,
                    'DELETE',
                    'ORACLE',
                    `Rollback import ${importId}`,
                    null
                ]);

                this.log('info', 'Import rollback effectué', {
                    import_id: importId,
                    oracle_id: importRecord.oracle_id,
                    admin_id: adminUserId
                });

                return {
                    success: true,
                    message: 'Import annulé avec succès',
                    oracle_id: importRecord.oracle_id
                };

            } catch (error) {
                this.logError(error, { import_id: importId, admin_id: adminUserId });
                throw error;
            }
        });
    }

    // === MÉTHODES PRIVÉES ===

    /**
     * Valide la structure d'un fichier JSON
     * @private
     */
    async _validateJSONStructure(data) {
        const errors = [];

        if (!data || typeof data !== 'object') {
            errors.push('Format JSON invalide');
            return { isValid: false, errors };
        }

        if (!data.oracle || typeof data.oracle !== 'object') {
            errors.push('Propriété "oracle" manquante ou invalide');
        } else {
            if (!data.oracle.name || typeof data.oracle.name !== 'string') {
                errors.push('Nom de l\'oracle requis');
            }
        }

        if (!data.items || !Array.isArray(data.items)) {
            errors.push('Propriété "items" manquante ou invalide (doit être un tableau)');
        } else {
            data.items.forEach((item, index) => {
                if (!item.value) {
                    errors.push(`Item ${index + 1}: valeur requise`);
                }
                if (item.weight && (typeof item.weight !== 'number' || item.weight < 0)) {
                    errors.push(`Item ${index + 1}: poids invalide`);
                }
            });
        }

        return { isValid: errors.length === 0, errors };
    }

    /**
     * Valide la structure d'un fichier CSV
     * @private
     */
    async _validateCSVStructure(csvData) {
        const errors = [];

        if (!csvData || !csvData.headers || !csvData.rows) {
            errors.push('Structure CSV invalide');
            return { isValid: false, errors };
        }

        if (!csvData.headers.includes('value')) {
            errors.push('Colonne "value" requise');
        }

        if (csvData.rows.length === 0) {
            errors.push('Aucune donnée dans le fichier CSV');
        }

        return { isValid: errors.length === 0, errors };
    }

    /**
     * Parse un fichier CSV
     * @private
     */
    async _parseCSV(csvContent) {
        const lines = csvContent.trim().split('\n');
        if (lines.length < 2) {
            throw new Error('Fichier CSV doit contenir au moins une ligne d\'en-tête et une ligne de données');
        }

        const headers = this._parseCSVLine(lines[0]);
        const rows = lines.slice(1).map((line, index) => {
            try {
                const values = this._parseCSVLine(line);
                const row = {};
                headers.forEach((header, i) => {
                    row[header] = values[i] || '';
                });
                return row;
            } catch (error) {
                throw new Error(`Erreur ligne ${index + 2}: ${error.message}`);
            }
        });

        return { headers, rows };
    }

    /**
     * Parse une ligne CSV
     * @private
     */
    _parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    /**
     * Convertit les données CSV en format JSON
     * @private
     */
    _convertCSVToJSON(csvData, filename = 'Import CSV') {
        const oracleName = path.basename(filename, path.extname(filename));
        
        const items = csvData.rows.map(row => {
            const item = {
                value: row.value,
                weight: parseInt(row.weight) || 1,
                is_active: row.is_active === 'true' || row.is_active === '1' || row.is_active === true
            };

            // Construire les métadonnées à partir des autres colonnes
            const metadata = {};
            Object.keys(row).forEach(key => {
                if (!['value', 'weight', 'is_active'].includes(key) && row[key]) {
                    metadata[key] = row[key];
                }
            });

            if (Object.keys(metadata).length > 0) {
                item.metadata = metadata;
            }

            return item;
        });

        return {
            oracle: {
                name: oracleName,
                description: `Oracle importé depuis CSV le ${new Date().toLocaleDateString()}`,
                premium_required: false,
                is_active: true
            },
            items: items
        };
    }

    /**
     * Traite l'import JSON selon le mode
     * @private
     */
    async _processJSONImport(data, mode, adminUserId, importId) {
        return await db.transaction(async (tx) => {
            let oracle;
            let imported = 0;
            let failed = 0;
            const errors = [];

            try {
                if (mode === 'CREATE') {
                    // Créer un nouvel oracle
                    oracle = await this.oracleModel.create({
                        ...data.oracle,
                        created_by: adminUserId
                    });
                } else {
                    throw new Error('Modes REPLACE et MERGE pas encore implémentés');
                }

                // Importer les items par batch
                const batchSize = 100;
                for (let i = 0; i < data.items.length; i += batchSize) {
                    const batch = data.items.slice(i, i + batchSize);
                    
                    for (const itemData of batch) {
                        try {
                            await this.oracleItemModel.create({
                                oracle_id: oracle.id,
                                value: itemData.value,
                                weight: itemData.weight || 1,
                                metadata: itemData.metadata,
                                is_active: itemData.is_active !== false
                            });
                            imported++;
                        } catch (error) {
                            failed++;
                            errors.push(`Item "${itemData.value}": ${error.message}`);
                        }
                    }
                }

                return { oracle, imported, failed, errors };

            } catch (error) {
                this.logError(error, { import_id: importId });
                throw error;
            }
        });
    }

    /**
     * Sauvegarde un enregistrement d'import
     * @private
     */
    async _saveImportRecord(record) {
        const query = `
            INSERT INTO oracle_imports (
                admin_user_id, oracle_id, filename, file_size, file_hash,
                import_type, import_mode, items_imported, items_failed,
                validation_errors, import_status, processing_time_ms
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id
        `;

        const result = await db.get(query, [
            record.admin_user_id,
            record.oracle_id || null,
            record.filename,
            record.file_size,
            record.file_hash,
            record.import_type,
            record.import_mode,
            record.items_imported,
            record.items_failed,
            JSON.stringify(record.validation_errors),
            record.import_status,
            record.processing_time_ms || null
        ]);

        return result.id;
    }

    /**
     * Met à jour un enregistrement d'import
     * @private
     */
    async _updateImportRecord(importId, record) {
        const query = `
            UPDATE oracle_imports SET
                oracle_id = $2,
                items_imported = $3,
                items_failed = $4,
                validation_errors = $5,
                import_status = $6,
                processing_time_ms = $7,
                completed_at = CURRENT_TIMESTAMP
            WHERE id = $1
        `;

        await db.run(query, [
            importId,
            record.oracle_id || null,
            record.items_imported,
            record.items_failed,
            JSON.stringify(record.validation_errors),
            record.import_status,
            record.processing_time_ms
        ]);
    }

    /**
     * Vérifie les imports dupliqués par hash
     * @private
     */
    async _checkDuplicateImport(fileHash) {
        return await db.get(
            'SELECT * FROM oracle_imports WHERE file_hash = $1 AND import_status = $2 ORDER BY created_at DESC LIMIT 1',
            [fileHash, 'SUCCESS']
        );
    }
}

module.exports = AdminOracleService;