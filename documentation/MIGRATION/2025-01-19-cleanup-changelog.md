# Changelog - Nettoyage des Systèmes Non-Mist (2025-01-19)

## Métadonnées

- **Date** : 2025-01-19
- **Série de tâches** : TASK-020A, TASK-020B, TASK-020C, TASK-020D
- **Branche Git** : `cleanup/mist-only-systems`
- **Responsable** : Claude
- **Temps total** : ~16-20h

## Résumé Exécutif

Cette migration majeure a consisté à **supprimer tous les systèmes de jeu non-Mist Engine** de l'application Brumisater pour se concentrer uniquement sur l'écosystème **Mist Engine** (City of Mist, Tokyo: Otherscape, Post-Mortem, Legends in the Mist).

**Objectif** : Simplifier la codebase, améliorer la maintenabilité et préparer l'intégration complète de Legends in the Mist.

**Résultat** : Application 100% Mist Engine, base de données nettoyée, code simplifié, documentation mise à jour.

---

## Systèmes Supprimés

### 1. Monsterhearts (PBTA - Powered by the Apocalypse)
- **Type** : JDR gothique romantique
- **Univers** : Monsterhearts, Urban Shadows
- **Suppression** :
  - 1 système : `pbta`, `monsterhearts`
  - 2 univers : `monsterhearts`, `urban_shadows`
  - 2 oracles supprimés
  - 0 personnages (base vide)
  - Fichiers documentation : 1 fichier de charte graphique

### 2. Engrenages & Sortilèges
- **Type** : JDR steampunk-fantasy
- **Univers** : Roue du Temps, Ecryme
- **Suppression** :
  - 1 système : `engrenages`
  - 2 univers : `roue_du_temps`, `ecryme`
  - 2 oracles supprimés
  - 0 personnages (base vide)
  - Fichiers documentation : 1 fichier de charte graphique

### 3. Metro 2033 (Mutant Year Zero Engine)
- **Type** : JDR post-apocalyptique
- **Univers** : Metro 2033
- **Suppression** :
  - 2 systèmes : `myz`, `metro2033`
  - 1 univers : `metro2033`
  - 1 oracle supprimé
  - 0 personnages (base vide)
  - Fichiers documentation : 1 fichier de charte graphique

### 4. Zombiology
- **Type** : JDR survie zombie d100
- **Univers** : Zombiology
- **Suppression** :
  - 1 système : `zombiology`
  - 1 univers : `zombiology`
  - 2 oracles supprimés
  - 0 personnages (base vide)
  - Fichiers documentation : 1 fichier de charte graphique

---

## Systèmes Conservés

### Mist Engine (Système unique conservé)

**Système** : `mistengine`

**Univers actifs** :
1. **City of Mist** (`city-of-mist`) - AJOUTÉ lors du cleanup
   - Jeu d'investigation urbain, légendes et mystères
   - Ajouté à la base de données avec TASK-020B

2. **Tokyo: Otherscape** (`otherscape`)
   - Variante de City of Mist, Tokyo moderne avec yokai
   - Conservé

3. **Post-Mortem** (`post_mortem`)
   - Hack de City of Mist, enquêtes dans l'au-delà
   - Conservé

4. **Obojima** (`obojima`)
   - Univers pour Legends in the Mist
   - Île mystérieuse aux secrets ancestraux
   - Conservé

5. **Zamanora** (`zamanora`)
   - Univers pour Legends in the Mist
   - Monde de magie et mystères
   - Conservé

**Oracles conservés** : 3 oracles pour les univers Mist

---

## TASK-020A : Audit et Préparation

**Durée** : ~2-3h
**Commit** : `d3fa8e7` (Audit et backup)

### Actions réalisées

1. **Création de la branche Git**
   ```bash
   git checkout -b cleanup/mist-only-systems
   ```

2. **Audit de la base de données**
   - Script : `scripts/audit-database.js`
   - Résultat : 7 systèmes, 10 univers, 10 oracles identifiés
   - Documentation : `documentation/MIGRATION/2025-01-19-inventory-systems.md`

