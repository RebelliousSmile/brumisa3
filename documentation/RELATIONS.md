# Relations et Contraintes d'Intégrité - Générateur PDF JDR

## Vue d'ensemble

Ce document détaille l'implémentation complète des relations entre modèles selon l'architecture définie dans `architecture-models.md`. Toutes les relations sont accompagnées de contraintes de clés étrangères avec des stratégies de cascade appropriées.

## Diagramme des Relations

```
                    SystemeJeu (1) ──── (N) DocumentSystemeJeu
                    (Référentiel             (Configuration types
                     centralisé)              actifs par système)
                         │                           │
                         │                           ↓
Utilisateur (1) ──── (N) Personnage            Document ──── (N) Pdf
     │                      │              (6 types: CHARACTER,    │
     │                      │ génère        TOWN, GROUP,           │
     │                      ↓              ORGANIZATION,           │  
     (N)                 Document           DANGER, GENERIQUE)     │
     │                      │                                     │
     │ vote                 │                                     │
     ↓                      ↓                                     │
DocumentVote            DocumentModerationHistorique             │
(3 critères)            (Traçabilité admin)                      │
     │                      │                                     │
     │                      │                                     │
    Temoignage          OraclePersonnalise                        │
     │                  (Premium JSONB)                           │
     │                      │                                     │
RgpdConsentement           │                                     │
DemandeChangementEmail     │                                     │
(Extensions RGPD)          │                                     │
     │                      │                                     │
Newsletter_Abonnes ←─ (indépendant)                              │
Actualites         ←─ (indépendant)                              │
                                                                 │
                                        ─────────────────────────┘
```

## Relations par Modèle

### Utilisateur

**hasMany Relations :**
- `getPersonnages(utilisateurId, filtres)` → personnages
- `getDocuments(utilisateurId, filtres)` → documents
- `getPdfs(utilisateurId, filtres)` → pdfs
- `getDocumentVotes(utilisateurId, documentId)` → document_votes
- `getRgpdConsentements(utilisateurId)` → rgpd_consentements
- `getDemandesChangementEmail(utilisateurId, statut)` → demandes_changement_email
- `getActionsModeration(moderateurId)` → document_moderation_historique (en tant que modérateur)

**Contraintes FK :**
- `personnages.utilisateur_id → utilisateurs.id` (CASCADE)
- `documents.utilisateur_id → utilisateurs.id` (SET NULL - préservation anonymes)
- `documents.moderateur_id → utilisateurs.id` (SET NULL - historique préservé)
- `pdfs.utilisateur_id → utilisateurs.id` (SET NULL - anonymes préservés)
- `document_votes.utilisateur_id → utilisateurs.id` (CASCADE)
- `document_moderation_historique.moderateur_id → utilisateurs.id` (SET NULL)
- `rgpd_consentements.utilisateur_id → utilisateurs.id` (CASCADE)
- `demandes_changement_email.utilisateur_id → utilisateurs.id` (CASCADE)

### Document

**belongsTo Relations :**
- `getUtilisateur(documentId)` → utilisateur propriétaire
- `getPersonnage(documentId)` → personnage source (si généré depuis personnage)
- `getModerateur(documentId)` → modérateur ayant traité le document
- `getConfigurationSysteme(documentId)` → document_systeme_jeu (via clé composite)

**hasMany Relations :**
- `getDocumentVotes(documentId)` → votes du document
- `getModerationHistorique(documentId)` → historique de modération
- `getPdfs(documentId, filtres)` → PDFs générés depuis ce document

**Contraintes FK :**
- `documents.utilisateur_id → utilisateurs.id` (SET NULL)
- `documents.personnage_id → personnages.id` (SET NULL - document préservé)
- `documents.moderateur_id → utilisateurs.id` (SET NULL)
- `documents.systeme_jeu → systemes_jeu.id` (RESTRICT)

### Personnage

**belongsTo Relations :**
- `getUtilisateur(personnageId)` → utilisateur propriétaire

**hasMany Relations :**
- `getDocuments(personnageId, filtres)` → documents générés depuis ce personnage
- `getPdfs(personnageId, filtres)` → PDFs générés depuis ce personnage

**Méthodes de création :**
- `genererDocument(personnageId)` → crée un document CHARACTER depuis le personnage

**Contraintes FK :**
- `personnages.utilisateur_id → utilisateurs.id` (CASCADE - personnages supprimés avec utilisateur)
- `personnages.systeme_jeu → systemes_jeu.id` (RESTRICT)

### Pdf

