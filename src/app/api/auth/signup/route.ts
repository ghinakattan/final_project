import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password, fullName,
      //  firebase_token
       } = body;

    // Validate input
    if (!phone || !password || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Add your signup logic here
    // 1. Check if user already exists
    // 2. Hash password
    // 3. Create user in database
    // 4. Generate session/token

    await auth.signup(phone, password, fullName, "STR");

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 