# Mode Hors Ligne - Brumisa3 v2.0

## Vue d'ensemble

**Version** : v2.0
**Objectif Produit** : Permettre aux utilisateurs de consulter et editer leurs personnages sans connexion internet, avec synchronisation automatique au retour en ligne.

**Promesse Utilisateur** : "Jouez partout, meme dans le train sans reseau. Vos modifications seront automatiquement sauvegardees quand vous retrouverez internet."

**Valeur Business** :
- Utilisabilite 24/7, meme sans reseau stable
- Experience utilisateur fluide et reactive (< 500ms au lieu de 1.5-2s)
- Companion tool veritablement portable
- Reduction de la frustration utilisateur (pas d'echec de chargement)
- Alignement avec vision "companion tool" (pas un site web qui necessite internet permanent)

## User Stories par Persona

### Lea - La Joueuse Solo

**US-1 : Consultation personnages dans le train**
```
En tant que Lea
Quand je suis dans le train sans reseau 4G
Je veux consulter mes personnages LITM
Afin de preparer ma prochaine session solo
```

**Criteres d'acceptation** :
- Acces a la liste complete de mes personnages
- Affichage des Theme Cards, Hero Cards, Trackers
- Navigation entre playspaces fonctionnelle
- Message clair "Mode hors ligne actif"
- Pas de message d'erreur ou de timeout

**Scenario concret** :
Lea prend le TER Paris-Lyon (2h30). Elle ouvre Brumisa3 sur son laptop. Un bandeau orange discret indique "Mode hors ligne - Les modifications seront synchronisees a la reconnexion". Elle consulte ses 3 personnages, lit les Theme Cards, planifie son prochain arc narratif. Aucune interruption, interface reactive.

---

**US-2 : Edition personnage sans reseau**
```
En tant que Lea
Quand je suis en mode hors ligne
Je veux modifier mes personnages (tags, trackers, description)
Afin de ne pas perdre mes idees en attendant d'avoir internet
```

**Criteres d'acceptation** :
- Modification de tags (Power tags, Weakness tags)
- Ajout/suppression de Story tags
- Modification trackers (Status, Story Tag, Story Theme)
- Sauvegarde locale instantanee
- Liste des modifications en attente visible
- Synchronisation automatique au retour online

**Scenario concret** :
Lea a une idee pour un nouveau Power tag pendant son trajet. Elle modifie son personnage, ajoute le tag "Eclair de Lune (Illumination)". Un indicateur discret montre "1 modification en attente". Quand elle arrive chez elle et se reconnecte au WiFi, un toast confirme "Modifications synchronisees avec succes".

---

**US-3 : Export JSON hors ligne**
```
En tant que Lea
Quand je suis en mode hors ligne
Je veux exporter mes personnages en JSON
Afin de les partager plus tard sur le forum JDR
```

**Criteres d'acceptation** :
- Bouton "Exporter JSON" fonctionnel offline
- Fichier JSON genere avec donnees a jour
- Nom de fichier avec timestamp pour traçabilite

**Scenario concret** :
Lea termine son personnage dans le train. Elle clique sur "Exporter JSON" et telecharge `lea-personnage-litm-2025-01-19.json` directement. Pas besoin d'internet pour sauvegarder son travail.

---

### Marc - Le MJ VTT

**US-4 : Preparation session offline**
```
En tant que Marc
Quand je prepare ma session VTT la veille dans le train
Je veux creer des PNJs LITM sans connexion
Afin de gagner du temps et etre pret pour ma session du soir
```

**Criteres d'acceptation** :
- Creation de nouveaux PNJs en mode offline
- Acces aux Themebooks LITM (caches localement)
- Acces aux Oracles generaux et LITM (caches localement)
- Sauvegarde locale avec sync automatique

**Scenario concret** :
Marc prend le metro pour rentrer chez lui (45min). Il ouvre Brumisa3, cree 2 PNJs antagonistes pour sa session du soir. Les Themebooks LITM sont disponibles instantanement (cache local). Il utilise les oracles pour generer des complications. Tout est sauvegarde localement. Quand il arrive chez lui, ses PNJs se synchronisent automatiquement avec le serveur.

---

**US-5 : Consultation Investigation Board offline**
```
En tant que Marc
Quand je suis en session VTT mais que ma connexion est instable
Je veux consulter l'Investigation Board sans interruption
Afin de ne pas ralentir le rythme de la partie
```

**Criteres d'acceptation** :
- Investigation Board charge instantanement depuis cache local
- Lecture des indices, suspects, liens fonctionnelle
- Message d'avertissement si modification impossible (mode collaboratif)
- Sync automatique des modifications au retour en ligne

**Scenario concret** :
Marc anime sa session sur Foundry VTT. Sa box internet ralentit (3G). L'Investigation Board de Brumisa3 reste reactive car les donnees sont cachees localement. Il consulte les indices sans lag. Ses joueurs ne remarquent aucune interruption.

---

### Sophie - La Creatrice de Hack

**US-6 : Travail sur hack custom offline**
```
En tant que Sophie
Quand je travaille sur mon hack steampunk "Brumes de Fer" dans un cafe sans WiFi
Je veux continuer a creer mes moves et oracles custom
Afin de ne pas perdre ma journee de travail
```

**Criteres d'acceptation** :
- Editeur de hack fonctionnel en mode offline
- Creation moves custom sauvegardee localement
- Creation oracles custom sauvegardee localement
- Queue de synchronisation avec indicateur de progression
- Possibilite d'exporter le hack en JSON offline (backup)

**Scenario concret** :
Sophie travaille 3h dans un cafe sans WiFi fiable. Elle cree 8 moves custom et 2 tables d'oracles steampunk. Tout est sauvegarde localement. Un badge indique "12 modifications en attente de synchronisation". Quand elle rentre chez elle, elle se reconnecte au WiFi et toutes ses modifications se synchronisent automatiquement. Elle recoit une notification "Hack 'Brumes de Fer' synchronise - 12 modifications envoyees".

---

### Thomas - Le MJ Createur d'Univers

**US-7 : Edition univers custom offline**
```
En tant que Thomas
Quand je developpe mon univers "Brumes d'Avalon" pendant mes vacances sans internet
Je veux creer des factions, lieux, PNJs et oracles custom
Afin de continuer mon travail de worldbuilding
```

**Criteres d'acceptation** :
- Editeur d'univers fonctionnel offline
- Creation factions, lieux, PNJs sauvegardee localement
- Creation oracles custom liees a l'univers
- Export JSON complet de l'univers (backup offline)
- Sync automatique au retour online avec gestion conflits

**Scenario concret** :
Thomas passe une semaine en vacances dans un gite isole (pas de 4G). Il travaille quotidiennement sur son univers "Brumes d'Avalon" : 5 factions, 20 lieux, 15 PNJs, 3 tables d'oracles bretons. Tout est stocke localement. Quand il rentre chez lui, il se reconnecte et 43 modifications se synchronisent automatiquement. En cas de conflit (modification simultanee sur un autre appareil), il recoit un message clair avec options de resolution.

---

### Camille - L'Administratrice

**US-8 : Monitoring mode offline**
```
En tant que Camille
Quand j'analyse l'activite de la plateforme
Je veux voir combien d'utilisateurs utilisent le mode offline
Afin de mesurer l'impact de cette fonctionnalite
```

**Criteres d'acceptation** :
- Dashboard admin avec metriques mode offline :
  - Nombre d'utilisateurs actifs en mode offline
  - Nombre de modifications en attente de sync
  - Taux de succes de synchronisation
  - Temps moyen de travail offline
- Identification des erreurs de synchronisation frequentes
- Alertes si taux d'echec de sync > 5%

**Scenario concret** :
Camille consulte le dashboard admin. Elle voit que 23% des utilisateurs ont utilise le mode offline ce mois-ci, avec un temps moyen de 45min. Le taux de succes de synchronisation est de 98.5%. 3 erreurs recurrentes identifiees : conflit sur modification simultanee de Theme Card. Elle remonte l'info a l'equipe dev pour ameliorer la gestion de conflits.

---

## Regles Metier du Mode Hors Ligne

### 1. Donnees Disponibles Offline

**Disponibles immediatement (caches localement)** :
- Systems (Mist Engine)
- Hacks (LITM, Otherscape, City of Mist)
- Universes par defaut (Chicago, Londres, etc.)
- Themebooks LITM/Otherscape
- Oracles generaux, hack, univers (tous niveaux)
- Playspaces de l'utilisateur (derniere version synchronisee)
- Personnages de l'utilisateur (derniere version synchronisee)
- Investigation Boards (derniere version synchronisee)

**Indisponibles offline** :
- Marketplace (decouverte nouveaux hacks/univers)
- Contenus communautaires non telecharges
- Mode collaboratif temps reel (Investigation Board partagee)
- Authentification (creation nouveau compte)
- Changement mot de passe

### 2. Operations Autorisees en Mode Offline

**Lecture (100% fonctionnel)** :
- Consulter personnages
- Consulter playspaces
- Consulter Investigation Board
- Lancer oracles (generation locale)
- Exporter JSON

**Ecriture (avec synchronisation differee)** :
- Creer personnage
- Modifier personnage (tags, trackers, description)
- Creer/modifier playspace
- Creer/modifier notes Investigation Board
- Creer/modifier hacks custom (v2.2)
- Creer/modifier univers custom (v2.1)

**Interdit en mode offline** :
- Partager playspace avec autres utilisateurs (necessite serveur)
- Collaborer en temps reel sur Investigation Board
- Publier sur marketplace
- Modifier mot de passe

### 3. Synchronisation Automatique

**Declencheurs de synchronisation** :
1. Detection retour online (evenement `navigator.onLine`)
2. Ouverture application apres periode offline
3. Toutes les 30 secondes si online (check modifications en attente)
4. Action utilisateur "Forcer la synchronisation" (bouton manuel)

**Ordre de priorite de sync** :
1. Donnees utilisateur critiques (personnages, playspaces)
2. Investigation Board
3. Hacks/univers custom (draft)
4. Oracles custom
5. Preferences utilisateur

**Gestion des conflits** :
- **Conflit simple** (modification simultanee meme champ) : Derniere modification gagne, notification utilisateur
- **Conflit complexe** (modification structurelle) : UI de resolution avec preview differences
- **Suppression vs modification** : Priorite a la modification, notification utilisateur

### 4. Limites Techniques Acceptables

**Capacite de stockage local** :
- Minimum : 50MB (quota IndexedDB standard)
- Estimation usage typique : 2-5MB par utilisateur
- Maximum supporté : 500MB (avant avertissement)

**Duree maximale offline** :
- Pas de limite technique
- Recommandation utilisateur : Sync tous les 7 jours pour eviter conflits

**Nombre de modifications en attente** :
- Maximum theorique : 1000 modifications
- Avertissement si > 100 modifications : "Vous avez beaucoup de modifications en attente. Connectez-vous pour synchroniser."

---

## Criteres d'Acceptation Fonctionnels

### Critere 1 : Experience Utilisateur Fluide

**Critere** : L'utilisateur ne doit pas etre bloque par l'absence de connexion.

**Validation** :
- Temps de chargement personnage < 500ms (vs 1.5-2s avec API)
- Basculement playspace < 500ms (vs 1.8s avec API)
- Oracles generes instantanement (< 50ms)
- Aucun message d'erreur "Connexion echouee"

**KPI** :
- 95% des operations offline < 500ms
- 0 timeout utilisateur
- Taux de satisfaction mode offline > 80% (sondage)

---

### Critere 2 : Transparence de l'Etat Offline

**Critere** : L'utilisateur sait toujours s'il est online ou offline, et quelles sont les consequences.

**Validation** :
- Bandeau "Mode hors ligne" visible mais discret (orange, en haut)
- Indicateur de modifications en attente : "3 modifications a synchroniser"
- Message explicite quand operation impossible : "Publication marketplace indisponible hors ligne"
- Toast de confirmation au retour online : "Modifications synchronisees avec succes"

**KPI** :
- 100% des utilisateurs comprennent qu'ils sont offline (test utilisateur)
- 0 ticket support "Je ne sais pas si mes modifications sont sauvegardees"

---

### Critere 3 : Fiabilite de la Synchronisation

**Critere** : Les modifications offline sont synchronisees avec succes au retour online.

**Validation** :
- Taux de succes de sync > 95%
- Temps de sync moyen < 5 secondes pour 10 modifications
- Gestion des conflits automatique (derniere modif gagne) pour 90% des cas
- UI de resolution manuelle pour conflits complexes (10% des cas)
- Zero perte de donnees

**KPI** :
- Taux de succes sync > 95%
- Taux de perte de donnees = 0%
- Temps moyen de sync < 5s pour charge typique

---

### Critere 4 : Performance Percue

**Critere** : Le mode offline est plus rapide que le mode online.

**Validation** :
- Chargement personnage : 50ms (offline) vs 1500ms (online) = 96% plus rapide
- Liste hacks : 5ms (offline) vs 200ms (online) = 97% plus rapide
- Oracles : 10ms (offline) vs 400ms (online) = 97% plus rapide

**KPI** :
- Gain de performance moyen > 90%
- Satisfaction utilisateur "L'app est reactive" > 85%

---

## Limites et Contraintes (Point de Vue Utilisateur)

### Limites Fonctionnelles Acceptables

**Ce que l'utilisateur NE PEUT PAS faire offline** :
1. Decouvrir nouveaux contenus marketplace
2. Collaborer en temps reel avec d'autres joueurs
3. Creer un nouveau compte
4. Modifier son mot de passe
5. Publier un hack/univers sur la marketplace
6. Inviter un joueur a sa table (mode groupe)

**Communication utilisateur** :
Chaque fonctionnalite indisponible affiche un tooltip explicite :
```
"Publication marketplace indisponible hors ligne.
Reconnectez-vous pour partager votre creation avec la communaute."
```

### Limites Techniques Transparentes

**Stockage local limite** :
- Si quota IndexedDB depasse 80% (rare) : Message "Votre cache local est presque plein. Supprimez d'anciens playspaces ou videz le cache."
- Bouton "Nettoyer le cache" accessible dans parametres

**Conflits de synchronisation** :
- Si modification simultanee detectable : UI de resolution avec preview
- Exemple : "Votre personnage a ete modifie sur un autre appareil. Quelle version conserver ?"
  - Option A : Version locale (derniere modif : il y a 2h)
  - Option B : Version serveur (derniere modif : il y a 10min)
  - Option C : Fusionner manuellement

**Duree offline excessive** :
- Si > 30 jours offline : Avertissement "Vous n'etes pas synchronise depuis 30 jours. Risque de conflits. Synchronisez des que possible."

---

## Indicateurs de Succes (KPI)

### KPI Produit

**Adoption du mode offline** :
- Objectif : 30% des utilisateurs utilisent le mode offline au moins 1 fois/mois
- Mesure : % utilisateurs avec au moins 1 session offline/mois

**Performance percue** :
- Objectif : Temps de chargement moyen < 500ms (vs 1.5s sans cache)
- Mesure : Median temps de reponse pour operations critiques

**Fiabilite de la sync** :
- Objectif : Taux de succes de synchronisation > 95%
- Mesure : (Nombre sync reussies / Nombre sync tentees) x 100

**Zero perte de donnees** :
- Objectif : 0% de perte de donnees
- Mesure : Nombre de tickets support "J'ai perdu mes modifications"

### KPI Utilisateur

**Satisfaction mode offline** :
- Objectif : NPS > 50 pour le mode offline
- Mesure : Sondage in-app apres utilisation offline

**Reduction de la frustration** :
- Objectif : -80% de tickets support "Erreur de connexion"
- Mesure : Comparaison tickets avant/apres v2.0

**Temps de travail offline** :
- Objectif : Moyenne 30min/session offline
- Mesure : Duree moyenne entre passage offline et retour online

### KPI Technique

**Taux de cache hit** :
- Objectif : > 90% des requetes donnees statiques servies depuis cache
- Mesure : (Cache hits / Total requetes) x 100

**Taille moyenne du cache** :
- Objectif : < 5MB par utilisateur
- Mesure : Median taille IndexedDB

**Temps de synchronisation** :
- Objectif : < 5s pour 10 modifications
- Mesure : Median temps entre debut sync et confirmation succes

---

## Scope v2.0 vs Futures Versions

### v2.0 - Mode Offline de Base (MVP)

**Inclus** :
- Cache IndexedDB pour donnees statiques (Systems, Hacks, Universes, Themebooks, Oracles)
- Detection online/offline avec indicateur UI
- Queue de synchronisation pour modifications utilisateur
- Sync automatique au retour online
- Consultation personnages offline
- Edition personnages offline (tags, trackers)
- Export JSON offline
- Gestion conflits basique (derniere modif gagne)

**Non inclus** :
- PWA complet (installable)
- Background sync (sync en arriere-plan meme app fermee)
- Push notifications
- Resolution conflits avancee (merge automatique)

**Duree d'implementation** : 2 semaines (inclus dans Sprint v2.0)

---

### v2.1 - Mode Offline Avance (PWA)

**Ajouts** :
- PWA installable (mobile + desktop)
- Background Sync API (sync meme quand app fermee)
- Service Worker avec Workbox
- Cache des assets statiques (CSS, JS, images)
- Install prompt "Ajouter a l'ecran d'accueil"
- Manifest.json pour PWA

**Valeur ajoutee** :
- Application native-like
- Synchronisation en arriere-plan (transparente)
- Performance accrue (assets caches)

**Duree d'implementation** : 2 semaines

---

### v2.2 - Mode Offline Collaboratif (Avance)

**Ajouts** :
- CRDT (Conflict-free Replicated Data Types) pour merge automatique
- Resolution conflits intelligente (merge champs independants)
- Sync P2P locale (Bluetooth/WiFi Direct pour sessions VTT)
- Versioning complet avec historique

**Valeur ajoutee** :
- Collaboration offline (LAN party)
- Zero conflit grace aux CRDT
- Historique complet des modifications

**Duree d'implementation** : 4 semaines (complexe)

---

## Alignement avec Vision Produit

### Respect Philosophie "Companion Tool"

**Vision** : Brumisa3 est un companion tool portable, pas un site web dependant d'internet.

**Mode offline = Alignement parfait** :
- Utilisable partout : train, avion, cafe sans WiFi
- Pas de frustration "Connexion echouee"
- Experience native-like (reactive, instantanee)

### Respect Mode Solo Prioritaire

**Vision** : Mode solo prioritaire, mode groupe en v2.5.

**Mode offline v2.0 = Mode solo uniquement** :
- Consultation/edition personnages solo : 100% fonctionnel
- Investigation Board solo : 100% fonctionnel
- Mode collaboratif : Reporte v2.5 (avec sync temps reel)

### Respect 100% Gratuit

**Vision** : 100% gratuit pour tous, aucune fonctionnalite premium.

**Mode offline = Gratuit pour tous** :
- Aucune limitation de duree offline
- Aucune limitation de nombre de modifications
- Aucune limitation de taille de cache (dans limites navigateur)

---

## Cas d'Usage Concrets

### Cas 1 : Lea dans le TGV Paris-Marseille (3h)

**Contexte** : Lea prend le TGV pour rejoindre sa famille. Elle veut profiter du trajet pour preparer sa prochaine session LITM solo.

**Parcours utilisateur** :
1. Monte dans le TGV, ouvre Brumisa3 sur son laptop
2. Bandeau orange "Mode hors ligne" apparait (pas de 4G dans le train)
3. Consulte ses 3 personnages LITM instantanement (cache local)
4. Modifie les Power tags de son personnage principal
5. Ajoute 2 Story tags suite a sa derniere session
6. Utilise les oracles LITM pour generer 3 complications (instantane)
7. Exporte son personnage en JSON pour backup
8. Arrive a Marseille, se reconnecte au WiFi de la gare
9. Toast vert "3 modifications synchronisees avec succes"

**Resultat** : Lea a travaille 3h sans interruption, comme si elle avait internet. Zero frustration.

---

### Cas 2 : Marc en session VTT avec connexion instable

**Contexte** : Marc anime sa session hebdomadaire LITM sur Foundry VTT. Sa box internet ralentit (orage, 3G instable).

**Parcours utilisateur** :
1. Lance Foundry VTT (lag cause de la 3G)
2. Ouvre Brumisa3 pour consulter Investigation Board
3. Brumisa3 charge instantanement (donnees cachees localement)
4. Consulte indices, suspects, liens sans lag
5. Utilise oracles LITM pour generer complications (instantane, pas d'API call)
6. Foundry VTT rame, mais Brumisa3 reste fluide
7. Connexion revient, modifications Investigation Board se synchronisent

**Resultat** : Marc a maintenu le rythme de sa session malgre connexion instable. Brumisa3 = companion fiable.

---

### Cas 3 : Sophie dans un cafe sans WiFi (3h de travail)

**Contexte** : Sophie developpe son hack steampunk "Brumes de Fer". Le cafe n'a pas de WiFi gratuit.

**Parcours utilisateur** :
1. Ouvre Brumisa3, bandeau "Mode hors ligne"
2. Cree 8 moves custom pour son hack steampunk (sauvegardes locales)
3. Definit 2 tables d'oracles steampunk (complications mecaniques, evenements)
4. Badge indique "12 modifications en attente de synchronisation"
5. Exporte son hack en JSON (backup offline)
6. Rentre chez elle, se reconnecte au WiFi
7. Toast "Hack 'Brumes de Fer' synchronise - 12 modifications envoyees"
8. Consulte son hack sur serveur : tout est present

**Resultat** : Sophie n'a pas perdu sa journee de travail. Son hack est sauvegarde localement et synchronise automatiquement.

---

### Cas 4 : Thomas en vacances isolees (7 jours sans internet)

**Contexte** : Thomas passe une semaine dans un gite isole (Auvergne, pas de 4G). Il veut continuer son worldbuilding "Brumes d'Avalon".

**Parcours utilisateur** :
1. Avant de partir, ouvre Brumisa3 pour s'assurer que tout est synchronise
2. Arrive au gite, pas de reseau (mode offline automatique)
3. Travaille quotidiennement sur son univers :
   - Jour 1-2 : Cree 5 factions avec descriptions
   - Jour 3-4 : Ajoute 20 lieux bretons avec oracles custom
   - Jour 5-6 : Cree 15 PNJs types (templates)
   - Jour 7 : Finalise 3 tables d'oracles (noms bretons, lieux feeriques, complications magie)
4. Badge affiche "43 modifications en attente de synchronisation"
5. Exporte son univers en JSON tous les jours (backup offline)
6. Rentre chez lui, se reconnecte au WiFi
7. Synchronisation automatique demarre : "Synchronisation de 43 modifications..."
8. Toast "Univers 'Brumes d'Avalon' synchronise avec succes"

**Resultat** : Thomas a travaille 7 jours sans internet. Tout est synchronise automatiquement au retour. Zero perte de donnees.

---

## Communication Utilisateur du Mode Offline

### Messages et Indicateurs UI

**Bandeau mode offline** (permanent tant que offline) :
```
┌─────────────────────────────────────────────────────────┐
│ Mode hors ligne actif - Les modifications seront       │
│ synchronisees a la reconnexion          [En savoir +]  │
└─────────────────────────────────────────────────────────┘
```
- Couleur : Orange (#FF9800)
- Position : Haut de page, sous header
- Dismissible : Non (reste visible tant que offline)

**Badge modifications en attente** (si modifications > 0) :
```
[Sync] 3 modifications a synchroniser
```
- Couleur : Orange si < 10, Rouge si >= 10
- Position : Coin superieur droit
- Click : Affiche liste detaillee des modifications

**Toast retour online** :
```
✓ Modifications synchronisees avec succes (3 elements)
```
- Couleur : Vert (#4CAF50)
- Duree : 3 secondes
- Position : Bas droite

**Toast echec synchronisation** :
```
✗ Echec de synchronisation. Reessai dans 30 secondes.
[Reessayer maintenant] [Voir details]
```
- Couleur : Rouge (#F44336)
- Duree : 10 secondes (ou jusqu'a action utilisateur)

### Tooltips et Messages Explicites

**Fonctionnalite indisponible offline** :
```
"Publication marketplace indisponible hors ligne.
Reconnectez-vous pour partager votre creation."
```

**Cache local plein (rare)** :
```
"Votre cache local est presque plein (45 MB / 50 MB).
Supprimez d'anciens playspaces ou videz le cache dans les parametres."
[Nettoyer le cache] [Ignorer]
```

**Synchronisation en cours** :
```
"Synchronisation en cours... 12 / 43 modifications envoyees"
[Annuler] (garde modifications locales)
```

---

## Validation Produit

### Tests Utilisateur a Realiser (Beta Testing)

**Test 1 : Comprehension du mode offline**
- Objectif : Verifier que l'utilisateur comprend qu'il est offline
- Protocole : 10 utilisateurs, scenario train sans reseau
- Critere de succes : 100% comprennent qu'ils sont offline et que modifs seront synchronisees

**Test 2 : Confiance dans la synchronisation**
- Objectif : Verifier que l'utilisateur fait confiance au systeme de sync
- Protocole : 10 utilisateurs, modifications offline puis reconnexion
- Critere de succes : 90% ne verifient pas manuellement si modifs sont synchronisees (confiance)

**Test 3 : Performance percue**
- Objectif : Verifier que l'utilisateur perçoit le gain de performance
- Protocole : 10 utilisateurs, A/B test cache on vs cache off
- Critere de succes : 80% preferent version avec cache ("plus reactive")

### Metriques de Validation Post-Lancement

**Semaine 1 apres lancement v2.0** :
- Nombre d'utilisateurs ayant utilise mode offline : Objectif 20%
- Taux de succes synchronisation : Objectif > 95%
- Tickets support mode offline : Objectif < 5

**Mois 1 apres lancement v2.0** :
- Adoption mode offline : Objectif 30% des utilisateurs actifs
- NPS mode offline : Objectif > 50
- Temps moyen session offline : Objectif 30min

**Trimestre 1 apres lancement v2.0** :
- Reduction tickets "Erreur de connexion" : Objectif -80%
- Taux de retention utilisateurs mode offline : Objectif > 70%
- Satisfaction generale produit : Objectif +10 points vs v1.x

---

## ROI et Valeur Business

### Gains Quantifiables

**Gain de performance** :
- Temps de chargement : -96% (1500ms -> 50ms)
- Basculement playspace : -89% (1800ms -> 200ms)
- Oracles : -97% (400ms -> 10ms)

**Impact** : Experience utilisateur fluide = retention accrue

---

**Reduction charge serveur** :
- Cache hit > 90% pour donnees statiques
- Reduction requetes PostgreSQL : -90% pour Systems, Hacks, Universes, Themebooks, Oracles

**Impact** : Couts infrastructure reduits (moins de CPU/RAM serveur)

---

**Reduction support utilisateur** :
- Tickets "Erreur de connexion" : -80% (estimation)
- Tickets "Donnees perdues" : -100% (sync fiable)

**Impact** : Temps admin Camille economise pour animation communaute

---

### Gains Qualitatifs

**Alignement vision produit** :
- Companion tool portable (pas site web dependant internet)
- Experience native-like (reactive, instantanee)
- Utilisable partout (train, avion, cafe)

---

**Differentiation vs concurrents** :
- characters-of-the-mist : Pas de mode offline
- VTT classiques : Offline limite ou inexistant
- World Anvil : Necessite internet permanent

**Avantage competitif** : Brumisa3 = seul companion tool JDR avec mode offline complet

---

**Satisfaction utilisateur** :
- NPS global : +10 points attendus (hypothese)
- Taux de retention : +15% attendus (hypothese)
- Recommandations bouche-a-oreille : +20% attendus (hypothese)

---

## Conclusion : Validation Produit

### Decision : GO pour Mode Offline v2.0

**Raisons business** :
1. Alignement parfait avec vision "companion tool portable"
2. Differentiation majeure vs concurrents (characters-of-the-mist, VTT)
3. Gains de performance massifs (89-98% plus rapide)
4. Reduction frustration utilisateur (zero timeout)
5. ROI positif (couts dev < gains retention + reduction support)

**Risques identifies** :
- Complexite gestion conflits (mitigation : derniere modif gagne pour MVP)
- Quota IndexedDB limite iOS Safari (mitigation : fallback API + avertissement)
- Perte de donnees si bug sync (mitigation : tests E2E + backup JSON automatique)

**Mitigations** :
- Tests E2E complets pour synchronisation (10 scenarios)
- Export JSON automatique toutes les 24h (backup local)
- Monitoring taux de succes sync (alerte si < 90%)
- Beta testing avec 50 utilisateurs avant lancement

### Conditions de Lancement

**Criteres obligatoires** :
1. Taux de succes synchronisation > 95% (tests E2E)
2. Zero perte de donnees (tests E2E + beta testing)
3. Performance : Chargement personnage < 500ms (mesure)
4. UI claire : 100% beta testeurs comprennent mode offline
5. Fallback API fonctionnel si IndexedDB echoue

**Criteres optionnels (v2.1)** :
- PWA installable
- Background sync
- Push notifications

### Niveau de Risque : FAIBLE

**Justification** :
- Architecture technique solide (IndexedDB natif navigateurs)
- Strategie SWR eprouvee (Next.js, SWR library)
- Fallback API en cas d'echec
- Tests E2E complets
- Beta testing avant lancement

**Conclusion** : Mode offline v2.0 est pret pour production apres validation tests E2E et beta testing.

---

**Date de redaction** : 2025-01-19
**Version** : 1.0
**Auteur** : Product Owner Brumisa3
**Statut** : Pret pour implementation v2.0
**Reference technique** : `documentation/ARCHITECTURE/08-caching-indexeddb-donnees-statiques.md`
