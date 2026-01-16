'use client';

import type { ITournament } from '@/lib/types';
import RoundColumn from './RoundColumn';

interface BracketViewProps {
  tournament: ITournament;
  selectedMatchId: string | null;
  selectedRoundId: number | null;
  highlightedPlayerId?: string | null;
  onMatchSelect: (matchId: string) => void;
  onRoundSelect: (roundNumber: number) => void;
  onStartNextRound?: () => void;
}

export default function BracketView({
  tournament,
  selectedMatchId,
  selectedRoundId,
  highlightedPlayerId,
  onMatchSelect,
  onRoundSelect,
  onStartNextRound,
}: BracketViewProps) {
  return (
    <div className="flex items-center gap-2 p-8 min-w-max min-h-full">
      {tournament.rounds.map((round) => (
        <RoundColumn
          key={round.roundNumber}
          round={round}
          players={tournament.players}
          isCurrentRound={round.roundNumber === tournament.currentRound}
          selectedMatchId={selectedMatchId}
          selectedRoundId={selectedRoundId}
          highlightedPlayerId={highlightedPlayerId}
          onMatchSelect={onMatchSelect}
          onRoundSelect={onRoundSelect}
        />
      ))}

      {/* Placeholder for next round if current round is complete */}
      {tournament.rounds.length > 0 &&
        tournament.rounds[tournament.rounds.length - 1].isComplete &&
        tournament.status === 'ACTIVE' && (
          <div className="flex flex-col items-center justify-center px-4 py-6 min-w-[220px]">
            <div className="text-sm font-semibold mb-4 px-3 py-1 rounded-full bg-white/10 text-white border-2 border-dashed border-white/30 opacity-60">
              Next Round
            </div>
            {onStartNextRound ? (
              <button
                onClick={onStartNextRound}
                className="px-4 py-2 bg-white text-primary rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm"
              >
                Start Next Round
              </button>
            ) : (
              <div className="text-sm text-white/70 text-center opacity-60">
                Waiting to start...
              </div>
            )}
          </div>
        )}
    </div>
  );
}
