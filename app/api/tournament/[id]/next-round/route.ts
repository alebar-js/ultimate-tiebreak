import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Tournament } from '@/lib/models';
import { serializeTournament } from '@/lib/serialize';
import { createRound, checkVictoryCondition } from '@/lib/game-logic';
import { auth, canModifyTournament } from '@/lib/auth';

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

    // Verify ownership (legacy tournaments without ownerId can be modified by anyone)
    const session = await auth();
    if (!canModifyTournament(session?.user?.email, tournament.ownerId)) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this tournament' },
        { status: 403 }
      );
    }

    if (tournament.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Tournament is not active' },
        { status: 400 }
      );
    }

    const currentRound = tournament.rounds[tournament.rounds.length - 1];

    if (!currentRound || !currentRound.isComplete) {
      return NextResponse.json(
        { error: 'Current round is not complete' },
        { status: 400 }
      );
    }

    if (checkVictoryCondition(tournament.players)) {
      tournament.status = 'COMPLETED';
      await tournament.save();

      return NextResponse.json({
        ...tournament.toObject(),
        _id: tournament._id.toString(),
      });
    }

    const nextRoundNumber = tournament.currentRound + 1;
    const nextRound = createRound(tournament.players, nextRoundNumber);

    tournament.currentRound = nextRoundNumber;
    tournament.rounds.push(nextRound);

    await tournament.save();

    return NextResponse.json(serializeTournament(tournament));
  } catch (error) {
    console.error('Error generating next round:', error);
    return NextResponse.json(
      { error: 'Failed to generate next round' },
      { status: 500 }
    );
  }
}
