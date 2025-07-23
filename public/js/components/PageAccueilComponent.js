/**
 * Composant Alpine.js pour la page d'accueil
 */

window.AlpineComponents = window.AlpineComponents || {};

window.AlpineComponents.pageAccueil = () => ({
    // État des données
    pdfsRecents: [],
    actualites: [],
    temoignages: [],
    statistiques: {
        nb_abonnes_newsletter: 0,
        stats_temoignages: {}
    },
    
    // État de la newsletter
    emailNewsletter: '',
    nomNewsletter: '',
    newsletterInscrit: false,
    chargementNewsletter: false,
    
    // État des témoignages
    afficherFormulaireTemoignage: false,
    chargementTemoignage: false,
    nouveauTemoignage: {
        nom: '',
        email: '',
        systeme_utilise: '',
        note: '',
        titre: '',
        contenu: ''
    },
    
    // État des dons
    afficherInfosDons: false,
    infoDons: null,
    
    // Initialisation
    async init() {
        // Attendre que Alpine soit prêt
        if (!this.$store || !this.$store.app) {
            await new Promise(resolve => {
                const checkStore = () => {
                    if (this.$store && this.$store.app) {
                        resolve();
                    } else {
                        setTimeout(checkStore, 50);
                    }
                };
                checkStore();
            });
        }
        
        await this.chargerDonneesAccueil();
        await this.chargerInfosDons();
    },
    
    /**
     * Charge toutes les données de la page d'accueil
     */
    async chargerDonneesAccueil() {
        try {
            const response = await this.$store.app.requeteApi('/home/donnees');
            
            if (response.succes) {
                this.pdfsRecents = response.donnees.pdfs_recents || [];
                this.actualites = response.donnees.actualites || [];
                this.temoignages = response.donnees.temoignages || [];
                this.statistiques = response.donnees.statistiques || {};
            }
        } catch (erreur) {
            console.error('Erreur lors du chargement des données d\'accueil:', erreur);
            this.$store.app.ajouterMessage('erreur', 'Impossible de charger les données de la page');
        }
    },
    
    /**
     * Charge les informations sur les dons
     */
    async chargerInfosDons() {
        try {
            const response = await this.$store.app.requeteApi('/dons/infos');
            
            if (response.succes) {
                this.infoDons = response.donnees;
            }
        } catch (erreur) {
            console.error('Erreur lors du chargement des infos dons:', erreur);
        }
    },
    
    /**
     * Navigation vers un système de jeu
     */
    naviguerVersSysteme(systeme) {
        // Utiliser le service de navigation centralisé
        if (window.navigationService) {
            window.navigationService.naviguerVersSysteme(systeme);
        } else {
            // Fallback si le service n'est pas chargé
            window.location.href = `/systemes/${systeme}`;
        }
    },
    
    /**
     * Inscription à la newsletter
     */
    async inscrireNewsletter() {
        if (this.chargementNewsletter) return;
        
        this.chargementNewsletter = true;
        
        try {
            const response = await this.$store.app.requeteApi('/newsletter/inscription', {
                method: 'POST',
                body: JSON.stringify({
                    email: this.emailNewsletter,
                    nom: this.nomNewsletter
                })
            });
            
            if (response.succes) {
                this.newsletterInscrit = true;
                this.$store.app.ajouterMessage('succes', response.message);
                
                // Mettre à jour le compteur d'abonnés
                this.statistiques.nb_abonnes_newsletter++;
                
                // Réinitialiser le formulaire
                this.emailNewsletter = '';
                this.nomNewsletter = '';
            } else {
                this.$store.app.ajouterMessage('avertissement', response.message);
            }
        } catch (erreur) {
            console.error('Erreur inscription newsletter:', erreur);
            this.$store.app.ajouterMessage('erreur', 'Erreur lors de l\'inscription à la newsletter');
        } finally {
            this.chargementNewsletter = false;
        }
    },
    
    /**
     * Ajoute un témoignage
     */
    async ajouterTemoignage() {
        if (this.chargementTemoignage) return;
        
        this.chargementTemoignage = true;
        
        try {
            const response = await this.$store.app.requeteApi('/temoignages', {
                method: 'POST',
                body: JSON.stringify(this.nouveauTemoignage)
            });
            
            if (response.succes) {
                this.$store.app.ajouterMessage('succes', response.message);
                
                // Réinitialiser le formulaire
                this.nouveauTemoignage = {
                    nom: '',
                    email: '',
                    systeme_utilise: '',
                    note: '',
                    titre: '',
                    contenu: ''
                };
                
                // Fermer le formulaire
                this.afficherFormulaireTemoignage = false;
            }
        } catch (erreur) {
            console.error('Erreur ajout témoignage:', erreur);
            this.$store.app.ajouterMessage('erreur', 'Erreur lors de l\'envoi du témoignage');
        } finally {
            this.chargementTemoignage = false;
        }
    },
    
    /**
     * Formate une date en français
     */
    formaterDate(date) {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    },
    
    /**
     * Formate la taille d'un fichier
     */
    formaterTailleFichier(octets) {
        if (!octets) return 'N/A';
        
        const unites = ['o', 'Ko', 'Mo', 'Go'];
        let taille = octets;
        let uniteIndex = 0;
        
        while (taille >= 1024 && uniteIndex < unites.length - 1) {
            taille /= 1024;
            uniteIndex++;
        }
        
        return `${Math.round(taille * 10) / 10} ${unites[uniteIndex]}`;
    },
    
    /**
     * Génère les étoiles pour une note
     */
    genererEtoiles(note) {
        const etoilesCompletes = '★'.repeat(note);
        const etoilesVides = '☆'.repeat(5 - note);
        return etoilesCompletes + etoilesVides;
    },
    
    /**
     * Partage un PDF sur les réseaux sociaux
     */
    partagerPdf(pdf) {
        if (navigator.share) {
            navigator.share({
                title: `Fiche ${pdf.personnage_nom} - ${pdf.systeme_jeu}`,
                text: `Découvrez cette fiche de personnage créée avec brumisater`,
                url: `${window.location.origin}/pdfs/${pdf.id}`
            });
        } else {
            // Fallback : copier le lien
            const url = `${window.location.origin}/pdfs/${pdf.id}`;
            navigator.clipboard.writeText(url).then(() => {
                this.$store.app.ajouterMessage('succes', 'Lien copié dans le presse-papier');
            });
        }
    },
    
    /**
     * Ouvre le lien de don dans un nouvel onglet
     */
    ouvrirLienDon() {
        if (this.infoDons?.url_don) {
            window.open(this.infoDons.url_don, '_blank');
        }
    },
    
    /**
     * Scrolle vers une section
     */
    scrollVersSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    },
    
    /**
     * Formate un nombre avec des suffixes (K, M)
     */
    formaterNombre(nombre) {
        if (!nombre) return '0';
        
        if (nombre >= 1000000) {
            return (nombre / 1000000).toFixed(1) + 'M';
        } else if (nombre >= 1000) {
            return (nombre / 1000).toFixed(0) + 'K';
        }
        
        return nombre.toString();
    }
});

// Composant pour la sélection de système (conservation de l'existant)
window.AlpineComponents.selectionSysteme = () => ({
    systemeSelectionne: null,
    
    naviguerVersSysteme(systeme) {
        this.systemeSelectionne = systeme;
        
        // Animation avant navigation
        if (window.navigationService) {
            window.navigationService.naviguerAvecAnimation(() => {
                window.navigationService.naviguerVersSysteme(systeme);
            });
        } else {
            // Fallback si le service n'est pas chargé
            setTimeout(() => {
                window.location.href = `/systemes/${systeme}`;
            }, 200);
        }
    }
});