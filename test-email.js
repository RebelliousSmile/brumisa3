#!/usr/bin/env node

/**
 * Script de test pour le service EmailService
 * Usage: node test-email.js [email-test]
 */

require('dotenv').config({ path: '.env.local' });
const EmailService = require('./src/services/EmailService');

async function testEmailService() {
    console.log('🧪 Test du service EmailService');
    console.log('================================');
    
    const emailService = new EmailService();
    const emailTest = process.argv[2] || 'test@example.com';
    
    console.log(`📧 Email de test : ${emailTest}`);
    console.log(`🔧 Mode : ${process.env.NODE_ENV}`);
    console.log(`🔑 API Key Resend : ${process.env.RESEND_API_KEY ? 'Configurée' : 'Non configurée'}`);
    console.log('');

    // Test 1: Configuration
    console.log('1️⃣ Test de configuration...');
    try {
        const configTest = await emailService.testerConfiguration(emailTest);
        console.log(`   ✅ Résultat: ${configTest.success ? 'OK' : 'ERREUR'}`);
        if (!configTest.success) {
            console.log(`   ❌ Erreur: ${configTest.error || configTest.message}`);
        }
    } catch (error) {
        console.log(`   ❌ Exception: ${error.message}`);
    }
    console.log('');

    // Test 2: Récupération mot de passe
    console.log('2️⃣ Test email récupération mot de passe...');
    try {
        const result = await emailService.envoyerMotDePasseOublie(
            emailTest,
            'Utilisateur Test',
            'test-token-123456'
        );
        console.log(`   ✅ Résultat: ${result.success ? 'OK' : 'ERREUR'}`);
        console.log(`   📤 ID: ${result.id || 'N/A'}`);
        if (!result.success) {
            console.log(`   ❌ Erreur: ${result.error}`);
        }
    } catch (error) {
        console.log(`   ❌ Exception: ${error.message}`);
    }
    console.log('');

    // Test 3: Email de bienvenue
    console.log('3️⃣ Test email de bienvenue...');
    try {
        const result = await emailService.envoyerBienvenue(
            emailTest,
            'Nouvel Utilisateur'
        );
        console.log(`   ✅ Résultat: ${result.success ? 'OK' : 'ERREUR'}`);
        console.log(`   📤 ID: ${result.id || 'N/A'}`);
        if (!result.success) {
            console.log(`   ❌ Erreur: ${result.error}`);
        }
    } catch (error) {
        console.log(`   ❌ Exception: ${error.message}`);
    }
    console.log('');

    console.log('🏁 Tests terminés !');
    console.log('');

    if (process.env.NODE_ENV === 'development') {
        console.log('💡 En mode développement :');
        console.log('   - Les emails ne sont pas vraiment envoyés');
        console.log('   - Les liens de récupération sont affichés dans la console');
        console.log('   - Pour tester avec de vrais emails, configurez RESEND_API_KEY');
    }
}

// Lancer le test
testEmailService().catch(console.error);