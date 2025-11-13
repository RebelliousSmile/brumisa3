[**Brumisa3 - Documentation API**](../../../../README.md)

***

[Brumisa3 - Documentation API](../../../../README.md) / [app/composables/useI18nLitm](../README.md) / useI18nLitm

# Function: useI18nLitm()

> **useI18nLitm**(): `object`

Defined in: [app/composables/useI18nLitm.ts:14](https://github.com/your-repo/brumisa3-nuxt4/blob/main/app/composables/useI18nLitm.ts#L14)

Composable pour faciliter l'acces aux traductions Legends in the Mist

Fournit des helpers types pour acceder aux differents domaines de traduction
avec fallback automatique FR/EN.

## Returns

### tCharacter()

> **tCharacter**: (`key`, `params?`) => `string`

Helper pour les traductions de personnages
Namespace: characterSheet, heroCard, backpack, quintessences

#### Parameters

##### key

`string`

##### params?

`Record`\<`string`, `any`\>

#### Returns

`string`

### tCard()

> **tCard**: (`key`, `params?`) => `string`

Helper pour les traductions de cartes
Namespace: themeCard, tagItem, improvements, createCardDialog

#### Parameters

##### key

`string`

##### params?

`Record`\<`string`, `any`\>

#### Returns

`string`

### tTracker()

> **tTracker**: (`key`, `params?`) => `string`

Helper pour les traductions de suivis
Namespace: trackers, pipTracker

#### Parameters

##### key

`string`

##### params?

`Record`\<`string`, `any`\>

#### Returns

`string`

### tThemebook()

> **tThemebook**: (`key`, `params?`) => `string`

Helper pour les traductions de themebooks
Namespace: themebook, themeTypes

#### Parameters

##### key

`string`

##### params?

`Record`\<`string`, `any`\>

#### Returns

`string`

### tUI()

> **tUI**: (`key`, `params?`) => `string`

Helper pour les traductions d'interface
Namespace: actions, tooltips, cardRenderer

#### Parameters

##### key

`string`

##### params?

`Record`\<`string`, `any`\>

#### Returns

`string`

### tError()

> **tError**: (`key`, `params?`) => `string`

Helper pour les messages d'erreur et notifications
Namespace: notifications, errors

#### Parameters

##### key

`string`

##### params?

`Record`\<`string`, `any`\>

#### Returns

`string`

### tLitm()

> **tLitm**: (`key`, `params?`) => `string`

Traduction generale LITM (tous les namespaces)

#### Parameters

##### key

`string`

##### params?

`Record`\<`string`, `any`\>

#### Returns

`string`

### hasKey()

> **hasKey**: (`key`) => `boolean`

Verifie si une cle de traduction existe

#### Parameters

##### key

`string`

#### Returns

`boolean`

### setLocale()

> **setLocale**: (`newLocale`) => `void`

Change la locale courante

#### Parameters

##### newLocale

`"fr"` | `"en"`

#### Returns

`void`

### currentLocale

> **currentLocale**: `ComputedRef`\<`"fr"` \| `"en"`\>

Recupere la locale courante

### locale

> **locale**: `WritableComputedRef`\<`"fr"` \| `"en"`, `"fr"` \| `"en"`\>

## Example

```ts
const { tCharacter, tCard } = useI18nLitm()
const charName = tCharacter('characterSheet.newCharacterName')
const cardTitle = tCard('themeCard.fellowshipTitle')
```
