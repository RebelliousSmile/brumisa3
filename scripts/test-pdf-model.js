/**
 * Script de test pour vérifier le fonctionnement du modèle Pdf
 * Usage: node scripts/test-pdf-model.js
 */

const Pdf = require('../src/models/Pdf');

async function testPdfModel() {
    console.log('🧪 Test du modèle Pdf...');
    
    try {
        const pdf = new Pdf();
        
        // Test de génération de nom de fichier
        console.log('\n📁 Test génération nom de fichier:');
        const fileName = pdf.genererNomFichier(
            'Mon Personnage Test',
            'monsterhearts',
            123,
            'fiche-personnage',
            'private'
        );
        console.log('Nom généré:', fileName);
        
        // Test de génération de chemin
        console.log('\n📂 Test génération chemin:');
        const filePath = pdf.genererCheminFichier(fileName, 'monsterhearts');
        console.log('Chemin généré:', filePath);
        
        // Test des métadonnées
        console.log('\n🔍 Test extraction métadonnées:');
        const mockPdf = {
            nom_fichier: fileName
        };
        
        // Assign getters to mock object
        Object.setPrototypeOf(mockPdf, Pdf.prototype);
        
        const metadata = mockPdf.metadonneesFichier;
        console.log('Métadonnées extraites:', metadata);
        
        // Test des URLs (simulation)
        console.log('\n🔗 Test génération URLs:');
        const mockPdfWithData = {
            id: 123,
            chemin_fichier: filePath,
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
        console.log('Privé:', pdf.determinerStatutDroits({}));
        console.log('Public:', pdf.determinerStatutDroits({ statut_visibilite: 'PUBLIC' }));
        console.log('Communautaire:', pdf.determinerStatutDroits({ statut_visibilite: 'COMMUNAUTAIRE' }));
        
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