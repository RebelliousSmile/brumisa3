# Charte Graphique - Metro 2033 Theme

## 🏗️ Architecture et responsabilités

Cette charte définit le **Metro2033Theme** qui sera utilisé par différents types de documents :

- **GenericDocument** : Documents génériques (guides, règles) avec personnalisation visuelle Metro 2033
- **ClassPlanDocument** : Plans de classes avec layout spécifique + style Metro 2033  
- **CharacterSheetDocument** : Feuilles de personnage avec formulaire + style Metro 2033

### Séparation des responsabilités
- **BasePdfKitService** : Structure, marges, pagination, sidebar, watermark
- **Metro2033Theme** : Polices, couleurs, textes personnalisés selon les spécifications ci-dessous
- **DocumentType** : Layout et organisation du contenu spécifique au type

## 📖 Analyse de l'univers Metro 2033

D'après l'univers post-apocalyptique de Metro 2033, voici les éléments graphiques caractéristiques à implémenter dans **Metro2033Theme** :

### 🎨 Palette de couleurs

#### Couleurs principales
- **Noir profond** : `#0A0A0A` - Fond principal, tunnels du métro
- **Rouge sang/soviétique** : `#8B0000` - Accents, alertes, éléments soviétiques
- **Gris métallique** : `#3A3A3A` - Éléments secondaires, métal corrodé
- **Blanc cassé** : `#E8E8E8` - Texte principal (légèrement sali)

#### Couleurs d'accent
- **Jaune d'avertissement** : `#FFD700` - Signalisation de danger, radiation
- **Vert radioactif** : `#7FFF00` - Éléments contaminés (usage parcimonieux)
- **Rouge foncé** : `#4B0000` - Ombres, sang séché

### 🔤 Typographie

#### Police principale (titres)
- **Type** : Police "stencil" ou industrielle type **Bebas Neue**, **Impact Label**, ou **Stencil Std**
- **Taille** : 18-24pt pour les titres principaux
- **Style** : TOUJOURS EN MAJUSCULES
- **Caractéristiques** : Aspect militaire/industriel, lettres au pochoir

#### Police de corps
- **Type** : Serif classique pour la lisibilité, type **Minion Pro**, **Sabon**, ou **Garamond**
- **Taille** : 10-11pt pour le corps de texte
- **Interligne** : 1.3-1.4 (compact mais lisible)
- **Alignement** : Justifié
- **Caractéristiques** : Contraste avec les titres industriels, évoque les vieux livres trouvés

#### Hiérarchie typographique
```
TITRE PRINCIPAL (24pt, stencil, rouge sur noir)

SOUS-TITRE D'AVERTISSEMENT (16pt, stencil, jaune)

Corps de texte (10pt, serif, blanc cassé)

• Points de liste (avec puce radioactive ☢)
```

### 📐 Mise en page

#### Structure de page
- **Format** : A4 (210 × 297 mm)
- **Marges** :
  - Extérieure : 15mm (économie de papier post-apo)
  - Intérieure : 20mm (reliure de fortune)
  - Haut : 15mm
  - Bas : 20mm
- **Bordures** : Cadre métallique avec rivets

