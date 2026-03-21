
"use client";

import React, { useState } from 'react';
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
import { Plus, Trash2, Printer, Save, CreditCard, Send } from 'lucide-react';

export default function BillingPage() {
  const [items, setItems] = useState([
    { id: 1, product: '', qty: 1, price: 0, gst: 18, total: 0 }
  ]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), product: '', qty: 1, price: 0, gst: 18, total: 0 }]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const calculateSubtotal = () => items.reduce((acc, item) => acc + (item.qty * item.price), 0);
  const calculateGST = () => calculateSubtotal() * 0.18;
  const calculateTotal = () => calculateSubtotal() + calculateGST();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold">New Invoice</h1>
          <p className="text-muted-foreground">Generate billing for your customers with auto GST calculation.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" /> Save Draft
          </Button>
          <Button>
            <Printer className="mr-2 h-4 w-4" /> Print Invoice
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
                <Input placeholder="Search or add customer..." />
              </div>
              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input placeholder="+91 00000 00000" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Billing Address</Label>
                <Input placeholder="Full address details" />
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
                <TableHeader>
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
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Select>
                          <SelectTrigger className="border-none bg-muted/30 focus:ring-0">
                            <SelectValue placeholder="Select Product" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="chair">Ergonomic Chair</SelectItem>
                            <SelectItem value="keyboard">Keyboard</SelectItem>
                            <SelectItem value="mouse">Mouse</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input type="number" defaultValue={item.qty} className="w-20" />
                      </TableCell>
                      <TableCell>
                        <Input type="number" placeholder="0.00" className="w-28" />
                      </TableCell>
                      <TableCell>
                        <Select defaultValue="18">
                          <SelectTrigger className="border-none bg-muted/30 focus:ring-0 w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0%</SelectItem>
                            <SelectItem value="5">5%</SelectItem>
                            <SelectItem value="12">12%</SelectItem>
                            <SelectItem value="18">18%</SelectItem>
                            <SelectItem value="28">28%</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right font-medium">₹0.00</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
                <span>₹{calculateSubtotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-80">Estimated GST (18%)</span>
                <span>₹{calculateGST().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-80">Discount</span>
                <span>- ₹0</span>
              </div>
              <div className="border-t border-primary-foreground/20 pt-4 flex justify-between items-center">
                <span className="font-bold text-lg">Grand Total</span>
                <span className="font-bold text-2xl font-headline">₹{calculateTotal().toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="font-headline">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-2 gap-2">
                 <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1 border-2 border-primary/20 bg-primary/5">
                   <CreditCard className="h-5 w-5" />
                   <span className="text-xs">Online</span>
                 </Button>
                 <Button variant="outline" className="h-16 flex flex-col items-center justify-center gap-1">
                   <Plus className="h-5 w-5 rotate-45" />
                   <span className="text-xs">Cash</span>
                 </Button>
               </div>
               <Button className="w-full h-12 rounded-xl text-lg font-headline shadow-lg shadow-primary/20">
                 <Send className="mr-2 h-5 w-5" /> Confirm & Send
               </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
