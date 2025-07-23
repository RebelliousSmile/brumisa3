# Charte Graphique PDF - Générateur PDF JDR

## 📄 Distinction Web vs PDF

### 🌐 Site Web = Cohérence
- **Couleur unique** : Bleu brumisa3 (`#3b82f6`) partout
- **Navigation homogène** : Même expérience sur tout le site
- **Différenciation minime** : Seules les bordures/badges changent selon le système

### 📄 PDFs = Immersion thématique
- **Univers complets** : Chaque système a son propre style visuel
- **Liberté créative** : Polices, couleurs, effets spécialisés
- **Immersion totale** : Le PDF doit "respirer" l'univers du jeu

## 🎨 Styles PDF par système de jeu

### 🧛 Monsterhearts - Romance Gothique
**Fichier détaillé** : `charte-graphique-monsterhearts.md` *(à créer)*

```css
/* Style PDF Monsterhearts */
:root {
  --mh-primary: #8b5cf6;      /* Violet gothique */
  --mh-secondary: #a855f7;    /* Violet plus clair */
  --mh-accent: #ec4899;       /* Rose passion */
  --mh-dark: #2d1b3d;         /* Violet très sombre */
  --mh-bg: linear-gradient(135deg, #1e1232 0%, #3a1a5c 50%, #2d1b3d 100%);
}

/* Polices thématiques */
font-family: 'Crimson Text', 'Source Serif 4', serif; /* Élégance gothique */
/* Décorations : cœurs brisés, roses, épines */
/* Ambiance : Romantique sombre, mystérieuse, passionnelle */
```

### ⚙️ Engrenages (Roue du Temps) - Fantasy Épique
**Fichier détaillé** : `charte-graphique-engrenages.md` *(à créer)*

```css
/* Style PDF Engrenages */
:root {
  --eng-primary: #10b981;     /* Vert émeraude */
  --eng-secondary: #059669;   /* Vert plus foncé */
  --eng-accent: #fbbf24;      /* Or antique */
  --eng-dark: #064e3b;        /* Vert très sombre */
  --eng-bg: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%);
}

/* Polices thématiques */
font-family: 'Cinzel', 'Times New Roman', serif; /* Médiéval élégant */
/* Décorations : entrelacs celtiques, roues, serpents */
/* Ambiance : Épique médiéval, noble, mystique */
```

### ☢️ Metro 2033 - Post-Apocalyptique
**Fichier détaillé** : `charte-graphique-metro2033.md` *(à créer)*

```css
/* Style PDF Metro 2033 */
:root {
  --metro-primary: #dc2626;   /* Rouge danger */
  --metro-secondary: #991b1b; /* Rouge plus sombre */
  --metro-accent: #fbbf24;    /* Jaune radioactif */
  --metro-dark: #7f1d1d;      /* Rouge très sombre */
  --metro-bg: linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%);
}

/* Polices thématiques */
font-family: 'Courier New', 'Share Tech Mono', monospace; /* Industriel/tech */
/* Décorations : fissures, radiation, métal rouillé */
/* Ambiance : Brutale, industrielle, dystopique */
/* Effets : glitch, distorsion, usure */
```

### 🌸 Mist Engine - Narratif Poétique
**Fichier détaillé** : `charte-graphique-mistengine.md` *(à créer)*

```css
/* Style PDF Mist Engine */
:root {
  --mist-primary: #ec4899;    /* Rose mystique */
  --mist-secondary: #be185d;  /* Rose plus sombre */
  --mist-accent: #a78bfa;     /* Violet doux */
  --mist-dark: #831843;       /* Rose très sombre */
  --mist-bg: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #f9a8d4 100%);
}

/* Polices thématiques */
font-family: 'Dancing Script', 'Kalam', cursive; /* Poétique, manuscrit */
/* Décorations : nuages, brumes, calligraphies */
/* Ambiance : Douce, onirique, poétique */
/* Effets : flou artistique, aquarelle */
```

### 🌐 PDFs Génériques - Brumisa3 Standard
**Couleur principale** : Bleu brumisa3 (`#3b82f6`)

```css
/* Style PDF Générique */
:root {
  --brumisa-primary: #3b82f6;    /* Bleu brumisa3 */
  --brumisa-secondary: #2563eb;  /* Bleu plus foncé */
  --brumisa-accent: #60a5fa;     /* Bleu plus clair */
  --brumisa-dark: #1e40af;       /* Bleu très sombre */
  --brumisa-bg: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%);
}

/* Polices cohérentes avec le site */
font-family: 'Source Serif 4', serif; /* Corps de texte */
font-family: 'Shackleton', sans-serif; /* Titres */
/* Ambiance : Professionnelle, moderne, accessible */
```

