import type { Dispatch } from 'react';
import type { Action, GameState } from '../state/gameReducer';
import OptionCard from './OptionCard';
import PositionPicker from './PositionPicker';
import RosterCourt from './RosterCourt';

interface RoundScreenProps {
  state: GameState;
  dispatch: Dispatch<Action>;
}

export default function RoundScreen({ state, dispatch }: RoundScreenProps) {
  const { currentOptions, pendingOption, respinsRemaining, round, team, hardMode } = state;
  if (!currentOptions) return null;

  return (
    <div className="round-screen">
      <div className="round-screen__main">
        {pendingOption ? (
          <PositionPicker
            option={pendingOption}
            team={team}
            round={round}
            hardMode={hardMode}
            onAssign={(position) => dispatch({ type: 'ASSIGN_POSITION', position })}
          />
        ) : (
          <>
            <h2>Round {round} of 5 — spin and pick one</h2>
            <p className="round-screen__respins">
              Respins remaining: <strong>{respinsRemaining}</strong> — click any box to respin it
            </p>
            <div className="options-row">
              <OptionCard
                option={currentOptions[0]}
                respinsRemaining={respinsRemaining}
                hardMode={hardMode}
                onRespin={(slot) => dispatch({ type: 'RESPIN', optionIndex: 0, slot })}
                onChoose={() => dispatch({ type: 'CHOOSE_OPTION', optionIndex: 0 })}
              />
              <OptionCard
                option={currentOptions[1]}
                respinsRemaining={respinsRemaining}
                hardMode={hardMode}
                onRespin={(slot) => dispatch({ type: 'RESPIN', optionIndex: 1, slot })}
                onChoose={() => dispatch({ type: 'CHOOSE_OPTION', optionIndex: 1 })}
              />
            </div>
          </>
        )}
      </div>

      <RosterCourt team={team} round={round} />
    </div>
  );
}
