# Documentation API - brumisater

API REST pour la génération de fiches de personnages JDR et gestion des oracles.

## Vue d'ensemble

L'API brumisater est une API REST qui utilise :
- **Authentification** : Sessions Express avec cookies
- **Format** : JSON pour les requêtes et réponses
- **Base URL** : `http://localhost:3000/api` (développement)
- **Versioning** : Pas de versioning actuel, API stable v1

## Authentification

### Sessions et cookies
L'API utilise des sessions Express avec cookies HTTP-only pour l'authentification.

```javascript
// Headers requis pour les requêtes authentifiées
{
  "Content-Type": "application/json",
  "Cookie": "connect.sid=..." // Cookie de session automatique
}
```

### Middleware d'authentification
- **`middlewareAuth`** : Vérification de la connexion utilisateur
- **`middlewareRole(role)`** : Vérification du rôle (PREMIUM, ADMIN)

### Types de comptes
- **Anonyme** : Génération limitée de PDFs (token temporaire)
- **Utilisateur** : Compte standard avec sauvegarde
- **PREMIUM** : Fonctionnalités avancées via code d'accès
- **ADMIN** : Administration complète

## Codes d'erreur standardisés

```json
{
  "succes": false,
  "message": "Description de l'erreur",
  "type": "code_erreur",
  "timestamp": "2025-08-08T10:00:00Z"
}
```

### Codes de statut HTTP
- **200** : Succès
- **201** : Ressource créée
- **400** : Données invalides
- **401** : Non authentifié
- **403** : Accès refusé
- **404** : Ressource non trouvée
- **500** : Erreur serveur

### Types d'erreurs métier
- `validation` : Erreur de validation des données
- `not_found` : Ressource inexistante
- `auth_required` : Authentification requise
- `insufficient_privileges` : Privilèges insuffisants
- `rate_limit` : Limite de requêtes dépassée

## Endpoints par domaine

### Authentification (`/api/auth/*`)

#### Connexion et inscription
```http
POST /api/auth/connexion
Content-Type: application/json

{
  "email": "user@example.com",
  "motDePasse": "password123"
}
```

```http
POST /api/auth/inscription
Content-Type: application/json

{
  "nom": "Nom Utilisateur",
  "email": "user@example.com",
  "motDePasse": "password123"
}
```

#### Gestion du mot de passe
```http
POST /api/auth/mot-de-passe-oublie
Content-Type: application/json

{
  "email": "user@example.com"
}
```

```http
POST /api/auth/reinitialiser-mot-de-passe
Content-Type: application/json

{
  "token": "reset_token",
  "motDePasse": "new_password123"
}
```

#### Profil utilisateur
```http
GET /api/auth/statut
# Vérifier l'état de connexion

GET /api/auth/profil
# Obtenir les informations du profil (AUTH)

PUT /api/auth/profil
Content-Type: application/json

{
  "nom": "Nouveau nom",
  "email": "new@example.com"
}
```

#### Élévation de privilèges
```http
POST /api/auth/passer-premium
Content-Type: application/json

{
  "code": "123456",
  "type": "PREMIUM"
}
```

### Personnages (`/api/personnages/*`)

#### CRUD de base
```http
GET /api/personnages
# Liste des personnages de l'utilisateur (AUTH)

GET /api/personnages/:id
# Détails d'un personnage (AUTH)

POST /api/personnages
Content-Type: application/json

{
  "nom": "Gandalf",
  "systeme": "monsterhearts",
  "donnees": {
    "classe": "Mage",
    "niveau": 5
  }
}
```

```http
PUT /api/personnages/:id
Content-Type: application/json

{
  "nom": "Gandalf le Gris",
  "donnees": {
    "classe": "Mage",
    "niveau": 6
  }
}
```

```http
DELETE /api/personnages/:id
# Suppression d'un personnage (AUTH)
```

#### Actions spéciales
```http
POST /api/personnages/:id/dupliquer
# Dupliquer un personnage (AUTH)

POST /api/personnages/brouillon
Content-Type: application/json

{
  "donnees": {},
  "systeme": "monsterhearts"
}

GET /api/personnages/rechercher?q=Gandalf&systeme=monsterhearts
# Recherche de personnages (AUTH)

POST /api/personnages/:id/pdf
# Générer un PDF depuis un personnage (AUTH)
```

#### Templates publics
```http
GET /api/personnages/template/monsterhearts
# Obtenir le template d'un système (PUBLIC)
```

### PDFs (`/api/pdfs/*`)

#### Gestion des PDFs
```http
GET /api/pdfs
# Liste des PDFs de l'utilisateur (AUTH)

GET /api/pdfs/:id
# Détails d'un PDF (AUTH)

DELETE /api/pdfs/:id
# Suppression d'un PDF (AUTH)
```

#### Génération
```http
POST /api/pdfs/generer
Content-Type: application/json

{
  "personnageId": 123,
  "template": "fiche-personnage"
}

POST /api/pdfs/document-generique/monsterhearts
Content-Type: application/json

{
  "titre": "Mon document",
  "contenu": "Contenu du document",
  "typeDocument": "document-generique"
}

POST /api/pdfs/document-generique-anonyme/monsterhearts
Content-Type: application/json

{
  "token": "anonymous_token",
  "titre": "Document anonyme",
  "contenu": "Contenu"
}
```

#### Token anonyme
```http
POST /api/auth/token-anonyme
# Génère un token pour utilisateur anonyme
```

