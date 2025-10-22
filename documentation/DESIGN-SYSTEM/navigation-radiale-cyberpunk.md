# Navigation Radiale - Adaptation Cyberpunk Brumisa3

## Vue d'ensemble

Adaptation de la navigation radiale avec l'esthétique cyberpunk Otherscape : cyan neon, dark backgrounds, gauge effects.

## Design System Cyberpunk

### Palette de Couleurs Adaptée

**Menu Playspaces (Cyan Neon) :**
```css
/* Orbe central */
background: linear-gradient(135deg, #00d9d9 0%, #00a5a5 100%);
box-shadow:
  0 0 20px rgba(0, 217, 217, 0.3),
  0 0 40px rgba(0, 217, 217, 0.1),
  inset 0 0 20px rgba(0, 217, 217, 0.2);

/* Badge notification */
background: #00d9d9;
color: #0a0a0a;
box-shadow: 0 0 10px rgba(0, 217, 217, 0.5);

/* Focus ring */
border: 3px solid var(--cyan-neon);
box-shadow:
  0 0 0 1px #0a0a0a,
  0 0 0 4px rgba(0, 217, 217, 0.5),
  0 0 20px rgba(0, 217, 217, 0.3);

/* Glow hover - Pulse cyberpunk */
box-shadow:
  0 0 30px rgba(0, 217, 217, 0.5),
  0 0 60px rgba(0, 217, 217, 0.3);
animation: cyber-pulse 2s ease-in-out infinite;
```

**Menu Action (Rose Neon pour danger/actions critiques) :**
```css
/* Orbe central */
background: linear-gradient(135deg, #ff006e 0%, #cc0057 100%);
box-shadow:
  0 0 20px rgba(255, 0, 110, 0.3),
  0 0 40px rgba(255, 0, 110, 0.1);

/* Badge contexte */
background: rgba(255, 0, 110, 0.2);
border: 1px solid #ff006e;
color: #ffffff;

/* Focus ring */
border: 3px solid var(--rose-neon);
box-shadow:
  0 0 0 1px #0a0a0a,
  0 0 0 4px rgba(255, 0, 110, 0.5);
```

**Options déployées - Style Gauge Cyberpunk :**
```css
/* Option normale */
background: rgba(26, 26, 26, 0.95);
border: 2px solid rgba(0, 217, 217, 0.3);
color: #e0e0e0;
backdrop-filter: blur(10px);

/* Barre de gauge à gauche (comme le menu user) */
.option::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, var(--cyan-neon) 0%, rgba(0, 217, 217, 0.3) 100%);
  box-shadow: 0 0 8px var(--cyan-neon);
}

/* Option active (playspace actif) */
background: rgba(0, 217, 217, 0.15);
border-color: var(--cyan-neon);
color: #ffffff;
box-shadow:
  0 0 20px rgba(0, 217, 217, 0.2),
  inset 0 0 20px rgba(0, 217, 217, 0.1);

.option.active::before {
  width: 100%;
  opacity: 0.2;
}

/* Option hover - Effet de remplissage */
.option:hover::before {
  width: 100%;
  opacity: 0.15;
  transition: width 0.4s ease;
}

transform: scale(1.05);
border-color: var(--cyan-neon);
text-shadow: 0 0 10px rgba(0, 217, 217, 0.5);
```

### Typographie Cyberpunk

**Orbe Badge :**
```css
font-family: 'Assistant', sans-serif;
font-size: 1rem; /* 10px - plus compact */
font-weight: 800;
text-transform: uppercase;
letter-spacing: 0.1em;
```

**Option Label :**
```css
font-family: 'Assistant', sans-serif;
font-size: 1.3rem; /* 13px */
font-weight: 700;
text-transform: uppercase;
letter-spacing: 0.15em;
line-height: 1.4;
```

**Tooltip Desktop - Style HUD :**
```css
font-size: 1.2rem;
font-weight: 600;
color: #ffffff;
background: rgba(26, 26, 26, 0.98);
border: 1px solid var(--cyan-neon);
border-radius: 0; /* Angles droits cyberpunk */
padding: 0.6rem 1.2rem;
box-shadow:
  0 0 15px rgba(0, 217, 217, 0.3),
  inset 0 0 10px rgba(0, 217, 217, 0.05);
backdrop-filter: blur(10px);
```

### Dimensions & Espacements

