# Inventaire des Fichiers à Modifier - 19 Janvier 2025

## Contexte

Cet inventaire liste tous les fichiers qui mentionnent les systèmes non-Mist à supprimer (Monsterhearts, Engrenages, Metro 2033, Zombiology, PBTA, MYZ).

**Date**: 2025-01-19
**Tâche**: TASK-020A (Audit et Préparation)
**Total fichiers**: 72

## Catégorisation

### ✅ À IGNORER (Documentation de tâches et migration - 13 fichiers)

Ces fichiers font partie de la documentation du nettoyage lui-même :

1. `prisma/migrations/draft_cleanup_non_mist_systems.sql` - Script de nettoyage
2. `documentation/MIGRATION/2025-01-19-backup-before-cleanup.json` - Backup
3. `documentation/MIGRATION/2025-01-19-recommandations-executive-summary.md` - Analyse
4. `documentation/MIGRATION/2025-01-19-cleanup-script-final.sql` - Script final
5. `documentation/MIGRATION/2025-01-19-analyse-architecturale-cleanup.md` - Analyse
6. `documentation/MIGRATION/2025-01-19-inventory-systems.md` - Inventaire
7. `documentation/MIGRATION/2025-01-19-inventory-systems.txt` - Inventaire
8. `documentation/tasks/TASK-2025-01-19-020D-cleanup-mist-documentation.md` - Tâche
9. `documentation/tasks/TASK-2025-01-19-020C-cleanup-mist-code.md` - Tâche
10. `documentation/tasks/TASK-2025-01-19-020B-cleanup-mist-database.md` - Tâche
11. `documentation/tasks/TASK-2025-01-19-020A-cleanup-mist-audit.md` - Tâche
12. `pnpm-lock.yaml` - Dépendances (ne pas modifier)
13. `documentation/MIGRATION/2025-01-19-files-to-modify.md` - Ce fichier

---

### 🔴 PRIORITÉ HAUTE - Backend (6 fichiers)

Ces fichiers doivent être modifiés dans **TASK-020C** :

#### API Routes à Modifier

14. ✏️ `server/api/systems/index.get.ts`
    - **Action**: Mettre à jour `getStaticSystemsData()`
    - **Retirer**: pbta, engrenages, myz, zombiology, monsterhearts, metro2033
    - **Conserver**: mistengine uniquement
    - **Ajouter**: city-of-mist dans les univers
    - **Priorité**: CRITIQUE

15. ✏️ `server/api/systems/[id].get.ts`
    - **Action**: Vérifier la logique, probablement OK (dynamique)
    - **Priorité**: MOYENNE

16. ✏️ `server/api/systems/cards.get.ts`
    - **Action**: Vérifier les références hard-codées
    - **Priorité**: MOYENNE

17. ✏️ `server/api/templates.get.ts`
    - **Action**: Vérifier les templates PDF hard-codés
    - **Priorité**: MOYENNE

18. ✏️ `server/api/oracles.get.ts`
    - **Action**: Vérifier les filtres par système
    - **Priorité**: BASSE (les oracles sont supprimés en DB)

#### Services Backend

19. ✏️ `server/services/PdfService.ts`
    - **Action**: Retirer templates PDF des systèmes supprimés
    - **Priorité**: MOYENNE

20. ✏️ `app/server/services/PdfService.ts` (doublon ?)
    - **Action**: Vérifier s'il s'agit d'un doublon
    - **Priorité**: BASSE

21. ✏️ `server/api/pdfs/recent.get.ts`
    - **Action**: Vérifier les filtres par système
    - **Priorité**: BASSE

---

### 🟡 PRIORITÉ MOYENNE - Frontend (9 fichiers)

Ces fichiers doivent être modifiés dans **TASK-020C** :

#### Pages

22. ✏️ `app/pages/systemes/[slug]/[univers].vue`
    - **Action**: Vérifier le routing dynamique
    - **Priorité**: MOYENNE

