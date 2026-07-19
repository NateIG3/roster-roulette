# Roster Roulette — Game Spec

## 1. Overview

A single-player web game. The player drafts a 5-man NBA lineup, one player per round over 5 rounds, by spinning a slot machine that grafts one attribute from a "donor" player onto a "base" player. At the end, the completed team is graded by a deterministic formula and given a season record from 0-82 to 82-0, with a short explanation of why.

No accounts, no backend, no persistence across sessions. Each playthrough is self-contained; "Play Again" just resets state and jumps straight to Round 1.

## 2. Tech Stack & Project Structure

- **React + TypeScript**, built with Vite.
- No backend. No database. No save/history of past rounds or past games — state lives in memory for the current playthrough only and is discarded on reset.
- Player/attribute data is a static local JSON file, not fetched from any API.

```
roster-roulette/
  src/
    data/
      players.ts          // curated roster + attributes
      attributes.ts        // attribute keys, labels, position weight tables
    engine/
      spin.ts               // option generation, respin logic
      transplant.ts         // attribute-transplant resolution
      scoring.ts             // deterministic scoring formula -> record + explanation
    state/
      gameReducer.ts        // state machine (see §5)
    components/
      StartScreen.tsx
      RoundScreen.tsx
      SlotReel.tsx           // single animated reel
      OptionCard.tsx          // one of the 2 options (3 reels + choose button)
      PositionPicker.tsx
      TeamSidebar.tsx          // running roster as it fills in
      ResultsScreen.tsx
    App.tsx
  spec.md
```

## 3. Data Model

```ts
type AttributeKey =
  | 'build' | 'shooting' | 'handling' | 'defense' | 'playmaking'
  | 'rebounding' | 'clutch' | 'finishing' | 'athleticism';

type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

interface Player {
  id: string;
  name: string;
  tier: 'current' | 'legend' | 'role';   // role = below-average/deep-cut, for ball-knowledge variety
  naturalPosition: Position;
  attributes: Record<AttributeKey, number>; // 0-100
}

interface Option {
  baseId: string;
  donorId: string;
  attribute: AttributeKey;
}

interface TeamSlot {
  position: Position;
  option: Option;
  finalAttributes: Record<AttributeKey, number>; // base player's attrs, with `attribute` overwritten by donor's value
}

interface GameState {
  screen: 'start' | 'round' | 'results';
  round: 1 | 2 | 3 | 4 | 5;
  respinsRemaining: number;        // starts at 2, shared pool for the whole game
  currentOptions: [Option, Option] | null;
  team: TeamSlot[];                 // grows to length 5
  filledPositions: Set<Position>;
  usedPlayerIds: Set<string>;       // prevents drafting the same base player twice
}
```

## 4. Player Roster

Hand-curated, authored directly in `data/players.ts`:

- **Current tier**: current NBA players (~106 after curation), rated 0-100 per attribute using publicly-known skill profiles as reference (comparable to how 2K-style ratings are derived — not sourced from any proprietary dataset). Curated to well-known names and players with a clear standout specialty (~80+ in something) rather than every starter — generic mid-all-rounders were cut even if they technically start, so a name being in the pool isn't itself a signal of star power.
- **Legend tier**: a small set (10) of all-time greats rated at their statistical/athletic prime (e.g., prime peak season), clearly flagged as historical so the player knows they're not facing a current-season version.

This file is authored once as part of implementation; it is not part of this spec document.

## 5. Game Flow / State Machine

```
START
  → (Start button) → ROUND 1
ROUND n (n = 1..5)
  → generate 2 Options → show 6-reel spin animation → SPIN_RESULT shown
  → player may spend any of respinsRemaining respins on individual reels (see §6)
  → player picks one Option → CHOICE_MADE
  → player assigns the resulting player to an open Position → SLOT_FILLED
  → if n < 5: round = n+1, go to ROUND n+1
  → if n == 5: go to RESULTS
RESULTS
  → compute record + explanation (deterministic, see §9)
  → show ResultsScreen
  → "Play Again" → reset all state except nothing persists → ROUND 1 (Start screen skipped)
```

Start screen is shown only before the very first round of the session; every subsequent replay goes directly from Results to Round 1.

## 6. Spin & Respin Mechanic

Each round generates **2 independent Options**, each with 3 reels (Base Player / Donor Player / Attribute) — 6 reels total on screen.

