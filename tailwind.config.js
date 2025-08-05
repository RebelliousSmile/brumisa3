/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ejs}",
    "./public/**/*.{js,html}",
    "./src/views/**/*.ejs"
  ],
  safelist: [
    'from-generique',
    'to-generique', 
    'via-generique',
    'bg-gradient-to-r',
    'bg-gradient-to-br',
    'bg-gradient-to-l',
    'bg-gradient-to-t',
    'bg-gradient-to-b'
  ],
  corePlugins: {
    // Forcer la génération des gradients
    gradientColorStops: true,
  },
  theme: {
    extend: {
      colors: {
        // Couleurs principales
        'brand-violet': '#7641d3',
        'brand-violet-dark': '#5c28ae',
        'noir': '#000000',
        'noir-charbon': '#1e1e1e',
        'gris-fonce': '#32373c',
        'gris-clair': '#abb8c3',
        'violet-electrique': '#9b51e0',
        
        // Couleur principale brumisa3
        'generique': '#3b82f6', // Bleu brumisa3 - couleur principale du site
        'generique-dark':'#2563eb',
        
        // Couleurs fonctionnelles
        'succes': '#22c55e', // green-500 (distinct d'emerald)
        'erreur': '#f97316', // orange-500 (distinct du rouge Metro)
        'avertissement': '#eab308', // yellow-500
        'info': '#06b6d4', // cyan-500 (distinct du bleu générique)
        
        // Thématiques par système JDR (uniquement pour différenciation visuelle)
        'monsterhearts': '#8b5cf6', // purple-500 - Violet gothique
        'engrenages': '#10b981', // emerald-500 - Vert émeraude
        'metro2033': '#dc2626', // red-600 - Rouge post-apo
        'mistengine': '#ec4899', // pink-500 - Rose mystique
        'zombiology': '#d4af37', // Or métallique
        
        // Monsterhearts - Gothic Romance (conservé pour compatibilité)
        'monster': {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        // Engrenages - Steampunk (conservé pour compatibilité)
        'gear': {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        // Metro 2033 - Post-Apocalyptic (conservé pour compatibilité)
        'metro': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Mist Engine - Mystical (conservé pour compatibilité)
        'mist': {
          50: '#f7f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        // Zombiology - Survival Horror (conservé pour compatibilité)
        'zombie': {
          50: '#fefaf0',
          100: '#fdf4d9',
          200: '#f9e4a1',
          300: '#f5d066',
          400: '#edb637',
          500: '#d4af37',
          600: '#b8941f',
          700: '#9a7a17',
          800: '#7d6119',
          900: '#684f18',
        }
      },
      fontFamily: {
        // Polices principales de la charte
        'serif': ['Source Serif 4', 'serif'],
        'display': ['Shackleton', 'sans-serif'],
        
        // Polices thématiques par système (conservées pour compatibilité)
        'gothic': ['Crimson Text', 'serif'],
        'steampunk': ['Playfair Display', 'serif'],
        'dystopian': ['Roboto Condensed', 'sans-serif'],
        'mystical': ['Spectral', 'serif'],
        'survival': ['Bebas Neue', 'Impact', 'Arial Black', 'sans-serif']
      },
      fontSize: {
        // Tailles personnalisées selon la charte
        'h1': ['3rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['2.25rem', { lineHeight: '1.25', fontWeight: '600' }],
        'h3': ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h4': ['1.5rem', { lineHeight: '1.35', fontWeight: '500' }],
        'h5': ['1.25rem', { lineHeight: '1.4', fontWeight: '500' }],
        'h6': ['1.125rem', { lineHeight: '1.4', fontWeight: '500' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-small': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'button': ['1rem', { lineHeight: '1', fontWeight: '500' }],
        'nav': ['0.9375rem', { lineHeight: '1', fontWeight: '500' }],
      },
      boxShadow: {
        // Effets personnalisés
        'glow': '0 0 30px rgba(118, 65, 211, 0.5)',
        'glow-sm': '0 0 20px rgba(118, 65, 211, 0.3)',
        'focus-violet': '0 0 0 3px rgba(118, 65, 211, 0.2)',
      },
      animation: {
        // Animation pulse violette
        'pulse-violet': 'pulse-violet 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-violet': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(118, 65, 211, 0.7)' },
          '70%': { boxShadow: '0 0 0 10px rgba(118, 65, 211, 0)' },
        }
      },
      transitionDuration: {
        // Durée standard selon la charte
        'standard': '200ms',
      },
      letterSpacing: {
        // Espacement pour les boutons
        'button': '0.05em',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}