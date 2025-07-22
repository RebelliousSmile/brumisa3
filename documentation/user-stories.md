# User Stories - brumisater

## Vue d'ensemble

Ce document décrit les user stories de brumisater, organisées par persona utilisateur et par fonctionnalité. Ces stories servent de base pour le développement guidé par les tests (TDD) et définissent la promesse du site.

## Promesse du site

**"Créez des fiches de personnages JDR immersives et professionnelles en quelques clics, générez vos PDFs instantanément, et enrichissez vos parties avec des oracles intelligents."**

### Valeurs clés
- **Simplicité** : Interface intuitive, création rapide
- **Qualité** : PDFs professionnels, mise en page soignée
- **Immersion** : Oracles contextuels, ambiance thématique
- **Accessibilité** : Gratuit avec options premium, pas d'inscription obligatoire

## Personas

### 1. **Alex - Meneur de Jeu Occasionnel**
- **Profil** : MJ débutant, quelques parties par mois
- **Besoins** : Outils simples, aide pour l'improvisation
- **Contraintes** : Temps limité, budget serré

### 2. **Sam - Joueur Passionné**
- **Profil** : Joue régulièrement, plusieurs systèmes
- **Besoins** : Personnages détaillés, partage avec le groupe
- **Contraintes** : Veut de la qualité professionnelle

### 3. **Jordan - MJ Expert**
- **Profil** : Anime plusieurs tables, crée du contenu
- **Besoins** : Outils avancés, customisation, oracles complexes
- **Contraintes** : Exigences élevées, besoin de fiabilité

### 4. **Casey - Découvreur JDR**
- **Profil** : Nouveau dans le JDR, curieux
- **Besoins** : Simplicité, guidance, exemples
- **Contraintes** : Méconnaissance des codes, peur de mal faire

## User Stories par Fonctionnalité

### 🎲 Création de Personnages

#### US-001 : Création rapide anonyme
**En tant que** Casey (découvreur)  
**Je veux** créer un personnage sans créer de compte  
**Pour que** je puisse essayer le service sans engagement  

**Critères d'acceptation :**
- [ ] Accès direct au formulaire depuis l'accueil
- [ ] Sauvegarde temporaire pendant la session
- [ ] Pas d'obligation de créer un compte
- [ ] Génération PDF immédiate possible

**Tests d'acceptation :**
```gherkin
Scénario: Création anonyme réussie
  Étant donné que je suis sur la page d'accueil
  Quand je clique sur "Créer un personnage"
  Et que je choisis le système "Monsterhearts"
  Et que je remplis le nom "Luna"
  Et que je clique sur "Sauvegarder"
  Alors le personnage est créé temporairement
  Et je peux générer un PDF
```

#### US-002 : Personnage persistant avec compte
**En tant que** Sam (joueur passionné)  
**Je veux** sauvegarder mes personnages de façon permanente  
**Pour que** je puisse les retrouver et les modifier plus tard  

**Critères d'acceptation :**
- [ ] Inscription simple (email + mot de passe)
- [ ] Sauvegarde automatique des modifications
- [ ] Liste de "Mes personnages"
- [ ] Possibilité d'archiver des personnages

#### US-003 : Validation contextuelle
**En tant que** Casey (découvreur)  
**Je veux** être guidé dans la création de mon personnage  
**Pour que** je ne commette pas d'erreurs de règles  

**Critères d'acceptation :**
- [ ] Validation des valeurs selon le système de jeu
- [ ] Messages d'aide contextuels
- [ ] Suggestions automatiques
- [ ] Impossible de sauvegarder un personnage invalide

### 📄 Génération PDF

#### US-004 : PDF instantané
**En tant que** Alex (MJ occasionnel)  
**Je veux** générer un PDF de qualité immédiatement  
**Pour que** j'aie ma fiche prête pour la partie de ce soir  

**Critères d'acceptation :**
- [ ] Génération en moins de 5 secondes
- [ ] Mise en page professionnelle
- [ ] Téléchargement direct
- [ ] Format A4 standard

**Tests de performance :**
```javascript
test('PDF généré en moins de 5 secondes', async () => {
  const start = performance.now();
  const pdf = await genererPDF(personnageId);
  const end = performance.now();
  expect(end - start).toBeLessThan(5000);
});
```

#### US-005 : Personnalisation avancée
**En tant que** Jordan (MJ expert)  
**Je veux** customiser l'apparence de mes PDFs  
**Pour que** ils correspondent à l'ambiance de ma campagne  

**Critères d'acceptation :**
- [ ] Choix de thèmes visuels
- [ ] Logo personnalisé (premium)
- [ ] Couleurs personnalisables
- [ ] Prévisualisation en temps réel

#### US-006 : Partage facilité
**En tant que** Sam (joueur passionné)  
**Je veux** partager facilement mes personnages  
**Pour que** mon groupe puisse les consulter  