#### Bande latérale caractéristique
- **Largeur** : ~20mm sur le bord extérieur
- **Couleur** : Gris métallique (#3A3A3A) avec texture rouille
- **Contenu** : Avertissements en cyrillique/anglais, symboles de danger
- **Police** : Stencil condensée
- **Effet** : Métal corrodé, taches de rouille, impacts de balles

#### Numérotation
- **Position** : Coin inférieur, dans un cadre d'avertissement
- **Style** : Style tampon militaire, rouge sur fond jaune
- **Format** : "PAGE-XXX" ou "СЕКТОР-XXX"

### 🎭 Éléments graphiques

#### Ornements industriels
- **Symboles de radiation** (☢) : Marqueurs de danger
- **Étoiles soviétiques** (★) : Éléments décoratifs militaires
- **Lignes de séparation** : Barres métalliques avec rivets
- **Tampons** : "CLASSIFIED", "ОПАСНО", "СЕКРЕТНО"

#### Effets visuels
- **Texture grunge** : Saleté, rouille, impacts
- **Aspect "document trouvé"** : Taches, déchirures, brûlures
- **Filtres photographiques** : Sépia/noir et blanc pour les images
- **Effets de glitch** : Distorsions pour évoquer les radiations

### 📋 Structure du contenu

#### Organisation textuelle
1. **Avertissement de sécurité** en rouge/jaune
2. **Titre de section** en stencil majuscules
3. **Instructions de survie** en liste numérotée
4. **Corps de texte** en paragraphes compacts

#### Mise en emphase
- **Rouge** : Dangers immédiats, alertes
- **Jaune** : Avertissements, précautions
- **MAJUSCULES STENCIL** : Ordres, commandements
- **Souligné** : Informations vitales

### 💻 Implémentation Metro2033Theme

```javascript
// Metro2033Theme.js
class Metro2033Theme {
    
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
     * Configuration des polices 
     */
    getFonts() {
        return {
            body: {
                family: 'Minion Pro',
                fallback: ['Sabon', 'Garamond', 'Georgia', 'serif'],
                size: 10,
                lineHeight: 1.35
            },
            titles: {
                family: 'Bebas Neue',
                fallback: ['Impact Label', 'Stencil Std', 'Impact', 'sans-serif'],
                weight: 'bold',
                transform: 'uppercase',
                letterSpacing: 0.15
            },
            sidebar: {
                family: 'Stencil Std',
                fallback: ['Impact', 'Arial Black', 'sans-serif'],
                size: 12,
                letterSpacing: 0.2,
                transform: 'uppercase'
            },
            warnings: {
                family: 'Impact',
                fallback: ['Arial Black', 'sans-serif'],
                size: 14,
                weight: 'bold',
                transform: 'uppercase'
            }
        };
    }
    
    /**
     * Enregistre les polices Metro 2033 dans le document
     */
    registerFonts(doc) {
        const fontsDir = path.join(__dirname, '../../assets/fonts');
        
        try {
            // Minion Pro (corps)
            doc.registerFont('Minion-Regular', path.join(fontsDir, 'MinionPro-Regular.ttf'));
            doc.registerFont('Minion-Bold', path.join(fontsDir, 'MinionPro-Bold.ttf'));
            doc.registerFont('Minion-Italic', path.join(fontsDir, 'MinionPro-Italic.ttf'));
            
            // Bebas Neue (titres)
            doc.registerFont('Bebas-Regular', path.join(fontsDir, 'BebasNeue-Regular.ttf'));
            
            // Stencil (sidebar et tampons)
            doc.registerFont('Stencil-Regular', path.join(fontsDir, 'StencilStd.ttf'));
            
            return true;
        } catch (error) {
            console.warn('⚠️ Erreur chargement polices Metro 2033, utilisation polices système');
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
            showLogo: true, // Logo avec masque à gaz
            logo: 'metro-gasmask.png',
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
```

### Usage dans les documents

```javascript
// GenericDocument avec Metro 2033
const theme = new Metro2033Theme();
const doc = new GenericDocument(theme);

// ClassPlanDocument avec Metro 2033  
const classPlan = new ClassPlanDocument(theme);

// CharacterSheet avec Metro 2033
const characterSheet = new CharacterSheetDocument(theme);
```

### 🎯 Principes de design Metro 2033

1. **Brutalisme soviétique** : Design industriel, fonctionnel, sans fioritures
2. **Survivalisme** : Informations pratiques mises en avant
3. **Aspect "récupéré"** : Documents abîmés, réutilisés, annotés
4. **Hiérarchie militaire** : Structure claire, ordres directs
5. **Économie de moyens** : Peu de couleurs, papier "recyclé"

### ✅ Checklist de conformité Metro2033Theme

Pour qu'un PDF respecte la charte Metro 2033 via Metro2033Theme :

#### Implémentation technique
- [ ] **Metro2033Theme** utilisé dans le document
- [ ] **registerFonts()** appelé pour charger les polices industrielles
- [ ] **getColors()** respecté pour la palette sombre/rouge
- [ ] **getSidebarText()** avec éléments cyrilliques
- [ ] **getWatermarkText()** style militaire/secret

#### Rendu visuel
- [ ] **Police stencil** pour les titres (Bebas Neue ou similaire)
- [ ] **Police serif** classique pour le corps (lisibilité)
- [ ] **Fond noir profond** (#0A0A0A)
- [ ] **Accents rouge soviétique** (#8B0000)
- [ ] **Avertissements jaunes** (#FFD700)
- [ ] **Textures grunge** (rouille, saleté, impacts)
- [ ] **Symboles de danger** (☢, ⚠️, ☣)
- [ ] **Éléments cyrilliques** pour l'authenticité

### 🚫 À éviter

- ❌ Couleurs vives ou joyeuses
- ❌ Polices modernes ou élégantes
- ❌ Design trop propre ou neuf
- ❌ Effets high-tech ou futuristes
- ❌ Décorations florales ou organiques
- ❌ Tons pastels ou doux

Cette charte graphique capture l'essence visuelle de Metro 2033 : un monde post-apocalyptique soviétique où chaque document est un vestige précieux de l'ancien monde, marqué par la survie dans les tunnels du métro moscovite.