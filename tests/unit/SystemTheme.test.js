const SystemTheme = require('../../src/services/themes/SystemTheme');
const MonsterheartsTheme = require('../../src/services/themes/MonsterheartsTheme');

describe('SystemTheme', () => {
    describe('Interface abstraite', () => {
        test('ne devrait pas pouvoir être instanciée directement', () => {
            // SystemTheme peut être instanciée mais ses méthodes lancent des erreurs
            const theme = new SystemTheme();
            expect(() => {
                theme.getColors();
            }).toThrow('SystemTheme.getColors() must be implemented by subclass');
        });

        test('devrait exiger l\'implémentation de toutes les méthodes abstraites', () => {
            class IncompleteTheme extends SystemTheme {
                // Implémentation partielle seulement
                getColors() {
                    return {};
                }
            }

            const theme = new IncompleteTheme();
            
            // Toutes les méthodes non implémentées devraient lever une erreur
            expect(() => theme.getFonts()).toThrow('SystemTheme.getFonts() must be implemented by subclass');
            expect(() => theme.registerFonts()).toThrow('SystemTheme.registerFonts() must be implemented by subclass');
            expect(() => theme.applyFont()).toThrow('SystemTheme.getFonts() must be implemented by subclass'); // applyFont appelle getFonts()
            expect(() => theme.getSidebarText()).toThrow('SystemTheme.getSidebarText() must be implemented by subclass');
            expect(() => theme.getWatermarkText()).toThrow('SystemTheme.getWatermarkText() must be implemented by subclass');
            expect(() => theme.getListConfig()).toThrow('SystemTheme.getListConfig() must be implemented by subclass');
            expect(() => theme.getBoxStyles()).toThrow('SystemTheme.getBoxStyles() must be implemented by subclass');
        });

        test('devrait permettre l\'implémentation complète', () => {
            class CompleteTheme extends SystemTheme {
                getColors() { return {}; }
                getFonts() { return {}; }
                registerFonts() { return true; }
                applyFont() { return true; }
                getSidebarText() { return 'TEST'; }
                getWatermarkText() { return 'test.fr'; }
                getListConfig() { return {}; }
                getBoxStyles() { return {}; }
            }

            expect(() => {
                const theme = new CompleteTheme();
                // Toutes les méthodes devraient fonctionner
                theme.getColors();
                theme.getFonts();
                theme.registerFonts();
                theme.applyFont();
                theme.getSidebarText();
                theme.getWatermarkText();
                theme.getListConfig();
                theme.getBoxStyles();
            }).not.toThrow();
        });
    });

    describe('Méthodes optionnelles', () => {
        class TestTheme extends SystemTheme {
            getColors() { return {}; }
            getFonts() { return {}; }
            registerFonts() { return true; }
            applyFont() { return true; }
            getSidebarText() { return 'TEST'; }
            getWatermarkText() { return 'test.fr'; }
            getListConfig() { return {}; }
            getBoxStyles() { return {}; }
        }

        let theme;

        beforeEach(() => {
            theme = new TestTheme();
        });

        test('applyTitleStyle devrait retourner le texte tel quel par défaut', () => {
            const result = theme.applyTitleStyle(null, 'Mon Titre', 1, {});
            expect(result).toBe('Mon Titre');
        });

        test('applyParagraphStyle ne devrait pas lever d\'erreur par défaut', () => {
            expect(() => {
                theme.applyParagraphStyle(null, false);
            }).not.toThrow();
        });
    });
});

