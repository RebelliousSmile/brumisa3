#!/usr/bin/env node

/**
 * Script de validation Phase 6 : Performance et Production
 * Vérifie que toutes les optimisations et configurations sont en place
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execAsync = util.promisify(exec);

// Configuration des vérifications
const REQUIRED_FILES = [
    // Services de performance
    'src/services/CacheService.js',
    'src/services/QueueService.js', 
    'src/services/PerformanceMonitoringService.js',
    'src/services/SecurityService.js',
    'src/services/LoggingService.js',
    
    // Middleware
    'src/middleware/performance.js',
    
    // Workers
    'src/workers/queue-worker.js',
    'src/workers/maintenance-worker.js',
    
    // Configuration production
    '.env.production',
    'ecosystem.config.js',
    'nginx.conf',
    
    // Scripts de déploiement
    'scripts/deploy/deploy.sh',
    'scripts/deploy/setup-permissions.sh',
    'scripts/backup/auto-backup.sh',
    'scripts/monitoring/health-check.js',
    
    // Application optimisée
    'src/app-production.js'
];

const PERFORMANCE_TARGETS = {
    pdf_generation: 2000, // 2 secondes selon TODO.md
    api_response: 500     // 500ms selon TODO.md
};

/**
 * Classe de validation Phase 6
 */
class Phase6Validator {
    constructor() {
        this.results = [];
        this.errors = [];
        this.warnings = [];
        this.startTime = Date.now();
    }

    /**
     * Log un résultat de validation
     */
    logResult(check, status, message, details = {}) {
        const result = {
            check,
            status, // 'pass', 'fail', 'warning'
            message,
            details,
            timestamp: Date.now()
        };
        
        this.results.push(result);
        
        const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
        console.log(`${icon} ${check}: ${message}`);
        
        if (status === 'fail') {
            this.errors.push(result);
        } else if (status === 'warning') {
            this.warnings.push(result);
        }
    }

    /**
     * Vérifie la présence des fichiers requis
     */
    async checkRequiredFiles() {
        console.log('\n📁 Vérification des fichiers requis...');
        
        let missingFiles = [];
        
        for (const file of REQUIRED_FILES) {
            const fullPath = path.resolve(file);
            
            try {
                const stats = fs.statSync(fullPath);
                
                if (stats.isFile()) {
                    this.logResult(
                        `file_${path.basename(file)}`,
                        'pass',
                        `Fichier présent: ${file}`,
                        { size: stats.size, path: fullPath }
                    );
                } else {
                    this.logResult(
                        `file_${path.basename(file)}`,
                        'fail',
                        `N'est pas un fichier: ${file}`
                    );
                    missingFiles.push(file);
                }
            } catch (error) {
                this.logResult(
                    `file_${path.basename(file)}`,
                    'fail',
                    `Fichier manquant: ${file}`,
                    { error: error.message }
                );
                missingFiles.push(file);
            }
        }
        
        if (missingFiles.length === 0) {
            this.logResult('required_files', 'pass', 
                `Tous les fichiers requis sont présents (${REQUIRED_FILES.length})`);
        } else {
            this.logResult('required_files', 'fail', 
                `${missingFiles.length} fichiers manquants`, 
                { missingFiles });
        }
    }

    /**
     * Vérifie la configuration des variables d'environnement
     */
    async checkEnvironmentConfig() {
        console.log('\n🔧 Vérification de la configuration environnement...');
        
        const productionEnvPath = path.resolve('.env.production');
        
        try {
            const envContent = fs.readFileSync(productionEnvPath, 'utf8');
            const envVars = envContent.split('\n')
                .filter(line => line.includes('=') && !line.startsWith('#'))
                .map(line => line.split('=')[0]);
            
            // Variables critiques pour la production
            const criticalVars = [
                'NODE_ENV',
                'DATABASE_URL',
                'SESSION_SECRET',
                'HTTPS_ENABLED',
                'SSL_CERT_PATH',
                'SSL_KEY_PATH',
                'LOG_LEVEL',
                'CACHE_DEFAULT_TTL',
                'QUEUE_MAX_CONCURRENCY',
                'PDF_GENERATION_TARGET',
                'API_RESPONSE_TARGET'
            ];
            
            const missingCritical = criticalVars.filter(v => !envVars.includes(v));
            
            if (missingCritical.length === 0) {
                this.logResult('env_config', 'pass', 
                    'Configuration environnement complète',
                    { totalVars: envVars.length, criticalVars: criticalVars.length });
            } else {
                this.logResult('env_config', 'fail', 
                    'Variables d\'environnement critiques manquantes',
                    { missing: missingCritical });
            }
            
            // Vérifier les valeurs par défaut dangereuses
            const dangerousDefaults = [
                'SESSION_SECRET=your-super-secret',
                'CODE_PREMIUM=123456',
                'CODE_ADMIN=789012'
            ];
            
            const foundDangerous = dangerousDefaults.filter(d => 
                envContent.includes(d.split('=')[1]));
                
            if (foundDangerous.length > 0) {
                this.logResult('env_security', 'fail', 
                    'Valeurs par défaut dangereuses détectées',
                    { dangerous: foundDangerous });
            } else {
                this.logResult('env_security', 'pass', 
                    'Pas de valeurs par défaut dangereuses');
            }
            
        } catch (error) {
            this.logResult('env_config', 'fail', 
                'Impossible de lire .env.production',
                { error: error.message });
        }
    }

