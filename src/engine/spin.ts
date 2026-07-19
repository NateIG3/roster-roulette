import { PLAYERS } from '../data/players';
import { ATTRIBUTE_KEYS, type AttributeKey } from '../data/attributes';

export interface Option {
  baseId: string;
  donorId: string;
  attribute: AttributeKey;
}

export type ReelSlot = 'base' | 'donor' | 'attribute';

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateOption(usedPlayerIds: Set<string>, excludeBaseIds: string[]): Option {
  const eligibleBases = PLAYERS.filter(
    (pl) => !usedPlayerIds.has(pl.id) && !excludeBaseIds.includes(pl.id),
  );
  const base = randomItem(eligibleBases);
  let donor = randomItem(PLAYERS);
  while (donor.id === base.id) {
    donor = randomItem(PLAYERS);
  }
  const attribute = randomItem(ATTRIBUTE_KEYS);
  return { baseId: base.id, donorId: donor.id, attribute };
}

/** Generates the two spin options shown for a round. Base players are kept
 * distinct between the two options so the player is choosing between two
 * genuinely different draftees, not two variants of the same player. */
export function generateRoundOptions(usedPlayerIds: Set<string>): [Option, Option] {
  const optionA = generateOption(usedPlayerIds, []);
  const optionB = generateOption(usedPlayerIds, [optionA.baseId]);
  return [optionA, optionB];
}

export function respinBase(option: Option, usedPlayerIds: Set<string>, otherBaseId: string): Option {
  const strict = PLAYERS.filter(
    (pl) =>
      pl.id !== option.baseId &&
      pl.id !== otherBaseId &&
      pl.id !== option.donorId &&
      !usedPlayerIds.has(pl.id),
  );
  const pool = strict.length > 0
    ? strict
    : PLAYERS.filter((pl) => pl.id !== option.baseId && !usedPlayerIds.has(pl.id));
  return { ...option, baseId: randomItem(pool).id };
}

export function respinDonor(option: Option): Option {
  const eligible = PLAYERS.filter((pl) => pl.id !== option.donorId && pl.id !== option.baseId);
  return { ...option, donorId: randomItem(eligible).id };
}

export function respinAttribute(option: Option): Option {
  const eligible = ATTRIBUTE_KEYS.filter((a) => a !== option.attribute);
  return { ...option, attribute: randomItem(eligible) };
}

export function respinSlot(
  slot: ReelSlot,
  option: Option,
  usedPlayerIds: Set<string>,
  otherBaseId: string,
): Option {
  if (slot === 'base') return respinBase(option, usedPlayerIds, otherBaseId);
  if (slot === 'donor') return respinDonor(option);
  return respinAttribute(option);
}
