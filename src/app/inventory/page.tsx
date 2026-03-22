
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Save, 
  Copy,
  RefreshCcw,
  BoxSelect,
  Archive,
  AlertCircle,
  TrendingUp,
  Scaling
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { apiClient } from '@/lib/api-client';
import { Product } from '@/lib/types';

const UNITS = [
  { id: 'units', name: 'Units (Qty)' },
  { id: 'pcs', name: 'Pieces (Pcs)' },
  { id: 'kg', name: 'Kilograms (kg)' },
  { id: 'gm', name: 'Grams (gm)' },
  { id: 'l', name: 'Liters (L)' },
  { id: 'ml', name: 'Milliliters (ml)' },
  { id: 'ft', name: 'Feet (ft)' },
  { id: 'm', name: 'Meters (m)' },
  { id: 'box', name: 'Boxes' },
];

const GST_CATEGORIES = [
  { id: 'exempt', name: '0% (Exempt)', rate: 0, examples: 'Essential life goods' },
  { id: 'essential', name: '5% (Mass Use)', rate: 5, examples: 'Packaged foods' },
  { id: 'standard', name: '18% (Standard)', rate: 18, examples: 'Electronics & services' },
  { id: 'luxury', name: '40% (Luxury)', rate: 40, examples: 'Premium Sin goods' }
];

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    stock: '',
    unit: 'units',
    categoryId: '',
    mrp: '',
    actualPrice: ''
  });

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await apiClient.inventory.getAll();
      setProducts(data);
    } catch (error) {
      toast({ title: "Sync Failed", description: "Database communication error.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const sanitizeNumeric = (value: string) => value.replace(/[^0-9.]/g, '');

  const handlePriceInput = (value: string, field: 'mrp' | 'actualPrice') => {
    const sanitized = sanitizeNumeric(value);
    setNewProduct(prev => ({ ...prev, [field]: sanitized }));
  };

  const validatePricing = () => {
    const mrpNum = parseFloat(newProduct.mrp) || 0;
    const priceNum = parseFloat(newProduct.actualPrice) || 0;
    if (newProduct.mrp && newProduct.actualPrice && priceNum > mrpNum) {
      toast({ title: "Pricing Conflict", description: "Selling price cannot exceed MRP.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.stock || !newProduct.categoryId || !newProduct.mrp || !newProduct.actualPrice) {
      toast({ title: "Required Data Missing", description: "All asterisked fields must be completed.", variant: "destructive" });
      return;
    }
    if (!validatePricing()) return;

    setIsSubmitting(true);
    const categoryObj = GST_CATEGORIES.find(c => c.id === newProduct.categoryId);
    const productToAdd: Product = {
      id: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newProduct.name,
      brand: newProduct.brand || 'Generic',
      category: categoryObj?.name.split(' (')[0] || 'Other',
      mrp: parseFloat(newProduct.mrp),
      price: parseFloat(newProduct.actualPrice),
      stock: parseInt(newProduct.stock),
      unit: newProduct.unit,
      status: parseInt(newProduct.stock) === 0 ? 'Out of Stock' : parseInt(newProduct.stock) < 10 ? 'Low' : 'In Stock',
      gst: `${categoryObj?.rate}%`
    };

    try {
      await apiClient.inventory.create(productToAdd);
      setProducts([productToAdd, ...products]);
      setIsDialogOpen(false);
      setNewProduct({ name: '', brand: '', stock: '', unit: 'units', categoryId: '', mrp: '', actualPrice: '' });
      toast({ title: "Vault Updated", description: `${productToAdd.name} registered successfully.` });
    } catch (error) {
      toast({ title: "Submission Error", description: "Failed to update central repository.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20">
            <BoxSelect className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Inventory Core Ready</span>
          </div>
          <h1 className="font-headline text-5xl font-black tracking-tighter">Inventory <span className="text-muted-foreground/30 font-thin italic">Vault</span></h1>
          <p className="text-muted-foreground text-lg font-medium max-w-2xl leading-relaxed">
            Central repository for enterprise assets. Manage stock levels, tax classifications, and SKU data.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="h-14 px-6 rounded-2xl glass hover:bg-primary/5 font-bold" onClick={loadProducts}>
            <RefreshCcw className={loading ? 'animate-spin mr-3 h-5 w-5' : 'mr-3 h-5 w-5 text-primary'} /> Resync Data
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-14 px-8 rounded-2xl shadow-xl font-black group">
                <Plus className="mr-3 h-5 w-5 group-hover:rotate-90 transition-transform duration-500" /> New Registry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] p-0 rounded-[2.5rem] overflow-hidden glass border-none shadow-2xl">
              <DialogHeader className="p-10 bg-primary/5 border-b border-primary/5">
                <DialogTitle className="font-headline text-3xl font-black tracking-tighter">New Asset Registry</DialogTitle>
                <DialogDescription className="text-base font-medium">Input product specification for global ledger synchronization.</DialogDescription>
              </DialogHeader>
              <div className="p-12 space-y-8 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Asset Name*</Label>
                    <Input 
                      placeholder="e.g. Ultra Gaming X" 
                      className="h-14 rounded-2xl bg-secondary/50 border-none font-bold"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({...prev, name: e.target.value}))}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Manufacturer / Brand</Label>
                    <Input 
                      placeholder="Brand Entity" 
                      className="h-14 rounded-2xl bg-secondary/50 border-none font-bold"
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct(prev => ({...prev, brand: e.target.value}))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">MRP (₹)*</Label>
                    <Input 
                      placeholder="Max Retail Price" 
                      className="h-14 rounded-2xl bg-secondary/50 border-none font-bold"
                      value={newProduct.mrp}
                      onChange={(e) => handlePriceInput(e.target.value, 'mrp')}
                      onBlur={validatePricing}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Market Price*</Label>
                    <div className="flex gap-3">
                      <Input 
                        placeholder="Selling Price" 
                        className="h-14 rounded-2xl bg-secondary/50 border-none font-bold flex-1"
                        value={newProduct.actualPrice}
                        onChange={(e) => handlePriceInput(e.target.value, 'actualPrice')}
                        onBlur={validatePricing}
                      />
                      <Button variant="outline" className="h-14 w-14 rounded-2xl glass" onClick={() => setNewProduct(p => ({...p, actualPrice: p.mrp}))}><Copy className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stock Volume*</Label>
                    <div className="flex gap-3">
                      <Input 
                        className="h-14 rounded-2xl bg-secondary/50 border-none font-black flex-1 text-center"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct(prev => ({...prev, stock: sanitizeNumeric(e.target.value)}))}
                      />
                      <Select value={newProduct.unit} onValueChange={(val) => setNewProduct(prev => ({...prev, unit: val}))}>
                        <SelectTrigger className="h-14 w-32 rounded-2xl bg-secondary/50 border-none font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass">
                          {UNITS.map(u => <SelectItem key={u.id} value={u.id} className="rounded-xl font-bold">{u.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tax Classification*</Label>
                    <Select value={newProduct.categoryId} onValueChange={(val) => setNewProduct(prev => ({...prev, categoryId: val}))}>
                      <SelectTrigger className="h-14 rounded-2xl bg-secondary/50 border-none font-bold">
                        <SelectValue placeholder="Select Rate" />
                      </SelectTrigger>
                      <SelectContent className="glass">
                        {GST_CATEGORIES.map(cat => (
                          <SelectItem key={cat.id} value={cat.id} className="rounded-xl font-bold py-3">
                            {cat.name} <span className="opacity-40 text-[10px] ml-2 font-black">{cat.examples}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter className="p-10 bg-primary/5 border-t border-primary/5">
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-2xl font-black px-8 h-14">Cancel Operation</Button>
                <Button onClick={handleAddProduct} disabled={isSubmitting} className="rounded-2xl h-14 px-10 font-black text-lg shadow-2xl gap-3 transition-all active:scale-95">
                  {isSubmitting ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  Register Asset
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'Asset Classes', value: products.length, icon: Archive, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Low Liquidity', value: products.filter(p => p.status === 'Low').length, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Stock Exhaustion', value: products.filter(p => p.status === 'Out of Stock').length, icon: Scaling, color: 'text-destructive', bg: 'bg-destructive/10' },
          { label: 'Manufacturers', value: new Set(products.map(p => p.brand)).size, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="border-none glass-card shadow-xl p-8 flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-500">
            <div className={`h-16 w-16 rounded-3xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
              <stat.icon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-black font-headline tracking-tighter mt-1">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-none glass-card shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-10 border-b border-primary/5 bg-primary/[0.02]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div className="relative flex-1 max-w-2xl group">
              <Search className="absolute left-5 top-4.5 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Synchronous search through vault... (SKU, Brand, Name)" 
                className="pl-14 h-16 rounded-2xl bg-secondary/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-bold text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-14 px-8 rounded-2xl glass font-black"><Filter className="mr-3 h-5 w-5" /> Filter Matrix</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-32 text-center space-y-4">
              <RefreshCcw className="mx-auto h-12 w-12 text-primary animate-spin" />
              <p className="text-lg font-bold text-muted-foreground tracking-tight">Accessing Secure Vault Data...</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-primary/[0.01]">
                <TableRow className="border-none">
                  <TableHead className="py-8 pl-12 font-black uppercase text-[10px] tracking-widest">SKU ID</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Asset Details</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Matrix Price</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Inventory</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">GST Rate</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest">Status</TableHead>
                  <TableHead className="pr-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((p) => (
                  <TableRow key={p.id} className="border-none hover:bg-primary/[0.03] transition-colors group">
                    <TableCell className="font-mono text-xs font-black text-primary py-8 pl-12 group-hover:translate-x-2 transition-transform duration-500">{p.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-base font-black tracking-tight">{p.name}</span>
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{p.brand}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-base font-black">₹{p.price.toLocaleString()}</span>
                        {p.mrp > p.price && (
                          <span className="text-[10px] text-muted-foreground font-black line-through">MRP: ₹{p.mrp.toLocaleString()}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black tracking-tighter">{p.stock}</span>
                        <span className="text-[10px] font-black uppercase text-muted-foreground">{p.unit}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] px-3 py-1 rounded-lg">{p.gst}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={`rounded-xl px-4 py-1 text-[9px] font-black uppercase tracking-widest border-none shadow-sm ${
                          p.status === 'In Stock' ? 'bg-emerald-500 text-white' : 
                          p.status === 'Low' ? 'bg-amber-500 text-white' : 'bg-destructive text-white'
                        }`}
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-12 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-primary/10">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass rounded-2xl p-2 w-56">
                          <DropdownMenuItem className="rounded-xl font-bold py-3">Update Specifications</DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl font-bold py-3">Audit Log</DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl font-bold py-3 text-destructive">Terminate SKU</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
