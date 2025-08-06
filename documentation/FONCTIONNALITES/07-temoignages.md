# Témoignages - Preuve Sociale et Confiance

## Vision : Construire la Confiance par l'Authenticité

**Objectif :** Permettre aux utilisateurs satisfaits de partager leur expérience avec brumisater, créant une preuve sociale authentique qui guide les nouveaux utilisateurs vers les systèmes JDR qui leur correspondent.

### Valeur Métier
- **Acquisition utilisateurs** : Les témoignages rassurent les nouveaux visiteurs
- **Orientation système JDR** : Aide à choisir le bon système selon les retours
- **Feedback produit** : Comprendre les usages réels et points forts perçus
- **Communauté** : Montrer la diversité des utilisateurs et usages

## Fonctionnalités du Système de Témoignages

### 1. Soumission de Témoignage

**Éléments du témoignage :**
- **Système de jeu** : Sélection parmi les systèmes disponibles (obligatoire)
- **Note** : Évaluation de 1 à 5 étoiles (obligatoire)
- **Description** : Texte libre du témoignage (obligatoire, 50-1000 caractères)
- **Nom de l'auteur** : Identité publique (obligatoire)
- **Lien de contact** : URL vers profil/site/réseaux sociaux (optionnel)

**Critères d'acceptation :**
- Formulaire accessible depuis la page d'accueil
- Validation des champs en temps réel
- Message de confirmation après soumission
- Limitation anti-spam (1 par jour/IP, 1 par semaine/email)

### 2. Affichage des Témoignages

**Mode d'affichage :**
- **Affichage aléatoire** : Les témoignages approuvés sont affichés aléatoirement
- **Rotation automatique** : Nouveau tirage à chaque chargement de page
- **Nombre configurable** : 3-5 témoignages visibles selon l'espace

**Informations affichées :**
- Note sous forme d'étoiles
- Texte du témoignage
- Nom de l'auteur
- Système JDR concerné
- Lien de contact (si fourni)

### 3. Modération et Visibilité

**Workflow de modération :**
```
SOUMISSION → EN_ATTENTE → MODERATION → APPROUVE/REJETE
                                    ↓
                              VISIBLE/MASQUE
```

**États possibles :**
- **EN_ATTENTE** : Nouveau témoignage, non visible publiquement
- **APPROUVE** : Validé par Félix, visible sur le site
- **REJETE** : Refusé, notification à l'auteur avec raison
- **MASQUE** : Approuvé mais temporairement caché

**Critères de modération :**
- Authenticité du témoignage
- Pertinence par rapport à brumisater
- Absence de contenu offensant
- Qualité constructive du feedback

## User Stories

### US1 : Soumettre un Témoignage
**En tant qu'utilisateur satisfait**, je veux partager mon expérience avec brumisater pour aider d'autres joueurs à découvrir l'outil.

**Critères d'acceptation :**
- Je sélectionne le système JDR que j'ai utilisé
- Je donne une note de 1 à 5 étoiles
- Je rédige mon témoignage (50-1000 caractères)
- Je peux ajouter mon nom et un lien de contact
- Je reçois une confirmation de soumission

### US2 : Découvrir les Témoignages
**En tant que visiteur**, je veux lire des témoignages d'utilisateurs réels pour comprendre la valeur de brumisater.

**Critères d'acceptation :**
- Je vois 3-5 témoignages sur la page d'accueil
- Les témoignages changent à chaque visite (aléatoire)
- Je vois la note, le système JDR et le nom de l'auteur
- Je peux cliquer sur le lien de contact si disponible

### US3 : Modérer les Témoignages (Félix)
**En tant qu'administrateur**, je veux valider les témoignages pour maintenir la qualité et l'authenticité.

**Critères d'acceptation :**
- Je vois tous les témoignages en attente dans mon dashboard
- Je peux approuver, rejeter ou masquer un témoignage
- Je peux filtrer par système JDR ou par date
- Les statistiques montrent le taux d'approbation

## Intégration avec l'Écosystème

### Lien avec les Systèmes JDR
- Chaque témoignage est associé à un système spécifique
- Possibilité future d'afficher les témoignages sur les pages systèmes
- Analytics par système pour identifier les plus appréciés

### Impact sur la Conversion
- Témoignages visibles dès la page d'accueil
- Rotation aléatoire pour montrer la diversité
- Notes moyennes par système comme indicateur de satisfaction

## Métriques de Succès

### Métriques d'Engagement
- **Taux de soumission** : > 5% des utilisateurs actifs témoignent
- **Qualité des témoignages** : > 80% approuvés après modération
- **Diversité** : Témoignages pour tous les systèmes JDR

### Métriques d'Impact
- **Influence sur conversion** : +15% de création de compte après lecture
- **Temps sur site** : +20% pour visiteurs qui lisent les témoignages
- **Choix système JDR** : Corrélation entre témoignages lus et système choisi

### Métriques de Modération
- **Délai de modération** : < 48h pour validation
- **Taux de rejet** : < 20% (qualité des soumissions)
- **Feedback constructif** : 100% des rejets motivés

## Évolutions Futures

### v1.1 - Enrichissement
- Filtrage des témoignages par système JDR
- Page dédiée avec tous les témoignages
- Statistiques publiques (note moyenne par système)

### v1.2 - Intégration Communautaire
- Lien entre témoignage et profil membre
- Témoignages sur les créations communautaires
- Badge "Témoignage vérifié" pour contributeurs actifs

### v2.0 - Analytics Avancés
- Sentiment analysis des témoignages
- Extraction automatique des points forts/faibles
- Recommandations personnalisées basées sur témoignages similaires

---

**Les témoignages constituent un pilier de confiance essentiel pour brumisater, transformant la satisfaction utilisateur en levier d'acquisition et d'orientation pour la communauté JDR.**