# Configuration des Systèmes JDR

## Vue d'ensemble

Les systèmes de jeu supportés par brumisater suivent une architecture de données unifiée qui permet de créer des fiches de personnages immersives pour chaque univers de jeu. Chaque système définit ses propres types de données, règles de présentation et style visuel.

## Architecture des Données

### Types de données universels

Les personnages sont définis par quatre types de données :

- **Traits** : Hiérarchiques avec valeurs chiffrées ou non, catégories spécifiques au système, règles liées
- **Réserves** : Valeur minimum, maximum et courante (jauges)
- **Descriptions** : Paragraphes avec markdown, catégories système
- **Images** : Chemin, nom, ordre et légende

### Structure des fichiers de configuration

```
src/config/dataTypes/
├── index.js           # Export centralisé et fonctions utilitaires
├── monsterhearts.js   # Configuration Monsterhearts
├── engrenages.js      # Configuration Engrenages (Roue du Temps)
├── metro2033.js       # Configuration Metro 2033
├── mistengine.js      # Configuration Mist Engine
└── zombiology.js      # Configuration Zombiology
```

### Structure type d'un fichier de configuration

```javascript
const [system]DataTypes = {
  traits: {        // Caractéristiques avec valeurs
    attributs: {},
    competences: {},
    // ...
  },
  reserves: {      // Jauges avec min/max/courante
    sante: {},
    stress: {},
    // ...
  },
  descriptions: {  // Éléments textuels
    identite: {},
    equipement: {},
    // ...
  },
  images: {        // Types d'images supportées
    portrait: {},
    // ...
  },
  categories: {    // Organisation hiérarchique
    // ...
  }
};
```

## Systèmes JDR Supportés

### 🩸 Monsterhearts (Powered by the Apocalypse)

#### Vue d'ensemble
Jeu de rôle gothique romantique sur les monstres adolescents naviguant entre amour, pouvoir et identité (2e édition).

#### Configuration des données
- **Traits** : 4 attributs principaux avec valeurs de -1 à +3
  - Hot : Charisme et séduction
  - Cold : Froideur et contrôle
  - Volatile : Impulsivité et violence
  - Dark : Mystère et manipulation
- **Réserves** : 
  - Harm (0-4) : Niveaux de blessure (Faint, Injured, Wounded, Dying)
  - Experience (0-5) : Points d'expérience gagnés sur échecs et conditions
  - Strings (0-4) : Liens émotionnels entre personnages
  - Darkness : Points de corruption menant à une transformation finale
- **Descriptions** :
  - Skins : 10 archétypes (Vampire, Loup-Garou, Fée, Fantôme, Goule, Hollow, Infernal, Mortel, Reine, Sorcière)
  - Moves basiques : 6 actions principales liées aux attributs
  - Sex Move : Varie selon la Skin sélectionnée
  - Conditions : 5 états émotionnels (Apeuré, Furieux, Honteux, Brisé, Perdu)

#### Mécaniques de jeu
- **Système** : 2d6 + Attribut
- **Concepts clés** : 
  - Skins (archétypes de monstres)
  - Moves (actions spéciales liées aux attributs)
  - Conditions (états émotionnels affectant le roleplay)
  - Strings (influence sur les autres personnages)
  - Harm (blessures physiques et émotionnelles)

#### Configuration de présentation
```javascript
const monsterhearts = {
    system: 'purple-600',      // #8b5cf6
    accent: 'pink-600',        // #ec4899
    heroGradient: 'from-purple-900 via-purple-800 to-pink-900',
    ctaGradient: 'from-gray-900 via-purple-900 to-purple-600',
    image: '/images/monsterhearts-character.png',
    imageFilter: 'gothic-character-filter',
    titre: 'EXPLOREZ VOS DÉSIRS',
    sousTitre: 'DANS LES TÉNÈBRES',
    description: 'Des histoires de romance sombre et de pouvoir surnaturel dans un lycée hanté.'
}
```

#### Style visuel PDF
- **Thème** : Gothique romantique
- **Couleurs** : Rouges profonds, noirs, dorés
- **Éléments** : Cœurs, roses, dentelle
- **Typographie** : Serif élégante

---

### ⚙️ Roue du Temps (Engrenages)

