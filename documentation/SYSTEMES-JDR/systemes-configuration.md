# Configuration des Systèmes JDR

## Vue d'ensemble

Les systèmes de jeu supportés par Brumisater suivent une architecture de données unifiée qui permet de créer des fiches de personnages immersives pour chaque univers de jeu. Chaque système définit ses propres types de données, règles de présentation et style visuel.

**Systèmes supportés** : Mist Engine uniquement (avec ses variantes et univers)

## Architecture des Données

### Types de données universels

Les personnages et documents sont définis par plusieurs types de données :

- **Informations de base** : Nom, concept, description
- **Caractéristiques** : Attributs, compétences, talents
- **Réserves** : Jauges (santé, stress, momentum, etc.) avec valeur min, max et courante
- **Équipement & Ressources** : Objets, argent, véhicules
- **Relations** : Liens avec d'autres personnages ou organisations
- **Métadonnées** : Système, univers, version, auteur

### Structure actuelle (Nuxt 4 + Prisma)

```
Project Root/
├── prisma/
│   └── schema.prisma          # Modèles de données (SystemeJeu, UniversJeu, Document, Oracle)
├── server/
│   └── api/
│       ├── systems/           # API des systèmes
│       └── pdf/               # Génération PDF
├── app/
│   ├── composables/
│   │   └── useSystemes.ts     # Logique métier systèmes
│   └── server/services/
│       └── PdfService.ts      # Génération PDF avec PDFKit
└── shared/
    └── stores/
        └── systemes.ts        # State management Pinia
```

## Systèmes JDR Supportés

### 🌫️ Mist Engine

#### Vue d'ensemble

Le **Mist Engine** est un moteur de jeu narratif créé par Son of Oak Game Studio. Il sert de base à plusieurs univers de jeu, dont **City of Mist**, **Tokyo: Otherscape**, et **Legends in the Mist**.

**Philosophie** : Jeu narratif où la fiction prime sur les mécaniques, avec un accent sur les mystères, les légendes et l'atmosphère.

#### Univers supportés

1. **City of Mist** (2017)
   - Jeu d'investigation urbain où légendes et réalité se mêlent
   - Les personnages sont des Rifts : des humains possédés par des archétypes mythologiques
   - Thèmes : Identité duale, mystères urbains, enquêtes surnaturelles

2. **Tokyo: Otherscape** (2020)
   - Variante de City of Mist dans le Tokyo moderne
   - Fusion de légendes japonaises et de la culture urbaine contemporaine
   - Thèmes : Tradition vs modernité, yokai urbains, cyber-mysticisme

3. **Post-Mortem** (City of Mist hack)
   - Enquêtes surnaturelles dans l'au-delà
   - Les personnages sont morts et enquêtent sur des mystères de l'après-vie
   - Thèmes : Mort, justice posthume, mystères de l'au-delà

4. **Legends in the Mist** (2024)
   - Évolution fantasy du Mist Engine
   - Exploration d'îles mystérieuses et de mondes fantastiques
   - Univers disponibles : **Obojima** (île mystérieuse) et **Zamanora** (monde de magie)

#### Configuration des données

Les personnages Mist Engine utilisent une structure commune avec des variations selon l'univers :

- **Themes** (Thèmes) : 4 cartes maximum
  - Power Tags : Capacités liées au thème légendaire
  - Weakness Tags : Vulnérabilités narratives
  - Mystery (City of Mist) ou Quest (Legends in the Mist)

- **Statuses** : États temporaires (positifs ou négatifs)
  - Tiers 1-6 : Intensité de l'état
  - Burn pour retirer un status

- **Spectrum** (City of Mist / Otherscape) :
  - Mythos ↔ Logos : Équilibre entre nature légendaire et identité humaine
  - Narrative pacing : Risque de Crack (perte de contrôle) ou Fade (perte de pouvoir)

- **Build-Up** : Compteurs narratifs
  - Attention : Visibilité par les autorités
  - Fade : Risque de perdre ses pouvoirs
  - Crack : Risque de perdre son humanité

- **Moves** : Actions narratives du système
  - Investigate, Convince, Change the Game, Face Danger, etc.
  - Jets : 2d6 + Power Tags pertinents

#### Mécaniques de jeu

- **Système** : 2d6 + bonus (Power Tags pertinents)
- **Résolution** :
  - 10+ : Succès complet
  - 7-9 : Succès avec complication
  - 6- : Échec (le MC fait un Move)

- **Concepts clés** :
  - **Tags** : Descripteurs narratifs qui donnent des bonus
  - **Themes** : 4 cartes qui définissent le personnage (2 Mythos, 2 Logos en City of Mist)
  - **Spectrum** : Équilibre entre nature légendaire et identité humaine
  - **Statuses** : États temporaires avec tiers d'intensité
  - **Moves** : Actions possibles dans le jeu

#### Configuration de présentation (Code)

```typescript
// app/composables/useSystemes.ts
const getCouleursPourSysteme = (systemeId: string) => {
  const couleursSystmes = {
    mistengine: {
      primary: '#8b5cf6',      // violet-500
      secondary: '#7c3aed',     // violet-600
      classes: {
        bg: 'bg-violet-500/20',
        border: 'border-violet-500/30',
        text: 'text-violet-400',
        badgeBg: 'bg-violet-500/20',
        badgeBorder: 'border-violet-500/30'
      }
    }
  }
  return couleursSystmes[systemeId] || defaultColors
}
```

#### Style visuel PDF

- **Thème** : Mystique atmosphérique, urbain ou fantasy selon l'univers
- **Couleurs** :
  - City of Mist : Violets profonds, gris urbains
  - Legends in the Mist : Teintes fantastiques, brumes colorées
