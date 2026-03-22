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
import { Plus, Download, Filter, ArrowUpRight, Calendar, Sparkles, Activity, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { Invoice, Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    setRole(localStorage.getItem('user_role') as UserRole);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      const [invoices, inventory] = await Promise.all([
        apiClient.invoices.getAll(),
        apiClient.inventory.getAll()
      ]);
      setRecentInvoices(invoices.slice(0, 5));
      const lowStock = inventory
        .filter(p => p.stock < 10 || p.status === 'Low' || p.status === 'Out of Stock')
        .slice(0, 3);
      setLowStockItems(lowStock);
    } catch (err) {
      toast({ title: "Sync Error", description: "Failed to fetch real-time stream.", variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  };

  if (!role) return null;
  const roleConfig = ROLES[role];

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Executive Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
            <Activity className="h-3 w-3 text-primary animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-widest text-primary">System Pulse Active</span>
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter leading-none">
            {roleConfig.title} <span className="text-muted-foreground/30 font-thin italic">Terminal</span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium max-w-xl opacity-80">
            Intelligence overview of your operational domain.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <Button variant="outline" className="h-9 px-4 rounded-lg glass font-bold text-xs">
            <Calendar className="mr-2 h-4 w-4 text-primary" /> 
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Button>
          <Link href="/billing">
            <Button className="h-9 px-6 rounded-lg shadow-lg font-black text-xs group">
              <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" /> New Entry
            </Button>
          </Link>
        </div>
      </div>

      <KPISection role={role} />
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-6">
          <ChartsSection role={role} />
          
          <Card className="border-none glass-card shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-primary/5 bg-primary/[0.02] p-4 sm:p-6">
              <div>
                <CardTitle className="font-headline text-lg sm:text-xl font-black tracking-tight">Audit Stream</CardTitle>
                <CardDescription className="text-xs">Real-time ledger of latest financial interactions</CardDescription>
              </div>
              <Link href="/billing">
                <Button variant="ghost" className="text-primary font-black hover:bg-primary/5 rounded-lg h-8 px-4 text-xs group">
                  Full History <ArrowUpRight className="ml-1 h-3 w-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <div className="min-w-[500px]">
                <Table>
                  <TableHeader className="bg-primary/[0.01]">
                    <TableRow className="border-none">
                      <TableHead className="py-4 pl-6 font-black uppercase text-[8px] tracking-widest opacity-60">Reference</TableHead>
                      <TableHead className="font-black uppercase text-[8px] tracking-widest opacity-60">Counterparty</TableHead>
                      <TableHead className="font-black uppercase text-[8px] tracking-widest opacity-60">Timeline</TableHead>
                      <TableHead className="font-black uppercase text-[8px] tracking-widest opacity-60">Volume</TableHead>
                      <TableHead className="pr-6 text-right font-black uppercase text-[8px] tracking-widest opacity-60">State</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingData ? (
                      <TableRow><TableCell colSpan={5} className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary opacity-40" /></TableCell></TableRow>
                    ) : recentInvoices.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="py-12 text-center font-bold text-muted-foreground italic text-xs">No activity.</TableCell></TableRow>
                    ) : recentInvoices.map((inv) => (
                      <TableRow key={inv.id} className="hover:bg-primary/[0.03] transition-colors border-none group">
                        <TableCell className="font-mono text-[9px] font-black text-primary py-4 pl-6">{inv.id}</TableCell>
                        <TableCell className="font-black text-xs tracking-tight">{inv.customer.name}</TableCell>
                        <TableCell className="text-muted-foreground text-[10px] font-bold">{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="font-black text-xs">₹{inv.grandTotal.toLocaleString()}</TableCell>
                        <TableCell className="pr-6 text-right"><Badge className="bg-emerald-500 text-white border-none px-2 py-0.5 font-black text-[7px] uppercase tracking-widest">PAID</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <Card className="border-none shadow-xl bg-primary text-primary-foreground rounded-3xl overflow-hidden relative group p-8 flex flex-col justify-between min-h-[320px]">
            <div className="absolute top-0 right-0 p-8 opacity-10 scale-[1.5] rotate-12 group-hover:rotate-45 transition-all duration-1000 pointer-events-none">
              <Sparkles className="h-24 w-24" />
            </div>
            <div className="space-y-4 relative z-10">
              <Badge className="bg-white/20 text-white border-none px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest">AI Core</Badge>
              <div className="space-y-1">
                <CardTitle className="font-headline text-3xl font-black tracking-tighter leading-none">Insights</CardTitle>
                <CardDescription className="text-primary-foreground/60 font-medium text-[10px]">Intelligence Engine Alpha</CardDescription>
              </div>
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-3xl border border-white/20 shadow-xl space-y-2">
                <p className="text-sm font-black leading-tight tracking-tight">Supply chain volatility identified.</p>
                <p className="text-[10px] opacity-80 leading-relaxed font-medium">Reorder optimization suggested for 14% of SKUs.</p>
              </div>
            </div>
            <Link href="/analytics" className="mt-6 relative z-10">
              <Button variant="secondary" className="w-full h-11 rounded-xl font-black text-sm shadow-xl hover:scale-[1.02] transition-transform">
                Optimize Now <ArrowUpRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </Card>

          <Card className="border-none glass-card shadow-lg rounded-3xl overflow-hidden">
            <CardHeader className="p-6 border-b border-primary/5 bg-primary/[0.02]">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                <CardTitle className="font-headline text-lg font-black tracking-tight">Stock Sentinel</CardTitle>
              </div>
              <CardDescription className="text-[10px]">Continuous health monitoring</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {loadingData ? (
                <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-primary opacity-20" /></div>
              ) : lowStockItems.length === 0 ? (
                <div className="text-center py-6 opacity-40 italic font-bold text-xs">All Assets Healthy</div>
              ) : lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-background border border-border/40 hover:border-primary/30 transition-all group">
                  <div className="space-y-0.5">
                    <p className="font-black text-xs tracking-tight">{item.name}</p>
                    <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest">{item.stock} {item.unit} Remaining</p>
                  </div>
                  <Badge variant={item.status === 'Out of Stock' ? 'destructive' : 'secondary'} className="text-[7px] uppercase font-black px-2 py-0.5 rounded-md">
                    {item.status}
                  </Badge>
                </div>
              ))}
              <Link href="/inventory" className="block mt-2">
                <Button variant="outline" className="w-full text-primary font-black border-primary/10 hover:bg-primary/5 rounded-xl h-10 text-xs">
                  Inventory Vault
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
