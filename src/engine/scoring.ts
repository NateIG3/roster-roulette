import {
  ATTRIBUTE_KEYS,
  ATTRIBUTE_LABELS,
  POSITION_ATTRIBUTE_WEIGHTS,
  POSITION_LABELS,
  POSITIONS,
  positionalDistance,
  type AttributeKey,
  type Position,
} from '../data/attributes';
import { PLAYERS, PLAYERS_BY_ID, STAR_PLAYER_IDS } from '../data/players';
import { resolveTransplant } from './transplant';
import type { Option } from './spin';

export interface TeamSlot {
  position: Position;
  option: Option;
  finalAttributes: Record<AttributeKey, number>;
}

export interface GradeResult {
  wins: number;
  losses: number;
  teamPowerScore: number;
  percentile: number;
  explanation: string;
  cappedBy: TeamSlot | null;
  mythicalSlots: TeamSlot[];
}

const TRANSPLANT_WEIGHT = 3;
const NATIVE_WEIGHT = 1;

// Step 1: per-slot score, weighting the transplanted attribute heavily above
// the player's 8 native attributes — exploiting the transplant is the core
// strategic decision of the game, so it should swing the grade accordingly.
function slotRawScore(slot: TeamSlot): number {
  let sum = 0;
  let weightTotal = 0;
  for (const key of ATTRIBUTE_KEYS) {
    const weight = key === slot.option.attribute ? TRANSPLANT_WEIGHT : NATIVE_WEIGHT;
    sum += slot.finalAttributes[key] * weight;
    weightTotal += weight;
  }
  return sum / weightTotal;
}

// Step 2: position-fit multiplier, penalizing players forced away from their
// natural position (e.g. a natural PG forced to play Center).
function fitMultiplier(slot: TeamSlot): number {
  const base = PLAYERS_BY_ID[slot.option.baseId];
  const distance = positionalDistance(base.naturalPosition, slot.position);
  return Math.max(0.55, 1 - distance * 0.12);
}

function slotScore(slot: TeamSlot): number {
  return slotRawScore(slot) * fitMultiplier(slot);
}

