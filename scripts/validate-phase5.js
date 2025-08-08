/**
 * Script de validation Phase 5 - Qualité et Tests
 * 
 * Vérifie que tous les objectifs Phase 5 sont atteints selon TODO.md :
 * - Tests unitaires par couche MVC-CS
 * - Tests d'intégration complets
 * - Configuration Jest avec couverture 80%+
 * - Standards de code (ESLint + Prettier + JSDoc)
 * - Scripts et hooks de qualité
 */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const JSDocValidator = require('./validate-jsdoc');
const { PreCommitChecker } = require('./pre-commit-checks');

class Phase5Validator {
  constructor() {
    this.results = {
      documentation: { passed: false, details: {} },
      jest_config: { passed: false, details: {} },
      test_structure: { passed: false, details: {} },
      test_coverage: { passed: false, details: {} },
      eslint_config: { passed: false, details: {} },
      prettier_config: { passed: false, details: {} },
      package_scripts: { passed: false, details: {} },
      jsdoc_validation: { passed: false, details: {} },
      pre_commit_hooks: { passed: false, details: {} }
    };
    
    this.overallScore = 0;
    this.maxScore = Object.keys(this.results).length;
  }

  /**
   * Valider tous les critères Phase 5
   * @returns {Promise<Object>} Rapport complet de validation
   */
  async validatePhase5() {
    console.log('🎯 VALIDATION PHASE 5 - QUALITÉ ET TESTS');
    console.log('=' .repeat(50));
    console.log('');

    try {
      await this.validateDocumentation();
      await this.validateJestConfiguration();
      await this.validateTestStructure();
      await this.validateTestCoverage();
      await this.validateESLintConfiguration();
      await this.validatePrettierConfiguration();
      await this.validatePackageScripts();
      await this.validateJSDocCompliance();
      await this.validatePreCommitHooks();

      return this.generateFinalReport();

    } catch (error) {
      console.error('❌ Erreur lors de la validation Phase 5:', error);
      throw error;
    }
  }

  /**
   * Valider la documentation testing.md
   * @returns {Promise<void>}
   */
  async validateDocumentation() {
    console.log('📚 Validation documentation testing.md...');
    
    const testingDocPath = path.join('documentation', 'DEVELOPPEMENT', 'testing.md');
    
    try {
      if (!fs.existsSync(testingDocPath)) {
        throw new Error('Documentation testing.md manquante');
      }

      const content = await fs.readFile(testingDocPath, 'utf8');
      const requiredSections = [
        'Architecture des tests',
        'Configuration Jest',
        'Tests unitaires par couche',
        'Tests d\'intégration',
        'Helpers et utilities',
        'Fixtures par système JDR'
      ];

      const missingSections = requiredSections.filter(section => 
        !content.includes(section)
      );

      if (missingSections.length === 0) {
        this.results.documentation.passed = true;
        this.results.documentation.details = {
          size: content.length,
          sections: requiredSections.length
        };
        console.log('✅ Documentation testing.md: OK');
      } else {
        throw new Error(`Sections manquantes: ${missingSections.join(', ')}`);
      }

    } catch (error) {
      this.results.documentation.details.error = error.message;
      console.log('❌ Documentation testing.md: ÉCHEC');
      console.log(`   ${error.message}`);
    }
    console.log('');
  }

