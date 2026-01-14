'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useAdminTournamentsQuery,
  useAdminDeleteTournamentMutation,
  useAdminResetTournamentMutation,
} from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface AdminTournament {
  _id: string;
  name: string;
  status: string;
  playerCount: number;
  activePlayerCount: number;
  roundCount: number;
  completedMatchesCount: number;
  createdAt: string;
}

export default function AdminPage() {
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { data: tournaments, isLoading, error } = useAdminTournamentsQuery(
    isAuthenticated ? adminPassword : ''
  );
  
  const deleteMutation = useAdminDeleteTournamentMutation(adminPassword);
  const resetMutation = useAdminResetTournamentMutation(adminPassword);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword.trim()) {
      setIsAuthenticated(true);
    }
  };

  const handleDeleteTournament = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleResetTournament = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to reset "${name}"? This will clear all match results and reset the tournament to pending state.`)) {
      resetMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-center mb-6">Admin Access</h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Admin Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter admin password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={!adminPassword.trim()}>
                Access Admin Panel
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-gray-500 hover:text-primary transition-colors">
                ← Back to Home
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-sm text-gray-500 hover:text-primary transition-colors">
            ← Back to Home
          </Link>
          <h1 className="font-semibold text-lg">Tournament Admin</h1>
          <Button
            variant="secondary"
            onClick={() => {
              setIsAuthenticated(false);
              setAdminPassword('');
            }}
            size="sm"
          >
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-error/10 border border-error rounded-lg text-error text-sm">
            {error instanceof Error ? error.message : 'Failed to load tournaments'}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {/* Tournaments List */}
        {!isLoading && !error && tournaments && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                All Tournaments ({tournaments.length})
              </h2>
            </div>

            {tournaments.length === 0 ? (
              <Card>
                <div className="p-8 text-center text-gray-500">
                  <p className="mb-2">No tournaments found</p>
                  <Link href="/" className="text-primary hover:underline">
                    Create a tournament
                  </Link>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4">
                {tournaments.map((tournament: AdminTournament) => (
                  <Card key={tournament._id}>
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{tournament.name}</h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                              {tournament.status}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-500 mb-3">
                            Created: {formatDate(tournament.createdAt)}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>
                              <div className="font-medium">Players</div>
                              <div className="text-gray-500">
                                {tournament.activePlayerCount}/{tournament.playerCount} active
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">Rounds</div>
                              <div className="text-gray-500">{tournament.roundCount}</div>
                            </div>
                            <div>
                              <div className="font-medium">Matches</div>
                              <div className="text-gray-500">{tournament.completedMatchesCount} completed</div>
                            </div>
                            <div>
                              <div className="font-medium">ID</div>
                              <div className="text-gray-500 font-mono text-xs truncate">
                                {tournament._id}
                              </div>
                            </div>
                            <div className="flex items-end gap-2">
                              <Link href={`/tournament/${tournament._id}`}>
                                <Button variant="secondary" size="sm">
                                  View
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          {tournament.status !== 'PENDING' && (
                            <Button
                              variant="secondary"
                              onClick={() => handleResetTournament(tournament._id, tournament.name)}
                              disabled={resetMutation.isPending}
                              size="sm"
                            >
                              {resetMutation.isPending ? 'Resetting...' : 'Reset'}
                            </Button>
                          )}
                          <Button
                            variant="danger"
                            onClick={() => handleDeleteTournament(tournament._id, tournament.name)}
                            disabled={deleteMutation.isPending}
                            size="sm"
                          >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
