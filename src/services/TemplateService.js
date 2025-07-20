const BaseService = require('./BaseService');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');

/**
 * Service pour la gestion des templates PDF
 */
class TemplateService extends BaseService {
    constructor() {
        super('TemplateService');
        this.templatesDir = path.join(process.cwd(), 'src', 'templates', 'pdf');
        this.initializeHandlebars();
    }

    /**
     * Initialise les helpers Handlebars
     */
    initializeHandlebars() {
        // Helper pour répéter des éléments
        handlebars.registerHelper('repeat', function(n, block) {
            let result = '';
            for (let i = 0; i < n; i++) {
                result += block.fn(this);
            }
            return result;
        });

        // Helper pour soustraire
        handlebars.registerHelper('subtract', function(a, b) {
            return a - b;
        });

        // Helper pour switch/case
        handlebars.registerHelper('switch', function(value, options) {
            this.switch_value = value;
            return options.fn(this);
        });

        handlebars.registerHelper('case', function(value, options) {
            if (value === this.switch_value) {
                return options.fn(this);
            }
        });

        handlebars.registerHelper('default', function(options) {
            return options.fn(this);
        });

        // Helper pour conditions
        handlebars.registerHelper('if_eq', function(a, b, options) {
            if (a === b) {
                return options.fn(this);
            }
            return options.inverse(this);
        });

        // Helper pour formater les statistiques Monsterhearts
        handlebars.registerHelper('formatStat', function(value) {
            if (value === undefined || value === null) return '';
            if (value >= 0) return '+' + value;
            return value.toString();
        });
    }

    /**
     * Liste tous les templates disponibles pour un système
     */
    async listerTemplates(systemeJeu) {
        try {
            const systemePath = path.join(this.templatesDir, systemeJeu);
            
            try {
                const files = await fs.readdir(systemePath);
                const templates = [];

                for (const file of files) {
                    if (file.endsWith('.html')) {
                        const templateId = file.replace('.html', '');
                        const templatePath = path.join(systemePath, file);
                        const content = await fs.readFile(templatePath, 'utf8');
                        
                        // Extraire le titre du template depuis le HTML
                        const titleMatch = content.match(/<title>(.*?)<\/title>/);
                        const title = titleMatch ? titleMatch[1] : templateId;

                        templates.push({
                            id: templateId,
                            nom: this.formatTemplateName(templateId),
                            titre: title,
                            systeme: systemeJeu,
                            chemin: templatePath,
                            type: this.detectTemplateType(templateId)
                        });
                    }
                }

                return templates;
            } catch (error) {
                if (error.code === 'ENOENT') {
                    this.logger.warn(`Aucun template trouvé pour le système ${systemeJeu}`);
                    return [];
                }
                throw error;
            }
        } catch (error) {
            this.logger.error('Erreur lors du listage des templates:', error);
            throw new Error('Impossible de lister les templates');
        }
    }

    /**
     * Obtient un template spécifique
     */
    async obtenirTemplate(systemeJeu, templateId) {
        try {
            const templatePath = path.join(this.templatesDir, systemeJeu, `${templateId}.html`);
            const content = await fs.readFile(templatePath, 'utf8');
            
            return {
                id: templateId,
                systeme: systemeJeu,
                contenu: content,
                chemin: templatePath
            };
        } catch (error) {
            if (error.code === 'ENOENT') {
                throw new Error(`Template ${templateId} non trouvé pour le système ${systemeJeu}`);
            }
            this.logger.error('Erreur lors de la récupération du template:', error);
            throw new Error('Impossible de récupérer le template');
        }
    }

    /**
     * Rend un template avec les données du personnage
     */
    async rendreTemplate(systemeJeu, templateId, donnees) {
        try {
            const template = await this.obtenirTemplate(systemeJeu, templateId);
            const compiled = handlebars.compile(template.contenu);
            
            // Préparer les données pour le template
            const donneesTemplate = this.preparerDonnees(donnees, systemeJeu);
            
            return compiled(donneesTemplate);
        } catch (error) {
            this.logger.error('Erreur lors du rendu du template:', error);
            throw new Error('Impossible de rendre le template');
        }
    }

