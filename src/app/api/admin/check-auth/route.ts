import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await checkAdmin({ req: request });

    if (isAdmin) {
      return NextResponse.json({ success: true, isAdmin: true });
    } else {
      return NextResponse.json({ success: false, isAdmin: false }, { status: 401 });
    }
  } catch (error) {
    console.error('Помилка перевірки авторизації:', error);
    return NextResponse.json({ success: false, error: 'Внутрішня помилка сервера' }, { status: 500 });
  }
}
