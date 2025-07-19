const systemesJeu = {
  // Monsterhearts - PbtA Gothic Romance
  monsterhearts: {
    nom: 'Monsterhearts',
    code: 'monsterhearts',
    description: 'JdR gothique romantique sur les monstres adolescents',
    version: '2e édition',
    
    attributs: {
      hot: { nom: 'Hot', min: -1, max: 3, description: 'Charisme et séduction' },
      cold: { nom: 'Cold', min: -1, max: 3, description: 'Froideur et contrôle' },
      volatile: { nom: 'Volatile', min: -1, max: 3, description: 'Impulsivité et violence' },
      dark: { nom: 'Dark', min: -1, max: 3, description: 'Mystère et manipulation' }
    },

    skins: [
      'The Chosen', 'The Fae', 'The Ghost', 'The Hollow', 'The Infernal',
      'The Mortal', 'The Queen', 'The Vampire', 'The Werewolf', 'The Witch'
    ],

    moves: {
      basic: [
        'Turn Someone On', 'Shut Someone Down', 'Hold Steady', 'Lash Out Physically',
        'Run Away', 'Gaze Into The Abyss'
      ],
      sex: ['Sex Move (varies by Skin)']
    },

    mechanics: {
      conditions: ['Afraid', 'Angry', 'Guilty', 'Hopeless', 'Lost'],
      strings: { description: 'Liens émotionnels entre personnages', max: 4 },
      harm: { levels: ['Faint', 'Injured', 'Wounded', 'Dying'], max: 4 },
      experience: { trigger: 'Failing rolls, fulfilling conditions', max: 5 },
      darkness: { description: 'Points de corruption', consequences: 'Transformation finale' }
    },

    themes: {
      couleurPrimaire: '#ec4899', // rose intense
      couleurSecondaire: '#be185d', // rose foncé
      couleurAccent: '#831843', // bordeaux
      police: 'gothic',
      iconographie: ['cœurs', 'roses', 'lune', 'sang', 'miroirs']
    }
  },

  // 7th Sea - Maritime Adventure
  septieme_mer: {
    nom: '7ème Mer',
    code: 'septieme_mer',
    description: 'JdR d\'aventure maritime et de cape et d\'épée',
    version: '2e édition',

    attributs: {
      might: { nom: 'Might', min: 1, max: 5, description: 'Force physique et endurance' },
      grace: { nom: 'Grace', min: 1, max: 5, description: 'Agilité et dextérité' },
      wits: { nom: 'Wits', min: 1, max: 5, description: 'Intelligence et rapidité d\'esprit' },
      resolve: { nom: 'Resolve', min: 1, max: 5, description: 'Volonté et détermination' },
      panache: { nom: 'Panache', min: 1, max: 5, description: 'Charisme et courage' }
    },

    nations: [
      'Avalon', 'Castille', 'Eisen', 'Montaigne', 'Ussura', 'Vodacce',
      'Vestenmennavenjar', 'Sarmatian Commonwealth', 'Crescent Empire'
    ],

    skills: [
      'Aim', 'Athletics', 'Brawl', 'Convince', 'Empathy', 'Hide', 'Intimidate',
      'Notice', 'Perform', 'Ride', 'Sailing', 'Scholarship', 'Tempt', 'Theft', 'Warfare'
    ],

    mechanics: {
      heroPoints: { description: 'Points héroïques pour réussites automatiques', usage: 'Activation avantages, bonus dés' },
      raises: { description: 'Paris sur les jets de dés pour effets supplémentaires' },
      wounds: { levels: ['Dramatic Wound', 'Critical Wound'], consequences: 'Malus cumulatifs' },
      reputation: { types: ['Positive', 'Negative'], impact: 'Modificateur interactions sociales' },
      stories: { description: 'Quêtes personnelles donnant XP', types: ['Personal', 'Romance', 'Adventure'] }
    },

    themes: {
      couleurPrimaire: '#0ea5e9', // bleu océan
      couleurSecondaire: '#0369a1', // bleu marine
      couleurAccent: '#0c4a6e', // bleu profond
      police: 'maritime',
      iconographie: ['ancres', 'voiles', 'boussoles', 'épées', 'cartes']
    }
  },

  // Gears & Sorcery - Steampunk
  engrenages_sortileges: {
    nom: 'Engrenages & Sortilèges',
    code: 'engrenages_sortileges',
    description: 'JdR steampunk mêlant magie et technologie',
    version: 'Ecryme',

    attributs: {
      corps: { nom: 'Corps', min: 1, max: 5, description: 'Puissance physique et santé' },
      esprit: { nom: 'Esprit', min: 1, max: 5, description: 'Intelligence et logique' },
      ame: { nom: 'Âme', min: 1, max: 5, description: 'Intuition et force spirituelle' }
    },

    specialisations: {
      science: [
        'Alchimie', 'Anatomie', 'Ingénierie', 'Électricité', 'Optique',
        'Mécanique', 'Chimie', 'Géologie', 'Astronomie'
      ],
      magie: [
        'Divination', 'Évocation', 'Illusion', 'Invocation', 'Nécromancie',
        'Transmutation', 'Enchantement', 'Conjuration'
      ],
      generale: [
        'Combat', 'Discrétion', 'Équitation', 'Étiquette', 'Langue',
        'Navigation', 'Survie', 'Vol'
      ]
    },

    mechanics: {
      sante: { niveaux: ['Égratignure', 'Blessure Légère', 'Blessure Grave', 'Blessure Critique'], max: 15 },
      equilibreMental: { description: 'Santé mentale face à l\'horreur et au surnaturel', max: 15 },
      experience: { gain: 'Succès critique, échec dramatique, roleplay', usage: 'Amélioration attributs/spécialisations' },
      corruption: { description: 'Utilisation excessive de magie noire', consequences: 'Mutations, folie' },
      invention: { description: 'Création d\'objets steampunk', etapes: ['Conception', 'Fabrication', 'Test'] }
    },

    themes: {
      couleurPrimaire: '#eab308', // or cuivré
      couleurSecondaire: '#a16207', // bronze
      couleurAccent: '#713f12', // cuivre foncé
      police: 'steampunk',
      iconographie: ['engrenages', 'vapeur', 'lunettes', 'pistons', 'rouages']
    }
  },

  // Metro 2033 - Post-Apocalyptic
  metro_2033: {
    nom: 'Metro 2033',
    code: 'metro_2033',
    description: 'JdR post-apocalyptique dans le métro de Moscou',
    version: 'Official RPG',

    attributs: {
      might: { nom: 'Might', min: 3, max: 18, description: 'Force physique et constitution' },
      agility: { nom: 'Agility', min: 3, max: 18, description: 'Dextérité et réflexes' },
      wits: { nom: 'Wits', min: 3, max: 18, description: 'Intelligence et perception' },
      empathy: { nom: 'Empathy', min: 3, max: 18, description: 'Charisme et intuition sociale' }
    },

    factions: [
      'Hansa', 'Red Line', 'Fourth Reich', 'Polis', 'Rangers',
      'Bandits', 'Cultists', 'Independents', 'Sparta', 'Reich'
    ],

    skills: [
      'Athletics', 'Awareness', 'Command', 'Crafting', 'Deception',
      'Firearms', 'Intimidation', 'Medicine', 'Melee', 'Stealth',
      'Survival', 'Technology'
    ],

    mechanics: {
      radiation: { description: 'Exposition aux radiations', effets: 'Maladie, mutation, mort' },
      moralite: { description: 'Santé mentale et karma', impact: 'Choix narratifs, fins multiples' },
      equipement: { degradation: true, reparation: 'Compétence Crafting', munitions: 'Monnaie d\'échange' },
      filters: { description: 'Masques à gaz obligatoires en surface', duree: 'Limitée' },
      mutants: { types: ['Nosalis', 'Demons', 'Watchers', 'Lurkers'], danger: 'Mortel' }
    },

    themes: {
      couleurPrimaire: '#64748b', // gris métallique
      couleurSecondaire: '#334155', // gris sombre
      couleurAccent: '#0f172a', // noir profond
      police: 'dystopian',
      iconographie: ['masques à gaz', 'tunnels', 'radiations', 'rails', 'flammes']
    }
  },

  // Mist Engine - Mystical/Narrative
  mist_engine: {
    nom: 'Mist Engine',
    code: 'mist_engine',
    description: 'Moteur de jeu narratif et mystique (Legend in the Mist / Tokyo:Otherscape)',
    version: 'Core System',

    attributs: {
      edge: { nom: 'Edge', min: 1, max: 4, description: 'Violence et détermination' },
      heart: { nom: 'Heart', min: 1, max: 4, description: 'Empathie et passion' },
      iron: { nom: 'Iron', min: 1, max: 4, description: 'Courage et constitution' },
      shadow: { nom: 'Shadow', min: 1, max: 4, description: 'Ruse et mystère' },
      wits: { nom: 'Wits', min: 1, max: 4, description: 'Intellect et perception' }
    },

    moves: {
      adventure: ['Face Danger', 'Secure an Advantage', 'Gather Information', 'Heal', 'Resupply'],
      relationship: ['Compel', 'Sojourn', 'Draw the Circle', 'Forge a Bond'],
      combat: ['Enter the Fray', 'Strike', 'Clash', 'Turn the Tide', 'End the Fight'],
      suffer: ['Endure Harm', 'Endure Stress', 'Companion Takes a Hit', 'Sacrifice Resources']
    },

    mechanics: {
      momentum: { description: 'Élan narratif', range: '-6 à +10', usage: 'Bonus aux jets' },
      assets: { types: ['Companion', 'Path', 'Combat Talent', 'Ritual'], max: 3 },
      debilities: { 
        conditions: ['Wounded', 'Shaken', 'Unprepared', 'Encumbered'],
        permanent: ['Maimed', 'Corrupted', 'Tormented', 'Cursed']
      },
      vows: { description: 'Serments narratifs donnant XP', ranks: ['Troublesome', 'Dangerous', 'Formidable', 'Extreme', 'Epic'] },
      oracles: { description: 'Tables aléatoires pour inspiration narrative', types: ['Action', 'Theme', 'Location', 'Character'] }
    },

    themes: {
      couleurPrimaire: '#8b5cf6', // violet mystique
      couleurSecondaire: '#6d28d9', // violet profond
      couleurAccent: '#4c1d95', // violet sombre
      police: 'mystical',
      iconographie: ['brouillard', 'runes', 'cristaux', 'spirales', 'étoiles']
    }
  }
};

