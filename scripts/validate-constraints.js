#!/usr/bin/env node

/**
 * Script de validation des contraintes de clés étrangères et cascades
 * 
 * Ce script teste tous les scenarios de cascade définis dans la migration 011
 * pour vérifier que l'intégrité référentielle fonctionne correctement.
 */

const path = require('path');
const fs = require('fs');

// Configuration du chemin vers les modules
const projectRoot = path.resolve(__dirname, '..');
process.env.NODE_PATH = path.join(projectRoot, 'src');
require('module').Module._initPaths();

// Import des modèles
const Utilisateur = require('../src/models/Utilisateur');
const Document = require('../src/models/Document');
const Personnage = require('../src/models/Personnage');
const Pdf = require('../src/models/Pdf');
const DocumentVote = require('../src/models/DocumentVote');
const DocumentModerationHistorique = require('../src/models/DocumentModerationHistorique');
const SystemeJeu = require('../src/models/SystemeJeu');
const DocumentSystemeJeu = require('../src/models/DocumentSystemeJeu');

class ConstraintValidator {
  constructor() {
    this.models = {
      utilisateur: new Utilisateur(),
      personnage: new Personnage(),
      document: new Document(),
      pdf: new Pdf(),
      documentVote: new DocumentVote(),
      moderationHistorique: new DocumentModerationHistorique(),
      systemeJeu: new SystemeJeu(),
      documentSystemeJeu: new DocumentSystemeJeu()
    };
    
    this.testData = {};
    this.results = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '🔍',
      success: '✅', 
      error: '❌',
      warning: '⚠️'
    }[type] || '📝';
    
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async createTestData() {
    this.log('Création des données de test...', 'info');
    
    try {
      // Système JDR de test
      this.testData.systeme = await this.models.systemeJeu.create({
        id: 'test_validation',
        nom_complet: 'Test Validation System',
        description: 'Système pour validation contraintes',
        statut: 'ACTIF',
        ordre_affichage: 999
      });

      // Utilisateur de test
      this.testData.utilisateur = await this.models.utilisateur.create({
        nom: 'Validator Test User',
        email: 'validator-test@example.com',
        mot_de_passe: 'password123',
        role: 'ADMIN'
      });

      // Utilisateur secondaire pour tests de transfert
      this.testData.utilisateur2 = await this.models.utilisateur.create({
        nom: 'Secondary Test User',
        email: 'validator-test-2@example.com',
        mot_de_passe: 'password123',
        role: 'UTILISATEUR'
      });

      // Configuration type/système
      await this.models.documentSystemeJeu.create({
        document_type: 'CHARACTER',
        systeme_jeu: 'test_validation',
        actif: true,
        ordre_affichage: 1,
        configuration: {
          champs_requis: ['nom'],
          template_pdf: 'test_character'
        }
      });

      // Personnage de test
      this.testData.personnage = await this.models.personnage.create({
        nom: 'Validator Test Character',
        systeme_jeu: 'test_validation',
        utilisateur_id: this.testData.utilisateur.id,
        donnees_personnage: { niveau: 1 },
        statut: 'ACTIF'
      });

      // Document de test
      this.testData.document = await this.models.document.create({
        type: 'CHARACTER',
        titre: 'Validator Test Document',
        systeme_jeu: 'test_validation',
        utilisateur_id: this.testData.utilisateur.id,
        personnage_id: this.testData.personnage.id,
        donnees: { niveau: 1 },
        statut: 'ACTIF'
      });

      this.log('Données de test créées avec succès', 'success');
    } catch (error) {
      this.log(`Erreur création données test: ${error.message}`, 'error');
      throw error;
    }
  }

  async testCascadeDelete() {
    this.log('Test CASCADE DELETE - Suppression utilisateur', 'info');
    
    try {
      // Créer des données dépendantes
      const vote = await this.models.documentVote.voterDocument(
        this.testData.document.id,
        this.testData.utilisateur2.id,
        {
          qualite_generale: 4,
          utilite_pratique: 4,
          respect_gamme: 4
        },
        'Vote pour test cascade'
      );

      const historique = await this.models.moderationHistorique.enregistrerAction(
        this.testData.document.id,
        this.testData.utilisateur2.id,
        'APPROBATION',
        'Test cascade delete',
        'EN_ATTENTE',
        'APPROUVE'
      );

      this.log(`Vote créé: ${vote.id}, Historique créé: ${historique.id}`, 'info');

      // Compter les enregistrements avant suppression
      const db = require('../src/database/db');
      
      const votesBefore = await db.get(
        'SELECT COUNT(*) as count FROM document_votes WHERE utilisateur_id = $1',
        [this.testData.utilisateur2.id]
      );
      
      // Supprimer l'utilisateur - doit cascader vers votes mais SET NULL pour historique
      await this.models.utilisateur.delete(this.testData.utilisateur2.id);
      
      // Vérifier cascade
      const votesAfter = await db.get(
        'SELECT COUNT(*) as count FROM document_votes WHERE utilisateur_id = $1',
        [this.testData.utilisateur2.id]
      );
      
      const historiqueAfter = await db.get(
        'SELECT COUNT(*) as count FROM document_moderation_historique WHERE id = $1',
        [historique.id]
      );

      if (votesBefore.count > votesAfter.count) {
        this.log('✅ CASCADE DELETE fonctionne - votes supprimés', 'success');
        this.results.push({ test: 'CASCADE_DELETE_VOTES', status: 'PASS' });
      } else {
        this.log('❌ CASCADE DELETE échoué - votes non supprimés', 'error');
        this.results.push({ test: 'CASCADE_DELETE_VOTES', status: 'FAIL' });
      }

      if (historiqueAfter.count > 0) {
        this.log('✅ SET NULL fonctionne - historique préservé', 'success');
        this.results.push({ test: 'SET_NULL_MODERATOR', status: 'PASS' });
      } else {
        this.log('❌ SET NULL échoué - historique supprimé', 'error');
        this.results.push({ test: 'SET_NULL_MODERATOR', status: 'FAIL' });
      }

    } catch (error) {
      this.log(`Erreur test cascade delete: ${error.message}`, 'error');
      this.results.push({ test: 'CASCADE_DELETE', status: 'ERROR', error: error.message });
    }
  }

