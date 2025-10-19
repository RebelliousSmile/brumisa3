# Task - Composant HeroCard.vue

## Métadonnées
- **ID**: TASK-2025-01-19-006
- **Priorité**: Haute | **Temps estimé**: 5h | **Statut**: À faire

## Description
Créer la carte de héros avec relations de compagnie, quintessences, et sac à dos.

## Fichiers
- `app/components/litm/HeroCard.vue`
- `app/components/litm/Relationships.vue`
- `app/components/litm/Quintessences.vue`
- `app/components/litm/Backpack.vue`
- `tests/components/litm/HeroCard.spec.ts`

## Fonctionnalités
- Nom du personnage éditable
- Liste de relations (compagnon + type de relation)
- Liste de quintessences
- Sac à dos (liste d'items)
- Mode édition/lecture

## Bloqueurs
- TASK-005 (ThemeCard)

## Critères d'Acceptation
- [ ] La carte affiche toutes les informations
- [ ] Édition fonctionnelle
- [ ] Persistance en DB via Prisma
- [ ] Tests unitaires passent
