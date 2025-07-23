// Configuration globale pour tous les tests Jest
process.env.NODE_ENV = 'test';

// Forcer les valeurs de test directement
process.env.POSTGRES_HOST = 'postgresql-jdrspace.alwaysdata.net';
process.env.POSTGRES_PORT = '5432';
process.env.POSTGRES_USER = 'jdrspace_pg';
process.env.POSTGRES_PASSWORD = '9rN95%^V4Ph&';
process.env.POSTGRES_DB = 'jdrspace_pdf_test';
process.env.DATABASE_URL = 'postgresql://jdrspace_pg:9rN95%^V4Ph&@postgresql-jdrspace.alwaysdata.net:5432/jdrspace_pdf_test';

// Charger les variables d'environnement de test
require('dotenv').config({ path: '.env.test', override: true });

// Configuration globale de timeout pour les tests
jest.setTimeout(30000);