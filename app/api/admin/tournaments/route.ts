import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Tournament } from '@/lib/models';
import { serializeTournament } from '@/lib/serialize';
import { auth, isAdminEmail } from '@/lib/auth';

// GET - List all tournaments (admin only)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email || !isAdminEmail(session.user.email)) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
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
      ownerId: tournament.ownerId || null,
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
