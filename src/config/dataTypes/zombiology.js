const zombiologyDataTypes = {
  // TRAITS
  traits: {
    // Caractéristiques principales
    caracteristiques: {
      // Physiques
      for: { 
        nom: 'Force', 
        type: 'pourcentage', 
        min: 10, 
        max: 80, 
        description: 'Puissance physique',
        categorie: 'carac-physique'
      },
      con: { 
        nom: 'Constitution', 
        type: 'pourcentage', 
        min: 10, 
        max: 80, 
        description: 'Résistance et santé',
        categorie: 'carac-physique'
      },
      dex: { 
        nom: 'Dextérité', 
        type: 'pourcentage', 
        min: 10, 
        max: 80, 
        description: 'Agilité et précision',
        categorie: 'carac-physique'
      },
      rap: { 
        nom: 'Rapidité', 
        type: 'pourcentage', 
        min: 10, 
        max: 80, 
        description: 'Vitesse et réflexes',
        categorie: 'carac-physique'
      },
      // Mentales
      log: { 
        nom: 'Logique', 
        type: 'pourcentage', 
        min: 10, 
        max: 80, 
        description: 'Intelligence et raisonnement',
        categorie: 'carac-mentale'
      },
      vol: { 
        nom: 'Volonté', 
        type: 'pourcentage', 
        min: 10, 
        max: 80, 
        description: 'Détermination et résistance mentale',
        categorie: 'carac-mentale'
      },
      per: { 
        nom: 'Perception', 
        type: 'pourcentage', 
        min: 10, 
        max: 80, 
        description: 'Sens et intuition',
        categorie: 'carac-mentale'
      },
      cha: { 
        nom: 'Charisme', 
        type: 'pourcentage', 
        min: 10, 
        max: 80, 
        description: 'Présence et influence sociale',
        categorie: 'carac-mentale'
      }
    },

    // Traits de caractère
    traitsCaractere: {
      ambitieux: { 
        nom: 'Ambitieux',
        localisations: ['impuissance', 'peur', 'culpabilite'],
        categorie: 'caractere'
      },
      arrogant: { 
        nom: 'Arrogant',
        localisations: ['tristesse', 'culpabilite', 'peur'],
        categorie: 'caractere'
      },
      autoritaire: { 
        nom: 'Autoritaire',
        localisations: ['anxiete', 'impuissance', 'culpabilite'],
        categorie: 'caractere'
      },
      calme: { 
        nom: 'Calme',
        localisations: ['anxiete', 'colere', 'peur'],
        categorie: 'caractere'
      },
      colerique: { 
        nom: 'Colérique',
        localisations: ['anxiete', 'tristesse', 'culpabilite'],
        categorie: 'caractere'
      },
      courageux: { 
        nom: 'Courageux',
        localisations: ['colere', 'tristesse', 'peur'],
        categorie: 'caractere'
      },
      credule: { 
        nom: 'Crédule',
        localisations: ['colere', 'tristesse', 'culpabilite'],
        categorie: 'caractere'
      },
      excessif: { 
        nom: 'Excessif',
        localisations: ['anxiete', 'impuissance', 'peur'],
        categorie: 'caractere'
      },
      faineant: { 
        nom: 'Fainéant',
        localisations: ['anxiete', 'colere', 'culpabilite'],
        categorie: 'caractere'
      },
      fier: { 
        nom: 'Fier',
        localisations: ['anxiete', 'tristesse', 'peur'],
        categorie: 'caractere'
      },
      negatif: { 
        nom: 'Négatif',
        localisations: ['anxiete', 'impuissance', 'tristesse'],
        categorie: 'caractere'
      },
      patient: { 
        nom: 'Patient',
        localisations: ['anxiete', 'impuissance', 'colere'],
        categorie: 'caractere'
      },
      perseverant: { 
        nom: 'Persévérant',
        localisations: ['impuissance', 'colere', 'tristesse'],
        categorie: 'caractere'
      },
      prudent: { 
        nom: 'Prudent',
        localisations: ['anxiete', 'colere', 'tristesse'],
        categorie: 'caractere'
      },
      solitaire: { 
        nom: 'Solitaire',
        localisations: ['anxiete', 'peur', 'culpabilite'],
        categorie: 'caractere'
      },
      tetu: { 
        nom: 'Têtu',
        localisations: ['impuissance', 'colere', 'peur'],
        categorie: 'caractere'
      },
      timide: { 
        nom: 'Timide',
        localisations: ['anxiete', 'colere', 'culpabilite'],
        categorie: 'caractere'
      },
      violent: { 
        nom: 'Violent',
        localisations: ['impuissance', 'tristesse', 'culpabilite'],
        categorie: 'caractere'
      }
    },

    // Compétences
    competences: {
      type: 'pourcentage',
      base: 0,
      formations: {
        sociale: { nom: 'Formation Classe Sociale', nombre: 'variable' },
        professionnelle: { nom: 'Formation Professionnelle', nombre: 'variable' },
        loisirs: { nom: 'Formation Personnelle/Loisirs', nombre: 'variable' }
      },
      categories: [
        { code: 'arme-sociale', nom: 'Arme sociale', exemples: ['Persuasion', 'Intimidation', 'Séduction'] },
        { code: 'conduite', nom: 'Conduite', exemples: ['Voiture', 'Moto', 'Camion', 'Bateau'] },
        { code: 'sport', nom: 'Sport', exemples: ['Course', 'Natation', 'Escalade', 'Parkour'] },
        { code: 'survie', nom: 'Survie', exemples: ['Orientation', 'Premiers soins', 'Chasse', 'Pêche'] },
        { code: 'art', nom: 'Art', exemples: ['Musique', 'Peinture', 'Écriture', 'Cuisine'] },
        { code: 'combat', nom: 'Combat', exemples: ['Corps à corps', 'Arme blanche', 'Arme à feu', 'Tactique'] },
        { code: 'gestion', nom: 'Gestion de ressources', exemples: ['Économie', 'Logistique', 'Leadership'] },
        { code: 'bricolage', nom: 'Bricolage', exemples: ['Mécanique', 'Électronique', 'Construction', 'Piège'] },
        { code: 'culture', nom: 'Culture générale', exemples: ['Histoire', 'Sciences', 'Géographie', 'Politique'] },
        { code: 'langue', nom: 'Langue', exemples: ['Anglais', 'Espagnol', 'Langue des signes'] }
      ],
      specialisations: true // Possibilité d'avoir des spécialisations (+10%)
    }
  },

  // RÉSERVES
  reserves: {
    // Santé physique
    santePhysique: {
      nom: 'Santé Physique',
      calcul: {
        base: 'Variable selon localisation',
        pp: '4 + 1 par caractéristique physique >= 40% (max 8)',
        tete: 'Base 6 + PP',
        torse: 'Base 10 + PP',
        bras: 'Base 8 + PP',
        jambes: 'Base 8 + PP'
      },
      localisations: {
        tete: { nom: 'Tête', base: 6 },
        torse: { nom: 'Torse', base: 10 },
        bras: { nom: 'Bras', base: 8 },
        jambes: { nom: 'Jambes', base: 8 }
      },
      seuils: [
        { nom: 'Superficiel', malus: 0 },
        { nom: 'Léger', malus: -10 },
        { nom: 'Grave', malus: -20 },
        { nom: 'Profond', malus: -30 }
      ]
    },

    // Santé mentale
    santeMentale: {
      nom: 'Santé Mentale',
      calcul: {
        base: 'Variable selon localisation',
        pm: '4 + 1 par caractéristique mentale >= 40% (max 8)',
        bonus: '+2 PM sur 3 localisations selon trait de caractère',
        localisation: 'Base 10 + PM + bonus éventuel'
      },
      localisations: {
        anxiete: { nom: 'Anxiété', base: 10 },
        colere: { nom: 'Colère', base: 10 },
        culpabilite: { nom: 'Culpabilité', base: 10 },
        impuissance: { nom: 'Impuissance', base: 10 },
        peur: { nom: 'Peur', base: 10 },
        tristesse: { nom: 'Tristesse', base: 10 }
      },
      seuils: [
        { nom: 'Superficiel', malus: 0 },
        { nom: 'Léger', malus: -10 },
        { nom: 'Grave', malus: -20 },
        { nom: 'Profond', malus: -30 }
      ]
    },

    // Stress
    stress: {
      adrenaline: {
        nom: 'Adrénaline',
        min: 0,
        max: null,
        usage: 'Ajouter 1d100 favorable aux jets',
        limite: '1 fois par scène',
        recuperation: 'Automatique entre les scènes'
      },
      panique: {
        nom: 'Panique',
        min: 0,
        max: null,
        usage: 'Subir 1d100 défavorable aux jets',
        declencheur: 'Échecs critiques, blessures graves, horreur',
        duree: 'Jusqu\'à apaisement'
      }
    },

    // Infection
    infection: {
      nom: 'Infection Virale',
      min: 0,
      max: 100,
      valeurInitiale: 0,
      etapes: [
        { seuil: 0, nom: 'Sain', description: 'Aucune infection' },
        { seuil: 25, nom: 'Infection', description: 'Virus dans le sang, contagieux' },
        { seuil: 50, nom: 'Mort clinique', description: 'Arrêt des fonctions vitales' },
        { seuil: 75, nom: 'Rigidité cadavérique', description: 'Raidissement du corps' },
        { seuil: 100, nom: 'Réanimation', description: 'Transformation en zombie' }
      ],
      test: 'CON% vs Virus% à chaque exposition'
    }
  },

  // DESCRIPTIONS
  descriptions: {
    // Identité
    identite: {
      categorie: 'personnage',
      champs: [
        { code: 'nom', nom: 'Nom', type: 'texte' },
        { code: 'prenom', nom: 'Prénom', type: 'texte' },
        { code: 'age', nom: 'Âge', type: 'nombre' },
        { code: 'sexe', nom: 'Sexe', type: 'selection', options: ['Masculin', 'Féminin', 'Autre'] },
        { code: 'taille', nom: 'Taille', type: 'texte' },
        { code: 'poids', nom: 'Poids', type: 'texte' },
        { code: 'apparence', nom: 'Apparence', type: 'texte_long' }
      ]
    },

    // Background
    background: {
      categorie: 'histoire',
      champs: [
        { code: 'classe_sociale', nom: 'Classe sociale d\'origine', type: 'texte' },
        { code: 'profession', nom: 'Profession avant l\'épidémie', type: 'texte' },
        { code: 'famille', nom: 'Situation familiale', type: 'texte_long' },
        { code: 'jour_zero', nom: 'Le Jour Zéro', type: 'texte_long', description: 'Où étiez-vous quand l\'épidémie a commencé?' },
        { code: 'survie', nom: 'Histoire de survie', type: 'texte_long' }
      ]
    },

    // Équipement
    equipement: {
      categorie: 'equipement',
      sections: {
        armes: {
          nom: 'Armes',
          champs: [
            { code: 'nom', nom: 'Nom', type: 'texte' },
            { code: 'type', nom: 'Type', type: 'selection', options: ['Corps à corps', 'Arme blanche', 'Arme à feu', 'Explosif'] },
            { code: 'degats', nom: 'Dégâts', type: 'texte' },
            { code: 'munitions', nom: 'Munitions', type: 'nombre' },
            { code: 'etat', nom: 'État', type: 'selection', options: ['Neuf', 'Bon', 'Usé', 'Critique'] }
          ]
        },
        protection: {
          nom: 'Protection',
          champs: [
            { code: 'nom', nom: 'Nom', type: 'texte' },
            { code: 'protection', nom: 'Protection', type: 'nombre' },
            { code: 'zones', nom: 'Zones couvertes', type: 'liste' }
          ]
        },
        survie: {
          nom: 'Matériel de survie',
          champs: [
            { code: 'nourriture', nom: 'Rations (jours)', type: 'nombre' },
            { code: 'eau', nom: 'Eau (litres)', type: 'nombre' },
            { code: 'medicaments', nom: 'Médicaments', type: 'liste' },
            { code: 'outils', nom: 'Outils', type: 'liste' },
            { code: 'divers', nom: 'Équipement divers', type: 'liste' }
          ]
        }
      }
    },

    // Relations
    relations: {
      categorie: 'social',
      champs: [
        { code: 'groupe', nom: 'Groupe de survie', type: 'texte' },
        { code: 'allies', nom: 'Alliés', type: 'liste' },
        { code: 'famille_survivante', nom: 'Famille survivante', type: 'liste' },
        { code: 'ennemis', nom: 'Ennemis', type: 'liste' },
        { code: 'pertes', nom: 'Personnes perdues', type: 'liste' }
      ]
    },

    // Phases de jeu
    phases: {
      categorie: 'jeu',
      types: {
        aventure: { nom: 'Phase d\'Aventure', description: 'Exploration et investigation' },
        role: { nom: 'Phase de Rôle', description: 'Interactions sociales' },
        combat: { nom: 'Phase de Combat', description: 'Affrontements tactiques' },
        gestion: { nom: 'Phase de Gestion', description: 'Ressources et base' }
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
    groupe: {
      categorie: 'social',
      ordre: 2,
      description: 'Photo du groupe de survie'
    },
    base: {
      categorie: 'lieu',
      ordre: 3,
      description: 'Plan ou photo de la base/refuge'
    },
    equipement_photo: {
      categorie: 'equipement',
      ordre: 4,
      multiple: true,
      description: 'Photos d\'équipement important'
    }
  },

  // CATÉGORIES
  categories: {
    'carac-physique': { nom: 'Caractéristiques Physiques', ordre: 1 },
    'carac-mentale': { nom: 'Caractéristiques Mentales', ordre: 2 },
    caractere: { nom: 'Traits de Caractère', ordre: 3 },
    competence: { nom: 'Compétences', ordre: 4 },
    personnage: { nom: 'Personnage', ordre: 5 },
    histoire: { nom: 'Histoire', ordre: 6 },
    equipement: { nom: 'Équipement', ordre: 7 },
    social: { nom: 'Relations', ordre: 8 },
    lieu: { nom: 'Lieux', ordre: 9 },
    jeu: { nom: 'Phases de Jeu', ordre: 10 }
  }
};

module.exports = {
  zombiologyDataTypes
};