# Brumisa3 - Companion Tool Officieux Mist Engine

**L'outil complementaire 100% gratuit pour Legends in the Mist, Otherscape et City of Mist**

Brumisa3 est un companion tool dedie au Mist Engine, concu pour completer votre experience de jeu. Creez et gerez vos personnages, organisez vos enquetes avec l'Investigation Board, et explorez les oracles contextuels - le tout dans un outil moderne.

**Note** : Brumisa3 n'est pas un VTT (Virtual Tabletop) et ne remplace pas Foundry ou Roll20. C'est un outil specialise pour ce que les VTT ne font pas bien : la gestion narrative des personnages et l'organisation d'enquetes.

## Fonctionnalites actuelles (MVP v1.0)

### Playspaces
Creez des contextes de jeu isoles combinant systeme, hack et univers :
- **Systeme** : Mist Engine ou City of Mist
- **Hack** : LITM (Legends in the Mist), Otherscape, ou personnalise
- **Univers** : Hearts of Ravensdale par defaut, ou creez le votre

Basculez instantanement entre vos differentes campagnes en un clic.

### Personnages LITM Complets
- **Theme Cards** : Power tags, Weakness tags, Attention, Fade, Crack
- **Hero Card** : Relations, Quintessences, Sac a dos
- **Trackers** : Status, Story Tags, Story Themes
- Validation complete cote serveur pour integrite des donnees

### Authentification Flexible
- **Mode guest** : Pas de compte requis, donnees en localStorage
- **Compte utilisateur** : Sauvegarde centralisee en base de donnees PostgreSQL
- Migration automatique localStorage vers BDD lors de la creation de compte

### Export de Donnees
- Exportez vos personnages en JSON
- Format compatible avec characters-of-the-mist
- Partagez avec votre communaute

## Roadmap

### v1.0 (MVP) - Q1 2025 - EN COURS
Playspaces + Characters LITM + Auth + Export JSON

### v1.1 - Amelioration UX (2-3 semaines)
Dark mode, Mobile responsive, Undo/Redo, Raccourcis clavier

### v1.3 - Systeme de Jets (2 semaines)
Jets de des securises, Historique, Selection tags/statuts

### v2.0 - Investigation Board (4-5 semaines)
Canvas interactif, Notes, Connexions, Export PNG

### v2.5 - Mode Multi-joueurs (6-8 semaines)
WebSocket temps reel, Investigation Board collaboratif

## Comment utiliser Brumisa3

### Acces a l'application
Brumisa3 est une application web accessible directement depuis votre navigateur. Aucune installation requise.

**Lien** : [URL de production a definir]

### Creer votre premier playspace
1. Arrivez sur Brumisa3
2. Choisissez votre systeme : **Mist Engine** ou City of Mist
3. Choisissez votre hack : **LITM**, Otherscape, ou creez un hack personnalise
4. Choisissez votre univers : **Hearts of Ravensdale** (par defaut) ou creez le votre
5. Donnez un nom a votre playspace
6. Creez votre playspace - pret en moins de 60 secondes !

### Creer un personnage LITM
1. Dans votre playspace, cliquez "Nouveau personnage"
2. Remplissez nom, description, avatar (optionnel)
3. Ajoutez des **Theme Cards** (minimum 2, maximum 4)
   - Ajoutez Power tags (forces)
   - Ajoutez Weakness tags (faiblesses)
   - Gerez Attention, Fade, Crack
4. Completez votre **Hero Card**
   - Ajoutez vos relations (allies, rivaux, etc.)
   - Definissez vos quintessences
5. Gerez vos **Trackers**
   - Status (etats temporaires)
   - Story Tags (tags narratifs)
   - Story Themes (themes narratifs)

### Basculer entre playspaces
- Cliquez sur un playspace dans la sidebar
- Basculement instantane (< 2 secondes)
- Tous vos personnages du nouveau playspace sont charges automatiquement

### Exporter vos personnages
- Cliquez "Exporter" sur un personnage
- Fichier JSON telecharge automatiquement
- Format compatible avec characters-of-the-mist
- Partagez avec votre communaute ou importez ailleurs

## Mode Guest vs Compte Utilisateur

### Mode Guest (localStorage)
- **Avantages** : Pas de compte requis, acces immediat
- **Limites** : Maximum 3 playspaces, donnees locales au navigateur
- **Risques** : Perte de donnees si cache navigateur efface

