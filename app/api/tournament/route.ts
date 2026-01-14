import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Tournament } from '@/lib/models';
import type { CreateTournamentInput } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: CreateTournamentInput = await request.json();

    if (!body.name || !body.password) {
      return NextResponse.json(
        { error: 'Name and password are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const tournament = await Tournament.create({
      name: body.name.trim(),
      password: body.password,
      status: 'PENDING',
      currentRound: 0,
      players: [],
      rounds: [],
    });

    return NextResponse.json(
      { tournamentId: tournament._id.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating tournament:', error);
    return NextResponse.json(
      { error: 'Failed to create tournament' },
      { status: 500 }
    );
  }
}
