[**Brumisa3 - Documentation API**](../../../../../README.md)

***

[Brumisa3 - Documentation API](../../../../../README.md) / [app/composables/litm/useEditMode](../README.md) / useEditMode

# Function: useEditMode()

> **useEditMode**(): `object`

Defined in: [app/composables/litm/useEditMode.ts:25](https://github.com/your-repo/brumisa3-nuxt4/blob/main/app/composables/litm/useEditMode.ts#L25)

## Returns

### isEditMode

> **isEditMode**: `ComputedRef`\<`boolean`\>

État du mode édition (partagé globalement)

### setEditMode()

> **setEditMode**: (`value`) => `void`

Active ou désactive le mode édition

#### Parameters

##### value

`boolean`

#### Returns

`void`

### toggleEditMode()

> **toggleEditMode**: () => `void`

Bascule entre mode lecture et édition

#### Returns

`void`

### loadEditModePreference()

> **loadEditModePreference**: () => `void`

Charge la préférence depuis localStorage au montage

#### Returns

`void`
