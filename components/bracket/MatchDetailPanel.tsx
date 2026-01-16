'use client';

import { useEffect, useRef, useState } from 'react';
import type { IMatch, IPlayer, IRound } from '@/lib/types';
import { getRoundDisplayName } from '@/lib/game-logic';
import Button from '@/components/ui/Button';

interface MatchDetailPanelProps {
  match: IMatch;
  round: IRound;
  players: IPlayer[];
  onResult: (matchId: string, winnerTeam: 1 | 2) => Promise<void>;
  onUndo: (matchId: string) => Promise<void>;
  onClose: () => void;
  onPlayerClick?: (playerId: string | null) => void;
  highlightedPlayerId?: string | null;
  disabled?: boolean;
  isRoundLocked?: boolean;
}

export default function MatchDetailPanel({
  match,
  round,
  players,
  onResult,
  onUndo,
  onClose,
  onPlayerClick,
  highlightedPlayerId,
  disabled = false,
  isRoundLocked = false,
}: MatchDetailPanelProps) {
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

  const handlePlayerClick = (playerId: string) => {
    if (!onPlayerClick) return;
    // Toggle: if clicking the same player, clear the highlight
    if (highlightedPlayerId === playerId) {
      onPlayerClick(null);
    } else {
      onPlayerClick(playerId);
    }
  };

  const team1Player1Id = match.team1.playerIds[0];
  const team1Player2Id = match.team1.playerIds[1];
  const team2Player1Id = match.team2.playerIds[0];
  const team2Player2Id = match.team2.playerIds[1];

  const team1Player1 = getPlayerName(team1Player1Id);
  const team1Player2 = getPlayerName(team1Player2Id);
  const team2Player1 = getPlayerName(team2Player1Id);
  const team2Player2 = getPlayerName(team2Player2Id);

  const isComplete = match.winnerTeam !== null;
  const team1Won = match.winnerTeam === 1;
  const team2Won = match.winnerTeam === 2;

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
          <h3 className="font-semibold">Match Details</h3>
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
      <div className="flex-1 p-4 space-y-4">
        {/* Team 1 Card */}
        <div
          className={`
            rounded-xl border-2 overflow-hidden transition-all
            ${team1Won
              ? 'border-primary bg-primary/5'
              : team2Won
                ? 'border-gray-200 opacity-50'
                : 'border-primary'
            }
          `}
        >
          <div className="flex h-20">
            <button
              onClick={() => handlePlayerClick(team1Player1Id)}
              className={`flex-1 flex items-center justify-center px-2 transition-colors hover:bg-primary/10 ${
                highlightedPlayerId === team1Player1Id ? 'bg-primary/20 ring-2 ring-primary ring-inset' : ''
              }`}
            >
              <span className={`font-semibold text-center ${team1Won ? 'text-primary' : 'text-primary'}`}>
                {team1Player1}
              </span>
            </button>
            <div className="w-0.5 bg-primary" />
            <button
              onClick={() => handlePlayerClick(team1Player2Id)}
              className={`flex-1 flex items-center justify-center px-2 transition-colors hover:bg-primary/10 ${
                highlightedPlayerId === team1Player2Id ? 'bg-primary/20 ring-2 ring-primary ring-inset' : ''
              }`}
            >
              <span className={`font-semibold text-center ${team1Won ? 'text-primary' : 'text-primary'}`}>
                {team1Player2}
              </span>
            </button>
          </div>
          {team1Won && (
            <div className="bg-primary/10 text-primary text-center text-sm font-medium py-1">
              Winner
            </div>
          )}
        </div>

        {/* VS */}
        <div className="flex items-center justify-center">
          <span className="text-sm font-bold text-gray-400">VS</span>
        </div>

        {/* Team 2 Card */}
        <div
          className={`
            rounded-xl border-2 overflow-hidden transition-all
            ${team2Won
              ? 'border-accent bg-accent/5'
              : team1Won
                ? 'border-gray-200 opacity-50'
                : 'border-accent'
            }
          `}
        >
          <div className="flex h-20">
            <button
              onClick={() => handlePlayerClick(team2Player1Id)}
              className={`flex-1 flex items-center justify-center px-2 transition-colors hover:bg-accent/10 ${
                highlightedPlayerId === team2Player1Id ? 'bg-accent/20 ring-2 ring-accent ring-inset' : ''
              }`}
            >
              <span className={`font-semibold text-center ${team2Won ? 'text-accent' : 'text-accent'}`}>
                {team2Player1}
              </span>
            </button>
            <div className="w-0.5 bg-accent" />
            <button
              onClick={() => handlePlayerClick(team2Player2Id)}
              className={`flex-1 flex items-center justify-center px-2 transition-colors hover:bg-accent/10 ${
                highlightedPlayerId === team2Player2Id ? 'bg-accent/20 ring-2 ring-accent ring-inset' : ''
              }`}
            >
              <span className={`font-semibold text-center ${team2Won ? 'text-accent' : 'text-accent'}`}>
                {team2Player2}
              </span>
            </button>
          </div>
          {team2Won && (
            <div className="bg-accent/10 text-accent text-center text-sm font-medium py-1">
              Winner
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isComplete && (
          <div className="space-y-3 pt-4">
            <p className="text-sm text-gray-500 text-center">Select the winning team:</p>
            <Button
              onClick={() => onResult(match.id, 1)}
              disabled={disabled}
              className="w-full"
            >
              Team 1 Wins
            </Button>
            <Button
              variant="accent"
              onClick={() => onResult(match.id, 2)}
              disabled={disabled}
              className="w-full"
            >
              Team 2 Wins
            </Button>
          </div>
        )}

        {isComplete && (
          <div className="pt-4 space-y-3">
            <div className="text-center">
              <div className="inline-flex items-center px-3 py-1.5 bg-success/10 text-success rounded-full text-sm font-medium">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Match Complete
              </div>
            </div>
            {isRoundLocked ? (
              <div className="text-center">
                <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                  <svg className="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Round Locked
                </div>
              </div>
            ) : (
              <Button
                variant="secondary"
                onClick={() => onUndo(match.id)}
                disabled={disabled}
                className="w-full"
                size="sm"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Undo Result
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
