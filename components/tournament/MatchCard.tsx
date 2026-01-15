'use client';

import type { IMatch, IPlayer } from '@/lib/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface MatchCardProps {
  match: IMatch;
  players: IPlayer[];
  onResult: (matchId: string, winnerTeam: 1 | 2) => Promise<void>;
  disabled?: boolean;
}

export default function MatchCard({ match, players, onResult, disabled = false }: MatchCardProps) {
  const getPlayerNames = (playerIds: string[]) => {
    return playerIds
      .map((id) => players.find((p) => p.id === id)?.name || 'Unknown')
      .join(' \n');
  };

  const team1Names = getPlayerNames(match.team1.playerIds);
  const team2Names = getPlayerNames(match.team2.playerIds);

  const isComplete = match.winnerTeam !== null;
  const team1Won = match.winnerTeam === 1;
  const team2Won = match.winnerTeam === 2;

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="p-4">
        <div className="flex flex-col gap-3">
          {/* Team 1 */}
          <div
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              team1Won
                ? 'bg-success/10 border-2 border-success'
                : team2Won
                ? 'bg-muted opacity-60'
                : 'bg-muted'
            }`}
          >
            <span className={`font-medium ${team1Won ? 'text-success' : ''}`}>
              {team1Names}
            </span>
            {team1Won && (
              <span className="text-success text-sm font-semibold">Winner</span>
            )}
          </div>

          {/* VS Separator */}
          <div className="flex items-center justify-center">
            <span className="text-sm font-bold text-gray-400">VS</span>
          </div>

          {/* Team 2 */}
          <div
            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
              team2Won
                ? 'bg-success/10 border-2 border-success'
                : team1Won
                ? 'bg-muted opacity-60'
                : 'bg-muted'
            }`}
          >
            <span className={`font-medium ${team2Won ? 'text-success' : ''}`}>
              {team2Names}
            </span>
            {team2Won && (
              <span className="text-success text-sm font-semibold">Winner</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {!isComplete && (
        <div className="border-t border-border p-3 bg-muted/50">
          <p className="text-xs text-gray-500 text-center mb-2">Select the winning team:</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              onClick={() => onResult(match.id, 1)}
              disabled={disabled}
            >
              Team 1 Wins
            </Button>
            <Button
              size="sm"
              variant="accent"
              onClick={() => onResult(match.id, 2)}
              disabled={disabled}
            >
              Team 2 Wins
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
