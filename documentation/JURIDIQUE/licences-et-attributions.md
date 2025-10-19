# Licences et Attributions - Brumisa3

## Vue d'Ensemble

Brumisa3 respecte les licences des projets sources et les regles de publication **City of Mist Garage** de Son of Oak Game Studio.

---

## Regles City of Mist Garage

### Source
https://sonofoak.com/blogs/news/publishing-to-the-city-of-mist-garage

### Conditions Applicables

#### 1. Originalite du Contenu
- **~70% du contenu doit etre original**
- Ne pas reproduire des pages entieres des livres officiels
- Citations autorisees avec references aux pages sources

**Application a Brumisa3** :
- Les composants Vue, le code Nuxt, et la logique metier sont 100% originaux
- Les traductions LITM proviennent de characters-of-the-mist (CC BY-NC-SA)
- Les mecaniques de jeu (Mist Engine, City of Mist) sont reference mais pas reproduites integralement

#### 2. Attribution et Logos

**Mentions obligatoires** :
- Logo City of Mist Garage sur interface
- Texte legal dans footer et about page
- Disclaimer "produit non officiel"

**Texte legal requis** :
```
This product is an independent production and is not affiliated with Son of Oak Game Studio.

City of Mist and Legends in the Mist are copyright Son of Oak Game Studio.

This work is published under the City of Mist Garage license.
```

#### 3. Restrictions de Contenu

**Interdit** :
- Personnages sous copyright (pas de Batman, Harry Potter, etc.)
- Mythoi qui ne sont pas dans le domaine public
- Contenu raciste, homophobe, discriminatoire
- Reproduction de mecaniques protegees

**Autorise** :
- Mythes et contes de fees (domaine public)
- Personnages originaux
- Adaptations basees sur domaine public

**Application a Brumisa3** :
- Univers personnalises : verification que les mythoi sont domaine public
- Moderation des contenus communautaires (marketplace)
- Content warnings pour themes sensibles

#### 4. Monetisation

**City of Mist Garage (DriveThruRPG)** :
- Vente autorisee
- Commission 50% createur, 50% DriveThruRPG+Son of Oak
- Paiement 60 jours apres vente

**Application a Brumisa3** :
- Abonnement premium autorise (service, pas vente de contenu)
- Marketplace communautaire : gratuite pour MVP
- Si marketplace payante (v3.0+) : voir avec Son of Oak pour autorisation

---

## Licences des Repos Sources

### 1. characters-of-the-mist

**Repository** : https://github.com/Altervayne/characters-of-the-mist

**Licence** : CC BY-NC-SA 4.0 (Creative Commons Attribution-NonCommercial-ShareAlike 4.0)

**Conditions** :
- **BY** (Attribution) : Citer l'auteur (Altervayne)
- **NC** (NonCommercial) : Usage non commercial uniquement
- **SA** (ShareAlike) : Partager dans les memes conditions

**Elements reutilises** :
- Traductions FR/EN pour Legends in the Mist (35 000+ caracteres)
- Structure des fiches de personnages
- Concepts UI (theme cards, trackers)

**Attribution requise** :
```
Traductions francaises et anglaises pour Legends in the Mist
adaptees de characters-of-the-mist par Altervayne
https://github.com/Altervayne/characters-of-the-mist
Licence : CC BY-NC-SA 4.0
```

**Verification NonCommercial** :
- Brumisa3 est un outil, pas une vente de contenu
- Abonnement premium = service, pas commercialisation des traductions
- **A verifier avec Altervayne si doute**

---

### 2. litm-player

**Repository** : https://github.com/mikerees/litm-player

**Licence** : MIT

**Conditions** :
- Attribution requise
- Pas de restriction commerciale
- Pas d'obligation ShareAlike

**Elements reutilises** :
- Concepts (chat, lanceur de des, sessions multi-joueurs)
- **Aucun code reutilise** (implementation de zero en Nuxt/Vue)

