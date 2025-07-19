// ========================================
// public/js/app.js - Configuration Alpine.js et stores globaux
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
                'MONSTERHEARTS': '#8b0000',
                'SEPTIEME_MER': '#1e4d72', 
                'ENGRENAGES': '#8b4513',
                'METRO_2033': '#2c3e50',
                'MIST_ENGINE': '#663399'
            };
            return couleurs[systeme] || '#6b7280';
        },
        
        obtenirNomSysteme(systeme) {
            return this.systemes[systeme]?.nom || systeme;
        }
    });
    
    // ========================================
    // Store pour la navigation
    // ========================================
    Alpine.store('navigation', {
        menuMobileOuvert: false,
        
        basculerMenuMobile() {
            this.menuMobileOuvert = !this.menuMobileOuvert;
        },
        
        fermerMenuMobile() {
            this.menuMobileOuvert = false;
        }
    });
});

// ========================================
// public/js/services/PersonnageService.js - Service métier personnages
// ========================================
class PersonnageService {
    constructor() {
        this.store = Alpine.store('app');
    }
    
    /**
     * Liste les personnages de l'utilisateur
     */
    async lister(filtres = {}) {
        try {
            const params = new URLSearchParams(filtres);
            const data = await this.store.requeteApi(`/personnages?${params}`);
            return data.donnees || [];
        } catch (erreur) {
            console.error('Erreur listage personnages:', erreur);
            return [];
        }
    }
    
    /**
     * Récupère un personnage par ID
     */
    async obtenirParId(id) {
        const data = await this.store.requeteApi(`/personnages/${id}`);
        return data.donnees;
    }
    
    /**
     * Crée un nouveau personnage
     */
    async creer(donnees) {
        const data = await this.store.requeteApi('/personnages', {
            method: 'POST',
            body: JSON.stringify(donnees)
        });
        
        this.store.ajouterMessage('succes', 'Personnage créé avec succès');
        return data.donnees;
    }
    
    /**
     * Met à jour un personnage
     */
    async mettreAJour(id, donnees) {
        const data = await this.store.requeteApi(`/personnages/${id}`, {
            method: 'PUT',
            body: JSON.stringify(donnees)
        });
        
        this.store.ajouterMessage('succes', 'Personnage mis à jour');
        return data.donnees;
    }
    
    /**
     * Duplique un personnage
     */
    async dupliquer(id, nouveauNom) {
        const data = await this.store.requeteApi(`/personnages/${id}/dupliquer`, {
            method: 'POST',
            body: JSON.stringify({ nouveau_nom: nouveauNom })
        });
        
        this.store.ajouterMessage('succes', 'Personnage dupliqué avec succès');
        return data.donnees;
    }
    
    /**
     * Supprime un personnage
     */
    async supprimer(id) {
        await this.store.requeteApi(`/personnages/${id}`, {
            method: 'DELETE'
        });
        
        this.store.ajouterMessage('succes', 'Personnage supprimé');
    }
    
    /**
     * Génère un PDF pour un personnage
     */
    async genererPdf(id) {
        const data = await this.store.requeteApi(`/personnages/${id}/pdf`, {
            method: 'POST'
        });
        
        this.store.ajouterMessage('succes', 'Génération PDF démarrée');
        return data.donnees;
    }
    
    /**
     * Valide les données d'un personnage
     */
    validerDonnees(donnees, systeme) {
        const erreurs = [];
        
        // Validation nom
        if (!donnees.nom || donnees.nom.trim().length === 0) {
            erreurs.push('Le nom est requis');
        }
        
        // Validation système
        if (!systeme || !this.store.systemes[systeme]) {
            erreurs.push('Système de jeu invalide');
        }
        
        // Validations spécifiques au système
        if (systeme && this.store.systemes[systeme]) {
            const template = this.store.systemes[systeme];
            
            // Vérifier les champs requis
            template.infos_base?.requis?.forEach(champ => {
                if (!donnees.infos_base?.[champ]) {
                    erreurs.push(`${champ} est requis pour ${template.nom}`);
                }
            });
            
            // Vérifier les attributs
            if (template.attributs) {
                Object.entries(template.attributs).forEach(([nom, config]) => {
                    const valeur = donnees.attributs?.[nom];
                    if (valeur !== undefined) {
                        if (valeur < config.min || valeur > config.max) {
                            erreurs.push(`${nom} doit être entre ${config.min} et ${config.max}`);
                        }
                    }
                });
            }
        }
        
        return erreurs;
    }
}

