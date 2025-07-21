/**
 * Composant Alpine.js pour le menu déroulant utilisateur
 */
window.AlpineComponents = window.AlpineComponents || {};

window.AlpineComponents.menuUtilisateur = function() {
    return {
        ouvert: false,
        
        init() {
            // Fermer le menu si on clique ailleurs
            document.addEventListener('click', (event) => {
                if (!this.$el.contains(event.target)) {
                    this.ouvert = false;
                }
            });
        },
        
        basculer() {
            this.ouvert = !this.ouvert;
        },
        
        fermer() {
            this.ouvert = false;
        },
        
        async deconnecter() {
            try {
                const response = await Alpine.store('app').requeteApi('/auth/deconnexion', {
                    method: 'POST'
                });
                
                if (response.succes) {
                    // Rediriger vers la page d'accueil
                    window.location.href = '/';
                } else {
                    throw new Error(response.message || 'Erreur lors de la déconnexion');
                }
            } catch (error) {
                console.error('Erreur déconnexion:', error);
                Alpine.store('app').ajouterMessage(
                    'Erreur lors de la déconnexion : ' + error.message,
                    'erreur'
                );
            }
        }
    };
};