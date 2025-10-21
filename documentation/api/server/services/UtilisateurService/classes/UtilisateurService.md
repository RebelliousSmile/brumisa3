[**Brumisa3 - Documentation API**](../../../../README.md)

***

[Brumisa3 - Documentation API](../../../../README.md) / [server/services/UtilisateurService](../README.md) / UtilisateurService

# Class: UtilisateurService

Defined in: [server/services/UtilisateurService.ts:20](https://github.com/your-repo/brumisa3-nuxt4/blob/main/server/services/UtilisateurService.ts#L20)

Service pour la gestion des utilisateurs

## Constructors

### Constructor

> **new UtilisateurService**(): `UtilisateurService`

#### Returns

`UtilisateurService`

## Methods

### creerUtilisateur()

> **creerUtilisateur**(`data`): `Promise`\<`any`\>

Defined in: [server/services/UtilisateurService.ts:25](https://github.com/your-repo/brumisa3-nuxt4/blob/main/server/services/UtilisateurService.ts#L25)

Crée un nouveau utilisateur

#### Parameters

##### data

`CreateUtilisateurData`

#### Returns

`Promise`\<`any`\>

***

### authentifierUtilisateur()

> **authentifierUtilisateur**(`email`, `password`): `Promise`\<`any`\>

Defined in: [server/services/UtilisateurService.ts:68](https://github.com/your-repo/brumisa3-nuxt4/blob/main/server/services/UtilisateurService.ts#L68)

Authentifie un utilisateur

#### Parameters

##### email

`string`

##### password

`string`

#### Returns

`Promise`\<`any`\>

***

### obtenirUtilisateur()

> **obtenirUtilisateur**(`id`): `Promise`\<`any`\>

Defined in: [server/services/UtilisateurService.ts:106](https://github.com/your-repo/brumisa3-nuxt4/blob/main/server/services/UtilisateurService.ts#L106)

Récupère un utilisateur par ID

#### Parameters

##### id

`number`

#### Returns

`Promise`\<`any`\>

***

### mettreAJourUtilisateur()

> **mettreAJourUtilisateur**(`id`, `data`): `Promise`\<`any`\>

Defined in: [server/services/UtilisateurService.ts:129](https://github.com/your-repo/brumisa3-nuxt4/blob/main/server/services/UtilisateurService.ts#L129)

Met à jour un utilisateur

#### Parameters

##### id

`number`

##### data

`UpdateUtilisateurData`

#### Returns

`Promise`\<`any`\>

***

### supprimerUtilisateur()

> **supprimerUtilisateur**(`id`): `Promise`\<\{ `success`: `boolean`; `message`: `string`; \}\>

Defined in: [server/services/UtilisateurService.ts:179](https://github.com/your-repo/brumisa3-nuxt4/blob/main/server/services/UtilisateurService.ts#L179)

Supprime un utilisateur

#### Parameters

##### id

`number`

#### Returns

`Promise`\<\{ `success`: `boolean`; `message`: `string`; \}\>

***

### obtenirStatistiquesUtilisateur()

> **obtenirStatistiquesUtilisateur**(`id`): `Promise`\<\{ `totalDocuments`: `number`; `documentsPublics`: `number`; `documentsBrouillon`: `number`; `parType`: `Record`\<`string`, `number`\>; `totalVues`: `number`; \}\>

Defined in: [server/services/UtilisateurService.ts:201](https://github.com/your-repo/brumisa3-nuxt4/blob/main/server/services/UtilisateurService.ts#L201)

Récupère les statistiques d'un utilisateur

#### Parameters

##### id

`number`

#### Returns

`Promise`\<\{ `totalDocuments`: `number`; `documentsPublics`: `number`; `documentsBrouillon`: `number`; `parType`: `Record`\<`string`, `number`\>; `totalVues`: `number`; \}\>

***

### obtenirListeUtilisateurs()

> **obtenirListeUtilisateurs**(`page`, `limit`): `Promise`\<\{ `utilisateurs`: `any`; `total`: `any`; `page`: `number`; `totalPages`: `number`; \}\>

Defined in: [server/services/UtilisateurService.ts:248](https://github.com/your-repo/brumisa3-nuxt4/blob/main/server/services/UtilisateurService.ts#L248)

Récupère la liste des utilisateurs (admin uniquement)

#### Parameters

##### page

`number` = `1`

##### limit

`number` = `50`

#### Returns

`Promise`\<\{ `utilisateurs`: `any`; `total`: `any`; `page`: `number`; `totalPages`: `number`; \}\>

***

### changerRoleUtilisateur()

> **changerRoleUtilisateur**(`id`, `nouveauRole`): `Promise`\<`any`\>

Defined in: [server/services/UtilisateurService.ts:287](https://github.com/your-repo/brumisa3-nuxt4/blob/main/server/services/UtilisateurService.ts#L287)

Change le rôle d'un utilisateur (admin uniquement)

#### Parameters

##### id

`number`

##### nouveauRole

`"UTILISATEUR"` | `"ADMIN"`

#### Returns

`Promise`\<`any`\>

***

### utilisateurExiste()

> **utilisateurExiste**(`email`): `Promise`\<`boolean`\>

Defined in: [server/services/UtilisateurService.ts:309](https://github.com/your-repo/brumisa3-nuxt4/blob/main/server/services/UtilisateurService.ts#L309)

Vérifie si un utilisateur existe par email

#### Parameters

##### email

`string`

#### Returns

`Promise`\<`boolean`\>

***

### obtenirDocumentsRecentsUtilisateur()

> **obtenirDocumentsRecentsUtilisateur**(`id`, `limit`): `Promise`\<`any`\>

Defined in: [server/services/UtilisateurService.ts:326](https://github.com/your-repo/brumisa3-nuxt4/blob/main/server/services/UtilisateurService.ts#L326)

Récupère les documents récents d'un utilisateur

#### Parameters

##### id

`number`

##### limit

`number` = `10`

#### Returns

`Promise`\<`any`\>
