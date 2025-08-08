/**
 * Script de validation JSDoc obligatoire selon Phase 5
 * 
 * Vérifie que toutes les fonctions publiques ont une documentation JSDoc
 * conforme aux standards définits dans .eslintrc.js
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

class JSDocValidator {
  constructor() {
    this.srcDir = path.join(__dirname, '..', 'src');
    this.errors = [];
    this.warnings = [];
    this.stats = {
      filesScanned: 0,
      functionsFound: 0,
      functionsDocumented: 0,
      functionsUndocumented: 0
    };
  }

  /**
   * Exécuter la validation complète
   * @returns {Promise<Object>} Résultat de la validation
   */
  async validate() {
    console.log('🔍 Validation JSDoc en cours...');
    
    try {
      await this.scanDirectory(this.srcDir);
      return this.generateReport();
    } catch (error) {
      console.error('❌ Erreur lors de la validation JSDoc:', error.message);
      throw error;
    }
  }

  /**
   * Scanner récursivement un répertoire
   * @param {string} dirPath - Chemin du répertoire
   * @returns {Promise<void>}
   */
  async scanDirectory(dirPath) {
    const items = await fs.readdir(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = await fs.stat(itemPath);

      if (stat.isDirectory()) {
        // Ignorer certains répertoires
        if (!['migrations', 'seed', 'temp'].includes(item)) {
          await this.scanDirectory(itemPath);
        }
      } else if (item.endsWith('.js') && !item.endsWith('.test.js')) {
        await this.validateFile(itemPath);
      }
    }
  }

  /**
   * Valider un fichier JavaScript
   * @param {string} filePath - Chemin du fichier
   * @returns {Promise<void>}
   */
  async validateFile(filePath) {
    this.stats.filesScanned++;
    
    const content = await fs.readFile(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);

    console.log(`📄 Validation: ${relativePath}`);

    // Extraire les fonctions et méthodes
    const functions = this.extractFunctions(content);
    this.stats.functionsFound += functions.length;

    for (const func of functions) {
      const hasJSDoc = this.checkJSDoc(content, func);
      
      if (hasJSDoc) {
        this.stats.functionsDocumented++;
        const jsdocValid = this.validateJSDocContent(content, func);
        
        if (!jsdocValid.valid) {
          this.warnings.push({
            file: relativePath,
            function: func.name,
            line: func.line,
            issues: jsdocValid.issues
          });
        }
      } else {
        this.stats.functionsUndocumented++;
        this.errors.push({
          file: relativePath,
          function: func.name,
          line: func.line,
          type: 'missing-jsdoc'
        });
      }
    }
  }

  /**
   * Extraire les fonctions d'un contenu JavaScript
   * @param {string} content - Contenu du fichier
   * @returns {Array<Object>} Liste des fonctions trouvées
   */
  extractFunctions(content) {
    const functions = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineNumber = i + 1;

      // Function declarations
      const functionMatch = line.match(/^(?:async\s+)?function\s+(\w+)\s*\(/);
      if (functionMatch) {
        functions.push({
          name: functionMatch[1],
          line: lineNumber,
          type: 'function'
        });
        continue;
      }

      // Method definitions in classes
      const methodMatch = line.match(/^(?:static\s+)?(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{?/);
      if (methodMatch && !line.includes('=') && !line.includes('if') && !line.includes('for')) {
        const methodName = methodMatch[1];
        
        // Ignorer constructor et méthodes privées (_)
        if (methodName !== 'constructor' && !methodName.startsWith('_')) {
          functions.push({
            name: methodName,
            line: lineNumber,
            type: 'method'
          });
        }
        continue;
      }

      // Arrow functions assignées
      const arrowMatch = line.match(/^(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/);
      if (arrowMatch) {
        functions.push({
          name: arrowMatch[1],
          line: lineNumber,
          type: 'arrow'
        });
      }
    }

    return functions;
  }

  /**
   * Vérifier si une fonction a un JSDoc
   * @param {string} content - Contenu du fichier
   * @param {Object} func - Fonction à vérifier
   * @returns {boolean} True si JSDoc présent
   */
  checkJSDoc(content, func) {
    const lines = content.split('\n');
    const funcLine = func.line - 1;

    // Chercher JSDoc dans les lignes précédentes
    for (let i = funcLine - 1; i >= 0; i--) {
      const line = lines[i].trim();
      
      if (line === '*/') {
        // Fin de JSDoc trouvée, chercher le début
        for (let j = i; j >= 0; j--) {
          if (lines[j].trim().startsWith('/**')) {
            return true;
          }
        }
      }
      
      // Si on trouve du code avant JSDoc, pas de doc
      if (line && !line.startsWith('//') && !line.startsWith('*') && !line.startsWith('/**')) {
        break;
      }
    }

    return false;
  }

  /**
   * Valider le contenu d'un JSDoc
   * @param {string} content - Contenu du fichier
   * @param {Object} func - Fonction à vérifier
   * @returns {Object} Résultat de la validation
   */
  validateJSDocContent(content, func) {
    const issues = [];
    const lines = content.split('\n');
    const funcLine = func.line - 1;

    let jsdocContent = '';
    let jsdocStart = -1;

    // Extraire le contenu JSDoc
    for (let i = funcLine - 1; i >= 0; i--) {
      const line = lines[i].trim();
      
      if (line === '*/') {
        for (let j = i; j >= 0; j--) {
          if (lines[j].trim().startsWith('/**')) {
            jsdocStart = j;
            break;
          }
        }
        break;
      }
    }

    if (jsdocStart >= 0) {
      for (let i = jsdocStart; i < funcLine; i++) {
        jsdocContent += lines[i] + '\n';
      }
    }

    // Vérifications du contenu JSDoc
    if (!jsdocContent.includes('@param') && content.includes(`${func.name}(`)) {
      const funcDef = lines[funcLine];
      if (funcDef.includes('(') && !funcDef.includes('()')) {
        issues.push('Paramètres non documentés');
      }
    }

    if (!jsdocContent.includes('@returns') && !jsdocContent.includes('@return')) {
      const funcDef = lines[funcLine];
      if (!funcDef.includes('constructor') && !funcDef.includes('void')) {
        issues.push('Valeur de retour non documentée');
      }
    }

    const descriptionMatch = jsdocContent.match(/\/\*\*\s*\n\s*\*\s*(.+)/);
    if (!descriptionMatch || descriptionMatch[1].trim().length < 10) {
      issues.push('Description trop courte ou manquante');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Générer le rapport de validation
   * @returns {Object} Rapport complet
   */
  generateReport() {
    const coverage = this.stats.functionsFound > 0 
      ? (this.stats.functionsDocumented / this.stats.functionsFound * 100).toFixed(1)
      : 0;

    const report = {
      success: this.errors.length === 0,
      stats: this.stats,
      coverage: parseFloat(coverage),
      errors: this.errors,
      warnings: this.warnings
    };

    // Affichage console
    console.log('\n📊 Rapport JSDoc:');
    console.log(`   Fichiers scannés: ${this.stats.filesScanned}`);
    console.log(`   Fonctions trouvées: ${this.stats.functionsFound}`);
    console.log(`   Fonctions documentées: ${this.stats.functionsDocumented}`);
    console.log(`   Couverture JSDoc: ${coverage}%`);

    if (this.errors.length > 0) {
      console.log(`\n❌ ${this.errors.length} fonctions sans JSDoc:`);
      this.errors.forEach(error => {
        console.log(`   ${error.file}:${error.line} - ${error.function}()`);
      });
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️  ${this.warnings.length} JSDoc incomplets:`);
      this.warnings.forEach(warning => {
        console.log(`   ${warning.file}:${warning.line} - ${warning.function}()`);
        warning.issues.forEach(issue => {
          console.log(`     • ${issue}`);
        });
      });
    }

    if (report.success) {
      console.log('\n✅ Validation JSDoc réussie!');
    } else {
      console.log('\n❌ Validation JSDoc échouée');
      console.log('   Ajoutez la documentation JSDoc aux fonctions listées ci-dessus.');
    }

    return report;
  }
}

// Exécution si appelé directement
if (require.main === module) {
  const validator = new JSDocValidator();
  
  validator.validate()
    .then(report => {
      process.exit(report.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Erreur:', error);
      process.exit(1);
    });
}

module.exports = JSDocValidator;