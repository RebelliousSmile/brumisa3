# Task - Nettoyage Mist : Code Backend et Frontend

## Métadonnées

- **ID**: TASK-2025-01-19-020C
- **Série**: Nettoyage Systèmes Mist (3/4)
- **Date de création**: 2025-01-19
- **Créé par**: Claude
- **Priorité**: Haute
- **Statut**: À faire
- **Temps estimé**: 4-5h
- **Temps réel**: -

## Description

### Objectif

Nettoyer le code backend et frontend pour supprimer toutes les références aux systèmes non-Mist (Monsterhearts, Engrenages, Metro 2033, Zombiology) et mettre à jour les fallbacks, composants et pages pour ne conserver que les systèmes Mist (City of Mist, Otherscape, Post-Mortem, Legends in the Mist).

### Contexte

Après avoir nettoyé la base de données (TASK-020B), il faut maintenant adapter le code pour :
- Mettre à jour le fallback statique dans les API routes
- Supprimer les composants spécifiques aux systèmes retirés
- Retirer les références dans les pages
- Mettre à jour les stores Pinia si nécessaire
- S'assurer que l'application fonctionne uniquement avec les systèmes Mist

Le code doit rester cohérent avec la base de données nettoyée.

### Périmètre

**Inclus dans cette tâche**:
- Mise à jour des API routes (`server/api/systems/*`)
- Modification du fallback statique (`getStaticSystemsData`)
- Suppression des composants UI spécifiques aux systèmes retirés (si existants)
- Mise à jour des pages utilisant les systèmes
- Mise à jour des stores Pinia concernés
- Nettoyage des tests unitaires et d'intégration
- Vérification que l'application démarre sans erreur
- Tests manuels des fonctionnalités Mist

**Exclu de cette tâche** (traité dans TASK-020D):
- Mise à jour de la documentation technique
- Mise à jour des fichiers DESIGN-SYSTEM
- Création du changelog final

## Spécifications Techniques

### Stack & Technologies

- **Framework**: Nuxt 4
- **Langage**: TypeScript/JavaScript
- **Backend**: Nitro Server
- **Frontend**: Vue 3 + Composition API
- **State Management**: Pinia
- **Testing**: Vitest

### Architecture

```
Nettoyage Code:
Backend (API Routes)
├── server/api/systems/index.get.ts (UPDATE fallback)
├── server/api/systems/[id].get.ts (VERIFY)
└── server/api/systems/cards.get.ts (VERIFY)

Frontend (Pages & Components)
├── app/pages/systemes/ (VERIFY)
├── app/components/ (DELETE si spécifiques)
└── app/layouts/ (VERIFY)

State Management
└── shared/stores/systemes.ts (VERIFY)

Tests
├── tests/**/*.test.ts (UPDATE/DELETE)
└── tests/**/*.spec.ts (UPDATE/DELETE)
```

### Fichiers Concernés

**Fichiers à modifier**:
- [ ] `server/api/systems/index.get.ts` - Mise à jour `getStaticSystemsData()`
- [ ] `server/api/systems/[id].get.ts` - Vérification logique
- [ ] `server/api/systems/cards.get.ts` - Vérification logique
- [ ] `app/pages/systemes/[slug]/[univers].vue` - Vérification routing
- [ ] `app/layouts/default.vue` - Vérification liens navigation
- [ ] `shared/stores/systemes.ts` - Vérification si nécessaire
- [ ] `tests/composables/useSystemes.test.ts` - Mise à jour tests
- [ ] `tests/integration/*` - Mise à jour tests d'intégration

**Fichiers à supprimer** (si existants):
- [ ] Composants UI spécifiques aux systèmes retirés
- [ ] Tests spécifiques aux systèmes retirés

## Plan d'Implémentation

### Étape 1: Mise à Jour du Fallback Backend

**Objectif**: Mettre à jour `getStaticSystemsData()` pour ne retourner que les systèmes Mist

**Actions**:
- [ ] Lire `server/api/systems/index.get.ts`
- [ ] Localiser la fonction `getStaticSystemsData()`
- [ ] Supprimer les systèmes non-Mist :
  - pbta (Monsterhearts)
  - engrenages (Roue du Temps, Ecryme)
  - myz (Metro 2033)
  - zombiology
