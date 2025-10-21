# Migration Design System - Style Otherscape

## Résumé Exécutif

La charte graphique de Brumisa3 a été adaptée pour adopter un style **cyberpunk minimaliste dystopien** inspiré de la page Otherscape (https://sonofoak.com/pages/otherscape). Cette migration privilégie la **clarté**, la **performance** et l'**immersion** tout en conservant l'identité JDR du projet.

## Changements Majeurs

### 1. Palette de Couleurs

#### AVANT (style gaming/horror)
- Brand violet #7641d3 dominant
- Dégradés violets/roses partout
- Multiple opacités (/10, /20, /50, /80)
- Effets glow et néons

#### APRES (style cyberpunk minimaliste)
- **98% Noir/Blanc** : #121212 (noir profond), #242833 (noir charbon), #ffffff (blanc pur)
- **2% Bleu cyberpunk** : #334fb4 (uniquement hover/focus/CTA primaires)
- **Opacité binaire** : 0% ou 100% uniquement
- **Couleurs système** : Réservées aux badges/bordures contextuelles

### 2. Typographie

#### AVANT
- **Titres** : Shackleton (Adobe Fonts) - Gaming display
- **Corps** : Source Serif 4 (Google Fonts) - Serif élégant
- 2 polices différentes, chargement lourd

#### APRES
- **Tout** : Assistant (Google Fonts) - Sans-serif moderne
- **Poids** : 400 (regular) + 700 (bold) uniquement
- **Titres** : Bold + UPPERCASE (H1/H2)
- **Performance** : 1 seule police, fallback système complet

### 3. Effets et Animations

#### AVANT
- Transitions 200ms ease-in-out
- Box-shadow animés (glow violet)
- Pulse animations
- Effets de glitch
- Border-radius 1rem (arrondi)

#### APRES
- **Transitions** : 0.4s ease (fluide Otherscape)
- **Hover** : translateY(-4px) + scale(1.02) uniquement
- **Ombres** : blur 5px, opacity 0.05 max
- **Border-radius** : 0 (angles droits cyberpunk)
- **ÉVITER** : pulse, glow, glitch, dégradés animés

### 4. Layout et Espacements

#### AVANT
- Breakpoints : 640px / 1024px
- Espaces génériques
- Max-width variable

#### APRES (standard Otherscape)
- **Breakpoint** : 768px (mobile) / 1024px (desktop) / 1580px (large)
- **Max-width** : 120rem (1920px)
- **Espacements** : 36px desktop / 27px mobile
- **Grilles** : gap 8px desktop / 4px mobile

### 5. Composants UI

#### Boutons

**AVANT**
```css
.btn-primary {
  background: linear-gradient(to-r, #7641d3, #9b51e0);
  border-radius: 0.75rem;
  box-shadow: 0 0 20px rgba(118, 65, 211, 0.3);
}
```

**APRES**
```css
.btn-primary {
  background: #334fb4; /* Flat, pas de dégradé */
  border-radius: 0; /* Angles droits */
  border: 1px solid #334fb4;
  transition: all 0.4s ease;
  min-height: 48px; /* Touch-friendly */
}

.btn-primary:hover {
  background: #2a3f95;
  transform: scale(1.02); /* Subtil */
}
```

#### Cartes

**AVANT**
```css
.card {
  background: #1e1e1e;
  border: 1px solid #32373c;
  border-radius: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.card:hover {
  box-shadow: 0 0 30px rgba(118, 65, 211, 0.5); /* Glow */
}
```

**APRES**
```css
.card {
  background: #242833; /* Noir charbon */
  border: 1px solid #3a3f4a; /* Gris subtil */
  border-radius: 0; /* Angles droits */
  box-shadow: none; /* Pas d'ombre par défaut */
}

.card:hover {
  border-color: #334fb4; /* Bleu au hover */
  transform: translateY(-4px); /* Lift Otherscape */
  box-shadow: 0 4px 5px rgba(18, 18, 18, 0.05); /* Ombre minimaliste */
}
```

#### Formulaires

**AVANT**
```css
.input {
  background: #000000;
  border: 2px solid #32373c;
  border-radius: 0.5rem;
  font-family: 'Source Serif 4', serif;
}

.input:focus {
  border-color: #7641d3;
  box-shadow: 0 0 0 3px rgba(118, 65, 211, 0.2); /* Glow */
}
```

**APRES**
```css
.input {
  background: #121212; /* Noir profond */
  border: 1px solid #3a3f4a; /* Bordure fine */
  border-radius: 0; /* Angles droits */
  font-family: 'Assistant', sans-serif;
}

.input:focus {
  border-color: #334fb4; /* Bleu focus */
  box-shadow: none; /* Pas de glow */
}
```

### 6. Accessibilité (WCAG AAA)

#### AVANT (WCAG AA)
- Contraste 4.5:1 minimum
- Touch targets 44x44px

#### APRES (WCAG AAA)
- **Contraste** : 7:1 (texte normal), 4.5:1 (texte large)
- **Touch targets** : 48x48px minimum
- **Focus visible** : Ring 2px bleu cyberpunk
- **Texte** : Blanc pur (#ffffff) sur noir profond (#121212)

### 7. Configuration Technique

#### UnoCSS (recommandé)
```javascript
// uno.config.ts
export default defineConfig({
  theme: {
    colors: {
      'noir-profond': '#121212',
      'noir-charbon': '#242833',
      'bleu-cyberpunk': '#334fb4',
      // ...
    },
    fontFamily: {
      'sans': ['Assistant', '-apple-system', 'sans-serif'],
    },
    spacing: {
      'section-desktop': '36px',
      'section-mobile': '27px',
    },
  },
  shortcuts: {
    'btn-base': 'bg-noir-profond text-blanc-pur border-gris-bordure min-h-[48px]',
    'card-base': 'bg-noir-charbon border-gris-bordure p-8',
  },
})
```

## Différenciation Web vs PDF

### Site Web (minimalisme cyberpunk)
- **Style** : Flat design, angles droits, noir/blanc dominant
- **Couleurs** : 98% noir/blanc + 2% bleu cyberpunk
- **Dégradés** : Aucun
- **Effets** : Hover simple (scale, translateY)
- **Typographie** : Assistant uniquement

### PDFs Thématiques (immersion totale)
- **Style** : Liberté créative par système JDR
- **Couleurs** : Palettes complètes thématiques (Monsterhearts violet/rose, Metro rouge/gris, etc.)
- **Dégradés** : Autorisés pour immersion
- **Effets** : Tous effets thématiques possibles
- **Typographie** : Polices thématiques variées (Crimson Text, Bebas Neue, Dancing Script, etc.)

## Exemples Concrets

### Page d'Accueil

**AVANT**
- Fond noir avec dégradé violet
- Boutons avec glow violet
- Cartes avec bordures violettes arrondies
- Navigation avec hover violet

**APRES**
- Fond noir profond (#121212) flat
- Boutons plats avec hover bleu subtil
- Cartes angles droits, bordures grises (#3a3f4a)
- Navigation hover bleu (#334fb4)

### Badge Système (ex: Monsterhearts)

**AVANT**
```html
<span class="badge bg-purple-500/20 text-purple-400 border-purple-500 rounded-full">
  Monsterhearts
</span>
```

**APRES**
```html
<span class="badge bg-transparent text-[#8b5cf6] border-[#8b5cf6] uppercase font-bold">
  MONSTERHEARTS
</span>
```

### PDF Monsterhearts

**AVANT + APRES (identique)**
- Liberté totale conservée
- Dégradés violets/roses autorisés
- Police Crimson Text gothique
- Décorations cœurs/roses/épines
- Immersion romantique sombre

## Avantages de la Migration

### Performance
- 1 seule police (au lieu de 2) = temps de chargement réduit
- Ombres minimalistes = rendu plus rapide
- Transitions GPU-friendly (transform uniquement)
- Pas d'opacités multiples = moins de calculs

### Accessibilité
- WCAG AAA (contraste 7:1)
- Touch targets 48px (au lieu de 44px)
- Typographie bold plus lisible
- Focus visible amélioré

### Modernité
- Style cyberpunk tendance 2025
- Cohérent avec Tokyo:Otherscape (Mist Engine)
- Minimalisme dystopien immersif
- Design system scalable

### Maintenabilité
- Moins de variantes (0% ou 100% opacité)
- 1 seule police = moins de gestion
- Pas de dégradés = code CSS simple
- Shortcuts UnoCSS réutilisables

## Migration Progressive

### Phase 1 : Fondations (Semaine 1-2)
- [ ] Installer Assistant (Google Fonts)
- [ ] Configurer UnoCSS avec palette cyberpunk
- [ ] Créer shortcuts composants (btn-base, card-base, input-base)
- [ ] Définir variables CSS globales

### Phase 2 : Composants (Semaine 3-4)
- [ ] Migrer boutons (flat design, angles droits)
- [ ] Migrer cartes (hover translateY)
- [ ] Migrer formulaires (bordures fines)
- [ ] Migrer navigation (hover bleu)

### Phase 3 : Pages (Semaine 5-6)
- [ ] Adapter page d'accueil
- [ ] Adapter pages système JDR (badges contextuels)
- [ ] Adapter pages authentification
- [ ] Adapter pages documentation

### Phase 4 : Polish (Semaine 7-8)
- [ ] Tests accessibilité WCAG AAA
- [ ] Tests performance (Lighthouse)
- [ ] Tests responsive (768px breakpoint)
- [ ] Cleanup ancien code (violet brand, dégradés)

## Checklist Validation

### Design
- [ ] Palette noir/blanc dominant respectée
- [ ] Bleu cyberpunk uniquement hover/focus
- [ ] Angles droits partout (border-radius: 0)
- [ ] Ombres minimalistes (blur 5px max)
- [ ] Typographie Assistant uniquement

### Performance
- [ ] Temps chargement polices < 100ms
- [ ] Transitions 0.4s smooth
- [ ] Pas d'animations complexes
- [ ] Lighthouse score > 90

### Accessibilité
- [ ] Contraste 7:1 (WCAG AAA)
- [ ] Touch targets 48x48px
- [ ] Focus visible bleu cyberpunk
- [ ] Navigation clavier complète

### Responsive
- [ ] Breakpoint 768px fonctionnel
- [ ] Espacements 36px/27px respectés
- [ ] Grilles 8px/4px correctes
- [ ] Max-width 120rem appliqué

## Support et Documentation

### Ressources
- **Charte complète** : `documentation/DESIGN-SYSTEM/charte-graphique-web.md`
- **Inspiration** : https://sonofoak.com/pages/otherscape
- **Police** : https://fonts.google.com/specimen/Assistant
- **UnoCSS** : https://unocss.dev/

### Contact
Pour toute question sur la migration, consulter la documentation ou créer une issue GitHub.

---

**Date de migration** : 2025-10-21
**Version** : 2.0 (Cyberpunk Otherscape)
**Statut** : Documentation complète, implémentation à suivre
