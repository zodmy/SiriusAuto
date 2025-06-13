import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Успішно вийшли з системи'
<<<<<<< Updated upstream
    }); response.cookies.set('adminToken', '', {
=======
    });

    response.cookies.set('adminToken', '', {
>>>>>>> Stashed changes
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return response;
  } catch (error) {
    console.error('Помилка при виході:', error);
    return NextResponse.json(
      { error: 'Помилка при виході з системи' },
      { status: 500 }
    );
  }
}