- [ ] Conserver uniquement `mistengine` avec :
  - City of Mist
  - Tokyo: Otherscape
  - Post-Mortem
  - Obojima
  - Zamanora
- [ ] Ajouter Legends in the Mist si nécessaire
- [ ] Vérifier que les couleurs, pictogrammes sont corrects

**Code attendu** :
```javascript
function getStaticSystemsData() {
  return {
    mistengine: {
      id: 'mistengine',
      nomComplet: 'Mist Engine',
      description: 'Moteur de jeu narratif pour univers mystiques et atmosphériques.',
      actif: true,
      univers: [
        {
          id: 'city-of-mist',
          nomComplet: 'City of Mist',
          description: 'Enquêtes urbaines modernes avec éléments surnaturels.',
          actif: true
        },
        {
          id: 'otherscape',
          nomComplet: 'Tokyo: Otherscape',
          description: 'Tokyo moderne avec des éléments surnaturels.',
          actif: true
        },
        {
          id: 'post_mortem',
          nomComplet: 'Post-Mortem',
          description: 'Enquêtes surnaturelles dans l\'au-delà.',
          actif: true
        },
        {
          id: 'obojima',
          nomComplet: 'Obojima',
          description: 'Île mystérieuse aux secrets ancestraux (Legends in the Mist).',
          actif: true
        },
        {
          id: 'zamanora',
          nomComplet: 'Zamanora',
          description: 'Monde de magie et de mystères (Legends in the Mist).',
          actif: true
        }
      ]
    }
  }
}
```

**Fichiers**:
- `server/api/systems/index.get.ts`

**Critères de validation**:
- Fonction retourne uniquement les systèmes Mist
- Structure JSON correcte
- Descriptions et métadonnées cohérentes

### Étape 2: Vérification des Autres API Routes

**Objectif**: S'assurer que les autres endpoints API fonctionnent correctement

**Actions**:
- [ ] Lire `server/api/systems/[id].get.ts`
- [ ] Vérifier la logique de récupération par ID
- [ ] Tester avec des IDs Mist (mistengine, city-of-mist, otherscape, etc.)
- [ ] Lire `server/api/systems/cards.get.ts`
- [ ] Vérifier si ce fichier fait référence aux systèmes supprimés
- [ ] Mettre à jour si nécessaire

**Fichiers**:
- `server/api/systems/[id].get.ts`
- `server/api/systems/cards.get.ts`

**Critères de validation**:
- Endpoints fonctionnent avec les systèmes Mist
- Aucune référence aux systèmes supprimés dans le code
- Codes d'erreur appropriés si ID non trouvé

### Étape 3: Audit et Nettoyage des Composants UI

**Objectif**: Identifier et supprimer les composants spécifiques aux systèmes retirés

**Actions**:
- [ ] Lister tous les composants dans `app/components/`
- [ ] Chercher les composants nommés avec les systèmes supprimés :
  - Grep "monsterhearts" dans app/components/
  - Grep "engrenages" dans app/components/
  - Grep "metro" dans app/components/
  - Grep "zombiology" dans app/components/
- [ ] Supprimer ces composants s'ils existent
- [ ] Vérifier que `SystemCard.vue` est générique (ne hard-code pas de systèmes)
- [ ] Vérifier que `SystemCards.vue` fonctionne avec les systèmes Mist

**Fichiers**:
- `app/components/` (divers fichiers potentiels)

**Critères de validation**:
- Aucun composant spécifique aux systèmes supprimés
- Composants génériques fonctionnent avec Mist
- Aucune référence hard-codée aux systèmes supprimés

### Étape 4: Vérification des Pages et Layouts

**Objectif**: S'assurer que les pages et layouts ne font pas référence aux systèmes supprimés

**Actions**:
- [ ] Lire `app/pages/systemes/[slug]/[univers].vue`
- [ ] Vérifier que le routing dynamique fonctionne pour Mist
- [ ] Lire `app/layouts/default.vue`
- [ ] Vérifier les liens de navigation (ne doivent pas pointer vers systèmes supprimés)
- [ ] Lire `app/pages/index.vue`
- [ ] Vérifier l'affichage de la liste des systèmes
- [ ] Lire `app/pages/dashboard.vue` si existant
- [ ] Vérifier les références aux systèmes

