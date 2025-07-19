const BaseController = require('./BaseController');
const PdfService = require('../services/PdfService');
const NewsletterService = require('../services/NewsletterService');
const TemoignageService = require('../services/TemoignageService');

/**
 * Contrôleur pour la page d'accueil et fonctionnalités publiques
 */
class HomeController extends BaseController {
    constructor() {
        super('HomeController');
        this.pdfService = new PdfService();
        this.newsletterService = new NewsletterService();
        this.temoignageService = new TemoignageService();
    }

    /**
     * Données pour la page d'accueil
     * GET /api/home/donnees
     */
    obtenirDonneesAccueil = this.wrapAsync(async (req, res) => {
        const utilisateurRole = req.session?.utilisateur?.role || 'UTILISATEUR';
        
        // Récupérer les PDFs publics récents
        const pdfsRecents = await this.pdfService.obtenirPdfsPublicsRecents(6, utilisateurRole);
        
        // Récupérer les actualités
        const actualites = this.newsletterService.obtenirActualites(3);
        
        // Récupérer les témoignages
        const temoignages = this.temoignageService.obtenirTemoignagesPublics(3);
        
        // Statistiques générales
        const stats = {
            nb_abonnes_newsletter: this.newsletterService.obtenirNombreAbonnes(),
            stats_temoignages: this.temoignageService.obtenirStatistiques()
        };
        
        return this.repondreSucces(res, {
            pdfs_recents: pdfsRecents,
            actualites,
            temoignages,
            statistiques: stats
        }, 'Données d\'accueil récupérées');
    });

