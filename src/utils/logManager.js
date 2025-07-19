const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config');

class LogManager {
  constructor() {
    this.logger = null;
    this.init();
  }

  init() {
    // Création du dossier logs s'il n'existe pas
    if (!fs.existsSync(config.directories.logs)) {
      fs.mkdirSync(config.directories.logs, { recursive: true });
    }

    // Configuration des formats
    const logFormat = winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    const consoleFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${timestamp} [${level}]: ${message}`;
        
        // Ajout de la stack trace pour les erreurs
        if (stack) {
          log += `\n${stack}`;
        }
        
        // Ajout des métadonnées si présentes
        if (Object.keys(meta).length > 0) {
          log += `\n${JSON.stringify(meta, null, 2)}`;
        }
        
        return log;
      })
    );

    // Configuration des transports
    const transports = [];

    // Transport fichier
    if (config.logging.file.enabled) {
      transports.push(
        new winston.transports.File({
          filename: path.join(config.directories.logs, 'error.log'),
          level: 'error',
          format: logFormat,
          maxsize: config.logging.file.maxsize,
          maxFiles: config.logging.file.maxFiles
        }),
        new winston.transports.File({
          filename: path.join(config.directories.logs, config.logging.file.filename),
          format: logFormat,
          maxsize: config.logging.file.maxsize,
          maxFiles: config.logging.file.maxFiles
        })
      );
    }

    // Transport console (développement)
    if (config.logging.console.enabled) {
      transports.push(
        new winston.transports.Console({
          format: consoleFormat
        })
      );
    }

    // Création du logger
    this.logger = winston.createLogger({
      level: config.logging.level,
      format: logFormat,
      transports,
      exitOnError: false
    });

    // Gestion des exceptions non capturées
    this.logger.exceptions.handle(
      new winston.transports.File({
        filename: path.join(config.directories.logs, 'exceptions.log'),
        format: logFormat
      })
    );

    // Gestion des rejections non capturées
    this.logger.rejections.handle(
      new winston.transports.File({
        filename: path.join(config.directories.logs, 'rejections.log'),
        format: logFormat
      })
    );

    this.info('LogManager initialisé', {
      level: config.logging.level,
      transports: transports.length,
      logDirectory: config.directories.logs
    });
  }

  // Méthodes de logging
  error(message, meta = {}) {
    this.logger.error(message, meta);
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }

  // Méthodes utilitaires
  logRequest(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logData = {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress
      };

      if (res.statusCode >= 400) {
        this.warn('Requête HTTP avec erreur', logData);
      } else {
        this.info('Requête HTTP', logData);
      }
    });

    next();
  }

  logError(error, req = null) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name
    };

    if (req) {
      errorData.request = {
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        body: req.body,
        params: req.params,
        query: req.query
      };
    }

    this.error('Erreur applicative', errorData);
  }

  logPdfGeneration(personnageId, systemeName, status, duration = null, error = null) {
    const logData = {
      personnageId,
      systemeName,
      status,
      duration
    };

    if (error) {
      logData.error = {
        message: error.message,
        stack: error.stack
      };
    }

    if (status === 'success') {
      this.info('Génération PDF réussie', logData);
    } else {
      this.error('Échec génération PDF', logData);
    }
  }

  logAuth(action, userId = null, role = null, success = true, ip = null) {
    const logData = {
      action, // login, logout, role_change, access_denied
      userId,
      role,
      success,
      ip,
      timestamp: new Date().toISOString()
    };

    if (success) {
      this.info(`Authentification: ${action}`, logData);
    } else {
      this.warn(`Échec authentification: ${action}`, logData);
    }
  }

  logDatabaseOperation(operation, table, recordId = null, success = true, error = null) {
    const logData = {
      operation, // create, read, update, delete
      table,
      recordId,
      success
    };

    if (error) {
      logData.error = {
        message: error.message,
        stack: error.stack
      };
    }

    if (success) {
      this.debug(`Base de données: ${operation} ${table}`, logData);
    } else {
      this.error(`Erreur base de données: ${operation} ${table}`, logData);
    }
  }

  // Méthode pour changer le niveau de log à chaud
  setLevel(level) {
    this.logger.level = level;
    this.info(`Niveau de log changé vers: ${level}`);
  }

  // Méthode pour nettoyer les anciens logs
  cleanupLogs(maxAge = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAge);

    try {
      const logFiles = fs.readdirSync(config.directories.logs);
      
      logFiles.forEach(file => {
        const filePath = path.join(config.directories.logs, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          this.info(`Ancien fichier de log supprimé: ${file}`);
        }
      });
    } catch (error) {
      this.error('Erreur lors du nettoyage des logs', { error: error.message });
    }
  }
}

// Export singleton
module.exports = new LogManager();