const BasePdfKitService = require('../BasePdfKitService');
const SystemTheme = require('../themes/SystemTheme');
const fs = require('fs');

/**
 * Document Ville - Cadres de ville et lieux narratifs
 * Structure spécialisée pour les locations, PNJs et ambiances
 * 
 * Usage :
 * - Cadres de ville Monsterhearts
 * - Lieux importants et leur atmosphère
 * - PNJs locaux et leurs relations
 * - Secrets et dynamiques de lieux
 */
class TownDocument extends BasePdfKitService {
    
    /**
     * @param {SystemTheme} theme - Thème du système de jeu (obligatoire)
     */
    constructor(theme) {
        super();
        
        if (!theme || !(theme instanceof SystemTheme)) {
            throw new Error('TownDocument nécessite un SystemTheme valide');
        }
        
        this.theme = theme;
        this.documentType = 'town';
    }
    
    /**
     * Génère un document PDF de cadre de ville
     * @param {Object} data - Données de la ville
     * @param {string} filePath - Chemin de sortie du PDF
     * @returns {Promise} Promise de génération
     */
    async generateDocument(data, filePath) {
        return new Promise((resolve, reject) => {
            try {
                // Valider les données
                this.validateTownData(data);
                
                // Configurer les textes du document
                this.setupDocumentTexts(data);
                
                // Créer le document avec la configuration de base
                const doc = this.createDocument({
                    chapterTitle: this.chapterTitle
                });
                
                const stream = doc.pipe(fs.createWriteStream(filePath));
                
                // Configurer le thème
                this.setupTheme(doc);
                
                // Générer le contenu du cadre de ville
                this.renderTownContent(doc, data);
                
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
     * Valide les données de la ville
     * @param {Object} data - Données à valider
     */
    validateTownData(data) {
        if (!data.nom && !data.townName) {
            console.warn('⚠️ Aucun nom de ville fourni');
        }
        
        // Sections recommandées pour un cadre de ville
        const recommendedSections = ['description', 'lieux', 'pnjs', 'ambiance'];
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
     * Génère le contenu du cadre de ville
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} data - Données de la ville
     */
    renderTownContent(doc, data) {
        // En-tête de la ville
        this.renderTownHeader(doc, data);
        
        // Description générale
        if (data.description) {
            this.renderTownDescription(doc, data.description);
        }
        
        // Ambiance et atmosphère
        if (data.ambiance) {
            this.renderTownAmbience(doc, data.ambiance);
        }
        
        // Lieux importants
        if (data.lieux && Array.isArray(data.lieux)) {
            this.renderTownLocations(doc, data.lieux);
        }
        
        // PNJs locaux
        if (data.pnjs && Array.isArray(data.pnjs)) {
            this.renderTownNPCs(doc, data.pnjs);
        }
        
        // Secrets et mystères
        if (data.secrets && Array.isArray(data.secrets)) {
            this.renderTownSecrets(doc, data.secrets);
        }
        
        // Événements récurrents
        if (data.evenements && Array.isArray(data.evenements)) {
            this.renderTownEvents(doc, data.evenements);
        }
        
        // Relations et dynamiques
        if (data.dynamiques) {
            this.renderTownDynamics(doc, data.dynamiques);
        }
        
        // Notes pour le MJ
        if (data.notes_mj) {
            this.renderGMNotes(doc, data.notes_mj);
        }
    }
    
    /**
     * Génère l'en-tête de la ville
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} data - Données de la ville
     */
    renderTownHeader(doc, data) {
        const townName = data.nom || data.townName || 'VILLE SANS NOM';
        
        // Nom de la ville
        this.addThemeTitle(doc, townName.toUpperCase(), 1, {
            marginBottom: 10
        });
        
        // Type de lieu
        if (data.type) {
            this.addThemeTitle(doc, data.type.toUpperCase(), 3, {
                marginBottom: 15
            });
        }
        
        // Citation ou devise de la ville
        if (data.devise || data.citation) {
            const quote = data.devise || data.citation;
            this.addThemeParagraph(doc, `"${quote}"`, {
                isIntro: true,
                marginBottom: 20
            });
        }
    }
    
    /**
     * Génère la description générale
     * @param {PDFDocument} doc - Document PDFKit
     * @param {string} description - Description de la ville
     */
    renderTownDescription(doc, description) {
        this.addThemeTitle(doc, 'VUE D\'ENSEMBLE', 2, {
            marginTop: 20,
            marginBottom: 15,
            addToToc: true
        });
        
        this.addThemeParagraph(doc, description, {
            marginBottom: 15
        });
    }
    
    /**
     * Génère l'ambiance et l'atmosphère
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} ambiance - Données d'ambiance
     */
    renderTownAmbience(doc, ambiance) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'AMBIANCE', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        // Atmosphère générale
        if (ambiance.atmosphere || ambiance.atmosphere) {
            this.addThemeParagraph(doc, ambiance.atmosphere || ambiance.atmosphere, {
                marginBottom: 15
            });
        }
        
        // Éléments sensoriels
        if (ambiance.sensoriel && Array.isArray(ambiance.sensoriel)) {
            this.addThemeParagraph(doc, '**Ce que les personnages perçoivent :**');
            this.addThemeList(doc, ambiance.sensoriel);
        }
        
        // Humeur dominante
        if (ambiance.mood || ambiance.humeur) {
            this.addThemeBox(doc, 'conseil', `**Humeur dominante :** ${ambiance.mood || ambiance.humeur}`);
        }
    }
    
    /**
     * Génère les lieux importants
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Array} lieux - Liste des lieux
     */
    renderTownLocations(doc, lieux) {
        this.checkNewPage(doc, 150);
        
        this.addThemeTitle(doc, 'LIEUX IMPORTANTS', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        for (const lieu of lieux) {
            this.renderLocation(doc, lieu);
        }
    }
    
    /**
     * Génère un lieu spécifique
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} lieu - Données du lieu
     */
    renderLocation(doc, lieu) {
        this.checkNewPage(doc, 80);
        
        // Nom du lieu
        if (lieu.nom || lieu.name) {
            this.addThemeTitle(doc, (lieu.nom || lieu.name).toUpperCase(), 3, {
                marginTop: 20,
                marginBottom: 10,
                addToToc: true,
                tocLevel: 1
            });
        }
        
        // Description
        if (lieu.description) {
            this.addThemeParagraph(doc, lieu.description, {
                marginBottom: 10
            });
        }
        
        // Détails pratiques
        const details = [];
        if (lieu.proprietaire) {
            details.push(`**Propriétaire :** ${lieu.proprietaire}`);
        }
        if (lieu.horaires) {
            details.push(`**Horaires :** ${lieu.horaires}`);
        }
        if (lieu.acces) {
            details.push(`**Accès :** ${lieu.acces}`);
        }
        
        for (const detail of details) {
            this.addThemeParagraph(doc, detail, { marginBottom: 3 });
        }
        
        // Particularités
        if (lieu.particularites && Array.isArray(lieu.particularites)) {
            this.addThemeParagraph(doc, '**Particularités :**');
            this.addThemeList(doc, lieu.particularites);
        }
        
        // Secrets du lieu
        if (lieu.secrets && Array.isArray(lieu.secrets)) {
            this.addThemeBox(doc, 'attention', `**Secrets :** ${lieu.secrets.join(' • ')}`);
        }
    }
    
    /**
     * Génère les PNJs locaux
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Array} pnjs - Liste des PNJs
     */
    renderTownNPCs(doc, pnjs) {
        this.checkNewPage(doc, 150);
        
        this.addThemeTitle(doc, 'PERSONNAGES LOCAUX', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        for (const pnj of pnjs) {
            this.renderNPC(doc, pnj);
        }
    }
    
    /**
     * Génère un PNJ spécifique
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} pnj - Données du PNJ
     */
    renderNPC(doc, pnj) {
        this.checkNewPage(doc, 60);
        
        // Nom du PNJ
        if (pnj.nom || pnj.name) {
            this.addThemeTitle(doc, (pnj.nom || pnj.name).toUpperCase(), 3, {
                marginTop: 15,
                marginBottom: 8,
                addToToc: true,
                tocLevel: 1
            });
        }
        
        // Détails de base
        const infos = [];
        if (pnj.age) infos.push(`**Âge :** ${pnj.age} ans`);
        if (pnj.profession) infos.push(`**Profession :** ${pnj.profession}`);
        if (pnj.role) infos.push(`**Rôle :** ${pnj.role}`);
        if (pnj.apparence) infos.push(`**Apparence :** ${pnj.apparence}`);
        
        for (const info of infos) {
            this.addThemeParagraph(doc, info, { marginBottom: 3 });
        }
        
        // Description
        if (pnj.description) {
            this.addThemeParagraph(doc, pnj.description, {
                marginBottom: 8
            });
        }
        
        // Motivations
        if (pnj.motivations && Array.isArray(pnj.motivations)) {
            this.addThemeParagraph(doc, '**Motivations :**');
            this.addThemeList(doc, pnj.motivations);
        }
        
        // Relations
        if (pnj.relations && Array.isArray(pnj.relations)) {
            this.addThemeParagraph(doc, '**Relations importantes :**');
            this.addThemeList(doc, pnj.relations);
        }
        
        // Secrets du PNJ
        if (pnj.secrets && Array.isArray(pnj.secrets)) {
            this.addThemeBox(doc, 'attention', `**Secrets :** ${pnj.secrets.join(' • ')}`);
        }
    }
    
    /**
     * Génère les secrets et mystères
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Array} secrets - Liste des secrets
     */
    renderTownSecrets(doc, secrets) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'SECRETS ET MYSTÈRES', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        for (let i = 0; i < secrets.length; i++) {
            const secret = secrets[i];
            
            this.addThemeBox(doc, 'attention', `**Secret ${i + 1} :** ${secret}`);
            
            if (i < secrets.length - 1) {
                this.checkNewPage(doc, 40);
            }
        }
    }
    
    /**
     * Génère les événements récurrents
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Array} evenements - Liste des événements
     */
    renderTownEvents(doc, evenements) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'ÉVÉNEMENTS RÉCURRENTS', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        for (const evenement of evenements) {
            this.renderEvent(doc, evenement);
        }
    }
    
    /**
     * Génère un événement spécifique
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} evenement - Données de l'événement
     */
    renderEvent(doc, evenement) {
        this.checkNewPage(doc, 50);
        
        // Nom de l'événement
        if (evenement.nom || evenement.name) {
            this.addThemeParagraph(doc, `**${(evenement.nom || evenement.name).toUpperCase()}**`, {
                marginBottom: 5
            });
        }
        
        // Fréquence
        if (evenement.frequence) {
            this.addThemeParagraph(doc, `*${evenement.frequence}*`, {
                marginBottom: 5
            });
        }
        
        // Description
        if (evenement.description) {
            this.addThemeParagraph(doc, evenement.description, {
                marginBottom: 10
            });
        }
        
        // Conséquences potentielles
        if (evenement.consequences && Array.isArray(evenement.consequences)) {
            this.addThemeParagraph(doc, '**Conséquences possibles :**');
            this.addThemeList(doc, evenement.consequences);
        }
    }
    
    /**
     * Génère les dynamiques de la ville
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} dynamiques - Données des dynamiques
     */
    renderTownDynamics(doc, dynamiques) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'DYNAMIQUES SOCIALES', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        // Tensions
        if (dynamiques.tensions && Array.isArray(dynamiques.tensions)) {
            this.addThemeTitle(doc, 'Tensions actuelles', 3, {
                marginBottom: 10
            });
            this.addThemeList(doc, dynamiques.tensions);
        }
        
        // Alliances
        if (dynamiques.alliances && Array.isArray(dynamiques.alliances)) {
            this.addThemeTitle(doc, 'Alliances et groupes', 3, {
                marginTop: 15,
                marginBottom: 10
            });
            this.addThemeList(doc, dynamiques.alliances);
        }
        
        // Points de basculement
        if (dynamiques.points_bascule && Array.isArray(dynamiques.points_bascule)) {
            this.addThemeTitle(doc, 'Points de basculement', 3, {
                marginTop: 15,
                marginBottom: 10
            });
            
            for (const point of dynamiques.points_bascule) {
                this.addThemeBox(doc, 'conseil', point);
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
        
        this.addThemeBox(doc, 'attention', notes);
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
            console.log('📋 Document de ville long détecté, ajout de la page de garde et TOC');
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

module.exports = TownDocument;