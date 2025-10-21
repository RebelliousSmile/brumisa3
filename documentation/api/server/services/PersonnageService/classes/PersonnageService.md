[**Brumisa3 - Documentation API**](../../../../README.md)

***

[Brumisa3 - Documentation API](../../../../README.md) / [server/services/PersonnageService](../README.md) / PersonnageService

# Class: PersonnageService

Defined in: [server/services/PersonnageService.ts:19](https://github.com/your-repo/brumisa3-nuxt4/blob/main/server/services/PersonnageService.ts#L19)

Service pour la gestion des personnages

## Constructors

### Constructor

> **new PersonnageService**(): `PersonnageService`

#### Returns

`PersonnageService`

## Methods

### creerPersonnage()

> **creerPersonnage**(`data`, `utilisateurId?`): `Promise`\<`any`\>

Defined in: [server/services/PersonnageService.ts:24](https://github.com/your-repo/brumisa3-nuxt4/blob/main/server/services/PersonnageService.ts#L24)

Crée un nouveau personnage

#### Parameters

##### data

`CreatePersonnageData`

##### utilisateurId?

`number`

#### Returns

`Promise`\<`any`\>

***

### obtenirPersonnage()

> **obtenirPersonnage**(`id`, `utilisateurId?`): `Promise`\<`any`\>

Defined in: [server/services/PersonnageService.ts:58](https://github.com/your-repo/brumisa3-nuxt4/blob/main/server/services/PersonnageService.ts#L58)

Récupère un personnage par ID

#### Parameters

##### id

`number`

##### utilisateurId?

`number`

#### Returns

`Promise`\<`any`\>

***

### mettreAJourPersonnage()

> **mettreAJourPersonnage**(`id`, `data`, `utilisateurId`): `Promise`\<`any`\>

Defined in: [server/services/PersonnageService.ts:109](https://github.com/your-repo/brumisa3-nuxt4/blob/main/server/services/PersonnageService.ts#L109)

Met à jour un personnage

#### Parameters

##### id

`number`

##### data

`UpdatePersonnageData`

##### utilisateurId

`number`

#### Returns

`Promise`\<`any`\>

***

### supprimerPersonnage()

> **supprimerPersonnage**(`id`, `utilisateurId`): `Promise`\<\{ `success`: `boolean`; `message`: `string`; \}\>

Defined in: [server/services/PersonnageService.ts:138](https://github.com/your-repo/brumisa3-nuxt4/blob/main/server/services/PersonnageService.ts#L138)

Supprime un personnage

#### Parameters

##### id

`number`

##### utilisateurId

`number`

#### Returns

`Promise`\<\{ `success`: `boolean`; `message`: `string`; \}\>

***

### obtenirPersonnagesUtilisateur()

> **obtenirPersonnagesUtilisateur**(`utilisateurId`, `page`, `limit`): `Promise`\<\{ `data`: `any`; `total`: `any`; `page`: `number`; `totalPages`: `number`; \}\>

Defined in: [server/services/PersonnageService.ts:162](https://github.com/your-repo/brumisa3-nuxt4/blob/main/server/services/PersonnageService.ts#L162)

Liste les personnages d'un utilisateur

#### Parameters

##### utilisateurId

`number`

##### page

`number` = `1`

##### limit

`number` = `20`

#### Returns

`Promise`\<\{ `data`: `any`; `total`: `any`; `page`: `number`; `totalPages`: `number`; \}\>

***

### rechercherPersonnages()

> **rechercherPersonnages**(`terme`, `systemeJeu?`, `utilisateurId?`): `Promise`\<\{ `data`: `any`; \}\>

Defined in: [server/services/PersonnageService.ts:208](https://github.com/your-repo/brumisa3-nuxt4/blob/main/server/services/PersonnageService.ts#L208)

Recherche des personnages

#### Parameters

##### terme

`string`

##### systemeJeu?

`string`

##### utilisateurId?

`number`

#### Returns

`Promise`\<\{ `data`: `any`; \}\>

***

### obtenirPersonnagesPublics()

> **obtenirPersonnagesPublics**(`systemeJeu`, `page`, `limit`): `Promise`\<\{ `data`: `any`; `total`: `any`; `page`: `number`; `totalPages`: `number`; \}\>

Defined in: [server/services/PersonnageService.ts:261](https://github.com/your-repo/brumisa3-nuxt4/blob/main/server/services/PersonnageService.ts#L261)

Récupère les personnages publics par système

#### Parameters

##### systemeJeu

`string`

##### page

`number` = `1`

##### limit

`number` = `20`

#### Returns

`Promise`\<\{ `data`: `any`; `total`: `any`; `page`: `number`; `totalPages`: `number`; \}\>

***

### changerVisibilitePersonnage()

> **changerVisibilitePersonnage**(`id`, `estPublic`, `utilisateurId`): `Promise`\<`any`\>

Defined in: [server/services/PersonnageService.ts:315](https://github.com/your-repo/brumisa3-nuxt4/blob/main/server/services/PersonnageService.ts#L315)

Change la visibilité d'un personnage

#### Parameters

##### id

`number`

##### estPublic

`boolean`

##### utilisateurId

`number`

#### Returns

`Promise`\<`any`\>

***

### obtenirStatistiquesPersonnages()

> **obtenirStatistiquesPersonnages**(`utilisateurId`): `Promise`\<\{ `totalPersonnages`: `number`; `personnagesPublics`: `number`; `personnagesBrouillon`: `number`; `totalVues`: `number`; `parSysteme`: `Record`\<`string`, `number`\>; \}\>

Defined in: [server/services/PersonnageService.ts:342](https://github.com/your-repo/brumisa3-nuxt4/blob/main/server/services/PersonnageService.ts#L342)

Récupère les statistiques des personnages d'un utilisateur

#### Parameters

##### utilisateurId

`number`

#### Returns

`Promise`\<\{ `totalPersonnages`: `number`; `personnagesPublics`: `number`; `personnagesBrouillon`: `number`; `totalVues`: `number`; `parSysteme`: `Record`\<`string`, `number`\>; \}\>