function average(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdDev(values: number[]): number {
  const mean = average(values);
  return Math.sqrt(average(values.map((v) => (v - mean) ** 2)));
}

// An exceptional combo: ALL of (a) the base player is a genuine, unmistakable
// star (see STAR_PLAYER_IDS — a much higher bar than "good specialist"),
// (b) they're playing their natural position, no fit compromise, and
// (c) the transplanted attribute is elite in its own right and a huge swing
// up from what the player natively rated there. All three gates matter: a
// merely good/known role player (Isaiah Hartenstein, Duncan Robinson) never
// qualifies no matter how big the stat swing; neither does a star playing
// out of position, or a modest stat bump. This is deliberately rare.
const MYTHICAL_DONOR_THRESHOLD = 85;
const MYTHICAL_SWING_THRESHOLD = 25;
const MYTHICAL_BONUS = 4;

export function isMythicalSlot(slot: TeamSlot): boolean {
  const base = PLAYERS_BY_ID[slot.option.baseId];
  if (!STAR_PLAYER_IDS.has(base.id)) return false;
  if (base.naturalPosition !== slot.position) return false;

  const donor = PLAYERS_BY_ID[slot.option.donorId];
  const donorValue = donor.attributes[slot.option.attribute];
  const swing = donorValue - base.attributes[slot.option.attribute];
  return donorValue >= MYTHICAL_DONOR_THRESHOLD && swing >= MYTHICAL_SWING_THRESHOLD;
}

function mythicalSlotsIn(team: TeamSlot[]): TeamSlot[] {
  return team.filter(isMythicalSlot);
}

// Step 3: Team Power Score — average slot score, plus a bonus for having no
// team-wide gaps and for any exceptional combos, minus a penalty for
// lopsided/redundant attribute coverage. This is the same yardstick used
// both for the team being graded and for every team in the reference
// distribution below, so comparisons between them are apples-to-apples.
function teamPowerScore(team: TeamSlot[], mythicalSlots: TeamSlot[]): number {
  const slotScores = team.map(slotScore);
  const baseAverage = average(slotScores);

  const teamAttrAvg = ATTRIBUTE_KEYS.map((key) =>
    average(team.map((slot) => slot.finalAttributes[key])),
  );
  const minAttr = Math.min(...teamAttrAvg);
  const balanceBonus = Math.max(0, (minAttr - 50) * 0.15);
  const redundancyPenalty = stdDev(teamAttrAvg) * 0.35;

  return baseAverage + balanceBonus - redundancyPenalty + mythicalSlots.length * MYTHICAL_BONUS;
}

// Step 4: rank this team's TPS against a reference distribution of other
// teams the game could have produced, then map that percentile to a win
// total. "Countless" possible teams can't be enumerated, so this samples a
// large number of them (any 5 distinct players, any donor, any attribute,
// any position) using the exact same construction rules and scoring
// function as real play, and treats that sample as a stand-in for the full
// space. The record is therefore always relative to what else was
// achievable, not an arbitrary fixed number.
//
// The sample is generated once (lazily, on first use) and cached for the
// rest of the session — regenerating it on every grade would make the same
// exact team grade slightly differently run to run, which would undercut
// the "fixed formula" the game promises.
const REFERENCE_SAMPLE_SIZE = 6000;
let referenceDistribution: number[] | null = null;

// Players are drafted in a random order (mirroring 5 rounds of the real
// spin), and each one is placed at their own natural position if it's still
// open — same as an actual player would tend to do without deliberately
// optimizing — falling back to a random remaining slot only when it's
// already taken. Assigning positions purely at random instead (ignoring fit
// entirely) produces a reference pool so lopsided that almost any
// deliberately-built team beats 99%+ of it regardless of quality, which
// flattens out exactly the mid-range distinctions the record is supposed to
// capture.
function buildReferenceTeam(): TeamSlot[] {
  const used = new Set<string>();
  const filled = new Set<Position>();
  const slots: TeamSlot[] = [];

  for (let round = 0; round < POSITIONS.length; round++) {
    let base = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
    while (used.has(base.id)) {
      base = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
    }
    used.add(base.id);
    let donor = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
    while (donor.id === base.id) {
      donor = PLAYERS[Math.floor(Math.random() * PLAYERS.length)];
    }
    const attribute = ATTRIBUTE_KEYS[Math.floor(Math.random() * ATTRIBUTE_KEYS.length)];
    const option: Option = { baseId: base.id, donorId: donor.id, attribute };

    const open = POSITIONS.filter((p) => !filled.has(p));
    const position = open.includes(base.naturalPosition)
      ? base.naturalPosition
      : open[Math.floor(Math.random() * open.length)];
    filled.add(position);

    slots.push({ position, option, finalAttributes: resolveTransplant(option) });
  }

  return slots;
}

function getReferenceDistribution(): number[] {
  if (referenceDistribution) return referenceDistribution;
  const samples: number[] = [];
  for (let i = 0; i < REFERENCE_SAMPLE_SIZE; i++) {
    const team = buildReferenceTeam();
    samples.push(teamPowerScore(team, mythicalSlotsIn(team)));
  }
  samples.sort((a, b) => a - b);
  referenceDistribution = samples;
  return samples;
}

// Where does `tps` rank against the reference sample, as a 0-100 percentile?
function percentileOf(tps: number, distribution: number[]): number {
  let lo = 0;
  let hi = distribution.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (distribution[mid] <= tps) lo = mid + 1;
    else hi = mid;
  }
  return (lo / distribution.length) * 100;
}

// Percentile -> win total, via piecewise-linear interpolation between
// calibrated control points rather than a single power curve. A power curve
// can't satisfy this shape: the median possible team (50th percentile)
// needs to land around .500, but a genuinely good, mostly-deliberate build
// already ranks in the low-to-mid 90s percentile-wise (beating nearly all
// of the reference sample), and that specific range needed to keep landing
// in the low-to-mid 70s, not jump straight toward 82 — no single exponent
// hits both. The control points below were tuned against real examples
// worked through directly with a player: a fully random build averages
// ~50th percentile -> ~52 wins; a deliberately good build with one
// unoptimized pick came in at the 93rd percentile and needed to land at
// ~70-74 wins; and only the top sliver of the distribution approaches 82.
const PERCENTILE_CONTROL_POINTS: Array<[percentile: number, wins: number]> = [
  [0, 20],
  [50, 52],
  [70, 60],
  [85, 68],
  [93, 72],
  [97, 76],
  [99.5, 79],
  [100, 82],
];

