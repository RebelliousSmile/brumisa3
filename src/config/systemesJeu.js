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

    skins: {
      vampire: 'Le Vampire',
      'loup-garou': 'Le Loup-Garou', 
      fee: 'La Fée',
      fantome: 'Le Fantôme',
      goule: 'La Goule',
      hollow: 'Le Hollow',
      infernal: 'L\'Infernal',
      mortel: 'Le Mortel',
      reine: 'La Reine',
      sorciere: 'La Sorcière'
    },

    moves: {
      basic: [
        { code: 'turn-on', nom: 'Allumer', description: 'Utiliser votre charme pour manipuler quelqu\'un (Hot)' },
        { code: 'shut-down', nom: 'Rembarrer', description: 'Blesser quelqu\'un pour le faire taire (Cold)' },
        { code: 'hold-steady', nom: 'Garder son sang-froid', description: 'Rester calme face au danger (Cold)' },
        { code: 'lash-out', nom: 'Cogner', description: 'Attaquer quelqu\'un physiquement (Volatile)' },
        { code: 'run-away', nom: 'Fuir', description: 'S\'échapper d\'une situation dangereuse (Volatile)' },
        { code: 'gaze-abyss', nom: 'Contempler l\'Abysse', description: 'Sonder les mystères surnaturels (Dark)' }
      ],
      sex: [{ code: 'sex-move', nom: 'Sex Move', description: 'Varie selon la Skin sélectionnée' }]
    },

    mechanics: {
      conditions: [
        { code: 'afraid', nom: 'Apeuré', description: 'Vous évitez ce qui vous fait peur' },
        { code: 'angry', nom: 'Furieux', description: 'Vous réagissez avec violence' }, 
        { code: 'guilty', nom: 'Honteux', description: 'Vous vous sentez coupable de vos actions' },
        { code: 'hopeless', nom: 'Brisé', description: 'Vous ne croyez plus en rien' },
        { code: 'lost', nom: 'Perdu', description: 'Vous ne savez plus qui vous êtes' }
      ],
      strings: { description: 'Liens émotionnels entre personnages', max: 4 },
      harm: { levels: ['Faint', 'Injured', 'Wounded', 'Dying'], max: 4 },
      experience: { trigger: 'Failing rolls, fulfilling conditions', max: 5 },
      darkness: { description: 'Points de corruption', consequences: 'Transformation finale' }
    },

    // Thèmes supprimés - gérés par SystemThemeService
  },

  // Engrenages - Steampunk
  engrenages: {
    nom: 'Roue du Temps',
    code: 'engrenages',
    description: 'Adaptation de l\'univers avec le système Engrenages',
    version: '3ème édition',

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

    // Thèmes supprimés - gérés par SystemThemeService
  },

  // Metro 2033 - Post-Apocalyptic
  metro2033: {
    nom: 'Metro 2033',
    code: 'metro2033',
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

    // Thèmes supprimés - gérés par SystemThemeService
  },

  // Mist Engine - Mystical/Narrative
  mistengine: {
    nom: 'Mist Engine',
    code: 'mistengine',
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

    // Thèmes supprimés - gérés par SystemThemeService
  },

  // Zombiology - Survival d100
  zombiology: {
    nom: 'Zombiology',
    code: 'zombiology',
    description: 'JdR de survie zombie avec système d100',
    version: '2e édition',
    
    attributs: {
      // Physiques
      for: { nom: 'Force', min: 10, max: 80, description: 'Puissance physique' },
      con: { nom: 'Constitution', min: 10, max: 80, description: 'Résistance et santé' },
      dex: { nom: 'Dextérité', min: 10, max: 80, description: 'Agilité et précision' },
      rap: { nom: 'Rapidité', min: 10, max: 80, description: 'Vitesse et réflexes' },
      // Mentales
      log: { nom: 'Logique', min: 10, max: 80, description: 'Intelligence et raisonnement' },
      vol: { nom: 'Volonté', min: 10, max: 80, description: 'Détermination et résistance mentale' },
      per: { nom: 'Perception', min: 10, max: 80, description: 'Sens et intuition' },
      cha: { nom: 'Charisme', min: 10, max: 80, description: 'Présence et influence sociale' }
    },

    competences: {
      formations: ['Classe sociale', 'Professionnelle', 'Personnelle/Loisirs'],
      categories: [
        'Arme sociale', 'Conduite', 'Sport', 'Survie', 
        'Art', 'Combat', 'Gestion de ressources', 'Bricolage',
        'Culture générale', 'Langue'
      ],
      specialisations: true // Les compétences peuvent avoir des spécialisations
    },

    traits: {
      caractere: {
        ambitieux: { localisations: ['impuissance', 'peur', 'culpabilite'] },
        arrogant: { localisations: ['tristesse', 'culpabilite', 'peur'] },
        autoritaire: { localisations: ['anxiete', 'impuissance', 'culpabilite'] },
        calme: { localisations: ['anxiete', 'colere', 'peur'] },
        colerique: { localisations: ['anxiete', 'tristesse', 'culpabilite'] },
        courageux: { localisations: ['colere', 'tristesse', 'peur'] },
        credule: { localisations: ['colere', 'tristesse', 'culpabilite'] },
        excessif: { localisations: ['anxiete', 'impuissance', 'peur'] },
        faineant: { localisations: ['anxiete', 'colere', 'culpabilite'] },
        fier: { localisations: ['anxiete', 'tristesse', 'peur'] },
        negatif: { localisations: ['anxiete', 'impuissance', 'tristesse'] },
        patient: { localisations: ['anxiete', 'impuissance', 'colere'] },
        perseverant: { localisations: ['impuissance', 'colere', 'tristesse'] },
        prudent: { localisations: ['anxiete', 'colere', 'tristesse'] },
        solitaire: { localisations: ['anxiete', 'peur', 'culpabilite'] },
        tetu: { localisations: ['impuissance', 'colere', 'peur'] },
        timide: { localisations: ['anxiete', 'colere', 'culpabilite'] },
        violent: { localisations: ['impuissance', 'tristesse', 'culpabilite'] }
      }
    },

    mechanics: {
      resolution: {
        type: 'd100',
        succes: 'Jet ≤ Compétence% + Caractéristique%',
        critique: 'Doubles (11, 22, 33...)',
        qualiteReussite: 'Dizaine du résultat (0-9)'
      },
      
      sante: {
        seuils: ['Superficiel', 'Léger', 'Grave', 'Profond'],
        physique: { 
          calcul: 'Base + PP',
          pp: '4 + 1 par carac physique ≥ 40% (max 8)'
        },
        mentale: { 
          calcul: 'Base + PM',
          pm: '4 + 1 par carac mentale ≥ 40% (max 8)',
          caractere: 'PM +2 sur 3 localisations'
        },
        localisations: {
          physiques: ['Tête', 'Torse', 'Bras', 'Jambes'],
          mentales: ['Anxiété', 'Colère', 'Culpabilité', 'Impuissance', 'Peur', 'Tristesse']
        }
      },

      stress: {
        types: ['Adrénaline', 'Panique'],
        effet: '+1d100 favorable ou défavorable',
        usage: 'Limité par scène'
      },

      infection: {
        test: 'CON% vs Virus%',
        etapes: ['Infection', 'Mort clinique', 'Rigidité cadavérique', 'Réanimation'],
        panique: 'Attaque psychologique lors de morsure'
      },

      phases: {
        aventure: 'Exploration et investigation',
        role: 'Interactions sociales',
        combat: 'Affrontements tactiques',
        gestion: 'Ressources et survie'
      }
    },

    // Thèmes supprimés - gérés par SystemThemeService
  }
};

module.exports = {
  systemesJeu
};