Generation constraints:
- `baseId !== donorId`
- `baseId` not already in `usedPlayerIds` (can't draft the same player twice across the game)
- Both options should be distinct from each other (not the literal same triple)

**Respins**: the player has a shared pool of **2 respins for the entire game** (not per round). A respin re-rolls exactly one chosen reel (any one of the 6 currently on screen) and leaves the other 5 untouched. Both respins can be spent on the same round if desired, including two reels within the same option. Once both are spent, no more are available for the rest of the playthrough.

The animation itself (visual only, not logic): each reel spins through a rapid sequence of candidate values before easing to a stop on the actual generated result — implemented with CSS transition/keyframes driven by the reducer's result, not by the animation itself picking the outcome.

## 7. Attribute Transplant Rule

**Full replace.** When an Option is chosen, the resulting player's stat line is the base player's own attributes in every category *except* the transplanted `attribute`, which is entirely overwritten by the donor's rating in that category. This is a full overwrite, not a blend — it's what makes a pick like *Kyrie Irving (base) + Wembanyama's Build* land as a genuine spike rather than a marginal bump.

```ts
finalAttributes = { ...basePlayer.attributes, [option.attribute]: donorPlayer.attributes[option.attribute] };
```

## 8. Position Assignment

After choosing an Option, the player assigns the resulting player to one of the 5 positions (PG/SG/SF/PF/C). Each position can be filled exactly once. On round 5, only one position remains open, so the assignment is forced — a mismatched final player (e.g., a naturally small guard forced to Center) is a real, intended consequence, not a bug, and feeds directly into the position-fit penalty in scoring (§9).

## 9. Scoring Formula (deterministic)

The entire scoring pipeline is a pure function of the finished team — same 5 slots always produce the same record. No randomness at grading time.

**Step 1 — Per-slot weighted score.**
Within a slot, the transplanted attribute is weighted heavily above the player's 8 native attributes, since exploiting the transplant is the core strategic decision of the game:

```
TRANSPLANT_WEIGHT = 3   // transplanted attribute counts 3x a native attribute
NATIVE_WEIGHT = 1

slotRawScore = (
  sum(nativeAttrValue * NATIVE_WEIGHT for the 8 non-transplanted attrs)
  + transplantedAttrValue * TRANSPLANT_WEIGHT
) / (8 * NATIVE_WEIGHT + TRANSPLANT_WEIGHT)   // denominator = 11
```

**Step 2 — Position-fit multiplier.**
Each position has a weight table over the 9 attributes reflecting what actually matters there (e.g., Center weights rebounding/defense/build higher and playmaking/handling lower; PG is the inverse). Compute a fit multiplier per slot by comparing the *assigned* position's weight table against the player's own attribute profile and `naturalPosition`:

```
fitMultiplier = baseFit(naturalPosition, assignedPosition)   // 1.0 if natural match, scaling down with positional distance (e.g. PG at PF/C penalized harder than PG at SG)
slotScore = slotRawScore * fitMultiplier
```

**Step 3 — Team Power Score (TPS).**
```
TPS = average(slotScore for all 5 slots)
      + balanceBonus        // rewards coverage across all 9 attribute categories team-wide
      - redundancyPenalty   // penalizes e.g. 5 high-shooting/low-rebounding slots
```

**Step 4 — Harsh nonlinear mapping to wins.**
```
normalized = (TPS - 50) / 50        // roughly -1..1 for realistic team scores
wins = round(41 + 41 * normalized^3)  // odd power: keeps near-elite teams near 82, punishes mediocrity fast
wins = clamp(wins, 0, 82)
```
Cubing a fraction below ~0.9 drops off quickly (e.g. 0.7³ ≈ 0.34), so only teams that are elite in nearly every slot get close to 82-0 — this is the intended "harsh, needs a genuinely impressive team" behavior.

**Step 5 — Hard caps (fatal-flaw override).**
Independent of TPS, if any single slot's *position-relevant* attributes (per §9 Step 2's weight table) fall below a floor threshold, cap the maximum possible wins regardless of how strong the rest of the team is (e.g., a Center with bottom-tier rebounding+defense caps the team at 55 wins max) — represents one exploitable hole being enough to lose winnable games.

## 10. Results Screen

Minimal, per spec:
- Final record, large (e.g. "47-35").
- The 5-man roster with positions and the base/donor/attribute that built each player.
- A 1-2 sentence rule-based explanation: identify the team's standout slot (highest slotScore) and weakest slot (lowest slotScore, or whichever triggered a hard cap) and generate the sentence from a small template bank keyed off those two, e.g.:
  > "Elite shooting and playmaking carried this roster all season, but a Center who couldn't rebound gave up too many second-chance points down the stretch — final record: 61-21."
- "Play Again" button → resets state, skips Start screen, goes to Round 1.

No stat breakdown/radar chart in v1 (explicitly kept minimal per your call).

## 11. Explicit Non-Goals (v1)

- No saving/loading of past rounds or past completed teams.
- No accounts, no backend, no multiplayer/leaderboard.
- No difficulty settings — the harsh curve is fixed and constant across all playthroughs.

## 12. Build Phases

1. Data: author `players.ts` roster (curated set across current/legend tiers).
2. Engine: option generation, transplant resolution, scoring formula — unit-testable in isolation from UI.
3. State machine: `gameReducer` covering the full flow in §5.
4. UI: Start → Round (reels + respins + position picker) → Results, wired to the reducer.
5. Polish: reel spin animation timing/easing.
