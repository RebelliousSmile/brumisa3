const BaseService = require('./BaseService');
const SystemeJeu = require('../models/SystemeJeu');
const DocumentSystemeJeu = require('../models/DocumentSystemeJeu');

/**
 * Service de maintenance des systèmes JDR
 * Gère l'activation/désactivation des systèmes et types de documents
 * selon ARCHITECTURE/architecture-models.md
 */
class SystemMaintenanceService extends BaseService {
    constructor() {
        super('SystemMaintenanceService');
    }

    /**
     * Activer ou désactiver un système JDR complet
     * 
     * @param {string} systemeCode - Code du système (ex: "monsterhearts")
     * @param {boolean} actif - État désiré
     * @param {number} moderateurId - ID du modérateur effectuant l'action
     * @param {string} motif - Justification de l'action
     * @returns {Object} Résultat de l'opération
     */
    async toggleSystemeComplet(systemeCode, actif, moderateurId, motif = '') {
        try {
            this.validateRequired({ systemeCode, moderateurId }, ['systemeCode', 'moderateurId']);
            
            const systeme = await SystemeJeu.findOne({ code: systemeCode });
            if (!systeme) {
                throw new Error(`Système JDR non trouvé: ${systemeCode}`);
            }
            
            if (systeme.actif === actif) {
                return {
                    success: true,
                    action: 'AUCUN_CHANGEMENT',
                    message: `Le système ${systemeCode} est déjà ${actif ? 'actif' : 'inactif'}`
                };
            }
            
            // Mettre à jour le statut du système
            await SystemeJeu.update(systeme.id, {
                actif: actif,
                date_modification: new Date()
            });
            
            const action = actif ? 'ACTIVATION_SYSTEME' : 'DESACTIVATION_SYSTEME';
            
            this.log('info', `Système ${actif ? 'activé' : 'désactivé'}`, {
                systeme_code: systemeCode,
                moderateur_id: moderateurId,
                motif: motif,
                action: action
            });
            
            return {
                success: true,
                action: action,
                systeme: systemeCode,
                actif: actif,
                message: `Système ${systemeCode} ${actif ? 'activé' : 'désactivé'} avec succès`
            };
            
        } catch (error) {
            this.logError(error, { systemeCode, actif, moderateurId });
            throw error;
        }
    }

    /**
     * Activer ou désactiver un type de document spécifique pour un système
     * 
     * @param {string} systemeCode - Code du système
     * @param {string} documentType - Type de document (CHARACTER, TOWN, etc.)
     * @param {boolean} actif - État désiré
     * @param {number} moderateurId - ID du modérateur
     * @param {string} motif - Justification
     * @returns {Object} Résultat de l'opération
     */
    async toggleDocumentType(systemeCode, documentType, actif, moderateurId, motif = '') {
        try {
            this.validateRequired({ 
                systemeCode, 
                documentType, 
                moderateurId 
            }, ['systemeCode', 'documentType', 'moderateurId']);
            
            // Valider le type de document
            const typesValides = ['CHARACTER', 'TOWN', 'GROUP', 'ORGANIZATION', 'DANGER', 'GENERIQUE'];
            if (!typesValides.includes(documentType)) {
                throw new Error(`Type de document invalide: ${documentType}`);
            }
            
            // Vérifier que le système existe et est actif
            const systeme = await SystemeJeu.findOne({ code: systemeCode });
            if (!systeme) {
                throw new Error(`Système JDR non trouvé: ${systemeCode}`);
            }
            
            if (!systeme.actif) {
                throw new Error(`Le système ${systemeCode} est désactivé. Activez-le d'abord.`);
            }
            
            // Chercher la configuration existante
            let docSysteme = await DocumentSystemeJeu.findOne({
                document_type: documentType,
                systeme_jeu: systeme.id
            });
            
            if (!docSysteme) {
                // Créer la configuration si elle n'existe pas
                docSysteme = await DocumentSystemeJeu.create({
                    document_type: documentType,
                    systeme_jeu: systeme.id,
                    actif: actif,
                    ordre_affichage: this.getOrdreAffichageDefaut(documentType),
                    configuration: this.getConfigurationDefaut(systemeCode, documentType)
                });
                
                this.log('info', 'Configuration document-système créée', {
                    systeme_code: systemeCode,
                    document_type: documentType,
                    actif: actif
                });
            } else {
                if (docSysteme.actif === actif) {
                    return {
                        success: true,
                        action: 'AUCUN_CHANGEMENT',
                        message: `Le type ${documentType} est déjà ${actif ? 'actif' : 'inactif'} pour ${systemeCode}`
                    };
                }
                
                // Mettre à jour la configuration existante
                await DocumentSystemeJeu.update(docSysteme.id, {
                    actif: actif,
                    date_modification: new Date()
                });
            }
            
            const action = actif ? 'ACTIVATION_TYPE_DOCUMENT' : 'DESACTIVATION_TYPE_DOCUMENT';
            
            this.log('info', `Type document ${actif ? 'activé' : 'désactivé'}`, {
                systeme_code: systemeCode,
                document_type: documentType,
                moderateur_id: moderateurId,
                motif: motif,
                action: action
            });
            
            return {
                success: true,
                action: action,
                systeme: systemeCode,
                documentType: documentType,
                actif: actif,
                message: `Type ${documentType} ${actif ? 'activé' : 'désactivé'} pour ${systemeCode}`
            };
            
        } catch (error) {
            this.logError(error, { systemeCode, documentType, actif, moderateurId });
            throw error;
        }
    }

