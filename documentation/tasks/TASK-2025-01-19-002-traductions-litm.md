# Task - Extraction et adaptation des traductions LITM

## Métadonnées

- **ID**: TASK-2025-01-19-002
- **Date de création**: 2025-01-19
- **Créé par**: Claude
- **Priorité**: Haute
- **Statut**: À faire
- **Temps estimé**: 4h
- **Temps réel**: -

## Description

### Objectif

Extraire les traductions FR/EN du repository characters-of-the-mist et les adapter pour l'architecture Nuxt 4 de Brumisater.

### Contexte

Le projet characters-of-the-mist dispose de traductions complètes et de qualité pour "Legends in the Mist" (35 860 caractères en FR, 32 089 en EN). Ces traductions couvrent tous les aspects du jeu : cartes de thème, suivis, quêtes, interface utilisateur, etc.

### Périmètre

**Inclus dans cette tâche**:
- Téléchargement des fichiers messages/fr.json et messages/en.json
- Extraction des sections pertinentes pour Brumisater
- Adaptation de la structure JSON pour Nuxt i18n
- Organisation par domaines (character, cards, trackers, ui, etc.)
- Validation des fichiers JSON

**Exclu de cette tâche** (à traiter séparément):
- Composable d'accès aux traductions (TASK-003)
- Interface de changement de langue
- Traductions pour d'autres systèmes de jeu

## Spécifications Techniques

### Stack & Technologies

- **Framework**: Nuxt 4
- **Module i18n**: @nuxtjs/i18n
- **Format**: JSON
- **Source**: GitHub API / MCP GitHub

### Architecture

```
app/locales/
├── fr/
│   ├── common.json              # Traductions communes
│   ├── litm/
│   │   ├── characters.json      # Personnages
│   │   ├── cards.json           # Cartes de thème
│   │   ├── trackers.json        # Suivis
│   │   ├── ui.json              # Interface
│   │   ├── themebooks.json      # Livres de thèmes
│   │   └── errors.json          # Messages d'erreur
└── en/
    ├── common.json
    └── litm/
        ├── characters.json
        ├── cards.json
        ├── trackers.json
        ├── ui.json
        ├── themebooks.json
        └── errors.json
```

### Fichiers Concernés

**Nouveaux fichiers**:
- [ ] `app/locales/fr/litm/characters.json`
- [ ] `app/locales/fr/litm/cards.json`
- [ ] `app/locales/fr/litm/trackers.json`
- [ ] `app/locales/fr/litm/ui.json`
- [ ] `app/locales/fr/litm/themebooks.json`
- [ ] `app/locales/fr/litm/errors.json`
- [ ] `app/locales/en/litm/` (même structure)

**Fichiers à modifier**:
- [ ] `app/i18n.config.ts` - Import des nouveaux fichiers

## Plan d'Implémentation

### Étape 1: Téléchargement des fichiers sources

**Objectif**: Récupérer les fichiers de traduction depuis GitHub

**Actions**:
- [ ] Utiliser MCP GitHub pour télécharger `messages/fr.json`
- [ ] Utiliser MCP GitHub pour télécharger `messages/en.json`
- [ ] Sauvegarder temporairement dans `documentation/sources/`
- [ ] Vérifier l'intégrité des fichiers JSON

**Fichiers**:
- `documentation/sources/characters-of-the-mist-fr.json` (temporaire)
- `documentation/sources/characters-of-the-mist-en.json` (temporaire)

**Critères de validation**:
- Les fichiers sont téléchargés sans erreur
- Le JSON est valide et parsable

### Étape 2: Analyse de la structure source

**Objectif**: Comprendre l'organisation des traductions source

**Actions**:
- [ ] Analyser la structure du fichier fr.json
- [ ] Identifier les sections pertinentes pour Brumisater
- [ ] Identifier les sections non pertinentes (à exclure)
- [ ] Créer un mapping des clés vers les nouveaux fichiers

**Sections pertinentes identifiées**:
- `CharacterSheetPage` → `characters.json`
- `ThemeCard`, `HeroCard` → `cards.json`
- `Trackers`, `PipTracker` → `trackers.json`
- `LegendsData`, `ThemeTypes` → `themebooks.json`
- `Errors`, `Notifications` → `errors.json`
- Interface générale → `ui.json`

