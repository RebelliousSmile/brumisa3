# Journal de Sessions - Companion Tool pour Joueurs Solo

## Vue d'ensemble

**Version** : v2.1 (apres Investigation Board v2.0)
**Objectif Produit** : Permettre aux joueurs solo de documenter, organiser et revivre leurs sessions de jeu avec un journal riche et contextuel.

**Promesse Utilisateur** : "Gardez la memoire de vos aventures. Documentez vos sessions, retrouvez vos moments preferis, et construisez l'histoire de vos personnages."

**Valeur Business** :
- Engagement joueurs solo accru (retention +20% estime)
- Differentiation majeure vs characters-of-the-mist (aucune fonctionnalite similaire)
- Synergie Investigation Board (notes session -> indices board)
- Preparation naturelle multi-joueurs v2.5 (historique sessions partageables)
- Contenu utilisateur genere (statistiques, archives) = retention long terme

## Positionnement dans la Roadmap

### Recommandation : v2.1 - Version Jeu Solo Optimise

**Justification** :

1. **Valeur joueurs solo** : CRITIQUE
   - Lea (persona principale) joue 2-3 sessions/semaine en solo
   - Besoin urgent : "Je perds le fil entre deux sessions espacees"
   - Impact : Organisation narrative, continuite, immersion

2. **Effort technique** : MODERATE (3-4 semaines)
   - CRUD sessions : 1 semaine
   - Notes riches Markdown : 1 semaine
   - Associations personnages/playspace : 3 jours
   - Timeline + statistiques : 1 semaine
   - Tests E2E : 2 jours

3. **Synergies avec autres features** :
   - **Investigation Board v2.0** : Notes session -> indices board (copie rapide)
   - **Mode hors ligne v2.0** : Journal accessible offline (continuite)
   - **Oracles v1.0** : Reference oracles utilises dans session
   - **Personnages LITM v1.0** : Evolution trackers trackee par session

4. **Priorite vs multi-joueurs** : AVANT v2.5
   - Journal solo = fondation journal groupe (meme modele donnees)
   - Experience solo optimale AVANT experience groupe
   - 70% utilisateurs en mode solo jusqu'a v2.5 (KPI vision produit)

### Roadmap Proposee

```
v1.0 - MVP LITM (Q1 2025)
├── Playspaces + Characters LITM
└── Oracles generaux + LITM

v1.1-1.3 - Ameliorations UX (Q2 2025)
├── Dark mode, mobile responsive
├── Import/Export avance
└── Otherscape support

v2.0 - Investigation Board + Mode Hors Ligne (Q3 2025)
├── Investigation Board solo
├── Export PDF personnages
└── Mode offline complet

v2.1 - Journal Sessions + Outils Solo (Q4 2025) <- RECOMMANDATION
├── Journal de sessions solo
├── Statistiques personnages
├── Timeline aventures
└── Export session Markdown/PDF

v2.2 - Editeur Hack + Oracles Custom (Q1 2026)
├── Editeur hack visuel
└── Oracles custom hack

v2.3 - Marketplace (Q2 2026)
├── Publication hacks/univers
└── Decouverte communaute

v2.5 - Mode Multi-Joueurs (Q4 2026)
├── Tables de jeu
├── Investigation Board collaboratif
└── Journal sessions partage
```

**Benefice placement v2.1** :
- Joueurs solo ont 6 mois (v1.0 -> v2.0) pour adopter l'outil
- Investigation Board v2.0 cree le besoin naturel de documentation (notes eparpillees -> journal structure)
- Journal v2.1 repond a ce besoin immediatement
- Multi-joueurs v2.5 herite d'un journal mature et teste

## User Stories (Personas)

### Lea - La Joueuse Solo

**US-JS-001 : Creer nouvelle session de jeu**
```
En tant que Lea
Quand je commence une nouvelle session solo
Je veux creer une entree de journal rapidement
Afin de documenter ma partie sans perdre du temps
```

