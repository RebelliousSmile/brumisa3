/**
 * Script de migration pour déplacer le PDF d'exemple vers la nouvelle structure
 * Usage: node scripts/generate/migrate-pdf-example.js
 * 
 * Ce script déplace le PDF d'exemple depuis public/exemples/ vers output/pdfs/
 * avec le nouveau format de nommage qui inclut user, droits, template et ID unique.
 */

const fs = require('fs').promises;
const path = require('path');

async function migratePdfExample() {
    console.log('🚀 Migration du PDF d\'exemple vers la nouvelle structure...');
    
    try {
        // Chemins source et destination
        const sourceFile = path.join(__dirname, '..', '..', 'public', 'exemples', 'monsterhearts', 'plan-classe-instructions-exemple.pdf');
        const targetDir = path.join(__dirname, '..', '..', 'output', 'pdfs', 'monsterhearts');
        
        // Générer le nouveau nom de fichier selon la convention
        const crypto = require('crypto');
        const uniqueId = crypto.randomBytes(8).toString('hex');
        const newFileName = `user-system_rights-public_template-plan-classe-instructions_id-${uniqueId}.pdf`;
        const targetFile = path.join(targetDir, newFileName);
        
        // Vérifier que le fichier source existe
        try {
            await fs.access(sourceFile);
            console.log('✅ Fichier source trouvé:', sourceFile);
        } catch (error) {
            console.log('❌ Fichier source introuvable:', sourceFile);
            return;
        }
        
        // Créer le répertoire de destination s'il n'existe pas
        try {
            await fs.access(targetDir);
            console.log('✅ Répertoire de destination existant:', targetDir);
        } catch (error) {
            await fs.mkdir(targetDir, { recursive: true });
            console.log('✅ Répertoire de destination créé:', targetDir);
        }
        
        // Copier le fichier
        await fs.copyFile(sourceFile, targetFile);
        console.log('✅ Fichier copié vers:', targetFile);
        
        // Vérifier la taille du fichier copié
        const stats = await fs.stat(targetFile);
        console.log(`✅ Taille du fichier: ${(stats.size / 1024).toFixed(2)} KB`);
        
        // Optionnel: Supprimer l'ancien fichier
        // await fs.unlink(sourceFile);
        // console.log('✅ Ancien fichier supprimé');
        
        console.log('🎉 Migration terminée avec succès !');
        console.log(`📁 Nouveau fichier: ${newFileName}`);
        console.log(`🔗 Chemin complet: ${targetFile}`);
        
        return {
            success: true,
            originalFile: sourceFile,
            newFile: targetFile,
            fileName: newFileName,
            size: stats.size
        };
        
    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error.message);
        process.exit(1);
    }
}

// Exécution si appelé directement
if (require.main === module) {
    migratePdfExample();
}

module.exports = { migratePdfExample };