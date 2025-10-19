# Authentification et Gestion des Sessions

## Vue d'Ensemble
Système d'authentification avec email/password et mode guest permettant de jouer immédiatement sans compte. Migration transparente de guest vers compte authentifié pour conserver les données.

## User Stories

### US-010 : Créer un compte utilisateur
**En tant que** Léa (joueuse solo)
**Je veux** créer un compte avec email et mot de passe
**Afin de** sauvegarder mes personnages et y accéder depuis n'importe quel appareil

**Contexte** : Léa joue depuis 2 semaines en mode guest et veut sécuriser ses 3 personnages LITM.

**Critères d'acceptation** :
- [ ] Formulaire d'inscription avec email, password, confirmation password
- [ ] Validation email format valide (regex)
- [ ] Validation password minimum 8 caractères
- [ ] Message d'erreur si email déjà utilisé
- [ ] Redirection automatique vers dashboard après inscription
- [ ] Session créée automatiquement (pas de login après signup)

**Exemples** :
```
Léa visite /signup
- Remplit email: lea.graphiste@example.com
- Remplit password: MistEngine2025!
- Confirme password: MistEngine2025!
- Clique "Créer mon compte"
→ Redirection vers /playspaces avec message "Bienvenue, Léa !"
```

### US-011 : Se connecter avec un compte existant
**En tant que** Léa
**Je veux** me connecter avec mon email et mot de passe
**Afin de** retrouver mes personnages sauvegardés

**Contexte** : Léa revient 3 jours après sa dernière session.

**Critères d'acceptation** :
- [ ] Formulaire de login avec email et password
- [ ] Message d'erreur clair si credentials invalides
- [ ] Option "Se souvenir de moi" (session 30 jours)
- [ ] Redirection vers dernière page visitée ou /playspaces
- [ ] Loading state pendant validation (< 1s)

**Exemples** :
```
Léa visite /login
- Email: lea.graphiste@example.com
- Password: MistEngine2025!
- Coche "Se souvenir de moi"
- Clique "Connexion"
→ Session créée pour 30 jours
→ Redirection vers /playspaces/workspace-aria
```

### US-012 : Jouer en mode guest
**En tant que** Léa (nouvelle utilisatrice)
**Je veux** commencer à créer des personnages sans créer de compte
**Afin de** tester l'application avant de m'engager

**Contexte** : Léa découvre Brumisa3 via un lien Reddit et veut essayer immédiatement.

**Critères d'acceptation** :
- [ ] Bouton "Commencer sans compte" visible sur page d'accueil
- [ ] Pas de formulaire requis
- [ ] Accès immédiat à la création de playspace
- [ ] Données sauvegardées dans localStorage
- [ ] Limite de 3 playspaces en mode guest
- [ ] Banner sticky "Vous êtes en mode invité" avec CTA "Créer un compte"

**Exemples** :
```
Léa visite /
- Voit "Commencer sans compte" ou "Créer un compte"
- Clique "Commencer sans compte"
→ Redirection vers /playspaces/new
→ Banner: "Mode invité - Créez un compte pour sauvegarder vos données"
```

### US-013 : Migrer de guest vers compte authentifié
**En tant que** Léa (utilisatrice guest avec données)
**Je veux** créer un compte en conservant mes personnages existants
**Afin de** ne pas perdre mon travail

**Contexte** : Léa a créé 3 personnages en mode guest et veut sauvegarder définitivement.

**Critères d'acceptation** :
- [ ] Détection automatique de données localStorage au signup
- [ ] Modal de confirmation "Vous avez 3 playspaces en mode invité. Les migrer ?"
- [ ] Migration automatique lors de la création du compte
- [ ] Pas de perte de données (playspaces, characters, theme cards, etc.)
- [ ] Message de succès "3 playspaces migrés avec succès"
- [ ] Nettoyage automatique localStorage après migration

**Exemples** :
```
Léa (guest avec 3 playspaces) visite /signup
- Remplit formulaire
- Clique "Créer mon compte"
→ Modal: "Migrer vos 3 playspaces existants ?"
→ Clique "Oui, migrer"
→ Migration en cours (< 2s)
→ Message: "Compte créé ! 3 playspaces migrés."
→ Redirection vers /playspaces
```

### US-014 : Se déconnecter
**En tant que** Léa
**Je veux** me déconnecter de ma session
**Afin de** sécuriser mon compte sur un ordinateur partagé

