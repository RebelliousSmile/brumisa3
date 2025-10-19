# Onboarding Utilisateur - Brumisa3

## 1. Vue d'Ensemble

### Définition
L'onboarding (First Time User Experience - FTUE) est l'expérience de première utilisation de Brumisa3. C'est le moment critique où un nouveau visiteur découvre l'outil, comprend sa valeur, et décide de l'adopter.

### Objectifs de Performance
- **Compréhension immédiate** : Moins de 5 secondes pour comprendre ce que fait Brumisa3
- **Premier playspace** : Moins de 60 secondes pour créer son premier playspace
- **Premier personnage** : Moins de 10 minutes pour créer un personnage complet
- **Taux de complétion cible** : Plus de 80% des utilisateurs terminent le wizard playspace

### Importance Stratégique
L'onboarding détermine le taux d'adoption de Brumisa3. Un onboarding fluide et sans friction est essentiel pour :
- Convertir les visiteurs en utilisateurs actifs (objectif : 60% de conversion)
- Réduire l'abandon précoce (moins de 20% d'abandon avant le premier personnage)
- Générer du bouche-à-oreille positif
- Favoriser la conversion guest vers authentifié (15% à 30 jours)

### Principe Fondamental
**Pas de friction, pas d'inscription forcée**. L'utilisateur peut utiliser Brumisa3 immédiatement en mode guest, sans créer de compte. La création de compte est proposée après démonstration de valeur.

---

## 2. User Stories Onboarding

### US-18.1 : Découverte de Brumisa3

**En tant que** Léa (première visite)
**Je veux** comprendre immédiatement ce que fait Brumisa3
**Afin de** décider si c'est l'outil qu'il me faut pour jouer à City of Mist

**Contexte**
Léa, 28 ans, graphiste et joueuse solo de JDR, arrive sur brumisa3.com via :
- Google "city of mist character creator"
- Recommandation sur Discord City of Mist FR
- Lien partagé sur Reddit r/cityofmist

Elle n'a jamais utilisé l'outil et doit décider en quelques secondes si ça vaut le coup de rester.

**Critères d'acceptation**
- [ ] Page d'accueil avec value proposition claire (compréhension en moins de 5 secondes)
- [ ] Exemples visuels attractifs (screenshots de personnages LITM, playspaces)
- [ ] CTA "Commencer" visible sans scroll (above the fold)
- [ ] Pas de paywall ou d'inscription forcée avant utilisation
- [ ] Message clair "100% gratuit, sans publicité"
- [ ] Mention du mode guest (utilisable immédiatement sans compte)
- [ ] Lien "En savoir plus" vers documentation complète (optionnel)

**Règles métier**
1. La value proposition doit mentionner explicitement "City of Mist" et "Mist Engine"
2. Les screenshots doivent montrer des personnages réels (pas de mockups vides)
3. Le CTA principal doit être "Commencer" (pas "S'inscrire" ou "Créer un compte")
4. Aucun élément ne doit suggérer un coût ou une limitation
5. Le temps de chargement de la page d'accueil doit être inférieur à 1 seconde

**Exemple concret**
```
Timeline : Première visite de Léa

0:00 - Léa tape "city of mist character creator" dans Google
0:02 - Clique sur le résultat "Brumisa3 - L'outil officieux pour City of Mist"
0:03 - Page d'accueil se charge (850ms)
0:05 - Léa lit le titre "L'outil officieux pour jouer avec City of Mist et Mist Engine"
0:08 - Voit screenshot d'un personnage LITM avec Theme Cards visuelles
0:10 - Pense "C'est exactement ce que je cherche"
0:12 - Remarque "100% gratuit, sans inscription requise"
0:15 - Clique sur CTA "Commencer"
0:16 - Le wizard playspace s'affiche

Résultat : Léa a compris la valeur en 13 secondes et décide de tester
```

---

### US-18.2 : Wizard Création Premier Playspace

**En tant que** Léa (nouvelle utilisatrice)
**Je veux** créer mon premier playspace guidée étape par étape
**Afin de** commencer à jouer rapidement sans être perdue

**Contexte**
Léa vient de cliquer sur "Commencer" depuis la page d'accueil. Elle découvre le concept de "playspace" (qu'elle ne connaît pas forcément). Le wizard doit la guider sans la submerger d'informations.

