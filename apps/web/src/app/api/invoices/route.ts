import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '50';
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const vendorId = searchParams.get('vendorId');
    const sortBy = searchParams.get('sortBy') || 'issueDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { vendor: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (vendorId) {
      where.vendorId = vendorId;
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          vendor: {
            select: {
              id: true,
              name: true,
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder as 'asc' | 'desc',
        },
        skip,
        take: limitNum,
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      data: invoices.map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        vendor: invoice.vendor.name,
        vendorId: invoice.vendor.id,
        customer: invoice.customer?.name || null,
        issueDate: invoice.issueDate.toISOString(),
        dueDate: invoice.dueDate?.toISOString() || null,
        amount: Number(invoice.total),
        status: invoice.status,
        currency: invoice.currency,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

