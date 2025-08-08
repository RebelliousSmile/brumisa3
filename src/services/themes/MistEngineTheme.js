const SystemTheme = require('./SystemTheme');
const path = require('path');

/**
 * Thème Mist Engine - Mystique Poétique
 * 
 * Design inspiré par l'univers narratif et poétique de Mist Engine
 * avec des couleurs douces, des effets de brume et une typographie manuscrite
 */
class MistEngineTheme extends SystemTheme {
    
    /**
     * Retourne la palette de couleurs Mist Engine
     * @returns {Object} Palette de couleurs mystiques et poétiques
     */
    getColors() {
        return {
            // Couleurs principales - Rose mystique et violet doux
            primary: '#ec4899',          // Rose mystique principal
            primaryDark: '#be185d',      // Rose plus sombre pour contraste
            primaryLight: '#f9a8d4',     // Rose clair pour highlights
            
            // Couleurs secondaires - Violet poétique
            secondary: '#a78bfa',        // Violet doux
            secondaryDark: '#9333ea',    // Violet profond
            secondaryLight: '#c4b5fd',   // Violet très clair
            
            // Couleur d'accent - Doré mystique
            accent: '#fbbf24',           // Jaune doré pour les éléments importants
            accentDark: '#f59e0b',       // Doré plus sombre
            
            // Arrière-plans - Tons pastels et brumeux
            background: '#fdf2f8',       // Rose très pâle, presque blanc
            backgroundAlt: '#fce7f3',    // Rose pâle alternatif
            surface: '#f9a8d4',          // Rose moyen pour les surfaces
            
            // Textes
            text: '#831843',             // Rose très sombre pour le texte principal
            textLight: '#be185d',        // Rose moyen pour texte secondaire
            textOnPrimary: '#ffffff',    // Blanc sur fond coloré
            
            // États et bordures
            border: '#f9a8d419',         // Rose très transparent pour bordures subtiles
            shadow: 'rgba(236, 72, 153, 0.15)', // Ombre rose douce
            overlay: 'rgba(253, 242, 248, 0.95)', // Overlay semi-transparent
            
            // Éléments spéciaux Mist Engine
            mist: 'rgba(249, 168, 212, 0.3)',    // Effet de brume rose
            dream: 'rgba(167, 139, 250, 0.2)',   // Effet onirique violet
            poetry: '#ec4899',                    // Couleur pour éléments poétiques
            magic: '#a78bfa'                      // Couleur pour éléments magiques
        };
    }
    
    /**
     * Retourne la configuration des polices Mist Engine
     * @returns {Object} Configuration typographique poétique
     */
    getFonts() {
        return {
            // Police principale pour le corps de texte
            body: {
                family: 'Helvetica, Arial, sans-serif',
                size: 11,
                lineHeight: 1.6,
                letterSpacing: 0.3
            },
            
            // Police pour les titres - Style manuscrit/poétique
            title: {
                family: 'Times New Roman, serif',
                size: 24,
                weight: 'normal',
                style: 'italic',
                lineHeight: 1.3
            },
            
            // Police pour les sous-titres
            subtitle: {
                family: 'Georgia, serif',
                size: 14,
                weight: 'normal',
                style: 'italic',
                lineHeight: 1.4
            },
            
            // Police pour les citations et éléments poétiques
            quote: {
                family: 'Georgia, serif',
                size: 12,
                style: 'italic',
                lineHeight: 1.8,
                color: '#be185d'
            },
            
            // Police pour la sidebar
            sidebar: {
                family: 'Helvetica, Arial, sans-serif',
                size: 9,
                weight: 'light',
                lineHeight: 1.4,
                letterSpacing: 0.5
            },
            
            // Police pour les éléments narratifs
            narrative: {
                family: 'Georgia, serif',
                size: 11,
                style: 'italic',
                lineHeight: 1.7
            }
        };
    }
    
    /**
     * Enregistre les polices dans le document PDFKit
     * @param {PDFDocument} doc - Document PDFKit
     * @returns {boolean} true si succès
     */
    registerFonts(doc) {
        try {
            const fontsPath = path.join(process.cwd(), 'assets', 'fonts');
            
            // Polices standard (utiliser les polices système)
            // PDFKit utilise les polices intégrées par défaut
            
            // Pour un style plus poétique, on pourrait ajouter des polices personnalisées
            // doc.registerFont('MistPoetic', path.join(fontsPath, 'dancing-script.ttf'));
            
            return true;
        } catch (error) {
            console.error('Erreur lors du chargement des polices Mist Engine:', error);
            return false;
        }
    }
    
    /**
     * Retourne le texte de la sidebar selon le type de document
     * @param {string} documentType - Type de document
     * @param {Object} data - Données du document
     * @returns {string} Texte poétique pour la sidebar
     */
    getSidebarText(documentType, data) {
        const sidebarTexts = {
            'character-sheet': `Dans les brumes de l'imagination\n${data.nom || 'Personnage'}\n\n"Chaque histoire commence\npar un souffle de rêve..."\n\nMist Engine`,
            
            'generic': `Récit tissé de brume\n\n"Les mots dansent\nsur le papier\ncomme des ombres\ndans la lumière..."\n\nMist Engine`,
            
            'class-plan': `Architecture narrative\n${data.titre || 'Document'}\n\n"Construire des mondes\navec des mots\net des rêves..."\n\nMist Engine`,
            
            'danger': `Front narratif\n\n"Le danger n'est qu'une\nhistoire qui attend\nd'être racontée..."\n\nMist Engine`,
            
            'town': `Lieu de récits\n${data.nom || 'Lieu'}\n\n"Chaque lieu respire\nses propres histoires..."\n\nMist Engine`,
            
            'organization': `Trame collective\n\n"Les liens tissent\nla toile du récit..."\n\nMist Engine`
        };
        
        return sidebarTexts[documentType] || sidebarTexts['generic'];
    }
    