**Contexte** : Léa utilise l'ordinateur de son université.

**Critères d'acceptation** :
- [ ] Bouton "Déconnexion" visible dans menu utilisateur
- [ ] Destruction de la session côté serveur
- [ ] Redirection vers page d'accueil /
- [ ] Message de confirmation "Vous êtes déconnecté"
- [ ] Données sensibles effacées du browser (pas de cache)

**Exemples** :
```
Léa clique sur avatar utilisateur (header)
- Menu dropdown avec "Déconnexion"
- Clique "Déconnexion"
→ Redirection vers / avec message "À bientôt !"
```

## Règles Métier

### Authentification
1. **Email unique obligatoire** : Un email ne peut être associé qu'à un seul compte (contrainte DB unique)
2. **Password sécurisé** : Minimum 8 caractères, hashé avec bcrypt (cost factor 12)
3. **Session expiration** :
   - Par défaut : 7 jours
   - Avec "Se souvenir de moi" : 30 jours
   - Guest : session browser uniquement (localStorage)
4. **Email non vérifiable en MVP** : Pas de confirmation email (v1.1), compte actif immédiatement

### Mode Guest
1. **Limitation playspaces** : Maximum 3 playspaces en mode guest
2. **Données volatiles** : Stockage localStorage uniquement, perte si cache effacé
3. **Pas de limite personnages** : En mode guest, nombre illimité de personnages par playspace
4. **Identification guest** : Session ID généré côté client (UUID v4)

### Migration Guest → Authentifié
1. **Migration automatique** : Proposée au signup si données localStorage détectées
2. **Conservation totale** : Tous les playspaces, personnages, theme cards, hero cards, trackers migrés
3. **Timestamps préservés** : Dates de création/modification conservées
4. **Nettoyage localStorage** : Effacement automatique après migration réussie
5. **Rollback si échec** : Conservation localStorage si migration échoue

### Sécurité
1. **Rate limiting** : Maximum 5 tentatives de login par IP/15 minutes
2. **Session hijacking** : Tokens JWT avec signature HMAC SHA-256
3. **Pas de récupération password en MVP** : Fonctionnalité reportée en v1.1
4. **HTTPS obligatoire** : En production, redirection automatique HTTP → HTTPS

## Interface Utilisateur

### Page d'accueil (/)
```
+--------------------------------------------------+
|  BRUMISA3 - L'outil officieux du Mist Engine     |
+--------------------------------------------------+
|                                                  |
|  [Logo Brumisa3]                                 |
|                                                  |
|  Créez des personnages immersifs pour           |
|  Legends in the Mist et City of Mist            |
|                                                  |
|  [Créer un compte]  [Se connecter]               |
|                                                  |
|  [Commencer sans compte] (mode invité)           |
|                                                  |
+--------------------------------------------------+
```

### Formulaire Signup (/signup)
```
Créer un compte

Email *
[________________]

Mot de passe * (minimum 8 caractères)
[________________]

Confirmer le mot de passe *
[________________]

[Créer mon compte]

Déjà un compte ? [Se connecter]
```

### Formulaire Login (/login)
```
Connexion

Email *
[________________]

Mot de passe *
[________________]

[ ] Se souvenir de moi (30 jours)

[Se connecter]

Pas encore de compte ? [Créer un compte]
[Commencer sans compte]
```

### Banner Mode Guest
```
+--------------------------------------------------+
| i  Vous êtes en mode invité (3 playspaces max)   |
|    [Créer un compte pour sauvegarder]       [X]  |
+--------------------------------------------------+
```

### Modal Migration
```
+----------------------------------+
|  Migrer vos données ?            |
+----------------------------------+
|                                  |
|  Vous avez 3 playspaces en mode  |
|  invité. Voulez-vous les migrer  |
|  vers votre nouveau compte ?     |
|                                  |
|  [Annuler]  [Oui, migrer]        |
+----------------------------------+
```

## Critères d'Acceptation Globaux

### Fonctionnel
- [ ] Création de compte avec email/password fonctionne
- [ ] Login/Logout fonctionnent avec session persistante
- [ ] Mode guest permet de créer jusqu'à 3 playspaces
- [ ] Migration guest → authentifié conserve toutes les données
- [ ] Rate limiting empêche brute force

