
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  Printer, 
  Save, 
  Loader2, 
  History, 
  Search,
  Eye,
  User,
  ShoppingBag,
  Zap,
  IndianRupee,
  Clock3
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { INDIAN_STATES } from '@/lib/states';
import { apiClient } from '@/lib/api-client';
import { Product, LineItem, Invoice, BusinessSettings, PaymentMode } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function BillingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', productId: '', productName: '', qty: 1, price: 0, buyingPrice: 0, mrp: 0, gstRate: 0, unit: 'units', total: 0 }
  ]);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', stateCode: '', gstin: '' });
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [history, setHistory] = useState<Invoice[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Partial<Invoice> | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoadingProducts(true);
    try {
      const [prodData, settingsData] = await Promise.all([
        apiClient.inventory.getAll(),
        apiClient.settings.get()
      ]);
      setProducts(prodData);
      setBusinessSettings(settingsData);
    } catch (err) {
      toast({ title: "Fetch Error", variant: "destructive" });
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await apiClient.invoices.getAll();
      setHistory(data);
    } catch (err) {
      toast({ title: "Ledger Error", variant: "destructive" });
    } finally {
      setLoadingHistory(false);
    }
  };

  const addItem = () => {
    setItems([...items, { 
      id: Math.random().toString(36).substr(2, 9), 
      productId: '', 
      productName: '', 
      qty: 1, 
      price: 0, 
      buyingPrice: 0,
      mrp: 0,
      gstRate: 0, 
      unit: 'units', 
      total: 0 
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const handleProductSelect = (id: string, productId: string) => {
    const product = products.find((p, pIdx) => (p.id || `legacy-prod-${pIdx}`) === productId);
    if (!product) return;

    setItems(items.map(item => {
      if (item.id === id) {
        const gstNum = parseFloat(product.gst.replace('%', '')) || 0;
        return {
          ...item,
          productId,
          productName: product.name,
          price: product.price,
          buyingPrice: product.buyingPrice || 0,
          mrp: product.mrp,
          gstRate: gstNum,
          unit: product.unit,
          total: product.price * item.qty
        };
      }
      return item;
    }));
  };

  const handleQtyChange = (id: string, val: string) => {
    const qty = parseInt(val.replace(/[^0-9]/g, '')) || 0;
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, qty, total: item.price * qty };
      }
      return item;
    }));
  };

  const totals = useMemo(() => {
    let grandTotal = 0;
    let taxableSubtotal = 0;
    items.forEach(item => {
      if (!item.productId) return;
      const itemTotal = item.price * item.qty;
      const basePrice = item.price / (1 + (item.gstRate / 100));
      grandTotal += itemTotal;
      taxableSubtotal += basePrice * item.qty;
    });
    const isIntraState = businessSettings?.stateCode === customer.stateCode;
    return {
      grandTotal,
      subtotal: taxableSubtotal,
      gstTotal: grandTotal - taxableSubtotal,
      taxType: (isIntraState ? 'INTRA' : 'INTER') as 'INTRA' | 'INTER'
    };
  }, [items, businessSettings, customer.stateCode]);

  const handleWalkIn = () => {
    setCustomer({
      name: 'Walk-in Customer',
      phone: '0000000000',
      address: '',
      stateCode: businessSettings?.stateCode || '29',
      gstin: ''
    });
  };

  const handleSaveInvoice = async () => {
    if (!customer.name || !customer.phone || !customer.stateCode) {
      toast({ title: "Entity Info Missing", variant: "destructive" });
      return;
    }
    if (items.some(i => !i.productId || i.qty <= 0)) {
      toast({ title: "Asset Stream Incomplete", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<Invoice> = { 
        customer, 
        items: items.filter(i => i.productId), 
        subtotal: totals.subtotal, 
        gstTotal: totals.gstTotal, 
        grandTotal: totals.grandTotal,
        taxType: totals.taxType,
        paymentMode,
        businessStateCode: businessSettings?.stateCode || '29'
      };
      const saved = await apiClient.invoices.create(payload);
      toast({ title: "Settlement Recorded", description: `Interaction ${saved.id} finalized.` });
      setItems([{ id: '1', productId: '', productName: '', qty: 1, price: 0, buyingPrice: 0, mrp: 0, gstRate: 0, unit: 'units', total: 0 }]);
      setCustomer({ name: '', phone: '', address: '', stateCode: '', gstin: '' });
      loadInitialData();
    } catch (err) {
      toast({ title: "Sync Failure", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewCurrent = () => {
    setPreviewInvoice({
      id: 'DRAFT-TERM',
      customer,
      items: items.filter(i => i.productId),
      subtotal: totals.subtotal,
      gstTotal: totals.gstTotal,
      grandTotal: totals.grandTotal,
      taxType: totals.taxType,
      paymentMode,
      businessStateCode: businessSettings?.stateCode || '29',
      createdAt: new Date().toISOString()
    });
    setIsPreviewOpen(true);
  };

  const filteredHistory = history.filter(inv => 
    (inv.id || '').toLowerCase().includes(historySearch.toLowerCase()) ||
    (inv.customer?.name || '').toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20">
            <Zap className="h-4 w-4 text-primary fill-primary" />
            <span className="text-[11px] font-black uppercase tracking-widest text-primary">Terminal v4.0 Active</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-black tracking-tight leading-none">Point of <span className="text-muted-foreground/30 font-thin italic">Sale</span></h1>
        </div>
      </div>

      <Tabs defaultValue="create" className="space-y-6" onValueChange={(val) => val === 'history' && loadHistory()}>
        <TabsList className="bg-secondary/50 p-1.5 rounded-2xl h-12 w-full max-w-sm glass">
          <TabsTrigger value="create" className="flex-1 rounded-xl font-bold h-full gap-2 text-sm"><Plus className="h-4 w-4" /> New Interaction</TabsTrigger>
          <TabsTrigger value="history" className="flex-1 rounded-xl font-bold h-full gap-2 text-sm"><History className="h-4 w-4" /> Historical Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="flex flex-col xl:flex-row gap-8">
            <div className="flex-1 space-y-6 min-w-0">
              <Card className="border-none glass-card shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="p-5 border-b border-primary/5 bg-primary/[0.02]">
              <div className="flex items-center justify-between w-full">
                <CardTitle className="font-headline text-base font-black flex items-center gap-3"><User className="h-5 w-5 text-primary" /> Entity Intelligence</CardTitle>
                <Button variant="outline" size="sm" onClick={handleWalkIn} className="h-8 px-3 rounded-lg text-xs font-bold border-primary/20 hover:bg-primary/5 shadow-sm">Walk-in Customer</Button>
              </div>
                </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[11px] uppercase font-black tracking-widest opacity-60">Legal Entity*</Label>
                    <Input placeholder="Client Name" className="h-10 rounded-xl bg-secondary/30 border-none font-bold text-sm" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
                  </div>
              <div className="space-y-2">
                <Label className="text-[11px] uppercase font-black tracking-widest opacity-60 flex items-center justify-between">B2B GSTIN <span className="opacity-50 font-normal normal-case tracking-normal">Optional</span></Label>
                <Input placeholder="15 Digit GSTIN" maxLength={15} className="h-10 rounded-xl bg-secondary/30 border-none font-bold text-sm uppercase" value={customer.gstin} onChange={e => setCustomer({...customer, gstin: e.target.value.toUpperCase()})} />
              </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] uppercase font-black tracking-widest opacity-60">Contact Matrix*</Label>
                    <Input placeholder="+91..." className="h-10 rounded-xl bg-secondary/30 border-none font-bold text-sm" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] uppercase font-black tracking-widest opacity-60">Jurisdiction*</Label>
                    <Select value={customer.stateCode} onValueChange={val => setCustomer({...customer, stateCode: val})}>
                      <SelectTrigger className="h-10 rounded-xl bg-secondary/30 border-none font-bold text-sm"><SelectValue placeholder="Select Area" /></SelectTrigger>
                      <SelectContent className="glass border-none rounded-2xl p-2">
                        {INDIAN_STATES.map(s => <SelectItem key={s.code} value={s.code} className="text-sm py-2.5 rounded-xl">{s.code} - {s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[11px] uppercase font-black tracking-widest opacity-60">Settlement Mode*</Label>
                    <Select value={paymentMode} onValueChange={(val: PaymentMode) => setPaymentMode(val)}>
                      <SelectTrigger className="h-10 rounded-xl bg-secondary/30 border-none font-bold text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent className="glass border-none rounded-2xl p-2">
                        <SelectItem value="cash" className="text-sm py-2.5 rounded-xl">Liquid Cash</SelectItem>
                        <SelectItem value="online" className="text-sm py-2.5 rounded-xl">Digital Transfer</SelectItem>
                        <SelectItem value="pending" className="text-sm py-2.5 rounded-xl text-amber-500 font-bold">Pending Credit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none glass-card shadow-lg rounded-2xl overflow-hidden">
                <CardHeader className="p-5 border-b border-primary/5 bg-primary/[0.02] flex flex-row items-center justify-between">
                  <CardTitle className="font-headline text-base font-black flex items-center gap-3"><ShoppingBag className="h-5 w-5 text-primary" /> Asset Stream</CardTitle>
                  <Button variant="ghost" size="sm" onClick={addItem} className="text-primary font-black h-9 px-4 text-xs rounded-xl hover:bg-primary/5"><Plus className="mr-2 h-4 w-4" /> Add Row</Button>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <div className="min-w-[850px]">
                    <Table>
                      <TableHeader className="bg-primary/[0.01]">
                        <TableRow className="border-none">
                          <TableHead className="py-4 pl-7 font-black uppercase text-[11px] tracking-widest">Enterprise Asset</TableHead>
                          <TableHead className="font-black uppercase text-[11px] tracking-widest">Qty Matrix</TableHead>
                          <TableHead className="font-black uppercase text-[11px] tracking-widest">Rate (₹)</TableHead>
                          <TableHead className="font-black uppercase text-[11px] tracking-widest">Tax Bracket</TableHead>
                          <TableHead className="text-right pr-7 font-black uppercase text-[11px] tracking-widest">Net Value</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => {
                          const p = products.find(prod => prod.id === item.productId);
                          const savings = item.mrp > item.price ? item.mrp - item.price : 0;
                          return (
                            <TableRow key={item.id} className="border-none hover:bg-primary/[0.03] transition-colors">
                              <TableCell className="py-4 pl-7">
                                <Select value={item.productId} onValueChange={(v) => handleProductSelect(item.id, v)}>
                                  <SelectTrigger className="h-10 rounded-xl bg-secondary/30 border-none font-bold text-sm"><SelectValue placeholder="Select Asset" /></SelectTrigger>
                                  <SelectContent className="glass border-none rounded-2xl p-2">
                                  {products.map((p, pIdx) => <SelectItem key={p.id || `legacy-prod-${pIdx}`} value={p.id || `legacy-prod-${pIdx}`} className="text-sm py-2.5 rounded-xl">{p.name} <span className="opacity-40 text-[10px] font-bold ml-2">({p.stock} avail @ {p.warehouse})</span></SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Input value={item.qty} className="h-10 w-16 rounded-xl bg-secondary/30 border-none font-black text-center text-sm" onChange={e => handleQtyChange(item.id, e.target.value)} />
                                  <span className="text-[11px] font-black uppercase opacity-40">{item.unit}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col leading-tight">
                                  <span className="font-black text-sm">₹{item.price.toLocaleString()}</span>
                                  {savings > 0 && <span className="text-[10px] text-emerald-500 font-black uppercase tracking-tight">Save ₹{savings.toLocaleString()}</span>}
                                </div>
                              </TableCell>
                              <TableCell><Badge variant="outline" className="rounded-md border-primary/20 text-primary font-black text-[10px] px-2 py-0.5">{item.gstRate}%</Badge></TableCell>
                              <TableCell className="text-right pr-7 font-black text-base">₹{item.total.toLocaleString()}</TableCell>
                              <TableCell className="pr-4"><Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive" onClick={() => removeItem(item.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="xl:w-[320px] space-y-6">
              <Card className="border-none bg-primary text-primary-foreground rounded-2xl p-7 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 scale-[1.8] rotate-45 pointer-events-none group-hover:rotate-12 transition-transform duration-1000"><IndianRupee className="h-16 w-16" /></div>
                <div className="space-y-6 relative z-10">
                  <h3 className="font-headline text-lg font-black tracking-tight">Financial Matrix</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center opacity-80 text-[11px] font-bold uppercase tracking-widest"><span>Taxable Base</span><span>₹{totals.subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between items-center opacity-80 text-[11px] font-bold uppercase tracking-widest"><span>Asset Tax</span><span>₹{totals.gstTotal.toLocaleString()}</span></div>
                    <div className="pt-4 border-t border-white/20">
                      <div className="flex justify-between items-end">
                        <span className="font-black uppercase tracking-widest text-[10px] opacity-90">Net Settlement</span>
                        <span className="font-headline text-3xl font-black tracking-tighter">₹{totals.grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 mt-6">
                    <Button className="w-full h-12 rounded-xl bg-white text-primary hover:bg-white/90 font-black text-sm shadow-xl" onClick={handleSaveInvoice} disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />} Finalize Interaction
                    </Button>
                    <Button variant="outline" className="w-full h-11 rounded-xl border-white/20 bg-white/5 text-white text-[11px] font-bold" onClick={handlePreviewCurrent}>
                      <Printer className="h-4 w-4 mr-2" /> Snapshot Preview
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="border-none glass-card p-5 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center"><Clock3 className="h-5 w-5 text-primary" /></div>
                  <h4 className="font-black text-xs tracking-tight uppercase">System Temporal</h4>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-medium opacity-60">Master Timestamp:</p>
                  <p className="text-sm font-black font-mono tracking-tight">{new Date().toLocaleString()}</p>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-none glass-card shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="p-6 border-b border-primary/5 bg-primary/[0.02]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <CardTitle className="font-headline text-xl font-black tracking-tight">Historical Ledger Audit</CardTitle>
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search Matrix Ledger..." className="pl-10 h-10 rounded-xl bg-secondary/30 border-none font-bold text-sm" value={historySearch} onChange={e => setHistorySearch(e.target.value)} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <div className="min-w-[850px]">
                <Table>
                  <TableHeader className="bg-primary/[0.01]">
                    <TableRow className="border-none">
                      <TableHead className="py-5 pl-7 font-black uppercase text-[11px] tracking-widest">Interaction ID</TableHead>
                      <TableHead className="font-black uppercase text-[11px] tracking-widest">Timeline</TableHead>
                      <TableHead className="font-black uppercase text-[11px] tracking-widest">Counterparty</TableHead>
                      <TableHead className="font-black uppercase text-[11px] tracking-widest">Settlement</TableHead>
                      <TableHead className="font-black uppercase text-[11px] tracking-widest">Net Value</TableHead>
                      <TableHead className="text-right pr-7 font-black uppercase text-[11px] tracking-widest">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingHistory ? (
                      <TableRow key="loading"><TableCell colSpan={6} className="text-center py-20"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary opacity-30" /></TableCell></TableRow>
                    ) : filteredHistory.length === 0 ? (
                      <TableRow key="empty"><TableCell colSpan={6} className="text-center py-20 font-bold text-muted-foreground italic text-sm">No historical interactions.</TableCell></TableRow>
                    ) : filteredHistory.map((inv, idx) => (
                      <TableRow key={inv.id || `legacy-inv-${idx}`} className="border-none hover:bg-primary/[0.03] transition-colors">
                        <TableCell className="font-mono text-xs font-black text-primary py-4 pl-7">{inv.id || 'LEGACY'}</TableCell>
                        <TableCell className="text-sm font-medium">{inv.createdAt ? new Date(inv.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Unknown'}</TableCell>
                        <TableCell className="font-black tracking-tight text-sm">{inv.customer?.name || 'Unknown'}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md">{inv.paymentMode || 'N/A'}</Badge></TableCell>
                        <TableCell className="font-black text-base">₹{(inv.grandTotal || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right pr-7"><Button variant="ghost" size="sm" className="h-9 px-4 font-black text-primary text-[11px] rounded-xl hover:bg-primary/5"><Eye className="h-4 w-4 mr-2" /> Details</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[700px] p-0 overflow-hidden rounded-[2.5rem] border-none glass shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Official Tax Invoice Preview</DialogTitle>
          </DialogHeader>
          <div className="p-10 max-h-[85vh] overflow-y-auto bg-white text-black text-sm">
            {previewInvoice && (
              <div className="space-y-10">
                <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8">
                  <div className="space-y-3">
                    <h2 className="text-3xl font-black font-headline text-primary italic uppercase tracking-tighter">{businessSettings?.brandName}</h2>
                    <p className="font-bold text-xs opacity-60 tracking-widest">GSTIN: {businessSettings?.gstin}</p>
                    <p className="font-medium text-xs text-slate-500 max-w-[280px] leading-relaxed">{businessSettings?.address}</p>
                  </div>
                  <div className="text-right space-y-3">
                    <Badge className="bg-emerald-500 text-white border-none px-4 py-1.5 rounded-full text-[11px] font-black tracking-widest shadow-lg">OFFICIAL TAX INVOICE</Badge>
                    <p className="font-bold text-xs mt-3">TIMESTAMP: {new Date(previewInvoice.createdAt!).toLocaleString()}</p>
                    <p className="font-mono font-black text-primary text-sm tracking-tight">REF: {previewInvoice.id}</p>
                  </div>
                </div>
                <div className="flex justify-between text-sm border-b-2 border-slate-100 pb-8">
                  <div className="space-y-2">
                    <p className="font-black text-primary uppercase text-[10px] tracking-[0.2em]">Billed To:</p>
                    <p className="font-black text-2xl tracking-tighter">{previewInvoice.customer?.name}</p>
                    <p className="opacity-70 font-bold text-base">{previewInvoice.customer?.phone}</p>
                    {previewInvoice.customer?.gstin && <p className="font-bold text-xs mt-1"><span className="opacity-60">GSTIN:</span> {previewInvoice.customer.gstin}</p>}
                  </div>
                  <div className="text-right space-y-2"><p className="font-black text-primary uppercase text-[10px] tracking-[0.2em]">Settlement Matrix:</p><Badge variant="outline" className="font-black text-[11px] uppercase mt-2 tracking-widest border-slate-200 px-3 py-1">{previewInvoice.paymentMode}</Badge></div>
                </div>
                <Table>
                  <TableHeader><TableRow className="border-b-2 border-black"><TableHead className="text-black font-black uppercase text-[11px] h-12 tracking-widest">Asset Description</TableHead><TableHead className="text-black font-black uppercase text-[11px] h-12 tracking-widest">Volume</TableHead><TableHead className="text-right text-black font-black uppercase text-[11px] h-12 tracking-widest">Net Value</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {previewInvoice.items?.map((item) => (
                      <TableRow key={item.id} className="border-b border-slate-50 hover:bg-transparent"><TableCell className="font-black py-5 text-lg tracking-tight">{item.productName}</TableCell><TableCell className="font-bold py-5 text-sm">{item.qty} {item.unit}</TableCell><TableCell className="text-right font-black py-5 text-xl tracking-tighter">₹{item.total.toLocaleString()}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-end pt-8"><div className="w-[280px] space-y-3"><div className="flex justify-between text-[11px] opacity-60"><span className="font-black uppercase tracking-[0.2em]">Subtotal Base</span><span className="font-bold">₹{previewInvoice.subtotal?.toLocaleString()}</span></div><div className="flex justify-between text-[11px] opacity-60"><span className="font-black uppercase tracking-[0.2em]">Total Asset Tax</span><span className="font-bold">₹{previewInvoice.gstTotal?.toLocaleString()}</span></div><div className="pt-6 border-t-4 border-black flex justify-between items-end"><span className="font-black uppercase text-primary text-xs tracking-[0.3em]">Net Settlement</span><span className="font-headline text-4xl font-black tracking-tighter">₹{previewInvoice.grandTotal?.toLocaleString()}</span></div></div></div>
              </div>
            )}
          </div>
          <DialogFooter className="p-6 bg-primary/5 border-t border-primary/5 flex gap-3">
            <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="rounded-2xl font-black h-11 text-sm px-7">Close Snapshot</Button>
            <Button onClick={() => window.print()} className="rounded-2xl h-11 px-8 font-black text-sm gap-2 shadow-xl"><Printer className="h-5 w-5" /> Print Physical Ledger</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
