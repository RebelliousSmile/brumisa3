// ========================================
// src/controllers/BaseController.js - SOLID: Interface Segregation
// ========================================
const { createLogger } = require('../utils/logManager');

class BaseController {
  constructor(nomControleur) {
    this.logger = createLogger(`Controller:${nomControleur}`);
  }

  /**
   * Gère les erreurs de manière uniforme (DRY)
   */
  gererErreur(res, erreur, codeStatut = 500) {
    this.logger.error('Erreur contrôleur:', erreur);
    
    if (erreur.name === 'ValidationError') {
      return res.status(400).json({
        succes: false,
        message: erreur.message,
        type: 'validation'
      });
    }
    
    return res.status(codeStatut).json({
      succes: false,
      message: erreur.message || 'Erreur interne du serveur',
      type: 'erreur'
    });
  }

  /**
   * Réponse de succès standardisée (DRY)
   */
  reponseSucces(res, donnees = null, message = 'Opération réussie', codeStatut = 200) {
    return res.status(codeStatut).json({
      succes: true,
      message,
      donnees
    });
  }

  /**
   * Réponse avec rendu de vue (DRY)
   */
  rendrePage(res, template, donnees = {}, titre = '') {
    return res.render(template, {
      ...donnees,
      titre,
      utilisateur: res.locals.utilisateur,
      moment: require('moment')
    });
  }

  /**
   * Vérifie l'authentification
   */
  verifierAuthentification(req, res, next) {
    if (!req.session.utilisateur) {
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(401).json({
          succes: false,
          message: 'Authentification requise'
        });
      }
      return res.redirect('/connexion');
    }
    next();
  }

  /**
   * Vérifie les permissions
   */
  verifierPermissions(roleMinimum) {
    return (req, res, next) => {
      const utilisateur = req.session.utilisateur;
      const Utilisateur = require('../models/Utilisateur');
      
      if (!Utilisateur.aRole(utilisateur, roleMinimum)) {
        if (req.xhr || req.headers.accept?.includes('application/json')) {
          return res.status(403).json({
            succes: false,
            message: 'Permissions insuffisantes'
          });
        }
        return res.status(403).render('erreurs/403', {
          titre: 'Accès refusé',
          message: 'Vous n\'avez pas les permissions nécessaires'
        });
      }
      next();
    };
  }
}

module.exports = BaseController;

// ========================================
// src/controllers/AuthentificationController.js - Inspiré d'EuroCeramic
// ========================================
const BaseController = require('./BaseController');
const bcrypt = require('bcryptjs');
const Utilisateur = require('../models/Utilisateur');
const UtilisateurService = require('../services/UtilisateurService');

class AuthentificationController extends BaseController {
  constructor() {
    super('Authentification');
  }

  /**
   * Affiche la page d'inscription
   */
  afficherInscription = (req, res) => {
    try {
      if (req.session.utilisateur) {
        return res.redirect('/tableau-bord');
      }
      
      this.rendrePage(res, 'auth/inscription', {}, 'Inscription');
    } catch (erreur) {
      this.gererErreur(res, erreur);
    }
  };

  /**
   * Traite l'inscription d'un nouvel utilisateur
   */
  traiterInscription = async (req, res) => {
    try {
      const { email, nom_utilisateur, mot_de_passe, prenom, nom } = req.body;
      
      // Vérifier si l'utilisateur existe déjà
      const utilisateurExistant = await UtilisateurService.chercherParEmail(email);
      if (utilisateurExistant) {
        return this.gererErreur(res, new Error('Cet email est déjà utilisé'), 400);
      }
      
      const utilisateurExistantNom = await UtilisateurService.chercherParNomUtilisateur(nom_utilisateur);
      if (utilisateurExistantNom) {
        return this.gererErreur(res, new Error('Ce nom d\'utilisateur est déjà pris'), 400);
      }
      
      // Créer l'utilisateur
      const nouvelUtilisateur = await Utilisateur.creer({
        email,
        nom_utilisateur,
        mot_de_passe,
        prenom,
        nom
      });
      
      // Sauvegarder en base
      const utilisateurSauvegarde = await UtilisateurService.creer(nouvelUtilisateur);
      
      // Connecter automatiquement
      req.session.utilisateur = Utilisateur.formater(utilisateurSauvegarde);
      
      this.logger.info('Nouvel utilisateur inscrit', { 
        id: utilisateurSauvegarde.id, 
        email: utilisateurSauvegarde.email 
      });
      
      if (req.xhr) {
        return this.reponseSucces(res, 
          Utilisateur.formater(utilisateurSauvegarde), 
          'Inscription réussie', 
          201
        );
      }
      
      res.redirect('/tableau-bord');
    } catch (erreur) {
      this.gererErreur(res, erreur);
    }
  };

