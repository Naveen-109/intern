'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCashOutflow, type CashOutflow } from '@/lib/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

export function CashOutflowChart() {
  const [data, setData] = useState<CashOutflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);
    getCashOutflow(undefined, endDate.toISOString())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cash Outflow Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Outflow Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="amount" fill="#8884d8" name="Expected Outflow" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

