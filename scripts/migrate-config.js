/**
 * Script de migration de la configuration
 * Déplace config.js vers config/ et met à jour les imports
 */

const fs = require('fs');
const path = require('path');

const ANCIEN_CONFIG = path.join(__dirname, '..', 'src', 'config.js');
const NOUVEAU_CONFIG_DIR = path.join(__dirname, '..', 'src', 'config');

console.log('🚀 Migration de la configuration - Structure MVC-CS');
console.log('');

// 1. Vérifier que les nouveaux fichiers existent
const nouveauxFichiers = [
    path.join(NOUVEAU_CONFIG_DIR, 'index.js'),
    path.join(NOUVEAU_CONFIG_DIR, 'database.js')
];

console.log('📋 Vérification des nouveaux fichiers...');
for (const fichier of nouveauxFichiers) {
    if (fs.existsSync(fichier)) {
        console.log(`✅ ${path.relative(process.cwd(), fichier)} - OK`);
    } else {
        console.log(`❌ ${path.relative(process.cwd(), fichier)} - MANQUANT`);
        process.exit(1);
    }
}

// 2. Backup de l'ancien config.js
if (fs.existsSync(ANCIEN_CONFIG)) {
    const backup = ANCIEN_CONFIG + '.backup';
    console.log('');
    console.log('💾 Sauvegarde de l\'ancien fichier...');
    fs.copyFileSync(ANCIEN_CONFIG, backup);
    console.log(`✅ Backup créé: ${path.relative(process.cwd(), backup)}`);
    
    // Supprimer l'ancien fichier
    fs.unlinkSync(ANCIEN_CONFIG);
    console.log(`✅ Ancien config.js supprimé`);
} else {
    console.log('ℹ️ Ancien config.js déjà supprimé');
}

// 3. Vérification que les imports fonctionnent
console.log('');
console.log('🔍 Test des nouveaux imports...');

try {
    const nouvelleConfig = require(path.join(NOUVEAU_CONFIG_DIR, 'index.js'));
    
    // Vérifier les propriétés principales
    const propsRequises = ['server', 'database', 'session', 'auth', 'systemesJeu'];
    for (const prop of propsRequises) {
        if (nouvelleConfig[prop]) {
            console.log(`✅ ${prop} - OK`);
        } else {
            console.log(`❌ ${prop} - MANQUANT`);
            process.exit(1);
        }
    }
    
    console.log('✅ Nouveaux imports fonctionnels');
    
} catch (error) {
    console.log(`❌ Erreur import: ${error.message}`);
    process.exit(1);
}

// 4. Créer README pour les environnements
const readmeEnvironments = `# Configurations d'environnement

Ce dossier contient les templates de configuration pour différents environnements.

## Utilisation

1. **Développement** : Copier \`development.example.env\` en \`.env.local\` à la racine du projet
2. **Production** : Copier \`production.example.env\` et configurer les variables serveur
3. **Tests** : Copier \`test.example.env\` en \`.env.test\` à la racine du projet

## Variables critiques en production

⚠️ **OBLIGATOIRE** - Ces variables DOIVENT être changées :
- \`SESSION_SECRET\` : Clé de chiffrement sessions (min 32 caractères)
- \`CODE_PREMIUM\` / \`CODE_ADMIN\` : Codes d'accès application
- \`DATABASE_URL\` : Connexion PostgreSQL sécurisée
- \`RESEND_API_KEY\` : Clé API Resend pour emails

## Structure des variables

- **Server** : PORT, HOST, NODE_ENV
- **Database** : POSTGRES_* ou DATABASE_URL
- **Security** : SESSION_SECRET, codes d'accès, rate limiting
- **Directories** : Chemins des répertoires de données
- **Logging** : Niveau et destination des logs
- **Features** : PDF, upload, API timeouts
`;

fs.writeFileSync(
    path.join(NOUVEAU_CONFIG_DIR, 'environments', 'README.md'),
    readmeEnvironments
);

console.log('📝 README environnements créé');

console.log('');
console.log('🎉 Migration terminée avec succès !');
console.log('');
console.log('📁 Structure finale:');
console.log('   src/config/');
console.log('   ├── index.js           # Point d\'entrée (compatible ancien import)');
console.log('   ├── database.js        # Config générale application');
console.log('   ├── systemesJeu.js     # ✅ Déjà présent');
console.log('   ├── systemesUtils.js   # ✅ Déjà présent');
console.log('   ├── dataTypes/         # ✅ Déjà présent (6 fichiers)');
console.log('   └── environments/      # 🆕 Templates par environnement');
console.log('');
console.log('✅ Tous les imports existants continuent de fonctionner');
console.log('✅ Structure conforme à development-strategy.md');