    /**
     * Retourne le texte du watermark
     * @param {string} documentType - Type de document
     * @param {Object} data - Données du document
     * @returns {string} Texte du watermark
     */
    getWatermarkText(documentType, data) {
        return 'Mist Engine';
    }
    
    /**
     * Retourne la configuration de la page de garde
     * @param {string} documentType - Type de document
     * @param {Object} data - Données du document
     * @returns {Object} Configuration visuelle mystique
     */
    getCoverConfig(documentType, data) {
        return {
            // Gradient de fond rose/violet doux
            background: {
                type: 'gradient',
                colors: ['#fdf2f8', '#fce7f3', '#f9a8d4'],
                opacity: 0.95
            },
            
            // Configuration du titre
            title: {
                text: data.titre || data.nom || 'Document Mist Engine',
                font: this.getFonts().title,
                color: '#be185d',
                align: 'center',
                y: 200,
                effects: {
                    shadow: {
                        color: 'rgba(236, 72, 153, 0.3)',
                        x: 2,
                        y: 2,
                        blur: 4
                    }
                }
            },
            
            // Sous-titre poétique
            subtitle: {
                text: data.description || '"Une histoire qui attend d\'être racontée..."',
                font: this.getFonts().subtitle,
                color: '#ec4899',
                align: 'center',
                y: 250,
                style: 'italic'
            },
            
            // Éléments décoratifs
            decorations: [
                {
                    type: 'mist',
                    position: 'top',
                    opacity: 0.3,
                    color: '#f9a8d4'
                },
                {
                    type: 'mist',
                    position: 'bottom',
                    opacity: 0.2,
                    color: '#c4b5fd'
                }
            ],
            
            // Citation en bas de page
            footer: {
                text: 'Créé avec Mist Engine - Système narratif poétique',
                font: {
                    size: 9,
                    style: 'italic'
                },
                color: '#be185d',
                align: 'center',
                y: 750
            }
        };
    }
    
    /**
     * Retourne les styles des encadrés
     * @returns {Object} Styles poétiques pour les encadrés
     */
    getBoxStyles() {
        const colors = this.getColors();
        
        return {
            // Encadré de citation/poésie
            quote: {
                background: colors.overlay,
                border: {
                    width: 1,
                    color: colors.primaryLight,
                    style: 'dashed',
                    radius: 8
                },
                padding: 15,
                font: this.getFonts().quote,
                icon: '❝',
                iconColor: colors.primary
            },
            
            // Encadré de conseil narratif
            tip: {
                background: 'rgba(167, 139, 250, 0.1)',
                border: {
                    width: 1,
                    color: colors.secondary,
                    style: 'solid',
                    radius: 6
                },
                padding: 12,
                title: {
                    text: 'Conseil narratif',
                    color: colors.secondaryDark,
                    font: {
                        size: 10,
                        weight: 'bold'
                    }
                }
            },
            
            // Encadré d'exemple de jeu
            example: {
                background: 'rgba(251, 191, 36, 0.1)',
                border: {
                    width: 1,
                    color: colors.accent,
                    style: 'dotted',
                    radius: 4
                },
                padding: 10,
                font: {
                    size: 10,
                    style: 'italic'
                }
            },
            
            // Encadré mystique/magique
            mystical: {
                background: {
                    type: 'gradient',
                    colors: [colors.mist, colors.dream],
                    direction: 'diagonal'
                },
                border: {
                    width: 2,
                    color: colors.magic,
                    style: 'double',
                    radius: 10
                },
                padding: 15,
                effects: {
                    blur: 0.5,
                    opacity: 0.95
                }
            }
        };
    }
    
    /**
     * Retourne la configuration des listes
     * @returns {Object} Configuration poétique des listes
     */
    getListConfig() {
        return {
            // Caractère de puce principal
            bulletChar: '◈',
            
            // Caractères alternatifs par niveau
            bulletLevels: ['◈', '◇', '○', '·'],
            
            // Indentation
            indent: 20,
            
            // Espacement entre les éléments
            itemSpacing: 6,
            
            // Style de numérotation
            numbering: {
                style: 'decimal',
                suffix: '.',
                color: this.getColors().primaryDark
            },
            
            // Listes spéciales pour éléments narratifs
            narrative: {
                bulletChar: '❋',
                color: this.getColors().poetry,
                indent: 25,
                itemSpacing: 8
            }
        };
    }
    
    /**
     * Retourne les effets visuels spéciaux
     * @returns {Object} Configuration des effets Mist Engine
     */
    getSpecialEffects() {
        return {
            // Effet de brume sur les pages
            mist: {
                enabled: true,
                opacity: 0.15,
                color: this.getColors().mist,
                areas: ['top', 'bottom']
            },
            
            // Bordures poétiques
            borders: {
                style: 'ornamental',
                pattern: 'floral',
                color: this.getColors().primaryLight,
                width: 0.5
            },
            
            // Transitions douces entre sections
            transitions: {
                type: 'fade',
                duration: 'smooth',
                color: this.getColors().dream
            },
            
            // Watermark artistique
            watermark: {
                style: 'poetic',
                opacity: 0.08,
                rotation: -45,
                font: {
                    style: 'italic',
                    size: 48
                }
            }
        };
    }
}

module.exports = MistEngineTheme;