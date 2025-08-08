const BasePdfKitService = require('../BasePdfKitService');
const SystemTheme = require('../themes/SystemTheme');
const fs = require('fs');

/**
 * Document Groupe - Plans de classe et dynamiques de groupe
 * Structure spécialisée pour les relations, disposition et dynamiques collectives
 * 
 * Usage :
 * - Plans de classe Monsterhearts
 * - Dynamiques de groupe et relations
 * - Disposition spatiale des personnages
 * - Tensions et alliances entre personnages
 */
class GroupDocument extends BasePdfKitService {
    
    /**
     * @param {SystemTheme} theme - Thème du système de jeu (obligatoire)
     */
    constructor(theme) {
        super();
        
        if (!theme || !(theme instanceof SystemTheme)) {
            throw new Error('GroupDocument nécessite un SystemTheme valide');
        }
        
        this.theme = theme;
        this.documentType = 'group';
    }
    
    /**
     * Génère un document PDF de plan de groupe
     * @param {Object} data - Données du groupe
     * @param {string} filePath - Chemin de sortie du PDF
     * @returns {Promise} Promise de génération
     */
    async generateDocument(data, filePath) {
        return new Promise((resolve, reject) => {
            try {
                // Valider les données
                this.validateGroupData(data);
                
                // Configurer les textes du document
                this.setupDocumentTexts(data);
                
                // Créer le document avec la configuration de base
                const doc = this.createDocument({
                    chapterTitle: this.chapterTitle
                });
                
                const stream = doc.pipe(fs.createWriteStream(filePath));
                
                // Configurer le thème
                this.setupTheme(doc);
                
                // Générer le contenu du plan de groupe
                this.renderGroupContent(doc, data);
                
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
     * Valide les données du groupe
     * @param {Object} data - Données à valider
     */
    validateGroupData(data) {
        if (!data.nom && !data.groupName && !data.className) {
            console.warn('⚠️ Aucun nom de groupe/classe fourni');
        }
        
        // Sections recommandées pour un plan de groupe
        const recommendedSections = ['membres', 'relations', 'disposition'];
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
     * Génère le contenu du plan de groupe
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} data - Données du groupe
     */
    renderGroupContent(doc, data) {
        // En-tête du groupe
        this.renderGroupHeader(doc, data);
        
        // Contexte et cadre
        if (data.contexte || data.context) {
            this.renderGroupContext(doc, data.contexte || data.context);
        }
        
        // Membres du groupe
        if (data.membres && Array.isArray(data.membres)) {
            this.renderGroupMembers(doc, data.membres);
        }
        
        // Plan de classe/disposition
        if (data.disposition || data.layout) {
            this.renderGroupLayout(doc, data.disposition || data.layout);
        }
        
        // Relations entre membres
        if (data.relations && Array.isArray(data.relations)) {
            this.renderGroupRelationships(doc, data.relations);
        }
        
        // Dynamiques de groupe
        if (data.dynamiques || data.dynamics) {
            this.renderGroupDynamics(doc, data.dynamiques || data.dynamics);
        }
        
        // Tensions et conflits
        if (data.tensions && Array.isArray(data.tensions)) {
            this.renderGroupTensions(doc, data.tensions);
        }
        
        // Objectifs communs
        if (data.objectifs || data.goals) {
            this.renderGroupGoals(doc, data.objectifs || data.goals);
        }
        
        // Événements marquants
        if (data.evenements && Array.isArray(data.evenements)) {
            this.renderGroupEvents(doc, data.evenements);
        }
        
        // Instructions pour le MJ
        if (data.instructions_mj) {
            this.renderGMInstructions(doc, data.instructions_mj);
        }
    }
    
    /**
     * Génère l'en-tête du groupe
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} data - Données du groupe
     */
    renderGroupHeader(doc, data) {
        const groupName = data.nom || data.groupName || data.className || 'GROUPE SANS NOM';
        
        // Nom du groupe/classe
        this.addThemeTitle(doc, groupName.toUpperCase(), 1, {
            marginBottom: 10
        });
        
        // Type de groupe
        if (data.type) {
            this.addThemeTitle(doc, data.type.toUpperCase(), 3, {
                marginBottom: 15
            });
        }
        
        // Description rapide
        if (data.description_courte || data.shortDescription) {
            const desc = data.description_courte || data.shortDescription;
            this.addThemeParagraph(doc, `"${desc}"`, {
                isIntro: true,
                marginBottom: 20
            });
        }
    }
    
    /**
     * Génère le contexte du groupe
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} contexte - Contexte du groupe
     */
    renderGroupContext(doc, contexte) {
        this.addThemeTitle(doc, 'CONTEXTE', 2, {
            marginTop: 20,
            marginBottom: 15,
            addToToc: true
        });
        
        // Lieu principal
        if (contexte.lieu || contexte.location) {
            this.addThemeParagraph(doc, `**Lieu principal :** ${contexte.lieu || contexte.location}`, {
                marginBottom: 5
            });
        }
        
        // Période/époque
        if (contexte.periode || contexte.period) {
            this.addThemeParagraph(doc, `**Période :** ${contexte.periode || contexte.period}`, {
                marginBottom: 5
            });
        }
        
        // Situation générale
        if (contexte.situation) {
            this.addThemeParagraph(doc, `**Situation :** ${contexte.situation}`, {
                marginBottom: 15
            });
        }
        
        // Enjeux
        if (contexte.enjeux && Array.isArray(contexte.enjeux)) {
            this.addThemeParagraph(doc, '**Enjeux principaux :**');
            this.addThemeList(doc, contexte.enjeux);
        }
    }
    
    /**
     * Génère la liste des membres
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Array} membres - Liste des membres
     */
    renderGroupMembers(doc, membres) {
        this.checkNewPage(doc, 150);
        
        this.addThemeTitle(doc, 'MEMBRES DU GROUPE', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        for (const membre of membres) {
            this.renderGroupMember(doc, membre);
        }
    }
    
    /**
     * Génère un membre spécifique
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} membre - Données du membre
     */
    renderGroupMember(doc, membre) {
        this.checkNewPage(doc, 60);
        
        // Nom du membre
        if (membre.nom || membre.name) {
            this.addThemeTitle(doc, (membre.nom || membre.name).toUpperCase(), 3, {
                marginTop: 15,
                marginBottom: 8,
                addToToc: true,
                tocLevel: 1
            });
        }
        
        // Informations de base
        const infos = [];
        if (membre.joueur || membre.player) infos.push(`**Joueur :** ${membre.joueur || membre.player}`);
        if (membre.classe || membre.class) infos.push(`**Classe :** ${membre.classe || membre.class}`);
        if (membre.role) infos.push(`**Rôle dans le groupe :** ${membre.role}`);
        if (membre.statut) infos.push(`**Statut :** ${membre.statut}`);
        
        for (const info of infos) {
            this.addThemeParagraph(doc, info, { marginBottom: 3 });
        }
        
        // Description
        if (membre.description) {
            this.addThemeParagraph(doc, membre.description, {
                marginBottom: 8
            });
        }
        
        // Position dans la classe (pour Monsterhearts)
        if (membre.position) {
            this.addThemeParagraph(doc, `**Position :** ${membre.position}`, {
                marginBottom: 5
            });
        }
        
        // Relations particulières
        if (membre.relations_speciales && Array.isArray(membre.relations_speciales)) {
            this.addThemeParagraph(doc, '**Relations particulières :**');
            this.addThemeList(doc, membre.relations_speciales);
        }
    }
    
    /**
     * Génère le plan de classe/disposition
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} disposition - Données de disposition
     */
    renderGroupLayout(doc, disposition) {
        this.checkNewPage(doc, 120);
        
        this.addThemeTitle(doc, 'PLAN DE CLASSE', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        // Type de disposition
        if (disposition.type) {
            this.addThemeParagraph(doc, `**Type de disposition :** ${disposition.type}`, {
                marginBottom: 10
            });
        }
        
        // Schéma de disposition (description textuelle)
        if (disposition.schema || disposition.layout) {
            this.renderLayoutSchema(doc, disposition.schema || disposition.layout);
        }
        
        // Places spécifiques
        if (disposition.places && Array.isArray(disposition.places)) {
            this.addThemeParagraph(doc, '**Positions spécifiques :**');
            for (const place of disposition.places) {
                this.addThemeParagraph(doc, `• **${place.position}** : ${place.occupant} ${place.description ? `(${place.description})` : ''}`, {
                    marginLeft: 20,
                    marginBottom: 3
                });
            }
        }
        
        // Zones importantes
        if (disposition.zones && Array.isArray(disposition.zones)) {
            this.addThemeParagraph(doc, '**Zones importantes :**');
            this.addThemeList(doc, disposition.zones);
        }
    }
    
    /**
     * Génère le schéma de disposition
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} schema - Schéma de disposition
     */
    renderLayoutSchema(doc, schema) {
        if (schema.type === 'classroom') {
            this.renderClassroomLayout(doc, schema);
        } else if (schema.description) {
            this.addThemeParagraph(doc, schema.description, {
                marginBottom: 15
            });
        }
    }
    
    /**
     * Génère un plan de classe typique
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} schema - Schéma de classe
     */
    renderClassroomLayout(doc, schema) {
        this.addThemeParagraph(doc, '**Disposition type de classe :**', {
            marginBottom: 10
        });
        
        // ASCII art simple du plan de classe
        const classroomLayout = [
            '┌────────── TABLEAU ──────────┐',
            '│                              │',
            '└──────────────────────────────┘',
            '',
            '    ┌───┐  ┌───┐  ┌───┐  ┌───┐',
            '    │ A │  │ B │  │ C │  │ D │',
            '    └───┘  └───┘  └───┘  └───┘',
            '',
            '    ┌───┐  ┌───┐  ┌───┐  ┌───┐',
            '    │ E │  │ F │  │ G │  │ H │',
            '    └───┘  └───┘  └───┘  └───┘',
            '',
            '    ┌───┐  ┌───┐  ┌───┐  ┌───┐',
            '    │ I │  │ J │  │ K │  │ L │',
            '    └───┘  └───┘  └───┘  └───┘',
            '',
            '┌─────────── PORTE ───────────┐'
        ];
        
        // Utiliser une police monospace pour l'alignement
        doc.font('Courier')
           .fontSize(10);
        
        for (const line of classroomLayout) {
            this.addParagraph(doc, line, {
                marginBottom: 2,
                align: 'center'
            });
        }
        
        // Revenir au thème normal
        this.theme.applyFont(doc, 'body');
    }
    
    /**
     * Génère les relations entre membres
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Array} relations - Liste des relations
     */
    renderGroupRelationships(doc, relations) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'RELATIONS INTERPERSONNELLES', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        for (const relation of relations) {
            this.renderRelationship(doc, relation);
        }
    }
    
    /**
     * Génère une relation spécifique
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} relation - Données de la relation
     */
    renderRelationship(doc, relation) {
        this.checkNewPage(doc, 40);
        
        // Participants à la relation
        if (relation.participants && Array.isArray(relation.participants)) {
            const participants = relation.participants.join(' ↔ ');
            this.addThemeParagraph(doc, `**${participants}**`, {
                marginBottom: 5
            });
        }
        
        // Type de relation
        if (relation.type) {
            this.addThemeParagraph(doc, `*Type :* ${relation.type}`, {
                marginBottom: 5
            });
        }
        
        // Description
        if (relation.description) {
            this.addThemeParagraph(doc, relation.description, {
                marginBottom: 8
            });
        }
        
        // Intensité ou force de la relation
        if (relation.intensite || relation.strength) {
            const intensite = relation.intensite || relation.strength;
            this.addThemeParagraph(doc, `**Intensité :** ${intensite}`, {
                marginBottom: 8
            });
        }
        
        // Evolution possible
        if (relation.evolution) {
            this.addThemeBox(doc, 'conseil', `**Évolution possible :** ${relation.evolution}`);
        }
    }
    
    /**
     * Génère les dynamiques de groupe
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} dynamiques - Données des dynamiques
     */
    renderGroupDynamics(doc, dynamiques) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'DYNAMIQUES DE GROUPE', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        // Cohésion du groupe
        if (dynamiques.cohesion || dynamiques.unity) {
            this.addThemeParagraph(doc, `**Cohésion :** ${dynamiques.cohesion || dynamiques.unity}`, {
                marginBottom: 10
            });
        }
        
        // Leadership
        if (dynamiques.leadership) {
            this.addThemeParagraph(doc, `**Leadership :** ${dynamiques.leadership}`, {
                marginBottom: 10
            });
        }
        
        // Sous-groupes
        if (dynamiques.sous_groupes && Array.isArray(dynamiques.sous_groupes)) {
            this.addThemeParagraph(doc, '**Sous-groupes identifiés :**');
            this.addThemeList(doc, dynamiques.sous_groupes);
        }
        
        // Rituels et habitudes
        if (dynamiques.rituels && Array.isArray(dynamiques.rituels)) {
            this.addThemeParagraph(doc, '**Rituels et habitudes du groupe :**');
            this.addThemeList(doc, dynamiques.rituels);
        }
        
        // Points de friction
        if (dynamiques.frictions && Array.isArray(dynamiques.frictions)) {
            this.addThemeParagraph(doc, '**Points de friction récurrents :**');
            this.addThemeList(doc, dynamiques.frictions);
        }
    }
    
    /**
     * Génère les tensions et conflits
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Array} tensions - Liste des tensions
     */
    renderGroupTensions(doc, tensions) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'TENSIONS ET CONFLITS', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        for (let i = 0; i < tensions.length; i++) {
            const tension = tensions[i];
            
            this.addThemeTitle(doc, `Tension ${i + 1}`, 3, {
                marginBottom: 8
            });
            
            // Source de la tension
            if (tension.source) {
                this.addThemeParagraph(doc, `**Source :** ${tension.source}`, {
                    marginBottom: 5
                });
            }
            
            // Parties impliquées
            if (tension.impliques && Array.isArray(tension.impliques)) {
                this.addThemeParagraph(doc, `**Impliqués :** ${tension.impliques.join(', ')}`, {
                    marginBottom: 5
                });
            }
            
            // Description
            if (tension.description) {
                this.addThemeParagraph(doc, tension.description, {
                    marginBottom: 8
                });
            }
            
            // Escalade possible
            if (tension.escalade) {
                this.addThemeBox(doc, 'attention', `**Escalade possible :** ${tension.escalade}`);
            }
            
            if (i < tensions.length - 1) {
                this.checkNewPage(doc, 60);
            }
        }
    }
    
    /**
     * Génère les objectifs communs
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} objectifs - Objectifs du groupe
     */
    renderGroupGoals(doc, objectifs) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'OBJECTIFS COMMUNS', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        // Objectifs à court terme
        if (objectifs.court_terme && Array.isArray(objectifs.court_terme)) {
            this.addThemeTitle(doc, 'À court terme', 3, {
                marginBottom: 10
            });
            this.addThemeList(doc, objectifs.court_terme);
        }
        
        // Objectifs à long terme
        if (objectifs.long_terme && Array.isArray(objectifs.long_terme)) {
            this.addThemeTitle(doc, 'À long terme', 3, {
                marginTop: 15,
                marginBottom: 10
            });
            this.addThemeList(doc, objectifs.long_terme);
        }
        
        // Objectifs secrets
        if (objectifs.secrets && Array.isArray(objectifs.secrets)) {
            this.addThemeTitle(doc, 'Objectifs cachés', 3, {
                marginTop: 15,
                marginBottom: 10
            });
            
            for (const secret of objectifs.secrets) {
                this.addThemeBox(doc, 'attention', secret);
            }
        }
    }
    
    /**
     * Génère les événements marquants
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Array} evenements - Liste des événements
     */
    renderGroupEvents(doc, evenements) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'ÉVÉNEMENTS MARQUANTS', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        for (const evenement of evenements) {
            this.renderGroupEvent(doc, evenement);
        }
    }
    
    /**
     * Génère un événement spécifique
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} evenement - Données de l'événement
     */
    renderGroupEvent(doc, evenement) {
        this.checkNewPage(doc, 50);
        
        // Date ou moment
        if (evenement.quand || evenement.date) {
            this.addThemeParagraph(doc, `**${evenement.quand || evenement.date}**`, {
                marginBottom: 5
            });
        }
        
        // Titre de l'événement
        if (evenement.titre || evenement.title) {
            this.addThemeParagraph(doc, `*${evenement.titre || evenement.title}*`, {
                marginBottom: 5
            });
        }
        
        // Description
        if (evenement.description) {
            this.addThemeParagraph(doc, evenement.description, {
                marginBottom: 8
            });
        }
        
        // Impact sur le groupe
        if (evenement.impact) {
            this.addThemeBox(doc, 'conseil', `**Impact :** ${evenement.impact}`);
        }
    }
    
    /**
     * Génère les instructions pour le MJ
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} instructions - Instructions MJ
     */
    renderGMInstructions(doc, instructions) {
        this.checkNewPage(doc, 120);
        
        this.addThemeTitle(doc, 'INSTRUCTIONS POUR LE MJ', 2, {
            marginTop: 25,
            marginBottom: 15
        });
        
        // Conseils généraux
        if (instructions.conseils && Array.isArray(instructions.conseils)) {
            this.addThemeTitle(doc, 'Conseils de gestion', 3, {
                marginBottom: 10
            });
            this.addThemeList(doc, instructions.conseils);
        }
        
        // Scènes suggérées
        if (instructions.scenes && Array.isArray(instructions.scenes)) {
            this.addThemeTitle(doc, 'Scènes suggérées', 3, {
                marginTop: 15,
                marginBottom: 10
            });
            this.addThemeList(doc, instructions.scenes);
        }
        
        // Pièges à éviter
        if (instructions.pieges && Array.isArray(instructions.pieges)) {
            this.addThemeTitle(doc, 'Pièges à éviter', 3, {
                marginTop: 15,
                marginBottom: 10
            });
            
            for (const piege of instructions.pieges) {
                this.addThemeBox(doc, 'attention', piege);
            }
        }
        
        // Notes supplémentaires
        if (instructions.notes) {
            this.addThemeBox(doc, 'conseil', instructions.notes);
        }
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
            default: return 11;
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
            console.log('📋 Document de groupe long détecté, ajout de la page de garde et TOC');
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

module.exports = GroupDocument;