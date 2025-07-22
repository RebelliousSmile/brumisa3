# Documentation - Système d'Oracles

## Vue d'ensemble

Le système d'oracles permet de créer des tables de tirages aléatoires pondérés pour enrichir les parties de jeu de rôle. Chaque oracle contient une collection d'éléments avec des poids différents qui influencent leur probabilité d'apparition lors des tirages.

## Fonctionnalités actuelles

### 🎲 Pour les utilisateurs

**Consultation des oracles :**
- Liste des oracles disponibles sur `/oracles`
- Oracles filtrés par système de jeu : `/oracles/systeme/monsterhearts`
- Page de détail pour chaque oracle avec interface de tirage

**Tirages interactifs :**
- Tirage d'1 à 10 éléments simultanément
- Mode avec remise (doublons possibles) ou sans remise (éléments uniques)
- Affichage des résultats avec métadonnées
- Actions rapides (1, 3, 5 éléments)

**Contrôle d'accès :**
- Oracles gratuits : Accessibles à tous
- Oracles premium : Réservés aux utilisateurs premium/admin
- Utilisateurs non-connectés : Accès limité aux oracles gratuits

### 🛠️ Pour les administrateurs

**Gestion via scripts :**
- Import d'oracles depuis fichiers JSON
- Scripts de création des tables
- Scripts de migration des données

**Interface en cours de développement :**
- Console d'administration prévue
- Édition des oracles existants
- Statistiques d'usage

## Structure des données

### Table `oracles`
```sql
CREATE TABLE oracles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  game_system VARCHAR(50), -- Code du système de jeu
  premium_required BOOLEAN DEFAULT FALSE,
  total_weight INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES utilisateurs(id)
);
```

### Table `oracle_items`
```sql
CREATE TABLE oracle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oracle_id UUID NOT NULL REFERENCES oracles(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 1 CHECK (weight >= 0),
  metadata JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table `oracle_draws` (historique)
```sql
CREATE TABLE oracle_draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oracle_id UUID NOT NULL REFERENCES oracles(id),
  user_id INTEGER REFERENCES utilisateurs(id),
  session_id VARCHAR(255),
  results JSONB NOT NULL,
  draw_count INTEGER NOT NULL DEFAULT 1,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Oracles disponibles

### 🧛‍♀️ Monsterhearts (4 oracles)
- **Révélations** : Secrets qui éclatent au grand jour
- **Relations** : Complications romantiques et sociales  
- **Monstruosités** : Manifestations de votre nature
- **Événements** : Incidents au lycée et en ville

*Total : 68 éléments pondérés*

### 🔮 Autres systèmes
- Structure prête pour Engrenages, Metro 2033 et Mist Engine
- 3 oracles génériques non classés disponibles

## Utilisation

### 🎯 Accès direct
```
/oracles                           → Tous les oracles
/oracles/systeme/monsterhearts     → Oracles Monsterhearts uniquement
/oracles/[id]                      → Détail et tirage d'un oracle spécifique
```

### 🎲 Interface de tirage
1. **Paramétrage** : Choisir le nombre d'éléments (1-10)
2. **Mode** : Avec ou sans remise (doublons)
3. **Tirage** : Clic sur "Tirer au Sort"
4. **Résultats** : Affichage avec métadonnées et possibilité de refaire

### 📊 Exemple de réponse API
```json
{
  "succes": true,
  "donnees": {
    "results": [
      {
        "id": "uuid",
        "value": "Triangle amoureux inattendu se forme",
        "weight": 18,
        "metadata": {
          "type": "triangle",
          "intensité": "forte"
        }
      }
    ]
  }
}
```

## Scripts d'administration

### 🏗️ Installation initiale
```bash
# 1. Créer les tables
node scripts/create-oracle-tables.js

# 2. Ajouter la colonne game_system  
node scripts/add-game-system-column.js

# 3. Injecter les oracles Monsterhearts
node scripts/inject-all-monsterhearts.js

# 4. Migrer avec systèmes de jeu
node scripts/migrate-existing-oracles.js
```

### 📥 Import d'oracles
```bash
# Oracle unique depuis JSON
node scripts/inject-oracle-direct.js oracle.json

# Mode interactif
node scripts/injecter-oracle.js

# Depuis fichier  
node scripts/injecter-oracle.js --fichier=oracle.json
```

### 📁 Format JSON attendu
```json
{
  "oracle": {
    "name": "Relations - Monsterhearts",
    "description": "Complications romantiques et sociales",
    "premium_required": false,
    "is_active": true
  },
  "items": [
    {
      "value": "Triangle amoureux inattendu se forme",
      "weight": 18,
      "metadata": {
        "type": "triangle",
        "intensité": "forte"
      },
      "is_active": true
    }
  ]
}
```

## Algorithme de tirage

### 🎯 Tirage pondéré
1. Calculer le poids total des éléments actifs
2. Générer un nombre aléatoire entre 0 et le poids total
3. Parcourir les éléments en cumulant leurs poids
4. Sélectionner l'élément quand le cumul dépasse le nombre aléatoire

### 🔄 Mode sans remise
- Créer une copie de la liste d'éléments
- Pour chaque tirage, retirer l'élément sélectionné de la liste
- Recalculer le poids total pour les tirages suivants

## Intégration avec les systèmes de jeu

### 🎮 Pages systèmes
- Chaque page système (`/monsterhearts`, `/engrenages`, etc.) a sa section oracles
- Lien direct vers les oracles filtrés par système
- Description des types d'oracles disponibles

### 🏷️ Classification
- `monsterhearts` : Oracles pour adolescents monstres
- `engrenages` : Oracles steampunk/fantasy (à venir)
- `metro2033` : Oracles post-apocalyptiques (à venir) 
- `mistengine` : Oracles génériques (à venir)
- `NULL` : Oracles non classés

## Permissions et sécurité

### 👤 Niveaux d'accès
- **Visiteur** : Oracles gratuits uniquement, tirages limités
- **Utilisateur connecté** : Oracles gratuits, historique personnel
- **Premium** : Tous les oracles, fonctionnalités avancées
- **Admin** : Gestion complète, statistiques, création d'oracles

### 🔒 Contrôles
- Validation des paramètres de tirage (1-10 éléments)
- Vérification des permissions par oracle
- Limitation du taux de requêtes (à implémenter)
- Historique des tirages pour audit

## Développements futurs

### 🚧 En cours
- Interface d'administration web
- Système de newsletter avec confirmation email
- Gestion d'erreurs avancée pour les emails

### 📋 Planifié  
- Oracles pour les autres systèmes de jeu
- Filtres avancés sur les métadonnées
- Statistiques d'usage détaillées
- Import/export d'oracles via interface web
- API publique pour développeurs tiers

---

*Documentation mise à jour le 22/07/2025 - Correspond à l'implémentation actuelle*