// Fonctions utilitaires
const SystemeUtils = {
  /**
   * Récupère un système par son code
   */
  getSysteme(code) {
    return systemesJeu[code] || null;
  },

  /**
   * Liste tous les systèmes disponibles
   */
  getAllSystemes() {
    return Object.values(systemesJeu);
  },

  /**
   * Récupère les noms des systèmes pour sélection
   */
  getSystemesListe() {
    return Object.entries(systemesJeu).map(([code, systeme]) => ({
      code,
      nom: systeme.nom,
      description: systeme.description
    }));
  },

  /**
   * Valide les attributs d'un personnage selon son système
   */
  validerAttributs(codeSysteme, attributs) {
    const systeme = this.getSysteme(codeSysteme);
    if (!systeme) return { valide: false, erreurs: ['Système inconnu'] };

    const erreurs = [];
    
    Object.entries(systeme.attributs).forEach(([code, config]) => {
      const valeur = attributs[code];
      
      if (valeur === undefined || valeur === null) {
        erreurs.push(`Attribut ${config.nom} manquant`);
      } else if (valeur < config.min || valeur > config.max) {
        erreurs.push(`${config.nom} doit être entre ${config.min} et ${config.max}`);
      }
    });

    return {
      valide: erreurs.length === 0,
      erreurs
    };
  },

  /**
   * Calcule le total des attributs pour un système
   */
  getTotalAttributs(codeSysteme, attributs) {
    const systeme = this.getSysteme(codeSysteme);
    if (!systeme) return 0;

    return Object.keys(systeme.attributs).reduce((total, code) => {
      return total + (attributs[code] || 0);
    }, 0);
  },

  /**
   * Récupère la configuration de thème pour un système
   */
  getTheme(codeSysteme) {
    const systeme = this.getSysteme(codeSysteme);
    return systeme ? systeme.themes : null;
  },

  /**
   * Vérifie si un skin/archetype est valide pour un système
   */
  validerSkin(codeSysteme, skin) {
    const systeme = this.getSysteme(codeSysteme);
    if (!systeme || !systeme.skins) return true; // Pas de validation si pas de skins définis
    
    return systeme.skins.includes(skin);
  },

  /**
   * Récupère les mécaniques spécifiques d'un système
   */
  getMecaniques(codeSysteme) {
    const systeme = this.getSysteme(codeSysteme);
    return systeme ? systeme.mechanics : {};
  }
};

module.exports = {
  systemesJeu,
  SystemeUtils
};