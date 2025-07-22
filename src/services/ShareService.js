const BaseService = require('./BaseService');
const crypto = require('crypto');

/**
 * Service pour la gestion du partage de personnages (fonctionnalité Premium)
 * US010 - Partage de personnage (Premium)
 */
class ShareService extends BaseService {
    constructor() {
        super('ShareService');
        this.tokenDureeParDefaut = 7 * 24 * 60 * 60 * 1000; // 7 jours en millisecondes
    }

    /**
     * Crée un lien de partage pour un personnage (Premium uniquement)
     */
    async creerLienPartage(personnageId, utilisateurId, options = {}) {
        try {
            // Vérifier que l'utilisateur est premium ou admin
            const UtilisateurService = require('./UtilisateurService');
            const utilisateurService = new UtilisateurService();
            const utilisateur = await utilisateurService.obtenirParId(utilisateurId);
            
            if (!utilisateur || !['PREMIUM', 'ADMIN'].includes(utilisateur.role)) {
                throw new Error('Fonctionnalité réservée aux membres Premium');
            }

            // Vérifier que le personnage appartient à l'utilisateur
            const PersonnageService = require('./PersonnageService');
            const personnageService = new PersonnageService();
            const personnage = await personnageService.obtenirParId(personnageId);
            
            if (!personnage) {
                throw new Error('Personnage non trouvé');
            }
            
            if (personnage.utilisateur_id !== utilisateurId && utilisateur.role !== 'ADMIN') {
                throw new Error('Vous ne pouvez partager que vos propres personnages');
            }

            // Générer un token unique
            const token = this.genererTokenPartage();
            const dateExpiration = new Date(Date.now() + (options.dureeJours || 7) * 24 * 60 * 60 * 1000);
            
            // Préparer les données de partage
            const donneesPartage = {
                personnage_id: personnageId,
                utilisateur_id: utilisateurId,
                token,
                date_expiration: dateExpiration,
                permissions: this.validerPermissions(options.permissions || {}),
                titre_personnalise: options.titre || personnage.nom,
                description: options.description || '',
                mot_de_passe: options.motDePasse || null,
                limite_vues: options.limiteVues || null,
                actif: true,
                date_creation: new Date()
            };

            // Sauvegarder en base de données
            const partage = await this.sauvegarderPartage(donneesPartage);
            
            this.logger.info('Lien de partage créé:', {
                personnage_id: personnageId,
                utilisateur_id: utilisateurId,
                token,
                expiration: dateExpiration
            });

            return {
                id: partage.id,
                token,
                url: `/partage/${token}`,
                url_complete: `${process.env.BASE_URL || 'http://localhost:3076'}/partage/${token}`,
                date_expiration: dateExpiration,
                permissions: donneesPartage.permissions,
                titre: donneesPartage.titre_personnalise
            };

        } catch (erreur) {
            this.logger.error('Erreur lors de la création du lien de partage:', erreur);
            throw erreur;
        }
    }

    /**
     * Obtient un personnage via un token de partage
     */
    async obtenirPersonnagePartage(token, options = {}) {
        try {
            // Récupérer les informations de partage
            const partage = await this.obtenirPartageParToken(token);
            
            if (!partage) {
                throw new Error('Lien de partage non trouvé');
            }

            // Vérifier la validité
            this.verifierValiditePartage(partage, options);

            // Obtenir le personnage
            const PersonnageService = require('./PersonnageService');
            const personnageService = new PersonnageService();
            const personnage = await personnageService.obtenirParId(partage.personnage_id);
            
            if (!personnage) {
                throw new Error('Personnage non trouvé');
            }

            // Appliquer les permissions de partage
            const personnageFilitre = this.appliquerPermissions(personnage, partage.permissions);

            // Incrémenter le compteur de vues
            await this.incrementerVues(partage.id);

            // Obtenir les informations du propriétaire
            const UtilisateurService = require('./UtilisateurService');
            const utilisateurService = new UtilisateurService();
            const proprietaire = await utilisateurService.obtenirParId(partage.utilisateur_id);

            return {
                personnage: personnageFilitre,
                partage: {
                    id: partage.id,
                    titre: partage.titre_personnalise,
                    description: partage.description,
                    date_creation: partage.date_creation,
                    proprietaire: {
                        nom: proprietaire ? proprietaire.nom : 'Utilisateur inconnu',
                        id: proprietaire ? proprietaire.id : null
                    },
                    permissions: partage.permissions,
                    nb_vues: partage.nb_vues + 1
                }
            };

        } catch (erreur) {
            this.logger.error('Erreur lors de l\'accès au partage:', erreur);
            throw erreur;
        }
    }

