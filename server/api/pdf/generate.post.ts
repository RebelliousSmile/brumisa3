import { PdfService } from '~/server/services/PdfService'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { type, donnees, systeme } = body
    
    if (!type || !donnees || !systeme) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Type, données et système requis'
      })
    }
    
    // Validation du type de document
    const typesValides = ['CHARACTER', 'TOWN', 'GROUP', 'ORGANIZATION', 'DANGER', 'GENERIQUE']
    if (!typesValides.includes(type.toUpperCase())) {
      throw createError({
        statusCode: 400,
        statusMessage: `Type de document invalide: ${type}`
      })
    }
    
    // Récupération de la session utilisateur (optionnel)
    const session = await getUserSession(event)
    const utilisateur = session?.user || null
    
    // Service de génération PDF
    const pdfService = new PdfService()
    
    const resultat = await pdfService.genererDocument({
      type: type.toUpperCase() as any,
      donnees,
      utilisateur,
      systeme
    })
    
    return {
      success: true,
      documentId: resultat.document.id,
      downloadUrl: resultat.downloadUrl,
      message: 'Document PDF généré avec succès'
    }
    
  } catch (error) {
    console.error('Erreur génération PDF:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la génération du PDF'
    })
  }
})