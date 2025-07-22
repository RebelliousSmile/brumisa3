const BaseService = require('./BaseService');
const systemesJeu = require('../utils/systemesJeu');

/**
 * Service pour la gestion des systèmes de jeu
 * US001 - Sélection du système de jeu
 * US016 - Gestion des systèmes de jeu (Admin)
 */
class SystemService extends BaseService {
    constructor() {
        super('SystemService');
    }

    /**
     * US001 - Liste les systèmes de jeu disponibles pour la sélection
     */
    async listerSystemesDisponibles(filtres = {}) {
        try {
            const systemes = Object.entries(systemesJeu)
                .map(([cle, config]) => ({
                    id: cle,
                    nom: config.nom,
                    description: config.description || '',
                    version: config.version || '1.0.0',
                    actif: config.actif !== false,
                    couleurs: config.couleurs || {},
                    apercu: {
                        attributs: this.extraireApercu(config.attributs),
                        competences: this.extraireApercu(config.competences),
                        infos_specifiques: config.infos_base?.apercu || null
                    },
                    complexite: config.complexite || 'moyenne',
                    tags: config.tags || [],
                    icone: config.icone || null
                }))
                .filter(systeme => {
                    // Filtres optionnels
                    if (filtres.actif !== undefined && systeme.actif !== filtres.actif) {
                        return false;
                    }
                    if (filtres.complexite && systeme.complexite !== filtres.complexite) {
                        return false;
                    }
                    if (filtres.tag && !systeme.tags.includes(filtres.tag)) {
                        return false;
                    }
                    return true;
                })
                .sort((a, b) => {
                    // Trier par ordre alphabétique, mais avec les systèmes actifs en premier
                    if (a.actif !== b.actif) {
                        return b.actif - a.actif;
                    }
                    return a.nom.localeCompare(b.nom);
                });

            this.logger.info('Systèmes listés:', { 
                total: systemes.length, 
                actifs: systemes.filter(s => s.actif).length 
            });

            return systemes;

        } catch (erreur) {
            this.logger.error('Erreur lors de la liste des systèmes:', erreur);
            throw erreur;
        }
    }

    /**
     * Obtient les détails complets d'un système de jeu
     */
    async obtenirDetailsSysteme(systemeId) {
        try {
            const config = systemesJeu[systemeId];
            if (!config) {
                throw new Error('Système de jeu non trouvé');
            }

            const details = {
                id: systemeId,
                nom: config.nom,
                description: config.description || '',
                version: config.version || '1.0.0',
                actif: config.actif !== false,
                
                // Configuration détaillée
                attributs: config.attributs || {},
                competences: config.competences || {},
                infos_base: config.infos_base || {},
                
                // Personnalisation
                couleurs: config.couleurs || {},
                icone: config.icone || null,
                styles_css: config.styles_css || null,
                
                // Métadonnées
                auteur: config.auteur || 'Système officiel',
                licence: config.licence || 'Utilisation libre',
                url_officiel: config.url_officiel || null,
                
                // Informations techniques
                templates_disponibles: config.templates || [],
                supports_pdf: config.supports_pdf !== false,
                supports_exports: config.supports_exports || ['pdf', 'json'],
                
                // Classification
                complexite: config.complexite || 'moyenne',
                tags: config.tags || [],
                public_cible: config.public_cible || 'tout-public',
                
                // Statistiques d'usage
                statistiques: await this.obtenirStatistiquesSysteme(systemeId)
            };

            return details;

        } catch (erreur) {
            this.logger.error(`Erreur lors de la récupération du système ${systemeId}:`, erreur);
            throw erreur;
        }
    }

    /**
     * US016 - Crée un nouveau système de jeu (Admin uniquement)
     */
    async creerSysteme(donnees, utilisateurRole = 'UTILISATEUR') {
        try {
            // Vérifier les permissions admin
            if (utilisateurRole !== 'ADMIN') {
                throw new Error('Fonctionnalité réservée aux administrateurs');
            }

            // Valider les données
            this.validerDonneesSysteme(donnees);

            // Vérifier que l'ID n'existe pas déjà
            if (systemesJeu[donnees.id]) {
                throw new Error('Un système avec cet ID existe déjà');
            }

            // Préparer la configuration complète
            const configSysteme = this.preparerConfigurationSysteme(donnees);

            // Sauvegarder (simulation - dans un vrai système, on sauvegarderait en base/fichier)
            await this.sauvegarderSysteme(donnees.id, configSysteme);

            this.logger.info('Nouveau système créé:', { 
                id: donnees.id, 
                nom: donnees.nom 
            });

            return {
                id: donnees.id,
                ...configSysteme,
                date_creation: new Date(),
                cree_par: 'admin'
            };

        } catch (erreur) {
            this.logger.error('Erreur lors de la création du système:', erreur);
            throw erreur;
        }
    }

