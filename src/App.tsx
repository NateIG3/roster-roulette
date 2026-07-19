import { useReducer } from 'react';
import { gameReducer, INITIAL_STATE } from './state/gameReducer';
import StartScreen from './components/StartScreen';
import RoundScreen from './components/RoundScreen';
import ResultsScreen from './components/ResultsScreen';

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  return (
    <div className="app">
      {state.screen === 'start' && <StartScreen dispatch={dispatch} />}
      {state.screen === 'round' && <RoundScreen state={state} dispatch={dispatch} />}
      {state.screen === 'results' && <ResultsScreen state={state} dispatch={dispatch} />}
    </div>
  );
}
