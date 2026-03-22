"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  DialogDescription,
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
  FileText, 
  History, 
  Search,
  Eye,
  User,
  ShoppingBag,
  Zap,
  IndianRupee
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { INDIAN_STATES } from '@/lib/states';
import { apiClient } from '@/lib/api-client';
import { Product, LineItem, Invoice, BusinessSettings } from '@/lib/types';

export default function BillingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', productId: '', productName: '', qty: 1, price: 0, mrp: 0, gstRate: 0, unit: 'units', total: 0 }
  ]);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', stateCode: '' });
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
      toast({ title: "Fetch Error", description: "System synchronization failed.", variant: "destructive" });
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
      toast({ title: "Ledger Error", description: "Failed to load history.", variant: "destructive" });
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
        const product = products.find(p => p.id === item.productId);
        if (product && qty > product.stock) {
          toast({ title: "Inventory Alert", description: `Exceeds stock (${product.stock} ${product.unit}).`, variant: "destructive" });
        }
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
      const itemTaxableValue = basePrice * item.qty;

      grandTotal += itemTotal;
      taxableSubtotal += itemTaxableValue;
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
      toast({ title: "Validation Error", description: "Incomplete customer credentials.", variant: "destructive" });
      return;
    }

    if (items.some(i => !i.productId || i.qty <= 0)) {
      toast({ title: "Validation Error", description: "Invalid items detected.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<Invoice> = { 
        customer, 
        items, 
        subtotal: totals.subtotal, 
        gstTotal: totals.gstTotal, 
        grandTotal: totals.grandTotal,
        taxType: totals.taxType,
        businessStateCode: businessSettings?.stateCode || '29'
      };
      
      const savedInvoice = await apiClient.invoices.create(payload);
      toast({ title: "Finalized", description: `Invoice ${savedInvoice.id} recorded.` });
      setItems([{ id: '1', productId: '', productName: '', qty: 1, price: 0, mrp: 0, gstRate: 0, unit: 'units', total: 0 }]);
      setCustomer({ name: '', phone: '', address: '', stateCode: '' });
      loadInitialData();
    } catch (err) {
      toast({ title: "System Error", description: "Failed to sync ledger.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewCurrent = () => {
    setPreviewInvoice({
      id: 'TEMP-DRAFT',
      customer,
      items,
      subtotal: totals.subtotal,
      gstTotal: totals.gstTotal,
      grandTotal: totals.grandTotal,
      taxType: totals.taxType,
      businessStateCode: businessSettings?.stateCode || '29',
      createdAt: new Date().toISOString()
    });
    setIsPreviewOpen(true);
  };

  const handleViewInvoice = (inv: Invoice) => {
    setPreviewInvoice(inv);
    setIsPreviewOpen(true);
  };

  const filteredHistory = history.filter(inv => 
    inv.id.toLowerCase().includes(historySearch.toLowerCase()) ||
    inv.customer.name.toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <div className="space-y-8 sm:space-y-12 pb-24 sm:pb-32 px-1">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8">
        <div className="space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20">
            <Zap className="h-3 w-3 text-primary fill-primary" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary">POS Active</span>
          </div>
          <h1 className="font-headline text-3xl sm:text-5xl lg:text-6xl font-black tracking-tighter">Billing <span className="text-muted-foreground/30 font-thin italic">Interface</span></h1>
        </div>
      </div>

      <Tabs defaultValue="create" className="space-y-8 sm:space-y-10" onValueChange={(val) => val === 'history' && loadHistory()}>
        <TabsList className="bg-secondary/50 p-1 rounded-xl sm:rounded-2xl h-12 sm:h-16 w-full max-w-md glass">
          <TabsTrigger value="create" className="flex-1 rounded-lg sm:rounded-xl font-bold h-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
            <Plus className="h-4 w-4" /> New Invoice
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1 rounded-lg sm:rounded-xl font-bold h-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
            <History className="h-4 w-4" /> Past Ledger
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-8 sm:space-y-10">
          <div className="flex flex-col lg:flex-row gap-8 sm:gap-10">
            <div className="flex-1 space-y-8 sm:space-y-10 min-w-0">
              <Card className="border-none glass-card shadow-2xl rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-6 sm:p-10 border-b border-primary/5 bg-primary/[0.02]">
                  <CardTitle className="font-headline text-lg sm:text-2xl font-black tracking-tight flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" /> Customer Credentials
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-2 sm:space-y-3">
                    <Label className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest">Entity Name*</Label>
                    <Input 
                      placeholder="Enter legal name" 
                      className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-secondary/50 border-none font-bold text-sm"
                      value={customer.name}
                      onChange={e => setCustomer({...customer, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <Label className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest">Contact Detail*</Label>
                    <Input 
                      placeholder="+91 00000 00000" 
                      className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-secondary/50 border-none font-bold text-sm"
                      value={customer.phone}
                      onChange={e => setCustomer({...customer, phone: e.target.value.replace(/[^0-9+]/g, '')})}
                    />
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <Label className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest">Jurisdiction / State*</Label>
                    <Select 
                      value={customer.stateCode} 
                      onValueChange={val => setCustomer({...customer, stateCode: val})}
                    >
                      <SelectTrigger className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-secondary/50 border-none font-bold text-sm">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl glass">
                        {INDIAN_STATES.map(state => (
                          <SelectItem key={state.code} value={state.code} className="rounded-xl font-bold py-3 text-xs sm:text-sm">
                            {state.code} - {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <Label className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest">Registered Address</Label>
                    <Input 
                      placeholder="Full billing address" 
                      className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-secondary/50 border-none font-bold text-sm"
                      value={customer.address}
                      onChange={e => setCustomer({...customer, address: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none glass-card shadow-2xl rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-6 sm:p-10 border-b border-primary/5 bg-primary/[0.02] flex flex-row items-center justify-between gap-4">
                  <CardTitle className="font-headline text-lg sm:text-2xl font-black tracking-tight flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5 text-primary" /> Items
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={addItem} className="text-primary font-black hover:bg-primary/5 rounded-xl h-10 px-4 sm:px-5 group">
                    <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" /> <span className="hidden sm:inline">Add Product</span><span className="sm:hidden">Add</span>
                  </Button>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <div className="min-w-[700px]">
                    <Table>
                      <TableHeader className="bg-primary/[0.01]">
                        <TableRow className="border-none">
                          <TableHead className="py-6 pl-10 font-black uppercase text-[9px] tracking-widest">Description</TableHead>
                          <TableHead className="font-black uppercase text-[9px] tracking-widest">Qty</TableHead>
                          <TableHead className="font-black uppercase text-[9px] tracking-widest">Rate (₹)</TableHead>
                          <TableHead className="font-black uppercase text-[9px] tracking-widest">Tax</TableHead>
                          <TableHead className="text-right pr-10 font-black uppercase text-[9px] tracking-widest">Total</TableHead>
                          <TableHead className="w-[60px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => {
                          const selectedProduct = products.find(p => p.id === item.productId);
                          return (
                            <TableRow key={item.id} className="border-none hover:bg-primary/[0.02] transition-colors group">
                              <TableCell className="py-6 pl-10">
                                <Select 
                                  value={item.productId} 
                                  onValueChange={(val) => handleProductSelect(item.id, val)}
                                >
                                  <SelectTrigger className="h-10 rounded-xl bg-secondary/30 border-none font-bold min-w-[200px] text-xs">
                                    <SelectValue placeholder={loadingProducts ? "Syncing..." : "Select Product"} />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-2xl glass">
                                    {products.map(p => (
                                      <SelectItem key={p.id} value={p.id} disabled={p.stock <= 0} className="rounded-xl font-bold py-2 text-xs">
                                        {p.name} <span className="opacity-40 text-[9px] ml-2">[{p.brand}]</span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input 
                                  value={item.qty} 
                                  className="h-10 w-16 rounded-xl bg-secondary/30 border-none font-black text-center text-xs"
                                  onChange={e => handleQtyChange(item.id, e.target.value)}
                                />
                              </TableCell>
                              <TableCell className="font-black text-xs">₹{item.price.toLocaleString()}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="rounded-lg border-primary/20 text-primary font-black text-[9px] px-2 py-1 bg-primary/5">{item.gstRate}%</Badge>
                              </TableCell>
                              <TableCell className="text-right pr-10 font-black text-xs">₹{item.total.toLocaleString()}</TableCell>
                              <TableCell className="pr-4">
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => removeItem(item.id)} disabled={items.length === 1}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:w-[350px] xl:w-[400px] space-y-10">
              <Card className="border-none bg-primary text-primary-foreground rounded-[1.5rem] sm:rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-10 scale-[2.5] rotate-45 pointer-events-none">
                  <IndianRupee className="h-24 w-24" />
                </div>
                <div className="space-y-6 relative z-10">
                  <h3 className="font-headline text-2xl sm:text-3xl font-black tracking-tighter">Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center opacity-70">
                      <span className="text-[10px] font-black uppercase tracking-widest">Taxable Value</span>
                      <span className="font-bold text-sm">₹{totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center opacity-70">
                      <span className="text-[10px] font-black uppercase tracking-widest">Total GST</span>
                      <span className="font-bold text-sm">₹{totals.gstTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="pt-6 border-t border-white/20">
                      <div className="flex justify-between items-end">
                        <span className="font-black uppercase tracking-widest text-[10px] opacity-80">Payable</span>
                        <span className="font-headline text-3xl sm:text-4xl font-black tracking-tighter">₹{totals.grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 mt-8">
                    <Button 
                      className="w-full h-14 rounded-xl bg-white text-primary hover:bg-white/90 font-black text-lg shadow-2xl"
                      onClick={handleSaveInvoice}
                      disabled={isSaving}
                    >
                      {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />} Confirm
                    </Button>
                    <Button variant="outline" className="w-full h-12 rounded-xl border-white/20 bg-white/5 text-white text-sm" onClick={handlePreviewCurrent}>
                      <Printer className="h-4 w-4 mr-2" /> Preview Draft
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-none glass-card shadow-2xl rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-6 sm:p-10 border-b border-primary/5 bg-primary/[0.02]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
                <CardTitle className="font-headline text-2xl font-black tracking-tight">Ledger</CardTitle>
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="Search ID or Counterparty..." 
                    className="pl-12 h-12 rounded-xl bg-secondary/50 border-none font-bold text-sm"
                    value={historySearch}
                    onChange={e => setHistorySearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <div className="min-w-[800px]">
                <Table>
                  <TableHeader className="bg-primary/[0.01]">
                    <TableRow className="border-none">
                      <TableHead className="py-6 pl-10 font-black uppercase text-[9px] tracking-widest">Invoice ID</TableHead>
                      <TableHead className="font-black uppercase text-[9px] tracking-widest">Date</TableHead>
                      <TableHead className="font-black uppercase text-[9px] tracking-widest">Entity</TableHead>
                      <TableHead className="font-black uppercase text-[9px] tracking-widest">Amount (₹)</TableHead>
                      <TableHead className="text-right pr-10 font-black uppercase text-[9px] tracking-widest">Audit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingHistory ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                    ) : filteredHistory.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground font-bold">No historical data found.</TableCell></TableRow>
                    ) : filteredHistory.map((inv) => (
                      <TableRow key={inv.id} className="border-none hover:bg-primary/[0.02] group">
                        <TableCell className="font-mono text-[10px] font-black text-primary py-6 pl-10">{inv.id}</TableCell>
                        <TableCell className="text-xs font-medium">{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="font-black tracking-tight text-xs">{inv.customer.name}</TableCell>
                        <TableCell className="font-black text-xs">₹{inv.grandTotal.toLocaleString()}</TableCell>
                        <TableCell className="text-right pr-10">
                          <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(inv)} className="rounded-xl h-10 px-5 font-black text-primary hover:bg-primary/5 text-xs">
                            <Eye className="h-3.5 w-3.5 mr-2" /> View
                          </Button>
                        </TableCell>
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
        <DialogContent className="max-w-[95vw] sm:max-w-[800px] p-0 overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] border-none glass shadow-2xl">
          <DialogHeader className="p-6 sm:p-10 bg-primary/5 border-b border-primary/5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <DialogTitle className="font-headline text-xl sm:text-2xl font-black tracking-tighter">Tax Invoice</DialogTitle>
                </div>
              </div>
              <Badge className="bg-emerald-500 text-white border-none px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest">VERIFIED</Badge>
            </div>
          </DialogHeader>
          
          <div className="p-6 sm:p-10 space-y-8 max-h-[70vh] overflow-y-auto bg-white text-black">
            {previewInvoice && (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-black font-headline text-primary italic">{businessSettings?.brandName || 'Unified Ledger Pro'}</h2>
                    <div className="space-y-1">
                       <p className="text-[9px] font-black uppercase text-muted-foreground">GSTIN</p>
                       <p className="text-xs font-bold">{businessSettings?.gstin || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right space-y-2">
                    <p className="text-sm font-bold">Date: {new Date(previewInvoice.createdAt!).toLocaleDateString()}</p>
                    <p className="text-[10px] font-mono font-black text-primary uppercase">Ref: {previewInvoice.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-y py-8 border-slate-100">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest">Billed Entity:</p>
                    <p className="font-black text-xl">{previewInvoice.customer?.name || 'N/A'}</p>
                    <div className="text-slate-500 font-medium space-y-0.5 text-xs">
                      <p>{previewInvoice.customer?.phone || 'N/A'}</p>
                      <p>{previewInvoice.customer?.address || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-6">
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest">Remit To:</p>
                    <p className="font-black text-sm">{businessSettings?.businessName || 'N/A'}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{businessSettings?.address || 'N/A'}</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b-2 border-black">
                        <TableHead className="text-black font-black uppercase text-[9px]">Item</TableHead>
                        <TableHead className="text-black font-black uppercase text-[9px]">Qty</TableHead>
                        <TableHead className="text-black font-black uppercase text-[9px]">Tax</TableHead>
                        <TableHead className="text-right text-black font-black uppercase text-[9px]">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewInvoice.items?.filter(i => i.productId).map((item) => (
                        <TableRow key={item.id} className="border-b border-slate-100">
                          <TableCell className="text-xs font-black">{item.productName}</TableCell>
                          <TableCell className="text-xs font-bold">{item.qty} {item.unit}</TableCell>
                          <TableCell className="text-xs font-bold">{item.gstRate}%</TableCell>
                          <TableCell className="text-right text-xs font-black">₹{item.total.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end">
                  <div className="w-full sm:w-[300px] space-y-2">
                    <div className="flex justify-between text-[10px] opacity-60">
                      <span className="font-black uppercase">Subtotal</span>
                      <span className="font-bold">₹{previewInvoice.subtotal?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] opacity-60">
                      <span className="font-black uppercase">GST ({previewInvoice.taxType})</span>
                      <span className="font-bold">₹{previewInvoice.gstTotal?.toLocaleString()}</span>
                    </div>
                    <div className="pt-4 border-t-2 border-black flex justify-between items-end">
                      <span className="font-black uppercase text-primary text-[11px]">Payable</span>
                      <span className="font-headline text-3xl font-black">₹{previewInvoice.grandTotal?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="p-6 sm:p-10 bg-primary/5 border-t border-primary/5 flex flex-col sm:flex-row gap-4">
            <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="rounded-xl font-black w-full sm:w-auto">Close</Button>
            <Button onClick={() => window.print()} className="rounded-xl h-12 px-8 font-black text-lg gap-3 w-full sm:w-auto">
              <Printer className="h-5 w-5" /> Execute Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
