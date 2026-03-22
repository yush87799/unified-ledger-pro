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
    const currentRole = localStorage.getItem('user_role') as UserRole;
    setRole(currentRole);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      const [invoices, inventory, stats] = await Promise.all([
        apiClient.invoices.getAll(),
        apiClient.inventory.getAll(),
        apiClient.dashboard.getStats()
      ]);
      setRecentInvoices(invoices.slice(0, 5));
      setDashboardStats(stats);
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
    <div className="space-y-6 sm:space-y-10 pb-16 animate-in fade-in duration-700">
      {/* Executive Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-md bg-primary/10 border border-primary/20">
            <Activity className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-primary">System Matrix Active</span>
          </div>
          <h1 className="font-headline text-3xl sm:text-5xl font-black tracking-tighter leading-none">
            {roleConfig.title} <span className="text-muted-foreground/30 font-thin italic">Terminal</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base font-medium opacity-80 max-w-xl">
            Real-time operational oversight and intelligent financial diagnostics for your organization.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="h-11 px-5 rounded-xl glass font-bold text-sm">
            <Calendar className="mr-2.5 h-4 w-4 text-primary" /> 
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Button>
          <Link href="/billing">
            <Button className="h-11 px-6 rounded-xl shadow-lg font-black text-sm group">
              <Plus className="mr-2.5 h-4 w-4 group-hover:rotate-90 transition-transform" /> New Interaction
            </Button>
          </Link>
        </div>
      </div>

      <KPISection role={role} stats={dashboardStats} />
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-8">
          <ChartsSection role={role} stats={dashboardStats} />
          
          <Card className="border-none glass-card shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-primary/5 bg-primary/[0.02] p-6">
              <div>
                <CardTitle className="font-headline text-xl font-black tracking-tight">Financial Audit Stream</CardTitle>
                <CardDescription className="text-sm font-medium">Historical ledger of the latest interactions</CardDescription>
              </div>
              <Link href="/billing">
                <Button variant="ghost" className="text-primary font-black hover:bg-primary/5 rounded-lg h-10 px-4 text-sm group">
                  Full Ledger <ArrowUpRight className="ml-2.5 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <div className="min-w-[700px]">
                <Table>
                  <TableHeader className="bg-primary/[0.01]">
                    <TableRow className="border-none">
                      <TableHead className="py-5 pl-8 font-black uppercase text-xs tracking-widest opacity-60">ID Reference</TableHead>
                      <TableHead className="font-black uppercase text-xs tracking-widest opacity-60">Entity</TableHead>
                      <TableHead className="font-black uppercase text-xs tracking-widest opacity-60">Timeline</TableHead>
                      <TableHead className="font-black uppercase text-xs tracking-widest opacity-60">Volume (₹)</TableHead>
                      <TableHead className="pr-8 text-right font-black uppercase text-xs tracking-widest opacity-60">State</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingData ? (
                      <TableRow><TableCell colSpan={5} className="py-16 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-40" /></TableCell></TableRow>
                    ) : recentInvoices.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="py-16 text-center font-bold text-muted-foreground italic text-sm">Zero system interactions recorded.</TableCell></TableRow>
                    ) : recentInvoices.map((inv) => (
                      <TableRow key={inv.id} className="hover:bg-primary/[0.03] transition-colors border-none group">
                        <TableCell className="font-mono text-xs font-black text-primary py-5 pl-8">{inv.id}</TableCell>
                        <TableCell className="font-black text-base tracking-tight">{inv.customer.name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs font-bold">{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="font-black text-sm">₹{inv.grandTotal.toLocaleString()}</TableCell>
                        <TableCell className="pr-8 text-right"><Badge className="bg-emerald-500 text-white border-none px-3 py-1 font-black text-[10px] uppercase tracking-widest">SETTLED</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="xl:col-span-4 space-y-8">
          <Card className="border-none shadow-xl bg-primary text-primary-foreground rounded-2xl overflow-hidden relative group p-8 flex flex-col justify-between min-h-[350px]">
            <div className="absolute top-0 right-0 p-10 opacity-10 scale-[1.8] rotate-12 group-hover:rotate-45 transition-all duration-1000 pointer-events-none">
              <Sparkles className="h-32 w-32" />
            </div>
            <div className="space-y-6 relative z-10">
              <Badge className="bg-white/20 text-white border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">AI Intelligence Core</Badge>
              <div className="space-y-2">
                <CardTitle className="font-headline text-3xl font-black tracking-tighter leading-none">Global Insights</CardTitle>
                <CardDescription className="text-primary-foreground/70 font-medium text-xs tracking-wide">Enterprise Analytics Alpha v3.0</CardDescription>
              </div>
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-3xl border border-white/20 shadow-xl space-y-3">
                <p className="text-base font-black leading-tight tracking-tight">Supply chain anomaly detected.</p>
                <p className="text-sm opacity-90 leading-relaxed font-medium">Reorder optimization suggested for 18% of high-velocity SKUs to mitigate OOS risks.</p>
              </div>
            </div>
            <Link href="/analytics" className="mt-8 relative z-10">
              <Button variant="secondary" className="w-full h-12 rounded-xl font-black text-sm shadow-xl hover:scale-[1.03] transition-transform">
                Optimize Inventory <ArrowUpRight className="ml-2.5 h-4 w-4" />
              </Button>
            </Link>
          </Card>

          <Card className="border-none glass-card shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="p-6 border-b border-primary/5 bg-primary/[0.02]">
              <div className="flex items-center gap-2.5">
                <Search className="h-5 w-5 text-primary" />
                <CardTitle className="font-headline text-xl font-black tracking-tight">Stock Sentinel</CardTitle>
              </div>
              <CardDescription className="text-sm font-medium">Continuous health monitoring of asset liquidity</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              {loadingData ? (
                <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" /></div>
              ) : lowStockItems.length === 0 ? (
                <div className="text-center py-10 opacity-60 italic font-bold text-sm">All Asset Vaults Healthy</div>
              ) : lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-background border border-border/40 hover:border-primary/30 transition-all group">
                  <div className="space-y-1">
                    <p className="font-black text-sm tracking-tight">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{item.stock} {item.unit} Remaining</p>
                  </div>
                  <Badge variant={item.status === 'Out of Stock' ? 'destructive' : 'secondary'} className="text-[10px] uppercase font-black px-2.5 py-1 rounded-md border-none">
                    {item.status}
                  </Badge>
                </div>
              ))}
              <Link href="/inventory" className="block mt-4">
                <Button variant="outline" className="w-full text-primary font-black border-primary/10 hover:bg-primary/5 rounded-xl h-12 text-sm">
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