**Desktop (>1024px) :**
```css
/* Orbe central */
width: 80px;
height: 80px;
border-radius: 50%;

/* Badge notification */
width: 28px;
height: 28px;
top: -6px;
right: -6px;
border-radius: 50%;

/* Options radiales */
width: 70px;
height: 70px;
border-radius: 0; /* Angles droits cyberpunk */

/* Biseau 45deg (optionnel) */
clip-path: polygon(
  0 0,
  calc(100% - 8px) 0,
  100% 8px,
  100% 100%,
  0 100%
);

/* Rayon déploiement */
radius: 160px;

/* Position depuis bords */
bottom: 40px;
left: 40px; /* ou right: 40px */
```

**Tablet (768-1023px) :**
```css
/* Orbe central */
width: 64px;
height: 64px;

/* Badge notification */
width: 22px;
height: 22px;

/* Options radiales */
width: 60px;
height: 60px;

/* Rayon déploiement */
radius: 120px;

/* Position depuis bords */
bottom: 32px;
left: 32px;
```

**Mobile (<768px) :**
```css
/* Orbe central */
width: 64px;
height: 64px;
bottom: 20px;
left: 50%;
transform: translateX(-50%);

/* Modal cyberpunk */
max-height: 75vh;
border-radius: 0; /* Pas de border radius */
border-top: 2px solid var(--cyan-neon);
background: rgba(10, 10, 10, 0.98);
backdrop-filter: blur(20px);

/* Option liste */
padding: 1.8rem;
border: 1px solid rgba(0, 217, 217, 0.2);
gap: 1.2rem;
```

## Animations Cyberpunk

### 1. Cyber Pulse (Orbe au repos)

```css
@keyframes cyber-pulse {
  0%, 100% {
    box-shadow:
      0 0 20px rgba(0, 217, 217, 0.3),
      0 0 40px rgba(0, 217, 217, 0.1);
    transform: scale(1);
  }
  50% {
    box-shadow:
      0 0 30px rgba(0, 217, 217, 0.5),
      0 0 60px rgba(0, 217, 217, 0.2);
    transform: scale(1.02);
  }
}

.orbe {
  animation: cyber-pulse 3s ease-in-out infinite;
}
```

### 2. Scanline Effect (Background decoratif)

```css
@keyframes scanline {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}

.orbe::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 217, 217, 0.1) 2px,
    rgba(0, 217, 217, 0.1) 4px
  );
  animation: scanline 8s linear infinite;
  pointer-events: none;
  border-radius: 50%;
}
```

### 3. Gauge Fill Animation (Options hover)

```css
@keyframes gauge-fill {
  0% {
    width: 3px;
    opacity: 0.6;
  }
  100% {
    width: 100%;
    opacity: 0.15;
  }
}

.option:hover::before {
  animation: gauge-fill 0.4s ease-out forwards;
}
```

### 4. Déploiement Radial Cyberpunk

```css
/* Conteneur */
.radial-container {
  transition: opacity 400ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Chaque option avec stagger */
.radial-option {
  transition:
    transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 400ms ease;
  transition-delay: calc(var(--index) * 60ms);
}

/* État fermé */
.radial-container.closed .radial-option {
  transform: translate(-50%, -50%) scale(0) rotate(-90deg);
  opacity: 0;
}

/* État ouvert */
.radial-container.open .radial-option {
  transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(1) rotate(0deg);
  opacity: 1;
}
```

### 5. Glitch Effect (Apparition orbe)

