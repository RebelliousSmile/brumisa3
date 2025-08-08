# Architecture des Modèles - Générateur PDF JDR

## Vue d'ensemble

Le projet utilise une architecture de modèles basée sur le pattern **Active Record** avec une classe de base `BaseModel` qui fournit les opérations CRUD communes et les fonctionnalités avancées, s'intégrant dans l'architecture **MVC-CS** (Model-View-Controller with Components & Services).

Cette architecture supporte le workflow central de brumisater : **mode "sur le pouce" (anonyme) + gestion à moyen terme (avec compte)** avec 6 types de documents JDR.

## Structure générale

```
src/models/
├── BaseModel.js         # Classe de base avec toutes les opérations communes
├── Utilisateur.js       # Gestion des utilisateurs et authentification
├── Document.js          # Documents JDR (CHARACTER, TOWN, GROUP, ORGANIZATION, DANGER)
├── DocumentVote.js      # Système de votes 3 critères sur documents publics
├── DocumentModerationHistorique.js # Historique des actions de modération
├── Personnage.js        # Données de personnages sauvegardées par les utilisateurs
├── DocumentSystemeJeu.js# Configuration des types de documents par système JDR
├── SystemeJeu.js        # Table des systèmes JDR avec statut maintenance
├── Pdf.js              # Gestion des PDFs générés
├── OraclePersonnalise.js# Oracles personnalisés premium
├── RgpdConsentement.js  # Conformité RGPD et consentements
├── DemandeChangementEmail.js # Gestion changement email sécurisé
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

### DocumentVote.js

**Table** : `document_votes`

**Champs principaux** :
- `document_id`, `utilisateur_id` (clé composite unique)
- `qualite_generale` : Note 1-5 (qualité générale du contenu)
- `utilite_pratique` : Note 1-5 (utilité pour les parties)
- `respect_gamme` : Note 1-5 (respect de l'univers du jeu)
- `commentaire` (texte libre optionnel)
- `date_creation`

**Fonctionnalités** :
- **Système de votes à 3 critères** pour évaluation nuancée
- **Un vote unique par utilisateur/document** (contrainte UNIQUE)
- **Calcul automatique des moyennes** pour classement communautaire
- **Commentaires optionnels** pour feedback constructif
- **Historique complet** des votes avec traçabilité

**Méthodes spéciales** :
- `voterDocument(documentId, utilisateurId, votes)` - Enregistrer un vote
- `modifierVote(documentId, utilisateurId, nouveauxVotes)` - Modifier vote existant
- `calculerMoyennes(documentId)` - Moyennes par critère
- `getVotesUtilisateur(utilisateurId, documentId)` - Vote utilisateur sur document
- `classementDocuments(systeme, critere)` - Classement par critère
- `statistiquesVotes(documentId)` - Stats complètes d'un document

### DocumentModerationHistorique.js

**Table** : `document_moderation_historique`

**Champs principaux** :
- `document_id`, `moderateur_id`
- `action` : Type d'action effectuée
- `ancien_statut`, `nouveau_statut`
- `motif` (justification de l'action)
- `date_action`

**Actions de modération** :
- `MISE_EN_AVANT` : Document promu par modérateur
- `RETRAIT_MISE_EN_AVANT` : Retrait de la promotion
- `APPROBATION` : Validation du contenu
- `REJET` : Rejet avec motif
- `SIGNALEMENT` : Marquage pour vérification

**Fonctionnalités** :
- **Traçabilité complète** des actions de modération
- **Historique immuable** pour audit et transparence
- **Justifications obligatoires** pour actions importantes
- **Suivi des modérateurs** et leurs interventions

**Méthodes spéciales** :
- `enregistrerAction(documentId, moderateurId, action, motif)`
- `getHistoriqueDocument(documentId)` - Historique complet
- `getActionsModerateur(moderateurId)` - Actions d'un modérateur
- `statistiquesModeration()` - Métriques pour dashboard admin

### SystemeJeu.js

**Table** : `systemes_jeu`

**Champs principaux** :
- `id` (VARCHAR PRIMARY KEY) : monsterhearts, engrenages, metro2033, mistengine, zombiology
- `nom_complet`, `description`, `site_officiel`
- `version_supportee` : Version du système prise en charge
- `structure_donnees` (JSONB) : Définition des champs de données par type
- `statut` : ACTIF, MAINTENANCE, DEPRECIE, BETA
- `message_maintenance` : Message affiché pendant maintenance générale
- `ordre_affichage`, `couleur_theme`, `icone`
- `date_derniere_maj_structure` : Suivi des évolutions

**Fonctionnalités** :
- **Gestion centralisée** des systèmes JDR supportés
- **Mode maintenance système complet** (désactive tout le système)
- **Structure de données flexible** via JSONB pour chaque type de document
- **Interface visuelle personnalisée** (couleur, icône)
- **Versioning** pour compatibilité avec évolutions des systèmes
- **Référentiel central** pour validation des types de documents

**Méthodes spéciales** :
- `getSystemesActifs()` - Systèmes disponibles (statut ACTIF uniquement)
- `mettreEnMaintenance(id, message)` - Maintenance complète du système
- `sortirMaintenance(id)` - Réactiver système complet
- `mettreAJourStructure(id, nouvelleStructure)` - Evolution des données
- `getSystemeInfo(id)` - Informations complètes d'un système

### OraclePersonnalise.js

**Table** : `oracles_personnalises`

**Champs principaux** :
- `id` (UUID), `utilisateur_id`
- `nom`, `description`
- `donnees_oracle` (JSONB) : Structure complète de l'oracle
- `statut` : PRIVE, PARTAGE, PUBLIC
- `systeme_jeu` (optionnel)
- `base_sur_oracle_id` : Oracle original si dérivé
- `date_creation`, `date_modification`

**Fonctionnalités** :
- **Oracles premium personnalisés** pour utilisateurs avancés
- **Dérivation d'oracles existants** avec modifications
- **Partage communautaire** avec gestion de visibilité
- **Structure JSONB flexible** pour types d'oracles variés
- **Historique et traçabilité** des modifications

**Méthodes spéciales** :
- `creerOracle(utilisateurId, donnees)` - Nouvel oracle personnalisé
- `deriverOracle(oracleBaseId, utilisateurId, modifications)` - Dérivation
- `changerVisibilite(id, nouveauStatut)` - Gestion partage
- `getOraclesUtilisateur(userId, statut)` - Oracles d'un utilisateur
- `getOraclesPublics(systeme)` - Oracles partagés par système

### RgpdConsentement.js

**Table** : `rgpd_consentements`

**Champs principaux** :
- `utilisateur_id`, `type_consentement`
- `consentement_donne` (boolean)
- `date_consentement`, `ip_adresse`, `user_agent`

**Types de consentement** :
- `NEWSLETTER` : Abonnement newsletter
- `COOKIES_ANALYTIQUES` : Cookies de mesure d'audience
- `PARTAGE_DONNEES` : Partage avec partenaires
- `COMMUNICATION_MARKETING` : Communications commerciales

**Fonctionnalités** :
- **Conformité RGPD complète** avec traçabilité
- **Historique immuable** des consentements
- **Granularité fine** par type de traitement
- **Métadonnées techniques** pour audit légal

**Méthodes spéciales** :
- `enregistrerConsentement(userId, type, consenti, metadata)`
- `verifierConsentement(userId, type)` - Statut actuel
- `retirerConsentement(userId, type)` - Révocation
- `exporterDonnees(userId)` - Export RGPD utilisateur

### DemandeChangementEmail.js

**Table** : `demandes_changement_email`

**Champs principaux** :
- `utilisateur_id`, `ancien_email`, `nouvel_email`
- `token_validation` (unique)
- `statut` : EN_ATTENTE, VALIDE, EXPIRE, ANNULE
- `date_demande`, `date_expiration` (15 jours)
- `date_validation`, `ip_demande`

**Fonctionnalités** :
- **Changement d'email sécurisé** avec double validation
- **Tokens temporaires** avec expiration automatique
- **Historique complet** des changements demandés
- **Sécurité renforcée** avec IP tracking

**Méthodes spéciales** :
- `demanderChangement(userId, nouvelEmail, ip)`
- `validerChangement(token)` - Validation par email
- `annulerDemande(userId)` - Annulation utilisateur
- `nettoyer()` - Purge des demandes expirées

### DocumentSystemeJeu.js

**Table** : `document_systeme_jeu`

**Clé primaire composite** : `(document_type, systeme_jeu)`

Cette table gère la **maintenance granulaire par type de document** pour chaque système JDR. Elle permet de désactiver/activer des types spécifiques sans affecter tout le système.

**Champs principaux** :
- `document_type` : CHARACTER, TOWN, GROUP, ORGANIZATION, DANGER (CHECK constraint)
- `systeme_jeu` : Référence vers systemes_jeu.id 
- `actif` (boolean) : **Active/désactive ce TYPE spécifique pour ce système**
- `ordre_affichage` : Ordre dans l'interface utilisateur
- `configuration` (JSONB) : Configuration spécifique du type
- `date_ajout`, `date_modification`

**Exemple de maintenance granulaire** :
```javascript
// Monsterhearts : DANGER désactivé (pas adapté au système)
{ document_type: 'DANGER', systeme_jeu: 'monsterhearts', actif: false }