### Performance
- [ ] Signup : < 1s (création compte + session)
- [ ] Login : < 500ms (validation credentials)
- [ ] Migration : < 2s (jusqu'à 3 playspaces avec données complètes)
- [ ] Logout : < 200ms (destruction session)

### UX
- [ ] Messages d'erreur clairs et actionnables
- [ ] Loading states visuels pendant opérations asynchrones
- [ ] Validation en temps réel (email format, password strength)
- [ ] Redirections logiques après actions (signup → playspaces, login → dernière page)
- [ ] Banner mode guest visible mais non intrusive

### Technique
- [ ] Passwords hashés avec bcrypt (cost 12)
- [ ] Sessions JWT avec expiration configurable
- [ ] Validation Zod côté serveur (email, password)
- [ ] localStorage pour mode guest (fallback sessionStorage)
- [ ] Prisma User model avec contrainte unique sur email

## Exemples Concrets

### Parcours Léa : Guest → Authentifié (Timeline)

**Jour 1 - 14h30** : Découverte
```
Léa voit un post Reddit sur LITM
→ Clique sur lien Brumisa3
→ Page d'accueil : "Commencer sans compte"
→ Clique → Crée playspace "Workspace Aria"
→ Crée personnage "Aria the Mist Weaver"
→ localStorage: { guestId: "uuid-123", playspaces: [...] }
```

**Jour 1 - 16h45** : Suite création
```
Léa ajoute 2 Theme Cards à Aria
→ Crée 2e personnage "Kael Shadowblade"
→ localStorage mis à jour automatiquement
```

**Jour 3 - 20h00** : Décision de migrer
```
Léa revient sur Brumisa3
→ Banner: "Mode invité - Créer un compte"
→ Clique "Créer un compte"
→ /signup avec détection localStorage
→ Remplit formulaire
→ Modal: "Migrer vos 1 playspace et 2 personnages ?"
→ Clique "Oui, migrer"
→ Migration en 1.2s
→ Message: "Compte créé ! 1 playspace migré."
→ localStorage nettoyé
→ Redirection /playspaces/workspace-aria
```

**Jour 5 - 10h00** : Login depuis autre appareil
```
Léa sur ordinateur université
→ /login
→ Email + password
→ Coche "Se souvenir de moi"
→ Login en 320ms
→ Redirection /playspaces
→ Retrouve "Workspace Aria" avec Aria et Kael
```

### Parcours Marc : Création directe avec compte

**Jour 1 - 9h00** : Inscription
```
Marc découvre Brumisa3 via Twitter
→ Sait qu'il veut un compte (utilise déjà VTT)
→ /signup
→ Email: marc.dev@example.com
→ Password: SecurePass123!
→ Compte créé en 850ms
→ Session 7 jours par défaut
→ Redirection /playspaces (vide)
```

## Contraintes Techniques

### Stack
- **Auth Provider** : @sidebase/nuxt-auth v0.6+
- **Session Storage** : JWT avec secret ENV (AUTH_SECRET)
- **Password Hashing** : bcrypt avec cost factor 12
- **Validation** : Zod schemas (email, password)
- **Guest Storage** : localStorage (fallback sessionStorage)

### Prisma User Model (suggestion)
```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  playspaces    Playspace[]

  @@index([email])
}
```

### API Routes
- `POST /api/auth/signup` : Création compte + migration guest optionnelle
- `POST /api/auth/login` : Validation credentials + session JWT
- `POST /api/auth/logout` : Destruction session
- `GET /api/auth/session` : Récupération session active
- `POST /api/auth/migrate` : Migration guest → authentifié (appelé par signup)

### Variables d'Environnement
```env
AUTH_SECRET=generated-secret-key-256-bits
AUTH_ORIGIN=http://localhost:3000
SESSION_MAX_AGE=604800 # 7 jours en secondes
BCRYPT_COST_FACTOR=12
```

### Validation Zod (exemple)
```typescript
const signupSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});
```

## Scope MVP vs Versions Futures

### MVP v1.0
- Authentification email/password
- Mode guest avec localStorage
- Migration automatique guest → authentifié
- Sessions JWT (7 ou 30 jours)
- Rate limiting basique (5 tentatives/15min)

### v1.1
- Récupération mot de passe par email
- Vérification email obligatoire
- OAuth2 providers (Google, Discord)
- 2FA optionnel

### v2.0+
- SSO pour équipes/organisations
- Gestion permissions avancées
- Audit logs des connexions
- Sessions multi-appareils avec révocation

---
**Date** : 2025-01-19
**Version** : 1.0
**Statut** : Validé
**Priorité** : P0 (MVP)