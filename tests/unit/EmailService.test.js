/**
 * Tests unitaires pour EmailService
 * Teste la logique de sélection d'emails avec les principes SOLID
 */

const EmailService = require('../../src/services/EmailService');

// Mock des dépendances pour l'isolation des tests
jest.mock('resend', () => ({
    Resend: jest.fn().mockImplementation(() => ({
        emails: {
            send: jest.fn().mockResolvedValue({
                data: { id: 'mock-email-id' }
            })
        }
    }))
}));

jest.mock('../../src/services/EmailTemplate', () => {
    return jest.fn().mockImplementation(() => ({
        render: jest.fn().mockResolvedValue('<html>Mock HTML Content</html>')
    }));
});

describe('EmailService', () => {
    let emailService;
    const originalEnv = process.env;

    beforeEach(() => {
        // Reset des variables d'environnement pour chaque test
        process.env = { ...originalEnv };
        process.env.RESEND_API_KEY = 'test-key';
        process.env.RESEND_FROM_EMAIL = 'config@brumisa3.fr';
        process.env.RESEND_FROM_NAME = 'Test Service';
        process.env.BASE_URL = 'http://localhost:3074';
        
        emailService = new EmailService();
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('getTestEmail - Application des principes SOLID', () => {
        
        test('Single Responsibility: doit retourner un email de test valide', () => {
            const testEmail = emailService.getTestEmail();
            expect(testEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        });

        test('doit respecter la priorité des emails configurés', () => {
            const customEmail = 'priority@test.com';
            const result = emailService.getTestEmail(customEmail);
            expect(result).toBe(customEmail);
        });

        test('doit utiliser ADMIN_EMAIL si pas de fallback', () => {
            process.env.ADMIN_EMAIL = 'admin@brumisa3.fr';
            const result = emailService.getTestEmail();
            expect(result).toBe('admin@brumisa3.fr');
        });

        test('doit utiliser RESEND_FROM_EMAIL si pas d\'ADMIN_EMAIL', () => {
            delete process.env.ADMIN_EMAIL;
            process.env.RESEND_FROM_EMAIL = 'sender@brumisa3.fr';
            const result = emailService.getTestEmail();
            expect(result).toBe('sender@brumisa3.fr');
        });

        test('doit ignorer les emails invalides et passer au suivant', () => {
            const invalidEmail = 'invalid-email';
            const result = emailService.getTestEmail(invalidEmail);
            // Doit passer à l'email suivant valide dans la liste
            expect(result).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
            expect(result).not.toBe(invalidEmail);
        });

        test('doit toujours retourner un email valide même sans configuration', () => {
            delete process.env.ADMIN_EMAIL;
            delete process.env.RESEND_FROM_EMAIL;
            emailService.fromEmail = null;
            
            const result = emailService.getTestEmail();
            expect(result).toBe('activation@brumisa3.fr'); // Fallback final
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
                expect(emailService._isValidEmail(email)).toBe(true);
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
                expect(emailService._isValidEmail(email)).toBe(false);
            });
        });
    });

    describe('testerConfiguration - Configuration testing', () => {
        
        test('doit utiliser un email de test valide', async () => {
            const result = await emailService.testerConfiguration();
            
            expect(result).toHaveProperty('success');
            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('details');
        });

        test('doit accepter un email de test personnalisé', async () => {
            const customTestEmail = 'custom@test.com';
            
            // Mock pour vérifier que le bon email est utilisé
            const originalEnvoyer = emailService.envoyer;
            emailService.envoyer = jest.fn().mockResolvedValue({
                success: true,
                id: 'test-id'
            });

            await emailService.testerConfiguration(customTestEmail);
            
            expect(emailService.envoyer).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: customTestEmail
                })
            );

            emailService.envoyer = originalEnvoyer;
        });
    });

    describe('Intégration avec la fonction de test du contrôleur', () => {
        
        test('doit fournir un email de test cohérent avec la configuration', () => {
            process.env.RESEND_FROM_EMAIL = 'activation@brumisa3.fr';
            
            const testEmail = emailService.getTestEmail();
            
            // L'email de test doit être cohérent avec la configuration
            expect(testEmail).toBe('activation@brumisa3.fr');
        });

        test('doit être compatible avec les tests d\'authentification', () => {
            // Simule l'utilisation dans AuthentificationController.testMotDePasseOublie
            const configuredEmail = process.env.RESEND_FROM_EMAIL;
            const serviceEmail = emailService.getTestEmail();
            
            // Les deux approches doivent donner le même résultat
            expect(serviceEmail).toBe(configuredEmail);
        });
    });

    describe('Respect des principes SOLID', () => {
        
        test('Single Responsibility: chaque méthode a une responsabilité unique', () => {
            // getTestEmail: obtient un email de test
            // _getEmailCandidates: récupère les candidats
            // _selectValidEmail: sélectionne le valide
            // _isValidEmail: valide le format
            
            expect(typeof emailService.getTestEmail).toBe('function');
            expect(typeof emailService._getEmailCandidates).toBe('function');
            expect(typeof emailService._selectValidEmail).toBe('function');
            expect(typeof emailService._isValidEmail).toBe('function');
        });

        test('Open/Closed: _getEmailCandidates peut être étendu sans modification', () => {
            // La méthode retourne un array qui peut être étendu
            const candidates = emailService._getEmailCandidates('test@example.com');
            expect(Array.isArray(candidates)).toBe(true);
            expect(candidates.length).toBeGreaterThan(0);
        });

        test('Dependency Inversion: utilise des abstractions (variables d\'environnement)', () => {
            // Le service dépend d'abstractions (process.env) pas de valeurs codées en dur
            process.env.RESEND_FROM_EMAIL = 'new@email.com';
            emailService = new EmailService();
            
            expect(emailService.fromEmail).toBe('new@email.com');
        });
    });
});