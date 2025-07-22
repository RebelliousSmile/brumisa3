/**
 * Tests unitaires pour OracleService - Version simplifiée utilisant Jest
 * Basé sur les recommandations de documentation/testing.md
 */

const OracleService = require('../../src/services/OracleService');

// Mock des modèles
jest.mock('../../src/models/Oracle');
jest.mock('../../src/models/OracleItem');
jest.mock('../../src/database/db');

const Oracle = require('../../src/models/Oracle');
const OracleItem = require('../../src/models/OracleItem');
const db = require('../../src/database/db');

describe('OracleService - Tests Simplifiés', () => {
    let oracleService;
    let mockOracleModel;
    let mockOracleItemModel;

    beforeEach(() => {
        // Reset des mocks
        jest.clearAllMocks();
        
        // Mock des constructeurs
        mockOracleModel = {
            findById: jest.fn(),
            listerAvecStats: jest.fn(),
            filterByPermission: jest.fn(),
            listerAvecStatsParSysteme: jest.fn()
        };
        
        mockOracleItemModel = {
            findActiveWithFilters: jest.fn()
        };
        
        Oracle.mockImplementation(() => mockOracleModel);
        OracleItem.mockImplementation(() => mockOracleItemModel);
        
        // Mock base de données
        db.run = jest.fn().mockResolvedValue();
        
        oracleService = new OracleService();
    });

    describe('listerOraclesAccessibles', () => {
        test('devrait retourner la liste des oracles pour un utilisateur standard', async () => {
            // Arrange
            const mockData = {
                data: [
                    { id: '1', name: 'Oracle Test', premium_required: false },
                    { id: '2', name: 'Oracle Gratuit', premium_required: false }
                ],
                pagination: { page: 1, total: 2, limite: 20 }
            };
            
            mockOracleModel.listerAvecStats.mockResolvedValue(mockData);
            mockOracleModel.filterByPermission.mockImplementation((oracle) => oracle);

            // Act
            const result = await oracleService.listerOraclesAccessibles('UTILISATEUR', 1, 20);

            // Assert
            expect(result).toBeDefined();
            expect(result.data).toHaveLength(2);
            expect(mockOracleModel.listerAvecStats).toHaveBeenCalledWith('UTILISATEUR', 1, 20);
        });

        test('devrait filtrer les données selon les permissions', async () => {
            // Arrange
            const mockData = {
                data: [{ id: '1', name: 'Oracle Test', secret_data: 'hidden' }],
                pagination: { page: 1, total: 1 }
            };
            
            mockOracleModel.listerAvecStats.mockResolvedValue(mockData);
            mockOracleModel.filterByPermission.mockReturnValue({ id: '1', name: 'Oracle Test' });

            // Act
            const result = await oracleService.listerOraclesAccessibles('UTILISATEUR');

            // Assert
            expect(mockOracleModel.filterByPermission).toHaveBeenCalledWith(
                expect.objectContaining({ id: '1' }),
                'UTILISATEUR'
            );
        });
    });

    describe('effectuerTirage - Cas de base', () => {
        test('devrait valider les paramètres d\'entrée', async () => {
            // Test count trop élevé
            await expect(
                oracleService.effectuerTirage('oracle-1', 101)
            ).rejects.toThrow('nombre d\'éléments à tirer doit être entre 1 et 100');
            
            // Test count trop bas
            await expect(
                oracleService.effectuerTirage('oracle-1', 0)
            ).rejects.toThrow('nombre d\'éléments à tirer doit être entre 1 et 100');
        });

        test('devrait rejeter les oracles inexistants', async () => {
            // Arrange
            mockOracleModel.findById.mockResolvedValue(null);

            // Act & Assert
            await expect(
                oracleService.effectuerTirage('oracle-inexistant')
            ).rejects.toThrow('Oracle introuvable');
        });

        test('devrait rejeter l\'accès aux oracles premium pour utilisateurs standards', async () => {
            // Arrange
            const premiumOracle = {
                id: 'oracle-1',
                premium_required: true,
                is_active: true
            };
            mockOracleModel.findById.mockResolvedValue(premiumOracle);

            // Act & Assert
            await expect(
                oracleService.effectuerTirage('oracle-1', 1, null, true, 'UTILISATEUR')
            ).rejects.toThrow('Accès premium requis');
        });

        test('devrait permettre l\'accès aux oracles premium pour utilisateurs premium', async () => {
            // Arrange
            const premiumOracle = {
                id: 'oracle-1',
                premium_required: true,
                is_active: true
            };
            const mockItems = [
                { id: 'item-1', value: 'Résultat Test', weight: 10, metadata: {} }
            ];
            
            mockOracleModel.findById.mockResolvedValue(premiumOracle);
            mockOracleItemModel.findActiveWithFilters.mockResolvedValue(mockItems);

            // Act
            const result = await oracleService.effectuerTirage('oracle-1', 1, null, true, 'PREMIUM');

            // Assert
            expect(result).toBeDefined();
            expect(result.results).toHaveLength(1);
        });
    });

    describe('Validation des cas d\'erreur', () => {
        test('devrait gérer les oracles désactivés', async () => {
            // Arrange
            const inactiveOracle = {
                id: 'oracle-1',
                is_active: false
            };
            mockOracleModel.findById.mockResolvedValue(inactiveOracle);

            // Act & Assert
            await expect(
                oracleService.effectuerTirage('oracle-1')
            ).rejects.toThrow('Oracle désactivé');
        });

        test('devrait gérer les collections vides', async () => {
            // Arrange
            const oracle = {
                id: 'oracle-1',
                is_active: true,
                premium_required: false
            };
            mockOracleModel.findById.mockResolvedValue(oracle);
            mockOracleItemModel.findActiveWithFilters.mockResolvedValue([]);

            // Act & Assert
            await expect(
                oracleService.effectuerTirage('oracle-1')
            ).rejects.toThrow('Aucun élément disponible');
        });
    });

    describe('listerOraclesParSysteme', () => {
        test('devrait lister les oracles pour un système spécifique', async () => {
            // Arrange
            const mockData = {
                data: [
                    { id: '1', name: 'Oracle Monsterhearts', game_system: 'monsterhearts' }
                ],
                pagination: { page: 1, total: 1 }
            };
            
            mockOracleModel.listerAvecStatsParSysteme.mockResolvedValue(mockData);
            mockOracleModel.filterByPermission.mockImplementation((oracle) => oracle);

            // Act
            const result = await oracleService.listerOraclesParSysteme('monsterhearts', 'UTILISATEUR');

            // Assert
            expect(result).toBeDefined();
            expect(result.data).toHaveLength(1);
            expect(mockOracleModel.listerAvecStatsParSysteme).toHaveBeenCalledWith(
                'monsterhearts', 'UTILISATEUR', 1, 20
            );
        });
    });
});