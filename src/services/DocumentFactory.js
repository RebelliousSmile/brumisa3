const GenericDocument = require('./documents/GenericDocument');
const ClassPlanDocument = require('./documents/ClassPlanDocument');
const CharacterSheetDocument = require('./documents/CharacterSheetDocument');

const MonsterheartsTheme = require('./themes/MonsterheartsTheme');
const ZombiologyTheme = require('./themes/ZombiologyTheme');

/**
 * Factory pour créer les documents PDF avec la bonne architecture
 * Document Type + System Theme
 */
class DocumentFactory {
    
    /**
     * Crée un document selon le type et le système
     * @param {string} documentType - Type de document ('generic', 'class-plan', 'character-sheet')
     * @param {string} system - Système de jeu ('monsterhearts', 'engrenages', 'metro2033', 'mistengine', 'zombiology')
     * @param {Object} options - Options supplémentaires
     * @returns {Object} Instance du document
     */
    static createDocument(documentType, system, options = {}) {
        // Obtenir le thème du système
        const theme = this.getSystemTheme(system);
        
        // Créer le document selon le type
        switch (documentType) {
            case 'generic':
                return new GenericDocument(theme);
                
            case 'class-plan':
                if (!theme) {
                    throw new Error('ClassPlanDocument nécessite un thème système');
                }
                return new ClassPlanDocument(theme);
                
            case 'character-sheet':
                if (!theme) {
                    throw new Error('CharacterSheetDocument nécessite un thème système');
                }
                return new CharacterSheetDocument(theme);
                
            default:
                throw new Error(`Type de document non supporté: ${documentType}`);
        }
    }
    
    /**
     * Crée un document à partir d'un template legacy
     * @param {string} system - Système de jeu
     * @param {string} template - Template legacy
     * @returns {Object} Instance du document
     */
    static createFromTemplate(system, template) {
        // Mapper les anciens templates vers la nouvelle architecture
        const mapping = this.getTemplateMapping(system, template);
        
        return this.createDocument(mapping.documentType, system);
    }
    
    /**
     * Obtient le thème pour un système donné
     * @param {string} system - Système de jeu
     * @returns {SystemTheme|null} Instance du thème ou null
     */
    static getSystemTheme(system) {
        switch (system) {
            case 'monsterhearts':
                return new MonsterheartsTheme();
                
            case 'engrenages':
                // TODO: Créer EngrenagesTheme
                console.warn('⚠️ EngrenagesTheme pas encore implémenté');
                return null;
                
            case 'metro2033':
                // TODO: Créer MetroTheme
                console.warn('⚠️ MetroTheme pas encore implémenté');
                return null;
                
            case 'mistengine':
                // TODO: Créer MistTheme
                console.warn('⚠️ MistTheme pas encore implémenté');
                return null;
                
            case 'zombiology':
                return new ZombiologyTheme();
                
            case null:
            case undefined:
                // Document générique sans thème spécifique
                return null;
                
            default:
                throw new Error(`Système non supporté: ${system}`);
        }
    }
    
    /**
     * Mappe les anciens templates vers les nouveaux types de documents
     * @param {string} system - Système de jeu
     * @param {string} template - Template legacy
     * @returns {Object} Mapping vers le nouveau type
     */
    static getTemplateMapping(system, template) {
        // Mappings spécifiques par système
        const mappings = {
            monsterhearts: {
                'plan-classe-instructions': { documentType: 'class-plan' },
                'plan-classe-instructions-test': { documentType: 'class-plan' },
                'document-generique': { documentType: 'generic' },
                'document-generique-v2': { documentType: 'generic' },
                'feuille-personnage': { documentType: 'character-sheet' }
            },
            engrenages: {
                'document-generique': { documentType: 'generic' },
                'feuille-personnage': { documentType: 'character-sheet' }
            },
            metro2033: {
                'document-generique': { documentType: 'generic' },
                'feuille-personnage': { documentType: 'character-sheet' }
            },
            mistengine: {
                'document-generique': { documentType: 'generic' },
                'feuille-personnage': { documentType: 'character-sheet' }
            },
            zombiology: {
                'document-generique': { documentType: 'generic' },
                'feuille-personnage': { documentType: 'character-sheet' }
            }
        };
        
        const systemMappings = mappings[system];
        if (!systemMappings) {
            throw new Error(`Aucun mapping trouvé pour le système: ${system}`);
        }
        
        const mapping = systemMappings[template];
        if (!mapping) {
            throw new Error(`Template non supporté pour ${system}: ${template}`);
        }
        
        return mapping;
    }
    
    /**
     * Liste tous les types de documents disponibles
     * @returns {Array} Liste des types
     */
    static getAvailableDocumentTypes() {
        return ['generic', 'class-plan', 'character-sheet'];
    }
    
    /**
     * Liste tous les systèmes supportés
     * @returns {Array} Liste des systèmes
     */
    static getSupportedSystems() {
        return ['monsterhearts', 'engrenages', 'metro2033', 'mistengine', 'zombiology'];
    }
    
    /**
     * Vérifie si un système est supporté
     * @param {string} system - Système à vérifier
     * @returns {boolean} true si supporté
     */
    static isSystemSupported(system) {
        return this.getSupportedSystems().includes(system);
    }
    
    /**
     * Vérifie si un type de document est supporté
     * @param {string} documentType - Type à vérifier
     * @returns {boolean} true si supporté
     */
    static isDocumentTypeSupported(documentType) {
        return this.getAvailableDocumentTypes().includes(documentType);
    }
    
    /**
     * Obtient des informations sur un système
     * @param {string} system - Système de jeu
     * @returns {Object} Informations du système
     */
    static getSystemInfo(system) {
        const systemInfo = {
            monsterhearts: {
                name: 'Monsterhearts',
                hasTheme: true,
                supportedDocuments: ['generic', 'class-plan', 'character-sheet'],
                templateMappings: ['plan-classe-instructions', 'document-generique', 'feuille-personnage']
            },
            engrenages: {
                name: 'Les Engrenages de la Révolution',
                hasTheme: false, // TODO: Implémenter
                supportedDocuments: ['generic', 'character-sheet'],
                templateMappings: ['document-generique', 'feuille-personnage']
            },
            metro2033: {
                name: 'Metro 2033',
                hasTheme: false, // TODO: Implémenter
                supportedDocuments: ['generic', 'character-sheet'],
                templateMappings: ['document-generique', 'feuille-personnage']
            },
            mistengine: {
                name: 'Mist Engine',
                hasTheme: false, // TODO: Implémenter
                supportedDocuments: ['generic', 'character-sheet'],
                templateMappings: ['document-generique', 'feuille-personnage']
            },
            zombiology: {
                name: 'Zombiology',
                hasTheme: true,
                supportedDocuments: ['generic', 'character-sheet'],
                templateMappings: ['document-generique', 'feuille-personnage']
            }
        };
        
        return systemInfo[system] || null;
    }
}

module.exports = DocumentFactory;