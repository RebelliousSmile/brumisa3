# Task - Documentation Architecture Hybride i18n Classique + Multi-Niveaux

## Métadonnées

- **ID**: TASK-2025-01-20-026
- **Date de création**: 2025-01-20
- **Créé par**: Claude (ana2task)
- **Priorité**: Moyenne
- **Statut**: À faire
- **Temps estimé**: 2h
- **Temps réel**: -

## Description

### Objectif

Documenter l'architecture hybride combinant @nuxtjs/i18n (i18n classique) et le système de traductions multi-niveaux, avec exemples d'usage concrets.

### Contexte

Les développeurs doivent comprendre :
- Quand utiliser `useI18n()` vs `useGameLabels()`
- Comment les deux systèmes coexistent
- Patterns d'implémentation recommandés

### Périmètre

**Inclus**:
- Mise à jour `documentation/ARCHITECTURE/11-systeme-traductions-multi-niveaux.md`
- Ajout section "Architecture Hybride"
- Exemples Vue avec les deux systèmes
- Diagramme de décision "Quel système utiliser ?"
- Migration guide (si traductions existantes)

**Exclu**:
- Documentation utilisateur final (v1.1+)
- Vidéos tutoriels

## Plan d'Implémentation

### Étape 1: Section Architecture Hybride

- Ajouter section au début du document
- Expliquer les 2 systèmes et leurs responsabilités
- Tableau comparatif

### Étape 2: Exemples de Code

- Exemple composant Vue utilisant les deux
- Pattern UI + labels de jeu
- Pattern admin avec override

### Étape 3: Diagramme de Décision

```
Texte statique UI (boutons, menus) ?
  → useI18n() avec fichiers locales/fr/*.json

Label de jeu personnalisable (terminologie) ?
  → useGameLabels() avec DB multi-niveaux
```

### Étape 4: Guide de Migration

- Si traductions existantes dans JSON
- Comment les migrer vers TranslationEntry
- Script de migration (optionnel)

### Étape 5: FAQs

- "Pourquoi deux systèmes ?"
- "Puis-je utiliser seulement l'un des deux ?"
- "Comment débugger une traduction manquante ?"

## Fichiers Concernés

**Fichiers à modifier**:
- [ ] `documentation/ARCHITECTURE/11-systeme-traductions-multi-niveaux.md`

**Optionnel**:
- [ ] `documentation/DEVELOPPEMENT/guide-traductions.md` (nouveau)

## Tests

- [ ] Review par 2 développeurs
- [ ] Les exemples de code sont corrects (testés)
- [ ] Le diagramme de décision est clair

## Dépendances

- [ ] TASK-2025-01-20-021 à 024 doivent être terminés (pour exemples réels)

## Critères d'Acceptation

- [ ] Documentation complète et à jour
- [ ] Exemples de code testés et fonctionnels
- [ ] Diagramme de décision clair
- [ ] FAQs répondent aux questions courantes
- [ ] Revue approuvée par Product Owner

## Références

- `documentation/ARCHITECTURE/11-systeme-traductions-multi-niveaux.md` (existant)
