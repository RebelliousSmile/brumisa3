const metro2033DataTypes = {
  // TRAITS
  traits: {
    // Attributs principaux
    attributs: {
      might: { 
        nom: 'Might', 
        type: 'nombre', 
        min: 3, 
        max: 18, 
        description: 'Force physique et constitution',
        categorie: 'attribut'
      },
      agility: { 
        nom: 'Agility', 
        type: 'nombre', 
        min: 3, 
        max: 18, 
        description: 'Dextérité et réflexes',
        categorie: 'attribut'
      },
      wits: { 
        nom: 'Wits', 
        type: 'nombre', 
        min: 3, 
        max: 18, 
        description: 'Intelligence et perception',
        categorie: 'attribut'
      },
      empathy: { 
        nom: 'Empathy', 
        type: 'nombre', 
        min: 3, 
        max: 18, 
        description: 'Charisme et intuition sociale',
        categorie: 'attribut'
      }
    },

    // Compétences
    competences: {
      athletics: { nom: 'Athletics', attributLie: 'might', categorie: 'competence' },
      awareness: { nom: 'Awareness', attributLie: 'wits', categorie: 'competence' },
      command: { nom: 'Command', attributLie: 'empathy', categorie: 'competence' },
      crafting: { nom: 'Crafting', attributLie: 'wits', categorie: 'competence' },
      deception: { nom: 'Deception', attributLie: 'empathy', categorie: 'competence' },
      firearms: { nom: 'Firearms', attributLie: 'agility', categorie: 'competence' },
      intimidation: { nom: 'Intimidation', attributLie: 'might', categorie: 'competence' },
      medicine: { nom: 'Medicine', attributLie: 'wits', categorie: 'competence' },
      melee: { nom: 'Melee', attributLie: 'might', categorie: 'competence' },
      stealth: { nom: 'Stealth', attributLie: 'agility', categorie: 'competence' },
      survival: { nom: 'Survival', attributLie: 'wits', categorie: 'competence' },
      technology: { nom: 'Technology', attributLie: 'wits', categorie: 'competence' }
    },

    // Traits de faction
    faction: {
      type: 'selection',
      unique: true,
      categorie: 'faction',
      valeurs: [
        { code: 'hansa', nom: 'Hansa', description: 'Alliance commerciale contrôlant les routes' },
        { code: 'red-line', nom: 'Red Line', description: 'Communistes cherchant l\'égalité' },
        { code: 'fourth-reich', nom: 'Fourth Reich', description: 'Fascistes prônant la pureté' },
        { code: 'polis', nom: 'Polis', description: 'Intellectuels préservant le savoir' },
        { code: 'rangers', nom: 'Rangers', description: 'Protecteurs du métro' },
        { code: 'bandits', nom: 'Bandits', description: 'Hors-la-loi et pillards' },
        { code: 'cultists', nom: 'Cultists', description: 'Adorateurs de forces obscures' },
        { code: 'independents', nom: 'Independents', description: 'Stations neutres' },
        { code: 'sparta', nom: 'Sparta', description: 'Ordre militaire d\'élite' },
        { code: 'reich', nom: 'Reich', description: 'Nationalistes extrémistes' }
      ]
    }
  },

  // RÉSERVES
  reserves: {
    sante: {
      nom: 'Santé',
      min: 0,
      max: null, // Calculé selon Might
      calcul: 'Might + 10',
      valeurInitiale: 'calcul',
      blessures: {
        legere: { seuil: -2, effet: 'Malus de -1 aux jets' },
        grave: { seuil: -5, effet: 'Malus de -2 aux jets' },
        critique: { seuil: -10, effet: 'Malus de -3 aux jets' },
        mortelle: { seuil: 0, effet: 'Inconscient ou mourant' }
      }
    },
    moralite: {
      nom: 'Moralité',
      min: -10,
      max: 10,
      valeurInitiale: 0,
      description: 'Karma et santé mentale',
      effets: {
        positif: 'Fins héroïques débloquées',
        neutre: 'Choix moraux équilibrés',
        negatif: 'Fins sombres accessibles'
      }
    },
    radiation: {
      nom: 'Radiation',
      min: 0,
      max: 100,
      valeurInitiale: 0,
      seuils: [
        { valeur: 25, effet: 'Nausées (-1 aux jets)' },
        { valeur: 50, effet: 'Maladie des radiations (-2 aux jets)' },
        { valeur: 75, effet: 'Mutations mineures' },
        { valeur: 100, effet: 'Mort par empoisonnement' }
      ]
    },
    munitions: {
      nom: 'Cartouches MGR',
      min: 0,
      max: null,
      valeurInitiale: 0,
      description: 'Munitions militaires servant de monnaie',
      types: {
        sale: 'Munitions artisanales (valeur 1:2)',
        propre: 'Munitions militaires (valeur 1:1)'
      }
    },
    filtres: {
      nom: 'Filtres à gaz',
      min: 0,
      max: null,
      valeurInitiale: 2,
      duree: '5 minutes par filtre en surface',
      description: 'Obligatoires pour survivre en surface'
    }
  },

  // DESCRIPTIONS
  descriptions: {
    // Identité
    identite: {
      categorie: 'personnage',
      champs: [
        { code: 'nom', nom: 'Nom', type: 'texte' },
        { code: 'surnom', nom: 'Surnom', type: 'texte' },
        { code: 'station', nom: 'Station d\'origine', type: 'texte' },
        { code: 'age', nom: 'Âge', type: 'nombre' },
        { code: 'profession', nom: 'Profession avant la guerre', type: 'texte' },
        { code: 'apparence', nom: 'Apparence', type: 'texte_long' }
      ]
    },

    // Équipement
    equipement: {
      categorie: 'equipement',
      sections: {
        armes: {
          nom: 'Armes',
          champs: [
            { code: 'arme_principale', nom: 'Arme principale', type: 'texte' },
            { code: 'arme_secondaire', nom: 'Arme secondaire', type: 'texte' },
            { code: 'arme_melee', nom: 'Arme de mêlée', type: 'texte' }
          ]
        },
        protection: {
          nom: 'Protection',
          champs: [
            { code: 'armure', nom: 'Armure', type: 'texte' },
            { code: 'masque_gaz', nom: 'Masque à gaz', type: 'texte' },
            { code: 'etat_masque', nom: 'État du masque', type: 'selection', options: ['Neuf', 'Bon', 'Usé', 'Critique'] }
          ]
        },
        survie: {
          nom: 'Équipement de survie',
          champs: [
            { code: 'lampe', nom: 'Source de lumière', type: 'texte' },
            { code: 'batteries', nom: 'Batteries', type: 'nombre' },
            { code: 'rations', nom: 'Rations', type: 'nombre' },
            { code: 'medicaments', nom: 'Médicaments', type: 'liste' }
          ]
        }
      }
    },

    // Mutants rencontrés
    bestiaire: {
      categorie: 'connaissance',
      nom: 'Mutants connus',
      entrees: [
        { code: 'nosalis', nom: 'Nosalis', danger: 'Modéré', description: 'Créatures rapides en meute' },
        { code: 'demon', nom: 'Demon', danger: 'Extrême', description: 'Prédateur volant télépathe' },
        { code: 'watcher', nom: 'Watcher', danger: 'Élevé', description: 'Gorille mutant territorial' },
        { code: 'lurker', nom: 'Lurker', danger: 'Modéré', description: 'Amphibien des tunnels inondés' },
        { code: 'librarian', nom: 'Librarian', danger: 'Extrême', description: 'Gardien intelligent des bibliothèques' }
      ]
    },

    // Relations
    relations: {
      categorie: 'social',
      champs: [
        { code: 'allies', nom: 'Alliés', type: 'liste' },
        { code: 'contacts', nom: 'Contacts dans les stations', type: 'liste' },
        { code: 'ennemis', nom: 'Ennemis', type: 'liste' },
        { code: 'dettes', nom: 'Dettes et faveurs', type: 'liste' }
      ]
    },

    // Histoire personnelle
    histoire: {
      categorie: 'histoire',
      champs: [
        { code: 'avant_bombes', nom: 'Vie avant les bombes', type: 'texte_long' },
        { code: 'jour_bombes', nom: 'Le jour des bombes', type: 'texte_long' },
        { code: 'survie_metro', nom: 'Survie dans le métro', type: 'texte_long' },
        { code: 'motivation', nom: 'Motivation actuelle', type: 'texte_long' }
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
      tailleMax: '5MB'
    },
    carte_metro: {
      categorie: 'exploration',
      ordre: 2,
      description: 'Carte personnelle du métro avec annotations'
    },
    equipement_photo: {
      categorie: 'equipement',
      ordre: 3,
      multiple: true,
      description: 'Photos de l\'équipement important'
    }
  },

  // CATÉGORIES
  categories: {
    attribut: { nom: 'Attributs', ordre: 1 },
    competence: { nom: 'Compétences', ordre: 2 },
    faction: { nom: 'Faction', ordre: 3 },
    personnage: { nom: 'Personnage', ordre: 4 },
    equipement: { nom: 'Équipement', ordre: 5 },
    connaissance: { nom: 'Connaissances', ordre: 6 },
    social: { nom: 'Relations', ordre: 7 },
    histoire: { nom: 'Histoire', ordre: 8 },
    exploration: { nom: 'Exploration', ordre: 9 }
  }
};

module.exports = {
  metro2033DataTypes
};