[**Brumisater - Documentation API**](../../../../README.md)

***

[Brumisater - Documentation API](../../../../README.md) / [app/composables/usePersonnages](../README.md) / usePersonnages

# Function: usePersonnages()

> **usePersonnages**(): `object`

Defined in: [app/composables/usePersonnages.ts:32](https://github.com/your-repo/brumisater-nuxt4/blob/main/app/composables/usePersonnages.ts#L32)

Composable pour la gestion des personnages

## Returns

### personnages

> **personnages**: `Readonly`\<`Ref`\<readonly `object`[], readonly `object`[]\>\>

### personnage

> **personnage**: `Readonly`\<`Ref`\<\{ `id`: `number`; `titre`: `string`; `systemeJeu`: `string`; `universJeu?`: `string`; `contenu`: \{\[`key`: `string`\]: `any`; \}; `statut`: `string`; `dateModification`: `string`; `nombreVues`: `number`; `utilisateur?`: \{ `id`: `number`; `nom`: `string`; \}; \}, \{ `id`: `number`; `titre`: `string`; `systemeJeu`: `string`; `universJeu?`: `string`; `contenu`: \{\[`key`: `string`\]: `any`; \}; `statut`: `string`; `dateModification`: `string`; `nombreVues`: `number`; `utilisateur?`: \{ `id`: `number`; `nom`: `string`; \}; \}\>\>

### loading

> **loading**: `Readonly`\<`Ref`\<`boolean`, `boolean`\>\>

### error

> **error**: `Readonly`\<`Ref`\<`string`, `string`\>\>

### chargerPersonnages()

> **chargerPersonnages**: () => `Promise`\<`void`\>

Charge tous les personnages de l'utilisateur connecté

#### Returns

`Promise`\<`void`\>

### chargerPersonnage()

> **chargerPersonnage**: (`id`) => `Promise`\<`unknown`\>

Charge un personnage spécifique par ID

#### Parameters

##### id

`number`

#### Returns

`Promise`\<`unknown`\>

### creerPersonnage()

> **creerPersonnage**: (`data`) => `Promise`\<`Personnage`\>

Crée un nouveau personnage

#### Parameters

##### data

`CreatePersonnageData`

#### Returns

`Promise`\<`Personnage`\>

### mettreAJourPersonnage()

> **mettreAJourPersonnage**: (`id`, `data`) => `Promise`\<`Personnage`\>

Met à jour un personnage existant

#### Parameters

##### id

`number`

##### data

`UpdatePersonnageData`

#### Returns

`Promise`\<`Personnage`\>

### supprimerPersonnage()

> **supprimerPersonnage**: (`id`) => `Promise`\<`boolean`\>

Supprime un personnage

#### Parameters

##### id

`number`

#### Returns

`Promise`\<`boolean`\>

### changerVisibilite()

> **changerVisibilite**: (`id`, `estPublic`) => `Promise`\<`boolean`\>

Change la visibilité d'un personnage (public/privé)

#### Parameters

##### id

`number`

##### estPublic

`boolean`

#### Returns

`Promise`\<`boolean`\>

### rechercherPersonnages()

> **rechercherPersonnages**: (`terme`, `systemeJeu?`) => `Promise`\<`Personnage`[]\>

Recherche des personnages

#### Parameters

##### terme

`string`

##### systemeJeu?

`string`

#### Returns

`Promise`\<`Personnage`[]\>

### chargerPersonnagesPublics()

> **chargerPersonnagesPublics**: (`systemeJeu`) => `Promise`\<`Personnage`[]\>

Charge les personnages publics par système

#### Parameters

##### systemeJeu

`string`

#### Returns

`Promise`\<`Personnage`[]\>

### genererPdf()

> **genererPdf**: (`personnageData`) => `Promise`\<`string`\>

Génère un PDF pour un personnage

#### Parameters

##### personnageData

`Personnage`

#### Returns

`Promise`\<`string`\>

### reset()

> **reset**: () => `void`

Nettoie les données

#### Returns

`void`