  /**
   * Valider la configuration Jest
   * @returns {Promise<void>}
   */
  async validateJestConfiguration() {
    console.log('⚙️  Validation configuration Jest...');
    
    try {
      if (!fs.existsSync('jest.config.js')) {
        throw new Error('jest.config.js manquant');
      }

      const config = require('../jest.config.js');
      const requiredProps = ['testEnvironment', 'coverageThreshold', 'collectCoverageFrom'];
      const missingProps = requiredProps.filter(prop => !config.hasOwnProperty(prop));

      if (missingProps.length > 0) {
        throw new Error(`Propriétés manquantes: ${missingProps.join(', ')}`);
      }

      // Vérifier seuils de couverture 80%
      const globalThreshold = config.coverageThreshold?.global;
      if (!globalThreshold || 
          globalThreshold.lines < 80 || 
          globalThreshold.functions < 80) {
        throw new Error('Seuils de couverture < 80%');
      }

      this.results.jest_config.passed = true;
      this.results.jest_config.details = {
        coverage_threshold: globalThreshold,
        test_environment: config.testEnvironment
      };
      console.log('✅ Configuration Jest: OK');
      console.log(`   Seuils: ${globalThreshold.lines}% lignes, ${globalThreshold.functions}% fonctions`);

    } catch (error) {
      this.results.jest_config.details.error = error.message;
      console.log('❌ Configuration Jest: ÉCHEC');
      console.log(`   ${error.message}`);
    }
    console.log('');
  }

  /**
   * Valider la structure des tests
   * @returns {Promise<void>}
   */
  async validateTestStructure() {
    console.log('🧪 Validation structure des tests...');
    
    try {
      const requiredDirs = [
        'tests/unit/models',
        'tests/unit/services', 
        'tests/unit/controllers',
        'tests/unit/utils',
        'tests/integration/api',
        'tests/integration/pdf',
        'tests/integration/database',
        'tests/helpers',
        'tests/fixtures'
      ];

      const missingDirs = requiredDirs.filter(dir => !fs.existsSync(dir));
      
      if (missingDirs.length > 0) {
        throw new Error(`Répertoires manquants: ${missingDirs.join(', ')}`);
      }

      // Compter les fichiers de test
      const testFiles = {
        unit_models: this.countTestFiles('tests/unit/models'),
        unit_services: this.countTestFiles('tests/unit/services'),
        integration_api: this.countTestFiles('tests/integration/api'),
        integration_pdf: this.countTestFiles('tests/integration/pdf')
      };

      this.results.test_structure.passed = true;
      this.results.test_structure.details = testFiles;
      console.log('✅ Structure des tests: OK');
      console.log(`   Tests unitaires: ${testFiles.unit_models + testFiles.unit_services}`);
      console.log(`   Tests intégration: ${testFiles.integration_api + testFiles.integration_pdf}`);

    } catch (error) {
      this.results.test_structure.details.error = error.message;
      console.log('❌ Structure des tests: ÉCHEC');
      console.log(`   ${error.message}`);
    }
    console.log('');
  }

  /**
   * Valider la couverture des tests
   * @returns {Promise<void>}
   */
  async validateTestCoverage() {
    console.log('📊 Validation couverture des tests...');
    
    try {
      // Exécuter tests avec couverture (timeout généreux)
      const output = execSync('npm run test:coverage', { 
        encoding: 'utf8',
        timeout: 60000,  // 60 secondes
        stdio: 'pipe'
      });

      const coverage = this.extractCoverageMetrics(output);
      
      if (coverage.lines >= 80 && coverage.functions >= 80) {
        this.results.test_coverage.passed = true;
        this.results.test_coverage.details = coverage;
        console.log('✅ Couverture des tests: OK');
        console.log(`   Lignes: ${coverage.lines}% | Fonctions: ${coverage.functions}%`);
      } else {
        throw new Error(`Couverture insuffisante: ${coverage.lines}% lignes, ${coverage.functions}% fonctions`);
      }

    } catch (error) {
      this.results.test_coverage.details.error = error.message;
      console.log('❌ Couverture des tests: ÉCHEC');
      console.log(`   ${error.message}`);
    }
    console.log('');
  }

  /**
   * Valider la configuration ESLint
   * @returns {Promise<void>}
   */
  async validateESLintConfiguration() {
    console.log('🔍 Validation configuration ESLint...');
    
    try {
      if (!fs.existsSync('.eslintrc.js')) {
        throw new Error('.eslintrc.js manquant');
      }

      // Tester ESLint sur quelques fichiers
      execSync('npm run lint:check', { 
        stdio: 'pipe',
        timeout: 30000
      });

      this.results.eslint_config.passed = true;
      this.results.eslint_config.details = { status: 'configured' };
      console.log('✅ Configuration ESLint: OK');

    } catch (error) {
      this.results.eslint_config.details.error = error.message;
      console.log('❌ Configuration ESLint: ÉCHEC');
      console.log('   Des erreurs de linting ont été détectées');
    }
    console.log('');
  }