#### Vue d'ensemble
Adaptation de l'univers de la Roue du Temps avec le système Engrenages (3ème édition).

#### Configuration des données
- **Traits** : 3 attributs principaux avec valeurs de 1 à 5
  - Corps : Puissance physique et santé
  - Esprit : Intelligence et logique
  - Âme : Intuition et force spirituelle
- **Réserves** :
  - Santé (0-15) : 4 niveaux (Égratignure, Blessure Légère, Grave, Critique)
  - Équilibre Mental (0-15) : Santé mentale face à l'horreur et au surnaturel
  - Corruption : Conséquences de l'usage de magie noire (mutations, folie)
- **Descriptions** :
  - Spécialisations Science : 9 domaines (Alchimie, Anatomie, Ingénierie, etc.)
  - Spécialisations Magie : 8 écoles (Divination, Évocation, Illusion, etc.)
  - Spécialisations Générales : 8 compétences (Combat, Discrétion, Survie, etc.)
  - Inventions : Processus en 3 étapes (Conception, Fabrication, Test)

#### Mécaniques de jeu
- **Système** : Pool de d10
- **Concepts clés** :
  - Spécialisations Magie/Science/Générales
  - Santé physique et Équilibre Mental
  - Expérience : Gagnée sur succès critique, échec dramatique et roleplay
  - Corruption magique
  - Création d'inventions steampunk

#### Configuration de présentation
```javascript
const engrenages = {
    system: 'emerald-600',     // #10b981
    accent: 'green-600',       // #16a34a
    heroGradient: 'from-emerald-900 via-emerald-800 to-green-900',
    ctaGradient: 'from-gray-900 via-emerald-900 to-emerald-600',
    image: '/images/engrenages-character.png',
    imageFilter: 'fantasy-character-filter',
    titre: 'LA ROUE TISSE',
    sousTitre: 'VOTRE DESTIN',
    description: 'Aventures épiques dans l\'univers de la Roue du Temps avec magie et politique.'
}
```

#### Style visuel PDF
- **Thème** : Steampunk victorien
- **Couleurs** : Cuivres, bronzes, sépias
- **Éléments** : Engrenages, vapeur, machinerie
- **Typographie** : Sans-serif industrielle

---

### ☢️ Metro 2033

#### Vue d'ensemble
JDR post-apocalyptique basé sur l'univers de Dmitry Glukhovsky, dans les tunnels du métro de Moscou après une guerre nucléaire (Official RPG).

#### Configuration des données
- **Traits** : 4 attributs principaux avec valeurs de 3 à 18
  - Might : Force physique et constitution
  - Agility : Dextérité et réflexes
  - Wits : Intelligence et perception
  - Empathy : Charisme et intuition sociale
- **Réserves** :
  - Radiation : Niveau d'exposition (maladie, mutation, mort)
  - Moralité : Santé mentale et karma (impacte les choix narratifs)
  - Munitions : Monnaie d'échange du métro
  - Filtres : Durée limitée pour les masques à gaz
- **Descriptions** :
  - Factions : 10 groupes (Hansa, Red Line, Fourth Reich, Polis, Rangers, etc.)
  - Compétences : 12 skills (Athletics, Firearms, Stealth, Survival, etc.)
  - Mutants : 5 types principaux (Nosalis, Demons, Watchers, Lurkers)
  - Équipement : Sujet à dégradation, réparable avec Crafting

#### Mécaniques de jeu
- **Système** : d20 + Attribut
- **Concepts clés** :
  - Factions du métro et alliances
  - Radiation et mutations
  - Moralité et karma (fins multiples)
  - Équipement dégradable
  - Survie en environnement hostile

#### Configuration de présentation
```javascript
const metro2033 = {
    system: 'red-600',         // #dc2626
    accent: 'orange-600',      // #ea580c
    heroGradient: 'from-gray-900 via-red-900 to-red-600',
    ctaGradient: 'from-gray-900 via-red-900 to-red-600',
    image: '/images/metro-character.png',
    imageFilter: 'post-apo-character-filter',
    titre: 'SURVIVEZ DANS',
    sousTitre: 'LES TUNNELS',
    description: 'Exploration des métros post-apocalyptiques de Moscou avec horreur et survie.'
}
```

