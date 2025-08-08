const BaseService = require('./BaseService');
const { EventEmitter } = require('events');

/**
 * Service de queue pour traitement asynchrone des tâches
 * Implémentation simple sans dépendance externe (Redis/Bull)
 * Compatible avec l'architecture Windows du projet
 */
class QueueService extends BaseService {
    constructor() {
        super('QueueService');
        this.queues = new Map();
        this.workers = new Map();
        this.stats = {
            totalJobs: 0,
            completedJobs: 0,
            failedJobs: 0,
            activeJobs: 0
        };
        
        // Configuration
        this.config = {
            maxConcurrency: parseInt(process.env.QUEUE_MAX_CONCURRENCY) || 3,
            jobTimeout: parseInt(process.env.QUEUE_JOB_TIMEOUT) || 60000, // 1 minute
            retryAttempts: parseInt(process.env.QUEUE_RETRY_ATTEMPTS) || 3,
            retryDelay: parseInt(process.env.QUEUE_RETRY_DELAY) || 5000 // 5 secondes
        };
        
        // Event emitter pour les événements de queue
        this.emitter = new EventEmitter();
        
        this.log('info', 'QueueService initialisé', {
            maxConcurrency: this.config.maxConcurrency,
            jobTimeout: this.config.jobTimeout
        });
        
        // Créer les queues par défaut
        this.createQueue('pdf-generation', {
            maxConcurrency: 2, // Limiter pour génération PDF
            jobTimeout: 120000  // 2 minutes pour PDF
        });
        
        this.createQueue('email', {
            maxConcurrency: 5,
            jobTimeout: 30000   // 30 secondes pour emails
        });
        
        this.createQueue('cleanup', {
            maxConcurrency: 1,
            jobTimeout: 300000  // 5 minutes pour cleanup
        });
    }

    /**
     * Crée une nouvelle queue
     * 
     * @param {string} name - Nom de la queue
     * @param {Object} options - Options de la queue
     */
    createQueue(name, options = {}) {
        if (this.queues.has(name)) {
            throw new Error(`Queue ${name} existe déjà`);
        }
        
        const queue = {
            name,
            jobs: [],
            processing: [],
            completed: [],
            failed: [],
            maxConcurrency: options.maxConcurrency || this.config.maxConcurrency,
            jobTimeout: options.jobTimeout || this.config.jobTimeout,
            paused: false
        };
        
        this.queues.set(name, queue);
        this.workers.set(name, new Set());
        
        this.log('info', 'Queue créée', { 
            name, 
            maxConcurrency: queue.maxConcurrency 
        });
        
        return queue;
    }

    /**
     * Ajoute un job à la queue
     * 
     * @param {string} queueName - Nom de la queue
     * @param {string} jobType - Type de job
     * @param {Object} data - Données du job
     * @param {Object} options - Options du job
     * @returns {Object} Job créé
     */
    add(queueName, jobType, data, options = {}) {
        const queue = this.queues.get(queueName);
        if (!queue) {
            throw new Error(`Queue ${queueName} n'existe pas`);
        }
        
        const job = {
            id: this.generateJobId(),
            type: jobType,
            data,
            options: {
                priority: options.priority || 0,
                delay: options.delay || 0,
                attempts: options.attempts || this.config.retryAttempts,
                timeout: options.timeout || queue.jobTimeout,
                ...options
            },
            status: 'waiting',
            createdAt: Date.now(),
            attemptsCount: 0,
            errors: []
        };
        
        // Insérer le job selon la priorité
        this.insertJobByPriority(queue, job);
        
        this.stats.totalJobs++;
        
        this.log('debug', 'Job ajouté', {
            queueName,
            jobId: job.id,
            jobType,
            priority: job.options.priority
        });
        
        this.emitter.emit('job:added', { queueName, job });
        
        // Traiter la queue si pas en pause
        if (!queue.paused) {
            this.processQueue(queueName);
        }
        
        return job;
    }

    /**
     * Insère un job dans la queue selon sa priorité
     */
    insertJobByPriority(queue, job) {
        const priority = job.options.priority;
        let inserted = false;
        
        for (let i = 0; i < queue.jobs.length; i++) {
            if (queue.jobs[i].options.priority < priority) {
                queue.jobs.splice(i, 0, job);
                inserted = true;
                break;
            }
        }
        
        if (!inserted) {
            queue.jobs.push(job);
        }
    }

