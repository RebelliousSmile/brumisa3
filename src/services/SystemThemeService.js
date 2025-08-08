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
        
        // Configuration centralisée des thèmes
        this.themes = {
            monsterhearts: {
                icon: 'ra-heartburn',
                classes: {
                    bg: 'bg-purple-600/20',
                    border: 'border-purple-500/30',
                    text: 'text-purple-400',
                    badgeBg: 'bg-purple-500/20',
                    badgeBorder: 'border-purple-500/30'
                }
            },
            engrenages: {
                icon: 'ra-candle',
                classes: {
                    bg: 'bg-emerald-600/20',
                    border: 'border-emerald-500/30',
                    text: 'text-emerald-400',
                    badgeBg: 'bg-emerald-500/20',
                    badgeBorder: 'border-emerald-500/30'
                }
            },
            metro2033: {
                icon: 'ra-nuclear',
                classes: {
                    bg: 'bg-red-600/20',
                    border: 'border-red-500/30',
                    text: 'text-red-400',
                    badgeBg: 'bg-red-500/20',
                    badgeBorder: 'border-red-500/30'
                }
            },
            mistengine: {
                icon: 'ra-ocarina',
                classes: {
                    bg: 'bg-pink-600/20',
                    border: 'border-pink-500/30',
                    text: 'text-pink-400',
                    badgeBg: 'bg-pink-500/20',
                    badgeBorder: 'border-pink-500/30'
                }
            },
            zombiology: {
                icon: 'ra-biohazard',
                classes: {
                    bg: 'bg-zombie-600/20',
                    border: 'border-zombie-500/30',
                    text: 'text-zombie-400',
                    badgeBg: 'bg-zombie-500/20',
                    badgeBorder: 'border-zombie-500/30'
                }
            }
        };
    }

    /**
     * Récupère le thème complet d'un système (avec cache)
     * @param {string} systemCode - Code du système
     * @returns {Object} Thème avec icône et classes
     */
    getTheme(systemCode) {
        const cacheKey = CacheService.Keys.SYSTEM_CONFIG(`theme_${systemCode}`);
        
        return this.cache.getOrSet(
            cacheKey,
            () => {
                return this.themes[systemCode] || this.getDefaultTheme();
            },
            CacheService.TTL.VERY_LONG // Cache 1 heure - les thèmes changent rarement
        );
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

module.exports = new SystemThemeService();