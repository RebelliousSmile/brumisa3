/**
 * Mocks pour les services externes et dépendances
 * 
 * Fournit des mocks réutilisables pour les tests selon testing.md
 * Évite les appels aux services externes pendant les tests.
 */

const path = require('path');
const fs = require('fs-extra');

/**
 * Mock pour le service Email (Resend)
 */
class MockEmailService {
  constructor() {
    this.sentEmails = [];
    this.shouldFail = false;
  }

  /**
   * Mock d'envoi d'email
   * @param {Object} emailData - Données de l'email
   * @returns {Promise<Object>} Résultat mock
   */
  async envoyerEmail(emailData) {
    if (this.shouldFail) {
      throw new Error('Mock email service failure');
    }

    const mockResult = {
      id: `mock-email-${Date.now()}`,
      to: emailData.to,
      subject: emailData.subject,
      sent_at: new Date().toISOString()
    };

    this.sentEmails.push({
      ...emailData,
      ...mockResult
    });

    return mockResult;
  }

  /**
   * Obtenir les emails envoyés (pour vérification)
   * @returns {Array} Liste des emails mockés
   */
  getSentEmails() {
    return [...this.sentEmails];
  }

  /**
   * Réinitialiser les mocks
   */
  reset() {
    this.sentEmails = [];
    this.shouldFail = false;
  }

  /**
   * Configurer pour simuler un échec
   * @param {boolean} shouldFail - True pour simuler un échec
   */
  setFailure(shouldFail = true) {
    this.shouldFail = shouldFail;
  }
}

/**
 * Mock pour la génération PDF
 */
class MockPdfService {
  constructor() {
    this.generatedPdfs = [];
    this.shouldFail = false;
    this.generationTime = 100; // ms
  }

  /**
   * Mock de génération PDF
   * @param {Object} data - Données du PDF
   * @returns {Promise<string>} Chemin du PDF mock
   */
  async genererPdf(data) {
    if (this.shouldFail) {
      throw new Error('Mock PDF generation failure');
    }

    // Simuler le temps de génération
    await new Promise(resolve => setTimeout(resolve, this.generationTime));

    const mockPdfPath = path.join('output', 'test', `mock-${Date.now()}.pdf`);
    
    // Créer un faux fichier PDF pour les tests de fichier
    await fs.ensureDir(path.dirname(mockPdfPath));
    await fs.writeFile(mockPdfPath, 'Mock PDF content');

    const mockResult = {
      path: mockPdfPath,
      size: 1234,
      pages: 2,
      generated_at: new Date().toISOString(),
      data: data
    };

    this.generatedPdfs.push(mockResult);
    return mockPdfPath;
  }

  /**
   * Mock de génération fiche personnage
   * @param {Object} personnageData - Données du personnage
   * @returns {Promise<string>} Chemin du PDF
   */
  async genererFichePersonnage(personnageData) {
    return await this.genererPdf({
      type: 'CHARACTER',
      personnage: personnageData
    });
  }

  /**
   * Obtenir les PDFs générés (pour vérification)
   * @returns {Array} Liste des PDFs mockés
   */
  getGeneratedPdfs() {
    return [...this.generatedPdfs];
  }

  /**
   * Réinitialiser les mocks
   */
  reset() {
    this.generatedPdfs = [];
    this.shouldFail = false;
    this.generationTime = 100;
  }

  /**
   * Configurer le temps de génération (pour tests de performance)
   * @param {number} timeMs - Temps en millisecondes
   */
  setGenerationTime(timeMs) {
    this.generationTime = timeMs;
  }

  /**
   * Configurer pour simuler un échec
   * @param {boolean} shouldFail - True pour simuler un échec
   */
  setFailure(shouldFail = true) {
    this.shouldFail = shouldFail;
  }
}

/**
 * Mock pour les requêtes HTTP externes
 */
class MockHttpClient {
  constructor() {
    this.requests = [];
    this.responses = new Map();
    this.defaultResponse = { status: 200, data: {} };
  }

  /**
   * Mock d'une requête GET
   * @param {string} url - URL de la requête
   * @returns {Promise<Object>} Réponse mockée
   */
  async get(url) {
    return this.makeRequest('GET', url);
  }

  /**
   * Mock d'une requête POST
   * @param {string} url - URL de la requête
   * @param {Object} data - Données à envoyer
   * @returns {Promise<Object>} Réponse mockée
   */
  async post(url, data) {
    return this.makeRequest('POST', url, data);
  }

  /**
   * Traitement générique des requêtes
   * @param {string} method - Méthode HTTP
   * @param {string} url - URL
   * @param {Object} data - Données optionnelles
   * @returns {Promise<Object>} Réponse
   */
  async makeRequest(method, url, data = null) {
    const request = {
      method,
      url,
      data,
      timestamp: new Date().toISOString()
    };

    this.requests.push(request);

    // Chercher une réponse configurée pour cette URL
    const response = this.responses.get(url) || this.defaultResponse;
    
    if (response.shouldFail) {
      throw new Error(`Mock HTTP ${method} failure for ${url}`);
    }

    return {
      status: response.status,
      data: response.data,
      headers: response.headers || {}
    };
  }

  /**
   * Configurer une réponse pour une URL spécifique
   * @param {string} url - URL à mocker
   * @param {Object} response - Réponse à retourner
   */
  setResponse(url, response) {
    this.responses.set(url, response);
  }

  /**
   * Obtenir les requêtes effectuées
   * @returns {Array} Liste des requêtes
   */
  getRequests() {
    return [...this.requests];
  }

