
"use client";

import React, { useEffect, useState } from 'react';
import { UserRole, ROLES } from '@/lib/roles';
import KPISection from '@/components/dashboard/KPISection';
import ChartsSection from '@/components/dashboard/ChartsSection';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Download, Filter, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const recentTransactions = [
  { id: 'INV-001', customer: 'Acme Corp', amount: '₹12,400', date: 'Oct 24, 2023', status: 'Paid' },
  { id: 'INV-002', customer: 'Global Tech', amount: '₹8,900', date: 'Oct 23, 2023', status: 'Pending' },
  { id: 'INV-003', customer: 'Zenith Solutions', amount: '₹24,000', date: 'Oct 23, 2023', status: 'Paid' },
  { id: 'INV-004', customer: 'Stellar Systems', amount: '₹4,500', date: 'Oct 22, 2023', status: 'Overdue' },
  { id: 'INV-005', customer: 'Nexus Ltd', amount: '₹15,600', date: 'Oct 21, 2023', status: 'Paid' },
];

const lowStockItems = [
  { id: 'PRD-101', name: 'Wireless Mouse', stock: 12, category: 'Electronics', status: 'Low' },
  { id: 'PRD-102', name: 'Mechanical Keyboard', stock: 5, category: 'Electronics', status: 'Critical' },
  { id: 'PRD-103', name: 'USB-C Hub', stock: 8, category: 'Accessories', status: 'Low' },
  { id: 'PRD-104', name: 'Monitor Stand', stock: 0, category: 'Furniture', status: 'Out of Stock' },
];

export default function DashboardPage() {
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem('user_role') as UserRole);
  }, []);

  if (!role) return null;

  const roleConfig = ROLES[role];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold">Welcome back, {roleConfig.title}</h1>
          <p className="text-muted-foreground">Here's what's happening in your business today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button size="sm" className="rounded-full shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Create New
          </Button>
        </div>
      </div>

      <KPISection role={role} />
      
      <ChartsSection role={role} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 border-none shadow-md bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline">Recent Transactions</CardTitle>
              <CardDescription>Latest billing activity across the system</CardDescription>
            </div>
            <Link href="/billing" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.id}</TableCell>
                    <TableCell>{tx.customer}</TableCell>
                    <TableCell>{tx.date}</TableCell>
                    <TableCell>{tx.amount}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={tx.status === 'Paid' ? 'default' : tx.status === 'Pending' ? 'secondary' : 'destructive'}
                        className="rounded-full font-medium"
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-card/50">
          <CardHeader>
            <CardTitle className="font-headline">Inventory Alerts</CardTitle>
            <CardDescription>Items needing urgent reordering</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-transparent hover:border-border transition-colors">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.category} • {item.stock} left</p>
                  </div>
                  <Badge 
                    variant={item.status === 'Critical' || item.status === 'Out of Stock' ? 'destructive' : 'secondary'}
                    className="text-[10px] uppercase font-bold tracking-wider"
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-primary hover:text-primary mt-2">
                Manage Stock &rarr;
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