**Criteres d'acceptation** :
- Bouton "Nouvelle session" accessible depuis dashboard
- Formulaire minimal : Titre (auto-suggestion : "Session du [date]"), Date (pre-remplie aujourd'hui)
- Creation session en < 10 secondes
- Session automatiquement liee au playspace actif
- Redirection vers edition notes

**Scenario concret** :
Lea lance sa session LITM solo. Elle ouvre Brumisa3, clique "Nouvelle session", valide le titre "Session du 19 janvier 2025", et commence a jouer. L'editeur de notes est ouvert. Total : 8 secondes.

---

**US-JS-002 : Enregistrer notes pendant session**
```
En tant que Lea
Pendant ma session solo
Je veux prendre des notes riches (Markdown, tags)
Afin de documenter les moments importants
```

**Criteres d'acceptation** :
- Editeur Markdown simple (gras, italique, listes, titres)
- Tags personnalises (#mystere, #combat, #revelation)
- Sauvegarde automatique (debounce 3s)
- Horodatage optionnel (timestamp notes specifiques)
- Mode focus (editeur plein ecran)

**Scenario concret** :
Lea joue 2h. Elle prend des notes au fur et a mesure :
```markdown
## Acte 1 : Decouverte du cadavre

Marcus trouve le corps dans la ruelle. #mystere
-> Indice : Marque etrange sur le poignet (symbole alchimique)

### Combat avec les gardes
3 gardes arrivent. Combat rapide. #combat
Marcus utilise **Eclair de Lune** (Power tag)
-> 1 garde elimine, 2 en fuite

## Acte 2 : Revelation

Rencontre avec Madame Laveau (medium). #revelation
Elle revele : "Le symbole appartient a la Societe des Cendres"
```

Total : 15 minutes de notes sur 2h de jeu. Sauvegarde automatique toutes les 3s.

---

**US-JS-003 : Associer session a personnages/playspace**
```
En tant que Lea
Quand je documente une session
Je veux lier les personnages joues
Afin de retrouver facilement toutes les sessions d'un personnage
```

**Criteres d'acceptation** :
- Selection multi-personnages (checkbox)
- Playspace auto-detecte (session herite du playspace actif)
- Filtrage sessions par personnage (page personnage affiche historique)
- Filtrage sessions par playspace
- Badge "3 personnages" sur session

**Scenario concret** :
Lea a joue Marcus (heros principal) et introduit Elara (alliee NPC). Elle coche Marcus + Elara dans la session. Plus tard, elle ouvre la fiche Marcus et voit "12 sessions jouees" avec timeline.

---

**US-JS-004 : Consulter historique sessions**
```
En tant que Lea
Quand j'ai termine plusieurs sessions
Je veux consulter mon historique complet
Afin de retrouver une session passee ou relire mes aventures
```

**Criteres d'acceptation** :
- Page "Mes sessions" accessible depuis navigation
- Liste sessions triee par date DESC
- Filtres : Playspace, Personnage, Periode (semaine, mois, annee)
- Recherche texte plein (titre, notes)
- Affichage : Titre, Date, Duree, Personnages, Apercu notes (100 caracteres)

**Scenario concret** :
Lea a 23 sessions documentees sur 3 mois. Elle recherche "Societe des Cendres" et retrouve 4 sessions liees a cette faction. Elle clique sur "Session du 10 decembre" et relit ses notes.

---

**US-JS-005 : Rechercher dans notes**
```
En tant que Lea
Quand je cherche une information specifique
Je veux rechercher dans toutes mes sessions
Afin de retrouver un indice ou evenement oublie
```

**Criteres d'acceptation** :
- Barre recherche globale (header)
- Recherche full-text dans titres + notes
- Resultats : Titre session, date, extrait correspondant (highlight)
- Navigation rapide vers session
- Recherche par tag (#mystere, #combat)

**Scenario concret** :
Lea cherche "Madame Laveau" (PNJ rencontree il y a 1 mois). La recherche retourne 3 sessions. Elle clique sur la premiere et retrouve la revelation sur la Societe des Cendres.

---

**US-JS-006 : Exporter session (Markdown/PDF)**
```
En tant que Lea
Quand j'ai termine une campagne
Je veux exporter mes sessions
Afin de les partager sur un forum ou les archiver
```

**Criteres d'acceptation** :
- Export session individuelle : Markdown, PDF
- Export campagne complete (toutes sessions playspace) : ZIP Markdown, PDF unique
- Template PDF elegant (titre, date, personnages, notes formatees)
- Nom fichier : "Session-[titre]-[date].md" ou ".pdf"

**Scenario concret** :
Lea termine sa campagne Chicago (23 sessions). Elle exporte en PDF unique (65 pages). Elle le partage sur le forum JDR francophone. 12 membres telecharger le PDF. 3 creent leurs propres campagnes inspirees.

---

### Marc - Le MJ VTT

**US-JS-007 : Documenter preparation session**
```
En tant que Marc
Quand je prepare ma session VTT
Je veux documenter mes idees et plans
Afin de ne rien oublier pendant la partie
```

**Criteres d'acceptation** :
- Section "Preparation" dans session (separee des notes session)
- Checklist personnalisee (todo list)
- Reference rapide oracles utilises
- Copie rapide vers Investigation Board

**Scenario concret** :
Marc prepare sa session du soir. Il cree une session "Session 12 - Revelation Volrath" et documente :
```markdown
## Preparation

### Checklist
- [x] Creer PNJ Volrath (antagoniste)
- [x] Preparer 3 scenes (introduction, combat, revelation)
- [ ] Generer complications avec oracles LITM

### Oracles utilises
- Complications Urbaines : "Interruption inattendue"
- Manifestations Pouvoir : "Explosion energie mystique"

### Notes MJ
Volrath revele son plan : detruire le Rift de Chicago
Marcus doit choisir : sauver Elara OU arreter Volrath
```

Total : 15 minutes preparation. Pendant session, Marc consulte ses notes.

---

**US-JS-008 : Comparer notes preparation vs session**
```
En tant que Marc
Apres ma session VTT
Je veux comparer ce que j'avais prevu vs ce qui s'est passe
Afin d'apprendre de mes parties et ajuster mes preparations
```

**Criteres d'acceptation** :
- Vue splittee : Preparation (gauche) vs Session jouee (droite)
- Highlight differences (prevu vs improvise)
- Notes post-session ("Ce qui a fonctionne", "A ameliorer")
- Statistiques : % improvisation vs preparation

**Scenario concret** :
Marc revient sur sa session 12. Il voit :
- Prevu : 3 scenes (1h30 estime)
- Realite : 2 scenes + 1 improvisation combat (2h15)
- Improvisation : 40% (combat goules inattendues)
- Notes : "Joueurs ont adore le combat improvise. Prevoir plus de flexibilite."

---

### Thomas - Le MJ Createur d'Univers

**US-JS-009 : Documenter evolution univers**
```
En tant que Thomas
Quand je joue dans mon univers custom "Brumes d'Avalon"
Je veux documenter comment l'univers evolue
Afin de garder la coherence narrative
```

**Criteres d'acceptation** :
- Tag sessions avec factions, lieux, PNJs impactes
- Timeline univers (evenements majeurs)
- Statistiques : Factions les plus actives, lieux visites
- Notes evolution : "Faction X a gagne en influence"

**Scenario concret** :
Thomas joue 18 sessions dans "Brumes d'Avalon". Il documente :
- Session 5 : Ordre de la Rose Noire gagne bataille contre Nephilim
- Session 10 : Pere Lachaise devient lieu cle (3 visites)
- Session 15 : Madame Laveau meurt (evenement majeur)

Timeline affiche ces evenements. Statistiques : Ordre de la Rose Noire (8 sessions), Pere Lachaise (3 sessions).

---

**US-JS-010 : Generer rapport campagne**
```
En tant que Thomas
A la fin d'une campagne longue
Je veux generer un rapport complet
Afin de documenter l'aventure pour mes joueurs
```

**Criteres d'acceptation** :
- Rapport PDF : Titre campagne, dates, nombre sessions, personnages, resume
- Timeline evenements majeurs (auto-generee depuis tags)
- Statistiques : Lieux visites, factions rencontrees, combats, revelations
- Galerie screenshots/images (optionnel)

**Scenario concret** :
Thomas termine "Brumes d'Avalon" (24 sessions, 6 mois). Il genere un rapport PDF :
```
Brumes d'Avalon - Rapport de Campagne
======================================

Periode : Janvier - Juin 2025
Sessions : 24 (96 heures de jeu)
Personnages : 6 heros, 32 PNJs

Timeline Majeure :
- Session 5 : Bataille Ordre vs Nephilim
- Session 10 : Decouverte crypte Pere Lachaise
- Session 15 : Mort Madame Laveau
- Session 20 : Revelation origine Brumes
- Session 24 : Final - Fermeture Rift Avalon

Statistiques :
- Lieux : Pere Lachaise (8), Opera Garnier (5), Catacombes (12)
- Factions : Ordre Rose Noire (15), Nephilim (8), Goules (6)
- Combat : 18 scenes
- Revelations : 12 moments cles
```

PDF partage avec ses 6 joueurs. Souvenir de la campagne.

---

### Sophie - La Creatrice de Hack

**US-JS-011 : Tester hack avec journal playtest**
```
En tant que Sophie
Quand je teste mon hack "Cyberpunk Mist"
Je veux documenter les sessions playtest
Afin d'identifier les problemes et ameliorations
```

**Criteres d'acceptation** :
- Tag "Playtest" sur session
- Formulaire feedback : "Mecaniques testees", "Problemes rencontres", "Idees amelioration"
- Export rapport playtest (toutes sessions playtest)
- Statistiques : Moves les plus utilises, echecs/succes

**Scenario concret** :
Sophie teste Cyberpunk Mist (8 sessions playtest). Elle documente :
- Session 1 : Move "Jack In" trop puissant (5 utilisations, 100% succes)
- Session 3 : Move "Neural Link" confus (3 joueurs ne comprennent pas)
- Session 6 : Move "Chrome Enhancement" equilibre (utilisation variee)

Export rapport playtest :
```
Cyberpunk Mist - Rapport Playtest
==================================

Sessions : 8 (32 heures)
Testeurs : 5 joueurs

Mecaniques Testees :
- Jack In : 24 utilisations (probleme : trop puissant)
- Neural Link : 8 utilisations (probleme : confus)
- Chrome Enhancement : 15 utilisations (equilibre)

Recommandations :
1. Jack In : Ajouter cout (burn tag)
2. Neural Link : Reformuler description
3. Chrome Enhancement : OK, conserver
```

---

### Camille - L'Administratrice

**US-JS-012 : Analyser engagement utilisateurs via sessions**
```
En tant que Camille
Quand j'analyse l'activite plateforme
Je veux voir les metriques sessions
Afin de mesurer l'engagement joueurs solo
```

**Criteres d'acceptation** :
- Dashboard admin : Nombre sessions creees/semaine, mois
- Metriques : Duree moyenne session, nombre notes/session
- Tendances : Sessions playspace les plus actifs
- Retention : % utilisateurs avec > 5 sessions

**Scenario concret** :
Camille consulte dashboard admin :
```
Metriques Sessions (Janvier 2025)
==================================

Sessions creees : 234 (moyenne : 58/semaine)
Utilisateurs actifs : 87 (23% avec > 5 sessions)

Duree moyenne : 1h45 (objectif : > 1h)
Notes moyennes : 320 mots/session

Playspaces actifs :
1. LITM - Chicago : 45 sessions
2. LITM - Londres : 32 sessions
3. Otherscape - Nexus : 28 sessions

Engagement : +15% vs Decembre 2024
```

---

## Fonctionnalites

### 1. CRUD Sessions

**Creation** :
- Formulaire minimal : Titre, Date, Playspace (auto-detecte)
- Auto-suggestion titre : "Session du [date]"
- Creation en < 10 secondes

**Lecture** :
- Liste sessions triee par date DESC
- Filtres : Playspace, Personnage, Periode
- Recherche full-text (titre, notes)

**Modification** :
- Edition titre, date, duree, personnages, notes
- Sauvegarde automatique (debounce 3s)

**Suppression** :
- Confirmation obligatoire
- Warning si session liee a personnages

### 2. Notes Riches (Markdown)

**Editeur Markdown** :
- Syntaxe simple : Titres (##), gras (**), italique (*), listes (-)
- Preview live (split view optionnel)
- Mode focus (plein ecran, distraction-free)

**Tags personnalises** :
- Format : #tag (auto-completion)
- Categories : #mystere, #combat, #revelation, #social, #exploration
- Filtrage sessions par tag

**Horodatage** :
- Timestamp optionnel : [12:45] Note specifique
- Timeline session auto-generee depuis timestamps

### 3. Association Personnages/Playspace

**Personnages** :
- Selection multi-personnages (checkbox)
- Badge "3 personnages" sur session
- Historique personnage : Liste sessions jouees

**Playspace** :
- Session herite du playspace actif
- Filtrage sessions par playspace
- Statistiques playspace : Nombre sessions, duree totale

### 4. Timeline Sessions

**Affichage chronologique** :
```
Timeline "LITM - Chicago"
=========================

Janvier 2025
------------
[19 Jan] Session 3 : Revelation Societe Cendres
[12 Jan] Session 2 : Combat Goules Catacombes
[05 Jan] Session 1 : Decouverte Cadavre

Decembre 2024
-------------
[28 Dec] Session 0 : Creation Marcus
```

**Navigation** :
- Clic sur session : Ouvre detail
- Filtrage periode : Semaine, mois, annee
- Export timeline : Markdown, PDF

### 5. Statistiques

**Global** :
- Nombre total sessions
- Duree totale jeu
- Moyenne duree session

**Par playspace** :
- Sessions jouees
- Personnages actifs
- Lieux visites (depuis tags)
- Factions rencontrees (depuis tags)

**Par personnage** :
- Sessions jouees
- Evolution trackers (Status, Story tags)
- Moments cles (depuis tags #revelation)

### 6. Export Markdown/PDF

**Export session individuelle** :
- Format : Markdown (.md), PDF (.pdf)
- Nom fichier : "Session-[titre]-[date].md"

**Export campagne complete** :
- Format : ZIP Markdown (toutes sessions), PDF unique
- Template PDF : Titre, timeline, sessions, statistiques

**Template PDF** :
```
[Titre Campagne]
================

Periode : [Date debut] - [Date fin]
Sessions : [Nombre]
Personnages : [Liste]

Timeline
--------
[Session 1]
[Session 2]
...

Statistiques
------------
Duree totale : [heures]
Lieux : [top 5]
Factions : [top 5]
```

## Regles Metier

### Regles de Creation

1. **Titre obligatoire** : Min 3 caracteres, max 100
2. **Date obligatoire** : Par defaut aujourd'hui
3. **Playspace auto-detecte** : Session herite du playspace actif
4. **Personnages optionnels** : Selection multi-personnages
5. **Duree optionnelle** : Si non renseignee, calculee depuis timestamps notes

### Regles de Modification

1. **Sauvegarde automatique** : Debounce 3 secondes
2. **Edition concurrente** : Lock edition si session ouverte par autre utilisateur (mode groupe v2.5)
3. **Historique modifications** : Versioning simple (derniere modif gagne, pas de merge)

### Regles de Suppression

1. **Confirmation obligatoire** : Modal avec warning
2. **Cascade** : Suppression session ne supprime pas personnages lies
3. **Archive optionnelle** : Soft delete (archive 30 jours, v2.2)

### Regles d'Association

1. **Playspace immutable** : Impossible de changer playspace apres creation session
2. **Personnages modifiables** : Ajout/suppression personnages possible apres creation
3. **Validation personnages** : Personnages doivent appartenir au playspace session

### Regles de Recherche

1. **Full-text** : Recherche dans titre + notes (PostgreSQL full-text search)
2. **Tags** : Recherche par tag (#mystere, #combat)
3. **Filtres cumulatifs** : Playspace + Personnage + Periode
4. **Resultats tries** : Par pertinence (score) puis date DESC

### Regles d'Export

1. **Formats supportes** : Markdown (.md), PDF (.pdf), ZIP (campagne complete)
2. **Nom fichier** : Sanitisation (pas de caracteres speciaux)
3. **Template PDF** : Titre, date, personnages, notes formatees
4. **Limite taille** : Max 100 sessions par export ZIP

## Criteres d'Acceptation Globaux

### Fonctionnels

- Creation session en < 10 secondes
- Notes Markdown avec preview live
- Tags personnalises avec auto-completion
- Association multi-personnages
- Timeline chronologique playspace
- Recherche full-text dans toutes sessions
- Export Markdown/PDF session individuelle
- Export campagne complete (ZIP/PDF)

### Performance

- Chargement liste sessions : < 500ms (max 100 sessions)
- Sauvegarde notes : < 200ms (debounce 3s)
- Recherche full-text : < 1s (max 500 sessions)
- Generation PDF : < 3s (session 5000 mots)
- Export ZIP campagne : < 10s (50 sessions)

### UX

- Editeur Markdown simple et intuitif
- Mode focus distraction-free
- Auto-completion tags
- Recherche instantanee (debounce 300ms)
- Timeline visuellement claire
- Export rapide (1 clic)

### Technique

- Schema BDD : Table `sessions` avec relations
- Markdown parser : `marked` ou `remark`
- PDF generation : `jsPDF` ou backend PDFKit
- Full-text search : PostgreSQL `tsvector`
- Tests E2E : Couverture > 80% workflows

## KPIs (Indicateurs de Succes)

### KPIs Produit

**Adoption** :
- Objectif : 40% utilisateurs creent > 1 session/mois
- Mesure : % utilisateurs actifs avec sessions

**Engagement** :
- Objectif : Duree moyenne session > 1h
- Mesure : Median duree sessions

**Retention** :
- Objectif : Utilisateurs avec sessions ont +20% retention vs sans sessions
- Mesure : Retention 30j (avec sessions) vs (sans sessions)

**Qualite documentation** :
- Objectif : Moyenne > 200 mots/session
- Mesure : Median nombre mots notes

### KPIs Utilisateur

**Satisfaction** :
- Objectif : NPS > 60 pour fonctionnalite journal
- Mesure : Sondage in-app apres 5 sessions

**Utilite percue** :
- Objectif : 80% utilisateurs "Journal m'aide a garder le fil"
- Mesure : Sondage satisfaction

**Export** :
- Objectif : 30% utilisateurs exportent > 1 session
- Mesure : % utilisateurs avec exports

### KPIs Technique

**Performance** :
- Objectif : Sauvegarde notes < 200ms
- Mesure : p95 temps reponse API

**Fiabilite** :
- Objectif : Zero perte de donnees
- Mesure : Taux erreurs sauvegarde

## Scope v2.1 vs Futures Versions

### v2.1 - Journal Sessions Solo (MVP)

**Inclus** :
- CRUD sessions (titre, date, duree, personnages)
- Notes Markdown (titres, gras, italique, listes)
- Tags personnalises (#mystere, #combat)
- Association personnages/playspace
- Timeline sessions playspace
- Recherche full-text
- Statistiques basiques (nombre, duree)
- Export Markdown/PDF session

**Non inclus** :
- Export PDF campagne complete (reporte v2.2)
- Galerie images/screenshots (reporte v2.2)
- Versioning notes (reporte v2.3)
- Mode collaboratif (reporte v2.5)

**Duree implementation** : 3-4 semaines

---

### v2.2 - Journal Avance

**Ajouts** :
- Export PDF campagne complete
- Galerie images/screenshots (upload)
- Templates session personnalises
- Archive sessions (soft delete 30j)
- Statistiques avancees (graphiques)

**Duree implementation** : 2 semaines

---

### v2.3 - Journal Collaboratif (Preparation v2.5)

**Ajouts** :
- Versioning notes (historique modifications)
- Commentaires sur sessions (preparation mode groupe)
- Tags partages playspace (convention tags groupe)
- Export HTML (partage web)

**Duree implementation** : 2 semaines

---

### v2.5 - Journal Multi-Joueurs

**Ajouts** :
- Sessions partagees (MJ + joueurs)
- Notes collaboratives temps reel
- Historique contributions (qui a ecrit quoi)
- Notifications modifications

**Duree implementation** : Inclus dans Mode Centralise (8-10 semaines)

---

## Alignement avec Vision Produit

### Respect Mode Solo Prioritaire

**Vision** : Mode solo prioritaire jusqu'a v2.5.

**Journal v2.1 = Mode solo uniquement** :
- Documentation personnelle (pas de partage)
- Organisation narrative individuelle
- Statistiques joueur solo
- Export pour archivage/partage offline

**Preparation v2.5** :
- Modele donnees compatible multi-joueurs (champ `isShared`)
- Architecture evolutive (ajout collaboratif facile)

### Synergie Investigation Board v2.0

**Vision** : Investigation Board = outil organisation enquetes.

**Synergie naturelle** :
- Notes session -> Copie rapide vers Investigation Board
- Indices decouverts session -> Notes board
- Timeline session -> Chronologie enquete

**Workflow type** :
```
Session 5 : Decouverte symbole alchimique
↓
Note session : "Marque etrange poignet cadavre"
↓
Copie vers Investigation Board (bouton rapide)
↓
Indice board : "Symbole alchimique - Societe Cendres"
↓
Connexion board : Indice -> Faction
```

### Differentiation vs Concurrents

**characters-of-the-mist** : Aucun journal sessions
**VTT classiques** : Logs techniques, pas journal narratif
**World Anvil** : Wiki statique, pas journal dynamique

**Brumisa3 = Seul companion tool avec journal narratif contextuel**

### 100% Gratuit

**Vision** : Aucune fonctionnalite premium.

**Journal v2.1 = Gratuit pour tous** :
- Nombre sessions illimite
- Export illimite
- Statistiques completes
- Pas de limite taille notes

---

## Cas d'Usage Concrets

### Cas 1 : Lea - 3 mois de campagne solo LITM Chicago

**Contexte** : Lea joue 2-3 sessions/semaine. Apres 3 mois, 23 sessions documentees.

**Utilisation journal** :
1. **Pendant session** : Notes au fur et a mesure (15 min/2h session)
2. **Entre sessions** : Relecture session precedente (5 min)
3. **Recherche** : "Societe des Cendres" -> 4 sessions retrouvees
4. **Timeline** : Visualisation 3 mois aventures Marcus
5. **Export** : PDF campagne complete (65 pages) partage forum JDR

**Resultat** :
- Continuite narrative parfaite (zero perte de fil)
- Immersion accrue (relecture moments cles)
- Partage communaute (12 televersements PDF)

---

### Cas 2 : Marc - Preparation sessions VTT LITM Londres

**Contexte** : Marc MJ pour 4 joueurs. 1 session/semaine.

**Utilisation journal** :
1. **Preparation** : Notes idees, oracles, checklist
2. **Session** : Documentation evenements reels
3. **Post-session** : Comparaison prevu vs realite
4. **Analyse** : Statistiques improvisation (40% session 12)
5. **Amelioration** : Notes "Prevoir plus flexibilite combat"

**Resultat** :
- Preparations optimisees (apprend de chaque session)
- Historique complet campagne (18 sessions)
- Meilleure adaptation joueurs (feedback structure)

---

### Cas 3 : Thomas - Worldbuilding "Brumes d'Avalon"

**Contexte** : Thomas cree univers custom + campagne 6 mois (24 sessions).

**Utilisation journal** :
1. **Documentation evolution** : Factions, lieux, evenements majeurs
2. **Tags contextuels** : #OrderRoseNoire, #PereLachaise, #Nephilim
3. **Timeline univers** : Evenements cles (bataille Session 5, mort Laveau Session 15)
4. **Statistiques** : Factions actives, lieux visites
5. **Rapport final** : PDF 42 pages (timeline, stats, resume)

**Resultat** :
- Coherence narrative parfaite
- Univers vivant (evolution documentee)
- Souvenir campagne (PDF partage 6 joueurs)

---

## Validation Produit

### Tests Utilisateur (Beta Testing)

**Test 1 : Utilite journal**
- Objectif : Verifier que journal aide continuite
- Protocole : 10 joueurs solo, 5 sessions espacees 1 semaine
- Critere succes : 80% "Journal m'aide a garder le fil"

**Test 2 : Facilite documentation**
- Objectif : Verifier rapidite prise notes
- Protocole : 10 joueurs, mesurer temps documentation/session
- Critere succes : < 10% temps session (12 min sur 2h)

**Test 3 : Export satisfaction**
- Objectif : Verifier qualite exports PDF
- Protocole : 10 joueurs, export PDF campagne
- Critere succes : 80% "PDF de qualite professionnelle"

### Metriques Post-Lancement

**Semaine 1** :
- Nombre sessions creees : Objectif 50+
- Utilisateurs actifs : Objectif 30% adoptent journal

**Mois 1** :
- Sessions/utilisateur : Objectif moyenne > 3
- Retention : Objectif +10% vs utilisateurs sans journal

**Trimestre 1** :
- Adoption : Objectif 40% utilisateurs actifs
- Engagement : Objectif duree moyenne > 1h
- Export : Objectif 30% utilisateurs exportent

---

## ROI et Valeur Business

### Gains Quantifiables

**Retention** :
- Hypothese : +20% retention utilisateurs avec journal vs sans
- Impact : 100 utilisateurs actifs -> 20 utilisateurs supplementaires retenus/mois

**Engagement** :
- Hypothese : +30% temps passe dans l'app (relecture sessions)
- Impact : Session moyenne 45min -> 60min (incluant documentation)

**Differentiation** :
- Avantage competitif unique (aucun concurrent)
- Argument marketing : "Seul companion tool avec journal narratif"

### Gains Qualitatifs

**Experience utilisateur** :
- Continuite narrative (zero perte de fil)
- Immersion accrue (relecture aventures)
- Souvenir campagnes (archives riches)

**Preparation multi-joueurs** :
- Modele donnees reutilise v2.5
- Workflows testes en solo
- Migration naturelle solo -> groupe

**Communaute** :
- Partage campagnes (PDF exportes)
- Inspiration autres joueurs
- Contenu genere utilisateurs

---

## Conclusion : Validation Produit

### Decision : GO pour Journal Sessions v2.1

**Raisons business** :
1. Valeur critique joueurs solo (persona Lea = 60% base utilisateurs)
2. Differentiation majeure vs concurrents (unique)
3. Synergie Investigation Board v2.0 (notes -> indices)
4. Preparation naturelle multi-joueurs v2.5 (meme modele)
5. ROI positif (retention +20%, engagement +30%)

**Risques identifies** :
- Adoption < 40% (mitigation : onboarding guide creation premiere session)
- Documentation trop chronophage (mitigation : notes rapides, sauvegarde auto)
- Export PDF qualite insuffisante (mitigation : templates pro, tests utilisateurs)

**Mitigations** :
- Onboarding : Wizard creation premiere session
- Templates : Notes rapides (#combat, #mystere auto-insertion)
- Tests E2E : Workflows complets (creation -> export)
- Beta testing : 30 joueurs solo, 2 semaines

### Conditions de Lancement

**Criteres obligatoires** :
1. Creation session < 10 secondes (mesure)
2. Sauvegarde notes < 200ms (p95)
3. Export PDF qualite pro (validation design)
4. Zero perte donnees (tests E2E)
5. Onboarding clair (80% beta testeurs reussissent premiere session)

**Criteres optionnels (v2.2)** :
- Export PDF campagne complete
- Galerie images
- Statistiques graphiques

### Niveau de Risque : FAIBLE

**Justification** :
- Architecture simple (CRUD classique)
- Technologies eprouvees (Markdown, PostgreSQL full-text)
- Modele donnees evolutif (compatible v2.5)
- Tests E2E complets (workflows utilisateurs)
- Beta testing validation (30 joueurs)

**Conclusion** : Journal Sessions v2.1 est pret pour implementation apres Investigation Board v2.0.

---

**Date de redaction** : 2025-01-19
**Version** : 1.0
**Auteur** : Product Owner Brumisa3
**Statut** : Pret pour validation equipe dev
**Placement roadmap** : v2.1 (Q4 2025)
**Prerequis** : Investigation Board v2.0, Mode Hors Ligne v2.0
