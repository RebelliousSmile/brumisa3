/**
 * Composant Alpine.js pour la page mes-documents
 */
function mesDocuments() {
    return {
        // État
        ongletActif: 'pdfs',
        personnages: window.initialPersonnages || [],
        pdfs: window.initialPdfs || [],
        chargement: false,
        filtreSysteme: '',
        
        // Initialisation
        init() {
            // Les données sont déjà fournies par le contrôleur
            console.log('Personnages chargés:', this.personnages.length);
            console.log('PDFs chargés:', this.pdfs.length);
        },
        
        // Getters
        get personnagesFiltres() {
            if (!this.filtreSysteme) return this.personnages;
            return this.personnages.filter(p => p.systeme_jeu === this.filtreSysteme);
        },
        
        get pdfsFiltres() {
            if (!this.filtreSysteme) return this.pdfs;
            return this.pdfs.filter(p => p.systeme_jeu === this.filtreSysteme);
        },
        
        get systemesUtilises() {
            const systemesPersonnages = this.personnages.map(p => p.systeme_jeu);
            const systemesPdfs = this.pdfs.map(p => p.systeme_jeu);
            return [...new Set([...systemesPersonnages, ...systemesPdfs])].sort();
        },
        
        // Méthodes (plus besoin de charger les données via AJAX car fournies par le contrôleur)
        
        appliquerFiltres() {
            // Les getters se mettent à jour automatiquement
        },
        
        // Actions personnages
        async dupliquerPersonnage(personnageId) {
            try {
                const response = await fetch(`/api/personnages/${personnageId}/dupliquer`, {
                    method: 'POST'
                });
                if (!response.ok) throw new Error('Erreur lors de la duplication');
                
                if (window.Alpine && Alpine.store && Alpine.store('app')) {
                    Alpine.store('app').ajouterMessage('succes', 'Personnage dupliqué avec succès');
                }
                // Recharger la page pour récupérer les nouvelles données
                window.location.reload();
            } catch (erreur) {
                console.error('Erreur duplication:', erreur);
                if (window.Alpine && Alpine.store && Alpine.store('app')) {
                    Alpine.store('app').ajouterMessage('erreur', 'Erreur lors de la duplication');
                }
            }
        },
        
        async supprimerPersonnage(personnageId) {
            const personnage = this.personnages.find(p => p.id === personnageId);
            if (!confirm(`Êtes-vous sûr de vouloir supprimer "${personnage.nom}" ?`)) return;
            
            try {
                const response = await fetch(`/api/personnages/${personnageId}`, {
                    method: 'DELETE'
                });
                if (!response.ok) throw new Error('Erreur lors de la suppression');
                
                if (window.Alpine && Alpine.store && Alpine.store('app')) {
                    Alpine.store('app').ajouterMessage('succes', 'Personnage supprimé avec succès');
                }
                // Recharger la page pour récupérer les nouvelles données
                window.location.reload();
            } catch (erreur) {
                console.error('Erreur suppression:', erreur);
                if (window.Alpine && Alpine.store && Alpine.store('app')) {
                    Alpine.store('app').ajouterMessage('erreur', 'Erreur lors de la suppression');
                }
            }
        },
        
        // Actions PDFs
        async telechargerPdf(pdfId) {
            try {
                window.open(`/api/pdfs/${pdfId}/telecharger`, '_blank');
            } catch (erreur) {
                console.error('Erreur téléchargement:', erreur);
            }
        },
        
        async relancerPdf(pdfId) {
            try {
                const response = await fetch(`/api/pdfs/${pdfId}/relancer`, {
                    method: 'POST'
                });
                if (!response.ok) throw new Error('Erreur lors de la relance');
                
                if (window.Alpine && Alpine.store && Alpine.store('app')) {
                    Alpine.store('app').ajouterMessage('succes', 'Génération PDF relancée');
                }
                // Recharger la page pour récupérer les nouvelles données
                window.location.reload();
            } catch (erreur) {
                console.error('Erreur relance:', erreur);
                if (window.Alpine && Alpine.store && Alpine.store('app')) {
                    Alpine.store('app').ajouterMessage('erreur', 'Erreur lors de la relance');
                }
            }
        },
        
        async supprimerPdf(pdfId) {
            const pdf = this.pdfs.find(p => p.id === pdfId);
            if (!confirm(`Êtes-vous sûr de vouloir supprimer ce PDF ?`)) return;
            
            try {
                const response = await fetch(`/api/pdfs/${pdfId}`, {
                    method: 'DELETE'
                });
                if (!response.ok) throw new Error('Erreur lors de la suppression');
                
                if (window.Alpine && Alpine.store && Alpine.store('app')) {
                    Alpine.store('app').ajouterMessage('succes', 'PDF supprimé avec succès');
                }
                // Recharger la page pour récupérer les nouvelles données
                window.location.reload();
            } catch (erreur) {
                console.error('Erreur suppression:', erreur);
                if (window.Alpine && Alpine.store && Alpine.store('app')) {
                    Alpine.store('app').ajouterMessage('erreur', 'Erreur lors de la suppression');
                }
            }
        },
        
        // Utilitaires
        getStatutClass(statut) {
            const classes = {
                'EN_ATTENTE': 'bg-yellow-900/20 text-yellow-400 border border-yellow-700',
                'EN_COURS': 'bg-blue-900/20 text-blue-400 border border-blue-700',
                'TERMINE': 'bg-green-900/20 text-green-400 border border-green-700',
                'ECHEC': 'bg-red-900/20 text-red-400 border border-red-700'
            };
            return classes[statut] || 'bg-gray-800 text-gray-400 border border-gray-600';
        },
        
        formatTaille(taille) {
            if (!taille) return '';
            const ko = taille / 1024;
            if (ko < 1024) return `${ko.toFixed(1)} Ko`;
            return `${(ko / 1024).toFixed(1)} Mo`;
        }
    };
}

// Enregistrer le composant globalement
window.mesDocuments = mesDocuments;