23. ✏️ `app/pages/index.vue`
    - **Action**: Retirer références aux systèmes supprimés
    - **Priorité**: HAUTE

#### Layouts

24. ✏️ `app/layouts/default.vue`
    - **Action**: Vérifier les liens de navigation
    - **Priorité**: MOYENNE

#### Composants

25. ✏️ `app/components/TestimonialForm.vue`
    - **Action**: Retirer systèmes du formulaire
    - **Priorité**: BASSE

26. ✏️ `app/components/NewsletterJoin.vue`
    - **Action**: Vérifier mentions des systèmes
    - **Priorité**: BASSE

27. ✏️ `app/components/PdfCard.vue`
    - **Action**: Vérifier affichage par système
    - **Priorité**: BASSE

28. ✏️ `app/components/RecentPdfs.vue`
    - **Action**: Vérifier filtres par système
    - **Priorité**: BASSE

#### State Management

29. ✏️ `shared/stores/systemes.ts`
    - **Action**: Retirer systèmes hard-codés si présents
    - **Priorité**: HAUTE

30. ✏️ `app/composables/useSystemes.ts`
    - **Action**: Vérifier logique de récupération
    - **Priorité**: MOYENNE

#### Styles

31. ✏️ `tailwind.config.js`
    - **Action**: Retirer couleurs des systèmes supprimés
    - **Priorité**: BASSE

32. ✏️ `app/assets/css/tailwind.css`
    - **Action**: Retirer classes CSS spécifiques
    - **Priorité**: BASSE

---

### 🟢 PRIORITÉ BASSE - Tests (10 fichiers)

Ces fichiers doivent être modifiés dans **TASK-020C** :

33. ✏️ `tests/composables/useSystemes.test.ts`
    - **Action**: Mettre à jour tests avec systèmes Mist uniquement
    - **Priorité**: HAUTE (pour les tests)

34. ✏️ `tests/composables/usePdf.test.ts`
    - **Action**: Vérifier systèmes dans les tests
    - **Priorité**: MOYENNE

35. ✏️ `tests/services/PdfService.test.ts`
    - **Action**: Retirer tests des systèmes supprimés
    - **Priorité**: MOYENNE

36. ✏️ `tests/utils/validation.test.ts`
    - **Action**: Vérifier validations par système
    - **Priorité**: BASSE

37. ✏️ `tests/utils/colors.test.ts`
    - **Action**: Retirer couleurs des systèmes supprimés
    - **Priorité**: BASSE

38. ✏️ `tests/integration/pdf-generation.test.ts`
    - **Action**: Retirer tests des systèmes supprimés
    - **Priorité**: HAUTE (pour les tests)

39. ✏️ `tests/integration/pdf-generation-simple.test.ts`
    - **Action**: Mettre à jour systèmes testés
    - **Priorité**: MOYENNE

40. ✏️ `tests/integration/pdf-service-standalone.test.ts`
    - **Action**: Vérifier systèmes dans les tests
    - **Priorité**: MOYENNE

41. ✏️ `tests/integration/pdf-validation.jest.ts`
    - **Action**: Retirer validations des systèmes supprimés
    - **Priorité**: BASSE

42. ✏️ `scripts/integration-test-complete.js`
    - **Action**: Mettre à jour scripts de test
    - **Priorité**: BASSE

43. ✏️ `scripts/validate-pdf-integration.js`
    - **Action**: Retirer systèmes supprimés
    - **Priorité**: BASSE

---

### 📚 PRIORITÉ VARIABLE - Documentation (29 fichiers)

Ces fichiers doivent être modifiés dans **TASK-020D** :

#### Documentation Technique (HAUTE priorité)

44. ✏️ `documentation/SYSTEMES-JDR/systemes-configuration.md`
    - **Action**: Retirer sections complètes des systèmes supprimés
    - **Priorité**: CRITIQUE

