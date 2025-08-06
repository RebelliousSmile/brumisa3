# Oracles Contextuels - Inspiration Pour MJs et Joueurs Solo

## Vision : "Aussi Important que les Documents"

**Principe fondamental :** Les oracles ne sont pas un simple bonus, mais un pilier central de brumisater. Ils fournissent l'inspiration contextuelle nécessaire aux MJs pour l'improvisation et aux joueurs solo pour l'autonomie narrative.

### Promesse aux Utilisateurs
- **Alex (MJ)** : "Récupère l'inspiration dont tu as besoin pour ta partie de ce soir"
- **Sam (joueur solo)** : "Aie les outils narratifs pour mener tes parties en autonomie complète"  
- **Casey (découvreur)** : "Découvre la richesse narrative de ton système JDR favori"

### Intégration avec l'Écosystème brumisater
```
DOCUMENTS ←→ ORACLES
    ↑           ↓
  Créations   Inspiration
  statiques   dynamique
    ↑           ↓
 Sauvegarde   Utilisation
 long terme   immédiate
```

## Fonctionnalités MVP (v1.0) - Oracles Fixes

Le système d'oracles permet de créer des tables de tirages aléatoires pondérés pour enrichir les parties de jeu de rôle. Chaque oracle contient une collection d'éléments avec des poids différents qui influencent leur probabilité d'apparition lors des tirages.

### Accès Mode Anonyme (Crucial MVP)
- **Disponibilité immédiate** : Oracles accessibles sans inscription
- **Intégration création documents** : Tirages pendant remplissage formulaires
- **Usage "sur le pouce"** : Alex peut inspirer sa partie rapidement

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