// Instance globale
window.personnageService = new PersonnageService();

// ========================================
// public/js/services/PdfService.js - Service métier PDFs
// ========================================
class PdfService {
    constructor() {
        this.store = Alpine.store('app');
    }
    
    /**
     * Liste les PDFs de l'utilisateur
     */
    async lister() {
        try {
            const data = await this.store.requeteApi('/pdfs');
            return data.donnees || [];
        } catch (erreur) {
            console.error('Erreur listage PDFs:', erreur);
            return [];
        }
    }
    
    /**
     * Récupère un PDF par ID
     */
    async obtenirParId(id) {
        const data = await this.store.requeteApi(`/pdfs/${id}`);
        return data.donnees;
    }
    
    /**
     * Télécharge un PDF
     */
    telecharger(id, nomFichier) {
        const lien = document.createElement('a');
        lien.href = `/api/pdfs/${id}/telecharger`;
        lien.download = nomFichier;
        document.body.appendChild(lien);
        lien.click();
        document.body.removeChild(lien);
    }
    
    /**
     * Supprime un PDF
     */
    async supprimer(id) {
        await this.store.requeteApi(`/pdfs/${id}`, {
            method: 'DELETE'
        });
        
        this.store.ajouterMessage('succes', 'PDF supprimé');
    }
    
    /**
     * Obtient le statut d'un PDF
     */
    obtenirStatutTexte(statut) {
        const statuts = {
            'EN_ATTENTE': { texte: 'En attente', classe: 'bg-yellow-100 text-yellow-800' },
            'EN_TRAITEMENT': { texte: 'En cours', classe: 'bg-blue-100 text-blue-800' },
            'TERMINE': { texte: 'Terminé', classe: 'bg-green-100 text-green-800' },
            'ECHEC': { texte: 'Échec', classe: 'bg-red-100 text-red-800' },
            'EXPIRE': { texte: 'Expiré', classe: 'bg-gray-100 text-gray-800' }
        };
        
        return statuts[statut] || { texte: statut, classe: 'bg-gray-100 text-gray-800' };
    }
}

// Instance globale
window.pdfService = new PdfService();

// ========================================
// public/js/components/PersonnageComponent.js - Composants Alpine personnages
// ========================================

/**
 * Composant pour la liste des personnages
 */
function listePersonnages() {
    return {
        // État local
        personnages: [],
        personnagesFiltres: [],
        filtreSysteme: '',
        chargement: true,
        
        // Initialisation
        async init() {
            await this.chargerPersonnages();
        },
        
        // Méthodes
        async chargerPersonnages() {
            try {
                this.chargement = true;
                this.personnages = await window.personnageService.lister();
                this.filtrerPersonnages();
            } catch (erreur) {
                console.error('Erreur chargement personnages:', erreur);
            } finally {
                this.chargement = false;
            }
        },
        
        filtrerPersonnages() {
            if (this.filtreSysteme === '') {
                this.personnagesFiltres = this.personnages;
            } else {
                this.personnagesFiltres = this.personnages.filter(p => p.systeme === this.filtreSysteme);
            }
        },
        
        async genererPdf(idPersonnage) {
            try {
                const pdf = await window.personnageService.genererPdf(idPersonnage);
                // Rediriger vers la page du PDF
                window.location.href = `/pdfs/${pdf.id}`;
            } catch (erreur) {
                console.error('Erreur génération PDF:', erreur);
            }
        },
        
        async dupliquer(idPersonnage) {
            const personnage = this.personnages.find(p => p.id === idPersonnage);
            const nouveauNom = prompt('Nom du personnage dupliqué :', `${personnage.nom} (Copie)`);
            
            if (!nouveauNom) return;
            
            try {
                const nouveauPersonnage = await window.personnageService.dupliquer(idPersonnage, nouveauNom);
                await this.chargerPersonnages();
                
                // Optionnel: rediriger vers le nouveau personnage
                window.location.href = `/personnages/${nouveauPersonnage.id}`;
            } catch (erreur) {
                console.error('Erreur duplication:', erreur);
            }
        },
        
        async supprimer(idPersonnage) {
            const personnage = this.personnages.find(p => p.id === idPersonnage);
            
            if (!confirm(`Êtes-vous sûr de vouloir supprimer "${personnage.nom}" ?`)) {
                return;
            }
            
            try {
                await window.personnageService.supprimer(idPersonnage);
                this.personnages = this.personnages.filter(p => p.id !== idPersonnage);
                this.filtrerPersonnages();
            } catch (erreur) {
                console.error('Erreur suppression:', erreur);
            }
        },
        
        // Getters
        get statistiques() {
            return {
                total: this.personnages.length,
                parSysteme: this.personnages.reduce((acc, p) => {
                    acc[p.systeme] = (acc[p.systeme] || 0) + 1;
                    return acc;
                }, {})
            };
        }
    };
}

