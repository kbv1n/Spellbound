# Spellbound MTG — Technical Breakdown

> **Version:** 2026-04-01
> **File:** `src/App.jsx` (1,626 lines)
> **Build:** Vite 8.0.1 · React 19.2.4

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Application Architecture](#3-application-architecture)
4. [Data Structures](#4-data-structures)
5. [Component Reference](#5-component-reference)
6. [Key Functions Reference](#6-key-functions-reference)
7. [Zoom & Pan System](#7-zoom--pan-system)
8. [Scryfall Integration](#8-scryfall-integration)
9. [Feature Development History](#9-feature-development-history)
10. [Design Decisions & Rationale](#10-design-decisions--rationale)
11. [Known Limitations](#11-known-limitations)
12. [Build & Deployment](#12-build--deployment)

---

## 1. Project Overview

**Spellbound MTG** is a browser-based Magic: The Gathering Commander game client designed for **pass-the-laptop multiplayer** — multiple players sharing a single screen and device, passing it around between turns.

### Purpose
- Play casual MTG Commander games without physical cards
- Support 2–6 players at one table with one device
- Load any deck from Moxfield/MTGO format via Scryfall card art
- No account, no server, no sync — pure client-side game state

### Core Philosophy
- **Zero friction:** 35 demo cards pre-embedded so the game runs instantly with no setup
- **No rules enforcement:** Players are trusted to follow the rules themselves; the client handles zones, counters, and life totals only
- **Minimal dependencies:** No backend, no database, no auth — just a React app
- **Single file:** Entire game in `src/App.jsx` for maximum portability and simplicity

---

## 2. Tech Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| UI Framework | React | 19.2.4 | Hooks-based state, no class components needed |
| Build Tool | Vite | 8.0.1 | Fast HMR dev server, zero-config bundler |
| Styling | Inline styles (JSX) | — | No CSS framework; styles co-located with components, zero specificity conflicts |
| State Management | `useState` + `mut()` | — | No Redux/Zustand/Jotai; game state fits cleanly in one `useReducer`-style pattern |
| Routing | Screen state machine | — | No React Router; 4 screens managed by a single `screen` state string |
| Testing | None | — | Hobby project; manual QA via dev server |
| External API | Scryfall API | v2 | Card data and imagery; free, no key required |
| External Libraries | None | — | Zero runtime dependencies beyond React |

### `package.json` (abridged)
```json
{
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  },
  "devDependencies": {
    "vite": "^8.0.1"
  },
  "scripts": {
    "dev":     "vite",
    "build":   "vite build",
    "preview": "vite preview"
  }
}
```

No custom `vite.config.js` — all Vite defaults apply.

---

## 3. Application Architecture

### 3.1 Screen State Machine

The app has exactly 4 screens, controlled by a single `screen` string state:

```
'setup'  ──startGame()──▶  'loading'  ──fetchComplete──▶  'commander-select'  ──onBegin──▶  'game'
```

| Screen | Component | Purpose |
|--------|-----------|---------|
| `'setup'` | `SetupScreen` | Choose player count, paste decklists, set playmat URLs |
| `'loading'` | `LoadingScreen` | Shows Scryfall fetch progress bar |
| `'commander-select'` | `CommanderSelectScreen` | Each player picks up to 2 legendaries as commanders |
| `'game'` | Game layout | Full game: TurnBar + PlayerMats + GameLog |

### 3.2 Why One File

All 1,626 lines live in `src/App.jsx`. This is intentional:
- No import graph to trace when debugging
- Copy the file to any Vite React project and it works
- Co-location of component + logic + style removes the need for cross-file navigation
- Suitable for the scope (~19 components, ~30 functions)

### 3.3 The `mut()` Pattern

All game state changes go through `mut(fn)`, a custom deep-copy mutation helper:

```js
function mut(fn) {
  setGame(function(prev) {
    const next = {
      ...prev,
      log: prev.log.slice(),
      players: prev.players.map(function(p) {
        return {
          ...p,
          library:     p.library.slice(),
          hand:        p.hand.slice(),
          battlefield: p.battlefield.slice(),
          graveyard:   p.graveyard.slice(),
          exile:       p.exile.slice(),
          command:     p.command.slice(),
          cmdDmg:      Object.assign({}, p.cmdDmg),
          manaPool:    Object.assign({W:0,U:0,B:0,R:0,G:0,C:0}, p.manaPool),
        };
      }),
    };
    fn(next);   // caller mutates `next` directly
    return next;
  });
}
```

**Why this instead of Immer?**
- Zero additional dependency
- Pattern is immediately readable by any JS developer
- Sufficient for the mutation surface of this game

**Usage example:**
```js
mut(function(g) {
  g.players[pid].life += delta;
  g.log = ['❤️ ' + p.name + ' life: ' + (p.life + delta)].concat(g.log.slice(0, 99));
});
```

### 3.4 Component Tree

```
App
├── SetupScreen                    # screen='setup'
├── LoadingScreen                  # screen='loading'
├── CommanderSelectScreen          # screen='commander-select'
└── Game layout                    # screen='game'
    ├── <style> (CSS keyframes)
    ├── TurnBar
    ├── [PlayerMat × N]
    │   ├── CardToken × N          # battlefield cards
    │   ├── Hand tray
    │   │   └── CardImg / CardBack × N
    │   └── Command zone
    │       └── CardToken × N
    ├── GameLog                    # docked right sidebar
    ├── CardZoom                   # hover preview (fixed position)
    ├── CtxMenu                    # right-click context menu
    ├── ZoneViewer                 # library/graveyard/exile browser modal
    ├── CounterModal               # +/- counter types on a card
    ├── CmdDmgModal                # track commander damage
    ├── UISettingsModal            # UI scale, card scale, playmat
    ├── ScryModal                  # scry: choose top/bottom ordering
    ├── DiceModal                  # dice roll / coin flip
    ├── Toast                      # bottom-right notification
    └── Hand drag ghost            # drag-from-hand visual
```

### 3.5 Pass-the-Laptop Model

There is no network layer. Multiplayer is achieved by physical device sharing:

- `localPid` state: which player currently "has" the screen
- `isLocal` prop: passed to each `PlayerMat`; `true` only for the active player
- Non-local players see `CardBack` components instead of actual hand cards
- Non-local action buttons (Draw, Untap, etc.) are `opacity: 0.38, pointerEvents: none`
- Players pass the device between turns by clicking their name in the footer

---

## 4. Data Structures

### 4.1 Game Object

```ts
game = {
  players: Player[],    // Array indexed 0..N-1
  turn:    number,      // Index of current active player
  round:   number,      // Round counter (increments when turn wraps to 0)
  log:     string[],    // Newest-first, max 100 entries
}
```

### 4.2 Player Object

```ts
player = {
  pid:         number,                      // Index in players array (0–5)
  name:        string,                      // Display name
  pal:         { acc, glow, bg, border },   // PALETTES[pid] color theme
  life:        number,                      // Life total (starts 40)
  poison:      number,                      // Poison counter
  cmdDmg:      { [fromPid: number]: number },// Commander damage received from each opponent
  library:     Card[],                      // Shuffled deck
  hand:        Card[],
  battlefield: Card[],
  graveyard:   Card[],
  exile:       Card[],
  command:     Card[],                      // Command zone (commanders)
  manaPool:    { W, U, B, R, G, C },        // Current mana (tracked even if display removed)
  maxZ:        number,                      // Highest z-index in use (for card stacking)
  isDemo:      boolean,                     // True if using the 35 demo cards
  missed:      number,                      // Cards that failed Scryfall lookup
  playmat:     string,                      // Background image URL (optional)
  playmatFit:  'cover'|'contain'|'repeat'|'center',
}
```

### 4.3 Card Instance

Card data comes from Scryfall (or DEMO_DATA). Instance fields are added by `mkInst()`.

```ts
card = {
  // ── Scryfall / DEMO_DATA fields ─────────────────────────
  name:            string,
  manaCost:        string,       // e.g. "{2}{U}{B}"
  cmc:             number,
  typeLine:        string,       // e.g. "Legendary Creature — Elf Warrior"
  oracle:          string,       // Rules text
  power:           string|null,
  tough:           string|null,
  loyalty:         number|null,  // Planeswalker loyalty
  rarity:          'common'|'uncommon'|'rare'|'mythic',
  set:             string,       // Set code e.g. "CMR"
  isLegendary:     boolean,
  isCreature:      boolean,
  isPlaneswalker:  boolean,
  isLand:          boolean,
  mdfc:            boolean,      // Modal double-faced card
  img:             string,       // Front face image URL (Scryfall CDN)
  imgBack:         string|null,  // Back face URL (MDFC only)
  backName:        string|null,
  backType:        string|null,
  backPower:       string|null,
  backTough:       string|null,

  // ── Instance fields (added by mkInst) ───────────────────
  iid:         string,           // UUID v4 — unique per card per game
  tapped:      boolean,
  showBack:    boolean,          // MDFC: show back face
  faceDown:    boolean,          // Hidden (library reveal / face-down effect)
  summonSick:  boolean,          // Can't attack or tap for mana this turn
  counters:    { [type: string]: number },  // e.g. { "+1/+1": 2, "Loyalty": 4 }
  x:           number,           // Battlefield position, 0–100 (percentage)
  y:           number,
  z:           number,           // z-index for card stacking
}
```

### 4.4 PALETTES

6 muted metallic color themes, one per player slot:

```js
const PALETTES = [
  { acc:'#a78bfa', glow:'rgba(167,139,250,0.25)', bg:'#0d0a1e', border:'#4c1d95' }, // Steel Violet
  { acc:'#fb923c', glow:'rgba(251,146,60,0.25)',  bg:'#1a0c05', border:'#7c2d12' }, // Burnished Copper
  { acc:'#4ade80', glow:'rgba(74,222,128,0.25)',  bg:'#071a0e', border:'#14532d' }, // Oxidized Green
  { acc:'#60a5fa', glow:'rgba(96,165,250,0.25)',  bg:'#05101a', border:'#1e3a5f' }, // Cold Steel Blue
  { acc:'#fbbf24', glow:'rgba(251,191,36,0.25)',  bg:'#1a1505', border:'#78350f' }, // Aged Gold
  { acc:'#2dd4bf', glow:'rgba(45,212,191,0.25)',  bg:'#051a18', border:'#134e4a' }, // Dark Teal
];
```

`acc` drives all primary UI chrome for that player (borders, button highlights, glow effects, active indicators).

### 4.5 COUNTER_TYPES

```js
const COUNTER_TYPES = ['+1/+1','-1/-1','Loyalty','Charge','Poison','+2/+2','Oil','Shield','Lore'];
```

### 4.6 DEMO_DATA

35 pre-embedded real MTG cards with Scryfall image URLs. Includes:
- Staples: Sol Ring, Lightning Bolt, Counterspell, Dark Ritual, Giant Growth
- Creatures: Llanowar Elves, Serra Angel, Shivan Dragon, Goblin Guide, Snapcaster Mage
- Lands: Command Tower, Exotic Orchard, Reliquary Tower
- Legendaries: Atraxa (eligible commander), Nekusar, Prossh, Krenko, etc.

All use live Scryfall CDN image URLs so art loads without any API call.

---

## 5. Component Reference

### `ManaSymbols` (line ~203)
**Props:** `{ cost: string, size?: number }`
Parses `{W}{U}{B}` style mana cost strings into colored circle badges. Uses the `MC` color map (`W=#f9fafb`, `U=#3b82f6`, `B=#6b21a8`, `R=#ef4444`, `G=#16a34a`, `C=#9ca3af`, `X=#fbbf24`).

---

### `CardImg` (line ~219)
**Props:** `{ src, alt, style, fallStyle, fallText }`
**State:** `[err, setErr]`
Image component with graceful fallback. On `onError`, switches to a styled div showing the card name. Prevents broken image icons from appearing anywhere in the UI.

---

### `CardBack` (line ~227)
**Props:** `{ w: number, h: number }`
Renders a styled face-down card back (dark blue gradient + 🂠 emoji). Used for: library cards in ZoneViewer before reveal, opponent hand cards in pass-the-laptop mode.

---

### `CardToken` (line ~233)
**Props:** `{ card, scale, onMD, onRC, onME, onML }`
Single card tile on the battlefield. Absolutely positioned using `card.x`%/`card.y`%/`card.z`. Features:
- 90° rotation when `card.tapped`
- Counter badges rendered below the card image
- 💤 summon sickness indicator (top-right corner)
- Draggable via `onMouseDown` → parent tracks delta → updates x/y on `mouseup`
- Right-click → `CtxMenu`
- Hover → `CardZoom` preview

---

### `CardZoom` (line ~256)
**Props:** `{ card }`
Fixed-position (right edge, vertically centered) enlarged card preview. Shows: image, name, type, mana cost, oracle text, P/T or loyalty, counters, rarity/set. Appears on card hover anywhere in the UI when `uiSettings.showZoomPanel` is true.

---

### `CtxMenu` (line ~292)
**Props:** `{ x, y, card, zone, pal, onAct }`
Right-click context menu. Available actions vary by current zone:
- **Battlefield:** Tap, Move to Hand/Graveyard/Exile/Library, Flip (MDFC), Face Down, Counters, Duplicate
- **Hand:** Play to Battlefield, Move to Graveyard/Exile/Library
- **Command:** Move to Hand/Battlefield

---

### `ZoneViewer` (line ~329)
**Props:** `{ player, zone, onClose, onMove, onHover, onHL, onRC, onScry, onMill }`
**State:** `q` (search), `revealed` (Set of iids), `bannerVisible`, scry/mill input states

Modal for browsing any non-battlefield zone. Key behaviors:
- **Library face-down:** Shows `CardBack` for cards not in `revealed` Set; each card has a `👁 Reveal` button to add its `iid` to the Set
- **Library warning banner:** "⚠️ Library contents visible to all players" fades out after 3 seconds via `useEffect` + `setTimeout`
- **Search:** Filters `shown` array by case-insensitive name match
- **Scry N:** Opens numeric input (1–20); triggers `onScry(n)` which opens `ScryModal`
- **Mill N:** Opens numeric input (1–library length); calls `onMill(n)` to move top N cards to graveyard

---

### `CounterModal` (line ~403)
**Props:** `{ card, pal, onAdd, onClose }`
Grid of counter types with +/- buttons. `onAdd(type, delta)` calls `mut()` on the parent to adjust `card.counters[type]`. Stateless — reads live from `card.counters`.

---

### `CmdDmgModal` (line ~428)
**Props:** `{ player, allPlayers, onDmg, onClose }`
Track commander damage to the target player from each opponent. Displays "LETHAL" warning when any source reaches 21+. +/- per opponent.

---

### `GameLog` (line ~457)
**Props:** `{ entries: string[], open: boolean, onToggle }`
Docked right sidebar. When closed: 28px wide, shows vertical "📜 LOG" label. When open: 230px, scrollable list with color-coded entries. Auto-scrolls to top on new entries (newest-first ordering). Entry colors keyed on leading emoji: 🔄 gold, 💀 red, 🃏 green, ⚡ blue, default gray.

---

### `PlayerMat` (line ~482)
**Props:** `{ player, isActive, isMain, isLocal, zoom, pan, onPan, onResetView, cardScale, onDraw, onDeal7, onUntap, onShuffle, onLife, onCardMD, onCardRC, onHover, onHL, onZone, onHandCardMD, isHandDragOver, matRef, onScry, onMill, outerScrollRef, onZoomWithScroll }`
**State:** `handOpen`, `hoverIdx`, `isPanning`, `panStart` (ref), `spaceDown`, `libAction`, `libN`, `handH`, `resizingHand` (ref)

The main per-player component. Renders:
1. **Header bar:** Name, palette accent, life total (±1/±5 buttons), poison counter, zone badge buttons, action buttons (Draw 1, Deal 7, Untap, Shuffle), Scry/Mill mini-inputs on library badge
2. **Battlefield canvas:** CSS transform viewport (see §7), playmat background image applied here
3. **Command zone:** Fixed bottom-right overlay (38×53px cards)
4. **Hand tray:** Drag-resizable (80–400px), dock-zoom hover effect, `CardBack` for non-local players
5. **Zoom % display + Reset View button** in action row

**Isolation:** When `!isLocal`, action buttons are `opacity:0.38, pointerEvents:none` and hand shows `CardBack` components.

---

### `TurnBar` (line ~688)
**Props:** `{ players, turn, round, onPassTurn, onSettings, onLog, logOpen }`
Top navigation bar. Shows: "⚔ SPELLBOUND" wordmark → active player pill (glowing accent dot + name) → Round N → Pass Turn → button → mini life totals for all players → ⚙ settings → 📜 log toggle.

---

### `Toast` (line ~725)
**Props:** `{ msg, color, onDone }`
**State:** `[visible, setVisible]`
Bottom-right corner notification. `opacity` + `translateY` transition for slide-in/out. Visible for 1.2s, `onDone` called at 1.7s. Uses `backdropFilter: blur(10px)` for frosted glass effect.

---

### `ScryModal` (line ~755)
**Props:** `{ pid, cards, pal, onConfirm, onClose }`
**State:** `decisions` (`{ [iid]: 'top'|'bottom' }`)
Shows top-N cards from library. Player assigns each to "Top" or "Bottom" of library. Confirm is disabled until every card has a decision. `onConfirm(decisions)` calls `confirmScry()` which reorders the library.

---

### `DiceModal` (line ~796)
**Props:** `{ mode: 'dice'|'coin', onRoll, onFlip, onLog, onClose }`
**State:** `result`, `rolling`, `customSides`
Two modes: coin flip (heads/tails with 50/50 random) and dice roll (d4/d6/d8/d10/d12/d20/d100 presets + custom sides). 400ms animation delay on reveal. Detects natural max/1 for special styling.

---

### `UISettingsModal` (line ~861)
**Props:** `{ settings, onChange, players, onPlaymat, onClose }`
**State:** `s` (local copy of settings)
Controls:
- UI Scale slider (70–150%) — scales the root div via CSS transform
- Card Scale slider (50–200%) — scales card sizes
- Default Battlefield Zoom slider (30–300%)
- Toggle: Show card zoom preview on hover
- Per-player: Playmat image URL input + fit mode selector (Stretch/Fit/Tile/Center)

---

### `CommanderSelectScreen` (line ~938)
**Props:** `{ game, cmdSelections, setCmdSelections, cmdReady, setCmdReady, onBegin }`
Pre-game screen. For each player: filters `[...library, ...command]` to find legendaries (isLegendary + (isCreature || isPlaneswalker)). Displays as clickable card tiles. Toggle adds/removes from `cmdSelections[pid]` (max 2 per player). Ready button locks in selections. BEGIN button enables only when all players are ready.

---

### `SetupScreen` (line ~1004)
**Props:** `{ nPlayers, setNP, setups, setSU, onStart }`
Initial screen. Player count selector (2–6). Per-player section: name input, deck textarea (Moxfield/MTGO format), playmat URL. "Leave blank to use 35 demo cards" hint. Card count updates live as user types.

---

### `LoadingScreen` (line ~1046)
**Props:** `{ done, total, current }`
Progress bar showing Scryfall fetch status. Shows current card name being fetched. Only appears if any player deck contains cards not in DEMO_CACHE.

---

## 6. Key Functions Reference

### `fetchScryfall(names, onProgress)` (line ~62)
Async. Fetches card data from Scryfall for a list of card names.

```
1. Filter names not already in DEMO_CACHE or sfCache (module-level Map)
2. Split into chunks of 75 (Scryfall API limit)
3. For each chunk: POST https://api.scryfall.com/cards/collection
4. 110ms delay between chunks (rate limiting)
5. For each card: handle MDFC (card_faces[0/1]), extract name/type/images/stats
6. Store in sfCache; call onProgress(done, total, name)
7. Return: not_found names list
```

**Caching tiers:**
1. `DEMO_CACHE` — module-level Map, built from DEMO_DATA at init
2. `sfCache` — module-level Map, persists across game restarts within the same browser session
3. Scryfall API — only hit if name not in either cache

---

### `parseDeck(text)` (line ~144)
Parses Moxfield/MTGO deck format into `[{name, section}]` array.

Supported section headers: `Commander`, `Commands`, `Deck`, `Main`, `Mainboard`, `Sideboard`, `Side`, `Maybeboard`
Line format: `N [xX] Card Name [SET CODE]`
Ignores lines starting with `//` or `#`.

---

### `mkInst(data)` (line ~167)
Card instance factory. Takes Scryfall card data, returns a game-ready instance:

```js
{
  ...data,
  iid: crypto.randomUUID(),
  tapped: false,
  showBack: false,
  faceDown: false,
  summonSick: false,
  counters: {},
  x: 5 + Math.random() * 55,   // random 5–60%
  y: 5 + Math.random() * 55,
  z: 1,
}
```

---

### `startGame()` (line ~1131)
Full game initialization:

```
1. Collect all card names from all player decklists not in DEMO_CACHE
2. If any unfetched cards: set screen='loading', fetch from Scryfall
3. For each player:
   a. parseDeck(setup.deck) → [{name, section}]
   b. Look up each name in DEMO_CACHE or sfCache
   c. mkInst() on each found card
   d. Place 'commander' section cards directly in commanders[]
   e. All other cards → library[]
   f. shuffle(library)
4. Build game object: {players, turn:0, round:1, log:[...]}
5. Init cmdSelections: {}, cmdReady: {}
6. set screen='commander-select'
```

---

### `finalizeCommanderSelect()` (line ~1203)
Called when all players click "BEGIN":

```
1. For each player: move cmdSelections[pid] cards from library → command
2. Re-shuffle each library
3. Random first player (Math.floor(Math.random() * players.length))
4. set screen='game'
```

---

### `passTheTurn()` (line ~1335)
```
1. nextPid = (game.turn + 1) % players.length
2. If nextPid === 0: increment round
3. mut(): set turn=nextPid; untap all nextPlayer.battlefield cards; clear summonSick
4. setToast('🔄 [name]'s turn')
5. Log entry added
```

---

### `zoomAtCursor(pid, newZoom, mx, my)` (line ~1111)
Cursor-anchored zoom using world-space math (pure, synchronous):

```js
const oldZoom = getZoom(pid);
const pan     = getPan(pid);

// Find world-space point currently under the cursor
const wx = (mx - pan.x) / oldZoom;
const wy = (my - pan.y) / oldZoom;

// Compute new pan so that world point stays under cursor
const newPanX = mx - wx * newZoom;
const newPanY = my - wy * newZoom;

setZoom(pid, newZoom);
setPan(pid,  {x: newPanX, y: newPanY});
```

No async hacks, no scroll correction effects — the transform math is exact.

---

### `moveCard(pid, iid, toZone)` (line ~1256)
Moves a card between zones. Handles zone-specific side effects:
- **→ battlefield:** assigns new `iid` (UUID), sets `summonSick: true`, auto-generates mana if `autoMana` is on and it's a land
- **→ library:** pushes to bottom by default
- **→ graveyard / exile:** straightforward move
- **→ command:** moves to command zone array

Removes from all other zones before adding to target zone.

---

### `drawCards(pid, n)` / `dealSeven(pid)` (line ~1290)
- `drawCards`: pops `n` cards from top of library, pushes to hand. Logs "🃏 drew N".
- `dealSeven`: calls `mut()` to move all hand cards to bottom of library, shuffle, then draw 7.

---

### `openScry(pid, n)` / `confirmScry(pid, decisions)` (line ~1350)
- `openScry`: sets `scry` state `{pid, n}` → triggers `ScryModal`; reveals top-N library cards
- `confirmScry`: reads `decisions` map (`{iid: 'top'|'bottom'}`), reorders the top of the library: tops first, then bottoms, then remaining library

---

### `millCards(pid, n)` (line ~1370)
Moves top `n` library cards to graveyard in order. Logs "💀 milled N card(s)".

---

## 7. Zoom & Pan System

### Problem with Previous Approach
Earlier versions used `width: zoom*100%; height: zoom*100%` on the battlefield container. This caused:
- Layout reflow on every zoom step
- Jittery card repositioning
- Scroll position drift (requiring the `pendingScrollRef` async correction hack)

### Current Approach: CSS Transform Canvas

The battlefield is a **fixed viewport** with an **absolutely positioned canvas** inside:

```jsx
{/* Viewport — overflow hidden, receives mouse events */}
<div ref={outerScrollRef} style={{ flex:1, overflow:'hidden', position:'relative' }}
  onWheel={...}
  onMouseDown={...}
  onMouseMove={...}
  onMouseUp={...}
>
  {/* Canvas — natural 100% size, scaled+translated */}
  <div ref={matRef} style={{
    position: 'absolute',
    top: 0, left: 0,
    width: '100%', height: '100%',
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
    transformOrigin: '0 0',
    backgroundImage: `url(${player.playmat})`,
    backgroundSize: ...,
  }}>
    {battlefield.map(card => <CardToken ... />)}
  </div>
</div>
```

Cards use `position:'absolute'`, `left: card.x+'%'`, `top: card.y+'%'` within the canvas. The `transform: scale()` visually scales the entire canvas including card sizes.

### Controls

| Action | Control |
|--------|---------|
| Zoom in/out | Scroll wheel (±0.1 per tick) |
| Pan | Space + left-drag, OR middle-click drag |
| Reset view | "↺ ZZ%" button in action bar |

**Zoom range:** 0.15× minimum, 4.0× maximum
**Pan:** Unbounded (limited only by practical usability)

### State Storage

```js
zooms: { [pid]: number }       // per-player zoom levels
pans:  { [pid]: {x, y} }      // per-player pan offsets
```

---

## 8. Scryfall Integration

### API Details

- **Endpoint:** `POST https://api.scryfall.com/cards/collection`
- **Auth:** None required
- **Rate limit guidance:** Max 75 cards per request; 110ms delay between batches
- **Request body:**
  ```json
  { "identifiers": [{"name": "Lightning Bolt"}, {"name": "Sol Ring"}] }
  ```
- **Response:**
  ```json
  {
    "data": [{ "name": "...", "image_uris": {"normal": "..."}, ... }],
    "not_found": [{"name": "..."}]
  }
  ```

### MDFC (Modal Double-Faced Cards)

Cards with two faces (e.g., Fable of the Mirror-Breaker // Reflection of Kiki-Jiki) use `card.card_faces[]`. The fetch logic extracts:
- `img`: `card_faces[0].image_uris.normal`
- `imgBack`: `card_faces[1].image_uris.normal`
- `backName`, `backType`, `backPower`, `backTough` from `card_faces[1]`
- `mdfc: true` flag

In-game, `card.showBack` boolean toggles which face is displayed. The `CtxMenu` shows a "Flip" action for MDFC cards.

### Three-Tier Cache

```
Lookup order:  DEMO_CACHE  →  sfCache  →  Scryfall API

DEMO_CACHE:  Built at module load from DEMO_DATA (35 cards)
             Map<lowerCaseName, cardData>
             Never expires (constant)

sfCache:     Module-level Map (survives React re-renders, lost on page refresh)
             Filled by fetchScryfall()
             Never expires within session

Scryfall:    Only fetched for names missing from both caches
             Results stored in sfCache immediately
```

This means repeated game starts with the same deck cost zero API calls after the first load.

---

## 9. Feature Development History

### Session 1 — Core Foundation
- Hand-to-battlefield drag and drop
- Zone browsing (ZoneViewer) for graveyard, exile, library, hand
- Basic life total tracking
- Mana pool tracking (auto-detect from oracle text)
- Initial UI layout: player mats stacked vertically

### Session 2 — UI Overhaul
- **Zoom overhaul:** Cards scale with zoom level (card size tied to zoom %)
- **Global UI scale:** Root div CSS transform; scale slider in settings
- **`CardImg` fallback:** `onError` state → styled text fallback, eliminates broken image icons
- **Dock-zoom hand:** macOS Dock–style magnification; hovering a hand card enlarges it and neighbors scale proportionally
- **Library banner:** "⚠️ Library visible to all players" warning fades after 3s
- **Scry / Mill / Dice / Coin:** New gameplay actions with dedicated modals
- **Card zoom preview:** Fixed-position hover preview panel (`CardZoom`)

### Session 3 — Multiplayer & Polish
- **Cursor-anchored scroll zoom:** `pendingScrollRef` + `useEffect([zooms])` pattern (later replaced)
- **Docked game log:** Right sidebar, collapsible to 28px tab
- **Scry/Mill mini-controls:** Inline on zone badges — no separate menu needed
- **Pass-the-laptop isolation:** `localPid`, `isLocal`, `CardBack` for opponent hands; action button gating
- **Library face-down:** `revealed` Set in ZoneViewer; per-card Reveal button; CardBack shown until revealed
- **Phase/action toasts:** Notifications for draw, life change, card plays (2.5s duration)
- **Commander select screen:** Pre-game legendary picker; `cmdSelections`, `cmdReady` state; `finalizeCommanderSelect()`
- **Metallic dark theme:** 6 PALETTES replaced with muted metallic variants; global color constant cleanup
- **Playmat PNG:** Per-player background image URL; stored in setup and player object; applied as battlefield background

### Session 4 — Fixes & Refinements
- **Commander auto-detect removed:** `startGame()` no longer auto-picks a legendary from the library; all selection goes through CommanderSelectScreen
- **Turn phases removed:** `PHASES`, `PHASE_ICONS`, `nextPhase()`, `prevPhase()` all deleted; `TurnBar` simplified to player pill + Round N + Pass Turn → button
- **CSS transform canvas:** Replaced `width/height: zoom*100%` with `transform: translate(pan) scale(zoom)`; `pendingScrollRef` hack eliminated; world-space cursor math for zoom-at-cursor
- **Pan state added:** `pans: {[pid]: {x,y}}`; Space+drag and middle-click panning
- **Mana UI removed:** Mana pool bar, Spend/Clear buttons removed from PlayerMat (state preserved internally)
- **Hand tray resize:** Drag handle at top of hand tray; `handH` state (80–400px range)
- **Toast redesign:** Bottom-right corner, frosted glass, 1.2s visible / 1.7s total
- **Playmat fit selector:** Cover / Contain / Tile / Center; per-player in UISettingsModal

---

## 10. Design Decisions & Rationale

| Decision | Rationale |
|----------|-----------|
| **Single file** | Zero import overhead; portable; trivially self-contained for a hobby project of this scope |
| **Inline styles only** | Styles co-locate with components; no CSS specificity issues; no Tailwind/styled-components dep |
| **`mut()` over Immer** | One fewer dependency; ~30 lines of code; sufficient for this mutation surface |
| **No rules enforcement** | MTG rules are complex and situational; trust the players; reduces scope dramatically |
| **Pass-the-laptop** | Eliminates WebSocket/server complexity; perfectly sufficient for in-person play |
| **Demo cards embedded** | Zero-friction first run; game works offline and without any deck pasted |
| **Library face-down in ZoneViewer** | Allows "looking at your library" without a server — reveal is opt-in per card |
| **Commander select as a screen** | Cleaner than inline setup; ensures intentional selection rather than random auto-assignment |
| **Phases removed** | Phases add complexity with no enforcement benefit; players manage timing themselves |
| **CSS transform canvas** | Figma-style pan/zoom; eliminates layout reflow; cursor-anchored zoom with synchronous math |
| **No undo system** | State history would multiply memory usage; `mut()` doesn't store diffs; players use judgment |

---

## 11. Known Limitations

| Limitation | Details |
|-----------|---------|
| **No network multiplayer** | Pass-the-laptop only; no WebSocket, no WebRTC, no server |
| **No rules enforcement** | Life gain, priority, legality, targeting — all manual |
| **No undo** | All `mut()` calls are one-way; no diff/history stored |
| **Summon sickness timing** | Cleared on turn pass (not on entry during opponent's turn) |
| **Library privacy** | ZoneViewer shows card backs, but the deck order was already known at shuffle time |
| **Mana tracking** | `manaPool` is tracked in state but the display was removed; may be re-added |
| **Session persistence** | `sfCache` survives React re-renders but is lost on page refresh; no localStorage used |
| **Single screen layout** | All player mats are visible simultaneously; no "hidden" zones enforced at the DOM level |
| **No spectator mode** | All seats are active players; no read-only view |

---

## 12. Build & Deployment

### Development
```bash
npm run dev
# → Vite HMR dev server at http://localhost:5173
# → Hot module replacement on file save
```

### Production Build
```bash
npm run build
# → Outputs to dist/
# → dist/index.html + dist/assets/index-[hash].js
```

**Bundle size (as of 2026-04-01):**
- JS: ~280 KB uncompressed
- JS: ~82 KB gzip

### Deployment
The `dist/` folder is a static site. Deploy to any static host:
- Netlify / Vercel: drag and drop `dist/`
- GitHub Pages: push `dist/` to `gh-pages` branch
- Local: `npm run preview` serves `dist/` on `http://localhost:4173`

### No Custom Vite Config
Vite defaults apply:
- Entry: `src/main.jsx`
- Output: `dist/`
- React JSX transform (no `import React` required)
- `#root` div in `index.html` as mount point

---

*Last updated: 2026-04-01 | Source: `src/App.jsx` (1,626 lines)*
