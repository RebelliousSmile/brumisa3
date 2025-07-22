const db = require('../src/database/db');

async function debugDB() {
    try {
        console.log('=== VERIFICATION BASE DE DONNÉES ===');
        
        // Récupérer tous les utilisateurs
        const users = await db.all('SELECT id, nom, email, mot_de_passe, actif FROM utilisateurs ORDER BY id DESC LIMIT 3', []);
        
        console.log(`Nombre d'utilisateurs: ${users.length}`);
        console.log('\nUtilisateurs récents:');
        
        users.forEach(user => {
            console.log(`\nID: ${user.id}`);
            console.log(`Nom: ${user.nom}`);
            console.log(`Email: ${user.email}`);
            console.log(`Actif: ${user.actif}`);
            console.log(`Mot de passe présent: ${!!user.mot_de_passe}`);
            if (user.mot_de_passe) {
                console.log(`Hash: ${user.mot_de_passe.substring(0, 60)}...`);
                console.log(`Hash complet: ${user.mot_de_passe}`);
            }
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Erreur:', error);
        process.exit(1);
    }
}

debugDB();