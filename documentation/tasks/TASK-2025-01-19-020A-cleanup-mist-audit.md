# Task - Nettoyage Mist : Audit et Préparation

## Métadonnées

- **ID**: TASK-2025-01-19-020A
- **Série**: Nettoyage Systèmes Mist (1/4)
- **Date de création**: 2025-01-19
- **Créé par**: Claude
- **Priorité**: Haute
- **Statut**: À faire
- **Temps estimé**: 2-3h
- **Temps réel**: -

## Description

### Objectif

Réaliser un audit complet de tous les systèmes de jeu présents dans Brumisater et préparer le terrain pour le nettoyage en créant les backups nécessaires et le script SQL de suppression. Cette tâche ne fait AUCUNE modification destructive, elle prépare uniquement le travail.

### Contexte

Avant de supprimer des systèmes de jeu (Monsterhearts, Engrenages, Metro 2033, Zombiology), il est crucial de :
1. Identifier précisément ce qui existe dans la base de données
2. Créer des backups complets pour pouvoir revenir en arrière
3. Préparer et tester le script SQL de nettoyage
4. Documenter l'état actuel

Cette approche "audit first" minimise les risques et permet de valider la stratégie avant toute modification.

### Périmètre

**Inclus dans cette tâche**:
- Audit complet de la base de données (systemes_jeu, univers_jeu)
- Création d'une branche git dédiée
- Backup PostgreSQL complet
- Création du script SQL de nettoyage
- Test du script sur une copie de la base
- Documentation de l'inventaire
- Liste exhaustive des fichiers de code à modifier

**Exclu de cette tâche** (traité dans les tâches suivantes):
- Exécution du script SQL sur la vraie base (TASK-020B)
- Modification du code backend/frontend (TASK-020C)
- Mise à jour de la documentation (TASK-020D)

## Spécifications Techniques

### Stack & Technologies

- **Base de données**: PostgreSQL + Prisma
- **Outils**: psql, pg_dump, grep, git
- **Environnement**: Windows 10/11 avec commandes cmd/PowerShell

### Architecture

```
Audit Workflow:
1. Connexion PostgreSQL → Requêtes SELECT
2. Analyse des résultats → Inventaire JSON/MD
3. Création branche git → cleanup/mist-only-systems
4. pg_dump → backup complet .sql
5. Script SQL nettoyage → test sur copie DB
6. Grep dans le code → liste fichiers concernés
7. Documentation → état actuel sauvegardé
```

### Fichiers Concernés

**Nouveaux fichiers**:
- [ ] `documentation/MIGRATION/2025-01-19-inventory-systems.md` - Inventaire détaillé
- [ ] `documentation/MIGRATION/2025-01-19-backup-before-cleanup.sql` - Backup DB
- [ ] `prisma/migrations/draft_cleanup_non_mist_systems.sql` - Script nettoyage (draft)
- [ ] `documentation/MIGRATION/2025-01-19-files-to-modify.md` - Liste fichiers à modifier

**Fichiers à lire** (pas de modification):
- [ ] `prisma/schema.prisma` - Analyse des relations
- [ ] `server/api/systems/index.get.ts` - Analyse du fallback
- [ ] Tous les fichiers mentionnant les systèmes (via grep)

## Plan d'Implémentation

### Étape 1: Création de la Branche Git

**Objectif**: Isoler tous les changements dans une branche dédiée

**Actions**:
- [ ] Vérifier que le repo est clean (`git status`)
- [ ] Créer la branche `git checkout -b cleanup/mist-only-systems`
- [ ] Pousser la branche `git push -u origin cleanup/mist-only-systems`

**Critères de validation**:
- Branche créée et poussée sur origin
- Aucun fichier non commité qui traîne

### Étape 2: Audit de la Base de Données

**Objectif**: Lister tous les systèmes et univers présents dans la DB

**Actions**:
- [ ] Se connecter à PostgreSQL
- [ ] Exécuter `SELECT * FROM systemes_jeu ORDER BY id;`
- [ ] Exécuter `SELECT * FROM univers_jeu ORDER BY systeme_jeu, id;`
- [ ] Compter les personnages par système : `SELECT systeme_jeu, COUNT(*) FROM personnages GROUP BY systeme_jeu;`
- [ ] Compter les PDFs par système : `SELECT systeme_jeu, COUNT(*) FROM pdfs GROUP BY systeme_jeu;`
- [ ] Compter les documents par système : `SELECT systeme_jeu, COUNT(*) FROM documents GROUP BY systeme_jeu;`
- [ ] Compter les oracles par univers : `SELECT univers_jeu, COUNT(*) FROM oracles GROUP BY univers_jeu;`
- [ ] Documenter les résultats dans `2025-01-19-inventory-systems.md`

**Fichiers**:
- `documentation/MIGRATION/2025-01-19-inventory-systems.md` (nouveau)

**Critères de validation**:
- Inventaire complet créé avec tous les comptages
- Identification claire des systèmes à supprimer vs conserver
- Tableau récapitulatif avec nombre de données liées

