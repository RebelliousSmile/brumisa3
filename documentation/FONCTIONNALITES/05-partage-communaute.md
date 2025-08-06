# Partage et Communauté JDR

## Vision : Boîte à Outils Collaborative

**Philosophie :** Brumisater fournit les outils pour valoriser et partager les créations. Les joueurs s'organisent ailleurs (Discord, forums, etc.) pour la collaboration directe.

### Principe Fondamental
- ✅ **Outils de partage et valorisation** des créations
- ✅ **Mise en avant des meilleures créations** par la communauté
- ❌ **Pas de réseau social** (messagerie, chat, groupes)
- ❌ **Pas d'organisation de parties** (Discord/autres outils externes)

## Fonctionnalités Communautaires

### 1. 📊 Système de Votations

#### Documents Publics
- **Choix du membre** : Rendre un document public ou privé
- **Système de votes** : Upvote/downvote sur documents partagés
- **Pages "Les plus plébiscités"** :
  - **Classement par système JDR** : Pages séparées (Monsterhearts, Engrenages, etc.)
  - **Sous-catégories par type** : CHARACTER, ORGANIZATION, etc. dans chaque système
  - **Navigation distincte** : `/communaute/monsterhearts/`, `/communaute/engrenages/`

#### Critères de Qualité
- **Documents votables** : Seulement ceux rendus publics par leur créateur
- **Modération** : Validation administrative avant publication
- **Attribution** : Nom/pseudo du créateur toujours visible
- **Signalement** : Possibilité de signaler contenus inappropriés

### 2. 🔧 Oracles Personnalisables (v1.2 - PAS MVP)

#### Système de Fork (comme Chartopia) - Version Ultérieure
- **Base d'oracles officiels** : Fournis par brumisater par système JDR
- **Personnalisation** : Les membres peuvent créer des versions personnalisées
- **Partage** : Publication des oracles personnalisés
- **Votes sur oracles** : Même système que les documents

#### Fonctionnalités Oracles (v1.2)
- **Fork d'oracle existant** : Copie pour modification
- **Création d'oracle from scratch** : Pour utilisateurs avancés
- **Tables personnalisées** : Ajout/modification d'entrées
- **Combinaisons d'oracles** : Chaîner plusieurs oracles

**Note MVP :** Les oracles du MVP sont fixes, fournis par brumisater. Personnalisation dans v1.2.

### 3. 👤 Pages Profil Membre

#### Profil Public
- **URL personnalisée** : `/membre/[pseudo]` ou `/membre/[id]`
- **Créations publiques** : Liste de tous les documents/oracles partagés
- **Statistiques** : Nombre de créations, votes reçus, popularité
- **Badges** : Reconnaissance pour contributeurs actifs

#### Organisation du Profil
```
Profil de [Pseudo]
├── Documents partagés (XX)
│   ├── Par système JDR
│   ├── Par type de document  
│   └── Les plus populaires
├── Oracles personnalisés (XX)
│   ├── Créés from scratch
│   ├── Forkés et modifiés
│   └── Les plus utilisés
└── Statistiques
    ├── Total votes reçus
    ├── Documents dans "Les plus plébiscités"
    └── Contribution à la communauté
```

## Architecture Fonctionnelle

### Pages Communautaires par Système

#### Structure : `/communaute/[systeme]`
```
/communaute/monsterhearts/
├── Les plus plébiscités
│   ├── Documents CHARACTER
│   ├── Documents TOWN  
│   ├── Documents GROUP
│   └── Oracles (v1.2)
├── Récemment partagés
│   ├── Documents
│   └── Oracles (v1.2)  
├── Contributeurs actifs
└── Statistiques communauté
```

#### Autres Systèmes
- `/communaute/engrenages/`
- `/communaute/metro2033/`
- `/communaute/mistengine/`
- `/communaute/zombiology/`

### Système de Votes

#### Mécanique de Vote Uniforme (Documents ET Oracles)
- **Formulaire identique** : Même système pour documents et oracles
- **3 Questions standardisées** :
  1. **Qualité générale** (1-5 étoiles)
  2. **Utilité pratique** (1-5 étoiles) 
  3. **Respect de la gamme officielle** (1-5 étoiles)