**belongsTo Relations :**
- `getUtilisateur(pdfId)` → utilisateur propriétaire
- `getDocument(pdfId)` → document source (OBLIGATOIRE)
- `getPersonnage(pdfId)` → personnage source (si généré depuis personnage)
- `getSystemeJeu(pdfId)` → informations du système JDR

**Contraintes FK :**
- `pdfs.utilisateur_id → utilisateurs.id` (SET NULL - anonymes préservés)
- `pdfs.document_id → documents.id` (CASCADE - PDF supprimé si document supprimé)
- `pdfs.personnage_id → personnages.id` (SET NULL - PDF préservé)
- `pdfs.systeme_jeu → systemes_jeu.id` (RESTRICT)

### SystemeJeu

**hasMany Relations :**
- `getDocuments(systemeId, filtres)` → tous les documents du système
- `getPersonnages(systemeId, filtres)` → tous les personnages du système
- `getPdfs(systemeId, filtres)` → tous les PDFs du système
- `getDocumentSystemeJeu(systemeId)` → configurations de types
- `getTypesActifs(systemeId)` → types de documents actifs uniquement

**Contraintes FK :**
- `documents.systeme_jeu → systemes_jeu.id` (RESTRICT)
- `personnages.systeme_jeu → systemes_jeu.id` (RESTRICT)
- `pdfs.systeme_jeu → systemes_jeu.id` (RESTRICT)
- `document_systeme_jeu.systeme_jeu → systemes_jeu.id` (CASCADE)

### DocumentVote

**belongsTo Relations :**
- `getDocument(voteId)` → document voté (via DocumentModerationHistorique)
- `getUtilisateur(voteId)` → utilisateur qui a voté (via DocumentModerationHistorique)

**Contraintes FK :**
- `document_votes.document_id → documents.id` (CASCADE)
- `document_votes.utilisateur_id → utilisateurs.id` (CASCADE)

**Contraintes UNIQUE :**
- `(document_id, utilisateur_id)` - Un seul vote par utilisateur/document

### DocumentModerationHistorique

**belongsTo Relations :**
- `getDocument(historiqueId)` → document concerné
- `getModerateur(historiqueId)` → modérateur ayant effectué l'action

**Contraintes FK :**
- `document_moderation_historique.document_id → documents.id` (CASCADE)
- `document_moderation_historique.moderateur_id → utilisateurs.id` (SET NULL - historique préservé)

**Immutabilité :**
- Les méthodes `update()` et `delete()` lèvent une exception
- L'historique est immuable pour audit complet

### DocumentSystemeJeu

**Clé primaire composite :**
- `PRIMARY KEY (document_type, systeme_jeu)`

**belongsTo Relations :**
- Relation implicite via `systeme_jeu → systemes_jeu.id`

**Contraintes FK :**
- `document_systeme_jeu.systeme_jeu → systemes_jeu.id` (CASCADE)

## Stratégies de Cascade

### CASCADE - Suppression en cascade

**Utilisation :** Données dépendantes qui n'ont pas de sens sans leur parent.

**Exemples :**
- `personnages` → supprimés avec `utilisateur`
- `document_votes` → supprimés avec `document` ou `utilisateur`
- `rgpd_consentements` → supprimés avec `utilisateur`
- `demandes_changement_email` → supprimées avec `utilisateur`
- `document_moderation_historique` → supprimé avec `document`
- `document_systeme_jeu` → supprimé avec `systeme_jeu`

### SET NULL - Préservation avec désassociation

**Utilisation :** Données historiques à préserver même après suppression du parent.

**Exemples :**
- `documents.utilisateur_id` → NULL si utilisateur supprimé (documents anonymes)
- `documents.personnage_id` → NULL si personnage supprimé (document préservé)
- `documents.moderateur_id` → NULL si modérateur supprimé (historique préservé)
- `pdfs.utilisateur_id` → NULL si utilisateur supprimé
- `pdfs.personnage_id` → NULL si personnage supprimé
- `document_moderation_historique.moderateur_id` → NULL si modérateur supprimé

### RESTRICT - Interdiction de suppression

**Utilisation :** Référentiels critiques ne pouvant être supprimés s'ils ont des dépendances.

**Exemples :**
- `systemes_jeu` → ne peut être supprimé s'il a des documents/personnages/PDFs
- Empêche les suppressions accidentelles de données de référence

## Contraintes d'Intégrité

### Contraintes UNIQUE

```sql
-- Un seul vote par utilisateur/document
ALTER TABLE document_votes 
ADD CONSTRAINT uniq_document_votes_user_document 
UNIQUE (document_id, utilisateur_id);

-- Clé primaire composite pour configuration système/type
ALTER TABLE document_systeme_jeu 
ADD CONSTRAINT pk_document_systeme_jeu 
PRIMARY KEY (document_type, systeme_jeu);
```

