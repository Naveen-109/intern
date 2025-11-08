import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        payments: {
          select: {
            amount: true,
          },
        },
      },
    });

    const vendorSpend = vendors
      .map((vendor) => ({
        id: vendor.id,
        name: vendor.name,
        totalSpend: vendor.payments.reduce((sum, payment) => sum + Number(payment.amount), 0),
      }))
      .sort((a, b) => b.totalSpend - a.totalSpend)
      .slice(0, 10);

    return NextResponse.json(vendorSpend);
  } catch (error) {
    console.error('Error fetching top vendors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top vendors' },
      { status: 500 }
    );
  }
}

