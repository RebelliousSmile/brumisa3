const { SystemeUtils } = require('../src/utils/systemesJeu');

describe('Tests d\'intégration - Systèmes de jeu', () => {
    describe('Flux complet de création de personnage', () => {
        test('création d\'un personnage Monsterhearts complet', () => {
            // 1. Récupérer le système
            const systeme = SystemeUtils.getSysteme('monsterhearts');
            expect(systeme).toBeDefined();
            
            // 2. Valider un personnage complet
            const personnage = {
                nom: 'Test Vampire',
                skin: 'The Vampire',
                attributs: {
                    hot: 2,
                    cold: 1,
                    volatile: -1,
                    dark: 3
                },
                conditions: ['Afraid'],
                strings: 2
            };
            
            // 3. Valider les attributs
            const validationAttributs = SystemeUtils.validerAttributs('monsterhearts', personnage.attributs);
            expect(validationAttributs.valide).toBe(true);
            
            // 4. Valider le skin
            const skinValide = SystemeUtils.validerSkin('monsterhearts', personnage.skin);
            expect(skinValide).toBe(true);
            
            // 5. Calculer le total des attributs
            const total = SystemeUtils.getTotalAttributs('monsterhearts', personnage.attributs);
            expect(total).toBe(5);
            
            // 6. Récupérer le thème pour l'affichage
            const theme = SystemeUtils.getTheme('monsterhearts');
            expect(theme.couleurTailwind).toBe('purple');
        });

        test('création d\'un personnage Metro 2033 complet', () => {
            const systeme = SystemeUtils.getSysteme('metro2033');
            expect(systeme).toBeDefined();
            
            const personnage = {
                nom: 'Ranger Artyom',
                faction: 'Rangers',
                attributs: {
                    might: 15,
                    agility: 12,
                    wits: 14,
                    empathy: 10
                }
            };
            
            const validationAttributs = SystemeUtils.validerAttributs('metro2033', personnage.attributs);
            expect(validationAttributs.valide).toBe(true);
            
            const total = SystemeUtils.getTotalAttributs('metro2033', personnage.attributs);
            expect(total).toBe(51);
        });
    });

    describe('Compatibilité template EJS', () => {
        test('les données sont formatées correctement pour les templates', () => {
            const systemes = SystemeUtils.getAllSystemes();
            
            // Simule le code du template
            const systemesOrdered = ['monsterhearts', 'engrenages', 'metro2033', 'mistengine'];
            const icones = {
                'monsterhearts': 'ra-heartburn',
                'engrenages': 'ra-candle',
                'metro2033': 'ra-pills',
                'mistengine': 'ra-ocarina'
            };
            
            const cartes = [];
            systemesOrdered.forEach(codeSysteme => {
                const systeme = systemes.find(s => s.code === codeSysteme);
                if (systeme) {
                    cartes.push({
                        code: systeme.code,
                        nom: systeme.nom,
                        couleur: systeme.themes.couleurTailwind,
                        icone: icones[codeSysteme]
                    });
                }
            });
            
            expect(cartes).toHaveLength(4);
            expect(cartes[0].code).toBe('monsterhearts');
            expect(cartes[0].couleur).toBe('purple');
            expect(cartes[1].code).toBe('engrenages');
            expect(cartes[1].couleur).toBe('emerald');
        });
    });

    describe('Validation des données critiques', () => {
        test('tous les systèmes ont des couleurs Tailwind valides', () => {
            const systemes = SystemeUtils.getAllSystemes();
            const couleursValides = [
                'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald',
                'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple',
                'fuchsia', 'pink', 'rose', 'slate', 'gray', 'zinc', 'neutral',
                'stone'
            ];
            
            systemes.forEach(systeme => {
                expect(couleursValides).toContain(systeme.themes.couleurTailwind);
            });
        });

        test('les icônes sont définies et formatées correctement', () => {
            const systemes = SystemeUtils.getAllSystemes();
            
            systemes.forEach(systeme => {
                expect(systeme.themes.icone).toBeDefined();
                expect(typeof systeme.themes.icone).toBe('string');
                expect(systeme.themes.icone.length).toBeGreaterThan(0);
                // Les icônes RPG Awesome commencent par 'ra-'
                expect(systeme.themes.icone.startsWith('ra-')).toBe(true);
            });
        });

        test('cohérence des attributs entre systèmes', () => {
            const systemes = SystemeUtils.getAllSystemes();
            
            systemes.forEach(systeme => {
                const attributs = Object.values(systeme.attributs);
                
                // Vérifier qu'il y a au moins 3 attributs
                expect(attributs.length).toBeGreaterThanOrEqual(3);
                
                // Vérifier que les noms d'attributs sont uniques
                const noms = attributs.map(attr => attr.nom);
                expect(new Set(noms).size).toBe(noms.length);
                
                // Vérifier les ranges
                attributs.forEach(attr => {
                    expect(attr.max - attr.min).toBeGreaterThanOrEqual(2);
                });
            });
        });
    });

    describe('Performance et cache', () => {
        test('getAllSystemes est performant', () => {
            const start = Date.now();
            
            for (let i = 0; i < 1000; i++) {
                SystemeUtils.getAllSystemes();
            }
            
            const end = Date.now();
            expect(end - start).toBeLessThan(100); // Moins de 100ms pour 1000 appels
        });

        test('getSysteme est performant', () => {
            const start = Date.now();
            
            for (let i = 0; i < 1000; i++) {
                SystemeUtils.getSysteme('monsterhearts');
                SystemeUtils.getSysteme('metro2033');
                SystemeUtils.getSysteme('inexistant');
            }
            
            const end = Date.now();
            expect(end - start).toBeLessThan(50);
        });
    });
});