45. ✏️ `documentation/SYSTEMES-JDR/systemes-interfaces.md`
    - **Action**: Retirer interfaces TypeScript
    - **Priorité**: HAUTE

46. ✏️ `documentation/DESIGN-SYSTEM/charte-graphique-pdf.md`
    - **Action**: Retirer chartes des systèmes supprimés
    - **Priorité**: HAUTE

47. ✏️ `documentation/DESIGN-SYSTEM/charte-graphique-web.md`
    - **Action**: Retirer styles web des systèmes supprimés
    - **Priorité**: HAUTE

48. ✏️ `documentation/DESIGN-SYSTEM/design-system-guide.md`
    - **Action**: Mettre à jour guide général
    - **Priorité**: MOYENNE

#### Documentation Fonctionnelle (MOYENNE priorité)

49. ✏️ `documentation/FONCTIONNALITES/01-vision-produit.md`
    - **Action**: Mettre à jour vision avec focus Mist
    - **Priorité**: MOYENNE

50. ✏️ `documentation/FONCTIONNALITES/02-creation-documents.md`
    - **Action**: Retirer exemples des systèmes supprimés
    - **Priorité**: MOYENNE

51. ✏️ `documentation/FONCTIONNALITES/03-gestion-personnages.md`
    - **Action**: Focus sur systèmes Mist
    - **Priorité**: MOYENNE

52. ✏️ `documentation/FONCTIONNALITES/04-oracles.md`
    - **Action**: Retirer oracles des systèmes supprimés
    - **Priorité**: MOYENNE

53. ✏️ `documentation/FONCTIONNALITES/05-partage-communaute.md`
    - **Action**: Vérifier mentions des systèmes
    - **Priorité**: BASSE

#### Documentation Architecture (MOYENNE priorité)

54. ✏️ `documentation/ARCHITECTURE/architecture-models.md`
    - **Action**: Retirer modèles des systèmes supprimés
    - **Priorité**: MOYENNE

55. ✏️ `documentation/ARCHITECTURE/architecture-overview.md`
    - **Action**: Mettre à jour vue d'ensemble
    - **Priorité**: MOYENNE

56. ✏️ `documentation/ARCHITECTURE/architecture-avancee.md`
    - **Action**: Vérifier exemples
    - **Priorité**: BASSE

57. ✏️ `documentation/ARCHITECTURE/architecture-frontend.md`
    - **Action**: Retirer composants des systèmes supprimés
    - **Priorité**: BASSE

#### Documentation Développement (BASSE priorité)

58. ✏️ `documentation/DEVELOPPEMENT/pdfkit.md`
    - **Action**: Retirer exemples des systèmes supprimés
    - **Priorité**: BASSE

59. ✏️ `documentation/DEVELOPPEMENT/quickstart.md`
    - **Action**: Mettre à jour guide de démarrage
    - **Priorité**: MOYENNE

60. ✏️ `documentation/DEVELOPPEMENT/development-strategy.md`
    - **Action**: Mettre à jour stratégie
    - **Priorité**: BASSE

61. ✏️ `documentation/DEVELOPPEMENT/phase6-production-guide.md`
    - **Action**: Vérifier mentions
    - **Priorité**: BASSE

62. ✏️ `documentation/DEVELOPPEMENT/flux-generation-pdf.md`
    - **Action**: Retirer flux des systèmes supprimés
    - **Priorité**: BASSE

63. ✏️ `documentation/DEVELOPPEMENT/testing.md`
    - **Action**: Mettre à jour stratégie de test
    - **Priorité**: BASSE

64. ✏️ `documentation/DEVELOPPEMENT/progresql-dump.sql`
    - **Action**: Probablement ancien dump, vérifier
    - **Priorité**: TRÈS BASSE

#### Documentation Migration (BASSE priorité)

