const engrenagesDataTypes = {
  // TRAITS
  traits: {
    // Attributs principaux
    attributs: {
      corps: { 
        nom: 'Corps', 
        type: 'nombre', 
        min: 1, 
        max: 5, 
        description: 'Puissance physique et santé',
        categorie: 'attribut'
      },
      esprit: { 
        nom: 'Esprit', 
        type: 'nombre', 
        min: 1, 
        max: 5, 
        description: 'Intelligence et logique',
        categorie: 'attribut'
      },
      ame: { 
        nom: 'Âme', 
        type: 'nombre', 
        min: 1, 
        max: 5, 
        description: 'Intuition et force spirituelle',
        categorie: 'attribut'
      }
    },

    // Spécialisations
    specialisations: {
      science: [
        { code: 'alchimie', nom: 'Alchimie', description: 'Transformation de la matière', categorie: 'specialisation-science' },
        { code: 'anatomie', nom: 'Anatomie', description: 'Étude du corps humain', categorie: 'specialisation-science' },
        { code: 'ingenierie', nom: 'Ingénierie', description: 'Conception de machines', categorie: 'specialisation-science' },
        { code: 'electricite', nom: 'Électricité', description: 'Maîtrise des forces électriques', categorie: 'specialisation-science' },
        { code: 'optique', nom: 'Optique', description: 'Science de la lumière', categorie: 'specialisation-science' },
        { code: 'mecanique', nom: 'Mécanique', description: 'Étude du mouvement', categorie: 'specialisation-science' },
        { code: 'chimie', nom: 'Chimie', description: 'Réactions et composés', categorie: 'specialisation-science' },
        { code: 'geologie', nom: 'Géologie', description: 'Étude de la terre', categorie: 'specialisation-science' },
        { code: 'astronomie', nom: 'Astronomie', description: 'Observation des astres', categorie: 'specialisation-science' }
      ],
      magie: [
        { code: 'divination', nom: 'Divination', description: 'Vision du futur et du caché', categorie: 'specialisation-magie' },
        { code: 'evocation', nom: 'Évocation', description: 'Invocation d\'énergies', categorie: 'specialisation-magie' },
        { code: 'illusion', nom: 'Illusion', description: 'Tromperie des sens', categorie: 'specialisation-magie' },
        { code: 'invocation', nom: 'Invocation', description: 'Appel d\'entités', categorie: 'specialisation-magie' },
        { code: 'necromancie', nom: 'Nécromancie', description: 'Magie de la mort', categorie: 'specialisation-magie' },
        { code: 'transmutation', nom: 'Transmutation', description: 'Transformation magique', categorie: 'specialisation-magie' },
        { code: 'enchantement', nom: 'Enchantement', description: 'Charmes et contrôle', categorie: 'specialisation-magie' },
        { code: 'conjuration', nom: 'Conjuration', description: 'Création d\'objets', categorie: 'specialisation-magie' }
      ],
      generale: [
        { code: 'combat', nom: 'Combat', description: 'Art martial et maniement d\'armes', categorie: 'specialisation-generale' },
        { code: 'discretion', nom: 'Discrétion', description: 'Furtivité et infiltration', categorie: 'specialisation-generale' },
        { code: 'equitation', nom: 'Équitation', description: 'Monte et dressage', categorie: 'specialisation-generale' },
        { code: 'etiquette', nom: 'Étiquette', description: 'Savoir-vivre et protocole', categorie: 'specialisation-generale' },
        { code: 'langue', nom: 'Langue', description: 'Linguistique et traduction', categorie: 'specialisation-generale' },
        { code: 'navigation', nom: 'Navigation', description: 'Orientation et pilotage', categorie: 'specialisation-generale' },
        { code: 'survie', nom: 'Survie', description: 'Vie en milieu hostile', categorie: 'specialisation-generale' },
        { code: 'vol', nom: 'Vol', description: 'Larcin et pickpocket', categorie: 'specialisation-generale' }
      ]
    },

    // Traits de compétence (valeurs 0-5)
    competences: {
      type: 'nombre',
      min: 0,
      max: 5,
      lieeAttribut: true, // Chaque compétence est liée à un attribut
      description: 'Niveau de maîtrise dans une spécialisation'
    }
  },

  // RÉSERVES
  reserves: {
    sante: {
      nom: 'Santé',
      min: 0,
      max: 15,
      valeurInitiale: 15,
      niveaux: [
        { seuil: 0, nom: 'Mort', description: 'Le personnage est décédé' },
        { seuil: 1, nom: 'Blessure Critique', description: 'Au bord de la mort' },
        { seuil: 5, nom: 'Blessure Grave', description: 'Gravement blessé' },
        { seuil: 10, nom: 'Blessure Légère', description: 'Légèrement blessé' },
        { seuil: 14, nom: 'Égratignure', description: 'Blessures superficielles' },
        { seuil: 15, nom: 'Indemne', description: 'En parfaite santé' }
      ]
    },
    equilibreMental: {
      nom: 'Équilibre Mental',
      min: 0,
      max: 15,
      valeurInitiale: 15,
      description: 'Santé mentale face à l\'horreur et au surnaturel',
      effets: {
        0: 'Folie totale',
        5: 'Troubles sévères',
        10: 'Anxiété et cauchemars',
        15: 'Esprit sain'
      }
    },
    corruption: {
      nom: 'Corruption',
      min: 0,
      max: null, // Pas de limite supérieure
      valeurInitiale: 0,
      description: 'Utilisation excessive de magie noire',
      seuils: [
        { valeur: 5, effet: 'Marques physiques mineures' },
        { valeur: 10, effet: 'Mutations visibles' },
        { valeur: 15, effet: 'Transformation partielle' },
        { valeur: 20, effet: 'Perte d\'humanité' }
      ]
    },
    experience: {
      nom: 'Points d\'Expérience',
      min: 0,
      max: null,
      valeurInitiale: 0,
      usage: 'Amélioration des attributs et spécialisations',
      gain: [
        'Succès critique (+1 XP)',
        'Échec dramatique (+1 XP)',
        'Roleplay exceptionnel (+1-3 XP)',
        'Accomplissement d\'objectif (+2-5 XP)'
      ]
    }
  },

  // DESCRIPTIONS
  descriptions: {
    // Identité
    identite: {
      categorie: 'personnage',
      champs: [
        { code: 'nom', nom: 'Nom', type: 'texte' },
        { code: 'profession', nom: 'Profession', type: 'texte' },
        { code: 'origine', nom: 'Origine', type: 'texte' },
        { code: 'age', nom: 'Âge', type: 'nombre' },
        { code: 'description', nom: 'Description physique', type: 'texte_long' }
      ]
    },

    // Inventions
    inventions: {
      categorie: 'equipement',
      champs: [
        { code: 'nom', nom: 'Nom de l\'invention', type: 'texte' },
        { code: 'type', nom: 'Type', type: 'selection', options: ['Arme', 'Outil', 'Protection', 'Transport', 'Communication'] },
        { code: 'description', nom: 'Description', type: 'texte_long' },
        { code: 'statut', nom: 'Statut', type: 'selection', options: ['Conception', 'Fabrication', 'Test', 'Fonctionnel'] },
        { code: 'composants', nom: 'Composants nécessaires', type: 'liste' }
      ]
    },

    // Équipement
    equipement: {
      categorie: 'equipement',
      types: [
        { code: 'arme', nom: 'Armes', multiple: true },
        { code: 'armure', nom: 'Armures', multiple: false },
        { code: 'outil', nom: 'Outils', multiple: true },
        { code: 'consommable', nom: 'Consommables', multiple: true }
      ]
    },

    // Background
    background: {
      categorie: 'histoire',
      champs: [
        { code: 'societe_secrete', nom: 'Société Secrète', type: 'texte' },
        { code: 'motivation', nom: 'Motivation principale', type: 'texte_long' },
        { code: 'contacts', nom: 'Contacts importants', type: 'liste' },
        { code: 'secrets', nom: 'Secrets', type: 'texte_long' }
      ]
    },

    // Notes de jeu
    notes: {
      categorie: 'jeu',
      champs: [
        { code: 'allies', nom: 'Alliés', type: 'liste' },
        { code: 'ennemis', nom: 'Ennemis', type: 'liste' },
        { code: 'objectifs', nom: 'Objectifs actuels', type: 'liste' },
        { code: 'journal', nom: 'Journal de bord', type: 'texte_long' }
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
    invention_schema: {
      categorie: 'equipement',
      ordre: 2,
      multiple: true,
      description: 'Schémas techniques des inventions'
    },
    symbole_societe: {
      categorie: 'histoire',
      ordre: 3,
      description: 'Symbole de la société secrète'
    }
  },

  // CATÉGORIES
  categories: {
    attribut: { nom: 'Attributs', ordre: 1 },
    'specialisation-science': { nom: 'Sciences', ordre: 2 },
    'specialisation-magie': { nom: 'Magie', ordre: 3 },
    'specialisation-generale': { nom: 'Compétences Générales', ordre: 4 },
    personnage: { nom: 'Personnage', ordre: 5 },
    equipement: { nom: 'Équipement', ordre: 6 },
    histoire: { nom: 'Histoire', ordre: 7 },
    jeu: { nom: 'Notes de Jeu', ordre: 8 }
  }
};

module.exports = {
  engrenagesDataTypes
};