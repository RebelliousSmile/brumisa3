# Service d'envoi d'emails avec Resend

## Vue d'ensemble

L'application utilise **Resend** comme service d'envoi d'emails pour toutes les communications automatisées avec les utilisateurs. Le système est basé sur une architecture modulaire avec **EmailService** (envoi) et **EmailTemplate** (rendu des templates).

## Configuration

### Variables d'environnement
```env
# Service d'emails Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@votre-domaine.com
RESEND_FROM_NAME=Générateur PDF JDR

# Mode développement
NODE_ENV=development
FORCE_REAL_EMAILS=true  # Force l'envoi réel même en développement
```

## Services utilisant l'envoi d'emails

### 1. **Authentification** (`AuthentificationController`)

#### Récupération de mot de passe
- **Route** : `POST /api/auth/mot-de-passe-oublie`
- **Template** : `emails/mot-de-passe-oublie.ejs`
- **Variables** :
  - `nom` : Nom de l'utilisateur
  - `lien_recuperation` : URL complète avec token
  - `duree_validite` : Durée de validité du lien (24h)

#### Confirmation d'inscription
- **Route** : `POST /api/auth/inscription`
- **Template** : `emails/bienvenue.ejs`
- **Variables** :
  - `nom` : Nom de l'utilisateur
  - `lien_connexion` : URL de connexion

#### Notification changement mot de passe *(à implémenter)*
- **Template** : `emails/mot-de-passe-modifie.ejs`
- **Variables** :
  - `nom` : Nom de l'utilisateur
  - `date_modification` : Date/heure du changement
  - `ip` : Adresse IP de la modification

### 2. **Newsletter** (`HomeController`)

#### Inscription newsletter
- **Route** : `POST /api/newsletter/inscription`
- **Template** : `emails/newsletter.ejs`
- **Variables** :
  - `nom` : Nom de l'utilisateur
  - `email` : Email de l'inscrit
  - `lien_confirmation` : Lien de confirmation d'inscription

#### Envoi newsletter *(à implémenter)*
- **Template** : `emails/newsletter.ejs`
- **Variables** :
  - `titre` : Titre de la newsletter
  - `contenu` : Contenu HTML
  - `lien_desinscription` : Lien de désinscription personnalisé

### 3. **Notifications admin** *(à implémenter)*

#### Nouveau compte utilisateur
- **Template** : `emails/admin-nouveau-compte.ejs`
- **Variables** :
  - `nom_utilisateur` : Nom du nouvel utilisateur
  - `email_utilisateur` : Email du nouvel utilisateur
  - `date_creation` : Date de création

#### Erreur système critique
- **Template** : `emails/admin-erreur-critique.ejs`
- **Variables** :
  - `type_erreur` : Type d'erreur
  - `message` : Message d'erreur
  - `stack_trace` : Trace d'exécution
  - `timestamp` : Date/heure de l'erreur

## Architecture du service

### Structure des dossiers
```
src/
├── services/
│   ├── EmailService.js           # Service principal d'envoi
│   └── EmailTemplate.js          # Service de rendu des templates avec helpers
├── templates/
│   └── emails/                   # Templates EJS pour les emails
│       ├── test-configuration.ejs
│       ├── mot-de-passe-oublie.ejs
│       ├── bienvenue.ejs
│       ├── newsletter.ejs
│       └── layouts/
│           └── email-base.ejs    # Layout de base pour tous les emails
└── scripts/
    ├── test-email-simple.js      # Tests d'envoi basiques
    ├── debug-resend.cjs          # Diagnostic complet Resend
    └── test-templates-helpers.js # Test des nouveaux templates
```

### Service EmailService.js

```javascript
class EmailService extends BaseService {
    constructor() {
        super('EmailService');
        
        // Configuration
        this.apiKey = process.env.RESEND_API_KEY;
        this.fromEmail = process.env.RESEND_FROM_EMAIL;
        this.fromName = process.env.RESEND_FROM_NAME;
        this.isDevelopment = process.env.NODE_ENV === 'development';
        this.forceRealEmails = process.env.FORCE_REAL_EMAILS === 'true';
        
        // Services
        this.emailTemplate = new EmailTemplate();
        this.resend = new Resend(this.apiKey);
    }

    // Méthodes principales
    async envoyerMotDePasseOublie(email, nom, token)
    async envoyerBienvenue(email, nom)
    async envoyerNewsletter(email, nom, token)
    async envoyer({ to, subject, template, variables })
    async testerConfiguration(testEmail)
}
```

### Service EmailTemplate.js

```javascript
class EmailTemplate extends BaseService {
    constructor() {
        super('EmailTemplate');
        this.templatesPath = path.join(process.cwd(), 'src', 'templates', 'emails');
    }

    // Variables communes automatiques
    getCommonVariables() {
        return {
            site_name: process.env.RESEND_FROM_NAME,
            site_url: process.env.BASE_URL,
            year: new Date().getFullYear(),
            current_date: new Date().toLocaleDateString('fr-FR'),
            // ...
        };
    }

    // Helpers pour les templates
    getHelpers() {
        return {
            button: (text, url, style) => { /* Bouton stylé */ },
            alert: (message, type) => { /* Alerte colorée */ },
            formatDate: (date) => { /* Formatage de date */ }
        };
    }

    // Rendu avec layout
    async render(templateName, variables, layout = 'email-base')
}
```

## Templates d'emails

### Layout de base (`layouts/email-base.ejs`)
- Design responsive
- Couleurs cohérentes avec l'application  
- Header/footer standard
- Support mode sombre
- Variables communes injectées automatiquement