  /**
   * Affiche la page de connexion
   */
  afficherConnexion = (req, res) => {
    try {
      if (req.session.utilisateur) {
        return res.redirect('/tableau-bord');
      }
      
      this.rendrePage(res, 'auth/connexion', {}, 'Connexion');
    } catch (erreur) {
      this.gererErreur(res, erreur);
    }
  };

  /**
   * Traite la connexion d'un utilisateur
   */
  traiterConnexion = async (req, res) => {
    try {
      const donneesValidees = Utilisateur.valider(req.body, 'connexion');
      
      // Chercher l'utilisateur
      const utilisateur = await UtilisateurService.chercherParEmail(donneesValidees.email);
      if (!utilisateur || !utilisateur.actif) {
        return this.gererErreur(res, new Error('Email ou mot de passe incorrect'), 401);
      }
      
      // Vérifier le mot de passe
      const motDePasseValide = await bcrypt.compare(donneesValidees.mot_de_passe, utilisateur.mot_de_passe);
      if (!motDePasseValide) {
        return this.gererErreur(res, new Error('Email ou mot de passe incorrect'), 401);
      }
      
      // Mettre à jour la dernière connexion
      await UtilisateurService.mettreAJourDerniereConnexion(utilisateur.id);
      
      // Stocker dans la session
      req.session.utilisateur = Utilisateur.formater({
        ...utilisateur,
        derniere_connexion: new Date().toISOString()
      });
      
      this.logger.info('Utilisateur connecté', { 
        id: utilisateur.id, 
        email: utilisateur.email 
      });
      
      if (req.xhr) {
        return this.reponseSucces(res, req.session.utilisateur, 'Connexion réussie');
      }
      
      res.redirect('/tableau-bord');
    } catch (erreur) {
      this.gererErreur(res, erreur);
    }
  };

  /**
   * Déconnecte l'utilisateur
   */
  deconnecter = (req, res) => {
    try {
      const utilisateurId = req.session.utilisateur?.id;
      
      req.session.destroy((err) => {
        if (err) {
          this.logger.error('Erreur lors de la déconnexion:', err);
        }
        
        this.logger.info('Utilisateur déconnecté', { id: utilisateurId });
        
        if (req.xhr) {
          return this.reponseSucces(res, null, 'Déconnexion réussie');
        }
        
        res.redirect('/');
      });
    } catch (erreur) {
      this.gererErreur(res, erreur);
    }
  };

  /**
   * Élévation de rôle (inspiré d'EuroCeramic)
   */
  traiterElevationRole = async (req, res) => {
    try {
      const { code_acces } = req.body;
      const utilisateur = req.session.utilisateur;
      
      if (!utilisateur) {
        return this.gererErreur(res, new Error('Utilisateur non connecté'), 401);
      }
      
      const nouveauRole = Utilisateur.verifierCodeAcces(code_acces);
      if (!nouveauRole) {
        return this.gererErreur(res, new Error('Code d\'accès invalide'), 400);
      }
      
      // Élever le rôle
      const utilisateurEleve = Utilisateur.elevuerRole(utilisateur, nouveauRole);
      
      // Sauvegarder en base
      await UtilisateurService.mettreAJour(utilisateur.id, { role: nouveauRole });
      
      // Mettre à jour la session
      req.session.utilisateur = utilisateurEleve;
      
      this.logger.info('Rôle utilisateur élevé', { 
        id: utilisateur.id, 
        ancien_role: utilisateur.role,
        nouveau_role: nouveauRole 
      });
      
      if (req.xhr) {
        return this.reponseSucces(res, utilisateurEleve, `Rôle élevé vers ${nouveauRole}`);
      }
      
      res.redirect('/tableau-bord');
    } catch (erreur) {
      this.gererErreur(res, erreur);
    }
  };
}

module.exports = new AuthentificationController();

// ========================================
// src/controllers/PersonnageController.js - Gestion des personnages
// ========================================
const BaseController = require('./BaseController');
const Personnage = require('../models/Personnage');
const PersonnageService = require('../services/PersonnageService');
const systemesJeu = require('../utils/systemesJeu');

