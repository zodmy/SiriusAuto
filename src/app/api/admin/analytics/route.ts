import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

async function verifyAdminToken(request: NextRequest) {
  const token = request.cookies.get('adminToken')?.value;

  if (!token) {
    return false;
  }

  try {
    verify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Перевіряємо авторизацію адміністратора
    const isAdmin = await verifyAdminToken(request);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Неавторизований доступ' }, { status: 401 });
    }

    // Отримуємо дані за останні 30 днів
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Загальна статистика
    const [
      totalOrders,
      totalProducts,
      totalUsers,
      totalCategories,
      totalRevenue,
      recentOrders,
      pendingOrders,
      completedOrders
    ] = await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count(),
      prisma.category.count(),
      prisma.order.aggregate({
        where: {
          status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED'] }
        },
        _sum: { totalPrice: true }
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.order.count({
        where: {
          status: 'PENDING'
        }
      }),
      prisma.order.count({
        where: {
          status: 'COMPLETED'
        }
      })
    ]);

    // Статистика замовлень по днях (останні 7 днів)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyOrders = await prisma.order.groupBy({
      by: ['orderDate'],
      where: {
        orderDate: { gte: sevenDaysAgo }
      },
      _count: { id: true },
      _sum: { totalPrice: true }
    });

    // Топ продукти за останній місяць
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: thirtyDaysAgo }
        }
      },
      _sum: { quantity: true },
      _count: { id: true },
      orderBy: {
        _sum: { quantity: 'desc' }
      },
      take: 5
    });

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, price: true }
        });
        return {
          ...item,
          product
        };
      })
    );

    // Статистика по категоріях
    const categoryStats = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            products: true
          }
        }
      },
      take: 10
    });

    // Останні замовлення
    const latestOrders = await prisma.order.findMany({
      select: {
        id: true,
        totalPrice: true,
        status: true,
        orderDate: true,
        customerFirstName: true,
        customerLastName: true
      },
      orderBy: {
        orderDate: 'desc'
      },
      take: 5
    });

    // Статистика по статусах замовлень
    const orderStatusStats = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    // Статистика по методах оплати
    const paymentMethodStats = await prisma.order.groupBy({
      by: ['paymentMethod'],
      _count: { id: true }
    });

    return NextResponse.json({
      summary: {
        totalOrders,
        totalProducts,
        totalUsers,
        totalCategories,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        recentOrders,
        pendingOrders,
        completedOrders
      },
      dailyOrders: dailyOrders.map(order => ({
        date: order.orderDate.toISOString().split('T')[0],
        count: order._count.id,
        revenue: order._sum.totalPrice || 0
      })),
      topProducts: topProductsWithDetails,
      categoryStats,
      latestOrders,
      orderStatusStats,
      paymentMethodStats
    });

  } catch (error) {
    console.error('Помилка отримання аналітики:', error);
    return NextResponse.json(
      { error: 'Помилка сервера' },
      { status: 500 }
    );
  }
}
