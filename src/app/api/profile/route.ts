import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Токен не знайдено' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      email: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Користувач не знайдений' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Недійсний токен' },
      { status: 401 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Токен не знайдено' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      email: string;
    }; const { firstName, lastName, email, currentPassword, newPassword } = await request.json();

    if (!firstName) {
      return NextResponse.json(
        { error: 'Ім\'я є обов\'язковим' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email є обов\'язковим' },
        { status: 400 }
      );
    }

    if (email !== decoded.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser && existingUser.id !== decoded.userId) {
        return NextResponse.json(
          { error: 'Цей email вже використовується' },
          { status: 400 }
        );
      }
    } const updateData: {
      firstName: string;
      lastName: string | null;
      email: string;
      passwordHash?: string;
    } = {
      firstName,
      lastName: lastName || null,
      email,
    };

    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Поточний пароль є обов\'язковим для зміни пароля' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Новий пароль повинен містити принаймні 6 символів' },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Користувач не знайдений' },
          { status: 404 }
        );
      }

      const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);

      if (!passwordMatch) {
        return NextResponse.json(
          { error: 'Неправильний поточний пароль' },
          { status: 400 }
        );
      }

      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
