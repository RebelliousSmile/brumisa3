// ========================================
// src/utils/systemesJeu.js - Configuration des systèmes JDR (DRY)
// ========================================
const systemesJeu = {
  templates: {
    MONSTERHEARTS: {
      nom: "Monsterhearts",
      version: "2.0",
      description: "Drama surnaturel adolescent où vous incarnez des monstres",
      systeme: "PbtA",
      couleurs: {
        primaire: '#8b0000',
        secondaire: '#a52a2a',
        accent: '#ffeaa7'
      },
      infos_base: {
        champs: ['nom', 'skin', 'apparence', 'origine', 'yeux', 'style'],
        requis: ['nom', 'skin']
      },
      attributs: {
        chaud: { min: -1, max: 3, defaut: 0, description: "Charisme social, séduction" },
        froid: { min: -1, max: 3, defaut: 0, description: "Distance émotionnelle, calcul" },
        volatile: { min: -1, max: 3, defaut: 0, description: "Émotion explosive, imprévisibilité" },
        sombre: { min: -1, max: 3, defaut: 0, description: "Pouvoir surnaturel, corruption" }
      },
      skins: [
        'L\'Élu', 'La Fée', 'Le Fantôme', 'L\'Infernal', 'Le Mortel',
        'La Reine', 'Le Vampire', 'Le Loup-garou', 'La Sorcière', 'Le Serpentin'
      ],
      mouvements: {
        base: [
          'Exciter Quelqu\'un', 'Rabaisser Quelqu\'un', 'Rester Ferme', 
          'Attaquer Physiquement', 'Fuir', 'Scruter l\'Abîme'
        ]
      },
      conditions: ['Effrayé', 'En Colère', 'Désespéré', 'Perdu'],
      ressources: {
        blessures: { max: 4, description: "Dégâts physiques et émotionnels" },
        liens: { description: "Influence émotionnelle sur les autres" },
        experience: { max: 5, description: "Points d'expérience pour l'évolution" }
      }
    },

    SEPTIEME_MER: {
      nom: "7ème Mer (2e édition)",
      version: "2.0",
      description: "Aventures de cape et d'épée à l'âge de l'exploration",
      systeme: "7th Sea",
      couleurs: {
        primaire: '#1e4d72',
        secondaire: '#2980b9',
        accent: '#3498db'
      },
      infos_base: {
        champs: ['nom', 'nation', 'religion', 'societe_secrete', 'reputation', 'richesse'],
        requis: ['nom', 'nation']
      },
      attributs: {
        puissance: { min: 1, max: 5, defaut: 2, description: "Force physique et endurance" },
        grace: { min: 1, max: 5, defaut: 2, description: "Agilité et dextérité" },
        esprit: { min: 1, max: 5, defaut: 2, description: "Intelligence et ruse" },
        resolution: { min: 1, max: 5, defaut: 2, description: "Volonté et détermination" },
        panache: { min: 1, max: 5, defaut: 2, description: "Charisme et panache" }
      },
      competences: [
        'Athlète', 'Bagarre', 'Escalade', 'Convaincre', 'Empathie', 'Se Cacher', 
        'Intimider', 'Remarquer', 'Représentation', 'Équitation', 'Navigation', 
        'Érudition', 'Séduction', 'Vol', 'Guerre', 'Maniement d\'Armes'
      ],
      nations: [
        'Avalon', 'Castille', 'Eisen', 'Montaigne', 'Ussura', 'Vodacce', 'Vestenmannavnjar'
      ],
      ressources: {
        blessures: { calcul: "Puissance * 2 + 10", description: "Capacité à encaisser les dégâts" },
        points_heros: { description: "Points pour les actions dramatiques" },
        reputation: { description: "Position sociale" },
        richesse: { description: "Ressources financières" }
      }
    },

    ENGRENAGES: {
      nom: "Engrenages & Sortilèges",
      version: "1.0",
      description: "Fantasy steampunk avec magie et technologie",
      systeme: "Ecryme",
      couleurs: {
        primaire: '#8b4513',
        secondaire: '#cd853f',
        accent: '#daa520'
      },
      infos_base: {
        champs: ['nom', 'profession', 'origine', 'motivation', 'peur'],
        requis: ['nom', 'profession']
      },
      attributs: {
        corps: { min: 1, max: 5, defaut: 2, description: "Capacités physiques" },
        esprit: { min: 1, max: 5, defaut: 2, description: "Acuité mentale" },
        ame: { min: 1, max: 5, defaut: 2, description: "Force spirituelle" }
      },
      competences: [
        // Compétences Corps
        'Acrobatie', 'Athlétisme', 'Bagarre', 'Conduite', 'Déplacement Silencieux',
        'Discrétion', 'Équitation', 'Armes à Distance', 'Armes de Mêlée',
        // Compétences Esprit  
        'Artisanat', 'Érudition', 'Investigation', 'Médecine', 'Perception',
        'Pilotage', 'Survie',