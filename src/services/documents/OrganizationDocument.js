const BasePdfKitService = require('../BasePdfKitService');
const SystemTheme = require('../themes/SystemTheme');
const fs = require('fs');

/**
 * Document Organisation - Structures organisationnelles et listes PNJs
 * Structure spécialisée pour les factions, guildes, entreprises et hiérarchies
 * 
 * Usage :
 * - Factions et organisations Engrenages
 * - Stations et groupes Metro 2033
 * - Communautés Zombiology
 * - Toute structure hiérarchique avec membres
 */
class OrganizationDocument extends BasePdfKitService {
    
    /**
     * @param {SystemTheme} theme - Thème du système de jeu (obligatoire)
     */
    constructor(theme) {
        super();
        
        if (!theme || !(theme instanceof SystemTheme)) {
            throw new Error('OrganizationDocument nécessite un SystemTheme valide');
        }
        
        this.theme = theme;
        this.documentType = 'organization';
    }
    
    /**
     * Génère un document PDF d'organisation
     * @param {Object} data - Données de l'organisation
     * @param {string} filePath - Chemin de sortie du PDF
     * @returns {Promise} Promise de génération
     */
    async generateDocument(data, filePath) {
        return new Promise((resolve, reject) => {
            try {
                // Valider les données
                this.validateOrganizationData(data);
                
                // Configurer les textes du document
                this.setupDocumentTexts(data);
                
                // Créer le document avec la configuration de base
                const doc = this.createDocument({
                    chapterTitle: this.chapterTitle
                });
                
                const stream = doc.pipe(fs.createWriteStream(filePath));
                
                // Configurer le thème
                this.setupTheme(doc);
                
                // Générer le contenu de l'organisation
                this.renderOrganizationContent(doc, data);
                
                // Finaliser le document
                this.finalizeDocument(doc, data);
                
                // Finaliser le PDF
                doc.end();
                
                // Handlers de fin
                stream.on('finish', resolve);
                stream.on('error', reject);
                
            } catch (error) {
                reject(error);
            }
        });
    }
    
    /**
     * Valide les données de l'organisation
     * @param {Object} data - Données à valider
     */
    validateOrganizationData(data) {
        if (!data.nom && !data.organizationName && !data.name) {
            console.warn('⚠️ Aucun nom d\'organisation fourni');
        }
        
        // Sections recommandées pour une organisation
        const recommendedSections = ['hierarchie', 'membres', 'objectifs'];
        for (const section of recommendedSections) {
            if (!data[section]) {
                console.warn(`⚠️ Section recommandée manquante: ${section}`);
            }
        }
    }
    
    /**
     * Configure les textes du document (sidebar, watermark)
     * @param {Object} data - Données du document
     */
    setupDocumentTexts(data) {
        this.chapterTitle = this.theme.getSidebarText(this.documentType, data);
    }
    
    /**
     * Configure le thème (polices, couleurs)
     * @param {PDFDocument} doc - Document PDFKit
     */
    setupTheme(doc) {
        // Enregistrer les polices du thème
        this.theme.registerFonts(doc);
        
        // Appliquer la police de base
        this.theme.applyFont(doc, 'body');
    }
    
    /**
     * Génère le contenu de l'organisation
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} data - Données de l'organisation
     */
    renderOrganizationContent(doc, data) {
        // En-tête de l'organisation
        this.renderOrganizationHeader(doc, data);
        
        // Vue d'ensemble
        if (data.description || data.vue_ensemble) {
            this.renderOrganizationOverview(doc, data.description || data.vue_ensemble);
        }
        
        // Structure et hiérarchie
        if (data.hierarchie || data.structure) {
            this.renderOrganizationStructure(doc, data.hierarchie || data.structure);
        }
        
        // Membres par niveau hiérarchique
        if (data.membres && Array.isArray(data.membres)) {
            this.renderOrganizationMembers(doc, data.membres);
        }
        
        // Objectifs et mission
        if (data.objectifs || data.mission) {
            this.renderOrganizationGoals(doc, data.objectifs || data.mission);
        }
        
        // Ressources et moyens
        if (data.ressources || data.resources) {
            this.renderOrganizationResources(doc, data.ressources || data.resources);
        }
        
        // Territoires et influence
        if (data.territoires || data.influence) {
            this.renderOrganizationInfluence(doc, data.territoires || data.influence);
        }
        
        // Alliés et ennemis
        if (data.relations) {
            this.renderOrganizationRelations(doc, data.relations);
        }
        
        // Activités et opérations
        if (data.activites && Array.isArray(data.activites)) {
            this.renderOrganizationActivities(doc, data.activites);
        }
        
        // Secrets et complots
        if (data.secrets && Array.isArray(data.secrets)) {
            this.renderOrganizationSecrets(doc, data.secrets);
        }
        
        // Notes pour le MJ
        if (data.notes_mj) {
            this.renderGMNotes(doc, data.notes_mj);
        }
    }
    
