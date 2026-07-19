import { POSITIONS, type Position } from '../data/attributes';
import { generateRoundOptions, respinSlot, type Option, type ReelSlot } from '../engine/spin';
import { resolveTransplant } from '../engine/transplant';
import { gradeTeam, type GradeResult, type TeamSlot } from '../engine/scoring';

export type Screen = 'start' | 'round' | 'results';

export interface GameState {
  screen: Screen;
  round: number; // 1-5
  respinsRemaining: number;
  currentOptions: [Option, Option] | null;
  pendingOption: Option | null; // set once a player chooses an option, cleared once a position is assigned
  team: TeamSlot[];
  usedPlayerIds: Set<string>;
  result: GradeResult | null;
  hardMode: boolean;
}

export type Action =
  | { type: 'START_GAME'; hardMode: boolean }
  | { type: 'RESPIN'; optionIndex: 0 | 1; slot: ReelSlot }
  | { type: 'CHOOSE_OPTION'; optionIndex: 0 | 1 }
  | { type: 'ASSIGN_POSITION'; position: Position }
  | { type: 'PLAY_AGAIN' };

export const TOTAL_ROUNDS = 5;
export const TOTAL_RESPINS = 2;

export const INITIAL_STATE: GameState = {
  screen: 'start',
  round: 1,
  respinsRemaining: TOTAL_RESPINS,
  currentOptions: null,
  pendingOption: null,
  team: [],
  usedPlayerIds: new Set(),
  result: null,
  hardMode: false,
};

export function availablePositions(team: TeamSlot[]): Position[] {
  const filled = new Set(team.map((slot) => slot.position));
  return POSITIONS.filter((position) => !filled.has(position));
}

function startRound(state: GameState, round: number): GameState {
  return {
    ...state,
    screen: 'round',
    round,
    currentOptions: generateRoundOptions(state.usedPlayerIds),
    pendingOption: null,
  };
}

function freshGame(hardMode: boolean): GameState {
  return startRound(
    { ...INITIAL_STATE, team: [], usedPlayerIds: new Set(), respinsRemaining: TOTAL_RESPINS, hardMode },
    1,
  );
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START_GAME':
      return freshGame(action.hardMode);

    case 'PLAY_AGAIN':
      // Hard mode persists across replays without asking again.
      return freshGame(state.hardMode);

    case 'RESPIN': {
      if (state.respinsRemaining <= 0 || !state.currentOptions) return state;
      const otherIndex = action.optionIndex === 0 ? 1 : 0;
      const options: [Option, Option] = [...state.currentOptions];
      options[action.optionIndex] = respinSlot(
        action.slot,
        options[action.optionIndex],
        state.usedPlayerIds,
        options[otherIndex].baseId,
      );
      return { ...state, currentOptions: options, respinsRemaining: state.respinsRemaining - 1 };
    }

    case 'CHOOSE_OPTION': {
      if (!state.currentOptions) return state;
      return { ...state, pendingOption: state.currentOptions[action.optionIndex] };
    }

    case 'ASSIGN_POSITION': {
      if (!state.pendingOption) return state;
      if (state.team.some((slot) => slot.position === action.position)) return state;

      const option = state.pendingOption;
      const newSlot: TeamSlot = {
        position: action.position,
        option,
        finalAttributes: resolveTransplant(option),
      };
      const team = [...state.team, newSlot];
      const usedPlayerIds = new Set(state.usedPlayerIds);
      usedPlayerIds.add(option.baseId);

      if (team.length >= TOTAL_ROUNDS) {
        const result = gradeTeam(team);
        return {
          ...state,
          screen: 'results',
          team,
          usedPlayerIds,
          pendingOption: null,
          currentOptions: null,
          result,
        };
      }
      return startRound({ ...state, team, usedPlayerIds }, state.round + 1);
    }

    default:
      return state;
  }
}
