# Architecture des Modèles - Générateur PDF JDR

## Vue d'ensemble

Le projet utilise une architecture de modèles basée sur le pattern **Active Record** avec une classe de base `BaseModel` qui fournit les opérations CRUD communes et les fonctionnalités avancées.

## Structure générale

```
src/models/
├── BaseModel.js      # Classe de base avec toutes les opérations communes
├── Utilisateur.js    # Gestion des utilisateurs et authentification
├── Personnage.js     # Personnages JDR avec données dynamiques
├── Pdf.js           # Gestion des PDFs générés
├── Temoignage.js    # Témoignages et avis utilisateurs
└── Newsletter.js    # Newsletter et actualités
```

## BaseModel

La classe `BaseModel` fournit :

### Opérations CRUD de base
- `create(data)` - Création d'enregistrement
- `findById(id)` - Recherche par ID
- `findOne(where, params)` - Recherche d'un enregistrement
- `findAll(where, params, orderBy, limit)` - Recherche multiple
- `update(id, data)` - Mise à jour
- `delete(id)` - Suppression

### Fonctionnalités avancées
- **Pagination** : `paginate(page, limit, where, params)`
- **Soft delete** : `softDelete(id)`, `restore(id)`
- **Recherche textuelle** : `search(query, fields)`
- **Upsert** : `upsert(data, uniqueField)`
- **Batch operations** : `bulkCreate(dataArray)`

### Système de protection
- `fillable` : Champs autorisés pour mass assignment
- `guarded` : Champs protégés contre mass assignment
- `hidden` : Champs cachés lors de la sérialisation

### Conversions automatiques
- `casts` : Conversion automatique des types (json, boolean, date, etc.)
- `timestamps` : Gestion automatique created_at/updated_at

### Hooks et validation
- `validate(data, operation)` : Validation métier
- `beforeCreate/afterCreate` : Hooks de création
- `beforeUpdate/afterUpdate` : Hooks de mise à jour
- `beforeDelete/afterDelete` : Hooks de suppression

## Modèles spécifiques

### Utilisateur.js

**Table** : `utilisateurs`

**Champs principaux** :
- `nom`, `email`, `mot_de_passe`
- `role` : UTILISATEUR, PREMIUM, ADMIN
- `avatar`, `preferences` (JSON)
- `derniere_connexion`, `statut`

**Fonctionnalités** :
- Hachage automatique des mots de passe (PBKDF2)
- Authentification sécurisée
- Gestion des rôles et élévations
- Bannissement/débannissement
- Statistiques par rôle

**Méthodes spéciales** :
- `authentifier(email, motDePasse)`
- `elevationRole(id, nouveauRole)`
- `findByEmail(email)`
- `mettreAJourPreferences(id, preferences)`

### Personnage.js

**Table** : `personnages`

**Champs principaux** :
- `nom`, `systeme_jeu`, `utilisateur_id`
- `donnees_personnage` (JSON) - Données dynamiques selon le système
- `tags` (JSON), `description_courte`
- `statut` : BROUILLON, ACTIF, ARCHIVE, SUPPRIME
- `partage_public` (boolean)

**Systèmes supportés** :
- `monsterhearts` : Stats (hot, cold, volatile, dark), skins, moves
- `engrenages` : Attributs, compétences, équipement
- `metro2033` : Caractéristiques, karma, origine
- `mistengine` : Traits, pouvoirs, liens

**Fonctionnalités** :
- Données par défaut selon le système
- Gestion des tags
- Clonage de personnages
- Partage public
- Archivage/restauration

**Méthodes spéciales** :
- `findByUtilisateur(utilisateurId, filtres)`
- `findPublics(filtres, page, limit)`
- `cloner(id, utilisateurId, nouveauNom)`
- `mettreAJourDonnees(id, utilisateurId, donnees)`

### Pdf.js

**Table** : `pdfs`

**Champs principaux** :
- `titre`, `nom_fichier`, `utilisateur_id`, `personnage_id`
- `systeme_jeu`, `type_export`
- `options_export` (JSON) - Configuration de génération
- `statut` : EN_COURS, TERMINE, ERREUR, SUPPRIME
- `chemin_fichier`, `taille_fichier`, `hash_fichier`

**Types d'export** :
- `FICHE_COMPLETE` : Toutes les informations
- `FICHE_SIMPLE` : Version simplifiée
- `RESUME` : Résumé une page
- `CARTE_REFERENCE` : Carte de référence

**Fonctionnalités** :
- Options par défaut selon le système
- URLs de partage temporaires avec tokens
- Nettoyage automatique des anciens PDFs
- Statistiques de génération