65. ✏️ `documentation/MIGRATION/VALIDATION_FONCTIONNALITES.md`
    - **Action**: Vérifier validation
    - **Priorité**: BASSE

66. ✏️ `documentation/MIGRATION/MIGRATION_COMPLETE.md`
    - **Action**: Historique, probablement OK
    - **Priorité**: TRÈS BASSE

#### Documentation Générale

67. ✏️ `documentation/README.md`
    - **Action**: Mettre à jour table des matières
    - **Priorité**: MOYENNE

68. ✏️ `README.md`
    - **Action**: Mettre à jour présentation projet
    - **Priorité**: HAUTE

69. ✏️ `documentation/api.md`
    - **Action**: Retirer API des systèmes supprimés
    - **Priorité**: MOYENNE

70. ✏️ `documentation/testing.md`
    - **Action**: Mettre à jour stratégie de test
    - **Priorité**: BASSE

#### Templates et Ressources

71. ✏️ `documentation/RESSOURCES/templates/monsterhearts-character-sheet.html`
    - **Action**: SUPPRIMER complètement
    - **Priorité**: HAUTE

72. ✏️ `documentation/RESSOURCES/templates/cadre-ville-generique.html`
    - **Action**: Vérifier si lié aux systèmes supprimés
    - **Priorité**: BASSE

73. ✏️ `documentation/RESSOURCES/templates/plan-classe-generique.html`
    - **Action**: Vérifier si lié aux systèmes supprimés
    - **Priorité**: BASSE

---

## Récapitulatif par Priorité

| Priorité | Nombre de Fichiers | Tâche Associée |
|----------|-------------------|----------------|
| **CRITIQUE** | 2 | TASK-020C |
| **HAUTE** | 8 | TASK-020C, TASK-020D |
| **MOYENNE** | 19 | TASK-020C, TASK-020D |
| **BASSE** | 30 | TASK-020D |
| **IGNORER** | 13 | - |
| **TOTAL** | 72 | - |

## Récapitulatif par Catégorie

| Catégorie | Nombre | Tâche |
|-----------|--------|-------|
| Backend API | 6 | TASK-020C |
| Frontend | 9 | TASK-020C |
| Tests | 10 | TASK-020C |
| Documentation Technique | 5 | TASK-020D |
| Documentation Fonctionnelle | 5 | TASK-020D |
| Documentation Architecture | 4 | TASK-020D |
| Documentation Développement | 7 | TASK-020D |
| Documentation Migration | 2 | TASK-020D |
| Documentation Générale | 4 | TASK-020D |
| Templates/Ressources | 3 | TASK-020D |
| À ignorer | 13 | - |
| **TOTAL** | **72** | - |

## Estimation du Temps de Modification

### TASK-020C (Code Backend/Frontend)
- Backend (6 fichiers CRITIQUES/HAUTS): 2h
- Frontend (9 fichiers): 1.5h
- Tests (10 fichiers): 1h
- **Total TASK-020C**: 4.5h ✅ (conforme à l'estimation 4-5h)

### TASK-020D (Documentation)
- Documentation Technique (5 fichiers): 2h
- Documentation Fonctionnelle (5 fichiers): 1h
- Documentation Architecture (4 fichiers): 0.5h
- Documentation Développement (7 fichiers): 1h
- Autres (9 fichiers): 1h
- Tests finaux et validation: 2h
- **Total TASK-020D**: 7.5h ⚠️ (dépasse l'estimation 3-4h → réviser à 5-6h)

---

## Prochaines Étapes

1. ✅ Inventaire complet terminé
2. ⏭️ Documenter l'état actuel (TASK-020A Étape 7)
3. ⏭️ Commiter les fichiers de TASK-020A
4. ⏭️ Passer à TASK-020B (Nettoyage Base de Données)

---

**Document généré par**: Claude (TASK-020A Étape 6)
**Date**: 2025-01-19
**Statut**: ✅ Inventaire complet
