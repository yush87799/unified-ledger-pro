
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
import { Plus, Trash2, Printer, Save, CreditCard, Send, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  price: number;
  gstRate: number;
  unit: string;
  total: number;
}

export default function BillingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', productId: '', productName: '', qty: 1, price: 0, gstRate: 0, unit: 'units', total: 0 }
  ]);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      toast({ title: "Fetch Error", description: "Could not load products for billing.", variant: "destructive" });
    } finally {
      setLoadingProducts(false);
    }
  };

  const addItem = () => {
    setItems([...items, { 
      id: Math.random().toString(36).substr(2, 9), 
      productId: '', 
      productName: '', 
      qty: 1, 
      price: 0, 
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
        const price = product.price;
        return {
          ...item,
          productId,
          productName: product.name,
          price: price,
          gstRate: gstNum,
          unit: product.unit,
          total: price * item.qty
        };
      }
      return item;
    }));
  };

  const handleQtyChange = (id: string, val: string) => {
    // Only allow positive integers
    const sanitized = val.replace(/[^0-9]/g, '');
    const qty = parseInt(sanitized) || 0;

    setItems(items.map(item => {
      if (item.id === id) {
        const product = products.find(p => p.id === item.productId);
        if (product && qty > product.stock) {
          toast({
            title: "Stock Warning",
            description: `Only ${product.stock} ${product.unit} available for ${product.name}.`,
            variant: "destructive"
          });
        }
        return {
          ...item,
          qty: qty,
          total: item.price * qty
        };
      }
      return item;
    }));
  };

  const subtotal = useMemo(() => items.reduce((acc, item) => acc + item.total, 0), [items]);
  const gstTotal = useMemo(() => items.reduce((acc, item) => acc + (item.total * (item.gstRate / 100)), 0), [items]);
  const grandTotal = subtotal + gstTotal;

  const handleSaveInvoice = async () => {
    if (!customer.name || !customer.phone) {
      toast({ title: "Validation Error", description: "Customer name and phone are required.", variant: "destructive" });
      return;
    }

    if (items.some(i => !i.productId || i.qty <= 0)) {
      toast({ title: "Validation Error", description: "Please ensure all line items have a product and quantity.", variant: "destructive" });
      return;
    }

    // Double check stock locally before sending
    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (product && item.qty > product.stock) {
        toast({ title: "Stock Error", description: `Insufficient stock for ${item.productName}.`, variant: "destructive" });
        return;
      }
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          items,
          subtotal,
          gstTotal,
          grandTotal
        })
      });

      if (res.ok) {
        const data = await res.json();
        toast({ title: "Success", description: `Invoice ${data.id} saved. Stock has been updated.` });
        // Reset form
        setItems([{ id: '1', productId: '', productName: '', qty: 1, price: 0, gstRate: 0, unit: 'units', total: 0 }]);
        setCustomer({ name: '', phone: '', address: '' });
        // Refresh products to show updated stock
        fetchProducts();
      } else {
        throw new Error('Failed to save');
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to save the invoice and update stock.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold">New Invoice</h1>
          <p className="text-muted-foreground">Manage billings. Stock is automatically updated on save.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
            <Printer className="mr-2 h-4 w-4" /> Preview & Print
          </Button>
          <Button onClick={handleSaveInvoice} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="font-headline">Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer Name</Label>
                <Input 
                  placeholder="Enter full name" 
                  value={customer.name}
                  onChange={e => setCustomer({...customer, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input 
                  placeholder="+91 00000 00000" 
                  value={customer.phone}
                  onChange={e => setCustomer({...customer, phone: e.target.value.replace(/[^0-9+]/g, '')})}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
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
              <CardTitle className="font-headline">Line Items</CardTitle>
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
                      <TableRow key={item.id} className="hover:bg-muted/5">
                        <TableCell>
                          <Select 
                            value={item.productId} 
                            onValueChange={(val) => handleProductSelect(item.id, val)}
                          >
                            <SelectTrigger className="border-none bg-muted/30 focus:ring-0">
                              <SelectValue placeholder={loadingProducts ? "Loading..." : "Select Product"} />
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
                              Stock: {selectedProduct.stock} {selectedProduct.unit} available
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Input 
                              type="text" 
                              value={item.qty} 
                              className="w-20"
                              onChange={e => handleQtyChange(item.id, e.target.value)}
                            />
                            <span className="text-[10px] text-muted-foreground uppercase">{item.unit}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input readOnly value={item.price.toLocaleString()} className="w-28 bg-muted/20 border-none pointer-events-none" />
                        </TableCell>
                        <TableCell>
                           <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 text-[10px]">
                            {item.gstRate}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">₹{item.total.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeItem(item.id)} 
                            className="text-muted-foreground hover:text-destructive"
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
                <span className="opacity-80">Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-80">GST Total</span>
                <span>₹{gstTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-80">Discount</span>
                <span>- ₹0</span>
              </div>
              <div className="border-t border-primary-foreground/20 pt-4 flex justify-between items-center">
                <span className="font-bold text-lg">Grand Total</span>
                <span className="font-bold text-2xl font-headline">₹{grandTotal.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="font-headline">Payment Mode</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-2 gap-2">
                 <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 border-2 border-primary/20 bg-primary/5">
                   <CreditCard className="h-5 w-5" />
                   <span className="text-xs">Digital</span>
                 </Button>
                 <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1">
                   <CheckCircle2 className="h-5 w-5" />
                   <span className="text-xs">Cash</span>
                 </Button>
               </div>
               <Button 
                className="w-full h-12 rounded-xl text-lg font-headline shadow-lg shadow-primary/20"
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

      {/* Invoice Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[800px] p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-muted/30">
            <DialogTitle className="font-headline text-2xl flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Invoice Preview
            </DialogTitle>
            <DialogDescription>
              Review the invoice details before saving or printing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto bg-white text-black">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold font-headline text-primary">Unified Ledger Pro</h2>
                <p className="text-xs text-muted-foreground">GSTIN: 29AAAAA0000A1Z5</p>
                <p className="text-xs text-muted-foreground">Tech Park, Bangalore, 560001</p>
              </div>
              <div className="text-right space-y-1">
                <h3 className="font-bold uppercase tracking-widest text-sm">Invoice</h3>
                <p className="text-xs">Date: {new Date().toLocaleDateString()}</p>
                <p className="text-xs">No: INV-TEMP-001</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 text-xs border-y py-4 border-muted">
              <div className="space-y-2">
                <p className="font-bold text-muted-foreground uppercase">Billed To:</p>
                <p className="font-bold">{customer.name || 'N/A'}</p>
                <p>{customer.phone || 'N/A'}</p>
                <p>{customer.address || 'N/A'}</p>
              </div>
            </div>

            <Table>
              <TableHeader className="bg-muted/10 border-b">
                <TableRow>
                  <TableHead className="text-black font-bold h-8">Description</TableHead>
                  <TableHead className="text-black font-bold h-8">Qty</TableHead>
                  <TableHead className="text-black font-bold h-8">Price</TableHead>
                  <TableHead className="text-black font-bold h-8">GST %</TableHead>
                  <TableHead className="text-right text-black font-bold h-8">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.filter(i => i.productId).map((item) => (
                  <TableRow key={item.id} className="border-b h-10">
                    <TableCell className="text-xs font-medium">{item.productName}</TableCell>
                    <TableCell className="text-xs">{item.qty} {item.unit}</TableCell>
                    <TableCell className="text-xs">₹{item.price.toLocaleString()}</TableCell>
                    <TableCell className="text-xs">{item.gstRate}%</TableCell>
                    <TableCell className="text-right text-xs">₹{item.total.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end pt-4">
              <div className="w-[300px] space-y-2 text-xs">
                <div className="flex justify-between border-b pb-1">
                  <span>Subtotal:</span>
                  <span className="font-bold">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Tax Amount:</span>
                  <span className="font-bold">₹{gstTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg pt-2 text-primary font-bold">
                  <span>Grand Total:</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-8 text-center text-[10px] text-muted-foreground border-t">
              <p>This is a computer generated invoice and does not require a signature.</p>
              <p className="mt-1 font-bold">Thank you for your business!</p>
            </div>
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
