const DocumentGeneriqueService = require('../../src/services/DocumentGeneriqueService');
const PdfKitService = require('../../src/services/PdfKitService');
const fs = require('fs').promises;
const path = require('path');

// Mock du système de fichiers
jest.mock('fs', () => ({
    promises: {
        readFile: jest.fn(),
        mkdir: jest.fn().mockResolvedValue(),
        stat: jest.fn().mockResolvedValue({ size: 6000 })
    },
    existsSync: jest.fn().mockReturnValue(true),
    mkdirSync: jest.fn(),
    stat: jest.fn((path, callback) => callback(null, { size: 6000 })),
    createWriteStream: jest.fn(() => ({
        on: jest.fn((event, callback) => {
            if (event === 'finish') {
                setTimeout(callback, 10);
            }
        })
    }))
}));

// Mock winston et du logManager pour éviter les problèmes de fichiers
jest.mock('../../src/utils/logManager', () => ({
    getLogger: jest.fn(() => ({
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
    }))
}));

describe('DocumentGeneriqueService', () => {
    let service;
    
    beforeEach(() => {
        service = new DocumentGeneriqueService();
        jest.clearAllMocks();
    });

    describe('validerDonnees', () => {
        test('devrait valider des données correctes', () => {
            const donnees = {
                titre: 'Mon Document',
                chapitre: 'TEST',
                sections: [
                    {
                        titre: 'Section 1',
                        contenus: [
                            { type: 'paragraphe', texte: 'Contenu test' }
                        ]
                    }
                ]
            };

            expect(() => service.validerDonnees(donnees)).not.toThrow();
        });

        test('devrait rejeter un document sans titre', () => {
            const donnees = {
                chapitre: 'TEST',
                sections: []
            };

            expect(() => service.validerDonnees(donnees))
                .toThrow('Données invalides: Le titre est requis');
        });

        test('devrait rejeter un document sans chapitre', () => {
            const donnees = {
                titre: 'Mon Document',
                sections: []
            };

            expect(() => service.validerDonnees(donnees))
                .toThrow('Données invalides: Le type de document est requis');
        });

        test('devrait rejeter un document sans sections', () => {
            const donnees = {
                titre: 'Mon Document',
                chapitre: 'TEST',
                sections: []
            };

            expect(() => service.validerDonnees(donnees))
                .toThrow('Données invalides: Au moins une section est requise');
        });

        test('devrait rejeter une section sans titre', () => {
            const donnees = {
                titre: 'Mon Document',
                chapitre: 'TEST',
                sections: [
                    {
                        titre: '',
                        contenus: [{ type: 'paragraphe', texte: 'Test' }]
                    }
                ]
            };

            expect(() => service.validerDonnees(donnees))
                .toThrow('Le titre de la section 1 est requis');
        });
    });

    describe('echapperHtml', () => {
        test('devrait échapper les caractères HTML dangereux', () => {
            const texte = '<script>alert("XSS")</script> & "quotes"';
            const resultat = service.echapperHtml(texte);
            
            expect(resultat).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt; &amp; &quot;quotes&quot;');
        });

        test('devrait gérer les valeurs nulles et vides', () => {
            expect(service.echapperHtml(null)).toBe('');
            expect(service.echapperHtml(undefined)).toBe('');
            expect(service.echapperHtml('')).toBe('');
        });
    });

    describe('traiterMarkdown', () => {
        test('devrait convertir le gras et l\'italique', () => {
            const texte = 'Texte **gras** et *italique*';
            const resultat = service.traiterMarkdown(texte);
            
            expect(resultat).toBe('Texte <strong>gras</strong> et <em>italique</em>');
        });

        test('devrait échapper le HTML avant le traitement markdown', () => {
            const texte = '**<script>alert()</script>**';
            const resultat = service.traiterMarkdown(texte);
            
            expect(resultat).toBe('<strong>&lt;script&gt;alert()&lt;/script&gt;</strong>');
        });

        test('devrait gérer les textes sans markdown', () => {
            const texte = 'Texte simple';
            const resultat = service.traiterMarkdown(texte);
            
            expect(resultat).toBe('Texte simple');
        });
    });

    describe('genererContenu', () => {
        test('devrait générer un paragraphe', () => {
            const contenu = {
                type: 'paragraphe',
                texte: 'Mon **paragraphe** de test'
            };
            
            const resultat = service.genererContenu(contenu);
            
            expect(resultat).toBe('<p>Mon <strong>paragraphe</strong> de test</p>');
        });

        test('devrait générer une liste à puces', () => {
            const contenu = {
                type: 'liste',
                items: ['Item 1', 'Item **gras**', 'Item 3']
            };
            
            const resultat = service.genererContenu(contenu);
            
            expect(resultat).toBe('<ul><li>Item 1</li><li>Item <strong>gras</strong></li><li>Item 3</li></ul>');
        });

        test('devrait générer une liste numérotée', () => {
            const contenu = {
                type: 'liste-numerotee',
                items: ['Étape 1', 'Étape 2']
            };
            
            const resultat = service.genererContenu(contenu);
            
            expect(resultat).toBe('<ol><li>Étape 1</li><li>Étape 2</li></ol>');
        });

        test('devrait générer une citation', () => {
            const contenu = {
                type: 'citation',
                texte: 'Une *belle* citation'
            };
            
            const resultat = service.genererContenu(contenu);
            
            expect(resultat).toBe('<blockquote>Une <em>belle</em> citation</blockquote>');
        });

        test('devrait générer un encadré', () => {
            const contenu = {
                type: 'encadre',
                titre: 'Attention',
                texte: 'Message **important**'
            };
            
            const resultat = service.genererContenu(contenu);
            
            expect(resultat).toBe('<div class="section-speciale"><h4>ATTENTION</h4><p>Message <strong>important</strong></p></div>');
        });

        test('devrait générer un encadré sans titre', () => {
            const contenu = {
                type: 'encadre',
                texte: 'Message simple'
            };
            
            const resultat = service.genererContenu(contenu);
            
            expect(resultat).toBe('<div class="section-speciale"><p>Message simple</p></div>');
        });
    });

    describe('genererSection', () => {
        test('devrait générer une section de niveau 1', () => {
            const section = {
                niveau: 1,
                titre: 'Ma Section',
                contenus: [
                    { type: 'paragraphe', texte: 'Contenu test' }
                ]
            };
            
            const resultat = service.genererSection(section);
            
            expect(resultat).toContain('<h2>MA SECTION</h2>');
            expect(resultat).toContain('<p>Contenu test</p>');
            expect(resultat).toMatch(/^<div class="section">.*<\/div>$/s);
        });

        test('devrait générer une section de niveau 2', () => {
            const section = {
                niveau: 2,
                titre: 'Sous-section',
                contenus: [
                    { type: 'liste', items: ['Item 1', 'Item 2'] }
                ]
            };
            
            const resultat = service.genererSection(section);
            
            expect(resultat).toContain('<h3>SOUS-SECTION</h3>');
            expect(resultat).toContain('<ul>');
        });
    });

    describe('genererHtml', () => {
        const templateMock = `<!DOCTYPE html>
<html>
<head><title><!-- TITRE --></title></head>
<body>
    <div class="sidebar">
        <div class="page-number"><!-- PAGE_NUMBER --></div>
        <div class="sidebar-text"><!-- CHAPITRE --></div>
    </div>
    <div class="content">
        <h1><!-- TITRE --></h1>
        <!-- INTRODUCTION -->
        <!-- SECTIONS -->
    </div>
    <div class="footer"><!-- PIED_DE_PAGE --></div>
</body>
</html>`;

        beforeEach(() => {
            fs.readFile.mockResolvedValue(templateMock);
        });

        test('devrait générer le HTML complet', async () => {
            const donnees = {
                titre: 'Mon Document Test',
                chapitre: 'TEST DOC',
                pageNumber: 42,
                piedDePage: 'Mon pied de page',
                introduction: 'Introduction du document',
                sections: [
                    {
                        niveau: 1,
                        titre: 'Section Principale',
                        contenus: [
                            { type: 'paragraphe', texte: 'Contenu de la section' }
                        ]
                    }
                ]
            };

            const resultat = await service.genererHtml('document-generique-v2', donnees, 'monsterhearts');

            // Vérifier les remplacements
            expect(resultat).toContain('<title>MON DOCUMENT TEST</title>');
            expect(resultat).toContain('<div class="page-number">42</div>');
            expect(resultat).toContain('<div class="sidebar-text">TEST DOC</div>');
            expect(resultat).toContain('<h1>MON DOCUMENT TEST</h1>');
            expect(resultat).toContain('<p class="intro">Introduction du document</p>');
            expect(resultat).toContain('<h2>SECTION PRINCIPALE</h2>');
            expect(resultat).toContain('<p>Contenu de la section</p>');
            expect(resultat).toContain('<div class="footer">Mon pied de page</div>');
        });

        test('devrait gérer les valeurs par défaut pour Monsterhearts', async () => {
            const donnees = {
                titre: 'Test',
                sections: []
            };

            const resultat = await service.genererHtml('document-generique-v2', donnees, 'monsterhearts');

            expect(resultat).toContain('<div class="page-number">1</div>');
            expect(resultat).toContain('<div class="sidebar-text">MONSTERHEARTS</div>');
            expect(resultat).toContain('Monsterhearts • Document • brumisa3.fr');
        });

        test('devrait gérer les valeurs par défaut pour Engrenages', async () => {
            const donnees = {
                titre: 'Test Engrenages',
                sections: []
            };

            const resultat = await service.genererHtml('document-generique-v2', donnees, 'engrenages');

            expect(resultat).toContain('<div class="sidebar-text">ENGRENAGES</div>');
            expect(resultat).toContain('Roue du Temps • Document • brumisa3.fr');
        });

        test('devrait gérer l\'absence d\'introduction', async () => {
            const donnees = {
                titre: 'Test',
                sections: []
            };

            const resultat = await service.genererHtml('document-generique-v2', donnees, 'monsterhearts');

            expect(resultat).not.toContain('<p class="intro">');
        });

        test('devrait gérer les erreurs de lecture du template', async () => {
            fs.readFile.mockRejectedValue(new Error('Fichier non trouvé'));

            const donnees = { titre: 'Test', sections: [] };

            await expect(service.genererHtml('inexistant', donnees))
                .rejects.toThrow('Erreur génération HTML: Fichier non trouvé');
        });

        test('devrait générer un document avec tous les types de contenu', async () => {
            const donnees = {
                titre: 'Document Complet',
                chapitre: 'TEST COMPLET',
                pageNumber: 2,
                piedDePage: 'Pied personnalisé',
                introduction: 'Introduction avec *italique*',
                sections: [
                    {
                        niveau: 1,
                        titre: 'Section avec tous les contenus',
                        contenus: [
                            { type: 'paragraphe', texte: 'Paragraphe **normal**' },
                            { type: 'liste', items: ['Item 1', 'Item *2*'] },
                            { type: 'liste-numerotee', items: ['Étape 1', 'Étape **2**'] },
                            { type: 'citation', texte: 'Citation *importante*' },
                            { type: 'encadre', titre: 'Conseil', texte: 'Texte **conseil**' }
                        ]
                    }
                ]
            };

            const resultat = await service.genererHtml('document-generique-v2', donnees, 'monsterhearts');

            expect(resultat).toContain('<div class="page-number">2</div>');
            expect(resultat).toContain('<p class="intro">Introduction avec <em>italique</em></p>');
            expect(resultat).toContain('<p>Paragraphe <strong>normal</strong></p>');
            expect(resultat).toContain('<ul><li>Item 1</li><li>Item <em>2</em></li></ul>');
            expect(resultat).toContain('<ol><li>Étape 1</li><li>Étape <strong>2</strong></li></ol>');
            expect(resultat).toContain('<blockquote>Citation <em>importante</em></blockquote>');
            expect(resultat).toContain('<div class="section-speciale"><h4>CONSEIL</h4><p>Texte <strong>conseil</strong></p></div>');
        });

        test('devrait gérer les sections de niveau 2', async () => {
            const donnees = {
                titre: 'Test Niveaux',
                sections: [
                    {
                        niveau: 2,
                        titre: 'Sous-section',
                        contenus: [
                            { type: 'paragraphe', texte: 'Contenu sous-section' }
                        ]
                    }
                ]
            };

            const resultat = await service.genererHtml('document-generique-v2', donnees, 'monsterhearts');

            expect(resultat).toContain('<h3>SOUS-SECTION</h3>');
        });
    });

    describe('Edge cases et validation', () => {
        test('devrait gérer une section avec un contenu de type inconnu', () => {
            const contenu = {
                type: 'type-inexistant',
                texte: 'Texte fallback'
            };
            
            const resultat = service.genererContenu(contenu);
            
            expect(resultat).toBe('<p>Texte fallback</p>');
        });

        test('devrait gérer un contenu sans texte', () => {
            const contenu = {
                type: 'paragraphe'
            };
            
            const resultat = service.genererContenu(contenu);
            
            expect(resultat).toBe('<p></p>');
        });

        test('devrait accepter les sections sans contenu (titres de chapitre)', () => {
            const donnees = {
                titre: 'Test',
                chapitre: 'TEST',
                sections: [
                    {
                        titre: 'Section avec contenu',
                        contenus: [{ type: 'paragraphe', texte: 'Test' }]
                    },
                    {
                        titre: 'Titre de chapitre sans contenu',
                        contenus: []
                    }
                ]
            };

            expect(() => service.validerDonnees(donnees)).not.toThrow();
        });

        test('devrait gérer les titres avec caractères spéciaux', () => {
            const donnees = {
                titre: 'Test & <script>alert("XSS")</script>',
                chapitre: 'TEST',
                sections: [
                    {
                        niveau: 1,
                        titre: 'Section & <malicious>',
                        contenus: [
                            { type: 'paragraphe', texte: 'Contenu sûr' }
                        ]
                    }
                ]
            };

            expect(() => service.validerDonnees(donnees)).not.toThrow();
            
            const section = service.genererSection(donnees.sections[0]);
            expect(section).toContain('SECTION &AMP; &LT;MALICIOUS&GT;');
        });

        test('devrait traiter le markdown imbriqué correctement', () => {
            const texte = '**Gras *et italique* dans gras** et *normal*';
            const resultat = service.traiterMarkdown(texte);
            
            expect(resultat).toBe('<strong>Gras <em>et italique</em> dans gras</strong> et <em>normal</em>');
        });
    });

    describe('getPiedDePageDefaut', () => {
        test('devrait retourner le bon pied de page pour chaque système', () => {
            expect(service.getPiedDePageDefaut('monsterhearts')).toBe('Monsterhearts • Document • brumisa3.fr');
            expect(service.getPiedDePageDefaut('engrenages')).toBe('Roue du Temps • Document • brumisa3.fr');
            expect(service.getPiedDePageDefaut('metro2033')).toBe('Metro 2033 • Document • brumisa3.fr');
            expect(service.getPiedDePageDefaut('mistengine')).toBe('Mist Engine • Document • brumisa3.fr');
        });

        test('devrait gérer un système inconnu', () => {
            expect(service.getPiedDePageDefaut('systeme-inconnu')).toBe('systeme-inconnu • Document • brumisa3.fr');
        });
    });

    describe('Intégration PDFKit', () => {
        let pdfKitService;

        beforeEach(() => {
            pdfKitService = new PdfKitService();
        });

        test('devrait pouvoir utiliser PDFKit pour générer un PDF', async () => {
            const options = {
                system: 'monsterhearts',
                template: 'plan-classe-instructions',
                titre: 'Test PDFKit Integration',
                userId: 123,
                systemRights: 'private',
                data: {
                    sections: [
                        {
                            titre: 'Section Test',
                            contenus: [
                                { type: 'paragraphe', texte: 'Contenu de test pour PDFKit' }
                            ]
                        }
                    ]
                }
            };

            const result = await pdfKitService.generatePDF(options);
            
            expect(result.success).toBe(true);
            expect(result.fileName).toMatch(/123_private_plan-classe-instructions_[a-f0-9]{16}\.pdf/);
            expect(result.system).toBe('monsterhearts');
            expect(result.template).toBe('plan-classe-instructions');
            expect(result.size).toBeGreaterThan(0);
        });

        test('devrait gérer les erreurs de génération PDFKit', async () => {
            const options = {
                system: 'systeme-inexistant',
                template: 'template-inexistant',
                titre: 'Test Erreur',
                userId: 123
            };

            const result = await pdfKitService.generatePDF(options);
            
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            expect(result.error).toContain('non supporté');
        });

        test('devrait générer des noms de fichiers uniques', async () => {
            const options1 = {
                system: 'monsterhearts',
                template: 'plan-classe-instructions',
                titre: 'Test 1',
                userId: 100
            };

            const options2 = {
                system: 'monsterhearts',
                template: 'plan-classe-instructions',
                titre: 'Test 2',
                userId: 200
            };

            const result1 = await pdfKitService.generatePDF(options1);
            const result2 = await pdfKitService.generatePDF(options2);
            
            expect(result1.success).toBe(true);
            expect(result2.success).toBe(true);
            expect(result1.fileName).not.toBe(result2.fileName);
            expect(result1.fileName).toMatch(/100_private_plan-classe-instructions_/);
            expect(result2.fileName).toMatch(/200_private_plan-classe-instructions_/);
        });

        test('devrait respecter les différents system rights', async () => {
            const baseOptions = {
                system: 'monsterhearts',
                template: 'plan-classe-instructions',
                titre: 'Test Rights',
                userId: 999
            };

            const privateResult = await pdfKitService.generatePDF({
                ...baseOptions,
                systemRights: 'private'
            });

            const publicResult = await pdfKitService.generatePDF({
                ...baseOptions,
                systemRights: 'public'
            });

            const commonResult = await pdfKitService.generatePDF({
                ...baseOptions,
                systemRights: 'common'
            });
            
            expect(privateResult.fileName).toMatch(/999_private_plan-classe-instructions_/);
            expect(publicResult.fileName).toMatch(/999_public_plan-classe-instructions_/);
            expect(commonResult.fileName).toMatch(/999_common_plan-classe-instructions_/);
        });

        test('devrait gérer les utilisateurs anonymes', async () => {
            const options = {
                system: 'monsterhearts',
                template: 'plan-classe-instructions',
                titre: 'Test Anonyme',
                userId: null,
                systemRights: 'public'
            };

            const result = await pdfKitService.generatePDF(options);
            
            expect(result.success).toBe(true);
            expect(result.fileName).toMatch(/0_public_plan-classe-instructions_/);
        });
    });
});