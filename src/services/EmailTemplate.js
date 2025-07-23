const BaseService = require('./BaseService');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs').promises;

/**
 * Service pour la gestion des templates d'emails
 * Centralisé les variables communes, helpers, et logique de rendu
 */
class EmailTemplate extends BaseService {
    constructor() {
        super('EmailTemplate');
        this.templatesPath = path.join(process.cwd(), 'src', 'templates', 'emails');
        this.layoutsPath = path.join(this.templatesPath, 'layouts');
    }

    /**
     * Variables communes à tous les emails
     */
    getCommonVariables() {
        return {
            site_name: process.env.RESEND_FROM_NAME || 'Brumisa3 - Générateur PDF JDR',
            site_url: process.env.BASE_URL,
            year: new Date().getFullYear(),
            support_email: process.env.RESEND_FROM_EMAIL || 'support@localhost',
            current_date: new Date().toLocaleDateString('fr-FR'),
            logo_url: `${process.env.BASE_URL}/assets/logo.png`
        };
    }

    /**
     * Helpers pour les templates emails
     */
    getHelpers() {
        return {
            // Générer un lien bouton stylé
            button: (text, url, style = 'primary') => {
                const styles = {
                    primary: 'background: linear-gradient(135deg, #8b5cf6, #a855f7); color: white;',
                    secondary: 'background: #6b7280; color: white;',
                    danger: 'background: #dc2626; color: white;',
                    success: 'background: #10b981; color: white;'
                };
                
                return `
                    <a href="${url}" style="${styles[style]} padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; text-align: center; margin: 10px 0;">
                        ${text}
                    </a>
                `;
            },

            // Formater une date
            formatDate: (date, format = 'fr-FR') => {
                return new Date(date).toLocaleDateString(format);
            },

            // Générer une alerte stylée
            alert: (message, type = 'info') => {
                const styles = {
                    info: 'background: #eff6ff; border-left: 4px solid #3b82f6; color: #1e40af;',
                    success: 'background: #f0fdf4; border-left: 4px solid #10b981; color: #065f46;',
                    warning: 'background: #fffbeb; border-left: 4px solid #f59e0b; color: #92400e;',
                    error: 'background: #fef2f2; border-left: 4px solid #dc2626; color: #991b1b;'
                };

                return `
                    <div style="${styles[type]} padding: 16px; margin: 16px 0; border-radius: 0 8px 8px 0;">
                        ${message}
                    </div>
                `;
            }
        };
    }

    /**
     * Render un template email avec layout
     * @param {string} templateName - Nom du template (sans .ejs)
     * @param {Object} variables - Variables pour le template
     * @param {string} layout - Layout à utiliser (défaut: email-base)
     * @returns {Promise<string>} HTML généré
     */
    async render(templateName, variables = {}, layout = 'email-base') {
        try {
            // Combiner variables communes + spécifiques
            const allVariables = {
                ...this.getCommonVariables(),
                ...this.getHelpers(),
                ...variables
            };

            // Chemin vers le template
            const templatePath = path.join(this.templatesPath, `${templateName}.ejs`);
            
            // Vérifier que le template existe
            try {
                await fs.access(templatePath);
            } catch {
                this.log('warn', `Template ${templateName}.ejs non trouvé`);
                return this.createFallbackTemplate(templateName, allVariables);
            }

            // Render le template principal
            const content = await ejs.renderFile(templatePath, allVariables);

            // Si pas de layout demandé, retourner le contenu
            if (!layout) {
                return content;
            }

            // Render avec layout
            const layoutPath = path.join(this.layoutsPath, `${layout}.ejs`);
            
            try {
                await fs.access(layoutPath);
                return await ejs.renderFile(layoutPath, {
                    ...allVariables,
                    content: content
                });
            } catch {
                this.log('warn', `Layout ${layout}.ejs non trouvé, utilisation du contenu sans layout`);
                return content;
            }

        } catch (error) {
            this.logError(error, { template: templateName, layout });
            return this.createErrorTemplate(error.message);
        }
    }

    /**
     * Template de secours quand le template principal est manquant
     */
    createFallbackTemplate(templateName, variables) {
        return `
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${variables.site_name}</title>
            </head>
            <body style="font-family: sans-serif; padding: 20px; background: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px;">
                    <h1 style="color: #8b5cf6;">${variables.site_name}</h1>
                    <p>Template <strong>${templateName}</strong> manquant.</p>
                    <p>Variables disponibles : ${Object.keys(variables).join(', ')}</p>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Template d'erreur
     */
    createErrorTemplate(errorMessage) {
        return `
            <!DOCTYPE html>
            <html lang="fr">
            <body style="font-family: sans-serif; padding: 20px; background: #fef2f2;">
                <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626;">
                    <h1 style="color: #dc2626;">Erreur de template</h1>
                    <p>${errorMessage}</p>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Lister les templates disponibles
     */
    async listTemplates() {
        try {
            const files = await fs.readdir(this.templatesPath);
            return files
                .filter(file => file.endsWith('.ejs'))
                .map(file => file.replace('.ejs', ''));
        } catch (error) {
            this.logError(error, { context: 'list_templates' });
            return [];
        }
    }

    /**
     * Valider qu'un template existe
     */
    async validateTemplate(templateName) {
        const templatePath = path.join(this.templatesPath, `${templateName}.ejs`);
        try {
            await fs.access(templatePath);
            return true;
        } catch {
            return false;
        }
    }
}

module.exports = EmailTemplate;