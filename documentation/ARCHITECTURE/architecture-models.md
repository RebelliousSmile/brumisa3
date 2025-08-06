# Architecture des Modèles - Générateur PDF JDR

## Vue d'ensemble

Le projet utilise une architecture de modèles basée sur le pattern **Active Record** avec une classe de base `BaseModel` qui fournit les opérations CRUD communes et les fonctionnalités avancées.

Cette architecture supporte le workflow central de brumisater : **mode "sur le pouce" (anonyme) + gestion à moyen terme (avec compte)** avec 5 types de documents JDR.

## Structure générale

```
src/models/
├── BaseModel.js         # Classe de base avec toutes les opérations communes
├── Utilisateur.js       # Gestion des utilisateurs et authentification
├── Document.js          # Documents JDR (CHARACTER, TOWN, GROUP, ORGANIZATION, DANGER)
├── Personnage.js        # Données de personnages sauvegardées par les utilisateurs
├── DocumentSystemeJeu.js# Configuration des types de documents par système JDR
├── Pdf.js              # Gestion des PDFs générés
├── Temoignage.js       # Témoignages et avis utilisateurs
├── Newsletter.js       # Abonnés newsletter
└── Actualite.js        # Newsletter et actualités
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
- `derniere_connexion`, `statut` : ACTIF, SUSPENDU, BANNI
- `type_premium`, `premium_expire_le` (gestion premium temporel 1€ = 1 mois)
- `newsletter_abonne` (boolean), `communication_preferences` (JSON)
- `est_anonyme` (boolean) - Utilisateur anonyme ID=0
- `pseudo_public` (nom d'affichage modifiable)

**Fonctionnalités** :
- Hachage automatique des mots de passe (PBKDF2)  
- Authentification sécurisée avec gestion des tokens
- Gestion premium temporel avec décompte automatique
- Bannissement/débannissement avec préservation des contenus
- Gestion des préférences de communication et newsletter
- Support utilisateur anonyme (guest) pour mode "sur le pouce"
- Pseudo modifiable distinct de l'email technique

**Méthodes spéciales** :
- `authentifier(email, motDePasse)`
- `elevationRole(id, nouveauRole)`
- `findByEmail(email)`
- `mettreAJourPreferences(id, preferences)`
- `activerPremium(id, dureeEnMois)` - Active statut premium
- `verifierStatutPremium(id)` - Contrôle expiration premium
- `changerPseudo(id, nouveauPseudo)` - Modification identité publique
- `gererCommunications(id, preferences)` - Newsletter et notifications

### Document.js

**Table** : `documents`

**Champs principaux** :
- `type` : GENERIQUE, CHARACTER, TOWN, GROUP, ORGANIZATION, DANGER
- `titre`, `systeme_jeu`, `utilisateur_id` (nullable pour guests)
- `donnees` (JSON) - Données dynamiques selon le type et le système
- `statut` : BROUILLON, ACTIF, ARCHIVE, SUPPRIME
- `visible_admin_only` (boolean) - Pour les documents créés par des guests
- `personnage_id` (nullable) - Lien vers un personnage sauvegardé si applicable
- `visibilite` : PRIVE, PUBLIC (pour partage communautaire)
- `est_mis_en_avant` (boolean) - Document mis en avant par l'administration
- `date_mise_en_avant`, `moderateur_id` - Traçabilité des mises en avant
- `statut_moderation` : EN_ATTENTE, APPROUVE, REJETE, SIGNALE
- `date_moderation`, `motif_rejet` - Suivi de la modération
- `notes_creation`, `contexte_utilisation` (métadonnées utilisateur)

**Types de documents** :
- `GENERIQUE` : Document non typé, structure libre (journaux joueur solo)
- `CHARACTER` : Fiche de personnage (tous systèmes JDR)
- `TOWN` : Cadre de ville (spécifique à Monsterhearts)
- `GROUP` : Plan de classe/groupe (spécifique à Monsterhearts)  
- `ORGANIZATION` : Liste de PNJs (crucial pour MJs - tous systèmes)
- `DANGER` : Fronts et dangers (spécifique à Mist Engine)

**Fonctionnalités** :
- **Support mode "sur le pouce"** : Création anonyme immédiate
- **Workflow Document vs Personnage** : Documents peuvent être générés depuis personnages sauvegardés
- Structure de données adaptée au type et au système JDR
- Génération PDF selon templates spécifiques par système
- **Partage communautaire** : Documents publics avec système de votes
- **Modération a posteriori** : Publication immédiate puis validation admin
- **Mise en avant administrative** : Documents de référence promus par les modérateurs
- **Système de priorité d'affichage** : Mis en avant > Votés > Récents
- Historique des modifications et traçabilité complète

**Méthodes spéciales** :
- `findByType(type, systeme, filtres)`
- `findVisibleBy(utilisateurId)` - Respecte visible_admin_only et visibilité
- `findAdminOnly()` - Documents guests pour les admins
- `findPublicsBySystem(systeme)` - Documents publics par système JDR
- `findMisEnAvant(systeme, type)` - Documents mis en avant par priorité
- `createFromPersonnage(personnageId)` - Crée un document depuis un personnage
- `createAnonymous(data)` - Création rapide anonyme
- `changerVisibilite(id, nouvelleVisibilite)` - Gestion partage communauté
- `mettreEnAvant(id, moderateurId, motif)` - Mise en avant administrative
- `retirerMiseEnAvant(id, moderateurId)` - Retirer la mise en avant
- `findEnAttenteModeration()` - Documents à modérer
- `moderer(id, statut, moderateurId, motif)` - Actions de modération

### Personnage.js

**Table** : `personnages`

**Champs principaux** :
- `nom`, `systeme_jeu`, `utilisateur_id` (requis - uniquement utilisateurs connectés)
- `donnees` (JSON) - Données complètes du personnage selon le système
- `description`, `notes` (texte libre utilisateur)
- `tags` (JSON) - Organisation personnelle
- `derniere_utilisation` (timestamp)
- `nombre_modifications` (compteur d'éditions)
- `date_creation`, `date_modification` (traçabilité basique MVP)

**Fonctionnalités** :
- **Stockage permanent** des données de personnage (utilisateurs connectés uniquement)
- **Réutilisation** : Base pour générer plusieurs documents CHARACTER
- **Évolution** : Modification après sessions JDR avec traçabilité basique
- **Dashboard utilisateur** : Gestion centralisée des personnages sauvegardés
- **Transition mode anonyme** : Utilisateurs peuvent sauvegarder leurs créations

**Méthodes spéciales** :
- `findByUtilisateur(utilisateurId, filtres)`
- `genererDocument(personnageId)` - Crée un document CHARACTER depuis personnage
- `mettreAJourDernièreUtilisation(id)`
- `modifierPersonnage(id, nouvellesDonnees)` - Édition avec traçabilité
- `dupliquerPersonnage(id, nouveauNom)` - Copie pour variation
- `convertirDepuisDocument(documentId, utilisateurId)` - Sauvegarde depuis document anonyme

### Pdf.js

**Table** : `pdfs`

**Champs principaux** :
- `titre`, `nom_fichier`, `utilisateur_id` (nullable pour guests)
- `document_id` (lien vers table documents) 
- `personnage_id` (nullable - si généré depuis personnage sauvegardé)
- `systeme_jeu`, `type_export`
- `options_export` (JSON) - Configuration de génération
- `statut` : EN_COURS, TERMINE, ERREUR, SUPPRIME
- `statut_visibilite` : PRIVE, PUBLIC, ADMIN_ONLY
- `chemin_fichier`, `taille_fichier`, `hash_fichier`
- `date_creation`, `date_expiration` (nettoyage automatique)
- `nombre_telechargements`, `partage_token` (URLs temporaires)

**Types d'export** :
- `FICHE_COMPLETE` : Toutes les informations
- `FICHE_SIMPLE` : Version simplifiée
- `RESUME` : Résumé une page
- `CARTE_REFERENCE` : Carte de référence
- `ORGANISATION_LIST` : Liste structurée de PNJs
- `DOCUMENT_GENERIQUE` : Format libre

**Fonctionnalités** :
- **Mode "sur le pouce"** : Génération instantanée pour utilisateurs anonymes
- **Gestion à moyen terme** : Sauvegarde et réutilisation pour utilisateurs connectés
- **Statuts de visibilité** : Privé/public selon utilisateur, admin_only pour documents anonymes
- Options par défaut selon le type de document et système JDR
- URLs de partage temporaires avec tokens sécurisés
- Nettoyage automatique des anciens PDFs (configurable)
- **Documents anonymes** : Stockage avec visibilité admin uniquement
- **Système de votes** : Gestion des votes sur documents publics

**Méthodes spéciales** :
- `genererDepuisDocument(documentId)` - PDF depuis document
- `genererDepuisPersonnage(personnageId)` - PDF depuis personnage sauvegardé
- `genererUrlPartage(id, utilisateurId, dureeHeures)`
- `verifierTokenPartage(token)`
- `changerStatutVisibilite(id, nouveauStatut, moderateurId)` - Gestion visibilité
- `findByStatutVisibilite(statut)` - PDFs par statut de visibilité
- `findAdminOnly()` - PDFs des utilisateurs anonymes (admin uniquement)
- `statistiquesGeneration(utilisateurId)`
- `findByDocumentType(type)` - PDFs par type de document

#### Statuts de visibilité des PDFs

Chaque PDF peut avoir un **statut de visibilité** qui détermine qui peut y accéder :

**Statuts disponibles** :

- **`PRIVE`** (par défaut pour utilisateurs connectés) :
  - Le PDF n'est visible que par son créateur
  - Apparaît uniquement dans "Mes documents" de l'utilisateur
  - Aucun partage public possible

- **`PUBLIC`** :
  - Le PDF apparaît dans la liste publique des documents créés
  - Visible par tous les utilisateurs du site
  - Peut être consulté et téléchargé par la communauté
  - Le créateur reste identifié
  - Peut recevoir des votes de la communauté

- **`ADMIN_ONLY`** (par défaut pour utilisateurs anonymes) :
  - Le PDF n'est visible que par les administrateurs
  - Documents créés "sur le pouce" par des utilisateurs non connectés
  - Stockés en base mais non accessibles publiquement
  - Permet la modération et le suivi des créations anonymes

**Gestion des statuts** :
```javascript
// Passage d'un PDF privé en public
await pdf.changerStatutVisibilite(pdfId, 'PUBLIC', utilisateurId);

