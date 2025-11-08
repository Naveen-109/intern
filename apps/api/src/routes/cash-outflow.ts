import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const cashOutflowRouter = Router();

cashOutflowRouter.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let whereClause: any = {};

    if (startDate || endDate) {
      whereClause.dueDate = {};
      if (startDate) {
        whereClause.dueDate.gte = new Date(startDate as string);
      }
      if (endDate) {
        whereClause.dueDate.lte = new Date(endDate as string);
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

    res.json(result);
  } catch (error) {
    console.error('Error fetching cash outflow:', error);
    res.status(500).json({ error: 'Failed to fetch cash outflow' });
  }
});

