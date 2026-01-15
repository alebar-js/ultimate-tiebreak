'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateDemoTournamentMutation } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function DemoTournamentForm() {
  const router = useRouter();
  const [playerCount, setPlayerCount] = useState('16');

  const { mutate, error, isPending } = useCreateDemoTournamentMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const count = parseInt(playerCount);
    if (isNaN(count) || count < 4 || count > 128) {
      return;
    }

    mutate(count, {
      onSuccess: ({ tournamentId, password }) => {
        localStorage.setItem(`tournament_${tournamentId}_password`, password);
        router.push(`/tournament/${tournamentId}`);
      },
    });
  };

  const handleBlur = () => {
    const count = parseInt(playerCount);
    if (isNaN(count) || count < 4) {
      setPlayerCount('4');
    } else if (count > 128) {
      setPlayerCount('128');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerCount(e.target.value);
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Create Demo Tournament</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Number of Players"
          type="number"
          min="4"
          max="128"
          placeholder="Enter number of players (4-128)"
          value={playerCount}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isPending}
        />
        <div className="text-sm text-gray-500">
          Creates a tournament with {playerCount || '0'} randomly generated players.
          Perfect for testing the bracket system.
        </div>
        {error && (
          <p className="text-sm text-error">{error.message}</p>
        )}
        <Button type="submit" variant="accent" loading={isPending} className="w-full">
          Create Demo Tournament
        </Button>
      </form>
    </Card>
  );
}
