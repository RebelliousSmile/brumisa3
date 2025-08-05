/**
 * Service gérant les thèmes visuels des systèmes de JDR
 * Responsabilité unique : Fournir les classes CSS et icônes pour chaque système
 */
class SystemThemeService {
    constructor() {
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
                icon: 'ra-pills',
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
     * Récupère le thème complet d'un système
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
}

module.exports = new SystemThemeService();