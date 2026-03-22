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
    <div className="space-y-4 sm:space-y-6 pb-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
            <BoxSelect className="h-2.5 w-2.5 text-primary" />
            <span className="text-[7px] font-black uppercase tracking-widest text-primary">Inventory Core</span>
          </div>
          <h1 className="font-headline text-xl sm:text-2xl font-black tracking-tighter leading-none">Global <span className="text-muted-foreground/30 font-thin italic">Vault</span></h1>
        </div>
        <div className="flex items-stretch gap-2">
          <Button variant="outline" className="h-8 px-3 rounded-lg glass font-bold text-[10px]" onClick={loadProducts}>
            <RefreshCcw className={cn("mr-1.5 h-3 w-3", loading && "animate-spin")} /> Resync
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-8 px-4 rounded-lg shadow-lg font-black text-[10px] gap-2">
                <Plus className="h-3 w-3" /> New Asset
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-[500px] rounded-xl border-none glass p-0 overflow-hidden shadow-2xl">
              <DialogHeader className="p-4 bg-primary/5 border-b border-primary/5 text-left">
                <DialogTitle className="font-headline text-base font-black tracking-tight">Register Asset</DialogTitle>
              </DialogHeader>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[8px] uppercase font-black tracking-widest opacity-60">Asset Name*</Label>
                    <Input className="h-8 rounded-lg bg-secondary/50 border-none font-bold text-[10px]" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[8px] uppercase font-black tracking-widest opacity-60">Brand</Label>
                    <Input className="h-8 rounded-lg bg-secondary/50 border-none font-bold text-[10px]" value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[8px] uppercase font-black tracking-widest opacity-60">Stock*</Label>
                    <div className="flex gap-2">
                      <Input className="h-8 rounded-lg bg-secondary/50 border-none font-bold text-[10px] flex-1" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: sanitizeNumeric(e.target.value)})} />
                      <Select value={newProduct.unit} onValueChange={val => setNewProduct({...newProduct, unit: val})}>
                        <SelectTrigger className="h-8 w-16 rounded-lg bg-secondary/50 border-none font-bold text-[10px]"><SelectValue /></SelectTrigger>
                        <SelectContent className="glass border-none"><SelectGroup>{UNITS.map(u => <SelectItem key={u.id} value={u.id} className="text-[10px]">{u.name}</SelectItem>)}</SelectGroup></SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[8px] uppercase font-black tracking-widest opacity-60">Tax*</Label>
                    <Select value={newProduct.categoryId} onValueChange={val => setNewProduct({...newProduct, categoryId: val})}>
                      <SelectTrigger className="h-8 rounded-lg bg-secondary/50 border-none font-bold text-[10px]"><SelectValue placeholder="Rate" /></SelectTrigger>
                      <SelectContent className="glass border-none"><SelectGroup>{GST_CATEGORIES.map(c => <SelectItem key={c.id} value={c.id} className="text-[10px]">{c.name}</SelectItem>)}</SelectGroup></SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[8px] uppercase font-black tracking-widest opacity-60">MRP (₹)*</Label>
                    <Input className="h-8 rounded-lg bg-secondary/50 border-none font-bold text-[10px]" value={newProduct.mrp} onChange={e => setNewProduct({...newProduct, mrp: sanitizeNumeric(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[8px] uppercase font-black tracking-widest opacity-60">Price (₹)*</Label>
                    <Input className="h-8 rounded-lg bg-secondary/50 border-none font-bold text-[10px]" value={newProduct.actualPrice} onChange={e => setNewProduct({...newProduct, actualPrice: sanitizeNumeric(e.target.value)})} />
                  </div>
                </div>
              </div>
              <DialogFooter className="p-4 bg-primary/5 border-t border-primary/5 gap-2">
                <Button variant="ghost" className="rounded-lg font-bold text-[10px] h-8" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button className="rounded-lg h-8 px-4 font-black text-[10px] shadow-md" onClick={handleAddProduct} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Save className="h-3 w-3 mr-2" />} Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Asset Classes', value: products.length, icon: Archive, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Low Liquidity', value: products.filter(p => p.status === 'Low').length, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Exhaustion', value: products.filter(p => p.status === 'Out of Stock').length, icon: Scaling, color: 'text-destructive', bg: 'bg-destructive/10' },
          { label: 'Brands', value: new Set(products.map(p => p.brand)).size, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="border-none glass-card shadow-md p-3 flex items-center gap-3">
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", stat.bg, stat.color)}>
              <stat.icon className="h-4 w-4" />
            </div>
            <div className="leading-none">
              <p className="text-[7px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
              <p className="text-base font-black font-headline tracking-tighter mt-0.5">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-none glass-card shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="p-3 sm:p-4 border-b border-primary/5 bg-primary/[0.02]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary" />
              <Input placeholder="Synchronous Search..." className="pl-9 h-8 rounded-lg bg-secondary/50 border-none font-bold text-[10px]" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-8 px-4 rounded-lg glass font-black text-[10px]">
                  <Filter className="mr-1.5 h-3 w-3" /> Filters {statusFilters.length > 0 && `(${statusFilters.length})`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 glass rounded-xl p-1.5 border-none">
                <DropdownMenuLabel className="text-[7px] uppercase font-black tracking-widest opacity-40 px-2 py-1">Availability</DropdownMenuLabel>
                <DropdownMenuCheckboxItem checked={statusFilters.includes('In Stock')} onCheckedChange={() => toggleStatusFilter('In Stock')} className="rounded-lg font-bold text-[10px] py-1.5"><CheckCircle2 className="mr-2 h-3 w-3 text-emerald-500" /> In Stock</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={statusFilters.includes('Low')} onCheckedChange={() => toggleStatusFilter('Low')} className="rounded-lg font-bold text-[10px] py-1.5"><Clock className="mr-2 h-3 w-3 text-amber-500" /> Low Stock</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={statusFilters.includes('Out of Stock')} onCheckedChange={() => toggleStatusFilter('Out of Stock')} className="rounded-lg font-bold text-[10px] py-1.5"><XCircle className="mr-2 h-3 w-3 text-destructive" /> Out of Stock</DropdownMenuCheckboxItem>
                {statusFilters.length > 0 && <><DropdownMenuSeparator /><DropdownMenuItem onClick={() => setStatusFilters([])} className="rounded-lg font-black text-[8px] uppercase tracking-widest justify-center text-primary py-1.5">Reset Filters</DropdownMenuItem></>}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader className="bg-primary/[0.01]">
                <TableRow className="border-none">
                  <TableHead className="py-3 pl-6 font-black uppercase text-[8px] tracking-widest">SKU ID</TableHead>
                  <TableHead className="font-black uppercase text-[8px] tracking-widest">Asset Details</TableHead>
                  <TableHead className="font-black uppercase text-[8px] tracking-widest">Rate (₹)</TableHead>
                  <TableHead className="font-black uppercase text-[8px] tracking-widest">Inventory</TableHead>
                  <TableHead className="font-black uppercase text-[8px] tracking-widest">Tax</TableHead>
                  <TableHead className="font-black uppercase text-[8px] tracking-widest">Status</TableHead>
                  <TableHead className="pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary opacity-40" /></TableCell></TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="py-8 text-center font-bold text-muted-foreground italic text-[10px]">No assets found.</TableCell></TableRow>
                ) : filteredProducts.map((p) => (
                  <TableRow key={p.id} className="border-none hover:bg-primary/[0.03] transition-colors group">
                    <TableCell className="font-mono text-[9px] font-black text-primary py-3 pl-6">{p.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col leading-tight">
                        <span className="text-[10px] font-black tracking-tight">{p.name}</span>
                        <span className="text-[7px] font-black uppercase text-muted-foreground tracking-widest">{p.brand}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col leading-tight">
                        <span className="text-[10px] font-black">₹{p.price.toLocaleString()}</span>
                        {p.mrp > p.price && <span className="text-[7px] text-muted-foreground font-black line-through opacity-50">₹{p.mrp.toLocaleString()}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] font-black tracking-tighter">{p.stock}</span>
                        <span className="text-[7px] font-black uppercase text-muted-foreground">{p.unit}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge className="bg-primary/10 text-primary border-none font-black text-[7px] px-1.5 py-0 rounded-md">{p.gst}</Badge></TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "rounded-lg px-2 py-0 text-[6px] font-black uppercase tracking-widest border-none shadow-sm text-white",
                        p.status === 'In Stock' ? 'bg-emerald-500' : p.status === 'Low' ? 'bg-amber-500' : 'bg-destructive'
                      )}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg"><MoreVertical className="h-3 w-3" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass rounded-xl p-1 w-40 border-none">
                          <DropdownMenuItem className="rounded-lg font-bold py-1.5 text-[10px]">Edit Specs</DropdownMenuItem>
                          <DropdownMenuItem className="rounded-lg font-bold py-1.5 text-[10px]">Audit Log</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="rounded-lg font-black text-[10px] text-destructive py-1.5">Terminate</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}