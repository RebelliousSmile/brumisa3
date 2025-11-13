module.exports = {
  apps: [
    {
      name: 'brumisa3-nuxt4',
      exec_mode: 'cluster',
      instances: 'max',
      script: './.output/server/index.mjs',
      args: '',
      env: {
        NODE_ENV: 'production',
        NUXT_HOST: '0.0.0.0',
        NUXT_PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        NUXT_HOST: '0.0.0.0',
        NUXT_PORT: 3000
      },
      // Logs
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Restart conditions
      max_memory_restart: '1G',
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: '10s',
      
      // Watch and reload
      watch: false,
      ignore_watch: [
        'node_modules',
        'logs',
        '.nuxt',
        '.output/public'
      ],
      
      // Auto restart on file changes in production (disabled by default)
      // watch_options: {
      //   followSymlinks: false
      // },
      
      // Advanced features
      kill_timeout: 5000,
      listen_timeout: 10000,
      shutdown_with_message: true,
      
      // Windows specific
      windowsHide: true
    }
  ],

  // Deployment configuration for different environments
  deploy: {
    production: {
      user: 'node',
      host: 'SERVER_IP',
      ref: 'origin/main',
      repo: 'GIT_REPOSITORY',
      path: '/var/www/brumisa3-nuxt4',
      'post-deploy': 'pnpm install && pnpm run deploy:build && pm2 reload ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production'
      }
    },
    staging: {
      user: 'node',
      host: 'STAGING_SERVER_IP',
      ref: 'origin/develop',
      repo: 'GIT_REPOSITORY',
      path: '/var/www/brumisa3-nuxt4-staging',
      'post-deploy': 'pnpm install && pnpm run deploy:build && pm2 reload ecosystem.config.js --env staging',
      env: {
        NODE_ENV: 'staging'
      }
    }
  }
}