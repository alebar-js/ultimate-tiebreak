'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFindTournamentMutation } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function ContinueTournamentForm() {
  const router = useRouter();
  const [tournamentName, setTournamentName] = useState('');
  const [password, setPassword] = useState('');

  const { mutate, error, isPending } = useFindTournamentMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tournamentName.trim()) {
      return;
    }

    if (!password) {
      return;
    }

    mutate(
      { name: tournamentName, password },
      {
        onSuccess: (tournament) => {
          localStorage.setItem(`tournament_${tournament._id}_password`, password);
          router.push(`/tournament/${tournament._id}`);
        },
      }
    );
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Continue Existing Tournament</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Tournament Name"
          placeholder="Enter your tournament name"
          value={tournamentName}
          onChange={(e) => setTournamentName(e.target.value)}
          disabled={isPending}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter the tournament password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isPending}
        />
        {error && (
          <p className="text-sm text-error">{error.message}</p>
        )}
        <Button type="submit" variant="secondary" loading={isPending} className="w-full">
          Continue Tournament
        </Button>
      </form>
    </Card>
  );
}
