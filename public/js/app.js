// ========================================
// Configuration Alpine.js et stores globaux
// ========================================

// Configuration Alpine.js avant le chargement
document.addEventListener('alpine:init', () => {
    
    // ========================================
    // Store global de l'application
    // ========================================
    Alpine.store('app', {
        // État global
        utilisateur: window.APP_DATA?.utilisateur || null,
        systemes: window.APP_DATA?.systemes || {},
        
        // Configuration
        config: {
            apiUrl: '/api',
            messagesAutoSupprimer: 5000
        },
        
        // Messages flash
        messages: [],
        
        // Méthodes globales
        ajouterMessage(type, texte) {
            const id = Date.now() + Math.random();
            this.messages.push({ id, type, texte, timestamp: Date.now() });
            
            // Auto-suppression
            setTimeout(() => {
                this.supprimerMessage(id);
            }, this.config.messagesAutoSupprimer);
        },
        
        supprimerMessage(id) {
            this.messages = this.messages.filter(m => m.id !== id);
        },
        
        // Requêtes API standardisées
        async requeteApi(url, options = {}) {
            try {
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        ...options.headers
                    },
                    ...options
                };
                
                const response = await fetch(`${this.config.apiUrl}${url}`, config);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || `Erreur ${response.status}`);
                }
                
                return data;
            } catch (erreur) {
                this.ajouterMessage('erreur', erreur.message);
                throw erreur;
            }
        },
        
        // Utilitaires
        formaterDate(dateString) {
            return new Date(dateString).toLocaleDateString('fr-FR');
        },
        
        obtenirCouleurSysteme(systeme) {
            const couleurs = {
                'monsterhearts': '#8b0000',
                'engrenages': '#8b4513',
                'metro_2033': '#2c3e50',
                'mist_engine': '#663399'
            };
            return couleurs[systeme] || '#6b7280';
        },
        
        obtenirNomSysteme(systeme) {
            return this.systemes[systeme]?.nom || systeme;
        }
    });
    
    // ========================================
    // Store pour la navigation mobile
    // ========================================
    Alpine.store('navigation', {
        menuMobileOuvert: false,
        currentSection: 'infos-base',
        totalSections: 5,
        isOffline: false,
        hasUnsavedChanges: false,
        
        // Navigation mobile
        basculerMenuMobile() {
            this.menuMobileOuvert = !this.menuMobileOuvert;
        },
        
        fermerMenuMobile() {
            this.menuMobileOuvert = false;
        },
        
        // Navigation séquentielle
        nextSection() {
            const sections = ['infos-base', 'attributs', 'competences', 'equipement', 'notes'];
            const currentIndex = sections.indexOf(this.currentSection);
            if (currentIndex < sections.length - 1) {
                this.currentSection = sections[currentIndex + 1];
            }
        },
        
        prevSection() {
            const sections = ['infos-base', 'attributs', 'competences', 'equipement', 'notes'];
            const currentIndex = sections.indexOf(this.currentSection);
            if (currentIndex > 0) {
                this.currentSection = sections[currentIndex - 1];
            }
        },
        
        goToSection(sectionId) {
            this.currentSection = sectionId;
        },
        
        markDirty() {
            this.hasUnsavedChanges = true;
        },
        
        markClean() {
            this.hasUnsavedChanges = false;
        },
        
        // Progress calculation
        get progressPercent() {
            const sections = ['infos-base', 'attributs', 'competences', 'equipement', 'notes'];
            const currentIndex = sections.indexOf(this.currentSection);
            return Math.round(((currentIndex + 1) / sections.length) * 100);
        }
    });
    
    // ========================================
    // Store pour la création/édition
    // ========================================
    Alpine.store('creation', {
        // État formulaire
        formulaireActuel: null,
        modeCreation: 'scratch', // scratch, template, wizard
        sauvegardeAuto: true,
        
        // Sauvegarde automatique locale
        sauvegarderLocalement(formData) {
            if (this.sauvegardeAuto) {
                const key = `formulaire_${formData.systeme}_${Date.now()}`;
                localStorage.setItem(key, JSON.stringify(formData));
                Alpine.store('navigation').markClean();
            }
        },
        
        chargerDepuisLocal(key) {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        },
        
        supprimerLocal(key) {
            localStorage.removeItem(key);
        },
        
        // Obtenir formulaires sauvegardés
        getFormulaireSauvegardes() {
            const keys = Object.keys(localStorage).filter(key => key.startsWith('formulaire_'));
            return keys.map(key => ({
                key,
                data: JSON.parse(localStorage.getItem(key)),
                timestamp: JSON.parse(localStorage.getItem(key)).timestamp || Date.now()
            }));
        }
    });
    
    // ========================================
    // Store pour le partage
    // ========================================
    Alpine.store('partage', {
        lienTemporaire: null,
        qrCode: null,
        
        async genererLienPartage(documentId) {
            try {
                const data = await Alpine.store('app').requeteApi(`/partage/generer`, {
                    method: 'POST',
                    body: JSON.stringify({ documentId })
                });
                
                this.lienTemporaire = data.lien;
                this.qrCode = data.qrCode;
                
                return data;
            } catch (erreur) {
                console.error('Erreur génération lien partage:', erreur);
                throw erreur;
            }
        },
        
        copierLien() {
            if (this.lienTemporaire && navigator.clipboard) {
                navigator.clipboard.writeText(this.lienTemporaire);
                Alpine.store('app').ajouterMessage('succes', 'Lien copié dans le presse-papier');
            }
        }
    });
});