**Fichiers**:
- `app/pages/systemes/[slug]/[univers].vue`
- `app/layouts/default.vue`
- `app/pages/index.vue`
- `app/pages/dashboard.vue`

**Critères de validation**:
- Pages fonctionnent avec les systèmes Mist
- Aucun lien vers systèmes supprimés
- Navigation cohérente

### Étape 5: Mise à Jour du Store Pinia

**Objectif**: Vérifier et mettre à jour le store systèmes si nécessaire

**Actions**:
- [ ] Lire `shared/stores/systemes.ts`
- [ ] Vérifier s'il y a des valeurs hard-codées
- [ ] Vérifier les actions et getters
- [ ] Mettre à jour si nécessaire
- [ ] Vérifier que le store utilise l'API pour récupérer les systèmes

**Fichiers**:
- `shared/stores/systemes.ts`

**Critères de validation**:
- Store fonctionne avec les systèmes Mist
- Pas de valeurs hard-codées pour systèmes supprimés
- Actions et getters cohérents

### Étape 6: Nettoyage des Tests

**Objectif**: Mettre à jour ou supprimer les tests référençant les systèmes supprimés

**Actions**:
- [ ] Lister tous les fichiers de test : `ls -R tests/`
- [ ] Grep "monsterhearts" dans tests/
- [ ] Grep "engrenages" dans tests/
- [ ] Grep "metro" dans tests/
- [ ] Grep "zombiology" dans tests/
- [ ] Supprimer les tests spécifiques aux systèmes retirés
- [ ] Mettre à jour les tests génériques pour utiliser les systèmes Mist
- [ ] Mettre à jour `tests/composables/useSystemes.test.ts`
- [ ] Mettre à jour `tests/integration/*` si nécessaire

**Fichiers**:
- `tests/composables/useSystemes.test.ts`
- `tests/services/PdfService.test.ts`
- `tests/integration/*`

**Critères de validation**:
- Aucun test ne référence les systèmes supprimés
- Tests génériques utilisent les systèmes Mist
- Tests passent avec succès

### Étape 7: Tests de Fonctionnement

**Objectif**: Valider que l'application fonctionne correctement après les modifications

**Actions**:
- [ ] Lancer le serveur de développement : `pnpm dev`
- [ ] Vérifier qu'il démarre sans erreur
- [ ] Tester l'endpoint `/api/systems` dans le navigateur
- [ ] Vérifier que seuls les systèmes Mist sont retournés
- [ ] Naviguer vers la page d'accueil
- [ ] Vérifier l'affichage des systèmes Mist
- [ ] Tester la création d'un personnage pour un univers Mist
- [ ] Tester la génération de PDF pour un univers Mist
- [ ] Exécuter les tests unitaires : `pnpm test`
- [ ] Vérifier qu'ils passent tous

**Critères de validation**:
- Serveur démarre sans erreur
- API retourne uniquement systèmes Mist
- Pages fonctionnent correctement
- Création de personnage fonctionne
- Génération PDF fonctionne
- Tous les tests passent

## Tests

### Tests Unitaires

- [ ] Test `useSystemes()` - Doit retourner uniquement systèmes Mist
- [ ] Test API route `/api/systems` - Doit retourner uniquement Mist
- [ ] Test store Pinia systèmes - Actions et getters fonctionnent

### Tests d'Intégration

- [ ] Test flow complet de création de personnage City of Mist
- [ ] Test flow complet de création de personnage Otherscape
- [ ] Test génération PDF pour Post-Mortem
- [ ] Test navigation entre les pages systèmes

### Tests Manuels

- [ ] Lancer `pnpm dev` et vérifier absence d'erreurs console
- [ ] Naviguer vers `/api/systems` et vérifier JSON
- [ ] Naviguer vers page d'accueil et vérifier liste systèmes
- [ ] Créer un personnage pour chaque univers Mist
- [ ] Générer un PDF pour vérifier que ça fonctionne

## Dépendances

### Bloqueurs

- [ ] **TASK-020B terminée** : Base de données nettoyée

### Dépendances Externes

- Node.js et pnpm installés
- Serveur PostgreSQL accessible

### Tâches Liées

