import {
  ATTRIBUTE_KEYS,
  ATTRIBUTE_LABELS,
  POSITION_ATTRIBUTE_WEIGHTS,
  POSITION_LABELS,
  positionalDistance,
  type AttributeKey,
  type Position,
} from '../data/attributes';
import { PLAYERS_BY_ID } from '../data/players';
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

// Step 3: Team Power Score — average slot score, plus a bonus for having no
// team-wide gaps, minus a penalty for lopsided/redundant attribute coverage.
function teamPowerScore(team: TeamSlot[]): number {
  const slotScores = team.map(slotScore);
  const baseAverage = average(slotScores);

  const teamAttrAvg = ATTRIBUTE_KEYS.map((key) =>
    average(team.map((slot) => slot.finalAttributes[key])),
  );
  const minAttr = Math.min(...teamAttrAvg);
  const balanceBonus = Math.max(0, (minAttr - 50) * 0.15);
  const redundancyPenalty = stdDev(teamAttrAvg) * 0.35;

  return baseAverage + balanceBonus - redundancyPenalty;
}

// Step 4: mapping from TPS to a win total.
//
// Bounds are calibrated against the actual player pool, not guessed: random,
// unthoughtful team-building averages TPS ~52 -> ~55 wins, a genuinely good
// build (real stars/legends, natural positions, a decent but unoptimized
// transplant) lands around TPS 66 -> ~70-72 wins — solidly in "well thought
// out, a little lucky" territory, clearly ahead of random — and a
// near-optimal build (elite two-way stars, best-in-pool donor swaps) reaches
// TPS ~90, comfortably past the practical ceiling — verified there's enough
// slack that a team with one real imperfection (one player forced off natural
// position, one merely-good starter instead of a legend, or one so-so donor
// pick) still clears 82-0; it doesn't require literal perfection in all 5
// slots. No separate wins floor here — skill is meant to matter, so bad TPS
// is allowed to fall further than a flat floor would allow; the hard cap
// below still stops any single flaw from being humiliating on its own.
const TPS_FLOOR = 22;
const TPS_CEILING = 77;
const CURVE_EXPONENT = 0.6;

function winsFromScore(tps: number): number {
  const normalized = Math.min(1, Math.max(0, (tps - TPS_FLOOR) / (TPS_CEILING - TPS_FLOOR)));
  const raw = 82 * normalized ** CURVE_EXPONENT;
  return Math.round(Math.min(82, Math.max(0, raw)));
}

// Step 5: fatal-flaw hard cap. A single slot whose position-relevant
// attributes (the ones that actually matter at that position) fall below a
// floor caps the whole team's max wins, regardless of how good the rest of
// the roster is — one exploitable hole is enough to lose winnable games.
// Thresholds are intentionally strict (only real position disasters trigger
// them) and the caps themselves stay in "bad, not humiliating" territory.
const SEVERE_FLOOR = 35;
const SEVERE_CAP = 40;
const FATAL_FLOOR = 45;
const FATAL_CAP = 62;

function positionRelevantAverage(slot: TeamSlot): number {
  const weights = POSITION_ATTRIBUTE_WEIGHTS[slot.position];
  const topKeys = ATTRIBUTE_KEYS.slice()
    .sort((a, b) => weights[b] - weights[a])
    .slice(0, 3);
  return average(topKeys.map((key) => slot.finalAttributes[key]));
}

function applyHardCap(team: TeamSlot[], wins: number): { wins: number; cappedBy: TeamSlot | null } {
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

  if (wins >= 82) {
    return `Every slot graded elite with no exploitable weakness — ${strongAttr.toLowerCase()} out of the ${strongPos} spot and airtight play everywhere else meant this team simply had no bad matchups. Final record: 82-0.`;
  }

  if (cappedBy) {
    return `${playerName(worst.slot)} at ${weakPos} couldn't hold up on ${weakAttr.toLowerCase()}, and that one hole got exploited across all 82 games no matter how good the rest of the roster was. Final record: ${wins}-${losses}.`;
  }

  return `${playerName(best.slot)}'s ${strongAttr.toLowerCase()} carried this roster, but ${playerName(worst.slot)}'s ${weakAttr.toLowerCase()} at ${weakPos} left just enough cracks to cost winnable games. Final record: ${wins}-${losses}.`;
}

export function gradeTeam(team: TeamSlot[]): GradeResult {
  const tps = teamPowerScore(team);
  const rawWins = winsFromScore(tps);
  const { wins, cappedBy } = applyHardCap(team, rawWins);
  const explanation = buildExplanation(team, wins, cappedBy);

  return {
    wins,
    losses: 82 - wins,
    teamPowerScore: tps,
    explanation,
    cappedBy,
  };
}
