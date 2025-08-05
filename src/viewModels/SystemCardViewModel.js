/**
 * ViewModel pour les cartes de systèmes de JDR
 * Responsabilité : Préparer les données pour l'affichage des cartes systèmes
 */
class SystemCardViewModel {
    constructor(systemThemeService) {
        this.systemThemeService = systemThemeService;
    }

    /**
     * Prépare les données pour une carte système
     * @param {Object} system - Données du système
     * @returns {Object} Données formatées pour la vue
     */
    prepareCard(system) {
        const theme = this.systemThemeService.getTheme(system.code);
        
        return {
            code: system.code,
            nom: system.nom,
            description: system.description || '',
            version: system.version || '',
            icon: theme.icon,
            classes: theme.classes
        };
    }

    /**
     * Prépare les données pour plusieurs cartes
     * @param {Object[]} systems - Liste des systèmes
     * @returns {Object[]} Liste des cartes formatées
     */
    prepareCards(systems) {
        return systems.map(system => this.prepareCard(system));
    }

    /**
     * Groupe les systèmes par colonne pour l'affichage
     * @param {string[]} mainColumnCodes - Codes des systèmes colonne principale
     * @param {string[]} secondColumnCodes - Codes des systèmes colonne secondaire
     * @param {Object[]} allSystems - Tous les systèmes disponibles
     * @returns {Object} Systèmes groupés par colonne
     */
    groupByColumns(mainColumnCodes, secondColumnCodes, allSystems) {
        const findSystems = (codes) => {
            return codes
                .map(code => allSystems.find(s => s.code === code))
                .filter(Boolean)
                .map(system => this.prepareCard(system));
        };

        return {
            mainColumn: findSystems(mainColumnCodes),
            secondColumn: findSystems(secondColumnCodes)
        };
    }
}

module.exports = SystemCardViewModel;