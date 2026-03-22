"use client";

import React, { useState } from 'react';
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
  Search,
  ChevronRight
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';

export default function GSTCompliancePage() {
  const [analyzing, setAnalyzing] = useState(false);

  const handleAIAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      toast({
        title: "Compliance Audit Complete",
        description: "GenAI has finished auditing your transactions. Found 2 optimizations.",
      });
    }, 2000);
  };

  return (
    <div className="space-y-8 sm:space-y-12 animate-in fade-in duration-500 pb-12 sm:pb-20">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 sm:gap-8">
        <div className="space-y-2 sm:space-y-3">
          <h1 className="font-headline text-3xl sm:text-5xl font-black tracking-tighter">GST & <span className="text-muted-foreground/30 font-thin italic">Compliance</span></h1>
          <p className="text-sm sm:text-lg text-muted-foreground font-medium max-w-2xl">Monitor tax liabilities and stay audit-ready with intelligent reconciliation.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <Button variant="outline" className="h-12 sm:h-14 rounded-xl sm:rounded-2xl glass font-bold text-xs sm:text-sm">
            <Download className="mr-2 h-4 w-4" /> Download GSTR-1
          </Button>
          <Button variant="outline" className="h-12 sm:h-14 rounded-xl sm:rounded-2xl glass font-bold text-xs sm:text-sm">
            <Download className="mr-2 h-4 w-4" /> Download GSTR-3B
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
        <Card className="lg:col-span-2 border-none shadow-2xl glass-card rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 sm:p-10 border-b border-primary/5 gap-6">
            <div className="space-y-1">
              <CardTitle className="font-headline text-xl sm:text-2xl font-black flex items-center gap-3">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                AI Compliance Advisor
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm font-medium">Powered by Unified Ledger AI Intelligence</CardDescription>
            </div>
            <Button 
              size="lg" 
              onClick={handleAIAnalysis} 
              disabled={analyzing}
              className="rounded-xl sm:rounded-2xl h-12 sm:h-14 px-6 sm:px-8 font-black w-full sm:w-auto shadow-xl"
            >
              {analyzing ? <RefreshCcw className="h-4 w-4 animate-spin mr-3" /> : <RefreshCcw className="h-4 w-4 mr-3" />}
              {analyzing ? 'Analyzing Matrix...' : 'Run Audit'}
            </Button>
          </CardHeader>
          <CardContent className="p-6 sm:p-10 space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-card/40 border border-emerald-500/20 shadow-xl group hover:scale-[1.02] transition-all">
              <div className="p-3 bg-emerald-500/10 rounded-xl sm:rounded-2xl group-hover:rotate-6 transition-transform">
                <FileCheck className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-500" />
              </div>
              <div className="flex-1 space-y-1 sm:space-y-2">
                <h4 className="font-black text-base sm:text-lg tracking-tight">ITC Optimization Opportunity</h4>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                  We've identified ₹12,400 in unclaimed Input Tax Credit from last month's office utility bills. This can be reconciled immediately.
                </p>
                <Button variant="link" className="p-0 h-auto text-primary font-black text-xs sm:text-sm uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                  Execute Claim <ChevronRight className="h-3 w-3 sm:h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-card/40 border border-amber-500/20 shadow-xl group hover:scale-[1.02] transition-all">
              <div className="p-3 bg-amber-500/10 rounded-xl sm:rounded-2xl group-hover:-rotate-6 transition-transform">
                <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500" />
              </div>
              <div className="flex-1 space-y-1 sm:space-y-2">
                <h4 className="font-black text-base sm:text-lg tracking-tight">HSN Code Mismatch</h4>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                  3 transactions for "Ergonomic Chairs" have inconsistent HSN codes. This may lead to filing discrepancies.
                </p>
                <Button variant="link" className="p-0 h-auto text-primary font-black text-xs sm:text-sm uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                  Audit Transactions <ChevronRight className="h-3 w-3 sm:h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-2xl glass-card rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden">
          <CardHeader className="p-6 sm:p-10 border-b border-primary/5 bg-primary/[0.02]">
            <CardTitle className="font-headline text-xl sm:text-2xl font-black tracking-tight">Filing Velocity</CardTitle>
            <CardDescription className="text-xs sm:text-sm font-medium">Current period filing readiness</CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-10 space-y-8 sm:space-y-10">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between text-xs sm:text-sm font-black uppercase tracking-widest">
                <span className="text-muted-foreground">Compliance Progress</span>
                <span className="text-primary">84%</span>
              </div>
              <Progress value={84} className="h-3 sm:h-4 rounded-full" />
            </div>

            <div className="space-y-4 sm:space-y-6">
              {[
                { label: 'Sales Reconciliation', status: 'DONE', color: 'bg-emerald-500' },
                { label: 'Purchase Matching', status: 'DONE', color: 'bg-emerald-500' },
                { label: 'Tax Computation', status: 'PENDING', color: 'bg-amber-500' },
              ].map((step, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-secondary/30">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${step.color} animate-pulse`} />
                    <span className="text-xs sm:text-sm font-bold">{step.label}</span>
                  </div>
                  <Badge variant="outline" className={`text-[8px] sm:text-[10px] font-black tracking-widest border-none px-2 sm:px-3 py-0.5 sm:py-1 ${step.status === 'DONE' ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'}`}>
                    {step.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
        {[
          { label: 'CGST Payable', value: '₹1,52,400', icon: Calculator, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'SGST Payable', value: '₹1,52,400', icon: Calculator, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'IGST Payable', value: '₹45,200', icon: Calculator, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Total Liability', value: '₹3,50,000', icon: Calculator, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="border-none glass-card shadow-xl p-6 sm:p-8 group hover:translate-y-[-4px] transition-all">
            <CardContent className="p-0">
              <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${stat.bg} ${stat.color} w-fit mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">{stat.label}</p>
              <p className="text-xl sm:text-2xl font-black font-headline tracking-tighter mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
