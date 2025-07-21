const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

/**
 * Service de base pour la génération PDF avec PDFKit
 * Gère les éléments communs : barres latérales, numéros de page, watermarks
 */
class BasePdfKitService {
    constructor() {
        this.pageWidth = 595.28;  // A4 width in points
        this.pageHeight = 841.89; // A4 height in points
        this.marginTop = 72;
        this.marginBottom = 72;
        this.marginLeft = 72;
        this.marginRight = 72;
        this.sidebarWidth = 42.52; // 15mm en points
    }

    /**
     * Crée un nouveau document PDF avec la configuration de base
     */
    createDocument(options = {}) {
        const doc = new PDFDocument({
            size: 'A4',
            margins: {
                top: this.marginTop,
                bottom: this.marginBottom,
                left: this.marginLeft,
                right: this.marginRight
            },
            ...options
        });

        // Initialiser le compteur de pages et le titre
        this.currentPageNumber = 1;
        this.chapterTitle = options.chapterTitle || 'DOCUMENT';

        // Ajouter les gestionnaires de page
        doc.on('pageAdded', () => {
            this.currentPageNumber++;
            this.onPageAdded(doc);
        });

        // Initialiser la première page
        this.onPageAdded(doc);

        return doc;
    }

    /**
     * Appelé à chaque nouvelle page
     */
    onPageAdded(doc) {
        // Utiliser notre compteur au lieu de bufferedPageRange
        const pageNumber = this.currentPageNumber;
        
        // Dessiner les éléments de page par défaut
        this.drawSidebar(doc, pageNumber);
        this.drawPageNumber(doc, pageNumber);
        this.drawWatermark(doc, this.chapterTitle);
        
        // Repositionner le curseur avec les bonnes marges
        const margins = this.getContentMargins(pageNumber);
        doc.x = margins.left;
        doc.y = margins.top;
    }

    /**
     * Dessine la barre latérale noire
     */
    drawSidebar(doc, pageNumber) {
        // Sauvegarder l'état actuel
        doc.save();

        // Déterminer le côté (gauche pour pages impaires, droite pour pages paires)
        const isOddPage = pageNumber % 2 === 1;
        const x = isOddPage ? 0 : this.pageWidth - this.sidebarWidth;

        // Dessiner le rectangle noir
        doc.rect(x, 0, this.sidebarWidth, this.pageHeight)
           .fill('#000000');

        // Restaurer l'état
        doc.restore();
    }

    /**
     * Dessine le numéro de page dans la barre
     */
    drawPageNumber(doc, pageNumber) {
        // Sauvegarder l'état actuel
        doc.save();

        const isOddPage = pageNumber % 2 === 1;
        const x = isOddPage ? this.sidebarWidth / 2 : this.pageWidth - this.sidebarWidth / 2;
        const y = 50;

        // Numéro de page en blanc dans la barre noire
        doc.fontSize(24)
           .fillColor('#FFFFFF')
           .text(pageNumber.toString(), x - 15, y, {
               width: 30,
               align: 'center'
           });

        // Restaurer l'état
        doc.restore();
    }

    /**
     * Dessine le watermark/texte vertical dans la barre
     */
    drawWatermark(doc, text = '') {
        if (!text && this.chapterTitle) {
            text = this.chapterTitle;
        }
        if (!text) text = 'DOCUMENT';

        // Sauvegarder l'état actuel
        doc.save();

        const pageNumber = this.currentPageNumber;
        const isOddPage = pageNumber % 2 === 1;
        const x = isOddPage ? this.sidebarWidth / 2 : this.pageWidth - this.sidebarWidth / 2;
        const y = this.pageHeight - 100;

        // Rotation pour texte vertical
        doc.rotate(-90, { origin: [x, y] });

        // Texte en blanc
        doc.fontSize(14)
           .fillColor('#FFFFFF')
           .text(text.toUpperCase(), x - 200, y - 7, {
               width: 400,
               align: 'center',
               characterSpacing: 2
           });

        // Restaurer l'état
        doc.restore();
    }

