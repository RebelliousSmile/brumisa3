#!/usr/bin/env node

/**
 * Script d'injection d'oracles en ligne de commande
 * Usage: node scripts/injecter-oracle.js [fichier.json] [--jeu=nom] [--admin-id=123]
 */

const path = require('path');
const fs = require('fs').promises;

// Configuration de l'environnement
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Import des services
const Oracle = require('../src/models/Oracle');
const OracleItem = require('../src/models/OracleItem');
const db = require('../src/database/db');

/**
 * Affichage de l'aide
 */
function afficherAide() {
    console.log(`
🎲 Script d'injection d'oracles pour JDR
=======================================

Usage:
  node scripts/injecter-oracle.js [options]

Options:
  --fichier=PATH        Fichier JSON à importer
  --jeu=NOM            Nom du jeu (monsterhearts, engrenages, metro, mist)
  --admin-id=ID        ID de l'admin créateur (défaut: 1)
  --premium            Marquer l'oracle comme premium
  --inactif            Créer l'oracle inactif
  --help               Afficher cette aide

Modes d'utilisation:
  1. Interactif:       node scripts/injecter-oracle.js
  2. Depuis fichier:   node scripts/injecter-oracle.js --fichier=oracle.json
  3. Rapide:          node scripts/injecter-oracle.js --jeu=monsterhearts

Exemples:
  # Mode interactif
  node scripts/injecter-oracle.js
  
  # Import fichier JSON
  node scripts/injecter-oracle.js --fichier=oracles_monsterhearts_relations.json
  
  # Création rapide pour un jeu
  node scripts/injecter-oracle.js --jeu=monsterhearts --premium
  
  # Import batch de tous les oracles Monsterhearts
  node scripts/injecter-oracle.js --batch=monsterhearts

Format JSON attendu:
{
  "oracle": {
    "name": "Nom de l'oracle",
    "description": "Description de l'oracle",
    "premium_required": false,
    "is_active": true
  },
  "items": [
    {
      "value": "Résultat du tirage",
      "weight": 10,
      "metadata": {"type": "exemple"},
      "is_active": true
    }
  ]
}
`);
}

/**
 * Parse les arguments de ligne de commande
 */
function parseArguments() {
    const args = process.argv.slice(2);
    const options = {
        fichier: null,
        jeu: null,
        adminId: 1,
        premium: false,
        inactif: false,
        batch: null,
        help: false
    };

    args.forEach(arg => {
        if (arg === '--help') {
            options.help = true;
        } else if (arg.startsWith('--fichier=')) {
            options.fichier = arg.split('=')[1];
        } else if (arg.startsWith('--jeu=')) {
            options.jeu = arg.split('=')[1];
        } else if (arg.startsWith('--admin-id=')) {
            options.adminId = parseInt(arg.split('=')[1]) || 1;
        } else if (arg.startsWith('--batch=')) {
            options.batch = arg.split('=')[1];
        } else if (arg === '--premium') {
            options.premium = true;
        } else if (arg === '--inactif') {
            options.inactif = true;
        } else if (!arg.startsWith('--')) {
            // Premier argument sans -- est considéré comme fichier
            options.fichier = arg;
        }
    });

    return options;
}

/**
 * Lecture interactive des paramètres
 */
async function saisieInteractive() {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const question = (query) => new Promise(resolve => readline.question(query, resolve));

    console.log('🎲 Mode interactif - Création d\'oracle');
    console.log('=====================================\n');

    const nom = await question('📝 Nom de l\'oracle: ');
    const description = await question('📄 Description: ');
    const jeu = await question('🎮 Jeu (monsterhearts/engrenages/metro/mist) [optionnel]: ');
    const premium = (await question('👑 Accès premium requis ? (o/N): ')).toLowerCase() === 'o';
    
    console.log('\n📋 Ajout des éléments (tapez "fin" pour terminer):');
    const items = [];
    let index = 1;
    
    while (true) {
        const value = await question(`🎯 Élément ${index} (valeur): `);
        if (value.toLowerCase() === 'fin' || !value.trim()) break;
        
        const weight = parseInt(await question(`⚖️  Poids [10]: `)) || 10;
        const type = await question(`🏷️  Type [optionnel]: `);
        
        const item = {
            value: value.trim(),
            weight: weight,
            is_active: true
        };
        
        if (type.trim()) {
            item.metadata = { type: type.trim() };
        }
        
        items.push(item);
        index++;
    }
    
    readline.close();
    
    return {
        oracle: {
            name: nom.trim(),
            description: description.trim(),
            premium_required: premium,
            is_active: true
        },
        items: items,
        jeu: jeu.trim() || null
    };
}

/**
 * Templates d'oracles prédéfinis par jeu
 */
