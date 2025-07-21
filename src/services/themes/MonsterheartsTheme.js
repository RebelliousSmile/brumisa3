const SystemTheme = require('./SystemTheme');
const path = require('path');
const fs = require('fs');

/**
 * Thème Monsterhearts - Style minimaliste noir et blanc
 * Implémente l'esthétique gothique épurée du livre officiel
 */
class MonsterheartsTheme extends SystemTheme {
    
    /**
     * Couleurs du thème Monsterhearts - Palette monochrome
     */
    getColors() {
        return {
            primary: '#000000',        // Noir profond
            background: '#FAFAF8',     // Blanc cassé  
            secondary: '#333333',      // Gris foncé
            accent: '#FFFFFF',         // Blanc pur pour texte sur noir
            sidebar: '#000000',        // Noir pour bande latérale
            text: '#000000',           // Texte principal
            border: '#000000'          // Bordures d'encadrés
        };
    }
    
    /**
     * Configuration des polices Monsterhearts
     */
    getFonts() {
        return {
            body: {
                family: 'Crimson-Regular',
                fallback: ['Times-Roman', 'Georgia', 'serif'],
                size: 11,
                lineHeight: 1.45
            },
            titles: {
                family: 'Crimson-Bold',
                fallback: ['Times-Bold', 'Georgia', 'serif'], 
                weight: '600',
                transform: 'uppercase',
                letterSpacing: 0.1,
                sizes: {
                    h1: 16,
                    h2: 14, 
                    h3: 12
                }
            },
            sidebar: {
                family: 'Bebas-Regular',
                fallback: ['Impact', 'Arial Black', 'sans-serif'],
                size: 14,
                letterSpacing: 0.2,
                transform: 'uppercase'
            },
            italic: {
                family: 'Crimson-Italic',
                fallback: ['Times-Italic', 'Georgia', 'serif'],
                size: 11
            }
        };
    }
    
    /**
     * Enregistre les polices Monsterhearts dans le document
     */
    registerFonts(doc) {
        const fontsDir = path.join(__dirname, '../../../assets/fonts');
        
        try {
            // Vérifier l'existence des fichiers de polices
            const crimsonRegular = path.join(fontsDir, 'CrimsonText-Regular.ttf');
            const crimsonBold = path.join(fontsDir, 'CrimsonText-Bold.ttf');
            const crimsonItalic = path.join(fontsDir, 'CrimsonText-Italic.ttf');
            const bebasRegular = path.join(fontsDir, 'BebasNeue-Regular.ttf');
            
            let fontsLoaded = 0;
            
            // Crimson Text (corps et titres)
            if (fs.existsSync(crimsonRegular)) {
                doc.registerFont('Crimson-Regular', crimsonRegular);
                fontsLoaded++;
            }
            
            if (fs.existsSync(crimsonBold)) {
                doc.registerFont('Crimson-Bold', crimsonBold);
                fontsLoaded++;
            }
            
            if (fs.existsSync(crimsonItalic)) {
                doc.registerFont('Crimson-Italic', crimsonItalic);
                fontsLoaded++;
            }
            
            // Bebas Neue (sidebar)
            if (fs.existsSync(bebasRegular)) {
                doc.registerFont('Bebas-Regular', bebasRegular);
                fontsLoaded++;
            }
            
            if (fontsLoaded > 0) {
                console.log(`✓ ${fontsLoaded}/4 polices Monsterhearts chargées`);
                return true;
            } else {
                throw new Error('Aucune police Monsterhearts trouvée');
            }
            
        } catch (error) {
            console.warn('⚠️ Erreur chargement polices Monsterhearts, utilisation polices système:', error.message);
            return false;
        }
    }
    
    /**
     * Texte à afficher dans la sidebar selon le type de document
     */
    getSidebarText(documentType, data) {
        switch (documentType) {
            case 'generic':
                return (data.titre || 'MONSTERHEARTS').toUpperCase();
                
            case 'class-plan':
                if (data.className) {
                    return `CLASSE ${data.className}`.toUpperCase();
                }
                return 'PLAN DE CLASSE';
                
            case 'character-sheet':
                if (data.characterName) {
                    return data.characterName.toUpperCase();
                }
                return 'PERSONNAGE';
                
            default:
                return 'MONSTERHEARTS';
        }
    }
    
