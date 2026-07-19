import { useState, type Dispatch } from 'react';
import type { Action } from '../state/gameReducer';

interface StartScreenProps {
  dispatch: Dispatch<Action>;
}

export default function StartScreen({ dispatch }: StartScreenProps) {
  const [hardMode, setHardMode] = useState(false);

  return (
    <div className="start-screen">
      <h1>Roster Roulette</h1>
      <p>
        Draft a 5-man lineup from known current NBA starters and specialists, plus a handful of legends in
        their prime. Each round you'll spin two possible picks — a base player with one attribute swapped
        out for a donor player's rating in that category. Choose your combo, drop them into a position, and
        see how close your team gets to a perfect 82-0 season.
      </p>
      <ul className="start-screen__rules">
        <li>5 rounds, 5 positions — each position filled exactly once.</li>
        <li>2 respins for the whole game — just click a box to respin it, any round.</li>
        <li>The grading formula is fixed and unforgiving — you'll need real ball knowledge to get close to 82-0.</li>
      </ul>

      <label className="hard-mode-toggle">
        <input
          type="checkbox"
          checked={hardMode}
          onChange={(event) => setHardMode(event.target.checked)}
        />
        <span className="hard-mode-toggle__track">
          <span className="hard-mode-toggle__thumb" />
        </span>
        <span className="hard-mode-toggle__text">
          <strong>Hard Mode</strong>
          <span>Hide stat breakdowns before you place a player — pure ball knowledge.</span>
        </span>
      </label>

      <button type="button" className="start-screen__cta" onClick={() => dispatch({ type: 'START_GAME', hardMode })}>
        Start
      </button>
    </div>
  );
}
