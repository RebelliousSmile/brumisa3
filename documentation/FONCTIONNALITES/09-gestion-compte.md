# Gestion de Compte - Flexibilité et Contrôle Utilisateur

## Vision : Autonomie Totale sur l'Identité Numérique

**Objectif :** Donner aux utilisateurs un contrôle complet sur leur identité et leurs contenus, tout en préservant l'intégrité de la communauté et la traçabilité nécessaire.

### Principes Fondamentaux
- **Flexibilité identitaire** : Pseudo modifiable selon les évolutions personnelles
- **Sécurité** : Email comme ancrage unique pour la continuité du compte
- **Contrôle des contenus** : Choix de préservation ou suppression lors du départ
- **Respect RGPD** : Droit à l'effacement avec options de conservation communautaire

## Fonctionnalités de Gestion de Compte

### 1. Gestion du Pseudo d'Usage

**Concept :** Le pseudo est l'identité publique modifiable de l'utilisateur dans l'écosystème brumisater.

**Fonctionnalités :**
- **Pseudo initial** : Choisi lors de la création de compte
- **Modification libre** : Changement possible à tout moment
- **Unicité garantie** : Vérification en temps réel de la disponibilité
- **Historique préservé** : Attribution des créations passées maintenue
- **Transition transparente** : Mise à jour automatique sur tous les contenus

**Critères d'acceptation :**
- Interface de modification dans les paramètres
- Validation instantanée de l'unicité
- Confirmation avant application du changement
- Mise à jour de toutes les références existantes
- Limitation : 3-50 caractères, alphanumériques et tirets

### 2. Gestion de l'Email (Identifiant Unique)

**Concept :** L'email reste l'identifiant technique unique, modifiable avec restrictions de sécurité.

**Règles de modification :**
- **Fréquence limitée** : 1 changement tous les 15 jours maximum
- **Unicité requise** : Le nouvel email ne doit pas être utilisé par un autre compte
- **Validation obligatoire** : Confirmation via lien envoyé au nouvel email
- **Période de grâce** : Ancien email reste actif 48h pendant la transition

**Workflow de changement :**
1. **Demande** → Saisie du nouvel email dans les paramètres
2. **Vérification** → Contrôle unicité + délai de 15 jours
3. **Validation** → Email de confirmation au nouvel email
4. **Activation** → Clic sur le lien pour finaliser le changement
5. **Notification** → Confirmation envoyée aux deux adresses

### 3. Suppression de Compte

**Vision :** Permettre un départ propre avec préservation optionnelle des contributions communautaires.

#### Options de Suppression

**Option 1 : Suppression Complète**
- **Contenu supprimé** : Documents, oracles, témoignages, votes
- **Impact communauté** : Les contenus partagés disparaissent
- **Traçabilité** : Remplacé par "Utilisateur supprimé" dans l'historique
- **Irréversible** : Suppression définitive après confirmation

**Option 2 : Suppression avec Conservation**
- **Contenu généralisé** : Documents et oracles deviennent "Création communautaire"
- **Attribution supprimée** : Nom remplacé par "Contributeur anonyme"
- **Impact minimal** : La communauté conserve les créations utiles
- **Pseudo libéré** : Disponible pour un nouveau compte

#### Workflow de Suppression

**Étapes obligatoires :**
1. **Délai de réflexion** : 7 jours entre demande et suppression effective
2. **Choix explicite** : Sélection du mode de suppression
3. **Sauvegarde utilisateur** : Export de ses données personnelles (RGPD)
4. **Confirmations multiples** : Email + mot de passe + case à cocher
5. **Exécution différée** : Suppression programmée à J+7

**Impact sur les fonctionnalités :**
- **Premium actif** : Temps restant perdu (non transférable)
- **Votes et interactions** : Conservés de manière anonyme
- **Propositions d'options** : Maintenues mais anonymisées

## User Stories

### US1 : Modifier son Pseudo
**En tant qu'utilisateur connecté**, je veux pouvoir changer mon pseudo pour refléter mon évolution ou mes préférences actuelles.