function winsFromPercentile(percentile: number): number {
  const p = Math.min(100, Math.max(0, percentile));
  for (let i = 1; i < PERCENTILE_CONTROL_POINTS.length; i++) {
    const [p0, w0] = PERCENTILE_CONTROL_POINTS[i - 1];
    const [p1, w1] = PERCENTILE_CONTROL_POINTS[i];
    if (p <= p1) {
      const t = (p - p0) / (p1 - p0);
      return Math.round(w0 + (w1 - w0) * t);
    }
  }
  return 82;
}

// Step 5: hard caps.
//
// Fatal-flaw cap: a single slot whose position-relevant attributes (the ones
// that actually matter at that position) fall below a floor caps the whole
// team's max wins, regardless of how good the rest of the roster is — one
// exploitable hole is enough to lose winnable games. Thresholds are strict
// (only real position disasters trigger them).
//
// No-mythical cap: a perfect 82-0 season requires at least one exceptional
// combo (see isMythicalSlot) — a team built entirely from solid-but-
// unremarkable picks is a good team, not an undefeated one. With exactly one
// exceptional combo, reaching 82-0 is still rare in practice: the bonus it
// grants often isn't enough on its own to clear the top of the distribution
// unless the rest of the roster is also excellent. Two or more meaningfully
// closes that gap.
const SEVERE_FLOOR = 35;
const SEVERE_CAP = 40;
const FATAL_FLOOR = 45;
const FATAL_CAP = 62;
const NO_MYTHICAL_CAP = 81;

function positionRelevantAverage(slot: TeamSlot): number {
  const weights = POSITION_ATTRIBUTE_WEIGHTS[slot.position];
  const topKeys = ATTRIBUTE_KEYS.slice()
    .sort((a, b) => weights[b] - weights[a])
    .slice(0, 3);
  return average(topKeys.map((key) => slot.finalAttributes[key]));
}

function applyHardCap(
  team: TeamSlot[],
  wins: number,
  mythicalSlots: TeamSlot[],
): { wins: number; cappedBy: TeamSlot | null } {
  let cap = 82;
  let cappedBy: TeamSlot | null = null;
  for (const slot of team) {
    const relevantAvg = positionRelevantAverage(slot);
    if (relevantAvg < SEVERE_FLOOR && SEVERE_CAP < cap) {
      cap = SEVERE_CAP;
      cappedBy = slot;
    } else if (relevantAvg < FATAL_FLOOR && FATAL_CAP < cap) {
      cap = FATAL_CAP;
      cappedBy = slot;
    }
  }
  if (mythicalSlots.length === 0 && NO_MYTHICAL_CAP < cap) {
    cap = NO_MYTHICAL_CAP;
  }
  return { wins: Math.min(wins, cap), cappedBy: wins > cap ? cappedBy : null };
}

function definingAttribute(slot: TeamSlot, mode: 'best' | 'worst'): AttributeKey {
  const weights = POSITION_ATTRIBUTE_WEIGHTS[slot.position];
  const scored = ATTRIBUTE_KEYS.map((key) => ({
    key,
    value: slot.finalAttributes[key] * weights[key],
  }));
  scored.sort((a, b) => (mode === 'best' ? b.value - a.value : a.value - b.value));
  return scored[0].key;
}

