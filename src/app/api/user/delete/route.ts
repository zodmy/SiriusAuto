import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
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

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Пароль є обов\'язковим для видалення облікового запису' },
        { status: 400 }
      );
    }

    // Знайти користувача
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Користувача не знайдено' },
        { status: 404 }
      );
    }

    // Перевірити пароль
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Неправильний пароль' },
        { status: 400 }
      );
    }

    // Видалити всі дані користувача в правильному порядку
    await prisma.$transaction(async (tx) => {
      // Спочатку видаляємо відгуки
      await tx.review.deleteMany({
        where: { userId: decoded.userId }
      });

      // Потім видаляємо елементи замовлень
      await tx.orderItem.deleteMany({
        where: {
          order: {
            userId: decoded.userId
          }
        }
      });

      // Потім видаляємо замовлення
      await tx.order.deleteMany({
        where: { userId: decoded.userId }
      });

      // Нарешті видаляємо користувача
      await tx.user.delete({
        where: { id: decoded.userId }
      });
    });    // Створити response та видалити cookie
    const response = NextResponse.json({
      message: 'Обліковий запис успішно видалено'
    });

    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    response.cookies.delete('selectedCar');
    response.cookies.delete('cart');

    return response;
  } catch (error) {
    console.error('Error deleting user account:', error); return NextResponse.json(
      { error: 'Помилка видалення облікового запису' },
      { status: 500 }
    );
  }
}