**Attribution requise** :
```
Inspiration multi-joueurs basee sur litm-player par mikerees
https://github.com/mikerees/litm-player
Licence : MIT
```

---

### 3. investigation-board

**Repository** : https://github.com/mordachai/investigation-board

**Licence** : Non specifiee (module Foundry VTT)

**Elements reutilises** :
- **Concept uniquement** (sticky notes sur canvas)
- **Aucun code reutilise**

**Attribution requise** :
```
Concept Investigation Board inspire de investigation-board pour Foundry VTT
par mordachai
https://github.com/mordachai/investigation-board
```

---

## Licence de Brumisa3

### Code Source

**Licence recommandee** : **GNU GPLv3** (a valider)

**Raisons** :
- Compatible avec CC BY-NC-SA (traductions LITM)
- Open source mais protege contre appropriation commerciale
- Oblige partage des modifications (copyleft fort)

**Alternative** : **MIT** si volonte open source plus permissive

### Contenu Utilisateur (Hacks/Univers)

**Sur la marketplace** :
- Par defaut : CC BY-NC-SA 4.0 (comme characters-of-the-mist)
- Createur peut choisir autre licence (MIT, CC0, etc.)
- Mention claire de la licence choisie

---

## Affichage des Attributions dans Brumisa3

### Page "A Propos" (app/pages/about.vue)

```markdown
## Credits et Licences

### City of Mist & Legends in the Mist

This product is an independent production and is not affiliated with
Son of Oak Game Studio.

City of Mist and Legends in the Mist are copyright Son of Oak Game Studio.

This work is published under the City of Mist Garage license.

### Traductions

Traductions francaises et anglaises pour Legends in the Mist adaptees
de characters-of-the-mist par Altervayne
https://github.com/Altervayne/characters-of-the-mist
Licence : CC BY-NC-SA 4.0

### Inspirations

- Fonctionnalites multi-joueurs inspirees de litm-player par mikerees (MIT)
- Investigation Board inspire de investigation-board pour Foundry VTT
  par mordachai

### Code Source

Brumisa3 est un logiciel open source sous licence GPLv3
https://github.com/[votre-compte]/brumisa3

### Son of Oak Game Studio

Merci a Son of Oak Game Studio pour la creation de City of Mist
et Legends in the Mist, et pour la communaute City of Mist Garage.

https://cityofmist.co
```

### Footer

```html
<footer>
  <p>
    Brumisa3 is an independent production and is not affiliated with Son of Oak Game Studio.
    City of Mist™ and Legends in the Mist™ are copyright Son of Oak Game Studio.
  </p>
  <p>
    <a href="/about">Credits & Licenses</a> |
    <a href="/legal">Legal</a>
  </p>
</footer>
```

### Logo City of Mist Garage

**Placement** :
- Page d'accueil (footer)
- Page "A Propos"
- Page login/signup (optionnel)

**Obtention logo** :
- Telecharger depuis le site Son of Oak
- Ou utiliser texte "Published under City of Mist Garage license"

---

## Content Warnings

### Obligation

City of Mist Garage exige des content warnings pour themes sensibles.

### Implementation dans Brumisa3

#### Sur Univers Personnalises

Lors de la creation d'un univers, proposer :
```
Content Warnings (optionnel mais recommande) :
[ ] Violence
[ ] Gore
[ ] Themes adultes
[ ] Horreur
[ ] Autre : [champ libre]
```

#### Sur Marketplace

Afficher clairement les content warnings avant telechargement.

#### Sur Playspaces

Si l'univers a des content warnings, les afficher lors de la creation du playspace.

---

## Moderation Marketplace

### Responsabilite Plateforme

En tant qu'hebergeur de contenus utilisateurs, Brumisa3 doit :
- Moderer les contenus signales
- Retirer contenus illegaux
- Respecter DMCA (si hebergement US) ou equivalent EU

### Processus de Moderation

