
"use client";

import React from 'react';
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
import { Calendar, Filter, TrendingUp, TrendingDown, MoreHorizontal } from 'lucide-react';

const categoryData = [
  { name: 'Electronics', value: 45 },
  { name: 'Furniture', value: 25 },
  { name: 'Audio', value: 20 },
  { name: 'Accessories', value: 10 },
];

const COLORS = ['#6633CC', '#84ACDB', '#F59E0B', '#10B981'];

const growthData = [
  { month: 'Jan', current: 4000, previous: 3200 },
  { month: 'Feb', current: 5000, previous: 4500 },
  { month: 'Mar', current: 3000, previous: 3800 },
  { month: 'Apr', current: 4500, previous: 4200 },
  { month: 'May', current: 6000, previous: 5100 },
  { month: 'Jun', current: 7500, previous: 6200 },
];

export default function AnalyticsPage() {
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
        {[
          { title: 'Best Performing', value: 'Electronics', sub: '+24% growth', up: true },
          { title: 'Customer Retention', value: '78%', sub: '+2% from Oct', up: true },
          { title: 'Refund Rate', value: '0.8%', sub: '-0.2% from Oct', up: false },
        ].map((item, i) => (
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
