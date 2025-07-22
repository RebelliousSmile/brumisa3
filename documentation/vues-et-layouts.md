# Système de Vues et Layouts

> **Note** : Ce document couvre l'architecture générale des vues. Pour les layouts thématiques par système de jeu, voir [`layouts-systemes.md`](./layouts-systemes.md).

## Architecture des vues

Le projet utilise un système de layouts EJS thématiques pour assurer la cohérence visuelle tout en permettant la personnalisation par système de jeu.

### Structure des dossiers

```
src/views/
├── layouts/
│   ├── base.ejs          # Structure HTML de base
│   ├── principal.ejs     # Layout principal du site  
│   ├── generique.ejs     # Layout générique (bleu)
│   ├── monsterhearts.ejs # Layout Monsterhearts (purple)
│   ├── engrenages.ejs    # Layout Engrenages (emerald)
│   ├── metro2033.ejs     # Layout Metro 2033 (red)
│   └── mistengine.ejs    # Layout Mist Engine (pink)
├── partials/             # Composants réutilisables
│   ├── breadcrumb.ejs    # Fil d'ariane adaptatif
│   ├── footer-systeme.ejs# Footer thématique
│   ├── floating-menu.ejs
│   └── back-to-top.ejs
├── systemes/             # Pages dédiées par système
│   └── monsterhearts.ejs
├── oracles/              # Pages oracles
│   ├── liste.ejs
│   └── detail.ejs
├── auth/                 # Pages d'authentification  
├── personnages/          # Pages personnages
├── errors/               # Pages d'erreur
└── index.ejs            # Page d'accueil
```

## Système de layouts thématiques

### Layout de base (base.ejs)
Structure HTML commune avec meta tags, fonts, et scripts. Définit les variables CSS système par défaut.

### Layouts par système de jeu
Chaque système a son propre layout avec :
- Couleurs thématiques (variables CSS `--system-primary`, `--system-secondary`)
- Effets de fond adaptés à l'ambiance
- Navigation cohérente
- Fil d'ariane et footer adaptatifs

### Utilisation dans les contrôleurs

```javascript
// Layout automatique selon le système
res.render('oracles/liste', {
    layout: 'layouts/monsterhearts',
    titre: 'Oracles Monsterhearts',
    gameSystem: 'monsterhearts',
    oracles: data
});
```

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

## Layouts thématiques

> **Détails complets** : Voir [`layouts-systemes.md`](./layouts-systemes.md) pour l'architecture complète des layouts par système.

### Organisation des layouts

```
src/views/layouts/
├── base.ejs              # Structure HTML de base
├── principal.ejs         # Layout principal actuel
├── generique.ejs         # Layout générique (bleu)
├── monsterhearts.ejs     # Layout gothique (purple)
├── engrenages.ejs        # Layout fantasy (emerald)  
├── metro2033.ejs         # Layout post-apo (red)
└── mistengine.ejs        # Layout onirique (pink)
```

### Variables CSS système

Chaque layout définit ses variables CSS :
```css
:root {
    --system-primary: #8b5cf6;    /* Couleur principale */
    --system-secondary: #a855f7;  /* Couleur secondaire */
    --system-accent: #ec4899;     /* Couleur d'accent */
}
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