const BaseController = require('./BaseController');
const OracleService = require('../services/OracleService');
const AdminOracleService = require('../services/AdminOracleService');

/**
 * Contrôleur Oracle - Endpoints API pour les tirages pondérés
 */
class OracleController extends BaseController {
    constructor() {
        super('OracleController');
        this.oracleService = new OracleService();
        this.adminOracleService = new AdminOracleService();
    }

    /**
     * GET /api/oracles - Liste tous les oracles accessibles
     */
    lister = this.wrapAsync(async (req, res) => {
        const pagination = this.extrairePagination(req);
        const userRole = req.session?.utilisateur?.role || 'UTILISATEUR';

        const oracles = await this.oracleService.listerOraclesAccessibles(
            userRole,
            pagination.page,
            pagination.limite
        );

        return this.repondrePagine(res, oracles.data, oracles.pagination, 'Oracles récupérés');
    });

    /**
     * GET /api/oracles/search?q=query - Recherche d'oracles
     */
    rechercher = this.wrapAsync(async (req, res) => {
        const query = req.query.q;
        if (!query || query.trim().length < 2) {
            return this.repondreErreur(res, 400, 'Requête de recherche trop courte (minimum 2 caractères)', 'validation');
        }

        const userRole = req.session?.utilisateur?.role || 'UTILISATEUR';
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);

        const oracles = await this.oracleService.rechercherOracles(query, userRole, limit);

        return this.repondreSucces(res, oracles, 'Recherche effectuée');
    });

    /**
     * GET /api/oracles/:id - Récupère un oracle spécifique
     */
    obtenirParId = this.wrapAsync(async (req, res) => {
        const { id } = req.params;
        const userRole = req.session?.utilisateur?.role || 'UTILISATEUR';
        const includeItems = req.query.items === 'true';

        const oracle = await this.oracleService.obtenirOracle(id, userRole, includeItems);

        return this.repondreSucces(res, oracle, 'Oracle récupéré');
    });

    /**
     * POST /api/oracles/:id/draw - Effectue un tirage depuis un oracle
     */
    effectuerTirage = this.wrapAsync(async (req, res) => {
        const { id } = req.params;
        const {
            count = 1,
            filters = null,
            withReplacement = true
        } = this.sanitizeInput(req.body);

        // Validation des paramètres
        if (count < 1 || count > 100) {
            return this.repondreErreur(res, 400, 'Le nombre d\'éléments à tirer doit être entre 1 et 100', 'validation');
        }

        // Données utilisateur et session
        const userId = req.session?.utilisateur?.id || null;
        const sessionId = req.sessionID;
        const userRole = req.session?.utilisateur?.role || 'UTILISATEUR';
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent');

        const result = await this.oracleService.effectuerTirage(
            id,
            count,
            filters,
            withReplacement,
            userRole,
            userId,
            sessionId,
            ipAddress,
            userAgent
        );

        return this.repondreSucces(res, result, 'Tirage effectué');
    });

    /**
     * GET /api/oracles/:id/stats - Statistiques d'un oracle
     */
    obtenirStatistiques = this.wrapAsync(async (req, res) => {
        const { id } = req.params;
        const userRole = req.session?.utilisateur?.role || 'UTILISATEUR';

        const stats = await this.oracleService.obtenirStatistiques(id, userRole);

        return this.repondreSucces(res, stats, 'Statistiques récupérées');
    });

    // ===== ENDPOINTS ADMINISTRATEUR =====

    /**
     * POST /api/admin/oracles - Crée un nouvel oracle (ADMIN uniquement)
     */
    creer = this.wrapAsync(async (req, res) => {
        const admin = this.verifierPermissions(req, 'ADMIN');
        
        this.validerCorps(req, ['name']);
        
        const Oracle = require('../models/Oracle');
        const oracleModel = new Oracle();
        
        const donnees = this.sanitizeInput(req.body);
        donnees.created_by = admin.id;

        const oracle = await oracleModel.create(donnees);

        this.logger.info('Oracle créé par admin', {
            oracle_id: oracle.id,
            oracle_name: oracle.name,
            admin_id: admin.id
        });

        return this.repondreSucces(res, oracle, 'Oracle créé', 201);
    });

    /**
     * PUT /api/admin/oracles/:id - Met à jour un oracle (ADMIN uniquement)
     */
    mettreAJour = this.wrapAsync(async (req, res) => {
        const admin = this.verifierPermissions(req, 'ADMIN');
        const { id } = req.params;
        
        const Oracle = require('../models/Oracle');
        const oracleModel = new Oracle();
        
        // Vérifier l'existence
        const existant = await oracleModel.findById(id);
        if (!existant) {
            return this.repondreErreur(res, 404, 'Oracle introuvable', 'non_trouve');
        }

        const donnees = this.sanitizeInput(req.body);
        const oracle = await oracleModel.update(id, donnees);

        this.logger.info('Oracle mis à jour par admin', {
            oracle_id: id,
            admin_id: admin.id,
            changes: Object.keys(donnees)
        });

        return this.repondreSucces(res, oracle, 'Oracle mis à jour');
    });

    /**
     * DELETE /api/admin/oracles/:id - Supprime un oracle (ADMIN uniquement)
     */
    supprimer = this.wrapAsync(async (req, res) => {
        const admin = this.verifierPermissions(req, 'ADMIN');
        const { id } = req.params;
        
        const Oracle = require('../models/Oracle');
        const oracleModel = new Oracle();

        // Vérifier l'existence
        const existant = await oracleModel.findById(id);
        if (!existant) {
            return this.repondreErreur(res, 404, 'Oracle introuvable', 'non_trouve');
        }

        await oracleModel.supprimerCompletement(id);

        this.logger.info('Oracle supprimé par admin', {
            oracle_id: id,
            oracle_name: existant.name,
            admin_id: admin.id
        });

        return this.repondreSucces(res, null, 'Oracle supprimé');
    });

    /**
     * POST /api/admin/oracles/:id/items - Ajoute un item à un oracle (ADMIN uniquement)
     */
    ajouterItem = this.wrapAsync(async (req, res) => {
        const admin = this.verifierPermissions(req, 'ADMIN');
        const { id } = req.params;
        
        this.validerCorps(req, ['value']);
        
        const OracleItem = require('../models/OracleItem');
        const oracleItemModel = new OracleItem();
        
        // Vérifier que l'oracle existe
        const Oracle = require('../models/Oracle');
        const oracleModel = new Oracle();
        const oracle = await oracleModel.findById(id);
        if (!oracle) {
            return this.repondreErreur(res, 404, 'Oracle introuvable', 'non_trouve');
        }

        const donnees = this.sanitizeInput(req.body);
        donnees.oracle_id = id;

        const item = await oracleItemModel.create(donnees);

        this.logger.info('Item ajouté à l\'oracle par admin', {
            oracle_id: id,
            item_id: item.id,
            item_value: item.value,
            admin_id: admin.id
        });

        return this.repondreSucces(res, item, 'Item ajouté', 201);
    });

    /**
     * PUT /api/admin/oracles/:oracleId/items/:itemId - Met à jour un item (ADMIN uniquement)
     */
    mettreAJourItem = this.wrapAsync(async (req, res) => {
        const admin = this.verifierPermissions(req, 'ADMIN');
        const { oracleId, itemId } = req.params;
        
        const OracleItem = require('../models/OracleItem');
        const oracleItemModel = new OracleItem();
        
        // Vérifier que l'item existe et appartient à l'oracle
        const item = await oracleItemModel.findOne('id = ? AND oracle_id = ?', [itemId, oracleId]);
        if (!item) {
            return this.repondreErreur(res, 404, 'Item introuvable dans cet oracle', 'non_trouve');
        }

        const donnees = this.sanitizeInput(req.body);
        const itemMisAJour = await oracleItemModel.update(itemId, donnees);

        this.logger.info('Item mis à jour par admin', {
            oracle_id: oracleId,
            item_id: itemId,
            admin_id: admin.id,
            changes: Object.keys(donnees)
        });

        return this.repondreSucces(res, itemMisAJour, 'Item mis à jour');
    });

    /**
     * DELETE /api/admin/oracles/:oracleId/items/:itemId - Supprime un item (ADMIN uniquement)
     */
    supprimerItem = this.wrapAsync(async (req, res) => {
        const admin = this.verifierPermissions(req, 'ADMIN');
        const { oracleId, itemId } = req.params;
        
        const OracleItem = require('../models/OracleItem');
        const oracleItemModel = new OracleItem();
        
        // Vérifier que l'item existe et appartient à l'oracle
        const item = await oracleItemModel.findOne('id = ? AND oracle_id = ?', [itemId, oracleId]);
        if (!item) {
            return this.repondreErreur(res, 404, 'Item introuvable dans cet oracle', 'non_trouve');
        }

        await oracleItemModel.delete(itemId);

        this.logger.info('Item supprimé par admin', {
            oracle_id: oracleId,
            item_id: itemId,
            item_value: item.value,
            admin_id: admin.id
        });

        return this.repondreSucces(res, null, 'Item supprimé');
    });

    /**
     * POST /api/admin/oracles/:id/clone - Clone un oracle (ADMIN uniquement)
     */
    cloner = this.wrapAsync(async (req, res) => {
        const admin = this.verifierPermissions(req, 'ADMIN');
        const { id } = req.params;
        
        this.validerCorps(req, ['newName']);
        
        const { newName } = this.sanitizeInput(req.body);
        
        const Oracle = require('../models/Oracle');
        const oracleModel = new Oracle();

        const oracleClone = await oracleModel.cloner(id, newName, admin.id);

        this.logger.info('Oracle cloné par admin', {
            source_oracle_id: id,
            new_oracle_id: oracleClone.id,
            new_name: newName,
            admin_id: admin.id
        });

        return this.repondreSucces(res, oracleClone, 'Oracle cloné', 201);
    });

    /**
     * POST /api/admin/oracles/:id/toggle - Active/désactive un oracle (ADMIN uniquement)
     */
    basculerStatut = this.wrapAsync(async (req, res) => {
        const admin = this.verifierPermissions(req, 'ADMIN');
        const { id } = req.params;
        
        const Oracle = require('../models/Oracle');
        const oracleModel = new Oracle();
        
        const oracle = await oracleModel.findById(id);
        if (!oracle) {
            return this.repondreErreur(res, 404, 'Oracle introuvable', 'non_trouve');
        }

        const oracleMisAJour = oracle.is_active ? 
            await oracleModel.desactiver(id) : 
            await oracleModel.reactiver(id);

        const action = oracle.is_active ? 'désactivé' : 'réactivé';

        this.logger.info(`Oracle ${action} par admin`, {
            oracle_id: id,
            oracle_name: oracle.name,
            new_status: !oracle.is_active,
            admin_id: admin.id
        });

        return this.repondreSucces(res, oracleMisAJour, `Oracle ${action}`);
    });

    /**
     * GET /api/admin/oracles/:id/distribution - Analyse de distribution (ADMIN uniquement)
     */
    analyserDistribution = this.wrapAsync(async (req, res) => {
        const admin = this.verifierPermissions(req, 'ADMIN');
        const { id } = req.params;
        const limite = Math.min(parseInt(req.query.days) || 30, 365);

        const distribution = await this.oracleService.analyserDistribution(id, admin.role, limite);

        return this.repondreSucces(res, distribution, 'Analyse de distribution effectuée');
    });

    // ===== ENDPOINTS POUR VUES WEB =====

    /**
     * GET /oracles - Page de liste des oracles
     */
    pageListeOracles = this.wrapAsync(async (req, res) => {
        const pagination = this.extrairePagination(req);
        const userRole = req.session?.utilisateur?.role || 'UTILISATEUR';

        const oracles = await this.oracleService.listerOraclesAccessibles(
            userRole,
            pagination.page,
            pagination.limite
        );

        res.render('oracles/liste', {
            titre: 'Oracles Disponibles',
            oracles: oracles.data,
            pagination: oracles.pagination,
            gameSystem: null,
            gameSystemName: null,
            couleurSysteme: null,
            utilisateur: req.session?.utilisateur || null
        });
    });

    /**
     * GET /oracles/systeme/:gameSystem - Liste des oracles pour un système de jeu
     */
    pageListeOraclesParSysteme = this.wrapAsync(async (req, res) => {
        const { gameSystem } = req.params;
        const pagination = this.extrairePagination(req);
        const userRole = req.session?.utilisateur?.role || 'UTILISATEUR';
        
        const oracles = await this.oracleService.listerOraclesParSysteme(
            gameSystem,
            userRole,
            pagination.page,
            pagination.limite
        );
        
        // Récupération des informations du système depuis systemesJeu.js
        const { systemesJeu } = require('../config/systemesJeu');
        const systemeInfo = systemesJeu[gameSystem];
        const nomSysteme = systemeInfo ? systemeInfo.nom : gameSystem;
        
        // Configuration des couleurs par système
        const couleursSystemes = {
            'monsterhearts': {
                primary: 'purple',
                gradient: 'from-purple-900/20 via-purple-800/30 to-pink-900/20',
                accent: 'purple-400',
                icon: 'ra-heartburn'
            },
            'engrenages': {
                primary: 'emerald',
                gradient: 'from-emerald-900/20 via-emerald-800/30 to-green-900/20',
                accent: 'emerald-400',
                icon: 'ra-gear-hammer'
            },
            'metro2033': {
                primary: 'orange',
                gradient: 'from-orange-900/20 via-red-800/30 to-gray-900/20',
                accent: 'orange-400',
                icon: 'ra-radiation'
            },
            'mistengine': {
                primary: 'slate',
                gradient: 'from-slate-900/20 via-gray-800/30 to-slate-900/20',
                accent: 'slate-400',
                icon: 'ra-mist'
            }
        };
        
        const couleurSysteme = couleursSystemes[gameSystem] || couleursSystemes['monsterhearts'];
        
        res.render('oracles/liste', {
            titre: `Oracles ${nomSysteme}`,
            oracles: oracles.data,
            pagination: oracles.pagination,
            gameSystem: gameSystem,
            gameSystemName: nomSysteme,
            couleurSysteme: couleurSysteme,
            utilisateur: req.session?.utilisateur || null
        });
    });

    /**
     * GET /oracles/:id - Page détail d'un oracle
     */
    pageDetailOracle = this.wrapAsync(async (req, res) => {
        const { id } = req.params;
        const userRole = req.session?.utilisateur?.role || 'UTILISATEUR';

        const oracle = await this.oracleService.obtenirOracle(id, userRole, true);
        const stats = await this.oracleService.obtenirStatistiques(id, userRole);

        // Récupération des informations du système
        const { systemesJeu } = require('../config/systemesJeu');
        const gameSystem = oracle.game_system || 'generique';
        const systemeInfo = systemesJeu[gameSystem];
        const nomSysteme = systemeInfo ? systemeInfo.nom : 'Générique';
        
        // Configuration des couleurs par système
        const couleursSystemes = {
            'monsterhearts': {
                primary: 'purple',
                gradient: 'from-purple-900/20 via-purple-800/30 to-pink-900/20',
                accent: 'purple-400',
                icon: 'ra-heartburn'
            },
            'engrenages': {
                primary: 'emerald',
                gradient: 'from-emerald-900/20 via-emerald-800/30 to-green-900/20',
                accent: 'emerald-400',
                icon: 'ra-gear-hammer'
            },
            'metro2033': {
                primary: 'orange',
                gradient: 'from-orange-900/20 via-red-800/30 to-gray-900/20',
                accent: 'orange-400',
                icon: 'ra-radiation'
            },
            'mistengine': {
                primary: 'slate',
                gradient: 'from-slate-900/20 via-gray-800/30 to-slate-900/20',
                accent: 'slate-400',
                icon: 'ra-mist'
            },
            'generique': {
                primary: 'blue',
                gradient: 'from-blue-900/20 via-blue-800/30 to-gray-900/20',
                accent: 'blue-400',
                icon: 'ra-crystal-ball'
            }
        };
        
        const couleurSysteme = couleursSystemes[gameSystem] || couleursSystemes['generique'];

        res.render('oracles/detail', {
            titre: oracle.name,
            oracle,
            stats,
            gameSystem,
            nomSysteme,
            couleurSysteme,
            utilisateur: req.session?.utilisateur || null
        });
    });

    /**
     * GET /admin/oracles - Page d'administration des oracles (ADMIN uniquement)
     */
    pageAdminOracles = this.wrapAsync(async (req, res) => {
        this.verifierPermissions(req, 'ADMIN');

        const pagination = this.extrairePagination(req);

        const oracles = await this.oracleService.listerOraclesAccessibles(
            'ADMIN',
            pagination.page,
            pagination.limite
        );

        res.render('admin/oracles/liste', {
            titre: 'Administration des Oracles',
            oracles: oracles.data,
            pagination: oracles.pagination,
            utilisateur: req.session.utilisateur
        });
    });

    /**
     * GET /admin/oracles/:id/edit - Page d'édition d'un oracle (ADMIN uniquement)
     */
    pageEditionOracle = this.wrapAsync(async (req, res) => {
        this.verifierPermissions(req, 'ADMIN');
        const { id } = req.params;

        const oracle = await this.oracleService.obtenirOracle(id, 'ADMIN', true);

        res.render('admin/oracles/edition', {
            titre: `Édition - ${oracle.name}`,
            oracle,
            utilisateur: req.session.utilisateur
        });
    });

    /**
     * GET /admin/oracles/imports - Page d'historique des imports (ADMIN uniquement)
     */
    pageHistoriqueImports = this.wrapAsync(async (req, res) => {
        this.verifierPermissions(req, 'ADMIN');

        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const adminFilter = req.query.admin_id ? parseInt(req.query.admin_id) : null;

        const imports = await this.adminOracleService.getImportHistory(adminFilter, limit);

        res.render('admin/oracles/imports', {
            titre: 'Historique des Imports',
            imports,
            utilisateur: req.session.utilisateur
        });
    });

    // ===== ENDPOINTS IMPORT/EXPORT =====

    /**
     * POST /api/admin/oracles/import - Importe un oracle depuis un fichier (ADMIN uniquement)
     */
    importerFichier = this.wrapAsync(async (req, res) => {
        const admin = this.verifierPermissions(req, 'ADMIN');

        // Vérifier si le fichier a été uploadé
        if (!req.file && !req.files) {
            return this.repondreErreur(res, 400, 'Fichier requis', 'validation');
        }

        const { importMode = 'CREATE' } = req.body;
        const file = req.file || (req.files && req.files.file);
        
        if (!file) {
            return this.repondreErreur(res, 400, 'Fichier requis', 'validation');
        }
        
        // Valider le type de fichier
        const allowedTypes = ['.json', '.csv'];
        const fileExt = path.extname(file.originalname || file.name || '').toLowerCase();
        
        if (!allowedTypes.includes(fileExt)) {
            return this.repondreErreur(res, 400, 'Type de fichier non supporté. Utilisez JSON ou CSV.', 'validation');
        }

        try {
            let result;
            const fileBuffer = file.buffer || file.data;
            const filename = file.originalname || file.name;
            
            if (fileExt === '.json') {
                result = await this.adminOracleService.importFromJSON(
                    fileBuffer,
                    filename,
                    importMode,
                    admin.id
                );
            } else if (fileExt === '.csv') {
                result = await this.adminOracleService.importFromCSV(
                    fileBuffer,
                    filename,
                    importMode,
                    admin.id
                );
            }

            this.logger.info('Oracle importé avec succès', {
                filename: filename,
                oracle_id: result.oracle.id,
                items_imported: result.stats.imported,
                admin_id: admin.id
            });

            return this.repondreSucces(res, result, 'Import réussi', 201);

        } catch (error) {
            this.logger.error('Erreur lors de l\'import d\'oracle', { 
                context: 'import_oracle', 
                admin_id: admin.id,
                error: error.message,
                stack: error.stack
            });
            return this.repondreErreur(res, 400, error.message, 'import_error');
        }
    });

    /**
     * GET /api/admin/oracles/:id/export/json - Exporte un oracle en JSON (ADMIN uniquement)
     */
    exporterJSON = this.wrapAsync(async (req, res) => {
        this.verifierPermissions(req, 'ADMIN');
        const { id } = req.params;
        const includeMetadata = req.query.metadata !== 'false';

        const data = await this.adminOracleService.exportToJSON(id, includeMetadata);

        // Définir le nom de fichier
        const filename = `oracle_${data.oracle.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        return res.json(data);
    });

    /**
     * GET /api/admin/oracles/:id/export/csv - Exporte un oracle en CSV (ADMIN uniquement)
     */
    exporterCSV = this.wrapAsync(async (req, res) => {
        this.verifierPermissions(req, 'ADMIN');
        const { id } = req.params;

        const csvContent = await this.adminOracleService.exportToCSV(id);
        
        // Récupérer le nom de l'oracle pour le filename
        const Oracle = require('../models/Oracle');
        const oracleModel = new Oracle();
        const oracle = await oracleModel.findById(id);
        
        const filename = `oracle_${oracle.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        return res.send(csvContent);
    });

    /**
     * GET /api/admin/oracles/imports - Historique des imports (ADMIN uniquement)
     */
    historiqueImports = this.wrapAsync(async (req, res) => {
        this.verifierPermissions(req, 'ADMIN');
        
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const adminFilter = req.query.admin_id ? parseInt(req.query.admin_id) : null;

        const imports = await this.adminOracleService.getImportHistory(adminFilter, limit);

        return this.repondreSucces(res, imports, 'Historique récupéré');
    });

    /**
     * POST /api/admin/oracles/imports/:importId/rollback - Annule un import (ADMIN uniquement)
     */
    annulerImport = this.wrapAsync(async (req, res) => {
        const admin = this.verifierPermissions(req, 'ADMIN');
        const { importId } = req.params;

        const result = await this.adminOracleService.rollbackImport(importId, admin.id);

        return this.repondreSucces(res, result, 'Import annulé');
    });
}

// Import path pour les exports de fichiers
const path = require('path');

module.exports = OracleController;