    /**
     * Traite les jobs d'une queue
     * 
     * @param {string} queueName - Nom de la queue
     */
    async processQueue(queueName) {
        const queue = this.queues.get(queueName);
        if (!queue || queue.paused) {
            return;
        }
        
        // Vérifier le nombre de workers actifs
        const activeWorkers = this.workers.get(queueName).size;
        if (activeWorkers >= queue.maxConcurrency) {
            return;
        }
        
        // Récupérer le prochain job
        const job = this.getNextJob(queue);
        if (!job) {
            return;
        }
        
        // Démarrer un worker pour ce job
        this.startWorker(queueName, job);
        
        // Continuer à traiter d'autres jobs si possible
        setImmediate(() => this.processQueue(queueName));
    }

    /**
     * Récupère le prochain job à traiter
     */
    getNextJob(queue) {
        const now = Date.now();
        
        for (let i = 0; i < queue.jobs.length; i++) {
            const job = queue.jobs[i];
            
            // Vérifier le délai
            if (job.createdAt + job.options.delay <= now) {
                return queue.jobs.splice(i, 1)[0];
            }
        }
        
        return null;
    }

    /**
     * Démarre un worker pour traiter un job
     */
    async startWorker(queueName, job) {
        const queue = this.queues.get(queueName);
        const workers = this.workers.get(queueName);
        
        const workerId = `${queueName}-${job.id}`;
        workers.add(workerId);
        
        // Déplacer le job vers processing
        job.status = 'processing';
        job.startedAt = Date.now();
        queue.processing.push(job);
        
        this.stats.activeJobs++;
        
        this.log('debug', 'Worker démarré', {
            queueName,
            jobId: job.id,
            workerId
        });
        
        this.emitter.emit('job:started', { queueName, job });
        
        try {
            // Exécuter le job avec timeout
            const result = await Promise.race([
                this.executeJob(job),
                this.jobTimeout(job.options.timeout)
            ]);
            
            // Job réussi
            job.status = 'completed';
            job.completedAt = Date.now();
            job.result = result;
            
            // Déplacer vers completed
            this.removeFromProcessing(queue, job);
            queue.completed.push(job);
            
            this.stats.completedJobs++;
            this.stats.activeJobs--;
            
            this.log('info', 'Job terminé', {
                queueName,
                jobId: job.id,
                duration: job.completedAt - job.startedAt
            });
            
            this.emitter.emit('job:completed', { queueName, job });
            
        } catch (error) {
            // Job échoué
            job.attemptsCount++;
            job.errors.push({
                error: error.message,
                timestamp: Date.now(),
                attempt: job.attemptsCount
            });
            
            this.logError(error, {
                queueName,
                jobId: job.id,
                attempt: job.attemptsCount
            });
            
            // Retry si possible
            if (job.attemptsCount < job.options.attempts) {
                job.status = 'waiting';
                job.retryAt = Date.now() + this.config.retryDelay;
                
                // Remettre dans la queue pour retry
                this.removeFromProcessing(queue, job);
                queue.jobs.push(job);
                
                this.log('info', 'Job programmé pour retry', {
                    queueName,
                    jobId: job.id,
                    attempt: job.attemptsCount,
                    maxAttempts: job.options.attempts
                });
                
                this.emitter.emit('job:retry', { queueName, job });
                
            } else {
                // Échec définitif
                job.status = 'failed';
                job.failedAt = Date.now();
                
                this.removeFromProcessing(queue, job);
                queue.failed.push(job);
                
                this.stats.failedJobs++;
                
                this.log('error', 'Job échoué définitivement', {
                    queueName,
                    jobId: job.id,
                    totalAttempts: job.attemptsCount
                });
                
                this.emitter.emit('job:failed', { queueName, job });
            }
            
            this.stats.activeJobs--;
        } finally {
            // Nettoyer le worker
            workers.delete(workerId);
            
            // Continuer à traiter la queue
            setImmediate(() => this.processQueue(queueName));
        }
    }

