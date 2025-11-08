'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewCards } from '@/components/dashboard/overview-cards';
import { InvoiceTrendsChart } from '@/components/dashboard/invoice-trends-chart';
import { VendorsChart } from '@/components/dashboard/vendors-chart';
import { CategoryChart } from '@/components/dashboard/category-chart';
import { CashOutflowChart } from '@/components/dashboard/cash-outflow-chart';
import { InvoicesTable } from '@/components/dashboard/invoices-table';
import { ChatWithData } from '@/components/chat/chat-with-data';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Interactive analytics and natural language data queries
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="chat">Chat with Data</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <OverviewCards />
            
            <div className="grid gap-6 md:grid-cols-2">
              <InvoiceTrendsChart />
              <VendorsChart />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <CategoryChart />
              <CashOutflowChart />
            </div>

            <InvoicesTable />
          </TabsContent>

          <TabsContent value="chat">
            <ChatWithData />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