- **TASK-020A** : Audit et Préparation (complétée)
- **TASK-020B** : Nettoyage Base de Données (prérequis)
- **TASK-020D** : Documentation et Validation (bloquée par cette tâche)

## Critères d'Acceptation

- [ ] Le code respecte les principes SOLID et DRY
- [ ] Fallback `getStaticSystemsData()` ne retourne que systèmes Mist
- [ ] Aucun composant UI spécifique aux systèmes supprimés
- [ ] Pages et layouts ne référencent pas les systèmes supprimés
- [ ] Store Pinia fonctionne correctement
- [ ] Aucune référence hard-codée aux systèmes supprimés
- [ ] Tous les tests passent avec succès
- [ ] Application démarre sans erreur
- [ ] Fonctionnalités Mist opérationnelles (création perso, PDF)

## Risques & Contraintes

### Risques Identifiés

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Référence cachée à un système supprimé | Moyen | Moyen | Grep exhaustif, tests manuels approfondis |
| Composant UI cassé après suppression | Moyen | Faible | Tests unitaires et manuels, revue de code |
| Régression fonctionnelle | Élevé | Faible | Tests d'intégration complets avant validation |
| Hardcode non détecté | Faible | Moyen | Revue de code ligne par ligne pour les fichiers critiques |

### Contraintes

- **Technique**: Maintenir la compatibilité avec Nuxt 4
- **Temporelle**: Bloque la validation finale (TASK-020D)
- **Ressources**: Nécessite environnement de développement fonctionnel
- **Compatibilité**: Code doit rester compatible avec Prisma et Vue 3

## Documentation

### Documentation à Créer

- [ ] Commentaires inline pour les modifications importantes

### Documentation à Mettre à Jour

- [ ] Aucune (sera faite dans TASK-020D)

## Revue & Validation

### Checklist avant Review

- [ ] Le code compile sans erreurs
- [ ] Les tests passent
- [ ] Le code est formatté correctement
- [ ] Aucune valeur hard-codée pour systèmes supprimés
- [ ] L'application démarre et fonctionne

### Reviewers

- [ ] Utilisateur (validation fonctionnelle)
- [ ] Review technique du code modifié

### Critères de Validation

- [ ] Code review approuvée
- [ ] Tests validés
- [ ] Application fonctionnelle
- [ ] Aucune régression détectée

## Notes de Développement

### Décisions Techniques

**[2025-01-19]**: Suppression vs Commentaire de code
- **Décision**: Supprimer le code des systèmes retirés, pas le commenter
- **Justification**: Code commenté pollue la codebase, git garde l'historique si besoin

**[2025-01-19]**: Fallback statique vs DB only
- **Décision**: Garder un fallback statique avec uniquement les systèmes Mist
- **Justification**: Robustesse en cas de problème DB, configuration moins dépendante

### Problèmes Rencontrés

(À compléter pendant l'exécution de la tâche)

### Questions & Réponses

**Q**: Faut-il supprimer ou commenter le code ?
**R**: Supprimer. Git garde l'historique, le code commenté pollue la codebase.

**Q**: Que faire si un composant générique référence un système supprimé ?
**R**: Retirer uniquement la référence, garder le composant s'il est générique.

**Q**: Faut-il créer un composant spécifique pour City of Mist ?
**R**: Non, garder des composants génériques qui fonctionnent pour tous les systèmes Mist.

## Résultat Final

### Ce qui a été accompli

(À compléter après l'exécution de la tâche)

### Déviations par rapport au plan initial

(À compléter après l'exécution de la tâche)

### Prochaines Étapes

- Exécuter TASK-020D : Nettoyage Documentation et Validation

## Références

- [Server API Systems](c:\Users\fxgui\Documents\Projets\generateur-pdf-jdr\server\api\systems\index.get.ts)
- [TASK-020A](c:\Users\fxgui\Documents\Projets\generateur-pdf-jdr\documentation\tasks\TASK-2025-01-19-020A-cleanup-mist-audit.md)
- [TASK-020B](c:\Users\fxgui\Documents\Projets\generateur-pdf-jdr\documentation\tasks\TASK-2025-01-19-020B-cleanup-mist-database.md)
- [Nuxt 4 Documentation](https://nuxt.com/docs)
