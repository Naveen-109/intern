import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const categorySpendRouter = Router();

categorySpendRouter.get('/', async (req, res) => {
  try {
    const lineItems = await prisma.lineItem.findMany({
      where: {
        category: {
          not: null,
        },
      },
      select: {
        category: true,
        total: true,
      },
    });

    const categoryTotals: Record<string, number> = {};

    lineItems.forEach((item) => {
      const category = item.category || 'Uncategorized';
      categoryTotals[category] = (categoryTotals[category] || 0) + Number(item.total);
    });

    // Also include vendor categories
    const vendors = await prisma.vendor.findMany({
      where: {
        category: {
          not: null,
        },
      },
      include: {
        payments: {
          select: {
            amount: true,
          },
        },
      },
    });

    vendors.forEach((vendor) => {
      const category = vendor.category || 'Uncategorized';
      const vendorSpend = vendor.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      categoryTotals[category] = (categoryTotals[category] || 0) + vendorSpend;
    });

    const result = Object.entries(categoryTotals)
      .map(([category, total]) => ({
        category,
        total: Number(total),
      }))
      .sort((a, b) => b.total - a.total);

    res.json(result);
  } catch (error) {
    console.error('Error fetching category spend:', error);
    res.status(500).json({ error: 'Failed to fetch category spend' });
  }
});

