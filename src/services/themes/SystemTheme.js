/**
 * Interface abstraite pour les thèmes de systèmes de jeu
 * Définit les méthodes que chaque thème doit implémenter
 * pour personnaliser l'apparence des documents PDF
 */
class SystemTheme {
    
    /**
     * Retourne la palette de couleurs du système
     * @returns {Object} Objet contenant les couleurs (primary, background, secondary, etc.)
     */
    getColors() {
        throw new Error('SystemTheme.getColors() must be implemented by subclass');
    }
    
    /**
     * Retourne la configuration des polices
     * @returns {Object} Configuration des polices (body, titles, sidebar)
     */
    getFonts() {
        throw new Error('SystemTheme.getFonts() must be implemented by subclass');
    }
    
    /**
     * Enregistre les polices personnalisées dans le document PDFKit
     * @param {PDFDocument} doc - Document PDFKit
     * @returns {boolean} true si les polices ont été chargées, false sinon
     */
    registerFonts(doc) {
        throw new Error('SystemTheme.registerFonts() must be implemented by subclass');
    }
    
    /**
     * Retourne le texte à afficher dans la sidebar selon le type de document
     * @param {string} documentType - Type de document ('generic', 'class-plan', 'character-sheet')
     * @param {Object} data - Données du document
     * @returns {string} Texte pour la sidebar
     */
    getSidebarText(documentType, data) {
        throw new Error('SystemTheme.getSidebarText() must be implemented by subclass');
    }
    
    /**
     * Retourne le texte du watermark selon le type de document
     * @param {string} documentType - Type de document
     * @param {Object} data - Données du document
     * @returns {string} Texte du watermark
     */
    getWatermarkText(documentType, data) {
        throw new Error('SystemTheme.getWatermarkText() must be implemented by subclass');
    }
    
    /**
     * Retourne la configuration de la page de garde
     * @param {string} documentType - Type de document
     * @param {Object} data - Données du document
     * @returns {Object} Configuration de la page de garde
     */
    getCoverConfig(documentType, data) {
        throw new Error('SystemTheme.getCoverConfig() must be implemented by subclass');
    }
    
    /**
     * Retourne les styles des encadrés (citations, conseils, exemples)
     * @returns {Object} Configuration des styles d'encadrés
     */
    getBoxStyles() {
        throw new Error('SystemTheme.getBoxStyles() must be implemented by subclass');
    }
    
    /**
     * Retourne la configuration des listes à puces
     * @returns {Object} Configuration des listes (bulletChar, indent, etc.)
     */
    getListConfig() {
        throw new Error('SystemTheme.getListConfig() must be implemented by subclass');
    }
    
    /**
     * Retourne les images et assets spécifiques au système
     * @returns {Object} Chemins vers les images et assets
     */
    getImages() {
        // Méthode optionnelle avec implémentation par défaut
        return {
            logo: null,
            background: null,
            ornaments: []
        };
    }
    
    /**
     * Applique les couleurs du thème au document
     * @param {PDFDocument} doc - Document PDFKit
     * @param {string} colorName - Nom de la couleur à appliquer
     */
    applyColor(doc, colorName) {
        const colors = this.getColors();
        const color = colors[colorName];
        
        if (color) {
            doc.fillColor(color);
        } else {
            console.warn(`Couleur '${colorName}' non trouvée dans le thème`);
            doc.fillColor('#000000'); // Fallback noir
        }
    }
    
    /**
     * Applique la police du thème au document
     * @param {PDFDocument} doc - Document PDFKit
     * @param {string} fontType - Type de police ('body', 'titles', 'sidebar')
     * @param {number} fontSize - Taille de police (optionnel)
     */
    applyFont(doc, fontType, fontSize) {
        const fonts = this.getFonts();
        
        // Compatibilité avec les anciens types de police
        const fontTypeMap = {
            'title': 'titles',
            'body': 'body',
            'titles': 'titles',
            'italic': 'italic',
            'sidebar': 'sidebar'
        };
        
        const mappedType = fontTypeMap[fontType] || fontType;
        const fontConfig = fonts[mappedType];
        
        if (!fontConfig) {
            console.warn(`Type de police '${fontType}' non trouvé dans le thème`);
            return;
        }
        
        // Appliquer la famille de police (avec fallback)
        try {
            doc.font(fontConfig.family);
        } catch (error) {
            // Utiliser le fallback
            if (fontConfig.fallback && fontConfig.fallback.length > 0) {
                doc.font(fontConfig.fallback[0]);
            }
        }
        
        // Appliquer la taille si spécifiée
        if (fontSize) {
            doc.fontSize(fontSize);
        } else if (fontConfig.size) {
            doc.fontSize(fontConfig.size);
        }
    }
    
    /**
     * Validation de l'implémentation du thème
     * Vérifie que toutes les méthodes requises sont implémentées
     * @returns {Object} Résultat de la validation
     */
    validate() {
        const requiredMethods = [
            'getColors', 'getFonts', 'registerFonts', 
            'getSidebarText', 'getWatermarkText', 
            'getCoverConfig', 'getBoxStyles', 'getListConfig'
        ];
        
        const missing = [];
        const errors = [];
        
        for (const method of requiredMethods) {
            if (typeof this[method] !== 'function') {
                missing.push(method);
                continue;
            }
            
            try {
                // Test basique d'appel des méthodes sans paramètres
                if (['getColors', 'getFonts', 'getBoxStyles', 'getListConfig'].includes(method)) {
                    this[method]();
                }
            } catch (error) {
                if (error.message.includes('must be implemented')) {
                    missing.push(method);
                } else {
                    errors.push({ method, error: error.message });
                }
            }
        }
        
        return {
            isValid: missing.length === 0 && errors.length === 0,
            missing: missing,
            errors: errors
        };
    }
    
    /**
     * Applique le style de titre (méthode optionnelle avec implémentation par défaut)
     * @param {PDFDocument} doc - Document PDFKit 
     * @param {string} text - Texte du titre
     * @param {number} level - Niveau du titre (1, 2, 3...)
     * @param {Object} options - Options additionnelles
     * @returns {string} Texte formaté
     */
    applyTitleStyle(doc, text, level, options) {
        // Implémentation par défaut : retourne le texte tel quel
        return text;
    }
    
    /**
     * Applique le style de paragraphe (méthode optionnelle avec implémentation par défaut)
     * @param {PDFDocument} doc - Document PDFKit
     * @param {boolean} isIntro - True si c'est un paragraphe d'introduction
     */
    applyParagraphStyle(doc, isIntro) {
        // Implémentation par défaut : ne fait rien
    }
}

module.exports = SystemTheme;