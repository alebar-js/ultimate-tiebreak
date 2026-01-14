'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateTournamentMutation } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function CreateTournamentForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const { mutate, error, isPending } = useCreateTournamentMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    if (!password) {
      return;
    }

    mutate(
      { name, password },
      {
        onSuccess: ({ tournamentId }) => {
          localStorage.setItem(`tournament_${tournamentId}_password`, password);
          router.push(`/tournament/${tournamentId}`);
        },
      }
    );
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Create New Tournament</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Tournament Name"
          placeholder="e.g., Summer Championship 2025"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isPending}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter a password to protect your tournament"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isPending}
        />
        {error && (
          <p className="text-sm text-error">{error.message}</p>
        )}
        <Button type="submit" loading={isPending} className="w-full">
          Create Tournament
        </Button>
      </form>
    </Card>
  );
}
