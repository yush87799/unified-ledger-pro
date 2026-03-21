
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
    // Simulate AI analysis delay
    setTimeout(() => {
      setAnalyzing(false);
      toast({
        title: "Compliance Audit Complete",
        description: "GenAI has finished auditing your transactions. Found 2 optimizations.",
      });
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold">GST & Compliance</h1>
          <p className="text-muted-foreground">Monitor tax liabilities and stay audit-ready.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Download GSTR-1
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Download GSTR-3B
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-none shadow-md bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-headline flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Compliance Advisor
              </CardTitle>
              <CardDescription>Powered by Unified Ledger AI</CardDescription>
            </div>
            <Button 
              size="sm" 
              onClick={handleAIAnalysis} 
              disabled={analyzing}
              className="rounded-full"
            >
              {analyzing ? <RefreshCcw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCcw className="h-4 w-4 mr-2" />}
              {analyzing ? 'Analyzing...' : 'Run Audit'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-card shadow-sm border border-emerald-500/20">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <FileCheck className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">ITC Optimization Opportunity</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  We've identified ₹12,400 in unclaimed Input Tax Credit from last month's office utility bills.
                </p>
                <Button variant="link" className="p-0 h-auto text-primary text-xs mt-2">
                  Claim now <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-card shadow-sm border border-amber-500/20">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <AlertCircle className="h-6 w-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm">HSN Code Mismatch</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  3 transactions for "Ergonomic Chairs" have inconsistent HSN codes. This might cause issues during filing.
                </p>
                <Button variant="link" className="p-0 h-auto text-primary text-xs mt-2">
                  Review transactions <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-lg">Filing Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly Progress</span>
                <span className="font-bold">84%</span>
              </div>
              <Progress value={84} className="h-2" />
            </div>

            <div className="pt-4 space-y-4">
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm">Sales Reconciliation</span>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-500 bg-emerald-500/5">DONE</Badge>
              </div>
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm">Purchase Matching</span>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-500 bg-emerald-500/5">DONE</Badge>
              </div>
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-sm">Tax Computation</span>
                </div>
                <Badge variant="outline" className="text-[10px] text-amber-500 bg-amber-500/5">PENDING</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'CGST Payable', value: '₹1,52,400', icon: Calculator, color: 'text-indigo-500' },
          { label: 'SGST Payable', value: '₹1,52,400', icon: Calculator, color: 'text-emerald-500' },
          { label: 'IGST Payable', value: '₹45,200', icon: Calculator, color: 'text-blue-500' },
          { label: 'Total Liability', value: '₹3,50,000', icon: Calculator, color: 'text-amber-500' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="pt-6">
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <p className="text-xs text-muted-foreground uppercase font-semibold">{stat.label}</p>
              <p className="text-xl font-bold font-headline mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
