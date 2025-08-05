/**
 * Système de Composants Alpine.js Structuré
 * Centralise tous les composants Alpine.js avec une API cohérente
 */

// Namespace global pour les composants
window.AlpineComponentSystem = {
    // Store global partagé
    stores: {},
    
    // Composants de base
    components: {},
    
    // Utilitaires
    utils: {},
    
    // Initialisation
    init() {
        // Configuration Alpine Store global
        Alpine.store('app', {
            // État global de l'application
            loading: false,
            user: window.BRUMISA_DATA?.utilisateur || null,
            
            // Méthodes globales
            setLoading(state) {
                this.loading = state;
            },
            
            navigate(url) {
                window.location.href = url;
            },
            
            showNotification(message, type = 'info') {
                // TODO: Implémenter système de notifications
                console.log(`[${type.toUpperCase()}] ${message}`);
            }
        });
        
        console.log('Alpine Component System initialized');
    }
};

// === COMPOSANTS DE BASE ===

/**
 * Composant Button avec états
 */
AlpineComponentSystem.components.button = (config = {}) => ({
    loading: false,
    disabled: config.disabled || false,
    
    async handleClick() {
        if (this.disabled || this.loading) return;
        
        this.loading = true;
        try {
            if (config.action) {
                await config.action();
            }
        } catch (error) {
            Alpine.store('app').showNotification('Une erreur est survenue', 'error');
        } finally {
            this.loading = false;
        }
    },
    
    get isDisabled() {
        return this.disabled || this.loading;
    },
    
    get buttonText() {
        return this.loading ? (config.loadingText || 'Chargement...') : (config.text || 'Bouton');
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

AlpineComponentSystem.utils = {
    /**
     * Formatage des nombres
     */
    formatNumber(num) {
        return new Intl.NumberFormat('fr-FR').format(num);
    },
    
    /**
     * Formatage des dates
     */
    formatDate(date, options = {}) {
        return new Date(date).toLocaleDateString('fr-FR', options);
    },
    
    /**
     * Debounce pour les inputs
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Requête API standardisée
     */
    async apiCall(url, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response.json();
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