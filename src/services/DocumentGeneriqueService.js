const fs = require('fs').promises;
const path = require('path');
const BaseService = require('./BaseService');

class DocumentGeneriqueService extends BaseService {
    
    /**
     * Génère le HTML pour un document générique en remplaçant les placeholders
     */
    async genererHtml(template, donnees, systeme = 'monsterhearts') {
        try {
            // Lire le template spécifique au système
            const templatePath = path.join(__dirname, '..', 'templates', 'pdf', systeme, `${template}.html`);
            let html = await fs.readFile(templatePath, 'utf8');
            
            // Remplacer les placeholders de base
            html = html.replace('<!-- PAGE_NUMBER -->', donnees.pageNumber || '1');
            html = html.replace('<!-- CHAPITRE -->', donnees.chapitre || systeme.toUpperCase());
            html = html.replace('<!-- TITRE -->', (donnees.titre || '').toUpperCase());
            html = html.replace('<!-- PIED_DE_PAGE -->', donnees.piedDePage || this.getPiedDePageDefaut(systeme));
            
            // Générer l'introduction
            let introductionHtml = '';
            if (donnees.introduction) {
                introductionHtml = `<p class="intro">${this.echapperHtml(donnees.introduction)}</p>`;
            }
            html = html.replace('<!-- INTRODUCTION -->', introductionHtml);
            
            // Générer les sections
            let sectionsHtml = '';
            if (donnees.sections && Array.isArray(donnees.sections)) {
                sectionsHtml = donnees.sections.map(section => this.genererSection(section)).join('\n');
            }
            html = html.replace('<!-- SECTIONS -->', sectionsHtml);
            
            return html;
            
        } catch (error) {
            throw new Error(`Erreur génération HTML: ${error.message}`);
        }
    }
    
    /**
     * Génère le HTML d'une section
     */
    genererSection(section) {
        const niveauTag = section.niveau === 1 ? 'h2' : 'h3';
        let html = `<div class="section">`;
        html += `<${niveauTag}>${this.echapperHtml(section.titre).toUpperCase()}</${niveauTag}>`;
        
        if (section.contenus && Array.isArray(section.contenus)) {
            section.contenus.forEach(contenu => {
                html += this.genererContenu(contenu);
            });
        }
        
        html += `</div>`;
        return html;
    }
    
    /**
     * Génère le HTML d'un contenu
     */
    genererContenu(contenu) {
        switch (contenu.type) {
            case 'paragraphe':
                return `<p>${this.traiterMarkdown(contenu.texte)}</p>`;
                
            case 'liste':
                const itemsListe = contenu.items.map(item => 
                    `<li>${this.traiterMarkdown(item)}</li>`
                ).join('');
                return `<ul>${itemsListe}</ul>`;
                
            case 'liste-numerotee':
                const itemsNumero = contenu.items.map(item => 
                    `<li>${this.traiterMarkdown(item)}</li>`
                ).join('');
                return `<ol>${itemsNumero}</ol>`;
                
            case 'citation':
                return `<blockquote>${this.traiterMarkdown(contenu.texte)}</blockquote>`;
                
            case 'encadre':
                let encadre = `<div class="section-speciale">`;
                if (contenu.titre) {
                    encadre += `<h4>${this.echapperHtml(contenu.titre).toUpperCase()}</h4>`;
                }
                encadre += `<p>${this.traiterMarkdown(contenu.texte)}</p>`;
                encadre += `</div>`;
                return encadre;
                
            default:
                return `<p>${this.traiterMarkdown(contenu.texte || '')}</p>`;
        }
    }
    
    /**
     * Traite le markdown simple (gras, italique)
     */
    traiterMarkdown(texte) {
        if (!texte) return '';
        
        let html = this.echapperHtml(texte);
        
        // Gras
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        
        // Italique
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        
        return html;
    }
    
    /**
     * Échappe les caractères HTML
     */
    echapperHtml(texte) {
        if (!texte) return '';
        return texte
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    }
    
    /**
     * Valide les données du formulaire
     */
    validerDonnees(donnees) {
        const erreurs = [];
        
        if (!donnees.titre || donnees.titre.trim() === '') {
            erreurs.push('Le titre est requis');
        }
        
        if (!donnees.chapitre || donnees.chapitre.trim() === '') {
            erreurs.push('Le type de document est requis');
        }
        
        if (!donnees.sections || !Array.isArray(donnees.sections) || donnees.sections.length === 0) {
            erreurs.push('Au moins une section est requise');
        }
        
        if (donnees.sections) {
            donnees.sections.forEach((section, index) => {
                if (!section.titre || section.titre.trim() === '') {
                    erreurs.push(`Le titre de la section ${index + 1} est requis`);
                }
                
                // Le contenu n'est plus obligatoire pour les sections
                // (peut être vide pour les titres de chapitre)
            });
        }
        
        if (erreurs.length > 0) {
            throw new Error('Données invalides: ' + erreurs.join(', '));
        }
        
        return true;
    }
    
    /**
     * Retourne le pied de page par défaut selon le système
     */
    getPiedDePageDefaut(systeme) {
        const { SystemeUtils } = require('../config/systemesJeu');
        const systemeData = SystemeUtils.getSysteme(systeme);
        
        if (systemeData) {
            return `${systemeData.nom} • Document • brumisater`;
        }
        
        // Fallback si le système n'est pas trouvé
        return `${systeme} • Document • brumisater`;
    }
}

module.exports = DocumentGeneriqueService;