#### Partage et téléchargement
```http
GET /api/pdfs/:id/telecharger
# Téléchargement direct (AUTH ou token)

POST /api/pdfs/:id/partager
Content-Type: application/json

{
  "duree": 24,
  "motDePasse": "optional"
}

GET /api/pdfs/partage/:token
# Accès public via token de partage
```

#### Utilitaires
```http
GET /api/pdfs/types
# Liste des types de documents disponibles (PUBLIC)

GET /api/pdfs/templates/monsterhearts
# Templates disponibles pour un système (AUTH)

GET /api/pdfs/statistiques
# Statistiques des PDFs utilisateur (AUTH)
```

### Oracles (`/api/oracles/*`)

#### Consultation publique
```http
GET /api/oracles
# Liste des oracles disponibles (PUBLIC)

GET /api/oracles/search?q=monstre&systeme=monsterhearts
# Recherche d'oracles (PUBLIC)

GET /api/oracles/:id
# Détails d'un oracle (PUBLIC)

POST /api/oracles/:id/draw
Content-Type: application/json

{
  "nombre": 1,
  "options": {}
}
```

#### Administration (ADMIN)
```http
POST /api/admin/oracles
Content-Type: application/json

{
  "nom": "Oracle des monstres",
  "description": "Générateur de monstres",
  "systeme": "monsterhearts",
  "items": []
}

PUT /api/admin/oracles/:id
DELETE /api/admin/oracles/:id
POST /api/admin/oracles/:id/clone
```

#### Import/Export (ADMIN)
```http
POST /api/admin/oracles/import
Content-Type: multipart/form-data

file: oracle.json (ou oracle.csv)

GET /api/admin/oracles/:id/export/json
GET /api/admin/oracles/:id/export/csv
```

### Administration (`/api/admin/*`)

#### Statistiques et monitoring
```http
GET /api/admin/statistiques
# Statistiques globales de l'application (ADMIN)

GET /api/admin/activite-recente
# Activité récente des utilisateurs (ADMIN)

GET /api/admin/logs?level=error&limit=100
# Consultation des logs (ADMIN)
```

#### Gestion utilisateurs
```http
GET /api/admin/utilisateurs
# Liste des utilisateurs (ADMIN)

DELETE /api/admin/utilisateurs/:id
# Suppression d'un utilisateur (ADMIN)

PUT /api/admin/utilisateurs/:id/role
Content-Type: application/json

{
  "role": "PREMIUM"
}
```

#### Maintenance
```http
POST /api/admin/cleanup-tokens
# Nettoyage des tokens expirés (ADMIN)

POST /api/admin/backup
# Créer une sauvegarde (ADMIN)
```

### Page d'accueil (`/api/home/*`)

#### Contenu public
```http
GET /api/home/donnees
# Données pour la page d'accueil (PUBLIC)

GET /api/actualites
# Liste des actualités (PUBLIC)

GET /api/temoignages
# Liste des témoignages approuvés (PUBLIC)

POST /api/temoignages
Content-Type: application/json

{
  "nom": "Jean Dupont",
  "message": "Excellent outil !",
  "note": 5
}
```

#### Newsletter
```http
POST /api/newsletter/inscription
Content-Type: application/json

{
  "email": "user@example.com",
  "nom": "Jean Dupont"
}
```

## Exemples pratiques

### Workflow utilisateur standard
1. **Inscription** : `POST /api/auth/inscription`
2. **Connexion** : `POST /api/auth/connexion`
3. **Créer personnage** : `POST /api/personnages`
4. **Générer PDF** : `POST /api/pdfs/generer`
5. **Télécharger** : `GET /api/pdfs/:id/telecharger`

### Workflow anonyme
1. **Token anonyme** : `POST /api/auth/token-anonyme`
2. **Document générique** : `POST /api/pdfs/document-generique-anonyme/:systeme`
3. **Vérifier statut** : `GET /api/pdfs/:id/statut`
4. **Télécharger** : `GET /api/pdfs/:id/telecharger`

### Utilisation avec curl
```bash
# Connexion
curl -X POST http://localhost:3000/api/auth/connexion \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","motDePasse":"password"}' \
  -c cookies.txt

# Utiliser la session
curl -X GET http://localhost:3000/api/personnages \
  -b cookies.txt
```

### Utilisation avec fetch (JavaScript)
```javascript
// Configuration automatique des cookies
const response = await fetch('/api/auth/connexion', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include', // Important pour les cookies
  body: JSON.stringify({
    email: 'user@test.com',
    motDePasse: 'password'
  })
});

// Requête authentifiée
const personnages = await fetch('/api/personnages', {
  credentials: 'include'
});
```

## Rate Limiting

L'API implémente une limitation des requêtes :
- **Window** : 15 minutes par défaut
- **Limite** : 100 requêtes par fenêtre
- **Réponse** : HTTP 429 Too Many Requests

```json
{
  "succes": false,
  "message": "Trop de requêtes, réessayez plus tard",
  "type": "rate_limit",
  "retryAfter": 900
}
```

## Environnements

### Développement
- Base URL : `http://localhost:3000/api`
- CORS activé
- Logs détaillés
- Rate limiting souple

### Production
- HTTPS obligatoire
- CORS restreint
- Logs minimaux
- Rate limiting strict
- Monitoring actif

Pour plus d'informations techniques, voir :
- `src/routes/api.js` - Définitions des routes
- `src/controllers/` - Logique des endpoints
- `documentation/ARCHITECTURE/` - Architecture détaillée