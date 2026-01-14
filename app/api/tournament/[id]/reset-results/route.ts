import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Tournament } from '@/lib/models';
import { serializeTournament } from '@/lib/serialize';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    await connectDB();

    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    // Reset all match results
    tournament.rounds.forEach(round => {
      round.matches.forEach(match => {
        match.winnerTeam = null;
      });
      round.isComplete = false;
    });

    // Reset all player elimination status
    tournament.players.forEach(player => {
      player.isEliminated = false;
    });

    // Reset tournament state
    tournament.currentRound = 0;
    tournament.status = 'PENDING';

    await tournament.save();

    return NextResponse.json(serializeTournament(tournament));
  } catch (error) {
    console.error('Error resetting tournament results:', error);
    return NextResponse.json(
      { error: 'Failed to reset tournament results' },
      { status: 500 }
    );
  }
}
