/**
 * Service centralisé pour la navigation
 * Respecte les principes DRY et SOLID
 */
class NavigationService {
    /**
     * Navigue vers un système de jeu
     * @param {string} systeme - L'identifiant du système
     * @param {boolean} forcePageSysteme - Force la navigation vers la page du système
     */
    naviguerVersSysteme(systeme, forcePageSysteme = false) {
        const utilisateur = window.Alpine?.store('app')?.utilisateur;
        
        if (!forcePageSysteme && utilisateur) {
            // Si l'utilisateur est connecté, aller directement à la création
            this.naviguerVersCreationPersonnage(systeme);
        } else {
            // Sinon, aller vers la page du système
            this.naviguerVersPageSysteme(systeme);
        }
    }
    
    /**
     * Navigue vers la page de création de personnage
     * @param {string} systeme - L'identifiant du système
     */
    naviguerVersCreationPersonnage(systeme) {
        window.location.href = `/personnages/nouveau?systeme=${systeme}`;
    }
    
    /**
     * Navigue vers la page de présentation du système
     * @param {string} systeme - L'identifiant du système
     */
    naviguerVersPageSysteme(systeme) {
        window.location.href = `/${systeme}`;
    }
    
    /**
     * Navigue vers la page de connexion avec redirection
     * @param {string} redirectUrl - L'URL de redirection après connexion
     * @param {Object} params - Paramètres additionnels
     */
    naviguerVersConnexion(redirectUrl, params = {}) {
        let url = `/connexion?redirect=${encodeURIComponent(redirectUrl)}`;
        
        // Ajouter les paramètres additionnels
        Object.entries(params).forEach(([key, value]) => {
            url += `&${key}=${encodeURIComponent(value)}`;
        });
        
        window.location.href = url;
    }
    
    /**
     * Navigue vers la liste des personnages
     */
    naviguerVersListePersonnages() {
        window.location.href = '/personnages';
    }
    
    /**
     * Navigue vers un personnage spécifique
     * @param {number} personnageId - L'ID du personnage
     */
    naviguerVersPersonnage(personnageId) {
        window.location.href = `/personnages/${personnageId}`;
    }
    
    /**
     * Navigue vers la page d'accueil
     */
    naviguerVersAccueil() {
        window.location.href = '/';
    }
    
    /**
     * Navigue avec animation
     * @param {Function} navigationCallback - La fonction de navigation à exécuter
     * @param {number} delay - Le délai en millisecondes (par défaut 200ms)
     */
    naviguerAvecAnimation(navigationCallback, delay = 200) {
        // Ajouter une classe pour l'animation de sortie
        document.body.classList.add('page-transition-out');
        
        setTimeout(() => {
            navigationCallback();
        }, delay);
    }
}

// Créer une instance singleton
const navigationService = new NavigationService();

// Exposer le service globalement si Alpine.js est chargé
if (window.Alpine) {
    window.Alpine.data('navigationService', () => navigationService);
}