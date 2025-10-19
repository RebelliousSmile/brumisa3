---
description: Créer des tâches recommandées par la code review et les exécuter
---

# Workflow de code review

Tu vas traiter une code review en suivant ce workflow complet :

## Étapes à suivre :

1. **Lire le fichier de code review** fourni en paramètre (ex: `documentation/reviews/2025-10-16-admin-auth-logging.md`)
2. **Analyser les "Actions Requises"** et "Points d'Amélioration" identifiés dans la review
3. **Créer des tâches** dans `documentation/tasks/` pour chaque amélioration/action :
   - Utiliser le template `documentation/templates/task.md`
   - Nommer selon la convention : `amelioration-{XX}-{description-courte}.md`
   - Prioriser selon l'urgence (🔴 CRITIQUE = urgence1, 🟡 IMPORTANT = urgence2, 🟢 NICE-TO-HAVE = urgence3)
   - Ajouter les nouvelles tâches dans `documentation/tasks/README.md`
4. **Exécuter les tâches** avec la slash command `/task` pour chaque fichier de tâche créé
5. **Mettre à jour le fichier de code review** avec les résultats :
   - Marquer les actions comme complétées
   - Ajouter une section "Corrections Appliquées" avec dates et changements
   - Mettre à jour le score si pertinent
6. **Écraser l'ancien fichier de code review** (ne pas créer de nouveau fichier)

## Format des tâches à créer :

Chaque "Action Requise" ou "Point d'Amélioration" de la review doit devenir une tâche distincte avec :

- **Type** : Amélioration / Sécurité / Performance / Bug / Refactoring
- **Urgence** : Selon les marqueurs 🔴🟡🟢 de la review
- **Description** : Extraite de la section correspondante
- **Étapes** : Détaillées depuis les recommandations
- **Checklist** : Reprise des actions spécifiques

## Instructions importantes :

- Utilise la TodoWrite tool pour tracker toutes les étapes
- Crée les tâches AVANT de les exécuter
- Exécute les tâches par ordre de priorité (🔴 puis 🟡 puis 🟢)
- Demande confirmation avant d'écraser le fichier de code review
- Le fichier de review doit contenir l'historique des corrections appliquées

## Exemple de workflow :

```
1. Lit documentation/reviews/2025-10-16-admin-auth-logging.md
2. Identifie 5 actions (2 critiques, 2 importantes, 1 nice-to-have)
3. Crée 5 fichiers dans documentation/tasks/ :
   - amelioration-13-admin-auth-cloud-function.md (critique)
   - amelioration-14-logging-securite-admin.md (critique)
   - amelioration-15-rate-limiting-serveur.md (important)
   - amelioration-16-monitoring-admin.md (important)
   - amelioration-17-refactoring-css-tailwind.md (nice-to-have)
4. Exécute /task amelioration-13... puis /task amelioration-14... etc.
5. Met à jour documentation/reviews/2025-10-16-admin-auth-logging.md :
   - Marque actions #1, #2 comme ✅ complétées
   - Ajoute section "Corrections Appliquées"
   - Met à jour score sécurité 3/5 → 5/5
```