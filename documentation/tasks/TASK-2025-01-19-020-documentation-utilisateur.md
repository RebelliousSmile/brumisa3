# Task - Documentation Utilisateur LITM

## Métadonnées
- **ID**: TASK-2025-01-19-020
- **Priorité**: Importante | **Temps estimé**: 2h | **Statut**: À faire

## Description
Créer la documentation utilisateur complète pour l'utilisation du système "Legends in the Mist" dans Brumisater.

## Fichiers
- `documentation/UTILISATEUR/legends-in-the-mist-guide.md`
- `app/pages/univers/legends-in-the-mist/aide/index.vue` (Page d'aide)
- `app/pages/univers/legends-in-the-mist/aide/creation-personnage.vue`
- `app/pages/univers/legends-in-the-mist/aide/themes.vue`
- `app/pages/univers/legends-in-the-mist/aide/faq.vue`

## Contenu

### 1. Guide de Création de Personnage
- Étapes de création pas à pas
- Explication de chaque élément (Hero Card, Theme Cards, Trackers)
- Screenshots ou illustrations
- Conseils pour débutants

### 2. Explication des Thèmes
- Qu'est-ce qu'un thème ?
- Types de thèmes (Origin, Adventure, Greatness)
- Themebooks disponibles
- Power tags vs Weakness tags
- Système de quête

### 3. Système de Trackers
- Status Trackers
- Story Tag Trackers
- Story Theme Trackers
- Système de pips
- Signification des labels (Abandon, Améliorer, Jalon, Promesse)

### 4. FAQ
```markdown
## Questions Fréquentes

### Comment créer mon premier personnage ?
[Réponse détaillée avec lien vers guide]

### Qu'est-ce qu'un Power Tag ?
[Explication]

### Comment importer un personnage existant ?
[Lien vers TASK-019 - Migration]

### Puis-je partager mon personnage ?
[Export/Import]

### Comment modifier un personnage existant ?
[Mode édition]
```

### 5. Tutoriel Interactif (Optionnel)
- Tour guidé de l'interface
- Tooltips explicatifs
- Onboarding pour nouveaux utilisateurs

## Structure

```
documentation/UTILISATEUR/
└── legends-in-the-mist/
    ├── README.md (Index)
    ├── creation-personnage.md
    ├── themes-et-tags.md
    ├── trackers.md
    ├── import-export.md
    └── faq.md

app/pages/univers/legends-in-the-mist/aide/
├── index.vue (Hub d'aide)
├── creation-personnage.vue
├── themes.vue
└── faq.vue
```

## Médias

### Screenshots à Créer
- [ ] Interface de création de personnage
- [ ] Theme Card (recto/verso)
- [ ] Hero Card avec relations
- [ ] Trackers avec pips
- [ ] Page d'import
- [ ] Mode édition vs Mode lecture

### Vidéos (Optionnel)
- [ ] Tutoriel vidéo création de personnage (2-3 min)
- [ ] Démonstration des thèmes

## i18n

Documentation en FR et EN :
- `documentation/UTILISATEUR/legends-in-the-mist/fr/`
- `documentation/UTILISATEUR/legends-in-the-mist/en/`

## Critères d'Acceptation

- [ ] Guide de création complet et clair
- [ ] Toutes les sections documentées
- [ ] Screenshots de qualité
- [ ] FAQ couvre les questions courantes
- [ ] Documentation accessible depuis l'app
- [ ] Version FR et EN
- [ ] Exemples concrets

## Bloqueurs

- TASK-010 (Page création) pour screenshots
- Phase 2 complète pour documentation précise

## Références

- [Legends in the Mist - Règles officielles](https://cityofmist.co)
- [characters-of-the-mist - Inspiration](https://github.com/Altervayne/characters-of-the-mist)
