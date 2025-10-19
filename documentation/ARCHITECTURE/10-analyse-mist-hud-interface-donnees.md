# Analyse Mist HUD - Interface et Données

## Vue d'ensemble

Cette documentation analyse le module **Mist HUD** de Mordachai pour Foundry VTT, qui fournit une interface "always-on" pour les systèmes City of Mist, Otherscape et Legends in the Mist. L'analyse se concentre sur :

1. **Les données présentées** dans les HUDs (PJ et NPC)
2. **La structure de stockage** des informations (Actor-Item model de Foundry)
3. **La présentation visuelle** et l'organisation de l'interface
4. **Les recommandations** pour adapter ces patterns à Brumisater

**Repository analysé** : [mordachai/mist-hud](https://github.com/mordachai/mist-hud)

**Version analysée** : v2.50.2 (Foundry VTT v13)

**Systèmes supportés** : City of Mist, Otherscape, Legends in the Mist

---

## Architecture des Données

### 1. Modèle de Stockage Foundry VTT

Le Mist HUD s'appuie sur le **Actor-Item model** de Foundry VTT :

```
Actor (Character/Danger/Crew)
├── Items (collection)
│   ├── Theme (type: "theme")
│   │   └── system.mystery, system.attention, system.crack
│   ├── Tag (type: "tag")
│   │   ├── system.subtype: "power" | "weakness" | "story" | "loadout"
│   │   ├── system.theme_id (FK vers Theme)
│   │   ├── system.burned: boolean
│   │   ├── system.burn_state: 0 | 1
│   │   ├── system.inverted: boolean
│   │   ├── system.temporary: boolean
│   │   ├── system.permanent: boolean
│   │   └── system.parentId (pour subtags)
│   ├── Status (type: "status")
│   │   ├── system.tier: 1-6
│   │   ├── system.temporary: boolean
│   │   └── system.permanent: boolean
│   ├── Improvement (type: "improvement")
│   │   ├── system.theme_id (FK vers Theme)
│   │   ├── system.effect_class
│   │   ├── system.uses.current / max
│   │   └── system.description
│   ├── Clue (type: "clue")
│   │   ├── system.amount
│   │   ├── system.partial: boolean
│   │   ├── system.source
│   │   └── system.method
│   ├── Juice (type: "juice")
│   │   ├── system.subtype: "help" | "hurt" | null
│   │   ├── system.amount
│   │   ├── system.targetCharacterId (FK vers Actor)
│   │   ├── system.source
│   │   └── system.method
│   ├── Move (type: "move")
│   │   ├── system.category: "Specials" | "Threats" | "Limits" | "Custom"
│   │   ├── system.description
│   │   └── system.hideName: boolean
│   └── Spectrum (type: "spectrum")
│       └── system.maxTier
└── Flags
    └── "mist-hud"."active-bonuses" { help: {}, hurt: {} }
```

### 2. Extraction des Données (mh-getters.js)

**Fichier** : `scripts/mh-getters.js` (27 KB, 800+ lignes)

Le module utilise des **fonctions getter** pour extraire et transformer les données depuis les Actors :

#### a. `getThemesAndTags(actor)`

Récupère tous les thèmes et tags d'un personnage :

```javascript
export function getThemesAndTags(actor) {
  const items = actor.items.contents;
  const themeItems = items.filter(item =>
    item.type === "theme" && item.name !== "__LOADOUT__"
  );
  const tagItems = items.filter(item => item.type === "tag");

  // Regrouper les subtags par parent
  const subTagsByParent = tagItems.reduce((acc, tag) => {
    if (tag.system.parentId) {
      if (!acc[tag.system.parentId]) acc[tag.system.parentId] = [];
      acc[tag.system.parentId].push(tag);
    }
    return acc;
  }, {});

  // Traiter chaque thème
  const themes = themeItems.map(theme => {
    const themeId = theme.id;
    const themeType = theme.themebook.system?.subtype || "Default";

    return {
      id: themeId,
      themeName: theme.name,
      category: themeType,  // "Mythos", "Logos", "Self", "Origin", etc.
      powerTags: getPowerTags(themeId, tagItems, subTagsByParent, actor),
      weaknessTags: getWeaknessTags(themeId, tagItems, subTagsByParent, actor),
      localizedThemebookName: theme.themebook.name,
      unspent_upgrades: theme.system.unspent_upgrades || 0,
    };
  });

  return { themes, storyTags, crewThemes };
}
```

**Données extraites** :
- **Themes** : Liste des thèmes avec leurs types (Origin, Adventure, Mythos, etc.)
- **Power Tags** : Tags de pouvoir par thème
- **Weakness Tags** : Tags de faiblesse par thème
- **Story Tags** : Tags d'histoire globaux
- **Crew Themes** : Thèmes d'équipe (Fellowship, Crew)

#### b. `getPowerTags(themeId, tagItems, subTagsByParent, actor)`

Filtre et enrichit les Power Tags :

```javascript
export function getPowerTags(themeId, tagItems, subTagsByParent, actor) {
  const powerTags = tagItems.filter(tag =>
    tag.system.theme_id === themeId &&
    tag.system.subtype === "power"
  );

  return powerTags.map(tag => {
    const tagData = applyBurnState(actor, tag.id);
    return {
      ...tagData,
      tagName: tag.name,
      crispy: tag.system.crispy || false,  // LITM special
      actorId: actor.id,
      themeId: tag.system.theme_id
    };
  });
}
```

#### c. `applyBurnState(actor, tagId, tagType)`

Détermine l'état de "burn" d'un tag :

```javascript
export function applyBurnState(actor, tagId, tagType = "power") {
  const tagItem = actor?.items.get(tagId);

  const burnState = tagItem.system.burned
    ? "burned"
    : tagItem.system.burn_state === 1
      ? "toBurn"
      : "unburned";

  return {
    id: tagId,
    tagName: tagItem.name,
    burnState,           // "burned" | "toBurn" | "unburned"
    cssClass: burnState,
    burnIcon: getIcon(burnState, "burn"),
    permanent: tagItem.system.permanent || false,
    temporary: tagItem.system.temporary || false,
    crispy: tagItem.system.crispy || false,  // LITM
    isInverted: tagItem.system.isInverted || false,
    inversionIcon: getIcon(tagItem.system.isInverted, "weakness"),
  };
}
```

#### d. `getMysteryFromTheme(actor, themeId)`

Récupère les informations de Mystery/Quest/Ritual d'un thème :

```javascript
export function getMysteryFromTheme(actor, themeId) {
  const theme = actor.items.find(item =>
    item.type === 'theme' && item.id === themeId
  );

  const system = game.settings.get("city-of-mist", "system");

  // Déterminer le préfixe selon le système et la catégorie
  let prefixKey;
  switch (category) {
    case "Mythos":
      prefixKey = (system === "city-of-mist")
        ? "CityOfMist.terms.mystery"
        : "Otherscape.terms.ritual";
      break;
    case "Origin":
    case "Adventure":
    case "Greatness":
      prefixKey = "Legend.terms.quest";
      break;
    // ...
  }

  return {
    themeName: theme.name,
    themebook_name: displayName,
    category,
    prefix: game.i18n.localize(prefixKey),
    mysteryText: theme.system.mystery || "No mystery defined.",
    attention: theme.system.attention ?? [],
    crack: theme.system.crack ?? [],
    attentionLabel: game.i18n.localize(attentionKey),
    crackLabel: game.i18n.localize(crackKey),
  };
}
```

#### e. `getActorStatuses(actor)`

Extrait les statuts actifs :

```javascript
export function getActorStatuses(actor) {
  return actor.items.contents
    .filter(item => item.type === 'status')
    .map(status => ({
      actorId: actor.id,
      id: status.id,
      name: status.name,
      tier: status.system.tier,  // 1-6
      temporary: !!status.system.temporary,
      permanent: !!status.system.permanent,
    }));
}
```

#### f. `getImprovements(actor)`

Groupe les améliorations par themebook :

```javascript
export function getImprovements(actor) {
  const themes = actor.items.filter(item => item.type === "theme")
    .reduce((acc, theme) => {
      acc[theme._id] = {
        id: theme._id,
        name: theme.name,
        themebookName: theme.themebook.name,
        themeType: theme.themebook.system.subtype,
      };
      return acc;
    }, {});

  const improvementsGrouped = actor.items
    .filter(item => item.type === "improvement")
    .reduce((acc, item) => {
      const theme = themes[item.system.theme_id];
      const themebookName = theme.themebookName;

      if (!acc[themebookName]) {
        acc[themebookName] = {
          themebookName,
          themeType: theme.themeType,
          improvements: [],
        };
      }

      acc[themebookName].improvements.push({
        id: item.id,
        name: item.name,
        description: item.system.description,
        uses: item.system.uses || { max: 0, current: 0 },
      });

      return acc;
    }, {});

  return Object.values(improvementsGrouped);
}
```

#### g. `getJuiceAndClues(actor)` (City of Mist)

Récupère les Clues, Juice, Help & Hurt :

```javascript
export function getJuiceAndClues(actor) {
  const items = actor.items.contents;
  const activeBonuses = actor.getFlag('mist-hud', 'active-bonuses') || {};

  // Help items
  const helpItems = items
    .filter(item =>
      item.type === "juice" && item.system?.subtype === "help"
    )
    .map(item => ({
      id: item.id,
      actorId: actor.id,
      amount: item.system.amount,
      target: resolveCharacter(item.system.targetCharacterId),
      active: activeBonuses.help?.[target.id] || false,
    }));

  // Clue items
  const clueItems = items
    .filter(item => item.type === "clue")
    .map(item => ({
      id: item.id,
      name: item.name,
      amount: item.system.amount,
      partial: item.system.partial,
      source: item.system.source,
      method: item.system.method,
    }));

  return { helpItems, hurtItems, clueItems, juiceItems };
}
```

#### h. `getEssence(themes)` (Otherscape)

Calcule l'Essence d'un personnage Otherscape :

```javascript
export function getEssence(themes) {
  const categoryCounts = { Self: 0, Noise: 0, Mythos: 0 };

  for (const theme of themes) {
    const category = theme.themebook.system.subtype;
    if (categoryCounts.hasOwnProperty(category)) {
      categoryCounts[category]++;
    }
  }

  const { Self, Noise, Mythos } = categoryCounts;

  // Déterminer l'essence selon les règles Otherscape
  if (Self > 0 && Noise > 0 && Mythos > 0) {
    return { essence: "Nexus", className: "nexus", imageName: "..." };
  } else if (Self > 0 && Mythos > 0 && Noise === 0) {
    return { essence: "Spiritualist", className: "spiritualist", ... };
  }
  // ... autres essences
}
```

---

## Présentation Visuelle des HUDs

### 1. HUD des Personnages Joueurs (mh-hud.hbs)

**Fichier** : `templates/mh-hud.hbs` (20 KB, 500+ lignes)

#### Structure du HUD

```
┌─────────────────────────────────────────────────┐
│  [MOVE BUTTONS BAR]                             │ ← Boutons de Moves
│  Change  Face    Hit  Go    Take                │
│  Clothes Danger  Hard Head  the Risk            │
├─────────────────────────────────────────────────┤
│                                                 │
│  THEMES (Origin, Adventure, Greatness, etc.)    │
│  ┌───────────────────────────────────────────┐ │
│  │ [Icon] ORIGIN - The Mournful Knight       │ │
│  │   • Sword of Sorrow (Power)         [🔥] │ │
│  │   • Ancient Armor (Power)           [🔥] │ │
│  │   • Bound by Duty (Weakness)        [⇅] │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  LOADOUT (Otherscape/LITM)                      │
│  ┌───────────────────────────────────────────┐ │
│  │ [🎒] Backpack                             │ │
│  │   • Healing Potion                  [🔥] │ │
│  │   • Rope & Grappling Hook           [🔥] │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  STORY TAGS & RELATIONSHIPS                     │
│  ┌───────────────────────────────────────────┐ │
│  │ [📝] Tags / Relationships                 │ │
│  │   • Wanted by the Guard          [🔥][⇅] │ │
│  │   • Friend of the Innkeeper      [🔥][⇅] │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  STATUSES                                       │
│  ┌───────────────────────────────────────────┐ │
│  │ [💊] Statuses                            │ │
│  │   Injured-3  Blessed-2  Frightened-1      │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  CREW THEMES (Fellowship)                       │
│  ┌───────────────────────────────────────────┐ │
│  │ [👥] The Band of Heroes                   │ │
│  │   • United We Stand (Power)         [🔥] │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
├─────────────────────────────────────────────────┤
│  [Footer]                                       │
│  [-] [0] [+]  (Modificateurs manuels)          │
│  [Help Bonuses] (City of Mist)                  │
└─────────────────────────────────────────────────┘

RIGHT PANEL (sliding, accordéon)
┌─────────────────────────────────────┐
│ [⚡] IMPROVEMENTS                    │
│ Origin - Ancient Warrior            │
│   ⭐ Master Swordsman (2/3 uses)    │
│   ⭐ Unbreakable Will               │
│                                     │
│ [👥] HELP & HURT (City of Mist)     │
│   [✓] Mara (+2)                     │
│   [ ] Villain (-1)                  │
│                                     │
│ [🔍] CLUES (City of Mist)           │
│   The Ancient Scroll (3)            │
│   🧩 Partial: Symbol on the wall    │
│                                     │
│ [🔋] JUICE (City of Mist)           │
│   Power Battery (2)                 │
│                                     │
│ [🎭] ESSENCE (Otherscape)           │
│   Essence: Spiritualist             │
│   [Chart with essence diagram]      │
└─────────────────────────────────────┘
```

#### Sections du Template

**A. Header avec Move Buttons**

```handlebars
<div class="mh-roll-bar">
  {{#each moveButtons}}
    <button class="mh-roll-button" data-move="{{this.name}}"
            title="{{this.name}}">
      {{this.short}}
    </button>
  {{/each}}
</div>
```

**B. Themes (Origin, Adventure, Greatness, Mythos, etc.)**

```handlebars
{{#each themes}}
<div class="theme-container-{{category}}">
  <div class="mh-theme-header {{category}}">
    <span class="{{iconClass}}" data-theme-id="{{id}}"></span>
    <span class="mh-theme-name">{{localizedThemebookName}}</span>
    {{#if unspent_upgrades}}
      <span class="mh-improvement-marker">
        {{#times unspent_upgrades}}<i class="fa-star"></i>{{/times}}
      </span>
    {{/if}}
  </div>

  <!-- Power Tags -->
  <ul class="mh-tags">
    {{#each powerTags}}
      <li class="mh-power-tag {{cssClass}} {{#if selected}}selected{{/if}}"
          data-id="{{id}}"
          data-theme-id="{{themeId}}">
        <div class="mh-burn-toggle burn-icon {{burnState}}"></div>
        <div class="mh-tag-text">{{tagName}}</div>
        {{#if subtags}}
          <ul class="mh-subtag">
            {{#each subtags}}
              <li class="subtag-item">{{tagName}}</li>
            {{/each}}
          </ul>
        {{/if}}
      </li>
    {{/each}}
  </ul>

  <!-- Weakness Tags -->
  <ul class="mh-tags">
    {{#each weaknessTags}}
      <li class="mh-weakness-tag {{#if inverted}}inverted{{/if}}">
        <span class="mh-weakness-toggle" data-id="{{id}}">
          {{#if inverted}}
            <i class="fa-angles-up"></i>
          {{else}}
            <i class="fa-angles-down"></i>
          {{/if}}
        </span>
        <span class="mh-tag-text">{{tagName}}</span>
      </li>
    {{/each}}
  </ul>
</div>
{{/each}}
```

**C. Loadout Section (Otherscape/LITM)**

```handlebars
{{#if (or isOtherscape isLegend)}}
  <div class="theme-container">
    <div class="mh-theme-header loadout">
      <span class="mh-theme-name">
        {{#if isOtherscape}}{{localize "Otherscape.terms.loadoutTheme.name"}}{{/if}}
        {{#if isLegend}}{{localize "Legend.terms.loadoutTheme.name"}}{{/if}}
      </span>
    </div>
    <ul class="mh-tags">
      {{#each loadoutTags}}
        <li class="mh-loadout-tag" data-id="{{id}}">
          <span class="mh-burn-toggle burn-icon {{burnState}}"></span>
          <span class="mh-tag-text">{{tagName}}</span>
        </li>
      {{/each}}
    </ul>
  </div>
{{/if}}
```

**D. Story Tags**

```handlebars
<div class="mh-story-tags-container">
  <div class="mh-theme-header">
    <span class="mh-theme-icon storytag"></span>
    <span class="mh-theme-name">{{localize "CityOfMist.terms.tags"}}</span>
    <a class="mh-create-story-tag" title="Create Tag">
      <i class="fa-circle-plus"></i>
    </a>
  </div>
  <ul class="mh-tags">
    {{#each storyTags}}
      <li class="mh-story-tag {{#if temporary}}temporary{{/if}}"
          data-id="{{id}}">
        <span class="mh-burn-toggle burn-icon {{burnState}}"></span>
        <span class="mh-tag-text">
          {{tagName}}
          {{#if temporary}}<i class="fa-hourglass-half"></i>{{/if}}
          {{#if permanent}}<i class="fa-gem"></i>{{/if}}
        </span>
        <span class="mh-story-toggle {{#if isInverted}}inverted{{/if}}">
          {{{inversionIcon}}}
        </span>
      </li>
    {{/each}}
  </ul>
</div>
```

**E. Statuses**

```handlebars
<div class="mh-statuses-container">
  <div class="mh-theme-header">
    <span class="mh-theme-icon statuses"></span>
    <span class="mh-theme-name">{{localize "CityOfMist.terms.statuses"}}</span>
  </div>
  <div class="mh-statuses-list">
    {{#each statuses}}
      <div class="mh-status {{statusType}} {{#if selected}}selected{{/if}}"
           data-status-id="{{id}}"
           data-tier="{{tier}}">
        {{name}}-{{tier}}
      </div>
    {{/each}}
  </div>
</div>
```

**F. Right Panel (Sliding Accordion)**

```handlebars
<div class="mh-sliding-panel">
  <div class="mh-panel-ear">❯</div>
  <div class="mh-panel-content">

    <!-- Improvements -->
    {{#if hasImprovements}}
      <div class="section improvements">
        <div class="mh-theme-name title-effect">
          <i class="fa-star"></i> {{localize "CityOfMist.terms.improvements"}}
        </div>
        {{#each improvements}}
          <div class="improvement-container">
            <span class="item-name">{{name}} {{uses.current}}/{{uses.max}}</span>
            <div class="item-description">{{description}}</div>
          </div>
        {{/each}}
      </div>
    {{/if}}

    <!-- City of Mist: Help & Hurt, Clues, Juice -->
    {{#if isCityOfMist}}
      <div class="section relationships">
        <div class="mh-theme-name">Help & Hurt</div>
        {{#each helpItems}}
          <div class="relationship-item">
            <img src="{{target.tokenImage}}" />
            <span>{{target.name}} (+{{amount}})</span>
            <input type="checkbox" class="help-toggle"
                   data-id="{{id}}" {{#if active}}checked{{/if}}>
          </div>
        {{/each}}
      </div>

      <div class="section clues">
        <div class="mh-theme-name">Clues</div>
        {{#each clueItems}}
          <div class="clue-container">
            <div class="item-name">{{name}} ({{amount}})</div>
            {{#if partial}}
              <div class="partial-icon">🧩 Partial Clue</div>
            {{/if}}
            <div class="item-details">
              <span>Source: {{source}}</span><br />
              <span>Method: {{method}}</span>
            </div>
          </div>
        {{/each}}
      </div>
    {{/if}}

    <!-- Otherscape: Essence -->
    {{#if isOtherscape}}
      <div class="section otherscape">
        <div class="mh-essence-title {{essenceClass}}">
          Essence: {{essence}}
        </div>
        <div class="mh-essence-chart">
          <img src="modules/mist-hud/ui/essences/{{essenceImage}}" />
        </div>
      </div>
    {{/if}}

  </div>
</div>
```

#### États Interactifs des Tags

**Burn States** (Power Tags, Story Tags, Loadout):
- **Unburned** (default) : Tag disponible, icône grise
- **To Burn** : Tag marqué pour être brûlé au prochain jet, icône orange
- **Burned** : Tag brûlé, indisponible, icône rouge

**Inversion** (Weakness Tags, Story Tags):
- **Default** : Flèche vers le bas (⇅), utilisé comme faiblesse (-)
- **Inverted** : Flèche vers le haut (⇅), utilisé comme pouvoir (+)

**Selection** (tous les tags):
- **Not selected** : Pas utilisé dans le prochain jet
- **Selected** : Classe CSS `.selected`, utilisé dans le prochain jet

**Status Polarity** :
- **Positive** (+) : Classe `.positive`, ajoute tier au jet
- **Negative** (-) : Classe `.negative`, soustrait tier du jet
- **Neutral** (0) : Pas d'effet sur le jet

---

### 2. HUD des Dangers/Threats (npc-hud.hbs)

**Fichier** : `templates/npc-hud.hbs` (10 KB, 250+ lignes)

#### Structure du HUD NPC

```
┌────────────────────────────────────────────────────┐
│  DESCRIPTION & BIOGRAPHY (accordéon)               │
│  [Texte de description du Danger]                  │
├────────────────────────────────────────────────────┤
│  SPECTRUMS (City of Mist) / LIMITS (OS/LITM)      │
│  Martial: 4  | Divination: 3  | Encantment: 2     │
│                                                    │
│  🔋 Limits (Otherscape/LITM)                       │
│    Intrusion - Battery runs low after 3 uses      │
├────────────────────────────────────────────────────┤
│  [+🏷️] TAGS & STATUSES [💊+]                      │
│  • Armored-3 (positive)                            │
│  • Enraged (neutral)                               │
│  • Weakened-2 (negative)                           │
│  🕐 Temporary  💎 Permanent                         │
├────────────────────────────────────────────────────┤
│  COLLECTIVE SIZE / SCALE                           │
│  [👤][👤][👤][◻][◻]  (3/5)                        │
│                                                    │
│  💀 Total Influence: -5                            │
├────────────────────────────────────────────────────┤
│  MOVES                                             │
│                                                    │
│  Specials (Otherscape/LITM)                        │
│    • Hard Move Name - Description                  │
│                                                    │
│  › Threats / » Consequences                        │
│    › Threat 1 - Description of threat              │
│      » Consequence 1 - If threat succeeds          │
│      » Consequence 2 - Alternative consequence     │
│    › Threat 2 - Another threat                     │
│                                                    │
│  🗡️ Might (LITM only)                              │
│    --G-- Mighty Strike (Greatness icon)            │
│    --A-- Swift Movement (Adventure icon)           │
│    --O-- Old Wisdom (Origin icon)                  │
└────────────────────────────────────────────────────┘
```

#### Sections du Template NPC

**A. Description & Biography (accordéon)**

```handlebars
{{#if hasDescriptionBiography}}
  <div class="npc-description-biography accordion-container">
    <div class="npc-subtitle-container accordion-header active">
      <span>{{localize "CityOfMist.terms.description"}} &
            {{localize "CityOfMist.terms.biography"}}</span>
    </div>
    <div class="accordion-content active">
      {{{descriptionBiography}}}
    </div>
  </div>
{{/if}}
```

**B. Spectrums (City of Mist) / Limits (Otherscape/LITM)**

```handlebars
<!-- Spectrums (CoM) -->
<div class="npc-subtitle-container">
  <div class="npc-subtitle-text">{{spectrumLabel}}</div>
</div>
<ul class="npc-spectrum-list">
  {{#each spectrums}}
    <li class="npc-spectrum">
      {{name}}: <span class="npc-spectrum-tier">{{parseMaxTier system.maxTier}}</span>
    </li>
  {{/each}}
</ul>

<!-- Limits (OS/LITM) -->
{{#if (or (eq activeSystem "otherscape") (eq activeSystem "legend"))}}
  <ul class="npc-list limit">
    {{#each moveGroups.Limits}}
      <li>
        <span class="npc-move-name limit">{{name}}</span> -
        <span class="npc-move-description">{{parseStatus system.description}}</span>
      </li>
    {{/each}}
  </ul>
{{/if}}
```

**C. Tags & Statuses**

```handlebars
<div class="npc-subtitle-container">
  <div class="create-npc-tag" title="Create Story Tag">
    <i class="fa-plus"></i> <i class="fa-tags"></i>
  </div>
  <div class="npc-subtitle-text">Tags & Statuses</div>
  <div class="create-npc-status" title="Create Status">
    <i class="fa-suitcase-medical"></i> <i class="fa-plus"></i>
  </div>
</div>

<div class="npc-tags-statuses-container">
  <!-- Story Tags -->
  <ul class="npc-storytags-list">
    {{#each storyTags}}
      <div class="npc-story-tag {{cssClass}}" data-id="{{id}}">
        <span>{{tagName}}</span>
        <span class="npc-tag-icon">
          {{#if temporary}}<i class="fa-hourglass-half"></i>{{/if}}
          {{#if permanent}}<i class="fa-gem"></i>{{/if}}
        </span>
      </div>
    {{/each}}
  </ul>

  <!-- Statuses -->
  <ul class="npc-statuses-list">
    {{#each statuses}}
      <div>
        <span class="npc-status {{statusType}}"
              data-status-id="{{id}}"
              data-tier="{{statusTier}}">
          {{statusName}}-{{statusTier}}
          {{#if temporary}}<i class="fa-hourglass-half"></i>{{/if}}
          {{#if permanent}}<i class="fa-gem"></i>{{/if}}
        </span>
      </div>
    {{/each}}
  </ul>
</div>
```

**D. Collective Size / Scale**

```handlebars
{{#if (neq activeSystem "legend")}}
  <div class="npc-collective-container">
    <span class="npc-collective-label">{{collectiveLabel}}</span>
    <div class="npc-collective-bar">
      {{#each collectiveBar}}
        <span class="npc-collective-segment" data-value="{{value}}">
          {{#if active}}
            <i class="fa-square-user"></i>
          {{else}}
            <i class="fa-square"></i>
          {{/if}}
        </span>
      {{/each}}
    </div>
  </div>

  <div class="mh-npc-influence">
    {{#if (neq totalInfluence 0)}}
      <i class="fa-skull"></i>
    {{else}}
      <i class="fa-regular fa-skull"></i>
    {{/if}}: {{totalInfluence}}
  </div>
{{/if}}
```

**E. Moves (City of Mist)**

```handlebars
{{#if (eq activeSystem "city-of-mist")}}
  {{#each moveGroups as |moves subtype|}}
    <div class="npc-move-type">
      <div class="npc-subtitle-text">{{subtype}}</div>
      <ul class="npc-list">
        {{#each moves}}
          <li>
            {{#unless system.hideName}}
              <span class="npc-move-name">{{name}}</span> -
            {{/unless}}
            <span class="npc-move-description">
              {{parseStatus system.description}}
            </span>
          </li>
        {{/each}}
      </ul>
    </div>
  {{/each}}
{{/if}}
```

**F. Threats & Consequences (Otherscape/LITM)**

```handlebars
{{#if (eq activeSystem "otherscape")}}
  <!-- Specials -->
  {{#if moveGroups.Specials.length}}
    <div class="npc-subtitle-text">Specials</div>
    <ul class="npc-list">
      {{#each moveGroups.Specials}}
        <li>
          <span class="npc-move-name">{{name}}</span> -
          <span class="npc-move-description">{{parseStatus system.description}}</span>
        </li>
      {{/each}}
    </ul>
  {{/if}}

  <!-- Threats & Consequences -->
  <div class="npc-subtitle-text">›Threats / »Consequences</div>
  {{#each moveGroups.Threats}}
    <div class="npc-threat">
      <span class="npc-tc-marker">›</span>
      <span class="npc-threat-description">{{parseStatus system.description}}</span>
      <ul>
        {{#each consequences}}
          <li>
            <span class="npc-tc-marker">»</span>
            <span class="npc-move-description">{{parseStatus system.description}}</span>
          </li>
        {{/each}}
      </ul>
    </div>
  {{/each}}
{{/if}}
```

**G. Might avec icônes (LITM)**

```handlebars
{{#if (and moveGroups.Custom.length (eq activeSystem "legend"))}}
  <ul class="custom-move-list">
    {{#each moveGroups.Custom}}
      <li>
        {{{legendCustom.processedDescription}}}
      </li>
    {{/each}}
  </ul>
{{/if}}
```

**Syntaxe des icônes LITM** (dans la description du move) :
- `--G--` Mighty Strike → ![greatness-icon] Mighty Strike
- `--A--` Swift Movement → ![adventure-icon] Swift Movement
- `--O--` Old Wisdom → ![origin-icon] Old Wisdom

---

## Fonctionnalités Clés

### 1. Drag & Drop

**A. Drag Tags/Statuses sur Tokens**

Le HUD permet de drag & drop des Story Tags et Statuses directement sur les tokens de la scène pour les assigner à d'autres acteurs.

**Implémentation** (simplifié) :

```javascript
// Rendre un tag draggable
html.find('.mh-story-tag').on('dragstart', (event) => {
  const tagId = $(event.currentTarget).data('id');
  const tag = actor.items.get(tagId);

  event.originalEvent.dataTransfer.setData('text/plain', JSON.stringify({
    type: 'Item',
    data: tag.toObject()
  }));
});

// Recevoir le drop sur un token
Hooks.on('dropActorSheetData', async (actor, sheet, data) => {
  if (data.type === 'Item') {
    await actor.createEmbeddedDocuments('Item', [data.data]);
  }
});
```

**B. Drag Moves vers Hotbar**

Les moves peuvent être drag & drop vers la hotbar pour créer des macros de jets rapides.

### 2. Quick Roll

**A. Sélection de Tags/Statuses**

L'utilisateur clique sur les tags et statuses pour les sélectionner (classe `.selected`). L'état de sélection est stocké en mémoire JavaScript.

**B. Click sur Move Button**

Au clic sur un move button, le HUD :
1. Récupère tous les tags/statuses sélectionnés
2. Calcule les modificateurs (Power: +1, Weakness: -1, Status: ±tier)
3. Effectue le jet 2d6 + mods
4. Affiche le résultat dans le chat Foundry
5. Applique les effets (burn tags, etc.)

### 3. Burning Tags

**États de Burn** :
1. **Unburned** : Tag normal, disponible
2. **To Burn** : Clic sur icône 🔥, tag marqué pour être brûlé
3. **Burned** : Après le jet, tag brûlé et indisponible

**Workflow** :
```
[Unburned] --click--> [To Burn] --roll--> [Burned]
                        |                    |
                        click                click
                        ↓                    ↓
                    [Unburned]           [Unburned]
```

### 4. Help & Hurt (City of Mist)

**Mécanisme** :
- Items de type "juice" avec `subtype: "help"` ou `"hurt"`
- Stocké sur l'acteur donneur avec `targetCharacterId`
- Activation via checkbox dans le panel
- État stocké dans `actor.flags["mist-hud"]["active-bonuses"]`
- Bonus/malus appliqué automatiquement aux jets du target

### 5. NPC Influence Viewer

**Écran séparé** qui affiche :
- Liste de tous les Dangers/Threats de la scène
- Total d'influence (somme des statuses négatifs + collective size)
- Filtre : "Active" (influençant) vs "All" (tous)
- Click sur image → pan & select token

**Calcul d'influence** :
```
Total Influence = Collective Size + Σ(Negative Statuses tiers)
```

### 6. Système de Milestones (LITM)

Pour LITM, le HUD affiche et gère les **Milestones** au lieu d'Attention/Crack :

```javascript
// Dans getMysteryFromTheme pour LITM
if (system === "legend") {
  attentionKey = "Legend.terms.improve";
  crackKey = "Legend.terms.abandon";
  prefixKey = "Legend.terms.quest";
}
```

Les milestones sont affichés sous forme de pips/circles et peuvent être togglés par le joueur.

---

## Interactions avec l'API Foundry VTT

### 1. Lecture des Données Actor

```javascript
// Récupérer l'actor du token sélectionné
const token = canvas.tokens.controlled[0];
const actor = token?.actor;

// Accéder aux items
const themes = actor.items.filter(i => i.type === "theme");
const tags = actor.items.filter(i => i.type === "tag");
const statuses = actor.items.filter(i => i.type === "status");

// Accéder aux propriétés système
const mystery = themes[0].system.mystery;
const attention = themes[0].system.attention;
const burned = tags[0].system.burned;
```

### 2. Modification des Données

```javascript
// Brûler un tag
await tag.update({ "system.burned": true });

// Ajouter de l'attention à un thème
const currentAttention = theme.system.attention || [];
await theme.update({
  "system.attention": [...currentAttention, true]
});

// Créer un nouveau status
await actor.createEmbeddedDocuments('Item', [{
  name: "Injured",
  type: "status",
  system: {
    tier: 3,
    temporary: true,
    permanent: false
  }
}]);

// Supprimer un tag
await tag.delete();
```

### 3. Flags pour État Éphémère

```javascript
// Stocker les bonus Help/Hurt actifs
await actor.setFlag('mist-hud', 'active-bonuses', {
  help: { [targetActorId]: true },
  hurt: {}
});

// Récupérer les flags
const activeBonuses = actor.getFlag('mist-hud', 'active-bonuses') || {};
```

### 4. Hooks Foundry

```javascript
// Quand un token est sélectionné
Hooks.on('controlToken', (token, controlled) => {
  if (controlled && token.actor?.type === 'character') {
    showMistHUD(token.actor);
  }
});

// Quand un actor est mis à jour
Hooks.on('updateActor', (actor, changes, options, userId) => {
  if (isMistHUDOpen(actor.id)) {
    refreshMistHUD(actor);
  }
});

// Quand un item est créé/modifié/supprimé
Hooks.on('createItem', (item, options, userId) => {
  refreshMistHUD(item.parent);
});
```

---

## Recommandations pour Brumisater

### 1. Structure de Données Adaptée

**Prisma Schema** (inspiré du modèle Foundry) :

```prisma
model Character {
  id          String   @id @default(cuid())
  name        String
  playspaceId String

  // Relations
  themes      Theme[]
  tags        Tag[]
  statuses    Status[]
  improvements Improvement[]

  // Trackers (LITM specific)
  heroCard    HeroCard?
  trackers    Tracker[]

  // JSON fields for flexibility
  flags       Json     @default("{}")  // Pour états éphémères
}

model Theme {
  id            String   @id @default(cuid())
  characterId   String
  character     Character @relation(fields: [characterId], references: [id])

  name          String
  themeType     String   // "Origin", "Adventure", "Mythos", etc.
  themebookId   String?  // FK vers Themebook

  mystery       String   // Quest/Mystery/Ritual
  attention     Int[]    // [1,1,1] pour LITM milestones
  crack         Int[]    // Abandon/Fade/Decay

  unspentUpgrades Int    @default(0)

  tags          Tag[]
  improvements  Improvement[]
}

model Tag {
  id          String   @id @default(cuid())
  characterId String
  character   Character @relation(fields: [characterId], references: [id])

  themeId     String?
  theme       Theme?   @relation(fields: [themeId], references: [id])

  name        String
  subtype     TagSubtype  // POWER | WEAKNESS | STORY | LOADOUT

  // État de burn
  burned      Boolean  @default(false)
  burnState   Int      @default(0)  // 0=unburned, 1=toBurn

  // État d'inversion (pour weakness/story)
  inverted    Boolean  @default(false)

  // Flags temporaires/permanents
  temporary   Boolean  @default(false)
  permanent   Boolean  @default(false)

  // LITM specific
  crispy      Boolean  @default(false)

  // Subtags (pour tags composés)
  parentId    String?
  parent      Tag?     @relation("SubTags", fields: [parentId], references: [id])
  subtags     Tag[]    @relation("SubTags")
}

model Status {
  id          String   @id @default(cuid())
  characterId String
  character   Character @relation(fields: [characterId], references: [id])

  name        String
  tier        Int      @default(1)  // 1-6

  temporary   Boolean  @default(false)
  permanent   Boolean  @default(false)
}

model Improvement {
  id          String   @id @default(cuid())
  characterId String
  character   Character @relation(fields: [characterId], references: [id])

  themeId     String
  theme       Theme    @relation(fields: [themeId], references: [id])

  name        String
  description String
  effectClass String?  // Pour effets spéciaux

  usesMax     Int      @default(0)
  usesCurrent Int      @default(0)
}

enum TagSubtype {
  POWER
  WEAKNESS
  STORY
  LOADOUT
}
```

### 2. API Routes pour Sélection de Tags

**Fichier** : `server/api/characters/[id]/select-tags.post.ts`

```typescript
// server/api/characters/[id]/select-tags.post.ts

import { z } from 'zod';
import { prisma } from '~/server/utils/prisma';

const SelectTagsSchema = z.object({
  selectedTags: z.array(z.string()),      // Array de tag IDs
  selectedStatuses: z.array(z.object({
    id: z.string(),
    polarity: z.enum(['positive', 'negative', 'neutral']),
  })),
  manualModifier: z.number().default(0),
});

export default defineEventHandler(async (event) => {
  const characterId = getRouterParam(event, 'id');
  const body = await readBody(event);

  const { selectedTags, selectedStatuses, manualModifier } =
    SelectTagsSchema.parse(body);

  // Stocker la sélection en session ou cache Redis
  // (pour usage lors du prochain roll)
  await setRollSelection(characterId, {
    selectedTags,
    selectedStatuses,
    manualModifier,
    timestamp: Date.now(),
  });

  return { success: true };
});
```

### 3. Composable `useTagSelection()`

**Fichier** : `app/composables/useTagSelection.ts`

```typescript
// app/composables/useTagSelection.ts

import { ref, computed } from 'vue';

export interface SelectedTag {
  id: string;
  name: string;
  subtype: 'POWER' | 'WEAKNESS' | 'STORY' | 'LOADOUT';
  inverted: boolean;
  burnState: 'unburned' | 'toBurn' | 'burned';
}

export interface SelectedStatus {
  id: string;
  name: string;
  tier: number;
  polarity: 'positive' | 'negative' | 'neutral';
}

export function useTagSelection(characterId: string) {
  const selectedTags = ref<Map<string, SelectedTag>>(new Map());
  const selectedStatuses = ref<Map<string, SelectedStatus>>(new Map());
  const manualModifier = ref<number>(0);

  /**
   * Toggle tag selection
   */
  function toggleTag(tag: SelectedTag) {
    if (tag.burnState === 'burned') {
      // Ne peut pas sélectionner un tag brûlé
      return;
    }

    if (selectedTags.value.has(tag.id)) {
      selectedTags.value.delete(tag.id);
    } else {
      selectedTags.value.set(tag.id, tag);
    }
  }

  /**
   * Toggle burn state
   */
  function toggleBurnState(tagId: string) {
    const tag = selectedTags.value.get(tagId);
    if (!tag) return;

    if (tag.burnState === 'unburned') {
      tag.burnState = 'toBurn';
    } else if (tag.burnState === 'toBurn') {
      tag.burnState = 'unburned';
    }
    // 'burned' ne peut pas être toggle
  }

  /**
   * Toggle inversion (weakness/story tags)
   */
  function toggleInversion(tagId: string) {
    const tag = selectedTags.value.get(tagId);
    if (!tag || (tag.subtype !== 'WEAKNESS' && tag.subtype !== 'STORY')) {
      return;
    }
    tag.inverted = !tag.inverted;
  }

  /**
   * Toggle status selection and cycle polarity
   */
  function toggleStatus(status: SelectedStatus) {
    if (selectedStatuses.value.has(status.id)) {
      const current = selectedStatuses.value.get(status.id)!;

      // Cycle: neutral → positive → negative → neutral
      if (current.polarity === 'neutral') {
        current.polarity = 'positive';
      } else if (current.polarity === 'positive') {
        current.polarity = 'negative';
      } else {
        selectedStatuses.value.delete(status.id);
      }
    } else {
      selectedStatuses.value.set(status.id, { ...status, polarity: 'neutral' });
    }
  }

  /**
   * Calculate total modifier
   */
  const totalModifier = computed(() => {
    let total = manualModifier.value;

    // Tags: +1 per power/inverted weakness, -1 per weakness
    for (const tag of selectedTags.value.values()) {
      if (tag.subtype === 'POWER' || tag.subtype === 'STORY' || tag.subtype === 'LOADOUT') {
        total += 1;
      } else if (tag.subtype === 'WEAKNESS') {
        total += tag.inverted ? 1 : -1;
      }
    }

    // Statuses: ±tier selon polarité
    for (const status of selectedStatuses.value.values()) {
      if (status.polarity === 'positive') {
        total += status.tier;
      } else if (status.polarity === 'negative') {
        total -= status.tier;
      }
    }

    return total;
  });

  /**
   * Clear all selections
   */
  function clearSelection() {
    selectedTags.value.clear();
    selectedStatuses.value.clear();
    manualModifier.value = 0;
  }

  /**
   * Persist selection to server (pour roll ultérieur)
   */
  async function persistSelection() {
    await $fetch(`/api/characters/${characterId}/select-tags`, {
      method: 'POST',
      body: {
        selectedTags: Array.from(selectedTags.value.keys()),
        selectedStatuses: Array.from(selectedStatuses.value.values()),
        manualModifier: manualModifier.value,
      },
    });
  }

  return {
    selectedTags,
    selectedStatuses,
    manualModifier,
    totalModifier,
    toggleTag,
    toggleBurnState,
    toggleInversion,
    toggleStatus,
    clearSelection,
    persistSelection,
  };
}
```

### 4. Composant `ThemeCardInteractive.vue`

**Fichier** : `app/components/ThemeCardInteractive.vue`

```vue
<!-- app/components/ThemeCardInteractive.vue -->
<script setup lang="ts">
import type { Theme, Tag } from '@prisma/client';

const props = defineProps<{
  theme: Theme & { tags: Tag[] };
  characterId: string;
}>();

const { toggleTag, toggleBurnState, toggleInversion, selectedTags } =
  useTagSelection(props.characterId);

const powerTags = computed(() =>
  props.theme.tags.filter(t => t.subtype === 'POWER')
);

const weaknessTags = computed(() =>
  props.theme.tags.filter(t => t.subtype === 'WEAKNESS')
);

function isSelected(tagId: string): boolean {
  return selectedTags.value.has(tagId);
}

function getBurnStateClass(tag: Tag): string {
  if (tag.burned) return 'burned';
  if (tag.burnState === 1) return 'toBurn';
  return 'unburned';
}
</script>

<template>
  <div class="theme-card">
    <div class="theme-header" :class="theme.themeType">
      <span class="theme-icon">{{ getThemeIcon(theme.themeType) }}</span>
      <h3>{{ theme.name }}</h3>
      <span v-if="theme.unspentUpgrades > 0" class="upgrades">
        <i v-for="n in theme.unspentUpgrades" :key="n" class="i-fa-star" />
      </span>
    </div>

    <!-- Power Tags -->
    <div class="tags-section power">
      <div
        v-for="tag in powerTags"
        :key="tag.id"
        class="tag power"
        :class="{
          selected: isSelected(tag.id),
          [getBurnStateClass(tag)]: true,
        }"
        @click="toggleTag({ ...tag, burnState: getBurnStateClass(tag) })"
      >
        <button
          class="burn-toggle"
          :class="getBurnStateClass(tag)"
          @click.stop="toggleBurnState(tag.id)"
        >
          <i class="i-fa-fire" />
        </button>
        <span class="tag-name">{{ tag.name }}</span>
      </div>
    </div>

    <!-- Weakness Tags -->
    <div class="tags-section weakness">
      <div
        v-for="tag in weaknessTags"
        :key="tag.id"
        class="tag weakness"
        :class="{
          selected: isSelected(tag.id),
          inverted: tag.inverted,
        }"
        @click="toggleTag({ ...tag, burnState: 'unburned' })"
      >
        <button
          class="inversion-toggle"
          @click.stop="toggleInversion(tag.id)"
        >
          <i v-if="tag.inverted" class="i-fa-angles-up" />
          <i v-else class="i-fa-angles-down" />
        </button>
        <span class="tag-name">{{ tag.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.theme-card {
  border: 2px solid var(--theme-color);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.theme-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 0.25rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.tag.selected {
  background: var(--color-selected);
  box-shadow: 0 0 8px var(--color-selected);
}

.tag.power {
  border-left: 3px solid var(--color-power);
}

.tag.weakness {
  border-left: 3px solid var(--color-weakness);
}

.tag.burned {
  opacity: 0.5;
  pointer-events: none;
  text-decoration: line-through;
}

.tag.toBurn .burn-toggle {
  color: orange;
}

.tag.burned .burn-toggle {
  color: red;
}

.burn-toggle,
.inversion-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
}

.inversion-toggle:hover {
  color: var(--color-accent);
}
</style>
```

### 5. Composant `StatusList.vue`

**Fichier** : `app/components/StatusList.vue`

```vue
<!-- app/components/StatusList.vue -->
<script setup lang="ts">
import type { Status } from '@prisma/client';

const props = defineProps<{
  statuses: Status[];
  characterId: string;
}>();

const { toggleStatus, selectedStatuses } = useTagSelection(props.characterId);

function getPolarity(statusId: string): 'positive' | 'negative' | 'neutral' {
  return selectedStatuses.value.get(statusId)?.polarity || 'neutral';
}

function isSelected(statusId: string): boolean {
  return selectedStatuses.value.has(statusId);
}
</script>

<template>
  <div class="statuses-container">
    <h3><i class="i-fa-suitcase-medical" /> Statuses</h3>
    <div class="statuses-list">
      <div
        v-for="status in statuses"
        :key="status.id"
        class="status"
        :class="{
          selected: isSelected(status.id),
          positive: getPolarity(status.id) === 'positive',
          negative: getPolarity(status.id) === 'negative',
          neutral: getPolarity(status.id) === 'neutral',
        }"
        @click="toggleStatus({ ...status, polarity: 'neutral' })"
      >
        <span v-if="status.temporary" class="icon-temp">
          <i class="i-fa-hourglass-half" />
        </span>
        <span v-if="status.permanent" class="icon-perm">
          <i class="i-fa-gem" />
        </span>
        {{ status.name }}-{{ status.tier }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.statuses-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.status {
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg-secondary);
  border: 2px solid transparent;
}

.status.selected.positive {
  border-color: var(--color-positive);
  background: var(--bg-positive);
}

.status.selected.negative {
  border-color: var(--color-negative);
  background: var(--bg-negative);
}

.status.selected.neutral {
  border-color: var(--color-neutral);
}

.icon-temp,
.icon-perm {
  font-size: 0.8rem;
  margin-right: 0.25rem;
}
</style>
```

### 6. Composant NPC `DangerCard.vue`

**Fichier** : `app/components/DangerCard.vue`

```vue
<!-- app/components/DangerCard.vue -->
<script setup lang="ts">
import type { Character, Tag, Status, Move } from '@prisma/client';

const props = defineProps<{
  danger: Character & {
    tags: Tag[];
    statuses: Status[];
    moves: Move[];
  };
}>();

const emit = defineEmits<{
  createTag: [];
  createStatus: [];
  updateCollective: [value: number];
}>();

const { systemConfig } = useSystemConfig('litm'); // ou autre système

const collectiveSize = ref(props.danger.collectiveSize || 0);

const totalInfluence = computed(() => {
  const negativeTiers = props.danger.statuses
    .filter(s => s.polarity === 'negative')
    .reduce((sum, s) => sum + s.tier, 0);

  return collectiveSize.value + negativeTiers;
});

const movesByCategory = computed(() => {
  return props.danger.moves.reduce((acc, move) => {
    const category = move.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(move);
    return acc;
  }, {} as Record<string, Move[]>);
});

function updateCollectiveSize(value: number) {
  collectiveSize.value = value;
  emit('updateCollective', value);
}
</script>

<template>
  <div class="danger-card">
    <div class="danger-header">
      <h2>{{ danger.name }}</h2>
    </div>

    <!-- Description (accordéon) -->
    <details v-if="danger.description" class="description">
      <summary>Description & Biography</summary>
      <div v-html="danger.description" />
    </details>

    <!-- Spectrums / Limits -->
    <div class="spectrums">
      <h3>{{ systemConfig.terminology.spectrums }}</h3>
      <div v-for="spectrum in danger.spectrums" :key="spectrum.name" class="spectrum">
        {{ spectrum.name }}: {{ spectrum.maxTier }}
      </div>
    </div>

    <!-- Tags & Statuses -->
    <div class="tags-statuses">
      <div class="section-header">
        <button @click="emit('createTag')">
          <i class="i-fa-plus" /> <i class="i-fa-tags" />
        </button>
        <h3>Tags & Statuses</h3>
        <button @click="emit('createStatus')">
          <i class="i-fa-suitcase-medical" /> <i class="i-fa-plus" />
        </button>
      </div>

      <div class="tags-list">
        <div v-for="tag in danger.tags" :key="tag.id" class="npc-tag">
          {{ tag.name }}
          <span v-if="tag.temporary" class="temp"><i class="i-fa-hourglass" /></span>
          <span v-if="tag.permanent" class="perm"><i class="i-fa-gem" /></span>
        </div>
      </div>

      <div class="statuses-list">
        <div v-for="status in danger.statuses" :key="status.id"
             class="npc-status" :class="status.polarity">
          {{ status.name }}-{{ status.tier }}
        </div>
      </div>
    </div>

    <!-- Collective Size / Scale -->
    <div class="collective-container">
      <h3>{{ systemConfig.terminology.collective }}</h3>
      <div class="collective-bar">
        <button
          v-for="n in 6"
          :key="n"
          class="collective-segment"
          :class="{ active: n <= collectiveSize }"
          @click="updateCollectiveSize(n)"
        >
          <i v-if="n <= collectiveSize" class="i-fa-square-user" />
          <i v-else class="i-fa-square" />
        </button>
      </div>
      <div class="influence">
        <i class="i-fa-skull" /> Total Influence: {{ totalInfluence }}
      </div>
    </div>

    <!-- Moves -->
    <div class="moves-section">
      <div v-for="(moves, category) in movesByCategory" :key="category">
        <h4>{{ category }}</h4>
        <ul>
          <li v-for="move in moves" :key="move.id">
            <strong v-if="!move.hideName">{{ move.name }}</strong>
            <span v-html="move.description" />
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles pour Danger Card */
</style>
```

### 7. Tests E2E Playwright

**Fichier** : `tests/e2e/tag-selection.spec.ts`

```typescript
// tests/e2e/tag-selection.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Tag Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playspaces/test-playspace/characters/test-character');
  });

  test('should select a power tag', async ({ page }) => {
    const powerTag = page.locator('.tag.power').first();

    await expect(powerTag).not.toHaveClass(/selected/);

    await powerTag.click();

    await expect(powerTag).toHaveClass(/selected/);
  });

  test('should toggle burn state', async ({ page }) => {
    const powerTag = page.locator('.tag.power').first();
    const burnToggle = powerTag.locator('.burn-toggle');

    await expect(powerTag).toHaveClass(/unburned/);

    await burnToggle.click();
    await expect(powerTag).toHaveClass(/toBurn/);

    await burnToggle.click();
    await expect(powerTag).toHaveClass(/unburned/);
  });

  test('should invert weakness tag', async ({ page }) => {
    const weaknessTag = page.locator('.tag.weakness').first();
    const inversionToggle = weaknessTag.locator('.inversion-toggle');

    await expect(weaknessTag).not.toHaveClass(/inverted/);

    await inversionToggle.click();
    await expect(weaknessTag).toHaveClass(/inverted/);
  });

  test('should cycle status polarity', async ({ page }) => {
    const status = page.locator('.status').first();

    await expect(status).toHaveClass(/neutral/);

    await status.click();
    await expect(status).toHaveClass(/positive/);

    await status.click();
    await expect(status).toHaveClass(/negative/);

    await status.click();
    await expect(status).not.toHaveClass(/selected/);
  });

  test('should calculate total modifier correctly', async ({ page }) => {
    const powerTag = page.locator('.tag.power').first();
    const weaknessTag = page.locator('.tag.weakness').first();
    const status = page.locator('.status').first();
    const modifierDisplay = page.locator('.total-modifier');

    // Select power tag (+1)
    await powerTag.click();
    await expect(modifierDisplay).toHaveText('+1');

    // Select weakness tag (-1)
    await weaknessTag.click();
    await expect(modifierDisplay).toHaveText('0');

    // Select status with tier 3, positive
    await status.click(); // neutral
    await status.click(); // positive
    await expect(modifierDisplay).toHaveText('+3');
  });
});
```

---

## Comparaison : Mist HUD vs Brumisater

| Aspect | Mist HUD (Foundry VTT) | Brumisater (Nuxt 4) |
|--------|------------------------|---------------------|
| **Plateforme** | Foundry VTT (desktop app) | Web app (browser) |
| **Storage** | NeDB (Actor-Item model) | PostgreSQL + Prisma |
| **State** | Foundry Documents | Pinia stores + API |
| **UI Framework** | Handlebars + jQuery | Vue 3 Composition API |
| **Real-time** | Foundry Hooks + Sockets | (Future: WebSockets Nitro) |
| **Drag & Drop** | Foundry DragDrop API | HTML5 Drag & Drop API |
| **Rolls** | Foundry Roll API | API route `/api/rolls/execute` |
| **PDF** | N/A | PDFKit server-side |
| **Offline** | N/A (desktop app) | PWA + IndexedDB cache |

---

## Références

### Repository Analysé
- [mordachai/mist-hud](https://github.com/mordachai/mist-hud)

### Fichiers Clés Analysés
- `README.md` - Documentation utilisateur complète
- `templates/mh-hud.hbs` - Template HUD PJ (20 KB)
- `templates/npc-hud.hbs` - Template HUD Dangers (10 KB)
- `scripts/mh-getters.js` - Extraction données (27 KB)
- `scripts/mist-hud.js` - Logique principale (74 KB)
- `scripts/npc-hud.js` - Logique NPC (68 KB)
- `scripts/mh-roll.js` - Gestion des jets (52 KB)

### Documentation Liée
- [01-analyse-repos-city-of-mist.md](./01-analyse-repos-city-of-mist.md) - Analyse comparative
- [02-modele-donnees-prisma.md](./02-modele-donnees-prisma.md) - Schéma DB
- [03-architecture-composants-vue.md](./03-architecture-composants-vue.md) - Composants Vue
- [09-architecture-multi-systemes-mist-engine.md](./09-architecture-multi-systemes-mist-engine.md) - Multi-systèmes

---

## Maintenance

Cette documentation doit être mise à jour lors de :
- Nouvelles features ajoutées au Mist HUD
- Modifications du Actor-Item model de Foundry
- Ajout de nouveaux systèmes Mist Engine
- Changements dans l'UI/UX du HUD

**Dernière mise à jour** : 2025-01-19 (Analyse Mist HUD v2.50.2)