**Critères d'acceptation :**
- J'accède à la modification dans "Paramètres du compte"
- Je vois en temps réel si le pseudo souhaité est disponible
- Je reçois une confirmation des changements appliqués
- Mon nouveau pseudo apparaît sur tous mes contenus existants
- L'historique de mes contributions reste intact

### US2 : Changer mon Email
**En tant qu'utilisateur soucieux de sa sécurité**, je veux pouvoir modifier mon email de connexion tout en gardant la sécurité du compte.

**Critères d'acceptation :**
- Je ne peux changer d'email qu'une fois tous les 15 jours
- Le système vérifie que le nouvel email n'est pas déjà utilisé
- Je dois valider via un lien envoyé au nouvel email
- Je reçois des notifications sur les deux adresses pendant la transition
- Je peux annuler la procédure pendant les 48h de grâce

### US3 : Supprimer mon Compte
**En tant qu'utilisateur souhaitant quitter brumisater**, je veux pouvoir supprimer mon compte en choisissant le devenir de mes créations.

**Critères d'acceptation :**
- J'ai le choix entre suppression complète ou conservation communautaire
- Je peux exporter mes données avant suppression (conformité RGPD)
- Un délai de 7 jours me permet de revenir sur ma décision
- Je reçois des confirmations multiples pour éviter les erreurs
- Mes contributions peuvent survivre à mon départ si je le souhaite

## Impact sur l'Écosystème

### Contenus Partagés
- **Documents publics** : Attribution mise à jour automatiquement
- **Oracles personnalisés** : Propriétaire mis à jour, fonctionnalités préservées
- **Témoignages** : Nom d'auteur synchronisé avec le pseudo
- **Votes et propositions** : Maintien de l'historique même après changements

### Système Communautaire
- **Classements** : Les contributions comptent sous la nouvelle identité
- **Historique des interactions** : Préservé avec mise à jour des références
- **Réputation** : Transférée automatiquement vers la nouvelle identité

### Administration
- **Modération** : Historique administratif préservé avec référence technique
- **Analytics** : Continuité des métriques utilisateur malgré les changements
- **Support** : Traçabilité maintenue pour résolution de problèmes

## Sécurité et Conformité

### Protection contre les Abus
- **Limitation changements email** : Évite les tentatives de prise de contrôle
- **Validation double** : Email + mot de passe pour actions sensibles
- **Logs de sécurité** : Historique des modifications d'identité
- **Délais de réflexion** : Évitent les suppressions impulsives

### Conformité RGPD
- **Droit à l'effacement** : Suppression complète possible
- **Droit à la portabilité** : Export des données utilisateur
- **Droit de rectification** : Modification des informations personnelles
- **Transparence** : Information claire sur l'usage des données

## Métriques de Succès

### Métriques d'Usage
- **Changements de pseudo** : < 20% des utilisateurs/an (stabilité identitaire)
- **Modifications email** : < 10% des utilisateurs/an (sécurité maintenue)
- **Suppressions de compte** : < 5% des utilisateurs/an (rétention élevée)

### Métriques de Qualité
- **Conservation communautaire** : > 70% choisissent la préservation des contenus
- **Délai de réflexion utilisé** : > 30% annulent pendant les 7 jours
- **Réclamations identité** : < 1% (efficacité de l'unicité)

### Métriques Impact Communauté
- **Contenus préservés** : Volume de créations sauvées vs supprimées
- **Continuité contributions** : Maintien de la valeur communautaire
- **Satisfaction utilisateur** : Contrôle perçu sur son identité numérique

## Évolutions Futures

### v1.1 - Améliorations
- Historique public des pseudos (opt-in) pour reconnaissance
- Import/export avancé des données utilisateur
- Notifications push pour changements de sécurité

### v1.2 - Fonctionnalités Sociales
- Redirection automatique ancien pseudo → nouveau
- Système d'aliases temporaires
- Gestion des mentions et notifications après changement

---

**Ce système de gestion de compte équilibre flexibilité utilisateur et stabilité communautaire, garantissant autonomie personnelle et préservation de la valeur collective créée.**