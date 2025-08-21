const BaseService = require('./BaseService');
const CacheService = require('./CacheService');

/**
 * Service gérant les thèmes visuels des systèmes de JDR
 * Responsabilité unique : Fournir les classes CSS et icônes pour chaque système
 * Conforme aux 5 systèmes JDR selon architecture-models.md
 */
class SystemThemeService extends BaseService {
    constructor() {
        super('SystemThemeService');
        this.cache = new CacheService();
        
        // Configuration centralisée des thèmes selon la charte graphique
        this.themes = {
            pbta: {
                icon: 'ra ra-heartburn',
                classes: {
                    bg: 'bg-purple-500/20',
                    border: 'border-purple-500/30',
                    text: 'text-purple-500',
                    badgeBg: 'bg-purple-500/20',
                    badgeBorder: 'border-purple-500/30'
                },
                universes: {
                    monsterhearts: { icon: 'ra ra-heartburn', name: 'Monsterhearts' },
                    urban_shadows: { icon: 'ra ra-moon-sun', name: 'Urban Shadows' }
                }
            },
            engrenages: {
                icon: 'ra ra-cog',
                classes: {
                    bg: 'bg-amber-700/20',
                    border: 'border-amber-700/30',
                    text: 'text-amber-600',
                    badgeBg: 'bg-amber-700/20',
                    badgeBorder: 'border-amber-700/30'
                },
                universes: {
                    roue_du_temps: { icon: 'ra ra-candle', name: 'La Roue du Temps' },
                    ecryme: { icon: 'ra ra-chemical-arrow', name: 'Ecryme' }
                }
            },
            mistengine: {
                icon: 'ra ra-ocarina',
                classes: {
                    bg: 'bg-pink-500/20',
                    border: 'border-pink-500/30',
                    text: 'text-pink-500',
                    badgeBg: 'bg-pink-500/20',
                    badgeBorder: 'border-pink-500/30'
                },
                universes: {
                    obojima: { icon: 'ra ra-ocarina', name: 'Obojima' },
                    zamanora: { icon: 'ra ra-rune-stone', name: 'Zamanora' },
                    post_mortem: { icon: 'ra ra-skull', name: 'Post-Mortem' },
                    otherscape: { icon: 'ra ra-surveillance-camera', name: 'Tokyo:Otherscape' }
                }
            },
            myz: {
                icon: 'ra ra-pills',
                classes: {
                    bg: 'bg-red-600/20',
                    border: 'border-red-600/30',
                    text: 'text-red-600',
                    badgeBg: 'bg-red-600/20',
                    badgeBorder: 'border-red-600/30'
                },
                universes: {
                    metro2033: { icon: 'ra ra-pills', name: 'Metro 2033' }
                }
            },
            zombiology: {
                icon: 'ra ra-death-skull',
                classes: {
                    bg: 'bg-yellow-500/20',
                    border: 'border-yellow-500/30',
                    text: 'text-yellow-500',
                    badgeBg: 'bg-yellow-500/20',
                    badgeBorder: 'border-yellow-500/30'
                },
                universes: {
                    zombiology: { icon: 'ra ra-death-skull', name: 'Zombiology' }
                }
            },
            
            // Compatibilité avec les anciens codes pour éviter les erreurs
            monsterhearts: {
                icon: 'ra ra-heartburn',
                classes: {
                    bg: 'bg-purple-800/20',
                    border: 'border-purple-600/30',
                    text: 'text-purple-300',
                    badgeBg: 'bg-purple-600/20',
                    badgeBorder: 'border-purple-600/30'
                }
            },
            metro2033: {
                icon: 'ra ra-nuclear',
                classes: {
                    bg: 'bg-gray-600/20',
                    border: 'border-gray-500/30',
                    text: 'text-gray-400',
                    badgeBg: 'bg-gray-500/20',
                    badgeBorder: 'border-gray-500/30'
                }
            }
        };
    }

