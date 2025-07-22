/**
 * Script de migration des assertions Chai vers Jest
 * Usage: node scripts/migrate-chai-to-jest.js <file-path>
 */

const fs = require('fs');
const path = require('path');

function migrateChaiFichier(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Remplacement des assertions Chai par Jest
        const replacements = [
            // Propriétés
            [/expect\(([^)]+)\)\.to\.have\.property\(['"]([^'"]+)['"]\)/g, 'expect($1).toHaveProperty(\'$2\')'],
            [/expect\(([^)]+)\)\.to\.not\.have\.property\(['"]([^'"]+)['"]\)/g, 'expect($1).not.toHaveProperty(\'$2\')'],
            
            // Longueur
            [/expect\(([^)]+)\)\.to\.have\.length\((\d+)\)/g, 'expect($1).toHaveLength($2)'],
            [/expect\(([^)]+)\)\.to\.have\.length\.greaterThan\((\d+)\)/g, 'expect($1.length).toBeGreaterThan($2)'],
            
            // Égalité
            [/expect\(([^)]+)\)\.to\.equal\(([^)]+)\)/g, 'expect($1).toBe($2)'],
            [/expect\(([^)]+)\)\.to\.not\.equal\(([^)]+)\)/g, 'expect($1).not.toBe($2)'],
            
            // Booléens
            [/expect\(([^)]+)\)\.to\.be\.true/g, 'expect($1).toBe(true)'],
            [/expect\(([^)]+)\)\.to\.be\.false/g, 'expect($1).toBe(false)'],
            
            // Tableaux
            [/Array\.isArray\(([^)]+)\)\)\.to\.be\.true/g, 'Array.isArray($1)).toBe(true)'],
            
            // Inclusion
            [/expect\(([^)]+)\)\.to\.include\(([^)]+)\)/g, 'expect($1).toContain($2)'],
            [/expect\(([^)]+)\)\.to\.not\.include\(([^)]+)\)/g, 'expect($1).not.toContain($2)'],
            
            // Types
            [/expect\(([^)]+)\)\.to\.be\.a\(['"]string['"]\)/g, 'expect(typeof $1).toBe(\'string\')'],
            [/expect\(([^)]+)\)\.to\.be\.a\(['"]number['"]\)/g, 'expect(typeof $1).toBe(\'number\')'],
            [/expect\(([^)]+)\)\.to\.be\.a\(['"]object['"]\)/g, 'expect(typeof $1).toBe(\'object\')'],
            
            // Null/undefined
            [/expect\(([^)]+)\)\.to\.be\.null/g, 'expect($1).toBeNull()'],
            [/expect\(([^)]+)\)\.to\.be\.undefined/g, 'expect($1).toBeUndefined()'],
            [/expect\(([^)]+)\)\.to\.not\.be\.null/g, 'expect($1).not.toBeNull()'],
            [/expect\(([^)]+)\)\.to\.not\.be\.undefined/g, 'expect($1).not.toBeUndefined()'],
            
            // Existence
            [/expect\(([^)]+)\)\.to\.exist/g, 'expect($1).toBeDefined()'],
            [/expect\(([^)]+)\)\.to\.not\.exist/g, 'expect($1).not.toBeDefined()']
        ];
        
        // Appliquer tous les remplacements
        replacements.forEach(([pattern, replacement]) => {
            content = content.replace(pattern, replacement);
        });
        
        // Sauvegarder le fichier modifié
        fs.writeFileSync(filePath, content, 'utf8');
        
        console.log(`✅ Migration terminée pour: ${filePath}`);
        
    } catch (error) {
        console.error(`❌ Erreur lors de la migration de ${filePath}:`, error.message);
    }
}

// Exécution si appelé directement
if (require.main === module) {
    const filePath = process.argv[2];
    
    if (!filePath) {
        console.error('Usage: node scripts/migrate-chai-to-jest.js <file-path>');
        process.exit(1);
    }
    
    if (!fs.existsSync(filePath)) {
        console.error(`Fichier non trouvé: ${filePath}`);
        process.exit(1);
    }
    
    migrateChaiFichier(filePath);
}

module.exports = { migrateChaiFichier };