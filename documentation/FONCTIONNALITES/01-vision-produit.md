# Vision Produit - brumisater

## Promesse du Site

**"L'atelier numérique des MJs et joueurs solo : créez vos documents de jeu, inspirez-vous avec des oracles contextuels, et partagez vos créations avec la communauté JDR."**

### Valeurs Clés

- **Accessibilité immédiate** : Mode anonyme "sur le pouce", pas d'inscription obligatoire
- **Qualité professionnelle** : PDFs adaptés à chaque système JDR, mise en page soignée
- **Richesse contextuelle** : Oracles aussi importants que la création de documents
- **Communauté JDR** : Partage et valorisation des créations entre joueurs des mêmes systèmes

## Cibles Principales

### **🎭 MJs qui préparent leurs parties**
- Création rapide de PNJs (ORGANIZATION)
- Oracles pour l'improvisation en cours de partie
- Documents thématiques (TOWN, DANGER selon le système)

### **🎲 Joueurs solo**
- Documents génériques pour journaux de partie
- Oracles pour inspiration narrative
- Gestion de leurs créations à moyen terme

### **👥 Communautés des jeux brumisa3**
- Spécifiquement : Monsterhearts, Engrenages, Metro 2033, Mist Engine, Zombiology
- Partage de créations entre joueurs du même système
- Valorisation des meilleurs documents communautaires

## Personas Utilisateur

### 1. **Alex - MJ qui prépare** 🎭
- **Profil** : Anime des parties, prépare ses sessions
- **Besoins** : Outils rapides, oracles d'improvisation, PNJs prêts à l'emploi
- **Contraintes** : Temps limité, besoin d'efficacité
- **Usage principal** : Mode "sur le pouce" + gestion à moyen terme

### 2. **Sam - Joueur Solo** 🎲
- **Profil** : Joue en solitaire, gère ses propres campagnes
- **Besoins** : Documents pour suivi (journaux), oracles narratifs, personnages
- **Contraintes** : Autonomie complète, pas de MJ pour l'aider
- **Usage principal** : Gestion à moyen terme avec compte

### 3. **Casey - Utilisateur Occasionnel** ⚡
- **Profil** : Besoin ponctuel, usage sporadique
- **Besoins** : Accès immédiat sans friction, récupère ce qu'il faut
- **Contraintes** : Pas d'engagement, veut partir rapidement
- **Usage principal** : Mode anonyme exclusivement

### 4. **Félix - Administrateur/Créateur** 👑
- **Profil** : Créateur du site + utilisateur (MJ + joueur solo)
- **Besoins** : Gestion du site + utilisation personnelle + modération
- **Contraintes** : Vision produit + besoins utilisateur final
- **Usage principal** : Administration + usage complet du site

## Concepts Produit Fondamentaux

### 2 Modes d'Usage
1. **⚡ "Sur le pouce"** - Mode anonyme
   - Besoin immédiat, utilisation rapide
   - Génération de document, récupération, départ
   - Pas de compte nécessaire
   - Documents stockés temporairement (non récupérables)

2. **📚 "Gestion à moyen terme"** - Avec compte
   - Sauvegarde personnages et documents
   - Tableau de bord personnel
   - Partage avec la communauté JDR
   - Evolution et réutilisation des créations

### Document vs Personnage
- **Document** : PDF généré (CHARACTER, TOWN, GROUP, ORGANIZATION, DANGER)
  - Usage immédiat ou sauvegarde long terme
  - Partage possible avec la communauté
  - Visibilité modulable (privé/public)

- **Personnage** : Données sauvegardées par un utilisateur connecté
  - Base pour générer des documents CHARACTER
  - Réutilisables et évolutifs
  - Gestion depuis tableau de bord

### Types d'Utilisateurs
- **Guest/Anonyme** : Mode "sur le pouce" exclusivement
- **Utilisateur connecté** : Gestion à moyen terme + partage communautaire
- **Premium** : Statut temporel (1€ = 1 mois) - création d'oracles et personnalisation PDF
- **Admin** : Gestion site + modération communauté

## Modèle Économique

### Philosophie : Contribution Équitable et Transparente

**Principe fondamental :** Un modèle freemium temporel où **1€ = 1 mois de premium**.

**Accès Gratuit :**
- Création illimitée de documents PDF
- Utilisation des oracles officiels
- Mode anonyme complet
- Sauvegarde et gestion des personnages

**Premium Temporel :**
- **Activation** : 1€ donné = 1 mois premium
- **Cumul** : Les dons s'additionnent (ex: 12€ = 1 an)
- **Avantages** :
  - Création d'oracles personnalisés
  - Personnalisation PDF (polices, couleurs, logos)
  - Templates exclusifs
  - Statistiques avancées

*Voir documentation complète : 08-systeme-premium.md*

## Roadmap par Release

### 🚀 **MVP (v1.0) - Fondations** ⬅️ **MILESTONE 1**

**Objectif :** Valider l'usage "sur le pouce" + gestion à moyen terme

#### Fonctionnalités Prioritaires MVP :

1. **Mode anonyme "sur le pouce"** (Casey + Alex) 
   - Accès direct sans inscription aux outils
   - Génération de tous types de documents
   - Oracles contextuels immédiatement disponibles
   - Téléchargement PDF immédiat

