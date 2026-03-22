"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
  RefreshCcw,
  BoxSelect,
  Archive,
  AlertCircle,
  TrendingUp,
  Scaling,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel
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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { apiClient } from '@/lib/api-client';
import { Product } from '@/lib/types';
import { cn } from '@/lib/utils';

const UNITS = [
  { id: 'units', name: 'Units' },
  { id: 'pcs', name: 'Pieces' },
  { id: 'kg', name: 'Kilograms' },
  { id: 'gm', name: 'Grams' },
  { id: 'l', name: 'Liters' },
  { id: 'box', name: 'Boxes' },
];

const GST_CATEGORIES = [
  { id: 'exempt', name: '0% (Exempt)', rate: 0 },
  { id: 'essential', name: '5% (Mass Use)', rate: 5 },
  { id: 'standard', name: '18% (Standard)', rate: 18 },
  { id: 'luxury', name: '28% (Luxury)', rate: 28 }
];

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
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

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.stock || !newProduct.categoryId || !newProduct.mrp || !newProduct.actualPrice) {
      toast({ title: "Required Data Missing", description: "All fields must be completed.", variant: "destructive" });
      return;
    }
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
      toast({ title: "Vault Updated", description: `${productToAdd.name} registered.` });
    } catch (error) {
      toast({ title: "Submission Error", description: "Failed to update repository.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilters.length === 0 || statusFilters.includes(p.status);
      return matchesSearch && matchesStatus;
    });
  }, [products, searchTerm, statusFilters]);

  return (
    <div className="space-y-8 sm:space-y-12 pb-24">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20">
            <BoxSelect className="h-3 w-3 text-primary" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary">Inventory Core</span>
          </div>
          <h1 className="font-headline text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-none">Inventory <span className="text-muted-foreground/30 font-thin italic">Vault</span></h1>
          <p className="text-muted-foreground text-sm sm:text-lg font-medium max-w-2xl leading-relaxed opacity-80">
            Enterprise asset management and stock synchronization. Use the filter matrix to audit your supply chain.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch gap-4">
          <Button variant="outline" className="h-12 sm:h-14 px-6 rounded-xl sm:rounded-2xl glass font-bold" onClick={loadProducts}>
            <RefreshCcw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} /> Resync
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 sm:h-14 px-8 rounded-xl sm:rounded-2xl shadow-xl font-black gap-3 group">
                <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" /> New Registry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-[650px] rounded-3xl border-none glass p-0 overflow-hidden shadow-2xl">
              <DialogHeader className="p-6 sm:p-10 bg-primary/5 border-b border-primary/5">
                <DialogTitle className="font-headline text-2xl font-black tracking-tighter">New Asset Registry</DialogTitle>
                <DialogDescription>Input specifications for global synchronization.</DialogDescription>
              </DialogHeader>
              <div className="p-6 sm:p-10 space-y-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest opacity-60">Asset Name*</Label>
                    <Input className="h-12 rounded-xl bg-secondary/50 border-none font-bold" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest opacity-60">Brand</Label>
                    <Input className="h-12 rounded-xl bg-secondary/50 border-none font-bold" value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest opacity-60">Stock Volume*</Label>
                    <div className="flex gap-2">
                      <Input className="h-12 rounded-xl bg-secondary/50 border-none font-bold flex-1" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: sanitizeNumeric(e.target.value)})} />
                      <Select value={newProduct.unit} onValueChange={val => setNewProduct({...newProduct, unit: val})}>
                        <SelectTrigger className="h-12 w-24 rounded-xl bg-secondary/50 border-none font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent className="glass"><SelectGroup>{UNITS.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectGroup></SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest opacity-60">Tax Bracket*</Label>
                    <Select value={newProduct.categoryId} onValueChange={val => setNewProduct({...newProduct, categoryId: val})}>
                      <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-none font-bold"><SelectValue placeholder="Select Rate" /></SelectTrigger>
                      <SelectContent className="glass"><SelectGroup>{GST_CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectGroup></SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest opacity-60">MRP (₹)*</Label>
                    <Input className="h-12 rounded-xl bg-secondary/50 border-none font-bold" value={newProduct.mrp} onChange={e => setNewProduct({...newProduct, mrp: sanitizeNumeric(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest opacity-60">Price (₹)*</Label>
                    <Input className="h-12 rounded-xl bg-secondary/50 border-none font-bold" value={newProduct.actualPrice} onChange={e => setNewProduct({...newProduct, actualPrice: sanitizeNumeric(e.target.value)})} />
                  </div>
                </div>
              </div>
              <DialogFooter className="p-6 sm:p-10 bg-primary/5 border-t border-primary/5 gap-3">
                <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button className="rounded-xl h-12 px-8 font-black shadow-lg" onClick={handleAddProduct} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />} Save Asset
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Asset Classes', value: products.length, icon: Archive, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Low Liquidity', value: products.filter(p => p.status === 'Low').length, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Stock Exhaustion', value: products.filter(p => p.status === 'Out of Stock').length, icon: Scaling, color: 'text-destructive', bg: 'bg-destructive/10' },
          { label: 'Manufacturers', value: new Set(products.map(p => p.brand)).size, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="border-none glass-card shadow-xl p-6 flex items-center gap-6 group hover:translate-y-[-4px] transition-all duration-500">
            <div className={cn("h-16 w-16 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500", stat.bg, stat.color)}>
              <stat.icon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-black font-headline tracking-tighter mt-1">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-none glass-card shadow-2xl rounded-[2rem] overflow-hidden">
        <CardHeader className="p-6 sm:p-10 border-b border-primary/5 bg-primary/[0.02]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="relative flex-1 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input placeholder="Synchronous search through vault..." className="pl-14 h-16 rounded-2xl bg-secondary/50 border-none font-bold text-lg" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-16 px-8 rounded-2xl glass font-black relative">
                    <Filter className="mr-3 h-5 w-5" /> Filter Matrix
                    {statusFilters.length > 0 && <span className="absolute -top-2 -right-2 bg-primary text-white h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black">{statusFilters.length}</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 glass rounded-2xl p-3">
                  <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest opacity-40 px-3 py-2">Stock Availability</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem checked={statusFilters.includes('In Stock')} onCheckedChange={() => toggleStatusFilter('In Stock')} className="rounded-xl font-bold py-2.5"><CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> In Stock</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={statusFilters.includes('Low')} onCheckedChange={() => toggleStatusFilter('Low')} className="rounded-xl font-bold py-2.5"><Clock className="mr-2 h-4 w-4 text-amber-500" /> Low Stock</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={statusFilters.includes('Out of Stock')} onCheckedChange={() => toggleStatusFilter('Out of Stock')} className="rounded-xl font-bold py-2.5"><XCircle className="mr-2 h-4 w-4 text-destructive" /> Out of Stock</DropdownMenuCheckboxItem>
                  {statusFilters.length > 0 && <><DropdownMenuSeparator className="my-2" /><DropdownMenuItem onClick={() => setStatusFilters([])} className="rounded-xl font-black text-xs uppercase tracking-widest justify-center text-primary py-3">Reset Matrix</DropdownMenuItem></>}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
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
                  {loading ? (
                    <TableRow><TableCell colSpan={7} className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary opacity-40" /></TableCell></TableRow>
                  ) : filteredProducts.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="py-20 text-center font-bold text-muted-foreground italic uppercase tracking-widest">No matching assets in vault.</TableCell></TableRow>
                  ) : filteredProducts.map((p) => (
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
                          {p.mrp > p.price && <span className="text-[10px] text-muted-foreground font-black line-through">MRP: ₹{p.mrp.toLocaleString()}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black tracking-tighter">{p.stock}</span>
                          <span className="text-[10px] font-black uppercase text-muted-foreground">{p.unit}</span>
                        </div>
                      </TableCell>
                      <TableCell><Badge className="bg-primary/10 text-primary border-none font-black text-[10px] px-3 py-1 rounded-lg">{p.gst}</Badge></TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "rounded-xl px-4 py-1 text-[9px] font-black uppercase tracking-widest border-none shadow-sm",
                          p.status === 'In Stock' ? 'bg-emerald-500 text-white' : p.status === 'Low' ? 'bg-amber-500 text-white' : 'bg-destructive text-white'
                        )}>
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-12 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-primary/10"><MoreVertical className="h-5 w-5" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass rounded-2xl p-2 w-56">
                            <DropdownMenuItem className="rounded-xl font-bold py-3 text-sm">Update Specifications</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl font-bold py-3 text-sm">Audit Log</DropdownMenuItem>
                            <DropdownMenuSeparator className="my-2" />
                            <DropdownMenuItem className="rounded-xl font-black text-sm text-destructive py-3">Terminate SKU</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}