'use client';

import { useEffect, useRef, useState } from 'react';
import type { IRound, IPlayer } from '@/lib/types';
import { getRoundDisplayName } from '@/lib/game-logic';
import Button from '@/components/ui/Button';

interface RoundDetailPanelProps {
  round: IRound;
  players: IPlayer[];
  onDelete: (roundNumber: number) => Promise<void>;
  onRedraw: (roundNumber: number) => Promise<void>;
  onClose: () => void;
  disabled?: boolean;
  isCurrentRound?: boolean;
}

export default function RoundDetailPanel({
  round,
  players,
  onDelete,
  onRedraw,
  onClose,
  disabled = false,
  isCurrentRound = false,
}: RoundDetailPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const closeTimeoutRef = useRef<number | null>(null);

  const closeWithAnimation = () => {
    setIsOpen(false);

    if (closeTimeoutRef.current !== null) {
      window.clearTimeout(closeTimeoutRef.current);
    }

    closeTimeoutRef.current = window.setTimeout(() => {
      onClose();
    }, 200);
  };

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => setIsOpen(true));
    return () => window.cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      if (containerRef.current && !containerRef.current.contains(target)) {
        // Check if clicking on another bracket element (match node or round badge)
        const targetElement = target as Element;
        const isClickOnBracketElement =
          targetElement.closest?.('.match-node') ||
          targetElement.closest?.('.round-badge');

        if (isClickOnBracketElement) {
          // Don't close - let the parent handle the selection change
          // The panel will update to show the new match/round details
          return;
        }

        closeWithAnimation();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const getPlayerName = (playerId: string) => {
    return players.find((p) => p.id === playerId)?.name || '?';
  };

  const hasCompletedMatches = round.matches.some(m => m.winnerTeam !== null);
  const hasAnyMatches = round.matches.length > 0;
  
  const canDelete = isCurrentRound && !hasCompletedMatches;
  const canRedraw = isCurrentRound && !hasCompletedMatches;

  return (
    <div
      ref={containerRef}
      className={
        `w-96 h-full bg-white border-l border-border shadow-xl flex flex-col ` +
        `transform transition-transform duration-200 ease-out ` +
        (isOpen ? 'translate-x-0' : 'translate-x-full')
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="font-semibold">Round Details</h3>
          <p className="text-xs text-gray-500">
            {getRoundDisplayName(round)}
          </p>
        </div>
        <button
          onClick={closeWithAnimation}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-gray-500 hover:text-foreground"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Round Status */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Status</span>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              round.isComplete 
                ? 'bg-success/10 text-success' 
                : hasCompletedMatches
                  ? 'bg-warning/10 text-warning'
                  : 'bg-gray-100 text-gray-600'
            }`}>
              {round.isComplete ? 'Complete' : hasCompletedMatches ? 'In Progress' : 'Not Started'}
            </span>
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <div>Matches: {round.matches.length}</div>
            <div>Byes: {round.byes.length}</div>
            <div>Completed: {round.matches.filter(m => m.winnerTeam !== null).length}/{round.matches.length}</div>
          </div>
        </div>

        {/* Matches */}
        {hasAnyMatches && (
          <div>
            <h4 className="text-sm font-medium mb-2">Matches</h4>
            <div className="space-y-2">
              {round.matches.map((match, index) => (
                <div key={match.id} className="p-2 bg-gray-50 rounded-lg text-xs">
                  <div className="font-medium mb-1">Match {index + 1}</div>
                  <div className="space-y-1">
                    <div className={`flex justify-between ${
                      match.winnerTeam === 1 ? 'text-primary font-medium' : 'text-gray-600'
                    }`}>
                      <span>{getPlayerName(match.team1.playerIds[0])} & {getPlayerName(match.team1.playerIds[1])}</span>
                      {match.winnerTeam === 1 && <span>✓</span>}
                    </div>
                    <div className={`flex justify-between ${
                      match.winnerTeam === 2 ? 'text-accent font-medium' : 'text-gray-600'
                    }`}>
                      <span>{getPlayerName(match.team2.playerIds[0])} & {getPlayerName(match.team2.playerIds[1])}</span>
                      {match.winnerTeam === 2 && <span>✓</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Byes */}
        {round.byes.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Byes</h4>
            <div className="flex flex-wrap gap-1">
              {round.byes.map((playerId) => (
                <span key={playerId} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  {getPlayerName(playerId)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-4 border-t border-border">
          {canRedraw && (
            <Button
              variant="secondary"
              onClick={() => onRedraw(round.roundNumber)}
              disabled={disabled}
              className="w-full"
              size="sm"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Re-draw Teams
            </Button>
          )}
          
          {canDelete && (
            <Button
              variant="danger"
              onClick={() => onDelete(round.roundNumber)}
              disabled={disabled}
              className="w-full"
              size="sm"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Round
            </Button>
          )}

          {!isCurrentRound && (
            <div className="text-center">
              <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Round Locked
              </div>
            </div>
          )}

          {isCurrentRound && hasCompletedMatches && (
            <div className="text-center">
              <div className="inline-flex items-center px-3 py-1.5 bg-warning/10 text-warning rounded-full text-xs font-medium">
                <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Cannot modify round with completed matches
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