    /**
     * Génère l'en-tête de l'organisation
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} data - Données de l'organisation
     */
    renderOrganizationHeader(doc, data) {
        const orgName = data.nom || data.organizationName || data.name || 'ORGANISATION SANS NOM';
        
        // Nom de l'organisation
        this.addThemeTitle(doc, orgName.toUpperCase(), 1, {
            marginBottom: 10
        });
        
        // Type d'organisation
        if (data.type) {
            this.addThemeTitle(doc, data.type.toUpperCase(), 3, {
                marginBottom: 15
            });
        }
        
        // Devise ou slogan
        if (data.devise || data.slogan) {
            const motto = data.devise || data.slogan;
            this.addThemeParagraph(doc, `"${motto}"`, {
                isIntro: true,
                marginBottom: 20
            });
        }
        
        // Informations de base
        const infos = [];
        if (data.fondation) infos.push(`**Fondée en :** ${data.fondation}`);
        if (data.siege || data.headquarters) infos.push(`**Siège :** ${data.siege || data.headquarters}`);
        if (data.effectifs) infos.push(`**Effectifs :** ${data.effectifs}`);
        if (data.influence_niveau) infos.push(`**Niveau d'influence :** ${data.influence_niveau}`);
        
        for (const info of infos) {
            this.addThemeParagraph(doc, info, { marginBottom: 5 });
        }
    }
    
    /**
     * Génère la vue d'ensemble
     * @param {PDFDocument} doc - Document PDFKit
     * @param {string} description - Description de l'organisation
     */
    renderOrganizationOverview(doc, description) {
        this.addThemeTitle(doc, 'VUE D\'ENSEMBLE', 2, {
            marginTop: 20,
            marginBottom: 15,
            addToToc: true
        });
        
        if (typeof description === 'string') {
            this.addThemeParagraph(doc, description, {
                marginBottom: 15
            });
        } else if (typeof description === 'object') {
            // Description structurée
            if (description.historique) {
                this.addThemeParagraph(doc, `**Historique :** ${description.historique}`, {
                    marginBottom: 10
                });
            }
            
            if (description.philosophie) {
                this.addThemeParagraph(doc, `**Philosophie :** ${description.philosophie}`, {
                    marginBottom: 10
                });
            }
            
            if (description.reputation) {
                this.addThemeParagraph(doc, `**Réputation :** ${description.reputation}`, {
                    marginBottom: 10
                });
            }
        }
    }
    
    /**
     * Génère la structure hiérarchique
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} structure - Structure de l'organisation
     */
    renderOrganizationStructure(doc, structure) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'STRUCTURE HIÉRARCHIQUE', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        // Type de structure
        if (structure.type) {
            this.addThemeParagraph(doc, `**Type de structure :** ${structure.type}`, {
                marginBottom: 10
            });
        }
        
