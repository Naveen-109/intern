import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const invoiceTrendsRouter = Router();

invoiceTrendsRouter.get('/', async (req, res) => {
  try {
    const { months = '12' } = req.query;
    const monthsCount = parseInt(months as string, 10);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsCount);

    const invoices = await prisma.invoice.findMany({
      where: {
        issueDate: {
          gte: startDate,
        },
      },
      select: {
        issueDate: true,
        total: true,
      },
      orderBy: {
        issueDate: 'asc',
      },
    });

    // Group by month
    const monthlyData: Record<string, { count: number; total: number }> = {};

    invoices.forEach((invoice) => {
      const monthKey = invoice.issueDate.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { count: 0, total: 0 };
      }
      monthlyData[monthKey].count += 1;
      monthlyData[monthKey].total += Number(invoice.total);
    });

    const trends = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        invoiceCount: data.count,
        totalSpend: Number(data.total),
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.json(trends);
  } catch (error) {
    console.error('Error fetching invoice trends:', error);
    res.status(500).json({ error: 'Failed to fetch invoice trends' });
  }
});

