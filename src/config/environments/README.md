# Configurations d'environnement

Ce dossier contient les templates de configuration pour différents environnements.

## Utilisation

1. **Développement** : Copier `development.example.env` en `.env.local` à la racine du projet
2. **Production** : Copier `production.example.env` et configurer les variables serveur
3. **Tests** : Copier `test.example.env` en `.env.test` à la racine du projet

## Variables critiques en production

⚠️ **OBLIGATOIRE** - Ces variables DOIVENT être changées :
- `SESSION_SECRET` : Clé de chiffrement sessions (min 32 caractères)
- `CODE_PREMIUM` / `CODE_ADMIN` : Codes d'accès application
- `DATABASE_URL` : Connexion PostgreSQL sécurisée
- `RESEND_API_KEY` : Clé API Resend pour emails

## Structure des variables

- **Server** : PORT, HOST, NODE_ENV
- **Database** : POSTGRES_* ou DATABASE_URL
- **Security** : SESSION_SECRET, codes d'accès, rate limiting
- **Directories** : Chemins des répertoires de données
- **Logging** : Niveau et destination des logs
- **Features** : PDF, upload, API timeouts
