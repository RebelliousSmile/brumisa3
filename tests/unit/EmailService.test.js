/**
 * Tests unitaires pour EmailService avec architecture SOLID
 * Utilise BaseUnitTest et UnitTestFactory pour une structure cohérente
 */

const BaseUnitTest = require('../helpers/BaseUnitTest');
const UnitTestFactory = require('../helpers/UnitTestFactory');
const EmailService = require('../../src/services/EmailService');

// Mock des dépendances externes
jest.mock('resend');
jest.mock('../../src/services/EmailTemplate');

class EmailServiceTest extends BaseUnitTest {
    constructor() {
        super({
            timeout: 5000,
            mockDatabase: false,
            mockExternalServices: true
        });
        
        this.emailService = null;
        this.testContext = null;
        this.originalEnv = process.env;
    }

    async customSetup() {
        // Créer le contexte de test spécialisé pour EmailService
        this.testContext = UnitTestFactory.createServiceTestContext('EmailService');
        
        // Configuration des variables d'environnement pour les tests
        this.setupEnvironmentVariables();
        
        // Créer les mocks spécialisés
        this.setupEmailServiceMocks();
        
        // Instancier le service après la configuration
        this.emailService = new EmailService();
    }

    async customTeardown() {
        // Restaurer les variables d'environnement
        process.env = this.originalEnv;
    }

    setupEnvironmentVariables() {
        process.env = { ...this.originalEnv };
        process.env.RESEND_API_KEY = 'test-key';
        process.env.RESEND_FROM_EMAIL = 'config@brumisa3.fr';
        process.env.RESEND_FROM_NAME = 'Test Service';
        process.env.BASE_URL = 'http://localhost:3074';
    }

    setupEmailServiceMocks() {
        const { Resend } = require('resend');
        const EmailTemplate = require('../../src/services/EmailTemplate');
        
        // Mock Resend
        Resend.mockImplementation(() => ({
            emails: {
                send: jest.fn().mockResolvedValue({
                    data: { id: 'mock-email-id' }
                })
            }
        }));
        
        // Mock EmailTemplate
        EmailTemplate.mockImplementation(() => ({
            render: jest.fn().mockResolvedValue('<html>Mock HTML Content</html>')
        }));
        
        // Ajouter les mocks au contexte pour réutilisation
        this.addMock('resend', Resend);
        this.addMock('emailTemplate', EmailTemplate);
    }

    createEmailServiceMock() {
        return this.testContext.createEmailServiceMock();
    }

    mockSendSuccess() {
        const emailMock = this.createEmailServiceMock();
        return emailMock.mockSendSuccess();
    }

    mockSendFailure(error = 'Email sending failed') {
        const emailMock = this.createEmailServiceMock();
        return emailMock.mockSendFailure(error);
    }
}

// Instance de test réutilisable
const emailServiceTest = new EmailServiceTest();

