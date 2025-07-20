/**
 * Met à jour les liens vers les PDFs d'exemple dans les vues
 * Usage: node scripts/maintenance/update-pdf-links.js
 * 
 * Ce script met à jour les liens dans monsterhearts.ejs pour pointer
 * vers les derniers PDFs générés avec la nouvelle charte graphique
 */

const fs = require('fs').promises;
const path = require('path');

async function updatePdfLinks() {
    console.log('🔄 Mise à jour des liens PDF dans les vues...');
    
    try {
        // Chemin du fichier à mettre à jour
        const viewFile = path.join(__dirname, '..', '..', 'src', 'views', 'systemes', 'monsterhearts.ejs');
        
        // Lire le dernier PDF généré pour plan-classe
        const pdfDir = path.join(__dirname, '..', '..', 'output', 'pdfs', 'monsterhearts');
        const files = await fs.readdir(pdfDir);
        
        // Filtrer pour trouver le dernier plan-classe-instructions
        const planClasseFiles = files.filter(f => f.includes('template-plan-classe-instructions'));
        const latestPlanClasse = planClasseFiles.sort().pop();
        
        if (!latestPlanClasse) {
            console.log('❌ Aucun PDF plan-classe trouvé');
            return;
        }
        
        console.log('📄 Dernier PDF plan-classe:', latestPlanClasse);
        
        // Lire le contenu du fichier vue
        let content = await fs.readFile(viewFile, 'utf8');
        
        // Remplacer l'ancien lien
        const oldPattern = /href="\/output\/pdfs\/monsterhearts\/user-system_rights-public_template-plan-classe-instructions_id-[a-f0-9]+\.pdf"/g;
        const newLink = `href="/output/pdfs/monsterhearts/${latestPlanClasse}"`;
        
        content = content.replace(oldPattern, newLink);
        
        // Écrire le fichier mis à jour
        await fs.writeFile(viewFile, content);
        
        console.log('✅ Liens mis à jour avec succès');
        console.log(`📌 Nouveau lien: ${newLink}`);
        
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour:', error.message);
        process.exit(1);
    }
}

// Exécution
if (require.main === module) {
    updatePdfLinks();
}

module.exports = { updatePdfLinks };