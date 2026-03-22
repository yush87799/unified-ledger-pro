"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  FileCheck, 
  AlertCircle, 
  Download, 
  RefreshCcw, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  ArrowUpRight
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { Invoice } from '@/lib/types';

export default function GSTCompliancePage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await apiClient.invoices.getAll();
      setInvoices(data);
    } catch (err) {
      console.error("Failed to fetch ledger context.");
    }
  };

  const handleAIAnalysis = () => {
    setAnalyzing(true);
    // Simulate deep audit of current ledger
    setTimeout(() => {
      setAnalyzing(false);
      toast({
        title: "Compliance Audit Complete",
        description: "Unified Ledger AI has finished the real-time reconciliation audit.",
      });
    }, 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-500 pb-16">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-md bg-primary/10 border border-primary/20">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Compliance Status: Healthy</span>
          </div>
          <h1 className="font-headline text-3xl sm:text-4xl font-black tracking-tighter leading-none">
            GST & <span className="text-muted-foreground/30 font-thin italic">Compliance</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-2xl opacity-80">
            Real-time tax reconciliation, GSTR filing preparation, and automated ITC (Input Tax Credit) auditing.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" className="h-10 rounded-xl glass font-bold text-xs px-4">
            <Download className="mr-2 h-4 w-4" /> Export GSTR-1
          </Button>
          <Button variant="outline" className="h-10 rounded-xl glass font-bold text-xs px-4">
            <Download className="mr-2 h-4 w-4" /> Export GSTR-3B
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 border-none shadow-xl glass-card rounded-2xl overflow-hidden bg-gradient-to-br from-primary/[0.03] to-transparent">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 border-b border-primary/5 gap-6">
            <div className="space-y-1.5">
              <CardTitle className="font-headline text-xl font-black flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Intelligence Advisor
              </CardTitle>
              <CardDescription className="text-sm font-medium opacity-70">Automated Audit Analysis v4.2</CardDescription>
            </div>
            <Button 
              onClick={handleAIAnalysis} 
              disabled={analyzing}
              className="rounded-xl h-11 px-6 font-black w-full sm:w-auto shadow-lg"
            >
              {analyzing ? <RefreshCcw className="h-4 w-4 animate-spin mr-3" /> : <RefreshCcw className="h-4 w-4 mr-3" />}
              {analyzing ? 'Auditing Ledger...' : 'Run Compliance Audit'}
            </Button>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start gap-6 p-6 rounded-2xl bg-card/40 border border-emerald-500/20 shadow-md group hover:bg-card/60 transition-all">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <FileCheck className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="font-black text-lg tracking-tight">ITC Optimization Found</h4>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  Identified ₹12,400 in unclaimed Input Tax Credit from recent utility interactions. These have been matched to your purchase ledger.
                </p>
                <Button variant="link" className="p-0 h-auto text-primary font-black text-xs uppercase tracking-widest flex items-center gap-2">
                  Apply Reconcile <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-6 p-6 rounded-2xl bg-card/40 border border-amber-500/20 shadow-md group hover:bg-card/60 transition-all">
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <AlertCircle className="h-6 w-6 text-amber-500" />
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="font-black text-lg tracking-tight">GSTR-2A Matching Alert</h4>
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                  3 suppliers have not yet filed their GSTR-1 for the current period. This may prevent you from claiming full ITC during the next settlement cycle.
                </p>
                <Button variant="link" className="p-0 h-auto text-primary font-black text-xs uppercase tracking-widest flex items-center gap-2">
                  Audit Counterparties <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-none shadow-xl glass-card rounded-2xl overflow-hidden">
          <CardHeader className="p-8 border-b border-primary/5 bg-primary/[0.02]">
            <CardTitle className="font-headline text-xl font-black tracking-tight">Filing Readiness</CardTitle>
            <CardDescription className="text-sm font-medium opacity-70">Current period progress monitoring</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-10">
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                <span className="text-muted-foreground">Compliance Index</span>
                <span className="text-primary">84% Ready</span>
              </div>
              <Progress value={84} className="h-3 rounded-full" />
            </div>

            <div className="space-y-4">
              {[
                { label: 'Sales Reconciliation', status: 'DONE', color: 'bg-emerald-500' },
                { label: 'Purchase Matching', status: 'DONE', color: 'bg-emerald-500' },
                { label: 'Tax Computation', status: 'PENDING', color: 'bg-amber-500' },
              ].map((step, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-transparent hover:border-primary/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${step.color} animate-pulse`} />
                    <span className="text-sm font-bold tracking-tight">{step.label}</span>
                  </div>
                  <Badge variant="outline" className={`text-[10px] font-black tracking-widest border-none px-3 py-1 ${step.status === 'DONE' ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'}`}>
                    {step.status}
                  </Badge>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full h-11 rounded-xl font-black text-xs gap-2 border-primary/10 hover:bg-primary/5">
              Review Full Audit Log <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: 'CGST Accumulation', value: '₹1,52,400', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'SGST Accumulation', value: '₹1,52,400', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'IGST (Interstate)', value: '₹45,200', color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Net Liability', value: '₹3,50,000', color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="border-none glass-card shadow-lg p-6 group hover:translate-y-[-2px] transition-all">
            <CardContent className="p-0">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} w-fit mb-5 group-hover:scale-105 transition-transform`}>
                <Calculator className="h-5 w-5" />
              </div>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">{stat.label}</p>
              <p className="text-2xl font-black font-headline tracking-tighter mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
