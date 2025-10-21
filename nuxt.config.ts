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
    '@nuxt/icon',
    '@nuxtjs/i18n'
  ],
  
  // Configuration Pinia pour shared/stores
  pinia: {
    storesDirs: ['../shared/stores/**', './shared/stores/**']
  },
  
  
  // Runtime config
  runtimeConfig: {
    // Private keys (only available on server-side)
    databaseUrl: process.env.DATABASE_URL,
    sessionSecret: process.env.SESSION_SECRET,
    jwtSecret: process.env.JWT_SECRET,
    authBaseUrl: process.env.NUXT_AUTH_BASE_URL || 'http://localhost:3074',
    
    // Public keys (exposed to client-side)
    public: {
      appName: 'brumisa3',
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3074'
    }
  },
  
  // Nitro config for Windows compatibility + Prisma
  nitro: {
    esbuild: {
      options: {
        target: 'node18'
      }
    },
    storage: {
      fs: {
        driver: 'fs',
        base: process.platform === 'win32' ? 'C:\\temp\\brumisa3' : '/tmp/brumisa3'
      }
    },
    experimental: {
      wasm: true
    },
    rollupConfig: {
      external: ['.prisma/client/default']
    }
  },
  
  // Windows-friendly dev server
  devServer: {
    host: process.env.NUXT_HOST || 'localhost',
    port: parseInt(process.env.NUXT_PORT || '3074')
  },
  
  // Auth module configuration
  auth: {
    originEnvKey: 'NUXT_AUTH_BASE_URL',
    provider: {
      type: 'local'
    }
  },
  
  // Icon configuration
  icon: {
    serverBundle: {
      collections: ['heroicons', 'fa6-solid', 'game-icons', 'mdi']
    }
  },

  // i18n configuration
  i18n: {
    locales: [
      {
        code: 'fr',
        name: 'Français',
        files: [
          'fr/common.json',
          'fr/litm-characters.json',
          'fr/litm-cards.json',
          'fr/litm-trackers.json',
          'fr/litm-themebooks.json',
          'fr/litm-ui.json',
          'fr/litm-errors.json'
        ]
      },
      {
        code: 'en',
        name: 'English',
        files: [
          'en/common.json',
          'en/litm-characters.json',
          'en/litm-cards.json',
          'en/litm-trackers.json',
          'en/litm-themebooks.json',
          'en/litm-ui.json',
          'en/litm-errors.json'
        ]
      }
    ],
    lazy: true,
    langDir: 'locales/',
    defaultLocale: 'fr',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'brumisa3_locale',
      redirectOn: 'root',
      alwaysRedirect: false,
      fallbackLocale: 'fr'
    },
    vueI18n: './i18n.config.ts'
  },
  
  // TypeScript config
  typescript: {
    strict: false,
    typeCheck: false
  }
})
