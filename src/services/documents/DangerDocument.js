const BasePdfKitService = require('../BasePdfKitService');
const SystemTheme = require('../themes/SystemTheme');
const fs = require('fs');

/**
 * Document Danger - Fronts, menaces et éléments dramatiques
 * Structure spécialisée pour les dangers narratifs et mécaniques
 * 
 * Usage :
 * - Fronts Mist Engine
 * - Menaces Metro 2033
 * - Dangers Zombiology
 * - Tout élément d'opposition narrative
 */
class DangerDocument extends BasePdfKitService {
    
    /**
     * @param {SystemTheme} theme - Thème du système de jeu (obligatoire)
     */
    constructor(theme) {
        super();
        
        if (!theme || !(theme instanceof SystemTheme)) {
            throw new Error('DangerDocument nécessite un SystemTheme valide');
        }
        
        this.theme = theme;
        this.documentType = 'danger';
    }
    
    /**
     * Génère un document PDF de danger/front
     * @param {Object} data - Données du danger
     * @param {string} filePath - Chemin de sortie du PDF
     * @returns {Promise} Promise de génération
     */
    async generateDocument(data, filePath) {
        return new Promise((resolve, reject) => {
            try {
                // Valider les données
                this.validateDangerData(data);
                
                // Configurer les textes du document
                this.setupDocumentTexts(data);
                
                // Créer le document avec la configuration de base
                const doc = this.createDocument({
                    chapterTitle: this.chapterTitle
                });
                
                const stream = doc.pipe(fs.createWriteStream(filePath));
                
                // Configurer le thème
                this.setupTheme(doc);
                
                // Générer le contenu du danger
                this.renderDangerContent(doc, data);
                
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
     * Valide les données du danger
     * @param {Object} data - Données à valider
     */
    validateDangerData(data) {
        if (!data.nom && !data.dangerName && !data.name) {
            console.warn('⚠️ Aucun nom de danger fourni');
        }
        
        // Sections recommandées pour un danger
        const recommendedSections = ['nature', 'manifestations', 'progression'];
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
     * Génère le contenu du danger
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} data - Données du danger
     */
    renderDangerContent(doc, data) {
        // En-tête du danger
        this.renderDangerHeader(doc, data);
        
        // Nature du danger
        if (data.nature || data.description) {
            this.renderDangerNature(doc, data.nature || data.description);
        }
        
        // Type et catégorie
        if (data.type || data.categorie) {
            this.renderDangerType(doc, data);
        }
        
        // Manifestations actuelles
        if (data.manifestations && Array.isArray(data.manifestations)) {
            this.renderDangerManifestations(doc, data.manifestations);
        }
        
        // Progression du danger
        if (data.progression || data.escalade) {
            this.renderDangerProgression(doc, data.progression || data.escalade);
        }
        
        // Signes avant-coureurs
        if (data.signes && Array.isArray(data.signes)) {
            this.renderDangerSigns(doc, data.signes);
        }
        
        // Conséquences et impacts
        if (data.consequences && Array.isArray(data.consequences)) {
            this.renderDangerConsequences(doc, data.consequences);
        }
        
        // Mécaniques de jeu
        if (data.mecaniques) {
            this.renderDangerMechanics(doc, data.mecaniques);
        }
        
        // Solutions possibles
        if (data.solutions && Array.isArray(data.solutions)) {
            this.renderDangerSolutions(doc, data.solutions);
        }
        
        // Compteur de danger (Mist Engine style)
        if (data.compteur || data.clock) {
            this.renderDangerClock(doc, data.compteur || data.clock);
        }
        
        // Événements déclencheurs
        if (data.declencheurs && Array.isArray(data.declencheurs)) {
            this.renderDangerTriggers(doc, data.declencheurs);
        }
        
        // Notes pour le MJ
        if (data.notes_mj) {
            this.renderGMNotes(doc, data.notes_mj);
        }
    }
    
    /**
     * Génère l'en-tête du danger
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} data - Données du danger
     */
    renderDangerHeader(doc, data) {
        const dangerName = data.nom || data.dangerName || data.name || 'DANGER SANS NOM';
        
        // Nom du danger
        this.addThemeTitle(doc, dangerName.toUpperCase(), 1, {
            marginBottom: 10
        });
        
        // Sous-titre ou nature
        if (data.sous_titre || data.subtitle) {
            this.addThemeTitle(doc, data.sous_titre || data.subtitle, 3, {
                marginBottom: 15
            });
        }
        
        // Citation ou phrase d'accroche
        if (data.citation || data.accroche) {
            const quote = data.citation || data.accroche;
            this.addThemeParagraph(doc, `"${quote}"`, {
                isIntro: true,
                marginBottom: 20
            });
        }
        
        // Informations de base
        const infos = [];
        if (data.niveau_menace) infos.push(`**Niveau de menace :** ${data.niveau_menace}`);
        if (data.portee || data.scope) infos.push(`**Portée :** ${data.portee || data.scope}`);
        if (data.duree_activation) infos.push(`**Durée d'activation :** ${data.duree_activation}`);
        if (data.origine) infos.push(`**Origine :** ${data.origine}`);
        
        for (const info of infos) {
            this.addThemeParagraph(doc, info, { marginBottom: 5 });
        }
    }
    
    /**
     * Génère la nature du danger
     * @param {PDFDocument} doc - Document PDFKit
     * @param {string|Object} nature - Nature du danger
     */
    renderDangerNature(doc, nature) {
        this.addThemeTitle(doc, 'NATURE DU DANGER', 2, {
            marginTop: 20,
            marginBottom: 15,
            addToToc: true
        });
        
        if (typeof nature === 'string') {
            this.addThemeParagraph(doc, nature, {
                marginBottom: 15
            });
        } else if (typeof nature === 'object') {
            // Nature structurée
            if (nature.description) {
                this.addThemeParagraph(doc, nature.description, {
                    marginBottom: 10
                });
            }
            
            if (nature.origine_profonde) {
                this.addThemeParagraph(doc, `**Origine profonde :** ${nature.origine_profonde}`, {
                    marginBottom: 10
                });
            }
            
            if (nature.symbolisme) {
                this.addThemeParagraph(doc, `**Symbolisme :** ${nature.symbolisme}`, {
                    marginBottom: 10
                });
            }
        }
    }
    
    /**
     * Génère le type et la catégorie
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} data - Données du danger
     */
    renderDangerType(doc, data) {
        const infos = [];
        
        if (data.type) infos.push(`**Type :** ${data.type}`);
        if (data.categorie) infos.push(`**Catégorie :** ${data.categorie}`);
        if (data.theme_narratif) infos.push(`**Thème narratif :** ${data.theme_narratif}`);
        
        if (infos.length > 0) {
            this.addThemeTitle(doc, 'CLASSIFICATION', 2, {
                marginTop: 20,
                marginBottom: 15,
                addToToc: true
            });
            
            for (const info of infos) {
                this.addThemeParagraph(doc, info, { marginBottom: 5 });
            }
        }
    }
    
    /**
     * Génère les manifestations actuelles
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Array} manifestations - Liste des manifestations
     */
    renderDangerManifestations(doc, manifestations) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'MANIFESTATIONS ACTUELLES', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        for (const manifestation of manifestations) {
            this.renderManifestation(doc, manifestation);
        }
    }
    
    /**
     * Génère une manifestation spécifique
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object|string} manifestation - Données de la manifestation
     */
    renderManifestation(doc, manifestation) {
        this.checkNewPage(doc, 50);
        
        if (typeof manifestation === 'string') {
            this.addThemeParagraph(doc, `• ${manifestation}`, {
                marginBottom: 8
            });
        } else {
            // Nom de la manifestation
            if (manifestation.nom || manifestation.name) {
                this.addThemeParagraph(doc, `**${(manifestation.nom || manifestation.name).toUpperCase()}**`, {
                    marginBottom: 5
                });
            }
            
            // Description
            if (manifestation.description) {
                this.addThemeParagraph(doc, manifestation.description, {
                    marginBottom: 5
                });
            }
            
            // Intensité
            if (manifestation.intensite) {
                this.addThemeParagraph(doc, `*Intensité : ${manifestation.intensite}*`, {
                    marginBottom: 5
                });
            }
            
            // Effets sur les personnages
            if (manifestation.effets && Array.isArray(manifestation.effets)) {
                this.addThemeParagraph(doc, '**Effets sur les personnages :**');
                this.addThemeList(doc, manifestation.effets);
            }
        }
    }
    
    /**
     * Génère la progression du danger
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object|Array} progression - Progression du danger
     */
    renderDangerProgression(doc, progression) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'PROGRESSION ET ESCALADE', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        if (Array.isArray(progression)) {
            // Étapes de progression
            this.addThemeParagraph(doc, '**Étapes d\'escalade :**');
            
            for (let i = 0; i < progression.length; i++) {
                const etape = progression[i];
                this.addThemeParagraph(doc, `**${i + 1}. ${typeof etape === 'string' ? etape : etape.description}**`, {
                    marginTop: 10,
                    marginBottom: 5
                });
                
                if (typeof etape === 'object') {
                    if (etape.declencheur) {
                        this.addThemeParagraph(doc, `*Déclencheur : ${etape.declencheur}*`, {
                            marginLeft: 20,
                            marginBottom: 3
                        });
                    }
                    
                    if (etape.consequences && Array.isArray(etape.consequences)) {
                        this.addThemeParagraph(doc, '**Conséquences :**', {
                            marginLeft: 20,
                            marginBottom: 3
                        });
                        
                        for (const consequence of etape.consequences) {
                            this.addThemeParagraph(doc, `• ${consequence}`, {
                                marginLeft: 30,
                                marginBottom: 2
                            });
                        }
                    }
                }
            }
        } else if (typeof progression === 'object') {
            // Progression structurée
            if (progression.description) {
                this.addThemeParagraph(doc, progression.description, {
                    marginBottom: 10
                });
            }
            
            if (progression.facteurs_acceleration && Array.isArray(progression.facteurs_acceleration)) {
                this.addThemeParagraph(doc, '**Facteurs d\'accélération :**');
                this.addThemeList(doc, progression.facteurs_acceleration);
            }
            
            if (progression.points_basculement && Array.isArray(progression.points_basculement)) {
                this.addThemeParagraph(doc, '**Points de basculement critiques :**');
                for (const point of progression.points_basculement) {
                    this.addThemeBox(doc, 'attention', point);
                }
            }
        }
    }
    
    /**
     * Génère les signes avant-coureurs
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Array} signes - Liste des signes
     */
    renderDangerSigns(doc, signes) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'SIGNES AVANT-COUREURS', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        // Regrouper par subtilité/évidence
        const signesSubtils = [];
        const signesEvidents = [];
        const signesNormaux = [];
        
        for (const signe of signes) {
            if (typeof signe === 'object' && signe.type) {
                switch (signe.type.toLowerCase()) {
                    case 'subtil':
                    case 'discret':
                        signesSubtils.push(signe);
                        break;
                    case 'evident':
                    case 'visible':
                        signesEvidents.push(signe);
                        break;
                    default:
                        signesNormaux.push(signe);
                }
            } else {
                signesNormaux.push(signe);
            }
        }
        
        // Afficher par catégorie
        if (signesSubtils.length > 0) {
            this.addThemeTitle(doc, 'Signes subtils', 3, {
                marginBottom: 10
            });
            this.renderSignsList(doc, signesSubtils);
        }
        
        if (signesNormaux.length > 0) {
            this.addThemeTitle(doc, 'Signes perceptibles', 3, {
                marginTop: 15,
                marginBottom: 10
            });
            this.renderSignsList(doc, signesNormaux);
        }
        
        if (signesEvidents.length > 0) {
            this.addThemeTitle(doc, 'Signes évidents', 3, {
                marginTop: 15,
                marginBottom: 10
            });
            this.renderSignsList(doc, signesEvidents);
        }
    }
    
    /**
     * Génère une liste de signes
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Array} signes - Liste des signes
     */
    renderSignsList(doc, signes) {
        for (const signe of signes) {
            if (typeof signe === 'string') {
                this.addThemeParagraph(doc, `• ${signe}`, {
                    marginBottom: 5
                });
            } else {
                let text = `• ${signe.description || signe.nom}`;
                if (signe.frequence) {
                    text += ` *(${signe.frequence})*`;
                }
                this.addThemeParagraph(doc, text, {
                    marginBottom: 5
                });
            }
        }
    }
    
    /**
     * Génère les conséquences et impacts
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Array} consequences - Liste des conséquences
     */
    renderDangerConsequences(doc, consequences) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'CONSÉQUENCES ET IMPACTS', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        for (const consequence of consequences) {
            this.renderConsequence(doc, consequence);
        }
    }
    
