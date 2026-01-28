import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Tournament } from '@/lib/models';
import { serializeTournament } from '@/lib/serialize';
import { auth, isAdminEmail } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE - Delete a tournament (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { id } = await params;

    await connectDB();

    const tournament = await Tournament.findByIdAndDelete(id);

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    console.error('Error deleting tournament:', error);
    return NextResponse.json(
      { error: 'Failed to delete tournament' },
      { status: 500 }
    );
  }
}

// PATCH - Reset tournament state (admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

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
    console.error('Error resetting tournament:', error);
    return NextResponse.json(
      { error: 'Failed to reset tournament' },
      { status: 500 }
    );
  }
}
