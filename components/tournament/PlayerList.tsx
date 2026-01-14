'use client';

import type { IPlayer } from '@/lib/types';
import Card from '@/components/ui/Card';

interface PlayerListProps {
  players: IPlayer[];
  onRemove?: (playerId: string) => void;
  disabled?: boolean;
  showStatus?: boolean;
}

export default function PlayerList({ players, onRemove, disabled = false, showStatus = false }: PlayerListProps) {
  const activePlayers = players.filter((p) => !p.isEliminated);
  const eliminatedPlayers = players.filter((p) => p.isEliminated);

  if (players.length === 0) {
    return (
      <Card className="text-center py-8">
        <p className="text-gray-500">No players registered yet.</p>
        <p className="text-sm text-gray-400 mt-1">Add players above to get started.</p>
      </Card>
    );
  }

  return (
    <Card padding="none">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold">
          Players ({showStatus ? `${activePlayers.length} active` : players.length})
        </h3>
      </div>
      <ul className="divide-y divide-border max-h-80 overflow-y-auto">
        {(showStatus ? activePlayers : players).map((player) => (
          <li
            key={player.id}
            className="flex items-center justify-between px-4 py-3"
          >
            <span className="font-medium">{player.name}</span>
            {onRemove && !disabled && (
              <button
                onClick={() => onRemove(player.id)}
                className="text-sm text-error hover:text-red-700 transition-colors"
                disabled={disabled}
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
      {showStatus && eliminatedPlayers.length > 0 && (
        <details className="border-t border-border">
          <summary className="px-4 py-3 cursor-pointer text-sm text-gray-500 hover:bg-muted">
            Eliminated ({eliminatedPlayers.length})
          </summary>
          <ul className="divide-y divide-border bg-muted">
            {eliminatedPlayers.map((player) => (
              <li
                key={player.id}
                className="px-4 py-2 text-sm text-gray-500 line-through"
              >
                {player.name}
              </li>
            ))}
          </ul>
        </details>
      )}
    </Card>
  );
}
