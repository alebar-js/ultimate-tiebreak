'use client';

import Link from 'next/link';
import type { ITournament } from '@/lib/types';
import Button from '@/components/ui/Button';

interface BracketHeaderProps {
  tournament: ITournament;
  onNextRound: () => Promise<void>;
  actionLoading: boolean;
}

export default function BracketHeader({
  tournament,
  onNextRound,
  actionLoading,
}: BracketHeaderProps) {
  const activePlayers = tournament.players.filter((p) => !p.isEliminated);
  const currentRound = tournament.rounds[tournament.rounds.length - 1];
  const canStartNextRound = currentRound?.isComplete && tournament.status === 'ACTIVE';

  return (
    <header className="bg-white border-b border-border px-4 py-3 flex items-center justify-between gap-4 z-20">
      {/* Left: Home + Title */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Home
        </Link>
        <div className="h-6 w-px bg-border" />
        <h1 className="font-semibold text-lg truncate max-w-xs">{tournament.name}</h1>
      </div>

      {/* Center: Round Info */}
      <div className="flex items-center gap-3">
        <div className="text-sm">
          {tournament.currentRound === 0 ? (
            <span className="font-semibold text-primary">Qualifier</span>
          ) : (
            <>
              <span className="text-gray-500">Round</span>{' '}
              <span className="font-semibold text-primary">{tournament.currentRound}</span>
            </>
          )}
        </div>
        <div className="h-4 w-px bg-border" />
        <div className="text-sm">
          <span className="font-semibold">{activePlayers.length}</span>{' '}
          <span className="text-gray-500">players left</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <span className={`text-xs px-2 py-1 rounded-full ${
          tournament.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {tournament.status}
        </span>
      </div>
    </header>
  );
}
