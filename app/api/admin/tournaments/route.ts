import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Tournament } from '@/lib/models';
import { serializeTournament } from '@/lib/serialize';

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
