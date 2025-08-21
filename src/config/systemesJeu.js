const systemesJeu = {
  // Système PBTA (Powered by the Apocalypse)
  pbta: {
    nom: 'PBTA',
    code: 'pbta', 
    description: 'Système Powered by the Apocalypse - Jeux narratifs basés sur les mouvements',
    version: 'Core System',
    systeme: true,
    
    // Attributs communs PBTA
    attributs: {
      hot: { nom: 'Hot', min: -1, max: 3, description: 'Charisme et séduction' },
      cold: { nom: 'Cold', min: -1, max: 3, description: 'Froideur et contrôle' },
      volatile: { nom: 'Volatile', min: -1, max: 3, description: 'Impulsivité et violence' },
      dark: { nom: 'Dark', min: -1, max: 3, description: 'Mystère et manipulation' }
    },

    // Mécaniques communes PBTA
    mechanics: {
      resolution: {
        type: '2d6+Stat',
        resultats: {
          '6-': 'Échec, le MJ intervient',
          '7-9': 'Succès partiel avec complication',
          '10+': 'Succès complet'
        }
      },
      experience: { trigger: 'Failing rolls, fulfilling conditions', max: 5 }
    },

    // Univers du système PBTA
    univers: {
      monsterhearts: {
        nom: 'Monsterhearts',
        code: 'monsterhearts',
        description: 'JdR gothique romantique sur les monstres adolescents',
        couleur: '#8B008B', // Violet foncé
        
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

        mechanics_specifiques: {
          conditions: [
            { code: 'afraid', nom: 'Apeuré', description: 'Vous évitez ce qui vous fait peur' },
            { code: 'angry', nom: 'Furieux', description: 'Vous réagissez avec violence' }, 
            { code: 'guilty', nom: 'Honteux', description: 'Vous vous sentez coupable de vos actions' },
            { code: 'hopeless', nom: 'Brisé', description: 'Vous ne croyez plus en rien' },
            { code: 'lost', nom: 'Perdu', description: 'Vous ne savez plus qui vous êtes' }
          ],
          strings: { description: 'Liens émotionnels entre personnages', max: 4 },
          harm: { levels: ['Faint', 'Injured', 'Wounded', 'Dying'], max: 4 },
          darkness: { description: 'Points de corruption', consequences: 'Transformation finale' }
        }
      },

      urban_shadows: {
        nom: 'Urban Shadows',
        code: 'urban_shadows',
        description: 'JdR urbain surnaturel et politique',
        couleur: '#9370DB', // Violet clair (Medium Purple)
        
        playbooks: {
          vampire: 'Le Vampire',
          loup: 'Le Loup',
          fae: 'Le Fae',
          spectre: 'Le Spectre',
          oracle: 'L\'Oracle',
          mage: 'Le Mage',
          chasseur: 'Le Chasseur',
          corrompu: 'Le Corrompu',
          mortel: 'Le Mortel',
          conscient: 'Le Conscient'
        },

        factions: ['Mortalité', 'Nuit', 'Pouvoir', 'Sauvage'],

        moves: {
          basic: [
            { code: 'unleash', nom: 'Déchaîner', description: 'Libérer vos pouvoirs surnaturels' },
            { code: 'persuade', nom: 'Persuader', description: 'Convaincre quelqu\'un par la parole' },
            { code: 'figure-out', nom: 'Comprendre', description: 'Étudier une situation ou une personne' },
            { code: 'mislead', nom: 'Tromper', description: 'Mentir ou distraire quelqu\'un' },
            { code: 'keep-cool', nom: 'Garder son calme', description: 'Rester maître de soi face au danger' },
            { code: 'lash-out', nom: 'Frapper', description: 'Attaquer quelqu\'un physiquement' }
          ]
        },

        mechanics_specifiques: {
          corruption: { description: 'Points de corruption', max: 5, effet: 'Avancement et transformation' },
          debts: { description: 'Dettes entre personnages', usage: 'Influence et manipulation' },
          status: { description: 'Statut dans chaque faction', range: '-3 à +3' }
        }
      }
    }
  },

  // Système Engrenages
  engrenages: {
    nom: 'Engrenages',
    code: 'engrenages',
    description: 'Système steampunk/fantasy avec dés à 10 faces',
    version: '3ème édition',
    systeme: true,

    attributs: {
      corps: { nom: 'Corps', min: 1, max: 5, description: 'Puissance physique et santé' },
      esprit: { nom: 'Esprit', min: 1, max: 5, description: 'Intelligence et logique' },
      ame: { nom: 'Âme', min: 1, max: 5, description: 'Intuition et force spirituelle' }
    },

    mechanics: {
      resolution: {
        type: 'd10',
        succes: 'Jet ≤ Attribut + Spécialisation',
        critique: 'Plusieurs dés identiques'
      },
      sante: { niveaux: ['Égratignure', 'Blessure Légère', 'Blessure Grave', 'Blessure Critique'], max: 15 },
      equilibreMental: { description: 'Santé mentale face à l\'horreur et au surnaturel', max: 15 },
      experience: { gain: 'Succès critique, échec dramatique, roleplay', usage: 'Amélioration attributs/spécialisations' }
    },

    // Univers du système Engrenages
    univers: {
      roue_du_temps: {
        nom: 'La Roue du Temps',
        code: 'roue_du_temps',
        description: 'Adaptation de l\'univers de Robert Jordan',
        couleur: '#4169E1', // Royal Blue
        
        specialisations: {
          channeling: ['Terre', 'Feu', 'Air', 'Eau', 'Esprit'],
          talents: ['Rêveur', 'Vision', 'Empathie', 'Chance'],
          combat: ['Épée', 'Arc', 'Lance', 'Dague', 'Mains nues'],
          connaissances: ['Histoire', 'Prophéties', 'Langues anciennes', 'Géographie']
        },

        mechanics_specifiques: {
          saidin_saidar: { description: 'Canalisation du Pouvoir Unique', risque: 'Folie (Saidin) ou Épuisement' },
          ta_veren: { description: 'Héros liés à la Trame', effet: 'Modifie le destin autour d\'eux' },
          liens: { description: 'Liens d\'Aes Sedai', effet: 'Partage émotions et sensations' }
        }
      },

      ecryme: {
        nom: 'Ecryme',
        code: 'ecryme',
        description: 'Univers de cape et d\'épée fantastique',
        couleur: '#DC143C', // Crimson
        
        specialisations: {
          escrime: ['Rapière', 'Épée courte', 'Main gauche', 'Cape'],
          magie: ['Divination', 'Évocation', 'Illusion', 'Transmutation'],
          sociale: ['Étiquette', 'Séduction', 'Intimidation', 'Négociation']
        },

        mechanics_specifiques: {
          candeur: { description: 'Pureté et innocence', usage: 'Résistance à la corruption' },
          spleen: { description: 'Mélancolie et désespoir', effet: 'Pouvoir sombre mais corrupteur' },
          duels: { description: 'Combat d\'honneur', phases: ['Salut', 'Engagement', 'Échange', 'Conclusion'] }
        }
      }
    }
  },

  // Système Mist Engine
  mistengine: {
    nom: 'Mist Engine',
    code: 'mistengine',
    description: 'Moteur de jeu narratif et mystique',
    version: 'Core System',
    systeme: true,

    attributs: {
      edge: { nom: 'Edge', min: 1, max: 4, description: 'Violence et détermination' },
      heart: { nom: 'Heart', min: 1, max: 4, description: 'Empathie et passion' },
      iron: { nom: 'Iron', min: 1, max: 4, description: 'Courage et constitution' },
      shadow: { nom: 'Shadow', min: 1, max: 4, description: 'Ruse et mystère' },
      wits: { nom: 'Wits', min: 1, max: 4, description: 'Intellect et perception' }
    },

    mechanics: {
      resolution: {
        type: 'd6 + Attribut',
        resultats: {
          '1-3': 'Échec avec complication',
          '4-5': 'Succès faible',
          '6+': 'Succès fort'
        }
      },
      momentum: { description: 'Élan narratif', range: '-6 à +10', usage: 'Bonus aux jets' },
      vows: { description: 'Serments narratifs donnant XP', ranks: ['Troublesome', 'Dangerous', 'Formidable', 'Extreme', 'Epic'] }
    },

    // Univers du système Mist Engine
    univers: {
      obojima: {
        nom: 'Obojima',
        code: 'obojima',
        description: 'JdR d\'enquête occulte dans le Japon moderne',
        couleur: '#2F4F4F', // Dark Slate Gray
        
        themes: ['Horreur urbaine', 'Folklore japonais', 'Enquête surnaturelle'],
        
        mechanics_specifiques: {
          corruption: { description: 'Influence des ténèbres', consequences: 'Transformation en yokai' },
          liens_spirituels: { description: 'Connexion avec l\'au-delà', usage: 'Perception du surnaturel' },
          karma: { description: 'Balance des actions', effet: 'Influence le destin' }
        }
      },

      zamanora: {
        nom: 'Zamanora',
        code: 'zamanora',
        description: 'Univers de fantasy mystique',
        couleur: '#4B0082', // Indigo
        
        themes: ['Magie ancienne', 'Quêtes épiques', 'Mystères cosmiques'],
        
        mechanics_specifiques: {
          essence: { description: 'Énergie magique', usage: 'Lancer des sorts' },
          destinee: { description: 'Points de destin', usage: 'Modifier les jets critiques' },
          artefacts: { description: 'Objets de pouvoir', danger: 'Corruption possible' }
        }
      },

      post_mortem: {
        nom: 'Post-Mortem',
        code: 'post_mortem',
        description: 'JdR d\'horreur gothique et d\'enquête',
        couleur: '#800020', // Burgundy
        
        themes: ['Mort et au-delà', 'Enquêtes surnaturelles', 'Horreur psychologique'],
        
        mechanics_specifiques: {
          memento_mori: { description: 'Souvenirs de mort', usage: 'Indices du passé' },
          resonance: { description: 'Connexion avec les morts', danger: 'Possession' },
          sanite: { description: 'Santé mentale', perte: 'Face à l\'horreur indicible' }
        }
      },

      otherscape: {
        nom: 'Tokyo:Otherscape',
        code: 'otherscape',
        description: 'Urban fantasy dans le Tokyo moderne',
        couleur: '#FF1493', // Deep Pink
        
        themes: ['Cyberpunk mystique', 'Folklore urbain', 'Réalités parallèles'],
        
        mechanics_specifiques: {
          glitch: { description: 'Failles dans la réalité', usage: 'Passage entre mondes' },
          resonance_urbaine: { description: 'Connexion à la ville', pouvoir: 'Manipulation de l\'environnement' },
          avatar_digital: { description: 'Présence numérique', usage: 'Actions dans le cyberespace' }
        }
      }
    }
  },

  // Système MYZ (Mutant Year Zero)
  myz: {
    nom: 'MYZ (Mutant Year Zero)',
    code: 'myz',
    description: 'Système Year Zero Engine - Survie post-apocalyptique',
    version: 'Year Zero Engine',
    systeme: true,

    attributs: {
      might: { nom: 'Might', min: 3, max: 18, description: 'Force physique et constitution' },
      agility: { nom: 'Agility', min: 3, max: 18, description: 'Dextérité et réflexes' },
      wits: { nom: 'Wits', min: 3, max: 18, description: 'Intelligence et perception' },
      empathy: { nom: 'Empathy', min: 3, max: 18, description: 'Charisme et intuition sociale' }
    },

    mechanics: {
      resolution: {
        type: 'd6 pool',
        resultats: {
          '1': 'Complication',
          '2-5': 'Échec',
          '6': 'Succès'
        },
        push: 'Relancer les dés non-1, risque de trauma'
      },
      mutation: { description: 'Pouvoirs mutants', risque: 'Points de mutation permanents' },
      equipement: { degradation: true, reparation: 'Compétence Crafting', ressources: 'Rares et précieuses' }
    },

    // Univers du système MYZ
    univers: {
      metro2033: {
        nom: 'Metro 2033',
        code: 'metro2033',
        description: 'Survie dans le métro de Moscou post-apocalyptique',
        couleur: '#2F4F4F', // Dark Slate Gray
        
        factions: [
          'Hansa', 'Red Line', 'Fourth Reich', 'Polis', 'Rangers',
          'Bandits', 'Cultists', 'Independents', 'Sparta'
        ],

        skills: [
          'Athletics', 'Awareness', 'Command', 'Crafting', 'Deception',
          'Firearms', 'Intimidation', 'Medicine', 'Melee', 'Stealth',
          'Survival', 'Technology'
        ],

        mechanics_specifiques: {
          radiation: { description: 'Exposition aux radiations', effets: 'Maladie, mutation, mort' },
          moralite: { description: 'Santé mentale et karma', impact: 'Choix narratifs, fins multiples' },
          filters: { description: 'Masques à gaz obligatoires en surface', duree: 'Limitée' },
          mutants: { types: ['Nosalis', 'Demons', 'Watchers', 'Lurkers'], danger: 'Mortel' }
        }
      }
    }
  },

  // Système Zombiology (standalone)
  zombiology: {
    nom: 'Zombiology d100 System',
    code: 'zombiology',
    description: 'Système d100 pour jeux de survie',
    version: '2e édition',
    systeme: true,
    
    // Univers disponibles
    univers: {
      zombiology: {
        nom: 'Zombiology',
        code: 'zombiology',
        description: 'JdR de survie zombie avec système d100',
        couleur: '#d4af37'
      }
    },
    
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
      specialisations: true
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
    }
  }
};

module.exports = {
  systemesJeu
};