describe('EmailService', () => {
    beforeEach(async () => {
        await emailServiceTest.baseSetup();
    });

    afterEach(async () => {
        await emailServiceTest.baseTeardown();
    });

    describe('getTestEmail - Application des principes SOLID', () => {
        
        test('Single Responsibility: doit retourner un email de test valide', () => {
            const testEmail = emailServiceTest.emailService.getTestEmail();
            expect(testEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        });

        test('doit respecter la priorité des emails configurés', () => {
            const customEmail = 'priority@test.com';
            emailServiceTest.assertFunction(
                (email) => emailServiceTest.emailService.getTestEmail(email),
                customEmail,
                customEmail
            );
        });

        test('doit utiliser ADMIN_EMAIL si pas de fallback', () => {
            process.env.ADMIN_EMAIL = 'admin@brumisa3.fr';
            const result = emailServiceTest.emailService.getTestEmail();
            expect(result).toBe('admin@brumisa3.fr');
        });

        test('doit utiliser l\'email suivant dans la liste de candidats', () => {
            delete process.env.ADMIN_EMAIL;
            delete process.env.TEST_EMAIL;
            // Devrait utiliser le fallback par défaut : 'internet@fxguillois.email'
            const result = emailServiceTest.emailService.getTestEmail();
            expect(result).toBe('internet@fxguillois.email');
        });

        test('doit ignorer les emails invalides et passer au suivant', () => {
            const invalidEmail = 'invalid-email';
            const result = emailServiceTest.emailService.getTestEmail(invalidEmail);
            // Doit passer à l'email suivant valide dans la liste
            expect(result).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
            expect(result).not.toBe(invalidEmail);
        });

        test('doit toujours retourner un email valide même sans configuration', () => {
            delete process.env.ADMIN_EMAIL;
            delete process.env.TEST_EMAIL;
            
            const result = emailServiceTest.emailService.getTestEmail();
            expect(result).toBe('internet@fxguillois.email'); // Fallback final dans la logique réelle
        });
    });

    describe('_isValidEmail - Validation d\'email', () => {
        
        test('doit valider les emails corrects', () => {
            const validEmails = [
                'test@example.com',
                'user.name@domain.co.uk',
                'activation@brumisa3.fr'
            ];
            
            validEmails.forEach(email => {
                emailServiceTest.assertFunction(
                    (email) => emailServiceTest.emailService._isValidEmail(email),
                    email,
                    true
                );
            });
        });

        test('doit rejeter les emails incorrects', () => {
            const invalidEmails = [
                'invalid-email',
                '@domain.com',
                'user@',
                '',
                null,
                undefined,
                'user space@domain.com'
            ];
            
            invalidEmails.forEach(email => {
                emailServiceTest.assertFunction(
                    (email) => emailServiceTest.emailService._isValidEmail(email),
                    email,
                    false
                );
            });
        });
    });

    describe('testerConfiguration - Configuration testing', () => {
        
        test('doit utiliser un email de test valide', async () => {
            await emailServiceTest.assertAsyncFunction(
                () => emailServiceTest.emailService.testerConfiguration(),
                undefined,
                expect.objectContaining({
                    success: expect.any(Boolean),
                    message: expect.any(String),
                    details: expect.any(Object)
                })
            );
        });

        test('doit accepter un email de test personnalisé', async () => {
            const customTestEmail = 'custom@test.com';
            
            // Créer un spy sur la méthode envoyer
            const envoyerSpy = emailServiceTest.createSpy(emailServiceTest.emailService, 'envoyer');
            envoyerSpy.mockResolvedValue({
                success: true,
                id: 'test-id'
            });

            await emailServiceTest.emailService.testerConfiguration(customTestEmail);
            
            emailServiceTest.assertMockCalledWith(
                envoyerSpy,
                [expect.objectContaining({ to: customTestEmail })]
            );
        });
    });

    describe('Intégration avec la fonction de test du contrôleur', () => {
        
        test('doit fournir un email de test cohérent avec la configuration', () => {
            // Utiliser TEST_EMAIL qui a une priorité plus élevée
            process.env.TEST_EMAIL = 'test@brumisa3.fr';
            
            emailServiceTest.assertFunction(
                () => emailServiceTest.emailService.getTestEmail(),
                undefined,
                'test@brumisa3.fr'
            );
        });

        test('doit être compatible avec les tests d\'authentification', () => {
            // Simule l'utilisation dans AuthentificationController.testMotDePasseOublie
            // Utiliser ADMIN_EMAIL qui a priorité sur les autres dans la logique
            process.env.ADMIN_EMAIL = 'admin@brumisa3.fr';
            const serviceEmail = emailServiceTest.emailService.getTestEmail();
            
            // Doit utiliser l'ADMIN_EMAIL configuré
            expect(serviceEmail).toBe('admin@brumisa3.fr');
        });
    });

    describe('Respect des principes SOLID', () => {
        
        test('Single Responsibility: chaque méthode a une responsabilité unique', () => {
            // getTestEmail: obtient un email de test
            // _getEmailCandidates: récupère les candidats
            // _selectValidEmail: sélectionne le valide
            // _isValidEmail: valide le format
            
            const service = emailServiceTest.emailService;
            emailServiceTest.assertObjectStructure(service, {
                getTestEmail: expect.any(Function),
                _getEmailCandidates: expect.any(Function),
                _selectValidEmail: expect.any(Function),
                _isValidEmail: expect.any(Function)
            });
        });

        test('Open/Closed: _getEmailCandidates peut être étendu sans modification', () => {
            // La méthode retourne un array qui peut être étendu
            const candidates = emailServiceTest.emailService._getEmailCandidates('test@example.com');
            expect(Array.isArray(candidates)).toBe(true);
            expect(candidates.length).toBeGreaterThan(0);
        });

        test('Dependency Inversion: utilise des abstractions (variables d\'environnement)', () => {
            // Le service dépend d'abstractions (process.env) pas de valeurs codées en dur
            process.env.RESEND_FROM_EMAIL = 'new@email.com';
            const newService = new EmailService();
            
            expect(newService.fromEmail).toBe('new@email.com');
        });
    });
});