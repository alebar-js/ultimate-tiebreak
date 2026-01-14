import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Tournament } from '@/lib/models';
import { serializeTournament } from '@/lib/serialize';
import { getLosingTeamPlayerIds, isRoundComplete, checkVictoryCondition } from '@/lib/game-logic';
import type { MatchResultInput } from '@/lib/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body: MatchResultInput = await request.json();

    if (!body.matchId || (body.winnerTeam !== 1 && body.winnerTeam !== 2)) {
      return NextResponse.json(
        { error: 'Match ID and winner team (1 or 2) are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    if (tournament.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Tournament is not active' },
        { status: 400 }
      );
    }

    const currentRound = tournament.rounds[tournament.rounds.length - 1];

    if (!currentRound) {
      return NextResponse.json(
        { error: 'No current round found' },
        { status: 400 }
      );
    }

    const match = currentRound.matches.find((m) => m.id === body.matchId);

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found in current round' },
        { status: 404 }
      );
    }

    if (match.winnerTeam !== null) {
      return NextResponse.json(
        { error: 'Match result has already been recorded' },
        { status: 400 }
      );
    }

    match.winnerTeam = body.winnerTeam;

    const losingPlayerIds = getLosingTeamPlayerIds(match);
    for (const playerId of losingPlayerIds) {
      const player = tournament.players.find((p) => p.id === playerId);
      if (player) {
        player.isEliminated = true;
      }
    }

    if (isRoundComplete(currentRound)) {
      currentRound.isComplete = true;

      if (checkVictoryCondition(tournament.players)) {
        tournament.status = 'COMPLETED';
      }
    }

    await tournament.save();

    return NextResponse.json(serializeTournament(tournament));
  } catch (error) {
    console.error('Error recording match result:', error);
    return NextResponse.json(
      { error: 'Failed to record match result' },
      { status: 500 }
    );
  }
}

// DELETE - Undo a match result
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.matchId) {
      return NextResponse.json(
        { error: 'Match ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    if (tournament.status === 'COMPLETED') {
      // Revert to ACTIVE if we're undoing
      tournament.status = 'ACTIVE';
    }

    if (tournament.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Tournament is not active' },
        { status: 400 }
      );
    }

    // Find the match - must be in the current round (previous rounds are locked)
    const currentRound = tournament.rounds[tournament.rounds.length - 1];

    if (!currentRound) {
      return NextResponse.json(
        { error: 'No current round found' },
        { status: 400 }
      );
    }

    const match = currentRound.matches.find((m: { id: string }) => m.id === body.matchId);

    if (!match) {
      // Check if match exists in a previous round (locked)
      const existsInPreviousRound = tournament.rounds.slice(0, -1).some((round: { matches: { id: string }[] }) =>
        round.matches.some((m: { id: string }) => m.id === body.matchId)
      );

      if (existsInPreviousRound) {
        return NextResponse.json(
          { error: 'Cannot undo results from previous rounds - they are locked' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    if (match.winnerTeam === null) {
      return NextResponse.json(
        { error: 'Match has no result to undo' },
        { status: 400 }
      );
    }

    // Get the losing team player IDs before clearing
    const losingPlayerIds = getLosingTeamPlayerIds(match);

    // Clear the match result
    match.winnerTeam = null;

    // Un-eliminate the losing players
    for (const playerId of losingPlayerIds) {
      const player = tournament.players.find((p: { id: string }) => p.id === playerId);
      if (player) {
        player.isEliminated = false;
      }
    }

    // Mark round as incomplete
    currentRound.isComplete = false;

    await tournament.save();

    return NextResponse.json(serializeTournament(tournament));
  } catch (error) {
    console.error('Error undoing match result:', error);
    return NextResponse.json(
      { error: 'Failed to undo match result' },
      { status: 500 }
    );
  }
}
