# Charte Graphique - Engrenages (Roue du Temps) Theme

## 🏗️ Architecture et responsabilités

Cette charte définit le **EngrenagesTheme** qui sera utilisé par différents types de documents :

- **GenericDocument** : Documents génériques (guides, règles) avec personnalisation visuelle Engrenages
- **ClassPlanDocument** : Plans de classes avec layout spécifique + style Engrenages  
- **CharacterSheetDocument** : Feuilles de personnage avec formulaire + style Engrenages

### Séparation des responsabilités
- **BasePdfKitService** : Structure, marges, pagination, sidebar, watermark
- **EngrenagesTheme** : Polices, couleurs, textes personnalisés selon les spécifications ci-dessous
- **DocumentType** : Layout et organisation du contenu spécifique au type

## 📖 Analyse de l'univers de la Roue du Temps

D'après l'univers de la Roue du Temps (fantasy épique médiévale), voici les éléments graphiques caractéristiques à implémenter dans **EngrenagesTheme** :

### 🎨 Palette de couleurs

#### Couleurs principales
- **Fond parchemin** : `#F5F2E8` - Fond principal évoquant le parchemin ancien
- **Texte principal** : `#2B2B2B` - Noir presque pur pour une lisibilité optimale
- **Brun doré** : `#8B7355` - Bordures et ornements, couleur noble
- **Beige encadrés** : `#E8E2D5` - Fond des zones d'information importantes

#### Couleurs d'accent
- **Rouge d'accentuation** : `#8B0000` - Rouge foncé pour éléments critiques
- **Blanc pur** : `#FFFFFF` - Contraste maximal si nécessaire
- **Gris doux** : `#A0937D` - Variations subtiles du brun

### 🔤 Typographie

#### Police principale (titres principaux)
- **Type** : Serif classique avec empattements type **Garamond**, **EB Garamond** ou **Adobe Garamond Pro**
- **Taille** : 18-24pt pour les titres principaux
- **Style** : Élégant, classique, évoquant les manuscrits médiévaux
- **Caractéristiques** : Empattements prononcés, aspect noble et traditionnel

#### Police de corps
- **Type** : Serif lisible type **Times New Roman**, **Minion Pro**, ou **EB Garamond**
- **Taille** : 11-12pt pour le corps de texte
- **Interligne** : 1.5x la taille de police (environ 16-18pt)
- **Alignement** : Justifié avec césure
- **Caractéristiques** : Lisibilité optimale, confort de lecture

#### Titres de sections
- **Style** : Petites capitales (small caps) pour les sous-titres
- **Espacement** : Lettres légèrement espacées (letter-spacing: 0.1em)
- **Format** : SOUS-TITRE EN PETITES CAPITALES

#### Texte des encadrés
- **Type** : Sans-serif pour contraster avec le corps (type **Helvetica** ou **Arial**)
- **Usage** : Informations spéciales, règles, apartés

#### Hiérarchie typographique
```
TITRE PRINCIPAL (24pt, Garamond, empattements)

SOUS-TITRE EN PETITES CAPITALES (14pt, small caps, espacé)

Corps de texte (12pt, Times/Garamond, justifié, interligne 1.5)

Encadré informatif (11pt, sans-serif, contrasté)
```

### 📐 Mise en page

#### Structure de page
- **Format** : A4 (210 × 297 mm)
- **Marges** : 2,5 cm (72pt) sur tous les côtés (généreuses)
- **Mise en page** : Une colonne avec justification complète
- **Pagination** : Numéros centrés en bas de page

#### Espacements
- **Entre paragraphes** : 6-8pt
- **Avant/après titres** : 12-18pt
- **Interligne corps** : 1.5x la taille de police

#### Structure simple
- **Une colonne principale** avec marges généreuses
- **Éviter le multi-colonnes** (trop complexe pour PDFKit)
- **Hiérarchie claire** avec 3 niveaux de titres distincts

### 🎭 Éléments graphiques