/**
 * Composant pour la création de personnage
 */
function creationPersonnage(systeme, templateSysteme) {
    return {
        // État
        systeme,
        templateSysteme,
        enTraitement: false,
        erreurs: [],
        
        // Formulaire
        formulaire: {
            nom: '',
            systeme,
            infos_base: {},
            attributs: {},
            competences: {},
            mouvements: {},
            equipement: {},
            conditions: {},
            ressources: {},
            histoire: {},
            notes: ''
        },
        
        // Initialisation
        init() {
            this.initialiserAttributs();
        },
        
        // Méthodes
        initialiserAttributs() {
            Object.entries(this.templateSysteme.attributs).forEach(([nom, config]) => {
                this.formulaire.attributs[nom] = config.defaut;
            });
        },
        
        modifierAttribut(nom, delta) {
            const config = this.templateSysteme.attributs[nom];
            const nouvelleValeur = this.formulaire.attributs[nom] + delta;
            
            if (nouvelleValeur >= config.min && nouvelleValeur <= config.max) {
                this.formulaire.attributs[nom] = nouvelleValeur;
            }
        },
        
        validerFormulaire() {
            this.erreurs = window.personnageService.validerDonnees(this.formulaire, this.systeme);
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
                const personnage = await window.personnageService.creer(this.formulaire);
                // Rediriger vers la fiche du personnage
                window.location.href = `/personnages/${personnage.id}`;
            } catch (erreur) {
                console.error('Erreur création personnage:', erreur);
            } finally {
                this.enTraitement = false;
            }
        }
    };
}

/**
 * Composant pour l'affichage d'un personnage
 */
function fichePersonnage(personnage) {
    return {
        // État
        personnage,
        pdfs: [],
        chargementPdfs: false,
        
        // Initialisation
        async init() {
            await this.chargerPdfs();
        },
        
        // Méthodes
        async chargerPdfs() {
            try {
                this.chargementPdfs = true;
                // Simuler un appel API pour les PDFs du personnage
                this.pdfs = await window.pdfService.lister();
                this.pdfs = this.pdfs.filter(pdf => pdf.id_personnage === this.personnage.id);
            } catch (erreur) {
                console.error('Erreur chargement PDFs:', erreur);
            } finally {
                this.chargementPdfs = false;
            }
        },
        
        async genererPdf() {
            try {
                const pdf = await window.personnageService.genererPdf(this.personnage.id);
                window.location.href = `/pdfs/${pdf.id}`;
            } catch (erreur) {
                console.error('Erreur génération PDF:', erreur);
            }
        },
        
        async dupliquer() {
            const nouveauNom = prompt('Nom du personnage dupliqué :', `${this.personnage.nom} (Copie)`);
            if (!nouveauNom) return;
            
            try {
                const nouveau = await window.personnageService.dupliquer(this.personnage.id, nouveauNom);
                window.location.href = `/personnages/${nouveau.id}`;
            } catch (erreur) {
                console.error('Erreur duplication:', erreur);
            }
        },
        
        async supprimer() {
            if (!confirm(`Êtes-vous sûr de vouloir supprimer "${this.personnage.nom}" ?`)) {
                return;
            }
            
            try {
                await window.personnageService.supprimer(this.personnage.id);
                window.location.href = '/personnages';
            } catch (erreur) {
                console.error('Erreur suppression:', erreur);
            }
        }
    };
}

// ========================================
// public/js/components/AuthComponent.js - Composants authentification
// ========================================

/**
 * Composant pour la connexion
 */
