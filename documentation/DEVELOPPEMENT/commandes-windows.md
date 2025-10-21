# Commandes Windows pour le développement

## Configuration environnement

### Installation PostgreSQL
```cmd
# Via winget (Windows 10/11)
winget install PostgreSQL.PostgreSQL

# Ou télécharger depuis https://www.postgresql.org/download/windows/
```

### Configuration PostgreSQL
```cmd
# Se connecter à PostgreSQL
psql -U postgres

# Créer base de données
CREATE DATABASE brumisa3_dev;
CREATE DATABASE brumisa3_test;

# Créer utilisateur dédié
CREATE USER brumisa3_user WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE brumisa3_dev TO brumisa3_user;
GRANT ALL PRIVILEGES ON DATABASE brumisa3_test TO brumisa3_user;
```

### Installation Node.js et pnpm
```cmd
# Via winget
winget install OpenJS.NodeJS
winget install pnpm.pnpm

# Vérification
node --version
pnpm --version
```

## Commandes de développement quotidiennes

### Démarrage projet
```cmd
# Installation dépendances
pnpm install

# Copie configuration
copy .env.example .env

# Démarrage développement
pnpm run dev

# Tests
pnpm test
pnpm run test:watch
```

### Base de données
```cmd
# Migrations
pnpm run db:migrate

# Reset base de données
pnpm run db:reset

# Sauvegarde
pg_dump -U brumisa3_user -d brumisa3_dev > backup.sql
```

## PowerShell - Remplacement de texte dans les fichiers

### Remplacement simple dans un fichier
```powershell
(Get-Content 'chemin\vers\fichier.js') -replace 'ancien_texte', 'nouveau_texte' | Set-Content 'chemin\vers\fichier.js'
```

### Remplacement avec échappement des caractères spéciaux
```powershell
# Pour les chemins avec des barres obliques
(Get-Content 'fichier.js') -replace '\.\./utils/systemesJeu', '../config/systemesJeu' | Set-Content 'fichier.js'

# Pour les regex complexes avec échappement
(Get-Content 'fichier.js') -replace '\\require\\(\\''\\.\\.\/utils\/systemesJeu\\''\\)', "require('../config/systemesJeu')" | Set-Content 'fichier.js'
```

### Remplacement dans plusieurs fichiers
```powershell
# Trouver et remplacer dans tous les fichiers .js d'un dossier
Get-ChildItem -Path "src\" -Filter "*.js" -Recurse | ForEach-Object {
    (Get-Content $_.FullName) -replace '../utils/systemesJeu', '../config/systemesJeu' | Set-Content $_.FullName
}
```

### Remplacement avec sauvegarde
```powershell
# Créer une sauvegarde avant modification
Copy-Item 'fichier.js' 'fichier.js.bak'
(Get-Content 'fichier.js') -replace 'ancien', 'nouveau' | Set-Content 'fichier.js'
```

## Commandes de fichiers et dossiers

### Création et manipulation
```powershell
# Créer un dossier
New-Item -ItemType Directory -Path "chemin\nouveau_dossier"

# Copier un fichier
Copy-Item "source.js" "destination.js"

# Déplacer un fichier  
Move-Item "source.js" "nouveau_chemin\source.js"

# Supprimer un fichier
Remove-Item "fichier.js"
```

### Recherche et listage
```powershell
# Trouver des fichiers par nom
Get-ChildItem -Path "." -Filter "*.js" -Recurse

# Chercher du texte dans les fichiers
Select-String -Path "src\*.js" -Pattern "systemesJeu"

# Lister le contenu d'un dossier
Get-ChildItem -Path "src\"
```

## Tests et vérifications

### Lancer les tests avec npm/pnpm
```powershell
# Tests d'intégration
pnpm run test:integration

# Test spécifique
npx jest tests/integration/simple-api.test.js --verbose

# Tous les tests
pnpm test
```

### Vérification rapide d'imports
```powershell
# Tester un import Node.js
node -e "console.log('Test:'); const config = require('./src/config/systemesJeu'); console.log('OK:', Object.keys(config));"
```

## Git operations

### Status et commits
```powershell
# Status des modifications
git status

# Voir les différences
git diff

# Ajouter et committer
git add .
git commit -m "Message de commit"

# Créer une branche et pousser
git checkout -b nouvelle-branche
git push -u origin nouvelle-branche
```

## Debugging et logs

### Affichage conditionnel
```powershell
# Afficher le contenu d'un fichier
Get-Content "fichier.js"

# Afficher les 10 premières lignes
Get-Content "fichier.js" | Select-Object -First 10

# Rechercher dans les logs
Get-Content "logs\app.log" | Select-String "ERROR"
```

---

## Notes importantes

- **Échappement** : Utiliser des guillemets simples `'` pour éviter l'interprétation des variables PowerShell
- **Chemins** : Utiliser des antislashs `\` ou des slashs `/` selon le contexte
- **Regex** : Les patterns de remplacement PowerShell utilisent la syntaxe .NET regex
- **Encoding** : PowerShell peut avoir des problèmes d'encodage, utiliser `-Encoding UTF8` si nécessaire

## Exemples récents utilisés

### Migration systemesJeu.js vers config/
```powershell
# Remplacement effectué manuellement via MultiEdit après échec PowerShell
# Raison : Problèmes d'échappement avec les barres obliques dans les chemins
```