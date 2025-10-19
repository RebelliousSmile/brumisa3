# Inventaire des Systèmes de Jeu - 19 Janvier 2025

## Contexte

Cet inventaire a été réalisé dans le cadre de **TASK-020A** (Audit et Préparation) avant le nettoyage des systèmes non-Mist de Brumisater.

**Date**: 2025-01-19
**Branche git**: `cleanup/mist-only-systems`
**Base de données**: jdrspace_pdf (PostgreSQL)

## Résumé Exécutif

- **Systèmes totaux**: 7
- **Univers totaux**: 10
- **Personnages**: 0 (base vide)
- **PDFs**: 0 (base vide)
- **Documents**: 0 (base vide)
- **Oracles**: 7 (Monsterhearts: 4, Roue du Temps: 3)

## 1. Systèmes de Jeu Présents

| ID | Nom Complet | Actif | Décision |
|----|-------------|-------|----------|
| engrenages | Engrenages et Sortilèges | ✅ | ❌ **À SUPPRIMER** |
| metro2033 | Métro 2033 | ✅ | ❌ **À SUPPRIMER** |
| mistengine | Mist Engine | ✅ | ✅ **À CONSERVER** |
| monsterhearts | Monsterhearts 2 | ✅ | ❌ **À SUPPRIMER** |
| myz | MYZ (Mutant Year Zero) | ✅ | ❌ **À SUPPRIMER** |
| pbta | PBTA (Powered by the Apocalypse) | ✅ | ❌ **À SUPPRIMER** |
| zombiology | Zombiology | ✅ | ❌ **À SUPPRIMER** |

### Systèmes à Supprimer (6)
1. **pbta** - PBTA (Powered by the Apocalypse)
2. **monsterhearts** - Monsterhearts 2 (doublon avec pbta/monsterhearts univers)
3. **engrenages** - Engrenages et Sortilèges
4. **myz** - MYZ (Mutant Year Zero)
5. **metro2033** - Métro 2033 (doublon avec myz/metro2033 univers)
6. **zombiology** - Zombiology

### Systèmes à Conserver (1)
1. **mistengine** - Mist Engine (avec tous ses univers)

## 2. Univers de Jeu Présents

| ID | Système Parent | Nom Complet | Statut | Décision |
|----|----------------|-------------|--------|----------|
| ecryme | engrenages | Ecryme 1880 | ACTIF | ❌ **À SUPPRIMER** |
| roue_du_temps | engrenages | La Roue du Temps | ACTIF | ❌ **À SUPPRIMER** |
| obojima | mistengine | Obojima | ACTIF | ✅ **À CONSERVER** (Legends in the Mist) |
| otherscape | mistengine | Tokyo:Otherscape | ACTIF | ✅ **À CONSERVER** |
| post_mortem | mistengine | Post-Mortem | ACTIF | ✅ **À CONSERVER** |
| zamanora | mistengine | Zamanora | ACTIF | ✅ **À CONSERVER** (Legends in the Mist) |
| metro2033 | myz | Metro 2033 | ACTIF | ❌ **À SUPPRIMER** |
| monsterhearts | pbta | Monsterhearts 2 | ACTIF | ❌ **À SUPPRIMER** |
| urban_shadows | pbta | Urban Shadows | ACTIF | ❌ **À SUPPRIMER** |
| zombiology | zombiology | Zombiology | ACTIF | ❌ **À SUPPRIMER** |

### Univers à Supprimer (6)
1. **monsterhearts** (pbta)
2. **urban_shadows** (pbta)
3. **ecryme** (engrenages)
4. **roue_du_temps** (engrenages)
5. **metro2033** (myz)
6. **zombiology** (zombiology)

### Univers à Conserver (4)
1. **otherscape** - Tokyo:Otherscape (Mist Engine)
2. **post_mortem** - Post-Mortem (Mist Engine / City of Mist hack)
3. **obojima** - Obojima (Mist Engine / Legends in the Mist)
4. **zamanora** - Zamanora (Mist Engine / Legends in the Mist)

**Note**: City of Mist n'est pas encore dans la base comme univers séparé.

## 3. Données Liées

### Personnages
**Aucun personnage** dans la base de données.

### PDFs
**Aucun PDF** dans la base de données.

### Documents
**Aucun document** dans la base de données.

### Oracles