// MistEngine : TOWN et GROUP désactivés (système centré sur CHARACTER/DANGER)  
{ document_type: 'TOWN', systeme_jeu: 'mistengine', actif: false }
{ document_type: 'GROUP', systeme_jeu: 'mistengine', actif: false }

// Metro2033 : Tous types actifs
{ document_type: 'CHARACTER', systeme_jeu: 'metro2033', actif: true }
{ document_type: 'ORGANIZATION', systeme_jeu: 'metro2033', actif: true }
```

**Configuration JSONB par type** :
```javascript
{
  "champs_requis": ["skin", "hot", "cold"], // Pour CHARACTER + monsterhearts
  "template_pdf": "monsterhearts_character",
  "validation_custom": ["skin_valide", "stats_equilibrees"],
  "couleur_theme": "#8B0000"
}
```

**Fonctionnalités** :
- **Maintenance granulaire TYPE par TYPE** : Désactiver uniquement TOWN pour Monsterhearts
- **Ordre d'affichage personnalisé** : CHARACTER > ORGANIZATION > TOWN pour chaque système
- **Configuration JSONB flexible** : Champs requis, templates, validations par combinaison
- **Double validation** : Système actif (systemes_jeu) ET type actif (document_systeme_jeu)

**Workflow de vérification** :
1. Système JDR disponible ? (`systemes_jeu.statut = 'ACTIF'`)
2. Type de document activé pour ce système ? (`document_systeme_jeu.actif = true`)
3. Configuration spécifique disponible ? (`document_systeme_jeu.configuration`)

**Méthodes spéciales** :
- `getTypesActifs(systeme)` - Types disponibles ET actifs pour un système
- `getTypesDisponibles(systeme)` - Tous types configurés (actifs + inactifs) 
- `activerType(type, systeme, actif)` - Maintenance spécifique d'un type
- `getConfiguration(type, systeme)` - Config JSONB d'une combinaison
- `verifierDisponibilite(type, systeme)` - Double validation système + type
- `mettreAJourOrdre(systeme, ordres)` - Réorganiser affichage par système\n\n### Newsletter.js\n\n**Deux modèles** : `Newsletter` (abonnés) et `Actualite`

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
                    SystemeJeu (1) ──── (N) DocumentSystemeJeu
                    (Gestion              (Configuration types
                   centralisée)           actifs par système)
                         │                       │
                         │                       ↓
Utilisateur (1) ──── (N) Personnage        Document ──── (N) Pdf
     │                      │          (5 types: CHARACTER,   │
     │                      │ génère    TOWN, GROUP,          │
     │                      ↓          ORGANIZATION,          │  
     (N)                 Document       DANGER, GENERIQUE)    │
     │                      │                                │
     │ vote                 │                                │
     ↓                      ↓                                │
DocumentVote            DocumentModerationHistorique        │
(3 critères)            (Traçabilité admin)                 │
     │                      │                                │
     │                      │                                │
    Temoignage          OraclePersonnalise                   │
     │                  (Premium JSONB)                      │
     │                      │                                │
RgpdConsentement           │                                │
DemandeChangementEmail     │                                │
(Extensions RGPD)          │                                │
     │                      │                                │
Newsletter_Abonnes ←─ (indépendant)                         │
Actualites         ←─ (indépendant)                         │
                                                            │
                                        ────────────────────┘
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

**Relations principales** :
- `personnages.utilisateur_id` → `utilisateurs.id` (NOT NULL - personnages uniquement pour connectés)
- `documents.utilisateur_id` → `utilisateurs.id` (NULL pour guests anonymes)
- `documents.personnage_id` → `personnages.id` (NULL si document indépendant)
- `documents.moderateur_id` → `utilisateurs.id` (modérateur ayant traité le document)
- `pdfs.utilisateur_id` → `utilisateurs.id` (NULL pour guests)
- `pdfs.document_id` → `documents.id` (NOT NULL - PDF toujours lié à un document)
- `pdfs.personnage_id` → `personnages.id` (NULL si PDF direct depuis document)

**Nouvelles relations (migrations 007-010)** :
- `document_votes.document_id` → `documents.id` (CASCADE)
- `document_votes.utilisateur_id` → `utilisateurs.id` (CASCADE)
- `document_moderation_historique.document_id` → `documents.id` (CASCADE)
- `document_moderation_historique.moderateur_id` → `utilisateurs.id`
- `oracles_personnalises.utilisateur_id` → `utilisateurs.id` (CASCADE)
- `oracles_personnalises.base_sur_oracle_id` → `oracles.id` (dérivation)
- `rgpd_consentements.utilisateur_id` → `utilisateurs.id` (CASCADE)
- `demandes_changement_email.utilisateur_id` → `utilisateurs.id` (CASCADE)

**Relations système** :
- `document_systeme_jeu.systeme_jeu` → `systemes_jeu.id` (référentiel centralisé)
- `documents.systeme_jeu` → `systemes_jeu.id` (validation contre référentiel)
- `oracles.systeme_jeu` → `systemes_jeu.id` (optionnel)
- `temoignages.systeme_jeu` → `systemes_jeu.id` (validation applicative)

**Autres relations** :
- `actualites.auteur_id` → `utilisateurs.id` (auteur admin)

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