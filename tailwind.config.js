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
        'info': '#06b6d4'            // cyan-500 (distinct du bleu générique)
      },
      fontFamily: {
        'display': ['Shackleton', 'sans-serif'],
        'serif': ['Source Serif 4', 'serif'],
        'sans': ['system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}