### Compte Utilisateur (Base de donnees)
- **Avantages** : Playspaces illimites, synchronisation multi-appareils, sauvegarde perenne
- **Migration** : Lors de la creation de compte, import automatique de vos playspaces localStorage

## Stack Technique

**Frontend** : Vue 3 + Nuxt 4 + Pinia
**Backend** : Nitro Server + PostgreSQL + Prisma
**Auth** : @sidebase/nuxt-auth
**Styling** : UnoCSS (Tailwind-style)
**Tests** : Playwright (100% E2E)

Pour les developpeurs : consultez la [documentation complete](documentation/) et [CLAUDE.md](CLAUDE.md).

## Contribution

Les contributions sont bienvenues !

### Types de contributions
- Signalement de bugs via les [issues GitHub](https://github.com/RebelliousSmile/generateur-pdf-jdr/issues)
- Nouvelles fonctionnalites avec Pull Requests
- Amelioration documentation
- Tests E2E additionnels

### Processus de contribution
1. Fork le repository
2. Creer une branche feature : `git checkout -b feature/ma-fonctionnalite`
3. Respecter l'architecture documentee (`documentation/ARCHITECTURE/`)
4. Ajouter des tests E2E Playwright pour le nouveau code
5. Mettre a jour la documentation si necessaire
6. Soumettre une Pull Request

Pour les instructions developpeur detaillees : consultez [CLAUDE.md](CLAUDE.md) et [documentation/DEVELOPPEMENT/](documentation/DEVELOPPEMENT/).

## Projets de Reference

Brumisa3 s'inspire de 5 projets open-source de la communaute Mist Engine. Nous remercions chaleureusement leurs auteurs pour leurs contributions :

### 1. taragnor/city-of-mist
**Systeme FoundryVTT officieux pour City of Mist**
Repository : [github.com/taragnor/city-of-mist](https://github.com/taragnor/city-of-mist)
Licence : Voir le repository
Contribution : Architecture Actor-Item, systeme de themes et tags

### 2. Altervayne/characters-of-the-mist
**Application standalone Next.js pour gestion de personnages**
Repository : [github.com/Altervayne/characters-of-the-mist](https://github.com/Altervayne/characters-of-the-mist)
Licence : CC BY-NC-SA 4.0 (Creative Commons Attribution-NonCommercial-ShareAlike 4.0)
Contribution : Undo/Redo avec Zustand temporal, Drawer System, format d'export JSON

### 3. mikerees/litm-player
**Serveur multi-joueurs Node.js pour Legends in the Mist**
Repository : [github.com/mikerees/litm-player](https://github.com/mikerees/litm-player)
Licence : MIT License
Contribution : WebSocket temps reel, systeme de jets multi-joueurs

### 4. mordachai/investigation-board
**Module FoundryVTT Investigation Board**
Repository : [github.com/mordachai/investigation-board](https://github.com/mordachai/investigation-board)
Licence : MIT License
Contribution : Canvas interactif, notes sticky, drag & drop

### 5. mordachai/mist-hud
**HUD ameliore pour FoundryVTT (CoM/OS/LitM)**
Repository : [github.com/mordachai/mist-hud](https://github.com/mordachai/mist-hud)
Licence : MIT License
Contribution : HUD ameliore, support multi-jeux (CoM, Otherscape, LITM)

## Licence

Ce projet respecte la licence **City of Mist Garage** de Son of Oak Game Studio.

**100% gratuit, pour toujours** - Pas de fonctionnalites premium, jamais.

Brumisa3 est un projet non commercial, cree pour la communaute Mist Engine. Le code source est disponible sous licence MIT (a confirmer).

## Remerciements

- **Son of Oak Game Studio** pour le Mist Engine et la licence Garage
- **Nuxt 4** et l'equipe Vue.js pour le framework moderne
- **Prisma** pour l'ORM TypeScript
- **Playwright** pour les tests E2E
- **Communaute Mist Engine** francophone pour l'inspiration
- **Auteurs des 5 projets de reference** (voir section ci-dessus)

## Support

- **Bugs et suggestions** : [GitHub Issues](https://github.com/RebelliousSmile/generateur-pdf-jdr/issues)
- **Documentation** : [documentation/](documentation/)
- **Discord** : [Lien a definir]

---

**Cree pour la communaute Mist Engine - Companion tool officieux 100% gratuit**

Version : MVP v1.0 (Q1 2025)
