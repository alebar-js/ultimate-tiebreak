import { v4 as uuidv4 } from 'uuid';
import type { IPlayer, IMatch, IRound } from './types';

/**
 * Fisher-Yates shuffle algorithm
 * Returns a new shuffled array without mutating the original
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get all active (non-eliminated) players
 */
export function getActivePlayers(players: IPlayer[]): IPlayer[] {
  return players.filter((player) => !player.isEliminated);
}

/**
 * Check if the tournament should end (victory condition)
 * Tournament ends when fewer than 4 active players remain
 */
export function checkVictoryCondition(players: IPlayer[]): boolean {
  const activePlayers = getActivePlayers(players);
  return activePlayers.length < 4;
}

/**
 * Generate match pairings for a round
 * - Shuffles active players randomly
 * - Groups into matches of 4 (team of 2 vs team of 2)
 * - Remaining players (if not divisible by 4) become byes
 */
export function generatePairings(
  players: IPlayer[]
): { matches: IMatch[]; byes: string[] } {
  const activePlayers = getActivePlayers(players);
  const shuffled = shuffleArray(activePlayers);

  const matches: IMatch[] = [];
  const byes: string[] = [];

  let i = 0;
  while (i + 3 < shuffled.length) {
    // Create a match with 4 players
    const match: IMatch = {
      id: uuidv4(),
      team1: {
        playerIds: [shuffled[i].id, shuffled[i + 1].id],
      },
      team2: {
        playerIds: [shuffled[i + 2].id, shuffled[i + 3].id],
      },
      winnerTeam: null,
    };
    matches.push(match);
    i += 4;
  }

  // Remaining players get a bye
  while (i < shuffled.length) {
    byes.push(shuffled[i].id);
    i++;
  }

  return { matches, byes };
}

/**
 * Create a new round with pairings
 */
export function createRound(players: IPlayer[], roundNumber: number): IRound {
  const { matches, byes } = generatePairings(players);

  return {
    roundNumber,
    matches,
    byes,
    isComplete: matches.length === 0, // If no matches, round is immediately complete
  };
}

/**
 * Check if all matches in a round are complete
 */
export function isRoundComplete(round: IRound): boolean {
  return round.matches.every((match) => match.winnerTeam !== null);
}

/**
 * Get the losing team's player IDs from a match
 */
export function getLosingTeamPlayerIds(match: IMatch): string[] {
  if (match.winnerTeam === null) {
    return [];
  }
  return match.winnerTeam === 1
    ? match.team2.playerIds
    : match.team1.playerIds;
}

/**
 * Generate a unique player ID
 */
export function generatePlayerId(): string {
  return uuidv4();
}

/**
 * Find the largest power of 2 that is <= n and >= 4
 */
export function largestPowerOf2(n: number): number {
  if (n < 4) return 4;
  let power = 4;
  while (power * 2 <= n) {
    power *= 2;
  }
  return power;
}

/**
 * Determine if a qualifier round is needed and calculate its parameters
 * Returns null if no qualifier is needed
 */
export function calculateQualifier(playerCount: number): {
  target: number;
  toEliminate: number;
  qualifierMatches: number;
  playersInQualifier: number;
  qualifierByes: number;
} | null {
  const target = largestPowerOf2(playerCount);
  const toEliminate = playerCount - target;

  // Only need qualifier if we need to eliminate 2+ players
  if (toEliminate < 2) {
    return null;
  }

  const qualifierMatches = Math.floor(toEliminate / 2);
  const playersInQualifier = qualifierMatches * 4;
  const qualifierByes = playerCount - playersInQualifier;

  return {
    target,
    toEliminate,
    qualifierMatches,
    playersInQualifier,
    qualifierByes,
  };
}

/**
 * Create the qualifier round (round 0)
 * Some players compete, others get a bye and advance directly to Round 1
 */
export function createQualifierRound(players: IPlayer[]): IRound | null {
  const activePlayers = getActivePlayers(players);
  const qualifier = calculateQualifier(activePlayers.length);

  if (!qualifier) {
    return null;
  }

  const shuffled = shuffleArray(activePlayers);

  const matches: IMatch[] = [];
  const byes: string[] = [];

  // First playersInQualifier players compete
  for (let i = 0; i < qualifier.playersInQualifier; i += 4) {
    const match: IMatch = {
      id: uuidv4(),
      team1: {
        playerIds: [shuffled[i].id, shuffled[i + 1].id],
      },
      team2: {
        playerIds: [shuffled[i + 2].id, shuffled[i + 3].id],
      },
      winnerTeam: null,
    };
    matches.push(match);
  }

  // Remaining players get a bye (they skip the qualifier and go directly to Round 1)
  for (let i = qualifier.playersInQualifier; i < shuffled.length; i++) {
    byes.push(shuffled[i].id);
  }

  return {
    roundNumber: 0, // Qualifier is round 0
    matches,
    byes,
    isComplete: false,
  };
}

/**
 * Get the display name for a round based on the number of teams
 * - 2 teams → "Final"
 * - 4 teams → "Semifinals"
 * - 8 teams → "Quarterfinals"
 * - 16 teams → "Round of 16"
 * - More teams → "Round X"
 * - Round 0 → "Qualifier"
 */
export function getRoundDisplayName(round: IRound): string {
  // Qualifier is always round 0
  if (round.roundNumber === 0) {
    return 'Qualifier';
  }

  // Calculate number of teams based on matches (each match has 2 teams)
  const numTeams = round.matches.length * 2;

  // Named rounds based on team count
  switch (numTeams) {
    case 2:
      return 'Final';
    case 4:
      return 'Semifinals';
    case 8:
      return 'Quarterfinals';
    case 16:
      return 'Round of 16';
    default:
      // For larger rounds or irregular sizes, use round number
      return `Round ${round.roundNumber}`;
  }
}
