# Scripts d'administration

Ce dossier contient des scripts utilitaires pour administrer l'application.

## 📧 Services d'emails

### `test-email.js`
Teste le service d'envoi d'emails avec Resend.
```bash
node test-email.js [email-test]
```

## 🎲 Gestion des oracles

### `create-oracle-tables.js`
Crée les tables d'oracles en base de données (à exécuter une seule fois).
```bash
node scripts/create-oracle-tables.js
```

### `inject-oracle-direct.js`
Injecte un oracle depuis un fichier JSON.
```bash
node scripts/inject-oracle-direct.js oracle.json
```

### `inject-all-monsterhearts.js`
Injecte tous les oracles Monsterhearts d'un coup.
```bash
node scripts/inject-all-monsterhearts.js
```

### `injecter-oracle.js`
Script d'injection avancé avec modes interactif, templates et validation.
```bash
# Mode interactif
node scripts/injecter-oracle.js

# Depuis fichier
node scripts/injecter-oracle.js --fichier=oracle.json

# Template pour un jeu
node scripts/injecter-oracle.js --jeu=monsterhearts

# Aide
node scripts/injecter-oracle.js --help
```

## 🗄️ Base de données

### `migrate-db.js`
Gestionnaire de migrations de base de données.
```bash
# Toutes les migrations
node scripts/migrate-db.js

# Oracles uniquement
node scripts/migrate-db.js oracles

# Vérifier l'état
node scripts/migrate-db.js check

# Aide
node scripts/migrate-db.js help
```

## 🚀 Démarrage rapide

Pour configurer un nouvel environnement avec les oracles :

```bash
# 1. Créer les tables
node scripts/create-oracle-tables.js

# 2. Injecter les oracles Monsterhearts
node scripts/inject-all-monsterhearts.js

# 3. Tester les emails (optionnel)
node test-email.js votre@email.com
```

## 📁 Format des fichiers JSON

Structure attendue pour les oracles :
```json
{
  "oracle": {
    "name": "Nom de l'oracle",
    "description": "Description détaillée",
    "premium_required": false,
    "is_active": true
  },
  "items": [
    {
      "value": "Résultat du tirage",
      "weight": 10,
      "metadata": {
        "type": "exemple",
        "intensité": "forte"
      },
      "is_active": true
    }
  ]
}
```

## ⚠️ Prérequis

- Node.js 18+
- Variables d'environnement configurées (`.env.local`)
- Base de données PostgreSQL accessible
- Tables d'oracles créées (`create-oracle-tables.js`)

## 🛠️ Dépannage

### "Table oracles does not exist"
```bash
node scripts/create-oracle-tables.js
```

### "BaseModel column errors"
Utilisez `inject-oracle-direct.js` au lieu de `injecter-oracle.js`

### Emails ne s'envoient pas
Vérifiez `RESEND_API_KEY` dans `.env.local`

---

*Documentation scripts mise à jour le 22/07/2025*