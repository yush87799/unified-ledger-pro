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
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { Invoice } from '@/lib/types';
import { gstComplianceAdvisor, GSTComplianceAdvisorOutput } from '@/ai/flows/gst-compliance-advisor';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function GSTCompliancePage() {
  const [analyzing, setAnalyzing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [auditResult, setAuditResult] = useState<GSTComplianceAdvisorOutput | null>(null);
  const [taxSummary, setTaxSummary] = useState({ cgst: 0, sgst: 0, igst: 0, total: 0 });

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const data = await apiClient.invoices.getAll();
      setInvoices(data);
      
      const taxRes = await fetch(`${API_BASE_URL}/gstr3b`);
      const taxData = await taxRes.json();
      if (taxData.summary) {
        setTaxSummary({
          cgst: taxData.summary.cgst,
          sgst: taxData.summary.sgst,
          igst: taxData.summary.igst,
          total: taxData.summary.totalTax
        });
      }
    } catch (err) {
      console.error("Failed to fetch ledger context.");
    }
  };

  const handleAIAnalysis = async () => {
    if (!invoices.length) {
      toast({ title: "No Data", description: "No invoices available to audit.", variant: "destructive" });
      return;
    }
    setAnalyzing(true);
    try {
      // Map down the payload size to essential GST attributes to save token cost and time
      const payload = invoices.map(inv => ({
        id: inv.id,
        type: inv.type,
        amount: inv.grandTotal,
        gstTotal: inv.gstTotal,
        items: inv.items.map(item => ({ taxRate: item.taxRate, price: item.price, qty: item.qty }))
      }));

      const result = await gstComplianceAdvisor({
        transactionDataJson: JSON.stringify(payload),
        gstRegulationsSummary: "Look for mismatched standard tax rates (5%, 12%, 18%, 28%) and ITC optimization."
      });
      
      setAuditResult(result);
      toast({
        title: "Compliance Audit Complete",
        description: "Unified Ledger AI has finished the real-time reconciliation audit.",
      });
    } catch (error) {
      console.error("AI Audit failed:", error);
      toast({ title: "Audit Failed", description: "Could not complete the AI audit.", variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownloadGSTR = async (type: 'gstr1' | 'gstr3b') => {
    try {
      setIsDownloading(true);
      const response = await fetch(`${API_BASE_URL}/${type}`);
      const data = await response.json();
      
      const currentMonth = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });
      
      const downloadCSV = (content: string, filename: string) => {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      if (type === 'gstr1') {
        downloadCSV(data.b2b, `GSTR1_B2B_${currentMonth}.csv`);
        downloadCSV(data.b2cs, `GSTR1_B2CS_${currentMonth}.csv`);
      } else {
        downloadCSV(data.csv, `GSTR3B_Summary_${currentMonth}.csv`);
      }
      
      toast({
        title: "Download Complete",
        description: `${type.toUpperCase()} report has been generated and downloaded.`,
      });
    } catch (error) {
      console.error('Failed to download GSTR reports:', error);
      toast({
        title: "Download Failed",
        description: "Could not generate the requested report. Please ensure the backend is running.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
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
          <Button 
            variant="outline" 
            className="h-9 rounded-lg glass font-bold text-xs px-3"
            onClick={() => handleDownloadGSTR('gstr1')}
            disabled={isDownloading}
          >
            {isDownloading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />} GSTR-1
          </Button>
          <Button 
            variant="outline" 
            className="h-9 rounded-lg glass font-bold text-xs px-3"
            onClick={() => handleDownloadGSTR('gstr3b')}
            disabled={isDownloading}
          >
            {isDownloading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />} GSTR-3B
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
            {auditResult?.overallSummary && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4 animate-in slide-in-from-bottom-2">
                <h4 className="font-black text-sm text-primary mb-1 flex items-center gap-2"><Sparkles className="h-4 w-4"/> AI Executive Summary</h4>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">{auditResult.overallSummary}</p>
              </div>
            )}
            
            {auditResult ? (
              auditResult.complianceFindings.map((finding, idx) => {
                const isError = finding.type === 'error';
                const isWarning = finding.type === 'warning';
                
                const Icon = isError ? AlertCircle : isWarning ? AlertCircle : FileCheck;
                const colorClass = isError ? 'border-destructive/30 bg-destructive/5' : isWarning ? 'border-amber-500/30 bg-amber-500/5' : 'border-emerald-500/30 bg-emerald-500/5';
                const iconColor = isError ? 'text-destructive' : isWarning ? 'text-amber-500' : 'text-emerald-500';
                const iconBg = isError ? 'bg-destructive/10' : isWarning ? 'bg-amber-500/10' : 'bg-emerald-500/10';

                return (
                  <div key={idx} className={`flex items-start gap-4 p-5 rounded-xl shadow-sm animate-in fade-in zoom-in duration-500 delay-${idx * 100} ${colorClass}`}>
                    <div className={`p-2.5 rounded-lg ${iconBg}`}>
                      <Icon className={`h-5 w-5 ${iconColor}`} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h4 className="font-black text-base tracking-tight capitalize">{finding.type} Detected</h4>
                      <p className="text-xs text-foreground/80 font-medium leading-relaxed">
                        {finding.description}
                      </p>
                      <div className="mt-3 p-3 rounded-lg bg-background/50 border border-border/50">
                        <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-1 block">Suggested Action</span>
                        <p className="text-xs font-bold text-foreground">{finding.suggestedAction}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center opacity-60">
                <Sparkles className="h-8 w-8 text-primary mb-3" />
                <p className="text-sm font-bold">Ready to analyze</p>
                <p className="text-xs text-muted-foreground max-w-[250px] mx-auto mt-1">Run an audit to detect tax anomalies and optimization opportunities across all records.</p>
              </div>
            )}
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
          { label: 'CGST Accumulation', value: `₹${taxSummary.cgst.toLocaleString('en-IN', {maximumFractionDigits: 2})}`, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'SGST Accumulation', value: `₹${taxSummary.sgst.toLocaleString('en-IN', {maximumFractionDigits: 2})}`, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'IGST (Interstate)', value: `₹${taxSummary.igst.toLocaleString('en-IN', {maximumFractionDigits: 2})}`, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Net Liability', value: `₹${taxSummary.total.toLocaleString('en-IN', {maximumFractionDigits: 2})}`, color: 'text-amber-500', bg: 'bg-amber-500/10' },
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