# Charte Graphique - Monsterhearts Theme

## 🏗️ Architecture et responsabilités

Cette charte définit le **MonsterheartsTheme** qui sera utilisé par différents types de documents :

- **GenericDocument** : Documents génériques (guides, règles) avec personnalisation visuelle Monsterhearts
- **ClassPlanDocument** : Plans de classes avec layout spécifique + style Monsterhearts  
- **CharacterSheetDocument** : Feuilles de personnage avec formulaire + style Monsterhearts

### Séparation des responsabilités
- **BasePdfKitService** : Structure, marges, pagination, sidebar, watermark
- **MonsterheartsTheme** : Polices, couleurs, textes personnalisés selon les spécifications ci-dessous
- **DocumentType** : Layout et organisation du contenu spécifique au type

## 📖 Analyse de la maquette officielle

D'après l'analyse de la page exemple du livre Monsterhearts, voici les éléments graphiques caractéristiques à implémenter dans **MonsterheartsTheme** :

### 🎨 Palette de couleurs

#### Couleurs principales
- **Noir profond** : `#000000` - Fond des marges latérales, texte principal
- **Blanc cassé** : `#FAFAF8` - Fond des pages (légèrement crème)
- **Gris foncé** : `#333333` - Texte secondaire

#### Accent minimaliste
- **Pas de couleurs vives** : Le design est volontairement monochrome
- **Contraste fort** : Noir sur blanc uniquement
- **Sobriété** : L'accent est mis sur le contenu, pas la décoration

### 🔤 Typographie

#### Police principale (corps de texte)
- **Type** : Serif classique, similaire à **Crimson Text** ou **Minion Pro**
- **Taille** : 11-12pt pour le corps de texte
- **Interligne** : 1.4-1.5 (généreux pour la lisibilité)
- **Alignement** : Justifié avec césure
- **Caractéristiques** : Élégante mais lisible, professionnelle

#### Police des titres
- **Type** : Même famille serif mais en **petites capitales** (small caps)
- **Taille** : 14-16pt pour les titres principaux
- **Espacement** : Lettrage élargi (letter-spacing: 0.1em)
- **Style** : TOUJOURS EN MAJUSCULES

#### Hiérarchie typographique
```
TITRE PRINCIPAL (16pt, petites capitales, centré)

SOUS-TITRE (14pt, petites capitales)

Corps de texte (11-12pt, serif, justifié)

• Points de liste (avec puce étoile ✱)
```

### 📐 Mise en page

#### Structure de page
- **Format** : A4 (210 × 297 mm)
- **Marges** :
  - Extérieure : 20mm (plus étroite)
  - Intérieure : 25mm (plus large pour la reliure)
  - Haut : 20mm
  - Bas : 25mm
- **Gouttière** : Espace central pour la reliure

