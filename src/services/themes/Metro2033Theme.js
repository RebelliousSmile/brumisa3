const SystemTheme = require('./SystemTheme');
const path = require('path');
const fs = require('fs');

/**
 * Thème Metro 2033 pour les documents PDF
 * Design post-apocalyptique soviétique avec textures industrielles
 */
class Metro2033Theme extends SystemTheme {
    constructor() {
        super('metro2033');
    }
    
    /**
     * Couleurs du thème Metro 2033
     */
    getColors() {
        return {
            primary: '#8B0000',        // Rouge soviétique
            background: '#0A0A0A',     // Noir profond
            secondary: '#3A3A3A',      // Gris métallique
            accent: '#FFD700',         // Jaune d'avertissement
            danger: '#FF0000',         // Rouge vif danger
            radiation: '#7FFF00',      // Vert radioactif
            text: '#E8E8E8',          // Blanc cassé
            sidebar: '#3A3A3A'        // Gris métallique
        };
    }
    
    /**
     * Configuration des polices Metro 2033
     */
    getFonts() {
        return {
            body: {
                // EB Garamond comme alternative à Minion Pro
                family: 'EBGaramond-Regular',
                fallback: ['CrimsonText-Regular', 'Georgia', 'Times-Roman', 'serif'],
                size: 10,
                lineHeight: 1.35
            },
            titles: {
                // Bebas Neue pour les titres industriels
                family: 'BebasNeue-Regular',
                fallback: ['Impact', 'Arial Black', 'sans-serif'],
                weight: 'normal',
                transform: 'uppercase',
                letterSpacing: 0.15,
                sizes: {
                    h1: 24,
                    h2: 18,
                    h3: 14
                }
            },
            sidebar: {
                // Allerta Stencil pour la sidebar
                family: 'AllertaStencil-Regular',
                fallback: ['Impact', 'Arial Black', 'sans-serif'],
                size: 12,
                letterSpacing: 0.2,
                transform: 'uppercase'
            },
            warnings: {
                // Bebas Neue pour les avertissements
                family: 'BebasNeue-Regular',
                fallback: ['Impact', 'Arial Black', 'sans-serif'],
                size: 14,
                weight: 'normal',
                transform: 'uppercase'
            },
            italic: {
                family: 'EBGaramond-Italic',
                fallback: ['CrimsonText-Italic', 'Times-Italic', 'Georgia', 'serif'],
                size: 10
            },
            bold: {
                family: 'EBGaramond-Bold',
                fallback: ['CrimsonText-Bold', 'Times-Bold', 'Georgia', 'serif'],
                size: 10
            }
        };
    }
    
    /**
     * Enregistre les polices Metro 2033 dans le document
     */
    registerFonts(doc) {
        const fontsDir = path.join(__dirname, '../../../assets/fonts');
        
        try {
            // Vérifier l'existence des fichiers de polices Metro 2033
            const ebGaramondRegular = path.join(fontsDir, 'EBGaramond-Regular.ttf');
            const ebGaramondBold = path.join(fontsDir, 'EBGaramond-Bold.ttf');
            const ebGaramondItalic = path.join(fontsDir, 'EBGaramond-Italic.ttf');
            const bebasRegular = path.join(fontsDir, 'BebasNeue-Regular.ttf');
            const stencilRegular = path.join(fontsDir, 'AllertaStencil-Regular.ttf');
            
            let fontsLoaded = 0;
            
            // EB Garamond (corps de texte)
            if (fs.existsSync(ebGaramondRegular)) {
                doc.registerFont('EBGaramond-Regular', ebGaramondRegular);
                fontsLoaded++;
            }
            
            if (fs.existsSync(ebGaramondBold)) {
                doc.registerFont('EBGaramond-Bold', ebGaramondBold);
                fontsLoaded++;
            }
            
            if (fs.existsSync(ebGaramondItalic)) {
                doc.registerFont('EBGaramond-Italic', ebGaramondItalic);
                fontsLoaded++;
            }
            
            // Bebas Neue (titres)
            if (fs.existsSync(bebasRegular)) {
                doc.registerFont('BebasNeue-Regular', bebasRegular);
                fontsLoaded++;
            }
            
            // Allerta Stencil (sidebar)
            if (fs.existsSync(stencilRegular)) {
                doc.registerFont('AllertaStencil-Regular', stencilRegular);
                fontsLoaded++;
            }
            
            // Fallback vers Crimson Text si EB Garamond n'est pas disponible
            const crimsonRegular = path.join(fontsDir, 'CrimsonText-Regular.ttf');
            const crimsonBold = path.join(fontsDir, 'CrimsonText-Bold.ttf');
            const crimsonItalic = path.join(fontsDir, 'CrimsonText-Italic.ttf');
            
            if (fs.existsSync(crimsonRegular)) {
                doc.registerFont('CrimsonText-Regular', crimsonRegular);
                fontsLoaded++;
            }
            
            if (fs.existsSync(crimsonBold)) {
                doc.registerFont('CrimsonText-Bold', crimsonBold);
                fontsLoaded++;
            }
            
            if (fs.existsSync(crimsonItalic)) {
                doc.registerFont('CrimsonText-Italic', crimsonItalic);
                fontsLoaded++;
            }
            
            this.logger.info(`Polices Metro 2033 chargées: ${fontsLoaded}/8`);
            
            return fontsLoaded > 0;
        } catch (error) {
            this.logger.warn('⚠️ Erreur chargement polices Metro 2033, utilisation polices système', error);
            return false;
        }
    }
    
