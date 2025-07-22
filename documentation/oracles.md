# Documentation - Système d'Oracles

## Vue d'ensemble

Le système d'oracles permet de sélectionner aléatoirement des éléments depuis une collection avec ou sans pondération. Il gère deux niveaux d'accès : les utilisateurs standards qui voient uniquement le résultat du tirage, et les utilisateurs premium qui ont accès aux détails de la collection et aux critères de pondération.

## Structure des données

### Schéma PostgreSQL

#### Table `oracles`
```sql
CREATE TABLE oracles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  premium_required BOOLEAN DEFAULT FALSE,
  total_weight INTEGER GENERATED ALWAYS AS (
    COALESCE((SELECT SUM(weight) FROM oracle_items WHERE oracle_id = oracles.id), 0)
  ) STORED,
  filters JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_oracles_premium ON oracles(premium_required);
CREATE INDEX idx_oracles_active ON oracles(is_active);
CREATE INDEX idx_oracles_filters ON oracles USING GIN(filters);
```

#### Table `oracle_items`
```sql
CREATE TABLE oracle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oracle_id UUID NOT NULL REFERENCES oracles(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 1 CHECK (weight >= 0),
  metadata JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_weight CHECK (weight >= 0)
);

CREATE INDEX idx_oracle_items_oracle_id ON oracle_items(oracle_id);
CREATE INDEX idx_oracle_items_weight ON oracle_items(weight);
CREATE INDEX idx_oracle_items_active ON oracle_items(is_active);
CREATE INDEX idx_oracle_items_metadata ON oracle_items USING GIN(metadata);
```

#### Table `oracle_draws` (historique des tirages)
```sql
CREATE TABLE oracle_draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oracle_id UUID NOT NULL REFERENCES oracles(id),
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(255),
  results JSONB NOT NULL,
  filters_applied JSONB,
  draw_count INTEGER NOT NULL DEFAULT 1,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_oracle_draws_oracle_id ON oracle_draws(oracle_id);
CREATE INDEX idx_oracle_draws_user_id ON oracle_draws(user_id);
CREATE INDEX idx_oracle_draws_session ON oracle_draws(session_id);
CREATE INDEX idx_oracle_draws_created_at ON oracle_draws(created_at);
```

#### Table `oracle_categories` (optionnelle pour organisation)
```sql
CREATE TABLE oracle_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES oracle_categories(id),
  sort_order INTEGER DEFAULT 0
);

-- Table de liaison many-to-many
CREATE TABLE oracle_category_assignments (
  oracle_id UUID REFERENCES oracles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES oracle_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (oracle_id, category_id)
);
```

#### Table `oracle_edit_history` (audit des modifications admin)
```sql
CREATE TABLE oracle_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oracle_id UUID NOT NULL REFERENCES oracles(id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL REFERENCES users(id),
  action_type VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'RESTORE'
  entity_type VARCHAR(50) NOT NULL, -- 'ORACLE', 'ITEM', 'METADATA'
  entity_id UUID, -- ID de l'item modifié si applicable
  old_values JSONB,
  new_values JSONB,
  change_reason TEXT,
  ip_address INET,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_oracle_edit_history_oracle_id ON oracle_edit_history(oracle_id);
CREATE INDEX idx_oracle_edit_history_admin_user ON oracle_edit_history(admin_user_id);
CREATE INDEX idx_oracle_edit_history_action ON oracle_edit_history(action_type);
CREATE INDEX idx_oracle_edit_history_created_at ON oracle_edit_history(created_at);
```

