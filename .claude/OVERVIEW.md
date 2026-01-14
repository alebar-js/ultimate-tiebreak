# Project Overview: Ultimate Tiebreak Manager

## Goal
Build a responsive web application to manage a "Ultimate Tiebreak" tennis tournament. The tournament is unique because players sign up individually, but matches are played in doubles. Partners change every round, and losers are eliminated.

## Core Rules
1.  **Format:** Single Elimination (mostly).
2.  **Matches:** Doubles Tie-break (first to X points, user managed).
3.  **Pairing:**
    -   Every round, the pool of active players is shuffled.
    -   Players are paired randomly into teams (Team A vs Team B).
    -   **Constraint:** If the number of players is not divisible by 4, the remaining players (1, 2, or 3) receive a "Bye" and automatically advance to the next round without playing.
4.  **Elimination:**
    -   The losing team (2 players) is eliminated from the tournament.
    -   The winning team (2 players) remains in the pool for the next round.
5.  **Victory Condition:** The tournament ends when there are fewer than 4 players remaining. These players are declared the Champions.

## User Flows

### 1. Home Page
-   **Action:** User sees two primary options:
    -   "Create New Tournament"
    -   "Continue Existing Tournament"

### 2. Create Tournament
-   **Input:** Tournament Name (String), Tournament Password (String).
-   **Action:** Submit creates a generic tournament ID/URL and redirects to the Lobby.

### 3. Player Registration (Lobby)
-   **State:** Tournament is in "Pending" state.
-   **Input:**
    -   Single Entry: Text input for one name + "Add" button.
    -   Bulk Entry: Textarea for comma-separated names (e.g., "John Doe, Jane Smith, Roger") + "Import" button.
-   **List:** Display list of registered players with a "Remove" option.
-   **Action:** "Start Tournament" button (Visible only if Player Count >= 4).

### 4. Tournament Bracket/Dashboard
-   **State:** Tournament is in "Active" state.
-   **View:** Displays the current Round Number.
-   **List:** Shows a card for each Match generated for this round.
    -   *Example:* "John & Mike" VS "Sarah & Steve".
-   **List:** Shows a section for "Byes" (Players waiting for next round).
-   **Action:** "Finish Match" buttons on each card.
    -   User selects which pair won.
    -   UI updates visually to show winners/losers.
-   **Transition:** When all matches in the round are complete, a "Start Next Round" button appears.
    -   Clicking this generates new pairings from the survivors + byes.

### 5. Game Over
-   **State:** Tournament is "Completed".
-   **View:** Confetti/Banner displaying the final remaining players as Winners.