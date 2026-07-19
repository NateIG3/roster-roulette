import { POSITIONS } from '../data/attributes';
import { PLAYERS_BY_ID } from '../data/players';
import type { TeamSlot } from '../engine/scoring';

interface TeamSidebarProps {
  team: TeamSlot[];
  round: number;
}

export default function TeamSidebar({ team, round }: TeamSidebarProps) {
  return (
    <aside className="team-sidebar">
      <h3>Your Roster</h3>
      <p className="team-sidebar__round">Round {round} of 5</p>
      <ul>
        {POSITIONS.map((position) => {
          const slot = team.find((s) => s.position === position);
          return (
            <li key={position} className={slot ? 'filled' : 'empty'}>
              <span className="position-tag">{position}</span>
              <span>{slot ? PLAYERS_BY_ID[slot.option.baseId].name : 'Open'}</span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
