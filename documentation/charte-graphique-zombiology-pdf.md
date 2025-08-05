# Charte Graphique - Zombiology Theme

## 🏗️ Architecture et responsabilités

Cette charte définit le **ZombiologyTheme** qui sera utilisé par différents types de documents :

- **GenericDocument** : Documents génériques (guides, règles) avec personnalisation visuelle Zombiology
- **ClassPlanDocument** : Plans de classes avec layout spécifique + style Zombiology  
- **CharacterSheetDocument** : Feuilles de personnage avec formulaire + style Zombiology

### Séparation des responsabilités
- **BasePdfKitService** : Structure, marges, pagination, sidebar, watermark
- **ZombiologyTheme** : Polices, couleurs, textes personnalisés selon les spécifications ci-dessous
- **DocumentType** : Layout et organisation du contenu spécifique au type

## 📖 Analyse de l'univers Zombiology

D'après l'univers de survie zombie et le système d100, voici les éléments graphiques caractéristiques à implémenter dans **ZombiologyTheme** :

### 🎨 Palette de couleurs

#### Couleurs principales
- **Noir profond** : `#0F0F0F` - Fond principal, nuit éternelle
- **Rouge sang foncé** : `#7F1D1D` - Couleur primaire (red-900)
- **Rouge foncé** : `#991B1B` - Couleur secondaire (red-800)
- **Blanc cassé** : `#F5F5F5` - Texte principal

#### Couleurs d'accent
- **Rouge vif danger** : `#DC2626` - Alertes, dangers immédiats (red-600)
- **Vert infection** : `#22C55E` - Virus, contamination (green-500)
- **Jaune avertissement** : `#FBB24` - Signalisation (amber-400)
- **Rouge très foncé** : `#450A0A` - Sidebar (red-950)

### 🔤 Typographie

#### Police principale (titres)
- **Type** : Police impact/stencil type **Bebas Neue**, **Impact**, ou **Arial Black**
- **Taille** : 18-22pt pour les titres principaux
- **Style** : TOUJOURS EN MAJUSCULES
- **Caractéristiques** : Aspect urgent, militaire, lettres condensées

#### Police de corps
- **Type** : Serif lisible type **EB Garamond**, **Crimson Text**, ou **Georgia**
- **Taille** : 10pt pour le corps de texte
- **Interligne** : 1.4 (lisibilité en conditions de stress)
- **Alignement** : Justifié
- **Caractéristiques** : Contraste avec les titres d'urgence, évoque les journaux intimes

#### Police technique (sidebar)
- **Type** : Stencil militaire type **Allerta Stencil**, **Impact**, ou **Arial Black**
- **Taille** : 11pt
- **Style** : MAJUSCULES
- **Espacement** : 0.15em
- **Caractéristiques** : Aspect protocole militaire/médical

#### Hiérarchie typographique
```
ALERTE BIOHAZARD (22pt, impact, rouge sur noir)

PROTOCOLE DE SURVIE (16pt, stencil, jaune)

Corps de texte (10pt, serif, blanc cassé)

☣️ Points critiques (avec symbole biohazard)
```

### 📐 Mise en page

#### Structure de page
- **Format** : A4 (210 × 297 mm)
- **Marges** :
  - Extérieure : 15mm (économie de papier)
  - Intérieure : 20mm (reliure de fortune)
  - Haut : 15mm
  - Bas : 20mm
- **Bordures** : Cadre d'urgence avec marqueurs biohazard

