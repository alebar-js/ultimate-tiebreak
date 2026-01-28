import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Tournament } from '@/lib/models';
import { serializeTournament } from '@/lib/serialize';
import { auth, canModifyTournament } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
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

    // Verify ownership (legacy tournaments without ownerId can be modified by anyone)
    const session = await auth();
    if (!canModifyTournament(session?.user?.email, tournament.ownerId)) {
      return NextResponse.json(
        { error: 'You do not have permission to modify this tournament' },
        { status: 403 }
      );
    }

    if (tournament.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cannot remove players from an active or completed tournament' },
        { status: 400 }
      );
    }

    const playerIndex = tournament.players.findIndex((p) => p.id === playerId);

    if (playerIndex === -1) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    tournament.players.splice(playerIndex, 1);
    await tournament.save();

    return NextResponse.json(serializeTournament(tournament));
  } catch (error) {
    console.error('Error removing player:', error);
    return NextResponse.json(
      { error: 'Failed to remove player' },
      { status: 500 }
    );
  }
}
