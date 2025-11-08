import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let whereClause: any = {};

    if (startDate || endDate) {
      whereClause.dueDate = {};
      if (startDate) {
        whereClause.dueDate.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.dueDate.lte = new Date(endDate);
      }
    }

    // Get invoices with due dates (expected cash outflow)
    const invoices = await prisma.invoice.findMany({
      where: {
        ...whereClause,
        status: {
          in: ['PENDING', 'OVERDUE'],
        },
        dueDate: {
          not: null,
        },
      },
      select: {
        dueDate: true,
        total: true,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    // Group by date
    const dailyOutflow: Record<string, number> = {};

    invoices.forEach((invoice) => {
      if (invoice.dueDate) {
        const dateKey = invoice.dueDate.toISOString().split('T')[0];
        dailyOutflow[dateKey] = (dailyOutflow[dateKey] || 0) + Number(invoice.total);
      }
    });

    const result = Object.entries(dailyOutflow)
      .map(([date, amount]) => ({
        date,
        amount: Number(amount),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching cash outflow:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cash outflow' },
      { status: 500 }
    );
  }
}