3. **Backup de la base de données**
   - Script : `scripts/backup-database.js`
   - Fichier : `documentation/MIGRATION/2025-01-19-backup-before-cleanup.json` (107 KB)
   - Contenu sauvegardé :
     - 7 systèmes de jeu
     - 10 univers
     - 10 oracles
     - 233 items d'oracles

4. **Script SQL de nettoyage**
   - Fichier : `prisma/migrations/draft_cleanup_non_mist_systems.sql`
   - Ordre de suppression respecté (FK constraints avec onDelete: Restrict)
   - Ajout de City of Mist prévu

5. **Inventaire des fichiers à modifier**
   - Documentation : `documentation/MIGRATION/2025-01-19-files-to-modify.md`
   - 72 fichiers identifiés :
     - Backend : 6 fichiers (CRITICAL/HIGH)
     - Frontend : 9 fichiers
     - Tests : 10 fichiers
     - Documentation : 29 fichiers

6. **Validation par Technical Architect**
   - Analyse de l'architecture
   - Recommandations de décomposition en 4 tâches
   - Validation de l'approche

### Fichiers créés
- `documentation/tasks/TASK-2025-01-19-020A-cleanup-mist-audit.md`
- `documentation/MIGRATION/2025-01-19-inventory-systems.md`
- `documentation/MIGRATION/2025-01-19-files-to-modify.md`
- `scripts/audit-database.js`
- `scripts/backup-database.js`
- `prisma/migrations/draft_cleanup_non_mist_systems.sql`

---

## TASK-020B : Nettoyage Base de Données

**Durée** : ~3.5-4.5h
**Commit** : `dac34ab` (Database cleanup)

### Actions réalisées

1. **Exécution du script de nettoyage**
   - Script : `scripts/execute-cleanup-v2.js`
   - Méthode : Utilisation de Prisma Client (limitation $executeRawUnsafe)
   - Décomposition en opérations individuelles

2. **Suppressions effectuées**
   - **Oracles** : 7 supprimés
   - **Documents** : 0 (base vide)
   - **PDFs** : 0 (base vide)
   - **Personnages** : 0 (base vide)
   - **Univers** : 6 supprimés
   - **Systèmes** : 6 supprimés

3. **Ajout de City of Mist**
   ```sql
   INSERT INTO univers_jeu (
     id, nom_complet, statut, systeme_jeu_id, ordre_affichage
   ) VALUES (
     'city-of-mist', 'City of Mist', 'ACTIF', 'mistengine', 1
   );
   ```

4. **Vérification d'intégrité**
   - Requêtes Prisma pour détecter les orphelins
   - Résultat : 0 orphelins détectés
   - Intégrité référentielle : OK

5. **Optimisation PostgreSQL**
   - Script : `scripts/vacuum-analyze.js`
   - Tables optimisées : 7 tables
   - Performance : VACUUM ANALYZE réussi

6. **Validation finale**
   - Connexion à la base AlwaysData
   - Query de vérification : 1 système, 5 univers
   - Résultat conforme aux attentes

### État final de la base

```
Systèmes : 1
- mistengine

Univers : 5
- city-of-mist (AJOUTÉ)
- obojima
- otherscape
- post_mortem
- zamanora

Oracles : 3 (oracles Mist conservés)
```

### Fichiers créés/modifiés
- `documentation/tasks/TASK-2025-01-19-020B-cleanup-mist-database.md`
- `scripts/execute-cleanup-v2.js`
- `scripts/vacuum-analyze.js`
- `documentation/MIGRATION/2025-01-19-cleanup-execution-log.txt`

---

## TASK-020C : Nettoyage Code Backend et Frontend

**Durée** : ~4-5h
**Commit** : `4cec672` (Code cleanup)

### Backend modifié (6 fichiers)

1. **server/api/systems/index.get.ts**
   - Mise à jour du fallback statique
   - Conservation de `mistengine` uniquement avec 5 univers
   - Ajout de city-of-mist dans le fallback

2. **server/api/systems/[id].get.ts**
   - Suppression des systèmes pbta, engrenages, myz, zombiology
   - Fonction `getStaticSystemData()` nettoyée

