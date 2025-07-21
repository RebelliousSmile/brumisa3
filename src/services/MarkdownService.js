/**
 * Service pour la conversion du markdown en HTML
 * Respecte le principe DRY - réutilisable pour tous les PDFs
 */
class MarkdownService {
    constructor() {
        // Patterns de conversion markdown
        this.patterns = {
            // Gras et italique combinés
            boldItalic: /\*\*\*(.+?)\*\*\*/g,
            // Gras
            bold: /\*\*(.+?)\*\*/g,
            // Italique
            italic: /\*(.+?)\*/g,
            // Code inline
            code: /`(.+?)`/g,
            // Citations (au début de ligne)
            blockquote: /^>\s*(.+)$/gm,
            // Liens
            link: /\[([^\]]+)\]\(([^)]+)\)/g,
            // Listes non ordonnées (début de ligne)
            unorderedList: /^[\*\-]\s+(.+)$/gm,
            // Listes ordonnées (début de ligne)
            orderedList: /^\d+\.\s+(.+)$/gm
        };
    }

    /**
     * Convertit du texte markdown en HTML
     * @param {string} text - Le texte markdown à convertir
     * @returns {string} - Le HTML généré
     */
    toHtml(text) {
        if (!text) return '';
        
        // Échapper les caractères HTML dangereux d'abord
        let html = this.escapeHtml(text);
        
        // Appliquer les conversions markdown
        html = html
            // Gras et italique combinés (doit être avant gras et italique séparés)
            .replace(this.patterns.boldItalic, '<strong><em>$1</em></strong>')
            // Gras
            .replace(this.patterns.bold, '<strong>$1</strong>')
            // Italique
            .replace(this.patterns.italic, '<em>$1</em>')
            // Code inline
            .replace(this.patterns.code, '<code>$1</code>')
            // Citations
            .replace(this.patterns.blockquote, '<blockquote>$1</blockquote>')
            // Liens
            .replace(this.patterns.link, '<a href="$2">$1</a>');
        
        return html;
    }

    /**
     * Convertit du markdown en HTML sécurisé pour les PDFs
     * Version plus stricte sans liens externes
     * @param {string} text - Le texte markdown à convertir
     * @returns {string} - Le HTML sécurisé
     */
    toPdfHtml(text) {
        if (!text) return '';
        
        let html = this.escapeHtml(text);
        
        // Conversions pour PDF (sans liens)
        html = html
            .replace(this.patterns.boldItalic, '<strong><em>$1</em></strong>')
            .replace(this.patterns.bold, '<strong>$1</strong>')
            .replace(this.patterns.italic, '<em>$1</em>')
            .replace(this.patterns.code, '<code>$1</code>')
            .replace(this.patterns.blockquote, '<blockquote>$1</blockquote>')
            // Pour les PDFs, on affiche juste le texte du lien
            .replace(this.patterns.link, '$1');
        
        return html;
    }

    /**
     * Échappe les caractères HTML dangereux
     * @param {string} text - Le texte à échapper
     * @returns {string} - Le texte échappé
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Extrait le texte brut du markdown (supprime tout formatage)
     * @param {string} text - Le texte markdown
     * @returns {string} - Le texte sans formatage
     */
    toPlainText(text) {
        if (!text) return '';
        
        return text
            // Supprimer les marqueurs markdown
            .replace(this.patterns.boldItalic, '$1')
            .replace(this.patterns.bold, '$1')
            .replace(this.patterns.italic, '$1')
            .replace(this.patterns.code, '$1')
            .replace(this.patterns.blockquote, '$1')
            .replace(this.patterns.link, '$1')
            // Supprimer les puces de liste
            .replace(this.patterns.unorderedList, '$1')
            .replace(this.patterns.orderedList, '$1');
    }

    /**
     * Enregistre les helpers Handlebars pour le markdown
     * @param {Object} handlebars - L'instance Handlebars
     */
    registerHandlebarsHelpers(handlebars) {
        const self = this;
        
        // Helper pour convertir le markdown en HTML
        handlebars.registerHelper('markdown', function(text) {
            return new handlebars.SafeString(self.toPdfHtml(text));
        });
        
        // Helper pour extraire le texte brut
        handlebars.registerHelper('plaintext', function(text) {
            return self.toPlainText(text);
        });
        
        // Helper pour échapper le HTML
        handlebars.registerHelper('escapeHtml', function(text) {
            return new handlebars.SafeString(self.escapeHtml(text));
        });
    }
}

module.exports = MarkdownService;