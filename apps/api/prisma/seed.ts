import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface InvoiceData {
  id?: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate?: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  subtotal: number;
  tax?: number;
  total: number;
  currency?: string;
  notes?: string;
  vendor: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    category?: string;
  };
  customer?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  lineItems?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    category?: string;
    total: number;
  }>;
  payments?: Array<{
    amount: number;
    paymentDate: string;
    method: 'BANK_TRANSFER' | 'CHECK' | 'CREDIT_CARD' | 'CASH' | 'OTHER';
    reference?: string;
  }>;
}

async function main() {
  console.log('🌱 Starting database seed...');

  // Check if data file exists
  const dataPath = path.join(__dirname, '../../data/Analytics_Test_Data.json');
  
  if (!fs.existsSync(dataPath)) {
    console.log('⚠️  Analytics_Test_Data.json not found. Creating sample data...');
    await createSampleData();
    return;
  }

  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const invoices: InvoiceData[] = JSON.parse(rawData);

  console.log(`📊 Found ${invoices.length} invoices to import`);

  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.lineItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.vendor.deleteMany();

  // Create vendors and customers map to avoid duplicates
  const vendorMap = new Map<string, string>();
  const customerMap = new Map<string, string>();

  for (const invoiceData of invoices) {
    // Get or create vendor
    let vendorId = vendorMap.get(invoiceData.vendor.name);
    if (!vendorId) {
      const vendor = await prisma.vendor.upsert({
        where: { name: invoiceData.vendor.name },
        update: {},
        create: {
          name: invoiceData.vendor.name,
          email: invoiceData.vendor.email,
          phone: invoiceData.vendor.phone,
          address: invoiceData.vendor.address,
          category: invoiceData.vendor.category,
        },
      });
      vendorId = vendor.id;
      vendorMap.set(invoiceData.vendor.name, vendorId);
    }

    // Get or create customer
    let customerId: string | undefined;
    if (invoiceData.customer) {
      customerId = customerMap.get(invoiceData.customer.name);
      if (!customerId) {
        const customer = await prisma.customer.upsert({
          where: { name: invoiceData.customer.name },
          update: {},
          create: {
            name: invoiceData.customer.name,
            email: invoiceData.customer.email,
            phone: invoiceData.customer.phone,
            address: invoiceData.customer.address,
          },
        });
        customerId = customer.id;
        customerMap.set(invoiceData.customer.name, customerId);
      }
    }

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: invoiceData.invoiceNumber,
        vendorId,
        customerId,
        issueDate: new Date(invoiceData.issueDate),
        dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : null,
        status: invoiceData.status,
        subtotal: invoiceData.subtotal,
        tax: invoiceData.tax || 0,
        total: invoiceData.total,
        currency: invoiceData.currency || 'USD',
        notes: invoiceData.notes,
        lineItems: invoiceData.lineItems
          ? {
              create: invoiceData.lineItems.map((item) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                category: item.category,
                total: item.total,
              })),
            }
          : undefined,
        payments: invoiceData.payments
          ? {
              create: invoiceData.payments.map((payment) => ({
                vendorId,
                amount: payment.amount,
                paymentDate: new Date(payment.paymentDate),
                method: payment.method,
                reference: payment.reference,
              })),
            }
          : undefined,
      },
    });

    console.log(`✅ Imported invoice ${invoice.invoiceNumber}`);
  }

  console.log('✨ Seed completed successfully!');
}

async function createSampleData() {
  // Create sample vendors
  const vendor1 = await prisma.vendor.create({
    data: {
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      category: 'Technology',
    },
  });

  const vendor2 = await prisma.vendor.create({
    data: {
      name: 'Global Supplies Inc',
      email: 'info@globalsupplies.com',
      category: 'Office Supplies',
    },
  });

  // Create sample customer
  const customer = await prisma.customer.create({
    data: {
      name: 'Tech Solutions LLC',
      email: 'contact@techsolutions.com',
    },
  });

  // Create sample invoices
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-001',
      vendorId: vendor1.id,
      customerId: customer.id,
      issueDate: new Date('2024-01-15'),
      dueDate: new Date('2024-02-15'),
      status: 'PAID',
      subtotal: 5000,
      tax: 500,
      total: 5500,
      lineItems: {
        create: [
          {
            description: 'Software License',
            quantity: 10,
            unitPrice: 500,
            category: 'Software',
            total: 5000,
          },
        ],
      },
      payments: {
        create: [
          {
            vendorId: vendor1.id,
            amount: 5500,
            paymentDate: new Date('2024-02-10'),
            method: 'BANK_TRANSFER',
          },
        ],
      },
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-002',
      vendorId: vendor2.id,
      customerId: customer.id,
      issueDate: new Date('2024-01-20'),
      dueDate: new Date('2024-02-20'),
      status: 'PENDING',
      subtotal: 2000,
      tax: 200,
      total: 2200,
      lineItems: {
        create: [
          {
            description: 'Office Supplies',
            quantity: 100,
            unitPrice: 20,
            category: 'Supplies',
            total: 2000,
          },
        ],
      },
    },
  });

  console.log('✨ Sample data created successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

