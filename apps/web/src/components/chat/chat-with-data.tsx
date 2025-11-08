'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { chatWithData, type ChatResponse } from '@/lib/api';
import { Send, Code, Database } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sql?: string;
  data?: any[];
}

export function ChatWithData() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response: ChatResponse = await chatWithData(input);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message || 'Query executed successfully',
        sql: response.sql,
        data: response.data,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: error instanceof Error ? error.message : 'Failed to process query',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderDataVisualization = (data: any[]) => {
    if (!data || data.length === 0) return null;

    const firstRow = data[0];
    const keys = Object.keys(firstRow);
    
    // Determine chart type based on data structure
    if (keys.length === 2) {
      const [labelKey, valueKey] = keys;
      const chartData = data.map((row) => ({
        name: String(row[labelKey]),
        value: Number(row[valueKey]) || 0,
      }));

      // If it looks like time series data
      if (labelKey.toLowerCase().includes('date') || labelKey.toLowerCase().includes('month')) {
        return (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Trend</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      }

      // Bar chart for categorical data
      return (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Bar Chart</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }

    // Default: show table
    return (
      <div className="mt-4 overflow-x-auto">
        <h4 className="text-sm font-medium mb-2">Results</h4>
        <table className="w-full border rounded-md">
          <thead className="bg-muted">
            <tr>
              {keys.map((key) => (
                <th key={key} className="px-4 py-2 text-left text-sm font-medium">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 100).map((row, idx) => (
              <tr key={idx} className="border-t">
                {keys.map((key) => (
                  <td key={key} className="px-4 py-2 text-sm">
                    {typeof row[key] === 'number' ? formatCurrency(row[key]) : String(row[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 100 && (
          <p className="text-xs text-muted-foreground mt-2">
            Showing first 100 of {data.length} rows
          </p>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chat with Data</CardTitle>
        <CardDescription>
          Ask questions about your data in natural language. Powered by Vanna AI and Groq.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Messages */}
          <div className="border rounded-lg p-4 h-[500px] overflow-y-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation by asking a question about your data.</p>
                <p className="text-sm mt-2">Examples:</p>
                <ul className="text-sm mt-2 space-y-1">
                  <li>"What's the total spend in the last 90 days?"</li>
                  <li>"List top 5 vendors by spend."</li>
                  <li>"Show overdue invoices as of today."</li>
                </ul>
              </div>
            )}

            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {message.sql && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Code className="h-4 w-4" />
                        <span className="text-xs font-medium">Generated SQL</span>
                      </div>
                      <pre className="text-xs bg-background/50 p-2 rounded overflow-x-auto">
                        <code>{message.sql}</code>
                      </pre>
                    </div>
                  )}

                  {message.data && renderDataVisualization(message.data)}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-muted-foreground">Processing your query...</p>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question about your data..."
              disabled={loading}
            />
            <Button onClick={handleSend} disabled={loading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

