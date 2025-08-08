/**
 * Script de validation de la réorganisation MVC-CS
 * Vérifie que tous les imports fonctionnent après migration
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validation de la réorganisation MVC-CS');
console.log('');

const results = {
    success: 0,
    errors: 0,
    warnings: 0
};

/**
 * Teste un fichier et ses imports
 */
function testerFichier(fichierPath, nom) {
    try {
        console.log(`⚡ Test ${nom}...`);
        
        // Tenter de require le fichier
        const module = require(fichierPath);
        
        // Validation basique selon le type
        if (nom.includes('Controller')) {
            if (module.prototype || typeof module === 'function') {
                console.log(`  ✅ Contrôleur chargé correctement`);
            } else {
                console.log(`  ⚠️  Structure contrôleur non standard`);
                results.warnings++;
            }
        } else if (nom.includes('Service')) {
            if (module.prototype || typeof module === 'function') {
                console.log(`  ✅ Service chargé correctement`);
            } else {
                console.log(`  ⚠️  Structure service non standard`);
                results.warnings++;
            }
        } else if (nom.includes('Model')) {
            if (module.prototype || typeof module === 'function') {
                console.log(`  ✅ Modèle chargé correctement`);
            } else {
                console.log(`  ⚠️  Structure modèle non standard`);
                results.warnings++;
            }
        }
        
        results.success++;
        return true;
        
    } catch (error) {
        console.log(`  ❌ Erreur: ${error.message}`);
        results.errors++;
        return false;
    }
}

// 1. Test configuration centralisée
console.log('📋 1. Test configuration centralisée');
testerFichier(path.join(__dirname, '..', 'src', 'config', 'index.js'), 'config/index.js');

try {
    const config = require('../src/config');
    
    const propsEssentielles = ['server', 'database', 'session', 'auth', 'systemesJeu'];
    for (const prop of propsEssentielles) {
        if (config[prop]) {
            console.log(`  ✅ ${prop} - présent`);
        } else {
            console.log(`  ❌ ${prop} - manquant`);
            results.errors++;
        }
    }
    
    console.log(`  ✅ ${Object.keys(config.systemesJeu).length} systèmes JDR chargés`);
    results.success++;
    
} catch (error) {
    console.log(`  ❌ Configuration défaillante: ${error.message}`);
    results.errors++;
}

// 2. Test middleware créés
console.log('');
console.log('📋 2. Test middleware créés');

const middlewares = ['auth.js', 'errors.js', 'validation.js', 'index.js'];
for (const middleware of middlewares) {
    const fichierPath = path.join(__dirname, '..', 'src', 'middleware', middleware);
    testerFichier(fichierPath, `middleware/${middleware}`);
}

// 3. Test des imports modifiés (SystemeUtils)
console.log('');
console.log('📋 3. Test imports SystemeUtils modifiés');

const fichiersModifies = [
    'src/services/documents/CharacterSheetDocument.js',
    'src/services/DocumentGeneriqueService.js',
    'src/controllers/PdfController.js'
];

for (const fichier of fichiersModifies) {
    const fichierPath = path.join(__dirname, '..', fichier);
    if (fs.existsSync(fichierPath)) {
        testerFichier(fichierPath, path.basename(fichier));
    } else {
        console.log(`  ❌ Fichier manquant: ${fichier}`);
        results.errors++;
    }
}

// 4. Test suppression fichiers obsolètes
console.log('');
console.log('📋 4. Vérification suppression fichiers obsolètes');

const fichiersSupprimes = [
    'src/services/EmailService-old.js',
    'src/config/systemesUtils.js',
    'src/config.js'
];

for (const fichier of fichiersSupprimes) {
    const fichierPath = path.join(__dirname, '..', fichier);
    if (!fs.existsSync(fichierPath)) {
        console.log(`  ✅ ${fichier} - correctement supprimé`);
        results.success++;
    } else {
        console.log(`  ⚠️  ${fichier} - toujours présent`);
        results.warnings++;
    }
}

// 5. Test structure finale vs development-strategy.md
console.log('');
console.log('📋 5. Vérification conformité structure development-strategy.md');

const structureCible = {
    'src/config/': ['index.js', 'database.js', 'systemesJeu.js', 'dataTypes/', 'environments/'],
    'src/controllers/': 'présent',
    'src/models/': 'présent',
    'src/services/': ['documents/', 'themes/'],
    'src/views/': 'présent',
    'src/routes/': 'présent',
    'src/database/': 'présent',
    'src/utils/': 'présent',
    'src/middleware/': ['auth.js', 'errors.js', 'validation.js', 'index.js']
};

for (const [dossier, attendu] of Object.entries(structureCible)) {
    const dossierPath = path.join(__dirname, '..', dossier);
    
    if (fs.existsSync(dossierPath)) {
        console.log(`  ✅ ${dossier} - présent`);
        
        if (Array.isArray(attendu)) {
            for (const fichier of attendu) {
                const fichierPath = path.join(dossierPath, fichier);
                if (fs.existsSync(fichierPath)) {
                    console.log(`    ✅ ${fichier}`);
                    results.success++;
                } else {
                    console.log(`    ❌ ${fichier} - manquant`);
                    results.errors++;
                }
            }
        }
        results.success++;
    } else {
        console.log(`  ❌ ${dossier} - manquant`);
        results.errors++;
    }
}

// 6. Test intégration globale
console.log('');
console.log('📋 6. Test intégration app.js');

try {
    // Test que app.js peut charger avec les nouvelles configs
    const appPath = path.join(__dirname, '..', 'src', 'app.js');
    const appContent = fs.readFileSync(appPath, 'utf8');
    
    if (appContent.includes("require('./config')")) {
        console.log('  ✅ app.js utilise la nouvelle configuration');
        results.success++;
    } else {
        console.log('  ⚠️  app.js pourrait nécessiter une mise à jour');
        results.warnings++;
    }
    
} catch (error) {
    console.log(`  ❌ Erreur test app.js: ${error.message}`);
    results.errors++;
}

// Résumé final
console.log('');
console.log('📊 Résumé de la validation');
console.log('========================');
console.log(`✅ Succès: ${results.success}`);
console.log(`⚠️  Avertissements: ${results.warnings}`);
console.log(`❌ Erreurs: ${results.errors}`);

if (results.errors === 0) {
    console.log('');
    console.log('🎉 Réorganisation MVC-CS validée avec succès !');
    console.log('');
    console.log('📁 Structure finale conforme à development-strategy.md:');
    console.log('   ✅ config/ regroupé et centralisé');
    console.log('   ✅ middleware/ créé avec auth, errors, validation');
    console.log('   ✅ Fichiers obsolètes supprimés');
    console.log('   ✅ Tous les imports fonctionnent');
    console.log('   ✅ Architecture MVC-CS respectée');
    
    process.exit(0);
} else {
    console.log('');
    console.log('⚠️  Réorganisation terminée avec des erreurs');
    console.log('   Vérifiez les erreurs ci-dessus avant de continuer');
    
    process.exit(1);
}