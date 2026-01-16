'use client';

import type { IRound, IPlayer } from '@/lib/types';
import { getRoundDisplayName } from '@/lib/game-logic';
import BracketMatchNode from './BracketMatchNode';

interface RoundColumnProps {
  round: IRound;
  players: IPlayer[];
  isCurrentRound: boolean;
  selectedMatchId: string | null;
  selectedRoundId: number | null;
  highlightedPlayerId?: string | null;
  onMatchSelect: (matchId: string) => void;
  onRoundSelect: (roundNumber: number) => void;
}

export default function RoundColumn({
  round,
  players,
  isCurrentRound,
  selectedMatchId,
  selectedRoundId,
  highlightedPlayerId,
  onMatchSelect,
  onRoundSelect,
}: RoundColumnProps) {
  return (
    <div
      className={`
        flex flex-col items-center px-4 py-6 min-w-[220px]
        ${isCurrentRound ? 'bg-white/10 rounded-xl' : ''}
      `}
    >
      {/* Round Header */}
      <button
        onClick={() => onRoundSelect(round.roundNumber)}
        className={`
          round-badge text-sm font-semibold mb-4 px-3 py-1 rounded-full transition-all
          hover:scale-105 active:scale-95 cursor-pointer
          ${selectedRoundId === round.roundNumber
            ? 'ring-2 ring-white ring-offset-2 ring-offset-primary'
            : ''
          }
          ${isCurrentRound
            ? 'bg-white text-primary hover:bg-gray-100'
            : round.isComplete
              ? 'bg-white/80 text-primary/70 hover:bg-white/90'
              : 'bg-white/40 text-white hover:bg-white/50'
          }
        `}
      >
        {getRoundDisplayName(round)}
        {round.isComplete && !isCurrentRound && (
          <span className="ml-1 opacity-60">✓</span>
        )}
      </button>

      {/* Matches */}
      <div className="flex flex-col gap-4">
        {round.matches.map((match) => (
          <BracketMatchNode
            key={match.id}
            match={match}
            players={players}
            isSelected={selectedMatchId === match.id}
            highlightedPlayerId={highlightedPlayerId}
            onClick={() => onMatchSelect(match.id)}
          />
        ))}
      </div>
    </div>
  );
}
