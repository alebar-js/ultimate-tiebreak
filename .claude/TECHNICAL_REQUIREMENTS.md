
Persistence: The application must save the Tournament document after every state change (adding players, starting tournament, recording a match result, generating next round).

# Technical Stack & Implementation Guide

## Stack
-   **Framework:** Next.js 14+ (App Router)
-   **Language:** TypeScript
-   **Styling:** TailwindCSS
-   **Database:** MongoDB (using `mongoose` or `mongodb` driver)
-   **Authentication:** NextAuth.js v5 (beta) with Google OAuth
-   **UI Components:** standard HTML/Tailwind (no heavy UI libraries required)

## Folder Structure (Suggested)

```text
/app
  /api
    /auth
      /[...nextauth]
        route.ts    # NextAuth API route handler
    /tournament
      route.ts      # POST (Create), PUT (Update state)
      /[id]
        route.ts    # GET (Fetch state)
    /admin
      /tournaments
        route.ts    # GET all tournaments (admin only)
        /[id]
          route.ts  # DELETE, PATCH tournaments (admin only)
  /tournament
    /[id]
      page.tsx      # Main game view (Client Component)
  /admin
    page.tsx        # Admin panel (admin only)
  page.tsx          # Home page
/lib
  auth.ts           # NextAuth configuration and helpers
  db.ts             # MongoDB connection
  game-logic.ts     # Helper functions for shuffling and pairing
  models.ts         # Mongoose models (Tournament, User)
/components
  /auth
    SignInButton.tsx  # Google sign-in button
    UserMenu.tsx      # User avatar dropdown
    AuthHeader.tsx    # Conditional auth UI
```

## Authentication

### Setup
NextAuth.js v5 with Google OAuth provider. Configuration in `/lib/auth.ts`.

### Environment Variables
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random-secret>
GOOGLE_CLIENT_ID=<from-google-cloud-console>
GOOGLE_CLIENT_SECRET=<from-google-cloud-console>
ADMIN_EMAILS=admin1@gmail.com,admin2@gmail.com
```

### Authorization Rules
| Action | Requirement |
|--------|-------------|
| View tournament | Public (anyone with link) |
| Create tournament | Must be signed in |
| Modify tournament | Must be tournament owner (or legacy tournament) |
| Admin panel access | Must be signed in + email in ADMIN_EMAILS |
| Admin actions | Must be signed in + email in ADMIN_EMAILS |

Key Algorithm: Pairing Logic (in game-logic.ts)
When "Start Tournament" or "Start Next Round" is clicked:

Filter: Get all players where isEliminated is false.

Shuffle: Randomize the array of active players.

Chunk: Iterate through the array in groups of 4.

If 4 players are available: Create a Match (Player 0 & 1 vs Player 2 & 3).

If < 4 players remain (remainder): Add them to the byes array for this round.

Save: Push new Round object to tournament.rounds.

API Routes
POST /api/tournament

Body: { name, password }

Returns: { tournamentId }

GET /api/tournament/[id]

Returns: Full Tournament object.

Security: If a password is set, the frontend should verify it (or simple client-side check for this minimal scope).

PUT /api/tournament/[id]/add-players

Body: { players: ["Name1", "Name2"] }

POST /api/tournament/[id]/start

Triggers the first round pairing logic.

POST /api/tournament/[id]/match-result

Body: { roundIndex, matchId, winnerTeam: 1 | 2 }

Logic: Updates the match, sets losers' isEliminated = true.

POST /api/tournament/[id]/next-round

Triggers pairing logic for the next round.

UI Requirements
Responsiveness: Must work on mobile (players might check brackets on phones).

Loading States: Show simple spinners when fetching DB data.

Error Handling: Alert if user tries to start tournament with < 4 players.