class PersonnageController extends BaseController {
  constructor() {
    super('Personnage');
  }

  /**
   * Liste les personnages de l'utilisateur
   */
  listerPersonnages = async (req, res) => {
    try {
      const utilisateur = req.session.utilisateur;
      const personnages = await PersonnageService.listerParUtilisateur(utilisateur.id);
      
      const personnagesFormats = personnages.map(p => Personnage.formater(p));
      
      if (req.xhr) {
        return this.reponseSucces(res, personnagesFormats);
      }
      
      this.rendrePage(res, 'personnages/liste', {
        personnages: personnagesFormats,
        systemes: systemesJeu.templates
      }, 'Mes Personnages');
    } catch (erreur) {
      this.gererErreur(res, erreur);
    }
  };

  /**
   * Affiche le formulaire de création
   */
  afficherCreation = (req, res) => {
    try {
      const systeme = req.query.systeme || 'MONSTERHEARTS';
      const templateSysteme = systemesJeu.templates[systeme];
      
      if (!templateSysteme) {
        return this.gererErreur(res, new Error('Système de jeu non supporté'), 400);
      }
      
      this.rendrePage(res, 'personnages/creation', {
        systeme,
        templateSysteme,
        systemesDisponibles: systemesJeu.templates
      }, `Nouveau Personnage ${templateSysteme.nom}`);
    } catch (erreur) {
      this.gererErreur(res, erreur);
    }
  };

  /**
   * Crée un nouveau personnage
   */
  creerPersonnage = async (req, res) => {
    try {
      const utilisateur = req.session.utilisateur;
      const donneesPersonnage = req.body;
      
      // Validation et traitement via le modèle
      const nouveauPersonnage = await Personnage.creer(donneesPersonnage, utilisateur.id);
      
      // Sauvegarde en base
      const personnageSauvegarde = await PersonnageService.creer(nouveauPersonnage);
      
      this.logger.info('Personnage créé', {
        id: personnageSauvegarde.id,
        nom: personnageSauvegarde.nom,
        utilisateur: utilisateur.id
      });
      
      if (req.xhr) {
        return this.reponseSucces(res, 
          Personnage.formater(personnageSauvegarde), 
          'Personnage créé avec succès', 
          201
        );
      }
      
      res.redirect(`/personnages/${personnageSauvegarde.id}`);
    } catch (erreur) {
      this.gererErreur(res, erreur);
    }
  };

  /**
   * Affiche un personnage spécifique
   */
  afficherPersonnage = async (req, res) => {
    try {
      const { id } = req.params;
      const utilisateur = req.session.utilisateur;
      
      const personnage = await PersonnageService.chercherParId(id);
      
      if (!personnage || personnage.id_utilisateur !== utilisateur.id) {
        return this.gererErreur(res, new Error('Personnage non trouvé'), 404);
      }
      
      const personnageFormat = Personnage.formater(personnage);
      const templateSysteme = systemesJeu.templates[personnage.systeme];
      
      if (req.xhr) {
        return this.reponseSucces(res, personnageFormat);
      }
      
      this.rendrePage(res, 'personnages/fiche', {
        personnage: personnageFormat,
        templateSysteme
      }, `${personnage.nom} - ${templateSysteme?.nom || personnage.systeme}`);
    } catch (erreur) {
      this.gererErreur(res, erreur);
    }
  };

  /**
   * Affiche le formulaire d'édition
   */
  afficherEdition = async (req, res) => {
    try {
      const { id } = req.params;
      const utilisateur = req.session.utilisateur;
      
      const personnage = await PersonnageService.chercherParId(id);
      
      if (!personnage || personnage.id_utilisateur !== utilisateur.id) {
        return this.gererErreur(res, new Error('Personnage non trouvé'), 404);
      }
      
      const templateSysteme = systemesJeu.templates[personnage.systeme];
      
      this.rendrePage(res, 'personnages/edition', {
        personnage: Personnage.formater(personnage),
        templateSysteme,
        systemesDisponibles: systemesJeu.templates
      }, `Édition - ${personnage.nom}`);
    } catch (erreur) {
      this.gererErreur(res, erreur);
    }
  };

