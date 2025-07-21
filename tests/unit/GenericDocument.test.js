const GenericDocument = require('../../src/services/documents/GenericDocument');
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

// Mock de BasePdfKitService pour isoler les tests
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
        addSeparator() {}
        checkNewPage() { return false; }
        shouldAddLongDocumentPages() { return this.currentPageNumber > 5; }
    };
});

describe('GenericDocument', () => {
    let document;
    let mockTheme;

    beforeEach(() => {
        // Créer un mock de thème
        mockTheme = {
            getSidebarText: jest.fn().mockReturnValue('MOCK THEME'),
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
        test('devrait s\'initialiser sans thème', () => {
            document = new GenericDocument();
            
            expect(document.theme).toBeNull();
            expect(document.documentType).toBe('generic');
        });

        test('devrait accepter un thème optionnel', () => {
            document = new GenericDocument(mockTheme);
            
            expect(document.theme).toBe(mockTheme);
            expect(document.documentType).toBe('generic');
        });

        test('devrait fonctionner avec MonsterheartsTheme', () => {
            const theme = new MonsterheartsTheme();
            document = new GenericDocument(theme);
            
            expect(document.theme).toBeInstanceOf(MonsterheartsTheme);
        });
    });

    describe('generateDocument', () => {
        beforeEach(() => {
            document = new GenericDocument(mockTheme);
        });

        test('devrait générer un document PDF basique', async () => {
            const data = {
                titre: 'Guide Complet',
                introduction: 'Introduction au jeu',
                sections: []
            };

            await expect(document.generateDocument(data, '/mock/path.pdf'))
                .resolves.toBeUndefined();
        });

        test('devrait configurer le thème correctement', async () => {
            const data = { titre: 'Test Document' };
            
            await document.generateDocument(data, '/mock/path.pdf');
            
            expect(mockTheme.getSidebarText).toHaveBeenCalledWith('generic', data);
            expect(mockTheme.registerFonts).toHaveBeenCalled();
            expect(mockTheme.applyFont).toHaveBeenCalledWith(expect.any(Object), 'body');
        });

        test('devrait fonctionner sans thème', async () => {
            document = new GenericDocument();
            const data = { titre: 'Test Sans Thème' };
            
            await expect(document.generateDocument(data, '/mock/path.pdf'))
                .resolves.toBeUndefined();
        });

        test('devrait gérer les erreurs gracieusement', async () => {
            // Forcer une erreur dans le stream
            const mockStream = {
                on: jest.fn((event, callback) => {
                    if (event === 'error') {
                        setTimeout(() => callback(new Error('Stream error')), 10);
                    }
                })
            };
            
            fs.createWriteStream.mockReturnValue(mockStream);
            
            const data = { titre: 'Test Erreur' };
            
            await expect(document.generateDocument(data, '/invalid/path.pdf'))
                .rejects.toThrow('Stream error');
        });
    });

    describe('setupDocumentTexts', () => {
        test('devrait utiliser le thème si disponible', () => {
            document = new GenericDocument(mockTheme);
            const data = { titre: 'Mon Document' };
            
            document.setupDocumentTexts(data);
            
            expect(mockTheme.getSidebarText).toHaveBeenCalledWith('generic', data);
            expect(document.chapterTitle).toBe('MOCK THEME');
        });

        test('devrait utiliser le titre si pas de thème', () => {
            document = new GenericDocument();
            const data = { titre: 'Mon Document' };
            
            document.setupDocumentTexts(data);
            
            expect(document.chapterTitle).toBe('Mon Document');
        });

        test('devrait fallback vers DOCUMENT par défaut', () => {
            document = new GenericDocument();
            const data = {};
            
            document.setupDocumentTexts(data);
            
            expect(document.chapterTitle).toBe('DOCUMENT');
        });
    });

    describe('renderContent', () => {
        beforeEach(() => {
            document = new GenericDocument(mockTheme);
        });

        test('devrait rendre le titre principal', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const data = { titre: 'Guide Complet' };
            
            const spyAddTitle = jest.spyOn(document, 'addThemeTitle').mockImplementation();
            
            document.renderContent(mockDoc, data);
            
            expect(spyAddTitle).toHaveBeenCalledWith(
                mockDoc, 
                'Guide Complet', 
                1, 
                { addToToc: true, marginBottom: 20 }
            );
        });

        test('devrait rendre le sous-titre', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const data = { 
                titre: 'Guide Complet',
                sous_titre: 'Manuel détaillé'
            };
            
            const spyAddTitle = jest.spyOn(document, 'addThemeTitle').mockImplementation();
            
            document.renderContent(mockDoc, data);
            
            expect(spyAddTitle).toHaveBeenCalledWith(
                mockDoc,
                'Manuel détaillé',
                2,
                { marginBottom: 15 }
            );
        });

        test('devrait rendre l\'introduction', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const data = {
                titre: 'Guide',
                introduction: 'Ceci est l\'introduction'
            };
            
            const spyAddParagraph = jest.spyOn(document, 'addThemeParagraph').mockImplementation();
            
            document.renderContent(mockDoc, data);
            
            expect(spyAddParagraph).toHaveBeenCalledWith(
                mockDoc,
                'Ceci est l\'introduction',
                { isIntro: true, marginBottom: 20 }
            );
        });

        test('devrait rendre toutes les sections', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const data = {
                titre: 'Guide',
                sections: [
                    { titre: 'Section 1' },
                    { titre: 'Section 2' }
                ]
            };
            
            const spyRenderSection = jest.spyOn(document, 'renderSection').mockImplementation();
            
            document.renderContent(mockDoc, data);
            
            expect(spyRenderSection).toHaveBeenCalledTimes(2);
            expect(spyRenderSection).toHaveBeenCalledWith(mockDoc, { titre: 'Section 1' });
            expect(spyRenderSection).toHaveBeenCalledWith(mockDoc, { titre: 'Section 2' });
        });
    });

    describe('renderSection', () => {
        beforeEach(() => {
            document = new GenericDocument(mockTheme);
        });

        test('devrait rendre une section complète', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const section = {
                titre: 'Chapitre 1',
                description: 'Description du chapitre',
                contenu: [
                    { type: 'paragraphe', texte: 'Premier paragraphe' },
                    { type: 'liste', items: ['Item 1', 'Item 2'] }
                ]
            };
            
            const spyAddTitle = jest.spyOn(document, 'addThemeTitle').mockImplementation();
            const spyAddParagraph = jest.spyOn(document, 'addThemeParagraph').mockImplementation();
            const spyRenderElement = jest.spyOn(document, 'renderElement').mockImplementation();
            
            document.renderSection(mockDoc, section);
            
            expect(spyAddTitle).toHaveBeenCalledWith(
                mockDoc, 
                'Chapitre 1', 
                2, 
                {
                    addToToc: true,
                    tocLevel: 1,
                    marginTop: 25,
                    marginBottom: 15
                }
            );
            
            expect(spyAddParagraph).toHaveBeenCalledWith(
                mockDoc,
                'Description du chapitre',
                { marginBottom: 15 }
            );
            
            expect(spyRenderElement).toHaveBeenCalledTimes(2);
        });
    });

    describe('renderElement', () => {
        beforeEach(() => {
            document = new GenericDocument(mockTheme);
        });

        test('devrait rendre un paragraphe', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const element = { type: 'paragraphe', texte: 'Contenu du paragraphe' };
            
            const spyAddParagraph = jest.spyOn(document, 'addThemeParagraph').mockImplementation();
            
            document.renderElement(mockDoc, element);
            
            expect(spyAddParagraph).toHaveBeenCalledWith(mockDoc, 'Contenu du paragraphe');
        });

        test('devrait rendre une liste', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const element = { type: 'liste', items: ['Item 1', 'Item 2'] };
            
            const spyAddList = jest.spyOn(document, 'addThemeList').mockImplementation();
            
            document.renderElement(mockDoc, element);
            
            expect(spyAddList).toHaveBeenCalledWith(mockDoc, ['Item 1', 'Item 2']);
        });

        test('devrait rendre une sous-section', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const element = { 
                type: 'sous_section',
                titre: 'Sous-section',
                description: 'Description'
            };
            
            const spyRenderSubSection = jest.spyOn(document, 'renderSubSection').mockImplementation();
            
            document.renderElement(mockDoc, element);
            
            expect(spyRenderSubSection).toHaveBeenCalledWith(mockDoc, element);
        });

        test('devrait rendre des encadrés', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const spyAddBox = jest.spyOn(document, 'addThemeBox').mockImplementation();
            
            const types = ['conseil', 'attention', 'exemple'];
            
            types.forEach(type => {
                const element = { type, texte: `Contenu ${type}` };
                document.renderElement(mockDoc, element);
                
                expect(spyAddBox).toHaveBeenCalledWith(mockDoc, type, `Contenu ${type}`);
            });
        });

        test('devrait gérer les types non reconnus', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const element = { type: 'type_inconnu', texte: 'Test' };
            
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
            
            document.renderElement(mockDoc, element);
            
            expect(consoleSpy).toHaveBeenCalledWith('Type d\'élément non géré: type_inconnu');
            
            consoleSpy.mockRestore();
        });
    });

    describe('Méthodes de style avec thème', () => {
        beforeEach(() => {
            document = new GenericDocument(mockTheme);
        });

        test('addThemeTitle devrait utiliser le style du thème', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const spyAddTitle = jest.spyOn(document, 'addTitle').mockImplementation();
            
            document.addThemeTitle(mockDoc, 'Mon Titre', 2, { test: true });
            
            expect(mockTheme.applyTitleStyle).toHaveBeenCalledWith(mockDoc, 'Mon Titre', 2, { test: true });
            expect(spyAddTitle).toHaveBeenCalledWith(mockDoc, 'Mon Titre', {
                fontSize: 14, // h2 depuis le mock
                test: true
            });
        });

        test('addThemeParagraph devrait utiliser le style du thème', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const spyAddParagraph = jest.spyOn(document, 'addParagraph').mockImplementation();
            
            document.addThemeParagraph(mockDoc, 'Mon texte', { isIntro: true });
            
            expect(mockTheme.applyParagraphStyle).toHaveBeenCalledWith(mockDoc, true);
            expect(spyAddParagraph).toHaveBeenCalledWith(mockDoc, 'Mon texte', { isIntro: true });
        });

        test('addThemeList devrait utiliser la config du thème', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const spyAddStarList = jest.spyOn(document, 'addStarList').mockImplementation();
            
            document.addThemeList(mockDoc, ['Item 1', 'Item 2']);
            
            expect(mockTheme.getListConfig).toHaveBeenCalled();
            expect(spyAddStarList).toHaveBeenCalledWith(mockDoc, ['Item 1', 'Item 2'], {
                bulletChar: '★',
                fontSize: 11,
                indent: 20
            });
        });

        test('addThemeBox devrait utiliser les styles du thème', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const spyAddBox = jest.spyOn(document, 'addBox').mockImplementation();
            
            document.addThemeBox(mockDoc, 'exemple', 'Texte d\'exemple');
            
            expect(mockTheme.getBoxStyles).toHaveBeenCalled();
            expect(spyAddBox).toHaveBeenCalledWith(mockDoc, 'exemple', 'Texte d\'exemple', {
                padding: 10,
                topPadding: 15,
                bottomPadding: 15
            });
        });
    });

    describe('Méthodes sans thème', () => {
        beforeEach(() => {
            document = new GenericDocument(); // Pas de thème
        });

        test('addThemeTitle devrait fonctionner sans thème', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const spyAddTitle = jest.spyOn(document, 'addTitle').mockImplementation();
            
            document.addThemeTitle(mockDoc, 'Mon Titre', 1);
            
            expect(spyAddTitle).toHaveBeenCalledWith(mockDoc, 'Mon Titre', {
                fontSize: 18 // Taille par défaut pour h1
            });
        });

        test('addThemeParagraph devrait fonctionner sans thème', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const spyAddParagraph = jest.spyOn(document, 'addParagraph').mockImplementation();
            
            expect(() => {
                document.addThemeParagraph(mockDoc, 'Mon texte');
            }).not.toThrow();
            
            expect(spyAddParagraph).toHaveBeenCalledWith(mockDoc, 'Mon texte', {});
        });

        test('addThemeList devrait utiliser les valeurs par défaut', () => {
            const mockDoc = { pipe: jest.fn(), end: jest.fn() };
            const spyAddStarList = jest.spyOn(document, 'addStarList').mockImplementation();
            
            document.addThemeList(mockDoc, ['Item 1']);
            
            expect(spyAddStarList).toHaveBeenCalledWith(mockDoc, ['Item 1']);
        });
    });

    describe('getDocumentType et getTheme', () => {
        test('devrait retourner le bon type de document', () => {
            document = new GenericDocument();
            expect(document.getDocumentType()).toBe('generic');
        });

        test('devrait retourner le thème', () => {
            document = new GenericDocument(mockTheme);
            expect(document.getTheme()).toBe(mockTheme);
        });

        test('devrait retourner null si pas de thème', () => {
            document = new GenericDocument();
            expect(document.getTheme()).toBeNull();
        });
    });

    describe('setTheme', () => {
        beforeEach(() => {
            document = new GenericDocument();
        });

        test('devrait définir un nouveau thème', () => {
            document.setTheme(mockTheme);
            expect(document.getTheme()).toBe(mockTheme);
        });

        test('devrait accepter null', () => {
            document.setTheme(null);
            expect(document.getTheme()).toBeNull();
        });

        test('devrait rejeter les objets non-SystemTheme', () => {
            expect(() => {
                document.setTheme({ invalid: 'theme' });
            }).toThrow('Le thème doit être une instance de SystemTheme');
        });
    });

    describe('finalizeDocument', () => {
        beforeEach(() => {
            document = new GenericDocument();
        });

        test('devrait détecter les documents longs', () => {
            document.currentPageNumber = 6;
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            document.finalizeDocument({}, {});
            
            expect(consoleSpy).toHaveBeenCalledWith('📋 Document long détecté, ajout de la page de garde et TOC');
            
            consoleSpy.mockRestore();
        });

        test('ne devrait rien faire pour les documents courts', () => {
            document.currentPageNumber = 3;
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            
            document.finalizeDocument({}, {});
            
            expect(consoleSpy).not.toHaveBeenCalled();
            
            consoleSpy.mockRestore();
        });
    });
});