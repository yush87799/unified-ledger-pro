
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
  CreditCard,
  Wallet,
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
    { id: '1', productId: '', productName: '', qty: 1, price: 0, mrp: 0, gstRate: 0, unit: 'units', total: 0 }
  ]);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', stateCode: '' });
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
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setItems(items.map(item => {
      if (item.id === id) {
        const gstNum = parseFloat(product.gst.replace('%', '')) || 0;
        return {
          ...item,
          productId,
          productName: product.name,
          price: product.price,
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

  const handleSaveInvoice = async () => {
    if (!customer.name || !customer.phone || !customer.stateCode) {
      toast({ title: "Incomplete Customer Info", variant: "destructive" });
      return;
    }
    if (items.some(i => !i.productId || i.qty <= 0)) {
      toast({ title: "Invalid Items", variant: "destructive" });
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
      toast({ title: "Finalized", description: `Invoice ${saved.id} recorded.` });
      setItems([{ id: '1', productId: '', productName: '', qty: 1, price: 0, mrp: 0, gstRate: 0, unit: 'units', total: 0 }]);
      setCustomer({ name: '', phone: '', address: '', stateCode: '' });
      loadInitialData();
    } catch (err) {
      toast({ title: "Sync Error", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewCurrent = () => {
    setPreviewInvoice({
      id: 'DRAFT',
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
    inv.id.toLowerCase().includes(historySearch.toLowerCase()) ||
    inv.customer.name.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
            <Zap className="h-3 w-3 text-primary fill-primary" />
            <span className="text-[9px] font-black uppercase tracking-widest text-primary">Terminal v3.1</span>
          </div>
          <h1 className="font-headline text-xl sm:text-2xl font-black tracking-tighter leading-none">POS <span className="text-muted-foreground/30 font-thin italic">Interface</span></h1>
        </div>
      </div>

      <Tabs defaultValue="create" className="space-y-4" onValueChange={(val) => val === 'history' && loadHistory()}>
        <TabsList className="bg-secondary/50 p-1 rounded-xl h-10 w-full max-w-xs glass">
          <TabsTrigger value="create" className="flex-1 rounded-lg font-bold h-full gap-2 text-[10px]"><Plus className="h-3 w-3" /> New</TabsTrigger>
          <TabsTrigger value="history" className="flex-1 rounded-lg font-bold h-full gap-2 text-[10px]"><History className="h-3 w-3" /> Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <div className="flex flex-col xl:flex-row gap-4">
            <div className="flex-1 space-y-4 min-w-0">
              <Card className="border-none glass-card shadow-md rounded-xl overflow-hidden">
                <CardHeader className="p-3 sm:p-4 border-b border-primary/5 bg-primary/[0.02]">
                  <CardTitle className="font-headline text-sm font-black flex items-center gap-2"><User className="h-3.5 w-3.5 text-primary" /> Entity Hub</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-black tracking-widest opacity-60">Legal Name*</Label>
                    <Input placeholder="Entity" className="h-8 rounded-lg bg-secondary/30 border-none font-bold text-xs" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-black tracking-widest opacity-60">Contact*</Label>
                    <Input placeholder="+91..." className="h-8 rounded-lg bg-secondary/30 border-none font-bold text-xs" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-black tracking-widest opacity-60">Jurisdiction*</Label>
                    <Select value={customer.stateCode} onValueChange={val => setCustomer({...customer, stateCode: val})}>
                      <SelectTrigger className="h-8 rounded-lg bg-secondary/30 border-none font-bold text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent className="glass border-none">
                        {INDIAN_STATES.map(s => <SelectItem key={s.code} value={s.code} className="text-xs">{s.code} - {s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-black tracking-widest opacity-60">Payment*</Label>
                    <Select value={paymentMode} onValueChange={(val: PaymentMode) => setPaymentMode(val)}>
                      <SelectTrigger className="h-8 rounded-lg bg-secondary/30 border-none font-bold text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent className="glass border-none">
                        <SelectItem value="cash" className="text-xs">Cash Asset</SelectItem>
                        <SelectItem value="online" className="text-xs">Digital/Online</SelectItem>
                        <SelectItem value="pending" className="text-xs text-amber-500">Pending Dues</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none glass-card shadow-md rounded-xl overflow-hidden">
                <CardHeader className="p-3 sm:p-4 border-b border-primary/5 bg-primary/[0.02] flex flex-row items-center justify-between">
                  <CardTitle className="font-headline text-sm font-black flex items-center gap-2"><ShoppingBag className="h-3.5 w-3.5 text-primary" /> Assets</CardTitle>
                  <Button variant="ghost" size="sm" onClick={addItem} className="text-primary font-black h-7 px-2 text-[10px]"><Plus className="mr-1 h-3 w-3" /> Add Row</Button>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <div className="min-w-[700px]">
                    <Table>
                      <TableHeader className="bg-primary/[0.01]">
                        <TableRow className="border-none">
                          <TableHead className="py-3 pl-6 font-black uppercase text-[9px] tracking-widest">Asset</TableHead>
                          <TableHead className="font-black uppercase text-[9px] tracking-widest">Qty/Unit</TableHead>
                          <TableHead className="font-black uppercase text-[9px] tracking-widest">Rate (₹)</TableHead>
                          <TableHead className="font-black uppercase text-[9px] tracking-widest">Tax</TableHead>
                          <TableHead className="text-right pr-6 font-black uppercase text-[9px] tracking-widest">Value</TableHead>
                          <TableHead className="w-[40px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => {
                          const p = products.find(prod => prod.id === item.productId);
                          const savings = item.mrp > item.price ? item.mrp - item.price : 0;
                          return (
                            <TableRow key={item.id} className="border-none hover:bg-primary/[0.02]">
                              <TableCell className="py-2 pl-6">
                                <Select value={item.productId} onValueChange={(v) => handleProductSelect(item.id, v)}>
                                  <SelectTrigger className="h-7 rounded-lg bg-secondary/30 border-none font-bold text-xs"><SelectValue placeholder="Asset" /></SelectTrigger>
                                  <SelectContent className="glass border-none">
                                    {products.map(p => <SelectItem key={p.id} value={p.id} className="text-xs">{p.name} <span className="opacity-40 text-[9px]">({p.stock} avail)</span></SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Input value={item.qty} className="h-7 w-12 rounded-lg bg-secondary/30 border-none font-black text-center text-xs" onChange={e => handleQtyChange(item.id, e.target.value)} />
                                  <span className="text-[9px] font-black uppercase opacity-40">{item.unit}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col leading-none">
                                  <span className="font-black text-xs">₹{item.price.toLocaleString()}</span>
                                  {savings > 0 && <span className="text-[8px] text-emerald-500 font-black uppercase">Save ₹{savings.toLocaleString()}</span>}
                                </div>
                              </TableCell>
                              <TableCell><Badge variant="outline" className="rounded-md border-primary/20 text-primary font-black text-[9px] px-1 py-0">{item.gstRate}%</Badge></TableCell>
                              <TableCell className="text-right pr-6 font-black text-xs">₹{item.total.toLocaleString()}</TableCell>
                              <TableCell className="pr-2"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(item.id)}><Trash2 className="h-3 w-3" /></Button></TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="xl:w-[280px] space-y-4">
              <Card className="border-none bg-primary text-primary-foreground rounded-xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 scale-[1.5] rotate-45 pointer-events-none"><IndianRupee className="h-12 w-12" /></div>
                <div className="space-y-4 relative z-10">
                  <h3 className="font-headline text-sm font-black tracking-tight">Financial Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center opacity-80 text-[10px] font-bold uppercase tracking-widest"><span>Taxable Value</span><span>₹{totals.subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between items-center opacity-80 text-[10px] font-bold uppercase tracking-widest"><span>Total Tax</span><span>₹{totals.gstTotal.toLocaleString()}</span></div>
                    <div className="pt-2 border-t border-white/20">
                      <div className="flex justify-between items-end">
                        <span className="font-black uppercase tracking-widest text-[9px] opacity-90">Net Payable</span>
                        <span className="font-headline text-xl font-black tracking-tighter">₹{totals.grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    <Button className="w-full h-9 rounded-lg bg-white text-primary hover:bg-white/90 font-black text-xs shadow-md" onClick={handleSaveInvoice} disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />} Finalize
                    </Button>
                    <Button variant="outline" className="w-full h-8 rounded-lg border-white/20 bg-white/5 text-white text-[10px]" onClick={handlePreviewCurrent}>
                      <Printer className="h-3.5 w-3.5 mr-1.5" /> Quick Preview
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-none glass-card shadow-md rounded-xl overflow-hidden">
            <CardHeader className="p-3 sm:p-4 border-b border-primary/5 bg-primary/[0.02]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <CardTitle className="font-headline text-sm font-black tracking-tight">Historical Ledger</CardTitle>
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search Ledger..." className="pl-8 h-8 rounded-lg bg-secondary/30 border-none font-bold text-[10px]" value={historySearch} onChange={e => setHistorySearch(e.target.value)} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <div className="min-w-[700px]">
                <Table>
                  <TableHeader className="bg-primary/[0.01]">
                    <TableRow className="border-none">
                      <TableHead className="py-3 pl-8 font-black uppercase text-[9px] tracking-widest">ID</TableHead>
                      <TableHead className="font-black uppercase text-[9px] tracking-widest">Timeline</TableHead>
                      <TableHead className="font-black uppercase text-[9px] tracking-widest">Counterparty</TableHead>
                      <TableHead className="font-black uppercase text-[9px] tracking-widest">Payment</TableHead>
                      <TableHead className="font-black uppercase text-[9px] tracking-widest">Amount</TableHead>
                      <TableHead className="text-right pr-8 font-black uppercase text-[9px] tracking-widest">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingHistory ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                    ) : filteredHistory.map((inv) => (
                      <TableRow key={inv.id} className="border-none hover:bg-primary/[0.02]">
                        <TableCell className="font-mono text-[9px] font-black text-primary py-3 pl-8">{inv.id}</TableCell>
                        <TableCell className="text-xs font-medium">{new Date(inv.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</TableCell>
                        <TableCell className="font-black tracking-tight text-xs">{inv.customer.name}</TableCell>
                        <TableCell><Badge variant="outline" className="text-[8px] font-black uppercase">{inv.paymentMode}</Badge></TableCell>
                        <TableCell className="font-black text-xs">₹{inv.grandTotal.toLocaleString()}</TableCell>
                        <TableCell className="text-right pr-8"><Button variant="ghost" size="sm" className="h-7 px-2 font-black text-primary text-[10px]"><Eye className="h-3 w-3 mr-1" /> View</Button></TableCell>
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
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] p-0 overflow-hidden rounded-xl border-none glass shadow-2xl">
          <div className="p-6 max-h-[80vh] overflow-y-auto bg-white text-black text-xs">
            {previewInvoice && (
              <div className="space-y-6">
                <div className="flex justify-between items-start border-b pb-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-black font-headline text-primary italic uppercase tracking-tighter">{businessSettings?.brandName}</h2>
                    <p className="font-bold text-[9px] opacity-60">GSTIN: {businessSettings?.gstin}</p>
                    <p className="font-medium text-[10px] text-slate-500 max-w-[200px]">{businessSettings?.address}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge className="bg-emerald-500 text-white border-none px-2 py-0.5 rounded-full text-[9px] font-black">TAX INVOICE</Badge>
                    <p className="font-bold text-[10px]">DT: {new Date(previewInvoice.createdAt!).toLocaleString()}</p>
                    <p className="font-mono font-black text-primary text-[10px]">REF: {previewInvoice.id}</p>
                  </div>
                </div>
                <div className="flex justify-between text-[10px] border-b pb-4">
                  <div><p className="font-black text-primary uppercase text-[8px]">Client:</p><p className="font-black text-sm">{previewInvoice.customer?.name}</p><p className="opacity-60">{previewInvoice.customer?.phone}</p></div>
                  <div className="text-right"><p className="font-black text-primary uppercase text-[8px]">Settlement:</p><Badge variant="outline" className="font-black text-[10px] uppercase mt-1">{previewInvoice.paymentMode}</Badge></div>
                </div>
                <Table>
                  <TableHeader><TableRow className="border-b-2 border-black"><TableHead className="text-black font-black uppercase text-[9px] h-8">Item</TableHead><TableHead className="text-black font-black uppercase text-[9px] h-8">Qty</TableHead><TableHead className="text-right text-black font-black uppercase text-[9px] h-8">Total</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {previewInvoice.items?.map((item) => (
                      <TableRow key={item.id} className="border-b border-slate-100 hover:bg-transparent"><TableCell className="font-bold py-2">{item.productName}</TableCell><TableCell className="font-medium py-2">{item.qty} {item.unit}</TableCell><TableCell className="text-right font-black py-2">₹{item.total.toLocaleString()}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex justify-end pt-4"><div className="w-[180px] space-y-1"><div className="flex justify-between text-[10px] opacity-70"><span className="font-black uppercase">Subtotal</span><span className="font-bold">₹{previewInvoice.subtotal?.toLocaleString()}</span></div><div className="flex justify-between text-[10px] opacity-70"><span className="font-black uppercase">Tax</span><span className="font-bold">₹{previewInvoice.gstTotal?.toLocaleString()}</span></div><div className="pt-2 border-t border-black flex justify-between items-end"><span className="font-black uppercase text-primary text-[10px]">Total</span><span className="font-headline text-xl font-black tracking-tighter">₹{previewInvoice.grandTotal?.toLocaleString()}</span></div></div></div>
              </div>
            )}
          </div>
          <DialogFooter className="p-4 bg-primary/5 border-t border-primary/5 flex gap-2">
            <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="rounded-lg font-black h-8 text-[10px]">Close</Button>
            <Button onClick={() => window.print()} className="rounded-lg h-8 px-4 font-black text-[10px] gap-1.5"><Printer className="h-3.5 w-3.5" /> Print</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