| Univers | Nombre d'Oracles | Décision |
|---------|------------------|----------|
| monsterhearts | 4 | ❌ **À SUPPRIMER** |
| roue_du_temps | 3 | ❌ **À SUPPRIMER** |

**Total oracles à supprimer**: 7

## 4. Impact de la Suppression

### Systèmes

| Opération | Nombre |
|-----------|--------|
| Systèmes à supprimer | 6 |
| Systèmes à conserver | 1 |
| **Pourcentage conservé** | **14.3%** |

### Univers

| Opération | Nombre |
|-----------|--------|
| Univers à supprimer | 6 |
| Univers à conserver | 4 |
| **Pourcentage conservé** | **40%** |

### Données Utilisateur

| Type | À Supprimer | Remarque |
|------|-------------|----------|
| Personnages | 0 | Base vide |
| PDFs | 0 | Base vide |
| Documents | 0 | Base vide |
| Oracles | 7 | Monsterhearts (4) + Roue du Temps (3) |

**Impact utilisateur**: MINIMAL (pas de données utilisateur, seulement des oracles système)

## 5. Script SQL de Suppression

Le script suivant sera créé dans `prisma/migrations/draft_cleanup_non_mist_systems.sql` :

```sql
BEGIN;

-- Suppression des univers non-Mist
DELETE FROM univers_jeu WHERE id IN (
  'monsterhearts',     -- PBTA
  'urban_shadows',     -- PBTA
  'ecryme',            -- Engrenages
  'roue_du_temps',     -- Engrenages
  'metro2033',         -- MYZ
  'zombiology'         -- Zombiology
);

-- Suppression des systèmes non-Mist
DELETE FROM systemes_jeu WHERE id IN (
  'pbta',
  'monsterhearts',
  'engrenages',
  'myz',
  'metro2033',
  'zombiology'
);

-- Note: Les oracles liés aux univers supprimés seront supprimés automatiquement via CASCADE

COMMIT;
```

## 6. Validation

### ✅ Systèmes Mist Conservés
- **mistengine** avec 4 univers :
  - otherscape (Tokyo:Otherscape)
  - post_mortem (Post-Mortem - hack City of Mist)
  - obojima (Legends in the Mist)
  - zamanora (Legends in the Mist)

### ❌ Systèmes Non-Mist Supprimés
- pbta (+ univers: monsterhearts, urban_shadows)
- monsterhearts (système doublon)
- engrenages (+ univers: ecryme, roue_du_temps)
- myz (+ univers: metro2033)
- metro2033 (système doublon)
- zombiology (+ univers: zombiology)

## 7. Observations Importantes

### Doublons Détectés

1. **monsterhearts** existe à la fois comme :
   - Système (`id: monsterhearts`)
   - Univers du système pbta (`id: monsterhearts`, `systeme_jeu: pbta`)

2. **metro2033** existe à la fois comme :
   - Système (`id: metro2033`)
   - Univers du système myz (`id: metro2033`, `systeme_jeu: myz`)

3. **zombiology** existe à la fois comme :
   - Système (`id: zombiology`)
   - Univers du même système (`id: zombiology`, `systeme_jeu: zombiology`)

### City of Mist Manquant

**City of Mist** n'apparaît pas comme univers dans la base. Il faudra probablement l'ajouter lors de l'intégration de Legends in the Mist.

## 8. Recommandations

1. ✅ **Procéder au nettoyage** : Aucune donnée utilisateur à risque
2. ✅ **Backup obligatoire** : Même si base vide, pour sécurité
3. ⚠️ **Ajouter City of Mist** : À faire dans une tâche ultérieure
4. ✅ **Supprimer les doublons** : Les doublons système/univers seront résolus

## 9. Prochaines Étapes

1. ✅ Inventaire terminé
2. ⏭️ Créer backup PostgreSQL (TASK-020A Étape 3)
3. ⏭️ Créer script SQL de nettoyage (TASK-020A Étape 4)
4. ⏭️ Tester le script sur copie DB (TASK-020A Étape 5)
5. ⏭️ Inventorier fichiers code à modifier (TASK-020A Étape 6)
6. ⏭️ Documenter l'état actuel (TASK-020A Étape 7)

---

**Document généré par**: Claude (TASK-020A)
**Date**: 2025-01-19
**Statut**: ✅ Audit complet
