'use client';

import { useMemo } from 'react';
import type { IPlayer } from '@/lib/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

interface VictoryScreenProps {
  players: IPlayer[];
  tournamentName: string;
}

// Simple seeded random for deterministic confetti
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function Confetti() {
  const particles = useMemo(() => {
    const colors = ['#006837', '#c85b1a', '#fbbf24', '#22c55e', '#3b82f6'];
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: seededRandom(i * 1) * 100,
      delay: seededRandom(i * 2) * 3,
      color: colors[Math.floor(seededRandom(i * 3) * colors.length)],
      isCircle: seededRandom(i * 4) > 0.5,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 animate-fall"
          style={{
            left: `${particle.x}%`,
            top: '-20px',
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            borderRadius: particle.isCircle ? '50%' : '0',
          }}
        />
      ))}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default function VictoryScreen({ players, tournamentName }: VictoryScreenProps) {
  const winners = players.filter((p) => !p.isEliminated);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Confetti />
      <Card className="max-w-lg w-full text-center relative z-10">
        <div className="py-8">
          <div className="text-6xl mb-4">
            <span role="img" aria-label="trophy">🏆</span>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            Tournament Complete!
          </h1>
          <p className="text-gray-500 mb-6">{tournamentName}</p>

          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-600 mb-4">
              {winners.length === 1 ? 'Champion' : 'Champions'}
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {winners.map((winner) => (
                <span
                  key={winner.id}
                  className="inline-flex items-center px-4 py-2 rounded-full bg-primary text-white font-semibold text-lg shadow-lg"
                >
                  {winner.name}
                </span>
              ))}
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            {winners.length} player{winners.length !== 1 ? 's' : ''} remaining when fewer than 4 players were left
          </p>

          <Link href="/">
            <Button variant="secondary" className="w-full">
              Back to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
