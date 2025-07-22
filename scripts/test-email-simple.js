#!/usr/bin/env node

/**
 * Script de test simple pour vérifier l'envoi d'emails
 * Usage: node scripts/test-email-simple.js votre.email@example.com
 */

const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const envLocalPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envLocalPath)) {
    require('dotenv').config({ path: envLocalPath, override: true });
}
const EmailService = require('../src/services/EmailService');

async function testEmail(email) {
    if (!email) {
        console.error('Usage: node scripts/test-email-simple.js votre.email@example.com');
        process.exit(1);
    }

    console.log(`Envoi d'un email de test à ${email}...`);

    const emailService = new EmailService();
    
    try {
        const result = await emailService.testerConfiguration(email);
        
        if (result.success) {
            console.log('✅ Email envoyé avec succès !');
            console.log('Vérifiez votre boîte mail (et les spams).');
            if (result.details?.messageId) {
                console.log(`ID du message: ${result.details.messageId}`);
            }
        } else {
            console.log('❌ Échec de l\'envoi');
            console.log(`Erreur: ${result.message}`);
            if (result.error) {
                console.log(`Détails: ${result.error}`);
            }
        }
    } catch (error) {
        console.error('Erreur:', error.message);
    }
}

testEmail(process.argv[2]);