#### Style visuel PDF
- **Thème** : Post-apocalyptique sombre
- **Couleurs** : Gris, verts radioactifs, rouilles
- **Éléments** : Masques à gaz, radiation, tunnels
- **Typographie** : Monospace militaire

---

### 🌫️ Mist Engine (Legend in the Mist / Tokyo:Otherscape)

#### Vue d'ensemble
Moteur de jeu narratif et mystique pour des histoires atmosphériques où le brouillard cache des mystères surnaturels (Core System).

#### Configuration des données
- **Traits** : 5 attributs principaux avec valeurs de 1 à 4
  - Edge : Violence et détermination
  - Heart : Empathie et passion
  - Iron : Courage et constitution
  - Shadow : Ruse et mystère
  - Wits : Intellect et perception
- **Réserves** :
  - Momentum (-6 à +10) : Élan narratif utilisé comme bonus aux jets
  - Health/Spirit : Points de vie physique et mentale
- **Descriptions** :
  - Moves : 4 catégories (Adventure, Relationship, Combat, Suffer)
  - Assets : 4 types max 3 (Companion, Path, Combat Talent, Ritual)
  - Debilities : Conditions temporaires et permanentes
  - Vows : 5 rangs de serments (Troublesome à Epic)
  - Oracles : Tables narratives (Action, Theme, Location, Character)

