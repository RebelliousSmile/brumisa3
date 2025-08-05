/**
 * Script pour vérifier les utilisateurs en base
 */

const db = require('../src/database/db');

async function checkUsers() {
    console.log('👥 Utilisateurs en base de données:\n');
    
    try {
        const users = await db.all(`
            SELECT id, nom, email, role, actif, date_creation, derniere_connexion 
            FROM utilisateurs 
            ORDER BY id
        `);
        
        console.log(`📊 Nombre total d'utilisateurs: ${users.length}\n`);
        
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.email || '[EMAIL MANQUANT]'}`);
            console.log(`   Nom: ${user.nom || '[NOM MANQUANT]'}`);
            console.log(`   Rôle: ${user.role}`);
            console.log(`   Actif: ${user.actif ? 'Oui' : 'Non'}`);
            console.log(`   Créé: ${user.date_creation ? new Date(user.date_creation).toLocaleString() : 'Inconnu'}`);
            console.log(`   Dernière connexion: ${user.derniere_connexion ? new Date(user.derniere_connexion).toLocaleString() : 'Jamais'}`);
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await db.close();
    }
}

checkUsers().then(() => {
    console.log('✨ Vérification terminée');
    process.exit(0);
}).catch(error => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
});