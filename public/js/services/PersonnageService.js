// ========================================
// Service métier personnages - Frontend
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
    async genererPdf(id, options = {}) {
        const data = await this.store.requeteApi(`/personnages/${id}/pdf`, {
            method: 'POST',
            body: JSON.stringify(options)
        });
        
        this.store.ajouterMessage('succes', 'Génération PDF démarrée');
        return data.donnees;
    }
    
    /**
     * Sauvegarde automatique (draft)
     */
    async sauvegarderBrouillon(donnees) {
        try {
            const data = await this.store.requeteApi('/personnages/brouillon', {
                method: 'POST',
                body: JSON.stringify(donnees)
            });
            
            // Sauvegarde locale aussi
            Alpine.store('creation').sauvegarderLocalement(donnees);
            Alpine.store('navigation').markClean();
            
            return data.donnees;
        } catch (erreur) {
            // En cas d'erreur API, sauvegarde uniquement en local
            Alpine.store('creation').sauvegarderLocalement(donnees);
            console.warn('Sauvegarde locale uniquement:', erreur);
        }
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
            if (template.infos_base?.requis) {
                template.infos_base.requis.forEach(champ => {
                    if (!donnees.infos_base?.[champ]) {
                        erreurs.push(`${champ} est requis pour ${template.nom}`);
                    }
                });
            }
            
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
    
    /**
     * Obtient un template de personnage pour un système
     */
    obtenirTemplate(systeme, templateNom = 'defaut') {
        const systemConfig = this.store.systemes[systeme];
        if (!systemConfig) return null;
        
        return {
            nom: '',
            systeme,
            infos_base: this._creerInfosBaseDefaut(systemConfig),
            attributs: this._creerAttributsDefaut(systemConfig),
            competences: {},
            mouvements: {},
            equipement: {},
            conditions: {},
            ressources: {},
            histoire: {},
            notes: ''
        };
    }
    
    /**
     * Crée les infos de base par défaut
     */
    _creerInfosBaseDefaut(systemConfig) {
        const infos = {};
        if (systemConfig.infos_base?.champs) {
            systemConfig.infos_base.champs.forEach(champ => {
                infos[champ] = '';
            });
        }
        return infos;
    }
    
    /**
     * Crée les attributs par défaut
     */
    _creerAttributsDefaut(systemConfig) {
        const attributs = {};
        if (systemConfig.attributs) {
            Object.entries(systemConfig.attributs).forEach(([nom, config]) => {
                attributs[nom] = config.defaut || config.min || 0;
            });
        }
        return attributs;
    }
    
    /**
     * Obtient les statistiques de personnages
     */
    async obtenirStatistiques() {
        try {
            const data = await this.store.requeteApi('/personnages/statistiques');
            return data.donnees;
        } catch (erreur) {
            console.error('Erreur chargement statistiques:', erreur);
            return {
                total: 0,
                parSysteme: {}
            };
        }
    }
}

// Instance globale
window.personnageService = new PersonnageService();