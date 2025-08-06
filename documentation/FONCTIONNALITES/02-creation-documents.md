# Création de Documents - Architecture Fonctionnelle

## Vision : Mode "Sur le Pouce" + Génération Professionnelle

**Objectif MVP :** Permettre à Casey (découvreur) de créer n'importe quel document JDR et partir avec son PDF en moins de 3 minutes, sans inscription.

### Principe Fondamental
- **Accès immédiat** : Pas de barrière à l'entrée, formulaires disponibles instantanément
- **Génération PDF professionnelle** : Qualité impression avec mise en page adaptée par système JDR
- **Mode anonyme parfait** : Expérience complète sans compte, documents stockés mais non récupérables

## 5 Types de Documents Supportés

### 1. **CHARACTER** - Fiches de Personnage
**Disponible :** Tous systèmes JDR (Monsterhearts, Engrenages, Metro 2033, Mist Engine, Zombiology)

#### Utilisateurs Cibles
- **Casey** (découvreur) : Teste la création de personnage pour découvrir un système
- **Alex** (MJ) : Crée des PNJs rapidement pour sa partie
- **Sam** (joueur solo) : Crée son personnage principal ou personnages secondaires

#### Fonctionnalités
- **Formulaire adaptatif** : Champs spécifiques selon le système JDR choisi
- **Validation contextuelle** : Règles du jeu appliquées automatiquement
- **Génération PDF immédiate** : Mise en page professionnelle selon la charte graphique du système
- **Mode anonyme complet** : Création sans compte, PDF téléchargeable immédiatement

#### Workflow
```
1. Accueil → "Créer un personnage"
2. Choix système JDR → Formulaire adaptatif chargé
3. Saisie des données → Validation temps réel
4. "Générer PDF" → Document créé en base + PDF généré
5. Téléchargement immédiat → Utilisateur anonyme peut partir
```

### 2. **ORGANIZATION** - Listes de PNJs
**Disponible :** Tous systèmes JDR (crucial pour les MJs)

#### Utilisateurs Cibles
- **Alex** (MJ) : Prépare sa galerie de PNJs pour une séance
- **Jordan** (MJ expert) : Organise ses campagnes avec des listes structurées

#### Fonctionnalités ORGANIZATION
- **Liste structurée de PNJs** : Nom, rôle, caractéristiques selon système
- **Templates par contexte** : "Habitants du village", "Gang de la zone", "Conseil de la station"
- **Génération aléatoire optionnelle** : Intégration avec les oracles pour créer des PNJs
- **Export PDF organisé** : Mise en page claire pour consultation rapide en partie

#### Spécificités par Système
- **Monsterhearts** : Listes d'étudiants, adultes, figures d'autorité avec relations
- **Metro 2033** : Hiérarchies militaires, habitants de stations, factions
- **Engrenages** : Nobles, artisans, membres de guildes avec statuts sociaux

### 3. **TOWN** - Cadres de Ville (Monsterhearts)
**Spécifique :** Monsterhearts uniquement

#### Utilisateur Cible
- **Alex** (MJ Monsterhearts) : Crée sa ville pour sa campagne lycéenne

#### Fonctionnalités TOWN
- **Plan de ville thématique** : Lycée + lieux importants (centre commercial, quartiers)
- **Relations entre lieux** : Qui fréquente où, tensions territoriales
- **Atmosphère gothique-romantique** : Description évocatrice selon charte Monsterhearts
- **NPCs de lieu** : Adultes importants assignés aux lieux stratégiques

### 4. **GROUP** - Plans de Classe (Monsterhearts)
**Spécifique :** Monsterhearts uniquement

#### Utilisateur Cible
- **Alex** (MJ Monsterhearts) : Organise sa classe de lycéens avec relations

#### Fonctionnalités GROUP
- **Organigramme de classe** : Qui est ami avec qui, qui déteste qui
- **Cliques et hierarchies** : Populaires, marginaux, rebels, intellectuels
- **Dynamiques amoureuses** : Triangles amoureux, crushes, ex
- **Événements de classe** : Historique des drames, fêtes, incidents