function getTemplateOracle(jeu) {
    const templates = {
        monsterhearts: {
            oracle: {
                name: `Oracle ${jeu} - À définir`,
                description: "Oracle pour l'univers des adolescents monstres",
                premium_required: false,
                is_active: true
            },
            items: [
                { value: "Révélation choquante sur ton passé", weight: 15, metadata: { type: "révélation" }, is_active: true },
                { value: "Quelqu'un découvre ta vraie nature", weight: 20, metadata: { type: "identité" }, is_active: true },
                { value: "Triangle amoureux compliqué", weight: 18, metadata: { type: "relation" }, is_active: true },
                { value: "Tes émotions déclenchent tes pouvoirs", weight: 12, metadata: { type: "pouvoir" }, is_active: true },
                { value: "Conflit avec une figure d'autorité", weight: 10, metadata: { type: "autorité" }, is_active: true }
            ]
        },
        engrenages: {
            oracle: {
                name: `Oracle ${jeu} - À définir`,
                description: "Oracle pour l'univers steampunk et magie",
                premium_required: false,
                is_active: true
            },
            items: [
                { value: "Dysfonctionnement mécanique critique", weight: 15, metadata: { type: "mécanique" }, is_active: true },
                { value: "Découverte d'un artefact ancien", weight: 12, metadata: { type: "artefact" }, is_active: true },
                { value: "Intrigue politique dans les hautes sphères", weight: 18, metadata: { type: "politique" }, is_active: true },
                { value: "Manifestation magique inattendue", weight: 14, metadata: { type: "magie" }, is_active: true },
                { value: "Sabotage industriel", weight: 11, metadata: { type: "sabotage" }, is_active: true }
            ]
        },
        metro: {
            oracle: {
                name: `Oracle ${jeu} - À définir`,
                description: "Oracle pour l'univers post-apocalyptique du métro",
                premium_required: false,
                is_active: true
            },
            items: [
                { value: "Créature mutante agressive", weight: 20, metadata: { type: "créature" }, is_active: true },
                { value: "Panne d'équipement vital", weight: 16, metadata: { type: "équipement" }, is_active: true },
                { value: "Rencontre avec des survivants hostiles", weight: 15, metadata: { type: "humains" }, is_active: true },
                { value: "Zone de radiation élevée", weight: 12, metadata: { type: "environnement" }, is_active: true },
                { value: "Ressource rare découverte", weight: 8, metadata: { type: "ressource" }, is_active: true }
            ]
        },
        mist: {
            oracle: {
                name: `Oracle ${jeu} - À définir`,
                description: "Oracle pour l'univers d'horreur et mystère",
                premium_required: false,
                is_active: true
            },
            items: [
                { value: "Présence surnaturelle menaçante", weight: 18, metadata: { type: "surnaturel" }, is_active: true },
                { value: "Indice troublant sur le passé", weight: 15, metadata: { type: "indice" }, is_active: true },
                { value: "Hallucination ou réalité ?", weight: 14, metadata: { type: "perception" }, is_active: true },
                { value: "Communication cryptique", weight: 12, metadata: { type: "communication" }, is_active: true },
                { value: "Objet maudit ou hanté", weight: 10, metadata: { type: "objet" }, is_active: true }
            ]
        }
    };
    
    return templates[jeu] || null;
}

/**
 * Import batch d'oracles pour un jeu
 */
async function importBatch(jeu, adminId) {
    console.log(`🔄 Import batch des oracles ${jeu}...`);
    
    const oracleFiles = [
        `oracles_${jeu}_revelations.json`,
        `oracles_${jeu}_relations.json`, 
        `oracles_${jeu}_monstruosites.json`,
        `oracles_${jeu}_evenements.json`
    ];
    
    let importes = 0;
    let erreurs = 0;
    
    for (const filename of oracleFiles) {
        const filepath = path.join(__dirname, '..', filename);
        
        try {
            await fs.access(filepath);
            console.log(`📥 Import de ${filename}...`);
            
            const contenu = await fs.readFile(filepath, 'utf-8');
            const donnees = JSON.parse(contenu);
            
            await creerOracle(donnees, adminId);
            importes++;
            console.log(`✅ ${filename} importé`);
            
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log(`⚠️  Fichier ${filename} non trouvé, ignoré`);
            } else {
                console.log(`❌ Erreur avec ${filename}:`, error.message);
                erreurs++;
            }
        }
    }
    
    console.log(`\n📊 Résultats batch:`);
    console.log(`   ✅ Importés: ${importes}`);
    console.log(`   ❌ Erreurs: ${erreurs}`);
    
    return { importes, erreurs };
}

/**
 * Validation des données d'oracle
 */