**Critères de validation**:
- Toutes les sections sont catégorisées
- Le mapping est documenté

### Étape 3: Création de la structure de dossiers

**Objectif**: Créer l'arborescence pour les traductions LITM

**Actions**:
- [ ] Créer `app/locales/fr/litm/`
- [ ] Créer `app/locales/en/litm/`
- [ ] Créer les fichiers JSON vides avec structure de base

**Fichiers**: Tous les fichiers listés dans "Fichiers Concernés"

**Critères de validation**:
- La structure est créée
- Les fichiers JSON sont valides (au moins `{}`)

### Étape 4: Extraction et organisation - Français

**Objectif**: Extraire et organiser les traductions françaises

**Actions**:
- [ ] Extraire les traductions de personnages → `characters.json`
- [ ] Extraire les traductions de cartes → `cards.json`
- [ ] Extraire les traductions de suivis → `trackers.json`
- [ ] Extraire les traductions d'UI → `ui.json`
- [ ] Extraire les traductions de themebooks → `themebooks.json`
- [ ] Extraire les messages d'erreur → `errors.json`

**Fichiers**: `app/locales/fr/litm/*.json`

**Critères de validation**:
- Toutes les traductions pertinentes sont extraites
- La structure JSON est cohérente
- Pas de traductions en double

### Étape 5: Extraction et organisation - Anglais

**Objectif**: Extraire et organiser les traductions anglaises

**Actions**:
- [ ] Répéter l'étape 4 pour l'anglais
- [ ] Vérifier la correspondance des clés FR/EN
- [ ] Documenter les clés manquantes dans une langue

**Fichiers**: `app/locales/en/litm/*.json`

**Critères de validation**:
- Les clés FR et EN correspondent
- Aucune clé orpheline
- Les deux langues ont la même structure

### Étape 6: Adaptation pour Nuxt i18n

**Objectif**: Adapter la structure pour être compatible avec Nuxt i18n

**Actions**:
- [ ] Aplatir les structures imbriquées si nécessaire
- [ ] Adapter les placeholders (ex: `{name}` reste `{name}`)
- [ ] Vérifier la syntaxe des pluriels
- [ ] Ajouter des métadonnées (version, source, license)

**Fichiers**: Tous les fichiers de traduction

**Critères de validation**:
- La syntaxe est compatible vue-i18n
- Les placeholders fonctionnent
- Les pluriels sont corrects

### Étape 7: Configuration i18n

**Objectif**: Intégrer les nouveaux fichiers dans la config i18n

**Actions**:
- [ ] Modifier `app/i18n.config.ts` pour importer les fichiers LITM
- [ ] Tester le lazy loading
- [ ] Vérifier que les traductions sont accessibles

**Fichiers**: `app/i18n.config.ts`

**Critères de validation**:
- Les traductions LITM sont chargées
- Le lazy loading fonctionne
- Pas d'erreur au runtime

### Étape 8: Validation et tests

**Objectif**: Valider que toutes les traductions fonctionnent

**Actions**:
- [ ] Créer une page de test affichant des traductions LITM
- [ ] Tester le changement de langue FR/EN
- [ ] Vérifier les placeholders
- [ ] Vérifier le fallback

**Fichiers**: `app/pages/test-litm-i18n.vue` (temporaire)

**Critères de validation**:
- Toutes les traductions s'affichent
- Le changement de langue fonctionne
- Les placeholders sont remplacés correctement

## Tests

### Tests Unitaires

- [ ] Test de parsing des fichiers JSON
- [ ] Test de la correspondance des clés FR/EN

### Tests d'Intégration

- [ ] Test du chargement des traductions LITM
- [ ] Test des placeholders avec valeurs dynamiques

### Tests Manuels

- [ ] Vérifier visuellement un échantillon de traductions
- [ ] Tester le changement de langue
- [ ] Vérifier la qualité des traductions françaises

## Dépendances

### Bloqueurs

- [ ] TASK-001 (Config i18n) doit être terminée

### Dépendances Externes

- [ ] Accès au repository Altervayne/characters-of-the-mist via MCP GitHub

### Tâches Liées

- **TASK-001**: Bloqueur (config i18n)
- **TASK-003**: Suivante (composable i18n)

