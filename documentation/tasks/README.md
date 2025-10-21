# Tasks - Intégration Legends in the Mist

## Vue d'Ensemble

Ce dossier contient toutes les tasks détaillées pour l'intégration de "Legends in the Mist" dans Brumisa3.

**Total : 23 tasks | 102h estimées**

## Organisation par Phase

### Phase 1 : Traductions (8h - 3 tasks)
- [TASK-001](TASK-2025-01-19-001-config-i18n.md) - Configuration i18n (2h)
- [TASK-002](TASK-2025-01-19-002-traductions-litm.md) - Extraction traductions (4h)
- [TASK-003](TASK-2025-01-19-003-composable-i18n.md) - Composable i18n (2h)

### Phase 2 : Composants & Backend (44h - 10 tasks)
- [TASK-004](TASK-2025-01-19-004-prisma-litm.md) - Modèle Prisma (4h)
- [TASK-004-bis](TASK-2025-01-19-004-bis-composants-ui-base.md) - **Composants UI Base (3h)** ⭐ NOUVEAU
- [TASK-005](TASK-2025-01-19-005-theme-card.md) - ThemeCard.vue (6h)
- [TASK-006](TASK-2025-01-19-006-hero-card.md) - HeroCard.vue (5h)
- [TASK-007](TASK-2025-01-19-007-trackers.md) - Trackers (4h)
- [TASK-008](TASK-2025-01-19-008-store-litm.md) - Store Pinia (3h)
- [TASK-009A](TASK-2025-01-19-009A-api-characters.md) - **API Characters (3h)** ⭐ MODIFIÉ
- [TASK-009B](TASK-2025-01-19-009B-api-cards-trackers.md) - **API Cards & Trackers (3h)** ⭐ NOUVEAU
- [TASK-010](TASK-2025-01-19-010-page-character-create.md) - Page création (6h)
- [TASK-010-bis](TASK-2025-01-19-010-bis-tests-e2e.md) - **Tests E2E (4h)** ⭐ NOUVEAU

### Phase Migration : Import de Données (3h - 1 task)
- [TASK-019](TASK-2025-01-19-019-migration-donnees.md) - **Migration données (3h)** ⭐ NOUVEAU - CRITIQUE

### Phase Documentation : Guide Utilisateur (2h - 1 task)
- [TASK-020](TASK-2025-01-19-020-documentation-utilisateur.md) - **Documentation utilisateur (2h)** ⭐ NOUVEAU

### Phase 3 : Fonctionnalités Avancées (18h - 4 tasks)
- [TASK-011](TASK-2025-01-19-011-drawer-system.md) - Drawer (6h)
- [TASK-012](TASK-2025-01-19-012-undo-redo.md) - Undo/Redo (4h)
- [TASK-013](TASK-2025-01-19-013-command-palette.md) - Command Palette (3h)
- [TASK-014](TASK-2025-01-19-014-drag-drop.md) - Drag & Drop (5h)

### Phase 4 : Multi-Joueurs - Optionnel (27h - 4 tasks)
- [TASK-015](TASK-2025-01-19-015-websocket.md) - WebSocket (8h)
- [TASK-016](TASK-2025-01-19-016-chat-system.md) - Chat (6h)
- [TASK-017](TASK-2025-01-19-017-dice-roller.md) - Lanceur de dés (5h)
- [TASK-018](TASK-2025-01-19-018-sessions.md) - Sessions (8h)

## Changements par Rapport au Plan Initial

### Tasks Ajoutées (5 nouvelles)
1. **TASK-004-bis** : Composants UI de base - Évite duplication de code
2. **TASK-009A** : API Characters séparée - Meilleure organisation
3. **TASK-009B** : API Cards & Trackers séparée - Permet parallélisation
4. **TASK-010-bis** : Tests E2E - Qualité globale
5. **TASK-019** : Migration données - CRITIQUE pour utilisateurs existants
6. **TASK-020** : Documentation utilisateur - UX complète

### Tasks Modifiées
- ~~TASK-009~~ → Divisée en **TASK-009A** et **TASK-009B**

### Temps Total
- **Avant** : 86h (18 tasks)
- **Après** : 102h (23 tasks)
- **Delta** : +16h (+18%)

**Justification** : Les 16h supplémentaires évitent :
- La duplication de code (TASK-004-bis)
- Les bugs d'intégration (TASK-010-bis)
- La perte de données utilisateur (TASK-019)
- Les tickets support (TASK-020)

## Ordre d'Exécution Recommandé

### Sprint 1 - Infrastructure (8h)
```
001 → 002 → 003
```

### Sprint 2 - Fondations Backend (11h)
```
004 (parallèle) ┐
                ├→ 004-bis → 005, 006, 007
                │
                └→ 008 → 009A → 009B
```

### Sprint 3 - Interface & Tests (14h)
```
010 → 010-bis
019 (en parallèle si 009A terminé)
```

### Sprint 4 - Finition (2h)
```
020
```

### Sprint 5+ - Features Avancées (18h - optionnel)
```
011 → 012, 013 (parallèle)
014 (après 011)
```

### Sprint 6+ - Multi-Joueurs (27h - optionnel)
```
015 → 016, 017 (parallèle) → 018
```

## Dépendances Critiques

```
                    001 (i18n config)
                     │
        ┌────────────┼────────────┐
        │            │            │
       002         004-bis       004 (Prisma)
        │            │            │
       003          │            008 (Store)
                    │            │
                005, 006, 007   009A (API Chars)
                    │            │
                    └─────┬──────┘
                          │
                        009B (API Cards)
                          │
                         010 (Page)
                          │
                        010-bis (Tests E2E)
                          │
                         020 (Doc)

                    019 (Migration)
                    └─ Dépend de: 004, 009A
```

## Priorités

### CRITIQUE (À faire en premier)
- TASK-001, 002, 003 (i18n)
- TASK-004 (Prisma)
- TASK-004-bis (Composants base)
- TASK-019 (Migration)

### HAUTE (Phase 2 complète)
- TASK-005, 006, 007 (Composants)
- TASK-008 (Store)
- TASK-009A, 009B (API)
- TASK-010, 010-bis (Page & Tests)

### IMPORTANTE
- TASK-020 (Documentation)

### MOYENNE (Phase 3)
- TASK-011, 012, 013, 014

### BASSE (Phase 4 - optionnel)
- TASK-015, 016, 017, 018

## Notes

- Les tasks en **gras** sont nouvelles ou modifiées
- Les tasks marquées ⭐ sont des ajouts recommandés
- Phase 4 est entièrement optionnelle
- Certaines tasks peuvent être parallélisées (voir graphe de dépendances)

## Utilisation des Templates

Toutes les tasks suivent le template défini dans [documentation/templates/task.md](../templates/task.md).

Pour créer une nouvelle task, copier le template et remplir toutes les sections.
