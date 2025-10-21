# Guide Visuel - Menu Gauge Cyberpunk

## Vue d'ensemble visuelle

Representation ASCII du menu gauge dans ses differents etats.

## 1. Etat ferme (Menu collapse)

```
┌────────────────────────────────────────────────────────────────────┐
│ BRUMISA3                                    [👤 VALKYRIE ▼]        │
└────────────────────────────────────────────────────────────────────┘
  ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
  Bordure cyan neon
```

## 2. Etat ouvert - Variante Standard (Horizontal Gauge)

```
┌────────────────────────────────────────────────────────────────────┐
│ BRUMISA3                                    [👤 VALKYRIE ▲]        │
├────────────────────────────────────────────────────────────────────┤
│▓░░░░░░░░░░░░░░░│░░░░░░░░░░░░░░│░░░░░░░░░░░░░│░░░░░░░░░░░░│░░░░░░░░│
│▓  👤 Profil    │  🏠 Playspaces│  👥 Personnages│  ⚙️ Parametres│  🚪 Deconnexion│
│▓░░░░░░░░░░░░░░░│░░░░░░░░░░░░░░│░░░░░░░░░░░░░│░░░░░░░░░░░░│░░░░░░░░│
└────────────────────────────────────────────────────────────────────┘
  ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
  Bordure cyan neon avec glow

Legende:
▓ = Barre de gauge verticale (4px, cyan neon avec glow)
│ = Separateur biseaute (45deg skew)
░ = Zone de remplissage au hover
```

## 3. Etat hover - Item actif (Profil)

```
┌────────────────────────────────────────────────────────────────────┐
│ BRUMISA3                                    [👤 VALKYRIE ▲]        │
├────────────────────────────────────────────────────────────────────┤
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│░░░░░░░░░░░░░░│░░░░░░░░░░░░░│░░░░░░░░░░░░│░░░░░░░░│
│▓ 👤 PROFIL    ⟩│  🏠 Playspaces│  👥 Personnages│  ⚙️ Parametres│  🚪 Deconnexion│
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│░░░░░░░░░░░░░░│░░░░░░░░░░░░░│░░░░░░░░░░░░│░░░░░░░░│
└────────────────────────────────────────────────────────────────────┘
  ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

Effets au hover:
- Barre gauge se remplit horizontalement (animation 0.4s)
- Texte devient cyan neon avec glow
- Icone avec drop-shadow cyan
- Background semi-transparent cyan (opacity 0.15)
```

## 4. Variante Advanced - Vertical Gauge avec numeros

```
┌────────────────────────────────────────────────────────────────────┐
│ BRUMISA3                                    [👤 VALKYRIE ▲]        │
├────────────────────────────────────────────────────────────────────┤
│  01    │  02         │  03          │  04         │  05           │
│  ▓     │  ▓          │  ▓           │  ▓          │  ▓            │
│  ▓     │  ▓          │  ▓           │  ▓          │  ▓            │
│  👤    │  🏠         │  👥          │  ⚙️         │  🚪           │
│ Profil │ Playspaces  │ Personnages  │ Parametres  │ Deconnexion   │
│  ░░░   │  ░░░        │  ░░░         │  ░░░        │  ░░░          │
└────────────────────────────────────────────────────────────────────┘
  ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
  Bordure cyan neon triple (3px)

Legende:
01-05 = Numeros de segments
▓ = Barre de gauge horizontale (5px en bas)
░░░ = Zone de remplissage vertical au hover
```

## 5. Hover Advanced - Gauge se remplit

```
┌────────────────────────────────────────────────────────────────────┐
│ BRUMISA3                                    [👤 VALKYRIE ▲]        │
├────────────────────────────────────────────────────────────────────┤
│  01    │  02         │  03          │  04         │  05           │
│  ▓▓▓   │  ▓          │  ▓           │  ▓          │  ▓            │
│  ▓▓▓   │  ▓          │  ▓           │  ▓          │  ▓            │
│  👤⚡  │  🏠         │  👥          │  ⚙️         │  🚪           │
│ PROFIL │ Playspaces  │ Personnages  │ Parametres  │ Deconnexion   │
│  ▓▓▓   │  ░░░        │  ░░░         │  ░░░        │  ░░░          │
└────────────────────────────────────────────────────────────────────┘
  ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

Effets:
- Barre se remplit de BAS en HAUT (height 0% → 100%)
- Numero "01" devient cyan brillant avec glow
- Icone agrandie (scale 1.1) avec drop-shadow
```

## 6. Item Deconnexion (Variante danger)

```
┌────────────────────────────────────────────────────────────────────┐
│  ...   │  04         │  05                                         │
│  ▓     │  ▓          │  ▓ (ROSE NEON)                              │
│  ▓     │  ▓          │  ▓                                          │
│  ⚙️    │  🚪         │  🚪                                         │
│ Param. │ DECONNEXION │ DECONNEXION                                 │
│  ░░░   │  ░░░        │  ░░░                                        │
└────────────────────────────────────────────────────────────────────┘

Specificites:
- Barre gauge ROSE (#ff006e) au lieu de cyan
- Texte rose au lieu de gris
- Hover avec glow rose
```

## 7. Scanlines et effets visuels