## Critères d'Acceptation

- [ ] Le code respecte les principes SOLID et DRY
- [ ] Les tests passent avec succès
- [ ] La documentation est à jour
- [ ] Le code suit les conventions du projet (CLAUDE.md)
- [ ] Toutes les traductions FR/EN sont extraites et organisées
- [ ] La structure JSON est cohérente et maintenable
- [ ] Les traductions sont accessibles via $t() et useI18n()
- [ ] Le lazy loading fonctionne correctement
- [ ] Crédits ajoutés dans les fichiers (source: Altervayne, license CC BY-NC-SA 4.0)

## Risques & Contraintes

### Risques Identifiés

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Structure JSON incompatible avec vue-i18n | Moyen | Faible | Tests précoces, adaptation si nécessaire |
| Traductions manquantes EN | Faible | Très faible | Utiliser FR comme fallback |
| Volume important de traductions | Faible | Certain | Lazy loading, fichiers séparés par domaine |

### Contraintes

- **Légal**: Respecter la license CC BY-NC-SA 4.0 (attribution requise)
- **Technique**: Fichiers JSON doivent être valides
- **Temporelle**: Maximum 4h
- **Qualité**: Préserver la qualité des traductions originales

## Documentation

### Documentation à Créer

- [ ] Fichier `app/locales/README.md` expliquant la structure
- [ ] Commentaires dans chaque fichier JSON (source, license, version)
- [ ] Mapping des clés original → nouveau dans la doc

### Documentation à Mettre à Jour

- [ ] Ajouter les crédits à Altervayne dans le README principal
- [ ] Documenter la structure des traductions LITM

## Revue & Validation

### Checklist avant Review

- [ ] Tous les fichiers JSON sont valides
- [ ] Les clés FR et EN correspondent
- [ ] Les crédits sont présents
- [ ] La structure est documentée
- [ ] Les tests passent

### Reviewers

- [ ] Validation technique (structure JSON correcte)
- [ ] Validation linguistique (qualité des traductions)

### Critères de Validation

- [ ] Code review approuvée
- [ ] Structure validée
- [ ] Traductions vérifiées (échantillon)

## Notes de Développement

### Décisions Techniques

**2025-01-19**: Organisation par domaines plutôt qu'un seul fichier
- **Raison**: 35 000+ caractères, trop volumineux pour un seul fichier
- **Avantage**: Lazy loading plus granulaire, meilleure maintenabilité

**2025-01-19**: Préservation de la structure originale autant que possible
- **Raison**: Facilite les futures mises à jour depuis la source
- **Avantage**: Traçabilité, simplicité

### Sections de characters-of-the-mist à exclure

- `Drawer` : Fonctionnalité spécifique à leur app (Phase 3)
- `CommandPalette` : Fonctionnalité spécifique (Phase 3)
- `MigrationDialog` : Non pertinent pour Brumisater
- `Tutorial` : À adapter si on crée un tutorial

### Problèmes Rencontrés

(À remplir pendant l'implémentation)

### Questions & Réponses

**Q**: Faut-il préserver la structure imbriquée complexe ?
**R**: Simplifier si nécessaire pour vue-i18n, documenter les changements

**Q**: Comment gérer les mises à jour futures des traductions source ?
**R**: Documenter le mapping, créer un script de synchronisation si besoin

## Résultat Final

(À remplir une fois la tâche terminée)

### Ce qui a été accompli

- [À remplir]

### Déviations par rapport au plan initial

[À remplir]

### Prochaines Étapes Suggérées

- Passer à TASK-003 (Composable i18n)
- Créer un script de synchronisation avec la source

## Références

- [characters-of-the-mist - Repository source](https://github.com/Altervayne/characters-of-the-mist)
- [messages/fr.json](https://github.com/Altervayne/characters-of-the-mist/blob/master/messages/fr.json)
- [messages/en.json](https://github.com/Altervayne/characters-of-the-mist/blob/master/messages/en.json)
- [License CC BY-NC-SA 4.0](http://creativecommons.org/licenses/by-nc-sa/4.0/)
- [Vue I18n - Message Format Syntax](https://vue-i18n.intlify.dev/guide/essentials/syntax.html)
