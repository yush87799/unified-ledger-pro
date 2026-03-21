
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
  Cell 
} from 'recharts';
import { UserRole } from '@/lib/roles';

const salesData = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

const revenueVsExpenseData = [
  { name: 'Jan', revenue: 4000, expense: 2400 },
  { name: 'Feb', revenue: 3000, expense: 1398 },
  { name: 'Mar', revenue: 2000, expense: 9800 },
  { name: 'Apr', revenue: 2780, expense: 3908 },
  { name: 'May', revenue: 1890, expense: 4800 },
  { name: 'Jun', revenue: 2390, expense: 3800 },
];

const gstData = [
  { name: 'CGST', value: 45 },
  { name: 'SGST', value: 45 },
  { name: 'IGST', value: 10 },
];

const COLORS = ['#6633CC', '#84ACDB', '#F59E0B'];

export default function ChartsSection({ role }: { role: UserRole }) {
  const isOwner = role === 'owner' || role === 'accountant';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {isOwner && (
        <>
          <Card className="border-none shadow-md bg-card/50">
            <CardHeader>
              <CardTitle className="font-headline">Sales Trend</CardTitle>
              <CardDescription>Daily sales performance for current week</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="sales" stroke="#6633CC" strokeWidth={3} dot={{ r: 4, fill: '#6633CC' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-card/50">
            <CardHeader>
              <CardTitle className="font-headline">Revenue vs Expenses</CardTitle>
              <CardDescription>Monthly financial overview</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueVsExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="revenue" fill="#6633CC" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#84ACDB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {role === 'inventory' && (
        <Card className="col-span-full border-none shadow-md bg-card/50">
          <CardHeader>
            <CardTitle className="font-headline">Stock Movement</CardTitle>
            <CardDescription>Inbound vs Outbound stock trends</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="sales" stroke="#6633CC" strokeWidth={3} dot={{ r: 4, fill: '#6633CC' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
