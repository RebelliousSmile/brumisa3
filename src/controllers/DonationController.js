const BaseController = require('./BaseController');
const UtilisateurService = require('../services/UtilisateurService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Contrôleur pour la gestion des dons et paiements
 */
class DonationController extends BaseController {
    constructor() {
        super('DonationController');
        this.utilisateurService = new UtilisateurService();
    }

    /**
     * Crée une session de paiement Stripe
     * POST /api/donations/create-payment-intent
     */
    creerSessionPaiement = this.wrapAsync(async (req, res) => {
        this.validerCorps(req, ['amount', 'email']);
        
        const { amount, email, message } = req.body;
        
        // Valider le montant (minimum 1€, maximum 1000€)
        if (amount < 100 || amount > 100000) {
            return this.repondreErreur(res, 400, 'Montant invalide (entre 1€ et 1000€)');
        }
        
        // Valider l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return this.repondreErreur(res, 400, 'Email invalide');
        }
        
        try {
            // Créer la session Stripe Checkout
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [{
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: 'Don brumisa3.fr',
                            description: message || 'Soutien au développement de brumisa3.fr',
                        },
                        unit_amount: amount, // Déjà en centimes
                    },
                    quantity: 1,
                }],
                mode: 'payment',
                customer_email: email,
                success_url: `${process.env.BASE_URL}/support/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.BASE_URL}/support`,
                metadata: {
                    donor_email: email,
                    message: message || '',
                    amount_euros: (amount / 100).toString()
                }
            });
            
            return this.repondreSucces(res, {
                id: session.id,
                url: session.url
            }, 'Session de paiement créée');
            
        } catch (error) {
            console.error('Erreur Stripe:', error);
            return this.repondreErreur(res, 500, 'Erreur lors de la création du paiement');
        }
    });

    /**
     * Webhook Stripe pour traiter les paiements confirmés
     * POST /api/donations/webhook
     */
    webhookStripe = this.wrapAsync(async (req, res) => {
        const sig = req.headers['stripe-signature'];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
        
        let event;
        
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } catch (err) {
            console.error('Erreur webhook Stripe:', err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        
        // Traiter l'événement
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            await this.traiterPaiementConfirme(session);
        }
        
        res.json({ received: true });
    });

    /**
     * Page de succès après paiement
     * GET /support/success
     */
    paiementSucces = this.wrapAsync(async (req, res) => {
        const { session_id } = req.query;
        
        if (!session_id) {
            return res.redirect('/support');
        }
        
        try {
            const session = await stripe.checkout.sessions.retrieve(session_id);
            
            const donationData = {
                amount: session.amount_total / 100,
                email: session.customer_email,
                message: session.metadata.message,
                status: session.payment_status
            };
            
            return res.render('systemes/support-success', {
                title: 'Merci pour votre don !',
                donation: donationData
            });
            
        } catch (error) {
            console.error('Erreur récupération session:', error);
            return res.redirect('/support?error=session');
        }
    });

    /**
     * Traite un paiement confirmé et active le Premium
     * @param {Object} session - Session Stripe
     */
    async traiterPaiementConfirme(session) {
        try {
            const email = session.metadata.donor_email;
            const amount = parseFloat(session.metadata.amount_euros);
            
            console.log(`💰 Don reçu: ${amount}€ de ${email}`);
            
            // Trouver ou créer l'utilisateur
            let utilisateur = await this.utilisateurService.obtenirParEmail(email);
            
            if (utilisateur) {
                // Utilisateur existant - activer Premium
                await this.utilisateurService.activerPremium(utilisateur.id, amount);
                console.log(`✅ Premium activé pour ${email}`);
            } else {
                // Créer un compte Premium temporaire
                await this.utilisateurService.creerCompteDonateur(email, amount);
                console.log(`🆕 Compte donateur créé pour ${email}`);
            }
            
            // Log du don pour les statistiques
            await this.enregistrerDon(session);
            
        } catch (error) {
            console.error('Erreur traitement paiement:', error);
        }
    }

    /**
     * Enregistre un don dans la base de données
     * @param {Object} session - Session Stripe
     */
    async enregistrerDon(session) {
        // TODO: Créer table donations pour les statistiques
        console.log('Don enregistré:', {
            email: session.metadata.donor_email,
            amount: session.metadata.amount_euros,
            message: session.metadata.message,
            session_id: session.id,
            date: new Date()
        });
    }

    /**
     * Obtient les statistiques des dons (admin)
     * GET /api/admin/donations/stats
     */
    obtenirStatistiquesDons = this.wrapAsync(async (req, res) => {
        this.verifierPermissions(req, 'ADMIN');
        
        // TODO: Implémenter avec une vraie table donations
        const stats = {
            total_dons: 0,
            montant_total: 0,
            donateurs_uniques: 0,
            dernier_don: null,
            dons_par_mois: []
        };
        
        return this.repondreSucces(res, stats, 'Statistiques récupérées');
    });
}

module.exports = DonationController;