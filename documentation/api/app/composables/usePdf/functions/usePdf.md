[**Brumisa3 - Documentation API**](../../../../README.md)

***

[Brumisa3 - Documentation API](../../../../README.md) / [app/composables/usePdf](../README.md) / usePdf

# Function: usePdf()

> **usePdf**(): `object`

Defined in: [app/composables/usePdf.ts:17](https://github.com/your-repo/brumisa3-nuxt4/blob/main/app/composables/usePdf.ts#L17)

Composable pour la génération et gestion des PDFs

## Returns

### loading

> **loading**: `Readonly`\<`Ref`\<`boolean`, `boolean`\>\>

### error

> **error**: `Readonly`\<`Ref`\<`string`, `string`\>\>

### progress

> **progress**: `Readonly`\<`Ref`\<`number`, `number`\>\>

### genererPdf()

> **genererPdf**: (`request`) => `Promise`\<`PdfGenerationResult`\>

Génère un PDF

#### Parameters

##### request

`PdfGenerationRequest`

#### Returns

`Promise`\<`PdfGenerationResult`\>

### telechargerPdf()

> **telechargerPdf**: (`documentId`) => `Promise`\<`boolean`\>

Télécharge un PDF par son ID

#### Parameters

##### documentId

`number`

#### Returns

`Promise`\<`boolean`\>

### genererEtTelecharger()

> **genererEtTelecharger**: (`request`) => `Promise`\<`boolean`\>

Génère et télécharge directement un PDF (mode anonyme)

#### Parameters

##### request

`PdfGenerationRequest`

#### Returns

`Promise`\<`boolean`\>

### validerDonneesPdf()

> **validerDonneesPdf**: (`request`) => `string`[]

Valide les données avant génération

#### Parameters

##### request

`PdfGenerationRequest`

#### Returns

`string`[]

### estimerDureeGeneration()

> **estimerDureeGeneration**: (`request`) => `number`

Estime la durée de génération selon la complexité

#### Parameters

##### request

`PdfGenerationRequest`

#### Returns

`number`

### previsualiserContenu()

> **previsualiserContenu**: (`request`) => `object`

Prévisualise les données qui seront dans le PDF

#### Parameters

##### request

`PdfGenerationRequest`

#### Returns

`object`

##### titre

> **titre**: `any`

##### type

> **type**: `"CHARACTER"` \| `"TOWN"` \| `"GROUP"` \| `"ORGANIZATION"` \| `"DANGER"` \| `"GENERIQUE"` = `request.type`

##### systeme

> **systeme**: `string` = `request.systeme`

##### sections

> **sections**: `object`[]

### clearError()

> **clearError**: () => `void`

Nettoie les erreurs

#### Returns

`void`

### reset()

> **reset**: () => `void`

Reset de tous les états

#### Returns

`void`
