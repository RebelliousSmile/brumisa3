// ========================================
// Composant tableau de bord et navigation
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
        },
        
        get utilisateurActuel() {
            return Alpine.store('app').utilisateur;
        }
    };
}

/**
 * Composant pour la navigation mobile
 */
function navigationMobile() {
    return {
        menuOuvert: false,
        
        init() {
            // Écouter les changements du store
            this.$watch(() => Alpine.store('navigation').menuMobileOuvert, 
                       (value) => this.menuOuvert = value);
        },
        
        basculerMenu() {
            Alpine.store('navigation').basculerMenuMobile();
        },
        
        fermerMenu() {
            Alpine.store('navigation').fermerMenuMobile();
        },
        
        naviguer(url) {
            this.fermerMenu();
            window.location.href = url;
        }
    };
}

/**
 * Composant pour l'indicateur de progression
 */
function indicateurProgression() {
    return {
        get progression() {
            return Alpine.store('navigation').progressPercent;
        },
        
        get sectionActuelle() {
            return Alpine.store('navigation').currentSection;
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
            Alpine.store('navigation').goToSection(sectionId);
        }
    };
}

/**
 * Composant pour les messages flash
 */
function messagesFlash() {
    return {
        get messages() {
            return Alpine.store('app').messages;
        },
        
        supprimerMessage(id) {
            Alpine.store('app').supprimerMessage(id);
        },
        
        obtenirIcone(type) {
            const icones = {
                'succes': '✅',
                'erreur': '❌',
                'avertissement': '⚠️',
                'info': 'ℹ️'
            };
            return icones[type] || 'ℹ️';
        }
    };
}

/**
 * Composant pour l'indicateur hors ligne
 */
function indicateurHorsLigne() {
    return {
        get isOffline() {
            return Alpine.store('navigation').isOffline;
        },
        
        get hasUnsavedChanges() {
            return Alpine.store('navigation').hasUnsavedChanges;
        }
    };
}

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

// ========================================
// Enregistrement global des composants
// ========================================
window.AlpineComponents = window.AlpineComponents || {};
Object.assign(window.AlpineComponents, {
    tableauBord,
    navigationMobile,
    indicateurProgression,
    messagesFlash,
    indicateurHorsLigne,
    previewHtml,
    partageDocument,
    navigationFormulaire,
    actionFlottante
});