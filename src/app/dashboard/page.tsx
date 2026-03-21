
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
import { Plus, Download, Filter, ArrowUpRight, Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';

const recentTransactions = [
  { id: 'INV-1774119234', customer: 'Shyam Goner', amount: '₹29,998', date: 'Today, 6:53 PM', status: 'Paid' },
  { id: 'INV-1774119089', customer: 'Pravi Jain', amount: '₹59,996', date: 'Today, 6:51 PM', status: 'Pending' },
  { id: 'INV-1774117984', customer: 'PS', amount: '₹17,698', date: 'Oct 23, 2023', status: 'Paid' },
  { id: 'INV-1774117865', customer: 'Pratyush S.', amount: '₹1,23,891', date: 'Oct 22, 2023', status: 'Overdue' },
  { id: 'INV-1774117471', customer: 'Pratyush S.', amount: '₹40', date: 'Oct 21, 2023', status: 'Paid' },
];

const lowStockItems = [
  { id: 'SKU-1922', name: 'Wireless Keyboard', stock: 12, category: 'Electronics', status: 'Low' },
  { id: 'SKU-9430', name: 'Fresh Apples', stock: 2, category: 'Produce', status: 'Critical' },
  { id: 'SKU-8271', name: 'Office Chair', stock: 31, category: 'Furniture', status: 'In Stock' },
];

export default function DashboardPage() {
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem('user_role') as UserRole);
  }, []);

  if (!role) return null;

  const roleConfig = ROLES[role];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-[10px] tracking-widest font-bold uppercase bg-primary/5 text-primary border-primary/20 px-2 py-0.5">
              Live Monitoring
            </Badge>
          </div>
          <h1 className="font-headline text-4xl font-bold tracking-tight">
            Dashboard <span className="text-muted-foreground font-normal">/</span> {roleConfig.title}
          </h1>
          <p className="text-muted-foreground text-lg">
            Analytics and operations overview for your business entity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="lg" className="rounded-xl border-primary/10 hover:bg-primary/5 shadow-sm">
            <Calendar className="mr-2 h-4 w-4" /> 
            Range: Oct 2023
          </Button>
          <Button size="lg" className="rounded-xl shadow-xl shadow-primary/30 px-8 group">
            <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" /> 
            Create Transaction
          </Button>
        </div>
      </div>

      <KPISection role={role} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ChartsSection role={role} />
          
          <Card className="border-none shadow-xl bg-card/60 backdrop-blur-md rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20 pb-6">
              <div>
                <CardTitle className="font-headline text-xl">Recent Activity</CardTitle>
                <CardDescription>Real-time audit of latest generated invoices</CardDescription>
              </div>
              <Link href="/billing">
                <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/10 group">
                  Audit History <ArrowUpRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="py-4 pl-6">ID REFERENCE</TableHead>
                    <TableHead>CUSTOMER</TableHead>
                    <TableHead>DATE</TableHead>
                    <TableHead>AMOUNT</TableHead>
                    <TableHead className="pr-6">STATUS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-primary/5 transition-colors border-none group">
                      <TableCell className="font-mono text-xs font-bold text-primary py-4 pl-6 group-hover:translate-x-1 transition-transform">{tx.id}</TableCell>
                      <TableCell className="font-medium">{tx.customer}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{tx.date}</TableCell>
                      <TableCell className="font-bold">{tx.amount}</TableCell>
                      <TableCell className="pr-6">
                        <Badge 
                          className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            tx.status === 'Paid' ? 'bg-emerald-500 hover:bg-emerald-600' : 
                            tx.status === 'Pending' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-destructive'
                          }`}
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
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-xl bg-primary text-primary-foreground rounded-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 scale-150 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
              <Sparkles className="h-24 w-24" />
            </div>
            <CardHeader className="relative">
              <CardTitle className="font-headline text-2xl">AI Insights</CardTitle>
              <CardDescription className="text-primary-foreground/70">Powered by Gemini AI Core</CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                <p className="text-sm font-medium leading-relaxed">
                  Demand for <span className="underline underline-offset-4 decoration-2">Ergonomic Chairs</span> is projected to rise by 24% next month.
                </p>
              </div>
              <Button variant="secondary" className="w-full rounded-xl h-11 font-bold">
                Generate Demand Forecast
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-card/60 backdrop-blur-md rounded-2xl overflow-hidden">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="font-headline text-xl">Stock Alert Monitor</CardTitle>
              <CardDescription>Critical & Low stock notifications</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-background border border-border/50 hover:border-primary/20 transition-all group">
                  <div className="space-y-1">
                    <p className="font-bold text-sm group-hover:text-primary transition-colors">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{item.category} • {item.stock} in stock</p>
                  </div>
                  <Badge 
                    variant={item.status === 'Critical' ? 'destructive' : 'secondary'}
                    className="text-[9px] uppercase font-black px-2 py-0.5 rounded-lg"
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full text-primary font-bold border-primary/20 hover:bg-primary/5 rounded-xl h-11 mt-4">
                Full Inventory Report &rarr;
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
