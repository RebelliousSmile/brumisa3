[**Brumisa3 - Documentation API**](../../../../README.md)

***

[Brumisa3 - Documentation API](../../../../README.md) / [app/composables/useRadialMenu](../README.md) / useRadialMenu

# Function: useRadialMenu()

> **useRadialMenu**(): `object`

Defined in: [app/composables/useRadialMenu.ts:33](https://github.com/your-repo/brumisa3-nuxt4/blob/main/app/composables/useRadialMenu.ts#L33)

## Returns

### activeMenu

> **activeMenu**: `Readonly`\<`Ref`\<`MenuType`, `MenuType`\>\>

### isAnyMenuOpen

> **isAnyMenuOpen**: `Readonly`\<`Ref`\<`boolean`, `boolean`\>\>

### openMenu()

> **openMenu**: (`menuType`) => `void`

Ouvre un menu radial (ferme l'autre automatiquement)

#### Parameters

##### menuType

`MenuType`

#### Returns

`void`

### closeMenu()

> **closeMenu**: () => `void`

Ferme tous les menus radiaux

#### Returns

`void`

### toggleMenu()

> **toggleMenu**: (`menuType`) => `void`

Toggle un menu (ouvre si fermé, ferme si ouvert)

#### Parameters

##### menuType

`MenuType`

#### Returns

`void`

### isMenuOpen()

> **isMenuOpen**: (`menuType`) => `boolean`

Vérifie si un menu spécifique est ouvert

#### Parameters

##### menuType

`MenuType`

#### Returns

`boolean`
