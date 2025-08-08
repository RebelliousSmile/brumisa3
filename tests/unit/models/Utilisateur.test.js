/**
 * Tests unitaires pour le modèle Utilisateur
 * 
 * Validation complète selon testing.md :
 * - Configuration modèle
 * - Validation Joi
 * - Hooks lifecycle
 * - Relations
 * - Méthodes métier (authentification, rôles, Premium)
 */

const Utilisateur = require('../../../src/models/Utilisateur');
const db = require('../../../src/database/db');
const bcrypt = require('bcryptjs');
const Joi = require('joi');

// Mock des dépendances
jest.mock('../../../src/database/db');
jest.mock('../../../src/utils/logManager');
jest.mock('bcryptjs');

describe('Utilisateur Model', () => {
  let utilisateur;

  beforeEach(() => {
    jest.clearAllMocks();
    utilisateur = new Utilisateur();
  });

  describe('Configuration du modèle', () => {
    test('devrait avoir les propriétés de base correctes', () => {
      expect(utilisateur.tableName).toBe('utilisateurs');
      expect(utilisateur.primaryKey).toBe('id');
      expect(utilisateur.timestamps).toBe(true);
    });

    test('devrait définir les champs fillable correctement', () => {
      expect(utilisateur.fillable).toContain('nom');
      expect(utilisateur.fillable).toContain('email');
      expect(utilisateur.fillable).toContain('role');
      expect(utilisateur.fillable).not.toContain('mot_de_passe_hash');
    });

    test('devrait définir les champs guarded correctement', () => {
      expect(utilisateur.guarded).toContain('mot_de_passe_hash');
      expect(utilisateur.guarded).toContain('tokens_api');
    });

    test('devrait définir les champs hidden correctement', () => {
      expect(utilisateur.hidden).toContain('mot_de_passe_hash');
      expect(utilisateur.hidden).toContain('tokens_api');
      expect(utilisateur.hidden).toContain('code_acces_actuel');
    });

    test('devrait définir les casts appropriés', () => {
      expect(utilisateur.casts).toHaveProperty('premium_expires_at', 'date');
      expect(utilisateur.casts).toHaveProperty('derniere_connexion', 'date');
      expect(utilisateur.casts).toHaveProperty('preferences', 'json');
    });
  });

  describe('Validation Joi', () => {
    test('devrait valider utilisateur avec données correctes', async () => {
      const validData = {
        nom: 'Jean Dupont',
        email: 'jean.dupont@example.com',
        mot_de_passe: 'motdepasse123',
        role: 'UTILISATEUR'
      };

      await expect(utilisateur.validate(validData, 'create')).resolves.toBe(true);
    });

    test('devrait rejeter email invalide', async () => {
      const invalidData = {
        nom: 'Jean Dupont',
        email: 'email-invalide',
        mot_de_passe: 'motdepasse123',
        role: 'UTILISATEUR'
      };

      await expect(utilisateur.validate(invalidData, 'create'))
        .rejects.toThrow('Erreurs de validation');
    });

    test('devrait rejeter mot de passe trop court', async () => {
      const invalidData = {
        nom: 'Jean Dupont',
        email: 'jean@example.com',
        mot_de_passe: '123',
        role: 'UTILISATEUR'
      };

      await expect(utilisateur.validate(invalidData, 'create'))
        .rejects.toThrow('Erreurs de validation');
    });

    test('devrait rejeter rôle invalide', async () => {
      const invalidData = {
        nom: 'Jean Dupont',
        email: 'jean@example.com',
        mot_de_passe: 'motdepasse123',
        role: 'ROLE_INEXISTANT'
      };

      await expect(utilisateur.validate(invalidData, 'create'))
        .rejects.toThrow('Erreurs de validation');
    });

    test('devrait accepter tous les rôles valides', async () => {
      const roles = ['UTILISATEUR', 'PREMIUM', 'ADMIN'];
      
      for (const role of roles) {
        const validData = {
          nom: 'Jean Dupont',
          email: 'jean@example.com',
          mot_de_passe: 'motdepasse123',
          role: role
        };

        await expect(utilisateur.validate(validData, 'create')).resolves.toBe(true);
      }
    });
  });

  describe('Hooks lifecycle', () => {
    beforeEach(() => {
      // Mock bcrypt
      bcrypt.hash.mockResolvedValue('hashed_password');
      bcrypt.compare.mockResolvedValue(true);
      
      // Mock database responses
      db.get.mockResolvedValue({ id: 1, nom: 'Test User' });
      db.run.mockResolvedValue({ rowCount: 1 });
    });

    test('beforeCreate devrait hasher le mot de passe', async () => {
      const userData = {
        nom: 'Test User',
        email: 'test@example.com',
        mot_de_passe: 'plaintext123',
        role: 'UTILISATEUR'
      };

      const result = await utilisateur.beforeCreate(userData);

      expect(bcrypt.hash).toHaveBeenCalledWith('plaintext123', 12);
      expect(result.mot_de_passe_hash).toBe('hashed_password');
      expect(result.mot_de_passe).toBeUndefined(); // Mot de passe en clair supprimé
    });

    test('beforeCreate devrait définir statut par défaut', async () => {
      const userData = {
        nom: 'Test User',
        email: 'test@example.com',
        mot_de_passe: 'plaintext123',
        role: 'UTILISATEUR'
      };

      const result = await utilisateur.beforeCreate(userData);

      expect(result.statut).toBe('ACTIF');
    });

    test('beforeUpdate devrait hasher nouveau mot de passe', async () => {
      const updateData = {
        mot_de_passe: 'nouveau_motdepasse123'
      };

      const result = await utilisateur.beforeUpdate(updateData);

      expect(bcrypt.hash).toHaveBeenCalledWith('nouveau_motdepasse123', 12);
      expect(result.mot_de_passe_hash).toBe('hashed_password');
      expect(result.mot_de_passe).toBeUndefined();
    });

    test('beforeUpdate ne devrait pas hasher si pas de mot de passe', async () => {
      const updateData = {
        nom: 'Nouveau Nom'
      };

      const result = await utilisateur.beforeUpdate(updateData);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(result.nom).toBe('Nouveau Nom');
    });
  });

  describe('Méthodes d\'authentification', () => {
    beforeEach(() => {
      bcrypt.compare.mockResolvedValue(true);
      db.get.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        mot_de_passe_hash: 'hashed_password',
        statut: 'ACTIF'
      });
    });

    test('verifierMotDePasse devrait valider mot de passe correct', async () => {
      const result = await utilisateur.verifierMotDePasse('plaintext123', 'hashed_password');

      expect(bcrypt.compare).toHaveBeenCalledWith('plaintext123', 'hashed_password');
      expect(result).toBe(true);
    });

    test('verifierMotDePasse devrait rejeter mot de passe incorrect', async () => {
      bcrypt.compare.mockResolvedValue(false);

      const result = await utilisateur.verifierMotDePasse('mauvais_mdp', 'hashed_password');

      expect(result).toBe(false);
    });

    test('authentifier devrait retourner utilisateur si valide', async () => {
      const result = await utilisateur.authentifier('test@example.com', 'plaintext123');

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.email).toBe('test@example.com');
    });

    test('authentifier devrait lever erreur si utilisateur inexistant', async () => {
      db.get.mockResolvedValue(null);

      await expect(utilisateur.authentifier('inexistant@example.com', 'mdp'))
        .rejects.toThrow('Utilisateur non trouvé ou mot de passe incorrect');
    });

    test('authentifier devrait lever erreur si utilisateur inactif', async () => {
      db.get.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        statut: 'INACTIF'
      });

      await expect(utilisateur.authentifier('test@example.com', 'mdp'))
        .rejects.toThrow('Compte désactivé');
    });
  });

  describe('Gestion des rôles et Premium', () => {
    test('estPremium devrait retourner true pour utilisateur Premium actif', () => {
      const user = {
        role: 'PREMIUM',
        premium_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };

      const result = utilisateur.estPremium(user);
      expect(result).toBe(true);
    });

    test('estPremium devrait retourner false pour Premium expiré', () => {
      const user = {
        role: 'PREMIUM',
        premium_expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000)
      };

      const result = utilisateur.estPremium(user);
      expect(result).toBe(false);
    });

    test('estPremium devrait retourner true pour ADMIN', () => {
      const user = {
        role: 'ADMIN',
        premium_expires_at: null
      };

      const result = utilisateur.estPremium(user);
      expect(result).toBe(true);
    });

    test('estAdmin devrait retourner true pour ADMIN', () => {
      const user = { role: 'ADMIN' };
      
      const result = utilisateur.estAdmin(user);
      expect(result).toBe(true);
    });

    test('estAdmin devrait retourner false pour non-ADMIN', () => {
      const user = { role: 'PREMIUM' };
      
      const result = utilisateur.estAdmin(user);
      expect(result).toBe(false);
    });

    test('ajouterPremium devrait définir expiration Premium', async () => {
      const userId = 1;
      const dureeJours = 30;
      
      db.get.mockResolvedValue({ 
        id: 1, 
        role: 'PREMIUM',
        premium_expires_at: new Date()
      });

      const result = await utilisateur.ajouterPremium(userId, dureeJours);

      expect(db.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE utilisateurs SET'),
        expect.any(Array)
      );
      expect(result).toBeDefined();
    });
  });

  describe('Relations', () => {
    test('getPersonnages devrait retourner personnages de l\'utilisateur', async () => {
      const mockPersonnages = [
        { id: 1, nom: 'Personnage 1', utilisateur_id: 1 },
        { id: 2, nom: 'Personnage 2', utilisateur_id: 1 }
      ];
      
      db.all.mockResolvedValue(mockPersonnages);

      const result = await utilisateur.getPersonnages(1);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(result[0].nom).toBe('Personnage 1');
    });

    test('getDocuments devrait retourner documents de l\'utilisateur', async () => {
      const mockDocuments = [
        { id: 1, titre: 'Document 1', utilisateur_id: 1 },
        { id: 2, titre: 'Document 2', utilisateur_id: 1 }
      ];
      
      db.all.mockResolvedValue(mockDocuments);

      const result = await utilisateur.getDocuments(1);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    test('getPdfs devrait retourner PDFs de l\'utilisateur', async () => {
      const mockPdfs = [
        { id: 1, titre: 'PDF 1', utilisateur_id: 1 }
      ];
      
      db.all.mockResolvedValue(mockPdfs);

      const result = await utilisateur.getPdfs(1);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    test('getDocumentVotes devrait retourner votes de l\'utilisateur', async () => {
      const mockVotes = [
        { id: 1, document_id: 1, utilisateur_id: 1, qualite_generale: 4 }
      ];
      
      db.all.mockResolvedValue(mockVotes);

      const result = await utilisateur.getDocumentVotes(1);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Gestion des codes d\'accès', () => {
    test('genererCodeAcces devrait créer code 6 chiffres', () => {
      const code = utilisateur.genererCodeAcces();
      
      expect(code).toMatch(/^\d{6}$/);
      expect(code.length).toBe(6);
    });

    test('definirCodeAcces devrait enregistrer nouveau code', async () => {
      db.run.mockResolvedValue({ rowCount: 1 });
      
      await utilisateur.definirCodeAcces(1, '123456');

      expect(db.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE utilisateurs SET code_acces_actuel'),
        expect.arrayContaining(['123456', 1])
      );
    });

    test('validerCodeAcces devrait valider code correct', async () => {
      db.get.mockResolvedValue({
        id: 1,
        code_acces_actuel: '123456',
        statut: 'ACTIF'
      });

      const result = await utilisateur.validerCodeAcces('test@example.com', '123456');
      
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    test('validerCodeAcces devrait rejeter code incorrect', async () => {
      db.get.mockResolvedValue({
        id: 1,
        code_acces_actuel: '123456',
        statut: 'ACTIF'
      });

      await expect(utilisateur.validerCodeAcces('test@example.com', '654321'))
        .rejects.toThrow('Code d\'accès incorrect');
    });
  });

  describe('Statistiques utilisateur', () => {
    test('getStatistiques devrait retourner stats complètes', async () => {
      // Mock des différentes requêtes de stats
      db.get
        .mockResolvedValueOnce({ count: 5 })  // personnages
        .mockResolvedValueOnce({ count: 3 })  // documents
        .mockResolvedValueOnce({ count: 2 })  // pdfs
        .mockResolvedValueOnce({ count: 1 }); // votes

      const stats = await utilisateur.getStatistiques(1);

      expect(stats).toBeDefined();
      expect(stats.personnages_crees).toBe(5);
      expect(stats.documents_crees).toBe(3);
      expect(stats.pdfs_generes).toBe(2);
      expect(stats.votes_emis).toBe(1);
    });
  });

  describe('Méthodes de sérialisation', () => {
    test('serialize devrait masquer les champs sensibles', () => {
      const userData = {
        id: 1,
        nom: 'Jean Dupont',
        email: 'jean@example.com',
        mot_de_passe_hash: 'secret_hash',
        code_acces_actuel: '123456',
        tokens_api: 'secret_token',
        role: 'UTILISATEUR'
      };

      const serialized = utilisateur.serialize(userData);

      expect(serialized.id).toBe(1);
      expect(serialized.nom).toBe('Jean Dupont');
      expect(serialized.email).toBe('jean@example.com');
      expect(serialized.role).toBe('UTILISATEUR');
      expect(serialized.mot_de_passe_hash).toBeUndefined();
      expect(serialized.code_acces_actuel).toBeUndefined();
      expect(serialized.tokens_api).toBeUndefined();
    });
  });
});