/**
 * Tests unitaires pour SystemService - User Stories US001, US016
 * US001 - Sélection du système de jeu
 * US016 - Gestion des systèmes de jeu (Admin)
 */

const SystemService = require('../../src/services/SystemService');

// Mock des utils/systemesJeu
jest.mock('../../src/utils/systemesJeu', () => ({
    monsterhearts: {
        nom: 'Monsterhearts',
        description: 'JDR sur les adolescents monstrueux',
        version: '2.0.0',
        actif: true,
        attributs: {
            hot: { min: -2, max: 4, defaut: 0 },
            cold: { min: -2, max: 4, defaut: 0 },
            volatile: { min: -2, max: 4, defaut: 0 },
            dark: { min: -2, max: 4, defaut: 0 }
        },
        competences: {
            seduction: { description: 'Charmer et séduire' },
            manipulation: { description: 'Manipuler les autres' }
        },
        infos_base: {
            apercu: 'Système narratif axé sur les relations',
            champs: { concept: 'text', origine: 'text' }
        },
        couleurs: { primaire: '#8B0000', secondaire: '#FF6B6B' },
        complexite: 'moyenne',
        tags: ['narratif', 'adolescent', 'horreur'],
        templates: ['fiche-personnage', 'carte-reference']
    },
    engrenages: {
        nom: 'Engrenages',
        description: 'JDR steampunk et mécanismes',
        version: '1.5.0',
        actif: true,
        attributs: {
            technique: { min: 0, max: 5, defaut: 1 },
            social: { min: 0, max: 5, defaut: 1 }
        },
        complexite: 'elevee',
        tags: ['steampunk', 'technique']
    },
    systeme_inactif: {
        nom: 'Système Inactif',
        actif: false,
        version: '0.9.0'
    }
}));

