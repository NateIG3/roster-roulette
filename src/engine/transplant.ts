import { PLAYERS_BY_ID } from '../data/players';
import type { AttributeKey } from '../data/attributes';
import type { Option } from './spin';

/** Full-replace transplant: base player's attributes, with the transplanted
 * category entirely overwritten by the donor's value in that category. */
export function resolveTransplant(option: Option): Record<AttributeKey, number> {
  const base = PLAYERS_BY_ID[option.baseId];
  const donor = PLAYERS_BY_ID[option.donorId];
  return { ...base.attributes, [option.attribute]: donor.attributes[option.attribute] };
}