    /**
     * Vérifie la configuration PM2
     */
    async checkPM2Config() {
        console.log('\n🔄 Vérification de la configuration PM2...');
        
        try {
            const ecosystemPath = path.resolve('ecosystem.config.js');
            const ecosystemContent = fs.readFileSync(ecosystemPath, 'utf8');
            
            const requiredPM2Features = [
                'cluster',
                'max_memory_restart',
                'env_production',
                'log_file',
                'graceful_shutdown'
            ];
            
            const presentFeatures = requiredPM2Features.filter(feature => 
                ecosystemContent.includes(feature));
            
            if (presentFeatures.length === requiredPM2Features.length) {
                this.logResult('pm2_config', 'pass', 
                    'Configuration PM2 complète',
                    { features: presentFeatures });
            } else {
                const missing = requiredPM2Features.filter(f => 
                    !presentFeatures.includes(f));
                this.logResult('pm2_config', 'warning', 
                    'Configuration PM2 incomplète',
                    { missing, present: presentFeatures });
            }
            
            // Vérifier les workers
            if (ecosystemContent.includes('queue-worker') && 
                ecosystemContent.includes('maintenance-worker')) {
                this.logResult('pm2_workers', 'pass', 
                    'Workers PM2 configurés');
            } else {
                this.logResult('pm2_workers', 'warning', 
                    'Workers PM2 manquants ou mal configurés');
            }
            
        } catch (error) {
            this.logResult('pm2_config', 'fail', 
                'Erreur lors de la vérification PM2',
                { error: error.message });
        }
    }

    /**
     * Vérifie la configuration Nginx
     */
    async checkNginxConfig() {
        console.log('\n🌐 Vérification de la configuration Nginx...');
        
        try {
            const nginxPath = path.resolve('nginx.conf');
            const nginxContent = fs.readFileSync(nginxPath, 'utf8');
            
            const requiredNginxFeatures = [
                'ssl_protocols',
                'gzip on',
                'limit_req_zone',
                'proxy_pass',
                'add_header X-Frame-Options',
                'upstream brumisater_app',
                'location /health',
                'location /metrics'
            ];
            
            const presentFeatures = requiredNginxFeatures.filter(feature => 
                nginxContent.includes(feature));
            
            if (presentFeatures.length >= requiredNginxFeatures.length * 0.8) {
                this.logResult('nginx_config', 'pass', 
                    'Configuration Nginx appropriée',
                    { features: presentFeatures.length, total: requiredNginxFeatures.length });
            } else {
                this.logResult('nginx_config', 'warning', 
                    'Configuration Nginx incomplète',
                    { present: presentFeatures.length, total: requiredNginxFeatures.length });
            }
            
        } catch (error) {
            this.logResult('nginx_config', 'warning', 
                'Fichier nginx.conf non trouvé (normal si non utilisé)',
                { error: error.message });
        }
    }

