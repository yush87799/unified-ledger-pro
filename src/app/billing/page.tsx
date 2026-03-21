
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
  Eye
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
}

interface LineItem {
  id: string;
  productId: string;
  productName: string;
  qty: number;
  price: number; // Tax Inclusive Selling Price
  mrp: number;
  gstRate: number;
  unit: string;
  total: number; // qty * price
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
  // --- Creation State ---
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', productId: '', productName: '', qty: 1, price: 0, mrp: 0, gstRate: 0, unit: 'units', total: 0 }
  ]);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', stateCode: '' });
  const [businessSettings, setBusinessSettings] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // --- History State ---
  const [history, setHistory] = useState<Invoice[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  // --- Preview Dialog State ---
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
            title: "Stock Warning",
            description: `Only ${product.stock} ${product.unit} available.`,
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
      toast({ title: "Validation Error", description: "Customer name, phone, and state are required.", variant: "destructive" });
      return;
    }

    if (items.some(i => !i.productId || i.qty <= 0)) {
      toast({ title: "Validation Error", description: "Please ensure all line items have a product and quantity.", variant: "destructive" });
      return;
    }

    if (!businessSettings?.stateCode) {
      toast({ title: "System Error", description: "Please configure Business State in Settings first.", variant: "destructive" });
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
        toast({ title: "Success", description: `Invoice ${data.id} saved.` });
        setItems([{ id: '1', productId: '', productName: '', qty: 1, price: 0, mrp: 0, gstRate: 0, unit: 'units', total: 0 }]);
        setCustomer({ name: '', phone: '', address: '', stateCode: '' });
        fetchProducts();
        fetchHistory();
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to save the invoice.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreviewCurrent = () => {
    if (!businessSettings?.stateCode) {
      toast({ title: "Configuration Required", description: "Please set your Business State in Settings.", variant: "destructive" });
      return;
    }
    setPreviewInvoice({
      id: 'TEMP-DRAFT',
      customer,
      items,
      subtotal: totals.subtotal,
      gstTotal: totals.gstTotal,
      grandTotal: totals.grandTotal,
      taxType: totals.taxType,
      businessStateCode: businessSettings.stateCode,
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
    inv.customer.name.toLowerCase().includes(historySearch.toLowerCase()) ||
    inv.customer.phone.includes(historySearch)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold">Billing & Invoices</h1>
          <p className="text-muted-foreground">Persistently saved to local JSON backend.</p>
        </div>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="create" className="gap-2">
            <Plus className="h-4 w-4" /> Create New Invoice
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" /> Invoice History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <div className="flex justify-end gap-3 mb-6">
            <Button variant="outline" onClick={handlePreviewCurrent}>
              <Printer className="mr-2 h-4 w-4" /> Preview Print Draft Invoice
            </Button>
            <Button onClick={handleSaveInvoice} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Invoice
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="font-headline text-xl">Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Customer Name*</Label>
                    <Input 
                      placeholder="Enter full name" 
                      value={customer.name}
                      onChange={e => setCustomer({...customer, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Number*</Label>
                    <Input 
                      placeholder="+91 00000 00000" 
                      value={customer.phone}
                      onChange={e => setCustomer({...customer, phone: e.target.value.replace(/[^0-9+]/g, '')})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Billing State*</Label>
                    <Select 
                      value={customer.stateCode} 
                      onValueChange={val => setCustomer({...customer, stateCode: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map(state => (
                          <SelectItem key={state.code} value={state.code}>
                            {state.code} - {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Billing Address</Label>
                    <Input 
                      placeholder="Full address details" 
                      value={customer.address}
                      onChange={e => setCustomer({...customer, address: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-headline text-xl">Line Items</CardTitle>
                  <Button variant="ghost" size="sm" onClick={addItem} className="text-primary hover:text-primary">
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead className="w-[40%]">Product</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Price (₹)</TableHead>
                        <TableHead>GST %</TableHead>
                        <TableHead className="text-right">Total (₹)</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => {
                        const selectedProduct = products.find(p => p.id === item.productId);
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <Select 
                                value={item.productId} 
                                onValueChange={(val) => handleProductSelect(item.id, val)}
                              >
                                <SelectTrigger className="border-none bg-muted/30">
                                  <SelectValue placeholder={loadingProducts ? "..." : "Select Product"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map(p => (
                                    <SelectItem key={p.id} value={p.id} disabled={p.stock <= 0}>
                                      {p.name} ({p.brand}) {p.stock <= 0 ? "[Out of Stock]" : ""}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {selectedProduct && (
                                <p className="text-[10px] text-muted-foreground mt-1 ml-1">
                                  Stock: {selectedProduct.stock} {selectedProduct.unit}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Input 
                                  value={item.qty} 
                                  className="w-20"
                                  onChange={e => handleQtyChange(item.id, e.target.value)}
                                />
                                <span className="text-[10px] text-muted-foreground uppercase">{item.unit}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Input readOnly value={item.price.toLocaleString()} className="w-24 bg-muted/20 border-none" />
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px]">{item.gstRate}%</Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">₹{item.total.toLocaleString()}</TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="icon" 
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

            <div className="space-y-6">
              <Card className="border-none shadow-md bg-primary text-primary-foreground">
                <CardHeader>
                  <CardTitle className="font-headline">Invoice Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">Taxable Subtotal</span>
                    <span>₹{totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="opacity-80">Total GST Amount ({totals.taxType === 'INTRA' ? 'CGST+SGST' : 'IGST'})</span>
                    <span>₹{totals.gstTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="border-t border-primary-foreground/20 pt-4 flex justify-between items-center">
                    <span className="font-bold text-lg">Grand Total</span>
                    <span className="font-bold text-2xl font-headline">₹{totals.grandTotal.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="font-headline text-lg">Payment & Action</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="h-14 flex flex-col gap-1 border-2 border-primary/20 bg-primary/5">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-[10px]">Digital</span>
                    </Button>
                    <Button variant="outline" className="h-14 flex flex-col gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-[10px]">Cash</span>
                    </Button>
                  </div>
                  <Button 
                    className="w-full h-12 rounded-xl text-lg font-headline"
                    onClick={handleSaveInvoice}
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                    Save Invoice
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-none shadow-md">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="font-headline text-xl">Past Invoices</CardTitle>
                  <CardDescription>View and print historical billing data.</CardDescription>
                </div>
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search ID, Customer..." 
                    className="pl-9"
                    value={historySearch}
                    onChange={e => setHistorySearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingHistory ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                  ) : filteredHistory.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No invoices found.</TableCell></TableRow>
                  ) : filteredHistory.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono text-xs font-bold text-primary">{inv.id}</TableCell>
                      <TableCell className="text-xs">{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{inv.customer.name}</span>
                          <span className="text-[10px] text-muted-foreground">{inv.customer.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">₹{inv.grandTotal.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(inv)}>
                          <Eye className="h-4 w-4 mr-2" /> View & Print
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

      {/* Invoice Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[800px] p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-muted/30">
            <DialogTitle className="font-headline text-2xl flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Tax Invoice
            </DialogTitle>
          </DialogHeader>
          
          <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto bg-white text-black">
            {previewInvoice && (
              <>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold font-headline text-primary">
                      {businessSettings?.brandName || 'Unified Ledger Pro'}
                    </h2>
                    <p className="text-[10px] text-muted-foreground">GSTIN: {businessSettings?.gstin || 'N/A'}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Place of Supply: {INDIAN_STATES.find(s => s.code === previewInvoice.businessStateCode)?.name} ({previewInvoice.businessStateCode})
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <h3 className="font-bold uppercase text-xs">Tax Invoice</h3>
                    <p className="text-[10px]">Date: {new Date(previewInvoice.createdAt!).toLocaleDateString()}</p>
                    <p className="text-[10px] font-mono">ID: {previewInvoice.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 text-[10px] border-y py-4 border-muted">
                  <div className="space-y-1">
                    <p className="font-bold text-muted-foreground uppercase">Billed To:</p>
                    <p className="font-bold text-sm">{previewInvoice.customer?.name || 'N/A'}</p>
                    <p>{previewInvoice.customer?.phone || 'N/A'}</p>
                    <p>{previewInvoice.customer?.address || 'N/A'}</p>
                    <p>State: {INDIAN_STATES.find(s => s.code === previewInvoice.customer?.stateCode)?.name} ({previewInvoice.customer?.stateCode})</p>
                  </div>
                </div>

                <Table>
                  <TableHeader className="bg-muted/10">
                    <TableRow>
                      <TableHead className="text-black font-bold h-8 text-[10px]">Description</TableHead>
                      <TableHead className="text-black font-bold h-8 text-[10px]">Qty</TableHead>
                      <TableHead className="text-black font-bold h-8 text-[10px]">MRP (₹)</TableHead>
                      <TableHead className="text-black font-bold h-8 text-[10px]">Base Price (₹)</TableHead>
                      <TableHead className="text-black font-bold h-8 text-[10px]">GST %</TableHead>
                      <TableHead className="text-right text-black font-bold h-8 text-[10px]">Total (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewInvoice.items?.filter(i => i.productId).map((item) => {
                      const basePrice = item.price / (1 + (item.gstRate / 100));
                      return (
                        <TableRow key={item.id} className="h-10 border-b">
                          <TableCell className="text-[10px] font-medium">{item.productName}</TableCell>
                          <TableCell className="text-[10px]">{item.qty} {item.unit}</TableCell>
                          <TableCell className="text-[10px]">₹{item.mrp.toLocaleString()}</TableCell>
                          <TableCell className="text-[10px]">₹{basePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-[10px]">{item.gstRate}%</TableCell>
                          <TableCell className="text-right text-[10px] font-bold">₹{item.total.toLocaleString()}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <div className="flex justify-end pt-4">
                  <div className="w-[300px] space-y-2 text-[10px]">
                    <div className="flex justify-between border-b pb-1 text-muted-foreground">
                      <span>Taxable Value:</span>
                      <span>₹{previewInvoice.subtotal?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    {previewInvoice.taxType === 'INTRA' ? (
                      <>
                        <div className="flex justify-between border-b pb-1 text-muted-foreground">
                          <span>CGST (50% of Tax):</span>
                          <span>₹{(previewInvoice.gstTotal! / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between border-b pb-1 text-muted-foreground">
                          <span>SGST (50% of Tax):</span>
                          <span>₹{(previewInvoice.gstTotal! / 2).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between border-b pb-1 text-muted-foreground">
                        <span>IGST (100% of Tax):</span>
                        <span>₹{previewInvoice.gstTotal?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base pt-2 text-primary font-bold">
                      <span>Grand Total:</span>
                      <span>₹{previewInvoice.grandTotal?.toLocaleString()}</span>
                    </div>
                    <p className="text-[8px] text-muted-foreground text-right italic">*Total is inclusive of all taxes.</p>
                  </div>
                </div>

                <div className="pt-12 border-t border-dashed mt-8">
                  <div className="flex justify-between items-end">
                    <div className="text-[8px] text-muted-foreground space-y-1">
                      <p>Terms & Conditions:</p>
                      <p>1. Goods once sold cannot be taken back or exchanged.</p>
                      <p>2. Subject to Bangalore Jurisdiction only.</p>
                    </div>
                    <div className="text-center space-y-4">
                      <div className="w-32 h-px bg-black mx-auto" />
                      <p className="text-[10px] font-bold">Authorised Signatory</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="p-6 bg-muted/30 border-t">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Close</Button>
            <Button onClick={() => window.print()} className="gap-2">
              <Printer className="h-4 w-4" /> Print PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