function playerName(slot: TeamSlot): string {
  return PLAYERS_BY_ID[slot.option.baseId].name;
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// Several phrasings per outcome so replays don't read the same script twice
// with the names swapped.
const PERFECT_TEMPLATES: Array<(strongAttr: string, strongPos: string) => string> = [
  (a, p) =>
    `Every slot graded elite with no exploitable weakness — ${a} out of the ${p} spot and airtight play everywhere else meant this team simply had no bad matchups.`,
  (a, p) =>
    `Nothing to attack. Defenses tried to find a soft spot all year and never did, with ${a} at ${p} setting the tone for a roster with zero holes.`,
  (a, p) =>
    `A flawless year from top to bottom — the ${p} spot alone (elite ${a}) would carry most teams, and this one had four more just like it.`,
  (a, p) =>
    `Opponents game-planned for 82 nights straight and still couldn't crack it; ${a} at ${p} was the exclamation point on a team with no weak links.`,
  (a, p) =>
    `Every matchup broke this team's way — with ${a} anchoring the ${p} spot and no exploitable gap anywhere else, there was simply no way to lose.`,
];

const CAPPED_TEMPLATES: Array<(name: string, pos: string, attr: string) => string> = [
  (name, pos, attr) =>
    `${name} at ${pos} couldn't hold up on ${attr}, and that one hole got exploited across all 82 games no matter how good the rest of the roster was.`,
  (name, pos, attr) =>
    `Every scouting report started the same way: attack ${name} at ${pos}. The ${attr} just wasn't there, and it cost winnable games all season.`,
  (name, pos, attr) =>
    `One glaring hole sank this team — ${name} simply wasn't built for ${pos}, and the lack of ${attr} got exposed relentlessly.`,
  (name, pos, attr) =>
    `${name}'s ${attr} at ${pos} was the crack defenses lived in; a single exploitable weakness outweighed everything else on the roster.`,
  (name, pos, attr) =>
    `No amount of talent elsewhere could paper over ${name} struggling with ${attr} at ${pos} — that matchup got hunted every night.`,
];

const NORMAL_TEMPLATES: Array<(bestName: string, strongAttr: string, worstName: string, weakAttr: string, weakPos: string) => string> = [
  (bn, sa, wn, wa, wp) =>
    `${bn}'s ${sa} carried this roster, but ${wn}'s ${wa} at ${wp} left just enough cracks to cost winnable games.`,
  (bn, sa, wn, wa, wp) =>
    `${bn} was the engine all year thanks to elite ${sa}, though ${wn}'s ${wa} at ${wp} kept this from being a truly great team.`,
  (bn, sa, wn, wa, wp) =>
    `This team lived and died with ${bn}'s ${sa} — dominant on its best nights, but ${wn}'s ${wa} at ${wp} showed up in the losses.`,
  (bn, sa, wn, wa, wp) =>
    `${bn} did enough with ${sa} to make this competitive, but a rotation is only as strong as its weakest link, and ${wn}'s ${wa} at ${wp} was it.`,
  (bn, sa, wn, wa, wp) =>
    `Plenty to like here — ${bn}'s ${sa} in particular — but ${wn}'s ${wa} at ${wp} was a soft spot opponents found more often than not.`,
];

function buildExplanation(team: TeamSlot[], wins: number, cappedBy: TeamSlot | null): string {
  const losses = 82 - wins;
  const slotScores = team.map((slot) => ({ slot, score: slotScore(slot) }));
  const best = slotScores.reduce((a, b) => (b.score > a.score ? b : a));
  const worst = cappedBy
    ? { slot: cappedBy, score: slotScore(cappedBy) }
    : slotScores.reduce((a, b) => (b.score < a.score ? b : a));

  const strongAttr = ATTRIBUTE_LABELS[definingAttribute(best.slot, 'best')].toLowerCase();
  const weakAttr = ATTRIBUTE_LABELS[definingAttribute(worst.slot, 'worst')].toLowerCase();
  const strongPos = POSITION_LABELS[best.slot.position];
  const weakPos = POSITION_LABELS[worst.slot.position];

  let body: string;
  if (wins >= 82) {
    body = pick(PERFECT_TEMPLATES)(strongAttr, strongPos);
  } else if (cappedBy) {
    body = pick(CAPPED_TEMPLATES)(playerName(worst.slot), weakPos, weakAttr);
  } else {
    body = pick(NORMAL_TEMPLATES)(playerName(best.slot), strongAttr, playerName(worst.slot), weakAttr, weakPos);
  }

  return `${body} Final record: ${wins}-${losses}.`;
}

export function gradeTeam(team: TeamSlot[]): GradeResult {
  const mythicalSlots = mythicalSlotsIn(team);
  const tps = teamPowerScore(team, mythicalSlots);
  const percentile = percentileOf(tps, getReferenceDistribution());
  const rawWins = winsFromPercentile(percentile);
  const { wins, cappedBy } = applyHardCap(team, rawWins, mythicalSlots);
  const explanation = buildExplanation(team, wins, cappedBy);

  return {
    wins,
    losses: 82 - wins,
    teamPowerScore: tps,
    percentile,
    explanation,
    cappedBy,
    mythicalSlots,
  };
}
