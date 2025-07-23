const SystemTheme = require('./SystemTheme');
const path = require('path');
const fs = require('fs');

/**
 * Thème Engrenages (Roue du Temps) pour les documents PDF
 * Design fantasy épique avec esthétique parchemin et typographie classique
 */
class EngrenagesTheme extends SystemTheme {
    constructor() {
        super('engrenages');
    }
    
    /**
     * Couleurs du thème Engrenages (Roue du Temps)
     */
    getColors() {
        return {
            primary: '#8B7355',        // Brun doré (ornements)
            background: '#F5F2E8',     // Fond parchemin
            secondary: '#E8E2D5',      // Beige encadrés
            accent: '#8B0000',         // Rouge d'accentuation
            text: '#2B2B2B',          // Texte principal
            sidebar: '#8B7355',        // Brun doré
            border: '#8B7355',         // Bordures
            contrast: '#A0937D'        // Gris doux
        };
    }
    
    /**
     * Configuration des polices Engrenages
     */
    getFonts() {
        return {
            body: {
                // EB Garamond pour le corps de texte
                family: 'EBGaramond-Regular',
                fallback: ['Georgia', 'Times-Roman', 'serif'],
                size: 12,
                lineHeight: 1.5  // Interligne 1.5x selon spécifications
            },
            titles: {
                // EB Garamond pour les titres principaux
                family: 'EBGaramond-Regular',
                fallback: ['Georgia', 'Times-Roman', 'serif'],
                weight: 'normal',
                letterSpacing: 0.05,
                sizes: {
                    h1: 24,  // Titres principaux
                    h2: 18,  // Sous-titres
                    h3: 14   // Titres de niveau 3
                }
            },
            subtitles: {
                // Petites capitales pour sous-titres (spécification clé)
                family: 'EBGaramond-Regular',
                fallback: ['Georgia', 'Times-Roman', 'serif'],
                size: 14,
                transform: 'uppercase',
                letterSpacing: 0.1,
                fontVariant: 'small-caps'
            },
            boxes: {
                // Sans-serif pour encadrés (contraste avec le corps)
                family: 'Helvetica',
                fallback: ['Arial', 'sans-serif'],
                size: 11,
                lineHeight: 1.4
            },
            italic: {
                family: 'EBGaramond-Italic',
                fallback: ['Georgia-Italic', 'Times-Italic', 'serif'],
                size: 12
            },
            bold: {
                family: 'EBGaramond-Bold',
                fallback: ['Georgia-Bold', 'Times-Bold', 'serif'],
                size: 12
            }
        };
    }
    
    /**
     * Enregistre les polices Engrenages dans le document
     */
    registerFonts(doc) {
        const fontsDir = path.join(__dirname, '../../../assets/fonts');
        
        try {
            // EB Garamond (police principale)
            const ebGaramondRegular = path.join(fontsDir, 'EBGaramond-Regular.ttf');
            const ebGaramondBold = path.join(fontsDir, 'EBGaramond-Bold.ttf');
            const ebGaramondItalic = path.join(fontsDir, 'EBGaramond-Italic.ttf');
            
            let fontsLoaded = 0;
            
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
            
            this.logger.info(`Polices Engrenages chargées: ${fontsLoaded}/3`);
            
            return fontsLoaded > 0;
        } catch (error) {
            this.logger.warn('⚠️ Erreur chargement polices Engrenages, utilisation polices système', error);
            return false;
        }
    }
    
    /**
     * Texte à afficher dans la sidebar selon le type de document
     */
    getSidebarText(documentType, data) {
        switch (documentType) {
            case 'generic':
                return `${data.titre || 'LA ROUE DU TEMPS'}`;
            case 'class-plan':
                return `VOIE DU ${data.className || 'POUVOIR'}`.trim();
            case 'character-sheet':
                return `${data.characterName || 'PERSONNAGE'} - FICHE`;
            default:
                return 'ENGRENAGES DU TEMPS';
        }
    }
    
