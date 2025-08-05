/**
 * Test spécifique de récupération de mot de passe avec l'email admin
 */

const http = require('http');

// Email admin
const ADMIN_EMAIL = 'activation@brumisa3.fr';

async function testPasswordReset(email) {
    console.log(`🔑 Test récupération mot de passe pour: ${email}\n`);
    
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            email: email
        });

        const options = {
            hostname: 'localhost',
            port: 3074,
            path: '/api/auth/mot-de-passe-oublie',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            
            res.on('data', (chunk) => {
                body += chunk;
            });

            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    
                    console.log(`Status: ${res.statusCode}`);
                    console.log(`Message: ${response.message}`);
                    console.log(`Succès: ${response.succes ? 'Oui' : 'Non'}`);
                    
                    if (res.statusCode === 200) {
                        console.log('✅ Demande envoyée avec succès');
                        console.log('📧 Vérifiez votre boîte email !');
                        
                        console.log('\n📋 Détails à vérifier:');
                        console.log('   - Boîte de réception');
                        console.log('   - Dossier spam/courrier indésirable'); 
                        console.log('   - Expéditeur: activation@brumisa3.fr');
                        console.log('   - Sujet: Récupération de votre mot de passe');
                    } else {
                        console.log('❌ Échec de la demande');
                        console.log(`Erreur: ${response.message || 'Inconnue'}`);
                    }
                    
                    resolve(response);
                } catch (error) {
                    console.log('❌ Erreur parsing réponse:', error.message);
                    console.log('Réponse brute:', body);
                    reject(error);
                }
            });
        });

        req.on('error', (err) => {
            console.log('❌ Erreur requête:', err.message);
            reject(err);
        });

        req.write(postData);
        req.end();
    });
}

testPasswordReset(ADMIN_EMAIL).then(() => {
    console.log('\n✨ Test terminé');
    process.exit(0);
}).catch(error => {
    console.error('\n💥 Erreur:', error.message);
    process.exit(1);
});