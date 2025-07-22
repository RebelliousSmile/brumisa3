const BaseService = require('./BaseService');
const { Resend } = require('resend');
const EmailTemplate = require('./EmailTemplate');

/**
 * Service d'envoi d'emails avec Resend
 * Utilise EmailTemplate pour le rendu des templates
 */
class EmailService extends BaseService {
    constructor() {
        super('EmailService');
        
        // Configuration Resend
        this.apiKey = process.env.RESEND_API_KEY;
        this.fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@localhost';
        this.fromName = process.env.RESEND_FROM_NAME || 'Générateur PDF JDR';
        this.isDevelopment = process.env.NODE_ENV === 'development';
        this.forceRealEmails = process.env.FORCE_REAL_EMAILS === 'true';
        
        // Initialiser le service de templates
        this.emailTemplate = new EmailTemplate();
        
        // Initialiser Resend seulement si on a une vraie clé API
        if (this.apiKey && this.apiKey !== 're_test_key_for_development') {
            try {
                this.resend = new Resend(this.apiKey);
                this.log('info', 'Service Resend initialisé');
            } catch (error) {
                this.logError(error, { context: 'resend_init' });
                this.resend = null;
            }
        } else {
            this.resend = null;
            this.log('warn', 'Mode développement : emails simulés (pas d\'API Resend configurée)');
        }
    }

    /**
     * Envoie un email de récupération de mot de passe
     * @param {string} email - Email du destinataire
     * @param {string} nom - Nom de l'utilisateur
     * @param {string} token - Token de récupération
     * @returns {Promise<Object>} Résultat de l'envoi
     */
    async envoyerMotDePasseOublie(email, nom, token) {
        const lienRecuperation = `${process.env.BASE_URL}/reinitialiser-mot-de-passe/${token}`;
        
        const variables = {
            nom: nom,
            lien_recuperation: lienRecuperation,
            duree_validite: '24 heures',
            token: token
        };

        return await this.envoyer({
            to: email,
            subject: 'Réinitialisation de votre mot de passe',
            template: 'mot-de-passe-oublie',
            variables
        });
    }

    /**
     * Envoie un email de bienvenue
     * @param {string} email - Email du destinataire
     * @param {string} nom - Nom de l'utilisateur
     * @returns {Promise<Object>} Résultat de l'envoi
     */
    async envoyerBienvenue(email, nom) {
        const lienConnexion = `${process.env.BASE_URL}/connexion`;
        
        const variables = {
            nom: nom,
            lien_connexion: lienConnexion
        };

        return await this.envoyer({
            to: email,
            subject: `Bienvenue sur ${this.fromName} !`,
            template: 'bienvenue',
            variables
        });
    }

    /**
     * Envoie un email de newsletter
     * @param {string} email - Email du destinataire
     * @param {string} nom - Nom de l'utilisateur
     * @param {string} token - Token de confirmation
     * @returns {Promise<Object>} Résultat de l'envoi
     */
    async envoyerNewsletter(email, nom, token) {
        const lienConfirmation = `${process.env.BASE_URL}/newsletter/confirmer/${token}`;
        
        const variables = {
            nom: nom,
            lien_confirmation: lienConfirmation,
            email: email
        };

        return await this.envoyer({
            to: email,
            subject: 'Confirmez votre inscription à la newsletter',
            template: 'newsletter',
            variables
        });
    }

    /**
     * Méthode générique d'envoi d'emails
     * @param {Object} options - Options d'envoi
     * @param {string} options.to - Destinataire
     * @param {string} options.subject - Sujet
     * @param {string} options.template - Nom du template
     * @param {Object} options.variables - Variables pour le template
     * @returns {Promise<Object>} Résultat de l'envoi
     */
    async envoyer({ to, subject, template, variables = {} }) {
        try {
            // Générer le contenu HTML depuis le template
            const htmlContent = await this.emailTemplate.render(template, variables);
            
            // En mode développement, simuler l'envoi
            if ((this.isDevelopment && !this.forceRealEmails) || !this.resend) {
                return await this.simulerEnvoi(to, subject, htmlContent, template, variables);
            }

            // Envoi réel avec Resend
            const result = await this.resend.emails.send({
                from: `${this.fromName} <${this.fromEmail}>`,
                to: [to],
                subject: subject,
                html: htmlContent
            });

            this.log('info', 'Email envoyé avec succès', {
                recipient: to,
                subject: subject,
                template: template,
                resend_id: result.data?.id
            });

            return {
                success: true,
                id: result.data?.id,
                messageId: result.data?.id,
                message: 'Email envoyé'
            };

        } catch (error) {
            this.logError(error, {
                recipient: to,
                subject: subject,
                template: template,
                context: 'email_send'
            });

            return {
                success: false,
                message: 'Erreur lors de l\'envoi',
                error: error.message
            };
        }
    }

    /**
     * Simule l'envoi d'un email en développement
     * @private
     */
    async simulerEnvoi(to, subject, htmlContent, template, variables) {
        this.log('info', '📧 EMAIL SIMULÉ (mode développement)', {
            destinataire: to,
            sujet: subject,
            template: template,
            contenu_html_length: htmlContent.length
        });

        // En développement, afficher le contenu dans la console
        if (template === 'mot-de-passe-oublie' && variables.lien_recuperation) {
            this.log('info', `🔗 Lien de récupération : ${variables.lien_recuperation}`);
        }

        return {
            success: true,
            id: `dev_${Date.now()}`,
            message: 'Email simulé en mode développement'
        };
    }

    /**
     * Test la configuration du service email
     * @param {string} testEmail - Email de test (optionnel)
     * @returns {Promise<Object>} Résultat du test
     */
    async testerConfiguration(testEmail = null) {
        const emailTest = testEmail || process.env.ADMIN_EMAIL || 'test@example.com';
        
        this.log('info', 'Test de configuration email', { email_test: emailTest });

        try {
            const result = await this.envoyer({
                to: emailTest,
                subject: 'Test de configuration EmailService',
                template: 'test-configuration',
                variables: {
                    message: 'Si vous recevez cet email, la configuration fonctionne correctement !',
                    timestamp: new Date().toISOString()
                }
            });

            return {
                success: result.success,
                message: result.success ? 'Test réussi' : 'Test échoué',
                details: result
            };

        } catch (error) {
            this.logError(error, { context: 'test_configuration' });
            return {
                success: false,
                message: 'Erreur lors du test',
                error: error.message
            };
        }
    }
}

module.exports = EmailService;