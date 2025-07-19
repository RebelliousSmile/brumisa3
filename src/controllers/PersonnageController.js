const BaseController = require('./BaseController');
const PersonnageService = require('../services/PersonnageService');
const systemesJeu = require('../utils/systemesJeu');

/**
 * Contrôleur pour la gestion des personnages
 */
class PersonnageController extends BaseController {
    constructor() {
        super('PersonnageController');
        this.personnageService = new PersonnageService();
    }

    /**
     * Liste les personnages de l'utilisateur
     * GET /api/personnages
     */
    lister = this.wrapAsync(async (req, res) => {
        const utilisateur = this.verifierPermissions(req);
        const pagination = this.extrairePagination(req);
        
        // Filtres optionnels
        const filtres = {
            systeme_jeu: req.query.systeme,
            nom: req.query.recherche
        };
        
        const { personnages, total } = await this.personnageService.listerParUtilisateur(
            utilisateur.id, 
            filtres, 
            pagination
        );
        
        return this.repondrePagine(res, personnages, { ...pagination, total });
    });

    /**
     * Récupère un personnage par ID
     * GET /api/personnages/:id
     */
    obtenirParId = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['id']);
        
        const personnage = await this.personnageService.obtenirParId(req.params.id);
        
        if (!personnage) {
            return this.repondreErreur(res, 404, 'Personnage non trouvé');
        }
        
        // Vérifier que l'utilisateur peut accéder à ce personnage
        this.verifierProprietaire(req, personnage.utilisateur_id);
        
        return this.repondreSucces(res, personnage, 'Personnage récupéré');
    });

    /**
     * Crée un nouveau personnage
     * POST /api/personnages
     */
    creer = this.wrapAsync(async (req, res) => {
        const utilisateur = this.verifierPermissions(req);
        this.validerParametres(req, ['nom', 'systeme_jeu']);
        
        // Valider le système de jeu
        if (!systemesJeu[req.body.systeme_jeu]) {
            return this.repondreErreur(res, 400, 'Système de jeu invalide');
        }
        
        // Sanitizer les données
        const donneesPersonnage = this.sanitizeInput({
            ...req.body,
            utilisateur_id: utilisateur.id
        });
        
        // Valider les données spécifiques au système
        this.validerDonneesSysteme(donneesPersonnage);
        
        const personnage = await this.personnageService.creer(donneesPersonnage);
        
        return this.repondreSucces(res, personnage, 'Personnage créé avec succès', 201);
    });

    /**
     * Met à jour un personnage
     * PUT /api/personnages/:id
     */
    mettreAJour = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['id']);
        
        const personnage = await this.personnageService.obtenirParId(req.params.id);
        if (!personnage) {
            return this.repondreErreur(res, 404, 'Personnage non trouvé');
        }
        
        this.verifierProprietaire(req, personnage.utilisateur_id);
        
        // Sanitizer les données
        const donneesMAJ = this.sanitizeInput(req.body);
        
        // Ne pas permettre de changer l'utilisateur propriétaire
        delete donneesMAJ.utilisateur_id;
        delete donneesMAJ.id;
        
        // Valider les données si système changé
        if (donneesMAJ.systeme_jeu && donneesMAJ.systeme_jeu !== personnage.systeme_jeu) {
            if (!systemesJeu[donneesMAJ.systeme_jeu]) {
                return this.repondreErreur(res, 400, 'Système de jeu invalide');
            }
            this.validerDonneesSysteme({ ...personnage, ...donneesMAJ });
        }
        
        const personnageMisAJour = await this.personnageService.mettreAJour(req.params.id, donneesMAJ);
        
        return this.repondreSucces(res, personnageMisAJour, 'Personnage mis à jour');
    });

    /**
     * Duplique un personnage
     * POST /api/personnages/:id/dupliquer
     */
    dupliquer = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['id']);
        
        const personnageOriginal = await this.personnageService.obtenirParId(req.params.id);
        if (!personnageOriginal) {
            return this.repondreErreur(res, 404, 'Personnage non trouvé');
        }
        
        const utilisateur = this.verifierProprietaire(req, personnageOriginal.utilisateur_id);
        
        const nouveauNom = req.body.nouveau_nom || `${personnageOriginal.nom} (Copie)`;
        
        const personnageDuplique = await this.personnageService.dupliquer(
            req.params.id, 
            nouveauNom,
            utilisateur.id
        );
        
        return this.repondreSucces(res, personnageDuplique, 'Personnage dupliqué avec succès', 201);
    });

    /**
     * Supprime un personnage
     * DELETE /api/personnages/:id
     */
    supprimer = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['id']);
        
        const personnage = await this.personnageService.obtenirParId(req.params.id);
        if (!personnage) {
            return this.repondreErreur(res, 404, 'Personnage non trouvé');
        }
        
        this.verifierProprietaire(req, personnage.utilisateur_id);
        
        await this.personnageService.supprimer(req.params.id);
        
        return this.repondreSucces(res, null, 'Personnage supprimé');
    });

    /**
     * Sauvegarde un brouillon
     * POST /api/personnages/brouillon
     */
    sauvegarderBrouillon = this.wrapAsync(async (req, res) => {
        const utilisateur = this.verifierPermissions(req);
        
        const donneesBrouillon = this.sanitizeInput({
            ...req.body,
            utilisateur_id: utilisateur.id,
            est_brouillon: true
        });
        
        const brouillon = await this.personnageService.sauvegarderBrouillon(donneesBrouillon);
        
        return this.repondreSucces(res, brouillon, 'Brouillon sauvegardé');
    });

    /**
     * Obtient les statistiques des personnages
     * GET /api/personnages/statistiques
     */
    obtenirStatistiques = this.wrapAsync(async (req, res) => {
        const utilisateur = this.verifierPermissions(req);
        
        const stats = await this.personnageService.obtenirStatistiques(utilisateur.id);
        
        return this.repondreSucces(res, stats, 'Statistiques récupérées');
    });

    /**
     * Génère un PDF pour un personnage
     * POST /api/personnages/:id/pdf
     */
    genererPdf = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['id']);
        
        const personnage = await this.personnageService.obtenirParId(req.params.id);
        if (!personnage) {
            return this.repondreErreur(res, 404, 'Personnage non trouvé');
        }
        
        this.verifierProprietaire(req, personnage.utilisateur_id);
        
        const options = req.body || {};
        const typePdf = options.type || 'fiche_personnage';
        
        // Déléguer à PdfService via PersonnageService
        const pdf = await this.personnageService.genererPdf(req.params.id, typePdf, options);
        
        return this.repondreSucces(res, pdf, 'Génération PDF démarrée', 202);
    });

    /**
     * Valide les données spécifiques à un système de jeu
     */
    validerDonneesSysteme(donnees) {
        const systeme = systemesJeu[donnees.systeme_jeu];
        if (!systeme) return;
        
        const erreurs = [];
        
        // Valider les attributs
        if (donnees.attributs && systeme.attributs) {
            Object.entries(systeme.attributs).forEach(([nom, config]) => {
                const valeur = donnees.attributs[nom];
                if (valeur !== undefined && valeur !== null) {
                    if (valeur < config.min || valeur > config.max) {
                        erreurs.push(`${nom} doit être entre ${config.min} et ${config.max}`);
                    }
                }
            });
        }
        
        // Valider les champs requis
        if (systeme.infos_base?.requis) {
            systeme.infos_base.requis.forEach(champ => {
                const valeur = donnees.infos_base?.[champ] || donnees[champ];
                if (!valeur || (typeof valeur === 'string' && valeur.trim() === '')) {
                    erreurs.push(`${champ} est requis pour ${systeme.nom}`);
                }
            });
        }
        
        if (erreurs.length > 0) {
            const erreur = new Error(erreurs.join(', '));
            erreur.name = 'ValidationError';
            erreur.details = erreurs;
            throw erreur;
        }
    }

    /**
     * Obtient un template de personnage pour un système
     * GET /api/personnages/template/:systeme
     */
    obtenirTemplate = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['systeme']);
        
        const systeme = systemesJeu[req.params.systeme];
        if (!systeme) {
            return this.repondreErreur(res, 404, 'Système de jeu non trouvé');
        }
        
        const template = this.personnageService.creerTemplate(req.params.systeme);
        
        return this.repondreSucces(res, template, 'Template récupéré');
    });

    /**
     * Recherche de personnages
     * GET /api/personnages/rechercher
     */
    rechercher = this.wrapAsync(async (req, res) => {
        const utilisateur = this.verifierPermissions(req);
        this.validerParametres(req, ['q']);
        
        const resultats = await this.personnageService.rechercher(
            utilisateur.id,
            req.query.q,
            {
                systeme: req.query.systeme,
                limite: Math.min(parseInt(req.query.limite) || 10, 50)
            }
        );
        
        return this.repondreSucces(res, resultats, 'Recherche effectuée');
    });
}

module.exports = PersonnageController;