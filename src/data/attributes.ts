export type AttributeKey =
  | 'build'
  | 'shooting'
  | 'handling'
  | 'defense'
  | 'playmaking'
  | 'rebounding'
  | 'clutch'
  | 'finishing'
  | 'athleticism';

export const ATTRIBUTE_KEYS: AttributeKey[] = [
  'build',
  'shooting',
  'handling',
  'defense',
  'playmaking',
  'rebounding',
  'clutch',
  'finishing',
  'athleticism',
];

export const ATTRIBUTE_LABELS: Record<AttributeKey, string> = {
  build: 'Build',
  shooting: 'Shooting',
  handling: 'Handling',
  defense: 'Defense',
  playmaking: 'Playmaking',
  rebounding: 'Rebounding',
  clutch: 'Clutch',
  finishing: 'Finishing',
  athleticism: 'Athleticism',
};

export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export const POSITIONS: Position[] = ['PG', 'SG', 'SF', 'PF', 'C'];

export const POSITION_LABELS: Record<Position, string> = {
  PG: 'Point Guard',
  SG: 'Shooting Guard',
  SF: 'Small Forward',
  PF: 'Power Forward',
  C: 'Center',
};

/**
 * How much each attribute matters at a given position, used to grade
 * position fit in the scoring engine. Weights are relative, not normalized.
 */
export const POSITION_ATTRIBUTE_WEIGHTS: Record<Position, Record<AttributeKey, number>> = {
  PG: {
    build: 0.6,
    shooting: 1.1,
    handling: 1.6,
    defense: 0.8,
    playmaking: 1.7,
    rebounding: 0.4,
    clutch: 1.2,
    finishing: 0.9,
    athleticism: 1.1,
  },
  SG: {
    build: 0.7,
    shooting: 1.6,
    handling: 1.3,
    defense: 1.0,
    playmaking: 1.0,
    rebounding: 0.5,
    clutch: 1.3,
    finishing: 1.1,
    athleticism: 1.1,
  },
  SF: {
    build: 1.0,
    shooting: 1.2,
    handling: 1.0,
    defense: 1.2,
    playmaking: 1.0,
    rebounding: 0.9,
    clutch: 1.1,
    finishing: 1.1,
    athleticism: 1.2,
  },
  PF: {
    build: 1.4,
    shooting: 0.9,
    handling: 0.6,
    defense: 1.3,
    playmaking: 0.6,
    rebounding: 1.5,
    clutch: 0.9,
    finishing: 1.2,
    athleticism: 1.1,
  },
  C: {
    build: 1.7,
    shooting: 0.5,
    handling: 0.4,
    defense: 1.6,
    playmaking: 0.5,
    rebounding: 1.8,
    clutch: 0.8,
    finishing: 1.3,
    athleticism: 0.9,
  },
};

/**
 * Positional distance used to scale down fit when a player is forced
 * into a slot far from their natural position (e.g. a PG at Center).
 * 0 = natural match, higher = worse mismatch.
 */
const POSITION_ORDER: Position[] = ['PG', 'SG', 'SF', 'PF', 'C'];

export function positionalDistance(natural: Position, assigned: Position): number {
  return Math.abs(POSITION_ORDER.indexOf(natural) - POSITION_ORDER.indexOf(assigned));
}
