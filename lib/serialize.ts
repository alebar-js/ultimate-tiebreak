import type { ITournament } from './types';

export function serializeTournament(tournament: any): ITournament | null {
  if (!tournament) return null;

  // Handle both lean() and toObject() results
  const data = tournament.toObject ? tournament.toObject() : tournament;
  
  return {
    _id: data._id.toString(),
    name: data.name,
    password: data.password,
    status: data.status,
    currentRound: data.currentRound,
    players: data.players || [],
    rounds: data.rounds || [],
    createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt),
  };
}
