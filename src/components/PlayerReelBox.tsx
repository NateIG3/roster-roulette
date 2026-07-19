import { PLAYERS } from '../data/players';
import type { Player } from '../data/players';
import { useReelSpin } from '../hooks/useReelSpin';
import PlayerAvatar from './PlayerAvatar';
import ReelViewport from './ReelViewport';

interface PlayerReelBoxProps {
  player: Player;
  spinToken: string;
  accent: 'base' | 'donor';
  respinnable: boolean;
  onRespin: () => void;
}

export default function PlayerReelBox({ player, spinToken, accent, respinnable, onRespin }: PlayerReelBoxProps) {
  const { spinning, sequence, duration, settle } = useReelSpin<Player>(player, spinToken, PLAYERS);

  return (
    <button
      type="button"
      className={`reel-box reel-box--${accent}${spinning ? ' is-spinning' : ''}${respinnable ? '' : ' is-locked'}`}
      onClick={() => respinnable && onRespin()}
    >
      {respinnable && (
        <span className="reel-box__respin-hint" aria-hidden="true">
          ↻
        </span>
      )}
      <ReelViewport
        spinning={spinning}
        sequence={sequence}
        duration={duration}
        onSettle={settle}
        renderRow={(pl) => (
          <>
            <PlayerAvatar name={pl.name} />
            <span className="reel-box__label">{pl.name}</span>
          </>
        )}
      />
    </button>
  );
}
