import prisma from '@/app/lib/prisma';
import { compare } from 'bcrypt';
import { SignJWT } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const OPTIONS = async () => {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
};

export const POST = async (request: NextRequest) => {
  try {
    const { email, password } = await request.json();

    // Validação de entrada
    if (!email || !password) {
      return new NextResponse(JSON.stringify({ error: 'Email e senha são obrigatórios' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Busca usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Email não existe' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Verifica se a senha é válida
    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return new NextResponse(JSON.stringify({ error: 'Senha ou email incorretos' }), {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Gera o payload para o JWT
    const payload = {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    // Assina o JWT com `jose`
    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    // Retorna o token e ID do usuário
    return new NextResponse(JSON.stringify({ token, userId: user.id, isAdmin: user.isAdmin }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error('Error during login:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