function validerDonnees(donnees) {
    const erreurs = [];
    
    if (!donnees.oracle) {
        erreurs.push("Propriété 'oracle' manquante");
    } else {
        if (!donnees.oracle.name || !donnees.oracle.name.trim()) {
            erreurs.push("Nom de l'oracle requis");
        }
    }
    
    if (!donnees.items || !Array.isArray(donnees.items)) {
        erreurs.push("Propriété 'items' manquante ou invalide");
    } else {
        if (donnees.items.length === 0) {
            erreurs.push("Au moins un élément requis");
        }
        
        donnees.items.forEach((item, index) => {
            if (!item.value || !item.value.trim()) {
                erreurs.push(`Élément ${index + 1}: valeur requise`);
            }
            if (item.weight && (typeof item.weight !== 'number' || item.weight <= 0)) {
                erreurs.push(`Élément ${index + 1}: poids invalide`);
            }
        });
    }
    
    return erreurs;
}

/**
 * Création de l'oracle en base de données
 */
async function creerOracle(donnees, adminId) {
    return await db.transaction(async (tx) => {
        const oracleModel = new Oracle();
        const oracleItemModel = new OracleItem();
        
        // Créer l'oracle
        const oracleData = {
            ...donnees.oracle,
            created_by: adminId
        };
        
        const oracle = await oracleModel.create(oracleData);
        console.log(`   📝 Oracle créé: ${oracle.name} (ID: ${oracle.id})`);
        
        // Créer les éléments
        let totalWeight = 0;
        for (const itemData of donnees.items) {
            const item = await oracleItemModel.create({
                oracle_id: oracle.id,
                value: itemData.value,
                weight: itemData.weight || 1,
                metadata: itemData.metadata || null,
                is_active: itemData.is_active !== false
            });
            totalWeight += item.weight;
        }
        
        console.log(`   🎯 ${donnees.items.length} éléments créés (poids total: ${totalWeight})`);
        
        return oracle;
    });
}

/**
 * Fonction principale
 */
async function main() {
    console.log('🎲 Injecteur d\'oracles JDR');
    console.log('==========================\n');
    
    const options = parseArguments();
    
    if (options.help) {
        afficherAide();
        return;
    }
    
    try {
        let donnees;
        
        // Mode batch
        if (options.batch) {
            const result = await importBatch(options.batch, options.adminId);
            console.log('\n🎉 Import batch terminé !');
            return;
        }
        
        // Mode fichier
        if (options.fichier) {
            console.log(`📂 Lecture du fichier: ${options.fichier}`);
            const contenu = await fs.readFile(options.fichier, 'utf-8');
            donnees = JSON.parse(contenu);
        }
        // Mode template jeu
        else if (options.jeu) {
            console.log(`🎮 Utilisation du template pour: ${options.jeu}`);
            donnees = getTemplateOracle(options.jeu);
            if (!donnees) {
                console.log(`❌ Jeu '${options.jeu}' non reconnu`);
                console.log('   Jeux disponibles: monsterhearts, engrenages, metro, mist');
                return;
            }
        }
        // Mode interactif
        else {
            donnees = await saisieInteractive();
        }
        
        // Appliquer les options
        if (options.premium) {
            donnees.oracle.premium_required = true;
        }
        if (options.inactif) {
            donnees.oracle.is_active = false;
        }
        
        // Validation
        console.log('\n🔍 Validation des données...');
        const erreurs = validerDonnees(donnees);
        if (erreurs.length > 0) {
            console.log('❌ Erreurs de validation:');
            erreurs.forEach(erreur => console.log(`   • ${erreur}`));
            return;
        }
        console.log('✅ Données valides');
        
        // Création
        console.log('\n💾 Création de l\'oracle en base...');
        const oracle = await creerOracle(donnees, options.adminId);
        
        console.log('\n🎉 Oracle créé avec succès !');
        console.log(`   📝 Nom: ${oracle.name}`);
        console.log(`   🆔 ID: ${oracle.id}`);
        console.log(`   👑 Premium: ${oracle.premium_required ? 'Oui' : 'Non'}`);
        console.log(`   ✅ Actif: ${oracle.is_active ? 'Oui' : 'Non'}`);
        console.log(`   🌐 URL: http://localhost:3074/oracles/${oracle.id}`);
        
        if (donnees.jeu) {
            console.log(`   🎮 Jeu: ${donnees.jeu}`);
        }
        
    } catch (error) {
        console.log('\n❌ Erreur lors de la création:');
        console.log(`   ${error.message}`);
        if (process.env.NODE_ENV === 'development') {
            console.log('\nStack trace:');
            console.log(error.stack);
        }
        process.exit(1);
    }
}

// Gestion de la fermeture propre
process.on('SIGINT', () => {
    console.log('\n👋 Arrêt du script...');
    process.exit(0);
});

// Lancement
if (require.main === module) {
    main().catch(console.error);
}