const { expect } = require('chai');
const sinon = require('sinon');
const OracleService = require('../../src/services/OracleService');
const Oracle = require('../../src/models/Oracle');
const OracleItem = require('../../src/models/OracleItem');

describe('OracleService', () => {
    let oracleService;
    let oracleModelStub;
    let oracleItemModelStub;
    let dbStub;

    beforeEach(() => {
        oracleService = new OracleService();
        
        // Stubs pour les modèles
        oracleModelStub = {
            findById: sinon.stub(),
            listerAvecStats: sinon.stub(),
            filterByPermission: sinon.stub(),
            rechercher: sinon.stub(),
            getStats: sinon.stub()
        };
        
        oracleItemModelStub = {
            findActiveWithFilters: sinon.stub()
        };
        
        // Remplacer les instances
        oracleService.oracleModel = oracleModelStub;
        oracleService.oracleItemModel = oracleItemModelStub;
        
        // Stub pour la base de données
        dbStub = {
            run: sinon.stub().resolves()
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('effectuerTirage', () => {
        const mockOracle = {
            id: 'oracle-1',
            name: 'Test Oracle',
            is_active: true,
            premium_required: false
        };

        const mockItems = [
            { id: 'item-1', value: 'Épée', weight: 30, metadata: { type: 'arme' } },
            { id: 'item-2', value: 'Bouclier', weight: 20, metadata: { type: 'armure' } },
            { id: 'item-3', value: 'Potion', weight: 50, metadata: { type: 'consommable' } }
        ];

        beforeEach(() => {
            oracleModelStub.findById.resolves(mockOracle);
            oracleItemModelStub.findActiveWithFilters.resolves(mockItems);
            
            // Mock pour l'enregistrement en base
            sinon.stub(require('../../src/database/db'), 'run').resolves();
        });

        it('devrait effectuer un tirage simple avec succès', async () => {
            const result = await oracleService.effectuerTirage('oracle-1', 1, null, true, 'UTILISATEUR');
            
            expect(result).to.have.property('results');
            expect(result.results).to.have.length(1);
            expect(result.results[0]).to.have.property('id');
            expect(result.results[0]).to.have.property('value');
            expect(result).to.have.property('draw_info');
            expect(result.draw_info.oracle_id).to.equal('oracle-1');
        });

        it('devrait respecter le nombre d\'éléments demandés', async () => {
            const result = await oracleService.effectuerTirage('oracle-1', 3, null, true, 'UTILISATEUR');
            
            expect(result.results).to.have.length(3);
        });

        it('devrait filtrer les résultats selon les permissions utilisateur', async () => {
            const result = await oracleService.effectuerTirage('oracle-1', 1, null, true, 'UTILISATEUR');
            
            // Les utilisateurs standards ne devraient pas voir les poids
            expect(result.results[0]).to.not.have.property('weight');
        });

        it('devrait montrer les poids aux utilisateurs premium', async () => {
            const result = await oracleService.effectuerTirage('oracle-1', 1, null, true, 'PREMIUM');
            
            expect(result.results[0]).to.have.property('weight');
        });

        it('devrait rejeter l\'accès aux oracles premium pour les utilisateurs standards', async () => {
            const premiumOracle = { ...mockOracle, premium_required: true };
            oracleModelStub.findById.resolves(premiumOracle);
            
            try {
                await oracleService.effectuerTirage('oracle-1', 1, null, true, 'UTILISATEUR');
                expect.fail('Devrait avoir rejeté l\'accès');
            } catch (error) {
                expect(error.message).to.include('premium');
            }
        });

        it('devrait permettre l\'accès aux oracles premium pour les utilisateurs premium', async () => {
            const premiumOracle = { ...mockOracle, premium_required: true };
            oracleModelStub.findById.resolves(premiumOracle);
            
            const result = await oracleService.effectuerTirage('oracle-1', 1, null, true, 'PREMIUM');
            expect(result).to.have.property('results');
        });

        it('devrait valider les paramètres d\'entrée', async () => {
            try {
                await oracleService.effectuerTirage('oracle-1', 101); // > 100
                expect.fail('Devrait avoir rejeté le nombre trop élevé');
            } catch (error) {
                expect(error.message).to.include('nombre');
            }

            try {
                await oracleService.effectuerTirage('oracle-1', 0); // < 1
                expect.fail('Devrait avoir rejeté le nombre trop faible');
            } catch (error) {
                expect(error.message).to.include('nombre');
            }
        });

        it('devrait gérer les oracles inactifs', async () => {
            const inactiveOracle = { ...mockOracle, is_active: false };
            oracleModelStub.findById.resolves(inactiveOracle);
            
            try {
                await oracleService.effectuerTirage('oracle-1');
                expect.fail('Devrait avoir rejeté l\'oracle inactif');
            } catch (error) {
                expect(error.message).to.include('désactivé');
            }
        });

        it('devrait gérer les collections vides', async () => {
            oracleItemModelStub.findActiveWithFilters.resolves([]);
            
            try {
                await oracleService.effectuerTirage('oracle-1');
                expect.fail('Devrait avoir rejeté la collection vide');
            } catch (error) {
                expect(error.message).to.include('Aucun élément');
            }
        });
    });

    describe('Algorithme de pondération', () => {
        it('devrait respecter la pondération statistiquement', async () => {
            const mockOracle = {
                id: 'oracle-1',
                name: 'Test Oracle',
                is_active: true,
                premium_required: false
            };

            // Items avec pondération claire
            const mockItems = [
                { id: 'rare', value: 'Rare', weight: 1, metadata: {} },
                { id: 'common', value: 'Commun', weight: 99, metadata: {} }
            ];

            oracleModelStub.findById.resolves(mockOracle);
            oracleItemModelStub.findActiveWithFilters.resolves(mockItems);
            sinon.stub(require('../../src/database/db'), 'run').resolves();

            const results = { rare: 0, common: 0 };
            const iterations = 1000;

            // Effectuer de nombreux tirages
            for (let i = 0; i < iterations; i++) {
                const result = await oracleService.effectuerTirage('oracle-1', 1, null, true, 'ADMIN');
                results[result.results[0].id]++;
            }

            // Le ratio devrait être proche de 1:99
            const ratio = results.common / results.rare;
            expect(ratio).to.be.greaterThan(50); // Au moins 50:1
            expect(results.common).to.be.greaterThan(results.rare * 10);
        });
    });

    describe('Tirage sans remise', () => {
        it('ne devrait pas retourner de doublons en mode sans remise', async () => {
            const mockOracle = {
                id: 'oracle-1',
                name: 'Test Oracle',
                is_active: true,
                premium_required: false
            };

            const mockItems = [
                { id: 'item-1', value: 'Item 1', weight: 1, metadata: {} },
                { id: 'item-2', value: 'Item 2', weight: 1, metadata: {} },
                { id: 'item-3', value: 'Item 3', weight: 1, metadata: {} }
            ];

            oracleModelStub.findById.resolves(mockOracle);
            oracleItemModelStub.findActiveWithFilters.resolves(mockItems);
            sinon.stub(require('../../src/database/db'), 'run').resolves();

            const result = await oracleService.effectuerTirage('oracle-1', 3, null, false, 'ADMIN');
            
            expect(result.results).to.have.length(3);
            
            const ids = result.results.map(r => r.id);
            const uniqueIds = [...new Set(ids)];
            expect(uniqueIds).to.have.length(3); // Tous différents
        });

        it('devrait limiter le nombre de résultats à la taille de la collection', async () => {
            const mockOracle = {
                id: 'oracle-1',
                name: 'Test Oracle',
                is_active: true,
                premium_required: false
            };

            const mockItems = [
                { id: 'item-1', value: 'Item 1', weight: 1, metadata: {} },
                { id: 'item-2', value: 'Item 2', weight: 1, metadata: {} }
            ];

            oracleModelStub.findById.resolves(mockOracle);
            oracleItemModelStub.findActiveWithFilters.resolves(mockItems);
            sinon.stub(require('../../src/database/db'), 'run').resolves();

            const result = await oracleService.effectuerTirage('oracle-1', 5, null, false, 'ADMIN');
            
            expect(result.results).to.have.length(2); // Limité à la taille de la collection
        });
    });

    describe('listerOraclesAccessibles', () => {
        it('devrait filtrer selon les permissions utilisateur', async () => {
            const mockOracles = [
                { id: '1', name: 'Oracle Gratuit', premium_required: false },
                { id: '2', name: 'Oracle Premium', premium_required: true }
            ];

            oracleModelStub.listerAvecStats.resolves({
                data: mockOracles,
                pagination: { page: 1, total: 2 }
            });
            oracleModelStub.filterByPermission.callsFake((oracle, role) => oracle);

            const result = await oracleService.listerOraclesAccessibles('UTILISATEUR');

            expect(oracleModelStub.listerAvecStats).to.have.been.calledWith('UTILISATEUR', 1, 20);
            expect(result.data).to.have.length(2);
        });
    });

    describe('validateFilters', () => {
        it('devrait valider les filtres corrects', () => {
            const validFilters = { type: 'arme', rarity: ['commune', 'rare'] };
            
            expect(() => {
                oracleService.validateFilters(validFilters, {});
            }).to.not.throw();
        });

        it('devrait rejeter les clés dangereuses', () => {
            const dangerousFilters = { '$where': 'malicious code' };
            
            expect(() => {
                oracleService.validateFilters(dangerousFilters, {});
            }).to.throw();
        });

        it('devrait rejeter les tableaux trop grands', () => {
            const bigArrayFilters = { type: new Array(100).fill('item') };
            
            expect(() => {
                oracleService.validateFilters(bigArrayFilters, {});
            }).to.throw();
        });
    });
});