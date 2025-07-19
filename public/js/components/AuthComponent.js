// ========================================
// Composants authentification
// ========================================

/**
 * Composant pour la connexion
 */
function connexion() {
    return {
        // État
        formulaire: {
            nom: '',
            email: ''
        },
        codeAcces: '',
        enTraitement: false,
        erreurs: [],
        
        // Méthodes
        validerFormulaire() {
            this.erreurs = [];
            
            if (!this.formulaire.nom.trim()) {
                this.erreurs.push('Nom requis');
            }
            
            if (!this.formulaire.email.trim()) {
                this.erreurs.push('Email requis');
            } else if (!/\S+@\S+\.\S+/.test(this.formulaire.email)) {
                this.erreurs.push('Email invalide');
            }
            
            return this.erreurs.length === 0;
        },
        
        async soumettre() {
            if (this.enTraitement) return;
            
            if (!this.validerFormulaire()) {
                this.erreurs.forEach(erreur => {
                    Alpine.store('app').ajouterMessage('erreur', erreur);
                });
                return;
            }
            
            this.enTraitement = true;
            
            try {
                const data = await Alpine.store('app').requeteApi('/auth/connexion', {
                    method: 'POST',
                    body: JSON.stringify(this.formulaire)
                });
                
                // Mettre à jour l'utilisateur dans le store
                Alpine.store('app').utilisateur = data.utilisateur;
                
                // Redirection après connexion réussie
                window.location.href = '/';
                
            } catch (erreur) {
                console.error('Erreur connexion:', erreur);
            } finally {
                this.enTraitement = false;
            }
        },
        
        async verifierCodeAcces() {
            if (!this.codeAcces || this.codeAcces.length !== 6) {
                Alpine.store('app').ajouterMessage('erreur', 'Code à 6 chiffres requis');
                return;
            }
            
            try {
                const data = await Alpine.store('app').requeteApi('/auth/elevation-role', {
                    method: 'POST',
                    body: JSON.stringify({ code_acces: this.codeAcces })
                });
                
                Alpine.store('app').ajouterMessage('succes', `Rôle élevé vers ${data.donnees.role}`);
                
                // Mettre à jour l'utilisateur
                Alpine.store('app').utilisateur = data.donnees.utilisateur;
                
                // Recharger la page pour mettre à jour l'interface
                setTimeout(() => window.location.reload(), 1000);
                
            } catch (erreur) {
                console.error('Erreur élévation rôle:', erreur);
            }
        }
    };
}

/**
 * Composant pour l'inscription (création utilisateur simple)
 */
function inscription() {
    return {
        // État
        formulaire: {
            nom: '',
            email: ''
        },
        enTraitement: false,
        erreurs: [],
        
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
            
            return this.erreurs.length === 0;
        },
        
        async soumettre() {
            if (this.enTraitement) return;
            
            if (!this.validerFormulaire()) {
                this.erreurs.forEach(erreur => {
                    Alpine.store('app').ajouterMessage('erreur', erreur);
                });
                return;
            }
            
            this.enTraitement = true;
            
            try {
                const data = await Alpine.store('app').requeteApi('/auth/inscription', {
                    method: 'POST',
                    body: JSON.stringify(this.formulaire)
                });
                
                Alpine.store('app').ajouterMessage('succes', 'Compte créé avec succès');
                
                // Mettre à jour l'utilisateur dans le store
                Alpine.store('app').utilisateur = data.utilisateur;
                
                // Redirection après inscription réussie
                window.location.href = '/';
                
            } catch (erreur) {
                console.error('Erreur inscription:', erreur);
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
                
                // Redirection
                window.location.href = '/connexion';
                
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

// ========================================
// Enregistrement global des composants
// ========================================
window.AlpineComponents = window.AlpineComponents || {};
Object.assign(window.AlpineComponents, {
    connexion,
    inscription,
    menuUtilisateur,
    elevationRole,
    verifierAuth
});