- **Utilisateurs connectés uniquement** : Pas de vote anonyme
- **Un vote par création** : Document ou oracle
- **Score global** : Moyenne des 3 critères, calculé identiquement partout

#### Système de Priorité d'Affichage 
1. **Documents mis en avant** : Sélectionnés par les administrateurs
2. **Documents populaires** : Triés par score de vote
3. **Documents récents** : Ordre chronologique de publication

#### Calcul du Score de Classement
- **Moyenne des 3 critères** : Poids principal du calcul (sur 5 étoiles)
- **Bonus ancienneté** : Léger bonus pour créations établies dans le temps
- **Bonus popularité** : Bonus selon nombre de votes reçus
- **Formule** : Score global = Moyenne votes + bonus ancienneté + bonus popularité

## Workflow Utilisateur

### Partage d'un Document

1. **Création document** (anonyme ou connecté)
2. **Choix visibilité** : Privé (défaut) ou Public
3. **Si Public** : 
   - Publication immédiate dans section communautaire
   - Modération a posteriori par l'administrateur
   - Disponible pour votes et consultation

### Consultation Communautaire

1. **Navigation** : Pages communautaires par système
2. **Découverte** : Documents les plus plébiscités
3. **Consultation** : Visualisation PDF + nom du membre créateur
4. **Attribution** : Lien vers le profil du créateur
5. **Vote** : Si connecté, possibilité d'upvote/downvote

### Personnalisation Oracle (v1.2)

1. **Navigation** : Section oracles du système choisi
2. **Sélection** : Oracle de base ou personnalisé
3. **Fork** : Copie pour personnalisation
4. **Modification** : Ajout/suppression d'entrées dans les tables
5. **Test** : Génération pour validation
6. **Partage** : Publication pour la communauté

## Modération et Qualité

### Processus de Modération

#### Documents - Modération A Posteriori
- **Publication immédiate** : Documents publics visibles dès création
- **Modération administrative** : Contrôle par Félix après publication
- **Critères de suppression** :
  - Contenu offensant/inapproprié
  - Hors-sujet (pas lié au système JDR)
  - Qualité insuffisante (document vide, test)
- **Actions possibles** : Suppression, masquage temporaire, avertissement créateur

#### Oracles
- **Validation technique** : Format JSON correct, tables cohérentes  
- **Contrôle contenu** : Pas de contenu offensant dans les tables
- **Test fonctionnel** : Génération correcte

### Outils Administratifs (Félix)

#### Dashboard Modération
- **Files d'attente** : Documents/oracles en attente de validation
- **Signalements** : Contenus signalés par la communauté  
- **Statistiques** : Activité communautaire par système
- **Gestion utilisateurs** : Sanctions/suspensions si nécessaire

## Métriques Communautaires

### Engagement
- **Taux de partage** : % de documents rendus publics
- **Activité votes** : Votes par document publié
- **Consultation profils** : Visites pages membres
- **Créations oracles** : Nombre de forks et créations

### Qualité
- **Score moyen documents** : Niveau d'appréciation
- **Taux de rejet modération** : Qualité des soumissions
- **Répartition par système** : Activité par communauté JDR
- **Contributeurs actifs** : Membres créant régulièrement

### Vitalité par Système
- **Monsterhearts** : Activité communautaire
- **Engrenages** : Engagement utilisateurs
- **Metro 2033** : Créations partagées
- **Mist Engine** : Oracles personnalisés
- **Zombiology** : Participation globale

## Roadmap Communautaire

### v1.1 - Bases Communautaires
- Visibilité privé/public des documents
- Système de votes basique
- Pages "Les plus plébiscités" par système
- Profils membres avec créations publiques

### v1.2 - Oracles Collaboratifs  
- Système de fork d'oracles
- Personnalisation et partage oracles
- Votes sur oracles personnalisés
- Dashboard avancé pour Félix

### v2.0 - Maturité Communautaire
- Statistiques avancées par système JDR
- Badges et reconnaissance contributeurs
- API pour intégrations externes (bots Discord, etc.)
- Partenariats avec communautés JDR existantes

---

**Cette approche communautaire respecte la philosophie "boîte à outils" : on facilite le partage et la valorisation, sans créer de dépendance sociale au produit.**