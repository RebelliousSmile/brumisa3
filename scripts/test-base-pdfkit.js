#!/usr/bin/env node

const BasePdfKitService = require('../src/services/BasePdfKitService');
const MarkdownService = require('../src/services/MarkdownService');
const SystemRightsService = require('../src/services/SystemRightsService');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

/**
 * Test du BasePdfKitService générique sans spécificités de jeu
 */
class GenericDocumentGenerator extends BasePdfKitService {
    constructor() {
        super();
        this.markdownService = new MarkdownService();
    }

    async generateDocument(data, filePath) {
        // Définir le watermark/chapterTitle AVANT de créer le document
        this.chapterTitle = data.watermark || data.titre || 'TEST GÉNÉRIQUE';
        
        const doc = this.createDocument({
            chapterTitle: this.chapterTitle
        });
        const stream = doc.pipe(fs.createWriteStream(filePath));
        
        // Utiliser la police par défaut
        doc.font('Times-Roman');
        
        // Titre principal
        if (data.titre) {
            this.addTitle(doc, data.titre, { fontSize: 18 });
        }
        
        // Introduction
        if (data.introduction) {
            doc.font('Times-Italic');
            this.addParagraph(doc, data.introduction);
            doc.font('Times-Roman');
        }
        
        // Sections
        for (const section of data.sections) {
            this.checkNewPage(doc, 100);
            
            // Titre de section
            this.addTitle(doc, section.titre, { fontSize: 14, marginTop: 15, addToToc: true, tocLevel: 1 });
            
            // Description de section
            if (section.description) {
                this.addParagraph(doc, section.description);
            }
            
            // Contenu de la section
            if (section.contenu) {
                for (const element of section.contenu) {
                    this.renderElement(doc, element);
                }
            }
        }
        
        // Vérifier si on doit ajouter garde + TOC pour documents longs
        this.finalizeLongDocument(doc, data);
        
        // Finaliser le document
        doc.end();
        
        return new Promise((resolve, reject) => {
            stream.on('finish', resolve);
            stream.on('error', reject);
        });
    }
    
    renderElement(doc, element) {
        switch (element.type) {
            case 'paragraphe':
                this.checkNewPage(doc, 50);
                this.addParagraph(doc, element.texte);
                break;
                
            case 'liste':
                this.checkNewPage(doc, 100);
                this.addStarList(doc, element.items);
                break;
                
            case 'sous_section':
                this.checkNewPage(doc, 80);
                this.addTitle(doc, element.titre, { fontSize: 12, marginTop: 20, addToToc: true, tocLevel: 2 });
                if (element.description) {
                    this.addParagraph(doc, element.description);
                }
                if (element.elements) {
                    for (const subElement of element.elements) {
                        this.renderElement(doc, subElement);
                    }
                }
                break;
                
            case 'conseil':
            case 'attention':
            case 'exemple':
                this.checkNewPage(doc, 80);
                this.addBox(doc, element.type, element.texte);
                break;
                
            case 'separateur':
                this.checkNewPage(doc, 30);
                this.addSeparator(doc);
                break;
                
            default:
                console.warn(`Type d'élément non géré: ${element.type}`);
        }
    }
}

