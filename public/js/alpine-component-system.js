/**
 * Alpine.js Centralized Component System v2.0
 * Architecture MVC-CS - Couche Components 4 Layers
 * 
 * Système centralisé de gestion des composants Alpine.js
 * avec stores globaux, utilitaires et composants de base réutilisables
 */

// Namespace global pour les composants
window.AlpineComponentSystem = {
    // Version du système de composants
    version: '2.0.0',
    
    // Store global partagé
    stores: {},
    
    // Composants de base réutilisables
    components: {},
    
    // Utilitaires globaux
    utils: {},
    
    // Initialisation du système
    init() {
        console.log(`Alpine Component System v${this.version} initialized`);
        
        // Exposer les utilitaires globalement
        window.AlpineUtils = this.utils;
        
        // Initialiser les stores globaux
        this.initGlobalStores();
        
        // Initialiser les événements globaux
        this.initGlobalEvents();
    },
    
    // Initialisation des stores Alpine globaux
    initGlobalStores() {
        // Store principal de l'application
        Alpine.store('app', {
            // État global
            utilisateur: window.APP_DATA?.utilisateur || null,
            systemes: window.APP_DATA?.systemes || {},
            messages: [], // Notifications flash
            loading: false,
            
            // Gestion des messages
            ajouterMessage(type, contenu) {
                const message = {
                    id: Date.now(),
                    type,
                    contenu,
                    timestamp: new Date()
                };
                this.messages.push(message);
                
                // Auto-suppression après 5 secondes
                setTimeout(() => {
                    this.supprimerMessage(message.id);
                }, 5000);
            },
            
            supprimerMessage(id) {
                this.messages = this.messages.filter(m => m.id !== id);
            },
            
            // Méthodes globales
            setLoading(state) {
                this.loading = state;
            },
            
            navigate(url) {
                window.location.href = url;
            },
            
            // API centralisée avec gestion d'erreurs
            async requeteApi(url, options = {}) {
                try {
                    const response = await fetch(`/api${url}`, {
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        ...options
                    });
                    
                    if (!response.ok) throw new Error(`Erreur ${response.status}`);
                    return response.json();
                } catch (erreur) {
                    this.ajouterMessage('erreur', erreur.message);
                    throw erreur;
                }
            }
        });
        
        // Store pour navigation mobile avec gestures
        Alpine.store('navigation', {
            menuMobileOuvert: false,
            currentSection: 'infos-base',
            hasUnsavedChanges: false,
            isOffline: false,
            
            basculerMenuMobile() {
                this.menuMobileOuvert = !this.menuMobileOuvert;
                document.body.style.overflow = this.menuMobileOuvert ? 'hidden' : '';
            },
            
            fermerMenuMobile() {
                this.menuMobileOuvert = false;
                document.body.style.overflow = '';
            },
            
            changerSection(section) {
                if (this.hasUnsavedChanges) {
                    if (!confirm('Vous avez des modifications non sauvegardées. Continuer ?')) {
                        return false;
                    }
                }
                this.currentSection = section;
                return true;
            },
            
            prevSection() {
                // Logique de navigation précédente
                console.log('Navigation précédente');
            },
            
            nextSection() {
                // Logique de navigation suivante
                console.log('Navigation suivante');
            }
        });
        
        // Store pour création avec auto-sauvegarde
        Alpine.store('creation', {
            formData: {},
            autosaveInterval: null,
            
            sauvegarderLocalement(formData) {
                try {
                    localStorage.setItem('brumisater_form_draft', JSON.stringify({
                        data: formData,
                        timestamp: Date.now()
                    }));
                } catch (error) {
                    console.warn('Impossible de sauvegarder localement:', error);
                }
            },
            
            getFormulaireSauvegardes() {
                try {
                    const saved = localStorage.getItem('brumisater_form_draft');
                    if (saved) {
                        const data = JSON.parse(saved);
                        // Vérifie si la sauvegarde a moins de 24h
                        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                            return data.data;
                        }
                    }
                } catch (error) {
                    console.warn('Erreur lors de la récupération:', error);
                }
                return null;
            },
            
            clearSauvegardeLocale() {
                localStorage.removeItem('brumisater_form_draft');
            }
        });
    },
    
    // Initialisation des événements globaux
    initGlobalEvents() {
        // Gestion globale des erreurs non capturées
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            if (typeof Alpine !== 'undefined' && Alpine.store('app')) {
                Alpine.store('app').ajouterMessage('erreur', 'Une erreur inattendue s\'est produite');
            }
        });
        
        // Gestion du mode hors ligne
        window.addEventListener('offline', () => {
            Alpine.store('navigation').isOffline = true;
            Alpine.store('app').ajouterMessage('avertissement', 'Mode hors ligne activé');
        });
        
        window.addEventListener('online', () => {
            Alpine.store('navigation').isOffline = false;
            Alpine.store('app').ajouterMessage('succes', 'Connexion rétablie');
        });
        
        // Auto-sauvegarde toutes les 30 secondes
        setInterval(() => {
            if (Alpine.store('navigation').hasUnsavedChanges) {
                const forms = document.querySelectorAll('[data-auto-save]');
                forms.forEach(form => {
                    if (form._x_dataStack && form._x_dataStack[0]) {
                        const component = form._x_dataStack[0];
                        if (component.autoSave) {
                            component.autoSave();
                        }
                    }
                });
            }
        }, 30000);
        
        // Gestion des gestes mobiles
        let touchStartX = 0;
        let touchStartY = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            // Swipe horizontal pour navigation
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    Alpine.store('navigation').prevSection();
                } else {
                    Alpine.store('navigation').nextSection();
                }
            }
            
            touchStartX = 0;
            touchStartY = 0;
        });
    }
};

