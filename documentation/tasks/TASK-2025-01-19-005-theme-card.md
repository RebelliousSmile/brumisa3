# Task - Composant ThemeCard.vue

## Métadonnées
- **ID**: TASK-2025-01-19-005
- **Priorité**: Haute | **Temps estimé**: 6h | **Statut**: À faire

## Description
Créer le composant Vue 3 pour les cartes de thème avec power/weakness tags, système de quête, et flip card (recto/verso).

## Fichiers
- `app/components/litm/ThemeCard.vue` (nouveau)
- `app/components/litm/PowerTag.vue` (nouveau)
- `app/components/litm/WeaknessTag.vue` (nouveau)
- `app/components/litm/QuestPanel.vue` (nouveau)
- `tests/components/litm/ThemeCard.spec.ts` (nouveau)

## Fonctionnalités
- Affichage du thème (themebook name + main tag)
- Liste de power tags (ajout/suppression en mode édition)
- Liste de weakness tags
- Panel de quête (éditable)
- Flip card pour voir recto/verso
- Système de pips pour la quête
- Support des améliorations

## Bloqueurs
- TASK-001 (i18n config)
- TASK-004 (Modèle Prisma)

## Critères d'Acceptation
- [ ] Le composant s'affiche correctement
- [ ] Les tags sont éditables en mode édition
- [ ] Le flip fonctionne
- [ ] Les tests passent
- [ ] Traductions i18n intégrées