- **Éléments** : Brouillard, symboles ésotériques, motifs géométriques
- **Typographie** : Sans-serif moderne pour City of Mist, serif mystérieuse pour Legends

---

## Utilisation dans le Code

### API de base

```typescript
// Récupérer tous les systèmes disponibles
const systemes = await $fetch('/api/systems')

// Récupérer un système spécifique avec ses univers
const mistEngine = await $fetch('/api/systems/mistengine')

// Utiliser le composable
const {
  chargerSystemes,
  obtenirSysteme,
  getCouleursPourSysteme
} = useSystemes()

await chargerSystemes()
const couleurs = getCouleursPourSysteme('mistengine')
```

### Exemples d'utilisation

#### Créer un personnage City of Mist

```typescript
const personnage = {
  nom: 'Elena Voss',
  concept: 'Détective hanté par le mythe de Sherlock Holmes',
  themes: [
    {
      type: 'mythos',
      title: 'Détective Légendaire',
      mystery: 'Qui était Sherlock Holmes réellement ?',
      powerTags: ['Déduction Infaillible', 'Réseau d\'Informateurs', 'Maître du Déguisement'],
      weaknessTags: ['Obsédé par l\'Énigme', 'Distant Émotionnellement']
    },
    {
      type: 'logos',
      title: 'Ancienne Profileuse du FBI',
      identity: 'Agent fédéral en congé sabbatique',
      powerTags: ['Formation FBI', 'Arme de Service', 'Contacts Officiels'],
      weaknessTags: ['Paperasse Bureaucratique', 'PTSD des Cas Passés']
    }
  ],
  spectrum: {
    mythos: 2,
    logos: 2
  },
  buildUp: {
    attention: 0,
    fade: 0,
    crack: 0
  }
}
```

#### Générer un PDF

```typescript
// Appel API pour générer le PDF
const result = await $fetch('/api/pdf/generate', {
  method: 'POST',
  body: {
    type: 'CHARACTER',
    systeme: 'mistengine',
    univers: 'city-of-mist',
    donnees: personnage
  }
})

// Télécharger le PDF
window.location.href = result.downloadUrl
```

### Validation et règles de calcul

Les types de données supportent plusieurs mécanismes :

1. **Validation automatique** :
   - Maximum 4 themes par personnage
   - Spectrum entre 0 et 4 pour chaque côté
   - Tags formatés correctement

2. **Calculs dérivés** :
   - Build-Up accumulé selon les actions
   - Risque de Crack/Fade selon le Spectrum

3. **Règles conditionnelles** :
   - Bonus aux jets selon les Power Tags pertinents
   - Malus selon les Weakness Tags invoqués

## Base de Données (Prisma)

### Modèles principaux

```prisma
model SystemeJeu {
  id                String   @id
  nomComplet        String
  description       String?
  actif             Boolean  @default(true)
  couleurPrimaire   String?
  couleurSecondaire String?
  pictogramme       String?
  univers_jeu       UniversJeu[]
}

model UniversJeu {
  id                String      @id
  nomComplet        String
  description       String?
  statut            StatutUnivers @default(ACTIF)
  systemeJeuId      String
  systeme_jeu       SystemeJeu  @relation(fields: [systemeJeuId])
  oracles           Oracle[]
}

model Document {
  id              Int       @id @default(autoincrement())
  titre           String
  type            TypeDocument
  systemeJeu      String
  contenu         Json
  statut          StatutDocument
  utilisateurId   Int?
}
```

### Requêtes courantes

```typescript
// Récupérer tous les systèmes actifs avec leurs univers
const systemes = await prisma.systemeJeu.findMany({
  where: { actif: true },
  include: {
    univers_jeu: {
      where: { statut: 'ACTIF' },
      orderBy: { ordreAffichage: 'asc' }
    }
  }
})

// Récupérer les oracles d'un univers
const oracles = await prisma.oracle.findMany({
  where: {
    universJeu: 'city-of-mist',
    actif: true
  },
  include: { items: true }
})
```

## Extensions Futures

### Intégration complète Legends in the Mist

- **Statut** : En cours
- **Univers** : Obojima, Zamanora
- **Fonctionnalités** :
  - Création de personnage complète
  - Oracles spécifiques aux univers
  - Templates PDF thématiques
  - Gestion des quêtes et progressions

### Autres variantes Mist Engine possibles

- **Streets of Avalon** : Légendes arthuriennes urbaines
- **Nights of Payne Town** : Horreur lovecraftienne urbaine
- Univers custom créés par la communauté

## Contribution

### Ajouter un nouvel univers Mist Engine

1. Ajouter l'univers dans la base de données via Prisma
2. Créer les oracles spécifiques dans `prisma/seeds/`
3. Adapter le template PDF si nécessaire dans `app/server/services/PdfService.ts`
4. Ajouter la configuration visuelle dans `app/composables/useSystemes.ts`
5. Créer les pages spécifiques dans `app/pages/systemes/[slug]/[univers].vue`
6. Tester avec des personnages d'exemple

### Guidelines design

- L'identité visuelle doit rester cohérente avec le Mist Engine
- Les couleurs violettes/mystiques sont la signature visuelle
- Les templates PDF doivent privilégier la lisibilité
- L'ergonomie mobile-first est prioritaire
- La documentation des mécaniques doit être exhaustive

## Références

- [City of Mist Official](https://cityofmist.co/)
- [Son of Oak Game Studio](https://sonofoakgames.com/)
- [Legends in the Mist Kickstarter](https://www.kickstarter.com/projects/sonofoakgames/legends-in-the-mist)
- [Mist Engine SRD](https://sonofoakgames.com/mist-engine-srd)
