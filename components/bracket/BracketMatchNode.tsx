'use client';

import type { IMatch, IPlayer } from '@/lib/types';

interface BracketMatchNodeProps {
  match: IMatch;
  players: IPlayer[];
  isSelected: boolean;
  highlightedPlayerId?: string | null;
  onClick: () => void;
}

const TeamNameDisplay = ({ teamNames }: { teamNames: string[] }) => {
  return <>
    {teamNames.map((name, index) => (
      <div key={index} className="text-sm font-medium truncate">
        {name}
      </div>
    ))}
  </>
}

export default function BracketMatchNode({
  match,
  players,
  isSelected,
  highlightedPlayerId,
  onClick,
}: BracketMatchNodeProps) {
  const getPlayerNames = (playerIds: string[]) => {
    return playerIds
      .map((id) => players.find((p) => p.id === id)?.name || '?')
  };

  const team1Names = getPlayerNames(match.team1.playerIds);
  const team2Names = getPlayerNames(match.team2.playerIds);

  const isComplete = match.winnerTeam !== null;
  const team1Won = match.winnerTeam === 1;
  const team2Won = match.winnerTeam === 2;

  // Check if the highlighted player is in this match
  const team1HasHighlightedPlayer = highlightedPlayerId
    ? match.team1.playerIds.includes(highlightedPlayerId)
    : false;
  const team2HasHighlightedPlayer = highlightedPlayerId
    ? match.team2.playerIds.includes(highlightedPlayerId)
    : false;
  const matchHasHighlightedPlayer = team1HasHighlightedPlayer || team2HasHighlightedPlayer;

  return (
    <button
      onClick={onClick}
      className={`
        match-node w-48 text-left rounded-lg border-2 transition-all cursor-pointer
        hover:shadow-lg hover:scale-[1.02]
        ${isSelected
          ? 'border-accent shadow-lg ring-2 ring-accent/50'
          : matchHasHighlightedPlayer
            ? 'border-accent shadow-lg ring-2 ring-accent/30'
            : 'border-white/20 hover:border-white/40'
        }
        ${!isComplete ? 'bg-white' : 'bg-white/90'}
      `}
    >
      {/* Team 1 */}
      <div
        className={`
          px-3 py-2 text-sm font-medium truncate rounded-t-md relative
          ${team1Won && !team1HasHighlightedPlayer
            ? 'bg-primary text-white'
            : team2Won && !team1HasHighlightedPlayer
              ? 'text-gray-400 line-through'
              : team1HasHighlightedPlayer
                ? 'text-accent font-bold'
                : 'text-foreground'
          }
        `}
      >
        <TeamNameDisplay teamNames={team1Names} />
        {team1HasHighlightedPlayer && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-accent rounded-full" />
        )}
      </div>

      {/* Divider */}
      <div className={`h-px ${matchHasHighlightedPlayer ? 'bg-accent/30' : 'bg-border'}`} />

      {/* Team 2 */}
      <div
        className={`
          px-3 py-2 text-sm font-medium truncate rounded-b-md relative
          ${team2Won && !team2HasHighlightedPlayer
            ? 'bg-primary text-white'
            : team1Won && !team2HasHighlightedPlayer
              ? 'text-gray-400 line-through'
              : team2HasHighlightedPlayer
                ? 'text-accent font-bold'
                : 'text-foreground'
          }
        `}
      >
        <TeamNameDisplay teamNames={team2Names} />
        {team2HasHighlightedPlayer && (
          <div className="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-accent rounded-full" />
        )}
      </div>
    </button>
  );
}