#### Table `oracle_imports` (historique des imports de fichiers)
```sql
CREATE TABLE oracle_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES users(id),
  oracle_id UUID REFERENCES oracles(id), -- NULL si import échoué
  filename VARCHAR(255) NOT NULL,
  file_size INTEGER,
  file_hash VARCHAR(64), -- SHA-256 pour détecter les doublons
  import_type VARCHAR(20) NOT NULL, -- 'JSON', 'CSV', 'XML'
  import_mode VARCHAR(20) NOT NULL, -- 'CREATE', 'REPLACE', 'MERGE'
  items_imported INTEGER DEFAULT 0,
  items_failed INTEGER DEFAULT 0,
  validation_errors JSONB,
  import_status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'SUCCESS', 'FAILED', 'PARTIAL'
  processing_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_oracle_imports_admin_user ON oracle_imports(admin_user_id);
CREATE INDEX idx_oracle_imports_oracle_id ON oracle_imports(oracle_id);
CREATE INDEX idx_oracle_imports_status ON oracle_imports(import_status);
#### Table `oracle_drafts` (brouillons de modifications)
```sql
CREATE TABLE oracle_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oracle_id UUID REFERENCES oracles(id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL REFERENCES users(id),
  draft_name VARCHAR(255),
  oracle_data JSONB NOT NULL, -- Structure complète de l'oracle
  items_data JSONB NOT NULL, -- Array des items
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP
);