    /**
     * Inscription à la newsletter
     * POST /api/newsletter/inscription
     */
    inscrireNewsletter = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['email']);
        
        const { email, nom } = this.sanitizeInput(req.body);
        
        const resultat = await this.newsletterService.inscrire(email, nom);
        
        if (resultat.succes) {
            return this.repondreSucces(res, { 
                token_desinscription: resultat.token_desinscription 
            }, resultat.message);
        } else {
            return this.repondreErreur(res, 409, resultat.message);
        }
    });

    /**
     * Désinscription de la newsletter
     * POST /api/newsletter/desinscription/:token
     */
    desinscrireNewsletter = this.wrapAsync(async (req, res) => {
        this.validerParametres(req, ['token']);
        
        const resultat = await this.newsletterService.desinscrire(req.params.token);
        
        if (resultat.succes) {
            return this.repondreSucces(res, null, resultat.message);
        } else {
            return this.repondreErreur(res, 404, resultat.message);
        }
    });

    /**
     * Flux RSS des actualités
     * GET /api/actualites/rss
     */
    fluxRSS = this.wrapAsync(async (req, res) => {
        const rss = this.newsletterService.genererFluxRSS();
        
        res.set({
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 'public, max-age=300' // Cache 5 minutes
        });
        
        return res.send(rss);
    });

    /**
     * Liste des actualités
     * GET /api/actualites
     */
    listerActualites = this.wrapAsync(async (req, res) => {
        const limite = Math.min(parseInt(req.query.limite) || 10, 50);
        const actualites = this.newsletterService.obtenirActualites(limite);
        
        return this.repondreSucces(res, actualites, 'Actualités récupérées');
    });

    /**
     * Ajouter une actualité (admin uniquement)
     * POST /api/actualites
     */
    ajouterActualite = this.wrapAsync(async (req, res) => {
        this.verifierPermissions(req, 'ADMIN');
        this.validerParametres(req, ['titre', 'contenu']);
        
        const { titre, contenu } = this.sanitizeInput(req.body);
        const auteur = req.session.utilisateur.nom;
        
        const actualite = this.newsletterService.ajouterActualite(titre, contenu, auteur);
        
        return this.repondreSucces(res, actualite, 'Actualité ajoutée', 201);
    });

    /**
     * Ajouter un témoignage
     * POST /api/temoignages
     */
    ajouterTemoignage = this.wrapAsync(async (req, res) => {
        const donnees = this.sanitizeInput({
            ...req.body,
            ip_adresse: req.ip
        });
        
        const resultat = await this.temoignageService.ajouterTemoignage(donnees);
        
        return this.repondreSucces(res, { id: resultat.id }, resultat.message, 201);
    });

    /**
     * Lister les témoignages publics
     * GET /api/temoignages
     */
    listerTemoignages = this.wrapAsync(async (req, res) => {
        const limite = Math.min(parseInt(req.query.limite) || 6, 20);
        const temoignages = this.temoignageService.obtenirTemoignagesPublics(limite);
        
        return this.repondreSucces(res, temoignages, 'Témoignages récupérés');
    });

    /**
     * Gérer les témoignages (admin uniquement)
     * GET /api/admin/temoignages
     */
    gererTemoignages = this.wrapAsync(async (req, res) => {
        this.verifierPermissions(req, 'ADMIN');
        
        const filtres = {
            approuve: req.query.approuve !== undefined ? req.query.approuve === 'true' : undefined,
            affiche: req.query.affiche !== undefined ? req.query.affiche === 'true' : undefined,
            systeme_utilise: req.query.systeme
        };
        
        const temoignages = this.temoignageService.obtenirTousTemoignages(filtres);
        
        return this.repondreSucces(res, temoignages, 'Témoignages admin récupérés');
    });

    /**
     * Approuver un témoignage (admin uniquement)
     * POST /api/admin/temoignages/:id/approuver
     */
    approuverTemoignage = this.wrapAsync(async (req, res) => {
        this.verifierPermissions(req, 'ADMIN');
        this.validerParametres(req, ['id']);
        
        const afficher = req.body.afficher !== false; // Afficher par défaut
        const temoignage = await this.temoignageService.approuverTemoignage(req.params.id, afficher);
        
        return this.repondreSucces(res, temoignage, 'Témoignage approuvé');
    });

    /**
     * Refuser un témoignage (admin uniquement)
     * POST /api/admin/temoignages/:id/refuser
     */
    refuserTemoignage = this.wrapAsync(async (req, res) => {
        this.verifierPermissions(req, 'ADMIN');
        this.validerParametres(req, ['id']);
        
        const raison = req.body.raison || null;
        const temoignage = await this.temoignageService.refuserTemoignage(req.params.id, raison);
        
        return this.repondreSucces(res, temoignage, 'Témoignage refusé');
    });

    /**
     * Basculer l'affichage d'un témoignage (admin uniquement)
     * POST /api/admin/temoignages/:id/basculer-affichage
     */
    basculerAffichageTemoignage = this.wrapAsync(async (req, res) => {
        this.verifierPermissions(req, 'ADMIN');
        this.validerParametres(req, ['id']);
        
        const temoignage = await this.temoignageService.basculerAffichage(req.params.id);
        
        return this.repondreSucces(res, temoignage, 
            `Témoignage ${temoignage.affiche ? 'affiché' : 'masqué'}`);
    });

    /**
     * Statistiques des témoignages (admin uniquement)
     * GET /api/admin/temoignages/statistiques
     */
    statistiquesTemoignages = this.wrapAsync(async (req, res) => {
        this.verifierPermissions(req, 'ADMIN');
        
        const stats = this.temoignageService.obtenirStatistiques();
        
        return this.repondreSucces(res, stats, 'Statistiques témoignages récupérées');
    });

    /**
     * Basculer la visibilité publique d'un PDF
     * POST /api/pdfs/:id/basculer-visibilite
     */
    basculerVisibilitePdf = this.wrapAsync(async (req, res) => {
        const utilisateur = this.verifierPermissions(req);
        this.validerParametres(req, ['id']);
        
        const pdf = await this.pdfService.basculerVisibilitePublique(req.params.id, utilisateur.id);
        
        return this.repondreSucces(res, pdf, 
            `PDF ${pdf.est_public ? 'rendu public' : 'rendu privé'}`);
    });

    /**
     * Informations sur les dons (statique)
     * GET /api/dons/infos
     */
    informationsDons = this.wrapAsync(async (req, res) => {
        const infos = {
            plateforme: "Liberapay", // ou Tipeee, Ko-fi, etc.
            url_don: "https://liberapay.com/generateur-pdf-jdr", // URL fictive
            objectifs: [
                {
                    montant: 50,
                    description: "Hébergement serveur mensuel"
                },
                {
                    montant: 150,
                    description: "Développement nouveaux systèmes JDR"
                },
                {
                    montant: 300,
                    description: "Fonctionnalités premium gratuites"
                }
            ],
            avantages_donateurs: [
                "Accès prioritaire aux nouvelles fonctionnalités",
                "Templates exclusifs",
                "Support technique prioritaire"
            ],
            message: "Votre soutien nous aide à maintenir ce service gratuit et à développer de nouvelles fonctionnalités pour la communauté JDR !"
        };
        
        return this.repondreSucces(res, infos, 'Informations dons récupérées');
    });
}

module.exports = HomeController;