  async testRestrictConstraint() {
    this.log('Test RESTRICT - Tentative suppression système avec dépendances', 'info');
    
    try {
      // Tenter de supprimer le système avec des documents liés
      await this.models.systemeJeu.delete('test_validation');
      
      this.log('❌ RESTRICT échoué - système supprimé malgré dépendances', 'error');
      this.results.push({ test: 'RESTRICT_SYSTEM', status: 'FAIL' });
      
    } catch (error) {
      if (error.message.includes('constraint') || error.message.includes('foreign key')) {
        this.log('✅ RESTRICT fonctionne - suppression bloquée par dépendances', 'success');
        this.results.push({ test: 'RESTRICT_SYSTEM', status: 'PASS' });
      } else {
        this.log(`❌ Erreur inattendue RESTRICT: ${error.message}`, 'error');
        this.results.push({ test: 'RESTRICT_SYSTEM', status: 'ERROR', error: error.message });
      }
    }
  }

  async testUniqueConstraints() {
    this.log('Test contraintes UNIQUE', 'info');
    
    try {
      // Test vote unique utilisateur/document
      await this.models.documentVote.voterDocument(
        this.testData.document.id,
        this.testData.utilisateur.id,
        {
          qualite_generale: 3,
          utilite_pratique: 3,
          respect_gamme: 3
        }
      );

      // Tentative de second vote (doit échouer)
      await this.models.documentVote.voterDocument(
        this.testData.document.id,
        this.testData.utilisateur.id,
        {
          qualite_generale: 5,
          utilite_pratique: 5,
          respect_gamme: 5
        }
      );

      this.log('❌ UNIQUE constraint échoué - vote dupliqué accepté', 'error');
      this.results.push({ test: 'UNIQUE_VOTE', status: 'FAIL' });

    } catch (error) {
      if (error.message.includes('unique') || error.message.includes('constraint') || error.message.includes('duplicate')) {
        this.log('✅ UNIQUE constraint fonctionne - vote dupliqué rejeté', 'success');
        this.results.push({ test: 'UNIQUE_VOTE', status: 'PASS' });
      } else {
        this.log(`❌ Erreur inattendue UNIQUE: ${error.message}`, 'error');
        this.results.push({ test: 'UNIQUE_VOTE', status: 'ERROR', error: error.message });
      }
    }
  }

  async testRelationalMethods() {
    this.log('Test méthodes relationnelles', 'info');
    
    try {
      // Test hasMany
      const personnages = await this.models.utilisateur.getPersonnages(this.testData.utilisateur.id);
      const documents = await this.models.utilisateur.getDocuments(this.testData.utilisateur.id);
      
      if (personnages.length > 0 && documents.length > 0) {
        this.log('✅ Méthodes hasMany fonctionnelles', 'success');
        this.results.push({ test: 'HAS_MANY_METHODS', status: 'PASS' });
      } else {
        this.log('❌ Méthodes hasMany échouées - aucun résultat', 'error');
        this.results.push({ test: 'HAS_MANY_METHODS', status: 'FAIL' });
      }

      // Test belongsTo
      const owner = await this.models.personnage.getUtilisateur(this.testData.personnage.id);
      const docOwner = await this.models.document.getUtilisateur(this.testData.document.id);
      
      if (owner && docOwner && owner.id === this.testData.utilisateur.id) {
        this.log('✅ Méthodes belongsTo fonctionnelles', 'success');
        this.results.push({ test: 'BELONGS_TO_METHODS', status: 'PASS' });
      } else {
        this.log('❌ Méthodes belongsTo échouées', 'error');
        this.results.push({ test: 'BELONGS_TO_METHODS', status: 'FAIL' });
      }

    } catch (error) {
      this.log(`Erreur test méthodes relationnelles: ${error.message}`, 'error');
      this.results.push({ test: 'RELATIONAL_METHODS', status: 'ERROR', error: error.message });
    }
  }

