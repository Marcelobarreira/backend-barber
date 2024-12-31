import prisma from '@/app/lib/prisma';
import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest) => {
  try {
    const headers = new Headers();
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Access-Control-Allow-Methods', 'POST');
    headers.append('Access-Control-Allow-Headers', 'Content-Type');

    const { email, password, username } = await request.json();

    if (!email || !password || !username) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse(
        JSON.stringify({ error: 'User already exists' }),
        { status: 400, headers }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        name: username,
        password: hashedPassword,
      },
    });

    return new NextResponse(JSON.stringify(newUser), {
      status: 201,
      headers,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to create user' }),
      { status: 500 }
    );
  }
};

export const OPTIONS = async () => {
  const headers = new Headers();
  headers.append('Access-Control-Allow-Origin', '*');
  headers.append('Access-Control-Allow-Methods', 'POST');
  headers.append('Access-Control-Allow-Headers', 'Content-Type');

  return new NextResponse(null, { status: 204, headers });
};
