[**Brumisa3 - Documentation API**](../../../../../../README.md)

***

[Brumisa3 - Documentation API](../../../../../../README.md) / [app/server/utils/validation/playspace.schema](../README.md) / updatePlayspaceSchema

# Variable: updatePlayspaceSchema

> `const` **updatePlayspaceSchema**: `ZodObject`\<\{ `name`: `ZodOptional`\<`ZodString`\>; `description`: `ZodNullable`\<`ZodOptional`\<`ZodString`\>\>; `universeId`: `ZodNullable`\<`ZodOptional`\<`ZodString`\>\>; `isGM`: `ZodOptional`\<`ZodBoolean`\>; \}, `$strip`\>

Defined in: [app/server/utils/validation/playspace.schema.ts:43](https://github.com/your-repo/brumisa3-nuxt4/blob/main/app/server/utils/validation/playspace.schema.ts#L43)

Schema validation : Mise à jour Playspace

Notes :
- hackId non modifiable après création (règle business)
- universeId modifiable (changement univers custom autorisé)
