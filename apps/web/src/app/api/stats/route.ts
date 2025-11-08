import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);

    // Total Spend (YTD)
    const totalSpendResult = await prisma.payment.aggregate({
      where: {
        paymentDate: {
          gte: yearStart,
        },
      },
      _sum: {
        amount: true,
      },
    });
    const totalSpend = totalSpendResult._sum.amount || 0;

    // Total Invoices Processed
    const totalInvoices = await prisma.invoice.count({
      where: {
        issueDate: {
          gte: yearStart,
        },
      },
    });

    // Documents Uploaded (assuming this is invoices count)
    const documentsUploaded = await prisma.invoice.count();

    // Average Invoice Value
    const avgInvoiceResult = await prisma.invoice.aggregate({
      where: {
        issueDate: {
          gte: yearStart,
        },
      },
      _avg: {
        total: true,
      },
    });
    const averageInvoiceValue = avgInvoiceResult._avg.total || 0;

    return NextResponse.json({
      totalSpend: Number(totalSpend),
      totalInvoicesProcessed: totalInvoices,
      documentsUploaded,
      averageInvoiceValue: Number(averageInvoiceValue),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

