[**Brumisater - Documentation API**](../../../../README.md)

***

[Brumisater - Documentation API](../../../../README.md) / [server/services/PdfService](../README.md) / PdfService

# Class: PdfService

Defined in: [server/services/PdfService.ts:27](https://github.com/your-repo/brumisater-nuxt4/blob/main/server/services/PdfService.ts#L27)

Service pour la génération et gestion des PDFs avec Nitro

## Constructors

### Constructor

> **new PdfService**(): `PdfService`

Defined in: [server/services/PdfService.ts:31](https://github.com/your-repo/brumisater-nuxt4/blob/main/server/services/PdfService.ts#L31)

#### Returns

`PdfService`

## Properties

### outputDir

> `private` **outputDir**: `string`

Defined in: [server/services/PdfService.ts:28](https://github.com/your-repo/brumisater-nuxt4/blob/main/server/services/PdfService.ts#L28)

***

### templatesDir

> `private` **templatesDir**: `string`

Defined in: [server/services/PdfService.ts:29](https://github.com/your-repo/brumisater-nuxt4/blob/main/server/services/PdfService.ts#L29)

## Methods

### initialiserDossierSortie()

> `private` **initialiserDossierSortie**(): `Promise`\<`void`\>

Defined in: [server/services/PdfService.ts:42](https://github.com/your-repo/brumisater-nuxt4/blob/main/server/services/PdfService.ts#L42)

Initialise le dossier de sortie

#### Returns

`Promise`\<`void`\>

***

### genererDocument()

> **genererDocument**(`options`): `Promise`\<`GeneratedDocument`\>

Defined in: [server/services/PdfService.ts:55](https://github.com/your-repo/brumisater-nuxt4/blob/main/server/services/PdfService.ts#L55)

Génère un document PDF selon le type et le système
Méthode principale pour la génération de documents

#### Parameters

##### options

`PdfGenerationOptions`

#### Returns

`Promise`\<`GeneratedDocument`\>

***

### genererPdfAvecPDFKit()

> `private` **genererPdfAvecPDFKit**(`type`, `donnees`, `systeme`, `cheminSortie`): `Promise`\<`void`\>

Defined in: [server/services/PdfService.ts:112](https://github.com/your-repo/brumisater-nuxt4/blob/main/server/services/PdfService.ts#L112)

Génère un PDF avec PDFKit

#### Parameters

##### type

`string`

##### donnees

`Record`\<`string`, `any`\>

##### systeme

`string`

##### cheminSortie

`string`

#### Returns

`Promise`\<`void`\>

***

### genererContenuPersonnage()

> `private` **genererContenuPersonnage**(`doc`, `donnees`, `couleurs`, `yPosition`): `Promise`\<`number`\>

Defined in: [server/services/PdfService.ts:190](https://github.com/your-repo/brumisater-nuxt4/blob/main/server/services/PdfService.ts#L190)

Génère le contenu pour un personnage

#### Parameters

##### doc

`PDFDocument`

##### donnees

`Record`\<`string`, `any`\>

##### couleurs

`any`

##### yPosition

`number`

#### Returns

`Promise`\<`number`\>

***

### genererContenuOrganisation()

> `private` **genererContenuOrganisation**(`doc`, `donnees`, `couleurs`, `yPosition`): `Promise`\<`number`\>

Defined in: [server/services/PdfService.ts:249](https://github.com/your-repo/brumisater-nuxt4/blob/main/server/services/PdfService.ts#L249)

Génère le contenu pour une organisation

#### Parameters

##### doc

`PDFDocument`

##### donnees

`Record`\<`string`, `any`\>

##### couleurs

`any`

##### yPosition

`number`

#### Returns

`Promise`\<`number`\>

***

### genererContenuLieu()

> `private` **genererContenuLieu**(`doc`, `donnees`, `couleurs`, `yPosition`): `Promise`\<`number`\>

Defined in: [server/services/PdfService.ts:312](https://github.com/your-repo/brumisater-nuxt4/blob/main/server/services/PdfService.ts#L312)

Génère le contenu pour un lieu

#### Parameters

##### doc

`PDFDocument`

##### donnees

`Record`\<`string`, `any`\>

##### couleurs

`any`

##### yPosition

`number`

#### Returns

`Promise`\<`number`\>

***

### genererContenuGenerique()

> `private` **genererContenuGenerique**(`doc`, `donnees`, `couleurs`, `yPosition`): `Promise`\<`number`\>

Defined in: [server/services/PdfService.ts:350](https://github.com/your-repo/brumisater-nuxt4/blob/main/server/services/PdfService.ts#L350)

Génère le contenu générique

#### Parameters

##### doc

`PDFDocument`

##### donnees

`Record`\<`string`, `any`\>

##### couleurs

`any`

##### yPosition

`number`

#### Returns

`Promise`\<`number`\>

***

### getCouleursPourSysteme()

> `private` **getCouleursPourSysteme**(`systeme`): `any`

Defined in: [server/services/PdfService.ts:388](https://github.com/your-repo/brumisater-nuxt4/blob/main/server/services/PdfService.ts#L388)

Obtient les couleurs pour un système donné

#### Parameters

##### systeme

`string`

#### Returns

`any`

***

### getSystemeNomComplet()

> `private` **getSystemeNomComplet**(`systeme`): `string`

Defined in: [server/services/PdfService.ts:421](https://github.com/your-repo/brumisater-nuxt4/blob/main/server/services/PdfService.ts#L421)

Obtient le nom complet du système

#### Parameters

##### systeme

`string`

#### Returns

`string`

***

### genererNomFichierUnique()

> `private` **genererNomFichierUnique**(`type`, `systeme`, `documentId`): `string`

Defined in: [server/services/PdfService.ts:435](https://github.com/your-repo/brumisater-nuxt4/blob/main/server/services/PdfService.ts#L435)

Génère un nom de fichier unique

#### Parameters

##### type

`string`

##### systeme

`string`

##### documentId

`number`

#### Returns

`string`

***

### obtenirPdf()

> **obtenirPdf**(`documentId`): `Promise`\<`string`\>

Defined in: [server/services/PdfService.ts:448](https://github.com/your-repo/brumisater-nuxt4/blob/main/server/services/PdfService.ts#L448)

Récupère un PDF existant par ID de document

#### Parameters

##### documentId

`number`

#### Returns

`Promise`\<`string`\>
