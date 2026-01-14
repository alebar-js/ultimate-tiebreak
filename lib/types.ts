export type TournamentStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED';

export interface IPlayer {
  id: string;
  name: string;
  isEliminated: boolean;
}

export interface ITeam {
  playerIds: string[];
}

export interface IMatch {
  id: string;
  team1: ITeam;
  team2: ITeam;
  winnerTeam: 1 | 2 | null;
}

export interface IRound {
  roundNumber: number;
  matches: IMatch[];
  byes: string[];
  isComplete: boolean;
}

export interface ITournament {
  _id: string;
  name: string;
  password: string;
  status: TournamentStatus;
  currentRound: number;
  players: IPlayer[];
  rounds: IRound[];
  createdAt: Date;
}

export interface CreateTournamentInput {
  name: string;
  password: string;
}

export interface AddPlayersInput {
  players: string[];
}

export interface MatchResultInput {
  matchId: string;
  winnerTeam: 1 | 2;
}
