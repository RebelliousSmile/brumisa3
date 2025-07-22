# Pages Systèmes de Jeu

> **Layouts thématiques** : Pour l'architecture des layouts par système, voir [`layouts-systemes.md`](./layouts-systemes.md).

## Vue d'ensemble

Chaque système de jeu dispose maintenant de sa propre page dédiée pour un meilleur référencement SEO et une personnalisation spécifique.

## Architecture

### URLs des pages systèmes
- `/monsterhearts` - Page dédiée Monsterhearts
- `/engrenages` - Page dédiée Engrenages & Sortilèges  
- `/metro2033` - Page dédiée Metro 2033
- `/mistengine` - Page dédiée Mist Engine

### Routes (src/routes/web.js)
```javascript
// Page Monsterhearts
router.get('/monsterhearts', (req, res) => {
    res.render('systemes/monsterhearts', {
        title: 'Monsterhearts - Générateur PDF JDR',
        description: 'Créez des fiches de personnages pour Monsterhearts',
        systeme: 'monsterhearts'
    });
});
```

### Templates (src/views/systemes/)
- `monsterhearts.ejs` - Page Monsterhearts (créée)
- `engrenages.ejs` - Page Engrenages (à créer)
- `metro2033.ejs` - Page Metro 2033 (à créer)
- `mistengine.ejs` - Page Mist Engine (à créer)

## Navigation

### Menu principal
Le menu de navigation (src/views/layouts/principal.ejs) pointe maintenant vers les pages dédiées :
- Utilisateurs connectés ET non connectés : même liens vers `/systeme`
- Plus de logique conditionnelle selon l'authentification

```html
<!-- Game Links (public pages) -->
<div class="hidden md:flex items-center space-x-8 font-display">
    <a href="/monsterhearts" class="flex items-center text-gray-300 hover:text-purple-400 transition-colors">
        <i class="ra ra-heartburn text-purple-400 mr-2"></i>
        <span class="text-sm">Monsterhearts</span>
    </a>
    <!-- ... autres liens -->
</div>
```

## Page /mes-documents

### Principe
- Page réservée aux utilisateurs connectés
- Affiche TOUS les contenus créés par l'utilisateur (personnages + PDFs)
- Filtrage par système de jeu via interface (pas de query strings)
- Accès via le menu utilisateur

### Fonctionnalités
- Onglets personnages/PDFs
- Filtres par système de jeu
- Actions : créer, modifier, supprimer, générer PDF

## Avantages

### SEO
- Une URL propre par système : `/monsterhearts` vs `/?systeme=monsterhearts`
- Meta descriptions spécifiques par système
- Contenu personnalisé pour chaque univers

### UX
- Navigation cohérente entre connectés/non connectés
- Pages dédiées permettent une personnalisation poussée (couleurs, images, contenu spécifique)
- Séparation claire : pages publiques vs espace personnel (/mes-documents)

### Développement
- Code plus maintenable avec un template par système
- Possibilité d'ajouter des fonctionnalités spécifiques par système
- Meilleure organisation des fichiers

## À implémenter

1. Créer les 3 autres pages systèmes (engrenages, metro2033, mistengine)
2. Personnaliser chaque page avec :
   - Couleurs thématiques
   - Contenu spécifique au système
   - Fonctionnalités dédiées
3. Simplifier /mes-documents (supprimer les query strings)
4. Ajouter des composants Alpine.js spécifiques si nécessaire