    /**
     * Récupère le thème complet d'un système (sans cache pour éviter les problèmes async)
     * @param {string} systemCode - Code du système
     * @returns {Object} Thème avec icône et classes
     */
    getTheme(systemCode) {
        return this.themes[systemCode] || this.getDefaultTheme();
    }

    /**
     * Récupère uniquement l'icône d'un système
     * @param {string} systemCode - Code du système
     * @returns {string} Classe de l'icône
     */
    getIcon(systemCode) {
        return this.themes[systemCode]?.icon || 'ra-dice';
    }

    /**
     * Récupère l'icône d'un univers spécifique
     * @param {string} systemCode - Code du système
     * @param {string} universeCode - Code de l'univers
     * @returns {string} Classe de l'icône de l'univers
     */
    getUniverseIcon(systemCode, universeCode) {
        return this.themes[systemCode]?.universes?.[universeCode]?.icon || this.getIcon(systemCode);
    }

    /**
     * Récupère uniquement les classes CSS d'un système
     * @param {string} systemCode - Code du système
     * @returns {Object} Classes CSS
     */
    getClasses(systemCode) {
        return this.themes[systemCode]?.classes || this.getDefaultTheme().classes;
    }

    /**
     * Thème par défaut pour les systèmes non configurés
     * @returns {Object} Thème par défaut
     */
    getDefaultTheme() {
        return {
            icon: 'ra-dice',
            classes: {
                bg: 'bg-gray-600/20',
                border: 'border-gray-500/30',
                text: 'text-gray-400',
                badgeBg: 'bg-gray-500/20',
                badgeBorder: 'border-gray-500/30'
            }
        };
    }

    /**
     * Vérifie si un système a un thème configuré
     * @param {string} systemCode - Code du système
     * @returns {boolean} True si le thème existe
     */
    hasTheme(systemCode) {
        return !!this.themes[systemCode];
    }

    /**
     * Récupère tous les codes de systèmes configurés
     * @returns {string[]} Liste des codes
     */
    getSystemCodes() {
        return Object.keys(this.themes);
    }

    /**
     * Obtenir des informations complètes sur un système
     * 
     * @param {string} systemCode - Code du système
     * @returns {Object} Informations complètes du système
     */
    getSystemInfo(systemCode) {
        const theme = this.getTheme(systemCode);
        const systemsConfig = require('../config/systemesJeu');
        const systemInfo = systemsConfig.systemesJeu[systemCode];
        
        return {
            code: systemCode,
            nom: systemInfo?.nom || systemCode,
            description: systemInfo?.description || '',
            actif: systemInfo?.actif !== false,
            theme: theme
        };
    }

    /**
     * Obtenir la couleur primaire d'un système (pour PDF)
     * 
     * @param {string} systemCode - Code du système
     * @returns {string} Code couleur hexadécimal
     */
    getPrimaryColor(systemCode) {
        const colorMap = {
            'monsterhearts': '#8B0000',   // Rouge sombre gothique
            'engrenages': '#228B22',      // Vert émeraude steampunk
            'metro2033': '#DC143C',       // Rouge post-apocalyptique
            'mistengine': '#DA70D6',      // Rose mystique
            'zombiology': '#FF8C00'       // Orange survival
        };
        
        return colorMap[systemCode] || '#4169E1'; // Bleu par défaut
    }

    /**
     * Vérifier si un système est actif et disponible
     * 
     * @param {string} systemCode - Code du système
     * @returns {boolean} Système actif ou non
     */
    isSystemActive(systemCode) {
        try {
            const systemsConfig = require('../config/systemesJeu');
            const systemInfo = systemsConfig.systemesJeu[systemCode];
            return systemInfo?.actif !== false && this.hasTheme(systemCode);
        } catch (error) {
            this.logError(error, { systemCode });
            return false;
        }
    }

    /**
     * Obtenir les systèmes actifs avec leurs thèmes
     * 
     * @returns {Array} Liste des systèmes actifs
     */
    getActiveSystems() {
        return this.getSystemCodes()
            .filter(code => this.isSystemActive(code))
            .map(code => this.getSystemInfo(code));
    }
}

module.exports = SystemThemeService;