# Task - Nettoyage des Systèmes Legacy

## Métadonnées

- **ID**: TASK-2025-01-19-021
- **Date de création**: 2025-01-20
- **Priorité**: P1 (Maintenance)
- **Statut**: À faire
- **Temps estimé**: 8h total (2h audit + 2h DB + 2h code + 2h docs)
- **Version cible**: Parallèle au MVP

## Description

### Objectif

Nettoyer les anciens systèmes de jeu qui ne font pas partie de l'architecture Mist Engine et migrer vers la structure System → Hack → Universe.

### Contexte

L'application contient actuellement des systèmes legacy qui ne correspondent pas à notre nouvelle architecture :
- **À supprimer** : pbta (Monsterhearts), engrenages, myz (Metro 2033), zombiology
- **À migrer** : Transformer les "systèmes Mist" en structure hiérarchique appropriée

### Périmètre

**Inclus dans cette tâche**:
- Audit complet de l'existant
- Backup de sécurité
- Suppression des systèmes non-Mist Engine
- Migration vers la structure System/Hack/Universe
- Nettoyage du code
- Mise à jour documentation

**Exclu de cette tâche**:
- Implémentation des nouvelles fonctionnalités MVP
- Migration des données utilisateur existantes

## Plan d'Implémentation

### Phase A : Audit et Backup (2h)

#### Actions
1. **Créer branche Git**
   ```bash
   git checkout -b cleanup/legacy-systems
   ```

2. **Audit PostgreSQL**
   ```sql
   -- Lister les systèmes actuels
   SELECT * FROM systemes_jeu ORDER BY id;
   SELECT * FROM univers_jeu ORDER BY systeme_jeu, id;

   -- Compter les données liées
   SELECT systeme_jeu, COUNT(*) as count
   FROM personnages
   GROUP BY systeme_jeu;

   SELECT systeme_jeu, COUNT(*) as count
   FROM pdfs
   GROUP BY systeme_jeu;
   ```

3. **Créer backup**
   ```bash
   pg_dump -h localhost -U [user] -d [database] > backup-before-cleanup.sql
   ```

4. **Documenter l'inventaire**
   ```markdown
   # Inventaire Systèmes Legacy

   ## À Supprimer
   - pbta (Monsterhearts) : X personnages, Y PDFs
   - engrenages : X personnages, Y PDFs
   - myz (Metro 2033) : X personnages, Y PDFs
   - zombiology : X personnages, Y PDFs

   ## À Migrer vers Nouvelle Architecture
   - City of Mist → Hack du Mist Engine
   - Otherscape → Hack du Mist Engine
   - Legends in the Mist → Hack du Mist Engine
   - Post-Mortem → Hack du Mist Engine (ou à supprimer?)
   ```

### Phase B : Nettoyage Base de Données (2h)

#### Script de Migration

```sql
-- TASK-021B-cleanup-database.sql
BEGIN;

-- 1. Supprimer les univers des systèmes legacy
DELETE FROM univers_jeu
WHERE systeme_jeu IN ('pbta', 'engrenages', 'myz', 'zombiology');

-- 2. Supprimer les systèmes legacy
DELETE FROM systemes_jeu
WHERE id IN ('pbta', 'engrenages', 'myz', 'zombiology');

-- 3. Créer la nouvelle structure (si pas déjà fait)
-- Tables System, Hack, Universe depuis TASK-004

-- 4. Migrer les systèmes Mist vers la nouvelle structure
INSERT INTO systems (id, slug, name) VALUES
  (gen_random_uuid(), 'mist-engine', 'Mist Engine');

INSERT INTO hacks (id, slug, name, system_id) VALUES
  (gen_random_uuid(), 'litm', 'Legends in the Mist', (SELECT id FROM systems WHERE slug = 'mist-engine')),
  (gen_random_uuid(), 'city-of-mist', 'City of Mist', (SELECT id FROM systems WHERE slug = 'mist-engine')),
  (gen_random_uuid(), 'otherscape', 'Otherscape', (SELECT id FROM systems WHERE slug = 'mist-engine'));

INSERT INTO universes (id, slug, name, hack_id) VALUES
  (gen_random_uuid(), 'zamanora', 'Zamanora', (SELECT id FROM hacks WHERE slug = 'litm')),
  (gen_random_uuid(), 'hor', 'Hearts of Ravensdale', (SELECT id FROM hacks WHERE slug = 'litm')),
  (gen_random_uuid(), 'the-city', 'The City', (SELECT id FROM hacks WHERE slug = 'city-of-mist')),
  (gen_random_uuid(), 'tokyo', 'Tokyo', (SELECT id FROM hacks WHERE slug = 'otherscape')),
  (gen_random_uuid(), 'cairo', 'Cairo', (SELECT id FROM hacks WHERE slug = 'otherscape'));

COMMIT;
```

