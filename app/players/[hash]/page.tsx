'use client';

import { useState, use, useMemo, useRef, useEffect } from 'react';
import { usePlayerTournament } from '@/lib/api';
import { getRoundDisplayName } from '@/lib/game-logic';
import type { IPlayer, IMatch, IRound } from '@/lib/types';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface PlayerPageProps {
  params: Promise<{ hash: string }>;
}

interface PlayerMatchInfo {
  match: IMatch;
  round: IRound;
  teammate: IPlayer | undefined;
  opponents: (IPlayer | undefined)[];
  matchIndex: number;
  totalMatches: number;
  matchesAhead: number; // incomplete matches before this one
}

export default function PlayerPage({ params }: PlayerPageProps) {
  const { hash } = use(params);
  const [playerName, setPlayerName] = useState('');
  const [searchedName, setSearchedName] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const { data: tournament, isLoading, error } = usePlayerTournament(hash);

  // Filter suggestions based on input
  const suggestions = useMemo(() => {
    if (!tournament || !playerName.trim()) return [];
    const normalizedInput = playerName.toLowerCase().trim();
    return tournament.players
      .filter((p) => p.name.toLowerCase().includes(normalizedInput))
      .slice(0, 8); // Limit to 8 suggestions
  }, [tournament, playerName]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlighted index when suggestions change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  // Find the player by name (case-insensitive partial match)
  const foundPlayer = useMemo(() => {
    if (!tournament || !searchedName) return null;
    const normalizedSearch = searchedName.toLowerCase().trim();
    return tournament.players.find(
      (p) => p.name.toLowerCase() === normalizedSearch ||
             p.name.toLowerCase().includes(normalizedSearch)
    );
  }, [tournament, searchedName]);

  // Find the player's current match info
  const playerMatchInfo = useMemo((): PlayerMatchInfo | null => {
    if (!tournament || !foundPlayer) return null;

    // Get the current round (last round)
    const currentRound = tournament.rounds[tournament.rounds.length - 1];
    if (!currentRound) return null;

    // Find match index where this player is participating
    const matchIndex = currentRound.matches.findIndex(
      (m) =>
        m.team1.playerIds.includes(foundPlayer.id) ||
        m.team2.playerIds.includes(foundPlayer.id)
    );

    if (matchIndex === -1) return null;

    const match = currentRound.matches[matchIndex];

    // Count incomplete matches before this player's match
    const matchesAhead = currentRound.matches
      .slice(0, matchIndex)
      .filter((m) => m.winnerTeam === null).length;

    // Determine teammate and opponents
    const isTeam1 = match.team1.playerIds.includes(foundPlayer.id);
    const teammateId = isTeam1
      ? match.team1.playerIds.find((id) => id !== foundPlayer.id)
      : match.team2.playerIds.find((id) => id !== foundPlayer.id);
    const opponentIds = isTeam1 ? match.team2.playerIds : match.team1.playerIds;

    const teammate = tournament.players.find((p) => p.id === teammateId);
    const opponents = opponentIds.map((id) =>
      tournament.players.find((p) => p.id === id)
    );

    return {
      match,
      round: currentRound,
      teammate,
      opponents,
      matchIndex,
      totalMatches: currentRound.matches.length,
      matchesAhead,
    };
  }, [tournament, foundPlayer]);

  // Check if player is on bye
  const isOnBye = useMemo(() => {
    if (!tournament || !foundPlayer) return false;
    const currentRound = tournament.rounds[tournament.rounds.length - 1];
    return currentRound?.byes.includes(foundPlayer.id) ?? false;
  }, [tournament, foundPlayer]);

  // Get round progress info (for bye players or general info)
  const roundProgress = useMemo(() => {
    if (!tournament) return null;
    const currentRound = tournament.rounds[tournament.rounds.length - 1];
    if (!currentRound) return null;

    const totalMatches = currentRound.matches.length;
    const completedMatches = currentRound.matches.filter((m) => m.winnerTeam !== null).length;
    const remainingMatches = totalMatches - completedMatches;

    return { totalMatches, completedMatches, remainingMatches };
  }, [tournament]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length === 1) {
      // Auto-select if there's only one match
      selectPlayer(suggestions[0]);
    } else if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
      selectPlayer(suggestions[highlightedIndex]);
    } else {
      setSearchedName(playerName);
      setShowSuggestions(false);
    }
  };

  const selectPlayer = (player: IPlayer) => {
    setPlayerName(player.name);
    setSearchedName(player.name);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
    setShowSuggestions(true);
    // Clear previous search when typing
    if (searchedName) {
      setSearchedName(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  const handleClear = () => {
    setPlayerName('');
    setSearchedName(null);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <Card className="max-w-md w-full text-center">
          <div className="text-4xl mb-4">😕</div>
          <h1 className="text-xl font-semibold mb-2">Tournament Not Found</h1>
          <p className="text-gray-500">
            This tournament link may be invalid or the tournament no longer exists.
          </p>
        </Card>
      </div>
    );
  }

  // Tournament is PENDING
  if (tournament.status === 'PENDING') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <Card className="max-w-md w-full text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h1 className="text-xl font-semibold mb-2">{tournament.name}</h1>
          <p className="text-gray-500 mb-4">
            Tournament hasn&apos;t started yet. Please wait for the organizer to begin.
          </p>
          <div className="text-sm text-gray-400">
            {tournament.players.length} player{tournament.players.length !== 1 ? 's' : ''} registered
          </div>
        </Card>
      </div>
    );
  }

  // Tournament is COMPLETED
  if (tournament.status === 'COMPLETED') {
    const winners = tournament.players.filter((p) => !p.isEliminated);
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <Card className="max-w-md w-full text-center">
          <div className="text-4xl mb-4">🏆</div>
          <h1 className="text-xl font-semibold mb-2">{tournament.name}</h1>
          <p className="text-gray-500 mb-4">Tournament Complete!</p>
          <div className="bg-primary/10 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-2">Winners:</p>
            <div className="space-y-1">
              {winners.map((w) => (
                <div key={w.id} className="font-semibold text-primary">
                  {w.name}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Tournament is ACTIVE - show player lookup
  return (
    <div className="min-h-screen bg-muted p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Tournament Info */}
        <Card>
          <h1 className="text-xl font-semibold text-center">{tournament.name}</h1>
          <p className="text-sm text-gray-500 text-center mt-1">
            {getRoundDisplayName(tournament.rounds[tournament.rounds.length - 1])}
          </p>
        </Card>

        {/* Player Search */}
        <Card>
          <h2 className="font-semibold mb-3">Find Your Match</h2>
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Start typing your name..."
                value={playerName}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => playerName.trim() && setShowSuggestions(true)}
                autoFocus
                autoComplete="off"
                className="w-full px-4 py-2.5 text-base rounded-lg border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-20 w-full mt-1 bg-white border border-border rounded-lg shadow-lg overflow-hidden"
                >
                  {suggestions.map((player, index) => (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => selectPlayer(player)}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between ${
                        index === highlightedIndex
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-gray-50'
                      } ${player.isEliminated ? 'text-gray-400' : ''}`}
                    >
                      <span>{player.name}</span>
                      {player.isEliminated && (
                        <span className="text-xs text-gray-400">eliminated</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={!playerName.trim()} className="flex-1">
                Search
              </Button>
              {searchedName && (
                <Button type="button" variant="secondary" onClick={handleClear}>
                  Clear
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Results */}
        {searchedName && !foundPlayer && (
          <Card className="border-error/20 bg-error/5">
            <div className="text-center">
              <div className="text-2xl mb-2">🔍</div>
              <p className="font-medium">Player not found</p>
              <p className="text-sm text-gray-500 mt-1">
                No player matching &quot;{searchedName}&quot; was found in this tournament.
              </p>
            </div>
          </Card>
        )}

        {foundPlayer && foundPlayer.isEliminated && (
          <Card className="border-gray-300 bg-gray-50">
            <div className="text-center">
              <div className="text-4xl mb-2">😢</div>
              <p className="font-semibold text-lg">{foundPlayer.name}</p>
              <p className="text-gray-500 mt-2">
                You have been eliminated from the tournament.
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Better luck next time!
              </p>
            </div>
          </Card>
        )}

        {foundPlayer && !foundPlayer.isEliminated && isOnBye && (
          <Card className="border-primary/30 bg-primary/5">
            <div className="text-center">
              <div className="text-4xl mb-2">☕</div>
              <p className="font-semibold text-lg text-primary">{foundPlayer.name}</p>
              <p className="text-gray-600 mt-2">
                You have a <span className="font-semibold">bye</span> this round!
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Sit back and relax. You&apos;ll automatically advance to the next round.
              </p>
              {roundProgress && roundProgress.totalMatches > 0 && (
                <div className="mt-4 inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-border">
                  <span className="text-sm font-medium text-gray-700">
                    {roundProgress.completedMatches} of {roundProgress.totalMatches} matches complete
                  </span>
                  {roundProgress.remainingMatches > 0 ? (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {roundProgress.remainingMatches} remaining
                    </span>
                  ) : (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-semibold">
                      Round complete!
                    </span>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}

        {foundPlayer && !foundPlayer.isEliminated && playerMatchInfo && (
          <Card className="border-accent/30 bg-accent/5">
            <div className="text-center mb-4">
              <p className="font-semibold text-lg text-accent">{foundPlayer.name}</p>
              {playerMatchInfo.match.winnerTeam === null ? (
                <>
                  <p className="text-sm text-gray-500">Your next match:</p>
                  <div className="mt-2 inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-border">
                    <span className="text-sm font-medium text-gray-700">
                      Match {playerMatchInfo.matchIndex + 1} of {playerMatchInfo.totalMatches}
                    </span>
                    {playerMatchInfo.matchesAhead > 0 ? (
                      <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                        {playerMatchInfo.matchesAhead} match{playerMatchInfo.matchesAhead !== 1 ? 'es' : ''} ahead
                      </span>
                    ) : (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                        You&apos;re up!
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">Current match result:</p>
              )}
            </div>

            {/* Match Card */}
            <div className="bg-white rounded-lg border-2 border-primary overflow-hidden">
              {/* Your Team */}
              <div className={`p-4 ${
                playerMatchInfo.match.winnerTeam === (playerMatchInfo.match.team1.playerIds.includes(foundPlayer.id) ? 1 : 2)
                  ? 'bg-primary/10'
                  : ''
              }`}>
                <p className="text-xs text-gray-500 mb-1">Your Team</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-primary">{foundPlayer.name}</p>
                    <p className="font-semibold text-primary">{playerMatchInfo.teammate?.name ?? '?'}</p>
                  </div>
                  {playerMatchInfo.match.winnerTeam === (playerMatchInfo.match.team1.playerIds.includes(foundPlayer.id) ? 1 : 2) && (
                    <span className="text-2xl">🎉</span>
                  )}
                </div>
              </div>

              <div className="h-px bg-gray-200" />

              {/* VS */}
              <div className="py-2 text-center">
                <span className="text-sm font-bold text-gray-400">VS</span>
              </div>

              <div className="h-px bg-gray-200" />

              {/* Opponent Team */}
              <div className={`p-4 ${
                playerMatchInfo.match.winnerTeam === (playerMatchInfo.match.team1.playerIds.includes(foundPlayer.id) ? 2 : 1)
                  ? 'bg-accent/10'
                  : ''
              }`}>
                <p className="text-xs text-gray-500 mb-1">Opponents</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-accent">{playerMatchInfo.opponents[0]?.name ?? '?'}</p>
                    <p className="font-semibold text-accent">{playerMatchInfo.opponents[1]?.name ?? '?'}</p>
                  </div>
                  {playerMatchInfo.match.winnerTeam === (playerMatchInfo.match.team1.playerIds.includes(foundPlayer.id) ? 2 : 1) && (
                    <span className="text-2xl">🎉</span>
                  )}
                </div>
              </div>
            </div>

            {/* Match Status */}
            {playerMatchInfo.match.winnerTeam === null ? (
              <p className="text-center text-sm text-gray-500 mt-4">
                Good luck! 🍀
              </p>
            ) : (
              <p className="text-center text-sm mt-4">
                {playerMatchInfo.match.winnerTeam === (playerMatchInfo.match.team1.playerIds.includes(foundPlayer.id) ? 1 : 2) ? (
                  <span className="text-primary font-semibold">You won! 🎉</span>
                ) : (
                  <span className="text-gray-500">Match lost. Waiting for next round...</span>
                )}
              </p>
            )}
          </Card>
        )}

        {/* Auto-refresh notice */}
        {searchedName && foundPlayer && (
          <p className="text-xs text-gray-400 text-center">
            This page auto-refreshes every 10 seconds
          </p>
        )}
      </div>
    </div>
  );
}