#### Ornements simplifiés
- **Éviter les bordures celtiques complexes** (trop difficile en PDFKit)
- **Lignes de séparation** : Simples, couleur brun doré
- **Puces de liste** : Simples ronds ou tirets, couleur brun

#### Encadrés informatifs
- **Fond** : Beige plus foncé (#E8E2D5)
- **Bordure** : Fine, couleur brun doré
- **Police** : Sans-serif pour contraster
- **Usage** : Règles importantes, apartés, citations

#### Effets visuels
- **Fond teinté** : Couleur parchemin subtile
- **Couleurs unies** : Pas de textures complexes
- **Style épuré** : Élégance par la simplicité

### 📋 Structure du contenu

#### Organisation textuelle
1. **Titre principal** en Garamond, grand format
2. **Sous-titres** en petites capitales espacées
3. **Corps de texte** justifié avec interligne généreux
4. **Encadrés** en sans-serif pour informations spéciales

#### Mise en emphase
- **Italique** : Pour les citations, termes spéciaux
- **Petites capitales** : Pour les sous-titres et noms propres
- **Rouge foncé** : Pour les éléments critiques ou dangers
- **Encadrés** : Pour les règles et informations importantes

### 💻 Implémentation EngrenagesTheme

```javascript
// EngrenagesTheme.js
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
                // EB Garamond ou Times pour le corps
                family: 'EBGaramond-Regular',
                fallback: ['Times-Roman', 'Georgia', 'serif'],
                size: 12,
                lineHeight: 1.5  // Interligne 1.5x
            },
            titles: {
                // Garamond pour les titres principaux
                family: 'EBGaramond-Regular',
                fallback: ['Georgia', 'Times-Roman', 'serif'],
                weight: 'bold',
                letterSpacing: 0.05,
                sizes: {
                    h1: 24,
                    h2: 18,
                    h3: 14
                }
            },
            subtitles: {
                // Petites capitales pour sous-titres
                family: 'EBGaramond-Regular',
                fallback: ['Georgia', 'Times-Roman', 'serif'],
                size: 14,
                transform: 'uppercase',
                letterSpacing: 0.1,
                fontVariant: 'small-caps'
            },
            boxes: {
                // Sans-serif pour encadrés
                family: 'Helvetica',
                fallback: ['Arial', 'sans-serif'],
                size: 11,
                lineHeight: 1.4
            },
            italic: {
                family: 'EBGaramond-Italic',
                fallback: ['Times-Italic', 'Georgia', 'serif'],
                size: 12
            },
            bold: {
                family: 'EBGaramond-Bold',
                fallback: ['Times-Bold', 'Georgia', 'serif'],
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
            // EB Garamond (principale)
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
            backgroundColor: colors.background,
            titleColor: colors.text,
            subtitleColor: colors.primary,
            showLogo: false, // Simplicité privilégiée
            showBorder: true,
            borderColor: colors.primary,
            layout: 'elegant', // Style élégant et classique
            ornaments: 'simple' // Ornements simples
        };
    }
    
    /**
     * Style des encadrés (règles, informations importantes)
     */
    getBoxStyles() {
        return {
            info: {
                borderColor: '#8B7355',
                borderWidth: 1,
                backgroundColor: '#E8E2D5',
                borderStyle: 'solid',
                padding: 12,
                fontFamily: 'Helvetica', // Sans-serif pour contraster
                fontSize: 11
            },
            rule: {
                borderColor: '#8B0000',
                borderWidth: 2,
                backgroundColor: '#F5F2E8',
                borderStyle: 'solid',
                padding: 10,
                titleBg: '#8B0000',
                titleColor: '#FFFFFF'
            },
            quote: {
                borderColor: '#A0937D',
                borderWidth: 0,
                backgroundColor: 'transparent',
                borderLeft: '4px solid #8B7355',
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
            bulletChar: '•',     // Puce simple
            bulletColor: '#8B7355',
            bulletSize: 1.2,
            indent: 20,
            numberStyle: 'classic', // 1., 2., 3.
            spacing: {
                paragraph: 6,    // 6-8pt entre paragraphes
                title: 15        // 12-18pt avant/après titres
            }
        };
    }
    
    /**
     * Configuration des marges (2,5 cm = 72pt)
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
            position: 'bottom-center', // Numéros centrés en bas
            format: '{pageNumber}',
            fontSize: 10,
            color: '#2B2B2B',
            margins: {
                bottom: 36  // 1,25 cm du bord
            }
        };
    }
}

module.exports = EngrenagesTheme;
```

### Usage dans les documents

```javascript
// GenericDocument avec Engrenages
const theme = new EngrenagesTheme();
const doc = new GenericDocument(theme);

// ClassPlanDocument avec Engrenages  
const classPlan = new ClassPlanDocument(theme);

// CharacterSheet avec Engrenages
const characterSheet = new CharacterSheetDocument(theme);
```

### 🎯 Principes de design Engrenages

1. **Élégance classique** : Style noble et traditionnel, évoquant les manuscrits médiévaux
2. **Lisibilité prioritaire** : Marges généreuses, interligne 1.5, justification soignée
3. **Simplicité raffinée** : Éviter la complexité, privilégier l'épurement
4. **Cohérence typographique** : Hiérarchie claire avec 3 niveaux bien distincts
5. **Couleur parchemin** : Ambiance chaleureuse et traditionnelle

### ✅ Checklist de conformité EngrenagesTheme

Pour qu'un PDF respecte la charte Engrenages via EngrenagesTheme :

#### Implémentation technique
- [ ] **EngrenagesTheme** utilisé dans le document
- [ ] **registerFonts()** appelé pour charger EB Garamond
- [ ] **getColors()** respecté pour la palette parchemin/brun
- [ ] **getMargins()** appliqué (2,5 cm sur tous côtés)
- [ ] **getPaginationConfig()** pour numérotation centrée

#### Rendu visuel
- [ ] **Police serif** EB Garamond (ou Georgia en fallback)
- [ ] **Fond parchemin** (#F5F2E8)
- [ ] **Texte noir** (#2B2B2B) pour lisibilité maximale
- [ ] **Ornements brun doré** (#8B7355)
- [ ] **Marges généreuses** (2,5 cm)
- [ ] **Interligne 1.5** pour le corps de texte
- [ ] **Justification complète** du texte
- [ ] **Encadrés sans-serif** pour contraster
- [ ] **Petites capitales** pour sous-titres
- [ ] **Pagination centrée** en bas de page

### Recommandations PDFKit

#### ✅ Éléments à conserver
- **Structure simple** : Une colonne principale
- **Police serif** : Georgia/EB Garamond disponibles
- **Fond teinté** : Couleur parchemin subtile (#F5F2E8)
- **Encadrés** : Pour informations importantes
- **Hiérarchie claire** : 3 niveaux de titres distincts
- **Pagination simple** : Numérotation basique centrée

#### ⚠️ Éléments simplifiés
- **Ornements** : Pas de bordures celtiques complexes
- **Cartes** : Uniquement si images HD disponibles
- **Lettrines** : Trop complexe pour PDFKit
- **Textures** : Utiliser couleurs unies
- **Multi-colonnes** : Rester sur une colonne
- **Polices custom** : Privilégier polices système en fallback

### 🚫 À éviter

- ❌ Bordures décoratives complexes
- ❌ Multi-colonnes (complexité PDFKit)
- ❌ Textures et effets graphiques lourds
- ❌ Polices fantaisie ou décoratives
- ❌ Couleurs vives ou criardes
- ❌ Marges insuffisantes (< 2 cm)
- ❌ Interligne serré (< 1.3)

Cette charte graphique capture l'essence visuelle des Engrenages de la Roue du Temps : un style noble et traditionnel, privilégiant la lisibilité et l'élégance classique des manuscrits de fantasy épique.