// === COMPOSANTS DE BASE ===

/**
 * Composant bouton standardisé avec thématisation
 * @param {Object} config - Configuration du bouton
 * @returns {Object} - Objet Alpine.js data
 */
AlpineComponentSystem.components.button = (config = {}) => ({
    // Configuration par défaut
    text: config.text || 'Bouton',
    variant: config.variant || 'primary',
    size: config.size || 'md',
    gameSystem: config.gameSystem || '',
    icon: config.icon || '',
    loading: config.loading || false,
    disabled: config.disabled || false,
    
    // État interne
    isPressed: false,
    
    // Actions
    async click() {
        if (this.disabled || this.loading) return;
        
        this.isPressed = true;
        setTimeout(() => this.isPressed = false, 150);
        
        if (config.onClick) {
            this.loading = true;
            try {
                await config.onClick.call(this);
            } catch (error) {
                Alpine.store('app').ajouterMessage('erreur', error.message);
            } finally {
                this.loading = false;
            }
        }
    },
    
    // Getters
    get buttonClasses() {
        const systemThemes = {
            monsterhearts: 'purple',
            engrenages: 'emerald',
            metro2033: 'red',
            mistengine: 'pink',
            zombiology: 'yellow'
        };
        
        const systemColor = systemThemes[this.gameSystem] || 'blue';
        
        const variants = {
            primary: `bg-${systemColor}-600 hover:bg-${systemColor}-700 text-white`,
            outline: `border-2 border-${systemColor}-500 text-${systemColor}-500 hover:bg-${systemColor}-500 hover:text-white`,
            ghost: `text-${systemColor}-500 hover:bg-${systemColor}-500/10`,
            secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
            success: 'bg-green-600 hover:bg-green-700 text-white',
            danger: 'bg-red-600 hover:bg-red-700 text-white'
        };
        
        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-4 py-2 text-base',
            lg: 'px-6 py-3 text-lg'
        };
        
        return [
            'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            variants[this.variant] || variants.primary,
            sizes[this.size] || sizes.md,
            this.disabled || this.loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            this.isPressed ? 'transform scale-95' : ''
        ].filter(Boolean).join(' ');
    },
    
    get displayText() {
        return this.loading ? 'Chargement...' : this.text;
    },
    
    get displayIcon() {
        return this.loading ? 'fas fa-spinner fa-spin' : this.icon;
    }
});

/**
 * Composant Modal générique
 */
AlpineComponentSystem.components.modal = (config = {}) => ({
    open: false,
    
    show() {
        this.open = true;
        document.body.style.overflow = 'hidden';
    },
    
    hide() {
        this.open = false;
        document.body.style.overflow = '';
    },
    
    toggle() {
        this.open ? this.hide() : this.show();
    }
});

/**
 * Composant Form avec validation
 */
AlpineComponentSystem.components.form = (config = {}) => ({
    data: config.initialData || {},
    errors: {},
    loading: false,
    
    async submit() {
        if (this.loading) return;
        
        this.loading = true;
        this.errors = {};
        
        try {
            // Validation côté client
            if (config.validate) {
                const validation = config.validate(this.data);
                if (!validation.valid) {
                    this.errors = validation.errors;
                    return;
                }
            }
            
            // Soumission
            if (config.submit) {
                await config.submit(this.data);
            }
            
            Alpine.store('app').showNotification('Formulaire soumis avec succès', 'success');
            
        } catch (error) {
            this.errors = error.errors || { general: 'Une erreur est survenue' };
            Alpine.store('app').showNotification('Erreur lors de la soumission', 'error');
        } finally {
            this.loading = false;
        }
    },
    
    hasError(field) {
        return !!this.errors[field];
    },
    
    getError(field) {
        return this.errors[field];
    }
});

// === UTILITAIRES ===

// === UTILITAIRES GLOBAUX ===

