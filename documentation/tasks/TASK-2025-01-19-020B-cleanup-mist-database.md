# Task - Nettoyage Mist : Base de Données

## Métadonnées

- **ID**: TASK-2025-01-19-020B
- **Série**: Nettoyage Systèmes Mist (2/4)
- **Date de création**: 2025-01-19
- **Créé par**: Claude
- **Priorité**: Haute
- **Statut**: À faire
- **Temps estimé**: 3-4h
- **Temps réel**: -

## Description

### Objectif

Exécuter le script SQL de nettoyage pour supprimer définitivement les systèmes non-Mist (Monsterhearts, Engrenages, Metro 2033, Zombiology) de la base de données PostgreSQL. Cette tâche est destructive et irréversible, d'où l'importance d'avoir réalisé TASK-020A au préalable.

### Contexte

Après avoir préparé le terrain dans TASK-020A (audit, backup, script SQL testé), nous pouvons maintenant exécuter le nettoyage de la base de données en toute sécurité. Le script SQL supprimera :
- Les systèmes non-Mist de `systemes_jeu`
- Les univers associés de `univers_jeu`
- Les données liées (personnages, PDFs, documents) via CASCADE

Les systèmes Mist (City of Mist, Otherscape, Post-Mortem, Legends in the Mist avec ses univers) seront préservés.

### Périmètre

**Inclus dans cette tâche**:
- Vérification finale du backup
- Exécution du script SQL sur la base de production
- Vérification de l'intégrité post-suppression
- Validation des contraintes FK
- Création de la migration Prisma
- Tests des requêtes DB après nettoyage
- Documentation des suppressions effectuées

**Exclu de cette tâche** (traité dans les tâches suivantes):
- Modification du code backend/frontend (TASK-020C)
- Mise à jour de la documentation (TASK-020D)

## Spécifications Techniques

### Stack & Technologies

- **Base de données**: PostgreSQL 14+
- **ORM**: Prisma Client
- **Outils**: psql, Prisma CLI

### Architecture

```
Workflow Nettoyage DB:
1. Vérification backup existe
2. Test connexion PostgreSQL
3. Début transaction (BEGIN)
4. Suppression univers_jeu (CASCADE)
5. Suppression systemes_jeu (CASCADE)
6. Vérification intégrité
7. COMMIT ou ROLLBACK
8. Validation post-suppression
9. Prisma migration
```

### Fichiers Concernés

**Nouveaux fichiers**:
- [ ] `prisma/migrations/YYYYMMDDHHMMSS_cleanup_non_mist_systems/migration.sql` - Migration Prisma
- [ ] `documentation/MIGRATION/2025-01-19-cleanup-execution-log.md` - Journal d'exécution

**Fichiers à lire**:
- [ ] `prisma/migrations/draft_cleanup_non_mist_systems.sql` - Script préparé en 020A
- [ ] `documentation/MIGRATION/2025-01-19-backup-before-cleanup.sql` - Backup de sécurité

## Plan d'Implémentation

### Étape 1: Vérifications Pré-Exécution

**Objectif**: S'assurer que toutes les conditions sont réunies pour un nettoyage sécurisé

**Actions**:
- [ ] Vérifier que TASK-020A est terminée
- [ ] Vérifier l'existence du backup `2025-01-19-backup-before-cleanup.sql`
- [ ] Vérifier la taille du backup (> 0 bytes)
- [ ] Vérifier la connexion à PostgreSQL
- [ ] Vérifier les credentials DB dans `.env`
- [ ] Lister les systèmes actuellement présents (validation)

**Critères de validation**:
- Backup existe et n'est pas vide
- Connexion DB fonctionnelle
- Liste des systèmes cohérente avec l'audit de 020A

### Étape 2: Exécution du Script SQL (Mode Prudent)

**Objectif**: Exécuter le script avec possibilité de ROLLBACK

**Actions**:
- [ ] Se connecter à PostgreSQL en mode transactionnel
- [ ] Exécuter `BEGIN;`
- [ ] Exécuter le script de suppression des univers non-Mist
- [ ] Vérifier le nombre de lignes supprimées
- [ ] Exécuter le script de suppression des systèmes non-Mist
- [ ] Vérifier le nombre de lignes supprimées
- [ ] Lister les systèmes restants : `SELECT * FROM systemes_jeu;`
- [ ] Lister les univers restants : `SELECT * FROM univers_jeu;`
- [ ] Si tout est correct : `COMMIT;`
- [ ] Si problème : `ROLLBACK;` et investigation

**Commandes SQL** :
```sql
BEGIN;

-- Suppression des univers non-Mist
DELETE FROM univers_jeu WHERE id IN (
  'monsterhearts',        -- PBTA
  'roue_du_temps',        -- Engrenages
  'ecryme',               -- Engrenages
  'metro2033',            -- MYZ
  'zombiology'            -- Zombiology
);

-- Suppression des systèmes non-Mist
DELETE FROM systemes_jeu WHERE id IN (
  'pbta',
  'engrenages',
  'myz',
  'zombiology'
);

-- Vérification
SELECT id, nom_complet FROM systemes_jeu ORDER BY id;
SELECT id, nom_complet, systeme_jeu FROM univers_jeu ORDER BY systeme_jeu, id;

-- Si OK:
COMMIT;
-- Sinon:
-- ROLLBACK;
```

