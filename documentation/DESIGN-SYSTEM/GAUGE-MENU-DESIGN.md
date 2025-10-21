# Design Gauge Menu Cyberpunk

## Vue d'ensemble

Menu dropdown utilisateur avec une esthetique de **jauge cyberpunk** inspiree des interfaces HUD de Deus Ex, Cyberpunk 2077 et Blade Runner.

## Caracteristiques principales

### 1. Barre pleine largeur
- Le menu s'etend sur toute la largeur de l'ecran
- Design de barre de progression/gauge horizontale
- Fond semi-transparent avec scanlines

### 2. Segments biseautes (45deg)
- Chaque item de menu possede des bords angulaires
- Utilisation de `clip-path` et `transform: skewX(-45deg)` pour les biseaux
- Separation visuelle entre les segments avec des lignes obliques

### 3. Barres de remplissage colorees
- Barre verticale cyan neon de 4px a gauche de chaque item (repos)
- Animation de remplissage au hover : la barre s'etend sur toute la largeur
- Effet de "gauge qui se charge" progressivement
- Item "Deconnexion" avec barre rose pour distinction visuelle

### 4. Effets visuels cyberpunk

#### Scanlines
```css
background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 217, 217, 0.03) 2px,
    rgba(0, 217, 217, 0.03) 4px
);
```

#### Glow effects
- Text-shadow au hover pour effet neon
- Box-shadow sur les barres de remplissage
- Filter drop-shadow sur les icones SVG

#### Animations
- **gauge-fill** : Remplissage progressif de la barre (0.4s)
- **gauge-bar-appear** : Apparition du menu avec scale (0.5s)

## Structure CSS

### Layout
```css
.user-dropdown-list {
    display: flex;
    width: 100%;
    background: rgba(10, 10, 10, 0.95);
    border-bottom: 2px solid var(--cyan-neon);
}

.user-dropdown-item {
    flex: 1;  /* Distribution egale */
}
```

### Barre de gauge
```css
.user-dropdown-item::before {
    /* Barre verticale a gauche */
    width: 4px;
    background: linear-gradient(180deg,
        var(--cyan-neon) 0%,
        rgba(0, 217, 217, 0.3) 100%
    );
    box-shadow: 0 0 10px var(--cyan-neon);
}

.user-dropdown-item:hover::before {
    /* Remplissage complet */
    width: 100%;
    opacity: 0.15;
}
```

### Biseaux 45deg
```css
.user-dropdown-item::after {
    /* Ligne oblique a droite */
    transform: skewX(-45deg);
    background: linear-gradient(135deg, ...);
}

.user-dropdown-link {
    /* Coin biseaute en haut a droite */
    clip-path: polygon(
        0 0,
        calc(100% - 10px) 0,
        100% 10px,
        100% 100%,
        0 100%
    );
}
```

## Responsive Design

### Desktop (>768px)
- Barre horizontale pleine largeur
- Items repartis equitablement avec `flex: 1`
- Barres verticales qui se remplissent horizontalement

### Mobile (<=768px)
- Barre verticale
- Items en colonne
- Barres horizontales en haut qui se remplissent verticalement
```css
.user-dropdown-item::before {
    width: 100%;
    height: 3px;  /* Horizontal bar */
}

.user-dropdown-item:hover::before {
    height: 100%;  /* Fill down */
}
```

## Etats et interactions

### Repos
- Barre cyan de 4px a gauche
- Texte gris clair
- Icone grise

### Hover
- Barre se remplit sur toute la largeur (animation 0.4s)
- Texte devient cyan avec glow
- Icone cyan avec drop-shadow
- Background semi-transparent cyan

### Focus (accessibilite)
- Outline visible pour navigation clavier
- Gestion Escape pour fermer
- ARIA attributes (aria-expanded, aria-haspopup)

## Variations de couleur

### Items standard
- Barre : Cyan neon (#00d9d9)
- Hover : Cyan avec glow

### Item Deconnexion
- Barre : Rose neon (#ff006e)
- Hover : Rose avec glow
- Distinction visuelle claire

## Performance

- Transitions CSS uniquement (pas de JS pour animations)
- Transform et opacity pour performances GPU
- Backdrop-filter pour blur (moderne)
- Clip-path pour biseaux (pas d'images)

## Accessibilite

- Navigation clavier complete
- Screen reader friendly (ARIA labels)
- Focus indicators visibles
- Contraste WCAG AA respecte
- Touch targets 48px minimum (mobile)

## Fichier de reference

`documentation/DESIGN-SYSTEM/wireframe-otherscape-authentique.html`
- Lignes 246-459 : CSS du menu gauge
- Lignes 1271-1325 : HTML structure
- Lignes 1650-1691 : JavaScript interactions

## Inspiration visuelle

- **Deus Ex Human Revolution** : Barres segmentees dorees
- **Cyberpunk 2077** : HUD avec jauges de vie/stamina
- **Blade Runner** : Interfaces holographiques
- **Tron Legacy** : Lignes lumineuses et segments

## Notes d'implementation

1. Le menu utilise `max-height` pour l'animation d'ouverture
2. Les pseudo-elements `::before` et `::after` creent les effets visuels
3. Les animations sont declenchees par le hover, pas de JS requis
4. Compatible avec tous les navigateurs modernes (Chrome, Firefox, Safari, Edge)
5. Graceful degradation sur navigateurs anciens (pas de clip-path = bordures droites)