    /**
     * Liste les partages d'un utilisateur
     */
    async listerPartagesUtilisateur(utilisateurId, pagination = {}) {
        try {
            const offset = pagination.offset || 0;
            const limite = pagination.limite || 20;

            const partages = await this.listerPartages({
                where: 'utilisateur_id = ? AND actif = ?',
                valeurs: [utilisateurId, true],
                order: 'date_creation DESC',
                limit: limite,
                offset
            });

            // Enrichir avec les informations des personnages
            const partagesEnrichis = await Promise.all(
                partages.map(async (partage) => {
                    const PersonnageService = require('./PersonnageService');
                    const personnageService = new PersonnageService();
                    const personnage = await personnageService.obtenirParId(partage.personnage_id);
                    
                    return {
                        ...partage,
                        personnage_nom: personnage ? personnage.nom : 'Personnage supprimé',
                        personnage_systeme: personnage ? personnage.systeme_jeu : null,
                        url_partage: `/partage/${partage.token}`,
                        est_expire: new Date() > new Date(partage.date_expiration)
                    };
                })
            );

            const total = await this.compterPartages('utilisateur_id = ? AND actif = ?', [utilisateurId, true]);

            return {
                partages: partagesEnrichis,
                total
            };

        } catch (erreur) {
            this.logger.error('Erreur lors de la liste des partages:', erreur);
            throw erreur;
        }
    }

    /**
     * Met à jour un partage existant
     */
    async mettreAJourPartage(partageId, utilisateurId, donnees) {
        try {
            const partage = await this.obtenirPartageParId(partageId);
            
            if (!partage) {
                throw new Error('Partage non trouvé');
            }

            if (partage.utilisateur_id !== utilisateurId) {
                throw new Error('Vous ne pouvez modifier que vos propres partages');
            }

            const donneesAutorisees = this.filtrerDonneesMAJPartage(donnees);
            
            if (donneesAutorisees.permissions) {
                donneesAutorisees.permissions = this.validerPermissions(donneesAutorisees.permissions);
            }

            const partageMAJ = await this.mettreAJourPartageEnBase(partageId, donneesAutorisees);

            this.logger.info('Partage mis à jour:', {
                partage_id: partageId,
                utilisateur_id: utilisateurId
            });

            return partageMAJ;

        } catch (erreur) {
            this.logger.error('Erreur lors de la mise à jour du partage:', erreur);
            throw erreur;
        }
    }

    /**
     * Supprime (désactive) un partage
     */
    async supprimerPartage(partageId, utilisateurId) {
        try {
            const partage = await this.obtenirPartageParId(partageId);
            
            if (!partage) {
                throw new Error('Partage non trouvé');
            }

            // Vérifier les permissions
            const UtilisateurService = require('./UtilisateurService');
            const utilisateurService = new UtilisateurService();
            const utilisateur = await utilisateurService.obtenirParId(utilisateurId);
            
            if (partage.utilisateur_id !== utilisateurId && utilisateur.role !== 'ADMIN') {
                throw new Error('Vous ne pouvez supprimer que vos propres partages');
            }

            await this.mettreAJourPartageEnBase(partageId, {
                actif: false,
                date_suppression: new Date()
            });

            this.logger.info('Partage supprimé:', {
                partage_id: partageId,
                utilisateur_id: utilisateurId
            });

            return true;

        } catch (erreur) {
            this.logger.error('Erreur lors de la suppression du partage:', erreur);
            throw erreur;
        }
    }

