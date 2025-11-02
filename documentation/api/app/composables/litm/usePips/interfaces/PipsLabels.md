[**Brumisa3 - Documentation API**](../../../../../README.md)

***

[Brumisa3 - Documentation API](../../../../../README.md) / [app/composables/litm/usePips](../README.md) / PipsLabels

# Interface: PipsLabels

Defined in: [app/composables/litm/usePips.ts:28](https://github.com/your-repo/brumisa3-nuxt4/blob/main/app/composables/litm/usePips.ts#L28)

Composable pour gérer les pips (points de progression)

Utilisé pour les trackers, quêtes, et autres mécaniques de progression LITM.
Gère l'état des pips, les incréments/décréments, et les labels associés.

## Param

Valeur initiale des pips (défaut: 0)

## Param

Nombre maximum de pips (défaut: 4)

## Example

```vue
<script setup lang="ts">
const { pips, increment, decrement, getLabel } = usePips(0, 4)
</script>

<template>
  <div>
    <button @click="decrement">-</button>
    <span>{{ pips }} / {{ max }} - {{ getLabel() }}</span>
    <button @click="increment">+</button>
  </div>
</template>
```

## Indexable

\[`key`: `number`\]: `string`
