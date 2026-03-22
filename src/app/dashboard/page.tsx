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
import { Plus, Download, Filter, ArrowUpRight, Calendar, Sparkles, Activity, Search } from 'lucide-react';
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
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20">
            <Activity className="h-3 w-3 text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">System Pulse Active</span>
          </div>
          <h1 className="font-headline text-5xl font-black tracking-tighter">
            {roleConfig.title} <span className="text-muted-foreground/30 font-thin italic">Terminal</span>
          </h1>
          <p className="text-muted-foreground text-lg font-medium max-w-2xl leading-relaxed">
            Intelligence overview of your operational domain. Monitor growth vectors and system health in real-time.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="lg" className="rounded-2xl border-primary/10 h-14 px-6 glass hover:bg-primary/5 shadow-xl font-bold">
            <Calendar className="mr-3 h-5 w-5 text-primary" /> 
            Period: Oct 2023
          </Button>
          <Button size="lg" className="rounded-2xl shadow-[0_20px_40px_rgba(102,51,204,0.3)] h-14 px-8 group font-bold">
            <Plus className="mr-3 h-5 w-5 group-hover:rotate-90 transition-transform duration-500" /> 
            New Transaction
          </Button>
        </div>
      </div>

      <KPISection role={role} />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <ChartsSection role={role} />
          
          <Card className="border-none glass-card shadow-2xl rounded-[2rem] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-primary/5 bg-primary/[0.02] p-8">
              <div>
                <CardTitle className="font-headline text-2xl font-black tracking-tight">Audit Stream</CardTitle>
                <CardDescription className="text-sm font-medium">Real-time ledger of latest financial interactions</CardDescription>
              </div>
              <Link href="/billing">
                <Button variant="ghost" size="sm" className="text-primary font-black hover:bg-primary/5 rounded-xl h-10 px-5 group">
                  Full History <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-primary/[0.01]">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="py-6 pl-10 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Reference</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Counterparty</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Timeline</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Volume</TableHead>
                    <TableHead className="pr-10 font-black uppercase text-[10px] tracking-widest text-muted-foreground">State</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-primary/[0.03] transition-colors border-none group">
                      <TableCell className="font-mono text-[11px] font-black text-primary py-6 pl-10 group-hover:translate-x-2 transition-transform duration-500">{tx.id}</TableCell>
                      <TableCell className="font-bold text-sm tracking-tight">{tx.customer}</TableCell>
                      <TableCell className="text-muted-foreground text-xs font-medium">{tx.date}</TableCell>
                      <TableCell className="font-black text-sm">{tx.amount}</TableCell>
                      <TableCell className="pr-10 text-right">
                        <Badge 
                          className={`rounded-xl px-4 py-1 text-[9px] font-black uppercase tracking-[0.1em] border-none shadow-sm ${
                            tx.status === 'Paid' ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 
                            tx.status === 'Pending' ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-destructive text-white'
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

        <div className="lg:col-span-4 space-y-10">
          <Card className="border-none shadow-2xl bg-primary text-primary-foreground rounded-[2.5rem] overflow-hidden relative group p-8 pb-10 min-h-[400px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-12 opacity-10 scale-[2] rotate-12 group-hover:rotate-45 transition-all duration-1000">
              <Sparkles className="h-32 w-32" />
            </div>
            
            <div className="space-y-6 relative z-10">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">AI Engine Alpha</Badge>
              <div className="space-y-2">
                <CardTitle className="font-headline text-4xl font-black tracking-tighter leading-none">Market Insights</CardTitle>
                <CardDescription className="text-primary-foreground/60 font-medium text-base">Gemini Intelligence Core 2.0</CardDescription>
              </div>
              <div className="p-6 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl space-y-4">
                <p className="text-lg font-bold leading-tight tracking-tight">
                  High velocity detected in <span className="underline underline-offset-8 decoration-white/40">Premium Tech</span> inventory. 
                </p>
                <p className="text-sm opacity-80 leading-relaxed">
                  Predictive models suggest a 31% restocking requirement within the next 72 hours.
                </p>
              </div>
            </div>

            <Button variant="secondary" className="w-full rounded-2xl h-16 font-black text-lg shadow-2xl hover:scale-[1.02] transition-transform active:scale-95 group relative z-10">
              Optimize Supply Chain <ArrowUpRight className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </Card>

          <Card className="border-none glass-card shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 border-b border-primary/5 bg-primary/[0.02]">
              <div className="flex items-center gap-3 mb-2">
                <Search className="h-4 w-4 text-primary" />
                <CardTitle className="font-headline text-xl font-black tracking-tight">Stock Sentinel</CardTitle>
              </div>
              <CardDescription className="font-medium">Continuous inventory health monitoring</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-5 rounded-2xl bg-background border border-border/40 hover:border-primary/30 transition-all group cursor-pointer hover:shadow-xl">
                  <div className="space-y-1">
                    <p className="font-black text-sm group-hover:text-primary transition-colors tracking-tight">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest flex items-center gap-2">
                      {item.category} <span className="h-1 w-1 rounded-full bg-muted-foreground/30" /> {item.stock} IN STOCK
                    </p>
                  </div>
                  <Badge 
                    variant={item.status === 'Critical' ? 'destructive' : 'secondary'}
                    className="text-[9px] uppercase font-black px-3 py-1 rounded-lg shadow-sm border-none"
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full text-primary font-black border-primary/10 hover:bg-primary/5 rounded-2xl h-14 mt-4 transition-all">
                Access Inventory Vault
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}