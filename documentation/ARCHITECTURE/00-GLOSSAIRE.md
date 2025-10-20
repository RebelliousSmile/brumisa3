# Glossaire - Terminologie Brumisa3

## Hierarchie Système → Hack → Univers

### Système
**Mist Engine** - Le système de jeu de base qui définit les mécaniques fondamentales communes à tous les jeux dérivés.

- **Définition** : Règles de base, structure des personnages, mécaniques de résolution
- **Unique système** : Mist Engine
- **Caractéristiques** : Tags, Themes, Status, mécaniques 2d6+modificateurs

### Hack
Variante mécanique et thématique du Mist Engine. Chaque hack adapte les règles de base pour un genre spécifique.

#### LITM (Legends in the Mist)
- **Genre** : Fantasy héroïque, contes de fées modernes
- **Mécaniques spécifiques** :
  - Themes : Origin, Adventure, Greatness, Fellowship, Backpack
  - Milestones pour progression
  - Hero Card avec quintessences
- **Univers disponibles** : Zamanora, HOR (Hearts of Ravensdale)

#### Otherscape
- **Genre** : Cyberpunk, réalités alternatives
- **Mécaniques spécifiques** :
  - Themes : Mythos-OS, Noise, Self, Crew-OS, Loadout
  - Système d'Essence
  - Upgrade/Decay au lieu d'Attention
- **Univers disponibles** : Tokyo:Otherscape, Cairo:2001

#### City of Mist
- **Genre** : Noir urbain, mythologie moderne
- **Mécaniques spécifiques** :
  - Themes : Mythos, Logos, Mist, Bastion
  - Balance Mythos/Logos
  - Système d'Attention classique
- **Univers disponibles** : The City (défaut), variantes custom

### Univers
Setting narratif spécifique dans lequel se déroule une campagne. Chaque univers appartient à un hack particulier.

#### Univers LITM
- **Zamanora** : Royaume fantastique classique, forêts enchantées
- **HOR (Hearts of Ravensdale)** : Académie de magie, intrigues adolescentes

#### Univers Otherscape
- **Tokyo:Otherscape** : Mégalopole cyberpunk, corporations, hackers
- **Cairo:2001** : Égypte alternative, technologie ancienne, mystères

#### Univers City of Mist
- **The City** : Métropole anonyme où mythes et réalité se mélangent

### Playspace
Instance de jeu créée par un utilisateur, combinant un hack et un univers spécifiques.

- **Définition** : Contexte unique de travail pour une campagne
- **Composition** : 1 Hack + 1 Univers + personnalisations utilisateur
- **Exemple** : "Ma campagne LITM à Zamanora"

## Relations et Héritages

```
Mist Engine (Système)
    ├── LITM (Hack)
    │   ├── Zamanora (Univers)
    │   └── HOR (Univers)
    ├── Otherscape (Hack)
    │   ├── Tokyo:Otherscape (Univers)
    │   └── Cairo:2001 (Univers)
    └── City of Mist (Hack)
        └── The City (Univers)
```

## Clarifications Importantes

### Ce que LITM N'est PAS
- ❌ LITM n'est **PAS** un système séparé
- ❌ LITM n'est **PAS** au même niveau que Mist Engine
- ✅ LITM **EST** un hack du Mist Engine

### Héritage des Règles
1. **Mist Engine** définit les règles de base (jets 2d6, tags, themes)
2. **Hack** modifie/étend ces règles (types de themes, progression)
3. **Univers** ajoute le contexte narratif sans changer les mécaniques

### Dans le Code

```typescript
interface Playspace {
  id: string;
  name: string;
  systemId: "mist-engine";  // Toujours Mist Engine
  hackId: "litm" | "otherscape" | "city-of-mist";
  universeId: string; // "zamanora", "tokyo-otherscape", etc.
}
```

## Terminologie à Éviter

- ❌ "Système LITM" → ✅ "Hack LITM"
- ❌ "LITM et Mist Engine" (comme systèmes séparés) → ✅ "LITM, hack du Mist Engine"
- ❌ "Systèmes City of Mist, LITM, Otherscape" → ✅ "Hacks City of Mist, LITM, Otherscape du Mist Engine"

## Références dans la Documentation

Ce glossaire fait autorité pour toute la documentation. En cas de doute, référer à ce document.

**Dernière mise à jour** : 2025-01-20
**Maintenu par** : Architecture Team