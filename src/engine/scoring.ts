import {
  ATTRIBUTE_KEYS,
  ATTRIBUTE_LABELS,
  POSITION_ATTRIBUTE_WEIGHTS,
  POSITION_LABELS,
  positionalDistance,
  type AttributeKey,
  type Position,
} from '../data/attributes';
import { PLAYERS_BY_ID, STAR_PLAYER_IDS } from '../data/players';
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
// lopsided/redundant attribute coverage.
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

// Step 4: mapping from TPS to a win total.
//
// Bounds are calibrated against the actual player pool, not guessed: random,
// unthoughtful team-building averages TPS ~52 -> ~55 wins, a genuinely good
// build (real stars/legends, natural positions, a decent but unoptimized
// transplant) lands around TPS 66 -> ~70-72 wins — solidly in "well thought
// out, a little lucky" territory, clearly ahead of random — and a
// near-optimal build (elite two-way stars, best-in-pool donor swaps) reaches
// TPS ~90, comfortably past the practical ceiling. No separate wins floor
// here — skill is meant to matter, so bad TPS is allowed to fall further
// than a flat floor would allow; the hard caps below still stop a single
// flaw (or a total absence of exceptional combos) from being papered over.
const TPS_FLOOR = 22;
const TPS_CEILING = 77;
const CURVE_EXPONENT = 0.6;

function winsFromScore(tps: number): number {
  const normalized = Math.min(1, Math.max(0, (tps - TPS_FLOOR) / (TPS_CEILING - TPS_FLOOR)));
  const raw = 82 * normalized ** CURVE_EXPONENT;
  return Math.round(Math.min(82, Math.max(0, raw)));
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
// grants often isn't enough on its own to clear the ceiling unless the rest
// of the roster is also excellent. Two or more meaningfully closes that gap.
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

function buildExplanation(team: TeamSlot[], wins: number, cappedBy: TeamSlot | null): string {
  const losses = 82 - wins;
  const slotScores = team.map((slot) => ({ slot, score: slotScore(slot) }));
  const best = slotScores.reduce((a, b) => (b.score > a.score ? b : a));
  const worst = cappedBy
    ? { slot: cappedBy, score: slotScore(cappedBy) }
    : slotScores.reduce((a, b) => (b.score < a.score ? b : a));

  const strongAttr = ATTRIBUTE_LABELS[definingAttribute(best.slot, 'best')];
  const weakAttr = ATTRIBUTE_LABELS[definingAttribute(worst.slot, 'worst')];
  const strongPos = POSITION_LABELS[best.slot.position];
  const weakPos = POSITION_LABELS[worst.slot.position];

  let body: string;
  if (wins >= 82) {
    body = `Every slot graded elite with no exploitable weakness — ${strongAttr.toLowerCase()} out of the ${strongPos} spot and airtight play everywhere else meant this team simply had no bad matchups.`;
  } else if (cappedBy) {
    body = `${playerName(worst.slot)} at ${weakPos} couldn't hold up on ${weakAttr.toLowerCase()}, and that one hole got exploited across all 82 games no matter how good the rest of the roster was.`;
  } else {
    body = `${playerName(best.slot)}'s ${strongAttr.toLowerCase()} carried this roster, but ${playerName(worst.slot)}'s ${weakAttr.toLowerCase()} at ${weakPos} left just enough cracks to cost winnable games.`;
  }

  return `${body} Final record: ${wins}-${losses}.`;
}

export function gradeTeam(team: TeamSlot[]): GradeResult {
  const mythicalSlots = mythicalSlotsIn(team);
  const tps = teamPowerScore(team, mythicalSlots);
  const rawWins = winsFromScore(tps);
  const { wins, cappedBy } = applyHardCap(team, rawWins, mythicalSlots);
  const explanation = buildExplanation(team, wins, cappedBy);

  return {
    wins,
    losses: 82 - wins,
    teamPowerScore: tps,
    explanation,
    cappedBy,
    mythicalSlots,
  };
}
