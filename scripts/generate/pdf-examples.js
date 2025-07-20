/**
 * Génère des PDFs d'exemple pour tous les systèmes de jeu
 * Usage: node scripts/generate/pdf-examples.js [--system=nom] [--template=nom] [--user=id]
 * 
 * Exemples:
 * - node scripts/generate/pdf-examples.js --system=monsterhearts --template=plan-classe-instructions
 * - node scripts/generate/pdf-examples.js --system=all
 * - node scripts/generate/pdf-examples.js --user=system --template=document-generique
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Import des services
const Pdf = require('../../src/models/Pdf');
const PdfKitService = require('../../src/services/PdfKitService');

class PdfExampleGenerator {
    constructor() {
        this.puppeteerOptions = {
            headless: true,
            timeout: 60000,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        };
        
        this.pdfModel = new Pdf();
        this.pdfKitService = new PdfKitService();
    }

    /**
     * Génère un PDF d'exemple avec choix automatique PDFKit vs Puppeteer
     */
    async generateExample(options = {}) {
        const {
            system = 'monsterhearts',
            template = 'plan-classe-instructions',
            userId = 'system',
            rights = 'public',
            titre = 'Exemple',
            engine = 'auto' // 'auto', 'pdfkit', 'puppeteer'
        } = options;

        console.log(`🎲 Génération PDF: ${system}/${template}`);
        
        // Déterminer le moteur à utiliser
        const useEngine = this.determineEngine(system, template, engine);
        console.log(`🔧 Moteur: ${useEngine}`);

        if (useEngine === 'pdfkit') {
            return await this.generateWithPDFKit(options);
        } else {
            return await this.generateWithPuppeteer(options);
        }
    }

    /**
     * Détermine le moteur à utiliser selon le système et template
     */
    determineEngine(system, template, enginePreference) {
        if (enginePreference === 'pdfkit' || enginePreference === 'puppeteer') {
            return enginePreference;
        }

        // Templates supportés par PDFKit
        const pdfkitTemplates = {
            'monsterhearts': ['plan-classe-instructions', 'plan-classe-instructions-test']
        };

        if (pdfkitTemplates[system] && pdfkitTemplates[system].includes(template)) {
            return 'pdfkit';
        }

        return 'puppeteer';
    }

    /**
     * Génère avec PDFKit
     */
    async generateWithPDFKit(options) {
        const {
            system = 'monsterhearts',
            template = 'plan-classe-instructions',
            userId = 'system',
            rights = 'public',
            titre = 'Exemple'
        } = options;

        try {
            // Convertir userId en format attendu
            const userIdNum = userId === 'system' ? 0 : parseInt(userId, 10);

            const result = await this.pdfKitService.generatePDF({
                system,
                template,
                titre,
                userId: userIdNum,
                systemRights: rights,
                data: {}
            });

            if (result.success) {
                console.log(`✅ PDF généré: ${result.fileName}`);
                console.log(`📁 Taille: ${(result.size / 1024).toFixed(2)} KB`);
            }

            return result;

        } catch (error) {
            console.error(`❌ Erreur génération PDFKit ${system}/${template}:`, error.message);
            return {
                success: false,
                error: error.message,
                system,
                template
            };
        }
    }

    /**
     * Génère avec Puppeteer (méthode existante)
     */
    async generateWithPuppeteer(options) {
        const {
            system = 'monsterhearts',
            template = 'plan-classe-instructions',
            userId = 'system',
            rights = 'public',
            titre = 'Exemple'
        } = options;
        
        try {
            // Chemins des templates
            const templatePath = path.join(__dirname, '..', '..', 'src', 'templates', 'pdf', system, `${template}.html`);
            const outputDir = path.join(__dirname, '..', '..', 'output', 'pdfs', system);
            
            // Vérifier que le template existe
            try {
                await fs.access(templatePath);
            } catch (error) {
                throw new Error(`Template non trouvé: ${templatePath}`);
            }
            
            // Créer le répertoire de sortie
            await fs.mkdir(outputDir, { recursive: true });
            
            // Générer le nom de fichier avec la nouvelle convention
            const fileName = this.pdfModel.genererNomFichier(titre, system, userId, template, rights);
            const outputPath = path.join(outputDir, fileName);
            
            // Lire le contenu HTML
            const htmlContent = await fs.readFile(templatePath, 'utf8');
            
            // Lancer Puppeteer
            const browser = await puppeteer.launch(this.puppeteerOptions);
            const page = await browser.newPage();
            page.setDefaultTimeout(60000);
            
            // Configurer la page
            await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
            
            // Générer le PDF
            await page.pdf({
                path: outputPath,
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '0mm',
                    right: '0mm',
                    bottom: '0mm',
                    left: '0mm'
                },
                preferCSSPageSize: true
            });
            
            await browser.close();
            
            // Obtenir les informations du fichier
            const stats = await fs.stat(outputPath);
            
            console.log(`✅ PDF généré: ${fileName}`);
            console.log(`📁 Taille: ${(stats.size / 1024).toFixed(2)} KB`);
            
            return {
                success: true,
                fileName,
                path: outputPath,
                size: stats.size,
                system,
                template
            };
            
        } catch (error) {
            console.error(`❌ Erreur génération Puppeteer ${system}/${template}:`, error.message);
            return {
                success: false,
                error: error.message,
                system,
                template
            };
        }
    }

    /**
     * Génère des exemples pour tous les templates d'un système
     */
    async generateSystemExamples(system) {
        console.log(`🏗️ Génération des exemples pour: ${system}`);
        
        const templatesDir = path.join(__dirname, '..', '..', 'src', 'templates', 'pdf', system);
        
        try {
            const files = await fs.readdir(templatesDir);
            const templates = files
                .filter(file => file.endsWith('.html'))
                .map(file => file.replace('.html', ''));
            
            const results = [];
            
            for (const template of templates) {
                const result = await this.generateExample({
                    system,
                    template,
                    userId: 'system',
                    rights: 'public',
                    titre: `Exemple ${template}`
                });
                
                results.push(result);
                
                // Pause entre les générations
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            return results;
            
        } catch (error) {
            console.error(`❌ Erreur lecture templates ${system}:`, error.message);
            return [];
        }
    }

    /**
     * Génère des exemples pour tous les systèmes
     */
    async generateAllExamples() {
        console.log('🌍 Génération des exemples pour tous les systèmes...');
        
        const systems = ['monsterhearts', 'engrenages', 'metro2033', 'mistengine'];
        const allResults = [];
        
        for (const system of systems) {
            const results = await this.generateSystemExamples(system);
            allResults.push(...results);
        }
        
        return allResults;
    }

    /**
     * Affiche un résumé des générations
     */
    displaySummary(results) {
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        
        console.log('\n📊 Résumé de génération:');
        console.log(`✅ Succès: ${successful.length}`);
        console.log(`❌ Échecs: ${failed.length}`);
        
        if (successful.length > 0) {
            console.log('\n✅ PDFs générés avec succès:');
            successful.forEach(result => {
                console.log(`  - ${result.system}/${result.template}: ${result.fileName}`);
            });
        }
        
        if (failed.length > 0) {
            console.log('\n❌ Échecs:');
            failed.forEach(result => {
                console.log(`  - ${result.system}/${result.template}: ${result.error}`);
            });
        }
        
        const totalSize = successful.reduce((sum, r) => sum + r.size, 0);
        console.log(`\n💾 Taille totale: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    }
}

// Parsing des arguments de ligne de commande
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {};
    
    args.forEach(arg => {
        if (arg.startsWith('--system=')) options.system = arg.split('=')[1];
        if (arg.startsWith('--template=')) options.template = arg.split('=')[1];
        if (arg.startsWith('--user=')) options.userId = arg.split('=')[1];
        if (arg.startsWith('--rights=')) options.rights = arg.split('=')[1];
        if (arg.startsWith('--titre=')) options.titre = arg.split('=')[1];
    });
    
    return options;
}

// Exécution si appelé directement
async function main() {
    const options = parseArgs();
    const generator = new PdfExampleGenerator();
    
    let results = [];
    
    if (options.system === 'all') {
        results = await generator.generateAllExamples();
    } else if (options.system && options.template) {
        const result = await generator.generateExample(options);
        results = [result];
    } else if (options.system) {
        results = await generator.generateSystemExamples(options.system);
    } else {
        // Par défaut, générer un exemple Monsterhearts
        const result = await generator.generateExample({
            system: 'monsterhearts',
            template: 'plan-classe-instructions',
            userId: 'system',
            rights: 'public',
            titre: 'Instructions Plan de Classe'
        });
        results = [result];
    }
    
    generator.displaySummary(results);
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { PdfExampleGenerator };