
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
  Line 
} from 'recharts';
import { UserRole, DashboardStats } from '@/lib/types';

export default function ChartsSection({ role, stats }: { role: UserRole; stats: DashboardStats | null }) {
  const isOwner = role === 'owner' || role === 'accountant';

  if (!stats) return <div className="h-[300px] w-full rounded-2xl bg-muted animate-pulse" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {isOwner && (
        <>
          <Card className="border-none shadow-md glass-card rounded-2xl overflow-hidden">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="font-headline text-lg font-black tracking-tight">Sales Trend</CardTitle>
              <CardDescription className="text-xs">Daily performance for current cycle</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] p-4 pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md glass-card rounded-2xl overflow-hidden">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="font-headline text-lg font-black tracking-tight">Revenue vs Expenses</CardTitle>
              <CardDescription className="text-xs">Monthly fiscal overview</CardDescription>
            </CardHeader>
            <CardContent className="h-[250px] p-4 pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.revenueVsExpense}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#84ACDB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {role === 'inventory' && (
        <Card className="col-span-full border-none shadow-md glass-card rounded-2xl overflow-hidden">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="font-headline text-lg font-black tracking-tight">Movement Trends</CardTitle>
            <CardDescription className="text-xs">Asset velocity audit</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] p-4 pt-0">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, fill: 'hsl(var(--primary))' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
