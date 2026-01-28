'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCreateTournamentMutation } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import SignInButton from '@/components/auth/SignInButton';

export default function CreateTournamentForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const { mutate, error, isPending } = useCreateTournamentMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    if (name.trim().length < 3) {
      return;
    }

    if (password.length < 4) {
      return;
    }

    mutate(
      { name: name.trim(), password },
      {
        onSuccess: ({ tournamentId }) => {
          localStorage.setItem(`tournament_${tournamentId}_password`, password);
          router.push(`/tournament/${tournamentId}`);
        },
      }
    );
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Enforce 128 character limit
    if (value.length <= 128) {
      setName(value);
    }
  };

  // Show loading state while checking auth
  if (status === 'loading') {
    return (
      <Card>
        <h2 className="text-xl font-semibold mb-4">Create New Tournament</h2>
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </Card>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!session) {
    return (
      <Card>
        <h2 className="text-xl font-semibold mb-4">Create New Tournament</h2>
        <p className="text-sm text-gray-500 mb-4">
          Sign in with your Google account to create and manage tournaments.
        </p>
        <SignInButton className="w-full" />
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Create New Tournament</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Tournament Name"
          placeholder="e.g., Summer Championship 2025"
          value={name}
          onChange={handleNameChange}
          disabled={isPending}
          maxLength={128}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter a password to protect your tournament (min 4 characters)"
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
