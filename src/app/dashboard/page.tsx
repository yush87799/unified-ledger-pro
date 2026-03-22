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
      
      // Get latest 5 invoices
      setRecentInvoices(invoices.slice(0, 5));
      
      // Get items with stock < 10 or 'Low' status
      const lowStock = inventory
        .filter(p => p.stock < 10 || p.status === 'Low' || p.status === 'Out of Stock')
        .slice(0, 3);
      setLowStockItems(lowStock);
      
    } catch (err) {
      toast({ 
        title: "Sync Error", 
        description: "Failed to fetch real-time stream.", 
        variant: "destructive" 
      });
    } finally {
      setLoadingData(false);
    }
  };

  if (!role) return null;

  const roleConfig = ROLES[role];

  return (
    <div className="space-y-8 sm:space-y-12 pb-12 sm:pb-24">
      {/* Executive Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 sm:gap-10">
        <div className="space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20">
            <Activity className="h-3 w-3 text-primary animate-pulse" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary">System Pulse Active</span>
          </div>
          <h1 className="font-headline text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-none">
            {roleConfig.title} <span className="text-muted-foreground/30 font-thin italic">Terminal</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-lg font-medium max-w-2xl leading-relaxed opacity-80">
            Intelligence overview of your operational domain. Monitor growth vectors and system health in real-time.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <Button variant="outline" className="rounded-xl sm:rounded-2xl border-primary/10 h-12 sm:h-14 px-4 sm:px-6 glass hover:bg-primary/5 shadow-xl font-bold transition-all hover:scale-[1.02]">
            <Calendar className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-primary" /> 
            Period: {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Button>
          <Link href="/billing" className="w-full sm:w-auto">
            <Button className="w-full rounded-xl sm:rounded-2xl shadow-[0_20px_40px_rgba(102,51,204,0.3)] h-12 sm:h-14 px-6 sm:px-8 group font-black text-sm sm:text-base">
              <Plus className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-90 transition-transform duration-500" /> 
              New Transaction
            </Button>
          </Link>
        </div>
      </div>

      {/* Real-time KPI Layer */}
      <KPISection role={role} />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
        {/* Main Operational Column */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-8 sm:space-y-12">
          <ChartsSection role={role} />
          
          <Card className="border-none glass-card shadow-2xl rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-primary/5 bg-primary/[0.02] p-6 sm:p-10 gap-6">
              <div>
                <CardTitle className="font-headline text-xl sm:text-3xl font-black tracking-tight">Audit Stream</CardTitle>
                <CardDescription className="text-xs sm:text-base font-medium">Real-time ledger of latest financial interactions</CardDescription>
              </div>
              <Link href="/billing" className="w-full sm:w-auto">
                <Button variant="ghost" size="sm" className="text-primary font-black hover:bg-primary/5 rounded-xl h-10 px-5 group w-full flex justify-between sm:justify-center">
                  Full History <ArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <div className="min-w-[600px] w-full">
                <Table>
                  <TableHeader className="bg-primary/[0.01]">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="py-6 sm:py-8 pl-8 sm:pl-12 font-black uppercase text-[9px] sm:text-[10px] tracking-widest text-muted-foreground/60">Reference</TableHead>
                      <TableHead className="font-black uppercase text-[9px] sm:text-[10px] tracking-widest text-muted-foreground/60">Counterparty</TableHead>
                      <TableHead className="font-black uppercase text-[9px] sm:text-[10px] tracking-widest text-muted-foreground/60">Timeline</TableHead>
                      <TableHead className="font-black uppercase text-[9px] sm:text-[10px] tracking-widest text-muted-foreground/60">Volume</TableHead>
                      <TableHead className="pr-8 sm:pr-12 text-right font-black uppercase text-[9px] sm:text-[10px] tracking-widest text-muted-foreground/60">State</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingData ? (
                      <TableRow><TableCell colSpan={5} className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary opacity-40" /></TableCell></TableRow>
                    ) : recentInvoices.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="py-20 text-center font-bold text-muted-foreground italic">No recent transactions found.</TableCell></TableRow>
                    ) : recentInvoices.map((inv) => (
                      <TableRow key={inv.id} className="hover:bg-primary/[0.03] transition-colors border-none group">
                        <TableCell className="font-mono text-[10px] sm:text-xs font-black text-primary py-6 sm:py-8 pl-8 sm:pl-12 group-hover:translate-x-2 transition-transform duration-500">{inv.id}</TableCell>
                        <TableCell className="font-black text-xs sm:text-sm tracking-tight">{inv.customer.name}</TableCell>
                        <TableCell className="text-muted-foreground text-[10px] sm:text-xs font-bold">{new Date(inv.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</TableCell>
                        <TableCell className="font-black text-xs sm:text-sm">₹{inv.grandTotal.toLocaleString()}</TableCell>
                        <TableCell className="pr-8 sm:pr-12 text-right">
                          <Badge className="rounded-lg sm:rounded-xl px-3 sm:px-4 py-1 text-[8px] sm:text-[9px] font-black uppercase tracking-widest border-none shadow-sm bg-emerald-500 text-white">
                            PAID
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Intelligence Sidebar */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-8 sm:space-y-12">
          {/* AI Insight Card */}
          <Card className="border-none shadow-2xl bg-primary text-primary-foreground rounded-[2rem] sm:rounded-[3rem] overflow-hidden relative group p-8 sm:p-10 pb-10 sm:pb-12 min-h-[400px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-12 opacity-10 scale-[2.5] rotate-12 group-hover:rotate-45 transition-all duration-1000 pointer-events-none">
              <Sparkles className="h-32 w-32" />
            </div>
            
            <div className="space-y-6 sm:space-y-8 relative z-10">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest w-fit">AI Engine Alpha</Badge>
              <div className="space-y-2">
                <CardTitle className="font-headline text-4xl sm:text-5xl font-black tracking-tighter leading-[0.9]">Market Insights</CardTitle>
                <CardDescription className="text-primary-foreground/60 font-medium text-sm sm:text-base">Gemini Intelligence Core 2.0</CardDescription>
              </div>
              <div className="p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-white/10 backdrop-blur-3xl border border-white/20 shadow-2xl space-y-4">
                <p className="text-lg sm:text-xl font-black leading-tight tracking-tight">
                  High velocity detected in <span className="underline underline-offset-8 decoration-white/40">Inventory</span> turnover. 
                </p>
                <p className="text-xs sm:text-sm opacity-80 leading-relaxed font-medium">
                  Predictive models suggest optimizing reorder levels for 14% of your current SKUs within the next 48 hours.
                </p>
              </div>
            </div>

            <Link href="/analytics" className="mt-8">
              <Button variant="secondary" className="w-full rounded-xl sm:rounded-2xl h-14 sm:h-16 font-black text-base sm:text-lg shadow-2xl hover:scale-[1.02] transition-transform active:scale-95 group relative z-10">
                Optimize Supply Chain <ArrowUpRight className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
            </Link>
          </Card>

          {/* Stock Sentinel Card */}
          <Card className="border-none glass-card shadow-2xl rounded-[2rem] sm:rounded-[3rem] overflow-hidden">
            <CardHeader className="p-8 sm:p-10 border-b border-primary/5 bg-primary/[0.02]">
              <div className="flex items-center gap-3 mb-2">
                <Search className="h-4 w-4 text-primary" />
                <CardTitle className="font-headline text-xl sm:text-2xl font-black tracking-tight">Stock Sentinel</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm font-medium">Continuous inventory health monitoring</CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-10 space-y-4 sm:space-y-6">
              {loadingData ? (
                <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" /></div>
              ) : lowStockItems.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <div className="h-12 w-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                    <Activity className="h-6 w-6 text-emerald-500" />
                  </div>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">All Assets Healthy</p>
                </div>
              ) : lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-5 sm:p-6 rounded-2xl bg-background border border-border/40 hover:border-primary/30 transition-all group cursor-pointer hover:shadow-2xl">
                  <div className="space-y-1">
                    <p className="font-black text-sm sm:text-base group-hover:text-primary transition-colors tracking-tight">{item.name}</p>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-black tracking-widest flex items-center gap-2">
                      {item.category} <span className="h-1 w-1 rounded-full bg-muted-foreground/30" /> {item.stock} {item.unit}
                    </p>
                  </div>
                  <Badge 
                    variant={item.status === 'Out of Stock' ? 'destructive' : 'secondary'}
                    className="text-[8px] sm:text-[9px] uppercase font-black px-3 py-1 rounded-lg shadow-sm border-none"
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
              <Link href="/inventory" className="block w-full mt-4 sm:mt-6">
                <Button variant="outline" className="w-full text-primary font-black border-primary/10 hover:bg-primary/5 rounded-xl sm:rounded-2xl h-12 sm:h-14 transition-all text-xs sm:text-sm">
                  Access Inventory Vault
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