    /**
     * Exécute un job selon son type
     */
    async executeJob(job) {
        switch (job.type) {
            case 'pdf-generation':
                return await this.executePdfGeneration(job);
            case 'email-send':
                return await this.executeEmailSend(job);
            case 'cleanup-files':
                return await this.executeCleanupFiles(job);
            default:
                throw new Error(`Type de job inconnu: ${job.type}`);
        }
    }

    /**
     * Exécute la génération PDF
     */
    async executePdfGeneration(job) {
        const { pdfId, donnees, options } = job.data;
        
        // Importer dynamiquement le PdfService pour éviter la dépendance circulaire
        const PdfService = require('./PdfService');
        const pdfService = new PdfService();
        
        // Exécuter la génération
        await pdfService.genererPdfAsync(pdfId, donnees, options);
        
        return { pdfId, status: 'generated' };
    }

    /**
     * Exécute l'envoi d'email
     */
    async executeEmailSend(job) {
        const { to, subject, html, template, data } = job.data;
        
        const EmailService = require('./EmailService');
        const emailService = new EmailService();
        
        if (template) {
            await emailService.envoyerAvecTemplate(to, template, data, subject);
        } else {
            await emailService.envoyerEmail(to, subject, html);
        }
        
        return { to, subject, sent: true };
    }

    /**
     * Exécute le nettoyage de fichiers
     */
    async executeCleanupFiles(job) {
        const { type, olderThan } = job.data;
        
        let cleaned = 0;
        
        if (type === 'pdf') {
            const PdfService = require('./PdfService');
            const pdfService = new PdfService();
            cleaned = await pdfService.nettoyerPdfsExpires();
        }
        
        return { type, cleaned };
    }

    /**
     * Supprime un job du processing
     */
    removeFromProcessing(queue, job) {
        const index = queue.processing.findIndex(j => j.id === job.id);
        if (index !== -1) {
            queue.processing.splice(index, 1);
        }
    }

    /**
     * Timeout pour les jobs
     */
    jobTimeout(timeout) {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Job timeout après ${timeout}ms`));
            }, timeout);
        });
    }

    /**
     * Met en pause une queue
     */
    pauseQueue(queueName) {
        const queue = this.queues.get(queueName);
        if (queue) {
            queue.paused = true;
            this.log('info', 'Queue mise en pause', { queueName });
        }
    }

    /**
     * Reprend une queue
     */
    resumeQueue(queueName) {
        const queue = this.queues.get(queueName);
        if (queue) {
            queue.paused = false;
            this.log('info', 'Queue reprise', { queueName });
            this.processQueue(queueName);
        }
    }

    /**
     * Obtient le statut d'une queue
     */
    getQueueStatus(queueName) {
        const queue = this.queues.get(queueName);
        if (!queue) {
            throw new Error(`Queue ${queueName} n'existe pas`);
        }
        
        const workers = this.workers.get(queueName);
        
        return {
            name: queueName,
            paused: queue.paused,
            waiting: queue.jobs.length,
            processing: queue.processing.length,
            completed: queue.completed.length,
            failed: queue.failed.length,
            activeWorkers: workers.size,
            maxConcurrency: queue.maxConcurrency
        };
    }

    /**
     * Obtient les statistiques globales
     */
    getGlobalStats() {
        return {
            ...this.stats,
            queues: Array.from(this.queues.keys()).map(name => ({
                name,
                ...this.getQueueStatus(name)
            }))
        };
    }

    /**
     * Génère un ID unique pour les jobs
     */
    generateJobId() {
        return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    /**
     * Event listeners pour monitoring
     */
    on(event, listener) {
        this.emitter.on(event, listener);
    }

    /**
     * Méthodes utilitaires pour les services
     */
    static create() {
        if (!QueueService.instance) {
            QueueService.instance = new QueueService();
        }
        return QueueService.instance;
    }

    /**
     * Types de jobs prédéfinis
     */
    static JobTypes = {
        PDF_GENERATION: 'pdf-generation',
        EMAIL_SEND: 'email-send',
        CLEANUP_FILES: 'cleanup-files'
    };

    /**
     * Noms de queues prédéfinis
     */
    static Queues = {
        PDF: 'pdf-generation',
        EMAIL: 'email',
        CLEANUP: 'cleanup'
    };
}

module.exports = QueueService;