### Phase C : Nettoyage Code (2h)

#### Fichiers à Modifier

1. **API Routes**
   ```typescript
   // server/api/systems/index.get.ts
   // Supprimer les références aux systèmes legacy

   export default defineEventHandler(async () => {
     // Utiliser la nouvelle structure
     return prisma.system.findMany({
       include: {
         hacks: {
           include: { universes: true }
         }
       }
     });
   });
   ```

2. **Composants Frontend**
   - Supprimer les références dans les selects de système
   - Adapter pour utiliser la hiérarchie System/Hack/Universe

3. **Types TypeScript**
   ```typescript
   // Supprimer
   type LegacySystem = 'pbta' | 'engrenages' | 'myz' | 'zombiology';

   // Remplacer par la structure de TASK-004
   ```

### Phase D : Documentation (2h)

#### Fichiers à Mettre à Jour

1. **README.md**
   - Retirer mentions des systèmes legacy
   - Expliquer la nouvelle architecture

2. **Documentation Architecture**
   - Mettre à jour les références

3. **Changelog**
   ```markdown
   ## [Breaking Changes]
   - Suppression des systèmes legacy (pbta, engrenages, myz, zombiology)
   - Migration vers architecture System → Hack → Universe
   ```

## Tests

### Tests de Non-Régression
- [ ] Vérifier que les playspaces Mist Engine fonctionnent
- [ ] Vérifier que les personnages existants sont préservés
- [ ] Tester la création de nouveaux personnages

### Tests de Migration
- [ ] Vérifier que les systèmes legacy sont supprimés
- [ ] Vérifier que la nouvelle structure est en place
- [ ] Tester les API avec la nouvelle hiérarchie

## Critères d'Acceptation

- [ ] Backup créé et vérifié
- [ ] Systèmes legacy supprimés de la DB
- [ ] Nouvelle structure System/Hack/Universe en place
- [ ] Code nettoyé de toute référence legacy
- [ ] Documentation mise à jour
- [ ] Tests passent
- [ ] Pas de régression sur les fonctionnalités MVP

## Dépendances

- **Peut être fait en parallèle** du développement MVP
- **Recommandé après** TASK-004 (Modèle Prisma) pour avoir la nouvelle structure

## Notes

Cette tâche unifie les 4 sous-tâches 020A/B/C/D en une seule tâche de maintenance. Elle peut être effectuée en parallèle du développement MVP car elle ne touche que les systèmes legacy, pas les fonctionnalités Mist Engine.

## Risques

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Perte de données utilisateur | Élevé | Backup complet avant toute opération |
| Régression sur systèmes Mist | Moyen | Tests approfondis après migration |
| Conflits avec développement MVP | Faible | Travail sur branche séparée |

## Références

- [Architecture Multi-Hacks](../ARCHITECTURE/09-architecture-multi-systemes-mist-engine.md)
- [Modèle Prisma TASK-004](TASK-2025-01-19-004-prisma-litm.md)