    /**
     * Génère une conséquence spécifique
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object|string} consequence - Données de la conséquence
     */
    renderConsequence(doc, consequence) {
        if (typeof consequence === 'string') {
            this.addThemeBox(doc, 'attention', consequence);
        } else {
            let text = '';
            
            if (consequence.titre || consequence.name) {
                text += `**${consequence.titre || consequence.name} :** `;
            }
            
            if (consequence.description) {
                text += consequence.description;
            }
            
            if (consequence.portee) {
                text += ` *(Portée : ${consequence.portee})*`;
            }
            
            if (consequence.duree) {
                text += ` *(Durée : ${consequence.duree})*`;
            }
            
            this.addThemeBox(doc, 'attention', text);
        }
    }
    
    /**
     * Génère les mécaniques de jeu
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} mecaniques - Mécaniques du danger
     */
    renderDangerMechanics(doc, mecaniques) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'MÉCANIQUES DE JEU', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        // Règles spéciales
        if (mecaniques.regles && Array.isArray(mecaniques.regles)) {
            this.addThemeTitle(doc, 'Règles spéciales', 3, {
                marginBottom: 10
            });
            this.addThemeList(doc, mecaniques.regles);
        }
        
        // Tests et jets
        if (mecaniques.tests && Array.isArray(mecaniques.tests)) {
            this.addThemeTitle(doc, 'Tests suggérés', 3, {
                marginTop: 15,
                marginBottom: 10
            });
            
            for (const test of mecaniques.tests) {
                if (typeof test === 'string') {
                    this.addThemeParagraph(doc, `• ${test}`);
                } else {
                    this.addThemeParagraph(doc, `• **${test.nom}** : ${test.description} *(${test.difficulte || 'Difficulté standard'})*`);
                }
            }
        }
        
