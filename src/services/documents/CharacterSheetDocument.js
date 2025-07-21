const BasePdfKitService = require('../BasePdfKitService');
const SystemTheme = require('../themes/SystemTheme');
const { SystemeUtils } = require('../../utils/systemesJeu');
const fs = require('fs');

/**
 * Document Feuille de Personnage - Layout de formulaire pour personnages
 * Structure spécialisée avec champs, statistiques et sections de personnage
 * 
 * Usage :
 * - Feuilles de personnage Monsterhearts
 * - Fiches de personnage d'autres systèmes
 * - Documents avec layout de formulaire et champs à remplir
 */
class CharacterSheetDocument extends BasePdfKitService {
    
    /**
     * @param {SystemTheme} theme - Thème du système de jeu (obligatoire)
     */
    constructor(theme) {
        super();
        
        if (!theme || !(theme instanceof SystemTheme)) {
            throw new Error('CharacterSheetDocument nécessite un SystemTheme valide');
        }
        
        this.theme = theme;
        this.documentType = 'character-sheet';
    }
    
    /**
     * Génère un document PDF de feuille de personnage
     * @param {Object} data - Données du personnage
     * @param {string} filePath - Chemin de sortie du PDF
     * @returns {Promise} Promise de génération
     */
    async generateDocument(data, filePath) {
        return new Promise((resolve, reject) => {
            try {
                // Valider les données
                this.validateCharacterData(data);
                
                // Configurer les textes du document
                this.setupDocumentTexts(data);
                
                // Créer le document avec la configuration de base
                const doc = this.createDocument({
                    chapterTitle: this.chapterTitle
                });
                
                const stream = doc.pipe(fs.createWriteStream(filePath));
                
                // Configurer le thème
                this.setupTheme(doc);
                
                // Générer le contenu de la feuille
                this.renderCharacterSheet(doc, data);
                
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
     * Valide les données du personnage
     * @param {Object} data - Données à valider
     */
    validateCharacterData(data) {
        if (!data.characterName && !data.nom) {
            console.warn('⚠️ Aucun nom de personnage fourni');
        }
        
        // Sections recommandées pour une feuille de personnage
        const recommendedSections = ['stats', 'moves', 'equipment'];
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
     * Génère le contenu de la feuille de personnage
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} data - Données du personnage
     */
    renderCharacterSheet(doc, data) {
        // En-tête du personnage
        this.renderCharacterHeader(doc, data);
        
        // Informations de base
        this.renderBasicInfo(doc, data);
        
        // Statistiques
        if (data.stats) {
            this.renderCharacterStats(doc, data.stats);
        }
        
        // Capacités/Mouvements
        if (data.moves) {
            this.renderCharacterMoves(doc, data.moves);
        }
        
        // Équipement
        if (data.equipment) {
            this.renderEquipment(doc, data.equipment);
        }
        
        // Background/Histoire
        if (data.background) {
            this.renderBackground(doc, data.background);
        }
        
        // Relations
        if (data.relationships) {
            this.renderRelationships(doc, data.relationships);
        }
        
        // Notes de jeu
        if (data.notes) {
            this.renderGameNotes(doc, data.notes);
        }
    }
    
    /**
     * Génère l'en-tête du personnage
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} data - Données du personnage
     */
    renderCharacterHeader(doc, data) {
        const characterName = data.characterName || data.nom || 'PERSONNAGE SANS NOM';
        
        // Nom du personnage
        this.addThemeTitle(doc, characterName.toUpperCase(), 1, {
            marginBottom: 10
        });
        
        // Classe/Type du personnage
        if (data.className || data.classe) {
            const className = data.className || data.classe;
            this.addThemeTitle(doc, `LA ${className.toUpperCase()}`, 3, {
                marginBottom: 15
            });
        }
        
        // Citation du personnage
        if (data.quote || data.citation) {
            const quote = data.quote || data.citation;
            this.addThemeParagraph(doc, `"${quote}"`, {
                isIntro: true,
                marginBottom: 20
            });
        }
    }
    
    /**
     * Génère les informations de base
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} data - Données du personnage
     */
    renderBasicInfo(doc, data) {
        this.addThemeTitle(doc, 'INFORMATIONS', 2, {
            marginTop: 20,
            marginBottom: 15
        });
        
        const infoFields = [];
        
        // Âge
        if (data.age) {
            infoFields.push(`**Âge :** ${data.age} ans`);
        }
        
        // Origine
        if (data.origin || data.origine) {
            infoFields.push(`**Origine :** ${data.origin || data.origine}`);
        }
        
        // Apparence
        if (data.appearance || data.apparence) {
            infoFields.push(`**Apparence :** ${data.appearance || data.apparence}`);
        }
        
        // Joueur
        if (data.playerName || data.joueur) {
            infoFields.push(`**Joueur :** ${data.playerName || data.joueur}`);
        }
        
        // Afficher les champs
        for (const field of infoFields) {
            this.addThemeParagraph(doc, field, { marginBottom: 5 });
        }
    }
    
    /**
     * Génère les statistiques du personnage
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} stats - Statistiques
     */
    renderCharacterStats(doc, stats) {
        this.checkNewPage(doc, 120);
        
        this.addThemeTitle(doc, 'STATISTIQUES', 2, {
            addToToc: true,
            marginTop: 25,
            marginBottom: 15
        });
        
        // Attributs principaux
        if (stats.attributes) {
            this.renderAttributes(doc, stats.attributes);
        }
        
        // Points de vie/Santé
        if (stats.health !== undefined) {
            this.addThemeParagraph(doc, `**Points de vie :** ${stats.health}`);
        }
        
        // Conditions/États
        if (stats.conditions && Array.isArray(stats.conditions)) {
            this.addThemeParagraph(doc, '**Conditions actuelles :**');
            this.addThemeList(doc, stats.conditions);
        }
        
        // XP/Expérience
        if (stats.experience !== undefined) {
            this.addThemeParagraph(doc, `**Expérience :** ${stats.experience} XP`);
        }
    }
    
    /**
     * Génère les attributs du personnage
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} attributes - Attributs
     */
    renderAttributes(doc, attributes) {
        this.addThemeParagraph(doc, '**Attributs :**');
        
        // Format des attributs selon le système
        const attributeList = [];
        
        // Monsterhearts style
        if (attributes.hot !== undefined) {
            attributeList.push(`Hot : ${attributes.hot >= 0 ? '+' : ''}${attributes.hot}`);
        }
        if (attributes.cold !== undefined) {
            attributeList.push(`Cold : ${attributes.cold >= 0 ? '+' : ''}${attributes.cold}`);
        }
        if (attributes.volatile !== undefined) {
            attributeList.push(`Volatile : ${attributes.volatile >= 0 ? '+' : ''}${attributes.volatile}`);
        }
        if (attributes.dark !== undefined) {
            attributeList.push(`Dark : ${attributes.dark >= 0 ? '+' : ''}${attributes.dark}`);
        }
        
        // Autres systèmes - format générique
        for (const [key, value] of Object.entries(attributes)) {
            if (!['hot', 'cold', 'volatile', 'dark'].includes(key)) {
                const displayName = key.charAt(0).toUpperCase() + key.slice(1);
                attributeList.push(`${displayName} : ${value >= 0 ? '+' : ''}${value}`);
            }
        }
        
        if (attributeList.length > 0) {
            this.addThemeList(doc, attributeList);
        }
    }
    
    /**
     * Génère les capacités du personnage
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} moves - Capacités
     */
    renderCharacterMoves(doc, moves) {
        this.checkNewPage(doc, 150);
        
        this.addThemeTitle(doc, 'CAPACITÉS', 2, {
            addToToc: true,
            marginTop: 25,
            marginBottom: 15
        });
        
        // Capacités de classe
        if (moves.class && Array.isArray(moves.class)) {
            this.addThemeTitle(doc, 'Capacités de classe', 3, {
                marginBottom: 10
            });
            
            for (const move of moves.class) {
                this.renderMove(doc, move);
            }
        }
        
        // Capacités acquises
        if (moves.learned && Array.isArray(moves.learned)) {
            this.addThemeTitle(doc, 'Capacités acquises', 3, {
                marginTop: 15,
                marginBottom: 10
            });
            
            for (const move of moves.learned) {
                this.renderMove(doc, move);
            }
        }
        
        // Capacités spéciales
        if (moves.special && Array.isArray(moves.special)) {
            this.addThemeTitle(doc, 'Capacités spéciales', 3, {
                marginTop: 15,
                marginBottom: 10
            });
            
            for (const move of moves.special) {
                this.renderMove(doc, move);
            }
        }
    }
    
    /**
     * Génère une capacité individuelle
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} move - Données de la capacité
     */
    renderMove(doc, move) {
        this.checkNewPage(doc, 60);
        
        // Nom de la capacité
        if (move.name || move.nom) {
            const moveName = (move.name || move.nom).toUpperCase();
            this.addThemeParagraph(doc, `**${moveName}**`, { marginBottom: 5 });
        }
        
        // Description
        if (move.description) {
            this.addThemeParagraph(doc, move.description, { marginBottom: 10 });
        }
    }

    /**
     * Génère la grille des stats Monsterhearts
     * @param {PDFDocument} doc - Document PDFKit  
     * @param {Object} stats - Statistiques du personnage
     * @param {Object} systemData - Données du système
     */
    renderMonsterheartsStats(doc, stats, systemData) {
        this.checkNewPage(doc, 120);
        
        this.addThemeTitle(doc, 'CARACTÉRISTIQUES', 2, {
            addToToc: true,
            marginTop: 25,
            marginBottom: 15
        });

        const startY = doc.y;
        const attributs = systemData.attributs;
        const statNames = Object.keys(attributs);
        const boxSize = 50;
        const gap = 80;
        
        // Calculer position de départ pour centrer
        const totalWidth = (statNames.length * boxSize) + ((statNames.length - 1) * gap);
        const startX = (this.pageWidth - this.marginLeft - this.marginRight - totalWidth) / 2 + this.marginLeft;
        
        statNames.forEach((statCode, index) => {
            const attribut = attributs[statCode];
            const statValue = stats[statCode] || 0;
            const x = startX + (index * (boxSize + gap));
            
            // Label de la stat
            doc.font('Helvetica-Bold')
               .fontSize(10)
               .fillColor(this.theme.couleurPrimaire || '#000000')
               .text(attribut.nom.toUpperCase(), x, startY, {
                   width: boxSize,
                   align: 'center'
               });
            
            // Box de la valeur
            doc.rect(x, startY + 15, boxSize, boxSize)
               .strokeColor(this.theme.couleurPrimaire || '#000000')
               .lineWidth(2)
               .stroke();
            
            // Valeur de la stat
            const displayValue = statValue >= 0 ? `+${statValue}` : `${statValue}`;
            doc.font('Helvetica-Bold')
               .fontSize(16)
               .fillColor(this.theme.couleurPrimaire || '#000000')
               .text(displayValue, x, startY + 30, {
                   width: boxSize,
                   align: 'center'
               });
        });
        
        doc.y = startY + boxSize + 30;
    }

    /**
     * Génère les moves selon le skin sélectionné
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} moves - Moves du personnage  
     * @param {string} skinType - Type de skin
     * @param {Object} systemData - Données du système
     */
    renderSkinMoves(doc, moves, skinType, systemData) {
        this.checkNewPage(doc, 200);
        
        // Actions de base
        this.addThemeTitle(doc, 'ACTIONS DE BASE', 2, {
            addToToc: true,
            marginTop: 25,
            marginBottom: 15
        });
        
        if (moves.basic && systemData.moves.basic) {
            const startY = doc.y;
            this.renderMovesList(doc, moves.basic, systemData.moves.basic, startY);
        }
        
        // Actions de skin
        this.addThemeTitle(doc, 'ACTIONS DE MUE', 2, {
            marginTop: 25,
            marginBottom: 15
        });
        
        if (moves.skin && moves.skin.length > 0) {
            const startY = doc.y;
            this.renderMovesList(doc, moves.skin, [], startY, true);
        } else {
            this.addThemeParagraph(doc, `Aucune action spécifique pour la skin "${skinType}"`);
        }
    }

    /**
     * Génère une liste de moves avec checkboxes
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Array} playerMoves - Moves du joueur
     * @param {Array} availableMoves - Moves disponibles
     * @param {number} startY - Position Y de départ
     * @param {boolean} isSkinSpecific - Si ce sont des moves de skin
     */
    renderMovesList(doc, playerMoves, availableMoves = [], startY, isSkinSpecific = false) {
        const movesToRender = availableMoves.length > 0 ? availableMoves : playerMoves;
        const boxSize = 15;
        const gap = 10;
        
        movesToRender.forEach((move, index) => {
            this.checkNewPage(doc, 30);
            const y = doc.y;
            const x = this.marginLeft;
            
            // Checkbox
            doc.rect(x, y + 2, boxSize, boxSize)
               .strokeColor('#666666')
               .lineWidth(1)
               .stroke();
            
            // Si coché, ajouter la coche
            const isChecked = playerMoves.some(pm => 
                pm.code === move.code || pm.nom === move.nom || pm.checked
            );
            
            if (isChecked || move.checked) {
                doc.fillColor(this.theme.couleurPrimaire || '#000000')
                   .rect(x + 2, y + 4, boxSize - 4, boxSize - 6)
                   .fill();
                
                doc.fillColor('#FFFFFF')
                   .font('Helvetica-Bold')
                   .fontSize(10)
                   .text('✓', x + 4, y + 3);
            }
            
            // Texte du move
            const moveText = move.description || `**${move.nom}**: ${move.description || ''}`;
            const textX = x + boxSize + gap;
            const maxWidth = this.pageWidth - this.marginRight - textX;
            
            doc.fillColor('#000000')
               .font('Helvetica')
               .fontSize(11)
               .text(moveText, textX, y, {
                   width: maxWidth,
                   lineGap: 3
               });
            
            doc.y += 25;
        });
    }

    /**
     * Génère les conditions Monsterhearts
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Array} conditions - Conditions du personnage
     * @param {Object} systemData - Données du système
     */
    renderMonsterheartsConditions(doc, conditions, systemData) {
        this.checkNewPage(doc, 120);
        
        this.addThemeTitle(doc, 'CONDITIONS', 2, {
            addToToc: true,
            marginTop: 25,
            marginBottom: 15
        });
        
        const availableConditions = systemData.mechanics.conditions;
        const boxSize = 15;
        const gap = 10;
        const cols = 2;
        const colWidth = (this.pageWidth - this.marginLeft - this.marginRight - gap) / cols;
        
        availableConditions.forEach((condition, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = this.marginLeft + (col * (colWidth + gap));
            const y = doc.y + (row * 25);
            
            if (col === 0 && row > 0) {
                this.checkNewPage(doc, 30);
            }
            
            // Checkbox
            doc.rect(x, y + 2, boxSize, boxSize)
               .strokeColor('#666666')
               .lineWidth(1)
               .stroke();
            
            // Vérifier si la condition est active
            const isActive = conditions.some(c => 
                c.code === condition.code || c.name === condition.nom || c.active
            );
            
            if (isActive) {
                doc.fillColor(this.theme.couleurPrimaire || '#000000')
                   .rect(x + 2, y + 4, boxSize - 4, boxSize - 6)
                   .fill();
                
                doc.fillColor('#FFFFFF')
                   .font('Helvetica-Bold')
                   .fontSize(10)
                   .text('✓', x + 4, y + 3);
            }
            
            // Nom de la condition
            doc.fillColor('#000000')
               .font('Helvetica')
               .fontSize(11)
               .text(condition.nom, x + boxSize + gap, y + 2);
        });
        
        const rows = Math.ceil(availableConditions.length / cols);
        doc.y += rows * 25 + 10;
    }

    /**
     * Génère la section Strings/Ascendants
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Array} strings - Strings du personnage
     * @param {Object} systemData - Données du système
     */
    renderStrings(doc, strings, systemData) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'ASCENDANTS', 2, {
            addToToc: true,
            marginTop: 25,
            marginBottom: 15
        });
        
        this.addThemeParagraph(doc, 'Liens émotionnels avec les autres personnages :', {
            marginBottom: 10
        });
        
        const maxStrings = systemData.mechanics.strings.max;
        const stringsToShow = Math.max(strings.length, maxStrings);
        
        for (let i = 0; i < stringsToShow; i++) {
            this.checkNewPage(doc, 25);
            const string = strings[i] || { character: '', value: 0 };
            const y = doc.y;
            
            // Ligne pour le nom du personnage
            const nameWidth = 200;
            const valueWidth = 50;
            const gap = 20;
            
            doc.strokeColor('#666666')
               .lineWidth(1)
               .moveTo(this.marginLeft, y + 15)
               .lineTo(this.marginLeft + nameWidth, y + 15)
               .stroke();
            
            // Box pour la valeur
            const valueX = this.marginLeft + nameWidth + gap;
            doc.rect(valueX, y, valueWidth, 20)
               .strokeColor(this.theme.couleurPrimaire || '#000000')
               .lineWidth(1)
               .stroke();
            
            // Valeurs si disponibles
            if (string.character) {
                doc.fillColor('#000000')
                   .font('Helvetica')
                   .fontSize(11)
                   .text(string.character, this.marginLeft, y + 2);
            }
            
            if (string.value) {
                doc.fillColor(this.theme.couleurPrimaire || '#000000')
                   .font('Helvetica-Bold')
                   .fontSize(12)
                   .text(string.value.toString(), valueX, y + 4, {
                       width: valueWidth,
                       align: 'center'
                   });
            }
            
            doc.y += 30;
        }
    }

    /**
     * Génère la section Harm track  
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Array} harm - Harm du personnage
     * @param {Object} systemData - Données du système
     */
    renderHarmTrack(doc, harm, systemData) {
        this.checkNewPage(doc, 60);
        
        this.addThemeTitle(doc, 'DÉGÂTS', 2, {
            addToToc: true,
            marginTop: 25,
            marginBottom: 15
        });
        
        const maxHarm = systemData.mechanics.harm.max;
        const boxSize = 25;
        const gap = 5;
        const startX = this.marginLeft;
        const y = doc.y;
        
        // Dessiner les boxes de harm
        for (let i = 0; i < maxHarm; i++) {
            const x = startX + (i * (boxSize + gap));
            const isFilled = i < harm.length && harm[i];
            
            doc.rect(x, y, boxSize, boxSize)
               .strokeColor(this.theme.couleurPrimaire || '#000000')
               .lineWidth(2)
               .stroke();
            
            if (isFilled) {
                doc.fillColor(this.theme.couleurPrimaire || '#000000')
                   .rect(x + 2, y + 2, boxSize - 4, boxSize - 4)
                   .fill();
                
                doc.fillColor('#FFFFFF')
                   .font('Helvetica-Bold')
                   .fontSize(14)
                   .text('✗', x + 6, y + 5);
            }
        }
        
        doc.y = y + boxSize + 20;
        
        // Labels des niveaux de harm
        const harmLevels = systemData.mechanics.harm.levels;
        doc.fillColor('#666666')
           .font('Helvetica')
           .fontSize(9);
        
        harmLevels.forEach((level, index) => {
            const x = startX + (index * (boxSize + gap));
            doc.text(level, x, doc.y, {
                width: boxSize,
                align: 'center'
            });
        });
        
        doc.y += 20;
    }

    /**
     * Configure le document selon le système
     * @param {PDFDocument} doc - Document PDFKit
     * @param {string} systemCode - Code du système
     * @param {Object} data - Données du personnage
     */
    setupSystemSpecificLayout(doc, systemCode, data) {
        const systemData = SystemeUtils.getSysteme(systemCode);
        
        if (systemCode === 'monsterhearts') {
            this.setupMonsterheartsLayout(doc, systemData, data);
        }
        // Autres systèmes à ajouter ici
    }

    /**
     * Configure le layout spécifique à Monsterhearts
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} systemData - Données du système Monsterhearts
     * @param {Object} data - Données du personnage
     */
    setupMonsterheartsLayout(doc, systemData, data) {
        // Formater les données pour Monsterhearts si nécessaire
        if (data.systemCode === 'monsterhearts') {
            this.formattedData = SystemeUtils.formatForMonsterheartsTemplate(data);
        }
    }

    /**
     * Valide les données selon les contraintes du système
     * @param {string} systemCode - Code du système
     * @param {Object} data - Données à valider
     * @returns {Object} Résultat de validation
     */
    validateSystemData(systemCode, data) {
        if (data.stats && data.stats.attributes) {
            return SystemeUtils.validerAttributs(systemCode, data.stats.attributes);
        }
        return { valide: true, erreurs: [] };
    }
    
    /**
     * Génère l'équipement
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} equipment - Équipement
     */
    renderEquipment(doc, equipment) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'ÉQUIPEMENT', 2, {
            addToToc: true,
            marginTop: 25,
            marginBottom: 15
        });
        
        if (equipment.items && Array.isArray(equipment.items)) {
            this.addThemeList(doc, equipment.items);
        }
        
        if (equipment.weapons && Array.isArray(equipment.weapons)) {
            this.addThemeParagraph(doc, '**Armes :**');
            this.addThemeList(doc, equipment.weapons);
        }
        
        if (equipment.armor && Array.isArray(equipment.armor)) {
            this.addThemeParagraph(doc, '**Protection :**');
            this.addThemeList(doc, equipment.armor);
        }
    }
    
