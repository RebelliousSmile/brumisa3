[**Brumisa3 - Documentation API**](../../../../README.md)

***

[Brumisa3 - Documentation API](../../../../README.md) / [app/composables/useSystemes](../README.md) / useSystemes

# Function: useSystemes()

> **useSystemes**(): `object`

Defined in: [app/composables/useSystemes.ts:47](https://github.com/your-repo/brumisa3-nuxt4/blob/main/app/composables/useSystemes.ts#L47)

Composable pour la gestion des systèmes de jeu

## Returns

### systemes

> **systemes**: `Readonly`\<`Ref`\<readonly `object`[], readonly `object`[]\>\>

### systemesCards

> **systemesCards**: `Readonly`\<`Ref`\<\{ `mainColumn`: readonly `object`[]; `secondColumn`: readonly `object`[]; \}, \{ `mainColumn`: readonly `object`[]; `secondColumn`: readonly `object`[]; \}\>\>

### systemesActifs

> **systemesActifs**: `ComputedRef`\<`object`[]\>

Filtre les systèmes actifs

### loading

> **loading**: `Readonly`\<`Ref`\<`boolean`, `boolean`\>\>

### error

> **error**: `Readonly`\<`Ref`\<`string`, `string`\>\>

### chargerSystemes()

> **chargerSystemes**: () => `Promise`\<`void`\>

Charge tous les systèmes disponibles

#### Returns

`Promise`\<`void`\>

### chargerSystemesCards()

> **chargerSystemesCards**: () => `Promise`\<`void`\>

Charge les cartes systèmes pour l'affichage page d'accueil

#### Returns

`Promise`\<`void`\>

### obtenirSysteme()

> **obtenirSysteme**: (`id`) => `Promise`\<`SystemeJeu`\>

Récupère un système par son ID

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`SystemeJeu`\>

### obtenirUnivers()

> **obtenirUnivers**: (`systemeId`, `universId`) => `Promise`\<`UniversJeu`\>

Récupère un univers par son ID

#### Parameters

##### systemeId

`string`

##### universId

`string`

#### Returns

`Promise`\<`UniversJeu`\>

### obtenirConfigurationDocument()

> **obtenirConfigurationDocument**: (`systemeId`, `universId?`, `typeDocument?`) => `Promise`\<\{ `data`: \{\[`key`: `string`\]: `never`; \}; \}\>

Récupère la configuration d'un type de document pour un système/univers

#### Parameters

##### systemeId

`string`

##### universId?

`string`

##### typeDocument?

`string`

#### Returns

`Promise`\<\{ `data`: \{\[`key`: `string`\]: `never`; \}; \}\>

### rechercherSysteme()

> **rechercherSysteme**: (`terme`) => `SystemeJeu`[]

Recherche un système par nom

#### Parameters

##### terme

`string`

#### Returns

`SystemeJeu`[]

### getCouleursPourSysteme()

> **getCouleursPourSysteme**: (`systemeId`) => `object`

Obtient les couleurs pour un système donné

#### Parameters

##### systemeId

`string`

#### Returns

`object`

##### primary

> **primary**: `string`

##### secondary

> **secondary**: `string`

##### classes

> **classes**: `any`

### getIconPourSysteme()

> **getIconPourSysteme**: (`systemeId`) => `string`

Obtient l'icône pour un système donné

#### Parameters

##### systemeId

`string`

#### Returns

`string`

### getNomCompletSysteme()

> **getNomCompletSysteme**: (`systemeId`) => `string`

Obtient le nom complet d'un système

#### Parameters

##### systemeId

`string`

#### Returns

`string`

### estSystemeSupporte()

> **estSystemeSupporte**: (`systemeId`) => `boolean`

Vérifie si un système est supporté

#### Parameters

##### systemeId

`string`

#### Returns

`boolean`

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
