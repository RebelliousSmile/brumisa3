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
      couleurPrimaire: '#8b5cf6', // violet (purple-500)
      couleurSecondaire: '#7c3aed', // violet foncé (violet-600)
      couleurAccent: '#6d28d9', // violet très foncé (violet-700)
      couleurTailwind: 'purple',
      police: 'gothic',
      icone: 'ra-bleeding-heart', // cœur saignant pour l'horreur romantique
      iconographie: ['cœurs', 'roses', 'lune', 'sang', 'miroirs']
    }
  },

  // Engrenages - Steampunk
  engrenages: {
    nom: 'Engrenages',
    code: 'engrenages',
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
      couleurPrimaire: '#10b981', // vert emerald-500 (pour la Roue du Temps)
      couleurSecondaire: '#059669', // vert emerald-600
      couleurAccent: '#047857', // vert emerald-700
      couleurTailwind: 'emerald',
      police: 'fantasy',
      icone: 'ra-gear', // engrenage pour mécanisme
      iconographie: ['engrenages', 'roue', 'magie', 'épées', 'runes']
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
      couleurPrimaire: '#dc2626', // rouge (red-600)
      couleurSecondaire: '#b91c1c', // rouge foncé (red-700)
      couleurAccent: '#991b1b', // rouge très foncé (red-800)
      couleurTailwind: 'red',
      police: 'dystopian',
      icone: 'ra-radiation', // radiation pour post-apocalyptique
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
      couleurPrimaire: '#ec4899', // rose (pink-500)
      couleurSecondaire: '#db2777', // rose foncé (pink-600)
      couleurAccent: '#be185d', // rose très foncé (pink-700)
      couleurTailwind: 'pink',
      police: 'mystical',
      icone: 'ra-crystal-ball', // boule de cristal pour mystique
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