**Fichiers**:
- `prisma/migrations/draft_cleanup_non_mist_systems.sql`

**Critères de validation**:
- Systèmes supprimés : pbta, engrenages, myz, zombiology
- Systèmes conservés : mistengine (avec City of Mist, Otherscape, Post-Mortem)
- Aucune erreur de contrainte FK
- COMMIT réussi

### Étape 3: Vérification de l'Intégrité Post-Suppression

**Objectif**: S'assurer que la base de données est dans un état cohérent

**Actions**:
- [ ] Compter les systèmes restants : `SELECT COUNT(*) FROM systemes_jeu;`
- [ ] Compter les univers restants : `SELECT COUNT(*) FROM univers_jeu;`
- [ ] Vérifier les personnages orphelins : `SELECT COUNT(*) FROM personnages WHERE systeme_jeu NOT IN (SELECT id FROM systemes_jeu);`
- [ ] Vérifier les PDFs orphelins : `SELECT COUNT(*) FROM pdfs WHERE systeme_jeu NOT IN (SELECT id FROM systemes_jeu);`
- [ ] Vérifier les oracles orphelins : `SELECT COUNT(*) FROM oracles WHERE univers_jeu NOT IN (SELECT id FROM univers_jeu);`
- [ ] Exécuter `VACUUM ANALYZE;` pour optimiser

**Critères de validation**:
- Aucun enregistrement orphelin
- Nombre de systèmes et univers cohérent
- Base de données optimisée

### Étape 4: Création de la Migration Prisma

**Objectif**: Créer une migration Prisma officielle pour ce nettoyage

**Actions**:
- [ ] Créer une migration vide : `npx prisma migrate dev --create-only --name cleanup_non_mist_systems`
- [ ] Copier le contenu du script SQL dans le fichier de migration généré
- [ ] Ajouter des commentaires clairs
- [ ] Marquer la migration comme appliquée : `npx prisma migrate resolve --applied cleanup_non_mist_systems`
- [ ] Vérifier le statut : `npx prisma migrate status`

**Fichiers**:
- `prisma/migrations/YYYYMMDDHHMMSS_cleanup_non_mist_systems/migration.sql` (nouveau)

**Critères de validation**:
- Migration créée et marquée comme appliquée
- Statut Prisma cohérent avec l'état de la DB

### Étape 5: Tests de Requêtes DB

**Objectif**: Valider que les opérations courantes fonctionnent après nettoyage

**Actions**:
- [ ] Tester la récupération des systèmes : `SELECT * FROM systemes_jeu;`
- [ ] Tester la récupération des univers avec JOIN :
  ```sql
  SELECT s.id, s.nom_complet, u.id as univers_id, u.nom_complet as univers_nom
  FROM systemes_jeu s
  LEFT JOIN univers_jeu u ON s.id = u.systeme_jeu
  ORDER BY s.id, u.id;
  ```
- [ ] Tester la récupération des personnages par système
- [ ] Tester la récupération des PDFs par système
- [ ] Tester la récupération des oracles par univers

**Critères de validation**:
- Toutes les requêtes s'exécutent sans erreur
- Les résultats ne contiennent que des systèmes Mist
- Les JOINs fonctionnent correctement

### Étape 6: Documentation du Nettoyage

**Objectif**: Documenter précisément ce qui a été supprimé

**Actions**:
- [ ] Créer `documentation/MIGRATION/2025-01-19-cleanup-execution-log.md`
- [ ] Documenter les systèmes supprimés
- [ ] Documenter les univers supprimés
- [ ] Documenter le nombre de personnages supprimés par système
- [ ] Documenter le nombre de PDFs supprimés par système
- [ ] Documenter le nombre de documents supprimés par système
- [ ] Documenter la date et heure d'exécution
- [ ] Ajouter la signature de celui qui a validé l'opération

**Fichiers**:
- `documentation/MIGRATION/2025-01-19-cleanup-execution-log.md` (nouveau)

**Critères de validation**:
- Documentation complète et précise
- Tous les comptages enregistrés
- Timestamp de l'opération

## Tests

### Tests Unitaires

Non applicable pour cette tâche (manipulation directe de la DB)

### Tests d'Intégration

- [ ] Test de récupération des systèmes via Prisma Client
  ```typescript
  const systemes = await prisma.systemeJeu.findMany({
    where: { actif: true },
    include: { univers_jeu: true }
  });
  // Doit contenir uniquement mistengine et ses univers
  ```

- [ ] Test de création d'un personnage pour City of Mist
- [ ] Test de génération de PDF pour Otherscape

### Tests Manuels

- [ ] Connexion à l'application et vérification que seuls les systèmes Mist apparaissent
- [ ] Création d'un personnage pour vérifier que les systèmes Mist fonctionnent
- [ ] Vérification qu'aucune page ne fait référence aux systèmes supprimés