3. **server/api/systems/cards.get.ts**
   - Suppression des systèmes non-Mist du fallback
   - Mise à jour de `mainColumn` : mistengine uniquement
   - `secondColumn` : vide
   - Nettoyage des fonctions `getSystemIcon()` et `getSystemClasses()`

4. **server/api/templates.get.ts**
   - Nettoyage du fallback `getStaticTemplates()`
   - Suppression de tous les templates non-Mist
   - TODO ajouté pour les templates Mist

5. **server/api/oracles.get.ts**
   - Nettoyage du fallback `getStaticOracles()`
   - Les oracles Mist sont en base de données

6. **server/api/pdfs/recent.get.ts**
   - Fonction `formatSystemName()` nettoyée
   - Conservation de `mistengine` uniquement

### Frontend modifié (4 fichiers)

7. **app/composables/useSystemes.ts**
   - `getCouleursPourSysteme()` : mistengine uniquement
   - `getIconPourSysteme()` : mistengine → 'ra:ra-fog'
   - `getNomCompletSysteme()` : mistengine → 'Mist Engine'
   - `estSystemeSupporte()` : ['mistengine'] uniquement

8. **app/server/services/PdfService.ts**
   - `getCouleursPourSysteme()` : mistengine uniquement
   - `getSystemeNomComplet()` : mistengine uniquement

9. **app/components/PdfCard.vue**
   - Fonction `getSystemClasses()` nettoyée
   - 'Mist Engine' → classes violettes uniquement

10. **app/components/RecentPdfs.vue**
    - `examplePdfs` mis à jour
    - 3 personnages Mist Engine (Elena Voss, Marcus Kane, Akira Tanaka)

### Store & Tests modifiés (2 fichiers)

11. **shared/stores/systemes.ts**
    - Getter `systemesSupportes` : ['mistengine'] uniquement

12. **tests/composables/useSystemes.test.ts**
    - Tests mis à jour pour `mistengine`
    - Vérifications des couleurs : violet-500
    - Vérifications des icônes : 'ra:ra-fog'
    - Vérifications du nom : 'Mist Engine'

### Résultats

- **12 fichiers modifiés**
- **455 lignes supprimées**
- **76 lignes ajoutées**
- Application démarre sans erreur (`pnpm dev`)
- Toutes les références codées en dur supprimées

---

## TASK-020D : Nettoyage Documentation et Validation

**Durée** : ~5-6h
**Commit** : (en cours)

### Documentation mise à jour

1. **documentation/SYSTEMES-JDR/systemes-configuration.md**
   - Réécriture complète (445 lignes → 345 lignes)
   - Suppression des sections : Monsterhearts, Engrenages, Metro 2033, Zombiology
   - Section Mist Engine complète avec les 5 univers
   - Mise à jour pour architecture Nuxt 4 + Prisma
   - Exemples de code TypeScript modernes
   - Ajout de la section "Base de Données (Prisma)"

2. **documentation/SYSTEMES-JDR/systemes-interfaces.md**
   - Réécriture complète (546 lignes → 575 lignes)
   - Migration de l'ancienne architecture EJS vers Nuxt 4
   - Suppression de toutes les références aux systèmes non-Mist
   - Documentation des composables, composants et routes Nuxt 4
   - TypeScript interfaces mises à jour
   - Patterns de présentation modernes (Hero, CTA sections)