describe('MonsterheartsTheme', () => {
    let theme;

    beforeEach(() => {
        theme = new MonsterheartsTheme();
    });

    describe('Constructor', () => {
        test('devrait hériter de SystemTheme', () => {
            expect(theme instanceof SystemTheme).toBe(true);
        });

        test('devrait initialiser le nom du système', () => {
            expect(theme.systemName).toBe('monsterhearts');
        });
    });

    describe('getColors', () => {
        test('devrait retourner le schéma de couleurs Monsterhearts', () => {
            const colors = theme.getColors();
            
            expect(colors).toEqual({
                primary: '#000000',
                background: '#FAFAF8',
                secondary: '#333333',
                accent: '#FFFFFF',
                sidebar: '#000000',
                text: '#000000'
            });
        });
    });

    describe('getFonts', () => {
        test('devrait retourner la configuration des polices Crimson Text', () => {
            const fonts = theme.getFonts();
            
            expect(fonts).toHaveProperty('body');
            expect(fonts.body).toHaveProperty('family', 'CrimsonText-Regular');
            expect(fonts.body).toHaveProperty('size', 12);
            
            expect(fonts).toHaveProperty('titles');
            expect(fonts.titles).toHaveProperty('family', 'CrimsonText-Bold');
            expect(fonts.titles).toHaveProperty('sizes');
            expect(fonts.titles.sizes).toEqual({
                h1: 18,
                h2: 14,
                h3: 12
            });
        });
    });

    describe('registerFonts', () => {
        let mockDoc;

        beforeEach(() => {
            mockDoc = {
                registerFont: jest.fn()
            };
        });

        test('devrait enregistrer les polices Crimson Text', () => {
            const result = theme.registerFonts(mockDoc);
            
            expect(mockDoc.registerFont).toHaveBeenCalledTimes(4);
            expect(mockDoc.registerFont).toHaveBeenCalledWith('CrimsonText-Regular', expect.stringContaining('CrimsonText-Regular.ttf'));
            expect(mockDoc.registerFont).toHaveBeenCalledWith('CrimsonText-Bold', expect.stringContaining('CrimsonText-Bold.ttf'));
            expect(mockDoc.registerFont).toHaveBeenCalledWith('CrimsonText-Italic', expect.stringContaining('CrimsonText-Italic.ttf'));
            expect(mockDoc.registerFont).toHaveBeenCalledWith('CrimsonText-BoldItalic', expect.stringContaining('CrimsonText-BoldItalic.ttf'));
            
            expect(result).toBe(true);
        });

        test('devrait gérer les erreurs d\'enregistrement', () => {
            mockDoc.registerFont.mockImplementation(() => {
                throw new Error('Font not found');
            });

            const result = theme.registerFonts(mockDoc);
            expect(result).toBe(false);
        });
    });

    describe('applyFont', () => {
        let mockDoc;

        beforeEach(() => {
            mockDoc = {
                font: jest.fn().mockReturnThis(),
                fontSize: jest.fn().mockReturnThis()
            };
        });

        test('devrait appliquer la police body par défaut', () => {
            theme.applyFont(mockDoc, 'body');
            
            expect(mockDoc.font).toHaveBeenCalledWith('CrimsonText-Regular');
            expect(mockDoc.fontSize).toHaveBeenCalledWith(12);
        });

        test('devrait appliquer la police de titre', () => {
            theme.applyFont(mockDoc, 'title');
            
            expect(mockDoc.font).toHaveBeenCalledWith('CrimsonText-Bold');
            expect(mockDoc.fontSize).toHaveBeenCalledWith(14);
        });

        test('devrait fallback vers Helvetica si Crimson Text indisponible', () => {
            mockDoc.font.mockImplementation(() => {
                throw new Error('Font not available');
            });

            theme.applyFont(mockDoc, 'body');
            
            // Devrait essayer Crimson Text puis fallback vers Helvetica
            expect(mockDoc.font).toHaveBeenCalledWith('CrimsonText-Regular');
            expect(mockDoc.font).toHaveBeenCalledWith('Helvetica');
        });
    });

    describe('getSidebarText', () => {
        test('devrait retourner texte pour plan de classe', () => {
            const data = { className: 'The Chosen' };
            const result = theme.getSidebarText('class-plan', data);
            
            expect(result).toBe('THE CHOSEN');
        });

        test('devrait retourner texte pour document générique', () => {
            const data = { titre: 'Guide Complet' };
            const result = theme.getSidebarText('generic', data);
            
            expect(result).toBe('GUIDE COMPLET');
        });

        test('devrait retourner texte par défaut pour feuille de personnage', () => {
            const data = { characterName: 'Alice' };
            const result = theme.getSidebarText('character-sheet', data);
            
            expect(result).toBe('FEUILLE DE PERSONNAGE');
        });

        test('devrait gérer les données manquantes', () => {
            const result = theme.getSidebarText('generic', {});
            
            expect(result).toBe('MONSTERHEARTS');
        });
    });

    describe('getWatermarkText', () => {
        test('devrait retourner l\'URL du site', () => {
            const result = theme.getWatermarkText();
            expect(result).toBe('brumisater');
        });
    });

    describe('getListConfig', () => {
        test('devrait retourner la configuration des listes avec étoiles', () => {
            const config = theme.getListConfig();
            
            expect(config).toEqual({
                bulletChar: '★',
                fontSize: 11,
                indent: 20,
                lineSpacing: 15
            });
        });
    });

    describe('getBoxStyles', () => {
        test('devrait retourner les styles des encadrés', () => {
            const styles = theme.getBoxStyles();
            
            expect(styles).toEqual({
                borderColor: '#000000',
                backgroundColor: '#FFFFFF',
                padding: 10,
                marginTop: 15,
                marginBottom: 15
            });
        });
    });

    describe('applyTitleStyle', () => {
        test('devrait convertir en majuscules et nettoyer le texte', () => {
            const result = theme.applyTitleStyle(null, 'Mon Titre Important', 1, {});
            expect(result).toBe('MON TITRE IMPORTANT');
        });

        test('devrait préserver les caractères spéciaux utiles', () => {
            const result = theme.applyTitleStyle(null, 'Règle n°1 : être créatif', 1, {});
            expect(result).toBe('RÈGLE N°1 : ÊTRE CRÉATIF');
        });
    });

    describe('applyParagraphStyle', () => {
        let mockDoc;

        beforeEach(() => {
            mockDoc = {
                font: jest.fn().mockReturnThis(),
                fontSize: jest.fn().mockReturnThis(),
                fillColor: jest.fn().mockReturnThis()
            };
        });

        test('devrait appliquer le style paragraph normal', () => {
            theme.applyParagraphStyle(mockDoc, false);
            
            expect(mockDoc.font).toHaveBeenCalledWith('CrimsonText-Regular');
            expect(mockDoc.fontSize).toHaveBeenCalledWith(12);
            expect(mockDoc.fillColor).toHaveBeenCalledWith('#000000');
        });

        test('devrait appliquer le style intro (italique)', () => {
            theme.applyParagraphStyle(mockDoc, true);
            
            expect(mockDoc.font).toHaveBeenCalledWith('CrimsonText-Italic');
            expect(mockDoc.fontSize).toHaveBeenCalledWith(12);
        });
    });

    describe('Intégration avec documents', () => {
        test('devrait fonctionner avec tous les types de documents', () => {
            const documentTypes = ['generic', 'class-plan', 'character-sheet'];
            
            for (const docType of documentTypes) {
                const sidebarText = theme.getSidebarText(docType, { titre: 'Test' });
                expect(typeof sidebarText).toBe('string');
                expect(sidebarText.length).toBeGreaterThan(0);
            }
        });

        test('devrait maintenir la cohérence visuelle', () => {
            const colors = theme.getColors();
            const fonts = theme.getFonts();
            
            // Vérifier que les couleurs principales sont cohérentes
            expect(colors.primary).toBe('#000000');
            expect(colors.sidebar).toBe('#000000');
            
            // Vérifier que les polices utilisent la même famille
            expect(fonts.body.family).toContain('CrimsonText');
            expect(fonts.titles.family).toContain('CrimsonText');
        });
    });
});