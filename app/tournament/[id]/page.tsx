'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import {
  useTournament,
  useAddPlayersMutation,
  useRemovePlayerMutation,
  useStartTournamentMutation,
  useMatchResultMutation,
  useUndoMatchResultMutation,
  useNextRoundMutation,
  useResetResultsMutation,
  useDeleteRoundMutation,
  useRedrawRoundMutation,
} from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import PlayerList from '@/components/tournament/PlayerList';
import AddPlayerForm from '@/components/tournament/AddPlayerForm';
import BulkPlayerForm from '@/components/tournament/BulkPlayerForm';
import VictoryScreen from '@/components/tournament/VictoryScreen';
import BracketCanvas from '@/components/bracket/BracketCanvas';
import BracketView from '@/components/bracket/BracketView';
import BracketHeader from '@/components/bracket/BracketHeader';
import MatchDetailPanel from '@/components/bracket/MatchDetailPanel';
import RoundDetailPanel from '@/components/bracket/RoundDetailPanel';

interface TournamentPageProps {
  params: Promise<{ id: string }>;
}

export default function TournamentPage({ params }: TournamentPageProps) {
  const { id } = use(params);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);

  // Query
  const { data: tournament, isLoading: loading, error } = useTournament(id);

  // Mutations
  const addPlayerMutation = useAddPlayersMutation(id);
  const bulkAddPlayersMutation = useAddPlayersMutation(id);
  const removePlayerMutation = useRemovePlayerMutation(id);
  const startTournamentMutation = useStartTournamentMutation(id);
  const matchResultMutation = useMatchResultMutation(id);
  const undoMatchResultMutation = useUndoMatchResultMutation(id);
  const nextRoundMutation = useNextRoundMutation(id);
  const resetResultsMutation = useResetResultsMutation(id);
  const deleteRoundMutation = useDeleteRoundMutation(id);
  const redrawRoundMutation = useRedrawRoundMutation(id);

  const isAnyMutationLoading = addPlayerMutation.isPending ||
    bulkAddPlayersMutation.isPending ||
    removePlayerMutation.isPending ||
    startTournamentMutation.isPending ||
    matchResultMutation.isPending ||
    undoMatchResultMutation.isPending ||
    nextRoundMutation.isPending ||
    resetResultsMutation.isPending ||
    deleteRoundMutation.isPending ||
    redrawRoundMutation.isPending;

  const handleAddPlayer = async (name: string) => {
    addPlayerMutation.mutate([name]);
  };

  const handleBulkAddPlayers = async (names: string[]) => {
    bulkAddPlayersMutation.mutate(names);
  };

  const handleRemovePlayer = async (playerId: string) => {
    removePlayerMutation.mutate(playerId);
  };

  const handleStartTournament = async () => {
    startTournamentMutation.mutate();
  };

  const handleMatchResult = async (matchId: string, winnerTeam: 1 | 2) => {
    matchResultMutation.mutate({ matchId, winnerTeam });
  };

  const handleUndoMatchResult = async (matchId: string) => {
    undoMatchResultMutation.mutate(matchId);
  };

  const handleNextRound = async () => {
    nextRoundMutation.mutate();
  };

  const handleResetResults = async () => {
    resetResultsMutation.mutate();
  };

  const handleRoundSelect = (roundNumber: number) => {
    setSelectedRoundId(roundNumber);
    setSelectedMatchId(null); // Clear match selection when selecting a round
  };

  const handleDeleteRound = async (roundNumber: number) => {
    deleteRoundMutation.mutate(roundNumber);
    setSelectedRoundId(null); // Clear selection after deleting
  };

  const handleRedrawRound = async (roundNumber: number) => {
    redrawRoundMutation.mutate(roundNumber);
  };

  // Find selected match and its round
  const selectedMatch = tournament?.rounds
    .flatMap((r) => r.matches)
    .find((m) => m.id === selectedMatchId);

  const selectedMatchRoundIndex = tournament?.rounds.findIndex((r) =>
    r.matches.some((m) => m.id === selectedMatchId)
  );

  const selectedMatchRound = selectedMatchRoundIndex !== undefined && selectedMatchRoundIndex >= 0
    ? tournament?.rounds[selectedMatchRoundIndex]
    : undefined;

  // Find selected round
  const selectedRound = selectedRoundId !== null
    ? tournament?.rounds.find(r => r.roundNumber === selectedRoundId)
    : undefined;

  // Check if selected round is current round
  const isSelectedRoundCurrent = selectedRoundId !== null && tournament
    ? selectedRoundId === tournament.rounds[tournament.rounds.length - 1].roundNumber
    : false;

  // A round is locked if it's not the last (current) round
  const isSelectedRoundLocked = tournament && selectedMatchRoundIndex !== undefined
    ? selectedMatchRoundIndex < tournament.rounds.length - 1
    : false;

  const errorMessage = error instanceof Error ? error.message : null;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (errorMessage && !tournament) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <p className="text-error mb-4">{errorMessage}</p>
          <Link href="/">
            <Button variant="secondary">Back to Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!tournament) {
    return null;
  }

  // Victory Screen
  if (tournament.status === 'COMPLETED') {
    return <VictoryScreen players={tournament.players} tournamentName={tournament.name} />;
  }

  // Bracket View (ACTIVE)
  if (tournament.status === 'ACTIVE') {
    return (
      <div className="h-screen flex flex-col overflow-hidden">
        <BracketHeader
          tournament={tournament}
          onNextRound={handleNextRound}
          actionLoading={nextRoundMutation.isPending}
        />

        {/* Error Banner */}
        {errorMessage && (
          <div className="px-4 py-2 bg-error/10 border-b border-error text-error text-sm flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              onClick={() => window.location.reload()}
              className="text-xs underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Content: Canvas + Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Bracket Canvas */}
          <div className="flex-1 h-full">
            <BracketCanvas>
              <BracketView
                tournament={tournament}
                selectedMatchId={selectedMatchId}
                selectedRoundId={selectedRoundId}
                onMatchSelect={setSelectedMatchId}
                onRoundSelect={handleRoundSelect}
              />
            </BracketCanvas>
          </div>

          {/* Match Detail Panel */}
          {selectedMatch && selectedMatchRound && (
            <MatchDetailPanel
              match={selectedMatch}
              round={selectedMatchRound}
              players={tournament.players}
              onResult={handleMatchResult}
              onUndo={handleUndoMatchResult}
              onClose={() => setSelectedMatchId(null)}
              disabled={matchResultMutation.isPending || undoMatchResultMutation.isPending}
              isRoundLocked={isSelectedRoundLocked}
            />
          )}

          {/* Round Detail Panel */}
          {selectedRound && !selectedMatch && (
            <RoundDetailPanel
              round={selectedRound}
              players={tournament.players}
              onDelete={handleDeleteRound}
              onRedraw={handleRedrawRound}
              onClose={() => setSelectedRoundId(null)}
              disabled={deleteRoundMutation.isPending || redrawRoundMutation.isPending}
              isCurrentRound={isSelectedRoundCurrent}
            />
          )}
        </div>
      </div>
    );
  }

  // Lobby View (PENDING)
  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-sm text-gray-500 hover:text-primary transition-colors">
            &larr; Home
          </Link>
          <h1 className="font-semibold truncate mx-4">{tournament.name}</h1>
          <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
            {tournament.status}
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-error/10 border border-error rounded-lg text-error text-sm">
            {errorMessage}
            <button
              onClick={() => window.location.reload()}
              className="ml-2 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Lobby View (PENDING) */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-1">Player Registration</h2>
            <p className="text-sm text-gray-500 mb-4">
              Add at least 4 players to start the tournament.
            </p>
            <AddPlayerForm onAdd={handleAddPlayer} disabled={isAnyMutationLoading} />
          </Card>

          <BulkPlayerForm onAdd={handleBulkAddPlayers} disabled={isAnyMutationLoading} />

          <PlayerList
            players={tournament.players}
            onRemove={handleRemovePlayer}
            disabled={isAnyMutationLoading}
          />

          <div className="sticky bottom-4">
            <Button
              onClick={handleStartTournament}
              loading={startTournamentMutation.isPending}
              disabled={tournament.players.length < 4 || isAnyMutationLoading}
              className="w-full shadow-lg"
              size="lg"
            >
              {tournament.players.length < 4
                ? `Need ${4 - tournament.players.length} more player${4 - tournament.players.length === 1 ? '' : 's'}`
                : `Start Tournament (${tournament.players.length} players)`}
            </Button>
          </div>
        </div>

        {/* Tournament ID Display */}
        <Card className="mt-8">
          <p className="text-sm text-gray-500 mb-1">Tournament ID (share this to let others join):</p>
          <code className="block p-2 bg-muted rounded text-sm font-mono break-all">
            {tournament._id}
          </code>
        </Card>
      </main>
    </div>
  );
}
