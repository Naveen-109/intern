import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const vendorsRouter = Router();

vendorsRouter.get('/top10', async (req, res) => {
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

    res.json(vendorSpend);
  } catch (error) {
    console.error('Error fetching top vendors:', error);
    res.status(500).json({ error: 'Failed to fetch top vendors' });
  }
});

