// ========================================
// Service métier PDFs - Frontend
// ========================================

class PdfService {
    constructor() {
        this.store = null;
    }
    
    // Initialise le store Alpine si pas encore fait
    initStore() {
        if (!this.store && typeof Alpine !== 'undefined') {
            this.store = Alpine.store('app');
        }
        return this.store;
    }
    
    /**
     * Liste les PDFs de l'utilisateur
     */
    async lister(filtres = {}) {
        try {
            const store = this.initStore();
            if (!store) throw new Error('Alpine store not available');
            
            const params = new URLSearchParams(filtres);
            const data = await store.requeteApi(`/pdfs?${params}`);
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
        try {
            const store = this.initStore();
            if (!store) throw new Error('Alpine store not available');
            
            const data = await store.requeteApi(`/pdfs/${id}`);
            return data.donnees;
        } catch (erreur) {
            console.error('Erreur récupération PDF:', erreur);
            return null;
        }
    }
    
    /**
     * Génère un PDF
     */
    async generer(personnageId, options = {}) {
        try {
            const store = this.initStore();
            if (!store) throw new Error('Alpine store not available');
            
            const data = await store.requeteApi('/pdfs/generer', {
                method: 'POST',
                body: JSON.stringify({
                    personnage_id: personnageId,
                    ...options
                })
            });
            store.ajouterMessage('succes', 'Génération PDF démarrée');
            return data.donnees;
        } catch (erreur) {
            console.error('Erreur génération PDF:', erreur);
            throw erreur;
        }
    }
    
    /**
     * Vérifie le statut de génération d'un PDF
     */
    async verifierStatut(id) {
        try {
            const store = this.initStore();
            if (!store) throw new Error('Alpine store not available');
            
            const data = await store.requeteApi(`/pdfs/${id}/statut`);
            return data.donnees;
        } catch (erreur) {
            console.error('Erreur vérification statut PDF:', erreur);
            return null;
        }
    }
    
    /**
     * Télécharge un PDF
     */
    async telecharger(id) {
        try {
            const store = this.initStore();
            if (!store) throw new Error('Alpine store not available');
            
            const response = await fetch(`${store.config.apiUrl}/pdfs/${id}/telecharger`);
            
            if (!response.ok) {
                throw new Error('Erreur lors du téléchargement');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `personnage-${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            store.ajouterMessage('succes', 'PDF téléchargé avec succès');
            return true;
        } catch (erreur) {
            console.error('Erreur téléchargement PDF:', erreur);
            const store = this.initStore();
            if (store) store.ajouterMessage('erreur', 'Erreur lors du téléchargement');
            throw erreur;
        }
    }
    
    /**
     * Supprime un PDF
     */
    async supprimer(id) {
        try {
            const store = this.initStore();
            if (!store) throw new Error('Alpine store not available');
            
            await store.requeteApi(`/pdfs/${id}`, {
                method: 'DELETE'
            });
            store.ajouterMessage('succes', 'PDF supprimé');
            return true;
        } catch (erreur) {
            console.error('Erreur suppression PDF:', erreur);
            throw erreur;
        }
    }
    
    /**
     * Bascule la visibilité d'un PDF (public/privé)
     */
    async basculerVisibilite(id) {
        try {
            const store = this.initStore();
            if (!store) throw new Error('Alpine store not available');
            
            const data = await store.requeteApi(`/pdfs/${id}/basculer-visibilite`, {
                method: 'POST'
            });
            store.ajouterMessage('succes', 'Visibilité mise à jour');
            return data.donnees;
        } catch (erreur) {
            console.error('Erreur changement visibilité:', erreur);
            throw erreur;
        }
    }
    
    /**
     * Partage un PDF
     */
    async partager(id, options = {}) {
        try {
            const store = this.initStore();
            if (!store) throw new Error('Alpine store not available');
            
            const data = await store.requeteApi(`/pdfs/${id}/partager`, {
                method: 'POST',
                body: JSON.stringify(options)
            });
            return data.donnees;
        } catch (erreur) {
            console.error('Erreur partage PDF:', erreur);
            throw erreur;
        }
    }
    
    /**
     * Obtient l'aperçu d'un PDF
     */
    async obtenirApercu(id) {
        try {
            const store = this.initStore();
            if (!store) throw new Error('Alpine store not available');
            
            const data = await store.requeteApi(`/pdfs/${id}/apercu`);
            return data.donnees;
        } catch (erreur) {
            console.error('Erreur aperçu PDF:', erreur);
            return null;
        }
    }
    
    /**
     * Copie le lien de partage
     */
    copierLienPartage(id) {
        const url = `${window.location.origin}/pdfs/${id}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url).then(() => {
                const store = this.initStore();
                if (store) store.ajouterMessage('succes', 'Lien copié dans le presse-papier');
            });
        } else {
            // Fallback pour les navigateurs plus anciens
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            const store = this.initStore();
            if (store) store.ajouterMessage('succes', 'Lien copié dans le presse-papier');
        }
    }
    
    /**
     * Formate la taille d'un fichier
     */
    formaterTaille(octets) {
        if (!octets) return 'N/A';
        
        const unites = ['o', 'Ko', 'Mo', 'Go'];
        let taille = octets;
        let uniteIndex = 0;
        
        while (taille >= 1024 && uniteIndex < unites.length - 1) {
            taille /= 1024;
            uniteIndex++;
        }
        
        return `${Math.round(taille * 10) / 10} ${unites[uniteIndex]}`;
    }
    
    /**
     * Formate le statut d'un PDF
     */
    formaterStatut(statut) {
        const statuts = {
            'EN_ATTENTE': { texte: 'En attente', classe: 'text-yellow-600 bg-yellow-100' },
            'EN_TRAITEMENT': { texte: 'En cours', classe: 'text-blue-600 bg-blue-100' },
            'TERMINE': { texte: 'Terminé', classe: 'text-green-600 bg-green-100' },
            'ECHEC': { texte: 'Échec', classe: 'text-red-600 bg-red-100' }
        };
        
        return statuts[statut] || { texte: statut, classe: 'text-gray-600 bg-gray-100' };
    }
    
    /**
     * Surveillance du statut de génération
     */
    async surveillerGeneration(id, callback, options = {}) {
        const maxTentatives = options.maxTentatives || 30;
        const intervalle = options.intervalle || 2000; // 2 secondes
        let tentatives = 0;
        
        const verifier = async () => {
            try {
                const statut = await this.verifierStatut(id);
                
                if (callback) {
                    callback(statut);
                }
                
                if (statut?.statut === 'TERMINE' || statut?.statut === 'ECHEC') {
                    return statut;
                }
                
                if (tentatives < maxTentatives) {
                    tentatives++;
                    setTimeout(verifier, intervalle);
                } else {
                    const store = this.initStore();
                    if (store) store.ajouterMessage('avertissement', 'Délai de génération dépassé');
                }
            } catch (erreur) {
                console.error('Erreur surveillance génération:', erreur);
            }
        };
        
        // Démarrer la surveillance
        setTimeout(verifier, intervalle);
    }
    
    /**
     * Statistiques des PDFs
     */
    async obtenirStatistiques() {
        try {
            const store = this.initStore();
            if (!store) return {};
            
            const data = await store.requeteApi('/pdfs/statistiques');
            return data.donnees || {};
        } catch (erreur) {
            console.error('Erreur statistiques PDFs:', erreur);
            return {};
        }
    }
    
    /**
     * Nettoie les PDFs expirés (côté client)
     */
    async nettoyerExpires() {
        try {
            const store = this.initStore();
            if (!store) return false;
            
            const data = await store.requeteApi('/pdfs/nettoyer-expires', {
                method: 'POST'
            });
            return data.succes;
        } catch (erreur) {
            console.error('Erreur nettoyage PDFs expirés:', erreur);
            return false;
        }
    }
}

// Instance globale
window.pdfService = new PdfService();