import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const statsRouter = Router();

statsRouter.get('/', async (req, res) => {
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

    res.json({
      totalSpend: Number(totalSpend),
      totalInvoicesProcessed: totalInvoices,
      documentsUploaded,
      averageInvoiceValue: Number(averageInvoiceValue),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