**Critères d'acceptation :**
- [ ] Lien de partage public
- [ ] Contrôle de la visibilité
- [ ] Partage sur réseaux sociaux
- [ ] QR code pour accès mobile

### 🔮 Oracles Intelligents

#### US-007 : Oracle simple
**En tant que** Alex (MJ occasionnel)  
**Je veux** tirer rapidement un élément d'oracle  
**Pour que** j'enrichisse ma partie sans préparation  

**Critères d'acceptation :**
- [ ] Tirage en un clic
- [ ] Résultat contextuel au système de jeu
- [ ] Historique des tirages de la session
- [ ] Possibilité de retirer

**Tests d'acceptation :**
```javascript
test('Tirage oracle rapide', async () => {
  const oracle = await chargerOracle('monsterhearts-revelations');
  const resultat = await oracle.tirer();
  expect(resultat).toHaveProperty('valeur');
  expect(resultat.valeur).toBeTruthy();
});
```

#### US-008 : Oracle contextuel
**En tant que** Jordan (MJ expert)  
**Je veux** des oracles qui s'adaptent au contexte de jeu  
**Pour que** les résultats soient cohérents avec ma partie  

**Critères d'acceptation :**
- [ ] Filtrage par tags/catégories
- [ ] Oracles composés (plusieurs tirages liés)
- [ ] Pondération intelligente
- [ ] Sauvegarde de configurations

#### US-009 : Oracles premium
**En tant que** Jordan (MJ expert)  
**Je veux** accéder à des oracles complexes  
**Pour que** j'aie des outils professionnels pour mes parties  

**Critères d'acceptation :**
- [ ] Oracles exclusifs aux membres premium
- [ ] Oracles avec métadonnées étendues
- [ ] Export des résultats
- [ ] Statistiques d'utilisation

### 👤 Gestion de Compte

#### US-010 : Inscription simple
**En tant que** Sam (joueur passionné)  
**Je veux** créer un compte rapidement  
**Pour que** je puisse sauvegarder mon travail  

**Critères d'acceptation :**
- [ ] Inscription en moins de 2 minutes
- [ ] Validation par email optionnelle
- [ ] Récupération de mot de passe
- [ ] Connexion sociale (Google/Discord) optionnelle

#### US-011 : Élévation premium
**En tant que** Jordan (MJ expert)  
**Je veux** accéder aux fonctionnalités avancées  
**Pour que** j'aie des outils professionnels  

**Critères d'acceptation :**
- [ ] Upgrade vers premium transparent
- [ ] Code d'accès temporaire
- [ ] Fonctionnalités clairement identifiées
- [ ] Valeur ajoutée évidente

#### US-012 : Tableau de bord
**En tant que** Sam (joueur passionné)  
**Je veux** voir tous mes éléments en un coup d'œil  
**Pour que** je gère facilement mes créations  

**Critères d'acceptation :**
- [ ] Vue d'ensemble des personnages
- [ ] Statistiques d'utilisation
- [ ] Derniers PDFs générés
- [ ] Accès rapide aux actions fréquentes

### 🌐 Navigation et Découverte

#### US-013 : Page d'accueil engageante
**En tant que** Casey (découvreur)  
**Je veux** comprendre rapidement ce que propose le site  
**Pour que** je sache si cela m'intéresse  

**Critères d'acceptation :**
- [ ] Promesse claire en moins de 5 secondes
- [ ] Exemples visuels attractifs
- [ ] Call-to-action évident
- [ ] Navigation intuitive

#### US-014 : Découverte progressive
**En tant que** Casey (découvreur)  
**Je veux** découvrir les fonctionnalités progressivement  
**Pour que** je ne sois pas submergé d'informations  

**Critères d'acceptation :**
- [ ] Onboarding guidé optionnel
- [ ] Tooltips contextuels
- [ ] Exemples pré-remplis
- [ ] Progression sauvegardée

#### US-015 : Support multi-systèmes
**En tant que** Sam (joueur passionné)  
**Je veux** créer des personnages pour différents systèmes  
**Pour que** je puisse utiliser l'outil pour toutes mes parties  

**Critères d'acceptation :**
- [ ] Support de 4+ systèmes populaires
- [ ] Interface adaptée par système
- [ ] Validation spécifique par système
- [ ] Thèmes visuels cohérents

### 📱 Expérience Mobile

#### US-016 : Création mobile
**En tant que** Alex (MJ occasionnel)  
**Je veux** créer des personnages sur mon téléphone  
**Pour que** je puisse préparer ma partie dans les transports  

**Critères d'acceptation :**
- [ ] Interface responsive complète
- [ ] Formulaires adaptés tactile
- [ ] Sauvegarde auto fréquente
- [ ] Performance optimisée mobile

#### US-017 : Consultation mobile
**En tant que** Sam (joueur passionné)  
**Je veux** consulter mes personnages sur mobile  
**Pour que** j'aie accès à mes fiches pendant les parties  