    /**
     * Texte du watermark selon le type de document
     */
    getWatermarkText(documentType, data) {
        switch (documentType) {
            case 'generic':
                return 'MONSTERHEARTS 2E';
                
            case 'class-plan':
                if (data.className) {
                    return `PLAN DE CLASSE - ${data.className.toUpperCase()}`;
                }
                return 'PLAN DE CLASSE - MONSTERHEARTS';
                
            case 'character-sheet':
                return 'FEUILLE DE PERSONNAGE - MONSTERHEARTS';
                
            default:
                return 'MONSTERHEARTS';
        }
    }
    
    /**
     * Configuration de la page de garde Monsterhearts
     */
    getCoverConfig(documentType, data) {
        const colors = this.getColors();
        
        return {
            backgroundColor: colors.background,
            titleColor: colors.primary,
            subtitleColor: colors.secondary,
            showLogo: false,              // Monsterhearts privilégie la sobriété
            showOrnaments: false,         // Pas d'ornements décoratifs
            layout: 'minimal',            // Layout épuré
            titleFont: 'Crimson-Bold',
            subtitleFont: 'Crimson-Regular',
            authorFont: 'Crimson-Italic',
            centerVertically: true,
            addSeparatorLine: true        // Ligne horizontale caractéristique
        };
    }
    
    /**
     * Style des encadrés (citations, conseils, etc.)
     */
    getBoxStyles() {
        return {
            borderColor: '#000000',
            borderWidth: 0.5,
            backgroundColor: 'transparent',  // Pas de fond coloré
            titlePosition: 'on-border',      // Titre sur la bordure (spécificité MH)
            titleBgColor: '#FAFAF8',        // Fond blanc pour le titre sur bordure
            padding: 8,
            marginTop: 15,
            marginBottom: 15,
            titleFont: 'Crimson-Regular',
            textFont: 'Crimson-Regular',
            titleSize: 9,
            textSize: 11
        };
    }
    
    /**
     * Configuration des listes à puces Monsterhearts
     */
    getListConfig() {
        return {
            bulletChar: '✱',            // Étoile caractéristique
            bulletSize: 1.2,
            bulletColor: '#000000',
            indent: 20,
            itemSpacing: 0.3,
            font: 'Crimson-Regular',
            fontSize: 11,
            lineHeight: 1.4
        };
    }
    
    /**
     * Images et assets Monsterhearts (minimalistes)
     */
    getImages() {
        return {
            logo: null,                  // Pas de logo, juste typographie
            background: null,            // Fond uni
            ornaments: [],              // Pas d'ornements
            separator: null             // Séparateurs simples en CSS
        };
    }
    
    /**
     * Applique le style de titre Monsterhearts
     * @param {PDFDocument} doc - Document PDFKit
     * @param {string} text - Texte du titre
     * @param {number} level - Niveau du titre (1, 2, 3)
     * @param {Object} options - Options supplémentaires
     */
    applyTitleStyle(doc, text, level = 1, options = {}) {
        const fonts = this.getFonts();
        const colors = this.getColors();
        
        // Appliquer la police et couleur
        this.applyFont(doc, 'titles');
        this.applyColor(doc, 'primary');
        
        // Taille selon le niveau
        const fontSize = fonts.titles.sizes[`h${level}`] || 12;
        doc.fontSize(fontSize);
        
        // Toujours en majuscules pour Monsterhearts
        const titleText = text.toUpperCase();
        
        return titleText;
    }
    
    /**
     * Applique le style de paragraphe Monsterhearts
     * @param {PDFDocument} doc - Document PDFKit
     * @param {boolean} isIntro - Si c'est un paragraphe d'introduction (italique)
     */
    applyParagraphStyle(doc, isIntro = false) {
        if (isIntro) {
            this.applyFont(doc, 'italic');
        } else {
            this.applyFont(doc, 'body');
        }
        this.applyColor(doc, 'text');
    }
    
    /**
     * Nom du système pour identification
     */
    getSystemName() {
        return 'monsterhearts';
    }
    
    /**
     * Version du thème
     */
    getVersion() {
        return '1.0.0';
    }
    
    /**
     * Description du thème
     */
    getDescription() {
        return 'Thème officiel Monsterhearts - Style gothique minimaliste noir et blanc';
    }
}

module.exports = MonsterheartsTheme;