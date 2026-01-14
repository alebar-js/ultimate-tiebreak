import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Tournament } from '@/lib/models';
import { serializeTournament } from '@/lib/serialize';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Simple password verification
function verifyAdminPassword(request: NextRequest): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD environment variable not set');
    return false;
  }

  const providedPassword = request.headers.get('X-Admin-Password');
  return providedPassword === adminPassword;
}

// GET - List all tournaments
export async function GET(request: NextRequest) {
  try {
    if (!verifyAdminPassword(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const tournaments = await Tournament.find().sort({ createdAt: -1 });
    
    const serializedTournaments = tournaments.map(tournament => ({
      ...serializeTournament(tournament),
      // Add summary info for admin view
      playerCount: tournament.players.length,
      activePlayerCount: tournament.players.filter(p => !p.isEliminated).length,
      roundCount: tournament.rounds.length,
      completedMatchesCount: tournament.rounds.reduce((total, round) => 
        total + round.matches.filter(m => m.winnerTeam !== null).length, 0
      ),
    }));

    return NextResponse.json(serializedTournaments);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournaments' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a tournament
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    if (!verifyAdminPassword(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

// PATCH - Reset tournament state
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    if (!verifyAdminPassword(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