describe('SystemService - User Stories US001, US016', () => {
    let systemService;

    beforeEach(() => {
        jest.clearAllMocks();
        
        systemService = new SystemService();
        
        // Mock des méthodes de base de données
        systemService.obtenirStatistiquesSysteme = jest.fn();
        systemService.compterPersonnagesParSysteme = jest.fn();
        systemService.compterPdfsParSysteme = jest.fn();
        systemService.obtenirDerniereUtilisation = jest.fn();
        systemService.sauvegarderSysteme = jest.fn();
        systemService.supprimerSystemeEnBase = jest.fn();
        systemService.verifierExistenceTemplate = jest.fn();
    });

    describe('US001 - Sélection du système de jeu', () => {
        test('devrait lister tous les systèmes disponibles', async () => {
            // Arrange
            systemService.obtenirStatistiquesSysteme.mockResolvedValue({
                nb_personnages: 10,
                nb_pdfs_generes: 25,
                derniere_utilisation: new Date()
            });

            // Act
            const result = await systemService.listerSystemesDisponibles();

            // Assert
            expect(result).toHaveLength(3); // monsterhearts, engrenages, systeme_inactif
            
            const monsterhearts = result.find(s => s.id === 'monsterhearts');
            expect(monsterhearts).toEqual(
                expect.objectContaining({
                    id: 'monsterhearts',
                    nom: 'Monsterhearts',
                    description: 'JDR sur les adolescents monstrueux',
                    version: '2.0.0',
                    actif: true,
                    complexite: 'moyenne',
                    tags: ['narratif', 'adolescent', 'horreur'],
                    apercu: expect.objectContaining({
                        attributs: ['hot', 'cold', 'volatile'],
                        competences: ['seduction', 'manipulation']
                    })
                })
            );
        });

        test('devrait trier les systèmes avec les actifs en premier', async () => {
            // Arrange
            systemService.obtenirStatistiquesSysteme.mockResolvedValue({});

            // Act
            const result = await systemService.listerSystemesDisponibles();

            // Assert
            const actifsEnPremier = result.slice(0, 2).every(s => s.actif);
            const inactifsALaFin = result.slice(-1).every(s => !s.actif);
            
            expect(actifsEnPremier).toBe(true);
            expect(inactifsALaFin).toBe(true);
        });

        test('devrait filtrer par statut actif', async () => {
            // Arrange
            systemService.obtenirStatistiquesSysteme.mockResolvedValue({});

            // Act
            const result = await systemService.listerSystemesDisponibles({ actif: true });

            // Assert
            expect(result).toHaveLength(2); // Seulement monsterhearts et engrenages
            expect(result.every(s => s.actif)).toBe(true);
        });

        test('devrait filtrer par complexité', async () => {
            // Arrange
            systemService.obtenirStatistiquesSysteme.mockResolvedValue({});

            // Act - Le service filtre les systèmes par complexité ET statut actif par défaut
            const result = await systemService.listerSystemesDisponibles({ complexite: 'moyenne' });

            // Assert - Tous les systèmes avec la complexité "moyenne" sont retournés (actifs et inactifs)
            expect(result).toHaveLength(2);
            
            // Vérifier monsterhearts (actif)
            const monsterhearts = result.find(s => s.id === 'monsterhearts');
            expect(monsterhearts).toBeDefined();
            expect(monsterhearts.complexite).toBe('moyenne');
            expect(monsterhearts.actif).toBe(true);
            
            // Vérifier systeme_inactif (inactif)  
            const systemeInactif = result.find(s => s.id === 'systeme_inactif');
            expect(systemeInactif).toBeDefined();
            expect(systemeInactif.complexite).toBe('moyenne');
            expect(systemeInactif.actif).toBe(false);
        });

        test('devrait filtrer par tag', async () => {
            // Arrange
            systemService.obtenirStatistiquesSysteme.mockResolvedValue({});

            // Act
            const result = await systemService.listerSystemesDisponibles({ tag: 'narratif' });

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('monsterhearts');
            expect(result[0].tags).toContain('narratif');
        });

        test('devrait obtenir les détails complets d\'un système', async () => {
            // Arrange
            const mockStats = {
                nb_personnages: 15,
                nb_pdfs_generes: 42,
                derniere_utilisation: new Date()
            };
            systemService.obtenirStatistiquesSysteme.mockResolvedValue(mockStats);

            // Act
            const result = await systemService.obtenirDetailsSysteme('monsterhearts');

            // Assert
            expect(result).toEqual(
                expect.objectContaining({
                    id: 'monsterhearts',
                    nom: 'Monsterhearts',
                    description: 'JDR sur les adolescents monstrueux',
                    version: '2.0.0',
                    actif: true,
                    attributs: expect.any(Object),
                    competences: expect.any(Object),
                    infos_base: expect.any(Object),
                    couleurs: expect.any(Object),
                    templates_disponibles: ['fiche-personnage', 'carte-reference'],
                    statistiques: mockStats
                })
            );
        });

        test('devrait rejeter un système inexistant', async () => {
            // Act & Assert
            await expect(systemService.obtenirDetailsSysteme('inexistant'))
                .rejects.toThrow('Système de jeu non trouvé');
        });
    });

    describe('US016 - Gestion des systèmes de jeu (Admin)', () => {
        test('devrait créer un nouveau système (Admin uniquement)', async () => {
            // Arrange
            const donneesSysteme = {
                id: 'nouveau_systeme',
                nom: 'Nouveau Système',
                description: 'Un nouveau système de test',
                version: '1.0.0',
                attributs: {
                    force: { min: 1, max: 10, defaut: 5 },
                    agilite: { min: 1, max: 10, defaut: 5 }
                },
                complexite: 'simple',
                tags: ['test', 'nouveau']
            };
            
            systemService.sauvegarderSysteme.mockResolvedValue(true);

            // Act
            const result = await systemService.creerSysteme(donneesSysteme, 'ADMIN');

            // Assert
            expect(systemService.sauvegarderSysteme).toHaveBeenCalledWith(
                'nouveau_systeme',
                expect.objectContaining({
                    nom: 'Nouveau Système',
                    description: 'Un nouveau système de test',
                    version: '1.0.0',
                    actif: true,
                    attributs: donneesSysteme.attributs,
                    complexite: 'simple',
                    tags: ['test', 'nouveau']
                })
            );
            expect(result).toEqual(
                expect.objectContaining({
                    id: 'nouveau_systeme',
                    nom: 'Nouveau Système',
                    date_creation: expect.any(Date),
                    cree_par: 'admin'
                })
            );
        });

        test('devrait rejeter la création par un non-admin', async () => {
            // Arrange
            const donneesSysteme = {
                id: 'test',
                nom: 'Test'
            };

            // Act & Assert
            await expect(systemService.creerSysteme(donneesSysteme, 'UTILISATEUR'))
                .rejects.toThrow('Fonctionnalité réservée aux administrateurs');
        });

        test('devrait rejeter un ID déjà existant', async () => {
            // Arrange
            const donneesSysteme = {
                id: 'monsterhearts', // Déjà existant
                nom: 'Doublon'
            };

            // Act & Assert
            await expect(systemService.creerSysteme(donneesSysteme, 'ADMIN'))
                .rejects.toThrow('Un système avec cet ID existe déjà');
        });

        test('devrait mettre à jour un système existant (Admin uniquement)', async () => {
            // Arrange
            const donneesMAJ = {
                description: 'Description mise à jour',
                version: '2.1.0',
                complexite: 'difficile'
            };
            
            systemService.sauvegarderSysteme.mockResolvedValue(true);

            // Act
            const result = await systemService.mettreAJourSysteme('monsterhearts', donneesMAJ, 'ADMIN');

            // Assert
            expect(systemService.sauvegarderSysteme).toHaveBeenCalledWith(
                'monsterhearts',
                expect.objectContaining({
                    nom: 'Monsterhearts', // Données existantes conservées
                    description: 'Description mise à jour', // Nouvelles données
                    version: '2.1.0',
                    complexite: 'difficile',
                    date_modification: expect.any(Date),
                    modifie_par: 'admin'
                })
            );
            expect(result).toEqual(expect.objectContaining(donneesMAJ));
        });

        test('devrait changer le statut d\'un système (Admin uniquement)', async () => {
            // Arrange
            systemService.sauvegarderSysteme.mockResolvedValue(true);

            // Act
            const result = await systemService.changerStatutSysteme('monsterhearts', false, 'ADMIN');

            // Assert
            expect(systemService.sauvegarderSysteme).toHaveBeenCalledWith(
                'monsterhearts',
                expect.objectContaining({
                    actif: false,
                    date_modification: expect.any(Date),
                    modifie_par: 'admin'
                })
            );
        });

        test('devrait supprimer un système sans personnages (Admin uniquement)', async () => {
            // Arrange
            systemService.compterPersonnagesParSysteme.mockResolvedValue(0);
            systemService.supprimerSystemeEnBase.mockResolvedValue(true);

            // Act
            const result = await systemService.supprimerSysteme('systeme_inactif', 'ADMIN');

            // Assert
            expect(systemService.compterPersonnagesParSysteme).toHaveBeenCalledWith('systeme_inactif');
            expect(systemService.supprimerSystemeEnBase).toHaveBeenCalledWith('systeme_inactif');
            expect(result).toBe(true);
        });

        test('devrait rejeter la suppression d\'un système avec personnages', async () => {
            // Arrange
            systemService.compterPersonnagesParSysteme.mockResolvedValue(5);

            // Act & Assert
            await expect(systemService.supprimerSysteme('monsterhearts', 'ADMIN'))
                .rejects.toThrow('Impossible de supprimer : 5 personnages utilisent ce système');
        });

        test('devrait rejeter les opérations admin pour les non-admins', async () => {
            // Act & Assert
            await expect(systemService.mettreAJourSysteme('test', {}, 'UTILISATEUR'))
                .rejects.toThrow('Fonctionnalité réservée aux administrateurs');
            
            await expect(systemService.changerStatutSysteme('test', false, 'PREMIUM'))
                .rejects.toThrow('Fonctionnalité réservée aux administrateurs');
            
            await expect(systemService.supprimerSysteme('test', 'UTILISATEUR'))
                .rejects.toThrow('Fonctionnalité réservée aux administrateurs');
        });
    });

    describe('Statistiques et validation', () => {
        test('devrait obtenir les statistiques globales', async () => {
            // Arrange
            systemService.compterPersonnagesParSysteme.mockImplementation((systeme) => {
                const counts = { monsterhearts: 15, engrenages: 8, systeme_inactif: 0 };
                return Promise.resolve(counts[systeme] || 0);
            });
            
            systemService.compterPdfsParSysteme.mockImplementation((systeme) => {
                const counts = { monsterhearts: 42, engrenages: 20, systeme_inactif: 0 };
                return Promise.resolve(counts[systeme] || 0);
            });
            
            systemService.obtenirDerniereUtilisation.mockResolvedValue(new Date());

            // Act
            const result = await systemService.obtenirStatistiquesGlobales();

            // Assert
            expect(result.systemes).toHaveProperty('monsterhearts');
            expect(result.systemes.monsterhearts).toEqual(
                expect.objectContaining({
                    nom: 'Monsterhearts',
                    actif: true,
                    nb_personnages: 15,
                    nb_pdfs_generes: 42,
                    derniere_utilisation: expect.any(Date)
                })
            );
            
            expect(result.resume).toEqual(
                expect.objectContaining({
                    total_systemes: 3,
                    systemes_actifs: 2,
                    total_personnages: 23,
                    total_pdfs: 62
                })
            );
        });

        test('devrait valider la configuration d\'un système', async () => {
            // Arrange
            systemService.verifierExistenceTemplate.mockResolvedValue(true);

            // Act
            const result = await systemService.validerConfigurationSysteme('monsterhearts');

            // Assert
            expect(result).toEqual(
                expect.objectContaining({
                    valide: true,
                    erreurs: [],
                    avertissements: [],
                    systeme_id: 'monsterhearts',
                    date_validation: expect.any(Date)
                })
            );
        });

        test('devrait détecter les erreurs de configuration', async () => {
            // Arrange - Simuler un système avec des erreurs
            const systemesJeu = require('../../src/utils/systemesJeu');
            systemesJeu.systeme_erreur = {
                // Nom manquant
                attributs: {
                    mauvais_attribut: { min: 5, max: 1 } // min > max
                }
            };

            // Act
            const result = await systemService.validerConfigurationSysteme('systeme_erreur');

            // Assert
            expect(result.valide).toBe(false);
            expect(result.erreurs).toContain('Nom manquant');
            expect(result.erreurs).toContain('Attribut mauvais_attribut : min doit être < max');
        });
    });

    describe('Validation des données', () => {
        test('devrait valider des données système correctes', () => {
            // Arrange - Utiliser des données simples sans attributs complexes
            const donneesValides = {
                id: 'systeme_test',
                nom: 'Système Test',
                version: '1.0.0'
            };

            // Act & Assert - Ne devrait pas lever d'erreur avec des données basiques
            expect(() => {
                systemService.validerDonneesSysteme(donneesValides);
            }).not.toThrow();
        });

        test('devrait rejeter un ID invalide', () => {
            // Arrange
            const donneesInvalides = {
                id: 'Système Invalid!', // Caractères non autorisés
                nom: 'Test'
            };

            // Act & Assert
            expect(() => {
                systemService.validerDonneesSysteme(donneesInvalides);
            }).toThrow('ID doit contenir uniquement des lettres minuscules, chiffres, tirets et underscores');
        });

        test('devrait rejeter un nom trop court', () => {
            // Arrange
            const donneesInvalides = {
                id: 'test',
                nom: 'A' // Trop court
            };

            // Act & Assert
            expect(() => {
                systemService.validerDonneesSysteme(donneesInvalides);
            }).toThrow('Nom doit faire entre 2 et 100 caractères');
        });

        test('devrait rejeter une version mal formatée', () => {
            // Arrange
            const donneesInvalides = {
                id: 'test',
                nom: 'Test',
                version: '1.0' // Format incorrect
            };

            // Act & Assert
            expect(() => {
                systemService.validerDonneesSysteme(donneesInvalides);
            }).toThrow('Version doit suivre le format x.y.z');
        });

        test('devrait rejeter des attributs invalides', () => {
            // Arrange
            const donneesInvalides = {
                id: 'test',
                nom: 'Test',
                attributs: {
                    force: { min: 'invalid' } // Pas un nombre
                }
            };

            // Act & Assert
            expect(() => {
                systemService.validerDonneesSysteme(donneesInvalides);
            }).toThrow('Attribut force : min et max requis (numbers)');
        });
    });

    describe('Utilitaires', () => {
        test('devrait extraire un aperçu des configurations', () => {
            // Arrange
            const configuration = {
                attribut1: {},
                attribut2: {},
                attribut3: {},
                attribut4: {},
                attribut5: {}
            };

            // Act
            const result = systemService.extraireApercu(configuration);

            // Assert
            expect(result).toEqual(['attribut1', 'attribut2', 'attribut3']);
        });

        test('devrait retourner null pour une configuration vide', () => {
            // Act
            const result = systemService.extraireApercu({});

            // Assert
            expect(result).toBeNull();
        });

        test('devrait préparer une configuration complète', () => {
            // Arrange
            const donnees = {
                nom: 'Test Système',
                attributs: { force: { min: 1, max: 10 } },
                tags: ['test']
            };

            // Act
            const result = systemService.preparerConfigurationSysteme(donnees);

            // Assert
            expect(result).toEqual(
                expect.objectContaining({
                    nom: 'Test Système',
                    description: '', // Valeur par défaut
                    version: '1.0.0', // Valeur par défaut
                    actif: true, // Valeur par défaut
                    attributs: donnees.attributs,
                    competences: {}, // Valeur par défaut
                    infos_base: {}, // Valeur par défaut
                    couleurs: {}, // Valeur par défaut
                    icone: null, // Valeur par défaut
                    complexite: 'moyenne', // Valeur par défaut
                    tags: ['test'],
                    public_cible: 'tout-public', // Valeur par défaut
                    auteur: 'Système personnalisé', // Valeur par défaut
                    licence: 'Utilisation libre', // Valeur par défaut
                    templates: [], // Valeur par défaut
                    supports_pdf: true, // Valeur par défaut
                    supports_exports: ['pdf', 'json'] // Valeur par défaut
                })
            );
        });
    });
});