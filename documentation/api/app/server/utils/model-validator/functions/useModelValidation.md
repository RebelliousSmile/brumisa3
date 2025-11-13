[**Brumisa3 - Documentation API**](../../../../../README.md)

***

[Brumisa3 - Documentation API](../../../../../README.md) / [app/server/utils/model-validator](../README.md) / useModelValidation

# Function: useModelValidation()

> **useModelValidation**(): `object`

Defined in: [app/server/utils/model-validator.ts:55](https://github.com/your-repo/brumisa3-nuxt4/blob/main/app/server/utils/model-validator.ts#L55)

Exemple d'utilisation dans une API route

## Returns

### validateBody()

> **validateBody**: (`event`, `modelName`, `mode`) => `Promise`\<`any`\>

Valide le body d'une requête selon un modèle
Renvoie une erreur HTTP 400 si la validation échoue

#### Parameters

##### event

`H3Event`

##### modelName

`string`

##### mode

`"create"` | `"update"`

#### Returns

`Promise`\<`any`\>

### createModelValidator()

> **createModelValidator**: (`modelName`) => `any`

#### Parameters

##### modelName

`string`

#### Returns

`any`