```css
@keyframes glitch-appear {
  0% {
    opacity: 0;
    transform: scale(0.8);
    filter: hue-rotate(0deg);
  }
  20% {
    opacity: 0.5;
    transform: scale(1.1);
    filter: hue-rotate(90deg);
  }
  40% {
    opacity: 1;
    transform: scale(0.95);
    filter: hue-rotate(-45deg);
  }
  60% {
    transform: scale(1.05);
    filter: hue-rotate(30deg);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    filter: hue-rotate(0deg);
  }
}

.orbe.mounted {
  animation: glitch-appear 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

## Effets Visuels Supplémentaires

### Grid Background Cyberpunk

```css
.radial-backdrop {
  position: fixed;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(0, 217, 217, 0.03) 1px, transparent 1px),
    linear-gradient(rgba(0, 217, 217, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.radial-container.open ~ .radial-backdrop {
  opacity: 1;
}
```

### Holographic Shimmer

```css
@keyframes holographic {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.option::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    120deg,
    transparent 30%,
    rgba(0, 217, 217, 0.1) 50%,
    transparent 70%
  );
  background-size: 200% 200%;
  animation: holographic 3s ease-in-out infinite;
  pointer-events: none;
}
```

### Data Stream Effect (Badge notification)

```css
@keyframes data-stream {
  0% {
    transform: translateY(-100%) scale(0.5);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.badge {
  animation: data-stream 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

## CSS Variables Cyberpunk

```css
:root {
  /* Couleurs */
  --radial-playspace-primary: #00d9d9;
  --radial-playspace-glow: rgba(0, 217, 217, 0.5);
  --radial-action-primary: #ff006e;
  --radial-action-glow: rgba(255, 0, 110, 0.5);

  --radial-bg-dark: #0a0a0a;
  --radial-bg-card: #1a1a1a;
  --radial-border: rgba(0, 217, 217, 0.3);

  /* Dimensions */
  --radial-orbe-size-desktop: 80px;
  --radial-orbe-size-mobile: 64px;
  --radial-option-size-desktop: 70px;
  --radial-option-size-mobile: 60px;
  --radial-radius-desktop: 160px;
  --radial-radius-mobile: 120px;

  /* Animations */
  --radial-transition-fast: 200ms;
  --radial-transition-normal: 400ms;
  --radial-transition-slow: 600ms;
  --radial-easing-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --radial-easing-smooth: cubic-bezier(0.4, 0, 0.2, 1);

  /* Effects */
  --radial-glow-small: 0 0 10px var(--radial-playspace-glow);
  --radial-glow-medium: 0 0 20px var(--radial-playspace-glow), 0 0 40px rgba(0, 217, 217, 0.2);
  --radial-glow-large: 0 0 30px var(--radial-playspace-glow), 0 0 60px rgba(0, 217, 217, 0.3);

  /* Z-index */
  --radial-z-orbe: 50;
  --radial-z-backdrop: 49;
  --radial-z-options: 51;
  --radial-z-modal: 52;
}
```

## Intégration avec Design System Brumisa3

### Cohérence avec le Menu User Gauge

La navigation radiale doit partager les mêmes principes que le menu utilisateur :

```css
/* Même style de barre de gauge */
.radial-option::before {
  /* Identique au .user-dropdown-item::before */
  width: 3px;
  background: linear-gradient(180deg, var(--cyan-neon) 0%, rgba(0, 217, 217, 0.3) 100%);
  box-shadow: 0 0 8px var(--cyan-neon);
}

/* Même effet hover */
.radial-option:hover::before {
  width: 100%;
  opacity: 0.15;
  animation: gauge-fill 0.4s ease-out forwards;
}
```

### Cohérence Typographique

```css
/* Utiliser Assistant comme partout */
font-family: 'Assistant', sans-serif;
font-weight: 700;
text-transform: uppercase;
letter-spacing: 0.15em;
```

### Cohérence Couleurs

```css
/* Utiliser les mêmes variables */
--cyan-neon: #00d9d9;
--rose-neon: #ff006e;
--noir-profond: #0a0a0a;
--noir-card: #1a1a1a;
--gris-clair: #e0e0e0;
```

## Responsive Cyberpunk

### Desktop - Déploiement Radial Full

```css
@media (min-width: 1024px) {
  .radial-menu {
    --orbe-size: 80px;
    --option-size: 70px;
    --radius: 160px;
    --spread-angle: 120deg;
    --max-visible: 6;
  }

  /* Grid background visible */
  .radial-backdrop {
    display: block;
  }
}
```

### Mobile - Modal Cyberpunk HUD

```css
@media (max-width: 768px) {
  .radial-modal {
    background: rgba(10, 10, 10, 0.98);
    border-top: 2px solid var(--cyan-neon);
    border-radius: 0;
    backdrop-filter: blur(20px);
  }

  /* Scanlines sur modal */
  .radial-modal::before {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 217, 217, 0.03) 2px,
      rgba(0, 217, 217, 0.03) 4px
    );
    pointer-events: none;
  }
}
```

## Prochaines Étapes d'Implémentation

1. **Créer composants Vue** avec le style cyberpunk
2. **Ajouter animations** (gauge-fill, cyber-pulse, glitch)
3. **Tester responsive** (radial desktop, modal mobile)
4. **Intégrer avec stores** Pinia (playspaces, actions)
5. **Tests E2E** avec Playwright

## Notes d'Adaptation

- ✅ Palette violet/orange → cyan/rose
- ✅ Border-radius standard → angles droits cyberpunk
- ✅ Ombres classiques → glow effects neon
- ✅ Animations bouncy → animations cyber (glitch, gauge-fill)
- ✅ Backgrounds solides → backgrounds avec blur + scanlines
- ✅ Typographie standard → Assistant uppercase avec letter-spacing
- ✅ Ajout effets gauge (barre de remplissage)
- ✅ Ajout effets holographiques
- ✅ Grid background cyberpunk

---

**Document créé** : 2025-10-21
**Statut** : Prêt pour implémentation
**Priorité** : Haute (fonctionnalité clé UX)
