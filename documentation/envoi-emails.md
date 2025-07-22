# Service d'envoi d'emails avec Resend

## Vue d'ensemble

L'application utilise **Resend** comme service d'envoi d'emails pour toutes les communications automatisées avec les utilisateurs.

## Configuration

### Variables d'environnement
```env
# Service d'emails Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@votre-domaine.com
RESEND_FROM_NAME=Générateur PDF JDR
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

#### Confirmation d'inscription *(à implémenter)*
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
- **Template** : `emails/newsletter-confirmation.ejs`
- **Variables** :
  - `email` : Email de l'inscrit
  - `lien_desinscription` : Token de désinscription

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
│   └── EmailService.js           # Service principal d'envoi
├── templates/
│   └── emails/                   # Templates EJS pour les emails
│       ├── mot-de-passe-oublie.ejs
│       ├── bienvenue.ejs
│       ├── newsletter-confirmation.ejs
│       └── layouts/
│           └── email-base.ejs    # Layout de base pour tous les emails
└── utils/
    └── emailTemplates.js         # Utilitaires et helpers pour les templates
```

### Service EmailService.js

```javascript
class EmailService {
    constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY);
        this.fromEmail = process.env.RESEND_FROM_EMAIL;
        this.fromName = process.env.RESEND_FROM_NAME;
    }

    // Méthodes principales
    async envoyerMotDePasseOublie(email, nom, token)
    async envoyerBienvenue(email, nom)
    async envoyerNewsletterConfirmation(email, token)
    async envoyerNotificationAdmin(sujet, contenu)
}
```

## Templates d'emails

### Layout de base (`layouts/email-base.ejs`)
- Design responsive
- Couleurs cohérentes avec l'application
- Header/footer standard
- Support mode sombre

### Template mot de passe oublié
```html
<h1>Récupération de mot de passe</h1>
<p>Bonjour <%= nom %>,</p>
<p>Vous avez demandé la récupération de votre mot de passe...</p>
<a href="<%= lien_recuperation %>" class="btn-primary">Réinitialiser mon mot de passe</a>
<p>Ce lien expire dans <%= duree_validite %>.</p>
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