```
┌────────────────────────────────────────────────────────────────────┐
│ BRUMISA3                                    [👤 VALKYRIE ▲]        │
├────────────────────────────────────────────────────────────────────┤
│▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
│░▓  👤 Profil   ░│░  🏠 Playspaces░│░  👥 Personnages ░│ ...       │
│▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│
└────────────────────────────────────────────────────────────────────┘

Legende:
▒ = Scanlines horizontales (repeating-linear-gradient)
░ = Zones semi-transparentes
```

## 8. Biseaux 45deg - Detail

```
Item standard:
┌──────────────┐
│              │
│   PROFIL     │
│              │
└──────────────┘

Item avec biseau:
┌──────────────╲
│               ╲
│   PROFIL      ╲
│               ╲
└───────────────╲

Coin superieur droit coupe a 45deg
```

## 9. Animation de remplissage (Timeline)

```
T=0ms (Repos)
│▓░░░░░░░░░░│
│  PROFIL   │
└───────────┘

T=100ms
│▓▓▓░░░░░░░│
│  PROFIL   │
└───────────┘

T=200ms
│▓▓▓▓▓▓░░░░│
│ >PROFIL   │
└───────────┘

T=400ms (Complete)
│▓▓▓▓▓▓▓▓▓▓▓│
│ >PROFIL<  │ (Cyan neon + glow)
└───────────┘
```

## 10. Responsive Mobile

### Desktop (>768px)
```
┌──────────────────────────────────────────────────────┐
│  ▓ Profil  │  ▓ Playspaces  │  ▓ Personnages  │ ... │
└──────────────────────────────────────────────────────┘
Horizontal, items cote a cote
```

### Mobile (<=768px)
```
┌──────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ Barre horizontale en haut
│  👤 Profil   │
├──────────────┤
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│  🏠 Playspaces│
├──────────────┤
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│  👥 Personnages│
├──────────────┤
│  ...         │
└──────────────┘
Vertical, items en colonne
```

## 11. Graduations (Variante Advanced uniquement)

```
┌────────────────────────────────────────────────────────────┐
│  |    |    |    |    |    |    |    |    |    |    |      │ Ticks
│  01   │   02   │   03   │   04   │   05                   │
│  ▓    │   ▓    │   ▓    │   ▓    │   ▓                    │
└────────────────────────────────────────────────────────────┘

Ticks verticaux a 20% intervals (repeating-linear-gradient)
```

## 12. Effet de glow (Cross-section)

```
Vue laterale d'un item:

Sans hover:
  ─────────────  Surface
  ═════════════  Item background
  ▓ ← Barre 4px avec glow faible

Avec hover:
  ─────────────  Surface
  ▓▓▓▓▓▓▓▓▓▓▓▓▓  Barre pleine largeur
  ≈≈≈≈≈≈≈≈≈≈≈≈≈  Glow cyan (box-shadow)
  ═════════════  Item background cyan/15

≈ = Glow diffus (0 0 20px)
```

## 13. Etats complets - Matrice

```
┌──────────┬─────────┬──────────┬────────────┬───────────┐
│ Etat     │ Barre   │ Texte    │ Background │ Glow      │
├──────────┼─────────┼──────────┼────────────┼───────────┤
│ Repos    │ 4px     │ Gris     │ Noir       │ Faible    │
│ Hover    │ 100%    │ Cyan     │ Cyan/15    │ Fort      │
│ Focus    │ 4px     │ Cyan     │ Noir       │ Moyen     │
│ Active   │ 100%    │ Cyan     │ Cyan/20    │ Tres fort │
│ Disabled │ 2px     │ Gris/50  │ Noir       │ Aucun     │
└──────────┴─────────┴──────────┴────────────┴───────────┘
```

## 14. Palette de couleurs exacte

```
Cyan Neon:
████ #00d9d9 (Primary)
████ #00ffff (Hover)
████ rgba(0, 217, 217, 0.5) (Glow)
████ rgba(0, 217, 217, 0.15) (Background hover)
████ rgba(0, 217, 217, 0.03) (Scanlines)

Rose Neon (Deconnexion):
████ #ff006e (Primary)
████ rgba(255, 0, 110, 0.5) (Glow)
████ rgba(255, 0, 110, 0.15) (Background hover)

Noir:
████ #0a0a0a (Profond)
████ #1a1a1a (Card)
████ rgba(10, 10, 10, 0.98) (Menu background)

Gris:
████ #cccccc (Clair - texte repos)
████ #999999 (Moyen)
```

## 15. Dimensions et espacements

```
Desktop:
├─ Menu height: 8rem (80px)
├─ Item padding: 2rem 2.5rem (20px 25px)
├─ Icon size: 1.6rem (16px)
├─ Font size: 1.2rem (12px)
├─ Barre width repos: 4px
├─ Barre width hover: 100%
└─ Clip-path bevel: 10px

Mobile:
├─ Menu height: 40rem (400px) max
├─ Item padding: 1.5rem 2rem (15px 20px)
├─ Icon size: 1.6rem (16px)
├─ Font size: 1.2rem (12px)
├─ Barre height repos: 3px
└─ Barre height hover: 100%
```

## Conclusion

Ces representations visuelles montrent :
- La structure du menu gauge en ASCII
- Les etats repos, hover, active
- Les deux variantes (Standard et Advanced)
- Le comportement responsive
- Les effets visuels (glow, scanlines, biseaux)
- Les animations de remplissage
- La palette de couleurs complete

Utilisez ces schemas pour :
- Communiquer le design aux developpeurs
- Valider l'implementation
- Documentation technique
- Presentations client