CREATE INDEX idx_oracle_drafts_oracle_id ON oracle_drafts(oracle_id);
CREATE INDEX idx_oracle_drafts_admin_user ON oracle_drafts(admin_user_id);
CREATE INDEX idx_oracle_drafts_published ON oracle_drafts(is_published);
```

### Modèle de réponse de tirage

```json
{
  "results": [
    {
      "id": "uuid", 
      "value": "string",
      "metadata": "object"
    }
  ],
  "draw_info": {
    "oracle_id": "uuid",
    "timestamp": "ISO8601",
    "filters_applied": "object",
    "total_items_available": "number"
  }
}
```

## Informations stockées en base

### Données principales

**Oracles :**
- Identifiant unique (UUID)
- Nom et description
- Indicateur premium requis
- Poids total (calculé automatiquement)
- Critères de filtrage (JSONB)
- Statut actif/inactif
- Métadonnées de création et modification
- Référence au créateur

**Items d'oracle :**
- Identifiant unique (UUID)
- Référence à l'oracle parent
- Valeur textuelle de l'item
- Poids de pondération (entier positif)
- Métadonnées personnalisées (JSONB)
- Statut actif/inactif
- Horodatage de création

### Données de traçabilité

**Historique des tirages :**
- Identifiant unique du tirage
- Référence à l'oracle utilisé
- Utilisateur ou session ayant effectué le tirage
- Résultats du tirage (JSONB)
- Filtres appliqués lors du tirage
- Nombre d'éléments tirés
- Informations techniques (IP, user-agent)
- Horodatage précis du tirage

**Historique des modifications administratives :**
- Identifiant de l'action de modification
- Oracle et entité modifiée (oracle/item/métadonnées)
- Administrateur ayant effectué la modification
- Type d'action (création, modification, suppression, restauration)
- Valeurs avant et après modification (JSONB)
- Raison de la modification (optionnelle)
- Informations de traçabilité (IP, horodatage)

### Données de gestion administrative

**Brouillons d'oracle :**
- Identifiant unique du brouillon
- Référence à l'oracle de base (si modification)
- Administrateur propriétaire du brouillon
- Nom du brouillon pour identification
- Structure complète de l'oracle en cours d'édition
- Liste des items avec leurs modifications
- Statut de publication
**Données d'import de fichiers :**
- Identifiant unique de l'import
- Administrateur ayant effectué l'import
- Oracle de destination (si succès)
- Informations du fichier (nom, taille, hash)
- Type et mode d'import (JSON/CSV, CREATE/REPLACE/MERGE)
- Statistiques d'import (items importés/échoués)
- Erreurs de validation détaillées (JSONB)
- Statut et temps de traitement
- Horodatages de début et fin de traitement

### Données d'organisation

**Catégorisation (optionnelle) :**
- Catégories hiérarchiques pour organiser les oracles
- Relations many-to-many entre oracles et catégories
- Ordre de tri personnalisable

### Contraintes et validations

- **Poids positifs** : Les poids doivent être >= 0
- **Intégrité référentielle** : Suppression en cascade des items
- **Génération automatique** : Le poids total est calculé automatiquement
- **Indexation optimisée** : Index sur les champs de recherche fréquents
- **Types adaptés** : JSONB pour flexibilité, UUID pour sécurité

### Algorithme de tirage pondéré

**Entrée :** Liste d'items avec poids, nombre d'éléments à tirer
**Sortie :** Liste d'éléments sélectionnés

1. Calculer le poids total de tous les éléments éligibles
2. Pour chaque tirage à effectuer :
   - Générer un nombre aléatoire entre 0 et le poids total
   - Parcourir les éléments en accumulant leurs poids
   - Sélectionner l'élément quand la somme accumulée dépasse le nombre aléatoire
3. Retourner la liste des éléments sélectionnés

### Algorithme de filtrage

**Entrée :** Liste d'items, critères de filtrage
**Sortie :** Liste d'items filtrés avec nouveau poids total

1. Pour chaque item de la collection :
   - Vérifier si les métadonnées correspondent aux critères
   - Si oui, inclure l'item dans la liste filtrée
2. Recalculer le poids total des éléments filtrés
3. Retourner la collection filtrée

### Algorithme de tirage sans remise

**Entrée :** Liste d'items, nombre d'éléments à tirer
**Sortie :** Liste d'éléments uniques sélectionnés

1. Créer une copie de la liste d'items
2. Pour chaque tirage :
   - Appliquer l'algorithme de tirage pondéré sur la liste courante
   - Retirer l'élément sélectionné de la liste
   - Recalculer le poids total
3. Retourner la liste des éléments sélectionnés

## Contrôle d'accès

### Logique de visibilité des données

**Utilisateur standard :**
- Accès à `oracle.id`, `oracle.name`, `oracle.description`
- Résultat du tirage : uniquement `value` et `metadata` publiques
- Pas d'accès aux poids individuels ni au poids total

**Utilisateur premium :**
- Accès complet à la structure de l'oracle
- Visibilité des poids et critères de pondération
- Accès aux métadonnées complètes des résultats
- Possibilité d'appliquer des filtres personnalisés

**Administrateur :**
- Tous les droits des utilisateurs premium
- Création de nouveaux oracles
- Modification complète des oracles existants
- Gestion des items (ajout, modification, suppression)
- Accès à l'historique des modifications
- Gestion des brouillons et publication
- Statistiques d'usage détaillées

### Algorithme de filtrage des données de réponse

**Entrée :** Données oracle complètes, niveau d'accès utilisateur
**Sortie :** Données filtrées selon les permissions

1. Si administrateur : retourner les données complètes + métadonnées admin
2. Si utilisateur premium : retourner les données complètes
3. Si utilisateur standard :
   - Supprimer les champs `weight` de tous les items
   - Supprimer le champ `total_weight`
   - Filtrer les métadonnées selon la configuration de visibilité
   - Masquer les critères de filtrage avancés

## Gestion administrative des oracles

### Algorithme de création d'oracle

**Entrée :** Données oracle, liste d'items, ID administrateur
**Sortie :** Oracle créé avec historique

1. Valider les données d'entrée (nom, description, items)
2. Créer l'entrée oracle en base
3. Insérer les items associés en lot
4. Enregistrer l'action dans l'historique (`CREATE`)
5. Recalculer automatiquement le poids total
6. Retourner l'oracle créé avec son ID

### Algorithme de modification d'oracle

**Entrée :** ID oracle, modifications à appliquer, ID administrateur
**Sortie :** Oracle modifié avec historique

1. Récupérer l'état actuel de l'oracle
2. Identifier les changements (oracle, items ajoutés/modifiés/supprimés)
3. Pour chaque modification :
   - Sauvegarder l'ancien état dans l'historique
   - Appliquer la modification
   - Enregistrer le nouvel état dans l'historique
4. Recalculer le poids total si nécessaire
5. Invalider les caches associés
6. Retourner l'oracle modifié

### Algorithme de gestion des brouillons

**Entrée :** ID oracle, données de brouillon, action (save/publish)
**Sortie :** Brouillon sauvegardé ou oracle publié

**Mode sauvegarde :**
1. Sérialiser l'état complet de l'oracle et items en JSONB
2. Sauvegarder dans `oracle_drafts` avec statut brouillon
3. Conserver les versions précédentes pour historique

**Mode publication :**
1. Récupérer les données du brouillon
2. Appliquer l'algorithme de modification standard
3. Marquer le brouillon comme publié
4. Nettoyer les anciens brouillons (optionnel)

### Algorithme d'import de fichiers

**Entrée :** Fichier (JSON/CSV), mode d'import, ID administrateur
**Sortie :** Oracle créé/modifié avec rapport d'import

**Phase de validation :**
1. Vérifier l'extension et type MIME du fichier
2. Calculer le hash SHA-256 pour détecter les doublons
3. Valider la structure du fichier selon le format
4. Vérifier la cohérence des données (poids positifs, valeurs uniques)
5. Créer l'entrée dans `oracle_imports` avec statut PENDING

**Phase de traitement :**
1. Parser le fichier selon son format (JSON/CSV)
2. Normaliser les données vers le format interne
3. Valider chaque item individuellement
4. Selon le mode d'import :
   - **CREATE** : Créer un nouvel oracle
   - **REPLACE** : Remplacer complètement un oracle existant
   - **MERGE** : Fusionner avec un oracle existant
5. Traiter les items par batch pour optimiser les performances
6. Enregistrer les erreurs de validation par item

**Phase de finalisation :**
1. Calculer les statistiques d'import (items importés/échoués)
2. Mettre à jour le statut final (SUCCESS/FAILED/PARTIAL)
3. Enregistrer dans l'historique des modifications
4. Nettoyer les fichiers temporaires
5. Retourner le rapport détaillé

### Formats de fichiers supportés

#### Format JSON
```json
{
  "oracle": {
    "name": "Nom de l'oracle",
    "description": "Description optionnelle",
    "premium_required": false,
    "filters": {
      "type": ["magic", "mundane"],
      "rarity": ["common", "rare", "legendary"]
    }
  },
  "items": [
    {
      "value": "Épée magique",
      "weight": 15,
      "metadata": {
        "type": "magic",
        "rarity": "rare",
        "damage": "1d8+2"
      }
    }
  ]
}
```

#### Format CSV
```csv
value,weight,type,rarity,damage
"Épée magique",15,"magic","rare","1d8+2"
"Dague simple",25,"mundane","common","1d4"
"Bâton de foudre",5,"magic","legendary","3d6"
```

### Algorithme de validation par format

**Validation JSON :**
1. Vérifier la structure JSON valide
2. Valider la présence des champs obligatoires (`oracle.name`, `items`)
3. Vérifier les types de données (string, number, boolean)
4. Valider les contraintes métier (poids > 0, noms uniques)

**Validation CSV :**
1. Détecter automatiquement le délimiteur (`,`, `;`, `\t`)
2. Vérifier la présence des colonnes obligatoires (`value`, `weight`)
3. Valider chaque ligne individuellement
4. Convertir les types de données appropriés
5. Construire les métadonnées depuis les colonnes supplémentaires

### Algorithme de gestion des conflits

**Mode MERGE avec conflits :**
1. Identifier les items existants par valeur ou ID
2. Pour chaque conflit :
   - **UPDATE** : Mettre à jour l'item existant
   - **SKIP** : Ignorer l'item du fichier
   - **RENAME** : Ajouter un suffixe à la valeur
3. Enregistrer les décisions prises dans le rapport
4. Permettre à l'admin de résoudre manuellement les conflits

### Algorithme de rollback d'import

**Entrée :** ID d'import à annuler
**Sortie :** Oracle restauré à l'état pré-import

1. Récupérer l'historique des modifications liées à l'import
2. Identifier toutes les entités créées/modifiées
3. Pour chaque modification :
   - Restaurer l'ancienne valeur
   - Supprimer les nouvelles entités créées
4. Marquer l'import comme annulé
5. Enregistrer l'action de rollback dans l'historique

## Gestion des erreurs

### Cas d'erreur identifiés

- **Oracle introuvable** : ID oracle inexistant
- **Collection vide** : Aucun item après filtrage
- **Poids invalides** : Poids négatifs ou non numériques
- **Permissions insuffisantes** : Accès premium requis
- **Paramètres invalides** : Nombre de tirages invalide ou filtres malformés

### Stratégie de fallback

1. En cas de filtrage trop restrictif : ignorer les filtres et effectuer un tirage global
2. En cas de poids invalides : utiliser un poids uniforme (1) pour tous les éléments
3. En cas d'erreur de tirage : retourner un élément aléatoire simple

## Tests et validation

### Cas de test pour l'algorithme de pondération

- **Distribution uniforme** : Tous les poids égaux, vérifier la répartition équitable
- **Pondération extrême** : Un élément avec 99% du poids total
- **Poids zéro** : Éléments avec poids 0 ne doivent jamais être sélectionnés
- **Grande collection** : Performance avec 10000+ éléments
- **Tirages multiples** : Vérifier l'absence de doublons en mode sans remise

### Tests de contrôle d'accès

- **Utilisateur standard** : Vérifier l'absence des données sensibles
- **Utilisateur premium** : Vérifier l'accès complet aux données
- **Administrateur** : Vérifier l'accès aux fonctions d'édition
- **Oracle premium** : Bloquer l'accès aux utilisateurs standards
- **Escalade de privilèges** : Tentatives de bypass des contrôles
- **Modification non autorisée** : Tentatives d'édition par non-admin

### Tests des fonctions administratives

- **Création d'oracle** : Validation des données, génération correcte
- **Modification d'items** : Ajout, suppression, mise à jour des poids
- **Gestion des brouillons** : Sauvegarde, publication, restauration
- **Import de fichiers** : JSON et CSV, différents modes d'import
- **Validation d'import** : Rejection des formats invalides, gestion des erreurs
- **Gestion des conflits** : Merge avec résolution des doublons
- **Historique des modifications** : Traçabilité complète des changements
- **Rollback d'import** : Annulation complète d'un import défaillant
- **Validation des données** : Rejection des poids invalides, noms dupliqués
- **Cohérence des poids** : Recalcul automatique du poids total
- **Performance d'import** : Traitement par batch de gros fichiers

### Tests de robustesse

- **Collections vides** : Comportement avec 0 élément
- **Données corrompues** : Poids négatifs, métadonnées invalides
- **Charge élevée** : Performance avec nombreux tirages simultanés
- **Filtres complexes** : Combinaisons multiples de critères

## Métriques et monitoring

### Indicateurs de performance

- **Temps de réponse** : Latence des tirages par taille de collection
- **Distribution des résultats** : Vérification de la justesse statistique
- **Taux d'erreur** : Fréquence des échecs de tirage
- **Usage par oracle** : Popularité des différentes collections

### Logs applicatifs

- **Tirage effectué** : Oracle utilisé, filtres appliqués, résultat
- **Accès refusé** : Tentatives d'accès non autorisées
- **Erreurs de données** : Collections corrompues ou incohérentes
- **Performance dégradée** : Tirages exceptionnellement lents
- **Modification admin** : Création, modification, suppression d'oracles
- **Publication de brouillon** : Passage brouillon vers production
- **Import de fichier** : Démarrage, progression et finalisation des imports
- **Erreurs d'import** : Validation échouée, conflits de données
- **Rollback d'import** : Annulation d'import avec détails
- **Restauration** : Retour à un état antérieur depuis l'historique
- **Erreurs d'édition** : Échecs de validation lors des modifications