**Critères d'acceptation**
- [ ] Wizard en 4 étapes maximum (Système, Hack, Univers, Confirmation)
- [ ] Durée totale inférieure à 60 secondes
- [ ] Sélection par défaut intelligente à chaque étape (Mist Engine, LITM, Univers Standard LITM)
- [ ] Possibilité de "skip" en gardant les valeurs par défaut
- [ ] Barre de progression visible (1/4, 2/4, 3/4, 4/4)
- [ ] Explications courtes (moins de 20 mots par étape)
- [ ] Bouton "Retour" fonctionnel à chaque étape (sauf étape 1)
- [ ] Sauvegarde automatique en localStorage (mode guest)
- [ ] Validation non bloquante (warnings visuels, pas d'erreurs critiques)
- [ ] Design responsive (desktop MVP, mobile v1.1)

**Règles métier**
1. **Étape 1 - Système** : Choix entre "Mist Engine" (recommandé) et "City of Mist"
2. **Étape 2 - Hack** : Si Mist Engine choisi, proposer "Legends in the Mist" (recommandé) et "Otherscape"
3. **Étape 3 - Univers** : Si LITM choisi, proposer "Standard LITM" (recommandé) et "Créer univers personnalisé" (désactivé MVP, v2.1)
4. **Étape 4 - Nom** : Champ texte libre (40 caractères max), description optionnelle (200 caractères max)
5. Le playspace est créé en localStorage avec un UUID généré côté client
6. Redirection automatique vers `/playspaces/{id}/characters` après création
7. Si l'utilisateur ferme le navigateur en cours de wizard, la progression est perdue (pas de sauvegarde partielle)

**Performance**
- Transition entre étapes : moins de 200ms
- Sauvegarde localStorage : moins de 100ms
- Temps total du wizard : moins de 60s (objectif : 30s en moyenne)

**Exemple concret**
```
Timeline : Léa crée son premier playspace

0:00 - Léa clique "Commencer" sur page d'accueil
0:01 - Wizard s'affiche, étape 1/4 "Quel système ?"
      [●○○○] Création de votre playspace

      Quel système voulez-vous utiliser ?

      (○) Mist Engine (Legends in the Mist, Otherscape) [Recommandé]
      ( ) City of Mist (système original)

      [Aide : Un système définit les règles de base du jeu]

      [Suivant →]

0:05 - Léa garde "Mist Engine" sélectionné par défaut
0:06 - Clique "Suivant"
0:07 - Étape 2/4 s'affiche (transition 180ms)

      [●●○○] Création de votre playspace

      Quel hack du Mist Engine ?

      (○) Legends in the Mist (heroic fantasy) [Recommandé]
      ( ) Otherscape (science-fiction)

      [Aide : Un hack adapte les règles à un genre spécifique]

      [← Retour] [Suivant →]

0:10 - Léa garde "Legends in the Mist" sélectionné
0:11 - Clique "Suivant"
0:12 - Étape 3/4 s'affiche

      [●●●○] Création de votre playspace

      Dans quel univers jouer ?

      (○) Standard LITM (univers par défaut) [Recommandé]
      ( ) Créer mon univers personnalisé [Disponible v2.1]

      [Aide : L'univers définit les dangers, PNJs et lieux]

      [← Retour] [Suivant →]

0:15 - Léa garde "Standard LITM" sélectionné
0:16 - Clique "Suivant"
0:17 - Étape 4/4 s'affiche

      [●●●●] Création de votre playspace

      Donnez un nom à votre playspace :
      [________________________________]
      (ex: "Campagne d'Aria", "Legends of Eridonia")

      Description (optionnelle) :
      [________________________________]
      [________________________________]

      [← Retour] [Créer mon playspace !]

0:20 - Léa tape "Ma Première Aventure LITM"
0:28 - Laisse la description vide
0:29 - Clique "Créer mon playspace !"
0:30 - Loader (sauvegarde localStorage, 85ms)
0:31 - Animation succès (confettis 1s)
0:32 - Redirection vers /playspaces/abc-123/characters

Résultat : Playspace créé en 32 secondes, Léa est prête à créer son premier personnage
```

---

### US-18.3 : Tutoriel Interactif Premier Personnage

**En tant que** Léa (playspace créé)
**Je veux** être guidée pour créer mon premier personnage
**Afin de** comprendre les concepts du Mist Engine (Theme Cards, Hero Card, Trackers)

**Contexte**
Léa vient de créer son playspace "Ma Première Aventure LITM" et arrive sur la page "Personnages" qui est vide. Elle découvre l'interface de création de personnage qui comporte plusieurs concepts nouveaux.

**Critères d'acceptation**
- [ ] Message d'encouragement "Créons votre premier personnage !" au chargement de la page vide
- [ ] Tooltips contextuels sur les concepts clés (Theme Cards, Hero Card, Trackers)
- [ ] Exemples pré-remplis cliquables pour auto-fill (optionnel, accélère la création)
- [ ] Validation douce (warnings visuels, pas d'erreurs bloquantes en mode MVP)
- [ ] Durée cible inférieure à 10 minutes pour un personnage complet
- [ ] Célébration à la fin (animation confettis, message positif)
- [ ] Possibilité de sauvegarder à tout moment (brouillon)
- [ ] Lien "Besoin d'aide ?" vers documentation LITM

**Règles métier**
1. Un personnage LITM MVP comprend :
   - Nom (obligatoire, 40 caractères max)
   - Description courte (optionnelle, 200 caractères max)
   - Minimum 2 Theme Cards (maximum 4 en MVP)
   - 1 Hero Card (optionnelle en MVP)
   - Trackers initialisés automatiquement (Status, Story Tags, Story Themes)
2. Les Theme Cards doivent avoir :
   - Titre (obligatoire, 30 caractères max)
   - Type (Mythos ou Logos)
   - Au moins 1 Power Tag
   - Au moins 1 Weakness Tag
3. La Hero Card contient :
   - Relations (0 à 4 en MVP)
   - Quintessences (optionnelles)
4. Sauvegarde automatique toutes les 30 secondes (localStorage ou BDD)
5. Le personnage est valide même s'il n'est pas 100% complet (philosophie MVP)

**Performance**
- Chargement page création personnage : moins de 500ms
- Sauvegarde brouillon : moins de 200ms
- Validation Zod côté client : moins de 50ms

**Tooltips Contextuels**
```
Theme Card : "Une facette de votre personnage. Les Mythos représentent
vos pouvoirs mystiques, les Logos votre vie normale."

Power Tag : "Ce que cette facette vous permet de faire. Ex: 'Téléportation
des ombres', 'Expert en arts martiaux'."

Weakness Tag : "Les limites ou dangers de cette facette. Ex: 'Instable en
pleine lumière', 'Code d'honneur rigide'."

Hero Card : "Le cœur de votre personnage : vos relations et ce qui vous
définit vraiment."
```

**Exemples Pré-remplis Cliquables**
```
[Exemple : Rôdeur des Ombres] (cliquer pour auto-fill)
→ Theme Card Mythos "Shadow Walker"
  Power Tags : "Téléportation des ombres", "Vision nocturne"
  Weakness Tags : "Vulnérable à la lumière", "Laisse des traces d'ombre"

[Exemple : Détective Privé] (cliquer pour auto-fill)
→ Theme Card Logos "Private Eye"
  Power Tags : "Réseau d'informateurs", "Déduction brillante"
  Weakness Tags : "Trop curieux", "Dettes de jeu"
```

**Exemple concret**
```
Timeline : Léa crée son premier personnage

0:00 - Léa arrive sur /playspaces/abc-123/characters (page vide)
0:02 - Message s'affiche :
       "Bienvenue dans votre playspace ! Créons votre premier personnage."
       [Créer mon premier personnage]

0:05 - Léa clique sur le bouton
0:06 - Formulaire de création s'affiche

       Créer un personnage

       Nom du personnage *
       [________________________]

       Description courte
       [________________________]
       [________________________]

       [Voir exemples de personnages LITM]

0:10 - Léa tape "Aria Shadowdancer"
0:30 - Description : "Une rôdeuse urbaine qui manipule les ombres"
0:32 - Scroll vers section "Theme Cards"

       Theme Cards (minimum 2, maximum 4)

       [+ Ajouter une Theme Card]

       [Aide : Une Theme Card représente une facette de votre personnage]
       [Exemples : Rôdeur des Ombres | Détective Privé | Hacker]

0:35 - Léa clique sur exemple "Rôdeur des Ombres"
0:36 - Theme Card pré-remplie apparaît :

       Theme Card 1
       Titre : Shadow Walker
       Type : (●) Mythos  ( ) Logos

       Power Tags :
       - Téléportation des ombres [x]
       - Vision nocturne [x]
       [+ Ajouter Power Tag]

       Weakness Tags :
       - Vulnérable à la lumière [x]
       - Laisse des traces d'ombre [x]
       [+ Ajouter Weakness Tag]

0:45 - Léa personnalise légèrement (renomme un tag)
1:00 - Clique "+ Ajouter une Theme Card"
1:05 - Crée manuellement une Theme Card Logos "Street Fighter"
       Power Tags : "Arts martiaux", "Contacts de rue"
       Weakness Tags : "Recherchée par la police", "Impulsive"

2:30 - Scroll vers "Hero Card"

       Hero Card (optionnel)

       Relations (qui compte pour votre personnage ?)
       [+ Ajouter une relation]

       [Exemple : "Marcus, mentor disparu" | "Lila, sœur protégée"]

2:35 - Léa clique exemple "Lila, sœur protégée"
2:36 - Relation pré-remplie :
       Nom : Lila
       Type : Famille
       Description : Ma petite sœur que je dois protéger du monde mystique

2:50 - Léa ajoute une 2e relation manuellement :
       Nom : Marcus
       Type : Mentor
       Description : Mon mentor disparu dans le Mist il y a 2 ans

3:30 - Scroll vers "Trackers" (section pré-remplie automatiquement)

       Trackers

       [i] Les trackers sont initialisés automatiquement selon LITM

       Status Tracker : 0/3 (État général du personnage)
       Story Tags : [] (Tags narratifs temporaires)
       Story Themes : [] (Thèmes narratifs en cours)

3:35 - Léa lit les tooltips, comprend que c'est géré en jeu
3:40 - Scroll vers le bas, bouton "Sauvegarder le personnage"

3:45 - Léa clique "Sauvegarder le personnage"
3:46 - Validation Zod (client-side, 42ms) : OK
3:47 - Sauvegarde localStorage (155ms)
3:48 - Animation confettis + message :
       "Aria Shadowdancer est prête pour l'aventure !"
3:50 - Redirection vers liste personnages
3:51 - Aria apparaît dans la liste avec miniature

Résultat : Premier personnage créé en 3 min 51s, Léa comprend les concepts LITM
```

---

### US-18.4 : Proposition Création Compte

**En tant que** Léa (utilisatrice guest active)
**Je veux** être invitée à créer un compte après avoir utilisé l'app
**Afin de** sauvegarder mes données en cloud et accéder depuis d'autres appareils

**Contexte**
Léa utilise Brumisa3 en mode guest depuis plusieurs jours. Elle a créé 2-3 personnages et revient régulièrement. L'application doit lui proposer de créer un compte pour sauvegarder ses données, sans être intrusive.

**Critères d'acceptation**
- [ ] Modal non-intrusive affichée après 5 connexions OU 3 personnages créés (le premier atteint)
- [ ] Value proposition claire (sauvegarde cloud, playspaces illimités, accès multi-appareils)
- [ ] Bouton "Plus tard" visible et fonctionnel (ferme la modal)
- [ ] Pas de perte de données si l'utilisateur refuse
- [ ] Ne pas afficher plus d'une fois par semaine (localStorage : lastAccountPrompt)
- [ ] Tracking analytics (event : account_prompt_shown, account_prompt_accepted, account_prompt_dismissed)
- [ ] Lien discret dans le header "Créer un compte" (toujours accessible, pas seulement via modal)

**Règles métier**
1. **Déclencheurs** (OR, pas AND) :
   - Après 5 ouvertures de l'application (tracked via localStorage)
   - Après création du 3ème personnage
2. **Fréquence** : Maximum 1 fois par semaine si refusé
3. **Exceptions** : Ne pas afficher si :
   - Utilisateur déjà authentifié
   - Modal déjà affichée il y a moins de 7 jours
   - Utilisateur a cliqué "Ne plus me demander" (localStorage : neverAskAccount)
4. **Données** : Les données guest restent en localStorage même après refus
5. **Conversion** : Si l'utilisateur accepte, rediriger vers page `/register` avec flag `?migration=true`

**Performance**
- Chargement modal : moins de 100ms
- Vérification conditions déclenchement : moins de 50ms (localStorage read)

**Design Modal**
```
+----------------------------------------------------------+
|                                                      [x] |
|  Sauvegardez vos personnages en toute sécurité          |
|                                                          |
|  Vous avez créé 3 personnages. Créez un compte gratuit  |
|  pour :                                                  |
|                                                          |
|  ✓ Sauvegarde automatique en cloud                      |
|  ✓ Playspaces illimités (actuellement limité à 3)       |
|  ✓ Accès depuis n'importe quel appareil                 |
|  ✓ Toujours 100% gratuit, sans publicité                |
|                                                          |
|  [Créer mon compte gratuit]  [Plus tard]                |
|                                                          |
|  [Ne plus me demander]                                   |
+----------------------------------------------------------+
```

**Exemple concret**
```
Timeline : Léa utilise Brumisa3 sur plusieurs jours

Jour 1 (08:00) - Première visite
  - Léa crée playspace "Ma Première Aventure LITM"
  - Crée personnage "Aria Shadowdancer"
  - localStorage : { visits: 1, charactersCount: 1 }

Jour 1 (14:30) - Deuxième visite (même jour)
  - Léa crée personnage "Kael Firebrand"
  - localStorage : { visits: 2, charactersCount: 2 }

Jour 3 (19:00) - Troisième visite
  - Léa consulte ses personnages, fait quelques modifications
  - localStorage : { visits: 3, charactersCount: 2 }

Jour 5 (20:30) - Quatrième visite
  - Léa crée personnage "Zara Stormcaller"
  - localStorage : { visits: 4, charactersCount: 3 }
  - DÉCLENCHEUR : charactersCount === 3
  - Modal s'affiche 2 secondes après sauvegarde du personnage

Modal :
  "Vous avez créé 3 personnages. Créez un compte gratuit pour :
   ✓ Sauvegarde automatique en cloud
   ✓ Playspaces illimités (actuellement limité à 3)
   ✓ Accès depuis n'importe quel appareil"

  [Créer mon compte gratuit]  [Plus tard]

Léa hésite, clique "Plus tard"
  - Modal se ferme
  - localStorage : { ..., lastAccountPrompt: "2025-01-19" }
  - Analytics : account_prompt_dismissed

Jour 7 (18:00) - Cinquième visite
  - Léa crée 4ème personnage
  - Modal ne s'affiche PAS (moins de 7 jours depuis dernier refus)

Jour 13 (21:00) - Huitième visite
  - Léa crée 5ème personnage
  - Modal s'affiche à nouveau (7+ jours écoulés)
  - Léa se dit "OK, j'utilise assez l'outil"
  - Clique "Créer mon compte gratuit"
  - Analytics : account_prompt_accepted
  - Redirection vers /register?migration=true
  - Formulaire pré-rempli avec message :
    "Vos 5 personnages seront automatiquement sauvegardés en cloud"

Résultat : Conversion guest → authentifié après démonstration de valeur (13 jours)
```

---

## 3. Règles Métier Onboarding

### 3.1 Mode Guest par Défaut
**Principe** : Utilisateur peut utiliser Brumisa3 immédiatement sans créer de compte.

**Implémentation** :
- Aucune page d'inscription avant d'accéder à l'application
- Toutes les données stockées en localStorage (playspaces, personnages, theme cards, hero cards, trackers)
- Limitation soft : 3 playspaces maximum en mode guest (mais illimité en personnages par playspace)
- Message informatif si limite atteinte : "Créez un compte gratuit pour créer plus de playspaces"

**Justification** : Réduire friction, démontrer valeur avant demander engagement.

---

### 3.2 Pas de Friction
**Principe** : Aucune inscription forcée avant minimum 5 minutes d'utilisation.

**Implémentation** :
- Page d'accueil accessible sans authentification
- Wizard playspace accessible sans authentification
- Création personnages accessible sans authentification
- Consultation oracles accessible sans authentification
- Export PDF fonctionnel en mode guest (watermark "Créé avec Brumisa3")

**Exceptions** : Fonctionnalités réservées aux authentifiés (v1.1+) :
- Partage playspaces avec d'autres utilisateurs
- Import/export vers cloud
- Synchronisation multi-appareils

---

### 3.3 Configuration par Défaut Intelligente
**Principe** : Minimiser les décisions cognitives, proposer le chemin optimal.

**Valeurs par défaut** :
- **Système** : Mist Engine (le plus récent, le plus supporté)
- **Hack** : Legends in the Mist (le plus populaire, MVP focus)
- **Univers** : Standard LITM (univers par défaut du hack)
- **Nom playspace** : "Mon Playspace LITM" (pré-rempli, modifiable)

**Justification** : 90% des utilisateurs MVP joueront à LITM (persona Léa).

---

### 3.4 Sauvegarde Automatique
**Principe** : Utilisateur ne doit jamais perdre ses données par accident.

**Implémentation** :
- **Mode guest** : Sauvegarde localStorage après chaque action (debounced 500ms)
- **Mode authentifié** : Sauvegarde BDD après chaque action (debounced 1s) + localStorage backup
- **Brouillons** : Personnages non finalisés sauvegardés automatiquement
- **Versioning** : localStorage conserve dernière version valide (rollback si corruption)

**Limites** :
- localStorage limité à ~5MB par domaine (estimation : 50-100 personnages max)
- Pas de synchronisation multi-onglets en mode guest (limitation technique localStorage)

---

### 3.5 Progression Visible
**Principe** : Utilisateur doit toujours savoir où il en est.

**Éléments visuels** :
- Barre de progression wizard : [●●○○] 2/4
- Numérotation explicite : "Étape 2 sur 4"
- Breadcrumbs : Accueil > Playspaces > Ma Première Aventure > Personnages > Aria
- Messages d'encouragement : "Vous y êtes presque !", "Parfait, continuons"
- Compteurs : "3 personnages créés", "2 playspaces actifs"

---

### 3.6 Exemples Concrets
**Principe** : Toujours fournir des exemples cliquables pour accélérer la création.

**Implémentation** :
- Bibliothèque d'exemples pré-remplis (10 Theme Cards types, 5 Hero Cards types)
- Boutons "Utiliser cet exemple" → auto-fill formulaire
- Possibilité de modifier après auto-fill
- Exemples variés (Mythos/Logos, combat/social/investigation)

**Exemples MVP** :
```
Theme Cards Mythos :
- Shadow Walker (téléportation ombres)
- Flame Wielder (manipulation feu)
- Mind Reader (télépathie)

Theme Cards Logos :
- Private Eye (détective)
- Street Fighter (combattant)
- Tech Wizard (hacker)

Hero Cards :
- Protecteur (focus : relations familiales)
- Vengeur (focus : justice personnelle)
- Chercheur (focus : quête de vérité)
```

---

### 3.7 Célébrations
**Principe** : Renforcer positivement chaque milestone atteint.

**Implémentation** :
- **Premier playspace créé** : Animation confettis (1s) + message "Votre univers de jeu est prêt !"
- **Premier personnage créé** : Animation confettis + message personnalisé "Aria Shadowdancer est prête pour l'aventure !"
- **3 personnages créés** : Badge débloqué "Créateur d'équipe" (v1.1 gamification)
- **Première session de jeu** : Message "Bonne partie !" au premier lancer d'oracle

**Justification** : Gamification soft, renforcement positif, sentiment d'accomplissement.

---

## 4. Maquettes UI/UX

### 4.1 Page d'Accueil
```
+------------------------------------------------------------------+
|  [Logo Brumisa3]              Oracles  Documentation    [FR ▼]  |
+------------------------------------------------------------------+
|                                                                  |
|              L'outil officieux pour jouer avec                   |
|            City of Mist et le Mist Engine                        |
|                                                                  |
|  Créez vos personnages, gérez vos playspaces, consultez les     |
|  oracles. 100% gratuit, 100% sans publicité.                    |
|                                                                  |
|  +--------------------------------------------------------+      |
|  |                                                        |      |
|  |  [Screenshot : Personnage LITM avec Theme Cards]      |      |
|  |  Aria Shadowdancer - Shadow Walker + Street Fighter   |      |
|  |                                                        |      |
|  +--------------------------------------------------------+      |
|                                                                  |
|            [Commencer (sans inscription)]                        |
|                                                                  |
|              [En savoir plus sur Brumisa3]                       |
|                                                                  |
+------------------------------------------------------------------+
|  Fonctionnalités :                                               |
|  ✓ Création de personnages LITM, Otherscape, City of Mist       |
|  ✓ Gestion de playspaces (univers de jeu)                       |
|  ✓ 32 oracles pour le jeu en solo                               |
|  ✓ Export PDF de vos fiches de personnages                      |
|  ✓ Mode guest (utilisable sans compte)                          |
+------------------------------------------------------------------+
|  Propulsé par la communauté - Soutenez-nous via OpenCollective  |
|  Licence MIT - Code source sur GitHub                           |
+------------------------------------------------------------------+
```

---

### 4.2 Wizard Playspace - Étape 1/4
```
+------------------------------------------------------------------+
|  [Logo Brumisa3]                                          [x]    |
+------------------------------------------------------------------+
|                                                                  |
|  Création de votre playspace                             [●○○○] |
|                                                           1/4    |
|                                                                  |
|  Quel système voulez-vous utiliser ?                            |
|                                                                  |
|  +----------------------------------------------------------+   |
|  | (●) Mist Engine                           [Recommandé]   |   |
|  |     (Legends in the Mist, Otherscape)                    |   |
|  +----------------------------------------------------------+   |
|                                                                  |
|  +----------------------------------------------------------+   |
|  | ( ) City of Mist                                         |   |
|  |     (système original 2016)                              |   |
|  +----------------------------------------------------------+   |
|                                                                  |
|  [i] Un système définit les règles de base du jeu               |
|                                                                  |
|                                                                  |
|                                        [Suivant →]               |
|                                                                  |
+------------------------------------------------------------------+
```

---

### 4.3 Wizard Playspace - Étape 2/4
```
+------------------------------------------------------------------+
|  [Logo Brumisa3]                                          [x]    |
+------------------------------------------------------------------+
|                                                                  |
|  Création de votre playspace                             [●●○○] |
|                                                           2/4    |
|                                                                  |
|  Quel hack du Mist Engine ?                                     |
|                                                                  |
|  +----------------------------------------------------------+   |
|  | (●) Legends in the Mist                   [Recommandé]   |   |
|  |     Heroic fantasy urbaine                               |   |
|  +----------------------------------------------------------+   |
|                                                                  |
|  +----------------------------------------------------------+   |
|  | ( ) Otherscape                                           |   |
|  |     Science-fiction et exploration spatiale              |   |
|  +----------------------------------------------------------+   |
|                                                                  |
|  [i] Un hack adapte les règles à un genre spécifique            |
|                                                                  |
|                                                                  |
|  [← Retour]                                  [Suivant →]        |
|                                                                  |
+------------------------------------------------------------------+
```

---

### 4.4 Wizard Playspace - Étape 3/4
```
+------------------------------------------------------------------+
|  [Logo Brumisa3]                                          [x]    |
+------------------------------------------------------------------+
|                                                                  |
|  Création de votre playspace                             [●●●○] |
|                                                           3/4    |
|                                                                  |
|  Dans quel univers jouer ?                                      |
|                                                                  |
|  +----------------------------------------------------------+   |
|  | (●) Standard LITM                         [Recommandé]   |   |
|  |     Univers par défaut de Legends in the Mist            |   |
|  +----------------------------------------------------------+   |
|                                                                  |
|  +----------------------------------------------------------+   |
|  | ( ) Créer mon univers personnalisé                       |   |
|  |     [Disponible en v2.1]                                 |   |
|  +----------------------------------------------------------+   |
|                                                                  |
|  [i] L'univers définit les dangers, PNJs et lieux               |
|                                                                  |
|                                                                  |
|  [← Retour]                                  [Suivant →]        |
|                                                                  |
+------------------------------------------------------------------+
```

---

### 4.5 Wizard Playspace - Étape 4/4
```
+------------------------------------------------------------------+
|  [Logo Brumisa3]                                          [x]    |
+------------------------------------------------------------------+
|                                                                  |
|  Création de votre playspace                             [●●●●] |
|                                                           4/4    |
|                                                                  |
|  Donnez un nom à votre playspace :                              |
|                                                                  |
|  +----------------------------------------------------------+   |
|  | Ma Première Aventure LITM___________________________     |   |
|  +----------------------------------------------------------+   |
|                                                                  |
|  (ex: "Campagne d'Aria", "Legends of Eridonia")                 |
|                                                                  |
|                                                                  |
|  Description (optionnelle) :                                    |
|                                                                  |
|  +----------------------------------------------------------+   |
|  |                                                          |   |
|  |                                                          |   |
|  |                                                          |   |
|  +----------------------------------------------------------+   |
|                                                                  |
|                                                                  |
|  [← Retour]                          [Créer mon playspace !]    |
|                                                                  |
+------------------------------------------------------------------+
```

---

### 4.6 Modal Création Compte
```
+------------------------------------------------------------------+
|                                                            [x]   |
|  Sauvegardez vos personnages en toute sécurité                  |
|                                                                  |
|  Vous avez créé 3 personnages. Créez un compte gratuit pour :   |
|                                                                  |
|  ✓ Sauvegarde automatique en cloud                              |
|  ✓ Playspaces illimités (actuellement limité à 3)               |
|  ✓ Accès depuis n'importe quel appareil                         |
|  ✓ Toujours 100% gratuit, sans publicité                        |
|                                                                  |
|                                                                  |
|    [Créer mon compte gratuit]        [Plus tard]                |
|                                                                  |
|                                                                  |
|  [Ne plus me demander]                                          |
|                                                                  |
+------------------------------------------------------------------+
```

---

## 5. Critères d'Acceptation Globaux

### 5.1 Critères Fonctionnels
- [ ] Page d'accueil avec value proposition claire (compréhension en moins de 5 secondes)
- [ ] Wizard playspace en 4 étapes, durée totale moins de 60 secondes
- [ ] Tutoriel premier personnage avec tooltips contextuels, durée moins de 10 minutes
- [ ] Proposition création compte après 5 connexions OU 3 personnages créés
- [ ] Mode guest fonctionnel sans limitations majeures (3 playspaces, personnages illimités)
- [ ] Exemples pré-remplis cliquables (10 Theme Cards, 5 Hero Cards)
- [ ] Sauvegarde automatique en localStorage (mode guest)
- [ ] Célébrations visuelles (confettis, messages positifs)
- [ ] Bouton "Retour" fonctionnel dans wizard
- [ ] Validation non bloquante (warnings, pas d'erreurs critiques)

### 5.2 Critères de Performance
- [ ] Chargement page d'accueil : moins de 1 seconde
- [ ] Transition entre étapes wizard : moins de 200ms
- [ ] Sauvegarde localStorage : moins de 100ms
- [ ] Chargement formulaire création personnage : moins de 500ms
- [ ] Validation Zod côté client : moins de 50ms
- [ ] Animation confettis : 1 seconde exactement (pas de freeze UI)

### 5.3 Critères UX
- [ ] Taux de complétion wizard playspace : supérieur à 80%
- [ ] Taux de création premier personnage : supérieur à 60%
- [ ] Taux de conversion guest → authentifié : supérieur à 15% (mesure à 30 jours)
- [ ] Aucun utilisateur bloqué (toujours possibilité de "Skip" ou "Plus tard")
- [ ] Messages d'erreur compréhensibles (pas de jargon technique)
- [ ] Design responsive desktop (mobile v1.1)
- [ ] Accessibilité : navigation clavier, contraste WCAG AA

### 5.4 Critères Techniques
- [ ] localStorage persisté entre sessions (pas de perte au refresh)
- [ ] Validation Zod côté client (schemas réutilisés côté serveur)
- [ ] Gestion erreurs localStorage (quota exceeded, corruption)
- [ ] Analytics événements clés :
  - `wizard_started` : Utilisateur démarre wizard playspace
  - `wizard_step_completed` : Étape wizard complétée (avec numéro étape)
  - `wizard_completed` : Wizard playspace terminé
  - `character_created` : Premier personnage créé
  - `account_prompt_shown` : Modal création compte affichée
  - `account_prompt_accepted` : Utilisateur accepte création compte
  - `account_prompt_dismissed` : Utilisateur refuse création compte
- [ ] Tests E2E Playwright (wizard complet, création personnage)
- [ ] Tests unitaires composables (useLocalStorage, useOnboarding)

---

## 6. Exemples Concrets

### 6.1 Scénario Optimal : Léa Découvre et Adopte Brumisa3 (30 minutes)
```
Timeline complète : Première session de Léa

0:00 - Léa cherche "city of mist character creator" sur Google
0:03 - Clique sur résultat "Brumisa3 - L'outil officieux pour City of Mist"
0:04 - Page d'accueil se charge (920ms)
0:07 - Lit le titre "L'outil officieux pour jouer avec City of Mist et Mist Engine"
0:10 - Voit screenshot d'un personnage LITM avec Theme Cards colorées
0:12 - Se dit "Exactement ce que je cherche"
0:15 - Lit "100% gratuit, sans inscription requise"
0:18 - Clique sur CTA "Commencer"

--- Wizard Playspace ---
0:19 - Wizard s'affiche, étape 1/4 "Quel système ?"
0:23 - Garde "Mist Engine" sélectionné (recommandé)
0:24 - Clique "Suivant"
0:25 - Étape 2/4 "Quel hack ?"
0:28 - Garde "Legends in the Mist" sélectionné
0:29 - Clique "Suivant"
0:30 - Étape 3/4 "Quel univers ?"
0:33 - Garde "Standard LITM" sélectionné
0:34 - Clique "Suivant"
0:35 - Étape 4/4 "Nom du playspace"
0:40 - Tape "Aria's Legends"
0:43 - Clique "Créer mon playspace !"
0:44 - Loader + sauvegarde localStorage (130ms)
0:45 - Animation confettis (1s) + message "Votre univers de jeu est prêt !"
0:46 - Redirection vers /playspaces/abc-123/characters

--- Premier Personnage ---
0:47 - Page personnages s'affiche (vide)
0:49 - Message "Bienvenue ! Créons votre premier personnage."
0:52 - Léa clique "Créer mon premier personnage"
0:53 - Formulaire création s'affiche

1:00 - Nom : "Aria Shadowdancer"
1:30 - Description : "Rôdeuse urbaine manipulant les ombres"
1:35 - Scroll vers "Theme Cards"
1:40 - Clique exemple "Rôdeur des Ombres"
1:41 - Theme Card pré-remplie apparaît (Shadow Walker, Mythos)
1:50 - Léa personnalise légèrement (renomme "Téléportation" en "Fusion avec les ombres")

2:30 - Clique "+ Ajouter une Theme Card"
2:35 - Crée manuellement "Street Fighter" (Logos)
3:00 - Power Tags : "Arts martiaux", "Réseau de contacts"
3:20 - Weakness Tags : "Recherchée", "Impulsive"

4:00 - Scroll vers "Hero Card"
4:10 - Clique exemple "Lila, sœur protégée"
4:11 - Relation pré-remplie : Lila (Famille) "Ma petite sœur à protéger"
4:40 - Ajoute 2e relation : Marcus (Mentor) "Mon mentor disparu"

5:30 - Scroll vers "Trackers" (pré-remplis automatiquement)
5:35 - Lit tooltips, comprend le système
5:45 - Clique "Sauvegarder le personnage"
5:46 - Validation Zod (48ms) : OK
5:47 - Sauvegarde localStorage (167ms)
5:48 - Animation confettis + "Aria Shadowdancer est prête pour l'aventure !"
5:50 - Redirection liste personnages
5:51 - Aria apparaît avec miniature

--- Exploration ---
6:00 - Léa explore navigation, découvre page "Oracles"
6:30 - Teste oracle "Attitude PNJ" (lance d20 → 12 "Méfiant")
7:00 - Retourne sur sa fiche personnage, fait modifications mineures
8:00 - Clique "Export PDF" (test)
8:05 - PDF généré avec watermark "Créé avec Brumisa3"
8:10 - Léa imprime le PDF, satisfaite

10:00 - Ferme navigateur, va faire autre chose

--- Jour 3 : Retour ---
Léa rouvre Brumisa3, ses données sont toujours là (localStorage persisté)
Crée 2ème personnage "Kael Firebrand" (plus rapide : 3 minutes, maîtrise l'interface)

--- Jour 5 : Conversion ---
Léa crée 3ème personnage "Zara Stormcaller"
Modal s'affiche : "Vous avez créé 3 personnages. Créez un compte gratuit..."
Léa clique "Créer mon compte gratuit"
Inscription + migration automatique
Message "3 personnages migrés avec succès"
Léa est maintenant utilisatrice authentifiée

Résultat : Conversion guest → authentifié en 5 jours, adoption réussie
```

---

### 6.2 Scénario Rapide : Léa Pressée (5 minutes)
```
Timeline : Léa veut tester rapidement

0:00 - Arrive sur Brumisa3
0:05 - Lit titre, comprend value proposition
0:10 - Clique "Commencer"

--- Wizard Express ---
0:11 - Wizard étape 1/4
0:13 - Garde valeurs par défaut (Mist Engine)
0:14 - Clique "Suivant"
0:15 - Étape 2/4, garde LITM
0:16 - Clique "Suivant"
0:17 - Étape 3/4, garde Standard LITM
0:18 - Clique "Suivant"
0:19 - Étape 4/4, garde nom par défaut "Mon Playspace LITM"
0:20 - Clique "Créer mon playspace !"
0:22 - Playspace créé, redirection

--- Personnage Express avec Exemples ---
0:23 - Clique "Créer mon premier personnage"
0:30 - Nom : "Test Perso"
0:35 - Clique exemple "Rôdeur des Ombres" → Theme Card 1 auto-fill
0:40 - Clique exemple "Détective Privé" → Theme Card 2 auto-fill
0:45 - Clique exemple "Protecteur" → Hero Card auto-fill
0:50 - Clique "Sauvegarder"
0:52 - Personnage créé (avec exemples, sans personnalisation)

Résultat : Playspace + personnage fonctionnel en 52 secondes
Léa comprend le système, reviendra personnaliser plus tard
```

---

### 6.3 Scénario Échec : Léa Abandonne (2 minutes)
```
Timeline : Onboarding échoué (contre-exemple)

0:00 - Léa arrive sur Brumisa3
0:05 - Page d'accueil confuse (pas de value proposition claire)
0:10 - Clique "Commencer" (par curiosité)
0:11 - Formulaire inscription apparaît AVANT wizard
0:15 - Léa se dit "Ils veulent mes données avant de montrer l'outil"
0:18 - Ferme l'onglet, abandonne

Résultat : Échec à cause de friction (inscription forcée)
→ DONC : MVP doit absolument éviter cette erreur
```

---

## 7. Scope MVP vs Versions Futures

### 7.1 MVP v1.0 (Priorité P0)
**Livrables** :
- Page d'accueil avec value proposition claire
- Wizard playspace 4 étapes (< 60s)
- Tooltips contextuels création personnage
- Exemples pré-remplis cliquables (10 Theme Cards, 5 Hero Cards)
- Mode guest avec localStorage (3 playspaces max)
- Sauvegarde automatique localStorage
- Proposition création compte (modal après 5 visites ou 3 personnages)
- Célébrations basiques (confettis, messages positifs)
- Analytics événements clés

**Limitations MVP** :
- Desktop only (responsive mobile v1.1)
- Pas de tutoriel interactif overlay (tooltips statiques seulement)
- Pas de vidéos explicatives intégrées
- Pas de chatbot aide contextuelle
- Pas de gamification avancée (badges v1.1)

---

### 7.2 v1.1 - Améliorations UX (Priorité P1)
**Ajouts** :
- Tutoriel interactif avec overlay (step-by-step highlights Shepherd.js)
- Vidéos explicatives courtes (30s max) intégrées dans wizard
- Design responsive mobile (wizard, création personnage)
- Gamification : badges premiers milestones
  - "Premier pas" : Playspace créé
  - "Créateur" : Premier personnage créé
  - "Équipe complète" : 3 personnages créés
  - "Narrateur" : Premier oracle lancé
- Barre de progression migration (si plus de 20 personnages)
- Export JSON automatique avant migration (backup sécurité)

---

### 7.3 v1.2 - Onboarding Otherscape (Priorité P2)
**Ajouts** :
- Exemples Otherscape-specific (Theme Cards sci-fi)
- Maquettes wizard adaptées (illustrations Otherscape)
- Tooltips Otherscape-specific (concepts différents de LITM)

---

### 7.4 v2.0 - Onboarding Personnalisé (Priorité P3)
**Ajouts** :
- Onboarding adapté par persona (Léa vs Marc vs Sophie)
  - Léa : Focus solo play, oracles, création rapide
  - Marc : Focus partage playspaces, collaboration MJ
  - Sophie : Focus création hacks, édition avancée
- A/B testing variantes wizard (analytics comparatives)
- Analytics avancées (heatmaps, session replay Hotjar)
- Chatbot aide contextuelle (IA générative)
- Wizard vocal (accessibility)

---

### 7.5 v2.1+ - Onboarding Créateurs (Priorité P4)
**Ajouts** :
- Wizard création univers personnalisé (Thomas)
- Wizard création hack personnalisé (Sophie)
- Tutoriel publication marketplace
- Onboarding contributeurs communauté

---

## 8. Métriques de Succès Onboarding

### 8.1 Métriques Quantitatives (Analytics)
**Taux de conversion funnel** :
```
100% - Visiteurs page d'accueil
 85% - Cliquent "Commencer"
 80% - Complètent wizard playspace (objectif : > 80%)
 60% - Créent premier personnage (objectif : > 60%)
 40% - Créent 2e personnage (engagement)
 15% - Créent compte (à 30 jours, objectif : > 15%)
```

**Temps moyens** :
- Compréhension value proposition : < 5s (eye-tracking)
- Complétion wizard playspace : < 60s (objectif), < 40s (idéal)
- Création premier personnage : < 10 min (objectif), < 6 min (idéal)
- Time-to-value (premier personnage jouable) : < 15 min (critique)

**Taux d'abandon** :
- Abandon page d'accueil : < 20%
- Abandon wizard (étape 1) : < 15%
- Abandon création personnage : < 30%

---

### 8.2 Métriques Qualitatives (User Testing)
**Tests utilisateurs (n=10 minimum)** :
- Compréhension value proposition : 9/10 comprennent en < 10s
- Facilité wizard : 8/10 trouvent ça "facile" ou "très facile"
- Clarté tooltips : 7/10 comprennent concepts sans aide externe
- Satisfaction globale : 8/10 recommanderaient l'outil

**Questions post-onboarding** :
1. "Avez-vous compris ce que fait Brumisa3 ?" (Oui/Non)
2. "Le wizard était-il facile à utiliser ?" (Échelle 1-5)
3. "Avez-vous eu besoin d'aide externe pour créer votre personnage ?" (Oui/Non)
4. "Recommanderiez-vous Brumisa3 à un ami ?" (NPS 0-10)

---

### 8.3 Métriques Business
**Objectifs 3 mois post-lancement** :
- 1000 utilisateurs guest actifs (minimum 1 personnage créé)
- 150 utilisateurs authentifiés (taux conversion 15%)
- 500 personnages créés (moyenne 2 par playspace)
- 50 personnages exportés en PDF (usage concret)
- 10 dons via OpenCollective (engagement fort)

**Objectifs 6 mois** :
- 5000 utilisateurs guest
- 1000 utilisateurs authentifiés (taux conversion 20%)
- 3000 personnages créés
- 500 exports PDF
- 50 dons (500 EUR total)

---

## 9. Tests et Validation

### 9.1 Tests E2E Playwright
```typescript
// tests/e2e/onboarding.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Onboarding Complet', () => {
  test('Léa crée playspace + premier personnage en < 15 min', async ({ page }) => {
    const startTime = Date.now()

    // Page d'accueil
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('City of Mist')
    await expect(page.locator('button:has-text("Commencer")')).toBeVisible()

    // Wizard playspace
    await page.click('button:has-text("Commencer")')
    await expect(page.locator('text=Création de votre playspace')).toBeVisible()

    // Étape 1/4
    await expect(page.locator('text=1/4')).toBeVisible()
    await page.click('button:has-text("Suivant")')

    // Étape 2/4
    await expect(page.locator('text=2/4')).toBeVisible()
    await page.click('button:has-text("Suivant")')

    // Étape 3/4
    await expect(page.locator('text=3/4')).toBeVisible()
    await page.click('button:has-text("Suivant")')

    // Étape 4/4
    await expect(page.locator('text=4/4')).toBeVisible()
    await page.fill('input[name="playspaceName"]', 'Test Playspace')
    await page.click('button:has-text("Créer mon playspace")')

    // Vérifier création
    await expect(page).toHaveURL(/\/playspaces\/.*\/characters/)
    await expect(page.locator('text=Créons votre premier personnage')).toBeVisible()

    // Création personnage
    await page.click('button:has-text("Créer mon premier personnage")')
    await page.fill('input[name="characterName"]', 'Aria Shadowdancer')
    await page.fill('textarea[name="description"]', 'Rôdeuse urbaine')

    // Ajouter Theme Card (exemple)
    await page.click('button:has-text("Rôdeur des Ombres")')
    await expect(page.locator('text=Shadow Walker')).toBeVisible()

    // Ajouter 2e Theme Card
    await page.click('button:has-text("Détective Privé")')

    // Sauvegarder
    await page.click('button:has-text("Sauvegarder")')
    await expect(page.locator('text=est prête pour l\'aventure')).toBeVisible()

    // Vérifier temps total
    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000 // secondes
    expect(duration).toBeLessThan(900) // 15 minutes max
  })

  test('Wizard playspace en < 60s avec valeurs par défaut', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/')
    await page.click('button:has-text("Commencer")')

    // Cliquer Suivant 3 fois (garder valeurs par défaut)
    await page.click('button:has-text("Suivant")')
    await page.click('button:has-text("Suivant")')
    await page.click('button:has-text("Suivant")')

    // Nom par défaut
    await page.click('button:has-text("Créer mon playspace")')

    await expect(page).toHaveURL(/\/playspaces\//)

    const endTime = Date.now()
    const duration = (endTime - startTime) / 1000
    expect(duration).toBeLessThan(60) // < 60s
  })
})
```

---

### 9.2 Tests Unitaires Composables
```typescript
// tests/unit/useOnboarding.test.ts

import { describe, it, expect, beforeEach } from 'vitest'
import { useOnboarding } from '~/composables/useOnboarding'

describe('useOnboarding', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('devrait détecter utilisateur nouveau (0 visites)', () => {
    const { isNewUser, visitCount } = useOnboarding()
    expect(isNewUser.value).toBe(true)
    expect(visitCount.value).toBe(0)
  })

  it('devrait incrémenter compteur visites', () => {
    const { incrementVisit, visitCount } = useOnboarding()
    incrementVisit()
    expect(visitCount.value).toBe(1)
    incrementVisit()
    expect(visitCount.value).toBe(2)
  })

  it('devrait afficher modal compte après 5 visites', () => {
    const { incrementVisit, shouldShowAccountPrompt } = useOnboarding()

    for (let i = 0; i < 4; i++) {
      incrementVisit()
      expect(shouldShowAccountPrompt.value).toBe(false)
    }

    incrementVisit() // 5ème visite
    expect(shouldShowAccountPrompt.value).toBe(true)
  })

  it('devrait afficher modal compte après 3 personnages', () => {
    const { incrementCharacterCount, shouldShowAccountPrompt } = useOnboarding()

    incrementCharacterCount()
    expect(shouldShowAccountPrompt.value).toBe(false)
    incrementCharacterCount()
    expect(shouldShowAccountPrompt.value).toBe(false)
    incrementCharacterCount() // 3ème personnage
    expect(shouldShowAccountPrompt.value).toBe(true)
  })

  it('ne devrait pas afficher modal si déjà affichée il y a < 7 jours', () => {
    const { dismissAccountPrompt, shouldShowAccountPrompt, incrementCharacterCount } = useOnboarding()

    // Créer 3 personnages
    incrementCharacterCount()
    incrementCharacterCount()
    incrementCharacterCount()
    expect(shouldShowAccountPrompt.value).toBe(true)

    // Dismiss
    dismissAccountPrompt()
    expect(shouldShowAccountPrompt.value).toBe(false)

    // Créer 4ème personnage (même jour)
    incrementCharacterCount()
    expect(shouldShowAccountPrompt.value).toBe(false) // Pas de nouveau prompt
  })
})
```

---

## 10. Documentation Technique

### 10.1 Composable useOnboarding
```typescript
// composables/useOnboarding.ts

export const useOnboarding = () => {
  const visitCount = useState('onboarding:visitCount', () => 0)
  const characterCount = useState('onboarding:characterCount', () => 0)
  const lastAccountPrompt = useState('onboarding:lastPrompt', () => null as Date | null)
  const neverAskAccount = useState('onboarding:neverAsk', () => false)

  // Charger depuis localStorage au montage
  onMounted(() => {
    visitCount.value = parseInt(localStorage.getItem('visitCount') || '0')
    characterCount.value = parseInt(localStorage.getItem('characterCount') || '0')
    lastAccountPrompt.value = localStorage.getItem('lastAccountPrompt')
      ? new Date(localStorage.getItem('lastAccountPrompt')!)
      : null
    neverAskAccount.value = localStorage.getItem('neverAskAccount') === 'true'
  })

  const isNewUser = computed(() => visitCount.value === 0)

  const incrementVisit = () => {
    visitCount.value++
    localStorage.setItem('visitCount', visitCount.value.toString())
  }

  const incrementCharacterCount = () => {
    characterCount.value++
    localStorage.setItem('characterCount', characterCount.value.toString())
  }

  const shouldShowAccountPrompt = computed(() => {
    if (neverAskAccount.value) return false

    // Vérifier fréquence (max 1/semaine)
    if (lastAccountPrompt.value) {
      const daysSinceLastPrompt = (Date.now() - lastAccountPrompt.value.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceLastPrompt < 7) return false
    }

    // Déclencheurs : 5 visites OU 3 personnages
    return visitCount.value >= 5 || characterCount.value >= 3
  })

  const dismissAccountPrompt = () => {
    lastAccountPrompt.value = new Date()
    localStorage.setItem('lastAccountPrompt', lastAccountPrompt.value.toISOString())
  }

  const neverAskAgain = () => {
    neverAskAccount.value = true
    localStorage.setItem('neverAskAccount', 'true')
  }

  return {
    isNewUser,
    visitCount,
    characterCount,
    shouldShowAccountPrompt,
    incrementVisit,
    incrementCharacterCount,
    dismissAccountPrompt,
    neverAskAgain
  }
}
```

---

### 10.2 Schéma Validation Wizard
```typescript
// schemas/playspace.schema.ts

import { z } from 'zod'

export const PlayspaceWizardSchema = z.object({
  step1: z.object({
    systeme: z.enum(['mist-engine', 'city-of-mist']).default('mist-engine')
  }),

  step2: z.object({
    hack: z.enum(['litm', 'otherscape']).default('litm')
  }),

  step3: z.object({
    univers: z.enum(['standard-litm', 'custom']).default('standard-litm')
  }),

  step4: z.object({
    nom: z.string()
      .min(1, 'Le nom est obligatoire')
      .max(40, 'Maximum 40 caractères'),
    description: z.string()
      .max(200, 'Maximum 200 caractères')
      .optional()
  })
})

export const PlayspaceCreateSchema = z.object({
  nom: z.string().min(1).max(40),
  description: z.string().max(200).optional(),
  systeme: z.enum(['mist-engine', 'city-of-mist']),
  hack: z.enum(['litm', 'otherscape']),
  univers: z.string(),
  userId: z.string().uuid().optional() // null en mode guest
})
```

---

## 11. Annexes

### 11.1 Checklist Pré-Lancement Onboarding
```
UI/UX :
□ Page d'accueil validée (design + copie)
□ Wizard 4 étapes fonctionnel
□ Tooltips contextuels rédigés et intégrés
□ Exemples pré-remplis créés (10 Theme Cards, 5 Hero Cards)
□ Animations confettis intégrées
□ Modal création compte finalisée
□ Design responsive desktop (mobile v1.1)

Technique :
□ localStorage persistance testée (refresh, fermeture navigateur)
□ Validation Zod côté client
□ Composable useOnboarding testé (unitaire)
□ Tests E2E Playwright (wizard + création personnage)
□ Analytics intégrées (tous événements)
□ Gestion erreurs localStorage (quota, corruption)

Performance :
□ Page d'accueil < 1s (Lighthouse)
□ Transitions wizard < 200ms
□ Sauvegarde localStorage < 100ms
□ Validation Zod < 50ms

Contenu :
□ Copie page d'accueil validée (tone of voice)
□ Textes tooltips validés (clarté, concision)
□ Messages succès/erreur rédigés
□ Documentation utilisateur (FAQ onboarding)

User Testing :
□ 5 utilisateurs testés (personas Léa + Marc)
□ Feedbacks intégrés
□ Taux complétion wizard > 80% (test)
□ Time-to-first-character < 10 min (test)
```

---

### 11.2 Références
- **FTUE Best Practices** : https://www.appcues.com/blog/first-time-user-experience
- **Onboarding Patterns** : https://www.useronboard.com/onboarding-teardowns/
- **Analytics Events** : Segment Onboarding Spec
- **Shepherd.js** (tutoriel interactif v1.1) : https://shepherdjs.dev/
- **Confetti Animation** : canvas-confetti library

---

**Date** : 2025-01-19
**Version** : 1.0
**Statut** : Validé
**Priorité** : P0 (MVP) - CRITIQUE POUR ADOPTION
**Auteur** : Product Owner Brumisa3
**Reviewers** : Technical Architect, Senior Code Reviewer
