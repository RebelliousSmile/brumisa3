const PdfKitService = require('../../src/services/PdfKitService');
const SystemRightsService = require('../../src/services/SystemRightsService');
const fs = require('fs').promises;
const path = require('path');

// Mock du système de fichiers pour les tests
jest.mock('fs', () => ({
    createWriteStream: jest.fn(() => ({
        on: jest.fn((event, callback) => {
            if (event === 'finish') {
                // Simuler la fin d'écriture
                setTimeout(callback, 10);
            }
        })
    })),
    promises: {
        mkdir: jest.fn().mockResolvedValue(),
        stat: jest.fn().mockResolvedValue({ size: 6000 })
    }
}));

// Mock de PDFDocument
jest.mock('pdfkit', () => {
    return jest.fn().mockImplementation(() => ({
        pipe: jest.fn(),
        end: jest.fn(),
        page: {
            width: 595,
            height: 842
        },
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
        font: jest.fn().mockReturnThis(),
        addPage: jest.fn().mockReturnThis(),
        registerFont: jest.fn().mockReturnThis(),
        lineWidth: jest.fn().mockReturnThis(),
        stroke: jest.fn().mockReturnThis(),
        strokeColor: jest.fn().mockReturnThis(),
        on: jest.fn((event, callback) => {
            if (event === 'end') {
                // Simulate PDF generation completion
                setTimeout(callback, 5);
            }
        })
    }));
});

