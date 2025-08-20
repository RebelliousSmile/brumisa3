const { systemesJeu } = require('../config/systemesJeu');

// Fonctions utilitaires pour les systèmes de JDR
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
    return Object.entries(systemesJeu)
      .filter(([code, config]) => config.systeme === true)
      .map(([code, config]) => ({
        code,
        nom: config.nom,
        description: config.description,
        version: config.version
      }));
  },

  /**
   * Liste tous les systèmes avec leurs univers
   */
  getSystemesAvecUnivers() {
    return Object.entries(systemesJeu)
      .filter(([code, config]) => config.systeme === true)
      .map(([code, config]) => ({
        code,
        nom: config.nom,
        description: config.description,
        univers: config.univers ? Object.entries(config.univers).map(([univCode, univConfig]) => ({
          code: univCode,
          nom: univConfig.nom,
          description: univConfig.description,
          couleur: univConfig.couleur
        })) : null
      }));
  },

  /**
   * Récupère un univers spécifique d'un système
   */
  getUnivers(codeSysteme, codeUnivers) {
    const systeme = this.getSysteme(codeSysteme);
    if (!systeme || !systeme.univers) return null;
    return systeme.univers[codeUnivers] || null;
  },

  /**
   * Récupère la configuration complète (système + univers)
   */
  getConfigurationComplete(codeSysteme, codeUnivers = null) {
    const systeme = this.getSysteme(codeSysteme);
    if (!systeme) return null;

    if (!codeUnivers || !systeme.univers) {
      return systeme;
    }

    const univers = systeme.univers[codeUnivers];
    if (!univers) return systeme;

    // Fusionner les configurations
    return {
      ...systeme,
      ...univers,
      systeme_parent: codeSysteme,
      univers_id: codeUnivers,
      // Garder les attributs du système parent s'ils ne sont pas redéfinis
      attributs: univers.attributs || systeme.attributs,
      mechanics: { ...systeme.mechanics, ...(univers.mechanics_specifiques || {}) }
    };
  },

  /**
   * Récupère les noms des systèmes pour sélection
   */
  getSystemesListe() {
    return Object.entries(systemesJeu)
      .filter(([code, config]) => config.systeme === true)
      .map(([code, systeme]) => ({
        code,
        nom: systeme.nom,
        description: systeme.description,
        hasUnivers: !!systeme.univers
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
    const SystemThemeService = require('../services/SystemThemeService');
    return SystemThemeService.getTheme(codeSysteme);
  },

  /**
   * Vérifie si un skin/archetype est valide pour un système
   */
  validerSkin(codeSysteme, skin) {
    const systeme = this.getSysteme(codeSysteme);
    if (!systeme || !systeme.skins) return true; // Pas de validation si pas de skins définis
    
    // Support des anciens formats (array) et nouveaux formats (object)
    if (Array.isArray(systeme.skins)) {
      return systeme.skins.includes(skin);
    } else {
      return Object.keys(systeme.skins).includes(skin);
    }
  },

  /**
   * Récupère le nom affiché d'une skin
   * @param {string} codeSysteme - Code du système
   * @param {string} skinCode - Code de la skin
   * @returns {string} Nom affiché de la skin
   */
  getSkinDisplayName(codeSysteme, skinCode) {
    const systeme = this.getSysteme(codeSysteme);
    if (!systeme || !systeme.skins) return skinCode;
    
    if (Array.isArray(systeme.skins)) {
      return skinCode;
    } else {
      return systeme.skins[skinCode] || skinCode;
    }
  },

  /**
   * Convertit les données de personnage vers le format template Monsterhearts
   * @param {Object} personnageData - Données brutes du personnage
   * @returns {Object} Données formatées pour le template
   */
  formatForMonsterheartsTemplate(personnageData) {
    // Monsterhearts est maintenant un univers de PBTA
    const config = this.getConfigurationComplete('pbta', 'monsterhearts');
    if (!config) return personnageData;

    return {
      nom: personnageData.nom || personnageData.name || '',
      donnees_personnage: {
        apparence: personnageData.appearance || personnageData.apparence || '',
        regard: personnageData.eyes || personnageData.regard || '',
        origine: personnageData.origin || personnageData.origine || '',
        skin: personnageData.skin || '',
        stats: {
          hot: personnageData.stats?.hot || 0,
          cold: personnageData.stats?.cold || 0,
          volatile: personnageData.stats?.volatile || 0,
          dark: personnageData.stats?.dark || 0
        },
        moves: {
          basic: this.formatMovesForTemplate(personnageData.moves?.basic, config.moves?.basic || []),
          skin: this.formatMovesForTemplate(personnageData.moves?.skin || [], [])
        },
        harm: this.formatTrackForTemplate(personnageData.harm, 4),
        conditions: this.formatConditionsForTemplate(personnageData.conditions, config.mechanics_specifiques?.conditions || []),
        experience: {
          current: personnageData.experience?.current || 0
        },
        strings: this.formatStringsForTemplate(personnageData.strings || []),
        backstory: personnageData.backstory || personnageData.background?.story || '',
        darkestSelf: personnageData.darkestSelf || personnageData.background?.darkestSelf || ''
      },
      notes_privees: personnageData.notes?.player || personnageData.notes_privees || ''
    };
  },

  /**
   * Formate les moves pour le template
   * @param {Array} playerMoves - Moves du joueur
   * @param {Array} availableMoves - Moves disponibles du système
   * @returns {Array} Moves formatées
   */
  formatMovesForTemplate(playerMoves = [], availableMoves = []) {
    return availableMoves.map(move => ({
      checked: playerMoves.some(pm => pm.code === move.code || pm.nom === move.nom),
      description: `<strong>${move.nom}</strong>: ${move.description}`
    }));
  },

  /**
   * Formate un track (harm, xp) pour le template
   * @param {Array|number} trackData - Données du track
   * @param {number} maxTrack - Maximum du track
   * @returns {Array} Track formaté
   */
  formatTrackForTemplate(trackData, maxTrack) {
    if (Array.isArray(trackData)) {
      return trackData.slice(0, maxTrack);
    }
    
    const track = [];
    for (let i = 0; i < maxTrack; i++) {
      track.push(i < (trackData || 0));
    }
    return track;
  },

  /**
   * Formate les conditions pour le template
   * @param {Array} playerConditions - Conditions du joueur
   * @param {Array} availableConditions - Conditions disponibles
   * @returns {Array} Conditions formatées
   */
  formatConditionsForTemplate(playerConditions = [], availableConditions = []) {
    return availableConditions.map(condition => ({
      name: condition.nom,
      active: playerConditions.some(pc => pc.code === condition.code || pc.nom === condition.nom)
    }));
  },

  /**
   * Formate les strings pour le template
   * @param {Array} strings - Strings du joueur
   * @returns {Array} Strings formatées
   */
  formatStringsForTemplate(strings = []) {
    return strings.map(string => ({
      character: string.character || string.personnage || '',
      value: string.value || string.valeur || 0
    }));
  },

  /**
   * Récupère les mécaniques spécifiques d'un système
   */
  getMecaniques(codeSysteme) {
    const systeme = this.getSysteme(codeSysteme);
    return systeme ? systeme.mechanics : {};
  }
};

module.exports = SystemeUtils;