  /**
   * Réinitialiser les mocks
   */
  reset() {
    this.requests = [];
    this.responses.clear();
  }
}

/**
 * Mock pour le logger
 */
class MockLogger {
  constructor() {
    this.logs = [];
    this.levels = ['debug', 'info', 'warn', 'error'];
  }

  /**
   * Log générique
   * @param {string} level - Niveau de log
   * @param {string} message - Message
   * @param {Object} meta - Métadonnées optionnelles
   */
  log(level, message, meta = {}) {
    this.logs.push({
      level,
      message,
      meta,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Méthodes de log par niveau
   */
  debug(message, meta) { this.log('debug', message, meta); }
  info(message, meta) { this.log('info', message, meta); }
  warn(message, meta) { this.log('warn', message, meta); }
  error(message, meta) { this.log('error', message, meta); }

  /**
   * Obtenir les logs par niveau
   * @param {string} level - Niveau à filtrer
   * @returns {Array} Logs du niveau spécifié
   */
  getLogsByLevel(level) {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Obtenir tous les logs
   * @returns {Array} Tous les logs
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * Réinitialiser les logs
   */
  reset() {
    this.logs = [];
  }
}

/**
 * Factory pour créer des mocks de base de données
 */
class MockDatabase {
  constructor() {
    this.queries = [];
    this.results = new Map();
    this.shouldFail = false;
  }

  /**
   * Mock de requête GET (un seul résultat)
   * @param {string} sql - Requête SQL
   * @param {Array} params - Paramètres
   * @returns {Promise<Object>} Résultat mocké
   */
  async get(sql, params = []) {
    this.queries.push({ type: 'get', sql, params, timestamp: Date.now() });
    
    if (this.shouldFail) {
      throw new Error('Mock database failure');
    }

    const key = this.normalizeQuery(sql);
    return this.results.get(key) || null;
  }

  /**
   * Mock de requête ALL (plusieurs résultats)
   * @param {string} sql - Requête SQL
   * @param {Array} params - Paramètres
   * @returns {Promise<Array>} Résultats mockés
   */
  async all(sql, params = []) {
    this.queries.push({ type: 'all', sql, params, timestamp: Date.now() });
    
    if (this.shouldFail) {
      throw new Error('Mock database failure');
    }

    const key = this.normalizeQuery(sql);
    return this.results.get(key) || [];
  }

  /**
   * Mock de requête RUN (INSERT/UPDATE/DELETE)
   * @param {string} sql - Requête SQL
   * @param {Array} params - Paramètres
   * @returns {Promise<Object>} Résultat d'exécution
   */
  async run(sql, params = []) {
    this.queries.push({ type: 'run', sql, params, timestamp: Date.now() });
    
    if (this.shouldFail) {
      throw new Error('Mock database failure');
    }

    return {
      rowCount: 1,
      lastInsertRowid: Date.now()
    };
  }

  /**
   * Configurer un résultat pour une requête
   * @param {string} sql - Requête SQL (sera normalisée)
   * @param {any} result - Résultat à retourner
   */
  setResult(sql, result) {
    const key = this.normalizeQuery(sql);
    this.results.set(key, result);
  }

  /**
   * Normaliser une requête SQL pour la correspondance
   * @param {string} sql - Requête SQL
   * @returns {string} Requête normalisée
   */
  normalizeQuery(sql) {
    return sql
      .replace(/\s+/g, ' ')
      .replace(/\$\d+/g, '?')
      .trim()
      .toLowerCase();
  }

  /**
   * Obtenir les requêtes exécutées
   * @returns {Array} Liste des requêtes
   */
  getQueries() {
    return [...this.queries];
  }

  /**
   * Configurer pour simuler un échec
   * @param {boolean} shouldFail - True pour simuler un échec
   */
  setFailure(shouldFail = true) {
    this.shouldFail = shouldFail;
  }

  /**
   * Réinitialiser les mocks
   */
  reset() {
    this.queries = [];
    this.results.clear();
    this.shouldFail = false;
  }
}

/**
 * Utilitaires pour Jest setup
 */
class MockUtils {
  /**
   * Créer tous les mocks standard pour un test
   * @returns {Object} Objet contenant tous les mocks
   */
  static createStandardMocks() {
    return {
      emailService: new MockEmailService(),
      pdfService: new MockPdfService(),
      httpClient: new MockHttpClient(),
      logger: new MockLogger(),
      database: new MockDatabase()
    };
  }

  /**
   * Réinitialiser tous les mocks
   * @param {Object} mocks - Objet contenant les mocks à réinitialiser
   */
  static resetAllMocks(mocks) {
    Object.values(mocks).forEach(mock => {
      if (mock && typeof mock.reset === 'function') {
        mock.reset();
      }
    });
  }

  /**
   * Configurer des mocks Jest pour les modules
   * @returns {Object} Configuration des mocks Jest
   */
  static setupJestMocks() {
    const mocks = this.createStandardMocks();

    // Configurer les mocks Jest
    jest.mock('../../src/services/EmailService', () => {
      return jest.fn().mockImplementation(() => mocks.emailService);
    });

    jest.mock('../../src/services/PdfService', () => {
      return jest.fn().mockImplementation(() => mocks.pdfService);
    });

    jest.mock('../../src/utils/logManager', () => mocks.logger);

    return mocks;
  }
}

module.exports = {
  MockEmailService,
  MockPdfService,
  MockHttpClient,
  MockLogger,
  MockDatabase,
  MockUtils
};