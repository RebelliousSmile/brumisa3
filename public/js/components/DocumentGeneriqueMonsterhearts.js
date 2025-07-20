/**
 * Composant Alpine.js pour la création de documents génériques Monsterhearts
 */
window.AlpineComponents = window.AlpineComponents || {};

window.AlpineComponents.documentGeneriqueMonsterhearts = function() {
    return {
        // État du formulaire
        formData: {
            titre: '',
            introduction: '',
            typeDocument: 'AIDE DE JEU',
            numeroPage: 1,
            piedDePage: 'Monsterhearts • Document • brumisa3.fr',
            sections: []
        },
        
        // État UI
        enTraitement: false,
        
        // Droits utilisateur (sera initialisé via Alpine.store)
        get estPremium() {
            const utilisateur = Alpine.store('app')?.utilisateur;
            return utilisateur && (
                utilisateur.type_compte === 'PREMIUM' || 
                utilisateur.role === 'ADMIN' || 
                utilisateur.role === 'MODERATEUR'
            );
        },
        
        // ID unique pour les sections
        sectionIdCounter: 0,
        
        // Initialisation
        init() {
            // Ajouter une première section par défaut
            this.ajouterSection();
        },
        
        // Vérifie si le formulaire peut être soumis
        get peutGenerer() {
            return this.formData.titre.trim() !== '' && 
                   this.formData.sections.length > 0 &&
                   this.formData.sections.every(s => s.titre.trim() !== '');
        },
        
        // Ajouter une nouvelle section
        ajouterSection() {
            this.formData.sections.push({
                id: ++this.sectionIdCounter,
                niveau: '1',
                titre: '',
                contenu: ''
            });
        },
        
        // Supprimer une section
        supprimerSection(index) {
            if (this.formData.sections.length > 1 || confirm('Voulez-vous vraiment supprimer la dernière section ?')) {
                this.formData.sections.splice(index, 1);
            }
        },
        
        // Convertir le markdown en HTML simple
        renderMarkdown(text) {
            if (!text) return '';
            
            let html = text;
            
            // Échapper les caractères HTML
            html = html.replace(/&/g, '&amp;')
                      .replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;');
            
            // Gras
            html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            
            // Italique
            html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
            
            // Listes à puces
            html = html.replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>');
            html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
            
            // Listes numérotées
            html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
            
            // Citations
            html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
            
            // Paragraphes
            html = html.split('\n\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('');
            
            return html;
        },
        
        // Transformer les données pour l'API
        prepareDataForApi() {
            const sections = this.formData.sections.map(section => {
                const contenus = [];
                
                // Parser le contenu markdown (si il y en a)
                if (!section.contenu || section.contenu.trim() === '') {
                    // Section sans contenu (titre seul)
                    return {
                        niveau: parseInt(section.niveau),
                        titre: section.titre,
                        contenus: []
                    };
                }
                
                const lignes = section.contenu.split('\n');
                let contenuActuel = [];
                let typeCourant = 'paragraphe';
                
                lignes.forEach(ligne => {
                    // Listes à puces
                    if (ligne.match(/^[\*\-]\s+/)) {
                        if (typeCourant !== 'liste') {
                            if (contenuActuel.length > 0) {
                                contenus.push({
                                    type: typeCourant,
                                    texte: contenuActuel.join('\n')
                                });
                            }
                            contenuActuel = [];
                            typeCourant = 'liste';
                        }
                        contenuActuel.push(ligne.replace(/^[\*\-]\s+/, ''));
                    }
                    // Listes numérotées
                    else if (ligne.match(/^\d+\.\s+/)) {
                        if (typeCourant !== 'liste-numerotee') {
                            if (contenuActuel.length > 0) {
                                contenus.push({
                                    type: typeCourant,
                                    texte: typeCourant === 'liste' ? undefined : contenuActuel.join('\n'),
                                    items: typeCourant === 'liste' ? contenuActuel : undefined
                                });
                            }
                            contenuActuel = [];
                            typeCourant = 'liste-numerotee';
                        }
                        contenuActuel.push(ligne.replace(/^\d+\.\s+/, ''));
                    }
                    // Citations
                    else if (ligne.match(/^>\s+/)) {
                        if (contenuActuel.length > 0) {
                            contenus.push({
                                type: typeCourant,
                                texte: typeCourant === 'liste' ? undefined : contenuActuel.join('\n'),
                                items: typeCourant.includes('liste') ? contenuActuel : undefined
                            });
                        }
                        contenus.push({
                            type: 'citation',
                            texte: ligne.replace(/^>\s+/, '')
                        });
                        contenuActuel = [];
                        typeCourant = 'paragraphe';
                    }
                    // Paragraphes
                    else {
                        if (typeCourant.includes('liste')) {
                            if (contenuActuel.length > 0) {
                                contenus.push({
                                    type: typeCourant,
                                    items: contenuActuel
                                });
                            }
                            contenuActuel = [];
                            typeCourant = 'paragraphe';
                        }
                        if (ligne.trim()) {
                            contenuActuel.push(ligne);
                        } else if (contenuActuel.length > 0) {
                            contenus.push({
                                type: 'paragraphe',
                                texte: contenuActuel.join(' ')
                            });
                            contenuActuel = [];
                        }
                    }
                });
                
                // Ajouter le dernier contenu
                if (contenuActuel.length > 0) {
                    if (typeCourant.includes('liste')) {
                        contenus.push({
                            type: typeCourant,
                            items: contenuActuel
                        });
                    } else {
                        contenus.push({
                            type: 'paragraphe',
                            texte: contenuActuel.join(' ')
                        });
                    }
                }
                
                return {
                    niveau: parseInt(section.niveau),
                    titre: section.titre,
                    contenus: contenus
                };
            });
            
            const donnees = {
                titre: this.formData.titre,
                introduction: this.formData.introduction,
                chapitre: this.formData.typeDocument.toUpperCase(),
                pageNumber: this.formData.numeroPage,
                sections: sections
            };
            
            // Ajouter le pied de page seulement si l'utilisateur est premium
            if (this.estPremium && this.formData.piedDePage) {
                donnees.piedDePage = this.formData.piedDePage;
            }
            
            return donnees;
        },
        
        // Générer le PDF
        async genererPdf() {
            if (!this.peutGenerer || this.enTraitement) return;
            
            this.enTraitement = true;
            
            try {
                const donnees = this.prepareDataForApi();
                
                const response = await Alpine.store('app').requeteApi('/pdfs/document-generique/monsterhearts', {
                    method: 'POST',
                    body: JSON.stringify(donnees)
                });
                
                if (response.succes && response.donnees) {
                    const pdfId = response.donnees.id;
                    
                    Alpine.store('app').ajouterMessage('Génération PDF démarrée...', 'info');
                    
                    // Attendre la fin de génération et télécharger
                    this.attendreGenerationEtTelecharger(pdfId);
                    
                } else {
                    throw new Error(response.message || 'Erreur lors de la génération');
                }
            } catch (error) {
                console.error('Erreur génération PDF:', error);
                Alpine.store('app').ajouterMessage(
                    'Erreur lors de la génération du PDF : ' + error.message,
                    'erreur'
                );
                this.enTraitement = false;
            }
        },

        // Attendre la génération et télécharger le PDF
        async attendreGenerationEtTelecharger(pdfId) {
            const checkInterval = 2000; // 2 secondes
            const maxAttempts = 30; // 1 minute max
            let attempts = 0;
            
            const checkStatus = async () => {
                try {
                    const response = await Alpine.store('app').requeteApi(`/pdfs/${pdfId}/statut`);
                    
                    if (response.succes && response.donnees) {
                        const statut = response.donnees.statut;
                        const progression = response.donnees.progression || 0;
                        
                        if (statut === 'TERMINE') {
                            // Télécharger le PDF
                            window.open(`/api/pdfs/${pdfId}/telecharger`, '_blank');
                            
                            Alpine.store('app').ajouterMessage('PDF généré avec succès !', 'succes');
                            
                            // Optionnel : réinitialiser le formulaire
                            if (confirm('PDF généré ! Voulez-vous créer un nouveau document ?')) {
                                this.reinitialiser();
                            }
                            
                            this.enTraitement = false;
                            return;
                            
                        } else if (statut === 'ERREUR') {
                            throw new Error(response.donnees.erreur_message || 'Erreur lors de la génération');
                            
                        } else if (statut === 'EN_TRAITEMENT') {
                            Alpine.store('app').ajouterMessage(`Génération en cours (${progression}%)...`, 'info');
                            
                            // Continuer à vérifier
                            attempts++;
                            if (attempts < maxAttempts) {
                                setTimeout(checkStatus, checkInterval);
                            } else {
                                throw new Error('Timeout lors de la génération');
                            }
                        } else {
                            // EN_ATTENTE, continuer à vérifier
                            attempts++;
                            if (attempts < maxAttempts) {
                                setTimeout(checkStatus, checkInterval);
                            } else {
                                throw new Error('Timeout lors de la génération');
                            }
                        }
                    }
                } catch (error) {
                    console.error('Erreur vérification statut PDF:', error);
                    Alpine.store('app').ajouterMessage(
                        'Erreur lors de la génération : ' + error.message,
                        'erreur'
                    );
                    this.enTraitement = false;
                }
            };
            
            // Démarrer la vérification
            setTimeout(checkStatus, checkInterval);
        },
        
        // Réinitialiser le formulaire
        reinitialiser() {
            if (confirm('Êtes-vous sûr de vouloir réinitialiser le formulaire ?')) {
                this.formData = {
                    titre: '',
                    introduction: '',
                    typeDocument: 'AIDE DE JEU',
                    numeroPage: 1,
                    piedDePage: 'Monsterhearts • Document • brumisa3.fr',
                    sections: []
                };
                this.sectionIdCounter = 0;
                this.ajouterSection();
            }
        },
        
        // Charger un exemple prédéfini
        chargerExemple(type) {
            const exemples = {
                'plan-classe': {
                    titre: 'Instructions pour le Plan de Classe',
                    introduction: 'Le plan de classe est un outil visuel pour la MC permettant de suivre les relations sociales et la dynamique de groupe dans le lycée.',
                    typeDocument: 'PLAN DE CLASSE',
                    sections: [
                        {
                            niveau: '1',
                            titre: 'Comment remplir le plan',
                            contenu: 'Le plan de classe vous permet de visualiser rapidement les dynamiques sociales.\n\nVoici les étapes essentielles pour bien l\'utiliser.'
                        },
                        {
                            niveau: '2',
                            titre: 'Placer les personnages joueurs',
                            contenu: '* Commencez toujours par placer les PJ en premier\n* Notez leur nom, leur mue, et une note courte\n* Leur placement initial peut refléter leurs relations'
                        },
                        {
                            niveau: '2',
                            titre: 'Ajouter les PNJ importants',
                            contenu: 'Placez les PNJ selon leur importance dans l\'histoire :\n\n1. Les crushes et intérêts romantiques\n2. Les rivaux et ennemis\n3. Les figures d\'autorité\n4. Les alliés potentiels'
                        }
                    ]
                },
                'aide-mc': {
                    titre: 'Aide-Mémoire pour la MC',
                    introduction: 'Les principes essentiels pour mener une partie de Monsterhearts mémorable.',
                    typeDocument: 'AIDE MC',
                    sections: [
                        {
                            niveau: '1',
                            titre: 'Principes de la MC',
                            contenu: '* Rendre la vie des personnages intéressante\n* Dire ce que les règles exigent\n* Dire ce que l\'honnêteté exige\n* Être fan des personnages'
                        },
                        {
                            niveau: '1',
                            titre: 'Actions de la MC',
                            contenu: '> Quand les joueurs vous regardent pour savoir ce qui se passe, faites une action de MC.\n\n- Séparer les personnages\n- Mettre quelqu\'un dans une situation délicate\n- Révéler une vérité désagréable'
                        }
                    ]
                },
                'regles-maison': {
                    titre: 'Règles Maison - Notre Table',
                    introduction: 'Ces règles s\'ajoutent ou modifient les règles de base pour mieux correspondre au style de notre table.',
                    typeDocument: 'RÈGLES MAISON',
                    sections: [
                        {
                            niveau: '1',
                            titre: 'Sécurité émotionnelle',
                            contenu: 'Nous utilisons les outils suivants :\n\n* Carte X pour arrêter une scène\n* Lignes et voiles définis en début de partie\n* Check-in réguliers entre les scènes intenses'
                        },
                        {
                            niveau: '1',
                            titre: 'Modifications des règles',
                            contenu: '**Cordes** : Maximum 5 sur un même personnage\n\n**Conditions** : On peut en avoir maximum 4 en même temps\n\n**Expérience** : +1 XP pour excellente interprétation dramatique'
                        }
                    ]
                }
            };
            
            const exemple = exemples[type];
            if (exemple) {
                // Réinitialiser d'abord
                this.formData = {
                    ...exemple,
                    numeroPage: 1,
                    piedDePage: 'Monsterhearts • Document • brumisa3.fr',
                    sections: []
                };
                
                // Ajouter les sections avec des IDs
                exemple.sections.forEach(section => {
                    this.formData.sections.push({
                        ...section,
                        id: ++this.sectionIdCounter
                    });
                });
                
                Alpine.store('app').ajouterMessage('Exemple chargé !', 'succes');
            }
        }
    };
};