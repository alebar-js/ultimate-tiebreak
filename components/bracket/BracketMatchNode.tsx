'use client';

import type { IMatch, IPlayer } from '@/lib/types';

interface BracketMatchNodeProps {
  match: IMatch;
  players: IPlayer[];
  isSelected: boolean;
  onClick: () => void;
}

export default function BracketMatchNode({
  match,
  players,
  isSelected,
  onClick,
}: BracketMatchNodeProps) {
  const getPlayerNames = (playerIds: string[]) => {
    return playerIds
      .map((id) => players.find((p) => p.id === id)?.name || '?')
      .join(' & ');
  };

  const team1Names = getPlayerNames(match.team1.playerIds);
  const team2Names = getPlayerNames(match.team2.playerIds);

  const isComplete = match.winnerTeam !== null;
  const team1Won = match.winnerTeam === 1;
  const team2Won = match.winnerTeam === 2;

  return (
    <button
      onClick={onClick}
      className={`
        match-node w-48 text-left rounded-lg border-2 transition-all cursor-pointer
        hover:shadow-lg hover:scale-[1.02]
        ${isSelected
          ? 'border-accent shadow-lg ring-2 ring-accent/50'
          : 'border-white/20 hover:border-white/40'
        }
        ${!isComplete ? 'bg-white' : 'bg-white/90'}
      `}
    >
      {/* Team 1 */}
      <div
        className={`
          px-3 py-2 text-sm font-medium truncate rounded-t-md
          ${team1Won
            ? 'bg-primary text-white'
            : team2Won
              ? 'text-gray-400 line-through'
              : 'text-foreground'
          }
        `}
      >
        {team1Names}
      </div>

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Team 2 */}
      <div
        className={`
          px-3 py-2 text-sm font-medium truncate rounded-b-md
          ${team2Won
            ? 'bg-primary text-white'
            : team1Won
              ? 'text-gray-400 line-through'
              : 'text-foreground'
          }
        `}
      >
        {team2Names}
      </div>
    </button>
  );
}
