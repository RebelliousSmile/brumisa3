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

### 📊 Format des Résultats
Les tirages retournent des résultats structurés avec :
- **Valeur tirée** : Le texte de l'élément sélectionné
- **Métadonnées** : Informations contextuelles pour enrichir le tirage
- **Poids** : Influence sur la probabilité d'apparition
- **Identifiant** : Pour traçabilité et analytics


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

## Permissions et Système Collaboratif

### 👤 Hiérarchie des Permissions

**Guests (Non connectés) :**
- ✅ Utiliser les oracles officiels gratuits
- ✅ Effectuer des tirages anonymes
- ❌ Proposer des modifications
- ❌ Voter sur les oracles

**Membres (Connectés gratuits) :**
- ✅ Utiliser tous les oracles officiels
- ✅ Proposer des options aux créateurs d'oracles
- ✅ Voter sur les oracles publics personnalisés
- ✅ Historique personnel des tirages
- ❌ Créer des oracles personnalisés

**Membres Premium :**
- ✅ Toutes les permissions membres
- ✅ Voir la liste complète des options proposées
- ✅ Créer des oracles personnalisés (privés par défaut)
- ✅ Rendre leurs oracles publics
- ✅ Accès aux statistiques avancées

**Administrateurs :**
- ✅ Toutes les permissions premium
- ✅ Gestion des oracles officiels
- ✅ Modération des oracles publics
- ✅ Analytics et métriques globales

### 💡 Système de Propositions d'Options

**Concept :** Les membres peuvent enrichir les oracles en proposant de nouvelles options aux créateurs.

**Workflow de Proposition :**
1. **Membre propose** → Nouvelle option sur un oracle (officiel ou personnalisé public)
2. **Notification créateur** → Le créateur reçoit la suggestion
3. **Validation/Rejet** → Le créateur décide d'intégrer ou non l'option
4. **Attribution** → Si acceptée, l'option mentionne le contributeur

**Critères d'acceptation :**
- Interface simple de proposition dans la page oracle
- Système de notifications pour les créateurs
- Historique des propositions acceptées/refusées
- Reconnaissance des contributeurs actifs

### 🏆 Système de Vote et Classement

**Oracles Personnalisés Publics :**
- **Privés par défaut** : Les oracles créés restent personnels
- **Publication volontaire** : Le créateur peut rendre son oracle public
- **Votes communautaires** : Les membres votent sur les oracles publics
- **Classement par plébiscite** : Les plus appréciés sont mis en avant

**Mécanisme de Classement :**
- Vote simple (upvote/downvote) par membre
- Un vote par oracle et par utilisateur
- Classement par système JDR et par catégorie
- Section "Oracles les plus plébiscités" par communauté

### 🔒 Contrôles et Sécurité
- Validation des permissions selon le niveau utilisateur
- Limitation du taux de requêtes par niveau
- Modération a posteriori des oracles publics
- Protection contre le spam de propositions

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
- **Vote simple** : Upvote/downvote par les membres connectés
- **Classement par plébiscite** : Les oracles les plus votés sont mis en avant
- **Attribution créateur** : Nom visible + lien profil
- **Visibilité contrôlée** : Privé par défaut, public sur choix du créateur
- **Modération a posteriori** : Contrôle par Félix des oracles publics

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

## Oracles en Cascade (v1.2)

### Vision : Tirages Contextualisés et Cohérents

Les oracles en cascade permettent de créer des chaînes de tirages où le résultat d'un oracle parent filtre automatiquement les options d'un oracle enfant. Cette fonctionnalité transforme des tirages isolés en narrations cohérentes.

### Concept Fonctionnel
```
Oracle Parent → Résultat devient paramètre → Oracle Enfant filtré
     ↓                    ↓                         ↓
"Nations"            "Andor"              "Vêtements d'Andor"
```

### Cas d'Usage Concrets

**Pour les MJs (Alex) :**
- **PNJs cohérents** : Nation → Traits culturels → Motivations politiques
- **Lieux immersifs** : Type de lieu → Ambiance → Complications possibles
- **Rencontres contextuelles** : Faction → Attitude → Demandes spécifiques

**Pour les Joueurs Solo (Sam) :**
- **Narration fluide** : Événement → Conséquences adaptées au contexte
- **Exploration cohérente** : Région → Dangers locaux → Ressources disponibles
- **Relations complexes** : Type de PNJ → Historique → Réaction actuelle

### User Stories Principales

**US1 : Création de Cascade (Créateur)**
En tant qu'utilisateur avancé, je veux lier des oracles en cascade pour créer des tirages contextualisés automatiquement.

Critères d'acceptation :
- Je désigne un oracle parent et un oracle enfant
- Je spécifie quel paramètre du parent filtre l'enfant
- Je peux prévisualiser le comportement avant sauvegarde
- Le système empêche les boucles infinies

**US2 : Utilisation de Cascade (Utilisateur)**
En tant qu'utilisateur, je veux effectuer des tirages en cascade pour obtenir des résultats narrativement cohérents.

Critères d'acceptation :
- Le tirage parent déclenche automatiquement l'oracle enfant
- Les résultats s'affichent dans une vue hiérarchique claire
- Je peux relancer une partie spécifique de la cascade
- L'historique conserve toute la chaîne de tirage

### Intégration avec le Système de Fork

Les oracles en cascade s'intègrent naturellement avec le système de fork v1.2 :
- Fork d'une cascade complète avec préservation des relations
- Modification des paramètres de liaison entre oracles
- Ajout/suppression de niveaux dans une cascade existante
- Partage communautaire de cascades complexes

### Types de Cascades

**Cascade Simple (2 niveaux)**
- Oracle A → Oracle B
- Exemple : Météo → Complications de voyage

**Cascade Complexe (3+ niveaux)**
- Oracle A → Oracle B → Oracle C
- Exemple : Région → Ville → Quartier → Événement local

**Cascade Conditionnelle (v2.0)**
- Branches différentes selon les résultats
- Logique avancée pour narrations complexes

### Métriques de Succès Spécifiques

**Adoption (v1.2) :**
- 30% des utilisateurs avancés créent au moins une cascade
- Profondeur moyenne : 2-3 niveaux (complexité optimale)
- 40% des cascades créées sont partagées publiquement

**Valeur Ajoutée :**
- 80% des utilisateurs trouvent les cascades utiles
- Réduction de 50% du temps de préparation pour scénarios complexes
- Augmentation de 25% de l'usage des oracles grâce aux cascades

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
- **Taux de partage public** : > 20% des oracles créés rendus publics
- **Propositions d'options** : > 200 suggestions/mois avec taux acceptation > 30%
- **Votes communautaires** : > 500 votes/mois sur oracles publics
- **Classement par plébiscite** : Top 10 oracles par système génèrent > 60% des tirages
- **Engagement membres** : > 40% des membres proposent au moins une option

---

**Cette approche positionne les oracles comme pilier central de brumisater : des outils d'inspiration professionnels qui évoluent d'un système fixe (MVP) vers un écosystème collaboratif communautaire (v1.2+).**

*Documentation mise à jour le 06/08/2025 - Vision produit alignée*