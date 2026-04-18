
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, TrendingUp, TrendingDown, MoreHorizontal, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Invoice } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

const COLORS = ['#6633CC', '#84ACDB', '#F59E0B', '#10B981', '#E11D48'];

export default function AnalyticsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const data = await apiClient.invoices.getAll();
        setInvoices(data || []);
      } catch (error) {
        console.error("Failed to fetch invoices for analytics", error);
        toast({ title: "Failed to load analytics data", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  const { categoryData, growthData, kpis } = useMemo(() => {
    const productSales: Record<string, number> = {};
    const monthlyRevenue: Record<string, { current: number, previous: number }> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    months.forEach(m => { monthlyRevenue[m] = { current: 0, previous: 0 }; });

    let totalRevenue = 0;
    let previousTotalRevenue = 0;
    let bestProduct = { name: 'N/A', value: 0 };

    const currentYear = new Date().getFullYear();
    let currentYearInvoices = 0;

    invoices.forEach(inv => {
      const date = inv.createdAt ? new Date(inv.createdAt) : new Date();
      const month = months[date.getMonth()];
      const year = date.getFullYear();

      if (year === currentYear) {
        monthlyRevenue[month].current += inv.grandTotal || 0;
        totalRevenue += inv.grandTotal || 0;
        currentYearInvoices++;
        
        inv.items?.forEach(item => {
          if (item.productName) {
            productSales[item.productName] = (productSales[item.productName] || 0) + (item.total || 0);
          }
        });
      } else if (year === currentYear - 1) {
        monthlyRevenue[month].previous += inv.grandTotal || 0;
        previousTotalRevenue += inv.grandTotal || 0;
      }
    });

    const catData = Object.keys(productSales)
      .map(name => ({ name, value: productSales[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    if (catData.length > 0) {
      bestProduct = catData[0];
    }

    const currentMonthIdx = new Date().getMonth();
    const filteredGrowth = months.slice(0, currentMonthIdx + 1).map(month => ({
      month,
      current: monthlyRevenue[month].current,
      previous: monthlyRevenue[month].previous
    }));

    const aov = currentYearInvoices > 0 ? (totalRevenue / currentYearInvoices) : 0;
    
    const growthPercent = previousTotalRevenue > 0 
      ? ((totalRevenue - previousTotalRevenue) / previousTotalRevenue * 100) 
      : 0;

    return {
      categoryData: catData.length > 0 ? catData : [{ name: 'No Data', value: 1 }],
      growthData: filteredGrowth.length > 0 ? filteredGrowth : [{ month: months[currentMonthIdx], current: 0, previous: 0 }],
      kpis: [
        { 
          title: 'Total Revenue (YTD)', 
          value: `₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 
          sub: previousTotalRevenue > 0 ? `${growthPercent > 0 ? '+' : ''}${growthPercent.toFixed(1)}% vs last year` : 'Current year metric', 
          up: totalRevenue >= previousTotalRevenue 
        },
        { 
          title: 'Average Order Value', 
          value: `₹${(aov || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 
          sub: 'Based on current year sales', 
          up: true 
        },
        { 
          title: 'Best Selling Asset', 
          value: bestProduct.name, 
          sub: `₹${bestProduct.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })} generated`, 
          up: true 
        },
      ]
    };
  }, [invoices]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 opacity-50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="font-bold text-sm tracking-widest uppercase">Compiling Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold">Insights & Analytics</h1>
          <p className="text-muted-foreground">Detailed performance metrics and growth trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" /> Last 30 Days
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" /> All Categories
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-md bg-card/50">
          <CardHeader>
            <CardTitle className="font-headline">Revenue Growth</CardTitle>
            <CardDescription>Comparison between current and previous year</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" name="Current Year" dataKey="current" stroke="#6633CC" strokeWidth={3} dot={{ r: 4, fill: '#6633CC' }} />
                <Line type="monotone" name="Previous Year" dataKey="previous" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-card/50">
          <CardHeader>
            <CardTitle className="font-headline">Sales by Category</CardTitle>
            <CardDescription>Revenue distribution across product lines</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((item, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{item.title}</p>
                  <p className="text-2xl font-bold font-headline mt-1">{item.value}</p>
                  <p className={`text-xs mt-1 flex items-center gap-1 ${item.up ? 'text-emerald-500' : 'text-destructive'}`}>
                    {item.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {item.sub}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
