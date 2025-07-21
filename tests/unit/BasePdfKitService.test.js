const BasePdfKitService = require('../../src/services/BasePdfKitService');
const PDFDocument = require('pdfkit');

// Mock de PDFDocument
jest.mock('pdfkit', () => {
    const mockDoc = {
        pipe: jest.fn().mockReturnThis(),
        end: jest.fn(),
        page: {
            width: 595.28,
            height: 841.89
        },
        x: 72,
        y: 72,
        rect: jest.fn().mockReturnThis(),
        fill: jest.fn().mockReturnThis(),
        fontSize: jest.fn().mockReturnThis(),
        fillColor: jest.fn().mockReturnThis(),
        text: jest.fn().mockReturnThis(),
        save: jest.fn().mockReturnThis(),
        translate: jest.fn().mockReturnThis(),
        rotate: jest.fn().mockReturnThis(),
        restore: jest.fn().mockReturnThis(),
        moveTo: jest.fn().mockReturnThis(),
        lineTo: jest.fn().mockReturnThis(),
        stroke: jest.fn().mockReturnThis(),
        lineWidth: jest.fn().mockReturnThis(),
        font: jest.fn().mockReturnThis(),
        addPage: jest.fn().mockReturnThis(),
        moveDown: jest.fn().mockReturnThis(),
        widthOfString: jest.fn().mockReturnValue(100),
        heightOfString: jest.fn().mockReturnValue(50),
        on: jest.fn(),
        registerFont: jest.fn()
    };
    
    return jest.fn().mockImplementation(() => mockDoc);
});

// Mock de fs
jest.mock('fs', () => ({
    existsSync: jest.fn().mockReturnValue(true),
    createWriteStream: jest.fn(() => ({
        on: jest.fn((event, callback) => {
            if (event === 'finish') {
                setTimeout(callback, 10);
            }
        })
    }))
}));

