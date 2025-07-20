# Système de Vues et Layouts

## Architecture des vues

Le projet utilise **Express EJS Layouts** pour gérer le système de templates. Cela permet de réutiliser des structures communes entre les pages.

### Structure des dossiers

```
src/views/
├── layouts/
│   └── principal.ejs      # Layout principal du site
├── partials/              # Composants réutilisables
│   ├── floating-menu.ejs
│   ├── back-to-top.ejs
│   └── ...
├── auth/                  # Pages d'authentification
│   └── connexion.ejs
├── personnages/           # Pages liées aux personnages
├── errors/                # Pages d'erreur
│   ├── 404.ejs
│   └── 500.ejs
└── index.ejs             # Page d'accueil
```

## Comment fonctionne le système de layouts

### Configuration (dans src/app.js)

```javascript
// Express EJS Layouts
this.app.use(expressLayouts);
this.app.set('layout', 'layouts/principal');
this.app.set('layout extractScripts', true);
this.app.set('layout extractStyles', true);
```

### Layout principal (layouts/principal.ejs)

Le layout principal contient :
- La structure HTML de base
- Le header avec navigation
- Le footer
- Les scripts et styles communs
- Un emplacement pour le contenu : `<%- body %>`

### Injection du contenu

Chaque page EJS est automatiquement injectée dans le layout à l'emplacement `<%- body %>`.

## Créer une nouvelle page

### 1. Créer le fichier de vue

Créez un fichier `.ejs` dans le dossier approprié :

```ejs
<!-- src/views/ma-nouvelle-page.ejs -->
<div class="min-h-screen bg-gray-900 text-white">
    <div class="max-w-4xl mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-8">Ma Nouvelle Page</h1>
        <!-- Contenu de la page -->
    </div>
</div>
```

### 2. Ajouter la route

Dans `src/routes/web.js` :

```javascript
router.get('/ma-nouvelle-page', (req, res) => {
    res.render('ma-nouvelle-page', {
        title: 'Ma Nouvelle Page - Générateur PDF JDR'
    });
});
```

### 3. Variables disponibles

Dans le layout et les vues, vous avez accès à :
- `locals.utilisateur` : Utilisateur connecté
- `locals.systemes` : Systèmes de jeu disponibles
- Variables passées dans `res.render()`

## Layouts spécifiques par jeu

### Créer un layout pour un système de jeu

1. **Créer le layout** :

```ejs
<!-- src/views/layouts/monsterhearts.ejs -->
<!DOCTYPE html>
<html lang="fr">
<head>
    <!-- Meta et styles spécifiques à Monsterhearts -->
    <style>
        :root {
            --couleur-principale: #8b0000; /* Rouge sombre */
        }
    </style>
</head>
<body class="bg-red-950">
    <!-- Header spécifique Monsterhearts -->
    <nav class="bg-red-900 border-b border-red-800">
        <!-- Navigation thématique -->
    </nav>
    
    <!-- Contenu de la page -->
    <main>
        <%- body %>
    </main>
    
    <!-- Footer thématique -->
</body>
</html>
```

2. **Utiliser le layout dans une route** :

```javascript
router.get('/monsterhearts/creation', (req, res) => {
    res.render('personnages/creation-monsterhearts', {
        layout: 'layouts/monsterhearts',
        title: 'Créer un personnage - Monsterhearts'
    });
});
```

### Organisation suggérée pour plusieurs layouts

```
src/views/layouts/
├── principal.ejs          # Layout général du site
├── monsterhearts.ejs      # Layout thème dark/gothique
├── engrenages.ejs         # Layout thème steampunk
├── metro2033.ejs          # Layout thème post-apo
└── mistengine.ejs         # Layout thème fantastique
```

## Composants réutilisables (Partials)

### Créer un partial

```ejs
<!-- src/views/partials/carte-personnage.ejs -->
<div class="bg-gray-800 rounded-lg p-4">
    <h3 class="text-xl font-bold"><%= personnage.nom %></h3>
    <p class="text-gray-400"><%= personnage.systeme %></p>
</div>
```

### Utiliser un partial

```ejs
<!-- Dans une vue -->
<% personnages.forEach(personnage => { %>
    <%- include('../partials/carte-personnage', { personnage }) %>
<% }) %>
```

## Bonnes pratiques

### 1. Structure des vues
- Gardez les vues simples et focalisées sur la présentation
- Utilisez Alpine.js pour l'interactivité côté client
- Évitez la logique complexe dans les templates

### 2. Nommage
- Utilisez des noms descriptifs en français
- Groupez par fonctionnalité (auth/, personnages/, etc.)
- Préfixez les layouts spéciaux (layout-monsterhearts.ejs)

### 3. Styles
- Utilisez Tailwind CSS pour le styling
- Définissez des variables CSS pour les couleurs thématiques
- Respectez la charte graphique dark gaming

### 4. Performance
- Minimisez les includes imbriqués
- Utilisez le cache EJS en production
- Optimisez les assets statiques

## Exemple complet : Ajouter une page "Actualités"

1. **Créer la vue** (`src/views/actualites.ejs`) :

```ejs
<div class="min-h-screen bg-gray-900 text-white py-12">
    <div class="max-w-4xl mx-auto px-4">
        <h1 class="text-3xl font-bold mb-8 text-center">
            <i class="ra ra-scroll text-purple-400 mr-3"></i>
            Actualités du JDR
        </h1>
        
        <div class="space-y-6">
            <% actualites.forEach(actu => { %>
                <article class="bg-gray-800 rounded-lg p-6">
                    <h2 class="text-xl font-bold mb-2"><%= actu.titre %></h2>
                    <p class="text-gray-400 text-sm mb-4">
                        <%= new Date(actu.date).toLocaleDateString('fr-FR') %>
                    </p>
                    <p class="text-gray-300"><%= actu.contenu %></p>
                </article>
            <% }) %>
        </div>
    </div>
</div>
```

2. **Ajouter la route** (`src/routes/web.js`) :

```javascript
router.get('/actualites', async (req, res) => {
    try {
        // Récupérer les actualités depuis la base de données
        const actualites = await Actualite.findAll({
            order: [['date', 'DESC']],
            limit: 10
        });
        
        res.render('actualites', {
            title: 'Actualités - Générateur PDF JDR',
            actualites
        });
    } catch (error) {
        next(error);
    }
});
```

3. **Ajouter le lien dans la navigation** (dans le layout principal) :

```ejs
<a href="/actualites" class="text-gray-300 hover:text-purple-400">
    Actualités
</a>
```

## Dépannage

### La page affiche une erreur 404
- Vérifiez que le fichier .ejs existe au bon endroit
- Vérifiez que la route est bien définie
- Vérifiez le nom exact du fichier (sensible à la casse)

### Le layout ne s'applique pas
- Vérifiez la configuration express-ejs-layouts
- Assurez-vous que le layout existe
- Vérifiez le chemin du layout dans res.render()

### Les variables sont undefined
- Passez toutes les variables nécessaires dans res.render()
- Utilisez locals.variable pour les variables globales
- Vérifiez les middlewares qui injectent des données