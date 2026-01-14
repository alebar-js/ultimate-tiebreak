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