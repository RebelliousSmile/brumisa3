const ClassPlanDocument = require('../../src/services/documents/ClassPlanDocument');
const SystemTheme = require('../../src/services/themes/SystemTheme');
const MonsterheartsTheme = require('../../src/services/themes/MonsterheartsTheme');
const fs = require('fs');

// Mock de fs
jest.mock('fs', () => ({
    createWriteStream: jest.fn(() => ({
        on: jest.fn((event, callback) => {
            if (event === 'finish') {
                setTimeout(callback, 10);
            }
        })
    }))
}));

// Mock de BasePdfKitService
jest.mock('../../src/services/BasePdfKitService', () => {
    return class MockBasePdfKitService {
        constructor() {
            this.tableOfContents = [];
            this.currentPageNumber = 1;
            this.chapterTitle = 'DOCUMENT';
            this.hasLongContentPages = false;
        }
        
        createDocument(options = {}) {
            this.chapterTitle = options.chapterTitle || 'DOCUMENT';
            return {
                pipe: jest.fn(() => ({
                    on: jest.fn((event, callback) => {
                        if (event === 'finish') setTimeout(callback, 10);
                    })
                })),
                end: jest.fn(),
                font: jest.fn().mockReturnThis(),
                fontSize: jest.fn().mockReturnThis(),
                fillColor: jest.fn().mockReturnThis(),
                text: jest.fn().mockReturnThis(),
                addPage: jest.fn().mockReturnThis(),
                y: 100,
                x: 72
            };
        }
        
        addTitle(doc, text, options = {}) {
            if (options.addToToc) {
                this.tableOfContents.push({
                    title: text.toUpperCase(),
                    level: options.tocLevel || 1,
                    page: this.currentPageNumber
                });
            }
        }
        
        addParagraph() {}
        addStarList() {}
        addBox() {}
        checkNewPage() { return false; }
        shouldAddLongDocumentPages() { return this.currentPageNumber > 5; }
    };
});

