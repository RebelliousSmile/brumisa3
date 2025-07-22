/**
 * Tests unitaires pour TemplateService - User Story US011
 * Templates personnalisés (Premium)
 */

const TemplateService = require('../../src/services/TemplateService');
const handlebars = require('handlebars');

// Mock fs
jest.mock('fs', () => ({
    promises: {
        readdir: jest.fn(),
        readFile: jest.fn()
    }
}));

const fs = require('fs').promises;

describe('TemplateService - US011 Templates personnalisés Premium', () => {
    let templateService;

    beforeEach(() => {
        jest.clearAllMocks();
        templateService = new TemplateService();
    });

    describe('Listage des templates', () => {
        test('devrait lister les templates disponibles pour un système', async () => {
            // Arrange
            const mockFiles = [
                'fiche-personnage.html',
                'carte-reference.html',
                'autre-fichier.txt' // Sera ignoré
            ];
            
            const mockTemplate1 = '<html><head><title>Fiche de Personnage</title></head></html>';
            const mockTemplate2 = '<html><head><title>Carte de Référence</title></head></html>';
            
            fs.readdir.mockResolvedValue(mockFiles);
            fs.readFile
                .mockResolvedValueOnce(mockTemplate1)
                .mockResolvedValueOnce(mockTemplate2);

            // Act
            const result = await templateService.listerTemplates('monsterhearts');

            // Assert
            expect(fs.readdir).toHaveBeenCalledWith(
                expect.stringContaining('templates/pdf/monsterhearts')
            );
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual(
                expect.objectContaining({
                    id: 'fiche-personnage',
                    nom: 'Fiche Personnage',
                    titre: 'Fiche de Personnage',
                    systeme: 'monsterhearts',
                    type: 'fiche-personnage'
                })
            );
            expect(result[1]).toEqual(
                expect.objectContaining({
                    id: 'carte-reference',
                    nom: 'Carte Reference',
                    titre: 'Carte de Référence',
                    systeme: 'monsterhearts',
                    type: 'autre'
                })
            );
        });

        test('devrait retourner un tableau vide si aucun template trouvé', async () => {
            // Arrange
            const error = new Error('Directory not found');
            error.code = 'ENOENT';
            fs.readdir.mockRejectedValue(error);

            // Act
            const result = await templateService.listerTemplates('systeme_inexistant');

            // Assert
            expect(result).toEqual([]);
        });

        test('devrait propager les autres erreurs', async () => {
            // Arrange
            const error = new Error('Permission denied');
            error.code = 'EACCES';
            fs.readdir.mockRejectedValue(error);

            // Act & Assert
            await expect(templateService.listerTemplates('monsterhearts'))
                .rejects.toThrow('Impossible de lister les templates');
        });
    });

    describe('Récupération de templates', () => {
        test('devrait obtenir un template spécifique', async () => {
            // Arrange
            const mockContent = '<html><head><title>Test Template</title></head><body>{{nom}}</body></html>';
            fs.readFile.mockResolvedValue(mockContent);

            // Act
            const result = await templateService.obtenirTemplate('monsterhearts', 'fiche-personnage');

            // Assert
            expect(fs.readFile).toHaveBeenCalledWith(
                expect.stringContaining('monsterhearts/fiche-personnage.html'),
                'utf8'
            );
            expect(result).toEqual({
                id: 'fiche-personnage',
                systeme: 'monsterhearts',
                contenu: mockContent,
                chemin: expect.stringContaining('fiche-personnage.html')
            });
        });

        test('devrait rejeter un template inexistant', async () => {
            // Arrange
            const error = new Error('File not found');
            error.code = 'ENOENT';
            fs.readFile.mockRejectedValue(error);

            // Act & Assert
            await expect(templateService.obtenirTemplate('monsterhearts', 'inexistant'))
                .rejects.toThrow('Template inexistant non trouvé pour le système monsterhearts');
        });
    });

    describe('Rendu de templates', () => {
        test('devrait rendre un template avec des données', async () => {
            // Arrange
            const mockTemplate = '<h1>{{personnage.nom}}</h1><p>Système: {{systeme}}</p>';
            const donnees = {
                personnage: { nom: 'Luna Darkwood' }
            };
            
            fs.readFile.mockResolvedValue(mockTemplate);

            // Act
            const result = await templateService.rendreTemplate('monsterhearts', 'fiche-personnage', donnees);

            // Assert
            expect(result).toContain('<h1>Luna Darkwood</h1>');
            expect(result).toContain('<p>Système: monsterhearts</p>');
        });

        test('devrait utiliser les helpers Handlebars personnalisés', async () => {
            // Arrange
            const mockTemplate = '<p>{{formatStat -2}}</p><p>{{formatStat 3}}</p>';
            fs.readFile.mockResolvedValue(mockTemplate);

            // Act
            const result = await templateService.rendreTemplate('monsterhearts', 'test', {});

            // Assert
            expect(result).toContain('<p>-2</p>');
            expect(result).toContain('<p>+3</p>');
        });

        test('devrait utiliser le helper repeat', async () => {
            // Arrange
            const mockTemplate = '{{#repeat 3}}<div>Item</div>{{/repeat}}';
            fs.readFile.mockResolvedValue(mockTemplate);

            // Act
            const result = await templateService.rendreTemplate('monsterhearts', 'test', {});

            // Assert
            expect(result).toBe('<div>Item</div><div>Item</div><div>Item</div>');
        });

        test('devrait utiliser le helper subtract', async () => {
            // Arrange
            const mockTemplate = '<p>{{subtract 10 3}}</p>';
            fs.readFile.mockResolvedValue(mockTemplate);

            // Act
            const result = await templateService.rendreTemplate('monsterhearts', 'test', {});

            // Assert
            expect(result).toContain('<p>7</p>');
        });

        test('devrait utiliser les helpers switch/case', async () => {
            // Arrange
            const mockTemplate = `
                {{#switch type}}
                    {{#case "A"}}Type A{{/case}}
                    {{#case "B"}}Type B{{/case}}
                    {{#default}}Type inconnu{{/default}}
                {{/switch}}
            `;
            const donnees = { type: 'B' };
            fs.readFile.mockResolvedValue(mockTemplate);

            // Act
            const result = await templateService.rendreTemplate('monsterhearts', 'test', donnees);

            // Assert
            expect(result.trim()).toContain('Type B');
        });

        test('devrait utiliser le helper if_eq', async () => {
            // Arrange
            const mockTemplate = '{{#if_eq status "active"}}Actif{{else}}Inactif{{/if_eq}}';
            const donnees = { status: 'active' };
            fs.readFile.mockResolvedValue(mockTemplate);

            // Act
            const result = await templateService.rendreTemplate('monsterhearts', 'test', donnees);

            // Assert
            expect(result).toBe('Actif');
        });
    });

    describe('Préparation des données par système', () => {
        test('devrait préparer les données de base pour tous les systèmes', () => {
            // Arrange
            const donnees = { personnage: { nom: 'Test' } };

            // Act
            const result = templateService.preparerDonnees(donnees, 'systeme_generique');

            // Assert
            expect(result).toEqual(
                expect.objectContaining({
                    personnage: { nom: 'Test' },
                    systeme: 'systeme_generique',
                    dateGeneration: expect.any(String)
                })
            );
        });

        test('devrait préparer les données spécifiques pour Monsterhearts', () => {
            // Arrange
            const donnees = {
                personnage: {
                    nom: 'Luna Darkwood',
                    donnees_personnage: {}
                }
            };

            // Act
            const result = templateService.preparerDonnees(donnees, 'monsterhearts');

            // Assert
            const dp = result.personnage.donnees_personnage;
            
            // Vérifier les stats par défaut
            expect(dp.stats).toEqual({
                hot: 0,
                cold: 0,
                volatile: 0,
                dark: 0
            });

            // Vérifier les moves de base
            expect(dp.moves.basic).toHaveLength(7);
            expect(dp.moves.basic[0]).toEqual(
                expect.objectContaining({
                    id: 'turn_on',
                    description: expect.stringContaining('Allumer'),
                    checked: false
                })
            );

            // Vérifier les conditions
            expect(dp.conditions).toHaveLength(4);
            expect(dp.conditions).toContainEqual(
                expect.objectContaining({
                    name: 'Apeuré',
                    active: false
                })
            );

            // Vérifier les dégâts
            expect(dp.harm).toEqual([false, false, false, false]);

            // Vérifier l'expérience
            expect(dp.experience).toEqual({
                current: 0,
                max: 5
            });

            // Vérifier les ascendants
            expect(dp.strings).toEqual([]);
        });

        test('devrait préserver les données existantes pour Monsterhearts', () => {
            // Arrange
            const donnees = {
                personnage: {
                    nom: 'Luna',
                    donnees_personnage: {
                        stats: { hot: 2, cold: 1, volatile: -1, dark: 3 },
                        moves: {
                            basic: [{ id: 'custom', checked: true }],
                            skin: [{ id: 'vampire_move' }]
                        },
                        conditions: [{ name: 'Custom', active: true }],
                        harm: [true, false, true, false],
                        experience: { current: 3, max: 5 },
                        strings: ['Alice', 'Bob']
                    }
                }
            };

            // Act
            const result = templateService.preparerDonnees(donnees, 'monsterhearts');

            // Assert
            const dp = result.personnage.donnees_personnage;
            
            // Les données existantes doivent être préservées
            expect(dp.stats).toEqual({ hot: 2, cold: 1, volatile: -1, dark: 3 });
            expect(dp.moves.basic[0]).toEqual({ id: 'custom', checked: true });
            expect(dp.moves.skin).toEqual([{ id: 'vampire_move' }]);
            expect(dp.conditions).toEqual([{ name: 'Custom', active: true }]);
            expect(dp.harm).toEqual([true, false, true, false]);
            expect(dp.experience).toEqual({ current: 3, max: 5 });
            expect(dp.strings).toEqual(['Alice', 'Bob']);
        });
    });

    describe('Utilitaires de templates', () => {
        test('devrait formater correctement les noms de templates', () => {
            // Act & Assert
            expect(templateService.formatTemplateName('fiche-personnage')).toBe('Fiche Personnage');
            expect(templateService.formatTemplateName('carte-reference-rapide')).toBe('Carte Reference Rapide');
            expect(templateService.formatTemplateName('simple')).toBe('Simple');
        });

        test('devrait détecter les types de templates', () => {
            // Act & Assert
            expect(templateService.detectTemplateType('fiche-personnage')).toBe('fiche-personnage');
            expect(templateService.detectTemplateType('personnage-complet')).toBe('fiche-personnage');
            expect(templateService.detectTemplateType('cadre-ville')).toBe('cadre-campagne');
            expect(templateService.detectTemplateType('plan-classe-instructions')).toBe('plan-classe');
            expect(templateService.detectTemplateType('aide-memoire')).toBe('autre');
        });

        test('devrait vérifier l\'existence d\'un template', async () => {
            // Arrange
            fs.readFile.mockResolvedValueOnce('<html></html>');
            const error = new Error('Not found');
            error.code = 'ENOENT';
            fs.readFile.mockRejectedValueOnce(error);

            // Act
            const existe = await templateService.templateExiste('monsterhearts', 'fiche-personnage');
            const nexistePas = await templateService.templateExiste('monsterhearts', 'inexistant');

            // Assert
            expect(existe).toBe(true);
            expect(nexistePas).toBe(false);
        });

        test('devrait obtenir les types de templates disponibles', async () => {
            // Act
            const types = await templateService.obtenirTypesTemplates();

            // Assert
            expect(types).toHaveLength(4);
            expect(types[0]).toEqual({
                id: 'fiche-personnage',
                nom: 'Fiche de Personnage',
                description: 'Fiche complète pour un personnage joueur',
                icone: '👤'
            });
            expect(types[1]).toEqual({
                id: 'cadre-campagne',
                nom: 'Cadre de Campagne',
                description: 'Environnement et contexte de jeu',
                icone: '🗺️'
            });
        });
    });

    describe('Gestion des erreurs', () => {
        test('devrait gérer les erreurs de rendu de template', async () => {
            // Arrange
            const mockTemplate = '{{#invalid_helper}}{{/invalid_helper}}';
            fs.readFile.mockResolvedValue(mockTemplate);

            // Act & Assert
            await expect(templateService.rendreTemplate('monsterhearts', 'test', {}))
                .rejects.toThrow('Impossible de rendre le template');
        });

        test('devrait gérer les erreurs de lecture de fichier pour obtenirTemplate', async () => {
            // Arrange
            const error = new Error('Permission denied');
            error.code = 'EACCES';
            fs.readFile.mockRejectedValue(error);

            // Act & Assert
            await expect(templateService.obtenirTemplate('monsterhearts', 'test'))
                .rejects.toThrow('Impossible de récupérer le template');
        });
    });

    describe('Helpers Handlebars personnalisés', () => {
        test('formatStat devrait formater les statistiques correctement', () => {
            // Act & Assert
            expect(templateService.initializeHandlebars).toBeDefined();
            
            // Test du helper formatStat
            const template = handlebars.compile('{{formatStat value}}');
            
            expect(template({ value: 3 })).toBe('+3');
            expect(template({ value: 0 })).toBe('+0');
            expect(template({ value: -2 })).toBe('-2');
            expect(template({ value: null })).toBe('');
            expect(template({ value: undefined })).toBe('');
        });

        test('repeat devrait répéter le contenu', () => {
            // Arrange
            const template = handlebars.compile('{{#repeat count}}Item{{/repeat}}');

            // Act & Assert
            expect(template({ count: 0 })).toBe('');
            expect(template({ count: 1 })).toBe('Item');
            expect(template({ count: 3 })).toBe('ItemItemItem');
        });

        test('subtract devrait soustraire correctement', () => {
            // Arrange
            const template = handlebars.compile('{{subtract a b}}');

            // Act & Assert
            expect(template({ a: 10, b: 3 })).toBe('7');
            expect(template({ a: 5, b: 8 })).toBe('-3');
            expect(template({ a: 0, b: 0 })).toBe('0');
        });

        test('if_eq devrait comparer correctement', () => {
            // Arrange
            const template = handlebars.compile('{{#if_eq a b}}Equal{{else}}Different{{/if_eq}}');

            // Act & Assert
            expect(template({ a: 'test', b: 'test' })).toBe('Equal');
            expect(template({ a: 'test', b: 'other' })).toBe('Different');
            expect(template({ a: 5, b: 5 })).toBe('Equal');
            expect(template({ a: 5, b: '5' })).toBe('Different'); // Type strict
        });
    });
});