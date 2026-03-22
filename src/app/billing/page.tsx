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
  FileText, 
  History, 
  Search,
  Eye,
  User,
  ShoppingBag,
  Zap,
  IndianRupee,
  Info
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { INDIAN_STATES } from '@/lib/states';
import { apiClient } from '@/lib/api-client';
import { Product, LineItem, Invoice, BusinessSettings } from '@/lib/types';
import { cn } from '@/lib/utils';

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
          toast({ 
            title: "Inventory Alert", 
            description: `Exceeds stock (${product.stock} ${product.unit}).`, 
            variant: "destructive" 
          });
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
    <div className="space-y-4 sm:space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
            <Zap className="h-2.5 w-2.5 text-primary fill-primary" />
            <span className="text-[7px] font-black uppercase tracking-widest text-primary">Billing Active</span>
          </div>
          <h1 className="font-headline text-xl sm:text-2xl font-black tracking-tighter">POS <span className="text-muted-foreground/30 font-thin italic">Terminal</span></h1>
        </div>
      </div>

      <Tabs defaultValue="create" className="space-y-4" onValueChange={(val) => val === 'history' && loadHistory()}>
        <TabsList className="bg-secondary/50 p-1 rounded-xl h-10 w-full max-w-sm glass">
          <TabsTrigger value="create" className="flex-1 rounded-lg font-bold h-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px]">
            <Plus className="h-3 w-3" /> New Invoice
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1 rounded-lg font-bold h-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-[10px]">
            <History className="h-3 w-3" /> Past Ledger
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4">
          <div className="flex flex-col xl:flex-row gap-4">
            <div className="flex-1 space-y-4 min-w-0">
              <Card className="border-none glass-card shadow-lg rounded-xl overflow-hidden">
                <CardHeader className="p-3 sm:p-4 border-b border-primary/5 bg-primary/[0.02]">
                  <CardTitle className="font-headline text-sm font-black flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-primary" /> Customer Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[8px] uppercase font-black tracking-widest opacity-60">Entity Name*</Label>
                    <Input 
                      placeholder="Legal name" 
                      className="h-8 rounded-lg bg-secondary/50 border-none font-bold text-[10px]"
                      value={customer.name}
                      onChange={e => setCustomer({...customer, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[8px] uppercase font-black tracking-widest opacity-60">Contact Detail*</Label>
                    <Input 
                      placeholder="+91 00000 00000" 
                      className="h-8 rounded-lg bg-secondary/50 border-none font-bold text-[10px]"
                      value={customer.phone}
                      onChange={e => setCustomer({...customer, phone: e.target.value.replace(/[^0-9+]/g, '')})}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[8px] uppercase font-black tracking-widest opacity-60">Jurisdiction*</Label>
                    <Select 
                      value={customer.stateCode} 
                      onValueChange={val => setCustomer({...customer, stateCode: val})}
                    >
                      <SelectTrigger className="h-8 rounded-lg bg-secondary/50 border-none font-bold text-[10px]">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl glass border-none">
                        {INDIAN_STATES.map(state => (
                          <SelectItem key={state.code} value={state.code} className="rounded-lg font-bold py-1.5 text-[10px]">
                            {state.code} - {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[8px] uppercase font-black tracking-widest opacity-60">Address</Label>
                    <Input 
                      placeholder="Billing address" 
                      className="h-8 rounded-lg bg-secondary/50 border-none font-bold text-[10px]"
                      value={customer.address}
                      onChange={e => setCustomer({...customer, address: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none glass-card shadow-lg rounded-xl overflow-hidden">
                <CardHeader className="p-3 sm:p-4 border-b border-primary/5 bg-primary/[0.02] flex flex-row items-center justify-between">
                  <CardTitle className="font-headline text-sm font-black flex items-center gap-2">
                    <ShoppingBag className="h-3.5 w-3.5 text-primary" /> Items
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={addItem} className="text-primary font-black hover:bg-primary/5 rounded-lg h-7 px-2 text-[10px]">
                    <Plus className="mr-1 h-3 w-3" /> Add Item
                  </Button>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                  <div className="min-w-[700px]">
                    <Table>
                      <TableHeader className="bg-primary/[0.01]">
                        <TableRow className="border-none">
                          <TableHead className="py-2 pl-4 font-black uppercase text-[8px] tracking-widest w-[30%]">Product</TableHead>
                          <TableHead className="font-black uppercase text-[8px] tracking-widest w-[20%]">Qty / Unit</TableHead>
                          <TableHead className="font-black uppercase text-[8px] tracking-widest">Rate (₹)</TableHead>
                          <TableHead className="font-black uppercase text-[8px] tracking-widest">Tax</TableHead>
                          <TableHead className="text-right pr-4 font-black uppercase text-[8px] tracking-widest">Total</TableHead>
                          <TableHead className="w-[40px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((item) => {
                          const product = products.find(p => p.id === item.productId);
                          const savings = item.mrp > item.price ? item.mrp - item.price : 0;
                          
                          return (
                            <TableRow key={item.id} className="border-none hover:bg-primary/[0.02] transition-colors group">
                              <TableCell className="py-2 pl-4">
                                <Select 
                                  value={item.productId} 
                                  onValueChange={(val) => handleProductSelect(item.id, val)}
                                >
                                  <SelectTrigger className="h-7 rounded-lg bg-secondary/30 border-none font-bold min-w-[150px] text-[10px]">
                                    <SelectValue placeholder={loadingProducts ? "Syncing..." : "Select Product"} />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-xl glass border-none">
                                    {products.map(p => (
                                      <SelectItem key={p.id} value={p.id} disabled={p.stock <= 0} className="rounded-lg font-bold py-1 text-[10px]">
                                        {p.name} <span className="opacity-40 text-[7px] ml-1">({p.brand})</span>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <Input 
                                      value={item.qty} 
                                      className="h-7 w-12 rounded-lg bg-secondary/30 border-none font-black text-center text-[10px]"
                                      onChange={e => handleQtyChange(item.id, e.target.value)}
                                    />
                                    <span className="text-[7px] font-black uppercase text-muted-foreground">{item.unit}</span>
                                  </div>
                                  {product && (
                                    <div className={cn(
                                      "flex items-center gap-1 px-1 py-0 rounded-md w-fit",
                                      product.stock < 5 ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"
                                    )}>
                                      <span className="text-[6px] font-black uppercase tracking-widest">Avail: {product.stock}</span>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col leading-tight">
                                  <span className="font-black text-[10px]">₹{item.price.toLocaleString()}</span>
                                  {savings > 0 && (
                                    <span className="text-[6px] text-emerald-500 font-black uppercase">Save ₹{savings.toLocaleString()}</span>
                                  )}
                                  {item.mrp > item.price && (
                                    <span className="text-[6px] text-muted-foreground line-through opacity-50">MRP: ₹{item.mrp.toLocaleString()}</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="rounded-md border-primary/20 text-primary font-black text-[7px] px-1 bg-primary/5">{item.gstRate}%</Badge>
                              </TableCell>
                              <TableCell className="text-right pr-4 font-black text-[10px]">₹{item.total.toLocaleString()}</TableCell>
                              <TableCell className="pr-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => removeItem(item.id)} disabled={items.length === 1}>
                                  <Trash2 className="h-3 w-3" />
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

            <div className="xl:w-[280px] space-y-4">
              <Card className="border-none bg-primary text-primary-foreground rounded-xl p-5 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 scale-[1.5] rotate-45 pointer-events-none">
                  <IndianRupee className="h-12 w-12" />
                </div>
                <div className="space-y-3 relative z-10">
                  <h3 className="font-headline text-base font-black tracking-tight">Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center opacity-70">
                      <span className="text-[8px] font-black uppercase tracking-widest">Taxable Value</span>
                      <span className="font-bold text-[10px]">₹{totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center opacity-70">
                      <span className="text-[8px] font-black uppercase tracking-widest">Total GST</span>
                      <span className="font-bold text-[10px]">₹{totals.gstTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="pt-2 border-t border-white/20">
                      <div className="flex justify-between items-end">
                        <span className="font-black uppercase tracking-widest text-[8px] opacity-80">Payable</span>
                        <span className="font-headline text-xl font-black tracking-tighter">₹{totals.grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    <Button 
                      className="w-full h-9 rounded-lg bg-white text-primary hover:bg-white/90 font-black text-[11px] shadow-lg"
                      onClick={handleSaveInvoice}
                      disabled={isSaving}
                    >
                      {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Save className="h-3 w-3 mr-2" />} Finalize
                    </Button>
                    <Button variant="outline" className="w-full h-8 rounded-lg border-white/20 bg-white/5 text-white text-[9px]" onClick={handlePreviewCurrent}>
                      <Printer className="h-3 w-3 mr-2" /> Preview
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-none glass-card shadow-lg rounded-xl overflow-hidden">
            <CardHeader className="p-3 sm:p-4 border-b border-primary/5 bg-primary/[0.02]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <CardTitle className="font-headline text-sm font-black tracking-tight">Past Ledger</CardTitle>
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input 
                    placeholder="Search ID or Counterparty..." 
                    className="pl-8 h-8 rounded-lg bg-secondary/50 border-none font-bold text-[10px]"
                    value={historySearch}
                    onChange={e => setHistorySearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <div className="min-w-[600px]">
                <Table>
                  <TableHeader className="bg-primary/[0.01]">
                    <TableRow className="border-none">
                      <TableHead className="py-2 pl-4 font-black uppercase text-[8px] tracking-widest">Invoice ID</TableHead>
                      <TableHead className="font-black uppercase text-[8px] tracking-widest">Timeline</TableHead>
                      <TableHead className="font-black uppercase text-[8px] tracking-widest">Entity</TableHead>
                      <TableHead className="font-black uppercase text-[8px] tracking-widest">Amount (₹)</TableHead>
                      <TableHead className="text-right pr-4 font-black uppercase text-[8px] tracking-widest">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingHistory ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                    ) : filteredHistory.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground font-bold text-[10px]">No records.</TableCell></TableRow>
                    ) : filteredHistory.map((inv) => (
                      <TableRow key={inv.id} className="border-none hover:bg-primary/[0.02] group">
                        <TableCell className="font-mono text-[9px] font-black text-primary py-2 pl-4">{inv.id}</TableCell>
                        <TableCell className="text-[10px] font-medium">{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="font-black tracking-tight text-[10px]">{inv.customer.name}</TableCell>
                        <TableCell className="font-black text-[10px]">₹{inv.grandTotal.toLocaleString()}</TableCell>
                        <TableCell className="text-right pr-4">
                          <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(inv)} className="rounded-lg h-7 px-2 font-black text-primary hover:bg-primary/5 text-[10px]">
                            <Eye className="h-3 w-3 mr-1" /> View
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
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] p-0 overflow-hidden rounded-xl border-none glass shadow-2xl">
          <div className="p-5 max-h-[80vh] overflow-y-auto bg-white text-black text-[10px]">
            {previewInvoice && (
              <div className="space-y-6">
                <div className="flex justify-between items-start border-b pb-4">
                  <div className="space-y-1">
                    <h2 className="text-base font-black font-headline text-primary italic uppercase tracking-tighter">{businessSettings?.brandName || 'Unified Ledger Pro'}</h2>
                    <p className="font-bold text-[8px] opacity-60">GSTIN: {businessSettings?.gstin || 'N/A'}</p>
                    <p className="font-medium text-[8px] text-slate-500 max-w-[200px]">{businessSettings?.address || 'N/A'}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge className="bg-emerald-500 text-white border-none px-2 py-0 rounded-full text-[7px] font-black">TAX INVOICE</Badge>
                    <p className="font-bold">Date: {new Date(previewInvoice.createdAt!).toLocaleDateString()}</p>
                    <p className="font-mono font-black text-primary text-[8px]">REF: {previewInvoice.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div className="space-y-1">
                    <p className="text-[7px] font-black text-primary uppercase">Billed To:</p>
                    <p className="font-black text-[11px] leading-none">{previewInvoice.customer?.name || 'N/A'}</p>
                    <div className="text-slate-500 font-medium space-y-0.5 mt-1">
                      <p>Mob: {previewInvoice.customer?.phone || 'N/A'}</p>
                      <p>{previewInvoice.customer?.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2 border-black hover:bg-transparent">
                      <TableHead className="text-black font-black uppercase text-[8px] h-8 px-1">Item</TableHead>
                      <TableHead className="text-black font-black uppercase text-[8px] h-8 px-1">Qty</TableHead>
                      <TableHead className="text-black font-black uppercase text-[8px] h-8 px-1">Tax</TableHead>
                      <TableHead className="text-right text-black font-black uppercase text-[8px] h-8 px-1">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewInvoice.items?.filter(i => i.productId).map((item) => (
                      <TableRow key={item.id} className="border-b border-slate-100 hover:bg-transparent">
                        <TableCell className="font-bold py-2 px-1">{item.productName}</TableCell>
                        <TableCell className="font-medium py-2 px-1">{item.qty} {item.unit}</TableCell>
                        <TableCell className="font-medium py-2 px-1">{item.gstRate}%</TableCell>
                        <TableCell className="text-right font-black py-2 px-1">₹{item.total.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex justify-end">
                  <div className="w-[180px] space-y-1">
                    <div className="flex justify-between text-[8px] opacity-60">
                      <span className="font-black uppercase">Subtotal</span>
                      <span className="font-bold">₹{previewInvoice.subtotal?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[8px] opacity-60">
                      <span className="font-black uppercase">Tax ({previewInvoice.taxType})</span>
                      <span className="font-bold">₹{previewInvoice.gstTotal?.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-black flex justify-between items-end">
                      <span className="font-black uppercase text-primary text-[9px]">Grand Total</span>
                      <span className="font-headline text-lg font-black tracking-tighter">₹{previewInvoice.grandTotal?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8 text-center opacity-40">
                  <p className="text-[7px] font-bold italic">This is a computer-generated tax document. No physical signature is required.</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="p-3 bg-primary/5 border-t border-primary/5 flex gap-2">
            <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="rounded-lg font-black h-8 text-[10px]">Close</Button>
            <Button onClick={() => window.print()} className="rounded-lg h-8 px-4 font-black text-[10px] gap-2">
              <Printer className="h-3 w-3" /> Print Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}