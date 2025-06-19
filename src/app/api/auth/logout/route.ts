import { NextResponse } from 'next/server';
import { serialize } from 'cookie';

export async function POST() {
  try {
    const authTokenCookie = serialize('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    const selectedCarCookie = serialize('selectedCar', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    const cartCookie = serialize('cart', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    const headers = new Headers();
    headers.append('Set-Cookie', authTokenCookie);
    headers.append('Set-Cookie', selectedCarCookie);
    headers.append('Set-Cookie', cartCookie);
    headers.append('Content-Type', 'application/json');

    return new NextResponse(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: headers,
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Внутрішня помилка сервера' },
      { status: 500 }
    );
  }
}
