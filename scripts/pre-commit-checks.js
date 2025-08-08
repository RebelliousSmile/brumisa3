/**
 * Script de vérifications pre-commit pour Phase 5
 * 
 * Exécute toutes les validations qualité avant commit selon testing.md :
 * - Linting ESLint
 * - Formatage Prettier
 * - Tests unitaires rapides
 * - Validation JSDoc
 * - Couverture minimale 80%
 */

const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const JSDocValidator = require('./validate-jsdoc');

class PreCommitChecker {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.checks = {
      linting: false,
      formatting: false,
      tests: false,
      jsdoc: false,
      coverage: false
    };
  }

  /**
   * Exécuter toutes les vérifications pre-commit
   * @returns {Promise<boolean>} True si toutes les vérifications passent
   */
  async runAllChecks() {
    console.log('🚀 Vérifications pre-commit en cours...\n');

    try {
      // 1. Vérifications de linting
      await this.checkLinting();
      
      // 2. Vérifications de formatage
      await this.checkFormatting();
      
      // 3. Validation JSDoc
      await this.checkJSDoc();
      
      // 4. Tests unitaires rapides
      await this.runFastTests();
      
      // 5. Vérification couverture
      await this.checkCoverage();

      // Rapport final
      return this.generateFinalReport();

    } catch (error) {
      console.error('❌ Erreur lors des vérifications:', error.message);
      return false;
    }
  }

  /**
   * Vérifier le linting ESLint
   * @returns {Promise<void>}
   */
  async checkLinting() {
    console.log('🔍 Vérification linting ESLint...');
    
    try {
      // Exécuter ESLint en mode check (sans fix)
      execSync('npm run lint:check', { 
        stdio: 'pipe',
        encoding: 'utf8' 
      });
      
      this.checks.linting = true;
      console.log('✅ Linting: OK\n');
      
    } catch (error) {
      this.errors.push('Erreurs de linting détectées');
      console.log('❌ Linting: ÉCHEC');
      console.log('   Exécutez "npm run lint" pour corriger automatiquement');
      console.log('   Erreurs:', error.stdout || error.stderr);
      console.log('');
    }
  }

  /**
   * Vérifier le formatage Prettier
   * @returns {Promise<void>}
   */
  async checkFormatting() {
    console.log('🎨 Vérification formatage Prettier...');
    
    try {
      execSync('npm run format:check', { 
        stdio: 'pipe',
        encoding: 'utf8' 
      });
      
      this.checks.formatting = true;
      console.log('✅ Formatage: OK\n');
      
    } catch (error) {
      this.errors.push('Problèmes de formatage détectés');
      console.log('❌ Formatage: ÉCHEC');
      console.log('   Exécutez "npm run format" pour corriger automatiquement');
      console.log('');
    }
  }

  /**
   * Valider la documentation JSDoc
   * @returns {Promise<void>}
   */
  async checkJSDoc() {
    console.log('📚 Validation JSDoc...');
    
    try {
      const validator = new JSDocValidator();
      const report = await validator.validate();
      
      if (report.success) {
        this.checks.jsdoc = true;
        console.log(`✅ JSDoc: OK (Couverture: ${report.coverage}%)\n`);
      } else {
        this.errors.push(`JSDoc incomplet (${report.errors.length} fonctions non documentées)`);
        console.log(`❌ JSDoc: ÉCHEC (${report.errors.length} fonctions sans documentation)`);
        console.log('   Ajoutez JSDoc aux fonctions listées ci-dessus\n');
      }
      
    } catch (error) {
      this.errors.push('Erreur validation JSDoc');
      console.log('❌ JSDoc: ERREUR');
      console.log('   ', error.message);
      console.log('');
    }
  }

  /**
   * Exécuter les tests unitaires rapides
   * @returns {Promise<void>}
   */
  async runFastTests() {
    console.log('🧪 Tests unitaires rapides...');
    
    try {
      // Tests unitaires seulement (plus rapides que integration)
      const output = execSync('npm run test:unit', { 
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: 30000 // 30 secondes max
      });
      
      this.checks.tests = true;
      console.log('✅ Tests unitaires: OK');
      
      // Extraire info succincte
      const lines = output.split('\n');
      const summary = lines.find(line => line.includes('Tests:') || line.includes('passed'));
      if (summary) {
        console.log(`   ${summary.trim()}`);
      }
      console.log('');
      
    } catch (error) {
      this.errors.push('Tests unitaires échoués');
      console.log('❌ Tests unitaires: ÉCHEC');
      
      const output = error.stdout || error.stderr || '';
      const failedTests = this.extractFailedTests(output);
      
      if (failedTests.length > 0) {
        console.log('   Tests échoués:');
        failedTests.forEach(test => console.log(`   • ${test}`));
      }
      console.log('');
    }
  }

  /**
   * Vérifier la couverture de tests
   * @returns {Promise<void>}
   */
  async checkCoverage() {
    console.log('📊 Vérification couverture de tests...');
    
    try {
      // Exécuter Jest avec couverture
      const output = execSync('npm run test:coverage', { 
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: 45000 // 45 secondes max
      });
      
      const coverage = this.extractCoverage(output);
      
      if (coverage.lines >= 80 && coverage.functions >= 80) {
        this.checks.coverage = true;
        console.log('✅ Couverture: OK');
        console.log(`   Lignes: ${coverage.lines}% | Fonctions: ${coverage.functions}% | Branches: ${coverage.branches}%`);
      } else {
        this.warnings.push(`Couverture insuffisante (${coverage.lines}% lignes, ${coverage.functions}% fonctions)`);
        console.log('⚠️  Couverture: EN DESSOUS DU SEUIL');
        console.log(`   Lignes: ${coverage.lines}% (requis: 80%) | Fonctions: ${coverage.functions}% (requis: 80%)`);
        console.log('   Ajoutez des tests pour améliorer la couverture');
      }
      console.log('');
      
    } catch (error) {
      this.warnings.push('Impossible de calculer la couverture');
      console.log('⚠️  Couverture: ERREUR DE CALCUL');
      console.log('   ', error.message);
      console.log('');
    }
  }

  /**
   * Extraire les tests échoués de la sortie Jest
   * @param {string} output - Sortie de Jest
   * @returns {Array<string>} Liste des tests échoués
   */
  extractFailedTests(output) {
    const failed = [];
    const lines = output.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('✕') || line.includes('FAIL')) {
        // Extraire nom du test
        const testMatch = line.match(/✕\s+(.+)/) || line.match(/FAIL\s+(.+)/);
        if (testMatch) {
          failed.push(testMatch[1].trim());
        }
      }
    }
    
    return failed.slice(0, 5); // Limiter à 5 pour lisibilité
  }

  /**
   * Extraire les métriques de couverture
   * @param {string} output - Sortie Jest coverage
   * @returns {Object} Métriques de couverture
   */
  extractCoverage(output) {
    const coverage = {
      lines: 0,
      functions: 0,
      branches: 0,
      statements: 0
    };
    
    // Chercher la ligne de résumé de couverture
    const lines = output.split('\n');
    const summaryLine = lines.find(line => 
      line.includes('All files') || 
      line.includes('│') && line.includes('%')
    );
    
    if (summaryLine) {
      // Extraire pourcentages avec regex
      const percentages = summaryLine.match(/\d+(?:\.\d+)?%/g);
      if (percentages && percentages.length >= 4) {
        coverage.statements = parseFloat(percentages[0]);
        coverage.branches = parseFloat(percentages[1]);
        coverage.functions = parseFloat(percentages[2]);
        coverage.lines = parseFloat(percentages[3]);
      }
    }
    
    return coverage;
  }

  /**
   * Générer le rapport final des vérifications
   * @returns {boolean} True si toutes les vérifications critiques passent
   */
  generateFinalReport() {
    console.log('📋 RAPPORT FINAL:\n');
    
    const criticalChecks = ['linting', 'formatting', 'tests', 'jsdoc'];
    const passedCritical = criticalChecks.filter(check => this.checks[check]);
    
    console.log('Vérifications critiques:');
    criticalChecks.forEach(check => {
      const status = this.checks[check] ? '✅' : '❌';
      const name = {
        linting: 'Linting ESLint',
        formatting: 'Formatage Prettier',
        tests: 'Tests unitaires',
        jsdoc: 'Documentation JSDoc'
      }[check];
      console.log(`   ${status} ${name}`);
    });
    
    console.log('\nVérifications optionnelles:');
    console.log(`   ${this.checks.coverage ? '✅' : '⚠️ '} Couverture tests (80%)`);
    
    const success = passedCritical.length === criticalChecks.length;
    
    if (success) {
      console.log('\n🎉 TOUTES LES VÉRIFICATIONS CRITIQUES PASSENT!');
      console.log('   Votre commit respecte les standards de qualité Phase 5.');
      
      if (this.warnings.length > 0) {
        console.log('\n⚠️  Avertissements (n\'empêchent pas le commit):');
        this.warnings.forEach(warning => console.log(`   • ${warning}`));
      }
      
    } else {
      console.log('\n❌ VÉRIFICATIONS ÉCHOUÉES');
      console.log('   Les erreurs suivantes doivent être corrigées avant le commit:');
      this.errors.forEach(error => console.log(`   • ${error}`));
      
      console.log('\n💡 Actions suggérées:');
      if (!this.checks.linting) console.log('   → npm run lint');
      if (!this.checks.formatting) console.log('   → npm run format');
      if (!this.checks.jsdoc) console.log('   → Ajoutez JSDoc aux fonctions listées');
      if (!this.checks.tests) console.log('   → Corrigez les tests échoués');
    }
    
    return success;
  }
}

// Fonction utilitaire pour git hooks
function setupGitHooks() {
  const gitHooksDir = path.join(process.cwd(), '.git', 'hooks');
  const preCommitHook = path.join(gitHooksDir, 'pre-commit');
  
  if (!fs.existsSync(gitHooksDir)) {
    console.log('⚠️  Répertoire .git/hooks introuvable');
    return false;
  }
  
  const hookContent = `#!/bin/sh
# Pre-commit hook Brumisater Phase 5
node scripts/pre-commit-checks.js
`;
  
  try {
    fs.writeFileSync(preCommitHook, hookContent);
    if (process.platform !== 'win32') {
      fs.chmodSync(preCommitHook, '755');
    }
    console.log('✅ Hook pre-commit installé');
    return true;
  } catch (error) {
    console.log('❌ Erreur installation hook:', error.message);
    return false;
  }
}

// Exécution si appelé directement
if (require.main === module) {
  const checker = new PreCommitChecker();
  
  // Vérifier si on doit installer les hooks
  if (process.argv.includes('--setup-hooks')) {
    setupGitHooks();
    process.exit(0);
  }
  
  checker.runAllChecks()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Erreur:', error);
      process.exit(1);
    });
}

module.exports = { PreCommitChecker, setupGitHooks };