# User Stories - brumisater

## Promesse du site
"Créez des fiches de personnages JDR immersives et professionnelles en quelques clics"

## Types d'utilisateurs
- **Anonyme** : Visiteur non connecté, accès limité, données temporaires
- **Connecté** : Utilisateur avec compte, sauvegarde permanente
- **Premium** : Utilisateur payant, fonctionnalités avancées
- **Admin** : Administrateur, gestion complète du système

## Plan détaillé pour l'épic "Création et génération de fiche de personnage JDR"

### US001 - Sélection du système de jeu
**En tant qu'utilisateur anonyme**, je veux pouvoir choisir un système de jeu parmi la liste disponible pour commencer la création d'un personnage.

**Déclencheur** : (User) Accède à la page de création de personnage
**Entrée** : Aucune authentification requise
**Sortie** : (System) Affiche la liste des systèmes de jeu disponibles avec aperçus

### US002 - Création de personnage de base
**En tant qu'utilisateur anonyme**, je veux pouvoir remplir les informations de base d'un personnage pour une session temporaire.

**Déclencheur** : (User) Sélectionne un système de jeu et clique sur "Créer un personnage"
**Entrée** : Système de jeu sélectionné
**Sortie** : (System) Affiche le formulaire de création adapté au système choisi

### US003 - Sauvegarde temporaire anonyme
**En tant qu'utilisateur anonyme**, je veux que mes données de personnage soient conservées temporairement dans ma session pour éviter de les perdre.

**Déclencheur** : (User) Modifie les données du formulaire
**Entrée** : Données du formulaire de personnage
**Sortie** : (System) Sauvegarde automatique en localStorage (données non persistantes)

### US004 - Génération PDF anonyme
**En tant qu'utilisateur anonyme**, je veux pouvoir générer et télécharger un PDF de mon personnage sans créer de compte.

**Déclencheur** : (User) Clique sur "Générer PDF" avec un personnage complété
**Entrée** : Données de personnage complètes
**Sortie** : (System) Génère et propose le téléchargement direct du PDF

### US005 - Connexion pour sauvegarder
**En tant qu'utilisateur anonyme**, je veux pouvoir me connecter ou créer un compte pour sauvegarder définitivement mon personnage.

**Déclencheur** : (User) Clique sur "Sauvegarder" ou "Créer un compte"
**Entrée** : Données de personnage + informations de connexion
**Sortie** : (System) Crée le compte et sauvegarde le personnage en base

### US006 - Gestion des personnages sauvegardés
**En tant qu'utilisateur connecté**, je veux pouvoir voir, modifier et supprimer mes personnages sauvegardés.

**Déclencheur** : (User) Accède à la section "Mes personnages"
**Entrée** : Session utilisateur valide
**Sortie** : (System) Affiche la liste des personnages avec options CRUD

### US007 - Modification de personnage existant
**En tant qu'utilisateur connecté**, je veux pouvoir modifier un personnage existant et sauvegarder les changements.

**Déclencheur** : (User) Sélectionne "Modifier" sur un personnage existant
**Entrée** : ID du personnage + nouvelles données
**Sortie** : (System) Met à jour le personnage en base et confirme la sauvegarde

### US008 - Duplication de personnage
**En tant qu'utilisateur connecté**, je veux pouvoir dupliquer un personnage existant pour créer des variantes.

**Déclencheur** : (User) Clique sur "Dupliquer" depuis un personnage existant
**Entrée** : ID du personnage à dupliquer
**Sortie** : (System) Crée une copie avec nom modifié et ouvre l'édition

### US009 - Historique des PDF générés
**En tant qu'utilisateur connecté**, je veux pouvoir accéder à l'historique de mes PDF générés.

**Déclencheur** : (User) Accède à la section "Mes PDF"
**Entrée** : Session utilisateur valide
**Sortie** : (System) Affiche la liste des PDF avec dates et liens de téléchargement

### US010 - Partage de personnage (Premium)
**En tant qu'utilisateur premium**, je veux pouvoir partager mes personnages avec d'autres utilisateurs via un lien.

**Déclencheur** : (User) Clique sur "Partager" depuis un personnage
**Entrée** : ID du personnage + paramètres de partage
**Sortie** : (System) Génère un lien de partage avec permissions définies

### US011 - Templates personnalisés (Premium)
**En tant qu'utilisateur premium**, je veux pouvoir créer et utiliser des templates de personnages personnalisés.

**Déclencheur** : (User) Accède à la section "Mes templates"
**Entrée** : Session premium valide
**Sortie** : (System) Affiche l'interface de création/gestion de templates

### US012 - Génération PDF avancée (Premium)
**En tant qu'utilisateur premium**, je veux accéder à des options avancées de personnalisation du PDF.

**Déclencheur** : (User) Clique sur "Options avancées" lors de la génération PDF
**Entrée** : Personnage + préférences de mise en page
**Sortie** : (System) Affiche les options premium et génère le PDF personnalisé

### US013 - Gestion globale des utilisateurs (Admin)
**En tant qu'administrateur**, je veux pouvoir gérer les comptes utilisateurs et leurs permissions.

**Déclencheur** : (User) Accède au panneau d'administration
**Entrée** : Session admin valide
**Sortie** : (System) Affiche l'interface de gestion des utilisateurs

### US014 - Modération des contenus partagés (Admin)
**En tant qu'administrateur**, je veux pouvoir modérer les contenus partagés par les utilisateurs.

**Déclencheur** : (User) Accède à la section modération
**Entrée** : Session admin valide
**Sortie** : (System) Affiche les contenus signalés avec outils de modération

### US015 - Statistiques d'usage (Admin)
**En tant qu'administrateur**, je veux accéder aux statistiques d'utilisation de la plateforme.

**Déclencheur** : (User) Accède au tableau de bord admin
**Entrée** : Session admin valide
**Sortie** : (System) Affiche les métriques et graphiques d'usage

### US016 - Gestion des systèmes de jeu (Admin)
**En tant qu'administrateur**, je veux pouvoir ajouter, modifier ou désactiver des systèmes de jeu.

**Déclencheur** : (User) Accède à la gestion des systèmes
**Entrée** : Session admin + données du système
**Sortie** : (System) Met à jour la configuration des systèmes disponibles

## Roadmap de développement

### Phase 1 - MVP Anonyme (US001-US004)
- Sélection système de jeu
- Création personnage basique
- Sauvegarde temporaire
- Génération PDF simple

### Phase 2 - Comptes utilisateurs (US005-US009)
- Authentification
- Sauvegarde permanente
- Gestion personnages
- Historique PDF

### Phase 3 - Fonctionnalités Premium (US010-US012)
- Partage de personnages
- Templates personnalisés
- PDF avancés

### Phase 4 - Administration (US013-US016)
- Gestion utilisateurs
- Modération
- Statistiques
- Gestion systèmes