function connexion() {
    return {
        // État
        formulaire: {
            email: '',
            mot_de_passe: '',
            se_souvenir: false
        },
        codeAcces: '',
        enTraitement: false,
        erreurs: [],
        
        // Méthodes
        validerFormulaire() {
            this.erreurs = [];
            
            if (!this.formulaire.email) {
                this.erreurs.push('Email requis');
            } else if (!/\S+@\S+\.\S+/.test(this.formulaire.email)) {
                this.erreurs.push('Email invalide');
            }
            
            if (!this.formulaire.mot_de_passe) {
                this.erreurs.push('Mot de passe requis');
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
                
                // Redirection après connexion réussie
                window.location.href = '/tableau-bord';
                
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
                
                // Recharger la page pour mettre à jour l'interface
                setTimeout(() => window.location.reload(), 1000);
                
            } catch (erreur) {
                console.error('Erreur élévation rôle:', erreur);
            }
        }
    };
}

/**
 * Composant pour l'inscription
 */
function inscription() {
    return {
        // État
        formulaire: {
            email: '',
            nom_utilisateur: '',
            mot_de_passe: '',
            confirmation_mot_de_passe: '',
            prenom: '',
            nom: ''
        },
        enTraitement: false,
        erreurs: [],
        
        // Méthodes
        validerFormulaire() {
            this.erreurs = [];
            
            // Validation email
            if (!this.formulaire.email) {
                this.erreurs.push('Email requis');
            } else if (!/\S+@\S+\.\S+/.test(this.formulaire.email)) {
                this.erreurs.push('Email invalide');
            }
            
            // Validation nom d'utilisateur
            if (!this.formulaire.nom_utilisateur) {
                this.erreurs.push('Nom d\'utilisateur requis');
            } else if (this.formulaire.nom_utilisateur.length < 3) {
                this.erreurs.push('Nom d\'utilisateur trop court (min 3 caractères)');
            }
            
            // Validation mot de passe
            if (!this.formulaire.mot_de_passe) {
                this.erreurs.push('Mot de passe requis');
            } else if (this.formulaire.mot_de_passe.length < 8) {
                this.erreurs.push('Mot de passe trop court (min 8 caractères)');
            } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(this.formulaire.mot_de_passe)) {
                this.erreurs.push('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre');
            }
            
            // Confirmation mot de passe
            if (this.formulaire.mot_de_passe !== this.formulaire.confirmation_mot_de_passe) {
                this.erreurs.push('Les mots de passe ne correspondent pas');
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
                const { confirmation_mot_de_passe, ...donneesInscription } = this.formulaire;
                
                const data = await Alpine.store('app').requeteApi('/auth/inscription', {
                    method: 'POST',
                    body: JSON.stringify(donneesInscription)
                });
                
                Alpine.store('app').ajouterMessage('succes', 'Inscription réussie');
                
                // Redirection après inscription réussie
                window.location.href = '/tableau-bord';
                
            } catch (erreur) {
                console.error('Erreur inscription:', erreur);
            } finally {
                this.enTraitement = false;
            }
        }
    };
}

// ========================================
// public/js/components/TableauBordComponent.js - Composant dashboard
// ========================================

/**
 * Composant pour le tableau de bord
 */
function tableauBord() {
    return {
        // État
        stats: {
            totalPersonnages: 0,
            totalPdfs: 0,
            parSysteme: {}
        },
        activiteRecente: [],
        chargement: true,
        
        // Initialisation
        async init() {
            await Promise.all([
                this.chargerStats(),
                this.chargerActiviteRecente()
            ]);
            this.chargement = false;
        },
        
        // Méthodes
        async chargerStats() {
            try {
                const data = await Alpine.store('app').requeteApi('/stats');
                this.stats = data.donnees || this.stats;
            } catch (erreur) {
                console.error('Erreur chargement stats:', erreur);
            }
        },
        
        async chargerActiviteRecente() {
            try {
                const data = await Alpine.store('app').requeteApi('/activite-recente');
                this.activiteRecente = data.donnees || [];
            } catch (erreur) {
                console.error('Erreur chargement activité:', erreur);
            }
        },
        
        // Getters
        get systemesAvecStats() {
            return Object.entries(this.stats.parSysteme).map(([systeme, nombre]) => ({
                systeme,
                nom: Alpine.store('app').obtenirNomSysteme(systeme),
                couleur: Alpine.store('app').obtenirCouleurSysteme(systeme),
                nombre
            }));
        }
    };
}

// ========================================
// Enregistrement global des composants
// ========================================
window.AlpineComponents = {
    listePersonnages,
    creationPersonnage,
    fichePersonnage,
    connexion,
    inscription,
    tableauBord
};