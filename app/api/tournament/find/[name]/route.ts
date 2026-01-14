import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Tournament } from '@/lib/models';
import { serializeTournament } from '@/lib/serialize';

interface RouteParams {
  params: Promise<{ name: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { name } = await params;

    await connectDB();

    // Find tournament by name (case-insensitive)
    const tournament = await Tournament.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    }).lean();

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(serializeTournament(tournament));
  } catch (error) {
    console.error('Error finding tournament:', error);
    return NextResponse.json(
      { error: 'Failed to find tournament' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { name } = await params;
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find tournament by name and verify password
    const tournament = await Tournament.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    }).lean();

    if (!tournament) {
      return NextResponse.json(
        { error: 'Tournament not found' },
        { status: 404 }
      );
    }

    if (tournament.password !== password) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }

    return NextResponse.json(serializeTournament(tournament));
  } catch (error) {
    console.error('Error verifying tournament password:', error);
    return NextResponse.json(
      { error: 'Failed to verify tournament' },
      { status: 500 }
    );
  }
}
