const { systemesJeu, SystemeUtils } = require('../src/utils/systemesJeu');

describe('Systèmes de jeu', () => {
    describe('Configuration des systèmes', () => {
        test('tous les systèmes ont les propriétés requises', () => {
            Object.entries(systemesJeu).forEach(([code, systeme]) => {
                expect(systeme).toHaveProperty('nom');
                expect(systeme).toHaveProperty('code');
                expect(systeme).toHaveProperty('description');
                expect(systeme).toHaveProperty('attributs');
                expect(systeme).toHaveProperty('themes');
                expect(systeme.code).toBe(code);
            });
        });

        test('tous les systèmes ont des thèmes valides', () => {
            Object.values(systemesJeu).forEach(systeme => {
                expect(systeme.themes).toHaveProperty('couleurPrimaire');
                expect(systeme.themes).toHaveProperty('couleurSecondaire');
                expect(systeme.themes).toHaveProperty('couleurTailwind');
                expect(systeme.themes).toHaveProperty('icone');
                
                // Vérifier que les couleurs sont des codes hexadécimaux valides
                expect(systeme.themes.couleurPrimaire).toMatch(/^#[0-9a-fA-F]{6}$/);
                expect(systeme.themes.couleurSecondaire).toMatch(/^#[0-9a-fA-F]{6}$/);
            });
        });

        test('tous les systèmes ont des attributs configurés', () => {
            Object.values(systemesJeu).forEach(systeme => {
                expect(typeof systeme.attributs).toBe('object');
                expect(Object.keys(systeme.attributs).length).toBeGreaterThan(0);
                
                Object.values(systeme.attributs).forEach(attribut => {
                    expect(attribut).toHaveProperty('nom');
                    expect(attribut).toHaveProperty('min');
                    expect(attribut).toHaveProperty('max');
                    expect(typeof attribut.min).toBe('number');
                    expect(typeof attribut.max).toBe('number');
                    expect(attribut.max).toBeGreaterThan(attribut.min);
                });
            });
        });
    });

    describe('SystemeUtils', () => {
        test('getSysteme retourne le bon système', () => {
            const monsterhearts = SystemeUtils.getSysteme('monsterhearts');
            expect(monsterhearts).toBeDefined();
            expect(monsterhearts.nom).toBe('Monsterhearts');
            expect(monsterhearts.code).toBe('monsterhearts');
        });

        test('getSysteme retourne null pour un système inexistant', () => {
            const inexistant = SystemeUtils.getSysteme('inexistant');
            expect(inexistant).toBeNull();
        });

        test('getAllSystemes retourne un tableau', () => {
            const systemes = SystemeUtils.getAllSystemes();
            expect(Array.isArray(systemes)).toBe(true);
            expect(systemes.length).toBeGreaterThan(0);
            
            systemes.forEach(systeme => {
                expect(systeme).toHaveProperty('nom');
                expect(systeme).toHaveProperty('code');
            });
        });

        test('getSystemesListe retourne la bonne structure', () => {
            const liste = SystemeUtils.getSystemesListe();
            expect(Array.isArray(liste)).toBe(true);
            
            liste.forEach(item => {
                expect(item).toHaveProperty('code');
                expect(item).toHaveProperty('nom');
                expect(item).toHaveProperty('description');
            });
        });

        test('validerAttributs valide correctement', () => {
            // Test avec des attributs valides pour Monsterhearts
            const attributsValides = { hot: 2, cold: 1, volatile: -1, dark: 3 };
            const resultat = SystemeUtils.validerAttributs('monsterhearts', attributsValides);
            
            expect(resultat.valide).toBe(true);
            expect(resultat.erreurs).toEqual([]);
        });

        test('validerAttributs détecte les erreurs', () => {
            // Test avec des attributs invalides
            const attributsInvalides = { hot: 5, cold: -2 }; // hot trop élevé, cold trop bas, volatile et dark manquants
            const resultat = SystemeUtils.validerAttributs('monsterhearts', attributsInvalides);
            
            expect(resultat.valide).toBe(false);
            expect(resultat.erreurs.length).toBeGreaterThan(0);
        });

        test('getTotalAttributs calcule correctement', () => {
            const attributs = { hot: 2, cold: 1, volatile: -1, dark: 3 };
            const total = SystemeUtils.getTotalAttributs('monsterhearts', attributs);
            
            expect(total).toBe(5); // 2 + 1 + (-1) + 3
        });

        test('getTheme retourne le thème correct', () => {
            const theme = SystemeUtils.getTheme('monsterhearts');
            expect(theme).toBeDefined();
            expect(theme).toHaveProperty('couleurPrimaire');
            expect(theme).toHaveProperty('couleurTailwind');
        });

        test('validerSkin fonctionne pour Monsterhearts', () => {
            expect(SystemeUtils.validerSkin('monsterhearts', 'The Vampire')).toBe(true);
            expect(SystemeUtils.validerSkin('monsterhearts', 'Skin Inexistant')).toBe(false);
        });

        test('getMecaniques retourne les mécaniques', () => {
            const mecaniques = SystemeUtils.getMecaniques('monsterhearts');
            expect(mecaniques).toBeDefined();
            expect(typeof mecaniques).toBe('object');
        });
    });

    describe('Systèmes spécifiques', () => {
        test('Monsterhearts a la configuration correcte', () => {
            const mh = systemesJeu.monsterhearts;
            expect(mh.themes.couleurTailwind).toBe('purple');
            expect(mh.skins).toContain('The Vampire');
            expect(mh.attributs).toHaveProperty('hot');
            expect(mh.attributs.hot.min).toBe(-1);
            expect(mh.attributs.hot.max).toBe(3);
        });

        test('Engrenages a la configuration correcte', () => {
            const eng = systemesJeu.engrenages;
            expect(eng.themes.couleurTailwind).toBe('emerald');
            expect(eng.attributs).toHaveProperty('corps');
            expect(eng.attributs.corps.min).toBe(1);
            expect(eng.attributs.corps.max).toBe(5);
        });

        test('Metro 2033 a la configuration correcte', () => {
            const metro = systemesJeu.metro2033;
            expect(metro.themes.couleurTailwind).toBe('red');
            expect(metro.attributs).toHaveProperty('might');
            expect(metro.attributs.might.min).toBe(3);
            expect(metro.attributs.might.max).toBe(18);
        });

        test('Mist Engine a la configuration correcte', () => {
            const mist = systemesJeu.mistengine;
            expect(mist.themes.couleurTailwind).toBe('pink');
            expect(mist.attributs).toHaveProperty('edge');
            expect(mist.attributs.edge.min).toBe(1);
            expect(mist.attributs.edge.max).toBe(4);
        });
    });

    describe('Intégration avec Express', () => {
        test('SystemeUtils.getAllSystemes() peut être utilisé dans les templates', () => {
            const systemes = SystemeUtils.getAllSystemes();
            
            // Simule ce que fait le template
            const systemesOrdered = ['monsterhearts', 'engrenages', 'metro2033', 'mistengine'];
            
            systemesOrdered.forEach(codeSysteme => {
                const systeme = systemes.find(s => s.code === codeSysteme);
                expect(systeme).toBeDefined();
                expect(systeme.themes).toHaveProperty('couleurTailwind');
            });
        });
    });
});