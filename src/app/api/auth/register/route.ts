import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { email, password, firstName, lastName, telegramId } = data;

    if (!email || !password || !firstName) {
      return NextResponse.json({ error: 'Email, пароль та ім\'я є обов\'язковими' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Користувач з таким email вже існує' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        telegramId: telegramId ? BigInt(telegramId) : null,
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error('Помилка реєстрації користувача:', error);
    return NextResponse.json({ error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}