        // Niveaux hiérarchiques
        if (structure.niveaux && Array.isArray(structure.niveaux)) {
            this.addThemeParagraph(doc, '**Hiérarchie (du plus haut au plus bas) :**');
            
            for (let i = 0; i < structure.niveaux.length; i++) {
                const niveau = structure.niveaux[i];
                const numeroNiveau = i + 1;
                
                this.addThemeParagraph(doc, `**${numeroNiveau}. ${niveau.titre || niveau.name}**`, {
                    marginTop: 10,
                    marginBottom: 5
                });
                
                if (niveau.description) {
                    this.addThemeParagraph(doc, niveau.description, {
                        marginLeft: 20,
                        marginBottom: 5
                    });
                }
                
                if (niveau.effectifs) {
                    this.addThemeParagraph(doc, `*Effectifs : ${niveau.effectifs}*`, {
                        marginLeft: 20,
                        marginBottom: 5
                    });
                }
                
                if (niveau.pouvoirs && Array.isArray(niveau.pouvoirs)) {
                    this.addThemeParagraph(doc, '**Pouvoirs et responsabilités :**', {
                        marginLeft: 20,
                        marginBottom: 5
                    });
                    
                    for (const pouvoir of niveau.pouvoirs) {
                        this.addThemeParagraph(doc, `• ${pouvoir}`, {
                            marginLeft: 30,
                            marginBottom: 2
                        });
                    }
                }
            }
        }
        
