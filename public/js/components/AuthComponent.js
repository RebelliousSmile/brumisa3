// ========================================
// Composants authentification
// ========================================

/**
 * Composant pour la connexion
 */
function AuthComponent() {
    return {
        // État
        formulaire: {
            email: '',
            motDePasse: ''
        },
        enTraitement: false,
        erreurs: [],
        
        // Méthodes
        validerFormulaire() {
            this.erreurs = [];
            
            if (!this.formulaire.email.trim()) {
                this.erreurs.push('Email requis');
            } else if (!/\S+@\S+\.\S+/.test(this.formulaire.email)) {
                this.erreurs.push('Email invalide');
            }
            
            if (!this.formulaire.motDePasse.trim()) {
                this.erreurs.push('Mot de passe requis');
            }
            
            return this.erreurs.length === 0;
        },
        
        async connexion() {
            if (this.enTraitement) return;
            
            if (!this.validerFormulaire()) {
                return;
            }
            
            this.enTraitement = true;
            this.erreurs = [];
            
            try {
                const response = await fetch('/api/auth/connexion', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: this.formulaire.email,
                        motDePasse: this.formulaire.motDePasse
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    this.erreurs.push(data.message || 'Erreur de connexion');
                    return;
                }
                
                // Redirection après connexion réussie
                window.location.href = '/mes-documents';
                
            } catch (erreur) {
                console.error('Erreur connexion:', erreur);
                this.erreurs.push('Erreur de connexion');
            } finally {
                this.enTraitement = false;
            }
        }
    };
}

/**
 * Composant pour l'inscription
 */
function InscriptionComponent() {
    return {
        // État
        formulaire: {
            nom: '',
            email: '',
            motDePasse: '',
            confirmationMotDePasse: '',
            accepteCGU: false
        },
        enTraitement: false,
        erreurs: [],
        succes: false,
        messageSucces: '',
        
        // Méthodes
        validerFormulaire() {
            this.erreurs = [];
            
            // Validation nom
            if (!this.formulaire.nom.trim()) {
                this.erreurs.push('Nom requis');
            } else if (this.formulaire.nom.trim().length < 2) {
                this.erreurs.push('Nom trop court (min 2 caractères)');
            }
            
            // Validation email
            if (!this.formulaire.email.trim()) {
                this.erreurs.push('Email requis');
            } else if (!/\S+@\S+\.\S+/.test(this.formulaire.email)) {
                this.erreurs.push('Email invalide');
            }
            
            // Validation mot de passe
            if (!this.formulaire.motDePasse) {
                this.erreurs.push('Mot de passe requis');
            } else if (this.formulaire.motDePasse.length < 8) {
                this.erreurs.push('Mot de passe trop court (min 8 caractères)');
            }
            
            // Validation confirmation
            if (this.formulaire.motDePasse !== this.formulaire.confirmationMotDePasse) {
                this.erreurs.push('Les mots de passe ne correspondent pas');
            }
            
            // Validation CGU
            if (!this.formulaire.accepteCGU) {
                this.erreurs.push('Vous devez accepter les conditions d\'utilisation');
            }
            
            return this.erreurs.length === 0;
        },
        
        async inscription() {
            if (this.enTraitement) return;
            
            if (!this.validerFormulaire()) {
                return;
            }
            
            this.enTraitement = true;
            this.erreurs = [];
            this.succes = false;
            
            try {
                const response = await fetch('/api/auth/inscription', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        nom: this.formulaire.nom,
                        email: this.formulaire.email,
                        motDePasse: this.formulaire.motDePasse,
                        confirmationMotDePasse: this.formulaire.confirmationMotDePasse
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    this.erreurs.push(data.message || 'Erreur d\'inscription');
                    return;
                }
                
                this.succes = true;
                this.messageSucces = 'Compte créé avec succès ! Redirection...';
                
                // Redirection après inscription réussie
                setTimeout(() => {
                    window.location.href = '/mes-documents';
                }, 2000);
                
            } catch (erreur) {
                console.error('Erreur inscription:', erreur);
                this.erreurs.push('Erreur d\'inscription');
            } finally {
                this.enTraitement = false;
            }
        }
    };
}

/**
 * Composant pour le menu utilisateur
 */
function menuUtilisateur() {
    return {
        ouvert: false,
        
        get utilisateur() {
            return Alpine.store('app').utilisateur;
        },
        
        basculer() {
            this.ouvert = !this.ouvert;
        },
        
        fermer() {
            this.ouvert = false;
        },
        
        async deconnecter() {
            try {
                await Alpine.store('app').requeteApi('/auth/deconnexion', {
                    method: 'POST'
                });
                
                // Nettoyer le store
                Alpine.store('app').utilisateur = null;
                
                // Nettoyer le stockage local
                localStorage.clear();
                
                // Redirection vers l'accueil après déconnexion
                window.location.href = '/';
                
            } catch (erreur) {
                console.error('Erreur déconnexion:', erreur);
                // Forcer la déconnexion même en cas d'erreur
                window.location.href = '/connexion';
            }
        }
    };
}

/**
 * Composant pour l'élévation de rôle
 */
