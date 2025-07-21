/**
 * Composant Alpine.js pour la navigation mobile
 */
window.AlpineComponents = window.AlpineComponents || {};

window.AlpineComponents.navigationMobile = function() {
    return {
        menuOuvert: false,
        
        init() {
            // Fermer le menu mobile si on redimensionne vers desktop
            window.addEventListener('resize', () => {
                if (window.innerWidth >= 768) { // md breakpoint
                    this.menuOuvert = false;
                }
            });
        },
        
        basculerMenu() {
            this.menuOuvert = !this.menuOuvert;
        },
        
        fermerMenu() {
            this.menuOuvert = false;
        },
        
        naviguer(url) {
            this.fermerMenu();
            // Délai pour permettre à l'animation de se terminer
            setTimeout(() => {
                window.location.href = url;
            }, 150);
        }
    };
};