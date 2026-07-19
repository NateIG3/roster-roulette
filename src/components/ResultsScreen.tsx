import type { Dispatch } from 'react';
import { ATTRIBUTE_LABELS, POSITIONS } from '../data/attributes';
import { PLAYERS_BY_ID } from '../data/players';
import type { Action, GameState } from '../state/gameReducer';

interface ResultsScreenProps {
  state: GameState;
  dispatch: Dispatch<Action>;
}

export default function ResultsScreen({ state, dispatch }: ResultsScreenProps) {
  const { team, result } = state;
  if (!result) return null;

  return (
    <div className="results-screen">
      <p className="results-screen__eyebrow">Final Record</p>
      <h1 className={result.wins === 82 ? 'results-screen__record results-screen__record--perfect' : 'results-screen__record'}>
        {result.wins}-{result.losses}
      </h1>
      <p className="results-screen__explanation">{result.explanation}</p>

      <ul className="results-screen__roster">
        {POSITIONS.map((position) => {
          const slot = team.find((s) => s.position === position)!;
          const base = PLAYERS_BY_ID[slot.option.baseId];
          const donor = PLAYERS_BY_ID[slot.option.donorId];
          return (
            <li key={position}>
              <span className="position-tag">{position}</span>
              <span className="results-screen__combo">
                <strong>{base.name}</strong> <span className="reel-joiner reel-joiner--inline">with</span>{' '}
                <strong>{donor.name}'s</strong> {ATTRIBUTE_LABELS[slot.option.attribute]}
              </span>
            </li>
          );
        })}
      </ul>

      <button type="button" className="results-screen__play-again" onClick={() => dispatch({ type: 'PLAY_AGAIN' })}>
        Play Again
      </button>
    </div>
  );
}
