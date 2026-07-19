import { PLAYERS_BY_ID } from '../data/players';
import { isMythicalOption } from '../engine/scoring';
import type { Option, ReelSlot } from '../engine/spin';
import PlayerReelBox from './PlayerReelBox';
import AttributeReelBox from './AttributeReelBox';

interface OptionCardProps {
  option: Option;
  respinsRemaining: number;
  hardMode: boolean;
  onRespin: (slot: ReelSlot) => void;
  onChoose: () => void;
}

export default function OptionCard({ option, respinsRemaining, hardMode, onRespin, onChoose }: OptionCardProps) {
  const base = PLAYERS_BY_ID[option.baseId];
  const donor = PLAYERS_BY_ID[option.donorId];
  const donorValue = donor.attributes[option.attribute];
  const canRespin = respinsRemaining > 0;
  const mythical = !hardMode && isMythicalOption(option);

  return (
    <div className={`option-card${mythical ? ' option-card--mythical' : ''}`}>
      {mythical && <span className="option-card__mythical-badge">★ Mythical</span>}
      <PlayerReelBox
        player={base}
        spinToken={option.baseId}
        accent="base"
        respinnable={canRespin}
        onRespin={() => onRespin('base')}
      />
      <span className="reel-joiner">with</span>
      <PlayerReelBox
        player={donor}
        spinToken={option.donorId}
        accent="donor"
        respinnable={canRespin}
        onRespin={() => onRespin('donor')}
      />
      <span className="reel-joiner reel-joiner--tight">'s</span>
      <AttributeReelBox
        attribute={option.attribute}
        spinToken={option.attribute}
        respinnable={canRespin}
        onRespin={() => onRespin('attribute')}
        valuePreview={hardMode ? undefined : donorValue}
      />
      <button type="button" className="option-card__choose" onClick={onChoose}>
        Draft
      </button>
    </div>
  );
}
