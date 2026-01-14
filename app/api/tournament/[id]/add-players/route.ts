import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Tournament } from '@/lib/models';
import { generatePlayerId } from '@/lib/game-logic';
import type { AddPlayersInput, IPlayer } from '@/lib/types';
import { serializeTournament } from '@/lib/serialize';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body: AddPlayersInput = await request.json();

    if (!body.players || !Array.isArray(body.players) || body.players.length === 0) {
      return NextResponse.json(
        { error: 'Players array is required' },
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

    if (tournament.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cannot add players to an active or completed tournament' },
        { status: 400 }
      );
    }

    const newPlayers: IPlayer[] = body.players
      .map((name) => name.trim())
      .filter((name) => name.length > 0)
      .map((name) => ({
        id: generatePlayerId(),
        name,
        isEliminated: false,
      }));

    tournament.players.push(...newPlayers);
    await tournament.save();

    return NextResponse.json(serializeTournament(tournament));
  } catch (error) {
    console.error('Error adding players:', error);
    return NextResponse.json(
      { error: 'Failed to add players' },
      { status: 500 }
    );
  }
}
