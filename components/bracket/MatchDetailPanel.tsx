'use client';

import type { IMatch, IPlayer, IRound } from '@/lib/types';
import Button from '@/components/ui/Button';

interface MatchDetailPanelProps {
  match: IMatch;
  round: IRound;
  players: IPlayer[];
  onResult: (matchId: string, winnerTeam: 1 | 2) => Promise<void>;
  onUndo: (matchId: string) => Promise<void>;
  onClose: () => void;
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
  disabled = false,
  isRoundLocked = false,
}: MatchDetailPanelProps) {
  const getPlayerName = (playerId: string) => {
    return players.find((p) => p.id === playerId)?.name || '?';
  };

  const team1Player1 = getPlayerName(match.team1.playerIds[0]);
  const team1Player2 = getPlayerName(match.team1.playerIds[1]);
  const team2Player1 = getPlayerName(match.team2.playerIds[0]);
  const team2Player2 = getPlayerName(match.team2.playerIds[1]);

  const isComplete = match.winnerTeam !== null;
  const team1Won = match.winnerTeam === 1;
  const team2Won = match.winnerTeam === 2;

  return (
    <div className="w-96 h-full bg-white border-l border-border shadow-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h3 className="font-semibold">Match Details</h3>
          <p className="text-xs text-gray-500">
            {round.roundNumber === 0 ? 'Qualifier' : `Round ${round.roundNumber}`}
          </p>
        </div>
        <button
          onClick={onClose}
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
            <div className="flex-1 flex items-center justify-center px-2">
              <span className={`font-semibold text-center ${team1Won ? 'text-primary' : 'text-primary'}`}>
                {team1Player1}
              </span>
            </div>
            <div className="w-0.5 bg-primary" />
            <div className="flex-1 flex items-center justify-center px-2">
              <span className={`font-semibold text-center ${team1Won ? 'text-primary' : 'text-primary'}`}>
                {team1Player2}
              </span>
            </div>
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
            <div className="flex-1 flex items-center justify-center px-2">
              <span className={`font-semibold text-center ${team2Won ? 'text-accent' : 'text-accent'}`}>
                {team2Player1}
              </span>
            </div>
            <div className="w-0.5 bg-accent" />
            <div className="flex-1 flex items-center justify-center px-2">
              <span className={`font-semibold text-center ${team2Won ? 'text-accent' : 'text-accent'}`}>
                {team2Player2}
              </span>
            </div>
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
