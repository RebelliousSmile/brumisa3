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
            doc.registerFont('CrimsonText-Regular', path.join(this.fontsDir, 'CrimsonText-Regular.ttf'));
            doc.registerFont('CrimsonText-Bold', path.join(this.fontsDir, 'CrimsonText-Bold.ttf'));
            doc.registerFont('CrimsonText-Italic', path.join(this.fontsDir, 'CrimsonText-Italic.ttf'));
            doc.registerFont('CrimsonText-BoldItalic', path.join(this.fontsDir, 'CrimsonText-BoldItalic.ttf'));
            return true;
        } catch (error) {
            console.warn('⚠️  Crimson Text fonts not found, falling back to system fonts:', error.message);
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
        const contentLeft = sidebarWidth + 10;
        const contentWidth = pageWidth - contentLeft - 20;

        // Page 1
        this.addMonsterheartsPage(doc, 1, 'PLAN DE CLASSE');
        this.addPageContent1(doc, contentLeft, contentWidth, data, hasCrimsonText);

        // Page 2
        doc.addPage();
        this.addMonsterheartsPage(doc, 2, 'EXEMPLES');
        this.addPageContent2(doc, contentLeft, contentWidth, data, hasCrimsonText);

        // Ajouter plus de pages si nécessaire
        doc.addPage();
        this.addMonsterheartsPage(doc, 3, 'CONSEILS');
        this.addPageContent3(doc, contentLeft, contentWidth, data, hasCrimsonText);

        doc.addPage();
        this.addMonsterheartsPage(doc, 4, 'RÉFÉRENCES');
        this.addPageContent4(doc, contentLeft, contentWidth, data, hasCrimsonText);
    }

    /**
     * Ajoute les éléments communs de page Monsterhearts
     * @param {PDFDocument} doc - Document
     * @param {number} pageNum - Numéro de page
     * @param {string} sectionTitle - Titre de section pour la barre latérale
     */
    addMonsterheartsPage(doc, pageNum, sectionTitle) {
        const pageWidth = doc.page.width;
        const pageHeight = doc.page.height;
        const sidebarWidth = 15 * 2.83; // 15mm en points

        // Bande latérale noire
        doc.rect(0, 0, sidebarWidth, pageHeight)
           .fill('#000000');

        // Numéro de page dans un carré noir
        const pageNumSize = 10 * 2.83; // 10mm
        const pageNumX = 2.5 * 2.83; // 2.5mm du bord
        const pageNumY = 10 * 2.83; // 10mm du haut

        doc.rect(pageNumX, pageNumY, pageNumSize, pageNumSize)
           .fill('#000000');

        doc.fontSize(18)
           .fillColor('white')
           .text(pageNum.toString(), pageNumX, pageNumY + pageNumSize/4, {
               width: pageNumSize,
               align: 'center'
           });

        // Texte vertical dans la bande latérale (plus gras et plus bas comme exemple-page.png)
        doc.save()
           .translate(sidebarWidth/2, pageHeight - 40 * 2.83)
           .rotate(-90)
           .fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('white')
           .text(sectionTitle, 0, 0, {
               width: 400,
               align: 'center'
           })
           .restore();

        // Footer plus bas sans trait (comme exemple-page.png)
        const footerY = pageHeight - 10 * 2.83;
        doc.fontSize(9)
           .fillColor('#666666')
           .text(`Monsterhearts • Plan de Classe • brumisa3.fr`, 
                 sidebarWidth + 10, footerY, {
                   width: pageWidth - sidebarWidth - 30,
                   align: 'center'
                 });

        // Reset pour le contenu
        doc.fillColor('#000000');
    }

    /**
     * Contenu de la page 1 - Instructions principales
     */
    addPageContent1(doc, x, width, data, hasCrimsonText = false) {
        let y = 50;

        // Titre principal avec Crimson Text si disponible
        const titleFont = hasCrimsonText ? 'CrimsonText-Bold' : 'Helvetica-Bold';
        const textFont = hasCrimsonText ? 'CrimsonText-Regular' : 'Helvetica';
        const italicFont = hasCrimsonText ? 'CrimsonText-Italic' : 'Helvetica-Oblique';
        
        doc.fontSize(16)
           .font(titleFont)
           .fillColor('#000000')
           .text('INSTRUCTIONS POUR LE PLAN DE CLASSE', x, y, {
               width: width,
               align: 'center'
           });
        y += 35;

        // Introduction en italique avec Crimson Text
        doc.fontSize(11)
           .font(italicFont)
           .fillColor('#000000')
           .text('Le plan de classe est un outil visuel pour la MC permettant de suivre les relations sociales et la dynamique de groupe dans le lycée. Il sert à la fois d\'aide-mémoire et de représentation spatiale des tensions sociales.', x, y, {
               width: width,
               align: 'justify'
           });
        y += 35;

        // Section COMMENT REMPLIR LE PLAN avec Crimson Text
        doc.fontSize(14)
           .font(titleFont)
           .fillColor('#000000')
           .text('COMMENT REMPLIR LE PLAN', x, y, {
               width: width,
               align: 'center'
           });
        y += 28;

        // Sous-sections
        y = this.addSubSection(doc, x, width, y, 'PLACER LES PERSONNAGES JOUEURS (PJ)', [
            'Commencez toujours par placer les PJ en premier',
            'Notez leur nom, leur mue, et une note courte (trait distinctif, secret connu, etc.)',
            'Leur placement initial peut refléter leurs relations établies lors de la création'
        ]);

        y = this.addSubSection(doc, x, width, y, 'AJOUTER LES PERSONNAGES NON-JOUEURS (PNJ)', [
            'Placez les PNJ importants autour des PJ',
            'Priorisez ceux qui ont des liens directs avec les PJ',
            'Chaque PNJ devrait avoir au moins un élément dramatique notable'
        ]);

        y = this.addSubSection(doc, x, width, y, 'ORGANISATION SPATIALE SIGNIFICATIVE', []);
        
        y = this.addSubSubSection(doc, x, width, y, 'PROXIMITÉ = AFFINITÉ', [
            'Les amis proches sont assis côte à côte',
            'Les couples sont adjacents',
            'Les membres d\'une même clique forment des groupes'
        ]);
    }

    /**
     * Contenu de la page 2 - Exemples
     */
    addPageContent2(doc, x, width, data) {
        let y = 50;

        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text('EXEMPLES DE PLANS DE CLASSE', x, y, {
               width: width,
               align: 'center'
           });
        y += 40;

        doc.fontSize(14)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text('SITUATION INITIALE - DÉBUT DE CAMPAGNE', x, y, {
               width: width,
               align: 'center'
           });
        y += 30;

        y = this.addSubSection(doc, x, width, y, 'CLASSE DE LITTÉRATURE - MRS. HENDERSON', [
            'Voici un exemple de plan initial pour une nouvelle campagne avec 4 PJ :'
        ]);

        // Encadré exemple
        y += 10;
        const boxY = y;
        const boxHeight = 120;
        doc.rect(x, boxY, width, boxHeight)
           .stroke('#000000');

        y += 15;
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text('CONFIGURATION INITIALE', x + 10, y);
        y += 20;

        doc.font('Helvetica')
           .fillColor('#000000')
           .text('• Alexis (The Chosen) - Premier rang, centre : excellent élève, discret sur sa nature', x + 10, y, { width: width - 20 });
        y += 20;
        doc.text('• Morgan (The Witch) - Deuxième rang, gauche : légèrement en retrait, observateur', x + 10, y, { width: width - 20 });
        y += 20;
        doc.text('• Jordan (The Mortal) - Troisième rang, centre : populaire, entouré d\'amis', x + 10, y, { width: width - 20 });
        y += 20;
        doc.text('• Casey (The Vampire) - Dernier rang, coin : mystérieux, arrivé récemment', x + 10, y, { width: width - 20 });

        y = boxY + boxHeight + 20;
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
    addSubSection(doc, x, width, y, title, items) {
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text(title, x, y);
        y += 20;

        doc.font('Helvetica')
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
    addSubSubSection(doc, x, width, y, title, items) {
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor('#000000')
           .text(title, x + 10, y);
        y += 15;

        doc.font('Helvetica')
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