describe('ClassPlanDocument', () => {
    let document;
    let mockTheme;

    beforeEach(() => {
        // Créer un mock de thème
        mockTheme = {
            getSidebarText: jest.fn().mockReturnValue('THE CHOSEN'),
            registerFonts: jest.fn().mockReturnValue(true),
            applyFont: jest.fn(),
            applyTitleStyle: jest.fn((doc, text) => text),
            applyParagraphStyle: jest.fn(),
            getFonts: jest.fn().mockReturnValue({
                titles: { sizes: { h1: 18, h2: 14, h3: 12 } }
            }),
            getListConfig: jest.fn().mockReturnValue({
                bulletChar: '★',
                fontSize: 11,
                indent: 20
            }),
            getBoxStyles: jest.fn().mockReturnValue({
                padding: 10,
                marginTop: 15,
                marginBottom: 15
            })
        };
        
        jest.clearAllMocks();
    });

    describe('Constructor', () => {
        test('devrait exiger un thème', () => {
            expect(() => {
                new ClassPlanDocument();
            }).toThrow('ClassPlanDocument nécessite un SystemTheme valide');
        });

        test('devrait exiger un SystemTheme valide', () => {
            expect(() => {
                new ClassPlanDocument({ invalid: 'theme' });
            }).toThrow('ClassPlanDocument nécessite un SystemTheme valide');
        });

        test('devrait accepter un thème SystemTheme', () => {
            document = new ClassPlanDocument(mockTheme);
            
            expect(document.theme).toBe(mockTheme);
            expect(document.documentType).toBe('class-plan');
        });

        test('devrait fonctionner avec MonsterheartsTheme', () => {
            const theme = new MonsterheartsTheme();
            document = new ClassPlanDocument(theme);
            
            expect(document.theme).toBeInstanceOf(MonsterheartsTheme);
        });
    });

    describe('validateClassData', () => {
        beforeEach(() => {
            document = new ClassPlanDocument(mockTheme);
        });

        test('devrait exiger un nom de classe', () => {
            const data = { description: 'Test' };
            
            expect(() => {
                document.validateClassData(data);
            }).toThrow('Le plan de classe doit avoir un nom de classe (className)');
        });

        test('devrait accepter des données valides', () => {
            const data = {
                className: 'The Chosen',
                description: { main: 'Description' },
                stats: { health: 7 },
                moves: { basic: [] }
            };
            
            expect(() => {
                document.validateClassData(data);
            }).not.toThrow();
        });

        test('devrait avertir pour les sections manquantes', () => {
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            const data = { className: 'The Chosen' };
            
            document.validateClassData(data);
            
            expect(consoleSpy).toHaveBeenCalledWith('⚠️ Section manquante dans le plan de classe: description');
            expect(consoleSpy).toHaveBeenCalledWith('⚠️ Section manquante dans le plan de classe: stats');
            expect(consoleSpy).toHaveBeenCalledWith('⚠️ Section manquante dans le plan de classe: moves');
            
            consoleSpy.mockRestore();
        });
    });

    describe('generateDocument', () => {
        beforeEach(() => {
            document = new ClassPlanDocument(mockTheme);
        });

        test('devrait générer un document PDF de plan de classe', async () => {
            const data = {
                className: 'The Chosen',
                description: { main: 'Classe héroïque' },
                stats: { health: 7 },
                moves: { basic: [] }
            };

            await expect(document.generateDocument(data, '/mock/path.pdf'))
                .resolves.toBeUndefined();
        });

        test('devrait configurer le thème correctement', async () => {
            const data = { className: 'The Ghost' };
            
            await document.generateDocument(data, '/mock/path.pdf');
            
            expect(mockTheme.getSidebarText).toHaveBeenCalledWith('class-plan', data);
            expect(mockTheme.registerFonts).toHaveBeenCalled();
            expect(mockTheme.applyFont).toHaveBeenCalledWith(expect.any(Object), 'body');
        });

        test('devrait gérer les erreurs de validation', async () => {
            const data = {}; // Pas de className
            
            await expect(document.generateDocument(data, '/mock/path.pdf'))
                .rejects.toThrow('Le plan de classe doit avoir un nom de classe');
        });
    });

    describe('renderClassPlan', () => {
        beforeEach(() => {
            document = new ClassPlanDocument(mockTheme);
        });

        test('devrait rendre toutes les sections d\'un plan de classe complet', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const data = {
                className: 'The Chosen',
                tagline: 'L\'élu',
                quote: 'Je protège les innocents',
                description: { main: 'Classe héroïque' },
                stats: { health: 7 },
                moves: { basic: [] },
                equipment: { items: ['Épée sacrée'] },
                advancedMoves: { moves: [] },
                gmNotes: { advice: 'Conseils MJ' }
            };
            
            const spyRenderClassHeader = jest.spyOn(document, 'renderClassHeader').mockImplementation();
            const spyRenderClassDescription = jest.spyOn(document, 'renderClassDescription').mockImplementation();
            const spyRenderClassStats = jest.spyOn(document, 'renderClassStats').mockImplementation();
            const spyRenderClassMoves = jest.spyOn(document, 'renderClassMoves').mockImplementation();
            const spyRenderStartingEquipment = jest.spyOn(document, 'renderStartingEquipment').mockImplementation();
            const spyRenderAdvancedMoves = jest.spyOn(document, 'renderAdvancedMoves').mockImplementation();
            const spyRenderGMNotes = jest.spyOn(document, 'renderGMNotes').mockImplementation();
            
            document.renderClassPlan(mockDoc, data);
            
            expect(spyRenderClassHeader).toHaveBeenCalledWith(mockDoc, data);
            expect(spyRenderClassDescription).toHaveBeenCalledWith(mockDoc, data.description);
            expect(spyRenderClassStats).toHaveBeenCalledWith(mockDoc, data.stats);
            expect(spyRenderClassMoves).toHaveBeenCalledWith(mockDoc, data.moves);
            expect(spyRenderStartingEquipment).toHaveBeenCalledWith(mockDoc, data.equipment);
            expect(spyRenderAdvancedMoves).toHaveBeenCalledWith(mockDoc, data.advancedMoves);
            expect(spyRenderGMNotes).toHaveBeenCalledWith(mockDoc, data.gmNotes);
        });

        test('devrait ignorer les sections manquantes', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const data = { className: 'The Ghost' }; // Données minimales
            
            const spyRenderClassDescription = jest.spyOn(document, 'renderClassDescription').mockImplementation();
            
            document.renderClassPlan(mockDoc, data);
            
            expect(spyRenderClassDescription).not.toHaveBeenCalled();
        });
    });

    describe('renderClassHeader', () => {
        beforeEach(() => {
            document = new ClassPlanDocument(mockTheme);
        });

        test('devrait rendre l\'en-tête complet', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const data = {
                className: 'The Chosen',
                tagline: 'L\'élu des dieux',
                quote: 'La lumière guide mes pas'
            };
            
            const spyAddTitle = jest.spyOn(document, 'addThemeTitle').mockImplementation();
            const spyAddParagraph = jest.spyOn(document, 'addThemeParagraph').mockImplementation();
            
            document.renderClassHeader(mockDoc, data);
            
            expect(spyAddTitle).toHaveBeenCalledWith(mockDoc, 'LA THE CHOSEN', 1, {
                addToToc: true,
                marginBottom: 10
            });
            
            expect(spyAddTitle).toHaveBeenCalledWith(mockDoc, 'L\'élu des dieux', 3, {
                marginBottom: 20
            });
            
            expect(spyAddParagraph).toHaveBeenCalledWith(mockDoc, '"La lumière guide mes pas"', {
                isIntro: true,
                marginBottom: 15
            });
        });

        test('devrait rendre seulement le nom si données minimales', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const data = { className: 'The Ghost' };
            
            const spyAddTitle = jest.spyOn(document, 'addThemeTitle').mockImplementation();
            const spyAddParagraph = jest.spyOn(document, 'addThemeParagraph').mockImplementation();
            
            document.renderClassHeader(mockDoc, data);
            
            expect(spyAddTitle).toHaveBeenCalledTimes(1);
            expect(spyAddParagraph).not.toHaveBeenCalled();
        });
    });

    describe('renderClassMoves', () => {
        beforeEach(() => {
            document = new ClassPlanDocument(mockTheme);
        });

        test('devrait rendre toutes les catégories de capacités', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const moves = {
                basic: [
                    { name: 'Protective Instinct', description: 'Protège les autres' }
                ],
                special: [
                    { name: 'Divine Light', description: 'Invoque la lumière divine' }
                ],
                situational: [
                    { name: 'Final Stand', description: 'Dernier recours héroïque' }
                ]
            };
            
            const spyAddTitle = jest.spyOn(document, 'addThemeTitle').mockImplementation();
            const spyRenderMove = jest.spyOn(document, 'renderMove').mockImplementation();
            
            document.renderClassMoves(mockDoc, moves);
            
            // Titre principal + 3 sous-titres
            expect(spyAddTitle).toHaveBeenCalledWith(mockDoc, 'CAPACITÉS', 2, expect.any(Object));
            expect(spyAddTitle).toHaveBeenCalledWith(mockDoc, 'Capacités de base', 3, expect.any(Object));
            expect(spyAddTitle).toHaveBeenCalledWith(mockDoc, 'Capacités spéciales', 3, expect.any(Object));
            expect(spyAddTitle).toHaveBeenCalledWith(mockDoc, 'Capacités situationnelles', 3, expect.any(Object));
            
            // 3 capacités rendues
            expect(spyRenderMove).toHaveBeenCalledTimes(3);
        });
    });

    describe('renderMove', () => {
        beforeEach(() => {
            document = new ClassPlanDocument(mockTheme);
        });

        test('devrait rendre une capacité complète', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const move = {
                name: 'Protective Instinct',
                description: 'Quand tu protèges quelqu\'un...',
                trigger: 'tu vois un innocent en danger',
                effects: ['Lance 2d6+Hot', 'Sur 10+, choisis 3', 'Sur 7-9, choisis 2'],
                note: 'Cette capacité est toujours disponible'
            };
            
            const spyAddParagraph = jest.spyOn(document, 'addThemeParagraph').mockImplementation();
            const spyAddList = jest.spyOn(document, 'addThemeList').mockImplementation();
            
            document.renderMove(mockDoc, move);
            
            // Nom en gras
            expect(spyAddParagraph).toHaveBeenCalledWith(mockDoc, '**PROTECTIVE INSTINCT**', { marginBottom: 5 });
            
            // Description
            expect(spyAddParagraph).toHaveBeenCalledWith(mockDoc, 'Quand tu protèges quelqu\'un...', { marginBottom: 10 });
            
            // Déclencheur
            expect(spyAddParagraph).toHaveBeenCalledWith(mockDoc, '*Quand tu vois un innocent en danger...*', { marginBottom: 5 });
            
            // Effets
            expect(spyAddList).toHaveBeenCalledWith(mockDoc, move.effects);
            
            // Note
            expect(spyAddParagraph).toHaveBeenCalledWith(mockDoc, '*Cette capacité est toujours disponible*', {
                fontSize: 10,
                marginTop: 5,
                marginBottom: 10
            });
        });

        test('devrait gérer les capacités minimales', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const move = { name: 'Simple Move' };
            
            const spyAddParagraph = jest.spyOn(document, 'addThemeParagraph').mockImplementation();
            
            document.renderMove(mockDoc, move);
            
            expect(spyAddParagraph).toHaveBeenCalledWith(mockDoc, '**SIMPLE MOVE**', { marginBottom: 5 });
            expect(spyAddParagraph).toHaveBeenCalledTimes(1); // Seulement le nom
        });
    });

    describe('renderStartingEquipment', () => {
        beforeEach(() => {
            document = new ClassPlanDocument(mockTheme);
        });

        test('devrait rendre l\'équipement complet', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const equipment = {
                items: ['Épée sacrée', 'Armure bénie', 'Symbole saint'],
                choices: ['Une arme à distance', 'Un bouclier supplémentaire'],
                notes: 'L\'équipement sacré est plus efficace contre les démons'
            };
            
            const spyAddTitle = jest.spyOn(document, 'addThemeTitle').mockImplementation();
            const spyAddList = jest.spyOn(document, 'addThemeList').mockImplementation();
            const spyAddParagraph = jest.spyOn(document, 'addThemeParagraph').mockImplementation();
            const spyAddBox = jest.spyOn(document, 'addThemeBox').mockImplementation();
            
            document.renderStartingEquipment(mockDoc, equipment);
            
            expect(spyAddTitle).toHaveBeenCalledWith(mockDoc, 'ÉQUIPEMENT DE DÉPART', 2, expect.any(Object));
            expect(spyAddList).toHaveBeenCalledWith(mockDoc, equipment.items);
            expect(spyAddParagraph).toHaveBeenCalledWith(mockDoc, '**Choisissez également :**');
            expect(spyAddList).toHaveBeenCalledWith(mockDoc, equipment.choices);
            expect(spyAddBox).toHaveBeenCalledWith(mockDoc, 'conseil', equipment.notes);
        });
    });

    describe('renderGMNotes', () => {
        beforeEach(() => {
            document = new ClassPlanDocument(mockTheme);
        });

        test('devrait rendre toutes les notes MJ', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const gmNotes = {
                advice: 'Cette classe est parfaite pour les nouveaux joueurs',
                hooks: ['Corruption du mentor', 'Prophétie ancienne', 'Rival jaloux'],
                warnings: 'Attention à ne pas rendre le personnage trop puissant'
            };
            
            const spyAddTitle = jest.spyOn(document, 'addThemeTitle').mockImplementation();
            const spyAddBox = jest.spyOn(document, 'addThemeBox').mockImplementation();
            const spyAddParagraph = jest.spyOn(document, 'addThemeParagraph').mockImplementation();
            const spyAddList = jest.spyOn(document, 'addThemeList').mockImplementation();
            
            document.renderGMNotes(mockDoc, gmNotes);
            
            expect(spyAddTitle).toHaveBeenCalledWith(mockDoc, 'NOTES POUR LE MJ', 2, expect.any(Object));
            expect(spyAddBox).toHaveBeenCalledWith(mockDoc, 'conseil', gmNotes.advice);
            expect(spyAddParagraph).toHaveBeenCalledWith(mockDoc, '**Accroches narratives suggérées :**');
            expect(spyAddList).toHaveBeenCalledWith(mockDoc, gmNotes.hooks);
            expect(spyAddBox).toHaveBeenCalledWith(mockDoc, 'attention', gmNotes.warnings);
        });
    });

    describe('Méthodes de style avec thème', () => {
        beforeEach(() => {
            document = new ClassPlanDocument(mockTheme);
        });

        test('devrait utiliser les mêmes méthodes que GenericDocument', () => {
            // Test que les méthodes de style fonctionnent
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const spyAddTitle = jest.spyOn(document, 'addTitle').mockImplementation();
            
            document.addThemeTitle(mockDoc, 'Test Title', 2);
            
            expect(mockTheme.applyTitleStyle).toHaveBeenCalled();
            expect(spyAddTitle).toHaveBeenCalledWith(mockDoc, 'Test Title', {
                fontSize: 14
            });
        });
    });

    describe('finalizeDocument', () => {
        beforeEach(() => {
            document = new ClassPlanDocument(mockTheme);
        });

        test('devrait détecter les plans de classe longs', () => {
            document.currentPageNumber = 6;
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            document.finalizeDocument({}, {});
            
            expect(consoleSpy).toHaveBeenCalledWith('📋 Plan de classe long détecté');
            
            consoleSpy.mockRestore();
        });

        test('ne devrait rien faire pour les plans courts', () => {
            document.currentPageNumber = 3;
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            document.finalizeDocument({}, {});
            
            expect(consoleSpy).not.toHaveBeenCalled();
            
            consoleSpy.mockRestore();
        });
    });

    describe('getDocumentType et getTheme', () => {
        beforeEach(() => {
            document = new ClassPlanDocument(mockTheme);
        });

        test('devrait retourner le bon type de document', () => {
            expect(document.getDocumentType()).toBe('class-plan');
        });

        test('devrait retourner le thème', () => {
            expect(document.getTheme()).toBe(mockTheme);
        });
    });

    describe('Intégration avec MonsterheartsTheme', () => {
        test('devrait fonctionner avec un thème réel', async () => {
            const theme = new MonsterheartsTheme();
            document = new ClassPlanDocument(theme);
            
            const data = {
                className: 'The Chosen',
                description: { main: 'Héros lumineux' },
                stats: { health: 7 },
                moves: { basic: [{ name: 'Test Move' }] }
            };
            
            await expect(document.generateDocument(data, '/mock/path.pdf'))
                .resolves.toBeUndefined();
        });
    });

    describe('Gestion des erreurs', () => {
        beforeEach(() => {
            document = new ClassPlanDocument(mockTheme);
        });

        test('devrait gérer les erreurs de stream', async () => {
            const mockStream = {
                on: jest.fn((event, callback) => {
                    if (event === 'error') {
                        setTimeout(() => callback(new Error('Stream error')), 10);
                    }
                })
            };
            
            fs.createWriteStream.mockReturnValue(mockStream);
            
            const data = {
                className: 'The Error',
                description: { main: 'Test' }
            };
            
            await expect(document.generateDocument(data, '/invalid/path.pdf'))
                .rejects.toThrow('Stream error');
        });
    });
});