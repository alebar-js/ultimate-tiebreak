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
  const [showBracketInCompleted, setShowBracketInCompleted] = useState(false);
  const [highlightedPlayerId, setHighlightedPlayerId] = useState<string | null>(null);

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

  // Find highlighted player name
  const highlightedPlayer = highlightedPlayerId
    ? tournament?.players.find((p) => p.id === highlightedPlayerId)
    : null;

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

  // Victory Screen or Bracket View for COMPLETED
  if (tournament.status === 'COMPLETED') {
    if (showBracketInCompleted) {
      // Show bracket with a back button to return to victory screen
      return (
        <div className="h-screen flex flex-col overflow-hidden">
          {/* Header with back to victory button */}
          <header className="bg-white border-b border-border px-4 py-3 flex items-center justify-between gap-4 z-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowBracketInCompleted(false)}
                className="text-sm text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Results
              </button>
              <div className="h-6 w-px bg-border" />
              <h1 className="font-semibold text-lg truncate max-w-xs">{tournament.name}</h1>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
              COMPLETED
            </span>
          </header>

          {/* Bracket Canvas */}
          <div className="flex-1 relative overflow-hidden">
            <div className="w-full h-full">
              <BracketCanvas>
                <BracketView
                  tournament={tournament}
                  selectedMatchId={selectedMatchId}
                  selectedRoundId={selectedRoundId}
                  highlightedPlayerId={highlightedPlayerId}
                  onMatchSelect={setSelectedMatchId}
                  onRoundSelect={handleRoundSelect}
                />
              </BracketCanvas>
            </div>

            {/* Highlight Indicator */}
            {highlightedPlayer && (
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 border border-accent">
                <span className="text-sm">
                  <span className="text-gray-500">Highlighting:</span>{' '}
                  <span className="font-semibold text-accent">{highlightedPlayer.name}</span>
                </span>
                <button
                  onClick={() => setHighlightedPlayerId(null)}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                  title="Clear highlight"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Right-side Drawer Overlay (read-only for completed) */}
            <div className="absolute top-0 right-0 h-full">
              {selectedMatch && selectedMatchRound && (
                <MatchDetailPanel
                  match={selectedMatch}
                  round={selectedMatchRound}
                  players={tournament.players}
                  onResult={handleMatchResult}
                  onUndo={handleUndoMatchResult}
                  onClose={() => setSelectedMatchId(null)}
                  onPlayerClick={setHighlightedPlayerId}
                  highlightedPlayerId={highlightedPlayerId}
                  disabled={true}
                  isRoundLocked={true}
                />
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <VictoryScreen
        players={tournament.players}
        tournamentName={tournament.name}
        onViewBracket={() => setShowBracketInCompleted(true)}
      />
    );
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
        <div className="flex-1 relative overflow-hidden">
          {/* Bracket Canvas */}
          <div className="w-full h-full">
            <BracketCanvas>
              <BracketView
                tournament={tournament}
                selectedMatchId={selectedMatchId}
                selectedRoundId={selectedRoundId}
                highlightedPlayerId={highlightedPlayerId}
                onMatchSelect={setSelectedMatchId}
                onRoundSelect={handleRoundSelect}
                onStartNextRound={handleNextRound}
              />
            </BracketCanvas>
          </div>

          {/* Highlight Indicator */}
          {highlightedPlayer && (
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 border border-accent">
              <span className="text-sm">
                <span className="text-gray-500">Highlighting:</span>{' '}
                <span className="font-semibold text-accent">{highlightedPlayer.name}</span>
              </span>
              <button
                onClick={() => setHighlightedPlayerId(null)}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                title="Clear highlight"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Right-side Drawer Overlay */}
          <div className="absolute top-0 right-0 h-full">
            {/* Match Detail Panel */}
            {selectedMatch && selectedMatchRound && (
              <MatchDetailPanel
                match={selectedMatch}
                round={selectedMatchRound}
                players={tournament.players}
                onResult={handleMatchResult}
                onUndo={handleUndoMatchResult}
                onClose={() => setSelectedMatchId(null)}
                onPlayerClick={setHighlightedPlayerId}
                highlightedPlayerId={highlightedPlayerId}
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
