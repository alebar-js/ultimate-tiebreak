import mongoose, { Schema, Model } from 'mongoose';
import type { ITournament, IPlayer, IRound, IMatch, ITeam, IUser } from './types';

const TeamSchema = new Schema<ITeam>(
  {
    playerIds: {
      type: [String],
      required: true,
    },
  },
  { _id: false }
);

const MatchSchema = new Schema<IMatch>(
  {
    id: {
      type: String,
      required: true,
    },
    team1: {
      type: TeamSchema,
      required: true,
    },
    team2: {
      type: TeamSchema,
      required: true,
    },
    winnerTeam: {
      type: Number,
      enum: [1, 2, null],
      default: null,
    },
  },
  { _id: false }
);

const RoundSchema = new Schema<IRound>(
  {
    roundNumber: {
      type: Number,
      required: true,
    },
    matches: {
      type: [MatchSchema],
      default: [],
    },
    byes: {
      type: [String],
      default: [],
    },
    isComplete: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const PlayerSchema = new Schema<IPlayer>(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    isEliminated: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const TournamentSchema = new Schema<ITournament>(
  {
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'COMPLETED'],
      default: 'PENDING',
    },
    currentRound: {
      type: Number,
      default: 0,
    },
    players: {
      type: [PlayerSchema],
      default: [],
    },
    rounds: {
      type: [RoundSchema],
      default: [],
    },
    ownerId: {
      type: String,
      required: false, // Optional for legacy tournaments
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const Tournament: Model<ITournament> =
  mongoose.models.Tournament || mongoose.model<ITournament>('Tournament', TournamentSchema);

// User Schema for authenticated users
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
