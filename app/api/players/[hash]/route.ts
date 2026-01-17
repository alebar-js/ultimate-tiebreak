import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Tournament } from '@/lib/models';
import { decodeTournamentId } from '@/lib/hash';
import { serializeTournament } from '@/lib/serialize';

interface RouteParams {
  params: Promise<{ hash: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { hash } = await params;

    // Decode the hash to get tournament ID
    let tournamentId: string;
    try {
      tournamentId = decodeTournamentId(hash);
    } catch {
      return NextResponse.json(
        { error: 'Invalid tournament link' },
        { status: 400 }
      );
    }

    await connectDB();

    const tournament = await Tournament.findById(tournamentId).lean();

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    // Return serialized tournament data
    return NextResponse.json(serializeTournament(tournament));
  } catch (error) {
    console.error('Error fetching tournament for player:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tournament' },
      { status: 500 }
    );
  }
}
