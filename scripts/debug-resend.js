/**
 * Script de debug pour diagnostiquer les problèmes Resend
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

console.log('🔍 Diagnostic Resend\n');

// 1. Vérification des variables d'environnement
console.log('📋 Variables d\'environnement :');
console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY ? `${process.env.RESEND_API_KEY.substring(0, 10)}...` : '❌ MANQUANTE'}`);
console.log(`   RESEND_FROM_EMAIL: ${process.env.RESEND_FROM_EMAIL || '❌ MANQUANTE'}`);
console.log(`   RESEND_FROM_NAME: ${process.env.RESEND_FROM_NAME || 'Par défaut: Générateur PDF JDR'}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`   BASE_URL: ${process.env.BASE_URL}`);

// 2. Test de l'initialisation Resend
console.log('\n🔧 Test d\'initialisation Resend...');
try {
    const { Resend } = require('resend');
    
    if (!process.env.RESEND_API_KEY) {
        console.log('❌ RESEND_API_KEY manquante');
        console.log('   Ajoutez RESEND_API_KEY=re_xxx dans votre .env');
        process.exit(1);
    }
    
    if (process.env.RESEND_API_KEY === 're_test_key_for_development') {
        console.log('⚠️  Clé de développement détectée (les emails ne seront pas envoyés)');
    }
    
    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log('✅ Instance Resend créée');
    
    // 3. Test de base - envoi minimal
    console.log('\n📧 Test d\'envoi minimal...');
    
    const emailTest = process.argv[2] || 'test@example.com';
    if (!emailTest.includes('@')) {
        console.log('❌ Email de test invalide');
        console.log('Usage: node scripts/debug-resend.js votre.email@example.com');
        process.exit(1);
    }
    
    const emailData = {
        from: `${process.env.RESEND_FROM_NAME || 'Test'} <${process.env.RESEND_FROM_EMAIL}>`,
        to: [emailTest],
        subject: 'Test Resend - Debug',
        html: `
            <h1>Test Resend</h1>
            <p>Si vous recevez cet email, Resend fonctionne !</p>
            <p><strong>Horodatage:</strong> ${new Date().toISOString()}</p>
            <p><strong>API Key utilisée:</strong> ${process.env.RESEND_API_KEY.substring(0, 10)}...</p>
        `
    };
    
    console.log('📤 Données d\'envoi :');
    console.log(JSON.stringify({
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject
    }, null, 2));
    
    const result = await resend.emails.send(emailData);
    
    console.log('\n📨 Résultat Resend :');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.data && result.data.id) {
        console.log(`✅ Email envoyé avec succès !`);
        console.log(`   ID: ${result.data.id}`);
        console.log(`   Vérifiez votre boîte mail: ${emailTest}`);
        console.log(`   Dashboard Resend: https://resend.com/emails/${result.data.id}`);
    } else if (result.error) {
        console.log('❌ Erreur Resend :');
        console.log(JSON.stringify(result.error, null, 2));
    } else {
        console.log('🤔 Résultat inattendu de Resend');
    }
    
} catch (error) {
    console.error('💥 Erreur lors du test :');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Stack:', error.stack);
    
    // Diagnostics spécifiques selon l'erreur
    if (error.message.includes('Invalid API key')) {
        console.log('\n🔑 Problème de clé API :');
        console.log('1. Vérifiez que votre clé API Resend est correcte');
        console.log('2. La clé doit commencer par "re_"');
        console.log('3. Vérifiez sur https://resend.com/api-keys');
    }
    
    if (error.message.includes('domain')) {
        console.log('\n🌐 Problème de domaine :');
        console.log('1. Vérifiez que RESEND_FROM_EMAIL utilise un domaine vérifié');
        console.log('2. Ou utilisez onboarding@resend.dev pour les tests');
    }
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        console.log('\n🌍 Problème de connexion réseau :');
        console.log('1. Vérifiez votre connexion internet');
        console.log('2. Vérifiez les paramètres de proxy/firewall');
    }
}

console.log('\n📚 Ressources utiles :');
console.log('- Documentation Resend: https://resend.com/docs');
console.log('- Dashboard Resend: https://resend.com/dashboard');
console.log('- API Keys: https://resend.com/api-keys');