// ========================================
// Composants Alpine.js pour le layout
// ========================================
window.AlpineComponents = window.AlpineComponents || {};

// Navigation mobile
window.AlpineComponents.navigationMobile = () => ({
    menuOuvert: false,
    
    basculerMenu() {
        this.menuOuvert = !this.menuOuvert;
    },
    
    fermerMenu() {
        this.menuOuvert = false;
    },
    
    naviguer(url) {
        this.fermerMenu();
        window.location.href = url;
    }
});

// Menu utilisateur
window.AlpineComponents.menuUtilisateur = () => ({
    ouvert: false,
    
    basculer() {
        this.ouvert = !this.ouvert;
    },
    
    fermer() {
        this.ouvert = false;
    },
    
    async deconnecter() {
        try {
            await Alpine.store('app').requeteApi('/api/auth/deconnexion', {
                method: 'POST'
            });
            window.location.href = '/';
        } catch (error) {
            console.error('Erreur déconnexion:', error);
        }
    }
});

// Messages flash
window.AlpineComponents.messagesFlash = () => ({
    get messages() {
        return Alpine.store('app').messages;
    },
    
    supprimerMessage(id) {
        Alpine.store('app').supprimerMessage(id);
    },
    
    obtenirIcone(type) {
        const icones = {
            succes: '✓',
            erreur: '✗',
            avertissement: '⚠',
            info: 'ℹ'
        };
        return icones[type] || 'ℹ';
    }
});

// Indicateur hors ligne
window.AlpineComponents.indicateurHorsLigne = () => ({
    isOffline: false,
    hasUnsavedChanges: false,
    
    init() {
        window.addEventListener('online', () => this.isOffline = false);
        window.addEventListener('offline', () => this.isOffline = true);
        
        // Vérifier état initial
        this.isOffline = !navigator.onLine;
    }
});

// Élévation de rôle
window.AlpineComponents.elevationRole = () => ({
    ouvert: false,
    codeAcces: '',
    enTraitement: false,
    
    ouvrir() {
        this.ouvert = true;
        this.$nextTick(() => {
            this.$refs.inputCode?.focus();
        });
    },
    
    fermer() {
        this.ouvert = false;
        this.codeAcces = '';
        this.enTraitement = false;
    },
    
    gererTouche(event) {
        if (event.key === 'Enter' && this.codeAcces.length === 6) {
            this.verifier();
        } else if (event.key === 'Escape') {
            this.fermer();
        }
    },
    
    async verifier() {
        if (this.enTraitement || this.codeAcces.length !== 6) return;
        
        this.enTraitement = true;
        
        try {
            const response = await Alpine.store('app').requeteApi('/auth/elevation-role', {
                method: 'POST',
                body: JSON.stringify({ code: this.codeAcces })
            });
            
            if (response.succes) {
                Alpine.store('app').ajouterMessage('succes', 'Rôle mis à niveau avec succès !');
                this.fermer();
                // Recharger la page pour mettre à jour l'interface
                setTimeout(() => window.location.reload(), 1000);
            } else {
                Alpine.store('app').ajouterMessage('erreur', response.message || 'Code incorrect');
            }
        } catch (error) {
            Alpine.store('app').ajouterMessage('erreur', 'Erreur lors de la vérification du code');
        } finally {
            this.enTraitement = false;
        }
    }
});

// ========================================
// Détection mode hors ligne
// ========================================
window.addEventListener('online', () => {
    Alpine.store('navigation').isOffline = false;
    Alpine.store('app').ajouterMessage('info', 'Connexion rétablie');
});

window.addEventListener('offline', () => {
    Alpine.store('navigation').isOffline = true;
    Alpine.store('app').ajouterMessage('avertissement', 'Mode hors ligne activé');
});

// ========================================
// Gestion des gestures mobiles
// ========================================
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleGesture();
});

function handleGesture() {
    const swipeThreshold = 50;
    const swipeDistance = touchEndX - touchStartX;
    
    // Seulement dans les formulaires
    if (document.querySelector('[data-formulaire-section]')) {
        if (swipeDistance > swipeThreshold) {
            // Swipe droite -> section précédente
            Alpine.store('navigation').prevSection();
        } else if (swipeDistance < -swipeThreshold) {
            // Swipe gauche -> section suivante
            Alpine.store('navigation').nextSection();
        }
    }
}

// ========================================
// Auto-sauvegarde
// ========================================
setInterval(() => {
    if (Alpine.store('navigation').hasUnsavedChanges) {
        // Déclencher auto-sauvegarde si composant présent
        const formComponent = document.querySelector('[data-auto-save]');
        if (formComponent && formComponent._x_dataStack) {
            const componentData = formComponent._x_dataStack[0];
            if (componentData.sauvegarderAuto) {
                componentData.sauvegarderAuto();
            }
        }
    }
}, 30000); // Toutes les 30 secondes