/**
 * Script de test manuel pour diagnostiquer les problèmes d'authentification
 * Usage: node scripts/test-auth-manual.js
 */

const db = require('../src/database/db');
const UtilisateurService = require('../src/services/UtilisateurService');
const EmailService = require('../src/services/EmailService');
const config = require('../src/config');

async function testAuthenticationFlow() {
    console.log('🔍 Test manuel de l\'authentification...\n');
    
    try {
        // 1. Test de connexion à la base de données
        console.log('1️⃣ Test de connexion base de données...');
        // La connexion se fait automatiquement lors du premier appel
        console.log('✅ Connexion base de données OK\n');
        
        // 2. Test du service utilisateur
        console.log('2️⃣ Test du service utilisateur...');
        const utilisateurService = new UtilisateurService();
        
        // Vérifier si il y a des utilisateurs
        const result = await db.get('SELECT COUNT(*) as count FROM utilisateurs');
        console.log(`📊 Nombre d'utilisateurs en base: ${result.count}`);
        
        // Lister quelques utilisateurs
        const users = await db.all('SELECT id, nom, email, role, actif, date_creation FROM utilisateurs LIMIT 3');
        console.log('👥 Utilisateurs existants:');
        users.forEach(user => {
            console.log(`  - ${user.email} (${user.nom}) - ${user.role} - Actif: ${user.actif}`);
        });
        console.log('');
        
        // 3. Test de création d'utilisateur test
        console.log('3️⃣ Test de création d\'utilisateur...');
        const testEmail = 'test-auth@example.com';
        
        // Supprimer l'utilisateur test s'il existe
        await db.run('DELETE FROM utilisateurs WHERE email = $1', [testEmail]);
        
        const testUser = await utilisateurService.creer({
            nom: 'Test User',
            email: testEmail,
            mot_de_passe: 'testpassword123',
            role: 'UTILISATEUR'
        });
        console.log(`✅ Utilisateur test créé: ${testUser.email} (ID: ${testUser.id})\n`);
        
        // 4. Test d'authentification
        console.log('4️⃣ Test d\'authentification...');
        const authResult = await utilisateurService.authentifier(testEmail, 'testpassword123');
        
        if (authResult) {
            console.log('✅ Authentification réussie!');
            console.log(`   Utilisateur: ${authResult.nom} (${authResult.email})`);
        } else {
            console.log('❌ Échec d\'authentification');
        }
        console.log('');
        
        // 5. Test d'authentification avec mauvais mot de passe
        console.log('5️⃣ Test avec mauvais mot de passe...');
        const authFail = await utilisateurService.authentifier(testEmail, 'wrongpassword');
        if (!authFail) {
            console.log('✅ Échec attendu avec mauvais mot de passe');
        } else {
            console.log('❌ PROBLÈME: Authentification réussie avec mauvais mot de passe!');
        }
        console.log('');
        
        // 6. Test de génération token récupération
        console.log('6️⃣ Test génération token récupération...');
        const tokenResult = await utilisateurService.genererTokenRecuperation(testEmail);
        
        if (tokenResult) {
            console.log('✅ Token de récupération généré');
            console.log(`   Token: ${tokenResult.token.substring(0, 10)}...`);
            console.log(`   Expire: ${new Date(tokenResult.expiration).toLocaleString()}`);
        } else {
            console.log('❌ Échec génération token');
        }
        console.log('');
        
        // 7. Test service email
        console.log('7️⃣ Test configuration service email...');
        const emailService = new EmailService();
        
        console.log(`   API Key configurée: ${emailService.apiKey ? 'Oui' : 'Non'}`);
        console.log(`   From Email: ${emailService.fromEmail}`);
        console.log(`   Mode développement: ${emailService.isDevelopment}`);
        console.log(`   Service Resend initialisé: ${emailService.resend ? 'Oui' : 'Non'}`);
        
        if (tokenResult && emailService.resend) {
            console.log('   🚀 Tentative d\'envoi email test...');
            try {
                const emailResult = await emailService.envoyerMotDePasseOublie(
                    testEmail,
                    'Test User',
                    tokenResult.token
                );
                
                if (emailResult.success) {
                    console.log('   ✅ Email envoyé avec succès!');
                    console.log(`   ID Resend: ${emailResult.id}`);
                } else {
                    console.log('   ❌ Échec envoi email');
                    console.log(`   Erreur: ${emailResult.error}`);
                }
            } catch (error) {
                console.log('   ❌ Erreur lors de l\'envoi email:');
                console.log(`   ${error.message}`);
            }
        } else {
            console.log('   ⚠️  Test email ignoré (token ou service manquant)');
        }
        console.log('');
        
        // 8. Nettoyage
        console.log('8️⃣ Nettoyage...');
        await db.run('DELETE FROM utilisateurs WHERE email = $1', [testEmail]);
        console.log('✅ Utilisateur test supprimé\n');
        
    } catch (error) {
        console.error('❌ Erreur lors du test:', error);
    } finally {
        // Fermer la connexion
        try {
            await db.close();
            console.log('🔒 Connexion base fermée');
        } catch (error) {
            console.error('Erreur fermeture base:', error.message);
        }
    }
}

// Lancer le test
testAuthenticationFlow().then(() => {
    console.log('\n✨ Test manuel terminé');
    process.exit(0);
}).catch(error => {
    console.error('\n💥 Erreur fatale:', error);
    process.exit(1);
});