#### Bande latérale caractéristique
- **Largeur** : ~15mm sur le bord extérieur
- **Couleur** : Noir uni (#000000)
- **Contenu** : Texte vertical en blanc (nom du chapitre)
- **Police** : Sans-serif condensée (type Impact ou Bebas Neue)
- **Effet** : Aspect "déchiré" ou "grunge" sur le bord intérieur

#### Numérotation
- **Position** : Dans la bande noire, en haut
- **Style** : Chiffres blancs sur fond noir
- **Taille** : Grande (24-30pt)

### 🎭 Éléments graphiques

#### Ornements
- **Étoiles** (✱) : Utilisées comme puces de liste
- **Lignes de séparation** : Fines, noires, simples
- **Pas de fioritures** : Design épuré, minimaliste

#### Effets visuels
- **Texture grunge** : Bords irréguliers de la bande noire
- **Aspect "photocopié"** : Légères imperfections volontaires
- **Contraste fort** : Noir/blanc franc, pas de gris intermédiaires

### 📋 Structure du contenu

#### Organisation textuelle
1. **Titre de section** en majuscules centrées
2. **Paragraphe d'introduction** en italique
3. **Liste à puces** avec étoiles (✱)
4. **Corps de texte** en paragraphes justifiés

#### Mise en emphase
- **Italique** : Pour les introductions et citations
- **Gras** : Peu utilisé, réservé aux termes clés
- **MAJUSCULES** : Pour les titres uniquement

### 💻 Implémentation MonsterheartsTheme

```javascript
// MonsterheartsTheme.js
class MonsterheartsTheme {
    
    /**
     * Couleurs du thème Monsterhearts
     */
    getColors() {
        return {
            primary: '#000000',        // Noir profond
            background: '#FAFAF8',     // Blanc cassé  
            secondary: '#333333',      // Gris foncé
            accent: '#FFFFFF',         // Blanc pur pour texte sur noir
            sidebar: '#000000',        // Noir pour bande latérale
            text: '#000000'            // Texte principal
        };
    }
    
    /**
     * Configuration des polices 
     */
    getFonts() {
        return {
            body: {
                family: 'Crimson Text',
                fallback: ['Georgia', 'Times-Roman', 'serif'],
                size: 11,
                lineHeight: 1.45
            },
            titles: {
                family: 'Crimson Text',
                fallback: ['Georgia', 'Times-Roman', 'serif'], 
                weight: '600',
                transform: 'uppercase',
                letterSpacing: 0.1
            },
            sidebar: {
                family: 'Bebas Neue',
                fallback: ['Impact', 'Arial Black', 'sans-serif'],
                size: 14,
                letterSpacing: 0.2,
                transform: 'uppercase'
            }
        };
    }
    
    /**
     * Enregistre les polices Monsterhearts dans le document
     */
    registerFonts(doc) {
        const fontsDir = path.join(__dirname, '../../assets/fonts');
        
        try {
            // Crimson Text (corps et titres)
            doc.registerFont('Crimson-Regular', path.join(fontsDir, 'CrimsonText-Regular.ttf'));
            doc.registerFont('Crimson-Bold', path.join(fontsDir, 'CrimsonText-Bold.ttf'));
            doc.registerFont('Crimson-Italic', path.join(fontsDir, 'CrimsonText-Italic.ttf'));
            
            // Bebas Neue (sidebar)
            doc.registerFont('Bebas-Regular', path.join(fontsDir, 'BebasNeue-Regular.ttf'));
            
            return true;
        } catch (error) {
            console.warn('⚠️ Erreur chargement polices Monsterhearts, utilisation polices système');
            return false;
        }
    }
    
    /**
     * Texte à afficher dans la sidebar selon le type de document
     */
    getSidebarText(documentType, data) {
        switch (documentType) {
            case 'generic':
                return data.titre || 'MONSTERHEARTS';
            case 'class-plan':
                return `CLASSE ${data.className || ''}`.trim();
            case 'character-sheet':
                return data.characterName || 'PERSONNAGE';
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
                return `PLAN DE CLASSE - ${data.className || 'MONSTERHEARTS'}`;
            case 'character-sheet':
                return 'FEUILLE DE PERSONNAGE - MONSTERHEARTS';
            default:
                return 'MONSTERHEARTS';
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
            subtitleColor: colors.secondary,
            showLogo: false, // Monsterhearts privilégie la sobriété
            layout: 'minimal' // Pas d'ornements
        };
    }
    
    /**
     * Style des encadrés (citations, conseils, etc.)
     */
    getBoxStyles() {
        return {
            borderColor: '#000000',
            borderWidth: 0.5,
            backgroundColor: 'transparent', // Pas de fond
            titlePosition: 'on-border',     // Titre sur la bordure
            padding: 8
        };
    }
    
    /**
     * Configuration des listes à puces
     */
    getListConfig() {
        return {
            bulletChar: '✱',    // Étoile caractéristique
            bulletSize: 1.2,
            indent: 20
        };
    }
}

module.exports = MonsterheartsTheme;
```

### Usage dans les documents

```javascript
// GenericDocument avec Monsterhearts
const theme = new MonsterheartsTheme();
const doc = new GenericDocument(theme);

// ClassPlanDocument avec Monsterhearts  
const classPlan = new ClassPlanDocument(theme);

// CharacterSheet avec Monsterhearts
const characterSheet = new CharacterSheetDocument(theme);
```

### 🎯 Principes de design Monsterhearts

1. **Minimalisme gothique** : Peu d'ornements, contraste fort
2. **Lisibilité avant tout** : Texte clair, espacement généreux
3. **Aspect "zine"** : Imperfections volontaires, côté DIY/punk
4. **Sobriété dramatique** : Le drame vient du contenu, pas du design
5. **Noir et blanc** : Économique à imprimer, fort en caractère

### ✅ Checklist de conformité MonsterheartsTheme

Pour qu'un PDF respecte la charte Monsterhearts via MonsterheartsTheme :

#### Implémentation technique
- [ ] **MonsterheartsTheme** utilisé dans le document
- [ ] **registerFonts()** appelé pour charger Crimson Text
- [ ] **getColors()** respecté pour la palette noir/blanc
- [ ] **getSidebarText()** personnalisé selon le type de document
- [ ] **getWatermarkText()** adapté au contenu

#### Rendu visuel
- [ ] **Police serif** Crimson Text (ou fallback Georgia)
- [ ] **Titres en MAJUSCULES** avec espacement élargi
- [ ] **Bande latérale noire** avec texte vertical blanc
- [ ] **Fond blanc cassé** (#FAFAF8)
- [ ] **Puces étoiles** (✱) via getListConfig()
- [ ] **Encadrés** avec titre sur bordure via getBoxStyles()
- [ ] **Pas de couleurs** autres que noir/blanc/gris

### 🚫 À éviter

- ❌ Couleurs vives ou dégradés
- ❌ Polices fantaisie ou décoratives
- ❌ Images ou illustrations (sauf nécessité absolue)
- ❌ Effets 3D ou ombres portées
- ❌ Bordures ornementées
- ❌ Arrière-plans texturés complexes

Cette charte graphique capture l'essence visuelle de Monsterhearts : un design épuré mais percutant, qui laisse le contenu dramatique prendre toute la place.