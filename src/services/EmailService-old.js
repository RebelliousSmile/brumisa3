const BaseService = require('./BaseService');
const { Resend } = require('resend');
const EmailTemplate = require('./EmailTemplate');

/**
 * Service d'envoi d'emails avec Resend
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
        const lienRecuperation = `${process.env.BASE_URL || 'http://localhost:3074'}/reinitialiser-mot-de-passe/${token}`;
        
        const variables = {
            nom: nom,
            lien_recuperation: lienRecuperation,
            duree_validite: '24 heures',
            site_name: this.fromName
        };

        return await this.envoyer({
            to: email,
            subject: 'Récupération de votre mot de passe',
            template: 'mot-de-passe-oublie',
            variables: variables
        });
    }

    /**
     * Envoie un email de bienvenue
     * @param {string} email - Email du destinataire
     * @param {string} nom - Nom de l'utilisateur
     * @returns {Promise<Object>} Résultat de l'envoi
     */
    async envoyerBienvenue(email, nom) {
        const variables = {
            nom: nom,
            lien_connexion: `${process.env.BASE_URL || 'http://localhost:3074'}/connexion`,
            site_name: this.fromName
        };

        return await this.envoyer({
            to: email,
            subject: `Bienvenue sur ${this.fromName} !`,
            template: 'bienvenue',
            variables: variables
        });
    }

    /**
     * Envoie un email de confirmation d'inscription à la newsletter
     * @param {string} email - Email du destinataire
     * @param {string} token - Token de désinscription
     * @returns {Promise<Object>} Résultat de l'envoi
     */
    async envoyerNewsletterConfirmation(email, token) {
        const variables = {
            email: email,
            lien_desinscription: `${process.env.BASE_URL || 'http://localhost:3074'}/newsletter/desinscription/${token}`,
            site_name: this.fromName
        };

        return await this.envoyer({
            to: email,
            subject: 'Confirmation d\'inscription à la newsletter',
            template: 'newsletter-confirmation',
            variables: variables
        });
    }

    /**
     * Envoie une notification à l'administrateur
     * @param {string} sujet - Sujet de l'email
     * @param {string} contenu - Contenu de l'email
     * @param {Object} metadata - Métadonnées additionnelles
     * @returns {Promise<Object>} Résultat de l'envoi
     */
    async envoyerNotificationAdmin(sujet, contenu, metadata = {}) {
        // Email admin depuis les variables d'environnement ou fallback
        const emailAdmin = process.env.ADMIN_EMAIL || process.env.RESEND_FROM_EMAIL;
        
        if (!emailAdmin) {
            this.log('warn', 'Aucun email admin configuré pour les notifications');
            return { success: false, error: 'Pas d\'email admin configuré' };
        }

        const variables = {
            sujet: sujet,
            contenu: contenu,
            metadata: metadata,
            timestamp: new Date().toISOString(),
            site_name: this.fromName
        };

        return await this.envoyer({
            to: emailAdmin,
            subject: `[ADMIN] ${sujet}`,
            template: 'admin-notification',
            variables: variables
        });
    }

    /**
     * Méthode générique d'envoi d'email
     * @param {Object} options - Options d'envoi
     * @param {string} options.to - Email destinataire
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
                to: to,
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
            console.log('');
            console.log('🔗 LIEN DE RÉCUPÉRATION (copier dans votre navigateur) :');
            console.log(variables.lien_recuperation);
            console.log('');
        }

        return {
            success: true,
            id: `dev_${Date.now()}`,
            message: 'Email simulé en mode développement'
        };
    }

    /**
     * Render un template EJS
     * @param {string} templateName - Nom du template
     * @param {Object} variables - Variables pour le template
     * @returns {Promise<string>} Contenu HTML
     * @private
     */
    async renderTemplate(templateName, variables) {
        const templatePath = path.join(this.templatesPath, `${templateName}.ejs`);
        
        try {
            // Vérifier que le template existe
            await fs.access(templatePath);
            
            // Variables communes à tous les templates
            const commonVariables = {
                site_name: this.fromName,
                site_url: process.env.BASE_URL || 'http://localhost:3074',
                year: new Date().getFullYear(),
                ...variables
            };

            // Render le template
            const html = await ejs.renderFile(templatePath, commonVariables);
            return html;

        } catch (error) {
            if (error.code === 'ENOENT') {
                // Template non trouvé, créer un template basique
                this.log('warn', `Template ${templateName}.ejs non trouvé, utilisation du template basique`);
                return this.createBasicTemplate(templateName, variables);
            }
            throw error;
        }
    }

    /**
     * Crée un template HTML basique si le fichier template n'existe pas
     * @param {string} templateName - Nom du template
     * @param {Object} variables - Variables
     * @returns {string} HTML basique
     * @private
     */
    createBasicTemplate(templateName, variables) {
        const baseHtml = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${this.fromName}</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
                .button { display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 4px; margin: 10px 0; }
                .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${this.fromName}</h1>
            </div>
            <div class="content">
                ${this.getTemplateContent(templateName, variables)}
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ${this.fromName}. Tous droits réservés.</p>
                <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
            </div>
        </body>
        </html>`;
        
        return baseHtml;
    }

    /**
     * Génère le contenu spécifique selon le type de template
     * @param {string} templateName - Nom du template
     * @param {Object} variables - Variables
     * @returns {string} Contenu HTML
     * @private
     */
    getTemplateContent(templateName, variables) {
        switch (templateName) {
            case 'mot-de-passe-oublie':
                return `
                    <h2>Récupération de votre mot de passe</h2>
                    <p>Bonjour ${variables.nom || 'Utilisateur'},</p>
                    <p>Vous avez demandé la récupération de votre mot de passe sur ${this.fromName}.</p>
                    <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
                    <p><a href="${variables.lien_recuperation}" class="button">Réinitialiser mon mot de passe</a></p>
                    <p><small>Ce lien expire dans ${variables.duree_validite || '24 heures'}. Si vous n'avez pas demandé cette récupération, vous pouvez ignorer cet email.</small></p>
                `;

            case 'bienvenue':
                return `
                    <h2>Bienvenue sur ${this.fromName} !</h2>
                    <p>Bonjour ${variables.nom || 'Nouvel utilisateur'},</p>
                    <p>Nous sommes ravis de vous accueillir sur notre plateforme de génération de PDF pour jeux de rôle !</p>
                    <p>Vous pouvez maintenant vous connecter et créer vos premières fiches de personnages.</p>
                    <p><a href="${variables.lien_connexion}" class="button">Se connecter</a></p>
                `;

            case 'newsletter-confirmation':
                return `
                    <h2>Inscription confirmée !</h2>
                    <p>Votre adresse email ${variables.email} a été ajoutée à notre newsletter.</p>
                    <p>Vous recevrez nos actualités et nouveautés directement dans votre boîte mail.</p>
                    <p><small><a href="${variables.lien_desinscription}">Se désinscrire de la newsletter</a></small></p>
                `;

            case 'admin-notification':
                return `
                    <h2>Notification Admin</h2>
                    <p><strong>Sujet:</strong> ${variables.sujet}</p>
                    <p><strong>Contenu:</strong></p>
                    <div style="background: #f0f0f0; padding: 10px; border-radius: 4px;">
                        ${variables.contenu}
                    </div>
                    ${variables.metadata && Object.keys(variables.metadata).length > 0 ? `
                        <p><strong>Métadonnées:</strong></p>
                        <pre style="background: #f0f0f0; padding: 10px; border-radius: 4px; font-size: 11px;">
${JSON.stringify(variables.metadata, null, 2)}
                        </pre>
                    ` : ''}
                    <p><small>Timestamp: ${variables.timestamp}</small></p>
                `;

            default:
                return `
                    <p>Email automatique depuis ${this.fromName}</p>
                    <pre>${JSON.stringify(variables, null, 2)}</pre>
                `;
        }
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