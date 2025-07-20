const PDFDocument = require('pdfkit');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const SystemRightsService = require('./SystemRightsService');

/**
 * Service de génération PDF avec PDFKit
 * Remplace Puppeteer pour un contrôle précis de la mise en page
 */
class PdfKitService {
    constructor() {
        this.systemRightsService = new SystemRightsService();
        this.outputDir = path.join(process.cwd(), 'output', 'pdfs');
        this.fontsDir = path.join(process.cwd(), 'fonts');
    }

    /**
     * Enregistre les polices Crimson Text dans le document
     * @param {PDFDocument} doc - Document PDFKit
     */
    registerCrimsonTextFonts(doc) {
        try {
            // Vérifier d'abord que les fichiers existent
            const regularPath = path.join(this.fontsDir, 'CrimsonText-Regular.ttf');
            const boldPath = path.join(this.fontsDir, 'CrimsonText-Bold.ttf');
            const italicPath = path.join(this.fontsDir, 'CrimsonText-Italic.ttf');
            const boldItalicPath = path.join(this.fontsDir, 'CrimsonText-BoldItalic.ttf');
            
            if (!fs.existsSync(regularPath) || !fs.existsSync(boldPath) || 
                !fs.existsSync(italicPath) || !fs.existsSync(boldItalicPath)) {
                console.warn('⚠️  Crimson Text font files not found, using system fonts');
                return false;
            }
            
            // Essayer d'enregistrer chaque police individuellement pour identifier laquelle pose problème
            try {
                doc.registerFont('CrimsonText-Regular', regularPath);
                doc.registerFont('CrimsonText-Bold', boldPath);
                doc.registerFont('CrimsonText-Italic', italicPath);
                doc.registerFont('CrimsonText-BoldItalic', boldItalicPath);
                
                // Tester l'utilisation des polices pour s'assurer qu'elles fonctionnent vraiment
                const currentFont = doc._font;
                const currentFontSize = doc._fontSize;
                
                doc.font('CrimsonText-Regular').fontSize(12);
                doc.font('CrimsonText-Bold').fontSize(12);
                doc.font('CrimsonText-Italic').fontSize(12);
                doc.font('CrimsonText-BoldItalic').fontSize(12);
                
                // Restaurer la police et taille précédentes
                if (currentFont) doc.font(currentFont);
                if (currentFontSize) doc.fontSize(currentFontSize);
                
            } catch (err) {
                console.warn('⚠️  Crimson Text fonts not compatible with PDFKit:', err.message);
                return false;
            }
            
            console.log('✅ Crimson Text fonts loaded and tested successfully');
            return true;
        } catch (error) {
            console.warn('⚠️  Error loading Crimson Text fonts, falling back to system fonts:', error.message);
            return false;
        }
    }

    /**
     * Génère un PDF avec PDFKit
     * @param {Object} options - Options de génération
     * @param {string} options.system - Système de jeu
     * @param {string} options.template - Template à utiliser
     * @param {string} options.titre - Titre du document
     * @param {number|null} options.userId - ID utilisateur
     * @param {string} options.systemRights - Droits système
     * @param {Object} options.data - Données pour le template
     * @returns {Object} - {success, fileName, fullPath, size}
     */
    async generatePDF(options) {
        const {
            system = 'monsterhearts',
            template = 'plan-classe-instructions',
            titre = 'Document',
            userId = null,
            systemRights = 'private',
            data = {}
        } = options;

        try {
            // Générer le nom et chemin du fichier
            const pdfPath = this.systemRightsService.generatePdfPath(
                titre, system, userId, template, systemRights
            );

            // Créer le répertoire de sortie
            const outputDir = path.join(this.outputDir, system);
            await fsPromises.mkdir(outputDir, { recursive: true });

            const fullPath = path.join(outputDir, pdfPath.fileName);

            // Générer le PDF selon le template
            await this.generateTemplate(system, template, fullPath, {
                titre,
                userId,
                systemRights,
                ...data
            });

            // Obtenir la taille du fichier
            const stats = await fsPromises.stat(fullPath);

            return {
                success: true,
                fileName: pdfPath.fileName,
                fullPath,
                size: stats.size,
                system,
                template
            };

        } catch (error) {
            console.error(`Erreur génération PDF PDFKit:`, error);
            return {
                success: false,
                error: error.message,
                system,
                template
            };
        }
    }

