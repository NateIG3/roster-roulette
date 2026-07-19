import { ATTRIBUTE_KEYS, ATTRIBUTE_LABELS, POSITIONS, POSITION_LABELS, type Position } from '../data/attributes';
import { PLAYERS_BY_ID } from '../data/players';
import { resolveTransplant } from '../engine/transplant';
import type { Option } from '../engine/spin';
import type { TeamSlot } from '../engine/scoring';
import { availablePositions } from '../state/gameReducer';

interface PositionPickerProps {
  option: Option;
  team: TeamSlot[];
  round: number;
  hardMode: boolean;
  onAssign: (position: Position) => void;
}

export default function PositionPicker({ option, team, round, hardMode, onAssign }: PositionPickerProps) {
  const base = PLAYERS_BY_ID[option.baseId];
  const donor = PLAYERS_BY_ID[option.donorId];
  const finalAttributes = resolveTransplant(option);
  const available = availablePositions(team);
  const forced = available.length === 1;

  return (
    <div className="position-picker">
      <h2>Round {round}: place your player</h2>
      <p className="position-picker__combo">
        {base.name} <span className="reel-joiner reel-joiner--inline">with</span> {donor.name}'s{' '}
        {ATTRIBUTE_LABELS[option.attribute]}
      </p>

      {hardMode ? (
        <p className="position-picker__hard-mode-note">
          Hard mode — no stat breakdown. Place {base.name} on ball knowledge alone.
        </p>
      ) : (
        <div className="attribute-bars">
          {ATTRIBUTE_KEYS.map((key) => (
            <div key={key} className={`attribute-bar${key === option.attribute ? ' attribute-bar--transplant' : ''}`}>
              <span className="attribute-bar__label">{ATTRIBUTE_LABELS[key]}</span>
              <div className="attribute-bar__track">
                <div className="attribute-bar__fill" style={{ width: `${finalAttributes[key]}%` }} />
              </div>
              <span className="attribute-bar__value">{finalAttributes[key]}</span>
            </div>
          ))}
        </div>
      )}

      {forced ? (
        <p className="position-picker__forced">
          Only {POSITION_LABELS[available[0]]} is open — {base.name} is locked in there, like it or not.
        </p>
      ) : (
        <p className="position-picker__prompt">Choose a position for {base.name}:</p>
      )}

      <div className="position-picker__buttons">
        {POSITIONS.map((position) => (
          <button
            key={position}
            type="button"
            disabled={!available.includes(position)}
            onClick={() => onAssign(position)}
          >
            {position}
          </button>
        ))}
      </div>
    </div>
  );
}
