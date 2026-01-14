'use client';

import type { IPlayer } from '@/lib/types';
import Card from '@/components/ui/Card';

interface ByesListProps {
  byePlayerIds: string[];
  players: IPlayer[];
}

export default function ByesList({ byePlayerIds, players }: ByesListProps) {
  if (byePlayerIds.length === 0) {
    return null;
  }

  const byePlayers = byePlayerIds
    .map((id) => players.find((p) => p.id === id))
    .filter((p): p is IPlayer => p !== undefined);

  return (
    <Card>
      <h3 className="font-semibold mb-3 text-accent">
        Bye This Round ({byePlayers.length})
      </h3>
      <p className="text-sm text-gray-500 mb-3">
        These players automatically advance to the next round.
      </p>
      <div className="flex flex-wrap gap-2">
        {byePlayers.map((player) => (
          <span
            key={player.id}
            className="inline-flex items-center px-3 py-1.5 rounded-full bg-accent/10 text-accent font-medium text-sm"
          >
            {player.name}
          </span>
        ))}
      </div>
    </Card>
  );
}
