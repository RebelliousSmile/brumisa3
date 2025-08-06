# JSDoc Integration

## Configuration JSDoc

JSDoc est déjà installé dans les devDependencies du projet (version 4.0.4).

### Configuration à ajouter

1. Créer un fichier `jsdoc.json` à la racine du projet
2. Ajouter un script npm pour générer la documentation
3. Configurer les patterns de documentation

### Utilisation

- Documenter les services avec JSDoc
- Générer la documentation automatiquement
- Intégrer dans le workflow de développement

## Scripts disponibles

```bash
# Générer la documentation
pnpm run docs:generate

# Nettoyer la documentation existante
pnpm run docs:clean
```

## Accès à la documentation

### Consultation locale
La documentation est disponible dans le répertoire `docs/`. Pour la consulter :

1. **Via serveur de développement** : `http://localhost:3081/docs/` (serveur en cours d'exécution)
2. **Via navigateur** : Ouvrir directement `docs/index.html` dans un navigateur
3. **Via serveur local** : 
   ```bash
   cd docs
   python -m http.server 8080
   # Puis accéder à http://localhost:8080
   ```

### Structure générée
- `docs/index.html` : Point d'entrée principal
- Documentation par module (services, controllers, models)
- Navigation automatique entre les fichiers

## Mise à jour de la documentation

### Processus recommandé

1. **Avant génération** : Nettoyer l'ancienne documentation
   ```bash
   pnpm run docs:clean
   ```

2. **Générer** : Créer la nouvelle documentation
   ```bash
   pnpm run docs:generate
   ```

3. **Vérifier** : Ouvrir `docs/index.html` pour contrôler le résultat

### Bonnes pratiques JSDoc

- **Services** : Documenter toutes les méthodes publiques
- **Classes** : Ajouter une description de la classe et ses responsabilités  
- **Paramètres** : Spécifier types et descriptions avec `@param`
- **Retours** : Documenter avec `@returns`
- **Exemples** : Utiliser `@example` pour les cas d'usage complexes

### Automatisation
Considérer l'ajout d'un hook pre-commit pour régénérer la documentation automatiquement lors des modifications de code.
