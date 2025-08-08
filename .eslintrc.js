/**
 * Configuration ESLint pour Brumisater
 * 
 * Règles strictes JavaScript/Node.js selon development-strategy.md
 * Validation JSDoc obligatoire sur fonctions publiques
 * Standards de qualité Phase 5
 */

module.exports = {
  env: {
    node: true,
    es2022: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  rules: {
    // === Erreurs critiques ===
    'no-console': 'warn',                    // Utiliser logManager au lieu de console
    'no-unused-vars': 'error',               // Variables non utilisées interdites
    'no-undef': 'error',                     // Variables non définies interdites
    'no-unreachable': 'error',               // Code mort interdit
    'no-constant-condition': 'error',        // Conditions constantes interdites
    'no-dupe-keys': 'error',                 // Clés dupliquées interdites
    'no-duplicate-case': 'error',            // Cases duplicates dans switch
    'no-empty': 'error',                     // Blocs vides interdits
    'no-extra-semi': 'error',                // Points-virgules superflus
    'no-func-assign': 'error',               // Réassignation fonctions interdite
    'no-invalid-regexp': 'error',            // RegExp invalides interdites
    'no-obj-calls': 'error',                 // Appel objets non callable

    // === Standards JavaScript ===
    'prefer-const': 'error',                 // const quand variable non réassignée
    'no-var': 'error',                       // var interdit, utiliser let/const
    'eqeqeq': ['error', 'always'],          // === au lieu de ==
    'no-eval': 'error',                      // eval() interdit
    'no-with': 'error',                      // with interdit
    'no-new-func': 'error',                  // Function() constructor interdit
    'no-new-object': 'error',                // Object() constructor interdit
    'no-array-constructor': 'error',         // Array() constructor interdit
    'no-new-wrappers': 'error',              // Wrappers primitifs interdits

    // === Conventions de nommage ===
    'camelcase': ['error', { 
      properties: 'always',
      ignoreDestructuring: false,
      ignoreImports: false,
      // Exception pour colonnes DB snake_case
      allow: [
        '^[a-z]+(_[a-z]+)*$',               // snake_case pour DB
        '^[A-Z][A-Z0-9_]*$'                 // SCREAMING_SNAKE_CASE pour constantes
      ]
    }],

    // === Gestion d'erreurs ===
    'no-throw-literal': 'error',             // throw Error objects seulement
    'prefer-promise-reject-errors': 'error', // Promise.reject avec Error objects

    // === Performance ===
    'no-loop-func': 'error',                 // Fonctions dans boucles interdites
    'no-inner-declarations': 'error',        // Déclarations dans blocs interdites

    // === Sécurité ===
    'no-implied-eval': 'error',              // eval() implicite interdit
    'no-script-url': 'error',                // javascript: URLs interdites
    'no-proto': 'error',                     // __proto__ interdit

    // === Styles et lisibilité ===
    'semi': ['error', 'always'],             // Points-virgules obligatoires
    'quotes': ['error', 'single', {
      avoidEscape: true,
      allowTemplateLiterals: true
    }],
    'indent': ['error', 2, {
      SwitchCase: 1,
      VariableDeclarator: 1,
      outerIIFEBody: 1
    }],
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'comma-dangle': ['error', 'never'],      // Pas de virgules finales
    'comma-spacing': ['error', { before: false, after: true }],
    'comma-style': ['error', 'last'],
    'key-spacing': ['error', { beforeColon: false, afterColon: true }],
    'keyword-spacing': ['error', { before: true, after: true }],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'space-before-blocks': 'error',
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always'
    }],
    'space-infix-ops': 'error',
    'space-unary-ops': ['error', { words: true, nonwords: false }],

    // === JSDoc obligatoire ===
    'valid-jsdoc': ['error', {
      requireReturn: true,
      requireReturnDescription: true,
      requireParamDescription: true,
      requireParamType: true,
      requireReturnType: false,              // TypeScript style non requis
      matchDescription: '.+',                // Description obligatoire
      prefer: {
        arg: 'param',
        argument: 'param',
        class: 'constructor',
        return: 'returns',
        virtual: 'abstract'
      }
    }],
    'require-jsdoc': ['error', {
      require: {
        FunctionDeclaration: true,           // Fonctions déclarées
        MethodDefinition: true,              // Méthodes de classe
        ClassDeclaration: true,              // Classes
        ArrowFunctionExpression: false,      // Fonctions fléchées optionnel
        FunctionExpression: false            // Expressions fonction optionnel
      }
    }],

    // === Async/Await ===
    'no-async-promise-executor': 'error',    // async dans Promise constructor
    'prefer-promise-shorthand': 'error',     // Promise.resolve() shorthand
    'no-return-await': 'error',              // return await redondant

    // === Node.js spécifique ===
    'no-path-concat': 'error',               // Utiliser path.join()
    'no-process-exit': 'warn',               // process.exit() attention
    'no-sync': 'warn',                       // Méthodes synchrones attention
    'handle-callback-err': 'error',          // Gérer erreurs callbacks

    // === Complexité ===
    'complexity': ['warn', 10],              // Complexité cyclomatique max 10
    'max-depth': ['warn', 4],                // Profondeur imbrication max 4
    'max-len': ['warn', {
      code: 100,                             // 100 caractères par ligne
      tabWidth: 2,
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreComments: true
    }],
    'max-lines': ['warn', {
      max: 500,                              // 500 lignes max par fichier
      skipBlankLines: true,
      skipComments: true
    }],
    'max-params': ['warn', 4],               // 4 paramètres max par fonction
    'max-statements': ['warn', 20]           // 20 statements max par fonction
  },

  // === Overrides spécifiques ===
  overrides: [
    {
      // Tests - règles plus souples
      files: ['tests/**/*.js', '**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true
      },
      rules: {
        'no-console': 'off',                 // console.log OK dans tests
        'max-lines': 'off',                  // Fichiers tests peuvent être longs
        'max-statements': ['warn', 30],      // Plus de statements dans tests
        'require-jsdoc': 'off'               // JSDoc optionnel dans tests
      }
    },
    {
      // Migrations base de données
      files: ['src/database/migrations/**/*.js'],
      rules: {
        'no-console': 'off',                 // console.log OK pour migrations
        'camelcase': 'off',                  // snake_case OK pour SQL
        'require-jsdoc': 'off'               // JSDoc optionnel migrations
      }
    },
    {
      // Scripts utilitaires
      files: ['scripts/**/*.js'],
      rules: {
        'no-console': 'off',                 // console.log OK pour scripts
        'no-process-exit': 'off',            // process.exit() OK pour scripts
        'require-jsdoc': 'off'               // JSDoc optionnel scripts
      }
    },
    {
      // Configuration files
      files: [
        '*.config.js',
        '.eslintrc.js', 
        'jest.setup.js',
        'tailwind.config.js'
      ],
      rules: {
        'no-console': 'off',                 // console.log OK pour config
        'require-jsdoc': 'off'               // JSDoc optionnel config
      }
    }
  ],

  // === Ignorer patterns ===
  ignorePatterns: [
    'node_modules/',
    'coverage/',
    'public/css/',                           // CSS généré par Tailwind
    'output/',                               // PDFs générés
    'logs/',                                 // Fichiers de logs
    '*.min.js',                              // Fichiers minifiés
    'vendor/',                               // Librairies tierces
    'documentation/DEVELOPPEMENT/progresql-dump.sql'  // Dump SQL
  ],

  // === Globals project-specific ===
  globals: {
    // Alpine.js global dans le frontend
    'Alpine': 'readonly'
  }
};