  /**
   * Valider la configuration Prettier
   * @returns {Promise<void>}
   */
  async validatePrettierConfiguration() {
    console.log('🎨 Validation configuration Prettier...');
    
    try {
      if (!fs.existsSync('.prettierrc.js')) {
        throw new Error('.prettierrc.js manquant');
      }

      // Tester Prettier
      execSync('npm run format:check', { 
        stdio: 'pipe',
        timeout: 30000
      });

      this.results.prettier_config.passed = true;
      this.results.prettier_config.details = { status: 'configured' };
      console.log('✅ Configuration Prettier: OK');

    } catch (error) {
      this.results.prettier_config.details.error = error.message;
      console.log('❌ Configuration Prettier: ÉCHEC');
      console.log('   Des problèmes de formatage ont été détectés');
    }
    console.log('');
  }

  /**
   * Valider les scripts package.json
   * @returns {Promise<void>}
   */
  async validatePackageScripts() {
    console.log('📜 Validation scripts package.json...');
    
    try {
      const packageJson = require('../package.json');
      const requiredScripts = [
        'test:unit', 'test:integration', 'test:coverage',
        'lint', 'format', 'quality', 'pre-commit'
      ];

      const missingScripts = requiredScripts.filter(script => 
        !packageJson.scripts || !packageJson.scripts[script]
      );

      if (missingScripts.length > 0) {
        throw new Error(`Scripts manquants: ${missingScripts.join(', ')}`);
      }

      this.results.package_scripts.passed = true;
      this.results.package_scripts.details = {
        total_scripts: Object.keys(packageJson.scripts).length,
        test_scripts: Object.keys(packageJson.scripts).filter(s => s.startsWith('test:')).length
      };
      console.log('✅ Scripts package.json: OK');
      console.log(`   ${this.results.package_scripts.details.test_scripts} scripts de test configurés`);

    } catch (error) {
      this.results.package_scripts.details.error = error.message;
      console.log('❌ Scripts package.json: ÉCHEC');
      console.log(`   ${error.message}`);
    }
    console.log('');
  }

  /**
   * Valider la conformité JSDoc
   * @returns {Promise<void>}
   */
  async validateJSDocCompliance() {
    console.log('📖 Validation conformité JSDoc...');
    
    try {
      const validator = new JSDocValidator();
      const report = await validator.validate();

      if (report.success && report.coverage >= 80) {
        this.results.jsdoc_validation.passed = true;
        this.results.jsdoc_validation.details = {
          coverage: report.coverage,
          documented_functions: report.stats.functionsDocumented,
          total_functions: report.stats.functionsFound
        };
        console.log('✅ Conformité JSDoc: OK');
        console.log(`   Couverture: ${report.coverage}%`);
      } else {
        throw new Error(`JSDoc insuffisant: ${report.coverage}% (${report.errors.length} fonctions non documentées)`);
      }

    } catch (error) {
      this.results.jsdoc_validation.details.error = error.message;
      console.log('❌ Conformité JSDoc: ÉCHEC');
      console.log(`   ${error.message}`);
    }
    console.log('');
  }

  /**
   * Valider les hooks pre-commit
   * @returns {Promise<void>}
   */
  async validatePreCommitHooks() {
    console.log('🪝 Validation hooks pre-commit...');
    
    try {
      const preCommitScript = 'scripts/pre-commit-checks.js';
      if (!fs.existsSync(preCommitScript)) {
        throw new Error('Script pre-commit-checks.js manquant');
      }

      const validateJSDocScript = 'scripts/validate-jsdoc.js';
      if (!fs.existsSync(validateJSDocScript)) {
        throw new Error('Script validate-jsdoc.js manquant');
      }

      this.results.pre_commit_hooks.passed = true;
      this.results.pre_commit_hooks.details = {
        pre_commit_script: true,
        jsdoc_validator: true
      };
      console.log('✅ Hooks pre-commit: OK');

    } catch (error) {
      this.results.pre_commit_hooks.details.error = error.message;
      console.log('❌ Hooks pre-commit: ÉCHEC');
      console.log(`   ${error.message}`);
    }
    console.log('');
  }

