import prisma from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const PATCH = async (request: NextRequest) => {
  try {
    const headers = new Headers();
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Access-Control-Allow-Methods', 'PATCH');
    headers.append('Access-Control-Allow-Headers', 'Content-Type');

    const { userId } = await request.json();

    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId, 10) },
      data: { isAdmin: true },
    });

    return new NextResponse(JSON.stringify(updatedUser), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to update user' }),
      { status: 500 }
    );
  }
};

export const OPTIONS = async () => {
  const headers = new Headers();
  headers.append('Access-Control-Allow-Origin', '*');
  headers.append('Access-Control-Allow-Methods', 'PATCH');
  headers.append('Access-Control-Allow-Headers', 'Content-Type');

  return new NextResponse(null, { status: 204, headers });
};
