import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Tournament } from '@/lib/models';
import { serializeTournament } from '@/lib/serialize';
import { getLosingTeamPlayerIds, checkVictoryCondition, createRound, generatePairings } from '@/lib/game-logic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const roundNumber = parseInt(searchParams.get('roundNumber') || '');

    if (isNaN(roundNumber) || roundNumber < 0) {
      return NextResponse.json(
        { error: 'Valid round number is required' },
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

    // Find the round to delete
    const roundIndex = tournament.rounds.findIndex(r => r.roundNumber === roundNumber);
    
    if (roundIndex === -1) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404 }
      );
    }

    const roundToDelete = tournament.rounds[roundIndex];

    // Cannot delete the current (last) round if it has completed matches
    const isCurrentRound = roundIndex === tournament.rounds.length - 1;
    if (isCurrentRound && roundToDelete.matches.some(m => m.winnerTeam !== null)) {
      return NextResponse.json(
        { error: 'Cannot delete current round with completed matches. Use undo match result instead.' },
        { status: 400 }
      );
    }

    // Cannot delete previous rounds (they're locked)
    if (!isCurrentRound) {
      return NextResponse.json(
        { error: 'Cannot delete previous rounds - they are locked' },
        { status: 400 }
      );
    }

    // Restore players who were eliminated in this round
    for (const match of roundToDelete.matches) {
      if (match.winnerTeam !== null) {
        const losingPlayerIds = getLosingTeamPlayerIds(match);
        for (const playerId of losingPlayerIds) {
          const player = tournament.players.find(p => p.id === playerId);
          if (player) {
            player.isEliminated = false;
          }
        }
      }
    }

    // Remove the round
    tournament.rounds.splice(roundIndex, 1);
    
    // Update current round if necessary
    if (tournament.rounds.length === 0) {
      tournament.currentRound = 0;
      tournament.status = 'PENDING';
    } else {
      tournament.currentRound = tournament.rounds[tournament.rounds.length - 1].roundNumber;
    }

    await tournament.save();

    return NextResponse.json(serializeTournament(tournament));
  } catch (error) {
    console.error('Error deleting round:', error);
    return NextResponse.json(
      { error: 'Failed to delete round' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const roundNumber = parseInt(searchParams.get('roundNumber') || '');

    if (isNaN(roundNumber) || roundNumber < 0) {
      return NextResponse.json(
        { error: 'Valid round number is required' },
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

    // Find the round to re-draw
    const roundIndex = tournament.rounds.findIndex(r => r.roundNumber === roundNumber);
    
    if (roundIndex === -1) {
      return NextResponse.json(
        { error: 'Round not found' },
        { status: 404 }
      );
    }

    const roundToRedraw = tournament.rounds[roundIndex];

    // Cannot re-draw rounds with completed matches
    if (roundToRedraw.matches.some(m => m.winnerTeam !== null)) {
      return NextResponse.json(
        { error: 'Cannot re-draw round with completed matches' },
        { status: 400 }
      );
    }

    // Cannot re-draw previous rounds (they're locked)
    const isCurrentRound = roundIndex === tournament.rounds.length - 1;
    if (!isCurrentRound) {
      return NextResponse.json(
        { error: 'Cannot re-draw previous rounds - they are locked' },
        { status: 400 }
      );
    }

    // Generate new pairings for the round
    const { matches, byes } = generatePairings(tournament.players);

    // Update the round with new matches
    roundToRedraw.matches = matches;
    roundToRedraw.byes = byes;
    roundToRedraw.isComplete = matches.length === 0;

    await tournament.save();

    return NextResponse.json(serializeTournament(tournament));
  } catch (error) {
    console.error('Error re-drawing round:', error);
    return NextResponse.json(
      { error: 'Failed to re-draw round' },
      { status: 500 }
    );
  }
}