2. **5 Types de documents opérationnels** (Alex + Sam)
   - CHARACTER : Fiches personnages
   - ORGANIZATION : Listes de PNJs (crucial pour MJs)
   - TOWN/GROUP/DANGER : Selon système JDR
   - GENERIQUE : Journaux pour joueurs solo
   - Au moins Monsterhearts complet

3. **Oracles contextuelle** (Alex + Sam) - **Aussi important que documents**
   - Générateurs par système JDR
   - Tables d'inspiration narrative
   - Utilisables anonymement
   - Aide à l'improvisation en partie

4. **Gestion à moyen terme optionnelle** (Sam + Félix)
   - Inscription simple pour sauvegarde
   - Tableau de bord personnel
   - Réutilisation des créations
   - Base pour fonctionnalités communautaires

#### Critères de Succès MVP :
- [ ] Casey peut créer un document et partir en **< 3 minutes**
- [ ] Alex peut générer PNJs + oracles pour sa partie de ce soir
- [ ] Sam peut créer son journal de campagne solo
- [ ] Félix peut administrer et utiliser comme joueur
- [ ] **Mode anonyme fonctionne parfaitement** (crucial)

### 📈 **v1.1 - Communauté JDR (Boîte à Outils Collaborative)**

**Objectif :** Valoriser les créations sans créer un réseau social

**Fonctionnalités :**
- Visibilité modulable des documents (privé/public au choix du membre)
- Système de votes sur documents partagés publiquement
- Pages "Les plus plébiscités" par système JDR
- Pages profil membre avec créations publiques

**Philosophie :** Brumisater fournit les outils, les joueurs s'organisent ailleurs (Discord, etc.)

### 🔮 **v1.2 - Oracles Collaboratifs**

**Objectif :** Enrichissement collaboratif des outils d'inspiration

**Fonctionnalités :**
- Personnalisation d'oracles existants (fork comme Chartopia)
- Partage des oracles personnalisés
- Système de votes sur oracles
- Système premium temporel (1€ = 1 mois)

### 💎 **v2.0 - Écosystème Complet et API Publique**

**Objectif :** Hub central avec API pour intégrations externes

**Fonctionnalités :**
- Support multi-systèmes complet (5 systèmes finalisés)
- **API publique RESTful** : Accès oracles et documents via API
- **SDK intégrations** : Outils pour développeurs tiers
- **Bot Discord** : Dépôt séparé utilisant l'API pour oracles
- **Webhooks** : Notifications pour applications externes
- Monétisation et partenariats éditeurs

## Métriques de Succès

### 📊 Métriques Produit (MVP)
- **Usage anonyme réussi** : > 80% (crucial pour "sur le pouce")
- **Temps création document** : < 3 minutes (mode anonyme)
- **Conversion création → PDF** : > 70%
- **Utilisation oracles** : > 50% des sessions (aussi important que documents)

### ⚡ Métriques Techniques (MVP)
- **Disponibilité** : > 99% (crucial pour usage ponctuel)
- **Temps réponse moyen** : < 2s (impatience mode "sur le pouce")
- **Génération PDF** : < 10s
- **Taux d'erreur** : < 1%

### 👥 Métriques Communauté (v1.1+)
- **Documents partagés publiquement** : > 10% des créations avec compte
- **Votes communautaires** : Engagement actif sur documents
- **Pages vues communautaires** : Trafic sur sections par système
- **Rétention utilisateurs avec compte** : > 40% à 30 jours

### 💰 Métriques Business (Long terme)
- **Utilisateurs actifs mensuels** : Croissance constante
- **Ratio anonyme/connecté** : Équilibre sain (ex: 60/40)
- **Engagement communautaire** : Mesure vitalité par système JDR
- **Conversion premium** : > 5% des membres actifs
- **Durée moyenne premium** : 4-6 mois par utilisateur

## Définition de Done - MVP

### ✅ **MVP Terminé Quand :**

1. **Mode "Sur le Pouce" Parfait**
   - Casey peut générer n'importe quel document anonymement en < 3min
   - Oracles immédiatement accessibles sans inscription
   - Téléchargement PDF instantané et de qualité

2. **Usage MJ/Solo Validé**
   - Alex peut préparer sa partie (PNJs + oracles) efficacement  
   - Sam peut créer son journal de campagne solo avec documents génériques
   - Félix peut administrer ET utiliser comme joueur

3. **Fonctionnalités Cœur Complètes**
   - 5 types de documents opérationnels (au moins sur Monsterhearts)
   - Oracles contextuels par système JDR
   - Mode anonyme + gestion à moyen terme avec compte
   - Interface adaptée aux 2 modes d'usage

4. **Qualité et Performance**
   - Usage anonyme > 80% de réussite
   - Temps création < 3min en mode anonyme
   - Performance stable (< 2s réponse, > 99% disponibilité)
   - Tests automatisés couvrent les 2 parcours principaux

5. **Base Communautaire**
   - Architecture prête pour fonctionnalités v1.1 (partage, votes)
   - Distinction claire documents privés/publics
   - Modération administrative fonctionnelle

---

**Cette vision recentrée sur les MJs et joueurs solo des communautés JDR brumisa3 guide le développement d'un MVP réellement utile et différenciant.**