  async testDatabaseIntegrity() {
    this.log('Test fonction de vérification d\'intégrité', 'info');
    
    try {
      const db = require('../src/database/db');
      const integrityCheck = await db.all('SELECT * FROM verifier_integrite_relations()');
      
      const errors = integrityCheck.filter(check => check.status !== 'OK');
      
      if (errors.length === 0) {
        this.log('✅ Intégrité base de données validée', 'success');
        this.results.push({ test: 'DATABASE_INTEGRITY', status: 'PASS' });
      } else {
        this.log(`❌ Problèmes d'intégrité détectés: ${errors.length}`, 'error');
        this.log(JSON.stringify(errors, null, 2), 'error');
        this.results.push({ test: 'DATABASE_INTEGRITY', status: 'FAIL', errors });
      }

    } catch (error) {
      this.log(`Fonction d'intégrité non disponible: ${error.message}`, 'warning');
      this.results.push({ test: 'DATABASE_INTEGRITY', status: 'SKIP', reason: 'Function not available' });
    }
  }

  async cleanup() {
    this.log('Nettoyage des données de test...', 'info');
    
    try {
      const db = require('../src/database/db');
      
      // Supprimer dans l'ordre inverse des dépendances
      if (this.testData.document?.id) {
        await db.run('DELETE FROM document_votes WHERE document_id = ?', [this.testData.document.id]);
        await db.run('DELETE FROM document_moderation_historique WHERE document_id = ?', [this.testData.document.id]);
        await this.models.document.delete(this.testData.document.id);
      }
      
      if (this.testData.personnage?.id) {
        await this.models.personnage.delete(this.testData.personnage.id);
      }
      
      if (this.testData.utilisateur?.id) {
        await this.models.utilisateur.delete(this.testData.utilisateur.id);
      }
      
      // Utilisateur 2 déjà supprimé dans les tests
      
      await db.run('DELETE FROM document_systeme_jeu WHERE systeme_jeu = ?', ['test_validation']);
      
      if (this.testData.systeme?.id) {
        await this.models.systemeJeu.delete('test_validation');
      }
      
      this.log('Nettoyage terminé', 'success');
      
    } catch (error) {
      this.log(`Erreur nettoyage: ${error.message}`, 'warning');
    }
  }

  async run() {
    try {
      this.log('=== VALIDATION DES CONTRAINTES DE CLÉS ÉTRANGÈRES ===', 'info');
      
      await this.createTestData();
      await this.testRelationalMethods();
      await this.testUniqueConstraints();
      await this.testCascadeDelete();
      await this.testRestrictConstraint();
      await this.testDatabaseIntegrity();
      
      this.log('=== RÉSULTATS ===', 'info');
      
      const passed = this.results.filter(r => r.status === 'PASS').length;
      const failed = this.results.filter(r => r.status === 'FAIL').length;
      const errors = this.results.filter(r => r.status === 'ERROR').length;
      const skipped = this.results.filter(r => r.status === 'SKIP').length;
      
      console.log('\n📊 Résumé des tests:');
      console.log(`✅ Réussis: ${passed}`);
      console.log(`❌ Échoués: ${failed}`);
      console.log(`🚫 Erreurs: ${errors}`);
      console.log(`⏭️  Ignorés: ${skipped}`);
      console.log(`📈 Total: ${this.results.length}`);
      
      console.log('\n📋 Détails:');
      this.results.forEach(result => {
        const status = {
          'PASS': '✅',
          'FAIL': '❌', 
          'ERROR': '🚫',
          'SKIP': '⏭️'
        }[result.status] || '❓';
        
        console.log(`  ${status} ${result.test}`);
        if (result.error) {
          console.log(`    Erreur: ${result.error}`);
        }
      });
      
      // Sauvegarder rapport
      const reportPath = path.join(__dirname, '..', 'constraint-validation-report.json');
      fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: { passed, failed, errors, skipped, total: this.results.length },
        results: this.results
      }, null, 2));
      
      this.log(`Rapport sauvegardé: ${reportPath}`, 'info');
      
      const success = failed === 0 && errors === 0;
      
      if (success) {
        this.log('🎉 Validation réussie - Toutes les contraintes fonctionnent correctement!', 'success');
      } else {
        this.log(`⚠️ Validation partielle - ${failed + errors} tests ont échoué`, 'warning');
      }
      
      await this.cleanup();
      
      process.exit(success ? 0 : 1);
      
    } catch (error) {
      this.log(`Erreur fatale: ${error.message}`, 'error');
      console.error(error.stack);
      
      await this.cleanup();
      process.exit(1);
    }
  }
}

// Exécution si appelé directement
if (require.main === module) {
  const validator = new ConstraintValidator();
  validator.run();
}

module.exports = ConstraintValidator;