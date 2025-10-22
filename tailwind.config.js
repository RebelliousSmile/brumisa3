/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,vue,ts}",
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue"
  ],
  theme: {
    extend: {
      colors: {
        // Couleur principale brumisa3 (générique)
        'generique': '#3b82f6', // blue-500 - Couleur principale du site

        // Couleurs de base
        'noir': '#000000',
        'noir-charbon': '#1e1e1e',
        'blanc': '#ffffff',
        'gris-fonce': '#32373c',
        'gris-clair': '#abb8c3',

        // Couleurs historiques (legacy - à migrer progressivement)
        'brand-violet': '#7641d3',
        'brand-violet-dark': '#5c28ae',
        'violet-electrique': '#9b51e0',

        // Couleurs de différenciation JDR (contextuelles uniquement)
        'monsterhearts': '#8b5cf6',  // purple-500
        'engrenages': '#d97706',     // amber-600
        'metro2033': '#dc2626',      // red-600
        'mistengine': '#ec4899',     // pink-500
        'zombiology': '#d4af37',     // or métallique

        // Couleurs fonctionnelles (évitent les conflits avec systèmes JDR)
        'succes': '#22c55e',         // green-500 (distinct d'emerald)
        'erreur': '#f97316',         // orange-500 (distinct du rouge Metro)
        'avertissement': '#eab308',  // yellow-500
        'info': '#06b6d4',           // cyan-500 (distinct du bleu générique)

        // Couleurs Otherscape Cyberpunk Design System
        'otherscape': {
          'noir-profond': '#0a0a0a',
          'noir-card': '#1a1a1a',
          'cyan-neon': '#00d9d9',
          'cyan-hover': '#00ffff',
          'cyan-glow': 'rgba(0, 217, 217, 0.5)',
          'rose-neon': '#ff006e',
          'violet-neon': '#9d4edd',
          'blanc': '#ffffff',
          'gris-clair': '#cccccc',
          'gris-moyen': '#999999',
        }
      },
      fontFamily: {
        'display': ['Shackleton', 'sans-serif'],
        'serif': ['Source Serif 4', 'serif'],
        'sans': ['system-ui', 'sans-serif'],
        'otherscape': ['Assistant', 'sans-serif']
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 217, 217, 0.5), 0 0 40px rgba(0, 217, 217, 0.5)',
        'glow-cyan-fort': '0 0 10px #00d9d9, 0 0 20px #00d9d9, 0 0 40px #00d9d9',
        'glow-rose': '0 0 20px rgba(255, 0, 110, 0.5), 0 0 40px rgba(255, 0, 110, 0.5)',
        'glow-violet': '0 0 20px rgba(157, 78, 221, 0.5), 0 0 40px rgba(157, 78, 221, 0.5)',
      },
      textShadow: {
        'glow-cyan': '0 0 20px rgba(0, 217, 217, 0.5), 0 0 40px rgba(0, 217, 217, 0.5)',
        'glow-cyan-fort': '0 0 10px #00d9d9, 0 0 20px #00d9d9, 0 0 40px #00d9d9',
        'glow-rose': '0 0 20px rgba(255, 0, 110, 0.5), 0 0 40px rgba(255, 0, 110, 0.5)',
      },
      backdropBlur: {
        'otherscape': '10px'
      },
      animation: {
        'gauge-fill': 'gauge-fill 0.4s ease-out forwards',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        'gauge-fill': {
          '0%': { width: '4px', opacity: '0.6' },
          '100%': { width: '100%', opacity: '0.15' }
        },
        'scanline': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' }
        }
      }
    },
  },
  plugins: [
    // Plugin pour text-shadow (Tailwind ne l'inclut pas par défaut)
    function({ matchUtilities, theme }) {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') }
      )
    },
  ],
}