    /**
     * Nettoie les partages expirés
     */
    async nettoyerPartagesExpires() {
        try {
            const maintenant = new Date();
            const result = await this.mettreAJourPartagesEnBase(
                'date_expiration < ? AND actif = ?',
                [maintenant, true],
                { actif: false, date_suppression: maintenant }
            );

            const nbNettoyes = result.rowCount || 0;
            this.logger.info(`${nbNettoyes} partages expirés nettoyés`);
            
            return nbNettoyes;

        } catch (erreur) {
            this.logger.error('Erreur lors du nettoyage des partages expirés:', erreur);
            throw erreur;
        }
    }

    /**
     * Génère un token de partage unique
     */
    genererTokenPartage() {
        return crypto.randomBytes(16).toString('hex');
    }

    /**
     * Valide et normalise les permissions de partage
     */
    validerPermissions(permissions) {
        const permissionsParDefaut = {
            voir_attributs: true,
            voir_competences: true,
            voir_inventaire: true,
            voir_notes: false,
            voir_infos_privees: false,
            permettre_copie: false,
            permettre_export_pdf: true
        };

        return {
            ...permissionsParDefaut,
            ...permissions
        };
    }

    /**
     * Applique les permissions de partage au personnage
     */
    appliquerPermissions(personnage, permissions) {
        const personnageFilitre = { ...personnage };

        if (!permissions.voir_attributs) {
            delete personnageFilitre.attributs;
        }

        if (!permissions.voir_competences) {
            delete personnageFilitre.competences;
        }

        if (!permissions.voir_inventaire) {
            delete personnageFilitre.inventaire;
        }

        if (!permissions.voir_notes) {
            delete personnageFilitre.notes;
            delete personnageFilitre.notes_privees;
        }

        if (!permissions.voir_infos_privees) {
            delete personnageFilitre.infos_privees;
            delete personnageFilitre.historique;
        }

        // Toujours masquer les informations sensibles
        delete personnageFilitre.utilisateur_id;
        delete personnageFilitre.date_modification;

        return personnageFilitre;
    }

    /**
     * Vérifie la validité d'un partage
     */
    verifierValiditePartage(partage, options = {}) {
        if (!partage.actif) {
            throw new Error('Ce lien de partage a été désactivé');
        }

        if (new Date() > new Date(partage.date_expiration)) {
            throw new Error('Ce lien de partage a expiré');
        }

        if (partage.mot_de_passe && options.motDePasse !== partage.mot_de_passe) {
            throw new Error('Mot de passe requis');
        }

        if (partage.limite_vues && partage.nb_vues >= partage.limite_vues) {
            throw new Error('Limite de vues atteinte');
        }
    }

    /**
     * Filtre les données autorisées pour la mise à jour
     */
    filtrerDonneesMAJPartage(donnees) {
        const champsAutorises = [
            'titre_personnalise', 'description', 'permissions', 
            'date_expiration', 'mot_de_passe', 'limite_vues'
        ];
        
        const donneesFiltr = {};
        champsAutorises.forEach(champ => {
            if (donnees[champ] !== undefined) {
                donneesFiltr[champ] = donnees[champ];
            }
        });

        return donneesFiltr;
    }

    // Méthodes de base de données (à implémenter selon le modèle)
    async sauvegarderPartage(donnees) {
        // TODO: Implémenter la sauvegarde en base
        return { id: Date.now(), ...donnees };
    }

    async obtenirPartageParToken(token) {
        // TODO: Implémenter la récupération par token
        return null;
    }

    async obtenirPartageParId(id) {
        // TODO: Implémenter la récupération par ID
        return null;
    }

    async listerPartages(options) {
        // TODO: Implémenter la liste des partages
        return [];
    }

    async compterPartages(where, valeurs) {
        // TODO: Implémenter le comptage
        return 0;
    }

    async mettreAJourPartageEnBase(id, donnees) {
        // TODO: Implémenter la mise à jour
        return { id, ...donnees };
    }

    async mettreAJourPartagesEnBase(where, valeurs, donnees) {
        // TODO: Implémenter la mise à jour multiple
        return { rowCount: 0 };
    }

    async incrementerVues(partageId) {
        // TODO: Implémenter l'incrémentation des vues
        return true;
    }
}

module.exports = ShareService;