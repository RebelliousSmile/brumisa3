/**
 * Factory pour création de données de test
 * 
 * Fournit des méthodes pour créer rapidement des objets de test
 * selon les patterns définis dans testing.md avec fixtures par système JDR.
 */

const Utilisateur = require('../../src/models/Utilisateur');
const Personnage = require('../../src/models/Personnage');
const Document = require('../../src/models/Document');
const Pdf = require('../../src/models/Pdf');
const SystemeJeu = require('../../src/models/SystemeJeu');
const logger = require('../../src/utils/logManager');

class TestDataFactory {
  /**
   * Créer utilisateur de test avec données valides
   * @param {Object} overrides - Surcharges des propriétés par défaut
   * @returns {Promise<Object>} Utilisateur créé
   */
  static async createTestUser(overrides = {}) {
    const timestamp = Date.now();
    const userData = {
      nom: `Test User ${timestamp}`,
      email: `test-user-${timestamp}@example.com`,
      mot_de_passe: 'password123',
      role: 'UTILISATEUR',
      statut: 'ACTIF',
      premium_expires_at: null,
      ...overrides
    };

    try {
      const utilisateur = new Utilisateur();
      const created = await utilisateur.create(userData);
      logger.debug('Test user created:', { id: created.id, email: created.email });
      return created;
    } catch (error) {
      logger.error('Failed to create test user:', error);
      throw error;
    }
  }

  /**
   * Créer utilisateur Premium de test
   * @param {Object} overrides - Surcharges des propriétés
   * @returns {Promise<Object>} Utilisateur Premium créé
   */
  static async createTestPremiumUser(overrides = {}) {
    const premiumData = {
      role: 'PREMIUM',
      premium_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      ...overrides
    };

    return await this.createTestUser(premiumData);
  }

  /**
   * Créer administrateur de test
   * @param {Object} overrides - Surcharges des propriétés
   * @returns {Promise<Object>} Administrateur créé
   */
  static async createTestAdmin(overrides = {}) {
    const adminData = {
      role: 'ADMIN',
      nom: `Admin Test ${Date.now()}`,
      ...overrides
    };

    return await this.createTestUser(adminData);
  }

  /**
   * Créer personnage de test par système JDR
   * @param {string} systemeJeu - Système JDR (monsterhearts, engrenages, etc.)
   * @param {number} utilisateurId - ID de l'utilisateur propriétaire
   * @param {Object} overrides - Surcharges des propriétés
   * @returns {Promise<Object>} Personnage créé
   */
  static async createTestCharacter(systemeJeu, utilisateurId, overrides = {}) {
    try {
      // Charger les fixtures du système JDR
      const fixtures = this.getCharacterFixtures(systemeJeu);
      const template = fixtures.templates[0]; // Premier template par défaut

      const personnageData = {
        nom: `Test ${template.archetype} ${Date.now()}`,
        systeme_jeu: systemeJeu,
        utilisateur_id: utilisateurId,
        donnees_personnage: template.data,
        statut: 'ACTIF',
        ...overrides
      };

      const personnage = new Personnage();
      const created = await personnage.create(personnageData);
      logger.debug('Test character created:', { 
        id: created.id, 
        nom: created.nom, 
        systeme: systemeJeu 
      });
      return created;
    } catch (error) {
      logger.error(`Failed to create test character for ${systemeJeu}:`, error);
      throw error;
    }
  }

  /**
   * Créer document de test par type
   * @param {string} type - Type de document (CHARACTER, TOWN, etc.)
   * @param {string} systemeJeu - Système JDR
   * @param {number} utilisateurId - ID de l'utilisateur
   * @param {Object} overrides - Surcharges des propriétés
   * @returns {Promise<Object>} Document créé
   */
  static async createTestDocument(type, systemeJeu, utilisateurId, overrides = {}) {
    const documentData = {
      type,
      titre: `Test Document ${type} ${Date.now()}`,
      systeme_jeu: systemeJeu,
      utilisateur_id: utilisateurId,
      donnees: this.getDocumentFixtures(type, systemeJeu),
      statut: 'ACTIF',
      visibilite: 'PRIVE',
      ...overrides
    };

    try {
      const document = new Document();
      const created = await document.create(documentData);
      logger.debug('Test document created:', { 
        id: created.id, 
        type: created.type, 
        systeme: systemeJeu 
      });
      return created;
    } catch (error) {
      logger.error(`Failed to create test document ${type}:`, error);
      throw error;
    }
  }

  /**
   * Créer PDF de test
   * @param {number} utilisateurId - ID de l'utilisateur
   * @param {number} [documentId] - ID du document associé (optionnel)
   * @param {number} [personnageId] - ID du personnage associé (optionnel)
   * @param {Object} overrides - Surcharges des propriétés
   * @returns {Promise<Object>} PDF créé
   */
  static async createTestPdf(utilisateurId, documentId = null, personnageId = null, overrides = {}) {
    const timestamp = Date.now();
    const pdfData = {
      titre: `Test PDF ${timestamp}`,
      nom_fichier: `test-pdf-${timestamp}.pdf`,
      utilisateur_id: utilisateurId,
      document_id: documentId,
      personnage_id: personnageId,
      systeme_jeu: 'monsterhearts',
      statut: 'EN_COURS',
      chemin_fichier: `output/test/test-pdf-${timestamp}.pdf`,
      ...overrides
    };

    try {
      const pdf = new Pdf();
      const created = await pdf.create(pdfData);
      logger.debug('Test PDF created:', { id: created.id, titre: created.titre });
      return created;
    } catch (error) {
      logger.error('Failed to create test PDF:', error);
      throw error;
    }
  }