    /**
     * US016 - Met à jour un système existant (Admin uniquement)
     */
    async mettreAJourSysteme(systemeId, donnees, utilisateurRole = 'UTILISATEUR') {
        try {
            // Vérifier les permissions admin
            if (utilisateurRole !== 'ADMIN') {
                throw new Error('Fonctionnalité réservée aux administrateurs');
            }

            // Vérifier que le système existe
            if (!systemesJeu[systemeId]) {
                throw new Error('Système de jeu non trouvé');
            }

            // Valider les données partielles
            this.validerDonneesSysteme(donnees, true);

            // Fusionner avec la configuration existante
            const configExistante = systemesJeu[systemeId];
            const configMiseAJour = {
                ...configExistante,
                ...donnees,
                date_modification: new Date(),
                modifie_par: 'admin'
            };

            // Sauvegarder
            await this.sauvegarderSysteme(systemeId, configMiseAJour);

            this.logger.info('Système mis à jour:', { 
                id: systemeId, 
                champs: Object.keys(donnees) 
            });

            return configMiseAJour;

        } catch (erreur) {
            this.logger.error(`Erreur lors de la mise à jour du système ${systemeId}:`, erreur);
            throw erreur;
        }
    }

    /**
     * US016 - Active/désactive un système (Admin uniquement)
     */
    async changerStatutSysteme(systemeId, actif, utilisateurRole = 'UTILISATEUR') {
        try {
            // Vérifier les permissions admin
            if (utilisateurRole !== 'ADMIN') {
                throw new Error('Fonctionnalité réservée aux administrateurs');
            }

            const donnees = { 
                actif,
                date_modification: new Date(),
                modifie_par: 'admin'
            };

            const systemeMAJ = await this.mettreAJourSysteme(systemeId, donnees, utilisateurRole);

            this.logger.info(`Système ${actif ? 'activé' : 'désactivé'}:`, { id: systemeId });

            return systemeMAJ;

        } catch (erreur) {
            this.logger.error(`Erreur lors du changement de statut ${systemeId}:`, erreur);
            throw erreur;
        }
    }

    /**
     * US016 - Supprime un système (Admin uniquement)
     */
    async supprimerSysteme(systemeId, utilisateurRole = 'UTILISATEUR') {
        try {
            // Vérifier les permissions admin
            if (utilisateurRole !== 'ADMIN') {
                throw new Error('Fonctionnalité réservée aux administrateurs');
            }

            // Vérifier que le système existe
            if (!systemesJeu[systemeId]) {
                throw new Error('Système de jeu non trouvé');
            }

            // Vérifier s'il y a des personnages utilisant ce système
            const nbPersonnages = await this.compterPersonnagesParSysteme(systemeId);
            if (nbPersonnages > 0) {
                throw new Error(`Impossible de supprimer : ${nbPersonnages} personnages utilisent ce système`);
            }

            // Supprimer (simulation)
            await this.supprimerSystemeEnBase(systemeId);

            this.logger.info('Système supprimé:', { id: systemeId });

            return true;

        } catch (erreur) {
            this.logger.error(`Erreur lors de la suppression du système ${systemeId}:`, erreur);
            throw erreur;
        }
    }

    /**
     * Obtient les statistiques d'utilisation des systèmes
     */
    async obtenirStatistiquesGlobales() {
        try {
            const statistiques = {};
            
            for (const [systemeId, config] of Object.entries(systemesJeu)) {
                statistiques[systemeId] = {
                    nom: config.nom,
                    actif: config.actif !== false,
                    nb_personnages: await this.compterPersonnagesParSysteme(systemeId),
                    nb_pdfs_generes: await this.compterPdfsParSysteme(systemeId),
                    derniere_utilisation: await this.obtenirDerniereUtilisation(systemeId)
                };
            }

            return {
                systemes: statistiques,
                resume: {
                    total_systemes: Object.keys(systemesJeu).length,
                    systemes_actifs: Object.values(systemesJeu).filter(s => s.actif !== false).length,
                    total_personnages: Object.values(statistiques).reduce((sum, s) => sum + s.nb_personnages, 0),
                    total_pdfs: Object.values(statistiques).reduce((sum, s) => sum + s.nb_pdfs_generes, 0)
                }
            };

        } catch (erreur) {
            this.logger.error('Erreur lors du calcul des statistiques:', erreur);
            throw erreur;
        }
    }