        // Conditions et états
        if (mecaniques.conditions && Array.isArray(mecaniques.conditions)) {
            this.addThemeTitle(doc, 'Conditions infligées', 3, {
                marginTop: 15,
                marginBottom: 10
            });
            this.addThemeList(doc, mecaniques.conditions);
        }
        
        // Ressources consommées
        if (mecaniques.cout) {
            this.addThemeBox(doc, 'conseil', `**Coût en ressources :** ${mecaniques.cout}`);
        }
    }
    
    /**
     * Génère les solutions possibles
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Array} solutions - Liste des solutions
     */
    renderDangerSolutions(doc, solutions) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'SOLUTIONS ET CONTRE-MESURES', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        for (const solution of solutions) {
            this.renderSolution(doc, solution);
        }
    }
    
    /**
     * Génère une solution spécifique
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object|string} solution - Données de la solution
     */
    renderSolution(doc, solution) {
        this.checkNewPage(doc, 50);
        
        if (typeof solution === 'string') {
            this.addThemeBox(doc, 'conseil', solution);
        } else {
            // Nom de la solution
            if (solution.nom || solution.name) {
                this.addThemeParagraph(doc, `**${(solution.nom || solution.name).toUpperCase()}**`, {
                    marginBottom: 5
                });
            }
            
            // Difficulté
            if (solution.difficulte) {
                this.addThemeParagraph(doc, `*Difficulté : ${solution.difficulte}*`, {
                    marginBottom: 5
                });
            }
            
            // Description
            if (solution.description) {
                this.addThemeParagraph(doc, solution.description, {
                    marginBottom: 8
                });
            }
            
            // Prérequis
            if (solution.prerequis && Array.isArray(solution.prerequis)) {
                this.addThemeParagraph(doc, '**Prérequis :**');
                this.addThemeList(doc, solution.prerequis);
            }
            
            // Conséquences de la résolution
            if (solution.consequences_resolution && Array.isArray(solution.consequences_resolution)) {
                this.addThemeParagraph(doc, '**Conséquences de la résolution :**');
                this.addThemeList(doc, solution.consequences_resolution);
            }
            
            // Risques d'échec
            if (solution.risques_echec) {
                this.addThemeBox(doc, 'attention', `**En cas d'échec :** ${solution.risques_echec}`);
            }
        }
    }
    
    /**
     * Génère le compteur de danger (horloge Mist Engine)
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} compteur - Données du compteur
     */
    renderDangerClock(doc, compteur) {
        this.checkNewPage(doc, 80);
        
        this.addThemeTitle(doc, 'COMPTEUR DE DANGER', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        // Configuration du compteur
        const maxSections = compteur.max || compteur.sections || 8;
        const currentProgress = compteur.actuel || compteur.current || 0;
        
        this.addThemeParagraph(doc, `**Progression actuelle :** ${currentProgress}/${maxSections}`, {
            marginBottom: 10
        });
        
        // Représentation visuelle du compteur (cercle ASCII)
        this.renderClockVisual(doc, currentProgress, maxSections);
        
        // Déclencheurs par section
        if (compteur.declencheurs && Array.isArray(compteur.declencheurs)) {
            this.addThemeParagraph(doc, '**Déclencheurs par section :**', {
                marginTop: 15,
                marginBottom: 10
            });
            
            for (let i = 0; i < compteur.declencheurs.length; i++) {
                const declencheur = compteur.declencheurs[i];
                this.addThemeParagraph(doc, `**${i + 1}.** ${declencheur}`, {
                    marginBottom: 5
                });
            }
        }
        
        // Conditions de progression
        if (compteur.conditions_progression && Array.isArray(compteur.conditions_progression)) {
            this.addThemeParagraph(doc, '**Le compteur avance quand :**', {
                marginTop: 10,
                marginBottom: 5
            });
            this.addThemeList(doc, compteur.conditions_progression);
        }
    }
    
    /**
     * Génère une représentation visuelle du compteur
     * @param {PDFDocument} doc - Document PDFKit
     * @param {number} current - Progression actuelle
     * @param {number} max - Maximum du compteur
     */
    renderClockVisual(doc, current, max) {
        // Simple représentation textuelle
        let clockDisplay = '┌─ COMPTEUR DE DANGER ─┐\n│       ';
        
        // Afficher les segments remplis et vides
        for (let i = 0; i < max; i++) {
            if (i < current) {
                clockDisplay += '█ ';
            } else {
                clockDisplay += '░ ';
            }
        }
        
        clockDisplay += '     │\n└──────────────────────┘';
        
        // Police monospace
        doc.font('Courier').fontSize(10);
        this.addParagraph(doc, clockDisplay, {
            align: 'center',
            marginBottom: 10
        });
        
        // Revenir au thème normal
        this.theme.applyFont(doc, 'body');
    }
    
    /**
     * Génère les événements déclencheurs
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Array} declencheurs - Liste des déclencheurs
     */
    renderDangerTriggers(doc, declencheurs) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'ÉVÉNEMENTS DÉCLENCHEURS', 2, {
            marginTop: 25,
            marginBottom: 15,
            addToToc: true
        });
        
        for (const declencheur of declencheurs) {
            this.renderTrigger(doc, declencheur);
        }
    }
    
    /**
     * Génère un déclencheur spécifique
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object|string} declencheur - Données du déclencheur
     */
    renderTrigger(doc, declencheur) {
        if (typeof declencheur === 'string') {
            this.addThemeParagraph(doc, `• ${declencheur}`, {
                marginBottom: 8
            });
        } else {
            // Nom du déclencheur
            if (declencheur.nom || declencheur.name) {
                this.addThemeParagraph(doc, `**${(declencheur.nom || declencheur.name).toUpperCase()}**`, {
                    marginBottom: 5
                });
            }
            
            // Condition
            if (declencheur.condition) {
                this.addThemeParagraph(doc, `*Condition : ${declencheur.condition}*`, {
                    marginBottom: 5
                });
            }
            
            // Effet
            if (declencheur.effet) {
                this.addThemeParagraph(doc, `**Effet :** ${declencheur.effet}`, {
                    marginBottom: 10
                });
            }
            
            // Probabilité
            if (declencheur.probabilite) {
                this.addThemeParagraph(doc, `*Probabilité : ${declencheur.probabilite}*`, {
                    marginBottom: 10
                });
            }
        }
    }
    
    /**
     * Génère les notes pour le MJ
     * @param {PDFDocument} doc - Document PDFKit
     * @param {string|Object} notes - Notes du MJ
     */
    renderGMNotes(doc, notes) {
        this.checkNewPage(doc, 80);
        
        this.addThemeTitle(doc, 'NOTES POUR LE MJ', 2, {
            marginTop: 25,
            marginBottom: 15
        });
        
        if (typeof notes === 'string') {
            this.addThemeBox(doc, 'conseil', notes);
        } else {
            if (notes.conseils && Array.isArray(notes.conseils)) {
                this.addThemeParagraph(doc, '**Conseils de gestion :**');
                this.addThemeList(doc, notes.conseils);
            }
            
            if (notes.timing) {
                this.addThemeBox(doc, 'conseil', `**Timing suggéré :** ${notes.timing}`);
            }
            
            if (notes.variations && Array.isArray(notes.variations)) {
                this.addThemeParagraph(doc, '**Variations possibles :**');
                this.addThemeList(doc, notes.variations);
            }
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
            console.log('📋 Document de danger long détecté, ajout de la page de garde et TOC');
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

module.exports = DangerDocument;