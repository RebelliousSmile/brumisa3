#!/usr/bin/env node

const BasePdfKitService = require('../src/services/BasePdfKitService');
const MarkdownService = require('../src/services/MarkdownService');
const SystemRightsService = require('../src/services/SystemRightsService');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

/**
 * Test spécifique pour un document long (> 5 pages) avec garde et TOC
 */
class LongDocumentGenerator extends BasePdfKitService {
    constructor() {
        super();
        this.markdownService = new MarkdownService();
    }

    async generateDocument(data, filePath) {
        // Définir le watermark/chapterTitle AVANT de créer le document
        this.chapterTitle = data.watermark || data.titre || 'DOCUMENT LONG';
        
        // Pour les tests, forcer un document long AVANT de créer le document
        console.log('📋 Préparation d\'un document long avec garde et TOC');
        this.hasLongContentPages = true; // Définir AVANT createDocument
        
        const doc = this.createDocument({
            chapterTitle: this.chapterTitle
        });
        const stream = doc.pipe(fs.createWriteStream(filePath));
        
        // Initialiser les pages spéciales
        this.initializeLongDocument(doc, data);
        
        // Ajouter une nouvelle page pour le contenu principal
        doc.addPage();
        
        // Utiliser la police par défaut
        doc.font('Times-Roman');
        
        // Titre principal
        if (data.titre) {
            this.addTitle(doc, data.titre, { fontSize: 18, addToToc: true, tocLevel: 1 });
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
        
        console.log(`📄 Document final généré avec ${this.currentPageNumber} pages totales`);
        
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

async function testLongDocument() {
    console.log('📚 Test d\'un document long (> 5 pages) avec page de garde et TOC...\n');
    
    try {
        // Données pour un document volontairement long
        const data = {
            titre: "GUIDE COMPLET DE CRÉATION DE PERSONNAGE",
            sous_titre: "Manuel détaillé pour maîtres de jeu",
            auteur: "L'équipe de développement",
            watermark: "GUIDE CRÉATION",
            introduction: "Ce guide complet vous accompagne dans toutes les étapes de création de personnages pour vos parties de jeu de rôle. Il contient des conseils, des exemples et des techniques avancées pour créer des personnages mémorables et équilibrés.",
            sections: [
                {
                    titre: "PREMIÈRE PARTIE : LES BASES",
                    description: "Cette section couvre les fondamentaux de la création de personnage.",
                    contenu: [
                        {
                            type: "sous_section",
                            titre: "Comprendre le concept",
                            description: "Le concept est l'âme de votre personnage.",
                            elements: [
                                {
                                    type: "paragraphe",
                                    texte: "Un bon concept de personnage doit être à la fois original et crédible dans l'univers de jeu. Il faut éviter les stéréotypes tout en restant cohérent avec le genre et le ton de la campagne."
                                },
                                {
                                    type: "liste",
                                    items: [
                                        "Définir une motivation principale claire et forte",
                                        "Créer un background cohérent avec l'univers",
                                        "Établir des liens avec le monde et les autres personnages",
                                        "Prévoir des axes de développement pour l'évolution"
                                    ]
                                },
                                {
                                    type: "conseil",
                                    texte: "Commencez toujours par une phrase simple qui résume votre personnage. Par exemple : 'Un ancien soldat hanté par ses démons qui cherche la rédemption'."
                                }
                            ]
                        },
                        {
                            type: "sous_section",
                            titre: "Les attributs de base",
                            description: "Comment répartir efficacement les caractéristiques.",
                            elements: [
                                {
                                    type: "paragraphe",
                                    texte: "La répartition des attributs doit refléter le concept de votre personnage tout en restant viable mécaniquement. Évitez de créer un personnage parfait - les faiblesses créent des opportunités de roleplay."
                                },
                                {
                                    type: "attention",
                                    texte: "Ne négligez jamais les attributs secondaires ! Ils peuvent souvent faire la différence dans des situations inattendues."
                                }
                            ]
                        }
                    ]
                },
                {
                    titre: "DEUXIÈME PARTIE : TECHNIQUES AVANCÉES",
                    description: "Pour les créateurs expérimentés qui veulent aller plus loin.",
                    contenu: [
                        {
                            type: "paragraphe",
                            texte: "Cette section s'adresse aux joueurs expérimentés qui maîtrisent déjà les bases et souhaitent explorer des techniques plus sophistiquées de création de personnage."
                        },
                        {
                            type: "sous_section",
                            titre: "Psychologie du personnage",
                            description: "Créer une personnalité complexe et nuancée.",
                            elements: [
                                {
                                    type: "paragraphe",
                                    texte: "Un personnage mémorable possède une psychologie cohérente mais complexe. Il doit avoir des contradictions internes, des peurs, des désirs cachés et des traits qui évoluent au fil de l'histoire."
                                },
                                {
                                    type: "liste",
                                    items: [
                                        "Définir au moins trois traits de personnalité majeurs",
                                        "Créer des contradictions internes réalistes",
                                        "Établir des peurs et des phobies crédibles",
                                        "Prévoir des déclencheurs émotionnels spécifiques"
                                    ]
                                }
                            ]
                        },
                        {
                            type: "separateur"
                        },
                        {
                            type: "sous_section",
                            titre: "Relations interpersonnelles",
                            description: "Tisser des liens significatifs avec l'univers.",
                            elements: [
                                {
                                    type: "paragraphe",
                                    texte: "Les relations de votre personnage avec le monde qui l'entoure sont essentielles pour son intégration dans l'histoire. Ces liens créent des opportunités narratives et des leviers dramatiques pour le maître de jeu."
                                },
                                {
                                    type: "exemple",
                                    texte: "Marcus entretient une relation compliquée avec son ancien mentor qui l'a trahi. Cette relation peut être utilisée pour créer des dilemmes moraux et des moments de tension durant la campagne."
                                }
                            ]
                        }
                    ]
                },
                {
                    titre: "TROISIÈME PARTIE : EXEMPLES PRATIQUES",
                    description: "Des cas concrets d'application des techniques présentées.",
                    contenu: [
                        {
                            type: "paragraphe",
                            texte: "Cette section présente plusieurs exemples de personnages créés en suivant les méthodes décrites dans ce guide. Chaque exemple illustre différentes approches et techniques."
                        },
                        {
                            type: "sous_section",
                            titre: "Le guerrier atypique",
                            description: "Subvertir les clichés du combattant classique.",
                            elements: [
                                {
                                    type: "paragraphe",
                                    texte: "Elara Ventacier n'est pas votre guerrière typique. Ancienne bibliothécaire reconvertie en aventurière après la destruction de sa ville natale, elle combine intelligence tactique et détermination farouche."
                                },
                                {
                                    type: "liste",
                                    items: [
                                        "Background : Bibliothécaire devenue guerrière par nécessité",
                                        "Motivation : Protéger les connaissances et les innocents",
                                        "Particularité : Combat en analysant les faiblesses",
                                        "Faiblesse : Perfectionnisme qui peut la paralyser"
                                    ]
                                }
                            ]
                        },
                        {
                            type: "sous_section",
                            titre: "Le mage pragmatique",
                            description: "Une approche terre-à-terre de la magie.",
                            elements: [
                                {
                                    type: "paragraphe",
                                    texte: "Contrairement aux archétypes de magiciens mystiques et détachés, Tobias Ferrum voit la magie comme un outil pratique. Ancien ingénieur, il applique une méthode scientifique à l'art mystique."
                                },
                                {
                                    type: "conseil",
                                    texte: "Un personnage qui aborde son domaine d'expertise de manière inattendue peut créer des situations de jeu très intéressantes et originales."
                                }
                            ]
                        }
                    ]
                },
                {
                    titre: "QUATRIÈME PARTIE : ÉVOLUTION ET DÉVELOPPEMENT",
                    description: "Faire évoluer votre personnage au fil des aventures.",
                    contenu: [
                        {
                            type: "paragraphe",
                            texte: "Un personnage n'est jamais figé. L'évolution fait partie intégrante de l'expérience de jeu de rôle. Cette section explore comment planifier et gérer cette évolution de manière satisfaisante."
                        },
                        {
                            type: "sous_section",
                            titre: "Arcs narratifs personnels",
                            description: "Structurer l'évolution de votre personnage.",
                            elements: [
                                {
                                    type: "paragraphe",
                                    texte: "Chaque personnage devrait avoir son propre arc narratif, une progression personnelle qui s'entremêle avec l'intrigue principale. Cet arc doit avoir un début, un développement et une résolution satisfaisante."
                                },
                                {
                                    type: "attention",
                                    texte: "Communiquez vos idées d'évolution avec votre maître de jeu. La collaboration est essentielle pour créer des moments narratifs marquants."
                                }
                            ]
                        }
                    ]
                },
                {
                    titre: "CINQUIÈME PARTIE : CONSEILS POUR MJ",
                    description: "Accompagner vos joueurs dans leurs créations.",
                    contenu: [
                        {
                            type: "paragraphe",
                            texte: "En tant que maître de jeu, votre rôle est d'accompagner les joueurs dans la création de personnages qui s'intègrent harmonieusement dans votre univers et votre campagne."
                        },
                        {
                            type: "liste",
                            items: [
                                "Établir des guidelines claires pour la création",
                                "Encourager la créativité tout en maintenant la cohérence",
                                "Aider à résoudre les conflits de concept entre joueurs",
                                "Prévoir des hooks narratifs pour chaque personnage"
                            ]
                        }
                    ]
                },
                {
                    titre: "SIXIÈME PARTIE : RESSOURCES ET OUTILS",
                    description: "Une boîte à outils pour la création de personnages.",
                    contenu: [
                        {
                            type: "paragraphe",
                            texte: "Cette dernière section rassemble des outils pratiques, des tables de génération aléatoire et des ressources pour enrichir vos créations de personnages."
                        },
                        {
                            type: "exemple",
                            texte: "Utilisez les générateurs de noms, les tables de traits de personnalité et les listes de motivations pour stimuler votre créativité quand l'inspiration fait défaut."
                        },
                        {
                            type: "sous_section",
                            titre: "Tables de génération aléatoire",
                            description: "Des outils pour générer rapidement des éléments de personnage.",
                            elements: [
                                {
                                    type: "paragraphe",
                                    texte: "Les tables de génération aléatoire sont d'excellents outils pour sortir de sa zone de confort créative. Elles permettent de découvrir des combinaisons inattendues qui peuvent mener à des personnages très originaux."
                                },
                                {
                                    type: "liste",
                                    items: [
                                        "Tables de traits physiques distinctifs",
                                        "Générateurs de motivations et d'objectifs",
                                        "Listes de secrets et de traumatismes",
                                        "Tables de relations familiales complexes",
                                        "Générateurs de manies et d'habitudes"
                                    ]
                                },
                                {
                                    type: "conseil",
                                    texte: "N'hésitez pas à relancer plusieurs fois ou à combiner différents résultats jusqu'à obtenir quelque chose qui vous inspire vraiment."
                                }
                            ]
                        },
                        {
                            type: "sous_section",
                            titre: "Outils d'analyse psychologique",
                            description: "Approfondir la psychologie de vos personnages.",
                            elements: [
                                {
                                    type: "paragraphe",
                                    texte: "Pour créer des personnages psychologiquement cohérents, il est utile de s'appuyer sur des modèles établis de psychologie. Ces outils vous aideront à structurer la personnalité de vos créations."
                                },
                                {
                                    type: "attention",
                                    texte: "Ces outils sont des guides, pas des règles absolues. La cohérence narrative prime toujours sur la fidélité aux modèles psychologiques."
                                }
                            ]
                        }
                    ]
                },
                {
                    titre: "SEPTIÈME PARTIE : ÉTUDES DE CAS AVANCÉES",
                    description: "Analyses détaillées de personnages complexes.",
                    contenu: [
                        {
                            type: "paragraphe",
                            texte: "Cette section présente des analyses approfondies de personnages particulièrement réussis, expliquant les techniques utilisées et les principes appliqués dans leur création."
                        },
                        {
                            type: "sous_section",
                            titre: "Le personnage à double identité",
                            description: "Gérer la complexité des identités multiples.",
                            elements: [
                                {
                                    type: "paragraphe",
                                    texte: "Cassandra Nuit-et-Jour mène une double vie : bibliothécaire respectée le jour, voleuse d'élite la nuit. Cette dualité crée des tensions internes fascinantes et offre de nombreuses opportunités narratives."
                                },
                                {
                                    type: "liste",
                                    items: [
                                        "Motivations contradictoires entre les deux identités",
                                        "Risques constants de découverte et d'exposition",
                                        "Développement de compétences complémentaires",
                                        "Relations différentes selon l'identité active"
                                    ]
                                },
                                {
                                    type: "exemple",
                                    texte: "Quand Cassandra découvre que la bibliothèque possède un grimoire volé, elle doit choisir entre ses deux identités : le dénoncer en tant que bibliothécaire ou le voler en tant que cambrioleuse."
                                }
                            ]
                        },
                        {
                            type: "sous_section",
                            titre: "L'anti-héros sympathique",
                            description: "Créer un personnage moralement ambigu mais attachant.",
                            elements: [
                                {
                                    type: "paragraphe",
                                    texte: "Viktor Cendrereprésente l'archétype de l'anti-héros sympathique. Ancien assassin reconverti en protecteur d'orphelins, il incarne la rédemption tout en conservant ses méthodes discutables."
                                },
                                {
                                    type: "conseil",
                                    texte: "L'astuce avec un anti-héros est de montrer ses bonnes intentions malgré ses mauvaises méthodes. Le public pardonne beaucoup quand les motivations sont nobles."
                                }
                            ]
                        }
                    ]
                },
                {
                    titre: "HUITIÈME PARTIE : RÉFÉRENCES ET BIBLIOGRAPHIE",
                    description: "Sources d'inspiration et lectures recommandées.",
                    contenu: [
                        {
                            type: "paragraphe",
                            texte: "Cette section finale rassemble des références utiles pour approfondir vos connaissances en création de personnages et en psychologie narrative."
                        },
                        {
                            type: "liste",
                            items: [
                                "Ouvrages sur l'écriture de fiction et la caractérisation",
                                "Manuels de psychologie appliquée à la narration",
                                "Analyses de personnages dans la littérature classique",
                                "Ressources en ligne pour créateurs de jeux de rôle"
                            ]
                        },
                        {
                            type: "separateur"
                        },
                        {
                            type: "paragraphe",
                            texte: "La création de personnages est un art qui s'améliore avec la pratique et l'expérience. Continuez à expérimenter, à analyser vos créations et celles des autres, et surtout, amusez-vous ! Un personnage créé avec passion et réflexion marquera toujours plus les esprits qu'un concept techniquement parfait mais sans âme."
                        }
                    ]
                }
            ]
        };
        
        // Générer le fichier PDF
        const systemRightsService = new SystemRightsService();
        const pdfPath = systemRightsService.generatePdfPath('test-long', null, 0, 'document-long-test', 'public');
        const filePath = path.join(__dirname, '..', pdfPath.fullPath);
        
        console.log(`🔧 Test d'un document long (${data.sections.length} sections principales)`);
        console.log(`📂 Chemin : ${filePath}`);
        
        // S'assurer que le dossier existe
        await fsPromises.mkdir(path.dirname(filePath), { recursive: true });
        
        // Générer le PDF
        const generator = new LongDocumentGenerator();
        await generator.generateDocument(data, filePath);
        
        console.log('✅ PDF long généré avec succès !');
        console.log(`📁 Fichier : ${pdfPath.fileName}`);
        
        // Vérifier la taille
        const stats = await fsPromises.stat(filePath);
        console.log(`📏 Taille : ${(stats.size / 1024).toFixed(2)} KB`);
        
        console.log('\n🔍 Points à vérifier dans le PDF :');
        console.log('- 📋 Page de garde si > 5 pages');
        console.log('- 📑 Table des matières avec sections');
        console.log('- ✓ Numérotation des pages correcte');
        console.log('- ✓ Alternance des barres latérales');
        
        console.log('\n✨ Test terminé ! Vérifiez le PDF généré.');

    } catch (error) {
        console.error('❌ Erreur lors de la génération :', error);
        process.exit(1);
    }
}

// Lancer le test
testLongDocument().catch(console.error);