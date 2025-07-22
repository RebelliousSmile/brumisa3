const BaseService = require('./BaseService');
const { Newsletter, Actualite } = require('../models/Newsletter');

/**
 * Service pour la gestion de la newsletter
 */
class NewsletterService extends BaseService {
    constructor() {
        super('NewsletterService');
        this.newsletterModel = new Newsletter();
        this.actualiteModel = new Actualite();
    }

    /**
     * Inscrit un email à la newsletter
     */
    async inscrire(email, nom = null) {
        try {
            // Valider l'email
            if (!this.validerEmail(email)) {
                throw new Error('Format email invalide');
            }
            
            const emailNormalise = email.toLowerCase().trim();
            
            // Vérifier si déjà inscrit
            if (this.abonnes.has(emailNormalise)) {
                return {
                    succes: false,
                    message: 'Cet email est déjà inscrit à la newsletter'
                };
            }
            
            // Générer un token de désinscription
            const tokenDesinscription = crypto.randomBytes(32).toString('hex');
            
            // Ajouter l'abonné
            this.abonnes.set(emailNormalise, {
                email: emailNormalise,
                nom: nom?.trim() || null,
                date_inscription: new Date(),
                token_desinscription: tokenDesinscription,
                actif: true
            });
            
            this.logger.info('Nouvelle inscription newsletter:', { email: emailNormalise });
            
            return {
                succes: true,
                message: 'Inscription réussie ! Vous recevrez les dernières actualités.',
                token_desinscription: tokenDesinscription
            };
            
        } catch (erreur) {
            this.logger.error('Erreur lors de l\'inscription newsletter:', erreur);
            throw erreur;
        }
    }

    /**
     * Désinscrit un email via token
     */
    async desinscrire(token) {
        try {
            // Chercher l'abonné par token
            for (const [email, abonne] of this.abonnes.entries()) {
                if (abonne.token_desinscription === token && abonne.actif) {
                    // Marquer comme inactif plutôt que supprimer
                    abonne.actif = false;
                    abonne.date_desinscription = new Date();
                    
                    this.logger.info('Désinscription newsletter:', { email });
                    
                    return {
                        succes: true,
                        message: 'Désinscription réussie. Vous ne recevrez plus nos emails.'
                    };
                }
            }
            
            return {
                succes: false,
                message: 'Lien de désinscription invalide ou expiré'
            };
            
        } catch (erreur) {
            this.logger.error('Erreur lors de la désinscription:', erreur);
            throw erreur;
        }
    }

    /**
     * Obtient le nombre d'abonnés actifs
     */
    obtenirNombreAbonnes() {
        return Array.from(this.abonnes.values())
            .filter(abonne => abonne.actif).length;
    }

    /**
     * Obtient les dernières actualités
     */
    obtenirActualites(limite = 5) {
        return this.actualites
            .sort((a, b) => new Date(b.date_publication) - new Date(a.date_publication))
            .slice(0, limite);
    }

    /**
     * Ajoute une actualité (admin uniquement)
     */
    ajouterActualite(titre, contenu, auteur = 'Admin') {
        try {
            const actualite = {
                id: Date.now().toString(),
                titre: titre.trim(),
                contenu: contenu.trim(),
                auteur,
                date_publication: new Date(),
                slug: this.genererSlug(titre)
            };
            
            this.actualites.push(actualite);
            
            this.logger.info('Nouvelle actualité ajoutée:', { 
                titre: actualite.titre,
                auteur: actualite.auteur 
            });
            
            return actualite;
            
        } catch (erreur) {
            this.logger.error('Erreur lors de l\'ajout d\'actualité:', erreur);
            throw erreur;
        }
    }

    /**
     * Génère un flux RSS des actualités
     */
    genererFluxRSS() {
        const actualites = this.obtenirActualites(10);
        const baseUrl = process.env.BASE_URL;
        
        let rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
    <title>brumisa3.fr - Actualités</title>
    <description>Les dernières actualités du générateur de fiches de personnages JDR</description>
    <link>${baseUrl}</link>
    <language>fr-FR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
`;

        actualites.forEach(actualite => {
            const lien = `${baseUrl}/actualites/${actualite.slug}`;
            rss += `
    <item>
        <title><![CDATA[${actualite.titre}]]></title>
        <description><![CDATA[${actualite.contenu}]]></description>
        <link>${lien}</link>
        <guid>${lien}</guid>
        <pubDate>${new Date(actualite.date_publication).toUTCString()}</pubDate>
        <author>${actualite.auteur}</author>
    </item>`;
        });

        rss += `
</channel>
</rss>`;

        return rss;
    }

    /**
     * Envoie une newsletter (simulation)
     */
    async envoyerNewsletter(sujet, contenu) {
        try {
            const abonnesActifs = Array.from(this.abonnes.values())
                .filter(abonne => abonne.actif);
            
            // En production, on intégrerait un service d'emailing
            // Pour l'instant, on simule l'envoi
            this.logger.info('Newsletter envoyée (simulation):', {
                sujet,
                nb_destinataires: abonnesActifs.length
            });
            
            return {
                succes: true,
                message: `Newsletter envoyée à ${abonnesActifs.length} abonnés`,
                nb_destinataires: abonnesActifs.length
            };
            
        } catch (erreur) {
            this.logger.error('Erreur lors de l\'envoi de newsletter:', erreur);
            throw erreur;
        }
    }

    /**
     * Valide le format email
     */
    validerEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Génère un slug à partir du titre
     */
    genererSlug(titre) {
        return titre
            .toLowerCase()
            .replace(/[àáâäã]/g, 'a')
            .replace(/[èéêë]/g, 'e')
            .replace(/[ìíîï]/g, 'i')
            .replace(/[òóôöõ]/g, 'o')
            .replace(/[ùúûü]/g, 'u')
            .replace(/[ç]/g, 'c')
            .replace(/[ñ]/g, 'n')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    /**
     * Initialise quelques actualités de test
     */
    initialiserActualitesTest() {
        const actualitesTest = [
            {
                titre: "Nouveau système : 7ème Mer disponible !",
                contenu: "Vous pouvez maintenant créer des fiches de personnages pour le système 7ème Mer avec des templates thématiques maritimes.",
                auteur: "Équipe Dev"
            },
            {
                titre: "Amélioration des PDFs Monsterhearts",
                contenu: "Les fiches Monsterhearts ont été redesignées avec un style gothique romantique encore plus immersif.",
                auteur: "Designer"
            },
            {
                titre: "Fonctionnalité de partage améliorée",
                contenu: "Partagez vos fiches via QR codes et liens temporaires sécurisés. Parfait pour vos sessions de jeu !",
                auteur: "Équipe Dev"
            },
            {
                titre: "Version mobile optimisée",
                contenu: "L'interface mobile a été entièrement repensée pour une création de personnages fluide sur smartphone.",
                auteur: "UX Designer"
            }
        ];

        actualitesTest.forEach((actu, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (index * 3)); // Espacer de 3 jours
            
            this.actualites.push({
                id: `test-${index}`,
                titre: actu.titre,
                contenu: actu.contenu,
                auteur: actu.auteur,
                date_publication: date,
                slug: this.genererSlug(actu.titre)
            });
        });
    }
}

module.exports = NewsletterService;