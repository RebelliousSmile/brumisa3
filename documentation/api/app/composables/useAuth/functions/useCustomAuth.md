[**Brumisa3 - Documentation API**](../../../../README.md)

***

[Brumisa3 - Documentation API](../../../../README.md) / [app/composables/useAuth](../README.md) / useCustomAuth

# Function: useCustomAuth()

> **useCustomAuth**(): `object`

Defined in: [app/composables/useAuth.ts:22](https://github.com/your-repo/brumisa3-nuxt4/blob/main/app/composables/useAuth.ts#L22)

Composable personnalisé pour l'authentification

## Returns

### user

> **user**: `Readonly`\<`Ref`\<\{ `id`: `number`; `email`: `string`; `role`: `"ADMIN"` \| `"UTILISATEUR"`; `createdAt`: `string`; \}, \{ `id`: `number`; `email`: `string`; `role`: `"ADMIN"` \| `"UTILISATEUR"`; `createdAt`: `string`; \}\>\>

### isLoggedIn

> **isLoggedIn**: `Readonly`\<`Ref`\<`boolean`, `boolean`\>\>

### isAdmin

> **isAdmin**: `Readonly`\<`Ref`\<`boolean`, `boolean`\>\>

### loading

> **loading**: `Readonly`\<`Ref`\<`boolean`, `boolean`\>\>

### error

> **error**: `Readonly`\<`Ref`\<`string`, `string`\>\>

### login()

> **login**: (`credentials`) => `Promise`\<`boolean`\>

Connexion utilisateur

#### Parameters

##### credentials

`LoginCredentials`

#### Returns

`Promise`\<`boolean`\>

### register()

> **register**: (`data`) => `Promise`\<`boolean`\>

Inscription utilisateur

#### Parameters

##### data

`RegisterData`

#### Returns

`Promise`\<`boolean`\>

### logout()

> **logout**: () => `Promise`\<`void`\>

Déconnexion utilisateur

#### Returns

`Promise`\<`void`\>

### updateProfile()

> **updateProfile**: (`profileData`) => `Promise`\<`boolean`\>

Met à jour le profil utilisateur

#### Parameters

##### profileData

###### email?

`string`

###### password?

`string`

###### currentPassword?

`string`

#### Returns

`Promise`\<`boolean`\>

### deleteAccount()

> **deleteAccount**: (`password`) => `Promise`\<`boolean`\>

Supprime le compte utilisateur

#### Parameters

##### password

`string`

#### Returns

`Promise`\<`boolean`\>

### canAccess()

> **canAccess**: (`requiredRole?`) => `boolean`

Vérifie les permissions pour une action

#### Parameters

##### requiredRole?

`"ADMIN"` | `"UTILISATEUR"`

#### Returns

`boolean`

### requireAuth()

> **requireAuth**: () => `void`

Middleware de protection des routes

#### Returns

`void`

### requireAdmin()

> **requireAdmin**: () => `void`

Middleware de protection admin

#### Returns

`void`

### clearError()

> **clearError**: () => `void`

Nettoie les erreurs

#### Returns

`void`

### initializeAuth()

> **initializeAuth**: () => `Promise`\<`void`\>

Charge la session au démarrage

#### Returns

`Promise`\<`void`\>
