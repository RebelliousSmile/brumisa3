# UX Mobile-First

## Philosophie de conception

### 📱 Mobile d'abord
L'application est conçue prioritairement pour les appareils mobiles, avec des améliorations progressives pour tablettes et desktop.

### 🎯 Utilisateurs cibles
- **Joueurs mobile** : Création rapide de personnages pendant les pauses
- **MJ nomades** : Gestion de campagnes sur tablette
- **Sessions hybrides** : Utilisation simultanée mobile/desktop

## Patterns d'interface

### Navigation mobile
- **Bottom navigation** : Actions principales accessibles au pouce
- **Swipe gestures** : Navigation latérale entre sections
- **Pull-to-refresh** : Actualisation naturelle du contenu
- **Scroll infini** : Chargement progressif des listes

### Formulaires adaptatifs
- **Input types** : Claviers optimisés (email, number, search)
- **Validation temps réel** : Feedback immédiat
- **Auto-save** : Sauvegarde automatique des brouillons
- **Step-by-step** : Formulaires complexes découpés

### Interactions gestuelles
- **Touch targets** : Minimum 44px selon guidelines Apple/Google
- **Haptic feedback** : Vibrations légères pour confirmation
- **Long press** : Menus contextuels et actions alternatives
- **Double tap** : Zoom sur les fiches PDF

## Composants spécialisés

### Cards système
```html
<!-- Cartes empilées mobile-first -->
<div class="space-y-4 max-w-md mx-auto md:grid md:grid-cols-2">
  <!-- Animation au tap -->
  <div class="transform transition-all duration-200 hover:scale-105">
```

### Navigation condensée
- **Hamburger menu** : Menu principal réduit
- **Breadcrumbs mobiles** : Navigation contextuelle
- **Floating action button** : Action principale flottante
- **Tab bar** : Navigation par onglets en bas

### Listes optimisées
- **Virtual scrolling** : Performance avec grandes listes
- **Item swipe actions** : Éditer/supprimer par glissement
- **Skeleton loading** : États de chargement fluides
- **Empty states** : Guidage utilisateur sur actions possibles

## States et feedback

### États de chargement
```javascript
// États visuels explicites
chargementPersonnage: false,
chargementPdf: false,
chargementNewsletter: false
```

### Messages utilisateur
- **Toast notifications** : Messages non-intrusifs
- **Inline validation** : Erreurs contextuelles
- **Success animations** : Confirmations visuelles
- **Progress indicators** : Suivi des tâches longues

### Mode hors ligne
- **Cache intelligent** : Données essentielles en local
- **Sync background** : Synchronisation automatique
- **Offline indicators** : État de connexion visible
- **Queue d'actions** : Rejeu automatique à la reconnexion

## Accessibilité mobile

### Standards WCAG
- **Contraste** : Minimum 4.5:1 pour le texte
- **Touch targets** : 44x44px minimum
- **Focus visible** : Navigation clavier claire
- **Screen readers** : Sémantique HTML5 correcte

### Adaptations spécifiques
- **Dark mode** : Mode sombre automatique
- **Font scaling** : Respect des préférences utilisateur
- **Motion reduction** : Animations réduites si demandé
- **Voice over** : Support lecteurs d'écran mobiles

## Performance mobile

### Stratégies d'optimisation
- **Critical CSS** : Styles critiques inline
- **Lazy loading** : Images et composants différés
- **Service workers** : Cache intelligent et hors ligne
- **Bundle splitting** : Code par route

### Métriques cibles
- **First Contentful Paint** : < 1.5s
- **Largest Contentful Paint** : < 2.5s
- **First Input Delay** : < 100ms
- **Cumulative Layout Shift** : < 0.1

## Tests mobiles

### Devices de référence
- **iPhone SE** : Petit écran iOS
- **iPhone 12** : Standard iOS moderne
- **Galaxy S21** : Android flagship
- **iPad Air** : Tablette de référence

### Outils de test
- **Chrome DevTools** : Émulation responsive
- **BrowserStack** : Tests multi-devices
- **Lighthouse** : Audits performance
- **Real device testing** : Tests sur vrais appareils

## Patterns spécifiques JDR

### Création de personnage mobile
1. **Sélection système** : Cards visuelles avec animations
2. **Informations de base** : Formulaire simplifié
3. **Attributs** : Sliders tactiles ou steppers
4. **Révision** : Récapitulatif avant validation

### Consultation de fiche
- **Tabs horizontales** : Sections organisées
- **Zoom pinch** : Agrandissement naturel
- **Share sheet** : Partage natif mobile
- **Quick actions** : Actions fréquentes accessibles

### Génération PDF mobile
- **Progress bar** : Avancement visible
- **Background processing** : Génération non-bloquante
- **Push notifications** : Alerte quand prêt
- **Preview modal** : Aperçu avant téléchargement

## Stratégie responsive

### Breakpoints Tailwind
```css
/* Mobile-first breakpoints */
sm: '640px'   /* Grande mobile / petite tablette */
md: '768px'   /* Tablette portrait */
lg: '1024px'  /* Tablette paysage / petit desktop */
xl: '1280px'  /* Desktop standard */
2xl: '1536px' /* Grand écran */
```

### Adaptations par taille
- **xs-sm** : Interface mobile pure
- **md** : Hybride mobile/tablette
- **lg+** : Interface desktop enrichie

### Grilles adaptatives
```html
<!-- Mobile: stack, Desktop: grid -->
<div class="space-y-4 md:grid md:grid-cols-2 md:gap-6 md:space-y-0">
```

## Innovation UX

### Micro-interactions
- **Button press** : Feedback tactile immédiat
- **Form completion** : Animations de progression
- **Success states** : Célébrations visuelles
- **Error recovery** : Guidage vers résolution

### Personnalisation
- **Thèmes adaptatifs** : Couleurs par système JDR
- **Layout preferences** : Densité d'information ajustable
- **Quick access** : Raccourcis personnalisés
- **Recent items** : Accès rapide aux dernières actions