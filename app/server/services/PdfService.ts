import PDFDocument from 'pdfkit'
import { prisma } from '../utils/prisma'
import { promises as fs } from 'fs'
import { join } from 'path'
import { createHash } from 'crypto'

interface PdfGenerationOptions {
  type: 'CHARACTER' | 'TOWN' | 'GROUP' | 'ORGANIZATION' | 'DANGER' | 'GENERIQUE'
  donnees: Record<string, any>
  utilisateur?: {
    id: number
    email: string
    role: string
  } | null
  systeme: string
}

interface GeneratedDocument {
  document: any
  pdfPath: string
  downloadUrl: string
}

/**
 * Service pour la génération et gestion des PDFs avec Nitro
 */
export class PdfService {
  private outputDir: string
  private templatesDir: string
  
  constructor() {
    this.outputDir = join(process.cwd(), 'output')
    this.templatesDir = join(process.cwd(), 'assets', 'templates', 'pdf')
    
    // Initialiser le dossier de sortie
    this.initialiserDossierSortie()
  }

  /**
   * Initialise le dossier de sortie
   */
  private async initialiserDossierSortie() {
    try {
      await fs.access(this.outputDir)
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true })
      console.log('Dossier output créé:', this.outputDir)
    }
  }

  /**
   * Génère un document PDF selon le type et le système
   * Méthode principale pour la génération de documents
   */
  async genererDocument(options: PdfGenerationOptions): Promise<GeneratedDocument> {
    const { type, donnees, utilisateur, systeme } = options
    
    try {
      console.log('Génération document demandée', {
        type,
        systeme,
        utilisateur_id: utilisateur?.id || null
      })

      // Validation du type de document
      const typesValides = ['CHARACTER', 'TOWN', 'GROUP', 'ORGANIZATION', 'DANGER', 'GENERIQUE']
      if (!typesValides.includes(type)) {
        throw new Error(`Type de document invalide: ${type}`)
      }

      // Créer l'entrée Document en base
      const document = await prisma.document.create({
        data: {
          titre: donnees.titre || `Document ${type}`,
          type: type as any,
          systemeJeu: systeme,
          contenu: donnees,
          utilisateurId: utilisateur?.id || null,
          statut: utilisateur ? 'BROUILLON' : 'TEMPORAIRE'
        }
      })

      // Générer le PDF
      const nomFichier = this.genererNomFichierUnique(type, systeme, document.id)
      const cheminPdf = join(this.outputDir, nomFichier)
      
      await this.genererPdfAvecPDFKit(type, donnees, systeme, cheminPdf)
      
      // URL de téléchargement
      const downloadUrl = `/api/pdf/download/${document.id}`
      
      console.log('Document généré avec succès', {
        documentId: document.id,
        pdfPath: cheminPdf
      })

      return {
        document,
        pdfPath: cheminPdf,
        downloadUrl
      }

    } catch (error) {
      console.error('Erreur génération document:', error)
      throw error
    }
  }

  /**
   * Génère un PDF avec PDFKit
   */
  private async genererPdfAvecPDFKit(
    type: string, 
    donnees: Record<string, any>, 
    systeme: string, 
    cheminSortie: string
  ): Promise<void> {
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    })

    // Stream vers le fichier
    const stream = doc.pipe(require('fs').createWriteStream(cheminSortie))

    // Configuration des couleurs selon le système
    const couleurs = this.getCouleursPourSysteme(systeme)
    
    // En-tête du document
    doc.fillColor(couleurs.primary)
       .fontSize(24)
       .font('Helvetica-Bold')
       .text(donnees.titre || `Document ${type}`, 50, 50)

    // Sous-titre avec le système
    doc.fillColor(couleurs.secondary)
       .fontSize(14)
       .font('Helvetica')
       .text(`Système: ${this.getSystemeNomComplet(systeme)}`, 50, 85)

    // Ligne de séparation
    doc.moveTo(50, 110)
       .lineTo(550, 110)
       .strokeColor(couleurs.primary)
       .lineWidth(2)
       .stroke()

    // Contenu selon le type
    let yPosition = 140
    
    switch (type.toUpperCase()) {
      case 'CHARACTER':
        yPosition = await this.genererContenuPersonnage(doc, donnees, couleurs, yPosition)
        break
      case 'ORGANIZATION':
        yPosition = await this.genererContenuOrganisation(doc, donnees, couleurs, yPosition)
        break
      case 'TOWN':
        yPosition = await this.genererContenuLieu(doc, donnees, couleurs, yPosition)
        break
      default:
        yPosition = await this.genererContenuGenerique(doc, donnees, couleurs, yPosition)
    }

    // Pied de page
    const hauteurPage = 792 // A4 height in points
    doc.fillColor('#888888')
       .fontSize(10)
       .text('Généré avec brumisater', 50, hauteurPage - 30)
       .text(new Date().toLocaleDateString('fr-FR'), 400, hauteurPage - 30)

    // Finaliser le document
    doc.end()

    // Attendre que le stream soit fermé
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve)
      stream.on('error', reject)
    })
  }

  /**
   * Génère le contenu pour un personnage
   */
  private async genererContenuPersonnage(
    doc: PDFDocument, 
    donnees: Record<string, any>, 
    couleurs: any, 
    yPosition: number
  ): Promise<number> {
    // Nom du personnage
    if (donnees.nom) {
      doc.fillColor(couleurs.primary)
         .fontSize(18)
         .font('Helvetica-Bold')
         .text('Nom:', 50, yPosition)
         .text(donnees.nom, 120, yPosition)
      yPosition += 30
    }

    // Concept/Description
    if (donnees.concept || donnees.description) {
      doc.fillColor(couleurs.primary)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('Concept:', 50, yPosition)
      
      doc.fillColor('#000000')
         .fontSize(12)
         .font('Helvetica')
         .text(donnees.concept || donnees.description || '', 50, yPosition + 20, {
           width: 500
         })
      yPosition += 60
    }

    // Caractéristiques/Stats
    if (donnees.caracteristiques || donnees.stats) {
      const stats = donnees.caracteristiques || donnees.stats
      doc.fillColor(couleurs.primary)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('Caractéristiques:', 50, yPosition)
      yPosition += 25

      for (const [key, value] of Object.entries(stats)) {
        if (typeof value === 'string' || typeof value === 'number') {
          doc.fillColor('#000000')
             .fontSize(12)
             .font('Helvetica')
             .text(`${key}: ${value}`, 70, yPosition)
          yPosition += 20
        }
      }
      yPosition += 10
    }

    return yPosition
  }

  /**
   * Génère le contenu pour une organisation
   */
  private async genererContenuOrganisation(
    doc: PDFDocument, 
    donnees: Record<string, any>, 
    couleurs: any, 
    yPosition: number
  ): Promise<number> {
    // Nom de l'organisation
    if (donnees.nom) {
      doc.fillColor(couleurs.primary)
         .fontSize(18)
         .font('Helvetica-Bold')
         .text('Organisation:', 50, yPosition)
         .text(donnees.nom, 170, yPosition)
      yPosition += 40
    }

    // Description
    if (donnees.description) {
      doc.fillColor(couleurs.primary)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('Description:', 50, yPosition)
      
      doc.fillColor('#000000')
         .fontSize(12)
         .font('Helvetica')
         .text(donnees.description, 50, yPosition + 20, {
           width: 500
         })
      yPosition += 80
    }

    // Membres/PNJs
    if (donnees.membres || donnees.pnjs) {
      const membres = donnees.membres || donnees.pnjs
      doc.fillColor(couleurs.primary)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('Membres:', 50, yPosition)
      yPosition += 25

      if (Array.isArray(membres)) {
        membres.forEach((membre: any) => {
          doc.fillColor('#000000')
             .fontSize(12)
             .font('Helvetica')
             .text(`• ${membre.nom || membre}`, 70, yPosition)
          if (membre.role || membre.description) {
            doc.text(`  ${membre.role || membre.description}`, 70, yPosition + 15)
            yPosition += 35
          } else {
            yPosition += 20
          }
        })
      }
    }

    return yPosition
  }

  /**
   * Génère le contenu pour un lieu
   */
  private async genererContenuLieu(
    doc: PDFDocument, 
    donnees: Record<string, any>, 
    couleurs: any, 
    yPosition: number
  ): Promise<number> {
    // Nom du lieu
    if (donnees.nom) {
      doc.fillColor(couleurs.primary)
         .fontSize(18)
         .font('Helvetica-Bold')
         .text('Lieu:', 50, yPosition)
         .text(donnees.nom, 100, yPosition)
      yPosition += 40
    }

    // Description générale
    if (donnees.description) {
      doc.fillColor(couleurs.primary)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('Description:', 50, yPosition)
      
      doc.fillColor('#000000')
         .fontSize(12)
         .font('Helvetica')
         .text(donnees.description, 50, yPosition + 20, {
           width: 500
         })
      yPosition += 80
    }

    return yPosition
  }

  /**
   * Génère le contenu générique
   */
  private async genererContenuGenerique(
    doc: PDFDocument, 
    donnees: Record<string, any>, 
    couleurs: any, 
    yPosition: number
  ): Promise<number> {
    // Parcourir toutes les données
    for (const [key, value] of Object.entries(donnees)) {
      if (key === 'titre') continue // Déjà affiché en en-tête
      
      if (typeof value === 'string' && value.length > 0) {
        doc.fillColor(couleurs.primary)
           .fontSize(14)
           .font('Helvetica-Bold')
           .text(`${key}:`, 50, yPosition)
        
        doc.fillColor('#000000')
           .fontSize(12)
           .font('Helvetica')
           .text(value, 50, yPosition + 20, {
             width: 500
           })
        yPosition += 60
      } else if (typeof value === 'number') {
        doc.fillColor(couleurs.primary)
           .fontSize(12)
           .font('Helvetica')
           .text(`${key}: ${value}`, 50, yPosition)
        yPosition += 20
      }
    }

    return yPosition
  }

  /**
   * Obtient les couleurs pour un système donné
   */
  private getCouleursPourSysteme(systeme: string) {
    const couleursSystmes: Record<string, any> = {
      mistengine: {
        primary: '#8b5cf6', // violet-500
        secondary: '#7c3aed' // violet-600
      }
    }

    return couleursSystmes[systeme] || {
      primary: '#6b7280', // gray-500
      secondary: '#4b5563' // gray-600
    }
  }

  /**
   * Obtient le nom complet du système
   */
  private getSystemeNomComplet(systeme: string): string {
    const noms: Record<string, string> = {
      mistengine: 'Mist Engine'
    }
    return noms[systeme] || systeme
  }

  /**
   * Génère un nom de fichier unique
   */
  private genererNomFichierUnique(type: string, systeme: string, documentId: number): string {
    const timestamp = Date.now()
    const hash = createHash('md5')
      .update(`${type}-${systeme}-${documentId}-${timestamp}`)
      .digest('hex')
      .substring(0, 8)
    
    return `${type.toLowerCase()}-${systeme}-${documentId}-${hash}.pdf`
  }

  /**
   * Récupère un PDF existant par ID de document
   */
  async obtenirPdf(documentId: number): Promise<string | null> {
    try {
      const document = await prisma.document.findUnique({
        where: { id: documentId }
      })

      if (!document) {
        return null
      }

      // Rechercher le fichier PDF correspondant
      const nomPattern = `*-${document.systemeJeu}-${documentId}-*.pdf`
      const fichiers = await fs.readdir(this.outputDir)
      
      const fichierTrouve = fichiers.find(f => {
        const regex = new RegExp(`.*-${document.systemeJeu}-${documentId}-.*\\.pdf$`)
        return regex.test(f)
      })

      if (!fichierTrouve) {
        return null
      }

      return join(this.outputDir, fichierTrouve)
    } catch (error) {
      console.error('Erreur récupération PDF:', error)
      return null
    }
  }
}