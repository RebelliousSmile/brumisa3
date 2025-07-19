// ========================================
// Service métier PDFs - Frontend
// ========================================

class PdfService {
    constructor() {
        this.store = Alpine.store('app');
    }
    
    /**
     * Liste les PDFs de l'utilisateur
     */
    async lister(filtres = {}) {
        try {
            const params = new URLSearchParams(filtres);
            const data = await this.store.requeteApi(`/pdfs?${params}`);
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
     * Démarre la génération d'un PDF
     */
    async generer(personnageId, options = {}) {
        const data = await this.store.requeteApi('/pdfs/generer', {
            method: 'POST',
            body: JSON.stringify({
                personnage_id: personnageId,
                type_pdf: options.type || 'fiche_personnage',
                options_generation: options
            })
        });
        
        this.store.ajouterMessage('succes', 'Génération PDF démarrée');
        return data.donnees;
    }
    
    /**
     * Vérifie le statut de génération d'un PDF
     */
    async verifierStatut(pdfId) {
        const data = await this.store.requeteApi(`/pdfs/${pdfId}/statut`);
        return data.donnees;
    }
    
    /**
     * Télécharge un PDF
     */
    telecharger(id, nomFichier) {
        const lien = document.createElement('a');
        lien.href = `/api/pdfs/${id}/telecharger`;
        lien.download = nomFichier || `document_${id}.pdf`;
        document.body.appendChild(lien);
        lien.click();
        document.body.removeChild(lien);
        
        this.store.ajouterMessage('succes', 'Téléchargement démarré');
    }
    
    /**
     * Obtient l'URL de preview d'un PDF
     */
    obtenirUrlPreview(id) {
        return `/api/pdfs/${id}/preview`;
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
     * Obtient le statut d'un PDF avec style visuel
     */
    obtenirStatutTexte(statut) {
        const statuts = {
            'EN_ATTENTE': { 
                texte: 'En attente', 
                classe: 'bg-yellow-100 text-yellow-800',
                icone: '⏳'
            },
            'EN_TRAITEMENT': { 
                texte: 'En cours', 
                classe: 'bg-blue-100 text-blue-800',
                icone: '⚙️'
            },
            'TERMINE': { 
                texte: 'Terminé', 
                classe: 'bg-green-100 text-green-800',
                icone: '✅'
            },
            'ECHEC': { 
                texte: 'Échec', 
                classe: 'bg-red-100 text-red-800',
                icone: '❌'
            },
            'EXPIRE': { 
                texte: 'Expiré', 
                classe: 'bg-gray-100 text-gray-800',
                icone: '🕒'
            }
        };
        
        return statuts[statut] || { 
            texte: statut, 
            classe: 'bg-gray-100 text-gray-800',
            icone: '❓'
        };
    }
    
    /**
     * Polling pour suivre le statut de génération
     */
    async suivreGeneration(pdfId, callback, intervalMs = 2000) {
        const interval = setInterval(async () => {
            try {
                const statut = await this.verifierStatut(pdfId);
                callback(statut);
                
                // Arrêter le polling si terminé ou en échec
                if (['TERMINE', 'ECHEC', 'EXPIRE'].includes(statut.statut)) {
                    clearInterval(interval);
                }
            } catch (erreur) {
                console.error('Erreur vérification statut PDF:', erreur);
                clearInterval(interval);
            }
        }, intervalMs);
        
        return interval;
    }
    
    /**
     * Génère un aperçu HTML (pas PDF) pour preview rapide
     */
    async genererPreviewHtml(personnageId, options = {}) {
        const data = await this.store.requeteApi('/pdfs/preview-html', {
            method: 'POST',
            body: JSON.stringify({
                personnage_id: personnageId,
                options
            })
        });
        
        return data.donnees;
    }
    
    /**
     * Partage un PDF via lien temporaire
     */
    async genererLienPartage(pdfId, dureeHeures = 24) {
        const data = await this.store.requeteApi(`/pdfs/${pdfId}/partager`, {
            method: 'POST',
            body: JSON.stringify({
                duree_heures: dureeHeures
            })
        });
        
        return data.donnees;
    }
    
    /**
     * Obtient les statistiques de PDFs générés
     */
    async obtenirStatistiques() {
        try {
            const data = await this.store.requeteApi('/pdfs/statistiques');
            return data.donnees;
        } catch (erreur) {
            console.error('Erreur chargement statistiques PDF:', erreur);
            return {
                total: 0,
                parStatut: {},
                parType: {}
            };
        }
    }
    
    /**
     * Obtient les types de PDF disponibles pour un système
     */
    obtenirTypesPdf(systeme) {
        const types = {
            'fiche_personnage': {
                nom: 'Fiche de personnage',
                description: 'Fiche complète du personnage',
                icone: '👤'
            },
            'fiche_pnj': {
                nom: 'Fiche PNJ',
                description: 'Fiche simplifiée pour PNJ',
                icone: '🎭'
            },
            'carte_reference': {
                nom: 'Carte de référence',
                description: 'Aide-mémoire des règles',
                icone: '📇'
            },
            'guide_moves': {
                nom: 'Guide des actions',
                description: 'Liste des actions disponibles',
                icone: '📖'
            },
            'suivi_conditions': {
                nom: 'Suivi des conditions',
                description: 'États et conditions du personnage',
                icone: '📊'
            },
            'notes_session': {
                nom: 'Notes de session',
                description: 'Notes pour la partie',
                icone: '📝'
            }
        };
        
        // Filtrer selon le système si nécessaire
        if (systeme === 'monsterhearts') {
            return {
                'fiche_personnage': types.fiche_personnage,
                'guide_moves': types.guide_moves,
                'suivi_conditions': types.suivi_conditions
            };
        }
        
        return types;
    }
    
    /**
     * Formate la taille de fichier
     */
    formaterTailleFichier(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Instance globale
window.pdfService = new PdfService();