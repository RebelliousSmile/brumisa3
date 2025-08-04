const SystemTheme = require('./SystemTheme');
const path = require('path');
const fs = require('fs');

/**
 * Thème Zombiology pour les documents PDF
 * Design survival horror avec esthétique biologique et post-apocalyptique
 */
class ZombiologyTheme extends SystemTheme {
    constructor() {
        super('zombiology');
    }
    
    /**
     * Couleurs du thème Zombiology
     */
    getColors() {
        return {
            primary: '#7f1d1d',        // Rouge très foncé (red-900)
            background: '#0f0f0f',     // Noir profond
            secondary: '#991b1b',      // Rouge foncé (red-800)
            accent: '#dc2626',         // Rouge vif (red-600)
            danger: '#ef4444',         // Rouge danger (red-500)
            infection: '#22c55e',      // Vert infection (green-500)
            text: '#f5f5f5',          // Blanc cassé
            sidebar: '#450a0a',       // Rouge très foncé sidebar (red-950)
            warning: '#fbbf24',       // Jaune avertissement (amber-400)
            blood: '#991b1b',         // Rouge sang
            biohazard: '#22c55e'      // Vert biohazard
        };
    }
    
    /**
     * Configuration des polices Zombiology
     */
    getFonts() {
        return {
            body: {
                // EB Garamond pour un aspect lisible mais inquiétant
                family: 'EBGaramond-Regular',
                fallback: ['CrimsonText-Regular', 'Georgia', 'Times-Roman', 'serif'],
                size: 10,
                lineHeight: 1.4
            },
            titles: {
                // Bebas Neue pour les titres impactants
                family: 'BebasNeue-Regular',
                fallback: ['Impact', 'Arial Black', 'sans-serif'],
                weight: 'normal',
                transform: 'uppercase',
                letterSpacing: 0.1,
                sizes: {
                    h1: 22,
                    h2: 16,
                    h3: 13
                }
            },
            sidebar: {
                // Allerta Stencil pour aspect technique/militaire
                family: 'AllertaStencil-Regular',
                fallback: ['Impact', 'Arial Black', 'sans-serif'],
                size: 11,
                letterSpacing: 0.15,
                transform: 'uppercase'
            },
            warnings: {
                // Bebas Neue pour les avertissements biologiques
                family: 'BebasNeue-Regular',
                fallback: ['Impact', 'Arial Black', 'sans-serif'],
                size: 13,
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
     * Enregistre les polices Zombiology dans le document
     */
    registerFonts(doc) {
        const fontsDir = path.join(__dirname, '../../../assets/fonts');
        
        try {
            // Vérifier l'existence des fichiers de polices
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
            
            // Fallback vers Crimson Text
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
            
            console.log(`Polices Zombiology chargées: ${fontsLoaded}/8`);
            
            return fontsLoaded > 0;
        } catch (error) {
            console.warn('⚠️ Erreur chargement polices Zombiology, utilisation polices système', error);
            return false;
        }
    }
    
    /**
     * Texte à afficher dans la sidebar selon le type de document
     */
    getSidebarText(documentType, data) {
        switch (documentType) {
            case 'generic':
                return `ZONE-${data.zone || 'X'} | ${data.titre || 'QUARANTINE'}`;
            case 'class-plan':
                return `${data.className || 'SURVIVOR'} - PROTOCOL`;
            case 'character-sheet':
                return `${data.characterName || 'SURVIVOR'} - DOSSIER`;
            default:
                return 'ZOMBIOLOGY - SURVIVAL PROTOCOLS';
        }
    }
    
    /**
     * Texte du watermark selon le type de document
     */
    getWatermarkText(documentType, data) {
        switch (documentType) {
            case 'generic':
                return 'BIOHAZARD CONTAINMENT PROTOCOL';
            case 'class-plan':
                return `SURVIVAL GUIDE - ${data.className || 'CLASSIFIED'}`;
            case 'character-sheet':
                return 'SURVIVOR RECORD - CONFIDENTIAL';
            default:
                return 'ZOMBIOLOGY - OUTBREAK DOCUMENTATION';
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
            showLogo: false,
            showWarnings: true,
            warnings: [
                '☣️ BIOHAZARD LEVEL 4',
                '⚠️ QUARANTINE ZONE',
                '🚫 AUTHORIZED PERSONNEL ONLY'
            ],
            layout: 'survival',
            borders: 'biohazard-frame'
        };
    }
    
    /**
     * Style des encadrés (infections, stress, survie, etc.)
     */
    getBoxStyles() {
        return {
            infection: {
                borderColor: '#22c55e',
                borderWidth: 2,
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderStyle: 'dashed',
                icon: '☣️',
                titleBg: '#22c55e',
                titleColor: '#000000'
            },
            stress: {
                borderColor: '#dc2626',
                borderWidth: 2,
                backgroundColor: 'rgba(220, 38, 38, 0.15)',
                borderStyle: 'solid',
                icon: '⚡',
                titleBg: '#dc2626',
                titleColor: '#ffffff'
            },
            survival: {
                borderColor: '#fbbf24',
                borderWidth: 1,
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                borderStyle: 'solid',
                icon: '🎒',
                titleBg: '#fbbf24',
                titleColor: '#000000'
            },
            danger: {
                borderColor: '#ef4444',
                borderWidth: 3,
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderStyle: 'double',
                icon: '☠️',
                titleBg: '#ef4444',
                titleColor: '#ffffff'
            },
            info: {
                borderColor: '#991b1b',
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
            bulletChar: '▶',     // Flèche survival
            bulletColor: '#dc2626',
            bulletSize: 1.2,
            indent: 22,
            numberStyle: 'protocol', // Format: [1], [2], etc.
            numberPrefix: '►'        // Préfixe survival
        };
    }
    
    /**
     * Éléments décoratifs spécifiques Zombiology
     */
    getDecorations() {
        return {
            stamps: [
                { text: 'INFECTED', color: '#22c55e', rotation: -12 },
                { text: 'QUARANTINE', color: '#dc2626', rotation: 8 },
                { text: 'BIOHAZARD', color: '#ef4444', rotation: -8 }
            ],
            textures: {
                blood: 'blood-splatter.png',
                decay: 'decay-texture.png',
                viral: 'viral-pattern.png'
            },
            effects: {
                distress: true,
                contamination: true,
                decay: true
            },
            symbols: {
                biohazard: '☣️',
                skull: '☠️',
                warning: '⚠️',
                radiation: '☢️',
                medical: '⚕️'
            }
        };
    }
    
    /**
     * Mécaniques spécifiques d100 pour Zombiology
     */
    getMechanicsConfig() {
        return {
            resolution: 'd100',
            successThreshold: 'skill + attribute',
            criticals: 'doubles',
            stress: {
                types: ['adrenaline', 'panic'],
                effect: '+1d100 bonus/malus'
            },
            health: {
                physical: ['superficial', 'light', 'serious', 'deep'],
                mental: ['anxiety', 'anger', 'guilt', 'helplessness', 'fear', 'sadness']
            },
            infection: {
                stages: ['infection', 'clinical_death', 'rigor_mortis', 'reanimation'],
                test: 'CON vs Virus%'
            }
        };
    }
}

module.exports = ZombiologyTheme;