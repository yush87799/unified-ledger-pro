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
  CreditCard, 
  Loader2, 
  FileText, 
  CheckCircle2, 
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

interface Product {
  id: string;
  name: string;
  price: number;
  mrp: number;
  gst: string;
  unit: string;
  stock: number;
  brand: string;
}

interface LineItem {
  id: string;
  productId: string;
  productName: string;
  qty: number;
  price: number; 
  mrp: number;
  gstRate: number;
  unit: string;
  total: number; 
}

interface Invoice {
  id: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    stateCode: string;
  };
  items: LineItem[];
  subtotal: number;
  gstTotal: number;
  grandTotal: number;
  taxType: 'INTRA' | 'INTER';
  businessStateCode: string;
  createdAt: string;
}

export default function BillingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', productId: '', productName: '', qty: 1, price: 0, mrp: 0, gstRate: 0, unit: 'units', total: 0 }
  ]);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', stateCode: '' });
  const [businessSettings, setBusinessSettings] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [history, setHistory] = useState<Invoice[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Partial<Invoice> | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchHistory();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setBusinessSettings(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      toast({ title: "Fetch Error", description: "Could not load products.", variant: "destructive" });
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/invoices');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error(err);
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
    const sanitized = val.replace(/[^0-9]/g, '');
    const qty = parseInt(sanitized) || 0;

    setItems(items.map(item => {
      if (item.id === id) {
        const product = products.find(p => p.id === item.productId);
        if (product && qty > product.stock) {
          toast({
            title: "Inventory Alert",
            description: `Exceeds available stock (${product.stock} ${product.unit}).`,
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
      taxType: isIntraState ? 'INTRA' : 'INTER' as 'INTRA' | 'INTER'
    };
  }, [items, businessSettings, customer.stateCode]);

  const handleSaveInvoice = async () => {
    if (!customer.name || !customer.phone || !customer.stateCode) {
      toast({ title: "Validation Error", description: "Incomplete customer credentials.", variant: "destructive" });
      return;
    }

    if (items.some(i => !i.productId || i.qty <= 0)) {
      toast({ title: "Validation Error", description: "One or more line items are invalid.", variant: "destructive" });
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
        businessStateCode: businessSettings.stateCode
      };
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        toast({ title: "Finalized", description: `Invoice ${data.id} recorded successfully.` });
        setItems([{ id: '1', productId: '', productName: '', qty: 1, price: 0, mrp: 0, gstRate: 0, unit: 'units', total: 0 }]);
        setCustomer({ name: '', phone: '', address: '', stateCode: '' });
        fetchProducts();
        fetchHistory();
      } else {
        throw new Error('Sync failed');
      }
    } catch (err) {
      toast({ title: "System Error", description: "Failed to sync with local ledger.", variant: "destructive" });
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
    <div className="space-y-12 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Zap className="h-3 w-3 text-emerald-500 fill-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">POS Intelligence Active</span>
          </div>
          <h1 className="font-headline text-5xl font-black tracking-tighter">Billing <span className="text-muted-foreground/30 font-thin italic">Interface</span></h1>
          <p className="text-muted-foreground text-lg font-medium max-w-2xl leading-relaxed">
            High-velocity invoicing system. Automated GST computation and real-time inventory synchronization.
          </p>
        </div>
      </div>

      <Tabs defaultValue="create" className="space-y-10">
        <TabsList className="bg-secondary/50 p-1.5 rounded-2xl h-16 w-full max-w-md glass shadow-xl">
          <TabsTrigger value="create" className="flex-1 rounded-xl font-bold h-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl transition-all">
            <Plus className="h-4 w-4" /> New Invoice
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1 rounded-xl font-bold h-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-2xl transition-all">
            <History className="h-4 w-4" /> Past Ledger
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-10">
          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1 space-y-10">
              <Card className="border-none glass-card shadow-2xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-primary/5 bg-primary/[0.02]">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-primary" />
                    <CardTitle className="font-headline text-2xl font-black tracking-tight">Customer Credentials</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Entity Name*</Label>
                    <Input 
                      placeholder="Enter legal name" 
                      className="h-14 rounded-2xl bg-secondary/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-bold"
                      value={customer.name}
                      onChange={e => setCustomer({...customer, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Contact Detail*</Label>
                    <Input 
                      placeholder="+91 00000 00000" 
                      className="h-14 rounded-2xl bg-secondary/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-bold"
                      value={customer.phone}
                      onChange={e => setCustomer({...customer, phone: e.target.value.replace(/[^0-9+]/g, '')})}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Jurisdiction / State*</Label>
                    <Select 
                      value={customer.stateCode} 
                      onValueChange={val => setCustomer({...customer, stateCode: val})}
                    >
                      <SelectTrigger className="h-14 rounded-2xl bg-secondary/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-bold">
                        <SelectValue placeholder="Select State Code" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl glass">
                        {INDIAN_STATES.map(state => (
                          <SelectItem key={state.code} value={state.code} className="rounded-xl font-bold py-3">
                            {state.code} - {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Registered Address</Label>
                    <Input 
                      placeholder="Full billing address" 
                      className="h-14 rounded-2xl bg-secondary/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-bold"
                      value={customer.address}
                      onChange={e => setCustomer({...customer, address: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none glass-card shadow-2xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-primary/5 bg-primary/[0.02] flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    <CardTitle className="font-headline text-2xl font-black tracking-tight">Inventory Items</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={addItem} className="text-primary font-black hover:bg-primary/5 rounded-xl h-10 px-5 group">
                    <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" /> Add Product
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-primary/[0.01]">
                      <TableRow className="border-none">
                        <TableHead className="py-6 pl-10 font-black uppercase text-[10px] tracking-widest">Description</TableHead>
                        <TableHead className="font-black uppercase text-[10px] tracking-widest">Qty</TableHead>
                        <TableHead className="font-black uppercase text-[10px] tracking-widest">Rate (₹)</TableHead>
                        <TableHead className="font-black uppercase text-[10px] tracking-widest">GST %</TableHead>
                        <TableHead className="text-right pr-10 font-black uppercase text-[10px] tracking-widest">Total</TableHead>
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
                                <SelectTrigger className="h-12 rounded-xl bg-secondary/30 border-none font-bold min-w-[200px]">
                                  <SelectValue placeholder={loadingProducts ? "Synchronizing..." : "Select Product"} />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl glass">
                                  {products.map(p => (
                                    <SelectItem key={p.id} value={p.id} disabled={p.stock <= 0} className="rounded-xl font-bold py-3">
                                      {p.name} <span className="opacity-40 text-xs ml-2">[{p.brand}]</span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {selectedProduct && (
                                <p className="text-[10px] text-muted-foreground mt-2 font-black uppercase tracking-widest flex items-center gap-1.5 ml-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  STOCK AVAILABLE: {selectedProduct.stock} {selectedProduct.unit}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Input 
                                  value={item.qty} 
                                  className="h-12 w-20 rounded-xl bg-secondary/30 border-none font-black text-center"
                                  onChange={e => handleQtyChange(item.id, e.target.value)}
                                />
                                <span className="text-[10px] font-black uppercase text-muted-foreground">{item.unit}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-black text-sm">₹{item.price.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="rounded-lg border-primary/20 text-primary font-black text-[10px] px-3 py-1 bg-primary/5">{item.gstRate}%</Badge>
                            </TableCell>
                            <TableCell className="text-right pr-10 font-black text-sm">₹{item.total.toLocaleString()}</TableCell>
                            <TableCell className="pr-4">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeItem(item.id)} 
                                disabled={items.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <div className="lg:w-[450px] space-y-10">
              <Card className="border-none bg-primary text-primary-foreground rounded-[2.5rem] p-10 shadow-2xl space-y-10 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-20 opacity-10 scale-[3] rotate-45 pointer-events-none">
                  <IndianRupee className="h-32 w-32" />
                </div>

                <div className="space-y-2 relative z-10">
                  <h3 className="font-headline text-3xl font-black tracking-tighter">Settlement Summary</h3>
                  <p className="text-primary-foreground/60 font-medium">Auto-computed financial breakdown</p>
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black uppercase tracking-widest opacity-60">Subtotal (Excl. Tax)</span>
                    <span className="font-bold text-xl">₹{totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-black uppercase tracking-widest opacity-60">Total GST ({totals.taxType === 'INTRA' ? 'CGST+SGST' : 'IGST'})</span>
                    <span className="font-bold text-xl">₹{totals.gstTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  
                  <div className="pt-8 border-t border-white/20 space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="font-black uppercase tracking-widest opacity-80 text-xs">Final Settlement</span>
                      <span className="font-headline text-5xl font-black tracking-tighter">₹{totals.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 relative z-10">
                  <Button 
                    className="w-full h-16 rounded-2xl bg-white text-primary hover:bg-white/90 font-black text-xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
                    onClick={handleSaveInvoice}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
                    Confirm & Save Invoice
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full h-14 rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10 font-bold flex items-center justify-center gap-3"
                    onClick={handlePreviewCurrent}
                  >
                    <Printer className="h-5 w-5" /> Preview Draft
                  </Button>
                </div>
              </Card>

              <Card className="border-none glass-card shadow-2xl rounded-[2.5rem] p-10 space-y-8">
                <div className="space-y-2">
                  <CardTitle className="font-headline text-xl font-black tracking-tight">Payment Method</CardTitle>
                  <CardDescription className="font-medium">Select transactional channel</CardDescription>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2 rounded-2xl border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Digital / Card</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2 rounded-2xl border-border/50 hover:bg-secondary/50 transition-all">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Cash Settlement</span>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-none glass-card shadow-2xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-10 border-b border-primary/5 bg-primary/[0.02]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2">
                  <CardTitle className="font-headline text-3xl font-black tracking-tight">Historical Ledger</CardTitle>
                  <CardDescription className="font-medium">Review and audit past transactional activity.</CardDescription>
                </div>
                <div className="relative w-full max-w-md group">
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    placeholder="Search ID or Counterparty..." 
                    className="pl-12 h-14 rounded-2xl bg-secondary/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-bold"
                    value={historySearch}
                    onChange={e => setHistorySearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-primary/[0.01]">
                  <TableRow className="border-none">
                    <TableHead className="py-6 pl-10 font-black uppercase text-[10px] tracking-widest">Invoice ID</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Date</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Entity Name</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest">Volume (₹)</TableHead>
                    <TableHead className="text-right pr-10 font-black uppercase text-[10px] tracking-widest">Audit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingHistory ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" /></TableCell></TableRow>
                  ) : filteredHistory.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground font-bold">No historical data found.</TableCell></TableRow>
                  ) : filteredHistory.map((inv) => (
                    <TableRow key={inv.id} className="border-none hover:bg-primary/[0.02] transition-colors group">
                      <TableCell className="font-mono text-xs font-black text-primary py-6 pl-10 group-hover:translate-x-2 transition-transform duration-500">{inv.id}</TableCell>
                      <TableCell className="text-sm font-medium">{new Date(inv.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-black tracking-tight">{inv.customer.name}</span>
                          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{inv.customer.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-black text-sm">₹{inv.grandTotal.toLocaleString()}</TableCell>
                      <TableCell className="text-right pr-10">
                        <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(inv)} className="rounded-xl h-10 px-5 font-black text-primary hover:bg-primary/5 group">
                          <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" /> View & Print
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Premium Invoice Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[900px] p-0 overflow-hidden rounded-[3rem] border-none shadow-[0_40px_100px_rgba(0,0,0,0.3)] glass">
          <DialogHeader className="p-10 bg-primary/5 border-b border-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-2xl">
                  <FileText className="h-7 w-7" />
                </div>
                <div>
                  <DialogTitle className="font-headline text-3xl font-black tracking-tighter">Tax Invoice</DialogTitle>
                  <DialogDescription className="text-base font-medium">Compliance-grade financial documentation</DialogDescription>
                </div>
              </div>
              <Badge className="bg-emerald-500 text-white border-none px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-lg">Ledger Verified</Badge>
            </div>
          </DialogHeader>
          
          <div className="p-12 space-y-12 max-h-[70vh] overflow-y-auto bg-white text-black font-body">
            {previewInvoice && (
              <>
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <h2 className="text-3xl font-black font-headline text-primary tracking-tighter uppercase italic">
                      {businessSettings?.brandName || 'Unified Ledger Pro'}
                    </h2>
                    <div className="space-y-1">
                       <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">GSTIN Identification</p>
                       <p className="text-sm font-bold">{businessSettings?.gstin || '29AAAAA0000A1Z5'}</p>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <Zap className="h-3 w-3 text-primary fill-primary" />
                      Place of Supply: {INDIAN_STATES.find(s => s.code === previewInvoice.businessStateCode)?.name} ({previewInvoice.businessStateCode})
                    </p>
                  </div>
                  <div className="text-right space-y-4">
                    <div className="inline-block px-4 py-1 rounded-lg bg-black text-white text-[10px] font-black uppercase tracking-[0.3em]">OFFICIAL RECORD</div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Invoice Timeline</p>
                      <p className="text-sm font-bold">{new Date(previewInvoice.createdAt!).toLocaleDateString(undefined, { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                      <p className="text-xs font-mono font-black text-primary uppercase">Ref: {previewInvoice.id}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-12 text-sm border-y py-10 border-slate-100">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Billed Entity / To:</p>
                    <div className="space-y-2">
                      <p className="font-black text-2xl tracking-tighter">{previewInvoice.customer?.name || 'N/A'}</p>
                      <div className="space-y-1 font-medium text-slate-500">
                        <p>{previewInvoice.customer?.phone || 'N/A'}</p>
                        <p className="max-w-xs">{previewInvoice.customer?.address || 'N/A'}</p>
                        <p className="font-black text-black">State: {INDIAN_STATES.find(s => s.code === previewInvoice.customer?.stateCode)?.name} ({previewInvoice.customer?.stateCode})</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-3xl p-8 space-y-4">
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Remit To / From:</p>
                    <div className="space-y-2">
                       <p className="font-black text-lg tracking-tight leading-tight">{businessSettings?.businessName || 'Unified Ledger Pro PVT LTD'}</p>
                       <p className="text-xs text-slate-500 leading-relaxed font-medium">{businessSettings?.address || 'Plot 45, Tech Park Phase 2, Bangalore, Karnataka - 560001'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Table className="border-collapse">
                    <TableHeader>
                      <TableRow className="border-b-2 border-black hover:bg-transparent">
                        <TableHead className="text-black font-black uppercase tracking-widest h-12 text-[10px]">Description</TableHead>
                        <TableHead className="text-black font-black uppercase tracking-widest h-12 text-[10px]">Qty</TableHead>
                        <TableHead className="text-black font-black uppercase tracking-widest h-12 text-[10px]">Unit Rate</TableHead>
                        <TableHead className="text-black font-black uppercase tracking-widest h-12 text-[10px]">Tax %</TableHead>
                        <TableHead className="text-right text-black font-black uppercase tracking-widest h-12 text-[10px]">Line Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewInvoice.items?.filter(i => i.productId).map((item) => (
                        <TableRow key={item.id} className="h-16 border-b border-slate-100 hover:bg-transparent">
                          <TableCell className="text-sm font-black tracking-tight">{item.productName}</TableCell>
                          <TableCell className="text-sm font-bold text-slate-500">{item.qty} {item.unit}</TableCell>
                          <TableCell className="text-sm font-bold text-slate-500">₹{item.price.toLocaleString()}</TableCell>
                          <TableCell className="text-sm font-bold text-slate-500">{item.gstRate}%</TableCell>
                          <TableCell className="text-right text-sm font-black">₹{item.total.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end pt-8">
                  <div className="w-[350px] space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-black uppercase tracking-widest text-slate-400 text-[10px]">Taxable Liquidity</span>
                      <span className="font-bold">₹{previewInvoice.subtotal?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    {previewInvoice.taxType === 'INTRA' ? (
                      <div className="space-y-3 pt-3 border-t border-slate-100">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-black uppercase tracking-widest text-slate-400 text-[10px]">CGST Allocation (50%)</span>
                          <span className="font-bold">₹{(previewInvoice.gstTotal! / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-black uppercase tracking-widest text-slate-400 text-[10px]">SGST Allocation (50%)</span>
                          <span className="font-bold">₹{(previewInvoice.gstTotal! / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-100">
                        <span className="font-black uppercase tracking-widest text-slate-400 text-[10px]">IGST Allocation (100%)</span>
                        <span className="font-bold">₹{previewInvoice.gstTotal?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-end pt-6 border-t-2 border-black">
                      <span className="font-black uppercase tracking-[0.2em] text-primary text-[11px]">Total Settlement</span>
                      <span className="font-headline text-4xl font-black tracking-tighter">₹{previewInvoice.grandTotal?.toLocaleString()}</span>
                    </div>
                    <p className="text-[9px] text-slate-400 text-right font-black uppercase tracking-widest">*Total includes all statutory GST obligations.</p>
                  </div>
                </div>

                <div className="pt-20 border-t-2 border-slate-50 mt-12 grid grid-cols-2 gap-20">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Terms & Conditions:</p>
                    <div className="text-[9px] text-slate-500 space-y-2 leading-relaxed font-medium">
                      <p>1. Transacted goods are non-reversible and non-refundable post-dispatch.</p>
                      <p>2. Any legal disputes are strictly subject to {INDIAN_STATES.find(s => s.code === previewInvoice.businessStateCode)?.name} Jurisdiction.</p>
                      <p>3. This is an electronically generated document; it does not require a physical seal.</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-end space-y-6">
                    <div className="w-full h-px bg-black opacity-10" />
                    <div className="text-center space-y-2">
                       <p className="text-lg font-headline font-black tracking-tighter uppercase italic text-primary">Signature</p>
                       <p className="text-[10px] font-black uppercase tracking-[0.2em]">Authorised Controlling Entity</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="p-10 bg-primary/5 border-t border-primary/5 flex items-center justify-between">
            <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="rounded-2xl font-black px-8">Close Terminal</Button>
            <Button onClick={() => window.print()} className="rounded-2xl h-14 px-10 font-black text-lg shadow-2xl gap-3">
              <Printer className="h-5 w-5" /> Execute Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}