    /**
     * Obtenir l'état de tous les systèmes et leurs types de documents
     * 
     * @returns {Array} Configuration complète des systèmes
     */
    async getEtatCompletSystemes() {
        try {
            const systemes = await SystemeJeu.findAll({}, {
                orderBy: [['ordre_affichage', 'ASC']]
            });
            
            const configuration = [];
            
            for (const systeme of systemes) {
                const typesDocuments = await DocumentSystemeJeu.findAll({
                    systeme_jeu: systeme.id
                }, {
                    orderBy: [['ordre_affichage', 'ASC']]
                });
                
                configuration.push({
                    systeme: {
                        id: systeme.id,
                        code: systeme.code,
                        nom: systeme.nom,
                        actif: systeme.actif,
                        description: systeme.description,
                        version: systeme.version,
                        ordre_affichage: systeme.ordre_affichage
                    },
                    types_documents: typesDocuments.map(type => ({
                        type: type.document_type,
                        actif: type.actif,
                        ordre_affichage: type.ordre_affichage,
                        configuration: type.configuration
                    }))
                });
            }
            
            return configuration;
            
        } catch (error) {
            this.logError(error);
            throw error;
        }
    }

    /**
     * Vérifier si un type de document est disponible pour un système
     * 
     * @param {string} systemeCode - Code du système
     * @param {string} documentType - Type de document
     * @returns {boolean} Disponibilité du type
     */
    async isTypeDocumentDisponible(systemeCode, documentType) {
        try {
            // Vérifier que le système est actif
            const systeme = await SystemeJeu.findOne({ 
                code: systemeCode,
                actif: true 
            });
            
            if (!systeme) {
                return false;
            }
            
            // Vérifier que le type de document est actif pour ce système
            const docSysteme = await DocumentSystemeJeu.findOne({
                systeme_jeu: systeme.id,
                document_type: documentType,
                actif: true
            });
            
            return !!docSysteme;
            
        } catch (error) {
            this.logError(error, { systemeCode, documentType });
            return false;
        }
    }

    /**
     * Obtenir les types de documents disponibles pour un système
     * 
     * @param {string} systemeCode - Code du système
     * @returns {Array} Types de documents disponibles
     */
    async getTypesDocumentsDisponibles(systemeCode) {
        try {
            const systeme = await SystemeJeu.findOne({ 
                code: systemeCode,
                actif: true 
            });
            
            if (!systeme) {
                return [];
            }
            
            const typesDocuments = await DocumentSystemeJeu.findAll({
                systeme_jeu: systeme.id,
                actif: true
            }, {
                orderBy: [['ordre_affichage', 'ASC']]
            });
            
            return typesDocuments.map(type => ({
                type: type.document_type,
                ordre_affichage: type.ordre_affichage,
                configuration: type.configuration
            }));
            
        } catch (error) {
            this.logError(error, { systemeCode });
            throw error;
        }
    }

