import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Tournament } from '@/lib/models';
import { serializeTournament } from '@/lib/serialize';
import { createRound, createQualifierRound, getActivePlayers } from '@/lib/game-logic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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

    if (tournament.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Tournament has already started' },
        { status: 400 }
      );
    }

    const activePlayers = getActivePlayers(tournament.players);

    if (activePlayers.length < 4) {
      return NextResponse.json(
        { error: 'At least 4 players are required to start the tournament' },
        { status: 400 }
      );
    }

    // Check if a qualifier round is needed
    const qualifierRound = createQualifierRound(tournament.players);

    if (qualifierRound) {
      // Start with qualifier (round 0)
      tournament.status = 'ACTIVE';
      tournament.currentRound = 0;
      tournament.rounds.push(qualifierRound);
    } else {
      // No qualifier needed, start with round 1
      const firstRound = createRound(tournament.players, 1);
      tournament.status = 'ACTIVE';
      tournament.currentRound = 1;
      tournament.rounds.push(firstRound);
    }

    await tournament.save();

    return NextResponse.json(serializeTournament(tournament));
  } catch (error) {
    console.error('Error starting tournament:', error);
    return NextResponse.json(
      { error: 'Failed to start tournament' },
      { status: 500 }
    );
  }
}