    /**
     * Configure les polices pour le document
     */
    registerFonts(doc, fonts = {}) {
        // Polices par défaut
        const defaultFonts = {
            'Crimson': {
                normal: path.join(__dirname, '../../assets/fonts/CrimsonText-Regular.ttf'),
                bold: path.join(__dirname, '../../assets/fonts/CrimsonText-Bold.ttf'),
                italic: path.join(__dirname, '../../assets/fonts/CrimsonText-Italic.ttf')
            },
            'Bebas': {
                normal: path.join(__dirname, '../../assets/fonts/BebasNeue-Regular.ttf')
            }
        };

        // Fusionner avec les polices personnalisées
        const allFonts = { ...defaultFonts, ...fonts };

        // Enregistrer les polices si elles existent
        Object.entries(allFonts).forEach(([name, paths]) => {
            Object.entries(paths).forEach(([style, fontPath]) => {
                if (fs.existsSync(fontPath)) {
                    const fontName = style === 'normal' ? name : `${name}-${style}`;
                    doc.registerFont(fontName, fontPath);
                }
            });
        });
    }

    /**
     * Ajoute un titre avec le style approprié
     */
    addTitle(doc, text, options = {}) {
        const {
            fontSize = 16,
            align = 'center',
            uppercase = true,
            letterSpacing = 0.1,
            marginBottom = 20
        } = options;

        doc.fontSize(fontSize)
           .fillColor('#000000')
           .text(uppercase ? text.toUpperCase() : text, {
               align,
               characterSpacing: letterSpacing * fontSize,
               continued: false
           });

        doc.moveDown(marginBottom / 12);
    }

    /**
     * Ajoute un paragraphe avec justification
     */
    addParagraph(doc, text, options = {}) {
        const {
            fontSize = 11,
            indent = 0,
            align = 'justify',
            lineGap = 5
        } = options;

        doc.fontSize(fontSize)
           .fillColor('#000000')
           .text(text, {
               align,
               indent,
               lineGap,
               continued: false
           });

        doc.moveDown(0.5);
    }

    /**
     * Ajoute une liste avec puces étoiles
     */
    addStarList(doc, items, options = {}) {
        const {
            fontSize = 11,
            bulletChar = '*',
            indent = 20,
            lineGap = 3
        } = options;

        // Sauvegarder la position X de départ pour toute la liste
        const listStartX = doc.x;

        items.forEach(item => {
            // Utiliser toujours la position X de départ de la liste
            const currentY = doc.y;
            
            // Sauvegarder l'état complet du document
            doc.save();
            
            // Dessiner la puce à la position de base de la liste
            doc.fontSize(fontSize)
               .fillColor('#000000')
               .text(bulletChar, listStartX, currentY, {
                   continued: false
               });
            
            // Restaurer l'état du document
            doc.restore();
            
            // Positionner le curseur pour le texte avec indentation
            doc.x = listStartX + indent;
            doc.y = currentY;
            
            // Dessiner le texte de l'élément
            doc.fontSize(fontSize)
               .fillColor('#000000')
               .text(item, {
                   align: 'justify',
                   lineGap,
                   continued: false
               });

            // Remettre le curseur X à la position de départ de la liste pour le prochain élément
            doc.x = listStartX;
            doc.moveDown(0.3);
        });
        
        // S'assurer que le curseur X est correctement positionné après la liste
        doc.x = listStartX;
    }

    /**
     * Ajoute une ligne de séparation
     */
    addSeparator(doc, options = {}) {
        const {
            width = 0.5,
            color = '#000000',
            marginTop = 10,
            marginBottom = 10
        } = options;

        doc.moveDown(marginTop / 12);

        const startX = doc.x;
        const endX = this.pageWidth - this.marginRight;
        const y = doc.y;

        doc.moveTo(startX, y)
           .lineTo(endX, y)
           .lineWidth(width)
           .stroke(color);

        doc.moveDown(marginBottom / 12);
    }

    /**
     * Gère les marges en tenant compte de la barre latérale
     */
    getContentMargins(pageNumber) {
        const isOddPage = pageNumber % 2 === 1;
        const sidebarSpace = this.sidebarWidth + 10; // 15mm + 10pt d'espace
        
        return {
            left: isOddPage ? this.marginLeft + sidebarSpace : this.marginLeft,
            right: isOddPage ? this.marginRight : this.marginRight + sidebarSpace,
            top: this.marginTop,
            bottom: this.marginBottom,
            width: this.pageWidth - this.marginLeft - this.marginRight - sidebarSpace
        };
    }

    /**
     * Vérifie si on doit créer une nouvelle page
     */
    checkNewPage(doc, requiredSpace = 50) {
        const currentY = doc.y;
        const pageBottom = this.pageHeight - this.marginBottom;
        
        if (currentY + requiredSpace > pageBottom) {
            doc.addPage();
            return true;
        }
        return false;
    }
}

module.exports = BasePdfKitService;