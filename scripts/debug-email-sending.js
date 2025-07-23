/**
 * Script de diagnostic approfondi pour l'envoi d'emails
 * Teste chaque étape du processus d'envoi
 */

require('dotenv').config({ path: '.env.local' });

async function testEmailSendingSteps() {
    console.log('🔍 Diagnostic approfondi de l\'envoi d\'email');
    console.log('');

    const testEmail = 'internet@fxguillois.email';
    console.log(`📧 Email de test: ${testEmail}`);
    console.log('');

    try {
        // Étape 1: Vérifier l'utilisateur et générer le token
        console.log('1️⃣ Test de génération de token...');
        const UtilisateurService = require('../src/services/UtilisateurService');
        const utilisateurService = new UtilisateurService();
        
        const tokenResult = await utilisateurService.genererTokenRecuperation(testEmail);
        
        if (!tokenResult) {
            console.log('❌ Utilisateur non trouvé');
            return;
        }
        
        console.log('✅ Token généré:', {
            token_length: tokenResult.token.length,
            expires_in: '24h'
        });
        console.log('');

        // Étape 2: Test du service EmailService directement
        console.log('2️⃣ Test du service EmailService...');
        const EmailService = require('../src/services/EmailService');
        const emailService = new EmailService();
        
        console.log('📋 Configuration EmailService:', {
            apiKey: emailService.apiKey ? `${emailService.apiKey.substring(0, 8)}...` : 'MANQUANTE',
            fromEmail: emailService.fromEmail,
            fromName: emailService.fromName,
            isDevelopment: emailService.isDevelopment,
            forceRealEmails: emailService.forceRealEmails,
            hasResendInstance: !!emailService.resend
        });
        console.log('');

        // Étape 3: Test d'envoi direct
        console.log('3️⃣ Test d\'envoi direct via EmailService...');
        
        const emailResult = await emailService.envoyerMotDePasseOublie(
            testEmail,
            'Test User',
            tokenResult.token
        );
        
        console.log('📨 Résultat envoi:', emailResult);
        
        if (emailResult.success) {
            console.log('✅ EmailService rapporte un succès');
            if (emailResult.id) {
                console.log(`🆔 ID Resend: ${emailResult.id}`);
            }
        } else {
            console.log('❌ EmailService rapporte un échec:', emailResult.error);
        }
        console.log('');

        // Étape 4: Test du template
        console.log('4️⃣ Test du template email...');
        const EmailTemplate = require('../src/services/EmailTemplate');
        const emailTemplate = new EmailTemplate();
        
        const lienRecuperation = `${process.env.BASE_URL}/reinitialiser-mot-de-passe/${tokenResult.token}`;
        const variables = {
            nom: 'Test User',
            lien_recuperation: lienRecuperation,
            duree_validite: '24 heures',
            token: tokenResult.token
        };
        
        try {
            const htmlContent = await emailTemplate.render('mot-de-passe-oublie', variables);
            console.log('✅ Template rendu avec succès');
            console.log(`📄 Longueur HTML: ${htmlContent.length} caractères`);
            console.log(`🔗 Lien dans email: ${lienRecuperation}`);
        } catch (templateError) {
            console.log('❌ Erreur template:', templateError.message);
        }
        console.log('');

        // Étape 5: Test de configuration Resend
        console.log('5️⃣ Test de la configuration Resend...');
        
        if (!emailService.resend) {
            console.log('❌ Instance Resend non initialisée');
            console.log('💡 Vérifiez RESEND_API_KEY dans votre environnement');
        } else {
            console.log('✅ Instance Resend disponible');
            
            // Test simple avec Resend directement
            try {
                console.log('🧪 Test direct Resend...');
                const directResult = await emailService.resend.emails.send({
                    from: `${emailService.fromName} <${emailService.fromEmail}>`,
                    to: [testEmail],
                    subject: 'Test diagnostic direct',
                    html: '<h1>Test de diagnostic</h1><p>Si vous recevez cet email, Resend fonctionne correctement.</p>'
                });
                
                console.log('✅ Test direct Resend réussi:', {
                    id: directResult.data?.id,
                    status: 'sent'
                });
                
            } catch (resendError) {
                console.log('❌ Erreur Resend directe:', resendError.message);
                if (resendError.message.includes('unauthorized')) {
                    console.log('🔑 Problème d\'authentification API');
                }
                if (resendError.message.includes('quota')) {
                    console.log('📊 Quota Resend dépassé');
                }
            }
        }
        
        console.log('');
        console.log('📋 Récapitulatif du diagnostic:');
        console.log('   ✅ Utilisateur existe et token généré');
        console.log(`   ${emailResult.success ? '✅' : '❌'} EmailService: ${emailResult.success ? 'succès' : 'échec'}`);
        console.log('   ❓ Vérifier les logs Resend pour confirmation');

    } catch (error) {
        console.error('❌ Erreur lors du diagnostic:', error.message);
        console.error(error.stack);
    }
}

// Fonction pour vérifier les variables d'environnement
function checkEnvironmentVariables() {
    console.log('🔧 Vérification des variables d\'environnement:');
    console.log('');
    
    const requiredVars = [
        'RESEND_API_KEY',
        'RESEND_FROM_EMAIL', 
        'RESEND_FROM_NAME',
        'BASE_URL'
    ];
    
    const optionalVars = [
        'ADMIN_EMAIL',
        'TEST_EMAIL',
        'FORCE_REAL_EMAILS',
        'NODE_ENV'
    ];
    
    console.log('📋 Variables requises:');
    requiredVars.forEach(varName => {
        const value = process.env[varName];
        const status = value ? '✅' : '❌';
        const displayValue = varName === 'RESEND_API_KEY' && value ? 
            `${value.substring(0, 8)}...` : value || 'MANQUANTE';
        console.log(`   ${status} ${varName}: ${displayValue}`);
    });
    
    console.log('');
    console.log('📋 Variables optionnelles:');
    optionalVars.forEach(varName => {
        const value = process.env[varName];
        const status = value ? '✅' : '⚪';
        console.log(`   ${status} ${varName}: ${value || 'non définie'}`);
    });
    
    console.log('');
}

// Exécution
console.log('🚀 Diagnostic complet de l\'envoi d\'email\n');

checkEnvironmentVariables();

testEmailSendingSteps()
    .then(() => {
        console.log('');
        console.log('✨ Diagnostic terminé !');
        console.log('');
        console.log('🔍 Actions suivantes:');
        console.log('   1. Vérifier les logs de cette exécution');
        console.log('   2. Contrôler le dashboard Resend');
        console.log('   3. Tester avec l\'API Resend directement si nécessaire');
    })
    .catch((error) => {
        console.error('💥 Erreur fatale:', error);
        process.exit(1);
    });