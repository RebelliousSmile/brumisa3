import { PdfService } from '~/server/services/PdfService'
import { createReadStream } from 'fs'
import { stat } from 'fs/promises'

export default defineEventHandler(async (event) => {
  try {
    const documentId = parseInt(getRouterParam(event, 'id') || '0')
    
    if (!documentId || isNaN(documentId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID de document invalide'
      })
    }
    
    // Service PDF
    const pdfService = new PdfService()
    
    // Récupérer le chemin du PDF
    const pdfPath = await pdfService.obtenirPdf(documentId)
    
    if (!pdfPath) {
      throw createError({
        statusCode: 404,
        statusMessage: 'PDF non trouvé'
      })
    }
    
    // Vérifier que le fichier existe
    try {
      await stat(pdfPath)
    } catch {
      throw createError({
        statusCode: 404,
        statusMessage: 'Fichier PDF non trouvé sur le disque'
      })
    }
    
    // Définir les headers pour le téléchargement
    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(event, 'Content-Disposition', `attachment; filename="document-${documentId}.pdf"`)
    setHeader(event, 'Cache-Control', 'private, no-cache')
    
    // Retourner le stream du fichier
    const stream = createReadStream(pdfPath)
    return sendStream(event, stream)
    
  } catch (error) {
    console.error('Erreur téléchargement PDF:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors du téléchargement du PDF'
    })
  }
})