    /**
     * Vérifie les services de performance
     */
    async checkPerformanceServices() {
        console.log('\n⚡ Vérification des services de performance...');
        
        const serviceChecks = [
            {
                name: 'CacheService',
                file: 'src/services/CacheService.js',
                methods: ['set', 'get', 'getOrSet', 'cleanup', 'getStats']
            },
            {
                name: 'QueueService', 
                file: 'src/services/QueueService.js',
                methods: ['add', 'processQueue', 'getGlobalStats']
            },
            {
                name: 'PerformanceMonitoringService',
                file: 'src/services/PerformanceMonitoringService.js',
                methods: ['middleware', 'recordRequest', 'generatePerformanceReport']
            }
        ];
        
        for (const service of serviceChecks) {
            try {
                const servicePath = path.resolve(service.file);
                const serviceContent = fs.readFileSync(servicePath, 'utf8');
                
                const presentMethods = service.methods.filter(method => 
                    serviceContent.includes(method));
                
                if (presentMethods.length >= service.methods.length * 0.8) {
                    this.logResult(`service_${service.name}`, 'pass', 
                        `${service.name} complet`,
                        { methods: presentMethods.length, total: service.methods.length });
                } else {
                    this.logResult(`service_${service.name}`, 'warning', 
                        `${service.name} incomplet`,
                        { present: presentMethods, missing: service.methods.filter(m => !presentMethods.includes(m)) });
                }
                
            } catch (error) {
                this.logResult(`service_${service.name}`, 'fail', 
                    `Erreur lors de la vérification de ${service.name}`,
                    { error: error.message });
            }
        }
    }

    /**
     * Vérifie les cibles de performance
     */
    async checkPerformanceTargets() {
        console.log('\n🎯 Vérification des cibles de performance...');
        
        // Vérifier que les cibles sont définies dans le code
        try {
            const appProductionPath = path.resolve('src/app-production.js');
            const appContent = fs.readFileSync(appProductionPath, 'utf8');
            
            const hasApiTarget = appContent.includes('500ms') || appContent.includes('API_RESPONSE_TARGET');
            const hasPdfTarget = appContent.includes('2000ms') || appContent.includes('PDF_GENERATION_TARGET');
            
            if (hasApiTarget && hasPdfTarget) {
                this.logResult('performance_targets', 'pass', 
                    'Cibles de performance configurées (API: 500ms, PDF: 2s)');
            } else {
                this.logResult('performance_targets', 'warning', 
                    'Cibles de performance non configurées',
                    { hasApiTarget, hasPdfTarget });
            }
            
        } catch (error) {
            this.logResult('performance_targets', 'warning', 
                'Impossible de vérifier les cibles de performance',
                { error: error.message });
        }
        
        // Vérifier la présence du monitoring
        try {
            const perfMiddlewarePath = path.resolve('src/middleware/performance.js');
            const perfContent = fs.readFileSync(perfMiddlewarePath, 'utf8');
            
            if (perfContent.includes('monitorAPI') && perfContent.includes('monitorPDF')) {
                this.logResult('performance_monitoring', 'pass', 
                    'Monitoring de performance configuré');
            } else {
                this.logResult('performance_monitoring', 'warning', 
                    'Monitoring de performance incomplet');
            }
            
        } catch (error) {
            this.logResult('performance_monitoring', 'fail', 
                'Middleware de monitoring manquant',
                { error: error.message });
        }
    }

    /**
     * Vérifie les scripts de déploiement
     */
    async checkDeploymentScripts() {
        console.log('\n🚀 Vérification des scripts de déploiement...');
        
        const deploymentScripts = [
            'scripts/deploy/deploy.sh',
            'scripts/deploy/setup-permissions.sh',
            'scripts/backup/auto-backup.sh',
            'scripts/monitoring/health-check.js'
        ];
        
        for (const script of deploymentScripts) {
            try {
                const scriptPath = path.resolve(script);
                const stats = fs.statSync(scriptPath);
                
                // Vérifier que les scripts sont exécutables
                const isExecutable = (stats.mode & parseInt('111', 8)) !== 0;
                
                if (isExecutable || script.endsWith('.js')) {
                    this.logResult(`script_${path.basename(script, path.extname(script))}`, 
                        'pass', 
                        `Script déploiement OK: ${path.basename(script)}`,
                        { size: stats.size, executable: isExecutable });
                } else {
                    this.logResult(`script_${path.basename(script, path.extname(script))}`, 
                        'warning', 
                        `Script non exécutable: ${path.basename(script)}`);
                }
                
            } catch (error) {
                this.logResult(`script_${path.basename(script, path.extname(script))}`, 
                    'fail', 
                    `Script manquant: ${path.basename(script)}`,
                    { error: error.message });
            }
        }
    }