// Recherche des PDFs par statut
const pdfsPublics = await pdf.findByStatutVisibilite('PUBLIC');
const pdfsAnonymesAdmin = await pdf.findAdminOnly();
```

**Permissions** :
- Utilisateurs connectés : peuvent passer de PRIVE → PUBLIC
- Utilisateurs anonymes : créent automatiquement en ADMIN_ONLY
- Administrateurs : accès complet à tous les statuts

### Temoignage.js

**Table** : `temoignages`

**Champs principaux** :
- `auteur_nom`, `auteur_email`, `contenu` (témoignage libre)
- `note` (1-5 étoiles), `systeme_jeu`
- `lien_contact` (URL optionnelle vers profil/site auteur)
- `statut` : EN_ATTENTE, APPROUVE, REJETE, MASQUE
- `ip_adresse`, `user_agent` (pour la modération anti-spam)
- `date_creation`, `date_moderation`

**Fonctionnalités** :
- **Preuve sociale** : Témoignages authentiques pour orienter nouveaux utilisateurs
- **Modération a posteriori** : Validation par Félix sous 48h
- Limitation anti-spam par IP/email (1 par jour/IP, 1 par semaine/email)
- **Affichage aléatoire** : Rotation des témoignages sur les pages
- Calcul de notes moyennes par système JDR

**Méthodes spéciales** :
- `findApprouves(systeme, limite)` - Témoignages validés pour affichage
- `findAleatoires(nombre)` - Sélection aléatoire pour rotation
- `approuver(id, moderateurId)` - Validation administrative
- `rejeter(id, moderateurId, motif)` - Rejet avec justification
- `noteMoyenne(systeme)` - Score de satisfaction par système
- `peutPoster(ipAdresse, email)` - Contrôle anti-spam
- `statistiquesModeration()` - Metrics pour dashboard admin

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
     (N)                 Document ──── (N) Pdf
     │               (5 types: CHARACTER,   │
     │                TOWN, GROUP,          │
     │               ORGANIZATION,          │  
     │                DANGER, GENERIQUE)    │
     │                      │               │
     │                      │               │
    Temoignage              │               │
                           │               │
Newsletter_Abonnes ←─ (indépendant)         │
Actualites         ←─ (indépendant)         │
                           │               │
                   DocumentSystemeJeu ──────┘
                  (configuration types
                   actifs par système)
```

### Workflow Central : Mode Anonyme + Gestion à Moyen Terme

```
MODE "SUR LE POUCE" (Anonyme)
Casey crée document → PDF généré → Téléchargement → Départ
│
└─── (optionnel) ───→ Création compte → Sauvegarde posteriori

MODE "GESTION À MOYEN TERME" (Connecté)  
Sam crée personnage sauvegardé → Génère documents → Évolution après sessions
                 ↑                      ↓
         Tableau de bord ←── Réutilisation ── Modification
```

### Clés étrangères
- `personnages.utilisateur_id` → `utilisateurs.id` (NOT NULL - personnages uniquement pour connectés)
- `documents.utilisateur_id` → `utilisateurs.id` (NULL pour guests anonymes)
- `documents.personnage_id` → `personnages.id` (NULL si document indépendant)
- `pdfs.utilisateur_id` → `utilisateurs.id` (NULL pour guests)
- `pdfs.document_id` → `documents.id` (NOT NULL - PDF toujours lié à un document)
- `pdfs.personnage_id` → `personnages.id` (NULL si PDF direct depuis document)
- `temoignages.systeme_jeu` → Configuration système (pas FK, validation applicative)
- `actualites.auteur_id` → `utilisateurs.id` (auteur admin)
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