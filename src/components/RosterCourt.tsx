import { ATTRIBUTE_LABELS, POSITIONS, type Position } from '../data/attributes';
import { PLAYERS_BY_ID } from '../data/players';
import type { TeamSlot } from '../engine/scoring';
import PlayerAvatar from './PlayerAvatar';

interface RosterCourtProps {
  team: TeamSlot[];
  round: number;
}

// Percentage coordinates over the court SVG (viewBox 0 0 400 380), oriented
// with the half-court line at the top and the baseline/hoop at the bottom:
// PG/SG sit in the backcourt (top, furthest from the hoop), SF/PF/C sit in
// the frontcourt (bottom, near the rim).
const COURT_SPOTS: Record<Position, { left: string; top: string }> = {
  PG: { left: '50%', top: '14%' },
  SG: { left: '80%', top: '36%' },
  SF: { left: '20%', top: '36%' },
  PF: { left: '68%', top: '76%' },
  C: { left: '50%', top: '88%' },
};

export default function RosterCourt({ team, round }: RosterCourtProps) {
  return (
    <div className="roster-court">
      <div className="roster-court__header">
        <h3>Your Roster</h3>
        <p className="roster-court__round">Round {round} of 5</p>
      </div>

      <div className="court">
        <svg className="court__diagram" viewBox="0 0 400 380" preserveAspectRatio="none" aria-hidden="true">
          {/* half-court line, with a hint of the center circle */}
          <line x1="10" y1="10" x2="390" y2="10" />
          <path d="M 175 10 A 25 25 0 0 0 225 10" fill="none" />

          {/* three-point line, bulging toward half court, hoop at the bottom */}
          <path d="M 45 355 A 155 155 0 0 1 355 355" fill="none" />

          {/* key / paint + free-throw circle */}
          <rect x="150" y="270" width="100" height="90" fill="none" />
          <circle cx="200" cy="270" r="38" fill="none" />

          {/* backboard + hoop */}
          <line x1="178" y1="345" x2="222" y2="345" />
          <circle cx="200" cy="357" r="4" />
        </svg>

        <span className="court__zone-label court__zone-label--back">Backcourt</span>
        <span className="court__zone-label court__zone-label--front">Frontcourt</span>

        {POSITIONS.map((position) => {
          const slot = team.find((s) => s.position === position);
          const spot = COURT_SPOTS[position];
          const base = slot ? PLAYERS_BY_ID[slot.option.baseId] : null;
          const donor = slot ? PLAYERS_BY_ID[slot.option.donorId] : null;

          return (
            <div
              key={position}
              className={`court__spot${slot ? ' filled' : ' empty'}`}
              style={{ left: spot.left, top: spot.top }}
            >
              <span className="position-tag">{position}</span>
              {base && donor && slot ? (
                <>
                  <PlayerAvatar name={base.name} />
                  <span className="court__spot-name">{base.name}</span>
                  <span className="court__spot-transplant">
                    +{ATTRIBUTE_LABELS[slot.option.attribute]} from {donor.name}
                  </span>
                </>
              ) : (
                <span className="court__spot-name court__spot-name--empty">Open</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
