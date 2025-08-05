/**
 * Test direct d'envoi d'email avec un vrai token généré
 */

const EmailService = require('../src/services/EmailService');
const AuthentificationService = require('../src/services/AuthentificationService');
const db = require('../src/database/db');

async function testDirectEmail() {
    console.log('🔍 Test direct EmailService avec vrai token...\n');
    
    const emailService = new EmailService();
    const authService = new AuthentificationService();
    const testEmail = 'internet@fxguillois.email';
    
    console.log('Configuration EmailService:');
    console.log(`   API Key: ${emailService.apiKey ? 'Configurée' : 'Manquante'}`);
    console.log(`   From Email: ${emailService.fromEmail}`);
    console.log(`   From Name: ${emailService.fromName}`);
    console.log(`   Resend initialisé: ${emailService.resend ? 'Oui' : 'Non'}`);
    console.log(`   Mode développement: ${emailService.isDevelopment}`);
    console.log(`   Force real emails: ${emailService.forceRealEmails}`);
    console.log('');
    
    if (!emailService.resend) {
        console.log('❌ Service Resend non initialisé - vérifiez RESEND_API_KEY');
        return;
    }
    
    try {
        // Initialiser la base de données
        await db.init();
        
        // Vérifier si l'utilisateur existe
        let user = await db.get('SELECT * FROM utilisateurs WHERE email = $1', [testEmail]);
        
        if (!user) {
            console.log('👤 Création utilisateur de test...');
            await db.run(
                'INSERT INTO utilisateurs (nom, email, role, actif) VALUES ($1, $2, $3, $4)',
                ['Test User', testEmail, 'UTILISATEUR', true]
            );
            user = await db.get('SELECT * FROM utilisateurs WHERE email = $1', [testEmail]);
        }
        
        console.log(`👤 Utilisateur trouvé: ${user.nom} (${user.email})`);
        
        // Générer un vrai token de récupération
        console.log('🔑 Génération token de récupération...');
        const tokenResult = await authService.genererTokenRecuperation(testEmail);
        
        if (!tokenResult.succes) {
            console.log('❌ Échec génération token:', tokenResult.message);
            return;
        }
        
        console.log(`✅ Token généré: ${tokenResult.token.substring(0, 16)}...`);
        console.log(`⏱️ Expire le: ${new Date(tokenResult.expiration).toLocaleString()}`);
        
        // Envoyer l'email avec le vrai token
        console.log('📧 Envoi email avec vrai token...');
        const result = await emailService.envoyerMotDePasseOublie(
            testEmail,
            user.nom,
            tokenResult.token
        );
        
        console.log('\nRésultat:');
        console.log(`   Succès: ${result.success}`);
        console.log(`   ID: ${result.id || 'N/A'}`);
        console.log(`   Message: ${result.message}`);
        if (result.error) {
            console.log(`   Erreur: ${result.error}`);
        }
        
        console.log('\n🔗 URL de réinitialisation:');
        console.log(`   ${process.env.BASE_URL}/reinitialiser-mot-de-passe/${tokenResult.token}`);
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await db.close();
    }
}

testDirectEmail().then(() => {
    console.log('\n✨ Test terminé');
    process.exit(0);
}).catch(error => {
    console.error('\n💥 Erreur fatale:', error);
    process.exit(1);
});