#### Bande latérale caractéristique
- **Largeur** : ~20mm sur le bord extérieur
- **Couleur** : Rouge très foncé (#450A0A) avec texture sang
- **Contenu** : Niveau d'infection, protocoles, symboles biohazard
- **Police** : Stencil condensée
- **Effet** : Taches de sang, éclaboussures, griffures

#### Numérotation
- **Position** : Coin inférieur, dans un cadre biohazard
- **Style** : Style médical/laboratoire
- **Format** : "ZONE-XXX" ou "DAY-XXX"

### 🎭 Éléments graphiques

#### Ornements biologiques
- **Symboles biohazard** (☣️) : Marqueurs de contamination
- **Croix médicales** (⚕️) : Éléments de soins
- **Crânes** (☠️) : Zones mortelles
- **Seringues** (💉) : Éléments médicaux
- **Lignes de séparation** : Barbelés, barricades improvisées

#### Tampons et marquages
- "INFECTED", "QUARANTINE", "BIOHAZARD"
- "SURVIVOR PROTOCOL", "EMERGENCY"
- "CONTAMINATION LEVEL X"

#### Effets visuels
- **Texture grunge** : Sang, saleté, décomposition
- **Aspect "journal de survie"** : Pages tachées, déchirées
- **Éclaboussures** : Sang, fluides biologiques
- **Distorsions** : Effet virus/infection sur certains textes

### 📋 Structure du contenu

#### Organisation textuelle
1. **Alerte biohazard** en rouge/vert
2. **Titre de protocole** en stencil majuscules
3. **Instructions de survie** en liste prioritaire
4. **Corps de texte** en paragraphes compacts

#### Mise en emphase
- **Rouge vif** : Dangers mortels, infections
- **Vert toxique** : Contamination, virus
- **Jaune** : Avertissements, précautions
- **MAJUSCULES IMPACT** : Ordres vitaux
- **Encadré biohazard** : Informations critiques

### 💻 Implémentation ZombiologyTheme

```javascript
// ZombiologyTheme.js
class ZombiologyTheme {
    
    /**
     * Couleurs du thème Zombiology
     */
    getColors() {
        return {
            primary: '#7F1D1D',        // Rouge très foncé (red-900)
            background: '#0F0F0F',     // Noir profond
            secondary: '#991B1B',      // Rouge foncé (red-800)
            accent: '#DC2626',         // Rouge vif (red-600)
            danger: '#EF4444',         // Rouge danger (red-500)
            infection: '#22C55E',      // Vert infection (green-500)
            text: '#F5F5F5',          // Blanc cassé
            sidebar: '#450A0A',       // Rouge très foncé sidebar (red-950)
            warning: '#FBBF24',       // Jaune avertissement (amber-400)
            blood: '#991B1B',         // Rouge sang
            biohazard: '#22C55E'      // Vert biohazard
        };
    }
    
    /**
     * Configuration des polices Zombiology
     */
    getFonts() {
        return {
            body: {
                // EB Garamond pour un aspect lisible mais inquiétant
                family: 'EB Garamond',
                fallback: ['Crimson Text', 'Georgia', 'Times', 'serif'],
                size: 10,
                lineHeight: 1.4
            },
            titles: {
                // Bebas Neue pour les titres impactants
                family: 'Bebas Neue',
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
                family: 'Allerta Stencil',
                fallback: ['Impact', 'Arial Black', 'sans-serif'],
                size: 11,
                letterSpacing: 0.15,
                transform: 'uppercase'
            },
            warnings: {
                // Bebas Neue pour les avertissements biologiques
                family: 'Bebas Neue',
                fallback: ['Impact', 'Arial Black', 'sans-serif'],
                size: 13,
                weight: 'normal',
                transform: 'uppercase'
            }
        };
    }
    
    /**
     * Enregistre les polices Zombiology dans le document
     */
    registerFonts(doc) {
        const fontsDir = path.join(__dirname, '../../assets/fonts');
        
        try {
            // EB Garamond (corps)
            doc.registerFont('EBGaramond-Regular', path.join(fontsDir, 'EBGaramond-Regular.ttf'));
            doc.registerFont('EBGaramond-Bold', path.join(fontsDir, 'EBGaramond-Bold.ttf'));
            doc.registerFont('EBGaramond-Italic', path.join(fontsDir, 'EBGaramond-Italic.ttf'));
            
            // Bebas Neue (titres)
            doc.registerFont('Bebas-Regular', path.join(fontsDir, 'BebasNeue-Regular.ttf'));
            
            // Allerta Stencil (sidebar)
            doc.registerFont('Stencil-Regular', path.join(fontsDir, 'AllertaStencil-Regular.ttf'));
            
            return true;
        } catch (error) {
            console.warn('⚠️ Erreur chargement polices Zombiology, utilisation polices système');
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
                borderColor: '#22C55E',
                borderWidth: 2,
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderStyle: 'dashed',
                icon: '☣️',
                titleBg: '#22C55E',
                titleColor: '#000000'
            },
            stress: {
                borderColor: '#DC2626',
                borderWidth: 2,
                backgroundColor: 'rgba(220, 38, 38, 0.15)',
                borderStyle: 'solid',
                icon: '⚡',
                titleBg: '#DC2626',
                titleColor: '#FFFFFF'
            },
            survival: {
                borderColor: '#FBBF24',
                borderWidth: 1,
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                borderStyle: 'solid',
                icon: '🎒',
                titleBg: '#FBBF24',
                titleColor: '#000000'
            },
            danger: {
                borderColor: '#EF4444',
                borderWidth: 3,
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderStyle: 'double',
                icon: '☠️',
                titleBg: '#EF4444',
                titleColor: '#FFFFFF'
            },
            info: {
                borderColor: '#991B1B',
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
            bulletColor: '#DC2626',
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
                { text: 'INFECTED', color: '#22C55E', rotation: -12 },
                { text: 'QUARANTINE', color: '#DC2626', rotation: 8 },
                { text: 'BIOHAZARD', color: '#EF4444', rotation: -8 }
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
```

### Usage dans les documents

```javascript
// GenericDocument avec Zombiology
const theme = new ZombiologyTheme();
const doc = new GenericDocument(theme);

// ClassPlanDocument avec Zombiology  
const classPlan = new ClassPlanDocument(theme);

// CharacterSheet avec Zombiology
const characterSheet = new CharacterSheetDocument(theme);
```

### 🎯 Principes de design Zombiology

1. **Urgence médicale** : Design hospitalier d'urgence, protocoles stricts
2. **Survie désespérée** : Informations vitales, ressources limitées
3. **Aspect "journal de survivant"** : Documents annotés, tachés de sang
4. **Hiérarchie biologique** : Niveaux d'infection, stades de contamination
5. **Économie extrême** : Minimalisme par nécessité, focus sur l'essentiel

### ✅ Checklist de conformité ZombiologyTheme

Pour qu'un PDF respecte la charte Zombiology via ZombiologyTheme :

#### Implémentation technique
- [ ] **ZombiologyTheme** utilisé dans le document
- [ ] **registerFonts()** appelé pour charger les polices survival
- [ ] **getColors()** respecté pour la palette rouge sang/vert toxique
- [ ] **getSidebarText()** avec éléments médicaux/zones
- [ ] **getWatermarkText()** style biohazard/quarantaine

#### Rendu visuel
- [ ] **Police impact** pour les titres (Bebas Neue ou similaire)
- [ ] **Police serif** classique pour le corps (EB Garamond)
- [ ] **Fond noir profond** (#0F0F0F)
- [ ] **Accents rouge sang** (#7F1D1D, #991B1B)
- [ ] **Alertes vert infection** (#22C55E)
- [ ] **Textures biologiques** (sang, décomposition)
- [ ] **Symboles biohazard** (☣️, ☠️, ⚠️)
- [ ] **Marquages médicaux** pour l'authenticité

### 🚫 À éviter

- ❌ Couleurs apaisantes ou naturelles
- ❌ Polices décoratives ou fantaisistes
- ❌ Design trop propre ou clinique
- ❌ Effets high-tech ou cyberpunk
- ❌ Décorations non-fonctionnelles
- ❌ Tons optimistes ou héroïques

Cette charte graphique capture l'essence visuelle de Zombiology : un monde où chaque document est un témoignage de survie, marqué par le sang, la contamination et l'urgence de transmettre des informations vitales avant qu'il ne soit trop tard.