    /**
     * Texte du watermark selon le type de document
     */
    getWatermarkText(documentType, data) {
        switch (documentType) {
            case 'generic':
                return 'LA ROUE DU TEMPS - ENGRENAGES';
            case 'class-plan':
                return `VOIE DU ${data.className || 'POUVOIR'}`;
            case 'character-sheet':
                return 'FEUILLE DE PERSONNAGE - ENGRENAGES';
            default:
                return 'LA ROUE TISSE SELON SES DESSEINS';
        }
    }
    
    /**
     * Configuration de la page de garde
     */
    getCoverConfig(documentType, data) {
        const colors = this.getColors();
        
        return {
            backgroundColor: colors.background,  // Fond parchemin
            titleColor: colors.text,            // Noir pour lisibilité
            subtitleColor: colors.primary,      // Brun doré pour accent
            showLogo: false,                    // Simplicité privilégiée
            showBorder: true,
            borderColor: colors.primary,        // Bordure brun doré
            layout: 'elegant',                  // Style élégant et classique
            ornaments: 'simple'                 // Ornements simples uniquement
        };
    }
    
    /**
     * Style des encadrés (règles, informations importantes)
     */
    getBoxStyles() {
        return {
            info: {
                borderColor: '#8B7355',      // Brun doré
                borderWidth: 1,
                backgroundColor: '#E8E2D5',  // Beige encadrés
                borderStyle: 'solid',
                padding: 12,
                fontFamily: 'Helvetica',     // Sans-serif pour contraster
                fontSize: 11
            },
            rule: {
                borderColor: '#8B0000',      // Rouge pour règles importantes
                borderWidth: 2,
                backgroundColor: '#F5F2E8',  // Fond parchemin
                borderStyle: 'solid',
                padding: 10,
                titleBg: '#8B0000',
                titleColor: '#FFFFFF'
            },
            quote: {
                borderColor: '#A0937D',      // Gris doux
                borderWidth: 0,
                backgroundColor: 'transparent',
                borderLeft: '4px solid #8B7355',  // Barre latérale brun
                padding: 8,
                fontStyle: 'italic'
            }
        };
    }
    
    /**
     * Configuration des listes à puces
     */
    getListConfig() {
        return {
            bulletChar: '•',             // Puce simple et élégante
            bulletColor: '#8B7355',      // Brun doré
            bulletSize: 1.2,
            indent: 20,
            numberStyle: 'classic',      // Format: 1., 2., 3.
            spacing: {
                paragraph: 7,            // 6-8pt entre paragraphes
                title: 15               // 12-18pt avant/après titres
            }
        };
    }
    
    /**
     * Configuration des marges (2,5 cm = 72pt selon spécifications)
     */
    getMargins() {
        return {
            top: 72,     // 2,5 cm
            bottom: 72,  // 2,5 cm
            left: 72,    // 2,5 cm
            right: 72    // 2,5 cm
        };
    }
    
    /**
     * Configuration de la pagination
     */
    getPaginationConfig() {
        return {
            position: 'bottom-center',   // Numéros centrés en bas selon spécifications
            format: '{pageNumber}',      // Format simple
            fontSize: 10,
            color: '#2B2B2B',           // Couleur du texte principal
            margins: {
                bottom: 36              // 1,25 cm du bord
            }
        };
    }
    
    /**
     * Configuration spécifique pour la justification
     */
    getTextConfig() {
        return {
            alignment: 'justify',        // Justification complète
            hyphenation: true,          // Césure activée
            columns: 1,                 // Une seule colonne
            orphans: 2,                 // Éviter lignes orphelines
            widows: 2                   // Éviter lignes veuves
        };
    }
    
    /**
     * Éléments décoratifs simplifiés (conformes aux recommandations PDFKit)
     */
    getDecorations() {
        return {
            // Pas d'ornements complexes (conformément aux spécifications)
            lines: {
                color: '#8B7355',        // Lignes de séparation brun doré
                width: 0.5,
                style: 'solid'
            },
            borders: {
                simple: true,            // Bordures simples uniquement
                color: '#8B7355',
                width: 1
            },
            // Éviter explicitement les éléments complexes
            avoid: {
                celticBorders: false,    // Pas de bordures celtiques
                textures: false,         // Pas de textures
                multiColumn: false,      // Pas de multi-colonnes
                dropCaps: false          // Pas de lettrines
            }
        };
    }
}

module.exports = EngrenagesTheme;