describe('BasePdfKitService', () => {
    let service;
    let mockDoc;

    beforeEach(() => {
        service = new BasePdfKitService();
        mockDoc = new PDFDocument();
        jest.clearAllMocks();
    });

    describe('Constructor', () => {
        test('devrait initialiser avec les valeurs par défaut', () => {
            expect(service.pageWidth).toBe(595.28);
            expect(service.pageHeight).toBe(841.89);
            expect(service.marginTop).toBe(72);
            expect(service.marginBottom).toBe(72);
            expect(service.marginLeft).toBe(72);
            expect(service.marginRight).toBe(72);
            expect(service.sidebarWidth).toBe(42.52);
            expect(service.tableOfContents).toEqual([]);
            expect(service.hasLongContentPages).toBe(false);
        });
    });

    describe('createDocument', () => {
        test('devrait créer un document avec les options par défaut', () => {
            const doc = service.createDocument();
            
            expect(PDFDocument).toHaveBeenCalledWith({
                size: 'A4',
                margins: {
                    top: 72,
                    bottom: 72,
                    left: 72,
                    right: 72
                }
            });
            
            expect(service.currentPageNumber).toBe(1);
            expect(service.chapterTitle).toBe('DOCUMENT');
        });

        test('devrait utiliser le chapterTitle fourni', () => {
            const doc = service.createDocument({ chapterTitle: 'MON CHAPITRE' });
            
            expect(service.chapterTitle).toBe('MON CHAPITRE');
        });

        test('devrait configurer les gestionnaires d\'événements', () => {
            const doc = service.createDocument();
            
            expect(mockDoc.on).toHaveBeenCalledWith('pageAdded', expect.any(Function));
        });
    });

    describe('drawSidebar', () => {
        test('devrait dessiner la sidebar à gauche pour page impaire', () => {
            service.chapterTitle = 'TEST TITLE';
            service.drawSidebar(mockDoc, 1);
            
            // Vérifier que le rectangle est dessiné à gauche
            expect(mockDoc.rect).toHaveBeenCalledWith(0, 0, 42.52, 841.89);
            expect(mockDoc.fill).toHaveBeenCalledWith('#000000');
        });

        test('devrait dessiner la sidebar à droite pour page paire', () => {
            service.chapterTitle = 'TEST TITLE';
            service.drawSidebar(mockDoc, 2);
            
            // Vérifier que le rectangle est dessiné à droite
            const expectedX = 595.28 - 42.52;
            expect(mockDoc.rect).toHaveBeenCalledWith(expectedX, 0, 42.52, 841.89);
        });

        test('devrait ajouter le texte vertical dans la sidebar', () => {
            service.chapterTitle = 'MONSTERHEARTS';
            service.drawSidebar(mockDoc, 1);
            
            // Vérifier la rotation et le texte
            expect(mockDoc.rotate).toHaveBeenCalledWith(-90, expect.any(Object));
            expect(mockDoc.text).toHaveBeenCalledWith('MONSTERHEARTS', expect.any(Number), expect.any(Number));
            expect(mockDoc.fillColor).toHaveBeenCalledWith('#FFFFFF');
        });

        test('devrait adapter la taille de police pour textes longs', () => {
            service.chapterTitle = 'UN TITRE VRAIMENT TRES LONG POUR TESTER';
            service.drawSidebar(mockDoc, 1);
            
            // Vérifier que la police est réduite
            expect(mockDoc.fontSize).toHaveBeenCalledWith(6);
        });
    });

    describe('drawPageNumber', () => {
        test('devrait placer le numéro à gauche pour page impaire', () => {
            service.drawPageNumber(mockDoc, 1);
            
            expect(mockDoc.fillColor).toHaveBeenCalledWith('#FFFFFF');
            expect(mockDoc.fontSize).toHaveBeenCalledWith(24);
            expect(mockDoc.text).toHaveBeenCalledWith('1', expect.any(Number), 50);
        });

        test('devrait placer le numéro à droite pour page paire', () => {
            service.drawPageNumber(mockDoc, 2);
            
            expect(mockDoc.text).toHaveBeenCalledWith('2', expect.any(Number), 50);
        });
    });

    describe('drawWatermark', () => {
        beforeEach(() => {
            service.currentPageNumber = 1;
        });

        test('devrait placer le watermark à droite pour page impaire', () => {
            service.drawWatermark(mockDoc, 'WATERMARK TEXT');
            
            expect(mockDoc.fillColor).toHaveBeenCalledWith('#000000');
            expect(mockDoc.fontSize).toHaveBeenCalledWith(8);
            expect(mockDoc.text).toHaveBeenCalledWith('WATERMARK TEXT', expect.any(Number), expect.any(Number));
        });

        test('devrait placer le watermark à gauche pour page paire', () => {
            service.currentPageNumber = 2;
            service.drawWatermark(mockDoc, 'WATERMARK TEXT');
            
            expect(mockDoc.text).toHaveBeenCalledWith('WATERMARK TEXT', 72, expect.any(Number));
        });

        test('devrait utiliser le chapterTitle si pas de texte fourni', () => {
            service.chapterTitle = 'DEFAULT WATERMARK';
            service.drawWatermark(mockDoc);
            
            expect(mockDoc.text).toHaveBeenCalledWith('DEFAULT WATERMARK', expect.any(Number), expect.any(Number));
        });
    });

    describe('onPageAdded', () => {
        beforeEach(() => {
            service.currentPageNumber = 1;
            service.chapterTitle = 'DOCUMENT';
        });

        test('devrait éviter la récursion avec _isDrawingPageElements', () => {
            service._isDrawingPageElements = true;
            const spyDrawSidebar = jest.spyOn(service, 'drawSidebar');
            
            service.onPageAdded(mockDoc);
            
            expect(spyDrawSidebar).not.toHaveBeenCalled();
        });

        test('devrait dessiner tous les éléments pour page normale', () => {
            const spyDrawSidebar = jest.spyOn(service, 'drawSidebar');
            const spyDrawPageNumber = jest.spyOn(service, 'drawPageNumber');
            const spyDrawWatermark = jest.spyOn(service, 'drawWatermark');
            
            service.onPageAdded(mockDoc);
            
            expect(spyDrawSidebar).toHaveBeenCalledWith(mockDoc, 1);
            expect(spyDrawPageNumber).toHaveBeenCalledWith(mockDoc, 1);
            expect(spyDrawWatermark).toHaveBeenCalled();
        });

        test('ne devrait pas dessiner sidebar/watermark pour pages spéciales', () => {
            service.hasLongContentPages = true;
            service.currentPageNumber = 1; // Page de garde
            
            const spyDrawSidebar = jest.spyOn(service, 'drawSidebar');
            const spyDrawWatermark = jest.spyOn(service, 'drawWatermark');
            
            service.onPageAdded(mockDoc);
            
            expect(spyDrawSidebar).not.toHaveBeenCalled();
            expect(spyDrawWatermark).not.toHaveBeenCalled();
        });
    });

    describe('addBox', () => {
        beforeEach(() => {
            service.currentPageNumber = 1;
        });

        test('devrait créer un encadré avec titre sur la bordure', () => {
            service.addBox(mockDoc, 'exemple', 'Texte d\'exemple');
            
            // Vérifier le rectangle principal
            expect(mockDoc.rect).toHaveBeenCalled();
            expect(mockDoc.stroke).toHaveBeenCalledWith('#000000');
            
            // Vérifier le rectangle blanc pour le label
            expect(mockDoc.fillColor).toHaveBeenCalledWith('#FFFFFF');
            expect(mockDoc.fill).toHaveBeenCalled();
            
            // Vérifier le texte du label
            expect(mockDoc.text).toHaveBeenCalledWith('EXEMPLE', expect.any(Number), expect.any(Number));
        });

        test('devrait adapter la hauteur au contenu', () => {
            const longText = 'Un texte très long '.repeat(20);
            
            // Simuler une largeur de texte importante pour forcer le découpage
            mockDoc.widthOfString.mockImplementation((text) => {
                // Les mots individuels sont petits, mais les phrases sont larges
                if (text.split(' ').length === 1) return 50; // Un mot
                return text.length * 10; // Phrase complète
            });
            
            service.addBox(mockDoc, 'conseil', longText);
            
            // Le texte devrait être découpé en plusieurs lignes
            const textCalls = mockDoc.text.mock.calls;
            expect(textCalls.length).toBeGreaterThanOrEqual(2); // Au moins le label + du texte
        });
    });

    describe('addTitle', () => {
        test('devrait ajouter un titre centré en majuscules', () => {
            mockDoc.widthOfString.mockReturnValue(100);
            service.addTitle(mockDoc, 'Mon Titre', { align: 'center' });
            
            expect(mockDoc.text).toHaveBeenCalledWith('MON TITRE', expect.any(Number), expect.any(Number));
        });

        test('devrait ajouter à la table des matières si demandé', () => {
            service.currentPageNumber = 5;
            service.addTitle(mockDoc, 'Section Importante', { addToToc: true, tocLevel: 1 });
            
            expect(service.tableOfContents).toHaveLength(1);
            expect(service.tableOfContents[0]).toEqual({
                title: 'SECTION IMPORTANTE',
                level: 1,
                page: 5
            });
        });
    });

    describe('addParagraph', () => {
        test('devrait découper le texte manuellement pour justify', () => {
            const longText = 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua '.repeat(5);
            
            // Réduire la largeur mock pour forcer le découpage
            mockDoc.widthOfString.mockImplementation((text) => text.length * 5);
            
            service.addParagraph(mockDoc, longText);
            
            // Vérifier que le texte a été découpé et écrit ligne par ligne
            const textCalls = mockDoc.text.mock.calls;
            expect(textCalls.length).toBeGreaterThan(1);
        });

        test('devrait respecter l\'indentation', () => {
            const savedX = mockDoc.x;
            service.addParagraph(mockDoc, 'Texte indenté', { indent: 20 });
            
            // L'indentation devrait être appliquée
            expect(mockDoc.x).toBe(savedX + 20);
        });
    });

    describe('addStarList', () => {
        test('devrait créer une liste avec puces étoiles', () => {
            const items = ['Premier item', 'Deuxième item', 'Troisième item'];
            
            service.addStarList(mockDoc, items);
            
            // Vérifier que chaque item a sa puce
            const textCalls = mockDoc.text.mock.calls;
            const starCalls = textCalls.filter(call => call[0] === '*');
            expect(starCalls).toHaveLength(3);
        });

        test('devrait maintenir l\'alignement correct', () => {
            const items = ['Item 1', 'Item 2'];
            const startX = mockDoc.x;
            
            service.addStarList(mockDoc, items);
            
            // Le curseur X devrait revenir à la position de départ
            expect(mockDoc.x).toBe(startX);
        });
    });

    describe('getContentMargins', () => {
        test('devrait ajuster les marges pour page impaire', () => {
            const margins = service.getContentMargins(1);
            
            expect(margins.left).toBe(72 + 42.52 + 10);
            expect(margins.right).toBe(72);
            expect(margins.width).toBe(595.28 - 72 - 72 - 42.52 - 10);
        });

        test('devrait ajuster les marges pour page paire', () => {
            const margins = service.getContentMargins(2);
            
            expect(margins.left).toBe(72);
            expect(margins.right).toBe(72 + 42.52 + 10);
            expect(margins.width).toBe(595.28 - 72 - 72 - 42.52 - 10);
        });
    });

    describe('isSpecialPage', () => {
        test('devrait retourner false si pas de document long', () => {
            service.hasLongContentPages = false;
            
            expect(service.isSpecialPage(1)).toBe(false);
            expect(service.isSpecialPage(2)).toBe(false);
        });

        test('devrait identifier pages 1 et 2 comme spéciales pour document long', () => {
            service.hasLongContentPages = true;
            
            expect(service.isSpecialPage(1)).toBe(true);
            expect(service.isSpecialPage(2)).toBe(true);
            expect(service.isSpecialPage(3)).toBe(false);
        });
    });

    describe('shouldAddLongDocumentPages', () => {
        test('devrait retourner true si plus de 5 pages', () => {
            service.currentPageNumber = 6;
            expect(service.shouldAddLongDocumentPages()).toBe(true);
        });

        test('devrait retourner false si 5 pages ou moins', () => {
            service.currentPageNumber = 5;
            expect(service.shouldAddLongDocumentPages()).toBe(false);
        });
    });

    describe('insertCoverPage', () => {
        test('devrait créer une page de garde centrée', () => {
            const data = {
                titre: 'GUIDE COMPLET',
                sous_titre: 'Manuel détaillé',
                auteur: 'John Doe'
            };
            
            service.insertCoverPage(mockDoc, data);
            
            // Vérifier que tous les éléments sont ajoutés
            const textCalls = mockDoc.text.mock.calls;
            expect(textCalls.some(call => call[0] === 'GUIDE COMPLET')).toBe(true);
            expect(textCalls.some(call => call[0] === 'Manuel détaillé')).toBe(true);
            expect(textCalls.some(call => call[0] === 'Par John Doe')).toBe(true);
        });
    });

    describe('insertTableOfContents', () => {
        test('devrait ajouter une nouvelle page pour TOC', () => {
            service.insertTableOfContents(mockDoc);
            
            expect(mockDoc.addPage).toHaveBeenCalled();
        });

        test('devrait utiliser les entrées réelles si disponibles', () => {
            service.tableOfContents = [
                { title: 'CHAPITRE 1', level: 1, page: 3 },
                { title: 'SECTION 1.1', level: 2, page: 4 }
            ];
            
            service.insertTableOfContents(mockDoc);
            
            const textCalls = mockDoc.text.mock.calls;
            expect(textCalls.some(call => call[0] === 'CHAPITRE 1')).toBe(true);
            expect(textCalls.some(call => call[0] === 'SECTION 1.1')).toBe(true);
        });

        test('devrait générer des entrées par défaut si aucune entrée', () => {
            service.tableOfContents = [];
            
            service.insertTableOfContents(mockDoc);
            
            const textCalls = mockDoc.text.mock.calls;
            expect(textCalls.some(call => call[0].includes('GUIDE COMPLET'))).toBe(true);
        });
    });

    describe('checkNewPage', () => {
        test('devrait ajouter une page si espace insuffisant', () => {
            mockDoc.y = 800;
            
            const result = service.checkNewPage(mockDoc, 100);
            
            expect(mockDoc.addPage).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        test('ne devrait pas ajouter de page si espace suffisant', () => {
            mockDoc.y = 400;
            
            const result = service.checkNewPage(mockDoc, 100);
            
            expect(mockDoc.addPage).not.toHaveBeenCalled();
            expect(result).toBe(false);
        });
    });

    describe('Gestion des erreurs', () => {
        test('devrait gérer les erreurs de rotation gracieusement', () => {
            mockDoc.rotate.mockImplementationOnce(() => {
                throw new Error('Rotation error');
            });
            
            // Ne devrait pas faire planter
            expect(() => service.drawSidebar(mockDoc, 1)).not.toThrow();
        });

        test('devrait gérer les textes vides', () => {
            expect(() => service.addParagraph(mockDoc, '')).not.toThrow();
            expect(() => service.addTitle(mockDoc, '')).not.toThrow();
            expect(() => service.addBox(mockDoc, 'exemple', '')).not.toThrow();
        });
    });

    describe('Performance', () => {
        test('devrait éviter les opérations inutiles sur pages spéciales', () => {
            service.hasLongContentPages = true;
            service.currentPageNumber = 1;
            
            const spyGetContentMargins = jest.spyOn(service, 'getContentMargins');
            const spyGetStandardMargins = jest.spyOn(service, 'getStandardMargins');
            
            service.onPageAdded(mockDoc);
            
            // Devrait utiliser les marges standard pour pages spéciales
            expect(spyGetStandardMargins).toHaveBeenCalled();
            expect(spyGetContentMargins).not.toHaveBeenCalled();
        });
    });
});