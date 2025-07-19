// src/services/pdf.service.ts
import puppeteer from 'puppeteer';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs-extra';

export class PdfService {
  private outputDir = path.join(process.cwd(), 'output', 'pdfs');

  constructor() {
    // Créer le dossier de sortie s'il n'existe pas
    fs.ensureDirSync(this.outputDir);
  }

  async generateCharacterSheet(userId: string, characterId: string): Promise<string> {
    try {
      // Récupérer le personnage
      const character = await prisma.character.findFirst({
        where: { id: characterId, userId },
        include: { template: true },
      });

      if (!character) {
        throw new Error('Personnage non trouvé');
      }

      // Générer le HTML selon le système
      const html = await this.generateHTML(character);

      // Générer le PDF
      const filename = `${character.name.replace(/[^a-zA-Z0-9]/g, '_')}_${character.system}_${Date.now()}.pdf`;
      const filepath = path.join(this.outputDir, filename);

      await this.generatePDF(html, filepath);

      // Enregistrer dans la base
      const pdfDocument = await prisma.pdfDocument.create({
        data: {
          filename,
          title: `Fiche de ${character.name}`,
          type: 'CHARACTER_SHEET',
          filePath: filepath,
          templateData: character,
          status: 'COMPLETED',
          userId,
          characterId,
        },
      });

      logger.info('PDF généré', { pdfId: pdfDocument.id, characterId, filename });
      return pdfDocument.id;
    } catch (error) {
      logger.error('Erreur génération PDF', { error: error.message, characterId, userId });
      throw error;
    }
  }

  private async generateHTML(character: any): Promise<string> {
    switch (character.system) {
      case 'MONSTERHEARTS':
        return this.generateMonsterheartsHTML(character);
      case 'SEPTIEME_MER':
        return this.generate7thSeaHTML(character);
      case 'ENGRENAGES':
        return this.generateEngrenagesHTML(character);
      case 'METRO_2033':
        return this.generateMetroHTML(character);
      case 'MIST_ENGINE':
        return this.generateMistHTML(character);
      default:
        return this.generateGenericHTML(character);
    }
  }