## 📋 Structure type d'un template PDF

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>[Système] - [Type de document]</title>
    <style>
        /* 1. Variables CSS thématiques */
        :root {
            --primary: #system-color;
            --secondary: #system-secondary;
            --accent: #system-accent;
            --dark: #system-dark;
            --bg: linear-gradient(...);
        }
        
        /* 2. Polices thématiques */
        @import url('https://fonts.googleapis.com/css2?family=...');
        
        /* 3. Reset et base */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: var(--system-font);
            background: var(--bg);
            color: var(--text-color);
        }
        
        /* 4. Styles thématiques spécifiques */
        .header { /* Style header thématique */ }
        .content { /* Style contenu */ }
        .footer { /* Style footer */ }
        
        /* 5. Print-specific styles */
        @media print {
            body { background: white !important; }
            .header { -webkit-print-color-adjust: exact; }
        }
    </style>
</head>
<body>
    <div class="document-container">
        <header class="header"><!-- Header thématique --></header>
        <main class="content"><!-- Contenu --></main>
        <footer class="footer"><!-- Footer --></footer>
    </div>
</body>
</html>
```

## ✅ Checklist qualité PDF

### 📖 Lisibilité
- [ ] Contraste suffisant (4.5:1 minimum)
- [ ] Taille de police ≥ 11pt pour le corps de texte
- [ ] Espacement lignes ≥ 1.4

### 🖨️ Impression
- [ ] Marges suffisantes (15mm minimum)
- [ ] Couleurs compatibles impression N&B
- [ ] Styles `@media print` définis

### 🎨 Thématique
- [ ] Palette couleurs respectée
- [ ] Police thématique appropriée
- [ ] Décorations cohérentes avec l'univers
- [ ] Ambiance immersive

### 🔧 Technique
- [ ] Format A4 standard
- [ ] Pas de débordements
- [ ] Images optimisées
- [ ] Footer avec attribution

## 📂 Organisation des fichiers

```
documentation/
├── charte-graphique.md              # Charte web principale (ce fichier)
├── charte-graphique-pdf.md          # Ce fichier
├── charte-graphique-monsterhearts.md # À créer
├── charte-graphique-engrenages.md    # À créer
├── charte-graphique-metro2033.md     # À créer
└── charte-graphique-mistengine.md    # À créer
```

## 🔗 Liens vers les chartes spécifiques

*Note : Ces fichiers sont à créer selon les besoins*

- 🧛 **[Monsterhearts](charte-graphique-monsterhearts.md)** - Romance gothique
- ⚙️ **[Engrenages](charte-graphique-engrenages.md)** - Fantasy épique 
- ☢️ **[Metro 2033](charte-graphique-metro2033.md)** - Post-apocalyptique
- 🌸 **[Mist Engine](charte-graphique-mistengine.md)** - Narratif poétique

## 🎯 Principes d'application

### Pages Web (Cohérence)
- **Fond** : Toujours noir (#000) ou noir charbon (#1e1e1e)
- **Couleur principale** : Bleu brumisa3 (#3b82f6) pour tout
- **Accent système** : Couleur spécifique uniquement pour bordures, badges
- **Texte** : Blanc pour le contraste maximal
- **Cohérence** : Le bleu reste la couleur principale, les accents sont contextuels

### PDFs (Immersion thématique)
- **Liberté totale** : Chaque système peut avoir son propre fond, polices, décorations
- **Immersion** : Le design doit faire "sentir" l'univers du jeu
- **Narration visuelle** : Les éléments graphiques racontent l'histoire du monde
- **Fonctionnalité** : Reste lisible et utilisable en jeu

### Utilisation des couleurs
- **Bleu brumisa3** : Navigation, CTAs principaux, authentification, contenu générique
- **Couleurs système (web)** : Uniquement pour différencier les systèmes (bordures, badges)
- **Couleurs système (PDF)** : Palette complète thématique pour l'immersion
- **Exemples** : 
  - Page d'accueil avec features → bleu
  - Carte Monsterhearts sur le site → bordure violette, boutons bleus
  - PDF Monsterhearts → design gothique complet avec dégradés violets/roses