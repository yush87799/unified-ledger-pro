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
    setTimeout(() => {
      setAnalyzing(false);
      toast({
        title: "Compliance Audit Complete",
        description: "Unified Ledger AI has finished the real-time reconciliation audit.",
      });
    }, 1500);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Compliance: Healthy</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-black tracking-tight leading-none">
            GST & <span className="text-muted-foreground/30 font-thin italic">Compliance</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-xl opacity-80">
            Real-time tax reconciliation, GSTR filing prep, and automated ITC auditing.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="h-9 rounded-lg glass font-bold text-xs px-3">
            <Download className="mr-1.5 h-3.5 w-3.5" /> GSTR-1
          </Button>
          <Button variant="outline" className="h-9 rounded-lg glass font-bold text-xs px-3">
            <Download className="mr-1.5 h-3.5 w-3.5" /> GSTR-3B
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 border-none shadow-xl glass-card rounded-xl overflow-hidden bg-gradient-to-br from-primary/[0.02] to-transparent">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-primary/5 gap-4">
            <div className="space-y-1">
              <CardTitle className="font-headline text-lg font-black flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Intelligence Advisor
              </CardTitle>
              <CardDescription className="text-xs font-medium opacity-70">Automated Audit Analysis v4.2</CardDescription>
            </div>
            <Button 
              onClick={handleAIAnalysis} 
              disabled={analyzing}
              className="rounded-lg h-10 px-5 font-black w-full sm:w-auto shadow-lg text-xs"
            >
              {analyzing ? <RefreshCcw className="h-3.5 w-3.5 animate-spin mr-2" /> : <RefreshCcw className="h-3.5 w-3.5 mr-2" />}
              {analyzing ? 'Auditing...' : 'Run Audit'}
            </Button>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-4 p-5 rounded-xl bg-card/40 border border-emerald-500/20 shadow-sm">
              <div className="p-2.5 bg-emerald-500/10 rounded-lg">
                <FileCheck className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-black text-base tracking-tight">ITC Optimization Found</h4>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  Identified ₹12,400 in unclaimed Input Tax Credit from matched interactions.
                </p>
                <Button variant="link" className="p-0 h-auto text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                  Apply Reconcile <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl bg-card/40 border border-amber-500/20 shadow-sm">
              <div className="p-2.5 bg-amber-500/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-black text-base tracking-tight">GSTR-2A Matching Alert</h4>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  3 suppliers have pending filings. This may delay your ITC settlement cycle.
                </p>
                <Button variant="link" className="p-0 h-auto text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                  Audit Counterparties <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-none shadow-xl glass-card rounded-xl overflow-hidden">
          <CardHeader className="p-6 border-b border-primary/5 bg-primary/[0.02]">
            <CardTitle className="font-headline text-lg font-black tracking-tight">Filing Readiness</CardTitle>
            <CardDescription className="text-xs font-medium opacity-70">Current period monitoring</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                <span className="text-muted-foreground">Compliance Index</span>
                <span className="text-primary">84% Ready</span>
              </div>
              <Progress value={84} className="h-2 rounded-full" />
            </div>

            <div className="space-y-3">
              {[
                { label: 'Sales Reconciliation', status: 'DONE', color: 'bg-emerald-500' },
                { label: 'Purchase Matching', status: 'DONE', color: 'bg-emerald-500' },
                { label: 'Tax Computation', status: 'PENDING', color: 'bg-amber-500' },
              ].map((step, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-lg bg-secondary/30 border border-transparent">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${step.color}`} />
                    <span className="text-xs font-bold tracking-tight">{step.label}</span>
                  </div>
                  <Badge variant="outline" className={`text-[9px] font-black tracking-widest border-none px-2 py-0.5 ${step.status === 'DONE' ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'}`}>
                    {step.status}
                  </Badge>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full h-10 rounded-lg font-black text-[10px] gap-1.5 border-primary/10 hover:bg-primary/5">
              Review Full Audit Log <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'CGST Accumulation', value: '₹1,52,400', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'SGST Accumulation', value: '₹1,52,400', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'IGST (Interstate)', value: '₹45,200', color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Net Liability', value: '₹3,50,000', color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="border-none glass-card shadow-lg p-5 group transition-all">
            <CardContent className="p-0">
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} w-fit mb-4`}>
                <Calculator className="h-4 w-4" />
              </div>
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{stat.label}</p>
              <p className="text-xl font-black font-headline tracking-tighter mt-0.5">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}