### 5. **DANGER** - Fronts et Menaces (Mist Engine)
**Spécifique :** Mist Engine uniquement

#### Utilisateur Cible
- **Jordan** (MJ expert Mist Engine) : Structure ses campagnes avec des fronts

#### Fonctionnalités DANGER
- **Anatomie du Front** : Impulsion sombre, menaces, countdown clock
- **Portées personnelles/communautaires** : Impact sur PJs et monde
- **Évolution temporelle** : États d'avancement, points de bascule
- **Intégration narrative** : Comment révéler et faire évoluer le danger

## Workflow de Création - Mode Anonyme

### Parcours Utilisateur "Sur le Pouce"
1. **Arrivée sur brumisater** → Page d'accueil avec options de création
2. **Choix du type de document** → CHARACTER, ORGANIZATION, TOWN, GROUP, DANGER
3. **Sélection système JDR** → Interface adaptée au système choisi
4. **Formulaire contextuel** → Champs spécifiques au type + système
5. **Validation temps réel** → Aide à la saisie selon règles du jeu
6. **Génération PDF** → PDF professionnel téléchargeable immédiatement

### Gestion des Documents Anonymes
- **Stockage temporaire** : Documents créés stockés en base mais non récupérables
- **Visibilité admin** : Félix peut consulter les documents anonymes pour analytics
- **Nettoyage automatique** : Suppression après 30 jours pour maintenance
- **Pas de récupération** : Utilisateur anonyme ne peut pas retrouver ses créations

## Interface Utilisateur - Expérience "Sur le Pouce"

### Page d'Accueil - Navigation Intuitive
- **Message clair** : "Créez vos documents JDR en 3 minutes"
- **5 cartes de création** : Un accès direct pour chaque type de document
- **Indication mode anonyme** : "Créez, téléchargez, partez" pour rassurer Casey
- **Appel à l'action évident** : Boutons visibles pour chaque type

### Formulaire de Création - Adaptatif
- **Sélection système JDR** : Interface change selon le système choisi
- **Champs contextuels** : Formulaire spécifique au type + système
- **Validation temps réel** : Messages d'aide selon les règles du jeu
- **Notice anonyme** : Information claire sur la non-récupérabilité
- **Option sauvegarde** : Pour utilisateurs connectés uniquement

### Expérience de Génération
- **Indicateurs de progression** : Feedback visuel pendant génération
- **Résultat immédiat** : PDF disponible dès la fin de génération
- **Auto-téléchargement** : PDF s'ouvre automatiquement
- **Rappel anonyme** : "Document non récupérable après fermeture"

## Métriques de Succès - Mode "Sur le Pouce"

### Métriques Critiques MVP
- **Conversion accueil → PDF** : > 70% (utilisateurs qui arrivent doivent repartir avec un PDF)
- **Temps moyen création** : < 3 minutes (promesse du mode "sur le pouce")
- **Taux d'abandon formulaire** : < 30% (formulaires intuitifs)
- **Génération PDF réussie** : > 95% (robustesse technique)

### Métriques d'Engagement
- **Types de documents populaires** : CHARACTER vs ORGANIZATION vs autres
- **Systèmes JDR préférés** : Monsterhearts vs Metro 2033 vs autres
- **Mode anonyme vs connecté** : Ratio d'utilisation
- **Téléchargements PDF** : Indicateur de satisfaction (utilisateur repart avec quelque chose)

### Indicateurs Qualité
- **Erreurs de validation** : < 5% des soumissions
- **Durée génération PDF** : < 5 secondes
- **Taux d'erreur serveur** : < 1%
- **Score de satisfaction** : Feedback post-téléchargement

Cette architecture permet à brumisater d'offrir une expérience "sur le pouce" parfaite : Casey arrive, choisit son type de document, sélectionne son système JDR, remplit le formulaire, génère son PDF et repart satisfait, le tout en moins de 3 minutes et sans avoir besoin de créer un compte.