### 🧛‍♀️ Monsterhearts (4 oracles) - MVP Prioritaire
- **Révélations** : Secrets qui éclatent au grand jour (crucial pour le drama)
- **Relations** : Complications romantiques et sociales (cœur du système)
- **Monstruosités** : Manifestations de votre nature (tension du monstre intérieur)
- **Événements** : Incidents au lycée et en ville (scènes d'ambiance)

*Total : 68 éléments pondérés - Système de référence pour MVP*

### 🔮 Autres systèmes (Post-MVP)
- **Metro 2033** : Dangers du métro, factions, ressources rares (à créer)
- **Engrenages** : Complications nobles, intrigues de cour, inventions (à créer)
- **Mist Engine** : Fronts mystiques, révélations surnaturelles (à créer)  
- **Zombiology** : Complications survie, évolution zombie (à créer)

*Objectif v1.2 : 4-5 oracles par système, 200+ éléments totaux*

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

## Roadmap des Oracles

### 🚀 MVP (v1.0) - Oracles Fixes
**Objectif :** Valider l'importance des oracles dans l'expérience brumisater

#### Fonctionnalités MVP
- **Monsterhearts complet** : 4 oracles avec 68 éléments pondérés
- **Accès anonyme** : Utilisables sans inscription
- **Intégration formulaires** : Bouton "Inspiration" dans création documents
- **Interface simple** : Tirage 1-10 éléments, avec/sans remise
- **Base technique solide** : Architecture prête pour évolution v1.2

#### Critères de Succès MVP
- [ ] **Usage oracles > 50% des sessions** (aussi important que documents)
- [ ] **Alex utilise oracles pendant préparation** (validation MJ)
- [ ] **Sam utilise oracles en jeu solo** (validation joueur solo)
- [ ] **Performance < 2s** pour les tirages
- [ ] **Base solide** pour personnalisation v1.2

### 📈 v1.2 - Oracles Collaboratifs (Système de Fork)

**Objectif :** Enrichissement communautaire des outils d'inspiration

#### Fonctionnalités v1.2 - Personnalisation
```
ORACLE OFFICIEL → FORK PERSONNALISÉ → PARTAGE COMMUNAUTÉ
     ↓                    ↓                    ↓
Tables brumisater → Modification joueur → Votes & popularité
```

#### 1. **Système de Fork (comme Chartopia)**
- **Fork oracle existant** : Copie pour modification personnelle
- **Création from scratch** : Oracle entièrement nouveau (utilisateurs avancés)
- **Modification tables** : Ajout/suppression/modification d'éléments
- **Pondération custom** : Réglage des poids selon préférences
- **Test en temps réel** : Génération pour validation avant partage

#### 2. **Modèle Conceptuel Fork**
- **Oracle Parent** : Référence vers l'oracle officiel de base (si fork)
- **Oracle Personnalisé** : Version modifiée appartenant à un utilisateur
- **Éléments Modifiés** : Ajouts, suppressions, modifications des entrées
- **Visibilité** : Privé (par défaut) ou public (partagé avec communauté)
- **Historique** : Traçabilité des modifications depuis l'oracle parent

#### 3. **Interface d'Édition Oracle**

**Structure de l'Éditeur :**
- **Oracle Original** : Affichage lecture seule des éléments de base
- **Zone de Modifications** : Outils pour ajouter/modifier/supprimer des éléments
- **Prévisualisation** : Test en temps réel de l'oracle modifié
- **Options de Sauvegarde** : Nom, description et visibilité (privé/public)

**Fonctionnalités d'Édition :**
- **Ajout d'éléments** : Nouveaux éléments avec pondération personnalisée  
- **Modification de poids** : Réglage de la probabilité de chaque élément
- **Import batch** : Ajout en masse d'éléments (copier-coller liste)
- **Test de fonctionnement** : Vérification par tirages d'essai

#### 4. **Intégration avec Système de Votes (v1.2)**
- **Même système que documents** : 3 critères (qualité, utilité, respect gameE)
- **Classement par système JDR** : `/communaute/monsterhearts/oracles/`
- **Attribution créateur** : Nom visible + lien profil
- **Modération a posteriori** : Contrôle par Félix

#### 5. **Types d'Oracles Personnalisés**
```
TYPES DE PERSONNALISATION:

📋 Fork Simple
├─ Oracle officiel + quelques ajouts
├─ Modifications mineures (poids, éléments)
└─ Cas d'usage : Adapter à sa table

🔧 Fork Avancé  
├─ Restructuration complète des éléments
├─ Nouvelle pondération
└─ Cas d'usage : Variante règles maison

🆕 Création Originale
├─ Oracle entièrement nouveau
├─ Tables personnalisées
└─ Cas d'usage : Système custom, besoins spécifiques
```

### 💎 v2.0 - Écosystème Oracle Mature

#### Fonctionnalités Avancées
- **Oracles composés** : Chaînage de plusieurs oracles
- **Métadonnées avancées** : Filtrage par tags, contexte, intensité
- **API publique** : Intégration bots Discord, applications tierces
- **Statistiques communauté** : Oracles populaires par système/période
- **Partenariats éditeurs** : Oracles officiels de nouveaux jeux

## Développements futurs

### 🚧 En cours (MVP)
- Interface d'administration web pour oracles officiels
- Optimisation performance tirages (cache, indexation)
- Tests automatisés couverture oracle (robustesse)

### 📋 Planifié v1.2
- Interface de personnalisation d'oracles (fork système)
- Système de votes sur oracles personnalisés
- Pages communautaires oracles par système JDR
- Dashboard création oracles pour utilisateurs

### 🔮 Vision long terme (v2.0+)  
- Oracles pour 10+ systèmes de jeu populaires
- Marketplace oracles premium (partenariats éditeurs)
- IA d'assistance création oracles contextuels
- SDK développeurs pour intégrations tierces

## Métriques de Succès Oracles

### 📊 Métriques MVP (v1.0)
- **Utilisation oracles** : > 50% des sessions brumisater
- **Tirages par visite** : > 3 tirages/session utilisateur
- **Conversion oracle → document** : > 30% (inspiration mène à création)
- **Rétention utilisateur oracle** : > 60% reviennent dans les 7 jours

### 📈 Métriques Communauté (v1.2)
- **Oracles personnalisés créés** : > 100 oracles/mois
- **Taux de partage public** : > 20% des oracles forkés
- **Votes communautaires oracles** : > 500 votes/mois
- **Usage oracles communauté** : > 40% des tirages sur oracles personnalisés

---

**Cette approche positionne les oracles comme pilier central de brumisater : des outils d'inspiration professionnels qui évoluent d'un système fixe (MVP) vers un écosystème collaboratif communautaire (v1.2+).**

*Documentation mise à jour le 06/08/2025 - Vision produit alignée*