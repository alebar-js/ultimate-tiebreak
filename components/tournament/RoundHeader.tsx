'use client';

import type { IRound, IPlayer } from '@/lib/types';

interface RoundHeaderProps {
  round: IRound;
  players: IPlayer[];
}

export default function RoundHeader({ round, players }: RoundHeaderProps) {
  const activePlayers = players.filter((p) => !p.isEliminated);
  const completedMatches = round.matches.filter((m) => m.winnerTeam !== null).length;
  const totalMatches = round.matches.length;

  return (
    <div className="bg-primary text-white rounded-xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold">Round {round.roundNumber}</h2>
          <p className="text-white/80 text-sm">
            {activePlayers.length} players remaining
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">
            {completedMatches} / {totalMatches} matches
          </p>
          {round.isComplete ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/20 text-sm">
              Round Complete
            </span>
          ) : (
            <span className="text-sm text-white/70">In Progress</span>
          )}
        </div>
      </div>
    </div>
  );
}