3. **documentation/DESIGN-SYSTEM/*** (fichiers supprimés)**
   - `charte-graphique-engrenages-pdf.md` (supprimé)
   - `charte-graphique-metro2033-pdf.md` (supprimé)
   - `charte-graphique-monsterhearts-pdf.md` (supprimé)
   - `charte-graphique-zombiology-pdf.md` (supprimé)

4. **documentation/MIGRATION/2025-01-19-cleanup-changelog.md** (CE FICHIER)
   - Changelog complet de la série 020A-D
   - Métriques avant/après
   - Documentation des décisions techniques

### Tests et validation

- Application testée avec `pnpm dev` : OK
- Aucune erreur de compilation
- Routes accessibles
- Base de données cohérente

---

## Métriques Avant/Après

### Base de données

| Métrique | Avant | Après | Différence |
|----------|-------|-------|------------|
| Systèmes | 7 | 1 | -6 (85% de réduction) |
| Univers | 10 | 5 | -5 (50% de réduction) |
| Oracles | 10 | 3 | -7 (70% de réduction) |
| Items d'oracles | 233 | ~70 | ~-163 (70% de réduction) |
| Personnages | 0 | 0 | 0 (base vide) |
| Documents | 0 | 0 | 0 (base vide) |

### Code source

| Métrique | Avant | Après | Différence |
|----------|-------|-------|------------|
| Fichiers modifiés | - | 12 | +12 |
| Lignes supprimées | - | 455 | -455 |
| Lignes ajoutées | - | 76 | +76 |
| Complexité réduite | - | - | -83% (systèmes) |

### Documentation

| Métrique | Avant | Après | Différence |
|----------|-------|-------|------------|
| Fichiers DESIGN-SYSTEM | 8 | 4 | -4 |
| Fichiers SYSTEMES-JDR | 2 | 2 | 0 (rénovés) |
| Taille systemes-config | 445 lignes | 345 lignes | -100 lignes |
| Taille systemes-interfaces | 546 lignes | 575 lignes | +29 lignes (Nuxt 4 doc) |

---

## Décisions Techniques

### 1. Décomposition en 4 tâches
**Décision** : Diviser TASK-020 en 4 sous-tâches (020A-D)
**Justification** :
- Réduire les risques (rollback plus facile)
- Meilleure traçabilité
- Tests intermédiaires possibles
- Commits atomiques

### 2. Utilisation de Prisma Client au lieu de SQL brut
**Décision** : Utiliser `deleteMany()` et `create()` de Prisma au lieu de `$executeRawUnsafe()`
**Justification** :
- Limitation de PostgreSQL : `cannot insert multiple commands into a prepared statement`
- Prisma garantit le typage
- Meilleure intégration avec l'ORM

### 3. Ajout de City of Mist pendant le cleanup
**Décision** : Ajouter City of Mist dans TASK-020B (cleanup DB) et non plus tard
**Justification** :
- Recommandation de l'agent Technical Architect
- City of Mist est un univers officiel Mist Engine
- Cohérence de la base de données
- Évite une migration supplémentaire

### 4. Réécriture complète de la documentation
**Décision** : Réécrire entièrement `systemes-configuration.md` et `systemes-interfaces.md`
**Justification** :
- L'ancienne documentation décrivait une architecture EJS obsolète
- Migration vers Nuxt 4 nécessitait une refonte
- Opportunité de moderniser les exemples de code
- Meilleure cohérence avec la codebase actuelle

### 5. Conservation des fichiers de backup
**Décision** : Garder les fichiers de backup dans `documentation/MIGRATION/`
**Justification** :
- Traçabilité de l'opération
- Possibilité de restauration si nécessaire
- Documentation historique
- Aucun impact sur l'application (dossier documentation/)

---

## Problèmes Rencontrés et Solutions

### 1. psql non disponible localement
**Problème** : Impossible d'utiliser `pg_dump` pour le backup
**Solution** : Création d'un script Node.js avec Prisma Client pour export JSON
**Fichier** : `scripts/backup-database.js`

### 2. Prisma $executeRawUnsafe limitation
**Problème** : `ERROR: cannot insert multiple commands into a prepared statement`
**Solution** : Décomposition du script SQL en appels Prisma individuels
**Fichier** : `scripts/execute-cleanup-v2.js`

### 3. Prisma migrate shadow database
**Problème** : Permission denied sur AlwaysData pour créer la shadow database
**Solution** : Exécution directe via scripts Prisma, pas de migration Prisma
**Impact** : Non-critique, cleanup exécuté avec succès

### 4. Documentation obsolète
**Problème** : Documentation décrivait l'ancienne architecture EJS
**Solution** : Réécriture complète pour Nuxt 4
**Impact** : Documentation maintenant à jour avec la codebase

---

## Impact sur les Utilisateurs

### Utilisateurs existants
**Impact** : AUCUN
- La base de données était vide (0 personnages, 0 documents)
- Aucune donnée utilisateur perdue
- Aucune fonctionnalité utilisée supprimée

### Nouveaux utilisateurs
**Impact** : POSITIF
- Application plus simple et cohérente
- Focus sur Mist Engine uniquement
- Expérience utilisateur améliorée
- Moins de confusion sur les systèmes disponibles

### Développeurs
**Impact** : TRÈS POSITIF
- Codebase 83% plus simple (1 système au lieu de 7)
- Moins de code à maintenir
- Documentation modernisée
- Tests simplifiés

---

## Prochaines Étapes

### Court terme (immédiat)
1. **Merge de la branche `cleanup/mist-only-systems` dans `main`**
   - Créer une Pull Request
   - Review complète
   - Tests E2E avant merge

2. **Déploiement en production**
   - Backup de la base de production
   - Migration du cleanup (si données en prod)
   - Vérification post-déploiement

### Moyen terme (1-2 semaines)
3. **Intégration complète de Legends in the Mist**
   - Implémentation des fonctionnalités Obojima et Zamanora
   - Création des formulaires de personnage
   - Oracles spécifiques aux univers
   - Templates PDF thématiques

4. **Amélioration de City of Mist et Otherscape**
   - Formulaires de création de personnage
   - Génération PDF complète
   - Documentation utilisateur

### Long terme (1-3 mois)
5. **Post-Mortem improvements**
   - Adaptation du système pour l'au-delà
   - Mécaniques spécifiques
   - Templates PDF dédiés

6. **Communauté et contribution**
   - Guide pour créer de nouveaux univers Mist Engine
   - Support des univers custom
   - API publique pour les développeurs

---

## Commits Git

### Série complète

```bash
# TASK-020A
d3fa8e7 - feat(audit): audit database and prepare cleanup (TASK-020A)

# TASK-020B
dac34ab - feat(database): cleanup non-Mist systems from database (TASK-020B)

# TASK-020C
4cec672 - feat(cleanup): remove non-Mist systems from code (TASK-020C)

# TASK-020D
(en cours) - docs(cleanup): update documentation and create changelog (TASK-020D)
```

### Branche
```bash
cleanup/mist-only-systems
```

---

## Références

### Documentation projet
- [TASK-020A](../tasks/TASK-2025-01-19-020A-cleanup-mist-audit.md)
- [TASK-020B](../tasks/TASK-2025-01-19-020B-cleanup-mist-database.md)
- [TASK-020C](../tasks/TASK-2025-01-19-020C-cleanup-mist-code.md)
- [TASK-020D](../tasks/TASK-2025-01-19-020D-cleanup-mist-documentation.md)

### Fichiers de migration
- [Inventory Systems](2025-01-19-inventory-systems.md)
- [Files to Modify](2025-01-19-files-to-modify.md)
- [Backup JSON](2025-01-19-backup-before-cleanup.json)
- [Execution Log](2025-01-19-cleanup-execution-log.txt)

### Documentation technique
- [Systèmes Configuration](../SYSTEMES-JDR/systemes-configuration.md)
- [Systèmes Interfaces](../SYSTEMES-JDR/systemes-interfaces.md)
- [Integration Legends in the Mist](../DEVELOPPEMENT/integration-legends-in-the-mist.md)

---

## Conclusion

Cette migration majeure a permis de **simplifier radicalement** l'application Brumisater en la concentrant sur l'écosystème **Mist Engine**.

**Résultats quantifiables** :
- 83% de réduction de complexité (7 systèmes → 1 système)
- 455 lignes de code supprimées
- Documentation modernisée pour Nuxt 4
- Base de données cohérente et optimisée

**Bénéfices** :
- Application plus maintenable
- Focus produit clair
- Préparation pour Legends in the Mist
- Expérience utilisateur améliorée

La série de tâches 020A-D a été exécutée avec succès, sans perte de données (base vide), et avec une traçabilité complète via Git et la documentation.

**Prochaine étape** : Intégration complète de Legends in the Mist avec ses univers Obojima et Zamanora.