**Critères d'acceptation :**
- [ ] Vue lecture optimisée mobile
- [ ] Zoom/pan sur les PDFs
- [ ] Mode hors-ligne basique
- [ ] Partage natif mobile

### 🔒 Confidentialité et Sécurité

#### US-018 : Données privées
**En tant que** Sam (joueur passionné)  
**Je veux** que mes créations restent privées  
**Pour que** mes adversaires ne voient pas mes personnages secrets  

**Critères d'acceptation :**
- [ ] Personnages privés par défaut
- [ ] Partage sur invitation uniquement
- [ ] Suppression définitive possible
- [ ] Pas de tracking abusif

#### US-019 : Utilisation anonyme
**En tant que** Casey (découvreur)  
**Je veux** utiliser le service sans laisser de traces  
**Pour que** je préserve ma vie privée  

**Critères d'acceptation :**
- [ ] Navigation anonyme complète
- [ ] Pas de cookies obligatoires
- [ ] Données temporaires supprimées
- [ ] Transparence sur les données collectées

### 💝 Valeur et Monétisation

#### US-020 : Valeur gratuite évidente
**En tant que** Casey (découvreur)  
**Je veux** avoir de la valeur immédiatement  
**Pour que** je comprenne l'intérêt du service  

**Critères d'acceptation :**
- [ ] Fonctionnalités essentielles gratuites
- [ ] Pas de paywall frustrant
- [ ] Qualité professionnelle même en gratuit
- [ ] Upgrade optionnel et justifié

#### US-021 : Premium justifié
**En tant que** Jordan (MJ expert)  
**Je veux** que le premium apporte une vraie valeur  
**Pour que** l'investissement soit rentable  

**Critères d'acceptation :**
- [ ] Fonctionnalités exclusives utiles
- [ ] Prix transparent et juste
- [ ] Essai ou garantie de satisfaction
- [ ] Valeur mesurable (temps/qualité)

## Stories Techniques (Pour l'équipe)

### 🧪 Qualité et Tests

#### TS-001 : Couverture de tests
**En tant que** développeur  
**Je veux** avoir une couverture de tests élevée  
**Pour que** le code soit fiable et maintenable  

**Critères d'acceptation :**
- [ ] 80%+ couverture code métier
- [ ] Tests d'intégration pour flows critiques
- [ ] Tests E2E pour parcours utilisateurs
- [ ] CI/CD avec tests automatiques

#### TS-002 : Performance
**En tant que** utilisateur  
**Je veux** une application rapide  
**Pour que** mon expérience soit fluide  

**Critères d'acceptation :**
- [ ] Temps de chargement < 3s
- [ ] Génération PDF < 5s
- [ ] Score Lighthouse > 90
- [ ] Monitoring des performances

### 🔧 Maintenance

#### TS-003 : Documentation
**En tant que** développeur  
**Je veux** une documentation complète  
**Pour que** l'équipe soit autonome  

**Critères d'acceptation :**
- [ ] README à jour
- [ ] Documentation API
- [ ] Guide de déploiement
- [ ] User stories maintenues

## Roadmap par Release

### MVP (v1.0) - Fondations
**Objectif :** Prouver la promesse de base

**Stories prioritaires :**
- US-001 : Création rapide anonyme
- US-004 : PDF instantané  
- US-007 : Oracle simple
- US-013 : Page d'accueil engageante

**Critères de succès :**
- [ ] Un utilisateur peut créer un personnage et générer un PDF en moins de 5 minutes
- [ ] Interface claire et engageante
- [ ] Performance stable

### v1.1 - Personnalisation
**Objectif :** Retenir les utilisateurs

**Stories prioritaires :**
- US-002 : Personnage persistant avec compte
- US-010 : Inscription simple
- US-012 : Tableau de bord
- US-016 : Création mobile

### v1.2 - Oracles Avancés
**Objectif :** Différenciation concurrentielle

**Stories prioritaires :**
- US-008 : Oracle contextuel
- US-009 : Oracles premium
- US-011 : Élévation premium

### v2.0 - Expérience Premium
**Objectif :** Monétisation et fidélisation

**Stories prioritaires :**
- US-005 : Personnalisation avancée
- US-006 : Partage facilité
- US-015 : Support multi-systèmes
- US-021 : Premium justifié

## Métriques de Succès

### Métriques Produit
- **Conversion création → PDF** : > 70%
- **Temps moyen création personnage** : < 5 minutes
- **Satisfaction utilisateur (NPS)** : > 50
- **Rétention 7 jours** : > 30%

### Métriques Techniques
- **Disponibilité** : > 99%
- **Temps réponse moyen** : < 2s
- **Erreurs** : < 1%
- **Couverture tests** : > 80%

### Métriques Business
- **Utilisateurs actifs mensuels** : 1000+ (6 mois)
- **Conversion premium** : > 5%
- **Coût acquisition utilisateur** : < 10€
- **Valeur vie client** : > 50€

---

*Ce document évolue avec le produit. Dernière mise à jour : 2025-01-22*