# Gestion des migrations Prisma

## Contexte

Le projet utilise Prisma ORM avec une base de données PostgreSQL hébergée sur **AlwaysData**.

## Problématique : Shadow Database

Prisma Migrate utilise par défaut une "shadow database" temporaire pour valider les migrations avant de les appliquer. Cette approche nécessite des droits de création de bases de données, qui ne sont **pas disponibles** sur les hébergements mutualisés comme AlwaysData.

**Erreur rencontrée :**
```
Error: P3014
Prisma Migrate could not create the shadow database.
Original error: ERROR: permission denied to create database
```

## Solution : Utiliser `prisma db push`

Au lieu de `prisma migrate dev`, nous utilisons `prisma db push` qui :
- ✅ Synchronise directement le schéma avec la base de données
- ✅ Ne nécessite pas de shadow database
- ✅ Génère automatiquement Prisma Client après synchronisation
- ⚠️ Ne crée pas de fichiers de migration versionnés

### Commandes

```bash
# Synchroniser le schéma avec la base de données
pnpm prisma db push

# Si vous voulez seulement générer le client sans pousser les changements
pnpm prisma generate
```

## Workflow de développement

### 1. Modification du schéma

Modifiez `prisma/schema.prisma` selon vos besoins.

### 2. Synchronisation avec la base

```bash
pnpm prisma db push
```

Cette commande :
1. Valide le schéma Prisma
2. Applique les changements à la base de données
3. Génère automatiquement le client Prisma

### 3. Test des modèles

Après la synchronisation, testez que les modèles sont accessibles :

```bash
pnpm tsx scripts/test-litm-models.ts
```

## Configuration

### Variables d'environnement

Ajoutées dans `.env` :
```env
# Prisma - Configuration pour AlwaysData (hébergeur mutualisé)
DATABASE_URL=postgresql://user:password@host:5432/db?schema=public
PRISMA_DISABLE_WARNINGS=true
```

### Schéma Prisma

Le fichier `prisma/schema.prisma` définit tous les modèles de données.

## Limitations

### Pas de versioning des migrations

Contrairement à `prisma migrate dev`, `db push` ne crée pas de fichiers de migration dans `prisma/migrations/`.

**Implications :**
- ⚠️ Pas d'historique des changements de schéma
- ⚠️ Impossible de faire des rollbacks automatiques
- ⚠️ Difficile de reproduire l'état exact de la base en production

**Mitigation :**
- Documenter les changements majeurs dans `documentation/MIGRATION/`
- Sauvegarder le schéma Prisma dans Git
- Pour les changements importants, créer des fichiers SQL de migration manuels si nécessaire

## Cas d'usage spécifiques

### Ajout de nouveaux modèles (ex: LITM)

1. Ajouter les modèles dans `prisma/schema.prisma`
2. Exécuter `pnpm prisma db push`
3. Vérifier avec un script de test
4. Commiter le schéma modifié

### Modification de modèles existants

1. Modifier le modèle dans `prisma/schema.prisma`
2. Vérifier l'impact sur les données existantes
3. Si nécessaire, créer un script de migration de données
4. Exécuter `pnpm prisma db push`
5. Tester l'application

### Suppression de colonnes/tables

⚠️ **Attention** : `db push` supprime directement les données !

Pour éviter les pertes de données :
1. Sauvegarder les données importantes
2. Créer un dump PostgreSQL si nécessaire
3. Modifier le schéma
4. Exécuter `pnpm prisma db push`

## Références

- [Prisma DB Push Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate/db-push)
- [Shadow Database Requirements](https://pris.ly/d/migrate-shadow)
- [AlwaysData PostgreSQL Limits](https://help.alwaysdata.com/fr/bases-de-donnees/postgresql/)

## Historique des changements

- **2025-01-19** : Ajout des modèles LITM (8 nouvelles tables)
  - LitmCharacter, LitmHeroCard, LitmThemeCard, LitmTag
  - LitmQuest, LitmTracker, LitmRelationship, LitmQuintessence
