import {
  defineConfig,
  presetUno,
  presetTypography,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetTypography(),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  theme: {
    colors: {
      // Couleur principale brumisa3 (générique)
      'generique': '#3b82f6',

      // Couleurs de base
      'noir': '#000000',
      'noir-charbon': '#1e1e1e',
      'blanc': '#ffffff',
      'gris-fonce': '#32373c',
      'gris-clair': '#abb8c3',

      // Couleurs historiques (legacy)
      'brand-violet': '#7641d3',
      'brand-violet-dark': '#5c28ae',
      'violet-electrique': '#9b51e0',

      // Couleurs JDR
      'monsterhearts': '#8b5cf6',
      'engrenages': '#d97706',
      'metro2033': '#dc2626',
      'mistengine': '#ec4899',
      'zombiology': '#d4af37',

      // Couleurs fonctionnelles
      'succes': '#22c55e',
      'erreur': '#f97316',
      'avertissement': '#eab308',
      'info': '#06b6d4',

      // Couleurs Otherscape Cyberpunk
      'otherscape-noir-profond': '#0a0a0a',
      'otherscape-noir-card': '#1a1a1a',
      'otherscape-cyan-neon': '#00d9d9',
      'otherscape-cyan-hover': '#00ffff',
      'otherscape-cyan-glow': 'rgba(0, 217, 217, 0.5)',
      'otherscape-rose-neon': '#ff006e',
      'otherscape-violet-neon': '#9d4edd',
      'otherscape-blanc': '#ffffff',
      'otherscape-gris-clair': '#cccccc',
      'otherscape-gris-moyen': '#999999',
    },
    fontFamily: {
      'display': 'Shackleton, sans-serif',
      'serif': 'Source Serif 4, serif',
      'sans': 'system-ui, sans-serif',
      'otherscape': 'Assistant, sans-serif'
    },
    boxShadow: {
      'glow-cyan': '0 0 20px rgba(0, 217, 217, 0.5), 0 0 40px rgba(0, 217, 217, 0.5)',
      'glow-cyan-fort': '0 0 10px #00d9d9, 0 0 20px #00d9d9, 0 0 40px #00d9d9',
      'glow-rose': '0 0 20px rgba(255, 0, 110, 0.5), 0 0 40px rgba(255, 0, 110, 0.5)',
      'glow-violet': '0 0 20px rgba(157, 78, 221, 0.5), 0 0 40px rgba(157, 78, 221, 0.5)',
    },
    backdropBlur: {
      'otherscape': '10px'
    }
  },
  rules: [
    // Text shadow rules
    ['text-shadow-glow-cyan', { 'text-shadow': '0 0 20px rgba(0, 217, 217, 0.5), 0 0 40px rgba(0, 217, 217, 0.5)' }],
    ['text-shadow-glow-cyan-fort', { 'text-shadow': '0 0 10px #00d9d9, 0 0 20px #00d9d9, 0 0 40px #00d9d9' }],
    ['text-shadow-glow-rose', { 'text-shadow': '0 0 20px rgba(255, 0, 110, 0.5), 0 0 40px rgba(255, 0, 110, 0.5)' }],

    // Animation rules
    ['animate-gauge-fill', { animation: 'gauge-fill 0.4s ease-out forwards' }],
    ['animate-scanline', { animation: 'scanline 8s linear infinite' }],
    ['animate-gauge-bar-appear', { animation: 'gauge-bar-appear 0.5s ease-out' }],

    // Dynamic text-shadow for hover effects
    [/^text-shadow-\[(.+)\]$/, ([, value]) => {
      return { 'text-shadow': value.replace(/_/g, ' ') }
    }],
  ],
  shortcuts: {
    // Shortcuts Otherscape
    'btn-otherscape': 'bg-otherscape-cyan-neon text-otherscape-noir-profond font-otherscape font-extrabold uppercase tracking-wider px-8 py-3 border-2 border-otherscape-cyan-neon shadow-glow-cyan hover:shadow-glow-cyan-fort hover:bg-otherscape-cyan-hover transition-all duration-300',
    'card-otherscape': 'bg-otherscape-noir-card border-2 border-otherscape-cyan-neon/30 hover:border-otherscape-cyan-neon shadow-glow-cyan transition-all duration-300',
    'text-otherscape-title': 'font-otherscape font-extrabold uppercase tracking-widest text-otherscape-cyan-neon text-shadow-glow-cyan-fort',
  },
  safelist: [
    // Classes à toujours inclure
    'bg-otherscape-noir-profond',
    'text-otherscape-cyan-neon',
    'shadow-glow-cyan',
    'shadow-glow-cyan-fort',
    'text-shadow-glow-cyan',
    'text-shadow-glow-cyan-fort',
    'animate-gauge-fill',
    'animate-scanline',
    'backdrop-blur-otherscape',
  ]
})
