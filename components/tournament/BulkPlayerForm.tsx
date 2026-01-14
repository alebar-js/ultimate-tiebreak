'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface BulkPlayerFormProps {
  onAdd: (names: string[]) => Promise<void>;
  disabled?: boolean;
}

export default function BulkPlayerForm({ onAdd, disabled = false }: BulkPlayerFormProps) {
  const [names, setNames] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const playerNames = names
      .split(',')
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (playerNames.length === 0) return;

    setLoading(true);
    try {
      await onAdd(playerNames);
      setNames('');
    } finally {
      setLoading(false);
    }
  };

  const playerCount = names
    .split(',')
    .map((n) => n.trim())
    .filter((n) => n.length > 0).length;

  return (
    <Card>
      <h3 className="font-semibold mb-3">Bulk Import Players</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <textarea
            className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
            rows={3}
            placeholder="Enter names separated by commas (e.g., John Doe, Jane Smith, Bob)"
            value={names}
            onChange={(e) => setNames(e.target.value)}
            disabled={disabled || loading}
          />
          {playerCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {playerCount} player{playerCount !== 1 ? 's' : ''} to add
            </p>
          )}
        </div>
        <Button
          type="submit"
          variant="secondary"
          loading={loading}
          disabled={disabled || playerCount === 0}
          className="w-full"
        >
          Import Players
        </Button>
      </form>
    </Card>
  );
}
