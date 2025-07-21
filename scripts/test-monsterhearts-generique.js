#!/usr/bin/env node

const puppeteer = require('puppeteer');
const PdfService = require('../src/services/PdfService');
const DocumentGeneriqueService = require('../src/services/DocumentGeneriqueService');
const MarkdownService = require('../src/services/MarkdownService');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');

// Enregistrer le helper eq pour Handlebars
handlebars.registerHelper('eq', function(a, b) {
    return a === b;
});

// Enregistrer les helpers markdown
const markdownService = new MarkdownService();
markdownService.registerHandlebarsHelpers(handlebars);

async function testDocumentGenerique() {
    console.log('🧪 Test génération document générique Monsterhearts...\n');

    const pdfService = new PdfService();
    const docService = new DocumentGeneriqueService();
    
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
                },
                {
                    titre: "CONSEILS PRATIQUES D'UTILISATION",
                    description: "Quelques astuces pour tirer le meilleur parti de votre plan de classe.",
                    contenu: [
                        {
                            type: "sous_section",
                            titre: "Pendant la préparation",
                            elements: [
                                {
                                    type: "liste",
                                    balise: "ul",
                                    items: [
                                        "Imprimez le plan en grand format si possible",
                                        "Utilisez des couleurs différentes pour les types de personnages",
                                        "Préparez des post-its pour les ajouts en cours de partie"
                                    ]
                                }
                            ]
                        },
                        {
                            type: "sous_section",
                            titre: "Pendant la partie",
                            elements: [
                                {
                                    type: "paragraphe",
                                    texte: "Gardez le plan visible devant vous pendant toute la session. Il vous servira de référence rapide pour :"
                                },
                                {
                                    type: "liste",
                                    balise: "ol",
                                    items: [
                                        "Choisir qui remarque un événement en classe",
                                        "Déterminer qui est témoin d'une scène",
                                        "Créer des complications basées sur la proximité",
                                        "Rappeler les tensions existantes"
                                    ]
                                },
                                {
                                    type: "conseil",
                                    texte: "Quand vous êtes à court d'idées, regardez le plan. Qui n'a pas été impliqué récemment ? Quelle relation pourrait exploser ? Le plan est votre générateur d'histoires."
                                }
                            ]
                        }
                    ]
                },
                {
                    titre: "SYMBOLES ET ANNOTATIONS",
                    description: "Un système de symboles cohérent rendra votre plan plus lisible et utile.",
                    contenu: [
                        {
                            type: "paragraphe",
                            texte: "Développez votre propre système de notation, mais voici quelques suggestions qui ont fait leurs preuves :"
                        },
                        {
                            type: "liste",
                            balise: "ul",
                            items: [
                                "♥ pour les relations amoureuses",
                                "⚡ pour les tensions et conflits",
                                "👁 pour ceux qui savent des secrets",
                                "⭐ pour les leaders de groupes",
                                "? pour les mystères non résolus"
                            ]
                        },
                        {
                            type: "exemple",
                            texte: "Sarah ♥? Marcus indique que Sarah a des sentiments pour Marcus, mais c'est incertain ou non réciproque. Marcus ⚡ Dylan montre une rivalité ouverte entre les deux."
                        },
                        {
                            type: "separateur"
                        },
                        {
                            type: "paragraphe",
                            texte: "N'oubliez pas que le plan de classe est avant tout un outil pour vous aider. Adaptez-le à vos besoins et à votre style de maîtrise."
                        }
                    ]
                },
                {
                    titre: "FORMATAGE MARKDOWN ET CITATIONS",
                    description: "Test des différents éléments de mise en forme pour valider le rendu PDF.",
                    contenu: [
                        {
                            type: "paragraphe",
                            texte: "Ce document supporte plusieurs éléments de formatage. Vous pouvez utiliser **du texte en gras** pour l'emphase forte, *du texte en italique* pour l'emphase légère, et même ***combiner les deux*** si nécessaire."
                        },
                        {
                            type: "conseil",
                            texte: "> Ceci est une citation en markdown. Les blocs de citation sont parfaits pour mettre en avant des conseils importants ou des témoignages de joueurs expérimentés."
                        },
                        {
                            type: "paragraphe",
                            texte: "Les listes peuvent être ordonnées ou non ordonnées, et elles s'affichent avec différents styles selon le contexte :"
                        },
                        {
                            type: "liste",
                            balise: "ul",
                            items: [
                                "Premier élément avec **emphase**",
                                "Deuxième élément avec *italique*",
                                "Troisième élément avec `code inline`"
                            ]
                        },
                        {
                            type: "exemple",
                            texte: "> « Le meilleur plan de classe est celui qui raconte déjà une histoire avant même que la partie commence. » - Un MC expérimenté"
                        },
                        {
                            type: "paragraphe",
                            texte: "Pour les éléments techniques, vous pouvez utiliser `du code inline` directement dans le texte, ce qui est utile pour référencer des mécaniques spécifiques comme `Manipuler quelqu'un` ou `Scruter dans les ténèbres`."
                        },
                        {
                            type: "attention",
                            texte: "Les **actions de base** sont au cœur du système. Assurez-vous que tous les joueurs les comprennent : *Faire pression*, *Manipuler*, *Scruter*, etc."
                        }
                    ]
                }
            ]
        };

        // Lire le template HTML
        const templatePath = path.join(__dirname, '..', 'src', 'templates', 'pdf', 'monsterhearts', 'document-generique.html');
        const templateHtml = await fs.readFile(templatePath, 'utf8');
        
        // Compiler avec Handlebars
        const template = handlebars.compile(templateHtml);
        const html = template(data);

        // Générer le PDF avec Puppeteer
        const browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        // Générer le fichier PDF
        const SystemRightsService = require('../src/services/SystemRightsService');
        const systemRightsService = new SystemRightsService();
        const pdfPath = systemRightsService.generatePdfPath('document-generique', 'monsterhearts', 0, 'document-generique', 'public');
        const filename = pdfPath.fileName;
        const filePath = pdfPath.fullPath;
        
        // S'assurer que le dossier existe
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        
        // Créer une page et générer le PDF
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.pdf({
            path: filePath,
            format: 'A4',
            printBackground: true,
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        });
        
        await browser.close();

        console.log('✅ PDF généré avec succès !');
        console.log(`📁 Fichier : ${filename}`);
        console.log(`📂 Chemin : ${filePath}`);
        
        // Vérifier la taille
        const stats = await fs.stat(filePath);
        console.log(`📏 Taille : ${(stats.size / 1024).toFixed(2)} KB`);
        
        console.log('\n✨ Test terminé ! Vérifiez le PDF généré.');

    } catch (error) {
        console.error('❌ Erreur lors de la génération :', error);
        process.exit(1);
    }
}

// Lancer le test
testDocumentGenerique().catch(console.error);