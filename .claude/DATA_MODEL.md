# Data Model Specification

## Database
-   **Database:** MongoDB
-   **ORM:** Mongoose (recommended for type safety with TS) or raw MongoDB client if preferred for simplicity.

## Collections

### 1. Tournament
This is the aggregate root. For simplicity, we can store the entire state in one document per tournament, as max players is 96 (small data size).

```typescript
interface Tournament {
  _id: ObjectId;
  name: string;
  password: string; // Plaintext is acceptable per requirements "minimal layer of security"
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
  currentRound: number;
  ownerId?: string; // Email of the Google account that created this tournament (optional for legacy tournaments)

  // All players registered
  players: Player[];

  // History of rounds
  rounds: Round[];

  createdAt: Date;
}

interface Player {
  id: string; // UUID or short ID
  name: string;
  isEliminated: boolean;
}

interface Round {
  roundNumber: number;
  matches: Match[];
  byes: string[]; // Array of Player IDs who skipped this round
  isComplete: boolean;
}

interface Match {
  id: string;
  team1: {
    playerIds: string[]; // [p1_id, p2_id]
  };
  team2: {
    playerIds: string[]; // [p3_id, p4_id]
  };
  winnerTeam: 1 | 2 | null; // Null if not played yet
}
```

### 2. User
Stores authenticated users from Google OAuth. Used for tournament ownership and admin access.

```typescript
interface User {
  _id: ObjectId;
  email: string; // Google account email (unique)
  name: string | null;
  image: string | null; // Google profile picture URL
  createdAt: Date;
}
```

## Authentication & Authorization

### Tournament Ownership
- New tournaments are created with `ownerId` set to the creator's email
- Only the owner can modify their tournament (add players, start, record results, etc.)
- Legacy tournaments (without `ownerId`) can be modified by anyone (backward compatibility)

### Admin Access
- Admin users are defined by the `ADMIN_EMAILS` environment variable (comma-separated list)
- Admins can view all tournaments, delete any tournament, and reset tournament state
- Admin access is checked on the server via session email