    /**
     * Mettre à jour la configuration d'un type de document
     * 
     * @param {string} systemeCode - Code du système
     * @param {string} documentType - Type de document
     * @param {Object} nouvelleConfiguration - Nouvelle configuration JSON
     * @param {number} moderateurId - ID du modérateur
     * @returns {Object} Résultat de la mise à jour
     */
    async updateConfigurationTypeDocument(systemeCode, documentType, nouvelleConfiguration, moderateurId) {
        try {
            this.validateRequired({ 
                systemeCode, 
                documentType, 
                moderateurId 
            }, ['systemeCode', 'documentType', 'moderateurId']);
            
            const systeme = await SystemeJeu.findOne({ code: systemeCode });
            if (!systeme) {
                throw new Error(`Système JDR non trouvé: ${systemeCode}`);
            }
            
            const docSysteme = await DocumentSystemeJeu.findOne({
                systeme_jeu: systeme.id,
                document_type: documentType
            });
            
            if (!docSysteme) {
                throw new Error(`Configuration non trouvée pour ${documentType} dans ${systemeCode}`);
            }
            
            // Valider la configuration JSON
            if (typeof nouvelleConfiguration !== 'object') {
                throw new Error('La configuration doit être un objet JSON valide');
            }
            
            await DocumentSystemeJeu.update(docSysteme.id, {
                configuration: nouvelleConfiguration,
                date_modification: new Date()
            });
            
            this.log('info', 'Configuration mise à jour', {
                systeme_code: systemeCode,
                document_type: documentType,
                moderateur_id: moderateurId,
                configuration: nouvelleConfiguration
            });
            
            return {
                success: true,
                action: 'CONFIGURATION_MISE_A_JOUR',
                systeme: systemeCode,
                documentType: documentType,
                configuration: nouvelleConfiguration
            };
            
        } catch (error) {
            this.logError(error, { systemeCode, documentType, moderateurId });
            throw error;
        }
    }

    /**
     * Obtenir l'ordre d'affichage par défaut pour un type de document
     * 
     * @private
     * @param {string} documentType - Type de document
     * @returns {number} Ordre d'affichage
     */
    getOrdreAffichageDefaut(documentType) {
        const ordres = {
            'CHARACTER': 1,
            'ORGANIZATION': 2,
            'TOWN': 3,
            'GROUP': 4,
            'DANGER': 5,
            'GENERIQUE': 6
        };
        
        return ordres[documentType] || 99;
    }

    /**
     * Obtenir la configuration par défaut pour un type/système
     * 
     * @private
     * @param {string} systemeCode - Code du système
     * @param {string} documentType - Type de document
     * @returns {Object} Configuration par défaut
     */
    getConfigurationDefaut(systemeCode, documentType) {
        // Configuration de base commune
        const configBase = {
            template_pdf: `${systemeCode}_${documentType.toLowerCase()}`,
            couleur_theme: this.getCouleurThemeDefaut(systemeCode),
            validation_custom: []
        };
        
        // Configuration spécifique par type
        switch (documentType) {
            case 'CHARACTER':
                return {
                    ...configBase,
                    champs_requis: this.getChampsCharacterDefaut(systemeCode),
                    validation_custom: ['stats_equilibrees']
                };
                
            case 'ORGANIZATION':
                return {
                    ...configBase,
                    champs_requis: ['nom', 'type_organisation', 'description'],
                    validation_custom: ['membres_valides']
                };
                
            default:
                return configBase;
        }
    }

    /**
     * Obtenir la couleur de thème par défaut pour un système
     * 
     * @private
     * @param {string} systemeCode - Code du système
     * @returns {string} Code couleur hexadécimal
     */
    getCouleurThemeDefaut(systemeCode) {
        const couleurs = {
            'monsterhearts': '#8B0000',   // Rouge sombre
            'engrenages': '#228B22',      // Vert forêt
            'metro2033': '#696969',       // Gris sombre
            'mistengine': '#DA70D6',      // Orchidée
            'zombiology': '#FF8C00'       // Orange sombre
        };
        
        return couleurs[systemeCode] || '#4169E1'; // Bleu royal par défaut
    }

    /**
     * Obtenir les champs CHARACTER requis par défaut pour un système
     * 
     * @private
     * @param {string} systemeCode - Code du système
     * @returns {Array} Liste des champs requis
     */
    getChampsCharacterDefaut(systemeCode) {
        const champsParSysteme = {
            'monsterhearts': ['nom', 'skin', 'hot', 'cold', 'volatile', 'dark'],
            'engrenages': ['nom', 'classe', 'niveau', 'factions'],
            'metro2033': ['nom', 'station', 'profession', 'points_vie'],
            'mistengine': ['nom', 'archetype', 'mystere', 'liens'],
            'zombiology': ['nom', 'occupation', 'sante_mentale', 'sante_physique']
        };
        
        return champsParSysteme[systemeCode] || ['nom'];
    }
}

module.exports = SystemMaintenanceService;