## Dépendances

### Bloqueurs

- [ ] **TASK-020A terminée** : Backup, audit et script SQL préparés

### Dépendances Externes

- Accès PostgreSQL avec droits CREATE/DROP
- Variables d'environnement `.env` configurées
- Prisma CLI installé

### Tâches Liées

- **TASK-020A** : Audit et Préparation (prérequis)
- **TASK-020C** : Nettoyage Code (bloquée par cette tâche)
- **TASK-020D** : Documentation et Validation (bloquée par TASK-020C)

## Critères d'Acceptation

- [ ] Script SQL exécuté avec succès (COMMIT)
- [ ] Aucune erreur de contrainte FK
- [ ] Systèmes non-Mist supprimés : pbta, engrenages, myz, zombiology
- [ ] Systèmes Mist conservés : mistengine avec ses univers
- [ ] Univers Mist conservés : City of Mist, Otherscape, Post-Mortem, Obojima, Zamanora
- [ ] Aucun enregistrement orphelin dans la DB
- [ ] Migration Prisma créée et marquée comme appliquée
- [ ] Tests de requêtes DB passent
- [ ] Documentation d'exécution créée
- [ ] Base de données optimisée (VACUUM)

## Risques & Contraintes

### Risques Identifiés

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Erreur de contrainte FK non détectée | Élevé | Faible | Script testé en 020A, mode transactionnel avec ROLLBACK possible |
| Suppression de données critiques | Critique | Très faible | Backup complet existant, validation avant COMMIT |
| Corruption de la base de données | Critique | Très faible | Transaction atomique, ROLLBACK en cas d'erreur |
| Oubli de supprimer un système | Moyen | Faible | Liste explicite des systèmes dans le script SQL |

### Contraintes

- **Technique**: Opération irréversible après COMMIT
- **Temporelle**: Bloque toutes les tâches suivantes
- **Ressources**: Nécessite accès DB avec droits admin
- **Compatibilité**: Compatible Prisma migrations

## Documentation

### Documentation à Créer

- [ ] `documentation/MIGRATION/2025-01-19-cleanup-execution-log.md` - Journal d'exécution
- [ ] `prisma/migrations/YYYYMMDDHHMMSS_cleanup_non_mist_systems/migration.sql` - Migration

### Documentation à Mettre à Jour

Aucune mise à jour dans cette tâche

## Revue & Validation

### Checklist avant Review

- [ ] Backup vérifié et accessible
- [ ] Script SQL exécuté avec COMMIT
- [ ] Aucune erreur lors de l'exécution
- [ ] Vérifications d'intégrité passées
- [ ] Migration Prisma créée

### Reviewers

- [ ] Utilisateur (validation du résultat DB)
- [ ] Vérification que seuls les systèmes Mist restent

### Critères de Validation

- [ ] Nettoyage DB réussi
- [ ] Intégrité référentielle maintenue
- [ ] Tests de requêtes OK
- [ ] Documentation complète

## Notes de Développement

### Décisions Techniques

**[2025-01-19]**: Utilisation de transactions SQL
- **Décision**: Exécuter le script dans une transaction avec possibilité de ROLLBACK
- **Justification**: Sécurité maximale, possibilité d'annuler si erreur détectée

**[2025-01-19]**: Migration Prisma post-facto
- **Décision**: Créer une migration Prisma après exécution manuelle du script
- **Justification**: Garder l'historique des migrations cohérent, facilite les déploiements futurs

**[2025-01-19]**: Conservation d'Obojima et Zamanora
- **Décision**: NE PAS supprimer ces univers car ils font partie de Legends in the Mist
- **Justification**: Clarification de l'utilisateur - ce sont des univers pour LITM, pas des systèmes indépendants

### Problèmes Rencontrés

(À compléter pendant l'exécution de la tâche)

### Questions & Réponses

**Q**: Que faire si le COMMIT échoue ?
**R**: Exécuter ROLLBACK immédiatement, analyser les erreurs, corriger le script, et réessayer.

**Q**: Peut-on restaurer après COMMIT ?
**R**: Oui, via le backup créé en TASK-020A, mais c'est une opération lourde à éviter.

**Q**: Comment valider que le script est correct avant COMMIT ?
**R**: Examiner les résultats des SELECT après les DELETE mais avant le COMMIT. Vérifier les comptages.

## Résultat Final

### Ce qui a été accompli

(À compléter après l'exécution de la tâche)

### Déviations par rapport au plan initial

(À compléter après l'exécution de la tâche)

### Prochaines Étapes

- Exécuter TASK-020C : Nettoyage Code Backend et Frontend

## Références

- [Prisma Schema](c:\Users\fxgui\Documents\Projets\generateur-pdf-jdr\prisma\schema.prisma)
- [TASK-020A](c:\Users\fxgui\Documents\Projets\generateur-pdf-jdr\documentation\tasks\TASK-2025-01-19-020A-cleanup-mist-audit.md)
- [PostgreSQL Transactions Documentation](https://www.postgresql.org/docs/current/tutorial-transactions.html)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
