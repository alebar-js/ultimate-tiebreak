'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface AddPlayerFormProps {
  onAdd: (name: string) => Promise<void>;
  disabled?: boolean;
}

export default function AddPlayerForm({ onAdd, disabled = false }: AddPlayerFormProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    setLoading(true);
    try {
      await onAdd(name.trim());
      setName('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1">
        <Input
          placeholder="Enter player name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={disabled || loading}
        />
      </div>
      <Button type="submit" loading={loading} disabled={disabled || !name.trim()}>
        Add
      </Button>
    </form>
  );
}
