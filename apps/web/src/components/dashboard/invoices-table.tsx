'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getInvoices, type Invoice, type InvoicesResponse } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search } from 'lucide-react';

export function InvoicesTable() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadInvoices = async (searchTerm?: string) => {
    setLoading(true);
    try {
      const response: InvoicesResponse = await getInvoices({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
      });
      setInvoices(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [pagination.page]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (value.length === 0 || value.length >= 2) {
      loadInvoices(value);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices by number or vendor..."
            value={search}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Invoice #</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Vendor</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Due Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-t hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm font-medium">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-3 text-sm">{invoice.vendor}</td>
                      <td className="px-4 py-3 text-sm">{formatDate(invoice.issueDate)}</td>
                      <td className="px-4 py-3 text-sm">
                        {invoice.dueDate ? formatDate(invoice.dueDate) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(invoice.status)}`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} invoices
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