    /**
     * Texte à afficher dans la sidebar selon le type de document
     */
    getSidebarText(documentType, data) {
        switch (documentType) {
            case 'generic':
                return `СЕКТОР-${data.secteur || 'XXX'} | ${data.titre || 'СЕКРЕТНО'}`;
            case 'class-plan':
                return `СТАНЦИЯ ${data.className || ''} - ОПАСНО`.trim();
            case 'character-sheet':
                return `${data.characterName || 'СТАЛКЕР'} - ДОСЬЕ`;
            default:
                return 'МЕТРО 2033 - СЕКРЕТНЫЕ ДОКУМЕНТЫ';
        }
    }
    
    /**
     * Texte du watermark selon le type de document
     */
    getWatermarkText(documentType, data) {
        switch (documentType) {
            case 'generic':
                return 'PROPRIÉTÉ DE LA LIGNE ROUGE';
            case 'class-plan':
                return `ПЛАН СТАНЦИИ - ${data.className || 'СЕКРЕТНО'}`;
            case 'character-sheet':
                return 'ДОСЬЕ СТАЛКЕРА - НЕ РАСПРОСТРАНЯТЬ';
            default:
                return 'МЕТРО 2033 - КОНФИДЕНЦИАЛЬНО';
        }
    }
    
    /**
     * Configuration de la page de garde
     */
    getCoverConfig(documentType, data) {
        const colors = this.getColors();
        
        return {
            backgroundColor: colors.background,
            titleColor: colors.primary,
            subtitleColor: colors.accent,
            showLogo: false, // Pas de logo pour l'instant
            showWarnings: true,
            warnings: [
                '⚠️ DOCUMENT CLASSIFIÉ',
                '☢ ZONE CONTAMINÉE',
                '🚫 ACCÈS RESTREINT'
            ],
            layout: 'military', // Style militaire/industriel
            borders: 'metal-frame' // Cadre métallique
        };
    }
    
    /**
     * Style des encadrés (avertissements, notes de survie, etc.)
     */
    getBoxStyles() {
        return {
            warning: {
                borderColor: '#FFD700',
                borderWidth: 2,
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                borderStyle: 'dashed',
                icon: '⚠️',
                titleBg: '#FFD700',
                titleColor: '#000000'
            },
            danger: {
                borderColor: '#FF0000',
                borderWidth: 3,
                backgroundColor: 'rgba(139, 0, 0, 0.2)',
                borderStyle: 'double',
                icon: '☢',
                titleBg: '#8B0000',
                titleColor: '#FFD700'
            },
            info: {
                borderColor: '#3A3A3A',
                borderWidth: 1,
                backgroundColor: 'transparent',
                borderStyle: 'solid',
                titlePosition: 'inline',
                padding: 10
            }
        };
    }
    
    /**
     * Configuration des listes à puces
     */
    getListConfig() {
        return {
            bulletChar: '▸',     // Flèche industrielle
            bulletColor: '#8B0000',
            bulletSize: 1.3,
            indent: 25,
            numberStyle: 'military', // Format: 1.0, 2.0, etc.
            numberPrefix: '§'        // Préfixe militaire
        };
    }
    
    /**
     * Éléments décoratifs supplémentaires
     */
    getDecorations() {
        return {
            stamps: [
                { text: 'ОПАСНО', color: '#FF0000', rotation: -15 },
                { text: 'CLASSIFIED', color: '#FFD700', rotation: 10 },
                { text: 'СЕКРЕТНО', color: '#8B0000', rotation: -5 }
            ],
            textures: {
                rust: 'rust-texture.png',
                metal: 'metal-texture.png',
                dirt: 'dirt-overlay.png'
            },
            effects: {
                glitch: true,
                burnEdges: true,
                bloodSplatter: false // Optionnel selon le contenu
            }
        };
    }
}

module.exports = Metro2033Theme;