  private generateMonsterheartsHTML(character: any): string {
    const basicInfo = character.basicInfo || {};
    const attributes = character.attributes || {};
    const skills = character.skills || {};
    const moves = character.moves || {};
    const conditions = character.conditions || [];

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Fiche Monsterhearts - ${character.name}</title>
        <style>
            body {
                font-family: 'Georgia', serif;
                font-size: 12px;
                line-height: 1.4;
                margin: 0;
                padding: 20px;
                background: #f8f4e6;
            }
            
            .character-sheet {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                border: 3px solid #8b0000;
                border-radius: 10px;
                overflow: hidden;
            }
            
            .header {
                background: linear-gradient(135deg, #8b0000, #a52a2a);
                color: white;
                padding: 20px;
                text-align: center;
                position: relative;
            }
            
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="hearts" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M10,5 C8,3 6,3 6,6 C6,8 8,10 10,12 C12,10 14,8 14,6 C14,3 12,3 10,5z" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23hearts)"/></svg>') repeat;
                opacity: 0.3;
            }
            
            .character-name {
                font-size: 28px;
                font-weight: bold;
                margin: 0;
                position: relative;
                z-index: 1;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            }
            
            .skin-info {
                font-size: 16px;
                margin-top: 5px;
                position: relative;
                z-index: 1;
                font-style: italic;
            }
            
            .content {
                padding: 20px;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            
            .section {
                border: 2px solid #8b0000;
                border-radius: 8px;
                padding: 15px;
                background: #fefefe;
            }
            
            .section-title {
                font-size: 16px;
                font-weight: bold;
                color: #8b0000;
                margin: 0 0 10px 0;
                text-transform: uppercase;
                letter-spacing: 1px;
                border-bottom: 2px solid #8b0000;
                padding-bottom: 5px;
            }
            
            .attributes {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }
            
            .attribute {
                text-align: center;
                border: 1px solid #ccc;
                border-radius: 5px;
                padding: 8px;
                background: #f9f9f9;
            }
            
            .attribute-name {
                font-weight: bold;
                color: #8b0000;
                text-transform: uppercase;
                font-size: 10px;
                margin-bottom: 3px;
            }
            
            .attribute-value {
                font-size: 18px;
                font-weight: bold;
                color: #333;
            }
            
            .moves-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .move-item {
                background: #f0f0f0;
                margin: 3px 0;
                padding: 8px;
                border-radius: 4px;
                border-left: 4px solid #8b0000;
            }
            
            .move-name {
                font-weight: bold;
                color: #8b0000;
            }
            
            .conditions {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .condition {
                background: #ffe6e6;
                border: 1px solid #ff9999;
                border-radius: 15px;
                padding: 4px 12px;
                font-size: 11px;
                font-weight: bold;
                color: #8b0000;
            }
            
            .condition.active {
                background: #8b0000;
                color: white;
            }
            
            .strings-section {
                grid-column: 1 / -1;
            }
            
            .strings-grid {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 5px;
                margin-top: 10px;
            }
            
            .string-box {
                aspect-ratio: 1;
                border: 2px solid #8b0000;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #ffeaa7;
                font-weight: bold;
                color: #8b0000;
            }
            
            .harm-track {
                display: flex;
                gap: 5px;
                margin-top: 10px;
            }
            
            .harm-box {
                width: 30px;
                height: 30px;
                border: 2px solid #8b0000;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #ffe6e6;
                font-weight: bold;
                color: #8b0000;
            }
            
            .harm-box.filled {
                background: #8b0000;
                color: white;
            }
            
            .experience {
                display: flex;
                gap: 3px;
                margin-top: 10px;
            }
            
            .xp-bubble {
                width: 20px;
                height: 20px;
                border: 2px solid #8b0000;
                border-radius: 50%;
                background: #ffeaa7;
            }
            
            .xp-bubble.filled {
                background: #8b0000;
            }
            
            .look-section {
                grid-column: 1 / -1;
                text-align: center;
                font-style: italic;
                background: #f0f0f0;
                border-radius: 8px;
                padding: 15px;
            }
            
            .notes {
                grid-column: 1 / -1;
                min-height: 100px;
                border: 1px dashed #8b0000;
                padding: 10px;
                background: #fffef7;
                white-space: pre-wrap;
            }
        </style>
    </head>
    <body>
        <div class="character-sheet">
            <div class="header">
                <h1 class="character-name">${character.name}</h1>
                <div class="skin-info">${basicInfo.skin || 'Skin non défini'}</div>
            </div>
            
            <div class="content">
                <!-- Attributs -->
                <div class="section">
                    <h2 class="section-title">Attributs</h2>
                    <div class="attributes">
                        <div class="attribute">
                            <div class="attribute-name">Hot</div>
                            <div class="attribute-value">${attributes.hot || 0}</div>
                        </div>
                        <div class="attribute">
                            <div class="attribute-name">Cold</div>
                            <div class="attribute-value">${attributes.cold || 0}</div>
                        </div>
                        <div class="attribute">
                            <div class="attribute-name">Volatile</div>
                            <div class="attribute-value">${attributes.volatile || 0}</div>
                        </div>
                        <div class="attribute">
                            <div class="attribute-name">Dark</div>
                            <div class="attribute-value">${attributes.dark || 0}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Moves -->
                <div class="section">
                    <h2 class="section-title">Moves</h2>
                    <ul class="moves-list">
                        ${moves.basic ? moves.basic.map(move => `
                            <li class="move-item">
                                <span class="move-name">${move.name || move}</span>
                                ${move.description ? `<div style="font-size: 10px; margin-top: 3px;">${move.description}</div>` : ''}
                            </li>
                        `).join('') : '<li class="move-item">Aucun move défini</li>'}
                        
                        ${moves.skin ? moves.skin.map(move => `
                            <li class="move-item">
                                <span class="move-name">${move.name || move}</span>
                                ${move.description ? `<div style="font-size: 10px; margin-top: 3px;">${move.description}</div>` : ''}
                            </li>
                        `).join('') : ''}
                    </ul>
                </div>
                
                <!-- Conditions -->
                <div class="section">
                    <h2 class="section-title">Conditions</h2>
                    <div class="conditions">
                        ${['Afraid', 'Angry', 'Hopeless', 'Lost'].map(condition => `
                            <div class="condition ${conditions.includes(condition) ? 'active' : ''}">${condition}</div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Harm -->
                <div class="section">
                    <h2 class="section-title">Harm</h2>
                    <div class="harm-track">
                        ${[1, 2, 3, 4].map(level => `
                            <div class="harm-box ${(character.harm?.current || 0) >= level ? 'filled' : ''}">${level}</div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Strings -->
                <div class="section strings-section">
                    <h2 class="section-title">Strings</h2>
                    <div class="strings-grid">
                        ${Array.from({length: 10}, (_, i) => `
                            <div class="string-box">${i + 1}</div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Look -->
                <div class="look-section">
                    <strong>Look:</strong> ${basicInfo.look || 'Non défini'}<br>
                    <strong>Origin:</strong> ${basicInfo.origin || 'Non défini'}<br>
                    <strong>Eyes:</strong> ${basicInfo.eyes || 'Non défini'}<br>
                    <strong>Style:</strong> ${basicInfo.style || 'Non défini'}
                </div>
                
                <!-- Notes -->
                ${character.notes ? `
                <div class="section">
                    <h2 class="section-title">Notes</h2>
                    <div class="notes">${character.notes}</div>
                </div>
                ` : ''}
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private generate7thSeaHTML(character: any): string {
    // Template pour 7ème Mer - structure similaire mais adaptée
    const basicInfo = character.basicInfo || {};
    const attributes = character.attributes || {};
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Fiche 7ème Mer - ${character.name}</title>
        <style>
            /* Styles spécifiques à 7ème Mer avec thème maritime */
            body { 
                font-family: 'Times New Roman', serif; 
                background: #f0f8ff;
                background-image: 
                    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%);
            }
            .character-sheet { 
                border: 3px solid #1e4d72; 
                background: white;
            }
            .header { 
                background: linear-gradient(135deg, #1e4d72, #2980b9); 
                color: white;
            }
            .section-title { color: #1e4d72; }
            /* ... autres styles spécifiques */
        </style>
    </head>
    <body>
        <div class="character-sheet">
            <div class="header">
                <h1>${character.name}</h1>
                <div>Héros de ${basicInfo.nation || 'Nation inconnue'}</div>
            </div>
            <!-- Contenu spécifique à 7ème Mer -->
        </div>
    </body>
    </html>
    `;
  }

  private generateEngrenagesHTML(character: any): string {
    // Template steampunk pour Engrenages
    return `<!-- Template Engrenages steampunk -->`;
  }

  private generateMetroHTML(character: any): string {
    // Template post-apocalyptique pour Metro
    return `<!-- Template Metro post-apocalyptique -->`;
  }

  private generateMistHTML(character: any): string {
    // Template mystique pour Mist Engine
    return `<!-- Template Mist Engine mystique -->`;
  }

  private generateGenericHTML(character: any): string {
    // Template générique
    return `<!-- Template générique -->`;
  }

  private async generatePDF(html: string, outputPath: string): Promise<void> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      await page.pdf({
        path: outputPath,
        format: 'A4',
        printBackground: true,
        margin: {
          top: '10mm',
          right: '10mm',
          bottom: '10mm',
          left: '10mm',
        },
      });
    } finally {
      await browser.close();
    }
  }

  async getPdfById(userId: string, pdfId: string): Promise<any> {
    const pdf = await prisma.pdfDocument.findFirst({
      where: { id: pdfId, userId },
      include: { character: true },
    });

    if (!pdf) {
      throw new Error('PDF non trouvé');
    }

    return pdf;
  }

  async getUserPdfs(userId: string) {
    return prisma.pdfDocument.findMany({
      where: { userId },
      include: {
        character: { select: { id: true, name: true, system: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deletePdf(userId: string, pdfId: string): Promise<void> {
    const pdf = await this.getPdfById(userId, pdfId);
    
    // Supprimer le fichier physique
    if (fs.existsSync(pdf.filePath)) {
      await fs.remove(pdf.filePath);
    }

    // Supprimer de la base
    await prisma.pdfDocument.delete({
      where: { id: pdfId },
    });

    logger.info('PDF supprimé', { pdfId, userId });
  }
}