  /**
   * Met à jour un personnage
   */
  mettreAJourPersonnage = async (req, res) => {
    try {
      const { id } = req.params;
      const utilisateur = req.session.utilisateur;
      const donneesModification = req.body;
      
      const personnage = await PersonnageService.chercherParId(id);
      
      if (!personnage || personnage.id_utilisateur !== utilisateur.id) {
        return this.gererErreur(res, new Error('Personnage non trouvé'), 404);
      }
      
      // Traitement des données via le modèle
      const donneesTraitees = Personnage.traiterDonneesSysteme({
        ...donneesModification,
        systeme: personnage.systeme
      });
      
      // Mise à jour
      const personnageMisAJour = await PersonnageService.mettreAJour(id, {
        ...donneesTraitees,
        date_modification: new Date().toISOString()
      });
      
      this.logger.info('Personnage mis à jour', { id, utilisateur: utilisateur.id });
      
      if (req.xhr) {
        return this.reponseSucces(res, 
          Personnage.formater(personnageMisAJour), 
          'Personnage mis à jour avec succès'
        );
      }
      
      res.redirect(`/personnages/${id}`);
    } catch (erreur) {
      this.gererErreur(res, erreur);
    }
  };

  /**
   * Duplique un personnage
   */
  dupliquerPersonnage = async (req, res) => {
    try {
      const { id } = req.params;
      const { nouveau_nom } = req.body;
      const utilisateur = req.session.utilisateur;
      
      const personnageOriginal = await PersonnageService.chercherParId(id);
      
      if (!personnageOriginal || personnageOriginal.id_utilisateur !== utilisateur.id) {
        return this.gererErreur(res, new Error('Personnage non trouvé'), 404);
      }
      
      // Duplication via le modèle
      const personnageDuplique = Personnage.dupliquer(personnageOriginal, nouveau_nom);
      
      // Sauvegarde
      const personnageSauvegarde = await PersonnageService.creer(personnageDuplique);
      
      this.logger.info('Personnage dupliqué', {
        original: id,
        nouveau: personnageSauvegarde.id,
        utilisateur: utilisateur.id
      });
      
      if (req.xhr) {
        return this.reponseSucces(res, 
          Personnage.formater(personnageSauvegarde), 
          'Personnage dupliqué avec succès'
        );
      }
      
      res.redirect(`/personnages/${personnageSauvegarde.id}`);
    } catch (erreur) {
      this.gererErreur(res, erreur);
    }
  };

  /**
   * Supprime un personnage (soft delete)
   */
  supprimerPersonnage = async (req, res) => {
    try {
      const { id } = req.params;
      const utilisateur = req.session.utilisateur;
      
      const personnage = await PersonnageService.chercherParId(id);
      
      if (!personnage || personnage.id_utilisateur !== utilisateur.id) {
        return this.gererErreur(res, new Error('Personnage non trouvé'), 404);
      }
      
      // Soft delete
      await PersonnageService.mettreAJour(id, { 
        actif: false,
        date_suppression: new Date().toISOString()
      });
      
      this.logger.info('Personnage supprimé', { id, utilisateur: utilisateur.id });
      
      if (req.xhr) {
        return this.reponseSucces(res, null, 'Personnage supprimé avec succès');
      }
      
      res.redirect('/personnages');
    } catch (erreur) {
      this.gererErreur(res, erreur);
    }
  };

  /**
   * API: Récupère les templates d'un système
   */
  obtenirTemplatesSysteme = (req, res) => {
    try {
      const { systeme } = req.params;
      const templateSysteme = systemesJeu.templates[systeme];
      
      if (!templateSysteme) {
        return this.gererErreur(res, new Error('Système non trouvé'), 404);
      }
      
      this.reponseSucces(res, templateSysteme);
    } catch (erreur) {
      this.gererErreur(res, erreur);
    }
  };
}

module.exports = new PersonnageController();

// ========================================
// src/controllers/PdfController.js - Génération de PDFs
// ========================================
const BaseController = require('./BaseController');
const Pdf = require('../models/Pdf');
const PdfService = require('../services/PdfService');
const PersonnageService = require('../services/PersonnageService');

class PdfController extends BaseController {
  constructor() {
    super('Pdf');
  }

  /**
   * Liste les PDFs de l'utilisateur
   */
  listerPdfs = async (req, res) => {
    try {
      const utilisateur = req.session.utilisateur;
      const pdfs = await PdfService.listerParUtilisateur(utilisateur.id);
      
      const pdfsFormats = pdfs.map(p => Pdf.formater(p));
      
      if (req.xhr) {
        return this.reponseSucces(res, pdfsFormats);
      }
      
      this.rendrePage(res, 'pdfs/liste', {
        pdfs: pdfsFormats
      }, 'Mes PDFs');
    } catch (erreur) {
      this.gererErreur(res, erreur);
    }
  };