### Helpers disponibles dans tous les templates

#### Helper `button(text, url, style)`
Génère un bouton stylé avec différents styles :
```ejs
<%- button('Se connecter', lien_connexion, 'primary') %>
<%- button('Annuler', '#', 'secondary') %>
<%- button('Supprimer', '#', 'danger') %>
<%- button('Valider', '#', 'success') %>
```

#### Helper `alert(message, type)`
Génère une alerte colorée :
```ejs
<%- alert('Votre compte a été créé avec succès !', 'success') %>
<%- alert('Attention, ce lien expire bientôt.', 'warning') %>
<%- alert('Une erreur s\'est produite.', 'error') %>
<%- alert('Information importante à retenir.', 'info') %>
```

#### Helper `formatDate(date)`
Formate une date en français :
```ejs
<%= formatDate(current_date) %> <!-- 22/07/2025 -->
<%= formatDate(new Date()) %> <!-- Date actuelle -->
```

### Variables communes automatiques
Disponibles dans tous les templates :
- `site_name` : Nom du site
- `site_url` : URL de base
- `year` : Année actuelle
- `current_date` : Date actuelle
- `support_email` : Email de support
- `logo_url` : URL du logo

### Templates avec helpers

#### Template mot de passe oublié (moderne)
```ejs
<div style="text-align: center; margin-bottom: 30px;">
    <h1>🔒 Réinitialisation de mot de passe</h1>
</div>

<p>Bonjour <strong><%= nom %></strong>,</p>

<%- alert('🔐 Demande de réinitialisation reçue', 'warning') %>

<div style="text-align: center; margin: 40px 0;">
    <%- button('Réinitialiser mon mot de passe', lien_recuperation, 'danger') %>
</div>

<%- alert(`Ce lien expire dans ${duree_validite}`, 'info') %>
```

#### Template bienvenue (moderne)
```ejs
<div style="text-align: center;">
    <h1>🎉 Bienvenue sur <%= site_name %> !</h1>
</div>

<p>Bonjour <strong><%= nom %></strong>,</p>

<%- alert('🎲 Votre compte a été créé avec succès !', 'success') %>

<div style="text-align: center; margin: 40px 0;">
    <%- button('🎯 Se connecter', lien_connexion, 'primary') %>
</div>
```

## Configuration Resend

### 1. Création du compte Resend
1. S'inscrire sur [resend.com](https://resend.com)
2. Vérifier le domaine d'envoi
3. Générer une API Key

### 2. Configuration DNS
```txt
# Records SPF/DKIM à ajouter dans votre DNS
Type: TXT
Name: @
Value: "v=spf1 include:_spf.resend.com ~all"

Type: CNAME 
Name: resend._domainkey
Value: resend._domainkey.resend.com
```

### 3. Test de configuration
```javascript
// Test d'envoi basique
const testEmail = await emailService.envoyerTest('test@exemple.com');
console.log('Test envoi :', testEmail.success ? 'OK' : 'ERREUR');
```

## Gestion d'erreurs

### Types d'erreurs Resend
- **400** : Données invalides (email malformé, contenu manquant)
- **401** : API Key invalide
- **403** : Domaine non vérifié
- **422** : Limite de taux dépassée
- **500** : Erreur serveur Resend

### Retry et fallback
```javascript
// Retry automatique avec backoff exponentiel
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // ms

// Fallback : log en cas d'échec critique
if (!emailSent) {
    logger.error('Email critique non envoyé', {
        recipient: email,
        template: templateName,
        error: error.message
    });
}
```

## Métriques et monitoring

### Logs d'envoi
```javascript
logger.info('Email envoyé', {
    recipient: email,
    template: templateName,
    resend_id: result.id,
    duration_ms: Date.now() - startTime
});
```

### Webhooks Resend *(optionnel)*
- Endpoint : `POST /api/webhooks/resend`
- Events : delivered, bounced, complained
- Utilisation : tracking des échecs de livraison

## Sécurité

### Protection des données
- Ne jamais logger le contenu complet des emails
- Chiffrement des tokens dans les URLs
- Validation stricte des adresses email

### Anti-spam
- Rate limiting sur les endpoints d'envoi
- Validation CAPTCHA pour les inscriptions publiques
- Liste noire des domaines email suspects

## Performance

### Optimisations
- Templates pré-compilés en cache
- Pool de connexions réutilisables
- Envoi asynchrone en arrière-plan (queue)

### Queue d'envoi *(recommandé pour production)*
```javascript
// Utilisation de Bull Queue pour les envois différés
const emailQueue = new Bull('email', redisConfig);

emailQueue.process('send-email', async (job) => {
    const { template, recipient, variables } = job.data;
    return await emailService.envoyer(template, recipient, variables);
});
```

## Environnements

### Développement
- Emails redirigés vers un compte de test
- Prévisualisation HTML dans les logs
- Mode debug activé

### Production  
- Domaine vérifié obligatoire
- Rate limiting strict
- Monitoring des bounces et complaints

## Migration depuis d'autres services

### Depuis Nodemailer/SMTP
```javascript
// Ancien code Nodemailer
const transporter = nodemailer.createTransporter({...});

// Nouveau code Resend  
const emailService = new EmailService();
```

### Checklist de migration
- [ ] Migrer les templates vers EJS
- [ ] Adapter les variables de templates
- [ ] Configurer le domaine d'envoi
- [ ] Tester tous les types d'emails
- [ ] Mettre à jour les variables d'environnement
- [ ] Monitorer les premiers envois en production

---

*Documentation mise à jour le : [Date actuelle]*
*Version du service : 1.0*