### Contraintes NOT NULL

- `personnages.utilisateur_id` - Les personnages appartiennent obligatoirement à un utilisateur
- `pdfs.document_id` - Chaque PDF est lié à un document
- Relations critiques pour l'intégrité métier

### Contraintes CHECK

```sql
-- Statuts validés au niveau base
ALTER TABLE systemes_jeu ADD CONSTRAINT chk_systemes_jeu_statut 
CHECK (statut IN ('ACTIF', 'MAINTENANCE', 'DEPRECIE', 'BETA'));

ALTER TABLE documents ADD CONSTRAINT chk_documents_type
CHECK (type IN ('GENERIQUE', 'CHARACTER', 'TOWN', 'GROUP', 'ORGANIZATION', 'DANGER'));

-- Notes de vote dans la plage valide
ALTER TABLE document_votes ADD CONSTRAINT chk_votes_notes
CHECK (qualite_generale BETWEEN 1 AND 5 
   AND utilite_pratique BETWEEN 1 AND 5 
   AND respect_gamme BETWEEN 1 AND 5);
```

## Index de Performance

### Index sur Relations Fréquentes

```sql
-- Documents par utilisateur et système (dashboard utilisateur)
CREATE INDEX idx_documents_utilisateur_systeme ON documents(utilisateur_id, systeme_jeu);

-- PDFs par utilisateur et système
CREATE INDEX idx_pdfs_utilisateur_systeme ON pdfs(utilisateur_id, systeme_jeu);

-- Personnages par utilisateur et système
CREATE INDEX idx_personnages_utilisateur_systeme ON personnages(utilisateur_id, systeme_jeu);

-- Votes par document (affichage notes)
CREATE INDEX idx_document_votes_document_id ON document_votes(document_id);

-- Historique de modération par date (dashboard admin)
CREATE INDEX idx_moderation_historique_date_action ON document_moderation_historique(date_action);
```

## Tests et Validation

### Tests d'Intégrité

Le projet inclut une suite complète de tests pour valider les relations :

1. **Tests unitaires** - Chaque méthode relationnelle
2. **Tests d'intégration** - `tests/integration/relations.test.js`
3. **Script de validation** - `scripts/validate-constraints.js`
4. **Fonction de vérification** - `verifier_integrite_relations()` en base

### Utilisation

```bash
# Tests unitaires des relations
npm test tests/integration/relations.test.js

# Validation complète des contraintes
node scripts/validate-constraints.js

# Vérification intégrité en base
psql -d brumisater -c "SELECT * FROM verifier_integrite_relations();"
```

## Migration et Évolution

### Application des Contraintes

```bash
# Appliquer la migration des contraintes FK
npm run migrate 011

# Vérifier l'application
npm run validate-constraints
```

### Ajout de Nouvelles Relations

1. **Ajouter méthodes relationnelles** dans les modèles
2. **Créer migration FK** avec stratégie cascade appropriée
3. **Ajouter tests** d'intégrité
4. **Documenter** la relation dans ce fichier
5. **Indexer** si requête fréquente

### Modification de Relations Existantes

1. **Migration de schema** pour modifier contraintes
2. **Migration de données** si changement de structure
3. **Mise à jour tests** et validation
4. **Documentation** des changements

## Dépannage

### Erreurs Communes

**Violation de contrainte FK :**
```
ERROR: insert or update on table "documents" violates foreign key constraint "fk_documents_systeme_jeu"
```
→ Le système JDR spécifié n'existe pas ou n'est pas actif

**Violation contrainte UNIQUE :**
```
ERROR: duplicate key value violates unique constraint "uniq_document_votes_user_document"
```
→ L'utilisateur a déjà voté pour ce document

**Violation cascade RESTRICT :**
```
ERROR: update or delete on table "systemes_jeu" violates foreign key constraint
```
→ Tentative de suppression d'un système ayant des dépendances

### Résolution

1. **Vérifier données** avec `verifier_integrite_relations()`
2. **Corriger violations** avant application contraintes
3. **Utiliser SET NULL** temporairement si besoin
4. **Nettoyer données orphelines** avant RESTRICT

## Maintenance

### Monitoring

- **Logs automatiques** des violations de contraintes
- **Métriques** de performance des requêtes relationnelles
- **Alertes** sur violations d'intégrité fréquentes

### Optimisation

- **Analyse régulière** des plans de requêtes JOIN
- **Ajustement index** selon patterns d'usage
- **Cache** des relations fréquentes côté application

Cette architecture relationnelle garantit l'intégrité des données tout en permettant la flexibilité nécessaire pour le workflow "mode sur le pouce + gestion à moyen terme" de brumisater.