# Design System - Brumisa3

## Vue d'Ensemble

Le design system de Brumisa3 suit une philosophie **cyberpunk minimaliste dystopien** inspiree de Tokyo:Otherscape, privilegiant la clarte, la performance et l'immersion.

## Fichiers du Design System

### 1. `charte-graphique-web.md` (PRINCIPAL)
Documentation complete du design system avec toutes les specifications techniques.

**Contenu:**
- Vision design et principes directeurs
- Palette de couleurs (noir/blanc dominant, bleu cyberpunk accent)
- Typographie Assistant (Google Fonts)
- Composants UI (boutons, cartes, formulaires)
- Effets et animations minimalistes
- Layout et espacements Otherscape
- Configuration UnoCSS/Tailwind
- Guidelines PDF par systeme JDR

**Quand consulter:**
- Avant de creer un nouveau composant
- Pour verifier les couleurs/espacements/typographie
- Pour comprendre la differentiation web vs PDF

### 2. `MIGRATION-OTHERSCAPE.md` (GUIDE)
Guide detaille pour migrer du style ancien vers le nouveau style cyberpunk.

**Contenu:**
- Comparaison avant/apres detaillee
- Exemples concrets de migration (boutons, cartes, formulaires)
- Checklist validation (design, performance, accessibilite)
- Plan migration progressive 8 semaines
- Support et ressources

**Quand consulter:**
- Lors de la refonte d'un composant existant
- Pour planifier les sprints de migration
- Pour valider qu'un composant respecte le nouveau style

### 3. `wireframe-exemple-otherscape.html` (DEMO)
Wireframe HTML/CSS fonctionnel illustrant le nouveau design system.

**Contenu:**
- Navigation cyberpunk
- Hero section minimaliste
- Cartes systemes JDR avec badges
- Formulaire contact
- Tous les composants en action

**Quand consulter:**
- Pour voir le rendu final du design
- Pour copier/coller des composants
- Pour montrer au client le style Otherscape

## Principes Directeurs

### 1. Minimalisme Radical
- **98% Noir/Blanc** : #121212 (noir profond), #242833 (noir charbon), #ffffff (blanc pur)
- **2% Bleu cyberpunk** : #334fb4 (uniquement hover/focus/CTA primaires)
- **Pas de degrades** sur le site web (reserves aux PDFs thematiques)
- **Opacite binaire** : 0% ou 100% uniquement

### 2. Performance-First
- **1 seule police** : Assistant (400 + 700) avec fallback systeme
- **Ombres minimes** : blur 5px, opacity 0.05 max
- **Transitions rapides** : 0.4s ease (GPU-friendly)
- **Angles droits** : border-radius: 0 (rendu plus rapide)

### 3. Accessibilite WCAG AAA
- **Contraste** : 7:1 (texte normal), 4.5:1 (texte large)
- **Touch targets** : 48x48px minimum
- **Focus visible** : Ring 2px bleu cyberpunk
- **Navigation clavier** : Complete avec skip link

### 4. Mobile-Responsive
- **Breakpoint** : 768px (threshold Otherscape)
- **Espacements** : 36px desktop / 27px mobile
- **Grilles** : gap 8px desktop / 4px mobile
- **Max-width** : 120rem (1920px)

### 5. Coherence Systeme
- **UnoCSS recommande** : Shortcuts reutilisables (btn-base, card-base, input-base)
- **Variables CSS** : Palette unifiee dans :root
- **Composants atomiques** : Reutilisables sur tout le site

## Differentiation Web vs PDF

### Site Web (Minimalisme Cyberpunk)
```
Style       : Flat design, angles droits, noir/blanc dominant
Couleurs    : 98% noir/blanc + 2% bleu cyberpunk
Degrades    : Aucun
Effets      : Hover simple (scale, translateY)
Typographie : Assistant uniquement
Cible       : Performance, accessibilite, modernite
```

### PDFs Thematiques (Immersion Totale)
```
Style       : Liberte creative par systeme JDR
Couleurs    : Palettes completes thematiques
Degrades    : Autorises pour immersion
Effets      : Tous effets thematiques possibles
Typographie : Polices thematiques variees
Cible       : Immersion, narration visuelle, beaute
```

## Palette de Couleurs

### Principales (98% du design)
```css
--noir-profond: #121212;    /* Arriere-plans, boutons */
--noir-charbon: #242833;    /* Cartes, conteneurs */
--blanc-pur: #ffffff;       /* Textes principaux */
--gris-texte: #e5e5e5;      /* Textes secondaires */
--gris-bordure: #3a3f4a;    /* Bordures subtiles */
--gris-hover: #4a5060;      /* Etats hover */
```

### Accent Cyberpunk (2% du design)
```css
--bleu-cyberpunk: #334fb4;  /* Hover, focus, CTA */
--bleu-hover: #2a3f95;      /* Hover sur bleu */
```

### Systemes JDR (contextuelles)
```css
--monsterhearts: #8b5cf6;   /* Violet gothique */
--engrenages: #d97706;      /* Brun ambre */
--metro2033: #dc2626;       /* Rouge post-apo */
--mistengine: #ec4899;      /* Rose mystique */
--zombiology: #d4af37;      /* Or metallique */
```

