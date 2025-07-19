// ========================================
// Service métier personnages - Frontend
// ========================================

class PersonnageService {
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
     * Liste les personnages de l'utilisateur
     */
    async lister(filtres = {}) {
        try {
            const store = this.initStore();
            if (!store) throw new Error('Alpine store not available');
            
            const params = new URLSearchParams(filtres);
            const data = await store.requeteApi(`/personnages?${params}`);
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
        try {
            const store = this.initStore();
            if (!store) throw new Error('Alpine store not available');
            
            const data = await store.requeteApi(`/personnages/${id}`);
            return data.donnees;
        } catch (erreur) {
            console.error('Erreur récupération personnage:', erreur);
            return null;
        }
    }
    
    /**
     * Crée un nouveau personnage
     */
    async creer(donnees) {
        try {
            const store = this.initStore();
            if (!store) throw new Error('Alpine store not available');
            
            const data = await store.requeteApi('/personnages', {
                method: 'POST',
                body: JSON.stringify(donnees)
            });
            store.ajouterMessage('succes', 'Personnage créé avec succès');
            return data.donnees;
        } catch (erreur) {
            console.error('Erreur création personnage:', erreur);
            throw erreur;
        }
    }
    
    /**
     * Met à jour un personnage
     */
    async mettreAJour(id, donnees) {
        try {
            const store = this.initStore();
            if (!store) throw new Error('Alpine store not available');
            
            const data = await store.requeteApi(`/personnages/${id}`, {
                method: 'PUT',
                body: JSON.stringify(donnees)
            });
            store.ajouterMessage('succes', 'Personnage mis à jour');
            return data.donnees;
        } catch (erreur) {
            console.error('Erreur mise à jour personnage:', erreur);
            throw erreur;
        }
    }
    
    /**
     * Duplique un personnage
     */
    async dupliquer(id) {
        try {
            const store = this.initStore();
            if (!store) throw new Error('Alpine store not available');
            
            const data = await store.requeteApi(`/personnages/${id}/dupliquer`, {
                method: 'POST'
            });
            store.ajouterMessage('succes', 'Personnage dupliqué avec succès');
            return data.donnees;
        } catch (erreur) {
            console.error('Erreur duplication personnage:', erreur);
            throw erreur;
        }
    }
    
    /**
     * Supprime un personnage
     */
    async supprimer(id) {
        try {
            const store = this.initStore();
            if (!store) throw new Error('Alpine store not available');
            
            await store.requeteApi(`/personnages/${id}`, {
                method: 'DELETE'
            });
            store.ajouterMessage('succes', 'Personnage supprimé');
            return true;
        } catch (erreur) {
            console.error('Erreur suppression personnage:', erreur);
            throw erreur;
        }
    }
    
    /**
     * Génère un PDF pour le personnage
     */
    async genererPdf(id, options = {}) {
        try {
            const store = this.initStore();
            if (!store) throw new Error('Alpine store not available');
            
            const data = await store.requeteApi(`/personnages/${id}/pdf`, {
                method: 'POST',
                body: JSON.stringify(options)
            });
            store.ajouterMessage('succes', 'Génération PDF démarrée');
            return data.donnees;
        } catch (erreur) {
            console.error('Erreur génération PDF:', erreur);
            throw erreur;
        }
    }
    
    /**
     * Sauvegarde automatique (brouillon)
     */
    async sauvegardeAuto(donnees) {
        try {
            const store = this.initStore();
            if (!store) return false;
            
            const data = await store.requeteApi('/personnages/brouillon', {
                method: 'POST',
                body: JSON.stringify(donnees)
            });
            return data.succes;
        } catch (erreur) {
            console.error('Erreur sauvegarde auto:', erreur);
            return false;
        }
    }
    
    /**
     * Récupère les brouillons sauvegardés
     */
    async obtenirBrouillons() {
        try {
            const store = this.initStore();
            if (!store) return [];
            
            const data = await store.requeteApi('/personnages/brouillons');
            return data.donnees || [];
        } catch (erreur) {
            console.error('Erreur récupération brouillons:', erreur);
            return [];
        }
    }
    
    /**
     * Valide les données d'un personnage selon son système
     */
    validerDonnees(donnees, systeme) {
        const store = this.initStore();
        if (!systeme || !store?.systemes?.[systeme]) {
            return { valide: false, erreurs: ['Système de jeu non spécifié ou invalide'] };
        }
        
        const erreurs = [];
        
        if (systeme && store.systemes[systeme]) {
            const template = store.systemes[systeme];
            
            // Validation des champs obligatoires
            if (template.champsObligatoires) {
                template.champsObligatoires.forEach(champ => {
                    if (!donnees[champ] || donnees[champ].toString().trim() === '') {
                        erreurs.push(`Le champ "${champ}" est obligatoire`);
                    }
                });
            }
            
            // Validation des formats
            if (donnees.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donnees.email)) {
                erreurs.push('Format d\'email invalide');
            }
        }
        
        return {
            valide: erreurs.length === 0,
            erreurs
        };
    }
    
    /**
     * Formatage des données selon le système
     */
    formaterDonnees(donnees, systeme) {
        const store = this.initStore();
        if (!store?.systemes?.[systeme]) return donnees;
        
        const systemConfig = store.systemes[systeme];
        const donneesFormatees = { ...donnees };
        
        // Formatage des nombres
        if (systemConfig.champsNumeriques) {
            systemConfig.champsNumeriques.forEach(champ => {
                if (donneesFormatees[champ] !== undefined) {
                    donneesFormatees[champ] = parseInt(donneesFormatees[champ]) || 0;
                }
            });
        }
        
        // Formatage des booléens
        if (systemConfig.champsBooleans) {
            systemConfig.champsBooleans.forEach(champ => {
                if (donneesFormatees[champ] !== undefined) {
                    donneesFormatees[champ] = Boolean(donneesFormatees[champ]);
                }
            });
        }
        
        // Ajout des métadonnées
        donneesFormatees.systeme_jeu = systeme;
        donneesFormatees.version_template = systemConfig.version || '1.0.0';
        donneesFormatees.date_modification = new Date().toISOString();
        
        return donneesFormatees;
    }
    
    /**
     * Export des données personnage
     */
    exporterDonnees(personnage, format = 'json') {
        const donneesExport = {
            ...personnage,
            date_export: new Date().toISOString(),
            version_export: '1.0.0'
        };
        
        switch (format) {
            case 'json':
                return JSON.stringify(donneesExport, null, 2);
            case 'csv':
                return this.convertirEnCSV(donneesExport);
            default:
                return donneesExport;
        }
    }
    
    /**
     * Statistiques des personnages
     */
    async obtenirStatistiques() {
        try {
            const store = this.initStore();
            if (!store) return {};
            
            const data = await store.requeteApi('/personnages/statistiques');
            return data.donnees || {};
        } catch (erreur) {
            console.error('Erreur statistiques personnages:', erreur);
            return {};
        }
    }
    
    /**
     * Conversion en CSV (utilitaire)
     */
    convertirEnCSV(donnees) {
        const entetes = Object.keys(donnees);
        const valeurs = Object.values(donnees).map(v => 
            typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
        );
        
        return entetes.join(',') + '\n' + valeurs.join(',');
    }
}

// Instance globale
window.personnageService = new PersonnageService();