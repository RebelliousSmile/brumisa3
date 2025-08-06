// Index principal des types de données pour chaque système de jeu
const { monsterheartsDataTypes } = require('./monsterhearts');
const { engrenagesDataTypes } = require('./engrenages');
const { metro2033DataTypes } = require('./metro2033');
const { mistEngineDataTypes } = require('./mistengine');
const { zombiologyDataTypes } = require('./zombiology');

// Structure commune pour tous les systèmes
const dataTypesStructure = {
  traits: {
    description: 'Caractéristiques hiérarchiques avec valeurs (nombre, pourcentage, booléen) et catégories'
  },
  reserves: {
    description: 'Jauges avec min, max et valeur courante (santé, stress, ressources)'
  },
  descriptions: {
    description: 'Éléments textuels non-hiérarchiques avec markdown (identité, équipement, relations)'
  },
  images: {
    description: 'Fichiers image avec ordre, légende et métadonnées'
  }
};

// Export centralisé de tous les types de données
const gameDataTypes = {
  monsterhearts: monsterheartsDataTypes,
  engrenages: engrenagesDataTypes,
  metro2033: metro2033DataTypes,
  mistengine: mistEngineDataTypes,
  zombiology: zombiologyDataTypes
};

// Fonction utilitaire pour obtenir les types de données d'un système
const getDataTypesForSystem = (systemCode) => {
  if (!gameDataTypes[systemCode]) {
    throw new Error(`Système de jeu inconnu: ${systemCode}`);
  }
  return gameDataTypes[systemCode];
};

// Fonction pour valider la structure des données d'un personnage
const validateCharacterData = (systemCode, characterData) => {
  const dataTypes = getDataTypesForSystem(systemCode);
  const errors = [];
  
  // Validation des traits
  if (characterData.traits) {
    Object.entries(characterData.traits).forEach(([key, value]) => {
      // Vérifier que le trait existe dans la configuration
      let traitDef = null;
      
      // Chercher dans toutes les sections de traits
      Object.values(dataTypes.traits).forEach(section => {
        if (section[key]) traitDef = section[key];
        else if (Array.isArray(section)) {
          const found = section.find(t => t.code === key);
          if (found) traitDef = found;
        }
      });
      
      if (!traitDef) {
        errors.push(`Trait inconnu: ${key}`);
      } else if (traitDef.type === 'nombre' || traitDef.type === 'pourcentage') {
        if (value < traitDef.min || value > traitDef.max) {
          errors.push(`${key}: valeur ${value} hors limites [${traitDef.min}-${traitDef.max}]`);
        }
      }
    });
  }
  
  // Validation des réserves
  if (characterData.reserves) {
    Object.entries(characterData.reserves).forEach(([key, value]) => {
      const reserveDef = dataTypes.reserves[key];
      if (!reserveDef) {
        errors.push(`Réserve inconnue: ${key}`);
      } else if (typeof value.current === 'number') {
        if (value.current < reserveDef.min || (reserveDef.max && value.current > reserveDef.max)) {
          errors.push(`${key}: valeur courante ${value.current} hors limites`);
        }
      }
    });
  }
  
  return { valid: errors.length === 0, errors };
};

// Export des fonctions et constantes
module.exports = {
  dataTypesStructure,
  gameDataTypes,
  getDataTypesForSystem,
  validateCharacterData,
  
  // Export direct pour compatibilité
  monsterheartsDataTypes,
  engrenagesDataTypes,
  metro2033DataTypes,
  mistEngineDataTypes,
  zombiologyDataTypes
};