    /**
     * Valide la configuration d'un système
     */
    async validerConfigurationSysteme(systemeId) {
        try {
            const config = systemesJeu[systemeId];
            if (!config) {
                throw new Error('Système non trouvé');
            }

            const erreurs = [];
            const avertissements = [];

            // Validation de base
            if (!config.nom) {
                erreurs.push('Nom manquant');
            }

            if (!config.version) {
                avertissements.push('Version non spécifiée');
            }

            // Validation des attributs
            if (config.attributs) {
                for (const [nom, attrConfig] of Object.entries(config.attributs)) {
                    if (typeof attrConfig.min !== 'number' || typeof attrConfig.max !== 'number') {
                        erreurs.push(`Attribut ${nom} : min/max invalides`);
                    }
                    if (attrConfig.min >= attrConfig.max) {
                        erreurs.push(`Attribut ${nom} : min doit être < max`);
                    }
                }
            }

            // Validation des templates
            if (config.templates) {
                const templatesInvalides = [];
                for (const template of config.templates) {
                    const existe = await this.verifierExistenceTemplate(systemeId, template);
                    if (!existe) {
                        templatesInvalides.push(template);
                    }
                }
                if (templatesInvalides.length > 0) {
                    avertissements.push(`Templates introuvables : ${templatesInvalides.join(', ')}`);
                }
            }

            return {
                valide: erreurs.length === 0,
                erreurs,
                avertissements,
                systeme_id: systemeId,
                date_validation: new Date()
            };

        } catch (erreur) {
            this.logger.error(`Erreur lors de la validation ${systemeId}:`, erreur);
            throw erreur;
        }
    }

    /**
     * Extrait un aperçu pour la liste des systèmes
     */
    extraireApercu(configuration) {
        if (!configuration || typeof configuration !== 'object') {
            return null;
        }

        // Retourner les 3 premiers éléments comme aperçu
        const cles = Object.keys(configuration).slice(0, 3);
        return cles.length > 0 ? cles : null;
    }

    /**
     * Valide les données d'un système
     */
    validerDonneesSysteme(donnees, miseAJour = false) {
        const erreurs = [];

        // Validation de l'ID (seulement pour création)
        if (!miseAJour) {
            if (!donnees.id || typeof donnees.id !== 'string') {
                erreurs.push('ID requis (string)');
            } else if (!/^[a-z0-9_-]+$/.test(donnees.id)) {
                erreurs.push('ID doit contenir uniquement des lettres minuscules, chiffres, tirets et underscores');
            }
        }

        // Validation du nom
        if (donnees.nom !== undefined) {
            if (!donnees.nom || typeof donnees.nom !== 'string') {
                erreurs.push('Nom requis (string)');
            } else if (donnees.nom.length < 2 || donnees.nom.length > 100) {
                erreurs.push('Nom doit faire entre 2 et 100 caractères');
            }
        }

        // Validation de la version
        if (donnees.version !== undefined) {
            if (typeof donnees.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(donnees.version)) {
                erreurs.push('Version doit suivre le format x.y.z');
            }
        }

        // Validation des attributs
        if (donnees.attributs !== undefined) {
            if (typeof donnees.attributs !== 'object') {
                erreurs.push('Attributs doit être un objet');
            } else {
                for (const [nom, config] of Object.entries(donnees.attributs)) {
                    if (!config.min || !config.max || typeof config.min !== 'number' || typeof config.max !== 'number') {
                        erreurs.push(`Attribut ${nom} : min et max requis (numbers)`);
                    }
                }
            }
        }

        if (erreurs.length > 0) {
            const erreur = new Error(erreurs.join(', '));
            erreur.name = 'ValidationError';
            erreur.details = erreurs;
            throw erreur;
        }
    }

    /**
     * Prépare la configuration complète d'un système
     */
    preparerConfigurationSysteme(donnees) {
        return {
            nom: donnees.nom,
            description: donnees.description || '',
            version: donnees.version || '1.0.0',
            actif: donnees.actif !== false,
            
            attributs: donnees.attributs || {},
            competences: donnees.competences || {},
            infos_base: donnees.infos_base || {},
            
            couleurs: donnees.couleurs || {},
            icone: donnees.icone || null,
            
            complexite: donnees.complexite || 'moyenne',
            tags: donnees.tags || [],
            public_cible: donnees.public_cible || 'tout-public',
            
            auteur: donnees.auteur || 'Système personnalisé',
            licence: donnees.licence || 'Utilisation libre',
            
            templates: donnees.templates || [],
            supports_pdf: donnees.supports_pdf !== false,
            supports_exports: donnees.supports_exports || ['pdf', 'json']
        };
    }

    // Méthodes simulées pour la base de données
    async obtenirStatistiquesSysteme(systemeId) {
        // TODO: Implémenter selon le modèle de base de données
        return {
            nb_personnages: 0,
            nb_pdfs_generes: 0,
            derniere_utilisation: null
        };
    }

    async compterPersonnagesParSysteme(systemeId) {
        // TODO: Implémenter
        return 0;
    }

    async compterPdfsParSysteme(systemeId) {
        // TODO: Implémenter
        return 0;
    }

    async obtenirDerniereUtilisation(systemeId) {
        // TODO: Implémenter
        return null;
    }

    async sauvegarderSysteme(systemeId, config) {
        // TODO: Implémenter la sauvegarde persistante
        // Pour l'instant, simulation en mémoire
        systemesJeu[systemeId] = config;
        return true;
    }

    async supprimerSystemeEnBase(systemeId) {
        // TODO: Implémenter la suppression persistante
        delete systemesJeu[systemeId];
        return true;
    }

    async verifierExistenceTemplate(systemeId, templateId) {
        // TODO: Implémenter la vérification d'existence des templates
        return true;
    }
}

module.exports = SystemService;