        // Organigramme simplifié
        if (structure.organigramme) {
            this.renderOrganizationChart(doc, structure.organigramme);
        }
    }
    
    /**
     * Génère un organigramme simplifié
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} organigramme - Données de l'organigramme
     */
    renderOrganizationChart(doc, organigramme) {
        this.addThemeParagraph(doc, '**Organigramme simplifié :**', {
            marginTop: 15,
            marginBottom: 10
        });
        
        // Utiliser une représentation textuelle simple
        const chart = [
            '┌─────────────────────────┐',
            '│      COMMANDEMENT       │',
            '└───────────┬─────────────┘',
            '            │',
            '    ┌───────┴───────┐',
            '    │               │',
            '┌───▼───┐       ┌───▼───┐',
            '│ DEPT. │       │ DEPT. │',
            '│   A   │       │   B   │',
            '└───┬───┘       └───┬───┘',
            '    │               │',
            '┌───▼───┐       ┌───▼───┐',
            '│UNITÉS │       │UNITÉS │',
            '│ BASE  │       │ BASE  │',
            '└───────┘       └───────┘'
        ];
        
        // Police monospace pour l'alignement
        doc.font('Courier').fontSize(9);
        
        for (const line of chart) {
            this.addParagraph(doc, line, {
                marginBottom: 1,
                align: 'center'
            });
        }
        
        // Revenir au thème normal
        this.theme.applyFont(doc, 'body');
    }
    
    /**
     * Génère la liste des membres
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Array} membres - Liste des membres
     */
    renderOrganizationMembers(doc, membres) {
        this.checkNewPage(doc, 150);
        
        this.addThemeTitle(doc, 'MEMBRES CLÉS', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        // Regrouper par niveau hiérarchique si possible
        const membresByLevel = this.groupMembersByLevel(membres);
        
        for (const [level, membersInLevel] of Object.entries(membresByLevel)) {
            if (level !== 'undefined') {
                this.addThemeTitle(doc, level.toUpperCase(), 3, {
                    marginTop: 15,
                    marginBottom: 10
                });
            }
            
            for (const membre of membersInLevel) {
                this.renderOrganizationMember(doc, membre);
            }
        }
    }
    
    /**
     * Regroupe les membres par niveau hiérarchique
     * @param {Array} membres - Liste des membres
     * @returns {Object} Membres regroupés par niveau
     */
    groupMembersByLevel(membres) {
        const grouped = {};
        
        for (const membre of membres) {
            const level = membre.niveau || membre.rank || membre.position || 'Autres membres';
            
            if (!grouped[level]) {
                grouped[level] = [];
            }
            
            grouped[level].push(membre);
        }
        
        return grouped;
    }
    
    /**
     * Génère un membre spécifique
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} membre - Données du membre
     */
    renderOrganizationMember(doc, membre) {
        this.checkNewPage(doc, 70);
        
        // Nom du membre
        if (membre.nom || membre.name) {
            this.addThemeTitle(doc, (membre.nom || membre.name).toUpperCase(), 4, {
                marginTop: 10,
                marginBottom: 5
            });
        }
        
        // Informations de base
        const infos = [];
        if (membre.titre || membre.title) infos.push(`**Titre :** ${membre.titre || membre.title}`);
        if (membre.age) infos.push(`**Âge :** ${membre.age} ans`);
        if (membre.experience) infos.push(`**Expérience :** ${membre.experience}`);
        if (membre.specialite) infos.push(`**Spécialité :** ${membre.specialite}`);
        
        for (const info of infos) {
            this.addThemeParagraph(doc, info, { marginBottom: 3 });
        }
        
        // Description
        if (membre.description) {
            this.addThemeParagraph(doc, membre.description, {
                marginBottom: 8
            });
        }
        
        // Compétences clés
        if (membre.competences && Array.isArray(membre.competences)) {
            this.addThemeParagraph(doc, '**Compétences clés :**');
            this.addThemeList(doc, membre.competences);
        }
        
        // Loyauté et motivations
        if (membre.loyaute) {
            this.addThemeParagraph(doc, `**Loyauté :** ${membre.loyaute}`, {
                marginBottom: 3
            });
        }
        
        if (membre.motivations && Array.isArray(membre.motivations)) {
            this.addThemeParagraph(doc, '**Motivations :**');
            this.addThemeList(doc, membre.motivations);
        }
        
        // Secrets personnels
        if (membre.secrets && Array.isArray(membre.secrets)) {
            this.addThemeBox(doc, 'attention', `**Secrets :** ${membre.secrets.join(' • ')}`);
        }
    }
    
    /**
     * Génère les objectifs et la mission
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} objectifs - Objectifs de l'organisation
     */
    renderOrganizationGoals(doc, objectifs) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'MISSION ET OBJECTIFS', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        // Mission principale
        if (typeof objectifs === 'string') {
            this.addThemeParagraph(doc, `**Mission :** ${objectifs}`, {
                marginBottom: 15
            });
        } else if (typeof objectifs === 'object') {
            if (objectifs.mission) {
                this.addThemeParagraph(doc, `**Mission principale :** ${objectifs.mission}`, {
                    marginBottom: 10
                });
            }
            
            // Objectifs à court terme
            if (objectifs.court_terme && Array.isArray(objectifs.court_terme)) {
                this.addThemeTitle(doc, 'Objectifs à court terme', 3, {
                    marginBottom: 10
                });
                this.addThemeList(doc, objectifs.court_terme);
            }
            
            // Objectifs à long terme
            if (objectifs.long_terme && Array.isArray(objectifs.long_terme)) {
                this.addThemeTitle(doc, 'Objectifs à long terme', 3, {
                    marginTop: 15,
                    marginBottom: 10
                });
                this.addThemeList(doc, objectifs.long_terme);
            }
            
            // Objectifs cachés
            if (objectifs.caches && Array.isArray(objectifs.caches)) {
                this.addThemeTitle(doc, 'Agenda caché', 3, {
                    marginTop: 15,
                    marginBottom: 10
                });
                
                for (const objectifCache of objectifs.caches) {
                    this.addThemeBox(doc, 'attention', objectifCache);
                }
            }
        }
    }
    
    /**
     * Génère les ressources et moyens
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} ressources - Ressources de l'organisation
     */
    renderOrganizationResources(doc, ressources) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'RESSOURCES ET MOYENS', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        // Ressources financières
        if (ressources.financieres || ressources.budget) {
            this.addThemeParagraph(doc, `**Budget :** ${ressources.financieres || ressources.budget}`, {
                marginBottom: 5
            });
        }
        
        // Équipements
        if (ressources.equipements && Array.isArray(ressources.equipements)) {
            this.addThemeParagraph(doc, '**Équipements :**');
            this.addThemeList(doc, ressources.equipements);
        }
        
        // Installations
        if (ressources.installations && Array.isArray(ressources.installations)) {
            this.addThemeParagraph(doc, '**Installations :**');
            this.addThemeList(doc, ressources.installations);
        }
        
        // Contacts et réseaux
        if (ressources.contacts && Array.isArray(ressources.contacts)) {
            this.addThemeParagraph(doc, '**Contacts et réseaux :**');
            this.addThemeList(doc, ressources.contacts);
        }
        
        // Informations privilégiées
        if (ressources.informations && Array.isArray(ressources.informations)) {
            this.addThemeParagraph(doc, '**Informations privilégiées :**');
            for (const info of ressources.informations) {
                this.addThemeBox(doc, 'conseil', info);
            }
        }
    }
    
    /**
     * Génère l'influence et les territoires
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} influence - Influence de l'organisation
     */
    renderOrganizationInfluence(doc, influence) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'TERRITOIRES ET INFLUENCE', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        // Territoires contrôlés
        if (influence.territoires && Array.isArray(influence.territoires)) {
            this.addThemeTitle(doc, 'Territoires contrôlés', 3, {
                marginBottom: 10
            });
            
            for (const territoire of influence.territoires) {
                if (typeof territoire === 'string') {
                    this.addThemeParagraph(doc, `• ${territoire}`);
                } else {
                    this.addThemeParagraph(doc, `• **${territoire.nom}** : ${territoire.description || ''} (Contrôle: ${territoire.niveau || 'Inconnu'})`);
                }
            }
        }
        
        // Sphères d'influence
        if (influence.spheres && Array.isArray(influence.spheres)) {
            this.addThemeTitle(doc, 'Sphères d\'influence', 3, {
                marginTop: 15,
                marginBottom: 10
            });
            this.addThemeList(doc, influence.spheres);
        }
        
        // Niveau d'influence général
        if (influence.niveau_global) {
            this.addThemeBox(doc, 'conseil', `**Influence générale :** ${influence.niveau_global}`);
        }
    }
    
    /**
     * Génère les relations avec autres organisations
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} relations - Relations de l'organisation
     */
    renderOrganizationRelations(doc, relations) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'RELATIONS EXTERNES', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        // Alliés
        if (relations.allies && Array.isArray(relations.allies)) {
            this.addThemeTitle(doc, 'Alliés', 3, {
                marginBottom: 10
            });
            
            for (const allie of relations.allies) {
                this.renderRelation(doc, allie, 'allié');
            }
        }
        
        // Ennemis
        if (relations.ennemis && Array.isArray(relations.ennemis)) {
            this.addThemeTitle(doc, 'Ennemis', 3, {
                marginTop: 15,
                marginBottom: 10
            });
            
            for (const ennemi of relations.ennemis) {
                this.renderRelation(doc, ennemi, 'ennemi');
            }
        }
        
        // Relations neutres/complexes
        if (relations.neutres && Array.isArray(relations.neutres)) {
            this.addThemeTitle(doc, 'Relations complexes', 3, {
                marginTop: 15,
                marginBottom: 10
            });
            
            for (const neutre of relations.neutres) {
                this.renderRelation(doc, neutre, 'neutre');
            }
        }
    }
    
    /**
     * Génère une relation spécifique
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} relation - Données de la relation
     * @param {string} type - Type de relation
     */
    renderRelation(doc, relation, type) {
        if (typeof relation === 'string') {
            this.addThemeParagraph(doc, `• **${relation}** (${type})`);
        } else {
            let text = `• **${relation.nom || relation.name}** (${type})`;
            if (relation.description) {
                text += ` : ${relation.description}`;
            }
            if (relation.force) {
                text += ` [Force: ${relation.force}]`;
            }
            this.addThemeParagraph(doc, text, { marginBottom: 5 });
        }
    }
    
    /**
     * Génère les activités et opérations
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Array} activites - Liste des activités
     */
    renderOrganizationActivities(doc, activites) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'ACTIVITÉS ET OPÉRATIONS', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        for (const activite of activites) {
            this.renderActivity(doc, activite);
        }
    }
    
    /**
     * Génère une activité spécifique
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} activite - Données de l'activité
     */
    renderActivity(doc, activite) {
        this.checkNewPage(doc, 50);
        
        // Nom de l'activité
        if (activite.nom || activite.name) {
            this.addThemeParagraph(doc, `**${(activite.nom || activite.name).toUpperCase()}**`, {
                marginBottom: 5
            });
        }
        
        // Type et fréquence
        if (activite.type) {
            this.addThemeParagraph(doc, `*Type : ${activite.type}*`, { marginBottom: 3 });
        }
        if (activite.frequence) {
            this.addThemeParagraph(doc, `*Fréquence : ${activite.frequence}*`, { marginBottom: 5 });
        }
        
        // Description
        if (activite.description) {
            this.addThemeParagraph(doc, activite.description, {
                marginBottom: 8
            });
        }
        
        // Objectif
        if (activite.objectif) {
            this.addThemeParagraph(doc, `**Objectif :** ${activite.objectif}`, {
                marginBottom: 8
            });
        }
        
        // Risques
        if (activite.risques && Array.isArray(activite.risques)) {
            this.addThemeBox(doc, 'attention', `**Risques :** ${activite.risques.join(' • ')}`);
        }
    }
    
    /**
     * Génère les secrets et complots
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Array} secrets - Liste des secrets
     */
    renderOrganizationSecrets(doc, secrets) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'SECRETS ET COMPLOTS', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        for (let i = 0; i < secrets.length; i++) {
            const secret = secrets[i];
            
            if (typeof secret === 'string') {
                this.addThemeBox(doc, 'attention', `**Secret ${i + 1} :** ${secret}`);
            } else {
                let secretText = `**${secret.titre || `Secret ${i + 1}`} :**`;
                if (secret.description) {
                    secretText += ` ${secret.description}`;
                }
                if (secret.consequences) {
                    secretText += ` **Conséquences :** ${secret.consequences}`;
                }
                
                this.addThemeBox(doc, 'attention', secretText);
            }
            
            if (i < secrets.length - 1) {
                this.checkNewPage(doc, 40);
            }
        }
    }
    
    /**
     * Génère les notes pour le MJ
     * @param {PDFDocument} doc - Document PDFKit
     * @param {string} notes - Notes du MJ
     */
    renderGMNotes(doc, notes) {
        this.checkNewPage(doc, 80);
        
        this.addThemeTitle(doc, 'NOTES POUR LE MJ', 2, {
            marginTop: 25,
            marginBottom: 15
        });
        
        this.addThemeBox(doc, 'conseil', notes);
    }
    
    /**
     * Méthodes utilitaires avec style du thème
     */
    
    addThemeTitle(doc, text, level = 1, options = {}) {
        if (this.theme && typeof this.theme.applyTitleStyle === 'function') {
            const styledText = this.theme.applyTitleStyle(doc, text, level, options);
            this.addTitle(doc, styledText, {
                fontSize: this.getThemeTitleSize(level),
                ...options
            });
        } else {
            this.addTitle(doc, text, {
                fontSize: this.getDefaultTitleSize(level),
                ...options
            });
        }
    }
    
    addThemeParagraph(doc, text, options = {}) {
        const isIntro = options.isIntro || false;
        
        if (this.theme && typeof this.theme.applyParagraphStyle === 'function') {
            this.theme.applyParagraphStyle(doc, isIntro);
        }
        
        this.addParagraph(doc, text, options);
    }
    
    addThemeList(doc, items) {
        if (this.theme) {
            const listConfig = this.theme.getListConfig();
            this.addStarList(doc, items, {
                bulletChar: listConfig.bulletChar,
                fontSize: listConfig.fontSize || 11,
                indent: listConfig.indent || 20
            });
        } else {
            this.addStarList(doc, items);
        }
    }
    
    addThemeBox(doc, type, text) {
        if (this.theme) {
            const boxStyles = this.theme.getBoxStyles();
            this.addBox(doc, type, text, {
                padding: boxStyles.padding,
                topPadding: boxStyles.marginTop || 15,
                bottomPadding: boxStyles.marginBottom || 15
            });
        } else {
            this.addBox(doc, type, text);
        }
    }
    
    getThemeTitleSize(level) {
        if (this.theme) {
            const fonts = this.theme.getFonts();
            if (fonts.titles && fonts.titles.sizes) {
                return fonts.titles.sizes[`h${level}`] || 12;
            }
        }
        return this.getDefaultTitleSize(level);
    }
    
    getDefaultTitleSize(level) {
        switch (level) {
            case 1: return 18;
            case 2: return 14;
            case 3: return 12;
            case 4: return 11;
            default: return 10;
        }
    }
    
    /**
     * Finalise le document
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} data - Données du document
     */
    finalizeDocument(doc, data) {
        // Vérifier si le document nécessite une garde et une TOC
        if (this.shouldAddLongDocumentPages()) {
            console.log('📋 Document d\'organisation long détecté, ajout de la page de garde et TOC');
        }
    }
    
    /**
     * Retourne le type de document
     */
    getDocumentType() {
        return this.documentType;
    }
    
    /**
     * Retourne le thème utilisé
     */
    getTheme() {
        return this.theme;
    }
}

module.exports = OrganizationDocument;