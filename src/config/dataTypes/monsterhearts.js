const monsterheartsDataTypes = {
  // TRAITS
  traits: {
    // Attributs principaux
    attributs: {
      hot: { 
        nom: 'Hot', 
        type: 'nombre', 
        min: -1, 
        max: 3, 
        description: 'Charisme et séduction',
        categorie: 'attribut'
      },
      cold: { 
        nom: 'Cold', 
        type: 'nombre', 
        min: -1, 
        max: 3, 
        description: 'Froideur et contrôle',
        categorie: 'attribut'
      },
      volatile: { 
        nom: 'Volatile', 
        type: 'nombre', 
        min: -1, 
        max: 3, 
        description: 'Impulsivité et violence',
        categorie: 'attribut'
      },
      dark: { 
        nom: 'Dark', 
        type: 'nombre', 
        min: -1, 
        max: 3, 
        description: 'Mystère et manipulation',
        categorie: 'attribut'
      }
    },

    // Conditions (traits sans valeur numérique)
    conditions: {
      afraid: { 
        nom: 'Apeuré', 
        type: 'booleen',
        description: 'Vous évitez ce qui vous fait peur',
        categorie: 'condition'
      },
      angry: { 
        nom: 'Furieux', 
        type: 'booleen',
        description: 'Vous réagissez avec violence',
        categorie: 'condition'
      },
      guilty: { 
        nom: 'Honteux', 
        type: 'booleen',
        description: 'Vous vous sentez coupable de vos actions',
        categorie: 'condition'
      },
      hopeless: { 
        nom: 'Brisé', 
        type: 'booleen',
        description: 'Vous ne croyez plus en rien',
        categorie: 'condition'
      },
      lost: { 
        nom: 'Perdu', 
        type: 'booleen',
        description: 'Vous ne savez plus qui vous êtes',
        categorie: 'condition'
      }
    },

    // Moves (traits textuels)
    moves: {
      basic: [
        {
          code: 'turn-on',
          nom: 'Allumer',
          description: 'Utiliser votre charme pour manipuler quelqu\'un',
          attributLie: 'hot',
          categorie: 'move-basic'
        },
        {
          code: 'shut-down',
          nom: 'Rembarrer',
          description: 'Blesser quelqu\'un pour le faire taire',
          attributLie: 'cold',
          categorie: 'move-basic'
        },
        {
          code: 'hold-steady',
          nom: 'Garder son sang-froid',
          description: 'Rester calme face au danger',
          attributLie: 'cold',
          categorie: 'move-basic'
        },
        {
          code: 'lash-out',
          nom: 'Cogner',
          description: 'Attaquer quelqu\'un physiquement',
          attributLie: 'volatile',
          categorie: 'move-basic'
        },
        {
          code: 'run-away',
          nom: 'Fuir',
          description: 'S\'échapper d\'une situation dangereuse',
          attributLie: 'volatile',
          categorie: 'move-basic'
        },
        {
          code: 'gaze-abyss',
          nom: 'Contempler l\'Abysse',
          description: 'Sonder les mystères surnaturels',
          attributLie: 'dark',
          categorie: 'move-basic'
        }
      ],
      skin: [] // Les moves de skin sont spécifiques à chaque archétype
    }
  },

  // RÉSERVES
  reserves: {
    harm: {
      nom: 'Blessures',
      min: 0,
      max: 4,
      valeurInitiale: 0,
      niveaux: [
        { valeur: 0, nom: 'Indemne', description: 'Aucune blessure' },
        { valeur: 1, nom: 'Faint', description: 'Légèrement blessé' },
        { valeur: 2, nom: 'Injured', description: 'Blessé' },
        { valeur: 3, nom: 'Wounded', description: 'Gravement blessé' },
        { valeur: 4, nom: 'Dying', description: 'Mourant' }
      ]
    },
    experience: {
      nom: 'Expérience',
      min: 0,
      max: 5,
      valeurInitiale: 0,
      reinitialisation: true,
      description: 'Points d\'expérience gagnés sur échecs et conditions'
    },
    strings: {
      nom: 'Strings',
      min: 0,
      max: 4,
      valeurInitiale: 0,
      parPersonnage: true,
      description: 'Liens émotionnels et influence sur les autres personnages'
    },
    darkness: {
      nom: 'Ténèbres',
      min: 0,
      max: null, // Pas de limite supérieure
      valeurInitiale: 0,
      description: 'Points de corruption menant à une transformation finale'
    }
  },

  // DESCRIPTIONS
  descriptions: {
    // Skin (archétype)
    skin: {
      categorie: 'identite',
      obligatoire: true,
      unique: true,
      valeurs: [
        { code: 'vampire', nom: 'Le Vampire', description: 'Séducteur assoiffé de sang' },
        { code: 'loup-garou', nom: 'Le Loup-Garou', description: 'Bête sauvage et incontrôlable' },
        { code: 'fee', nom: 'La Fée', description: 'Créature capricieuse et manipulatrice' },
        { code: 'fantome', nom: 'Le Fantôme', description: 'Esprit mort mais pas parti' },
        { code: 'goule', nom: 'La Goule', description: 'Affamé de chair et de désir' },
        { code: 'hollow', nom: 'Le Hollow', description: 'Vide intérieur cherchant à être rempli' },
        { code: 'infernal', nom: 'L\'Infernal', description: 'Lié par un pacte démoniaque' },
        { code: 'mortel', nom: 'Le Mortel', description: 'Fragile humain parmi les monstres' },
        { code: 'reine', nom: 'La Reine', description: 'Souveraine manipulatrice' },
        { code: 'sorciere', nom: 'La Sorcière', description: 'Praticienne de magie noire' }
      ]
    },

    // Informations personnelles
    identite: {
      categorie: 'personnage',
      champs: [
        { code: 'nom', nom: 'Nom', type: 'texte' },
        { code: 'look', nom: 'Look', type: 'texte_long' },
        { code: 'eyes', nom: 'Yeux', type: 'texte' },
        { code: 'origin', nom: 'Origine', type: 'texte_long' }
      ]
    },

    // Sex Move (spécifique à la skin)
    sexMove: {
      categorie: 'move',
      unique: true,
      parSkin: true,
      description: 'Move spécial activé lors de relations intimes'
    },

    // Avancement
    avancement: {
      categorie: 'progression',
      options: [
        'Ajouter +1 à Hot (max +3)',
        'Ajouter +1 à Cold (max +3)',
        'Ajouter +1 à Volatile (max +3)',
        'Ajouter +1 à Dark (max +3)',
        'Prendre un autre Move de votre Skin',
        'Prendre un autre Move de votre Skin',
        'Prendre un Move d\'une autre Skin',
        'Prendre un Move d\'une autre Skin'
      ]
    },

    // Notes et relations
    relations: {
      categorie: 'social',
      champs: [
        { code: 'strings_on_others', nom: 'Strings sur les autres', type: 'liste' },
        { code: 'strings_on_me', nom: 'Strings sur moi', type: 'liste' },
        { code: 'backstory', nom: 'Backstory', type: 'texte_long' }
      ]
    }
  },

  // IMAGES
  images: {
    portrait: {
      categorie: 'personnage',
      ordre: 1,
      obligatoire: false,
      formats: ['jpg', 'png', 'webp'],
      tailleMax: '5MB',
      dimensions: { largeurMax: 1920, hauteurMax: 1920 }
    },
    skin_illustration: {
      categorie: 'skin',
      ordre: 2,
      obligatoire: false,
      parSkin: true,
      description: 'Illustration thématique de l\'archétype'
    }
  },

  // CATÉGORIES
  categories: {
    attribut: { nom: 'Attributs', ordre: 1 },
    condition: { nom: 'Conditions', ordre: 2 },
    'move-basic': { nom: 'Moves Basiques', ordre: 3 },
    'move-skin': { nom: 'Moves de Skin', ordre: 4 },
    identite: { nom: 'Identité', ordre: 5 },
    personnage: { nom: 'Personnage', ordre: 6 },
    social: { nom: 'Relations', ordre: 7 },
    progression: { nom: 'Progression', ordre: 8 }
  }
};

module.exports = {
  monsterheartsDataTypes
};