  /**
   * Génère un PDF de fiche de personnage
   */
  genererFichePersonnage = async (req, res) => {
    try {
      const { id_personnage } = req.params;
      const utilisateur = req.session.utilisateur;
      
      // Vérifier que le personnage appartient à l'utilisateur
      const personnage = await PersonnageService.chercherParId(id_personnage);
      if (!personnage || personnage.id_utilisateur !== utilisateur.id) {
        return this.gererErreur(res, new Error('Personnage non trouvé'), 404);
      }
      
      // Créer l'entrée PDF
      const donnesPdf = {
        titre: `Fiche de ${personnage.nom}`,
        type: Pdf.types.FICHE_PERSONNAGE,
        id_personnage: personnage.id,
        donnees_template: personnage
      };
      
      const nouveauPdf = Pdf.creer(donnesPdf, utilisateur.id);
      const pdfSauvegarde = await PdfService.creer(nouveauPdf);
      
      // Démarrer la génération en arrière-plan
      PdfService.genererPdfAsynchrone(pdfSauvegarde.id)
        .then(() => {
          this.logger.info('PDF généré avec succès', { id: pdfSauvegarde.id });
        })
        .catch((erreur) => {
          this.logger.error('Erreur génération PDF:', erreur);
        });
      
      if (req.xhr) {
        return this.reponseSucces(res, 
          Pdf.formater(pdfSauvegarde), 
          'Génération PDF démarrée', 
          202
        );
      }
      
      res.redirect(`/pdfs/${pdfSauvegarde.id}`);
    } catch (erreur) {
      this.gererErreur(res, erreur);
    }
  };

  /**
   * Affiche le statut d'un PDF
   */
  afficherPdf = async (req, res) => {
    try {
      const { id } = req.params;
      const utilisateur = req.session.utilisateur;
      
      const pdf = await PdfService.chercherParId(id);
      
      if (!pdf || pdf.id_utilisateur !== utilisateur.id) {
        return this.gererErreur(res, new Error('PDF non trouvé'), 404);
      }
      
      const pdfFormat = Pdf.formater(pdf);
      
      if (req.xhr) {
        return this.reponseSucces(res, pdfFormat);
      }
      
      this.rendrePage(res, 'pdfs/details', {
        pdf: pdfFormat
      }, `PDF - ${pdf.titre}`);
    } catch (erreur) {
      this.gererErreur(res, erreur);
    }
  };

  /**
   * Télécharge un PDF
   */
  telechargerPdf = async (req, res) => {
    try {
      const { id } = req.params;
      const utilisateur = req.session.utilisateur;
      
      const pdf = await PdfService.chercherParId(id);
      
      if (!pdf || pdf.id_utilisateur !== utilisateur.id) {
        return this.gererErreur(res, new Error('PDF non trouvé'), 404);
      }
      
      if (pdf.statut !== Pdf.statuts.TERMINE) {
        return this.gererErreur(res, new Error('PDF pas encore prêt'), 400);
      }
      
      const cheminFichier = await PdfService.obtenirCheminFichier(pdf);
      
      res.download(cheminFichier, pdf.nom_fichier, (erreur) => {
        if (erreur) {
          this.logger.error('Erreur téléchargement PDF:', erreur);
          this.gererErreur(res, erreur);
        } else {
          this.logger.info('PDF téléchargé', { id, utilisateur: utilisateur.id });
        }
      });
    } catch (erreur) {
      this.gererErreur(res, erreur);
    }
  };

  /**
   * Supprime un PDF
   */
  supprimerPdf = async (req, res) => {
    try {
      const { id } = req.params;
      const utilisateur = req.session.utilisateur;
      
      const pdf = await PdfService.chercherParId(id);
      
      if (!pdf || pdf.id_utilisateur !== utilisateur.id) {
        return this.gererErreur(res, new Error('PDF non trouvé'), 404);
      }
      
      await PdfService.supprimer(id);
      
      this.logger.info('PDF supprimé', { id, utilisateur: utilisateur.id });
      
      if (req.xhr) {
        return this.reponseSucces(res, null, 'PDF supprimé avec succès');
      }
      
      res.redirect('/pdfs');
    } catch (erreur) {
      this.gererErreur(res, erreur);
    }
  };
}

module.exports = new PdfController();