**Méthodes spéciales** :
- `genererUrlPartage(id, utilisateurId, dureeHeures)`
- `verifierTokenPartage(token)`
- `statistiquesGeneration(utilisateurId)`
- `utilisationEspace(utilisateurId)`

### Temoignage.js

**Table** : `temoignages`

**Champs principaux** :
- `auteur_nom`, `auteur_email`, `contenu`
- `note` (1-5), `systeme_jeu`
- `statut` : EN_ATTENTE, APPROUVE, REJETE, MASQUE
- `ip_adresse`, `user_agent` (pour la modération)

**Fonctionnalités** :
- Modération des témoignages
- Limitation par IP/email
- Nettoyage automatique des anciens rejetés
- Calcul de notes moyennes

**Méthodes spéciales** :
- `findApprouves(systeme, limite)`
- `approuver(id, moderateurId)`
- `noteMoyenne(systeme)`
- `peutPoster(ipAdresse, email)`

### Newsletter.js

**Deux modèles** : `Newsletter` (abonnés) et `Actualite`

#### Newsletter (Table : `newsletter_abonnes`)
- `email`, `nom`, `preferences` (JSON)
- `statut` : EN_ATTENTE, CONFIRME, DESABONNE, BOUNCE
- `token_confirmation`, `source`

#### Actualite (Table : `actualites`)
- `titre`, `contenu`, `resume`, `auteur`
- `type` : NOUVEAUTE, MISE_A_JOUR, EVENEMENT, ANNONCE
- `statut` : BROUILLON, PLANIFIE, PUBLIE, ARCHIVE

**Fonctionnalités** :
- Double opt-in avec tokens
- Gestion des préférences par système
- Gestion des bounces
- Statistiques d'abonnements

## Conventions et bonnes pratiques

### Nommage
- **Tables** : Pluriel en minuscules (`utilisateurs`, `personnages`)
- **Modèles** : Singulier avec majuscule (`Utilisateur`, `Personnage`)
- **Champs** : snake_case (`date_creation`, `utilisateur_id`)

### Validation
- Chaque modèle override la méthode `validate()`
- Validation côté modèle ET côté service
- Messages d'erreur explicites en français

### Sécurité
- Champs sensibles dans `hidden`
- Validation stricte des données
- Prévention des injections SQL via paramètres

### Performance
- Index sur les clés étrangères
- Pagination pour les listes
- Soft delete au lieu de suppression physique
- Mise en cache des requêtes fréquentes

## Relations entre modèles

```
Utilisateur (1) ──── (N) Personnage
     │                      │
     │                      │
     (N)                   (N)
     │                      │
    Pdf ─────────────────── │
     │
     │
Temoignage

Newsletter ← (indépendant)
Actualite  ← (indépendant)
```

### Clés étrangères
- `personnages.utilisateur_id` → `utilisateurs.id`
- `pdfs.utilisateur_id` → `utilisateurs.id`
- `pdfs.personnage_id` → `personnages.id`

## Migration et évolution

### Ajout d'un nouveau modèle
1. Créer la classe héritant de `BaseModel`
2. Définir les propriétés (`fillable`, `casts`, etc.)
3. Implémenter `validate()` et les hooks
4. Ajouter les méthodes métier spécifiques
5. Mettre à jour le service correspondant
6. Créer la migration de base de données

### Modification d'un modèle existant
1. Modifier la classe du modèle
2. Mettre à jour les validations
3. Ajouter des migrations de schéma si nécessaire
4. Tester la rétrocompatibilité

## Exemples d'utilisation

### Création d'un utilisateur
```javascript
const utilisateur = new Utilisateur();
const nouvelUtilisateur = await utilisateur.create({
    nom: 'John Doe',
    email: 'john@example.com',
    mot_de_passe: 'motdepasse123'
});
```

### Recherche de personnages
```javascript
const personnage = new Personnage();
const personnages = await personnage.findByUtilisateur(userId, {
    systeme: 'monsterhearts',
    statut: 'ACTIF'
});
```

### Pagination
```javascript
const pdf = new Pdf();
const result = await pdf.paginate(1, 10, 'utilisateur_id = ?', [userId]);
// result.data = données
// result.pagination = { page, total, hasNext, etc. }
```

### Recherche textuelle
```javascript
const temoignage = new Temoignage();
const resultats = await temoignage.search('excellent', ['contenu', 'auteur_nom']);
```

Cette architecture offre une base solide, extensible et maintenable pour l'évolution du projet.