function elevationRole() {
    return {
        ouvert: false,
        codeAcces: '',
        enTraitement: false,
        
        ouvrir() {
            this.ouvert = true;
            this.codeAcces = '';
            this.$nextTick(() => {
                this.$refs.inputCode?.focus();
            });
        },
        
        fermer() {
            this.ouvert = false;
            this.codeAcces = '';
        },
        
        async verifier() {
            if (!this.codeAcces || this.codeAcces.length !== 6) {
                Alpine.store('app').ajouterMessage('erreur', 'Code à 6 chiffres requis');
                return;
            }
            
            this.enTraitement = true;
            
            try {
                const data = await Alpine.store('app').requeteApi('/auth/elevation-role', {
                    method: 'POST',
                    body: JSON.stringify({ code_acces: this.codeAcces })
                });
                
                Alpine.store('app').ajouterMessage('succes', `Rôle élevé vers ${data.donnees.role}`);
                
                // Mettre à jour l'utilisateur
                Alpine.store('app').utilisateur = data.donnees.utilisateur;
                
                this.fermer();
                
                // Recharger la page pour mettre à jour l'interface
                setTimeout(() => window.location.reload(), 1000);
                
            } catch (erreur) {
                console.error('Erreur élévation rôle:', erreur);
            } finally {
                this.enTraitement = false;
            }
        },
        
        // Gestion des événements clavier
        gererTouche(event) {
            if (event.key === 'Enter') {
                this.verifier();
            } else if (event.key === 'Escape') {
                this.fermer();
            }
        }
    };
}

/**
 * Composant pour vérifier l'authentification
 */
function verifierAuth(roleRequis = null) {
    return {
        authentifie: false,
        autorise: false,
        
        init() {
            this.verifier();
        },
        
        verifier() {
            const utilisateur = Alpine.store('app').utilisateur;
            
            this.authentifie = !!utilisateur;
            
            if (roleRequis && utilisateur) {
                const rolesHierarchie = ['UTILISATEUR', 'PREMIUM', 'ADMIN'];
                const roleUtilisateur = rolesHierarchie.indexOf(utilisateur.role);
                const roleMin = rolesHierarchie.indexOf(roleRequis);
                this.autorise = roleUtilisateur >= roleMin;
            } else {
                this.autorise = this.authentifie;
            }
            
            // Redirection si non autorisé
            if (roleRequis && !this.autorise) {
                if (!this.authentifie) {
                    window.location.href = '/connexion';
                } else {
                    Alpine.store('app').ajouterMessage('erreur', 'Accès non autorisé pour votre rôle');
                }
            }
        }
    };
}

/**
 * Composant pour la récupération de mot de passe
 */
function MotDePasseOublieComponent() {
    return {
        // État
        formulaire: {
            email: ''
        },
        enTraitement: false,
        erreur: '',
        succes: false,
        
        // Méthodes
        validerFormulaire() {
            this.erreur = '';
            
            if (!this.formulaire.email.trim()) {
                this.erreur = 'Email requis';
                return false;
            }
            
            if (!/\S+@\S+\.\S+/.test(this.formulaire.email)) {
                this.erreur = 'Email invalide';
                return false;
            }
            
            return true;
        },
        
        async envoyerLien() {
            if (this.enTraitement) return;
            
            if (!this.validerFormulaire()) {
                return;
            }
            
            this.enTraitement = true;
            this.erreur = '';
            this.succes = false;
            
            try {
                const response = await fetch('/api/auth/mot-de-passe-oublie', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: this.formulaire.email
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    this.erreur = data.message || 'Erreur lors de l\'envoi';
                    return;
                }
                
                this.succes = true;
                
            } catch (erreur) {
                console.error('Erreur récupération:', erreur);
                this.erreur = 'Erreur lors de l\'envoi';
            } finally {
                this.enTraitement = false;
            }
        }
    };
}

/**
 * Composant pour la réinitialisation de mot de passe
 */
function ReinitialiserMotDePasseComponent(token) {
    return {
        // État
        formulaire: {
            motDePasse: '',
            confirmationMotDePasse: ''
        },
        token: token,
        enTraitement: false,
        erreurs: [],
        succes: false,
        
        // Méthodes
        validerFormulaire() {
            this.erreurs = [];
            
            if (!this.formulaire.motDePasse) {
                this.erreurs.push('Mot de passe requis');
            } else if (this.formulaire.motDePasse.length < 8) {
                this.erreurs.push('Mot de passe trop court (min 8 caractères)');
            }
            
            if (this.formulaire.motDePasse !== this.formulaire.confirmationMotDePasse) {
                this.erreurs.push('Les mots de passe ne correspondent pas');
            }
            
            return this.erreurs.length === 0;
        },
        
        async reinitialiser() {
            if (this.enTraitement) return;
            
            if (!this.validerFormulaire()) {
                return;
            }
            
            this.enTraitement = true;
            this.erreurs = [];
            this.succes = false;
            
            try {
                const response = await fetch('/api/auth/reinitialiser-mot-de-passe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        token: this.token,
                        motDePasse: this.formulaire.motDePasse,
                        confirmationMotDePasse: this.formulaire.confirmationMotDePasse
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    this.erreurs.push(data.message || 'Erreur lors de la réinitialisation');
                    return;
                }
                
                this.succes = true;
                
                // Redirection vers la connexion après 3 secondes
                setTimeout(() => {
                    window.location.href = '/connexion';
                }, 3000);
                
            } catch (erreur) {
                console.error('Erreur réinitialisation:', erreur);
                this.erreurs.push('Erreur lors de la réinitialisation');
            } finally {
                this.enTraitement = false;
            }
        }
    };
}

// ========================================
// Enregistrement global des composants
// ========================================
window.AlpineComponents = window.AlpineComponents || {};
Object.assign(window.AlpineComponents, {
    AuthComponent,
    InscriptionComponent,
    MotDePasseOublieComponent,
    ReinitialiserMotDePasseComponent,
    // Anciens composants conservés pour compatibilité
    connexion: AuthComponent,
    inscription: InscriptionComponent,
    menuUtilisateur,
    elevationRole,
    verifierAuth
});