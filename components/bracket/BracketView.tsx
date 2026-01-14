'use client';

import type { ITournament } from '@/lib/types';
import RoundColumn from './RoundColumn';

interface BracketViewProps {
  tournament: ITournament;
  selectedMatchId: string | null;
  selectedRoundId: number | null;
  onMatchSelect: (matchId: string) => void;
  onRoundSelect: (roundNumber: number) => void;
}

export default function BracketView({
  tournament,
  selectedMatchId,
  selectedRoundId,
  onMatchSelect,
  onRoundSelect,
}: BracketViewProps) {
  return (
    <div className="flex items-start gap-2 p-8 min-w-max">
      {tournament.rounds.map((round) => (
        <RoundColumn
          key={round.roundNumber}
          round={round}
          players={tournament.players}
          isCurrentRound={round.roundNumber === tournament.currentRound}
          selectedMatchId={selectedMatchId}
          selectedRoundId={selectedRoundId}
          onMatchSelect={onMatchSelect}
          onRoundSelect={onRoundSelect}
        />
      ))}

      {/* Placeholder for next round if current round is complete */}
      {tournament.rounds.length > 0 &&
        tournament.rounds[tournament.rounds.length - 1].isComplete &&
        tournament.status === 'ACTIVE' && (
          <div className="flex flex-col items-center px-4 py-6 min-w-[220px] opacity-60">
            <div className="text-sm font-semibold mb-4 px-3 py-1 rounded-full bg-white/10 text-white border-2 border-dashed border-white/30">
              Round {tournament.currentRound + 1}
            </div>
            <div className="text-sm text-white/70 text-center">
              Waiting to start...
            </div>
          </div>
        )}
    </div>
  );
}
