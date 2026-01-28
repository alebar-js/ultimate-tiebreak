import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Tournament } from '@/lib/models';
import { auth } from '@/lib/auth';
import type { CreateTournamentInput } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be signed in to create a tournament' },
        { status: 401 }
      );
    }

    const body: CreateTournamentInput = await request.json();

    // Validation
    if (!body.name || !body.password) {
      return NextResponse.json(
        { error: 'Name and password are required' },
        { status: 400 }
      );
    }

    // Sanitize and validate name
    const sanitizedName = body.name.trim().slice(0, 128).replace(/[<>]/g, '');
    
    if (sanitizedName.length === 0) {
      return NextResponse.json(
        { error: 'Tournament name cannot be empty' },
        { status: 400 }
      );
    }

    if (sanitizedName.length < 3) {
      return NextResponse.json(
        { error: 'Tournament name must be at least 3 characters' },
        { status: 400 }
      );
    }

    // Validate password
    if (body.password.length < 4) {
      return NextResponse.json(
        { error: 'Password must be at least 4 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check for duplicate tournament names
    const existingTournament = await Tournament.findOne({ 
      name: { $regex: sanitizedName, $options: 'i' } 
    });

    if (existingTournament) {
      return NextResponse.json(
        { error: 'A tournament with this name already exists' },
        { status: 409 }
      );
    }

    const tournament = await Tournament.create({
      name: sanitizedName,
      password: body.password,
      status: 'PENDING',
      currentRound: 0,
      players: [],
      rounds: [],
      ownerId: session.user.email,
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
