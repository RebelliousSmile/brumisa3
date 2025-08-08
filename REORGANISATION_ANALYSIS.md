# Analyse de Réorganisation - src/ selon development-strategy.md

## Structure Actuelle vs Structure Cible

### ✅ Dossiers Conformes (100% OK)
- **controllers/** : 8 fichiers - ✅ Structure conforme
- **models/** : 8 fichiers - ✅ Structure conforme  
- **services/** : 22 fichiers + sous-dossiers - ✅ Structure de base conforme
- **database/** : 3 fichiers + migrations/ - ✅ Structure conforme
- **routes/** : 2 fichiers (web.js, api.js) - ✅ Structure conforme
- **utils/** : 2 fichiers - ✅ Structure conforme
- **views/** : Templates EJS organisés - ✅ Existe déjà (non mentionné dans TODO.md)

### 🔧 Configurations à Regrouper
**Problème** : Configurations dispersées sur plusieurs emplacements
- `src/config.js` (racine)
- `src/config/systemesJeu.js` 
- `src/config/systemesUtils.js`
- `src/config/dataTypes/` (6 fichiers)

**Solution** : Regrouper dans `config/` selon structure cible
```
config/
├── database.js          # Nouveau (config PostgreSQL)
├── systemesJeu.js        # ✅ Déjà présent
├── systemesUtils.js      # ✅ Déjà présent
├── dataTypes/           # ✅ Déjà présent (6 fichiers)
└── environments/        # 🆕 À créer pour .env par environnement
```

### 🆕 Dossiers Manquants à Créer
- **middleware/** : Pas encore créé (auth.js, errors.js, validation.js)

### 🧹 Fichiers Obsolètes à Supprimer
- `src/services/EmailService-old.js` (ancien service email)
- Vérifier doublon : `config/systemesUtils.js` vs `utils/SystemeUtils.js`

### 📁 Dossier viewModels/ Non-Standard
**Problème** : `src/viewModels/SystemCardViewModel.js` pas dans structure cible
**Solution** : Décider si déplacer vers `utils/` ou créer exception

### 📊 Réorganisation services/ (Amélioration structure)

#### Structure Actuelle services/
```
services/
├── [22 services racine]
├── documents/           # 3 documents
│   ├── CharacterSheetDocument.js
│   ├── ClassPlanDocument.js  
│   └── GenericDocument.js
└── themes/              # 5 thèmes
    ├── SystemTheme.js
    ├── EngrenagesTheme.js
    ├── MonsterheartsTheme.js
    ├── Metro2033Theme.js
    └── ZombiologyTheme.js
```

#### Structure Cible Optimisée
```
services/
├── BaseService.js
├── core/                # Services fondamentaux
│   ├── EmailService.js
│   ├── PdfService.js
│   └── SystemService.js
├── business/            # Services métier
│   ├── PersonnageService.js
│   ├── UtilisateurService.js
│   └── OracleService.js
├── documents/           # ✅ Déjà bien organisé
│   └── [3 documents]
└── themes/              # ✅ Déjà bien organisé  
    └── [5 thèmes]
```

## Plan de Migration Détaillé

### Phase 1 : Préparation (Sécurité)
1. **Analyser imports existants** pour identifier dépendances
2. **Créer script migration** pour déplacements automatisés
3. **Backup** de la structure actuelle

### Phase 2 : Regroupement config/
```bash
# Déplacements à effectuer
src/config.js → src/config/database.js (renommage + spécialisation)
src/config/ → src/config/ (déjà OK)
```

### Phase 3 : Création dossiers manquants
```bash
mkdir src/middleware
# Fichiers à créer : auth.js, errors.js, validation.js
```

### Phase 4 : Nettoyage fichiers obsolètes
```bash
del src/services/EmailService-old.js
# Analyser doublon systemesUtils
```

### Phase 5 : Réorganisation services/ (optionnel)
```bash
mkdir src/services/core
mkdir src/services/business
# Déplacer services selon logique métier
```

### Phase 6 : Gestion viewModels/
**Option A** : Déplacer vers utils/ (logique utilitaire)
**Option B** : Créer exception documentée dans CLAUDE.md

## Impact sur Imports

### Fichiers Affectés par Migrations
1. **config.js → config/database.js**
   - `app.js` : import config
   - `database/db.js` : import config database
   
2. **Suppression EmailService-old.js**
   - Vérifier aucune référence restante

3. **Nouveau middleware/**
   - `app.js` : ajouter middleware auth/errors
   - `routes/` : potentiels imports middleware

## Recommandations

### ✅ Actions Prioritaires (Impact Faible)
1. Créer `middleware/` avec fichiers de base
2. Supprimer `EmailService-old.js` 
3. Regrouper `config.js` vers `config/database.js`
4. Créer `config/environments/` pour futures configs

### ⚠️ Actions Optionnelles (Impact Moyen)
1. Réorganisation `services/` en sous-dossiers core/business
2. Résolution doublon systemesUtils
3. Gestion `viewModels/`

### 📈 Conformité Post-Migration
- **Structure cible** : 95% conforme à development-strategy.md
- **Architecture MVC-CS** : Respectée intégralement
- **Principes SOLID** : Séparation responsabilités améliorée
- **Standards Windows** : Chemins préservés

## Métrique de Réussite
- [x] Dossiers conformes structure cible : 7/8 (87.5%)
- [ ] Configurations regroupées : 0/1 (0%)
- [ ] Fichiers obsolètes supprimés : 0/1 (0%)  
- [ ] Middleware créé : 0/1 (0%)

**Post-migration attendu : 100% conformité structure development-strategy.md**