AlpineComponentSystem.utils = {
    /**
     * Formatte un nombre avec des espaces comme séparateurs de milliers
     * @param {number} num - Nombre à formater
     * @returns {string} - Nombre formaté
     */
    formatNumber(num) {
        return new Intl.NumberFormat('fr-FR').format(num);
    },
    
    /**
     * Debounce une fonction
     * @param {Function} func - Fonction à debouncer
     * @param {number} wait - Délai d'attente en ms
     * @returns {Function} - Fonction debouncée
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Throttle une fonction
     * @param {Function} func - Fonction à throttler
     * @param {number} limit - Limite en ms
     * @returns {Function} - Fonction throttlée
     */
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * Requête API standardisée avec gestion d'erreurs
     * @param {string} url - URL de l'API
     * @param {Object} options - Options fetch
     * @returns {Promise} - Réponse JSON
     */
    async apiCall(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include'
        };
        
        try {
            const response = await fetch(url, { ...defaultOptions, ...options });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
        } catch (error) {
            console.error('API Call Error:', error);
            
            // Notification globale d'erreur
            if (typeof Alpine !== 'undefined' && Alpine.store('app')) {
                Alpine.store('app').ajouterMessage('erreur', error.message);
            }
            
            throw error;
        }
    },
    
    /**
     * Formate une date en français
     * @param {string|Date} date - Date à formater
     * @param {Object} options - Options de formatage
     * @returns {string} - Date formatée
     */
    formatDate(date, options = {}) {
        const defaultOptions = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            ...options
        };
        
        return new Date(date).toLocaleDateString('fr-FR', defaultOptions);
    },
    
    /**
     * Génère un ID unique
     * @returns {string} - ID unique
     */
    generateId() {
        return `alpine_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
    },
    
    /**
     * Gestion du localStorage avec fallback
     * @param {string} key - Clé de stockage
     * @param {any} value - Valeur à stocker (si undefined, lecture)
     * @returns {any} - Valeur stockée ou null
     */
    localStorage(key, value) {
        try {
            if (value === undefined) {
                // Lecture
                const stored = localStorage.getItem(key);
                return stored ? JSON.parse(stored) : null;
            } else {
                // Écriture
                localStorage.setItem(key, JSON.stringify(value));
                return value;
            }
        } catch (error) {
            console.warn('localStorage error:', error);
            return null;
        }
    },
    
    /**
     * Valide une adresse email
     * @param {string} email - Email à valider
     * @returns {boolean} - Validité
     */
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    
    /**
     * Slugifie une chaîne de caractères
     * @param {string} text - Texte à slugifier
     * @returns {string} - Slug
     */
    slugify(text) {
        return text
            .toLowerCase()
            .replace(/[àáäâ]/g, 'a')
            .replace(/[èéëê]/g, 'e')
            .replace(/[ìíïî]/g, 'i')
            .replace(/[òóöô]/g, 'o')
            .replace(/[ùúüû]/g, 'u')
            .replace(/[ñ]/g, 'n')
            .replace(/[ç]/g, 'c')
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
    },
    
    /**
     * Copie du texte dans le presse-papiers
     * @param {string} text - Texte à copier
     * @returns {Promise<boolean>} - Succès de l'opération
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.warn('Clipboard copy failed:', error);
            return false;
        }
    }
};

// === COMPOSANTS MÉTIER SPÉCIFIQUES ===

/**
 * Composant de gestion des témoignages
 */
AlpineComponentSystem.components.testimonials = () => ({
    temoignages: [],
    afficherFormulaire: false,
    nouveauTemoignage: {
        nom: '',
        email: '',
        contenu: '',
        note: '',
        systeme_utilise: '',
        titre: ''
    },
    chargement: false,
    
    async init() {
        await this.chargerTemoignages();
    },
    
    async chargerTemoignages() {
        try {
            this.temoignages = await AlpineComponentSystem.utils.apiCall('/api/temoignages');
        } catch (error) {
            console.error('Erreur chargement témoignages:', error);
        }
    },
    
    async ajouterTemoignage() {
        this.chargement = true;
        try {
            await AlpineComponentSystem.utils.apiCall('/api/temoignages', {
                method: 'POST',
                body: JSON.stringify(this.nouveauTemoignage)
            });
            
            this.afficherFormulaire = false;
            this.nouveauTemoignage = { nom: '', email: '', contenu: '', note: '', systeme_utilise: '', titre: '' };
            await this.chargerTemoignages();
            
            Alpine.store('app').showNotification('Témoignage ajouté avec succès', 'success');
        } catch (error) {
            Alpine.store('app').showNotification('Erreur lors de l\'ajout', 'error');
        } finally {
            this.chargement = false;
        }
    }
});

// Initialisation automatique au chargement d'Alpine
document.addEventListener('alpine:init', () => {
    AlpineComponentSystem.init();
});

// Export pour compatibilité avec l'existant
window.AlpineComponents = {
    // Garder les composants existants pour compatibilité
    ...window.AlpineComponents,
    
    // Nouveaux composants structurés
    button: AlpineComponentSystem.components.button,
    modal: AlpineComponentSystem.components.modal,
    form: AlpineComponentSystem.components.form,
    testimonials: AlpineComponentSystem.components.testimonials
};