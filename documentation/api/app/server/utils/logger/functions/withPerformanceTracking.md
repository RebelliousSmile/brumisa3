[**Brumisa3 - Documentation API**](../../../../../README.md)

***

[Brumisa3 - Documentation API](../../../../../README.md) / [app/server/utils/logger](../README.md) / withPerformanceTracking

# Function: withPerformanceTracking()

> **withPerformanceTracking**\<`T`\>(`fn`, `label`, `context`, `threshold`): `Promise`\<`T`\>

Defined in: [app/server/utils/logger.ts:78](https://github.com/your-repo/brumisa3-nuxt4/blob/main/app/server/utils/logger.ts#L78)

Helper pour mesurer performance d'une fonction

## Type Parameters

### T

`T`

## Parameters

### fn

() => `Promise`\<`T`\>

### label

`string`

### context

[`LogContext`](../interfaces/LogContext.md)

### threshold

`number` = `500`

## Returns

`Promise`\<`T`\>
