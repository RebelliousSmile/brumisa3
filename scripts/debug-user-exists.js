/**
 * Script pour vérifier si l'utilisateur activation@brumisa3.fr existe
 */

const UtilisateurService = require('../src/services/UtilisateurService');
require('dotenv').config({ path: '.env.local' });

async function checkUserExists() {
    console.log('🔍 Vérification de l\'existence de l\'utilisateur...');
    
    const testEmail = process.env.RESEND_FROM_EMAIL || 'activation@brumisa3.fr';
    console.log(`📧 Email testé: ${testEmail}`);
    console.log('');

    try {
        const utilisateurService = new UtilisateurService();
        
        // Méthode 1: Chercher l'utilisateur directement
        console.log('1️⃣ Recherche directe de l\'utilisateur...');
        const Utilisateur = require('../src/models/Utilisateur');
        const utilisateurModel = new Utilisateur();
        
        const utilisateur = await utilisateurModel.findOne('email = ?', [testEmail]);
        
        if (utilisateur) {
            console.log('✅ Utilisateur trouvé:', {
                id: utilisateur.id,
                nom: utilisateur.nom,
                email: utilisateur.email,
                role: utilisateur.role,
                actif: utilisateur.actif
            });
        } else {
            console.log('❌ Utilisateur non trouvé dans la base de données');
            console.log('');
            console.log('🎯 CAUSE DU PROBLÈME:');
            console.log('   L\'endpoint répond "succes: true" mais n\'envoie pas d\'email');
            console.log('   car l\'utilisateur n\'existe pas dans la base.');
            console.log('');
            console.log('💡 SOLUTIONS:');
            console.log('   1. Créer l\'utilisateur activation@brumisa3.fr');
            console.log('   2. Tester avec un email d\'utilisateur existant');
            console.log('   3. Utiliser un autre email configuré');
        }
        
        console.log('');

        // Méthode 2: Test avec genererTokenRecuperation
        console.log('2️⃣ Test avec genererTokenRecuperation...');
        const tokenResult = await utilisateurService.genererTokenRecuperation(testEmail);
        
        if (tokenResult) {
            console.log('✅ Token de récupération généré:', {
                token_length: tokenResult.token.length,
                utilisateur_nom: tokenResult.utilisateur.nom
            });
        } else {
            console.log('❌ Aucun token généré (utilisateur inexistant)');
        }
        
        console.log('');

        // Méthode 3: Lister quelques utilisateurs existants pour info
        console.log('3️⃣ Exemples d\'utilisateurs existants...');
        const utilisateursExistants = await utilisateurModel.findAll(null, null, 'created_at DESC', 5);
        
        if (utilisateursExistants.length > 0) {
            console.log('📋 Utilisateurs dans la base:');
            utilisateursExistants.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.email} (${user.nom})`);
            });
        } else {
            console.log('❌ Aucun utilisateur dans la base');
        }

    } catch (error) {
        console.error('❌ Erreur lors de la vérification:', error.message);
        console.error(error.stack);
    }
}

// Fonction pour créer l'utilisateur de test si nécessaire
async function createTestUserIfNeeded() {
    const testEmail = process.env.RESEND_FROM_EMAIL || 'activation@brumisa3.fr';
    
    console.log('');
    console.log('🛠️ Voulez-vous créer l\'utilisateur de test?');
    console.log('   (Vous devrez exécuter ce script avec --create pour le faire)');
    
    if (process.argv.includes('--create')) {
        try {
            const UtilisateurService = require('../src/services/UtilisateurService');
            const utilisateurService = new UtilisateurService();
            
            const userData = {
                nom: 'Admin Test',
                email: testEmail,
                motDePasse: 'motdepasse123',
                role: 'ADMIN'
            };
            
            const newUser = await utilisateurService.creer(userData);
            console.log('✅ Utilisateur de test créé:', {
                id: newUser.id,
                email: newUser.email,
                nom: newUser.nom
            });
            
        } catch (error) {
            console.error('❌ Erreur création utilisateur:', error.message);
        }
    }
}

// Exécution
console.log('🚀 Diagnostic de l\'envoi d\'email de récupération\n');

checkUserExists()
    .then(() => createTestUserIfNeeded())
    .then(() => {
        console.log('');
        console.log('✨ Diagnostic terminé !');
        console.log('');
        console.log('💡 Pour créer l\'utilisateur de test:');
        console.log('   node scripts/debug-user-exists.js --create');
    })
    .catch((error) => {
        console.error('💥 Erreur fatale:', error);
        process.exit(1);
    });