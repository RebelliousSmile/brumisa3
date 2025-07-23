/**
 * Tests unitaires - Fonctions utilitaires
 * 
 * Objectif : Tester les fonctions utilitaires pures sans dépendances
 * - Formatage des nombres (K, M suffixes)
 * - Formatage des tailles de fichier
 * - Génération d'étoiles pour notations
 * - Formatage des dates
 * - Validation d'emails
 * 
 * Architecture : Utilise BaseUnitTest pour structure cohérente
 */

const BaseUnitTest = require('../helpers/BaseUnitTest');
const UnitTestFactory = require('../helpers/UnitTestFactory');

class UtilityFunctionsTest extends BaseUnitTest {
    constructor() {
        super({
            timeout: 5000,
            mockDatabase: false, // Pas besoin de DB pour fonctions pures
            mockExternalServices: false
        });
    }

    async customSetup() {
        // Pas de setup spécial pour les fonctions pures
    }

    // Fonction de formatage des nombres
    formaterNombre(nombre) {
        if (!nombre) return '0';
        
        if (nombre >= 1000000) {
            return (nombre / 1000000).toFixed(1) + 'M';
        } else if (nombre >= 1000) {
            return (nombre / 1000).toFixed(0) + 'K';
        }
        
        return nombre.toString();
    }

    // Fonction de formatage des tailles de fichier
    formaterTailleFichier(octets) {
        if (!octets) return 'N/A';
        
        const unites = ['o', 'Ko', 'Mo', 'Go'];
        let taille = octets;
        let uniteIndex = 0;
        
        while (taille >= 1024 && uniteIndex < unites.length - 1) {
            taille /= 1024;
            uniteIndex++;
        }
        
        return `${Math.round(taille * 10) / 10} ${unites[uniteIndex]}`;
    }

    // Fonction de génération d'étoiles
    genererEtoiles(note) {
        const etoilesCompletes = '★'.repeat(note);
        const etoilesVides = '☆'.repeat(5 - note);
        return etoilesCompletes + etoilesVides;
    }

    // Fonction de formatage des dates
    formaterDate(dateString) {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    // Fonction de validation d'email
    validerEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

describe('Utility Functions', () => {
    const testInstance = new UtilityFunctionsTest();

    beforeAll(async () => {
        await testInstance.baseSetup();
    });

    afterAll(async () => {
        await testInstance.baseTeardown();
    });
    describe('Number formatting', () => {
        test('should format numbers with K suffix', () => {
            testInstance.assertFunction(testInstance.formaterNombre, 1247, '1K');
            testInstance.assertFunction(testInstance.formaterNombre, 8932, '9K');
            testInstance.assertFunction(testInstance.formaterNombre, 3456, '3K');
            testInstance.assertFunction(testInstance.formaterNombre, 1500000, '1.5M');
            testInstance.assertFunction(testInstance.formaterNombre, 999, '999');
            testInstance.assertFunction(testInstance.formaterNombre, 0, '0');
            testInstance.assertFunction(testInstance.formaterNombre, null, '0');
        });

        test('should handle edge cases correctly', () => {
            testInstance.assertFunction(testInstance.formaterNombre, undefined, '0');
            testInstance.assertFunction(testInstance.formaterNombre, 1000, '1K');
            testInstance.assertFunction(testInstance.formaterNombre, 1000000, '1.0M');
        });
    });

    describe('File size formatting', () => {
        test('should format file sizes correctly', () => {
            testInstance.assertFunction(testInstance.formaterTailleFichier, 1024, '1 Ko');
            testInstance.assertFunction(testInstance.formaterTailleFichier, 1048576, '1 Mo');
            testInstance.assertFunction(testInstance.formaterTailleFichier, 500, '500 o');
            testInstance.assertFunction(testInstance.formaterTailleFichier, null, 'N/A');
            testInstance.assertFunction(testInstance.formaterTailleFichier, 1536, '1.5 Ko');
        });

        test('should handle large files', () => {
            testInstance.assertFunction(testInstance.formaterTailleFichier, 1073741824, '1 Go');
            testInstance.assertFunction(testInstance.formaterTailleFichier, 0, 'N/A');
        });
    });

    describe('Star rating generation', () => {
        test('should generate correct star ratings', () => {
            testInstance.assertFunction(testInstance.genererEtoiles, 5, '★★★★★');
            testInstance.assertFunction(testInstance.genererEtoiles, 3, '★★★☆☆');
            testInstance.assertFunction(testInstance.genererEtoiles, 0, '☆☆☆☆☆');
            testInstance.assertFunction(testInstance.genererEtoiles, 1, '★☆☆☆☆');
        });

        test('should handle edge cases', () => {
            testInstance.assertFunction(testInstance.genererEtoiles, 2, '★★☆☆☆');
            testInstance.assertFunction(testInstance.genererEtoiles, 4, '★★★★☆');
        });
    });

    describe('Date formatting', () => {
        test('should format dates in French', () => {
            const result = testInstance.formaterDate('2024-01-15T10:30:00.000Z');
            expect(result).toMatch(/15 janvier 2024/);
        });

        test('should handle different date formats', () => {
            const result2024 = testInstance.formaterDate('2024-12-25T00:00:00.000Z');
            expect(result2024).toMatch(/25 décembre 2024/);
        });
    });

    describe('Email validation', () => {
        test('should validate email addresses', () => {
            testInstance.assertFunction(testInstance.validerEmail, 'test@example.com', true);
            testInstance.assertFunction(testInstance.validerEmail, 'user.name+tag@domain.co.uk', true);
            testInstance.assertFunction(testInstance.validerEmail, 'invalid-email', false);
            testInstance.assertFunction(testInstance.validerEmail, 'missing@domain', false);
            testInstance.assertFunction(testInstance.validerEmail, '@domain.com', false);
            testInstance.assertFunction(testInstance.validerEmail, '', false);
        });

        test('should handle edge cases', () => {
            testInstance.assertFunction(testInstance.validerEmail, null, false);
            testInstance.assertFunction(testInstance.validerEmail, undefined, false);
            testInstance.assertFunction(testInstance.validerEmail, 'test@test.t', true);
        });
    });
});