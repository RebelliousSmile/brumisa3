/**
 * Helpers pour l'utilisation simple du système de boutons SOLID
 * Simplifie l'usage pour les développeurs tout en respectant l'architecture
 */

window.ButtonHelpers = {
    /**
     * Boutons de création
     */
    creerNouveauBouton() {
        return window.buttonService.createNewButton().build();
    },
    
    nouveauPersonnage() {
        return window.buttonService.createActionButton()
            .withText('Nouveau personnage')
            .withIcon(window.ButtonService.icons.user)
            .withHref('/personnages/nouveau')
            .withStyle('primary')
            .build();
    },
    
    genererPdf() {
        return window.buttonService.createActionButton()
            .withText('Générer PDF')
            .withIcon(window.ButtonService.icons.download)
            .withHref('/pdf/generer')
            .withStyle('primary')
            .build();
    },
    
    /**
     * Boutons d'action sur documents
     */
    voirDocument(type, id) {
        const url = type === 'personnage' ? `/personnages/${id}` : `/pdfs/${id}`;
        return window.buttonService.createActionButton()
            .withText('Voir')
            .withClick(`window.location.href='${url}'`)
            .build();
    },
    
    modifierPersonnage(id) {
        return window.buttonService.createActionButton()
            .withText('Modifier')
            .withIcon(window.ButtonService.icons.edit)
            .withClick(`window.location.href='/personnages/${id}/editer'`)
            .build();
    },
    
    dupliquerPersonnage(id) {
        return window.buttonService.createActionButton()
            .withText('Dupliquer')
            .withIcon(window.ButtonService.icons.copy)
            .withClick(`dupliquerPersonnage(${id})`)
            .build();
    },
    
    supprimerDocument(type, id) {
        const action = type === 'personnage' ? `supprimerPersonnage(${id})` : `supprimerPdf(${id})`;
        return window.buttonService.createActionButton()
            .withText('Supprimer')
            .withIcon(window.ButtonService.icons.trash)
            .withClick(action)
            .withStyle('danger')
            .build();
    },
    
    telechargerPdf(id) {
        return window.buttonService.createActionButton()
            .withText('Télécharger')
            .withIcon(window.ButtonService.icons.download)
            .withClick(`telechargerPdf(${id})`)
            .build();
    },
    
    relancerPdf(id) {
        return window.buttonService.createActionButton()
            .withText('Relancer')
            .withClick(`relancerPdf(${id})`)
            .withStyle('success')
            .build();
    },
    
    /**
     * Boutons de filtrage et navigation
     */
    filtreTous() {
        return window.buttonService.createActionButton()
            .withText('Tous')
            .withClick(`filtreSysteme = ''; appliquerFiltres()`)
            .build();
    },
    
    filtreSysteme(systeme) {
        return window.buttonService.createActionButton()
            .withText(systeme)
            .withClick(`filtreSysteme = '${systeme}'; appliquerFiltres()`)
            .build();
    },
    
    /**
     * Boutons d'onglets
     */
    ongletPersonnages() {
        return window.buttonService.createActionButton()
            .withText('Personnages')
            .withClick(`ongletActif = 'personnages'`)
            .build();
    },
    
    ongletPdfs() {
        return window.buttonService.createActionButton()
            .withText('PDFs')
            .withClick(`ongletActif = 'pdfs'`)
            .build();
    }
};