#### Mécaniques de jeu
- **Système** : Narratif avec dés d6
- **Concepts clés** :
  - Assets (avantages temporaires limités à 3)
  - Debilities (handicaps temporaires ou permanents)
  - Momentum (élan narratif de -6 à +10)
  - Vows (serments narratifs donnant de l'XP)
  - Oracles (inspiration narrative aléatoire)

#### Configuration de présentation
```javascript
const mistengine = {
    system: 'pink-500',        // #ec4899
    accent: 'purple-500',      // #8b5cf6
    heroGradient: 'from-pink-900 via-pink-800 to-purple-900',
    ctaGradient: 'from-gray-900 via-pink-900 to-pink-500',
    image: '/images/mist-character.png',
    imageFilter: 'mystical-character-filter',
    titre: 'NAVIGUEZ DANS',
    sousTitre: 'LA BRUME',
    description: 'Histoires oniriques et poétiques où la narration prime sur les mécaniques.'
}
```

#### Style visuel PDF
- **Thème** : Mystique atmosphérique
- **Couleurs** : Bleus profonds, blancs voilés, violets
- **Éléments** : Brouillard, lanternes, symboles ésotériques
- **Typographie** : Serif mystérieuse

---

### ☣️ Zombiology (d100)

#### Vue d'ensemble
JDR de survie zombie avec système d100, où les joueurs incarnent des survivants dans un monde post-apocalyptique face à une épidémie zombie (2e édition).

#### Configuration des données
- **Traits** : 8 caractéristiques principales (10-80)
  - Physiques : Force, Constitution, Dextérité, Rapidité
  - Mentales : Logique, Volonté, Perception, Charisme
  - Traits de caractère : 18 types avec 3 localisations émotionnelles chacun
- **Réserves** :
  - Santé Physique : Base + PP (4-8 points supplémentaires)
  - Santé Mentale : Base + PM (4-8 points + 2 par trait de caractère)
  - Stress : Adrénaline et Panique (usage limité par scène)
  - Infection : Progression en 4 étapes jusqu'à réanimation
- **Descriptions** :
  - Compétences : 3 formations (Sociale, Professionnelle, Loisirs)
  - Catégories : 10 types (Combat, Survie, Bricolage, etc.)
  - Localisations physiques : 4 zones (Tête, Torse, Bras, Jambes)
  - Localisations mentales : 6 émotions (Anxiété, Colère, Culpabilité, etc.)

#### Mécaniques de jeu
- **Système** : d100 sous compétence% + caractéristique%
- **Concepts clés** :
  - Succès critiques sur doubles (11, 22, 33...)
  - Qualité de réussite selon dizaine (0-9)
  - 4 phases de jeu (Aventure, Rôle, Combat, Gestion)
  - Santé localisée (physique et mentale)
  - Stress comme bonus/malus temporaire
  - Infection virale avec test CON% vs Virus%

#### Configuration de présentation
```javascript
const zombiology = {
    system: 'yellow-600',      // #d4af37 (or)
    accent: 'red-600',         // #dc2626
    heroGradient: 'from-gray-900 via-yellow-900 to-red-900',
    ctaGradient: 'from-gray-900 via-yellow-900 to-yellow-600',
    image: '/images/zombie-character.png',
    imageFilter: 'horror-character-filter',
    titre: 'SURVIVEZ À',
    sousTitre: 'L\'APOCALYPSE',
    description: 'Combat pour la survie dans un monde ravagé par l\'infection zombie.'
}
```

#### Style visuel PDF
- **Thème** : Survival horror biologique
- **Couleurs** : Rouges profonds, verts toxiques, noirs
- **Éléments** : Biohazard, zombies, barricades, virus
- **Typographie** : Sans-serif technique/militaire

---

## Utilisation dans le Code

### API de base
```javascript
const { getDataTypesForSystem } = require('./src/config/dataTypes');

// Obtenir la configuration d'un système
const mhData = getDataTypesForSystem('monsterhearts');

// Valider des données de personnage
const { validateCharacterData } = require('./src/config/dataTypes');
const validation = validateCharacterData('zombiology', characterData);
```

### Exemples d'utilisation

#### Créer un personnage Monsterhearts
```javascript
const { monsterheartsDataTypes } = require('./src/config/dataTypes');

const personnage = {
  traits: {
    // Attributs
    hot: 2,
    cold: -1,
    volatile: 1,
    dark: 0,
    // Conditions
    afraid: false,
    angry: true
  },
  reserves: {
    harm: { current: 1, max: 4 },
    experience: { current: 3, max: 5 },
    strings: {
      'Sarah': 2,
      'Marcus': 1
    }
  },
  descriptions: {
    skin: 'vampire',
    nom: 'Lilith',
    look: 'Peau pâle, yeux rouges, style gothique'
  }
};
```

#### Calculer la santé en Zombiology
```javascript
const { zombiologyDataTypes } = require('./src/config/dataTypes');

function calculerSantePhysique(caracteristiques) {
  let pp = 4; // Base
  // +1 par caractéristique physique >= 40%
  ['for', 'con', 'dex', 'rap'].forEach(carac => {
    if (caracteristiques[carac] >= 40) pp++;
  });
  
  return {
    tete: 6 + pp,
    torse: 10 + pp,
    bras: 8 + pp,
    jambes: 8 + pp
  };
}
```

### Validation et règles de calcul

Les types de données supportent plusieurs mécanismes :

1. **Validation automatique** : Min/max pour les valeurs numériques
2. **Relations entre traits** : Attributs liés aux compétences
3. **Calculs dérivés** : Santé basée sur les caractéristiques
4. **Règles conditionnelles** : Bonus selon les traits de caractère

### Étendre un système existant
```javascript
// Ajouter un nouveau move custom à Monsterhearts
const customMove = {
  code: 'blood-bond',
  nom: 'Lien de Sang',
  description: 'Créer un lien vampirique',
  attributLie: 'dark',
  categorie: 'move-skin'
};
```

## Extensions Futures Prévues

### 🗡️ 7ème Mer (2e édition)
- **Statut** : En développement
- **Thème** : Pirates et aventure maritime
- **Attributs** : Might, Grace, Wits, Resolve, Panache

### 🐉 Autres systèmes envisagés
- **L5R** : Samouraïs et honneur japonais
- **Vampire la Mascarade** : Horreur gothique moderne
- **Shadowrun** : Cyberpunk fantastique
- **FATE** : Système générique narratif

## Contribution

### Ajouter un nouveau système
1. Créer le fichier de configuration dans `src/config/dataTypes/[system].js`
2. Définir les 4 types de données (traits, réserves, descriptions, images)
3. Ajouter l'export dans `src/config/dataTypes/index.js`
4. Mettre à jour `systemesJeu.js` avec les infos de base
5. Développer le template PDF thématique
6. Tester avec des personnages d'exemple

### Guidelines design
- Chaque système doit avoir sa propre identité visuelle
- Les couleurs doivent refléter l'ambiance du jeu
- Les templates doivent être optimisés pour l'impression
- L'ergonomie mobile doit être préservée
- Les types de données doivent être exhaustifs et bien documentés