  /**
   * Compter les fichiers de test dans un répertoire
   * @param {string} dir - Répertoire à scanner
   * @returns {number} Nombre de fichiers .test.js
   */
  countTestFiles(dir) {
    try {
      if (!fs.existsSync(dir)) return 0;
      const files = fs.readdirSync(dir);
      return files.filter(f => f.endsWith('.test.js')).length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Extraire les métriques de couverture de la sortie Jest
   * @param {string} output - Sortie Jest
   * @returns {Object} Métriques de couverture
   */
  extractCoverageMetrics(output) {
    const lines = output.split('\n');
    const summaryLine = lines.find(line => 
      line.includes('All files') && line.includes('%')
    );

    if (summaryLine) {
      const percentages = summaryLine.match(/\d+(?:\.\d+)?/g);
      if (percentages && percentages.length >= 4) {
        return {
          statements: parseFloat(percentages[0]),
          branches: parseFloat(percentages[1]),
          functions: parseFloat(percentages[2]),
          lines: parseFloat(percentages[3])
        };
      }
    }

    return { statements: 0, branches: 0, functions: 0, lines: 0 };
  }

  /**
   * Générer le rapport final de validation Phase 5
   * @returns {Object} Rapport complet
   */
  generateFinalReport() {
    console.log('📋 RAPPORT FINAL PHASE 5');
    console.log('=' .repeat(30));
    console.log('');

    // Calculer score
    this.overallScore = Object.values(this.results).filter(r => r.passed).length;
    const percentage = Math.round((this.overallScore / this.maxScore) * 100);

    // Afficher résultats par catégorie
    const categories = [
      ['Documentation', this.results.documentation],
      ['Configuration Jest', this.results.jest_config],
      ['Structure Tests', this.results.test_structure],
      ['Couverture Tests', this.results.test_coverage],
      ['Configuration ESLint', this.results.eslint_config],
      ['Configuration Prettier', this.results.prettier_config],
      ['Scripts Package.json', this.results.package_scripts],
      ['Validation JSDoc', this.results.jsdoc_validation],
      ['Hooks Pre-commit', this.results.pre_commit_hooks]
    ];

    categories.forEach(([name, result]) => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${name}`);
      if (!result.passed && result.details.error) {
        console.log(`    Erreur: ${result.details.error}`);
      }
    });

    console.log('');
    console.log(`Score global: ${this.overallScore}/${this.maxScore} (${percentage}%)`);
    console.log('');

    const success = this.overallScore === this.maxScore;

    if (success) {
      console.log('🎉 PHASE 5 COMPLÈTE !');
      console.log('   Tous les objectifs Qualité et Tests sont atteints');
      console.log('   - Tests unitaires par couche MVC-CS ✓');
      console.log('   - Tests d\'intégration complets ✓');
      console.log('   - Configuration Jest 80%+ ✓');
      console.log('   - Standards de code (ESLint + Prettier + JSDoc) ✓');
      console.log('   - Scripts et hooks de qualité ✓');
    } else {
      console.log('⚠️  PHASE 5 INCOMPLÈTE');
      console.log('   Éléments à corriger :');
      categories
        .filter(([, result]) => !result.passed)
        .forEach(([name]) => console.log(`   • ${name}`));
    }

    return {
      success,
      score: this.overallScore,
      maxScore: this.maxScore,
      percentage,
      results: this.results
    };
  }
}

// Exécution si appelé directement
if (require.main === module) {
  const validator = new Phase5Validator();
  
  validator.validatePhase5()
    .then(report => {
      process.exit(report.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Erreur validation:', error);
      process.exit(1);
    });
}

module.exports = Phase5Validator;