  /**
   * Créer un système JDR de test
   * @param {Object} overrides - Surcharges des propriétés
   * @returns {Promise<Object>} Système JDR créé
   */
  static async createTestSystemeJeu(overrides = {}) {
    const timestamp = Date.now();
    const systemeData = {
      id: `test-system-${timestamp}`,
      nom_complet: `Test System ${timestamp}`,
      description: 'Système de test pour les tests d\'intégration',
      statut: 'ACTIF',
      version: '1.0.0',
      ...overrides
    };

    try {
      const systeme = new SystemeJeu();
      const created = await systeme.create(systemeData);
      logger.debug('Test system created:', { id: created.id, nom: created.nom_complet });
      return created;
    } catch (error) {
      logger.error('Failed to create test system:', error);
      throw error;
    }
  }

  /**
   * Créer un ensemble complet utilisateur -> personnage -> document -> PDF
   * @param {string} systemeJeu - Système JDR à utiliser
   * @param {Object} options - Options de création
   * @returns {Promise<Object>} Objet avec toutes les entités créées
   */
  static async createFullTestSuite(systemeJeu = 'monsterhearts', options = {}) {
    try {
      // Créer utilisateur
      const utilisateur = await this.createTestUser(options.user);
      
      // Créer personnage
      const personnage = await this.createTestCharacter(
        systemeJeu, 
        utilisateur.id, 
        options.character
      );
      
      // Créer document
      const document = await this.createTestDocument(
        'CHARACTER',
        systemeJeu,
        utilisateur.id,
        { personnage_id: personnage.id, ...options.document }
      );
      
      // Créer PDF (optionnel)
      let pdf = null;
      if (options.includePdf !== false) {
        pdf = await this.createTestPdf(
          utilisateur.id,
          document.id,
          personnage.id,
          { systeme_jeu: systemeJeu, ...options.pdf }
        );
      }

      logger.info('Full test suite created', {
        utilisateur: utilisateur.id,
        personnage: personnage.id,
        document: document.id,
        pdf: pdf?.id
      });

      return {
        utilisateur,
        personnage,
        document,
        pdf
      };
    } catch (error) {
      logger.error('Failed to create full test suite:', error);
      throw error;
    }
  }

  /**
   * Obtenir les fixtures de personnage pour un système JDR
   * @param {string} systemeJeu - Système JDR
   * @returns {Object} Fixtures du système
   */
  static getCharacterFixtures(systemeJeu) {
    const fixtures = {
      monsterhearts: {
        templates: [
          {
            archetype: 'vampire',
            data: {
              stats: { hot: 1, cold: 0, volatile: -1, dark: 2 },
              moves: ['Hypnotic', 'Cold as Ice'],
              harm: { physical: 0, emotional: 0 },
              conditions: [],
              strings: { held: 0, given: 0 }
            }
          },
          {
            archetype: 'werewolf',
            data: {
              stats: { hot: -1, cold: 1, volatile: 2, dark: 0 },
              moves: ['Primal Dominance', 'Scent of Blood'],
              harm: { physical: 0, emotional: 0 }
            }
          }
        ]
      },
      engrenages: {
        templates: [
          {
            archetype: 'investigateur',
            data: {
              competences: {
                investigation: 3,
                combat: 1,
                erudition: 2,
                relation: 1
              },
              equipements: ['Revolver', 'Carnet de notes'],
              contacts: ['Inspecteur Holmes']
            }
          }
        ]
      },
      zombiology: {
        templates: [
          {
            archetype: 'survivant',
            data: {
              stats: {
                force: 2,
                dexterite: 1,
                constitution: 3,
                intelligence: 1,
                sagesse: 2,
                charisme: 0
              },
              competences: ['Survie', 'Combat'],
              equipement: ['Machette', 'Sac de survie']
            }
          }
        ]
      }
    };

    return fixtures[systemeJeu] || fixtures.monsterhearts;
  }

  /**
   * Obtenir les fixtures de document pour un type et système
   * @param {string} type - Type de document
   * @param {string} systemeJeu - Système JDR
   * @returns {Object} Données du document
   */
  static getDocumentFixtures(type, systemeJeu) {
    const fixtures = {
      CHARACTER: {
        niveau: 1,
        experience: 0,
        notes: 'Personnage créé pour les tests'
      },
      TOWN: {
        population: 1000,
        atmosphere: 'Mystérieuse',
        lieux_importants: ['Place centrale', 'Taverne']
      },
      ORGANIZATION: {
        type_organisation: 'Guilde',
        membres: ['Leader', 'Lieutenant'],
        objectifs: ['Contrôler le commerce']
      },
      DANGER: {
        niveau_menace: 'Moyen',
        consequences: ['Blessures', 'Peur'],
        solutions: ['Combat', 'Négociation']
      },
      GENERIQUE: {
        contenu: `Document générique de test pour ${systemeJeu}`,
        tags: ['test', systemeJeu]
      }
    };

    return fixtures[type] || fixtures.GENERIQUE;
  }

  /**
   * Nettoyer les données créées par la factory
   * @param {Array} entities - Liste des entités à supprimer
   * @returns {Promise<void>}
   */
  static async cleanup(entities) {
    try {
      for (const entity of entities.reverse()) { // Ordre inverse pour respecter les FK
        if (entity && entity.id) {
          const modelName = entity.constructor.name;
          await entity.delete(entity.id);
          logger.debug(`Cleaned up ${modelName}:`, entity.id);
        }
      }
    } catch (error) {
      logger.error('Error during factory cleanup:', error);
      // Ne pas lancer d'erreur pour éviter de masquer les vraies erreurs de test
    }
  }
}

module.exports = TestDataFactory;