// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  // Nuxt 4 - structure avec app/ directory
  srcDir: 'app/',
  
  // Modules
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss', 
    '@sidebase/nuxt-auth',
    '@nuxt/icon'
  ],
  
  // Configuration Pinia pour shared/stores
  pinia: {
    storesDirs: ['../shared/stores/**']
  },
  
  
  // Runtime config
  runtimeConfig: {
    // Private keys (only available on server-side)
    databaseUrl: process.env.DATABASE_URL,
    sessionSecret: process.env.SESSION_SECRET,
    jwtSecret: process.env.JWT_SECRET,
    
    // Public keys (exposed to client-side)
    public: {
      appName: 'brumisater',
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }
  },
  
  // Nitro config for Windows compatibility
  nitro: {
    esbuild: {
      options: {
        target: 'node18'
      }
    },
    storage: {
      fs: {
        driver: 'fs',
        base: process.platform === 'win32' ? 'C:\\temp\\brumisater' : '/tmp/brumisater'
      }
    }
  },
  
  // Windows-friendly dev server
  devServer: {
    host: process.env.NUXT_HOST || 'localhost',
    port: parseInt(process.env.NUXT_PORT || '3000')
  },
  
  // Build config
  build: {
    transpile: ['@prisma/client']
  },
  
  // Auth module configuration
  auth: {
    baseURL: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000',
    provider: {
      type: 'local'
    }
  },
  
  // TypeScript config
  typescript: {
    strict: false,
    typeCheck: false
  }
})