    /**
     * Génère le background/histoire
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} background - Background du personnage
     */
    renderBackground(doc, background) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'HISTOIRE', 2, {
            addToToc: true,
            marginTop: 25,
            marginBottom: 15
        });
        
        if (background.story || background.histoire) {
            this.addThemeParagraph(doc, background.story || background.histoire);
        }
        
        if (background.motivations && Array.isArray(background.motivations)) {
            this.addThemeParagraph(doc, '**Motivations :**');
            this.addThemeList(doc, background.motivations);
        }
        
        if (background.secrets && Array.isArray(background.secrets)) {
            this.addThemeBox(doc, 'attention', `**Secrets :** ${background.secrets.join(', ')}`);
        }
    }
    
    /**
     * Génère les relations
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} relationships - Relations
     */
    renderRelationships(doc, relationships) {
        this.checkNewPage(doc, 100);
        
        this.addThemeTitle(doc, 'RELATIONS', 2, {
            addToToc: true,
            marginTop: 25,
            marginBottom: 15
        });
        
        if (relationships.strings && Array.isArray(relationships.strings)) {
            this.addThemeParagraph(doc, 'Liens avec les autres personnages :');
            this.addThemeList(doc, relationships.strings);
        }
        
        if (relationships.npcs && Array.isArray(relationships.npcs)) {
            this.addThemeParagraph(doc, '**PNJs importants :**');
            this.addThemeList(doc, relationships.npcs);
        }
    }
    
    /**
     * Génère les notes de jeu
     * @param {PDFDocument} doc - Document PDFKit
     * @param {Object} notes - Notes
     */
    renderGameNotes(doc, notes) {
        this.checkNewPage(doc, 80);
        
        this.addThemeTitle(doc, 'NOTES DE JEU', 2, {
            marginTop: 25,
            marginBottom: 15
        });
        
        if (notes.player) {
            this.addThemeBox(doc, 'conseil', notes.player);
        }
        
        if (notes.gm) {
            this.addThemeBox(doc, 'attention', `**Notes MJ :** ${notes.gm}`);
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
        // Les feuilles de personnage sont généralement courtes
        if (this.shouldAddLongDocumentPages()) {
            console.log('📋 Feuille de personnage longue détectée');
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

module.exports = CharacterSheetDocument;