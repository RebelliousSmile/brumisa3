#!/usr/bin/env node

const PdfKitService = require('../src/services/PdfKitService');
const BasePdfKitService = require('../src/services/BasePdfKitService');
const MarkdownService = require('../src/services/MarkdownService');
const SystemRightsService = require('../src/services/SystemRightsService');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

class MonsterheartsDocumentGenerator extends BasePdfKitService {
    constructor() {
        super();
        this.markdownService = new MarkdownService();
    }

    async generateDocument(data, filePath) {
        // Configurer le titre pour le watermark AVANT de créer le document
        this.chapterTitle = data.titre || 'MONSTERHEARTS';
        
        const doc = this.createDocument({
            chapterTitle: this.chapterTitle
        });
        const stream = doc.pipe(fs.createWriteStream(filePath));
        
        // Utiliser Times-Roman comme police principale (plus proche de Crimson Text)
        doc.font('Times-Roman');
        
        // Titre principal
        if (data.titre) {
            this.addTitle(doc, data.titre, { fontSize: 16 });
        }
        
        // Sous-titre
        if (data.sous_titre) {
            doc.fontSize(12)
               .fillColor('#333333')
               .text(data.sous_titre, { align: 'center' });
            doc.moveDown(2);
        }
        
        // Introduction
        if (data.introduction) {
            doc.font('Times-Italic');
            this.addParagraph(doc, data.introduction);
            doc.font('Times-Roman');
        }
        
        // Sections
        for (const section of data.sections) {
            // Vérifier l'espace disponible pour la section
            this.checkNewPage(doc, 100);
            
            // Titre de section
            this.addTitle(doc, section.titre, { fontSize: 14, marginTop: 15 });
            
            // Description de section
            if (section.description) {
                this.addParagraph(doc, section.description);
            }
            
            // Contenu de la section
            for (const element of section.contenu) {
                this.renderElement(doc, element);
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
                this.addParagraph(doc, this.markdownService.toPlainText(element.texte));
                break;
                
            case 'liste':
                this.checkNewPage(doc, 100);
                const items = element.items.map(item => this.markdownService.toPlainText(item));
                this.addStarList(doc, items);
                break;
                
            case 'sous_section':
                this.checkNewPage(doc, 80);
                this.addTitle(doc, element.titre, { fontSize: 12, marginTop: 20 });
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
                this.addBox(doc, element.type, this.markdownService.toPlainText(element.texte));
                break;
                
            case 'separateur':
                this.checkNewPage(doc, 30);
                this.addSeparator(doc);
                break;
        }
    }
    
}

async function testDocumentGenerique() {
    console.log('🧪 Test génération document générique Monsterhearts avec PDFKit...\n');
    
    try {
        // Données de test pour le document générique
        const data = {
            titre: "COMMENT REMPLIR LE PLAN",
            sous_titre: "Guide pratique pour la création du plan de classe",
            introduction: "Le plan de classe est un outil visuel pour la MC permettant de suivre les relations sociales et la dynamique de groupe dans le lycée. Il sert à la fois d'aide-mémoire et de représentation spatiale des tensions sociales.",
            auteur: "La communauté Monsterhearts",
            sections: [
                {
                    titre: "PLACER LES PERSONNAGES JOUEURS (PJ)",
                    description: "Les personnages joueurs sont le cœur de votre histoire. Leur placement initial va définir la dynamique de base de votre partie.",
                    contenu: [
                        {
                            type: "liste",
                            balise: "ul",
                            items: [
                                "Commencez toujours par placer les PJ en premier",
                                "Notez leur nom, leur peau, et une note courte (trait distinctif, secret connu, etc.)",
                                "Leur placement initial peut refléter leurs relations établies lors de la création"
                            ]
                        },
                        {
                            type: "paragraphe",
                            texte: "Le placement des PJ n'est pas anodin. Il reflète leur position sociale dans le lycée et peut influencer leurs interactions futures. N'hésitez pas à demander aux joueurs où ils imaginent leur personnage assis."
                        },
                        {
                            type: "exemple",
                            texte: "Sarah la Reine est assise au centre de la classe, entourée de sa cour. Marcus le Loup-Garou est isolé près de la fenêtre, d'où il peut surveiller les alentours. Jade la Sorcière est au fond, proche de la porte pour pouvoir s'éclipser facilement."
                        }
                    ]
                },
                {
                    titre: "AJOUTER LES PERSONNAGES NON-JOUEURS (PNJ)",
                    description: "Les PNJ donnent vie au lycée et créent des opportunités dramatiques pour les PJ.",
                    contenu: [
                        {
                            type: "liste",
                            balise: "ul",
                            items: [
                                "Placez les PNJ importants autour des PJ",
                                "Priorisez ceux qui ont des liens directs avec les PJ",
                                "Chaque PNJ devrait avoir au moins un élément dramatique notable"
                            ]
                        },
                        {
                            type: "sous_section",
                            titre: "Types de PNJ à considérer",
                            elements: [
                                {
                                    type: "paragraphe",
                                    texte: "Les PNJ peuvent remplir différents rôles dans votre histoire. Voici les catégories principales à considérer lors du placement :"
                                },
                                {
                                    type: "liste",
                                    balise: "ul",
                                    items: [
                                        "Les amours potentiels ou actuels des PJ",
                                        "Les rivaux et ennemis déclarés",
                                        "Les figures d'autorité (professeurs, surveillants)",
                                        "Les membres de la famille présents au lycée",
                                        "Les amis proches et confidents"
                                    ]
                                }
                            ]
                        },
                        {
                            type: "conseil",
                            texte: "Ne surchargez pas le plan dès le début. Commencez avec 5-7 PNJ importants et ajoutez-en au fur et à mesure que l'histoire se développe."
                        }
                    ]
                },
                {
                    titre: "ORGANISATION SPATIALE SIGNIFICATIVE",
                    description: "La disposition des personnages dans la classe n'est pas aléatoire. Elle reflète les dynamiques sociales du lycée.",
                    contenu: [
                        {
                            type: "sous_section",
                            titre: "PROXIMITÉ = AFFINITÉ",
                            elements: [
                                {
                                    type: "liste",
                                    balise: "ul",
                                    items: [
                                        "Les amis proches sont assis côte à côte",
                                        "Les couples sont adjacents",
                                        "Les membres d'une même clique forment des groupes"
                                    ]
                                },
                                {
                                    type: "paragraphe",
                                    texte: "Cette règle simple permet de visualiser rapidement les alliances et les groupes sociaux. Un coup d'œil au plan vous rappelle qui est proche de qui."
                                }
                            ]
                        },
                        {
                            type: "sous_section",
                            titre: "DISTANCE = TENSION",
                            elements: [
                                {
                                    type: "paragraphe",
                                    texte: "Plus deux personnages sont éloignés sur le plan, plus leur relation est tendue ou distante. Utilisez ceci pour créer des situations dramatiques."
                                },
                                {
                                    type: "liste",
                                    balise: "ul",
                                    items: [
                                        "Les ex-amoureux aux extrémités opposées",
                                        "Les rivaux séparés par la plus grande distance",
                                        "Les secrets qui créent des barrières invisibles"
                                    ]
                                }
                            ]
                        },
                        {
                            type: "separateur"
                        }
                    ]
                },
                {
                    titre: "EVOLUTION DU PLAN DURANT LA PARTIE",
                    description: "Le plan de classe est un document vivant qui évolue avec votre histoire.",
                    contenu: [
                        {
                            type: "paragraphe",
                            texte: "Au fur et à mesure que les relations changent, n'hésitez pas à modifier le plan. Les personnages peuvent changer de place pour refléter de nouvelles alliances ou ruptures."
                        },
                        {
                            type: "liste",
                            balise: "ul",
                            items: [
                                "Notez les changements importants directement sur le plan",
                                "Utilisez des symboles pour marquer les relations (cœurs, éclairs, etc.)",
                                "Gardez une trace des anciennes positions si nécessaire"
                            ]
                        },
                        {
                            type: "attention",
                            texte: "Le plan n'est pas gravé dans le marbre. Si un changement dramatique survient (une rupture publique, une nouvelle amitié), reflétez-le immédiatement sur le plan."
                        }
                    ]
                }
            ]
        };
        
        // Générer le fichier PDF
        const systemRightsService = new SystemRightsService();
        const pdfPath = systemRightsService.generatePdfPath('document-generique', 'monsterhearts', 0, 'document-generique', 'public');
        const filePath = pdfPath.fullPath;
        
        // S'assurer que le dossier existe
        await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
        
        // Générer le PDF
        const generator = new MonsterheartsDocumentGenerator();
        await generator.generateDocument(data, filePath);
        
        console.log('✅ PDF généré avec succès !');
        console.log(`📁 Fichier : ${pdfPath.fileName}`);
        console.log(`📂 Chemin : ${filePath}`);
        
        // Vérifier la taille
        const stats = await fsPromises.stat(filePath);
        console.log(`📏 Taille : ${(stats.size / 1024).toFixed(2)} KB`);
        
        console.log('\n✨ Test terminé ! Vérifiez le PDF généré.');

    } catch (error) {
        console.error('❌ Erreur lors de la génération :', error);
        process.exit(1);
    }
}

// Lancer le test
testDocumentGenerique().catch(console.error);