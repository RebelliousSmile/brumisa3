/**
 * Configuration PM2 pour déploiement production
 * Brumisater - Générateur PDF JDR
 */

module.exports = {
    apps: [
        {
            // Configuration principale
            name: 'brumisater-app',
            script: './src/app.js',
            
            // Mode cluster pour utiliser tous les CPU
            instances: process.env.INSTANCE_COUNT || 'max',
            exec_mode: 'cluster',
            
            // Gestion automatique des processus
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            
            // Variables d'environnement par défaut
            env: {
                NODE_ENV: 'development',
                PORT: 3000,
                LOG_LEVEL: 'debug'
            },
            
            // Variables de production
            env_production: {
                NODE_ENV: 'production',
                PORT: process.env.PORT || 3000,
                LOG_LEVEL: 'info',
                CLUSTER_MODE: 'true'
            },
            
            // Variables de staging
            env_staging: {
                NODE_ENV: 'staging',
                PORT: process.env.PORT || 3001,
                LOG_LEVEL: 'debug'
            },
            
            // Gestion des logs
            log_file: './logs/pm2-combined.log',
            out_file: './logs/pm2-out.log',
            error_file: './logs/pm2-error.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,
            
            // Gestion avancée des processus
            min_uptime: '10s',
            max_restarts: 5,
            restart_delay: 4000,
            
            // Monitoring et métriques
            monitoring: true,
            pmx: true,
            
            // Graceful shutdown
            kill_timeout: parseInt(process.env.GRACEFUL_SHUTDOWN_TIMEOUT) || 30000,
            listen_timeout: 10000,
            
            // Gestion mémoire
            node_args: [
                '--max-old-space-size=1024',
                '--optimize-for-size'
            ],
            
            // Hooks de déploiement
            post_update: ['pnpm install --production', 'pnpm run build:css'],
            
            // Ignore certains patterns pour le watch (si activé)
            ignore_watch: [
                'node_modules',
                'logs',
                'output',
                'uploads',
                '*.log',
                '.git'
            ],
            
            // Variables spécifiques à l'instance
            instance_var: 'INSTANCE_ID',
            
            // Configuration pour le load balancer
            wait_ready: true,
            ready_timeout: 30000
        },
        
        // Processus de queue séparé pour les tâches lourdes
        {
            name: 'brumisater-queue',
            script: './src/workers/queue-worker.js',
            instances: 2, // Moins d'instances pour les queues
            exec_mode: 'cluster',
            
            autorestart: true,
            watch: false,
            max_memory_restart: '512M',
            
            env: {
                NODE_ENV: 'development',
                WORKER_TYPE: 'queue'
            },
            
            env_production: {
                NODE_ENV: 'production',
                WORKER_TYPE: 'queue',
                QUEUE_MAX_CONCURRENCY: 3
            },
            
            log_file: './logs/queue-combined.log',
            out_file: './logs/queue-out.log',
            error_file: './logs/queue-error.log'
        },
        
        // Processus de maintenance/cleanup
        {
            name: 'brumisater-maintenance',
            script: './src/workers/maintenance-worker.js',
            instances: 1,
            exec_mode: 'fork',
            
            autorestart: true,
            watch: false,
            max_memory_restart: '256M',
            
            // Redémarrer tous les jours à 3h du matin
            cron_restart: '0 3 * * *',
            
            env: {
                NODE_ENV: 'development',
                WORKER_TYPE: 'maintenance'
            },
            
            env_production: {
                NODE_ENV: 'production',
                WORKER_TYPE: 'maintenance',
                CLEANUP_INTERVAL: '3600000' // 1 heure
            },
            
            log_file: './logs/maintenance-combined.log',
            out_file: './logs/maintenance-out.log',
            error_file: './logs/maintenance-error.log'
        }
    ],
    
    // Configuration de déploiement
    deploy: {
        // Déploiement de production
        production: {
            user: 'deploy',
            host: ['generateur-pdf-jdr.fr'],
            ref: 'origin/main',
            repo: 'git@github.com:user/generateur-pdf-jdr.git',
            path: '/var/www/brumisater',
            
            // Commandes de déploiement
            'pre-setup': 'sudo mkdir -p /var/www/brumisater',
            'post-setup': 'sudo chown -R deploy:deploy /var/www/brumisater',
            
            'pre-deploy-local': 'echo "Préparation du déploiement local..."',
            'pre-deploy': 'git fetch --all && git reset --hard origin/main',
            
            'post-deploy': [
                'pnpm install --production',
                'pnpm run build:css',
                'pnpm run db:migrate',
                'mkdir -p logs output uploads',
                'chmod +x scripts/deploy/*.sh',
                './scripts/deploy/setup-permissions.sh',
                'pm2 reload ecosystem.config.js --env production',
                'pm2 save'
            ].join(' && '),
            
            // Variables d'environnement spécifiques au déploiement
            env: {
                NODE_ENV: 'production',
                PM2_SERVE_PATH: '/var/www/brumisater/source',
                PM2_SERVE_PORT: 8080
            }
        },
        
        // Déploiement de staging
        staging: {
            user: 'deploy',
            host: ['staging.generateur-pdf-jdr.fr'],
            ref: 'origin/develop',
            repo: 'git@github.com:user/generateur-pdf-jdr.git',
            path: '/var/www/brumisater-staging',
            
            'post-deploy': [
                'pnpm install',
                'pnpm run build:css',
                'pnpm run db:migrate',
                'mkdir -p logs output uploads',
                'pm2 reload ecosystem.config.js --env staging',
                'pm2 save'
            ].join(' && '),
            
            env: {
                NODE_ENV: 'staging'
            }
        }
    }
};