async function testGenericDocument() {
    console.log('🧪 Test du BasePdfKitService générique...\n');
    
    try {
        // Données de test génériques
        const data = {
            titre: "TEST DOCUMENT GÉNÉRIQUE",
            sous_titre: "Guide complet du BasePdfKitService",
            auteur: "Équipe de développement",
            watermark: "COMMENT REMPLIR LE PLAN CORRECTEMENT",
            introduction: "Ceci est un document de test pour valider le fonctionnement du BasePdfKitService. Il contient différents types de contenu pour tester la pagination, l'alternance des barres latérales et le placement du contenu.",
            sections: [
                {
                    titre: "PREMIÈRE SECTION",
                    description: "Cette section teste les éléments de base du générateur de PDF.",
                    contenu: [
                        {
                            type: "paragraphe",
                            texte: "Ceci est un paragraphe de test. Il devrait être justifié et bien formaté selon les règles du BasePdfKitService. Le texte doit respecter les marges définies et éviter les barres latérales."
                        },
                        {
                            type: "liste",
                            items: [
                                "Premier élément de liste avec puce étoile",
                                "Deuxième élément pour tester l'alignement",
                                "Troisième élément avec du texte plus long pour vérifier que la justification fonctionne correctement"
                            ]
                        },
                        {
                            type: "paragraphe",
                            texte: "Un autre paragraphe après la liste pour tester l'espacement entre les éléments."
                        },
                        {
                            type: "conseil",
                            texte: "Ceci est un encadré de conseil pour tester l'affichage des citations dans le BasePdfKitService générique."
                        }
                    ]
                },
                {
                    titre: "DEUXIÈME SECTION - TEST PAGINATION",
                    description: "Cette section contient beaucoup de contenu pour forcer une nouvelle page.",
                    contenu: [
                        {
                            type: "sous_section",
                            titre: "Sous-section A",
                            description: "Description de la sous-section A.",
                            elements: [
                                {
                                    type: "paragraphe",
                                    texte: "Premier paragraphe de la sous-section A."
                                },
                                {
                                    type: "liste",
                                    items: [
                                        "Élément A1",
                                        "Élément A2",
                                        "Élément A3"
                                    ]
                                }
                            ]
                        },
                        {
                            type: "sous_section",
                            titre: "Sous-section B",
                            description: "Description de la sous-section B.",
                            elements: [
                                {
                                    type: "paragraphe",
                                    texte: "Premier paragraphe de la sous-section B."
                                },
                                {
                                    type: "paragraphe",
                                    texte: "Deuxième paragraphe de la sous-section B avec plus de contenu pour tester la pagination automatique."
                                }
                            ]
                        },
                        {
                            type: "separateur"
                        },
                        {
                            type: "paragraphe",
                            texte: "Paragraphe après séparateur pour tester les éléments de mise en page."
                        },
                        {
                            type: "attention",
                            texte: "Ceci est un encadré d'attention pour signaler des informations importantes."
                        },
                        {
                            type: "exemple",
                            texte: "Voici un exemple concret d'utilisation qui illustre le concept expliqué précédemment."
                        }
                    ]
                },
                {
                    titre: "TROISIÈME SECTION - TEST ALTERNANCE",
                    description: "Cette section teste spécifiquement l'alternance des barres latérales sur les pages paires et impaires.",
                    contenu: [
                        {
                            type: "paragraphe",
                            texte: "Contenu de la page pour forcer l'alternance. " + "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(20)
                        },
                        {
                            type: "paragraphe",
                            texte: "Plus de contenu pour atteindre la page suivante. " + "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ".repeat(15)
                        },
                        {
                            type: "liste",
                            items: [
                                "Élément sur nouvelle page",
                                "Vérification de l'alternance des barres",
                                "Test de positionnement du contenu"
                            ]
                        }
                    ]
                },
                {
                    titre: "QUATRIÈME SECTION - TESTS SUPPLÉMENTAIRES",
                    description: "Section ajoutée pour atteindre plus de 5 pages et tester la page de garde et table des matières.",
                    contenu: [
                        {
                            type: "paragraphe",
                            texte: "Cette section contient du contenu supplémentaire pour tester le document. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                        },
                        {
                            type: "sous_section",
                            titre: "Sous-section de test A",
                            description: "Description détaillée de la sous-section A.",
                            elements: [
                                {
                                    type: "paragraphe",
                                    texte: "Contenu de la sous-section A. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                                },
                                {
                                    type: "liste",
                                    items: [
                                        "Premier point de la liste longue",
                                        "Deuxième point avec du contenu étendu pour tester l'affichage",
                                        "Troisième point pour compléter la liste"
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    titre: "CINQUIÈME SECTION - CONTENU FINAL",
                    description: "Dernière section pour finaliser le test du document long.",
                    contenu: [
                        {
                            type: "paragraphe",
                            texte: "Section finale du document. Ut enim ad minim veniam, quis nostrud exercitation ullamco."
                        },
                        {
                            type: "attention",
                            texte: "Cette attention finale teste l'affichage des encadrés dans un document long avec page de garde et table des matières."
                        },
                        {
                            type: "exemple",
                            texte: "Exemple final pour montrer que tous les éléments fonctionnent correctement même dans un document avec page de garde."
                        }
                    ]
                }
            ]
        };
        
        // Générer le fichier PDF en utilisant le système unifié (null = générique)
        const systemRightsService = new SystemRightsService();
        const pdfPath = systemRightsService.generatePdfPath('test-base', null, 0, 'document-generique-base', 'public');
        // Corriger le chemin pour partir de la racine du projet
        const filePath = path.join(__dirname, '..', pdfPath.fullPath);
        
        console.log(`🔧 Utilisation du SystemRightsService pour générer le chemin :`);
        console.log(`   - Système : null (générique)`);
        console.log(`   - Template : document-generique-base`);
        console.log(`   - UserId : 0`);
        console.log(`   - Rights : public`);
        console.log(`   - Chemin généré : ${pdfPath.fullPath}`);
        
        // S'assurer que le dossier existe
        await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
        
        // Générer le PDF
        const generator = new GenericDocumentGenerator();
        await generator.generateDocument(data, filePath);
        
        console.log('✅ PDF générique généré avec succès !');
        console.log(`📁 Fichier : ${pdfPath.fileName}`);
        console.log(`📂 Chemin relatif : ${pdfPath.fullPath}`);
        console.log(`📂 Chemin absolu : ${filePath}`);
        
        // Vérifier si le fichier existe
        const fileExists = await fsPromises.access(filePath).then(() => true).catch(() => false);
        console.log(`📄 Fichier existe : ${fileExists ? '✅' : '❌'}`);
        
        // Vérifier la taille
        if (fileExists) {
            const stats = await fsPromises.stat(filePath);
            console.log(`📏 Taille : ${(stats.size / 1024).toFixed(2)} KB`);
        }
        
        console.log('\n🔍 Points à vérifier dans le PDF :');
        console.log('- ✓ Alternance des barres latérales (gauche/droite)');
        console.log('- ✓ Numérotation automatique des pages');
        console.log('- ✓ Texte vertical dans les barres');
        console.log('- ✓ Contenu bien positionné sans chevauchement');
        console.log('- ✓ Puces étoiles pour les listes');
        console.log('- ✓ Titres en majuscules centrés');
        
        console.log('\n✨ Test terminé ! Vérifiez le PDF généré.');

    } catch (error) {
        console.error('❌ Erreur lors de la génération :', error);
        process.exit(1);
    }
}

// Lancer le test
testGenericDocument().catch(console.error);