#!/usr/bin/env node

/**
 * Script de test du service d'envoi d'emails
 * 
 * Usage:
 *   node scripts/test-email.js
 *   node scripts/test-email.js votre.email@example.com
 *   node scripts/test-email.js --check (vérifier la config seulement)
 */

const path = require('path');
const fs = require('fs');

// Configuration de l'environnement - charger .env puis .env.local
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
    require('dotenv').config({ path: envLocalPath, override: true });
}

const EmailService = require('../src/services/EmailService');

async function main() {
    const args = process.argv.slice(2);
    const emailTest = args.find(arg => arg.includes('@')) || process.env.ADMIN_EMAIL;
    const checkOnly = args.includes('--check');
    
    console.log('🧪 Test du Service EmailService\n');
    console.log('📧 Configuration détectée :');
    console.log(`   API Key: ${process.env.RESEND_API_KEY ? '✅ Configurée' : '❌ Manquante'}`);
    console.log(`   From Email: ${process.env.RESEND_FROM_EMAIL || 'non défini'}`);
    console.log(`   From Name: ${process.env.RESEND_FROM_NAME || 'non défini'}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log();
    
    if (checkOnly) {
        console.log('✅ Vérification terminée (mode --check)');
        return;
    }
    
    if (!emailTest) {
        console.error('❌ Erreur: Email de test requis');
        console.log('Usage:');
        console.log('  node scripts/test-email.js votre.email@example.com');
        console.log('  ou définissez ADMIN_EMAIL dans votre .env');
        process.exit(1);
    }
    
    const emailService = new EmailService();
    
    console.log(`📮 Test d'envoi vers: ${emailTest}\n`);
    
    try {
        // Test de base
        console.log('⏳ Test de configuration de base...');
        const result = await emailService.testerConfiguration(emailTest);
        
        if (result.success) {
            console.log('✅ Test réussi !');
            console.log(`   Message: ${result.message}`);
            if (result.details?.messageId) {
                console.log(`   Message ID: ${result.details.messageId}`);
            }
        } else {
            console.log('❌ Test échoué');
            console.log(`   Erreur: ${result.message}`);
            if (result.error) {
                console.log(`   Détails: ${result.error}`);
            }
        }
        
        console.log('\n📋 Tests supplémentaires disponibles :');
        console.log('   - Test mot de passe oublié: node scripts/test-email.js --forgot-password');
        console.log('   - Test email de bienvenue: node scripts/test-email.js --welcome');
        
        // Tests supplémentaires selon les arguments
        if (args.includes('--forgot-password')) {
            console.log('\n⏳ Test mot de passe oublié...');
            const forgotResult = await emailService.envoyerMotDePasseOublie(
                emailTest,
                'Utilisateur Test',
                'test-token-123456'
            );
            
            console.log(forgotResult.success ? '✅ Email mot de passe oublié envoyé' : '❌ Échec envoi mot de passe');
        }
        
        if (args.includes('--welcome')) {
            console.log('\n⏳ Test email de bienvenue...');
            const welcomeResult = await emailService.envoyerBienvenue(
                emailTest,
                'Utilisateur Test'
            );
            
            console.log(welcomeResult.success ? '✅ Email de bienvenue envoyé' : '❌ Échec envoi bienvenue');
        }
        
    } catch (error) {
        console.error('💥 Erreur inattendue:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
    
    console.log('\n🎉 Test terminé !');
    
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_test_key_for_development') {
        console.log('\n⚠️  Note: Mode développement détecté.');
        console.log('   Les emails ne sont pas réellement envoyés.');
        console.log('   Configurez RESEND_API_KEY pour des vrais envois.');
    }
}

// Gestion des erreurs
process.on('uncaughtException', (error) => {
    console.error('💥 Erreur non capturée:', error.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('💥 Promise rejetée:', reason);
    process.exit(1);
});

// Lancement
main().catch(error => {
    console.error('💥 Erreur dans main():', error.message);
    process.exit(1);
});