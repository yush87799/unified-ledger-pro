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
import { Plus, ArrowUpRight, Calendar, Sparkles, Activity, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { Invoice, Product, DashboardStats } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const currentRole = (localStorage.getItem('user_role') || 'admin') as UserRole;
    setRole(currentRole);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      const [invoicesRes, inventoryRes, statsRes] = await Promise.allSettled([
        apiClient.invoices.getAll(),
        apiClient.inventory.getAll(),
        apiClient.dashboard.getStats()
      ]);
      
      if (invoicesRes.status === 'fulfilled') {
        setRecentInvoices(invoicesRes.value.slice(0, 5));
      }
      
      if (inventoryRes.status === 'fulfilled') {
        const lowStock = inventoryRes.value
          .filter((p: Product) => p.stock < 10 || p.status === 'Low' || p.status === 'Out of Stock')
          .slice(0, 3);
        setLowStockItems(lowStock);
      }
      
      if (statsRes.status === 'fulfilled') {
        setDashboardStats(statsRes.value);
      } else {
        toast({ title: "Stats Sync Error", description: "Failed to fetch dashboard metrics.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Sync Error", description: "Failed to fetch real-time stream.", variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  };

  if (!role) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  const roleConfig = ROLES[role] || { title: 'Dashboard' };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20">
            <Activity className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">System Matrix Active</span>
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl font-black tracking-tight leading-none">
            {roleConfig.title} <span className="text-muted-foreground/30 font-thin italic">Terminal</span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium opacity-80 max-w-lg">
            Real-time operational oversight and intelligent financial diagnostics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-9 px-4 rounded-lg glass font-bold text-xs">
            <Calendar className="mr-2 h-3.5 w-3.5 text-primary" /> 
            {new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}
          </Button>
          <Link href="/billing">
            <Button className="h-9 px-4 rounded-lg shadow-lg font-black text-xs group">
              <Plus className="mr-2 h-3.5 w-3.5 group-hover:rotate-90 transition-transform" /> New Interaction
            </Button>
          </Link>
        </div>
      </div>

      <KPISection role={role} stats={dashboardStats} />
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-6">
          <ChartsSection role={role} stats={dashboardStats} />
          
          <Card className="border-none glass-card shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-primary/5 bg-primary/[0.02] p-5">
              <div>
                <CardTitle className="font-headline text-lg font-black tracking-tight">Financial Audit Stream</CardTitle>
                <CardDescription className="text-xs font-medium">Recent Interactions</CardDescription>
              </div>
              <Link href="/billing">
                <Button variant="ghost" className="text-primary font-black hover:bg-primary/5 rounded-lg h-9 px-3 text-xs group">
                  Full Ledger <ArrowUpRight className="ml-1.5 h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <div className="min-w-[600px]">
                <Table>
                  <TableHeader className="bg-primary/[0.01]">
                    <TableRow className="border-none">
                      <TableHead className="py-4 pl-6 font-black uppercase text-[11px] tracking-widest opacity-60">ID Reference</TableHead>
                      <TableHead className="font-black uppercase text-[11px] tracking-widest opacity-60">Entity</TableHead>
                      <TableHead className="font-black uppercase text-[11px] tracking-widest opacity-60">Timeline</TableHead>
                      <TableHead className="font-black uppercase text-[11px] tracking-widest opacity-60">Volume (₹)</TableHead>
                      <TableHead className="pr-6 text-right font-black uppercase text-[11px] tracking-widest opacity-60">State</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingData ? (
                      <TableRow key="loading"><TableCell colSpan={5} className="py-12 text-center"><Loader2 className="h-7 w-7 animate-spin mx-auto text-primary opacity-40" /></TableCell></TableRow>
                    ) : recentInvoices.length === 0 ? (
                      <TableRow key="empty"><TableCell colSpan={5} className="py-12 text-center font-bold text-muted-foreground italic text-xs">No records found.</TableCell></TableRow>
                  ) : recentInvoices.map((inv, index) => (
                    <TableRow key={inv.id || (inv as any)._id || index} className="hover:bg-primary/[0.02] border-none group transition-colors">
                      <TableCell className="font-mono text-[11px] font-black text-primary py-4 pl-6">{inv.id || (inv as any)._id}</TableCell>
                        <TableCell className="font-black text-sm tracking-tight">{inv.customer.name}</TableCell>
                        <TableCell className="text-muted-foreground text-[11px] font-bold">{inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : 'Unknown'}</TableCell>
                        <TableCell className="font-black text-xs">₹{Number(inv.grandTotal || 0).toLocaleString()}</TableCell>
                        <TableCell className="pr-6 text-right"><Badge className="bg-emerald-500 text-white border-none px-2 py-0.5 font-black text-[9px] uppercase tracking-widest">SETTLED</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-4 space-y-6">
          <Card className="border-none shadow-xl bg-primary text-primary-foreground rounded-xl overflow-hidden relative group p-6 flex flex-col justify-between min-h-[300px]">
            <div className="absolute top-0 right-0 p-8 opacity-10 scale-[1.5] rotate-12 group-hover:rotate-45 transition-all duration-700 pointer-events-none">
              <Sparkles className="h-24 w-24" />
            </div>
            <div className="space-y-4 relative z-10">
              <Badge className="bg-white/20 text-white border-none px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">AI Intelligence Core</Badge>
              <div className="space-y-1">
                <CardTitle className="font-headline text-2xl font-black tracking-tight leading-none">Global Insights</CardTitle>
                <CardDescription className="text-primary-foreground/70 font-medium text-[10px] tracking-wide uppercase">Alpha v3.0</CardDescription>
              </div>
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-3xl border border-white/20 shadow-lg space-y-2">
                <p className="text-sm font-black tracking-tight">Supply chain anomaly detected.</p>
                <p className="text-xs opacity-90 leading-relaxed font-medium">Reorder optimization suggested for 18% of velocity SKUs.</p>
              </div>
            </div>
            <Link href="/inventory" className="mt-6 relative z-10">
              <Button variant="secondary" className="w-full h-10 rounded-lg font-black text-xs shadow-xl">
                Optimize Inventory <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </Card>

          <Card className="border-none glass-card shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="p-5 border-b border-primary/5 bg-primary/[0.02]">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                <CardTitle className="font-headline text-lg font-black tracking-tight">Stock Sentinel</CardTitle>
              </div>
              <CardDescription className="text-xs font-medium">Critical asset monitoring</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {loadingData ? (
                <div className="flex justify-center py-6"><Loader2 className="h-7 w-7 animate-spin text-primary opacity-20" /></div>
              ) : lowStockItems.length === 0 ? (
                <div className="text-center py-8 opacity-60 italic font-bold text-xs">All Vaults Healthy</div>
            ) : lowStockItems.map((item, index) => (
              <div key={item.id || (item as any)._id || index} className="flex items-center justify-between p-3.5 rounded-lg bg-background border border-border/40 hover:border-primary/20 transition-all">
                  <div className="space-y-0.5">
                    <p className="font-black text-xs tracking-tight">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{item.stock} {item.unit} Left</p>
                  </div>
                  <Badge variant={item.status === 'Out of Stock' ? 'destructive' : 'secondary'} className="text-[9px] uppercase font-black px-2 py-0.5 rounded border-none">
                    {item.status}
                  </Badge>
                </div>
              ))}
              <Link href="/inventory" className="block mt-2">
                <Button variant="outline" className="w-full text-primary font-black border-primary/10 hover:bg-primary/5 rounded-lg h-10 text-xs">
                  Access Asset Vault
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}