**Avant publication** :
- Review admin (voir documentation/ARCHITECTURE/vision-globale-brumisa3.md - section Admin)
- Verification :
  - Respect licences
  - Pas de contenu protege par copyright
  - Pas de contenu discriminatoire
  - Content warnings presents si necessaire

**Apres publication** :
- Systeme de signalement utilisateur
- Review dans les 48h
- Suppression ou demande de modification

### Outils de Moderation

**Filtres automatiques** :
- Detection mots-cles problematiques
- Verification liens vers contenus externes
- Scan images (si upload images)

**Review manuel** :
- Admin examine le contenu
- Decision : approuver, rejeter, ou demander modifications

---

## Risques Juridiques et Mitigations

### Risque 1 : Violation Copyright

**Scenario** : Utilisateur publie un hack "Batman in City of Mist"

**Mitigation** :
- CGU claires : utilisateur responsable de son contenu
- Moderation avant publication
- Suppression rapide si signalement
- DMCA takedown process

### Risque 2 : Probleme Licence CC BY-NC-SA

**Scenario** : Altervayne conteste l'usage commercial (abonnement premium)

**Mitigation** :
- Demander clarification avant lancement premium
- Potentiellement negocier licence commerciale
- Alternative : réécrire traductions (couteux)

### Risque 3 : Probleme avec Son of Oak

**Scenario** : Son of Oak demande retrait ou royalties

**Mitigation** :
- Respect strict City of Mist Garage
- Pas de reproduction integrale de contenu officiel
- Contact proactif pour partenariat (long terme)

---

## Checklist Pre-Lancement

### Mentions Legales

- [ ] Page "A Propos" avec tous les credits
- [ ] Footer avec disclaimer City of Mist
- [ ] Logo City of Mist Garage affiche
- [ ] Texte legal City of Mist Garage complet

### Licences

- [ ] Licence Brumisa3 choisie et affichee (GPLv3 recommande)
- [ ] Fichier LICENSE a la racine du repo
- [ ] Attribution characters-of-the-mist dans code et UI
- [ ] Attribution litm-player dans credits

### CGU et Politique

- [ ] CGU (Conditions Generales d'Utilisation)
- [ ] Politique de confidentialite (RGPD)
- [ ] Politique de moderation marketplace
- [ ] Politique remboursement (abonnement premium)

### Moderation

- [ ] Systeme de signalement fonctionnel
- [ ] Dashboard admin pour review contenus
- [ ] Process de moderation documente

---

## Contacts et References

### Son of Oak Game Studio

- Site : https://cityofmist.co
- Email : [a trouver sur le site]
- Discord : City of Mist officiel

### City of Mist Garage

- Regles : https://sonofoak.com/blogs/news/publishing-to-the-city-of-mist-garage
- FAQ : [lien FAQ si disponible]

### Createurs Repos

- Altervayne (characters-of-the-mist) : https://github.com/Altervayne
- mikerees (litm-player) : https://github.com/mikerees
- mordachai (investigation-board) : https://github.com/mordachai

---

## Actions Immediates

### Avant MVP v1.0

1. **Clarifier licence CC BY-NC-SA** :
   - Contacter Altervayne pour confirmer usage OK
   - Documenter reponse

2. **Telecharger logo City of Mist Garage** :
   - Depuis site Son of Oak
   - Ajouter dans assets/

3. **Rediger CGU et Politique confidentialite** :
   - Utiliser generateur CGU (ex: Iubenda, Termly)
   - Adapter pour Brumisa3

### Avant Marketplace (v2.3+)

4. **Consulter avocat specialise propriete intellectuelle** :
   - Valider modele marketplace
   - DMCA / RGPD compliance

5. **Contacter Son of Oak** :
   - Informer du projet
   - Demander partenariat potentiel
   - Clarifier questions grises

---

**Date** : 2025-01-19
**Version** : 1.0
**Statut** : A valider
**Prochaine action** : Contacter Altervayne pour clarification licence
