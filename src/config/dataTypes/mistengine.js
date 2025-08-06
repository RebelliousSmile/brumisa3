const mistEngineDataTypes = {
  // TRAITS
  traits: {
    // Attributs principaux
    attributs: {
      edge: { 
        nom: 'Edge', 
        type: 'nombre', 
        min: 1, 
        max: 4, 
        description: 'Violence et détermination',
        categorie: 'attribut'
      },
      heart: { 
        nom: 'Heart', 
        type: 'nombre', 
        min: 1, 
        max: 4, 
        description: 'Empathie et passion',
        categorie: 'attribut'
      },
      iron: { 
        nom: 'Iron', 
        type: 'nombre', 
        min: 1, 
        max: 4, 
        description: 'Courage et constitution',
        categorie: 'attribut'
      },
      shadow: { 
        nom: 'Shadow', 
        type: 'nombre', 
        min: 1, 
        max: 4, 
        description: 'Ruse et mystère',
        categorie: 'attribut'
      },
      wits: { 
        nom: 'Wits', 
        type: 'nombre', 
        min: 1, 
        max: 4, 
        description: 'Intellect et perception',
        categorie: 'attribut'
      }
    },

    // Assets (traits qualitatifs avec limite)
    assets: {
      companion: {
        nom: 'Companion',
        type: 'asset',
        categorie: 'asset',
        description: 'Allié fidèle qui vous accompagne',
        limite: 1,
        champs: [
          { code: 'nom', nom: 'Nom', type: 'texte' },
          { code: 'type', nom: 'Type', type: 'texte' },
          { code: 'capacite', nom: 'Capacité spéciale', type: 'texte_long' }
        ]
      },
      path: {
        nom: 'Path',
        type: 'asset',
        categorie: 'asset',
        description: 'Voie de développement personnel',
        limite: 1,
        exemples: ['Swordmaster', 'Mystic', 'Shadow Walker', 'Healer']
      },
      combatTalent: {
        nom: 'Combat Talent',
        type: 'asset',
        categorie: 'asset',
        description: 'Technique de combat spécialisée',
        limite: 1,
        exemples: ['Duelist', 'Archer', 'Berserker', 'Shield Bearer']
      },
      ritual: {
        nom: 'Ritual',
        type: 'asset',
        categorie: 'asset',
        description: 'Pouvoir mystique ou rituel',
        limite: 1,
        exemples: ['Divination', 'Healing Touch', 'Spirit Walk', 'Ward']
      }
    },

    // Debilities (conditions négatives)
    debilities: {
      temporaires: {
        wounded: { nom: 'Wounded', description: 'Blessé physiquement', categorie: 'debility-temp' },
        shaken: { nom: 'Shaken', description: 'Ébranlé mentalement', categorie: 'debility-temp' },
        unprepared: { nom: 'Unprepared', description: 'Pris au dépourvu', categorie: 'debility-temp' },
        encumbered: { nom: 'Encumbered', description: 'Surchargé', categorie: 'debility-temp' }
      },
      permanentes: {
        maimed: { nom: 'Maimed', description: 'Estropié de façon permanente', categorie: 'debility-perm' },
        corrupted: { nom: 'Corrupted', description: 'Corrompu par les ténèbres', categorie: 'debility-perm' },
        tormented: { nom: 'Tormented', description: 'Tourmenté psychologiquement', categorie: 'debility-perm' },
        cursed: { nom: 'Cursed', description: 'Maudit par une force surnaturelle', categorie: 'debility-perm' }
      }
    },

    // Vows (serments)
    vows: {
      type: 'vow',
      categorie: 'vow',
      rangs: [
        { code: 'troublesome', nom: 'Troublesome', difficulte: 1, xp: 1 },
        { code: 'dangerous', nom: 'Dangerous', difficulte: 2, xp: 2 },
        { code: 'formidable', nom: 'Formidable', difficulte: 3, xp: 3 },
        { code: 'extreme', nom: 'Extreme', difficulte: 4, xp: 4 },
        { code: 'epic', nom: 'Epic', difficulte: 5, xp: 5 }
      ],
      statuts: ['Active', 'Progress', 'Fulfilled', 'Forsaken']
    }
  },

  // RÉSERVES
  reserves: {
    health: {
      nom: 'Health',
      min: 0,
      max: 5,
      valeurInitiale: 5,
      description: 'Santé physique',
      recuperation: 'Heal move ou repos prolongé'
    },
    spirit: {
      nom: 'Spirit',
      min: 0,
      max: 5,
      valeurInitiale: 5,
      description: 'Santé mentale et force de volonté',
      recuperation: 'Forge a Bond ou méditation'
    },
    supply: {
      nom: 'Supply',
      min: 0,
      max: 5,
      valeurInitiale: 5,
      description: 'Ressources et équipement',
      usage: 'Consommé pour voyager ou aider'
    },
    momentum: {
      nom: 'Momentum',
      min: -6,
      max: 10,
      valeurInitiale: 2,
      reset: 2,
      description: 'Élan narratif utilisé comme bonus',
      usage: {
        burn: 'Annuler un jet raté en dépensant momentum = action score',
        bonus: 'Ajouter momentum positif aux jets'
      }
    },
    experience: {
      nom: 'Experience',
      min: 0,
      max: null,
      valeurInitiale: 0,
      usage: 'Acheter des assets ou améliorer les attributs',
      couts: {
        asset: 3,
        attribut: 6
      }
    }
  },

  // DESCRIPTIONS
  descriptions: {
    // Identité
    identite: {
      categorie: 'personnage',
      champs: [
        { code: 'nom', nom: 'Nom', type: 'texte' },
        { code: 'epithet', nom: 'Épithète', type: 'texte' },
        { code: 'background', nom: 'Background', type: 'texte_long' },
        { code: 'appearance', nom: 'Apparence', type: 'texte_long' },
        { code: 'goal', nom: 'But principal', type: 'texte' }
      ]
    },

    // Moves (actions narratives)
    moves: {
      categorie: 'moves',
      types: {
        adventure: {
          nom: 'Adventure Moves',
          actions: [
            { code: 'face-danger', nom: 'Face Danger', description: 'Affronter un péril' },
            { code: 'secure-advantage', nom: 'Secure an Advantage', description: 'Préparer ou améliorer sa position' },
            { code: 'gather-info', nom: 'Gather Information', description: 'Chercher des informations' },
            { code: 'heal', nom: 'Heal', description: 'Soigner les blessures' },
            { code: 'resupply', nom: 'Resupply', description: 'Récupérer des ressources' }
          ]
        },
        relationship: {
          nom: 'Relationship Moves',
          actions: [
            { code: 'compel', nom: 'Compel', description: 'Convaincre ou manipuler' },
            { code: 'sojourn', nom: 'Sojourn', description: 'Se reposer dans une communauté' },
            { code: 'draw-circle', nom: 'Draw the Circle', description: 'Défier quelqu\'un' },
            { code: 'forge-bond', nom: 'Forge a Bond', description: 'Créer un lien' }
          ]
        },
        combat: {
          nom: 'Combat Moves',
          actions: [
            { code: 'enter-fray', nom: 'Enter the Fray', description: 'Commencer un combat' },
            { code: 'strike', nom: 'Strike', description: 'Attaquer avec avantage' },
            { code: 'clash', nom: 'Clash', description: 'Échanger des coups' },
            { code: 'turn-tide', nom: 'Turn the Tide', description: 'Renverser la situation' },
            { code: 'end-fight', nom: 'End the Fight', description: 'Terminer le combat' }
          ]
        },
        suffer: {
          nom: 'Suffer Moves',
          actions: [
            { code: 'endure-harm', nom: 'Endure Harm', description: 'Subir des dégâts physiques' },
            { code: 'endure-stress', nom: 'Endure Stress', description: 'Subir du stress mental' },
            { code: 'companion-hit', nom: 'Companion Takes a Hit', description: 'Compagnon blessé' },
            { code: 'sacrifice', nom: 'Sacrifice Resources', description: 'Perdre des ressources' }
          ]
        }
      }
    },

    // Liens et relations
    bonds: {
      categorie: 'social',
      champs: [
        { code: 'nom', nom: 'Nom du lien', type: 'texte' },
        { code: 'type', nom: 'Type', type: 'selection', options: ['Allié', 'Famille', 'Mentor', 'Rival', 'Amour'] },
        { code: 'importance', nom: 'Importance', type: 'selection', options: ['Mineur', 'Significatif', 'Crucial'] },
        { code: 'description', nom: 'Description', type: 'texte_long' }
      ]
    },

    // Progress tracks
    progressTracks: {
      categorie: 'progression',
      types: {
        vow: { nom: 'Vow Progress', taille: 10, description: 'Progression des serments' },
        journey: { nom: 'Journey Progress', taille: 10, description: 'Progression des voyages' },
        combat: { nom: 'Combat Progress', taille: 10, description: 'Progression des combats' },
        bond: { nom: 'Bond Progress', taille: 10, description: 'Progression des relations' }
      }
    },

    // Oracles (tables d'inspiration)
    oracles: {
      categorie: 'oracle',
      tables: {
        action: { nom: 'Action Oracle', description: 'Verbes d\'action pour l\'inspiration' },
        theme: { nom: 'Theme Oracle', description: 'Thèmes et concepts' },
        location: { nom: 'Location Oracle', description: 'Lieux et environnements' },
        character: { nom: 'Character Oracle', description: 'Traits et motivations de PNJ' },
        plot: { nom: 'Plot Twist Oracle', description: 'Rebondissements narratifs' }
      }
    }
  },

  // IMAGES
  images: {
    portrait: {
      categorie: 'personnage',
      ordre: 1,
      obligatoire: false,
      formats: ['jpg', 'png', 'webp'],
      tailleMax: '5MB'
    },
    asset_illustration: {
      categorie: 'asset',
      ordre: 2,
      multiple: true,
      description: 'Illustrations des assets (compagnon, équipement spécial)'
    },
    carte_voyage: {
      categorie: 'exploration',
      ordre: 3,
      description: 'Carte annotée des voyages'
    }
  },

  // CATÉGORIES
  categories: {
    attribut: { nom: 'Attributs', ordre: 1 },
    asset: { nom: 'Assets', ordre: 2 },
    'debility-temp': { nom: 'Conditions Temporaires', ordre: 3 },
    'debility-perm': { nom: 'Conditions Permanentes', ordre: 4 },
    vow: { nom: 'Serments', ordre: 5 },
    personnage: { nom: 'Personnage', ordre: 6 },
    moves: { nom: 'Moves', ordre: 7 },
    social: { nom: 'Liens', ordre: 8 },
    progression: { nom: 'Progression', ordre: 9 },
    oracle: { nom: 'Oracles', ordre: 10 },
    exploration: { nom: 'Exploration', ordre: 11 }
  }
};

module.exports = {
  mistEngineDataTypes
};