### Étape 3: Backup Complet de la Base

**Objectif**: Créer un backup complet pour pouvoir restaurer en cas de problème

**Actions**:
- [ ] Utiliser pg_dump pour créer un backup complet
- [ ] Commande : `pg_dump -h localhost -U [user] -d [database] -F p -f documentation/MIGRATION/2025-01-19-backup-before-cleanup.sql`
- [ ] Vérifier la taille du fichier (doit être > 0)
- [ ] Tester la restauration sur une DB temporaire (optionnel mais recommandé)
- [ ] Compresser le backup si nécessaire

**Fichiers**:
- `documentation/MIGRATION/2025-01-19-backup-before-cleanup.sql` (nouveau)

**Critères de validation**:
- Fichier backup créé avec succès
- Taille du fichier cohérente (vérifier qu'il n'est pas vide)
- Backup testé si possible

### Étape 4: Création du Script SQL de Nettoyage

**Objectif**: Écrire le script SQL qui supprimera les systèmes non-Mist

**Actions**:
- [ ] Créer `prisma/migrations/draft_cleanup_non_mist_systems.sql`
- [ ] Ajouter un header avec date, auteur, description
- [ ] Commencer par `BEGIN;` pour transaction
- [ ] Supprimer les univers non-Mist de `univers_jeu` :
  - Monsterhearts (PBTA)
  - Roue du Temps, Ecryme (Engrenages)
  - Metro 2033 (MYZ)
  - Obojima, Zamanora (Mist Engine - mais à vérifier s'ils sont vraiment à supprimer)
  - Zombiology
- [ ] Supprimer les systèmes de `systemes_jeu` :
  - pbta
  - engrenages
  - myz
  - zombiology
- [ ] Vérifier les contraintes FK (CASCADE si nécessaire)
- [ ] Terminer par `COMMIT;` (ou `ROLLBACK;` pour tester)
- [ ] Ajouter des commentaires expliquant chaque DELETE

**Fichiers**:
- `prisma/migrations/draft_cleanup_non_mist_systems.sql` (nouveau)

**Critères de validation**:
- Script SQL syntaxiquement correct
- Commentaires clairs pour chaque opération
- Utilisation de transactions (BEGIN/COMMIT)
- Conservation des systèmes Mist (City of Mist, Otherscape, Post-Mortem, Legends in the Mist)

### Étape 5: Test du Script sur Copie de la DB

**Objectif**: Valider que le script fonctionne sans erreur

**Actions**:
- [ ] Créer une base de données de test
- [ ] Restaurer le backup dans cette base de test
- [ ] Exécuter le script avec `ROLLBACK;` pour tester sans commit
- [ ] Vérifier les messages d'erreur
- [ ] Compter les lignes supprimées
- [ ] Exécuter avec `COMMIT;` si les tests sont OK
- [ ] Vérifier que seuls les systèmes Mist restent
- [ ] Vérifier l'intégrité des contraintes FK

**Critères de validation**:
- Script exécuté sans erreur
- Nombre de suppressions documenté
- Systèmes Mist toujours présents après exécution
- Aucune erreur de contrainte FK

### Étape 6: Inventaire des Fichiers de Code

**Objectif**: Lister tous les fichiers qui mentionnent les systèmes à supprimer

**Actions**:
- [ ] Rechercher "monsterhearts" dans le code (grep -r -i "monsterhearts" .)
- [ ] Rechercher "engrenages" dans le code
- [ ] Rechercher "metro" dans le code
- [ ] Rechercher "zombiology" dans le code
- [ ] Rechercher "pbta" dans le code
- [ ] Rechercher "myz" dans le code
- [ ] Créer une liste dans `2025-01-19-files-to-modify.md`
- [ ] Catégoriser par type (API, composants, pages, docs, tests)

**Fichiers**:
- `documentation/MIGRATION/2025-01-19-files-to-modify.md` (nouveau)

**Critères de validation**:
- Liste complète des fichiers à modifier
- Catégorisation claire (backend, frontend, docs, tests)
- Estimation du nombre de fichiers à traiter

### Étape 7: Documentation de l'État Actuel

**Objectif**: Documenter l'état du projet avant modifications

**Actions**:
- [ ] Créer un snapshot de la structure actuelle
- [ ] Documenter les systèmes actuellement supportés
- [ ] Documenter les métriques (nombre de personnages, PDFs, etc.)
- [ ] Créer un changelog préliminaire
- [ ] Ajouter les décisions techniques dans le fichier de tâche

**Fichiers**:
- `documentation/MIGRATION/2025-01-19-inventory-systems.md` (complété)

**Critères de validation**:
- État actuel complètement documenté
- Métriques sauvegardées
- Changelog préliminaire créé

## Tests

### Tests Unitaires

Non applicable pour cette tâche (pas de code produit)

### Tests d'Intégration

- [ ] Test de restauration du backup sur DB temporaire
- [ ] Test du script SQL avec ROLLBACK
- [ ] Test du script SQL avec COMMIT sur DB temporaire

### Tests Manuels

- [ ] Vérification manuelle de l'inventaire DB
- [ ] Vérification que la branche git est bien créée
- [ ] Vérification que le backup est complet
- [ ] Lecture du script SQL pour validation humaine

## Dépendances

### Bloqueurs

Aucun - cette tâche peut démarrer immédiatement

### Dépendances Externes

- Accès à la base de données PostgreSQL
- Accès git au repository
- Outil pg_dump installé

### Tâches Liées

- **TASK-020B** : Nettoyage Base de Données (bloquée par cette tâche)
- **TASK-020C** : Nettoyage Code (bloquée par TASK-020B)
- **TASK-020D** : Documentation et Validation (bloquée par TASK-020C)

## Critères d'Acceptation

- [ ] Branche git créée et poussée
- [ ] Backup DB complet créé et vérifié
- [ ] Script SQL de nettoyage écrit et testé
- [ ] Inventaire complet des systèmes DB créé
- [ ] Liste des fichiers de code à modifier créée
- [ ] Documentation de l'état actuel complète
- [ ] AUCUNE modification destructive n'a été faite
- [ ] Tous les livrables sont dans `documentation/MIGRATION/`

## Risques & Contraintes

### Risques Identifiés

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Backup incomplet ou corrompu | Élevé | Faible | Tester la restauration du backup |
| Script SQL contient des erreurs | Élevé | Moyen | Test approfondi sur DB temporaire avec ROLLBACK |
| Oubli de fichiers dans l'inventaire | Moyen | Moyen | Utiliser grep de manière exhaustive avec plusieurs termes de recherche |
| Accès DB non disponible | Élevé | Faible | Vérifier les credentials avant de commencer |

### Contraintes

- **Technique**: Accès requis à PostgreSQL avec droits pg_dump
- **Temporelle**: Cette tâche bloque toutes les suivantes, à prioriser
- **Ressources**: Espace disque suffisant pour le backup
- **Compatibilité**: Compatible Windows cmd/PowerShell

## Documentation

### Documentation à Créer

- [ ] `documentation/MIGRATION/2025-01-19-inventory-systems.md` - Inventaire détaillé
- [ ] `documentation/MIGRATION/2025-01-19-files-to-modify.md` - Liste fichiers
- [ ] `documentation/MIGRATION/2025-01-19-backup-before-cleanup.sql` - Backup SQL
- [ ] `prisma/migrations/draft_cleanup_non_mist_systems.sql` - Script nettoyage

### Documentation à Mettre à Jour

Aucune mise à jour dans cette tâche (lecture seule)

## Revue & Validation

### Checklist avant Review

- [ ] Branche git créée
- [ ] Backup créé et vérifié
- [ ] Script SQL testé
- [ ] Inventaire complet
- [ ] Aucune modification de code

### Reviewers

- [ ] Utilisateur (validation de l'inventaire)
- [ ] Validation que le backup fonctionne

### Critères de Validation

- [ ] Tous les livrables créés
- [ ] Backup testé (restauration réussie)
- [ ] Script SQL validé sur DB temporaire
- [ ] Documentation complète et claire

## Notes de Développement

### Décisions Techniques

**[2025-01-19]**: Approche "audit first" avant toute modification
- **Décision**: Créer une tâche dédiée uniquement à l'audit et la préparation
- **Justification**: Minimiser les risques, valider la stratégie avant exécution, permettre un rollback facile

**[2025-01-19]**: Test du script SQL sur DB temporaire obligatoire
- **Décision**: Ne pas se contenter de valider la syntaxe, exécuter réellement le script
- **Justification**: Détecter les problèmes de contraintes FK et autres erreurs runtime

### Problèmes Rencontrés

(À compléter pendant l'exécution de la tâche)

### Questions & Réponses

**Q**: Obojima et Zamanora sont-ils à supprimer ?
**R**: NON ! Ce sont des univers pour Legends in the Mist. Le script SQL ne doit PAS les supprimer. À vérifier lors de l'audit.

**Q**: Faut-il supprimer les personnages/PDFs des utilisateurs ?
**R**: Oui, via CASCADE DELETE, mais seulement après validation et backup complet.

**Q**: Que faire si le backup est trop gros ?
**R**: Le compresser avec gzip ou 7zip. Priorité absolue : avoir un backup fonctionnel.

## Résultat Final

### Ce qui a été accompli

(À compléter après l'exécution de la tâche)

### Déviations par rapport au plan initial

(À compléter après l'exécution de la tâche)

### Prochaines Étapes

- Exécuter TASK-020B : Nettoyage Base de Données

## Références

- [Prisma Schema](c:\Users\fxgui\Documents\Projets\generateur-pdf-jdr\prisma\schema.prisma)
- [Plan d'intégration Legends in the Mist](c:\Users\fxgui\Documents\Projets\generateur-pdf-jdr\documentation\DEVELOPPEMENT\integration-legends-in-the-mist.md)
- [PostgreSQL pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)
