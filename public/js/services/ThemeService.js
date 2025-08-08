/**
 * Service de gestion des thèmes côté client
 * Architecture MVC-CS - Couche Services (Frontend)
 * 
 * Gère l'application dynamique des thèmes selon le système JDR
 * et la persistence des préférences utilisateur
 */
class ThemeService {
    constructor() {
        this.currentTheme = null;
        this.storageKey = 'brumisater-theme';
        this.systemThemes = {
            monsterhearts: {
                name: 'Monsterhearts',
                description: 'Gothique romantique',
                colors: {
                    primary: '#8b5cf6',
                    secondary: '#ec4899',
                    accent: '#f59e0b'
                }
            },
            engrenages: {
                name: 'Engrenages',
                description: 'Steampunk victorien',
                colors: {
                    primary: '#10b981',
                    secondary: '#a16207',
                    accent: '#fbbf24'
                }
            },
            metro2033: {
                name: 'Metro 2033',
                description: 'Post-apocalyptique',
                colors: {
                    primary: '#dc2626',
                    secondary: '#6b7280',
                    accent: '#fbbf24'
                }
            },
            mistengine: {
                name: 'Mist Engine',
                description: 'Mystique poétique',
                colors: {
                    primary: '#ec4899',
                    secondary: '#a78bfa',
                    accent: '#fbbf24'
                }
            },
            zombiology: {
                name: 'Zombiology',
                description: 'Survival horror',
                colors: {
                    primary: '#eab308',
                    secondary: '#dc2626',
                    accent: '#10b981'
                }
            }
        };
        
        this.init();
    }
    
    /**
     * Initialise le service et applique le thème sauvegardé
     */
    init() {
        // Récupérer le thème sauvegardé ou détecter depuis la page
        const savedTheme = this.getSavedTheme();
        const pageTheme = this.detectPageTheme();
        
        if (savedTheme && this.systemThemes[savedTheme]) {
            this.applyTheme(savedTheme);
        } else if (pageTheme) {
            this.applyTheme(pageTheme);
        }
        
        // Écouter les changements de thème
        this.listenForThemeChanges();
        
        // Gérer le mode sombre système
        this.handleSystemDarkMode();
    }
    
    /**
     * Applique un thème spécifique
     * @param {string} themeName - Nom du système JDR
     * @param {boolean} save - Sauvegarder en localStorage
     */
    applyTheme(themeName, save = true) {
        if (!this.systemThemes[themeName] && themeName !== 'default') {
            console.warn(`Thème inconnu: ${themeName}`);
            return false;
        }
        
        // Retirer l'ancien thème
        if (this.currentTheme) {
            document.documentElement.removeAttribute('data-theme');
            document.body.classList.remove(`theme-${this.currentTheme}`);
        }
        
        // Appliquer le nouveau thème
        if (themeName !== 'default') {
            document.documentElement.setAttribute('data-theme', themeName);
            document.body.classList.add(`theme-${themeName}`);
            
            // Mettre à jour les meta tags pour la couleur du navigateur
            this.updateMetaThemeColor(this.systemThemes[themeName].colors.primary);
        }
        
        this.currentTheme = themeName;
        
        // Sauvegarder la préférence
        if (save) {
            this.saveTheme(themeName);
        }
        
        // Déclencher un événement personnalisé
        this.dispatchThemeChangeEvent(themeName);
        
        return true;
    }
    
    /**
     * Détecte le thème depuis les attributs de la page
     * @returns {string|null} Nom du thème détecté
     */
    detectPageTheme() {
        // Vérifier l'attribut data-theme
        const htmlTheme = document.documentElement.getAttribute('data-theme');
        if (htmlTheme) return htmlTheme;
        
        // Vérifier la variable globale gameSystem
        if (window.gameSystem) return window.gameSystem;
        
        // Vérifier les classes du body
        for (const theme in this.systemThemes) {
            if (document.body.classList.contains(`theme-${theme}`)) {
                return theme;
            }
        }
        
        return null;
    }
    
    /**
     * Sauvegarde le thème en localStorage
     * @param {string} themeName - Nom du thème
     */
    saveTheme(themeName) {
        try {
            localStorage.setItem(this.storageKey, themeName);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du thème:', error);
        }
    }
    
    /**
     * Récupère le thème sauvegardé
     * @returns {string|null} Nom du thème sauvegardé
     */
    getSavedTheme() {
        try {
            return localStorage.getItem(this.storageKey);
        } catch (error) {
            console.error('Erreur lors de la récupération du thème:', error);
            return null;
        }
    }
    
