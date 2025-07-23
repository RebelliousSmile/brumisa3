// ========================================
// Composants Alpine personnages
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
                this.personnagesFiltres = this.personnages.filter(p => p.systeme_jeu === this.filtreSysteme);
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
                    acc[p.systeme_jeu] = (acc[p.systeme_jeu] || 0) + 1;
                    return acc;
                }, {})
            };
        }
    };
}

/**
 * Composant pour la sélection de système (landing page)
 */
function selectionSysteme() {
    return {
        systemes: Alpine.store('app').systemes,
        
        init() {
            // Animation d'entrée des cartes
            this.$nextTick(() => {
                const cartes = this.$el.querySelectorAll('[data-carte-systeme]');
                cartes.forEach((carte, index) => {
                    carte.style.animationDelay = `${index * 100}ms`;
                    carte.classList.add('animate-fade-in-up');
                });
            });
        },
        
        naviguerVersSysteme(systemeId) {
            // Utiliser le service de navigation centralisé
            if (window.navigationService) {
                window.navigationService.naviguerVersSysteme(systemeId);
            } else {
                // Fallback si le service n'est pas chargé
                window.location.href = `/systemes/${systemeId}`;
            }
        }
    };
}

/**
 * Composant pour la sélection du type de document
 */
function choixTypeDocument(systeme) {
    return {
        systeme,
        typesDocuments: [
            {
                id: 'fiche-personnage',
                nom: 'Fiche de personnage',
                description: 'Créez une fiche complète pour votre personnage',
                icone: '👤',
                url: `/${systeme}/fiche-personnage`
            },
            {
                id: 'plan-classe',
                nom: 'Plan de classe/groupe',
                description: 'Organisez votre groupe de joueurs',
                icone: '👥',
                url: `/${systeme}/plan-classe`
            },
            {
                id: 'cadre-campagne',
                nom: 'Cadre de campagne',
                description: 'Définissez l\'univers de votre campagne',
                icone: '🗺️',
                url: `/${systeme}/cadre-campagne`
            },
            {
                id: 'aide-jeu',
                nom: 'Aide de jeu',
                description: 'Créez des aides-mémoire personnalisées',
                icone: '📖',
                url: `/${systeme}/aide-jeu`
            }
        ],
        
        naviguerVersType(typeId) {
            const type = this.typesDocuments.find(t => t.id === typeId);
            if (type) {
                window.location.href = type.url;
            }
        }
    };
}

/**
 * Composant pour le choix du mode de création
 */
function choixModeCreation(systeme, typeDocument) {
    return {
        systeme,
        typeDocument,
        modes: [
            {
                id: 'scratch',
                nom: 'Créer de zéro',
                description: 'Commencez avec un formulaire vierge',
                icone: '✨',
                populaire: false
            },
            {
                id: 'template',
                nom: 'Partir d\'un exemple',
                description: 'Utilisez un modèle pré-rempli',
                icone: '📋',
                populaire: true
            },
            {
                id: 'wizard',
                nom: 'Assistant guidé',
                description: 'Laissez-vous guider étape par étape',
                icone: '🧙‍♂️',
                populaire: false
            }
        ],
        
        demarrerCreation(modeId) {
            const url = `/${this.systeme}/${this.typeDocument}/creation?mode=${modeId}`;
            window.location.href = url;
        }
    };
}

/**
 * Composant pour la création de personnage
 */
function creationPersonnage(systeme, templateSysteme, mode = 'scratch') {
    return {
        // État
        systeme,
        templateSysteme,
        mode,
        enTraitement: false,
        erreurs: [],
        sauvegardeAuto: true,
        
        // Formulaire
        formulaire: {
            nom: '',
            systeme_jeu: systeme,
            attributs: {},
            competences: {},
            avantages: {},
            equipement: {},
            historique: {},
            notes: ''
        },
        
        // Initialisation
        init() {
            this.initialiserFormulaire();
            this.configurerSauvegardeAuto();
            this.chargerBrouillonLocal();
        },
        
        // Méthodes
        initialiserFormulaire() {
            // Initialiser les attributs avec valeurs par défaut
            if (this.templateSysteme.attributs) {
                Object.entries(this.templateSysteme.attributs).forEach(([nom, config]) => {
                    this.formulaire.attributs[nom] = config.defaut || config.min || 0;
                });
            }
            
            // Charger template si mode template
            if (this.mode === 'template') {
                this.chargerTemplate();
            }
        },
        
        async chargerTemplate() {
            try {
                const template = await window.personnageService.obtenirTemplate(this.systeme);
                if (template) {
                    this.formulaire = { ...this.formulaire, ...template };
                }
            } catch (erreur) {
                console.error('Erreur chargement template:', erreur);
            }
        },
        
        configurerSauvegardeAuto() {
            if (this.sauvegardeAuto) {
                // Watcher pour auto-sauvegarde
                this.$watch('formulaire', () => {
                    Alpine.store('navigation').markDirty();
                    this.planifierSauvegardeAuto();
                }, { deep: true });
            }
        },
        
        planifierSauvegardeAuto() {
            clearTimeout(this.autoSaveTimeout);
            this.autoSaveTimeout = setTimeout(() => {
                this.sauvegarderAuto();
            }, 3000);
        },
        
        async sauvegarderAuto() {
            if (this.formulaire.nom.trim().length > 0) {
                try {
                    await window.personnageService.sauvegarderBrouillon(this.formulaire);
                } catch (erreur) {
                    // Sauvegarde locale en cas d'erreur
                    Alpine.store('creation').sauvegarderLocalement(this.formulaire);
                }
            }
        },
        
        chargerBrouillonLocal() {
            const brouillons = Alpine.store('creation').getFormulaireSauvegardes();
            const brouillonSysteme = brouillons.find(b => b.data.systeme_jeu === this.systeme);
            
            if (brouillonSysteme && confirm('Un brouillon a été trouvé. Voulez-vous le récupérer ?')) {
                this.formulaire = { ...this.formulaire, ...brouillonSysteme.data };
            }
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
                
                // Nettoyer la sauvegarde locale
                Alpine.store('creation').supprimerLocal(`formulaire_${this.systeme}`);
                Alpine.store('navigation').markClean();
                
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
                const todsPdfs = await window.pdfService.lister();
                this.pdfs = todsPdfs.filter(pdf => pdf.personnage_id === this.personnage.id);
            } catch (erreur) {
                console.error('Erreur chargement PDFs:', erreur);
            } finally {
                this.chargementPdfs = false;
            }
        },
        
        async genererPdf(typePdf = 'fiche_personnage') {
            try {
                const pdf = await window.personnageService.genererPdf(this.personnage.id, { type: typePdf });
                
                // Démarrer le suivi de génération
                window.pdfService.suivreGeneration(pdf.id, (statut) => {
                    if (statut.statut === 'TERMINE') {
                        Alpine.store('app').ajouterMessage('succes', 'PDF généré avec succès');
                        this.chargerPdfs(); // Recharger la liste
                    } else if (statut.statut === 'ECHEC') {
                        Alpine.store('app').ajouterMessage('erreur', 'Erreur lors de la génération PDF');
                    }
                });
                
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
                window.location.href = '/mes-documents';
            } catch (erreur) {
                console.error('Erreur suppression:', erreur);
            }
        }
    };
}

// ========================================
// Enregistrement global des composants
// ========================================
window.AlpineComponents = window.AlpineComponents || {};
Object.assign(window.AlpineComponents, {
    listePersonnages,
    selectionSysteme,
    choixTypeDocument,
    choixModeCreation,
    creationPersonnage,
    fichePersonnage
});