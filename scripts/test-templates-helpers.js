const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
    require('dotenv').config({ path: envLocalPath, override: true });
}

const EmailService = require('../src/services/EmailService');

async function testNewTemplates() {
    const emailService = new EmailService();
    const testEmail = process.argv[2] || 'test@example.com';
    
    console.log('🧪 Test des nouveaux templates avec helpers\n');

    try {
        // 1. Test template bienvenue-new
        console.log('📧 Test template bienvenue-new...');
        const welcomeResult = await emailService.envoyer({
            to: testEmail,
            subject: 'Test - Bienvenue avec helpers',
            template: 'bienvenue-new',
            variables: {
                nom: 'Test User',
                lien_connexion: `http://localhost:3074/connexion`
            }
        });
        
        if (welcomeResult.success) {
            console.log('✅ Template bienvenue-new envoyé !');
            console.log(`   ID: ${welcomeResult.id}`);
        } else {
            console.log('❌ Échec bienvenue-new:', welcomeResult.message);
        }

        // 2. Test template newsletter
        console.log('\n📧 Test template newsletter...');
        const newsletterResult = await emailService.envoyer({
            to: testEmail,
            subject: 'Test - Newsletter avec helpers',
            template: 'newsletter',
            variables: {
                nom: 'Test User',
                email: testEmail,
                lien_confirmation: `http://localhost:3074/newsletter/confirmer/test-token-123`
            }
        });
        
        if (newsletterResult.success) {
            console.log('✅ Template newsletter envoyé !');
            console.log(`   ID: ${newsletterResult.id}`);
        } else {
            console.log('❌ Échec newsletter:', newsletterResult.message);
        }

        // 3. Test template mot-de-passe-oublie-new
        console.log('\n📧 Test template mot-de-passe-oublie-new...');
        const passwordResult = await emailService.envoyer({
            to: testEmail,
            subject: 'Test - Mot de passe oublié avec helpers',
            template: 'mot-de-passe-oublie-new',
            variables: {
                nom: 'Test User',
                lien_recuperation: `http://localhost:3074/reinitialiser-mot-de-passe/test-token-456`,
                duree_validite: '24 heures',
                token: 'test-token-456789abcdef'
            }
        });
        
        if (passwordResult.success) {
            console.log('✅ Template mot-de-passe-oublie-new envoyé !');
            console.log(`   ID: ${passwordResult.id}`);
        } else {
            console.log('❌ Échec mot-de-passe-oublie-new:', passwordResult.message);
        }

    } catch (error) {
        console.error('💥 Erreur lors du test:', error.message);
    }

    console.log('\n🎉 Tests terminés ! Vérifiez votre boîte mail.');
}

testNewTemplates();