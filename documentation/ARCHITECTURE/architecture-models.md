# Architecture des Modèles - Générateur PDF JDR

## Vue d'ensemble

Le projet utilise une architecture de modèles basée sur le pattern **Active Record** avec une classe de base `BaseModel` qui fournit les opérations CRUD communes et les fonctionnalités avancées.

## Structure générale

```
src/models/
├── BaseModel.js      # Classe de base avec toutes les opérations communes
├── Utilisateur.js    # Gestion des utilisateurs et authentification
├── Personnage.js     # Données de personnages sauvegardées par les utilisateurs
├── Document.js       # Documents générés (character, town, group, etc.)
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

### Document.js

**Table** : `documents`

**Champs principaux** :
- `type` : GENERIQUE, CHARACTER, TOWN, GROUP, ORGANIZATION, DANGER
- `titre`, `systeme_jeu`, `utilisateur_id`
- `donnees` (JSON) - Données dynamiques selon le type et le système
- `statut` : BROUILLON, ACTIF, ARCHIVE, SUPPRIME
- `visible_admin_only` (boolean) - Pour les documents créés par des guests
- `personnage_id` (nullable) - Lien vers un personnage sauvegardé si applicable

**Types de documents** :
- `GENERIQUE` : Document non typé, structure libre
- `CHARACTER` : Fiche de personnage (remplaçant l'ancien modèle Personnage)
- `TOWN` : Cadre de ville (spécifique à Monsterhearts)
- `GROUP` : Plan de classe/groupe (spécifique à Monsterhearts)  
- `ORGANIZATION` : Liste de PNJs, sans feuille individuelle
- `DANGER` : Fronts et dangers (spécifique à Mist Engine)

**Fonctionnalités** :
- Structure de données adaptée au type et au système
- Création anonyme avec `visible_admin_only = true`
- Génération PDF selon templates spécifiques
- Historique des modifications
- Duplication de documents

**Méthodes spéciales** :
- `findByType(type, systeme, filtres)`
- `findVisibleBy(utilisateurId)` - Respecte visible_admin_only
- `findAdminOnly()` - Documents guests pour les admins
- `createFromPersonnage(personnageId)` - Crée un document depuis un personnage
- `getTypesForSysteme(systeme)` - Types disponibles pour un système

### Personnage.js

**Table** : `personnages`

**Champs principaux** :
- `nom`, `systeme_jeu`, `utilisateur_id`
- `donnees` (JSON) - Données du personnage selon le système
- `description`, `notes`
- `tags` (JSON)
- `derniere_utilisation` (timestamp)

**Fonctionnalités** :
- Stockage permanent des données de personnage
- Lié à un utilisateur connecté
- Sert de base pour générer des documents CHARACTER
- Gestion des favoris
- Statistiques d'utilisation

**Méthodes spéciales** :
- `findByUtilisateur(utilisateurId, filtres)`
- `genererDocument(personnageId)` - Crée un document CHARACTER
- `mettreAJourDernièreUtilisation(id)`
- `marquerFavori(id, utilisateurId)`

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
- Options par défaut selon le type de document
- URLs de partage temporaires avec tokens
- Nettoyage automatique des anciens PDFs
- Statistiques de génération
- Support des différents types de documents

**Méthodes spéciales** :
- `genererUrlPartage(id, utilisateurId, dureeHeures)`
- `verifierTokenPartage(token)`
- `statistiquesGeneration(utilisateurId)`
- `utilisationEspace(utilisateurId)`
- `findByDocumentType(type)` - PDFs par type de document

#### Statuts de visibilité des PDFs

Chaque PDF peut avoir un **statut de visibilité** qui détermine qui peut y accéder :

**Statuts disponibles** :

- **`PRIVE`** (par défaut) :
  - Le PDF n'est visible que par son créateur
  - Apparaît uniquement dans "Mes documents" de l'utilisateur
  - Aucun partage public possible

- **`PUBLIC`** :
  - Le PDF apparaît dans la liste publique des documents créés
  - Visible par tous les utilisateurs du site
  - Peut être consulté et téléchargé par la communauté
  - Le créateur reste identifié

- **`COMMUNAUTAIRE`** :
  - Le PDF devient une ressource globale de la plateforme
  - Apparaît dans la section "Téléchargements" des pages systèmes
  - Considéré comme une contribution communautaire
  - Peut être mis en avant par les modérateurs
  - Le créateur est crédité comme contributeur

**Gestion des statuts** :
```javascript
// Promotion d'un PDF en ressource communautaire
await pdf.changerStatutVisibilite(pdfId, 'COMMUNAUTAIRE', moderateurId);

