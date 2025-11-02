[**Brumisa3 - Documentation API**](../../../../../README.md)

***

[Brumisa3 - Documentation API](../../../../../README.md) / [app/composables/litm/usePips](../README.md) / usePips

# Function: usePips()

> **usePips**(`options`): `object`

Defined in: [app/composables/litm/usePips.ts:38](https://github.com/your-repo/brumisa3-nuxt4/blob/main/app/composables/litm/usePips.ts#L38)

## Parameters

### options

[`UsePipsOptions`](../interfaces/UsePipsOptions.md) = `{}`

## Returns

### pips

> **pips**: `Ref`\<`number`, `number`\>

### max

> **max**: `Ref`\<`number`, `number`\>

### increment()

> **increment**: () => `void`

Incrémente le nombre de pips (max: max)

#### Returns

`void`

### decrement()

> **decrement**: () => `void`

Décrémente le nombre de pips (min: 0)

#### Returns

`void`

### setPips()

> **setPips**: (`value`) => `void`

Définit directement la valeur des pips

#### Parameters

##### value

`number`

Nouvelle valeur (sera clampée entre 0 et max)

#### Returns

`void`

### getLabel()

> **getLabel**: () => `string`

Retourne le label associé à la valeur actuelle des pips

#### Returns

`string`

### isMin

> **isMin**: `ComputedRef`\<`boolean`\>

Vérifie si on est à la valeur minimale

### isMax

> **isMax**: `ComputedRef`\<`boolean`\>

Vérifie si on est à la valeur maximale

### percentage

> **percentage**: `ComputedRef`\<`number`\>

Pourcentage de progression (0-100)
