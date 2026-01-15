import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Tournament } from '@/lib/models';
import { generatePlayerId } from '@/lib/game-logic';
import { getDemoPlayers } from '@/lib/demo-player-names';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const playerCount = parseInt(body.playerCount);

    if (isNaN(playerCount) || playerCount < 4 || playerCount > 128) {
      return NextResponse.json(
        { error: 'Player count must be between 4 and 128' },
        { status: 400 }
      );
    }

    await connectDB();

    // Generate a unique demo tournament name
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const tournamentName = `Demo Tournament ${timestamp}`;

    // Get the first N demo player names
    const playerNames = getDemoPlayers(playerCount);

    // Create player objects
    const players = playerNames.map(name => ({
      id: generatePlayerId(),
      name,
      isEliminated: false,
    }));

    // Create the tournament
    const tournament = await Tournament.create({
      name: tournamentName,
      password: 'demo', // Fixed password for demo tournaments
      status: 'PENDING',
      currentRound: 0,
      players,
      rounds: [],
    });

    return NextResponse.json({
      tournamentId: tournament._id.toString(),
      password: 'demo',
    });
  } catch (error) {
    console.error('Error creating demo tournament:', error);
    return NextResponse.json(
      { error: 'Failed to create demo tournament' },
      { status: 500 }
    );
  }
}