// Recherche des PDFs par statut
const pdfsPublics = await pdf.findByStatutVisibilite('PUBLIC');
const ressourcesCommunautaires = await pdf.findByStatutVisibilite('COMMUNAUTAIRE');
```

**Permissions** :
- Utilisateurs : peuvent passer de PRIVE → PUBLIC
- Modérateurs/Admins : peuvent promouvoir PUBLIC → COMMUNAUTAIRE
- Système de validation pour les ressources communautaires

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

### DocumentSystemeJeu.js

**Table** : `document_systeme_jeu`

Cette table de relation gère les types de documents disponibles pour chaque système de jeu, avec la possibilité d'activer/désactiver temporairement certains types.

**Champs principaux** :\n- `document_type` : CHARACTER, TOWN, GROUP, ORGANIZATION, DANGER\n- `systeme_jeu` : monsterhearts, engrenages, metro2033, mistengine, zombiology\n- `actif` (boolean) : Active/désactive ce type pour ce système\n- `ordre_affichage` : Ordre dans l'interface utilisateur\n- `configuration` (JSON) : Configuration spécifique (champs requis, template, etc.)\n- `date_ajout`, `date_modification`\n\n**Configuration par système** :\n```javascript\n{\n  \"monsterhearts\": {\n    \"CHARACTER\": { actif: true, ordre: 1 },\n    \"TOWN\": { actif: true, ordre: 2 },\n    \"GROUP\": { actif: true, ordre: 3 },\n    \"ORGANIZATION\": { actif: true, ordre: 4 },\n    \"DANGER\": { actif: false, ordre: null }\n  },\n  \"mistengine\": {\n    \"CHARACTER\": { actif: true, ordre: 1 },\n    \"DANGER\": { actif: true, ordre: 2 },\n    \"ORGANIZATION\": { actif: true, ordre: 3 },\n    \"TOWN\": { actif: false, ordre: null },\n    \"GROUP\": { actif: false, ordre: null }\n  }\n}\n```\n\n**Fonctionnalités** :\n- Gestion granulaire de la disponibilité des types\n- Possibilité de désactiver temporairement pour maintenance\n- Configuration spécifique par combinaison type/système\n- Historique des modifications\n\n**Méthodes spéciales** :\n- `getTypesActifs(systeme)` - Types disponibles pour un système\n- `activerType(type, systeme, actif)` - Active/désactive un type\n- `getConfiguration(type, systeme)` - Configuration spécifique\n- `mettreAJourOrdre(systeme, ordres)` - Met à jour l'ordre d'affichage\n\n### Newsletter.js\n\n**Deux modèles** : `Newsletter` (abonnés) et `Actualite`

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
     │                      │ génère
     │                      ↓
     (N)                 Document
     │                   (CHARACTER)
     │                      │
    Pdf ─────────────────── │
     │                      │
     │                      │
Temoignage                  │
                           │
Newsletter ← (indépendant)  │
Actualite  ← (indépendant)  │
                           │
                   DocumentSystemeJeu
                  (relation N:M avec
                   statut actif/inactif)
```

### Clés étrangères
- `personnages.utilisateur_id` → `utilisateurs.id`
- `documents.utilisateur_id` → `utilisateurs.id` (nullable pour guests)
- `documents.personnage_id` → `personnages.id` (nullable)
- `pdfs.utilisateur_id` → `utilisateurs.id`  
- `pdfs.document_id` → `documents.id`
- `document_systeme_jeu.document_type` + `systeme_jeu` (clé composite)

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

### Création d'un document anonyme
```javascript
const document = new Document();
const docCharacter = await document.create({
    type: 'CHARACTER',
    systeme_jeu: 'monsterhearts',
    titre: 'Luna la Vampire',
    donnees: { hot: 2, cold: -1, skin: 'vampire' },
    visible_admin_only: true // Guest user
});
```

### Création d'un document depuis un personnage
```javascript
const personnage = new Personnage();
const document = new Document();

// Récupérer le personnage sauvegardé
const perso = await personnage.findById(personnageId);

// Générer un document CHARACTER
const doc = await document.createFromPersonnage(perso.id);
```

### Vérification des types disponibles
```javascript
const document = new Document();
const typesMonsterhearts = await document.getTypesForSysteme('monsterhearts');
// ['CHARACTER', 'TOWN', 'GROUP', 'ORGANIZATION']

const typesMistEngine = await document.getTypesForSysteme('mistengine');
// ['CHARACTER', 'DANGER', 'ORGANIZATION']
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