    /**
     * Prépare les données pour le template selon le système de jeu
     */
    preparerDonnees(donnees, systemeJeu) {
        const donneesPreparees = {
            ...donnees,
            systeme: systemeJeu,
            dateGeneration: new Date().toLocaleDateString('fr-FR')
        };

        // Préparations spécifiques par système
        switch (systemeJeu) {
            case 'monsterhearts':
                return this.preparerDonneesMonsterhearts(donneesPreparees);
            case 'engrenages':
                return this.preparerDonneesEngrenages(donneesPreparees);
            case 'metro_2033':
                return this.preparerDonneesMetro2033(donneesPreparees);
            case 'mist_engine':
                return this.preparerDonneesMistEngine(donneesPreparees);
            default:
                return donneesPreparees;
        }
    }

    /**
     * Préparations spécifiques pour Monsterhearts
     */
    preparerDonneesMonsterhearts(donnees) {
        const personnage = donnees.personnage;
        
        // S'assurer que les données Monsterhearts sont bien structurées
        if (!personnage.donnees_personnage) {
            personnage.donnees_personnage = {};
        }

        const dp = personnage.donnees_personnage;

        // Statistiques par défaut
        if (!dp.stats) {
            dp.stats = { hot: 0, cold: 0, volatile: 0, dark: 0 };
        }

        // Actions de base Monsterhearts
        if (!dp.moves) {
            dp.moves = {
                basic: [
                    { id: 'turn_on', description: '<strong>Allumer</strong> (Sexy)', checked: false },
                    { id: 'manipulate', description: '<strong>Manipuler</strong> (Sexy)', checked: false },
                    { id: 'shut_down', description: '<strong>Rembarrer</strong> (Glacial)', checked: false },
                    { id: 'hold_steady', description: '<strong>Garder son sang-froid</strong> (Glacial)', checked: false },
                    { id: 'lash_out', description: '<strong>Cogner</strong> (Instable)', checked: false },
                    { id: 'run_away', description: '<strong>Fuir</strong> (Instable)', checked: false },
                    { id: 'gaze_abyss', description: '<strong>Contempler l\'Abysse</strong> (Ténébreux)', checked: false }
                ],
                skin: dp.moves?.skin || []
            };
        }

        // Conditions par défaut
        if (!dp.conditions) {
            dp.conditions = [
                { name: 'Apeuré', active: false },
                { name: 'Furieux', active: false },
                { name: 'Honteux', active: false },
                { name: 'Brisé', active: false }
            ];
        }

        // Dégâts par défaut (4 cases)
        if (!dp.harm) {
            dp.harm = [false, false, false, false];
        }

        // Expérience par défaut
        if (!dp.experience) {
            dp.experience = { current: 0, max: 5 };
        }

        // Ascendants par défaut
        if (!dp.strings) {
            dp.strings = [];
        }

        return donnees;
    }

    /**
     * Préparations pour les autres systèmes (à développer)
     */
    preparerDonneesEngrenages(donnees) {
        // TODO: Logique spécifique pour Engrenages
        return donnees;
    }

    preparerDonneesMetro2033(donnees) {
        // TODO: Logique spécifique pour Metro 2033
        return donnees;
    }

    preparerDonneesMistEngine(donnees) {
        // TODO: Logique spécifique pour Mist Engine
        return donnees;
    }

    /**
     * Formate le nom d'un template pour l'affichage
     */
    formatTemplateName(templateId) {
        return templateId
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Détecte le type de template
     */
    detectTemplateType(templateId) {
        if (templateId.includes('fiche') || templateId.includes('personnage')) {
            return 'fiche-personnage';
        }
        if (templateId.includes('cadre') || templateId.includes('ville')) {
            return 'cadre-campagne';
        }
        if (templateId.includes('plan') || templateId.includes('classe')) {
            return 'plan-classe';
        }
        return 'autre';
    }

    /**
     * Valide qu'un template existe
     */
    async templateExiste(systemeJeu, templateId) {
        try {
            await this.obtenirTemplate(systemeJeu, templateId);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Obtient la liste des types de templates disponibles
     */
    async obtenirTypesTemplates() {
        return [
            {
                id: 'fiche-personnage',
                nom: 'Fiche de Personnage',
                description: 'Fiche complète pour un personnage joueur',
                icone: '👤'
            },
            {
                id: 'cadre-campagne',
                nom: 'Cadre de Campagne',
                description: 'Environnement et contexte de jeu',
                icone: '🗺️'
            },
            {
                id: 'plan-classe',
                nom: 'Plan de Classe',
                description: 'Organisation du groupe de joueurs',
                icone: '👥'
            },
            {
                id: 'aide-jeu',
                nom: 'Aide de Jeu',
                description: 'Référence rapide et aide-mémoire',
                icone: '📖'
            }
        ];
    }
}

module.exports = TemplateService;