    /**
     * Vérifie les dépendances de production
     */
    async checkDependencies() {
        console.log('\n📦 Vérification des dépendances...');
        
        try {
            const packagePath = path.resolve('package.json');
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            
            const productionDeps = [
                'winston',        // Logging avancé
                'helmet',         // Sécurité
                'express-rate-limit', // Rate limiting
                // Les autres sont déjà présentes
            ];
            
            const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
            const missingDeps = productionDeps.filter(dep => !dependencies[dep]);
            
            if (missingDeps.length === 0) {
                this.logResult('dependencies', 'pass', 
                    'Toutes les dépendances de production présentes');
            } else {
                this.logResult('dependencies', 'warning', 
                    'Dépendances manquantes pour production optimale',
                    { missing: missingDeps });
            }
            
            // Vérifier les scripts package.json
            const requiredScripts = [
                'start',
                'build:css', 
                'test',
                'lint'
            ];
            
            const presentScripts = requiredScripts.filter(script => 
                packageJson.scripts && packageJson.scripts[script]);
            
            if (presentScripts.length >= requiredScripts.length * 0.8) {
                this.logResult('package_scripts', 'pass', 
                    'Scripts package.json appropriés');
            } else {
                this.logResult('package_scripts', 'warning', 
                    'Scripts package.json incomplets',
                    { present: presentScripts, required: requiredScripts });
            }
            
        } catch (error) {
            this.logResult('dependencies', 'fail', 
                'Erreur lors de la vérification des dépendances',
                { error: error.message });
        }
    }

    /**
     * Génère le rapport final
     */
    generateReport() {
        const duration = Date.now() - this.startTime;
        
        const summary = {
            total: this.results.length,
            passed: this.results.filter(r => r.status === 'pass').length,
            failed: this.errors.length,
            warnings: this.warnings.length
        };
        
        const successRate = Math.round((summary.passed / summary.total) * 100);
        
        console.log('\n' + '='.repeat(60));
        console.log('📊 RAPPORT DE VALIDATION PHASE 6 - PERFORMANCE ET PRODUCTION');
        console.log('='.repeat(60));
        
        console.log(`\n🎯 Résumé:`);
        console.log(`   Total des vérifications: ${summary.total}`);
        console.log(`   ✅ Réussies: ${summary.passed} (${successRate}%)`);
        console.log(`   ❌ Échouées: ${summary.failed}`);
        console.log(`   ⚠️ Avertissements: ${summary.warnings}`);
        console.log(`   ⏱️ Durée: ${duration}ms`);
        
        if (this.errors.length > 0) {
            console.log('\n❌ Erreurs critiques:');
            this.errors.forEach(error => {
                console.log(`   - ${error.check}: ${error.message}`);
            });
        }
        
        if (this.warnings.length > 0) {
            console.log('\n⚠️ Avertissements:');
            this.warnings.forEach(warning => {
                console.log(`   - ${warning.check}: ${warning.message}`);
            });
        }
        
        // Statut global
        let globalStatus = 'SUCCESS';
        let exitCode = 0;
        
        if (this.errors.length > 0) {
            globalStatus = 'FAILED';
            exitCode = 1;
        } else if (this.warnings.length > 0) {
            globalStatus = 'WARNING';
        }
        
        console.log(`\n🏁 Statut global: ${globalStatus}`);
        
        if (globalStatus === 'SUCCESS') {
            console.log('\n🎉 Phase 6 : Performance et Production - VALIDÉE !');
            console.log('✅ L\'application est prête pour un déploiement production optimisé');
            console.log('📈 Cibles: API < 500ms, PDF < 2s');
            console.log('🔒 Sécurité et monitoring configurés');
        } else if (globalStatus === 'WARNING') {
            console.log('\n⚠️ Phase 6 : Performance et Production - PARTIELLEMENT VALIDÉE');
            console.log('📝 Corrigez les avertissements pour un déploiement optimal');
        } else {
            console.log('\n❌ Phase 6 : Performance et Production - ÉCHEC');
            console.log('🔧 Corrigez les erreurs critiques avant le déploiement');
        }
        
        return exitCode;
    }

    /**
     * Exécute toutes les validations
     */
    async runAllValidations() {
        console.log('🔍 Validation Phase 6 : Performance et Production');
        console.log('📅 ' + new Date().toISOString());
        
        await this.checkRequiredFiles();
        await this.checkEnvironmentConfig();
        await this.checkPM2Config();
        await this.checkNginxConfig();
        await this.checkPerformanceServices();
        await this.checkPerformanceTargets();
        await this.checkDeploymentScripts();
        await this.checkDependencies();
        
        return this.generateReport();
    }
}

// Fonction principale
async function main() {
    const validator = new Phase6Validator();
    
    try {
        const exitCode = await validator.runAllValidations();
        process.exit(exitCode);
        
    } catch (error) {
        console.error('❌ Erreur fatale lors de la validation:', error);
        process.exit(2);
    }
}

// Exécuter si appelé directement
if (require.main === module) {
    main().catch(error => {
        console.error('Erreur fatale:', error);
        process.exit(2);
    });
}

module.exports = Phase6Validator;