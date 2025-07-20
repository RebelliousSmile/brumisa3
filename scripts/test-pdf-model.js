/**
 * Script de test pour vérifier le fonctionnement du modèle Pdf
 * Usage: node scripts/test-pdf-model.js
 */

const Pdf = require('../src/models/Pdf');

async function testPdfModel() {
    console.log('🧪 Test du modèle Pdf...');
    
    try {
        const pdf = new Pdf();
        
        // Test de génération de chemin PDF (nouvelle méthode)
        console.log('\n📁 Test génération chemin PDF (nouveau format):');
        const pdfPath = pdf.systemRightsService.generatePdfPath(
            'Mon Personnage Test',
            'monsterhearts',
            123,
            'fiche-personnage',
            'private'
        );
        console.log('Nom généré:', pdfPath.fileName);
        console.log('Chemin complet:', pdfPath.fullPath);
        
        // Test de la méthode legacy pour compatibilité
        console.log('\n📂 Test méthode legacy:');
        const legacyFileName = pdf.genererNomFichier(
            'Mon Personnage Test',
            'monsterhearts', 
            123,
            'fiche-personnage',
            'private'
        );
        console.log('Legacy nom:', legacyFileName);
        
        // Test des métadonnées (nouveau format)
        console.log('\n🔍 Test extraction métadonnées (nouveau format):');
        const mockPdfNew = {
            nom_fichier: pdfPath.fileName,
            systemRightsService: pdf.systemRightsService
        };
        
        Object.setPrototypeOf(mockPdfNew, Pdf.prototype);
        const metadataNew = mockPdfNew.metadonneesFichier;
        console.log('Nouveau format - Métadonnées:', metadataNew);
        
        // Test parsing direct
        console.log('\n🔎 Test parsing direct:');
        const parsed = pdf.systemRightsService.parseFilename(pdfPath.fileName);
        console.log('Parsing direct:', parsed);
        
        // Test des URLs (simulation)
        console.log('\n🔗 Test génération URLs:');
        const mockPdfWithData = {
            id: 123,
            chemin_fichier: pdfPath.fullPath,
            statut: 'TERMINE',
            url_partage: JSON.stringify({
                token: 'abc123',
                active: true,
                expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            })
        };
        
        Object.setPrototypeOf(mockPdfWithData, Pdf.prototype);
        
        console.log('URL téléchargement:', mockPdfWithData.urlTelecharger);
        console.log('URL aperçu:', mockPdfWithData.urlApercu);
        console.log('URL partage:', mockPdfWithData.urlPartagePublic);
        console.log('URL API:', mockPdfWithData.urlApi);
        console.log('Est public:', mockPdfWithData.estPublic);
        console.log('URLs complètes:', mockPdfWithData.urls);
        
        // Test de détermination des droits
        console.log('\n🔐 Test détermination des droits:');
        console.log('Privé:', pdf.determinerSystemRights({}));
        console.log('Public:', pdf.determinerSystemRights({ system_rights: 'public' }));
        console.log('Communautaire:', pdf.determinerSystemRights({ system_rights: 'common' }));
        console.log('Avec user anonyme:', pdf.determinerSystemRights({ utilisateur_id: 0 }));
        console.log('Avec user connecté:', pdf.determinerSystemRights({ utilisateur_id: 123 }));
        
        console.log('\n✅ Tous les tests sont passés !');
        
    } catch (error) {
        console.error('❌ Erreur lors des tests:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    testPdfModel();
}

module.exports = { testPdfModel };