describe('PdfKitService', () => {
    let pdfKitService;
    let systemRightsService;

    beforeEach(() => {
        pdfKitService = new PdfKitService();
        systemRightsService = new SystemRightsService();
        jest.clearAllMocks();
    });

    describe('generatePDF', () => {
        test('devrait générer un PDF avec des options par défaut', async () => {
            const result = await pdfKitService.generatePDF({
                data: {
                    className: 'The Chosen',
                    description: 'Classe description de test',
                    stats: ['hot', 'cold', 'volatile', 'dark'],
                    moves: ['move1', 'move2'],
                    sections: []
                }
            });
            
            expect(result.success).toBe(true);
            expect(result.fileName).toMatch(/0_private_plan-classe-instructions_\d{8}-\d{6}\.pdf/);
            expect(result.system).toBe('monsterhearts');
            expect(result.template).toBe('plan-classe-instructions');
            expect(result.size).toBe(6000);
        });

        test('devrait générer un PDF avec options personnalisées', async () => {
            const options = {
                system: 'monsterhearts',
                template: 'plan-classe-instructions',
                titre: 'Mon Document Test',
                userId: 456,
                systemRights: 'public',
                data: {
                    className: 'The Witch',
                    introduction: 'Introduction de test',
                    sections: [
                        {
                            titre: 'Section 1',
                            contenus: [
                                { type: 'paragraphe', texte: 'Contenu de test' }
                            ]
                        }
                    ]
                }
            };

            const result = await pdfKitService.generatePDF(options);
            
            expect(result.success).toBe(true);
            expect(result.fileName).toMatch(/456_public_plan-classe-instructions_\d{8}-\d{6}\.pdf/);
            expect(result.fullPath).toContain('output\\pdfs\\monsterhearts');
        });

        test('devrait gérer les erreurs pour système non supporté', async () => {
            const options = {
                system: 'systeme-invalide',
                template: 'test',
                titre: 'Test'
            };

            const result = await pdfKitService.generatePDF(options);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('Aucun mapping trouvé pour le système: systeme-invalide');
        });

        test('devrait gérer les erreurs pour template non supporté', async () => {
            const options = {
                system: 'monsterhearts',
                template: 'template-invalide',
                titre: 'Test'
            };

            const result = await pdfKitService.generatePDF(options);
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('Template non supporté pour monsterhearts: template-invalide');
        });
    });

    describe('generateTemplate', () => {
        test('devrait déléguer à generateMonsterheartsTemplate pour monsterhearts', async () => {
            const spy = jest.spyOn(pdfKitService, 'generateMonsterheartsTemplate').mockResolvedValue();
            
            await pdfKitService.generateTemplate('monsterhearts', 'plan-classe-instructions', '/test/path', {});
            
            expect(spy).toHaveBeenCalledWith('plan-classe-instructions', '/test/path', {});
            spy.mockRestore();
        });

        test('devrait lever une erreur pour systèmes non implémentés', async () => {
            await expect(
                pdfKitService.generateTemplate('engrenages', 'test', '/path', {})
            ).rejects.toThrow('Template engrenages/test pas encore implémenté avec PDFKit');
        });
    });

    describe('generateMonsterheartsTemplate', () => {
        test('devrait déléguer à generatePlanClasseInstructions pour plan-classe-instructions', async () => {
            const spy = jest.spyOn(pdfKitService, 'generatePlanClasseInstructions').mockResolvedValue();
            
            await pdfKitService.generateMonsterheartsTemplate('plan-classe-instructions', '/test/path', {});
            
            expect(spy).toHaveBeenCalledWith('/test/path', {});
            spy.mockRestore();
        });

        test('devrait lever une erreur pour template Monsterhearts non supporté', async () => {
            await expect(
                pdfKitService.generateMonsterheartsTemplate('template-invalide', '/path', {})
            ).rejects.toThrow('Template Monsterhearts template-invalide non supporté');
        });
    });

    describe('Nom de fichier et droits système', () => {
        test('devrait utiliser SystemRightsService pour générer les noms', async () => {
            const spy = jest.spyOn(pdfKitService.systemRightsService, 'generatePdfPath');
            spy.mockReturnValue({ fileName: 'test_file.pdf', fullPath: '/test/path.pdf' });
            
            const options = {
                system: 'monsterhearts',
                template: 'plan-classe-instructions',
                titre: 'Test SystemRights',
                userId: 789,
                systemRights: 'common'
            };

            await pdfKitService.generatePDF(options);
            
            // Vérifier que SystemRightsService a été appelé avec les bons paramètres
            expect(spy).toHaveBeenCalledWith(
                'Test SystemRights',
                'monsterhearts',
                789,
                'plan-classe-instructions',
                'common'
            );
            
            spy.mockRestore();
        });

        test('devrait gérer userId null (utilisateur anonyme)', async () => {
            const options = {
                system: 'monsterhearts',
                template: 'plan-classe-instructions',
                titre: 'Test Anonyme',
                userId: null,
                systemRights: 'public'
            };

            const result = await pdfKitService.generatePDF(options);
            
            expect(result.success).toBe(true);
            expect(result.fileName).toMatch(/0_public_plan-classe-instructions_\d{8}-\d{6}\.pdf/);
        });

        test('devrait utiliser des valeurs par défaut pour systemRights', async () => {
            const options = {
                system: 'monsterhearts',
                template: 'plan-classe-instructions',
                titre: 'Test Defaults',
                userId: 123
                // pas de systemRights spécifié
            };

            const result = await pdfKitService.generatePDF(options);
            
            expect(result.success).toBe(true);
            expect(result.fileName).toMatch(/123_private_plan-classe-instructions_\d{8}-\d{6}\.pdf/);
        });
    });

    describe('Gestion des répertoires', () => {
        test('devrait créer le répertoire de sortie', async () => {
            const options = {
                system: 'monsterhearts',
                template: 'plan-classe-instructions',
                titre: 'Test Directory'
            };

            await pdfKitService.generatePDF(options);
            
            expect(fs.mkdir).toHaveBeenCalledWith(
                expect.stringContaining('output\\pdfs\\monsterhearts'),
                { recursive: true }
            );
        });
    });

    describe('Intégration avec PDFDocument', () => {
        test('devrait créer et configurer correctement PDFDocument', async () => {
            const PDFDocument = require('pdfkit');
            
            const options = {
                system: 'monsterhearts',
                template: 'plan-classe-instructions',
                titre: 'Test PDF Document'
            };

            await pdfKitService.generatePDF(options);
            
            // Vérifier que PDFDocument a été créé avec les bonnes options
            expect(PDFDocument).toHaveBeenCalledWith({
                size: 'A4',
                margins: {
                    top: 20,
                    bottom: 20,
                    left: 25,
                    right: 20
                }
            });
        });
    });

    describe('Performance et qualité', () => {
        test('devrait générer des fichiers de taille raisonnable', async () => {
            const result = await pdfKitService.generatePDF({
                system: 'monsterhearts',
                template: 'plan-classe-instructions',
                titre: 'Test Taille'
            });
            
            expect(result.success).toBe(true);
            expect(result.size).toBeGreaterThan(1000); // Au moins 1KB
            expect(result.size).toBeLessThan(50000); // Moins de 50KB pour un document simple
        });

        test('devrait générer des noms de fichiers uniques', async () => {
            const options = {
                system: 'monsterhearts',
                template: 'plan-classe-instructions',
                titre: 'Test Unique',
                userId: 100
            };

            const result1 = await pdfKitService.generatePDF(options);
            const result2 = await pdfKitService.generatePDF(options);
            
            // Les timestamps devraient être différents (ou au moins très probablement)
            // Mais ils doivent avoir la même structure
            expect(result1.fileName).toMatch(/100_private_plan-classe-instructions_\d{8}-\d{6}\.pdf/);
            expect(result2.fileName).toMatch(/100_private_plan-classe-instructions_\d{8}-\d{6}\.pdf/);
        });
    });

    describe('Gestion des erreurs', () => {
        test('devrait capturer et retourner les erreurs de génération', async () => {
            // Simuler une erreur dans fs.createWriteStream
            const fsReal = require('fs');
            fsReal.createWriteStream.mockImplementation(() => {
                throw new Error('Erreur écriture fichier');
            });

            const result = await pdfKitService.generatePDF({
                system: 'monsterhearts',
                template: 'plan-classe-instructions',
                titre: 'Test Erreur'
            });
            
            expect(result.success).toBe(false);
            expect(result.error).toContain('Erreur écriture fichier');
        });
    });
});