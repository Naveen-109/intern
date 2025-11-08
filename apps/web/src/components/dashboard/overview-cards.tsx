'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getStats, type Stats } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, FileText, Upload, DollarSign } from 'lucide-react';

export function OverviewCards() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Spend (YTD)',
      value: formatCurrency(stats?.totalSpend || 0),
      icon: DollarSign,
      description: 'Year to date',
    },
    {
      title: 'Total Invoices Processed',
      value: stats?.totalInvoicesProcessed.toLocaleString() || '0',
      icon: FileText,
      description: 'This year',
    },
    {
      title: 'Documents Uploaded',
      value: stats?.documentsUploaded.toLocaleString() || '0',
      icon: Upload,
      description: 'All time',
    },
    {
      title: 'Average Invoice Value',
      value: formatCurrency(stats?.averageInvoiceValue || 0),
      icon: TrendingUp,
      description: 'YTD average',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

