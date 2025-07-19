// ========================================
// Composant tableau de bord et navigation
// ========================================

// Initialisation du namespace
window.AlpineComponents = window.AlpineComponents || {};

/**
 * Composant pour le tableau de bord
 */
window.AlpineComponents.tableauBord = () => ({
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
                const [statsPersonnages, statsPdfs] = await Promise.all([
                    window.personnageService.obtenirStatistiques(),
                    window.pdfService.obtenirStatistiques()
                ]);
                
                this.stats = {
                    totalPersonnages: statsPersonnages.total || 0,
                    totalPdfs: statsPdfs.total || 0,
                    parSysteme: statsPersonnages.parSysteme || {}
                };
            } catch (erreur) {
                console.error('Erreur chargement stats:', erreur);
            }
        },
        
        async chargerActiviteRecente() {
            try {
                if (Alpine.store && Alpine.store('app')) {
                    const data = await Alpine.store('app').requeteApi('/activite-recente');
                    this.activiteRecente = data.donnees || [];
                }
            } catch (erreur) {
                console.error('Erreur chargement activité:', erreur);
            }
        },
        
        // Getters
        get systemesAvecStats() {
            if (!Alpine.store || !Alpine.store('app')) return [];
            return Object.entries(this.stats.parSysteme).map(([systeme, nombre]) => ({
                systeme,
                nom: Alpine.store('app').obtenirNomSysteme(systeme),
                couleur: Alpine.store('app').obtenirCouleurSysteme(systeme),
                nombre
            }));
        },
        
        get utilisateurActuel() {
            return Alpine.store && Alpine.store('app') ? Alpine.store('app').utilisateur : null;
        }
});

/**
 * Composant pour la navigation mobile (déjà défini dans app.js)
 */
// window.AlpineComponents.navigationMobile est déjà défini dans app.js

/**
 * Composant pour l'indicateur de progression
 */
window.AlpineComponents.indicateurProgression = () => ({
    get progression() {
        return Alpine.store && Alpine.store('navigation') ? Alpine.store('navigation').progressPercent : 0;
    },
    
    get sectionActuelle() {
        return Alpine.store && Alpine.store('navigation') ? Alpine.store('navigation').currentSection : '';
    },
    
    get sectionsLabels() {
        return {
            'infos-base': 'Informations',
            'attributs': 'Attributs',
            'competences': 'Compétences',
            'equipement': 'Équipement',
            'notes': 'Notes'
        };
    },
    
    allerASection(sectionId) {
        if (Alpine.store && Alpine.store('navigation')) {
            Alpine.store('navigation').goToSection(sectionId);
        }
    }
});

/**
 * Composant pour les messages flash (déjà défini dans app.js)
 */
// window.AlpineComponents.messagesFlash est déjà défini dans app.js

/**
 * Composant pour l'indicateur hors ligne (déjà défini dans app.js)
 */
// window.AlpineComponents.indicateurHorsLigne est déjà défini dans app.js

/**
 * Composant pour la preview HTML
 */
function previewHtml(personnageId) {
    return {
        personnageId,
        contenuHtml: '',
        chargement: false,
        erreur: null,
        
        async init() {
            await this.genererPreview();
        },
        
        async genererPreview() {
            this.chargement = true;
            this.erreur = null;
            
            try {
                const data = await window.pdfService.genererPreviewHtml(this.personnageId);
                this.contenuHtml = data.html;
            } catch (erreur) {
                console.error('Erreur génération preview:', erreur);
                this.erreur = 'Impossible de générer l\'aperçu';
            } finally {
                this.chargement = false;
            }
        },
        
        async rafraichir() {
            await this.genererPreview();
        },
        
        async genererPdf() {
            try {
                const pdf = await window.pdfService.generer(this.personnageId);
                window.location.href = `/pdfs/${pdf.id}`;
            } catch (erreur) {
                console.error('Erreur génération PDF:', erreur);
            }
        }
    };
}

/**
 * Composant pour le partage de documents
 */
function partageDocument(documentId) {
    return {
        documentId,
        lienPartage: '',
        qrCode: '',
        chargement: false,
        
        async genererLien() {
            this.chargement = true;
            
            try {
                const data = await Alpine.store('partage').genererLienPartage(this.documentId);
                this.lienPartage = data.lien;
                this.qrCode = data.qrCode;
            } catch (erreur) {
                console.error('Erreur génération lien partage:', erreur);
            } finally {
                this.chargement = false;
            }
        },
        
        copierLien() {
            Alpine.store('partage').copierLien();
        },
        
        partagerEmail() {
            const sujet = encodeURIComponent('Fiche de personnage JDR');
            const corps = encodeURIComponent(`Voici ma fiche de personnage : ${this.lienPartage}`);
            window.location.href = `mailto:?subject=${sujet}&body=${corps}`;
        },
        
        partagerWhatsApp() {
            const texte = encodeURIComponent(`Voici ma fiche de personnage : ${this.lienPartage}`);
            window.open(`https://wa.me/?text=${texte}`, '_blank');
        }
    };
}

/**
 * Composant pour la navigation formulaire mobile
 */
function navigationFormulaire() {
    return {
        get peutPrecedent() {
            const sections = ['infos-base', 'attributs', 'competences', 'equipement', 'notes'];
            const currentIndex = sections.indexOf(Alpine.store('navigation').currentSection);
            return currentIndex > 0;
        },
        
        get peutSuivant() {
            const sections = ['infos-base', 'attributs', 'competences', 'equipement', 'notes'];
            const currentIndex = sections.indexOf(Alpine.store('navigation').currentSection);
            return currentIndex < sections.length - 1;
        },
        
        precedent() {
            if (this.peutPrecedent) {
                Alpine.store('navigation').prevSection();
            }
        },
        
        suivant() {
            if (this.peutSuivant) {
                Alpine.store('navigation').nextSection();
            }
        },
        
        get labelBoutonSuivant() {
            return this.peutSuivant ? 'Suivant' : 'Terminer';
        }
    };
}

/**
 * Composant pour les actions flottantes (FAB)
 */
function actionFlottante(type = 'apercu') {
    return {
        type,
        visible: true,
        
        get icone() {
            const icones = {
                'apercu': '👁️',
                'sauvegarder': '💾',
                'aide': '❓',
                'partager': '📤'
            };
            return icones[this.type] || '⭐';
        },
        
        get label() {
            const labels = {
                'apercu': 'Aperçu',
                'sauvegarder': 'Sauvegarder',
                'aide': 'Aide',
                'partager': 'Partager'
            };
            return labels[this.type] || 'Action';
        },
        
        cliquer() {
            // Émettre un événement personnalisé
            this.$dispatch('fab-click', { type: this.type });
        }
    };
}

// Composants déjà définis dans le namespace window.AlpineComponents ci-dessus