const BaseService = require('./BaseService');

/**
 * Service pour la gestion des témoignages
 */
class TemoignageService extends BaseService {
    constructor() {
        super('TemoignageService');
        // En production, on utiliserait une vraie base de données
        // Pour l'instant, stockage en mémoire (sera perdu au redémarrage)
        this.temoignages = [];
        
        // Initialiser avec quelques témoignages de test
        this.initialiserTemoignagesTest();
    }

    /**
     * Ajoute un nouveau témoignage
     */
    async ajouterTemoignage(donnees) {
        try {
            // Valider les données
            this.validerDonnees(donnees);
            
            const temoignage = {
                id: Date.now().toString(),
                nom: donnees.nom.trim(),
                email: donnees.email?.toLowerCase().trim() || null,
                systeme_utilise: donnees.systeme_utilise || null,
                note: Math.max(1, Math.min(5, parseInt(donnees.note))), // Entre 1 et 5
                titre: donnees.titre?.trim() || null,
                contenu: donnees.contenu.trim(),
                date_creation: new Date(),
                approuve: false, // Nécessite approbation admin
                affiche: false,
                date_approbation: null,
                ip_adresse: donnees.ip_adresse || null
            };
            
            this.temoignages.push(temoignage);
            
            this.logger.info('Nouveau témoignage ajouté:', { 
                id: temoignage.id,
                nom: temoignage.nom,
                note: temoignage.note 
            });
            
            return {
                succes: true,
                message: 'Merci pour votre témoignage ! Il sera examiné avant publication.',
                id: temoignage.id
            };
            
        } catch (erreur) {
            this.logger.error('Erreur lors de l\'ajout de témoignage:', erreur);
            throw erreur;
        }
    }

    /**
     * Obtient les témoignages publics approuvés
     */
    obtenirTemoignagesPublics(limite = 6) {
        return this.temoignages
            .filter(t => t.approuve && t.affiche)
            .sort((a, b) => new Date(b.date_approbation) - new Date(a.date_approbation))
            .slice(0, limite)
            .map(t => ({
                id: t.id,
                nom: t.nom,
                systeme_utilise: t.systeme_utilise,
                note: t.note,
                titre: t.titre,
                contenu: t.contenu,
                date_creation: t.date_creation
            }));
    }