    /**
     * Génère un template spécifique
     * @param {string} system - Système de jeu
     * @param {string} template - Template à utiliser
     * @param {string} outputPath - Chemin de sortie
     * @param {Object} data - Données pour le template
     */
    async generateTemplate(system, template, outputPath, data) {
        switch (system) {
            case 'monsterhearts':
                return await this.generateMonsterheartsTemplate(template, outputPath, data);
            
            case 'engrenages':
            case 'metro2033':
            case 'mistengine':
                throw new Error(`Template ${system}/${template} pas encore implémenté avec PDFKit`);
            
            default:
                throw new Error(`Système ${system} non supporté`);
        }
    }

    /**
     * Génère les templates Monsterhearts
     * @param {string} template - Template spécifique
     * @param {string} outputPath - Chemin de sortie
     * @param {Object} data - Données
     */
    async generateMonsterheartsTemplate(template, outputPath, data) {
        switch (template) {
            case 'plan-classe-instructions':
            case 'plan-classe-instructions-test':
                return await this.generatePlanClasseInstructions(outputPath, data);
            
            default:
                throw new Error(`Template Monsterhearts ${template} non supporté`);
        }
    }

    /**
     * Génère le template "Plan de Classe - Instructions"
     * @param {string} outputPath - Chemin de sortie
     * @param {Object} data - Données du document
     */
    async generatePlanClasseInstructions(outputPath, data) {
        return new Promise((resolve, reject) => {
            try {
                // Créer le document PDF
                const doc = new PDFDocument({
                    size: 'A4',
                    margins: {
                        top: 20,
                        bottom: 20,
                        left: 25,
                        right: 20
                    }
                });

                // Enregistrer les polices Crimson Text
                const hasCrimsonText = this.registerCrimsonTextFonts(doc);

                // Stream vers le fichier
                const stream = fs.createWriteStream(outputPath);
                doc.pipe(stream);

                // Générer le contenu
                this.createPlanClasseInstructionsContent(doc, data, hasCrimsonText);

                // Finaliser le document
                doc.end();

                // Attendre la fin de l'écriture
                stream.on('finish', () => resolve());
                stream.on('error', reject);

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Crée le contenu du document "Plan de Classe - Instructions"
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} data - Données
     * @param {boolean} hasCrimsonText - Si les polices Crimson Text sont disponibles
     */
    createPlanClasseInstructionsContent(doc, data, hasCrimsonText = false) {
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const sidebarWidth = 15 * 2.83; // 15mm en points

        // Polices selon disponibilité Crimson Text (définir au début pour les deux pages)
        const titleFont = hasCrimsonText ? 'CrimsonText-Bold' : 'Helvetica-Bold';
        const textFont = hasCrimsonText ? 'CrimsonText-Regular' : 'Helvetica';
        const italicFont = hasCrimsonText ? 'CrimsonText-Italic' : 'Helvetica-Oblique';
        
        // Page 1 (impaire - barre à gauche)
        const isOddPage = true;
        const sidebarX = isOddPage ? 0 : pageWidth - sidebarWidth;
        
        // Barre latérale noire
        doc.fillColor('#000000')
           .rect(sidebarX, 0, sidebarWidth, pageHeight)
           .fill();
        
        // Numéro de page dans un carré noir - SANS width/align
        const pageNumX = 7;
        const pageNumY = 28;

        doc.fillColor('#000000')
           .rect(pageNumX, pageNumY, 28, 28)
           .fill();

        doc.fontSize(18)
           .fillColor('white')
           .text('1', pageNumX + 10, pageNumY + 5);

        // Contenu principal page 1 avec polices appropriées
        const contentX = sidebarWidth + 15;
        
        doc.fontSize(18)
           .font(titleFont)
           .fillColor('#000000')
           .text('OBJECTIFS', contentX, 80);
           
        doc.fontSize(12)
           .font(textFont)
           .fillColor('#000000')
           .text('S\'asseoir à une table de ', contentX, 120);
           
        // Mot "Monsterhearts" en italique
        doc.font(italicFont)
           .text('Monsterhearts', contentX + 130, 120);
           
        doc.font(textFont)
           .text(' signifie partager les quatre objectifs suivants :', contentX, 140);

        // Liste des objectifs avec étoiles
        let y = 170;
        const objectifs = [
            'rendre intéressante la vie de chaque personnage principal ;',
            'ne pas mettre l\'histoire en cage ;',
            'dire ce que les règles exigent ;',
            'dire ce que l\'honnêteté exige.'
        ];

        objectifs.forEach(objectif => {
            doc.fontSize(12)
               .font(textFont)
               .fillColor('#000000')
               .text('★ ' + objectif, contentX + 10, y);
            y += 18;
        });

        y += 20;
        // Paragraphe explicatif complet
        doc.fontSize(12)
           .font(textFont)
           .fillColor('#000000')
           .text('Cette liste n\'est ni à mémoriser, ni constituée', contentX, y);
        y += 15;
        doc.text('d\'éléments qu\'il faudrait cocher au cours de la', contentX, y);
        y += 15;
        doc.text('partie pour la considérer comme « réussie ».', contentX, y);
        y += 15;
        doc.text('Il s\'agit plutôt de quatre lignes directrices qui', contentX, y);
        y += 15;
        doc.text('vous aident à aller dans la même direction et', contentX, y);
        y += 15;
        doc.text('à partager l\'esprit du jeu.', contentX, y);

        y += 30;
        // Section suivante
        doc.fontSize(16)
           .font(titleFont)
           .fillColor('#000000')
           .text('Rendez intéressante la vie', contentX, y);
        y += 20;
        doc.text('de chaque personnage principal', contentX, y);

        y += 25;
        doc.fontSize(12)
           .font(textFont)
           .fillColor('#000000')
           .text('Si vous n\'êtes pas MC, votre tâche est notamment', contentX, y);
        y += 15;
        doc.text('de défendre les intérêts de votre personnage.', contentX, y);

        // Texte vertical APRÈS le contenu pour éviter les interférences
        doc.save()
           .translate(sidebarWidth/2, pageHeight - 100)
           .rotate(-90)
           .fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('white')
           .text('COMMENT MARCHE-T-ELLE', 0, 0)
           .restore();

        // Footer watermark discret mais visible - coin bas droite
        doc.fontSize(8)
           .fillColor('#999999')
           .text('brumisa3.fr', pageWidth - 65, pageHeight - 40);

        // Page 2 (paire - barre à droite)
        doc.addPage();
        
        // Barre latérale noire à droite
        const sidebarX2 = pageWidth - sidebarWidth;
        doc.fillColor('#000000')
           .rect(sidebarX2, 0, sidebarWidth, pageHeight)
           .fill();
        
        // Numéro de page 2 - SANS width/align
        const pageNumX2 = pageWidth - sidebarWidth + 7;
        doc.fillColor('#000000')
           .rect(pageNumX2, pageNumY, 28, 28)
           .fill();

        doc.fontSize(18)
           .fillColor('white')
           .text('2', pageNumX2 + 10, pageNumY + 5);

        // Contenu principal page 2 avec polices appropriées
        const contentX2 = 20;
        
        // Utiliser les mêmes polices que page 1
        doc.fontSize(18)
           .font(titleFont)
           .fillColor('#000000')
           .text('EXEMPLES DE PLANS DE CLASSE', contentX2, 80);
           
        doc.fontSize(14)
           .font(titleFont)
           .fillColor('#000000')
           .text('SITUATION INITIALE - DÉBUT DE CAMPAGNE', contentX2, 120);

        doc.fontSize(12)
           .font(titleFont)
           .fillColor('#000000')
           .text('CLASSE DE LITTÉRATURE - MRS. HENDERSON', contentX2, 150);

        doc.fontSize(12)
           .font(textFont)
           .fillColor('#000000')
           .text('Voici un exemple de plan initial pour une nouvelle', contentX2, 180);
        doc.text('campagne avec 4 PJ :', contentX2, 195);

        // Encadré exemple détaillé
        let y2 = 220;
        doc.fontSize(11)
           .font(titleFont)
           .fillColor('#000000')
           .text('CONFIGURATION INITIALE', contentX2, y2);
        y2 += 20;

        const exemples = [
            '• Alexis (The Chosen) - Premier rang, centre :',
            '  excellent élève, discret sur sa nature',
            '• Morgan (The Witch) - Deuxième rang, gauche :',
            '  légèrement en retrait, observateur',
            '• Jordan (The Mortal) - Troisième rang, centre :',
            '  populaire, entouré d\'amis',
            '• Casey (The Vampire) - Dernier rang, coin :',
            '  mystérieux, arrivé récemment'
        ];

        exemples.forEach(exemple => {
            doc.fontSize(11)
               .font(textFont)
               .fillColor('#000000')
               .text(exemple, contentX2, y2);
            y2 += 13;
        });

        // Texte vertical page 2 APRÈS le contenu
        doc.save()
           .translate(pageWidth - sidebarWidth/2, pageHeight - 100)
           .rotate(-90)
           .fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('white')
           .text('EXEMPLES', 0, 0)
           .restore();

        // Footer watermark discret mais visible - coin bas gauche (éviter la barre droite)
        doc.fontSize(8)
           .fillColor('#999999')
           .text('brumisa3.fr', 15, pageHeight - 40);
    }

    /**
     * Ajoute les éléments communs de page Monsterhearts
     * @param {PDFDocument} doc - Document
     * @param {number} pageNum - Numéro de page
     * @param {string} sectionTitle - Titre de section pour la barre latérale
     * @param {boolean} isOddPage - true pour page impaire (bande à gauche), false pour page paire (bande à droite)
     */
    addMonsterheartsPage(doc, pageNum, sectionTitle, isOddPage = true) {
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const sidebarWidth = 15 * 2.83; // 15mm en points

        // Position de la bande latérale selon page paire/impaire
        const sidebarX = isOddPage ? 0 : pageWidth - sidebarWidth;

        // Bande latérale noire - forcer le rendu
        doc.fillColor('#000000')
           .rect(sidebarX, 0, sidebarWidth, pageHeight)
           .fill();

        // Numéro de page dans un carré noir
        const pageNumSize = 10 * 2.83; // 10mm
        const pageNumX = isOddPage ? 
            2.5 * 2.83 : // 2.5mm du bord gauche pour pages impaires
            pageWidth - sidebarWidth + 2.5 * 2.83; // 2.5mm du début de la bande pour pages paires
        const pageNumY = 10 * 2.83; // 10mm du haut

        doc.fillColor('#000000')
           .rect(pageNumX, pageNumY, pageNumSize, pageNumSize)
           .fill();

        doc.fontSize(18)
           .fillColor('white')
           .text(pageNum.toString(), pageNumX, pageNumY + pageNumSize/4, {
               width: pageNumSize,
               align: 'center'
           });

        // Texte vertical dans la bande latérale
        const textX = isOddPage ? sidebarWidth/2 : pageWidth - sidebarWidth/2;
        doc.save()
           .translate(textX, pageHeight - 40 * 2.83)
           .rotate(-90)
           .fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('white')
           .text(sectionTitle, 0, 0, {
               width: 400,
               align: 'center'
           })
           .restore();

        // Footer adapté selon la position de la bande
        const footerY = pageHeight - 10 * 2.83;
        const footerX = isOddPage ? sidebarWidth + 10 : 10;
        const footerWidth = isOddPage ? 
            pageWidth - sidebarWidth - 30 : 
            pageWidth - sidebarWidth - 30;

        doc.fontSize(9)
           .fillColor('#666666')
           .text(`Monsterhearts • Plan de Classe • brumisa3.fr`, 
                 footerX, footerY, {
                   width: footerWidth,
                   align: 'center'
                 });

        // Reset pour le contenu
        doc.fillColor('#000000');
    }

    /**
     * Contenu de la page 1 - Instructions principales (style exemple-page.png)
     */
    addPageContent1(doc, x, width, data, hasCrimsonText = false) {
        let y = 80; // Plus d'espace en haut comme dans l'exemple

        // Polices comme dans l'exemple Monsterhearts
        const titleFont = hasCrimsonText ? 'CrimsonText-Bold' : 'Helvetica-Bold';
        const textFont = hasCrimsonText ? 'CrimsonText-Regular' : 'Helvetica';
        const italicFont = hasCrimsonText ? 'CrimsonText-Italic' : 'Helvetica-Oblique';

        // Test simple pour vérifier que le contenu reste sur la même page
        doc.fontSize(18)
           .font(titleFont)
           .fillColor('#000000')
           .text('OBJECTIFS - PAGE 1', x, y, {
               width: width,
               align: 'left',
               lineBreak: false
           });
        y += 40;

        doc.fontSize(12)
           .font(textFont)
           .fillColor('#000000')
           .text('Contenu de test pour la page 1. Ce texte devrait apparaître sur la même page que la barre latérale noire de gauche.', x, y, {
               width: width,
               align: 'left',
               lineBreak: false
           });
    }

    /**
     * Contenu de la page 2 - Exemples
     */
    addPageContent2(doc, x, width, data, hasCrimsonText = false) {
        let y = 80;
        
        const titleFont = hasCrimsonText ? 'CrimsonText-Bold' : 'Helvetica-Bold';
        const textFont = hasCrimsonText ? 'CrimsonText-Regular' : 'Helvetica';

        // Test simple pour vérifier que le contenu reste sur la même page
        doc.fontSize(18)
           .font(titleFont)
           .fillColor('#000000')
           .text('EXEMPLES - PAGE 2', x, y, {
               width: width,
               align: 'left',
               lineBreak: false
           });
        y += 40;

        doc.fontSize(12)
           .font(textFont)
           .fillColor('#000000')
           .text('Contenu de test pour la page 2. Ce texte devrait apparaître sur la même page que la barre latérale noire de droite.', x, y, {
               width: width,
               align: 'left',
               lineBreak: false
           });
    }

    /**
     * Contenu de la page 3 - Conseils
     */
    addPageContent3(doc, x, width, data) {
        let y = 50;

        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text('CONSEILS PRATIQUES', x, y, {
               width: width,
               align: 'center'
           });
        y += 40;

        y = this.addSubSection(doc, x, width, y, 'UTILISATION EN JEU', [
            'Les bureaux sont déplaçables : ajustez selon l\'évolution des relations',
            'Un changement de place peut signaler un événement social majeur',
            'Consultez le plan pour déterminer qui remarque quoi'
        ]);

        y = this.addSubSection(doc, x, width, y, 'ENTRE LES SESSIONS', [
            'Mettez à jour après chaque session',
            'Notez les changements majeurs dans les relations',
            'Ajoutez de nouveaux PNJ si nécessaire',
            'Retirez ou mettez en retrait les personnages absents/morts'
        ]);
    }

    /**
     * Contenu de la page 4 - Références
     */
    addPageContent4(doc, x, width, data) {
        let y = 50;

        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text('RÉFÉRENCES ET RESSOURCES', x, y, {
               width: width,
               align: 'center'
           });
        y += 40;

        y = this.addSubSection(doc, x, width, y, 'SYMBOLES UTILES', [
            '♥ : amoureux',
            '⚡ : conflit actif',
            '● : sait un secret',
            '★ : populaire/influent',
            '☾ : nature monstrueuse connue'
        ]);

        y = this.addSubSection(doc, x, width, y, 'VERSION NUMÉRIQUE VS PAPIER', []);
        
        y = this.addSubSubSection(doc, x, width, y, 'VERSION NUMÉRIQUE', [
            'Bureaux déplaçables par glisser-déposer',
            'Facile à mettre à jour',
            'Peut être partagée en ligne'
        ]);

        y = this.addSubSubSection(doc, x, width, y, 'VERSION PAPIER', [
            'Utilisez des post-its pour les bureaux',
            'Permet des annotations rapides',
            'Plus tactile pendant la partie'
        ]);
    }

    /**
     * Ajoute une sous-section avec titre et liste (style original)
     */
    addSubSection(doc, x, width, y, title, items, titleFont = 'Helvetica-Bold', textFont = 'Helvetica') {
        doc.fontSize(12)
           .font(titleFont)
           .fillColor('#000000')
           .text(title, x, y);
        y += 20;

        doc.font(textFont)
           .fontSize(11)
           .fillColor('#000000');

        items.forEach(item => {
            doc.text(`★ ${item}`, x, y, { width: width });
            y += 15;
        });

        return y + 12;
    }

    /**
     * Ajoute une sous-sous-section (style original)
     */
    addSubSubSection(doc, x, width, y, title, items, titleFont = 'Helvetica-Bold', textFont = 'Helvetica') {
        doc.fontSize(11)
           .font(titleFont)
           .fillColor('#000000')
           .text(title, x + 10, y);
        y += 15;

        doc.font(textFont)
           .fontSize(10)
           .fillColor('#000000');

        items.forEach(item => {
            doc.text(`★ ${item}`, x + 20, y, { width: width - 20 });
            y += 12;
        });

        return y + 10;
    }
}

module.exports = PdfKitService;