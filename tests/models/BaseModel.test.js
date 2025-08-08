const BaseModel = require('../../src/models/BaseModel');
const db = require('../../src/database/db');
const Joi = require('joi');

// Mock du module db
jest.mock('../../src/database/db');
jest.mock('../../src/utils/logManager');

describe('BaseModel', () => {
  let baseModel;

  beforeEach(() => {
    // Reset des mocks
    jest.clearAllMocks();
    
    // Crée une instance de test
    class TestModel extends BaseModel {
      constructor() {
        super('test_table', 'id');
        this.fillable = ['nom', 'email'];
        this.guarded = ['password_hash'];
        this.hidden = ['password_hash', 'secret'];
        this.casts = {
          metadata: 'json',
          is_active: 'boolean',
          created_at: 'date'
        };
      }

      getValidationSchema(operation = 'create') {
        return Joi.object({
          nom: Joi.string().min(2).max(50).required(),
          email: Joi.string().email().required()
        }).unknown(false); // Supprime les champs non autorisés
      }
    }
    
    baseModel = new TestModel();
  });

  describe('Constructor et configuration', () => {
    test('devrait initialiser avec les bonnes propriétés', () => {
      expect(baseModel.tableName).toBe('test_table');
      expect(baseModel.primaryKey).toBe('id');
      expect(baseModel.fillable).toEqual(['nom', 'email']);
      expect(baseModel.guarded).toEqual(['password_hash']);
      expect(baseModel.hidden).toEqual(['password_hash', 'secret']);
      expect(baseModel.timestamps).toBe(true);
    });
  });

  describe('convertPlaceholders', () => {
    test('devrait convertir ? vers placeholders PostgreSQL', () => {
      const result = baseModel.convertPlaceholders(
        'SELECT * FROM test WHERE id = ? AND nom = ?', 
        [1, 'test']
      );
      
      expect(result.sql).toBe('SELECT * FROM test WHERE id = $1 AND nom = $2');
      expect(result.params).toEqual([1, 'test']);
    });

    test('devrait gérer les requêtes sans placeholders', () => {
      const result = baseModel.convertPlaceholders('SELECT * FROM test', []);
      
      expect(result.sql).toBe('SELECT * FROM test');
      expect(result.params).toEqual([]);
    });
  });

  describe('fillableData', () => {
    test('devrait filtrer selon fillable quand défini', () => {
      const data = {
        nom: 'John',
        email: 'john@test.com',
        password_hash: 'secret',
        unauthorized: 'value'
      };
      
      const filtered = baseModel.fillableData(data);
      
      expect(filtered).toEqual({
        nom: 'John',
        email: 'john@test.com'
      });
    });

    test('devrait exclure les champs guarded', () => {
      baseModel.fillable = []; // Permet tout sauf guarded
      
      const data = {
        nom: 'John',
        email: 'john@test.com',
        password_hash: 'secret'
      };
      
      const filtered = baseModel.fillableData(data);
      
      expect(filtered).toEqual({
        nom: 'John',
        email: 'john@test.com'
      });
      expect(filtered.password_hash).toBeUndefined();
    });
  });

  describe('castAttributes', () => {
    test('devrait convertir les types selon casts', () => {
      const data = {
        nom: 'John',
        metadata: '{"key": "value"}',
        is_active: 1,
        created_at: '2025-08-08T10:00:00Z'
      };
      
      const casted = baseModel.castAttributes(data);
      
      expect(casted.nom).toBe('John');
      expect(casted.metadata).toEqual({ key: 'value' });
      expect(casted.is_active).toBe(true);
      expect(casted.created_at).toBeInstanceOf(Date);
    });

    test('devrait gérer les erreurs de parsing JSON', () => {
      const data = {
        metadata: 'invalid json'
      };
      
      const casted = baseModel.castAttributes(data);
      
      // Le JSON invalide reste tel quel
      expect(casted.metadata).toBe('invalid json');
    });
  });

  describe('serialize', () => {
    test('devrait masquer les champs hidden', () => {
      const data = {
        id: 1,
        nom: 'John',
        email: 'john@test.com',
        password_hash: 'secret',
        secret: 'classified'
      };
      
      const serialized = baseModel.serialize(data);
      
      expect(serialized).toEqual({
        id: 1,
        nom: 'John',
        email: 'john@test.com'
      });
    });
  });

  describe('Validation avec Joi', () => {
    test('devrait valider des données correctes', async () => {
      const data = {
        nom: 'John Doe',
        email: 'john@test.com'
      };
      
      await expect(baseModel.validate(data, 'create')).resolves.toBe(true);
    });

    test('devrait rejeter des données invalides', async () => {
      const data = {
        nom: 'X', // Trop court
        email: 'invalid-email'
      };
      
      await expect(baseModel.validate(data, 'create')).rejects.toThrow('Erreurs de validation');
    });

    test('devrait nettoyer les données selon le schema', async () => {
      const data = {
        nom: 'John Doe',
        email: 'john@test.com',
        unauthorized_field: 'should be removed'
      };
      
      // La validation avec unknown:false devrait échouer sur champ non autorisé
      await expect(baseModel.validate(data, 'create')).rejects.toThrow('Erreurs de validation');
    });
  });

  describe('CRUD Operations avec hooks', () => {
    beforeEach(() => {
      // Mock des méthodes de base de données
      db.get.mockResolvedValue({ id: 1, nom: 'Test' });
      db.run.mockResolvedValue({ rowCount: 1 });
      db.all.mockResolvedValue([{ id: 1, nom: 'Test' }]);
    });

    test('create devrait appeler beforeCreate et afterCreate', async () => {
      const beforeCreateSpy = jest.spyOn(baseModel, 'beforeCreate');
      const afterCreateSpy = jest.spyOn(baseModel, 'afterCreate');
      
      beforeCreateSpy.mockResolvedValue({ nom: 'Modified', email: 'test@example.com' });
      afterCreateSpy.mockResolvedValue({ id: 1, nom: 'Final', email: 'test@example.com' });
      
      db.get
        .mockResolvedValueOnce({ id: 1 }) // Pour l'INSERT RETURNING
        .mockResolvedValueOnce({ id: 1, nom: 'Final', email: 'test@example.com' }); // Pour findById
      
      const result = await baseModel.create({ nom: 'Original', email: 'test@example.com' });
      
      expect(beforeCreateSpy).toHaveBeenCalled();
      expect(afterCreateSpy).toHaveBeenCalledWith({ id: 1, nom: 'Final', email: 'test@example.com' });
      expect(result).toEqual({ id: 1, nom: 'Final', email: 'test@example.com' });
    });

    test('update devrait appeler beforeUpdate et afterUpdate', async () => {
      // Mock une validation sans schema strict pour l'update
      const originalSchema = baseModel.getValidationSchema;
      baseModel.getValidationSchema = () => Joi.object().unknown(true);
      
      const beforeUpdateSpy = jest.spyOn(baseModel, 'beforeUpdate');
      const afterUpdateSpy = jest.spyOn(baseModel, 'afterUpdate');
      
      beforeUpdateSpy.mockResolvedValue({ nom: 'Modified' });
      afterUpdateSpy.mockResolvedValue({ id: 1, nom: 'Final' });
      
      db.get.mockResolvedValue({ id: 1, nom: 'Final' });
      
      const result = await baseModel.update(1, { nom: 'Original' });
      
      expect(beforeUpdateSpy).toHaveBeenCalled();
      expect(afterUpdateSpy).toHaveBeenCalledWith({ id: 1, nom: 'Final' });
      expect(result).toEqual({ id: 1, nom: 'Final' });
      
      // Restore original schema
      baseModel.getValidationSchema = originalSchema;
    });

    test('delete devrait appeler beforeDelete et afterDelete', async () => {
      const beforeDeleteSpy = jest.spyOn(baseModel, 'beforeDelete');
      const afterDeleteSpy = jest.spyOn(baseModel, 'afterDelete');
      
      beforeDeleteSpy.mockResolvedValue(true);
      afterDeleteSpy.mockResolvedValue(true);
      
      const result = await baseModel.delete(1);
      
      expect(beforeDeleteSpy).toHaveBeenCalledWith(1);
      expect(afterDeleteSpy).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    test('delete devrait annuler si beforeDelete retourne false', async () => {
      const beforeDeleteSpy = jest.spyOn(baseModel, 'beforeDelete');
      beforeDeleteSpy.mockResolvedValue(false);
      
      await expect(baseModel.delete(1)).rejects.toThrow('La suppression de l\'enregistrement 1 a été annulée par beforeDelete');
      
      expect(db.run).not.toHaveBeenCalled();
    });
  });

  describe('Méthodes avancées', () => {
    beforeEach(() => {
      db.get.mockResolvedValue({ id: 1, nom: 'Test' });
      db.all.mockResolvedValue([{ id: 1, nom: 'Test' }]);
    });

    test('findOrCreate devrait créer si inexistant', async () => {
      // Mock une validation permissive pour le test
      const originalSchema = baseModel.getValidationSchema;
      baseModel.getValidationSchema = () => Joi.object().unknown(true);
      
      db.get
        .mockResolvedValueOnce(null) // findOne ne trouve rien
        .mockResolvedValueOnce({ id: 1 }) // INSERT RETURNING
        .mockResolvedValueOnce({ id: 1, nom: 'New', email: 'new@test.com' }); // findById final
      
      const result = await baseModel.findOrCreate({ email: 'new@test.com' }, { nom: 'New' });
      
      expect(result.created).toBe(true);
      expect(result.record).toEqual({ id: 1, nom: 'New', email: 'new@test.com' });
      
      // Restore schema
      baseModel.getValidationSchema = originalSchema;
    });

    test('findOrCreate devrait retourner existant si trouvé', async () => {
      const existingRecord = { id: 1, email: 'existing@test.com', nom: 'Existing' };
      db.get.mockResolvedValueOnce(existingRecord);
      
      const result = await baseModel.findOrCreate({ email: 'existing@test.com' }, { nom: 'New' });
      
      expect(result.created).toBe(false);
      expect(result.record).toEqual(existingRecord);
    });

    test('patch devrait fusionner avec données existantes', async () => {
      // Mock une validation permissive pour le test
      const originalSchema = baseModel.getValidationSchema;
      baseModel.getValidationSchema = () => Joi.object().unknown(true);
      
      const existingData = { id: 1, nom: 'Original', email: 'old@test.com' };
      const updatedData = { id: 1, nom: 'Updated', email: 'old@test.com' };
      
      // Mock pour patch qui appelle findById puis update  
      db.get
        .mockResolvedValueOnce(existingData) // findById pour récupérer existant
        .mockResolvedValueOnce(updatedData) // findById dans update après modification
        .mockResolvedValueOnce(updatedData); // findById final dans update pour afterUpdate
      
      const result = await baseModel.patch(1, { nom: 'Updated' });
      
      expect(result.nom).toBe('Updated');
      expect(result.email).toBe('old@test.com'); // Préservé
      
      // Restore schema
      baseModel.getValidationSchema = originalSchema;
    });

    test('generateUUID devrait créer un UUID valide', () => {
      const uuid = baseModel.generateUUID();
      
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
  });

  describe('Factory method', () => {
    test('devrait créer une instance avec overwrites', () => {
      class TestModel extends BaseModel {
        constructor() {
          super('test', 'id');
        }
      }
      
      const instance = TestModel.factory({ customProp: 'value' });
      
      expect(instance).toBeInstanceOf(TestModel);
      expect(instance.customProp).toBe('value');
    });
  });
});