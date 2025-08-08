/**
 * Configuration Prettier pour Brumisater
 * 
 * Conventions selon development-strategy.md
 * Cohérence avec ESLint pour éviter les conflits
 */

module.exports = {
  // === Formatage de base ===
  semi: true,                              // Points-virgules obligatoires
  singleQuote: true,                       // Guillemets simples
  trailingComma: 'never',                  // Pas de virgules finales
  
  // === Indentation et largeur ===
  tabWidth: 2,                             // 2 espaces pour indentation
  useTabs: false,                          // Espaces au lieu de tabs
  printWidth: 100,                         // 100 caractères par ligne (ESLint compatible)
  
  // === Espacement ===
  bracketSpacing: true,                    // Espaces dans objets { foo: bar }
  bracketSameLine: false,                  // > sur nouvelle ligne pour JSX-like
  
  // === Chaînes et templates ===
  quoteProps: 'as-needed',                 // Guillemets propriétés si nécessaire
  jsxSingleQuote: true,                    // Guillemets simples JSX (cohérence)
  
  // === Fonctions ===
  arrowParens: 'avoid',                    // Pas de parenthèses arrow function 1 param
  
  // === Fin de ligne ===
  endOfLine: 'crlf',                       // Windows CRLF (compatible environnement)
  
  // === Formatage spécialisé ===
  embeddedLanguageFormatting: 'auto',      // Formater langages imbriqués (SQL, etc.)
  htmlWhitespaceSensitivity: 'css',        // Espacement HTML comme CSS
  insertPragma: false,                     // Pas de pragma @prettier
  requirePragma: false,                    // Pas besoin de pragma
  
  // === Overrides par type de fichier ===
  overrides: [
    {
      // Fichiers JSON - 4 espaces pour lisibilité
      files: '*.json',
      options: {
        tabWidth: 4,
        trailingComma: 'none'
      }
    },
    {
      // Markdown - préserver retours ligne
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'preserve',
        tabWidth: 4
      }
    },
    {
      // Templates EJS - respect structure HTML
      files: '*.ejs',
      options: {
        printWidth: 120,                     // Plus large pour templates
        htmlWhitespaceSensitivity: 'ignore', // Ignorer espaces HTML
        tabWidth: 2
      }
    },
    {
      // Fichiers CSS/SCSS - standard web
      files: ['*.css', '*.scss'],
      options: {
        singleQuote: false,                  // Guillemets doubles CSS
        tabWidth: 2
      }
    },
    {
      // Package.json - formatage standard npm
      files: 'package.json',
      options: {
        tabWidth: 2,
        printWidth: 120
      }
    },
    {
      // Fichiers configuration - lisibilité maximale
      files: [
        '*.config.js',
        '.eslintrc.js',
        '.prettierrc.js',
        'jest.config.js',
        'tailwind.config.js'
      ],
      options: {
        printWidth: 120,
        tabWidth: 2
      }
    },
    {
      // SQL files - préserver structure
      files: '*.sql',
      options: {
        printWidth: 120,
        tabWidth: 2,
        // Ne pas formatter SQL pour préserver structure
        parser: 'babel'  // Parser JS pour éviter formatage SQL
      }
    }
  ]
};