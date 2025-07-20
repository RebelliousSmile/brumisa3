# Charte Graphique - PDFs Monsterhearts

## 📖 Analyse de la maquette officielle

D'après l'analyse de la page exemple du livre Monsterhearts, voici les éléments graphiques caractéristiques :

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

### 💻 Implémentation CSS

```css
/* Variables Monsterhearts PDF */
:root {
  --mh-noir: #000000;
  --mh-blanc: #FAFAF8;
  --mh-gris: #333333;
  --mh-largeur-bande: 15mm;
}

/* Police principale */
@import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');

/* Corps de document */
body {
  font-family: 'Crimson Text', 'Georgia', serif;
  font-size: 11pt;
  line-height: 1.45;
  color: var(--mh-noir);
  background: var(--mh-blanc);
  margin: 0;
  padding: 0;
}

/* Page A4 */
.page {
  width: 210mm;
  height: 297mm;
  margin: 0 auto;
  position: relative;
  background: var(--mh-blanc);
  overflow: hidden;
}

/* Bande latérale noire */
.sidebar {
  position: absolute;
  top: 0;
  left: 0; /* ou right: 0 pour pages paires */
  width: var(--mh-largeur-bande);
  height: 100%;
  background: var(--mh-noir);
  color: white;
}

/* Texte vertical dans la bande */
.sidebar-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  position: absolute;
  bottom: 20mm;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Bebas Neue', 'Impact', sans-serif;
  font-size: 14pt;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

/* Numéro de page */
.page-number {
  position: absolute;
  top: 10mm;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Bebas Neue', sans-serif;
  font-size: 24pt;
  font-weight: bold;
}

/* Zone de contenu principal */
.content {
  margin-left: 25mm; /* ou margin-right pour pages paires */
  margin-right: 20mm;
  margin-top: 20mm;
  margin-bottom: 25mm;
  padding-left: 10mm; /* espace après la bande noire */
}

/* Titres */
h1, h2, h3 {
  font-family: 'Crimson Text', serif;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: center;
  font-weight: 600;
  margin: 1.5em 0 1em;
}

h1 { font-size: 16pt; }
h2 { font-size: 14pt; }
h3 { font-size: 12pt; }

/* Paragraphes */
p {
  text-align: justify;
  text-indent: 1.5em;
  margin: 0.8em 0;
  hyphens: auto;
}

p:first-of-type {
  text-indent: 0;
}

/* Introduction en italique */
.intro {
  font-style: italic;
  text-align: justify;
  margin: 1em 0 1.5em;
  text-indent: 0;
}

/* Listes avec étoiles */
ul {
  list-style: none;
  margin: 1em 0;
  padding-left: 2em;
}

ul li {
  position: relative;
  margin: 0.5em 0;
  text-align: justify;
}

ul li:before {
  content: "✱";
  position: absolute;
  left: -1.5em;
  font-size: 1.2em;
}

/* Effet grunge sur la bande */
.sidebar::after {
  content: '';
  position: absolute;
  right: -2px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: url('data:image/svg+xml,...'); /* Pattern déchiré */
  filter: blur(0.5px);
}

/* Media print */
@media print {
  body {
    background: white;
    color: black;
  }
  
  .page {
    page-break-after: always;
    margin: 0;
  }
  
  .sidebar {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
```

### 🎯 Principes de design Monsterhearts

1. **Minimalisme gothique** : Peu d'ornements, contraste fort
2. **Lisibilité avant tout** : Texte clair, espacement généreux
3. **Aspect "zine"** : Imperfections volontaires, côté DIY/punk
4. **Sobriété dramatique** : Le drame vient du contenu, pas du design
5. **Noir et blanc** : Économique à imprimer, fort en caractère

### ✅ Checklist de conformité

Pour qu'un PDF respecte la charte Monsterhearts :

- [ ] **Police serif** classique (Crimson Text ou similaire)
- [ ] **Titres en MAJUSCULES** avec espacement élargi
- [ ] **Bande latérale noire** avec texte vertical
- [ ] **Fond blanc cassé** (#FAFAF8)
- [ ] **Puces étoiles** (✱) pour les listes
- [ ] **Pas de couleurs** autres que noir/blanc
- [ ] **Marges généreuses** pour la lecture
- [ ] **Aspect légèrement "grunge"** sur les bords

### 🚫 À éviter

- ❌ Couleurs vives ou dégradés
- ❌ Polices fantaisie ou décoratives
- ❌ Images ou illustrations (sauf nécessité absolue)
- ❌ Effets 3D ou ombres portées
- ❌ Bordures ornementées
- ❌ Arrière-plans texturés complexes

Cette charte graphique capture l'essence visuelle de Monsterhearts : un design épuré mais percutant, qui laisse le contenu dramatique prendre toute la place.