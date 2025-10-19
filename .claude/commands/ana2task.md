# Slash Command: /ana2task - Analyse to Tasks avec Validation Qualité

## Description

Transforme les N dernières réponses de la conversation (suite à un prompt d'analyse) en tâches structurées, puis valide leur qualité avec les agents disponibles jusqu'à obtenir une évaluation 100% satisfaisante.

**Usage** : Après avoir obtenu une analyse ou des recommandations, l'utilisateur tape simplement `/ana2task` et la commande récupère automatiquement le contexte récent de la conversation.

## Workflow

Tu es un expert en gestion de projet et en création de tâches de développement. Ton objectif est de transformer les résultats d'analyse récents en tâches de haute qualité, validées par des agents spécialisés.

### Phase 0 : Récupération du Contexte

1. **Analyser l'historique de conversation**
   - Récupérer les 3-5 derniers messages de l'assistant (tes propres réponses)
   - Identifier le dernier prompt utilisateur qui a déclenché l'analyse
   - Extraire tous les résultats, recommandations, et suggestions

2. **Identifier le type de contenu**
   - Analyse technique (architecture, performance, etc.)
   - Recommandations fonctionnelles
   - Plan d'implémentation
   - Résolution de problème
   - Autre (demander clarification)

3. **Vérifier la pertinence**
   - Si le contexte récent ne contient pas d'analyse/recommandations : demander à l'utilisateur de préciser
   - Si trop ancien (>10 messages) : demander confirmation

### Phase 1 : Compréhension et Extraction

1. **Extraire du contexte de conversation**
   - Objectifs principaux identifiés dans l'analyse
   - Contraintes techniques mentionnées
   - Dépendances identifiées
   - Recommandations et suggestions faites

2. **Analyser le contexte du projet**
   - Lire `CLAUDE.md` pour les conventions du projet
   - Consulter `documentation/DEVELOPPEMENT/` pour l'architecture
   - Vérifier les tâches existantes dans `documentation/tasks/`

3. **Identifier les domaines concernés**
   - Frontend (Vue 3 / Nuxt 4)
   - Backend (Nitro / Prisma)
   - Base de données (PostgreSQL)
   - Tests (Vitest / E2E)
   - Documentation

### Phase 2 : Génération des Tâches

Pour chaque tâche à créer :

1. **Utiliser le template** `documentation/templates/task.md`

2. **Remplir toutes les sections** :
   - Métadonnées (ID, priorité, temps estimé)
   - Description claire de l'objectif
   - Périmètre (inclus/exclu)
   - Spécifications techniques
   - Plan d'implémentation détaillé (étapes)
   - Tests à créer
   - Dépendances et bloqueurs
   - Critères d'acceptation (SOLID, DRY, tests, etc.)
   - Risques et contraintes

3. **Appliquer les principes**:
   - **SOLID** : Une tâche = une responsabilité
   - **DRY** : Éviter la duplication entre tâches
   - **Granularité** : 2-8h par tâche (ni trop grosse, ni trop petite)
   - **Dépendances** : Clairement identifiées
   - **Testabilité** : Tests définis dès le départ

4. **Créer les fichiers**:
   - Format : `documentation/tasks/TASK-YYYY-MM-DD-XXX-nom-court.md`
   - ID séquentiel (vérifier le dernier ID existant)

### Phase 3 : Validation par les Agents

Une fois les tâches générées, lancer la validation avec les agents suivants **EN PARALLÈLE** :

#### 1. Agent Technical Architect (Validation Technique)

```
Tu es le Technical Architect. Ton rôle est de valider l'architecture technique des tâches.

Analyse les tâches suivantes : [liste des fichiers créés]

Vérifie pour CHAQUE tâche :

**Architecture & Design**
- [ ] Les choix techniques sont appropriés (Stack, patterns, etc.)
- [ ] L'architecture est scalable
- [ ] Les dépendances sont minimales et justifiées
- [ ] Pas de sur-ingénierie (KISS principle)
- [ ] Compatibilité avec l'architecture existante (Nuxt 4, Prisma, etc.)

**Performance**
- [ ] Les points de performance sont identifiés
- [ ] Stratégie de caching si nécessaire
- [ ] Requêtes DB optimisées (pas de N+1)

**Sécurité**
- [ ] Validation des inputs définie
- [ ] Authentification/autorisation mentionnée si nécessaire
- [ ] Pas de données sensibles en dur

**Score** : X/100
**Problèmes critiques** : [liste]
**Suggestions d'amélioration** : [liste]
```

#### 2. Agent Senior Code Reviewer (Validation Qualité Code)

```
Tu es le Senior Code Reviewer. Ton rôle est de valider la qualité et la maintenabilité du code prévu.

Analyse les tâches suivantes : [liste des fichiers créés]

Vérifie pour CHAQUE tâche :

**Code Quality**
- [ ] Respect des principes SOLID
- [ ] Respect du principe DRY
- [ ] Les noms de fichiers/composants sont explicites
- [ ] Séparation des responsabilités claire
- [ ] Pas de code dupliqué prévisible

**Tests**
- [ ] Tests unitaires définis
- [ ] Tests d'intégration définis si nécessaire
- [ ] Tests E2E pour les features critiques
- [ ] Couverture de code ciblée (>80%)

**Maintenabilité**
- [ ] Le code sera facile à comprendre
- [ ] Les composables/services sont réutilisables
- [ ] Documentation inline prévue

**Score** : X/100
**Problèmes critiques** : [liste]
**Suggestions d'amélioration** : [liste]
```

#### 3. Agent Product Owner (Validation Fonctionnelle)

```
Tu es le Product Owner. Ton rôle est de valider que les tâches répondent aux besoins métier.

Analyse les tâches suivantes : [liste des fichiers créés]

Vérifie pour CHAQUE tâche :

**Valeur Métier**
- [ ] L'objectif de la tâche est clair
- [ ] La tâche apporte de la valeur utilisateur
- [ ] Les critères d'acceptation sont mesurables
- [ ] Le périmètre est bien défini (inclus/exclu)

**User Experience**
- [ ] L'UX est prise en compte
- [ ] Les cas d'erreur sont gérés
- [ ] Les messages utilisateur sont définis
- [ ] L'accessibilité est mentionnée si pertinent

**Complétude**
- [ ] Tous les cas d'usage sont couverts
- [ ] Les dépendances fonctionnelles sont identifiées
- [ ] Les risques métier sont identifiés

**Score** : X/100
**Problèmes critiques** : [liste]
**Suggestions d'amélioration** : [liste]
```

### Phase 4 : Agrégation et Itération

1. **Attendre les résultats des 3 agents**

2. **Calculer le score global** :
   ```
   Score Global = (Score Architect + Score Reviewer + Score PO) / 3
   ```

3. **Analyser les problèmes critiques** :
   - Créer une liste consolidée de tous les problèmes
   - Prioriser par criticité

4. **Si Score Global < 100%** :
   - Appliquer les corrections suggérées
   - Modifier les fichiers de tâches
   - Relancer la Phase 3 (validation)
   - Maximum 3 itérations

5. **Si Score Global = 100%** :
   - Confirmer à l'utilisateur
   - Créer un fichier récapitulatif
   - Mettre à jour le plan global si nécessaire

### Phase 5 : Finalisation

1. **Créer le fichier récapitulatif** :
   ```
   documentation/tasks/RECAP-YYYY-MM-DD-session.md

   Contenu :
   - Liste des tâches créées avec liens
   - Temps total estimé
   - Dépendances principales
   - Ordre d'exécution recommandé
   - Validation : ✅ 100% validé par les 3 agents
   ```

2. **Mettre à jour** `documentation/tasks/README.md` :
   - Ajouter les nouvelles tâches
   - Mettre à jour le compteur total
   - Mettre à jour le graphe de dépendances si pertinent

3. **Si applicable, mettre à jour le plan global** :
   - Ajouter les tâches au plan de développement concerné
   - Mettre à jour les estimations de temps

4. **Confirmation finale** :
   ```
   ✅ Tâches créées et validées à 100%

   📊 Résumé :
   - X tâches créées
   - Temps total : Xh
   - Validations :
     - Technical Architect : 100% ✅
     - Senior Code Reviewer : 100% ✅
     - Product Owner : 100% ✅

   📁 Fichiers créés :
   - [liste des fichiers avec liens]

   📋 Prochaines étapes :
   - [suggestions]
   ```

## Format d'Utilisation

### Scénario Typique

1. **L'utilisateur pose une question ou demande une analyse** :
   ```
   User: Peux-tu analyser comment améliorer les 18 tâches du plan LITM ?
   ```

2. **Claude répond avec une analyse détaillée** :
   ```
   Assistant: [Analyse complète avec recommandations, nouveaux tasks suggérés, etc.]
   ```

3. **L'utilisateur active la commande** :
   ```
   User: /ana2task
   ```

4. **La commande récupère automatiquement les dernières réponses** et génère les tâches

### Cas d'Usage

#### Cas 1 : Après une Analyse
```
User: Analyse l'efficacité de ces 18 tâches
Claude: [Longue analyse avec 5 recommandations d'amélioration]
User: /ana2task
```
→ La commande transforme les 5 recommandations en tâches structurées

#### Cas 2 : Après des Recommandations
```
User: Comment intégrer les traductions de characters-of-the-mist ?
Claude: [Plan détaillé en 4 phases]
User: /ana2task
```
→ La commande crée les tâches pour les 4 phases

#### Cas 3 : Après une Discussion Technique
```
User: Quelle est la meilleure approche pour le système de favoris ?
Claude: Je recommande 3 approches : [détails des 3 approches]
User: /ana2task
```
→ La commande peut demander quelle approche transformer en tâches, ou créer des tâches pour les 3 en parallèle

## Exemples Concrets

### Exemple 1 : Simple (conversation précédente)
```
User: Comment ajouter un système de tri des personnages ?

Claude: Pour ajouter le tri, voici ce que je recommande :
1. Ajouter un champ `sortOrder` dans le modèle Prisma
2. Créer une API pour mettre à jour l'ordre
3. Interface drag & drop dans le frontend
4. Sauvegarder la préférence utilisateur

User: /ana2task
```

**La commande génère** :
- TASK-2025-01-19-021 : Modèle Prisma - Champ sortOrder (1h)
- TASK-2025-01-19-022 : API updateSortOrder (2h)
- TASK-2025-01-19-023 : UI Drag & Drop tri (3h)
- TASK-2025-01-19-024 : Persistance préférence (1h)
- Total : 7h, 4 tâches ✅

### Exemple 2 : Complexe (contexte de cette conversation)
```
[Conversation précédente avec analyse des 18 tâches et recommandations]

User: /ana2task
```

**La commande génère** :
- TASK-004-bis : Composants UI Base (3h)
- TASK-009A : API Characters (3h)
- TASK-009B : API Cards & Trackers (3h)
- TASK-010-bis : Tests E2E (4h)
- TASK-019 : Migration données (3h)
- TASK-020 : Documentation utilisateur (2h)
- Total : 18h, 6 tâches ✅

### Exemple 3 : Avec Fichier Externe
```
User: /ana2task @documentation/DEVELOPPEMENT/refactoring-ideas.md
```

→ La commande lit le fichier ET le contexte récent de conversation, puis génère les tâches

## Règles Importantes

### Granularité des Tâches
- **Minimum** : 1h (sinon trop petit, fusionner)
- **Maximum** : 8h (sinon découper)
- **Idéal** : 2-4h (une demi-journée à une journée)

### Dépendances
- Toujours identifier les bloqueurs
- Suggérer les tâches parallélisables
- Créer un graphe de dépendances si >5 tâches

### Nomenclature
```
TASK-YYYY-MM-DD-XXX-nom-court-explicite.md

Exemples :
✅ TASK-2025-01-19-021-favoris-personnages.md
✅ TASK-2025-01-19-022-api-favoris.md
❌ TASK-2025-01-19-023-feature.md (trop vague)
❌ TASK-021.md (pas de date ni description)
```

### Priorités
- **Critique** : Bloque tout, à faire immédiatement
- **Haute** : Fonctionnalité principale
- **Moyenne** : Amélioration importante
- **Basse** : Nice to have, peut attendre

### Validation Qualité
Les agents doivent valider :
- ✅ **100%** : Tâche parfaite, prête à implémenter
- ⚠️ **80-99%** : Quelques ajustements nécessaires, itération requise
- ❌ **<80%** : Problèmes critiques, réécriture nécessaire

## Critères de Succès de la Command

La command `/ana2task` est considérée comme réussie si :

1. ✅ Toutes les tâches sont créées avec le template complet
2. ✅ Score global des 3 agents = 100%
3. ✅ Aucun problème critique restant
4. ✅ Dépendances clairement identifiées
5. ✅ Plan d'exécution recommandé fourni
6. ✅ Documentation mise à jour (README.md des tasks)

## Limitations et Contraintes

- **Maximum 15 tâches par session** : Si plus, découper en plusieurs sessions
- **Maximum 3 itérations de validation** : Au-delà, demander clarification utilisateur
- **Respect des conventions projet** : Toujours lire CLAUDE.md avant de créer
- **Tests obligatoires** : Chaque tâche de code doit avoir des tests définis

## Gestion des Erreurs

### Si un agent ne répond pas
- Logger l'erreur
- Continuer avec les 2 autres agents
- Score = (Score1 + Score2) / 2
- Avertir l'utilisateur de l'agent manquant

### Si score < 80% après 3 itérations
- Afficher les problèmes restants
- Demander à l'utilisateur :
  - Accepter en l'état (avec avertissement)
  - Fournir plus de contexte
  - Abandonner et reformuler

### Si l'input est trop vague
- Poser des questions de clarification :
  - Quel est l'objectif métier ?
  - Quels sont les utilisateurs concernés ?
  - Y a-t-il des contraintes techniques ?
  - Quelle est la priorité ?

## Post-Traitement

Après création et validation des tâches :

1. **Proposer une branche Git** :
   ```
   git checkout -b feature/YYYY-MM-DD-nom-feature
   git add documentation/tasks/
   git commit -m "docs: add tasks for [feature name]"
   ```

2. **Suggérer la prochaine action** :
   - Commencer par quelle tâche ?
   - Besoin d'un prototype d'abord ?
   - Revue avec l'équipe nécessaire ?

3. **Créer un tracker visuel** (optionnel) :
   ```markdown
   ## Progression [Feature Name]

   Phase 1 : Backend
   - [ ] TASK-XXX-1
   - [ ] TASK-XXX-2

   Phase 2 : Frontend
   - [ ] TASK-XXX-3
   - [ ] TASK-XXX-4

   Phase 3 : Tests
   - [ ] TASK-XXX-5
   ```

## Notes pour Claude

- **Toujours** utiliser les 3 agents en parallèle (appel unique avec multiple Task tool calls)
- **Toujours** créer les fichiers de tâches avant de lancer les agents
- **Toujours** itérer jusqu'à 100% ou maximum 3 fois
- **Toujours** fournir un récapitulatif final clair
- **Ne jamais** créer de tâches de moins de 1h ou plus de 8h
- **Ne jamais** oublier les tests dans les critères d'acceptation
- **Ne jamais** créer de code pendant cette command (seulement des tâches)

## Commandes Complémentaires

Après `/ana2task`, l'utilisateur peut utiliser :
- `/task [ID]` : Voir les détails d'une tâche
- `/start [ID]` : Commencer l'implémentation d'une tâche
- `/review [ID]` : Lancer une code review de la tâche implémentée

---

**Version** : 1.0
**Dernière mise à jour** : 2025-01-19
**Auteur** : Claude + User