## Composants Principaux

### Boutons
```html
<!-- Primaire (bleu cyberpunk) -->
<button class="btn-primary">Action Principale</button>

<!-- Secondaire (gris) -->
<button class="btn-secondary">Action Secondaire</button>

<!-- Outline -->
<button class="btn-outline">Action Tertiaire</button>
```

### Cartes
```html
<article class="card">
  <span class="badge badge-monsterhearts">MONSTERHEARTS</span>
  <h3>Titre de la Carte</h3>
  <p>Description de la carte avec texte gris.</p>
  <a href="#" class="btn-secondary">Decouvrir</a>
</article>
```

### Formulaires
```html
<div class="form-group">
  <label for="input-id">Label</label>
  <input type="text" id="input-id" placeholder="Placeholder...">
</div>
```

## Typographie

### Famille
```css
font-family: 'Assistant', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Echelle
```css
H1: clamp(2.5rem, 4vw, 3.5rem) - Bold, UPPERCASE
H2: clamp(2rem, 3vw, 2.75rem) - Bold, UPPERCASE
H3: clamp(1.5rem, 2.5vw, 2rem) - Bold
Corps: clamp(0.9375rem, 2.5vw, 1rem) - Regular
```

## Effets Hover

### Boutons
```css
transform: scale(1.02);
transition: all 0.4s ease;
```

### Cartes
```css
transform: translateY(-4px);
border-color: var(--bleu-cyberpunk);
box-shadow: 0 4px 5px rgba(18, 18, 18, 0.05);
transition: all 0.4s ease;
```

### Liens
```css
color: var(--bleu-cyberpunk);
transition: color 0.4s ease;
```

## Configuration Technique

### UnoCSS (recommande)
```typescript
// uno.config.ts
import { defineConfig, presetWind, presetTypography } from 'unocss'

export default defineConfig({
  presets: [presetWind(), presetTypography()],
  theme: {
    colors: {
      'noir-profond': '#121212',
      'noir-charbon': '#242833',
      'bleu-cyberpunk': '#334fb4',
      // ...
    },
    fontFamily: {
      'sans': ['Assistant', 'sans-serif'],
    },
    spacing: {
      'section-desktop': '36px',
      'section-mobile': '27px',
    },
  },
  shortcuts: {
    'btn-base': 'bg-noir-profond text-blanc-pur min-h-[48px]',
    'card-base': 'bg-noir-charbon border-gris-bordure p-8',
  },
})
```

### Tailwind (alternative)
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'noir-profond': '#121212',
        'bleu-cyberpunk': '#334fb4',
        // ...
      },
      fontFamily: {
        'sans': ['Assistant', 'sans-serif'],
      },
    }
  }
}
```

## Checklist Nouveau Composant

Avant de creer ou modifier un composant, verifier:

### Design
- [ ] Palette noir/blanc dominant respectee
- [ ] Bleu cyberpunk uniquement hover/focus
- [ ] Angles droits partout (border-radius: 0)
- [ ] Ombres minimalistes (blur 5px max)
- [ ] Typographie Assistant uniquement

### Performance
- [ ] Transitions 0.4s smooth
- [ ] Pas d'animations complexes
- [ ] Transform GPU-friendly (scale, translateY)
- [ ] Pas d'opacites intermediaires

### Accessibilite
- [ ] Contraste 7:1 (WCAG AAA)
- [ ] Touch targets 48x48px
- [ ] Focus visible bleu cyberpunk
- [ ] Labels ARIA si necessaire

### Responsive
- [ ] Breakpoint 768px fonctionnel
- [ ] Espacements 36px/27px respectes
- [ ] Grilles gap 8px/4px correctes
- [ ] Typographie fluide avec clamp()

## Ressources

### Documentation
- **Charte complete** : `charte-graphique-web.md`
- **Guide migration** : `MIGRATION-OTHERSCAPE.md`
- **Wireframe demo** : `wireframe-exemple-otherscape.html`

### Inspiration
- **Otherscape** : https://sonofoak.com/pages/otherscape
- **Assistant Font** : https://fonts.google.com/specimen/Assistant
- **UnoCSS** : https://unocss.dev/
- **Tailwind** : https://tailwindcss.com/

### Outils
- **Contrast Checker** : https://webaim.org/resources/contrastchecker/
- **Lighthouse** : Chrome DevTools (performance/accessibilite)
- **Assistant Preview** : Google Fonts specimen page

## Support

Pour toute question sur le design system:
1. Consulter `charte-graphique-web.md` (reference complete)
2. Regarder `wireframe-exemple-otherscape.html` (demo visuelle)
3. Lire `MIGRATION-OTHERSCAPE.md` (guide migration)
4. Creer une issue GitHub si probleme persiste

---

**Version** : 2.0 (Cyberpunk Otherscape)
**Date** : 2025-10-21
**Status** : Documentation complete, implementation en cours