    /**
     * Supprime le thème sauvegardé
     */
    clearSavedTheme() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.error('Erreur lors de la suppression du thème:', error);
        }
    }
    
    /**
     * Met à jour la couleur du thème dans les meta tags
     * @param {string} color - Couleur hexadécimale
     */
    updateMetaThemeColor(color) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        metaThemeColor.content = color;
    }
    
    /**
     * Écoute les changements de thème via événements personnalisés
     */
    listenForThemeChanges() {
        // Écouter les changements depuis Alpine.js
        document.addEventListener('alpine:theme-change', (event) => {
            if (event.detail && event.detail.theme) {
                this.applyTheme(event.detail.theme);
            }
        });
        
        // Écouter les changements depuis les sélecteurs de thème
        document.addEventListener('change', (event) => {
            if (event.target.matches('[data-theme-selector]')) {
                this.applyTheme(event.target.value);
            }
        });
    }
    
    /**
     * Gère le mode sombre système
     */
    handleSystemDarkMode() {
        // Détecter la préférence système
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Appliquer la classe dark si nécessaire
        this.updateDarkMode(darkModeMediaQuery.matches);
        
        // Écouter les changements
        darkModeMediaQuery.addEventListener('change', (e) => {
            this.updateDarkMode(e.matches);
        });
    }
    
    /**
     * Active ou désactive le mode sombre
     * @param {boolean} isDark - Activer le mode sombre
     */
    updateDarkMode(isDark) {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
    
    /**
     * Déclenche un événement de changement de thème
     * @param {string} themeName - Nom du nouveau thème
     */
    dispatchThemeChangeEvent(themeName) {
        const event = new CustomEvent('themeChanged', {
            detail: {
                theme: themeName,
                themeData: this.systemThemes[themeName] || null
            }
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * Récupère les informations du thème actuel
     * @returns {Object|null} Données du thème actuel
     */
    getCurrentThemeData() {
        if (!this.currentTheme || this.currentTheme === 'default') {
            return null;
        }
        
        return this.systemThemes[this.currentTheme];
    }
    
    /**
     * Récupère la liste des thèmes disponibles
     * @returns {Array} Liste des thèmes
     */
    getAvailableThemes() {
        return Object.keys(this.systemThemes).map(key => ({
            id: key,
            ...this.systemThemes[key]
        }));
    }
    
    /**
     * Applique des animations spécifiques au thème
     * @param {string} animationType - Type d'animation
     */
    applyThemeAnimation(animationType) {
        const animations = {
            'pulse': 'animate-pulse-system',
            'glow': 'animate-glow-system',
            'fade': 'animate-fade-system'
        };
        
        if (animations[animationType]) {
            document.documentElement.classList.add(animations[animationType]);
            
            // Retirer l'animation après 3 secondes
            setTimeout(() => {
                document.documentElement.classList.remove(animations[animationType]);
            }, 3000);
        }
    }
    
    /**
     * Précharge les assets spécifiques au thème
     * @param {string} themeName - Nom du thème
     */
    async preloadThemeAssets(themeName) {
        if (!this.systemThemes[themeName]) return;
        
        // Précharger les polices spécifiques
        const fonts = {
            monsterhearts: ['Crimson Text', 'Source Serif 4'],
            engrenages: ['Cinzel'],
            mistengine: ['Dancing Script', 'Kalam']
        };
        
        if (fonts[themeName]) {
            fonts[themeName].forEach(font => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'font';
                link.href = `https://fonts.googleapis.com/css2?family=${font.replace(' ', '+')}`;
                document.head.appendChild(link);
            });
        }
    }
}

// Initialiser le service au chargement de la page
if (typeof window !== 'undefined') {
    window.themeService = new ThemeService();
    
    // Intégration avec Alpine.js si disponible
    document.addEventListener('alpine:init', () => {
        Alpine.data('themeManager', () => ({
            currentTheme: window.themeService.currentTheme,
            themes: window.themeService.getAvailableThemes(),
            
            changeTheme(themeName) {
                window.themeService.applyTheme(themeName);
                this.currentTheme = themeName;
            },
            
            resetTheme() {
                window.themeService.applyTheme('default');
                window.themeService.clearSavedTheme();
                this.currentTheme = 'default';
            }
        }));
    });
}