    /**
     * Obtient tous les témoignages (admin uniquement)
     */
    obtenirTousTemoignages(filtres = {}) {
        let temoignages = [...this.temoignages];
        
        // Filtrer par statut d'approbation
        if (filtres.approuve !== undefined) {
            temoignages = temoignages.filter(t => t.approuve === filtres.approuve);
        }
        
        // Filtrer par affichage
        if (filtres.affiche !== undefined) {
            temoignages = temoignages.filter(t => t.affiche === filtres.affiche);
        }
        
        // Filtrer par système
        if (filtres.systeme_utilise) {
            temoignages = temoignages.filter(t => t.systeme_utilise === filtres.systeme_utilise);
        }
        
        return temoignages.sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation));
    }

    /**
     * Approuve un témoignage (admin uniquement)
     */
    async approuverTemoignage(id, afficher = true) {
        try {
            const temoignage = this.temoignages.find(t => t.id === id);
            if (!temoignage) {
                throw new Error('Témoignage non trouvé');
            }
            
            temoignage.approuve = true;
            temoignage.affiche = afficher;
            temoignage.date_approbation = new Date();
            
            this.logger.info('Témoignage approuvé:', { 
                id, 
                affiche: afficher,
                nom: temoignage.nom 
            });
            
            return temoignage;
            
        } catch (erreur) {
            this.logger.error(`Erreur lors de l'approbation du témoignage ${id}:`, erreur);
            throw erreur;
        }
    }

    /**
     * Refuse un témoignage (admin uniquement)
     */
    async refuserTemoignage(id, raison = null) {
        try {
            const index = this.temoignages.findIndex(t => t.id === id);
            if (index === -1) {
                throw new Error('Témoignage non trouvé');
            }
            
            const temoignage = this.temoignages[index];
            
            // Marquer comme refusé plutôt que supprimer
            temoignage.approuve = false;
            temoignage.affiche = false;
            temoignage.raison_refus = raison;
            temoignage.date_refus = new Date();
            
            this.logger.info('Témoignage refusé:', { 
                id, 
                raison,
                nom: temoignage.nom 
            });
            
            return temoignage;
            
        } catch (erreur) {
            this.logger.error(`Erreur lors du refus du témoignage ${id}:`, erreur);
            throw erreur;
        }
    }

    /**
     * Bascule l'affichage d'un témoignage approuvé
     */
    async basculerAffichage(id) {
        try {
            const temoignage = this.temoignages.find(t => t.id === id);
            if (!temoignage) {
                throw new Error('Témoignage non trouvé');
            }
            
            if (!temoignage.approuve) {
                throw new Error('Le témoignage doit être approuvé avant d\'être affiché');
            }
            
            temoignage.affiche = !temoignage.affiche;
            
            this.logger.info(`Témoignage ${temoignage.affiche ? 'affiché' : 'masqué'}:`, { 
                id,
                nom: temoignage.nom 
            });
            
            return temoignage;
            
        } catch (erreur) {
            this.logger.error(`Erreur lors du basculement d'affichage ${id}:`, erreur);
            throw erreur;
        }
    }

    /**
     * Obtient les statistiques des témoignages
     */
    obtenirStatistiques() {
        const total = this.temoignages.length;
        const approuves = this.temoignages.filter(t => t.approuve).length;
        const affiches = this.temoignages.filter(t => t.affiche).length;
        const enAttente = this.temoignages.filter(t => !t.approuve && !t.raison_refus).length;
        
        // Note moyenne
        const notesApprouvees = this.temoignages
            .filter(t => t.approuve)
            .map(t => t.note);
        const noteMoyenne = notesApprouvees.length > 0 
            ? notesApprouvees.reduce((a, b) => a + b, 0) / notesApprouvees.length 
            : 0;
        
        // Répartition par système
        const parSysteme = {};
        this.temoignages
            .filter(t => t.approuve && t.systeme_utilise)
            .forEach(t => {
                parSysteme[t.systeme_utilise] = (parSysteme[t.systeme_utilise] || 0) + 1;
            });
        
        return {
            total,
            approuves,
            affiches,
            en_attente: enAttente,
            note_moyenne: Math.round(noteMoyenne * 10) / 10,
            par_systeme: parSysteme
        };
    }

    /**
     * Valide les données d'un témoignage
     */
    validerDonnees(donnees) {
        const erreurs = [];
        
        // Nom requis
        if (!donnees.nom || donnees.nom.trim().length < 2) {
            erreurs.push('Le nom doit contenir au moins 2 caractères');
        }
        
        if (donnees.nom && donnees.nom.trim().length > 50) {
            erreurs.push('Le nom ne peut pas dépasser 50 caractères');
        }
        
        // Email optionnel mais valide si fourni
        if (donnees.email && !this.validerEmail(donnees.email)) {
            erreurs.push('Format email invalide');
        }
        
        // Note requise et valide
        if (!donnees.note || isNaN(donnees.note)) {
            erreurs.push('Une note entre 1 et 5 est requise');
        } else {
            const note = parseInt(donnees.note);
            if (note < 1 || note > 5) {
                erreurs.push('La note doit être entre 1 et 5');
            }
        }
        
        // Contenu requis
        if (!donnees.contenu || donnees.contenu.trim().length < 10) {
            erreurs.push('Le témoignage doit contenir au moins 10 caractères');
        }
        
        if (donnees.contenu && donnees.contenu.trim().length > 1000) {
            erreurs.push('Le témoignage ne peut pas dépasser 1000 caractères');
        }
        
        // Titre optionnel mais limité
        if (donnees.titre && donnees.titre.trim().length > 100) {
            erreurs.push('Le titre ne peut pas dépasser 100 caractères');
        }
        
        if (erreurs.length > 0) {
            const erreur = new Error(erreurs.join(', '));
            erreur.name = 'ValidationError';
            erreur.details = erreurs;
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
     * Initialise quelques témoignages de test
     */
    initialiserTemoignagesTest() {
        const temoignagesTest = [
            {
                nom: "Marie L.",
                systeme_utilise: "monsterhearts",
                note: 5,
                titre: "Parfait pour mes parties Monsterhearts !",
                contenu: "Les fiches sont magnifiques et vraiment dans l'ambiance gothique. Mes joueurs adorent le design et c'est très pratique pour les sessions en ligne."
            },
            {
                nom: "Thomas D.",
                systeme_utilise: "metro2033",
                note: 4,
                titre: "Excellent outil pour MJ",
                contenu: "En tant que MJ, je peux créer rapidement des PNJ avec des fiches propres. Le système Metro 2033 est parfaitement adapté à l'ambiance post-apo."
            },
            {
                nom: "Sophie K.",
                systeme_utilise: "engrenages",
                note: 5,
                titre: "Interface intuitive",
                contenu: "Très facile à utiliser même sur mobile. J'ai pu créer ma mécanicienne steampunk pendant ma pause déjeuner ! Les PDFs sont de qualité professionnelle."
            },
            {
                nom: "Alex M.",
                systeme_utilise: "mistengine",
                note: 4,
                titre: "Bon support des systèmes narratifs",
                contenu: "Parfait pour Mist Engine. Les templates sont bien pensés et permettent de gérer facilement les Assets et Debilities. Recommandé !"
            },
            {
                nom: "Claire B.",
                note: 5,
                titre: "Service client au top",
                contenu: "J'avais un problème de génération PDF et l'équipe a été très réactive. Le site s'améliore constamment avec de nouvelles fonctionnalités."
            }
        ];

        temoignagesTest.forEach((temo, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (index * 5)); // Espacer de 5 jours
            
            this.temoignages.push({
                id: `test-${index}`,
                nom: temo.nom,
                email: null,
                systeme_utilise: temo.systeme_utilise || null,
                note: temo.note,
                titre: temo.titre,
                contenu: temo.contenu,
                date_creation: date,
                approuve: true,
                affiche: true,
                date_approbation: date,
                ip_adresse: null
            });
        });
    }
}

module.exports = TemoignageService;