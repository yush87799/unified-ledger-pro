
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
  Copy,
  RefreshCcw,
  BoxSelect,
  Archive,
  AlertCircle,
  TrendingUp,
  Scaling,
  CheckCircle2,
  XCircle,
  Clock
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/select";
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
  { id: 'luxury', name: '28% (Luxury)', rate: 28, examples: 'Premium Sin goods' }
];

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filtering States
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);

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

  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const toggleCategoryFilter = (cat: string) => {
    setCategoryFilters(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilters.length === 0 || statusFilters.includes(p.status);
      const matchesCategory = categoryFilters.length === 0 || categoryFilters.includes(p.gst);

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, searchTerm, statusFilters, categoryFilters]);

  const activeFilterCount = statusFilters.length + categoryFilters.length;

  return (
    <div className="space-y-8 sm:space-y-12 pb-24 sm:pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8">
        <div className="space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20">
            <BoxSelect className="h-3 w-3 text-primary" />
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary">Inventory Core Ready</span>
          </div>
          <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter">Inventory <span className="text-muted-foreground/30 font-thin italic">Vault</span></h1>
          <p className="text-muted-foreground text-base sm:text-lg font-medium max-w-2xl leading-relaxed">
            Central repository for enterprise assets. Manage stock levels, tax classifications, and SKU data.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <Button variant="outline" className="h-12 sm:h-14 px-4 sm:px-6 rounded-xl sm:rounded-2xl glass hover:bg-primary/5 font-bold" onClick={loadProducts}>
            <RefreshCcw className={loading ? 'animate-spin mr-3 h-4 w-4 sm:h-5 sm:w-5' : 'mr-3 h-4 w-4 sm:h-5 sm:w-5 text-primary'} /> Resync Data
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl sm:rounded-2xl shadow-xl font-black group">
                <Plus className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 group-hover:rotate-90 transition-transform duration-500" /> New Registry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-[650px] p-0 rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden glass border-none shadow-2xl">
              <DialogHeader className="p-6 sm:p-10 bg-primary/5 border-b border-primary/5">
                <DialogTitle className="font-headline text-xl sm:text-3xl font-black tracking-tighter">New Asset Registry</DialogTitle>
                <DialogDescription className="text-xs sm:text-base font-medium">Input specifications for global synchronization.</DialogDescription>
              </DialogHeader>
              <div className="p-6 sm:p-12 space-y-6 sm:space-y-8 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-2">
                    <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Asset Name*</Label>
                    <Input 
                      placeholder="e.g. Ultra Gaming X" 
                      className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-secondary/50 border-none font-bold"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({...prev, name: e.target.value}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Manufacturer / Brand</Label>
                    <Input 
                      placeholder="Brand Entity" 
                      className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-secondary/50 border-none font-bold"
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct(prev => ({...prev, brand: e.target.value}))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-2">
                    <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground">MRP (₹)*</Label>
                    <Input 
                      placeholder="Max Retail Price" 
                      className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-secondary/50 border-none font-bold"
                      value={newProduct.mrp}
                      onChange={(e) => handlePriceInput(e.target.value, 'mrp')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Market Price*</Label>
                    <div className="flex gap-2 sm:gap-3">
                      <Input 
                        placeholder="Selling Price" 
                        className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-secondary/50 border-none font-bold flex-1"
                        value={newProduct.actualPrice}
                        onChange={(e) => handlePriceInput(e.target.value, 'actualPrice')}
                      />
                      <Button variant="outline" className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl glass" onClick={() => setNewProduct(p => ({...p, actualPrice: p.mrp}))}><Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-2">
                    <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Stock Volume*</Label>
                    <div className="flex gap-2 sm:gap-3">
                      <Input 
                        className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-secondary/50 border-none font-black flex-1 text-center"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct(prev => ({...prev, stock: sanitizeNumeric(e.target.value)}))}
                      />
                      <Select value={newProduct.unit} onValueChange={(val) => setNewProduct(prev => ({...prev, unit: val}))}>
                        <SelectTrigger className="h-12 sm:h-14 w-24 sm:w-32 rounded-xl sm:rounded-2xl bg-secondary/50 border-none font-bold">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass">
                          {UNITS.map(u => <SelectItem key={u.id} value={u.id} className="rounded-xl font-bold">{u.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tax Classification*</Label>
                    <Select value={newProduct.categoryId} onValueChange={(val) => setNewProduct(prev => ({...prev, categoryId: val}))}>
                      <SelectTrigger className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-secondary/50 border-none font-bold">
                        <SelectValue placeholder="Select Rate" />
                      </SelectTrigger>
                      <SelectContent className="glass">
                        {GST_CATEGORIES.map(cat => (
                          <SelectItem key={cat.id} value={cat.id} className="rounded-xl font-bold py-2 sm:py-3">
                            {cat.name} <span className="opacity-40 text-[9px] ml-2 font-black">{cat.examples}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter className="p-6 sm:p-10 bg-primary/5 border-t border-primary/5 flex flex-col-reverse sm:flex-row gap-3">
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl sm:rounded-2xl font-black px-6 sm:px-8 h-12 sm:h-14 w-full sm:w-auto">Cancel</Button>
                <Button onClick={handleAddProduct} disabled={isSubmitting} className="rounded-xl sm:rounded-2xl h-12 sm:h-14 px-8 sm:px-10 font-black text-base sm:text-lg shadow-2xl gap-3 transition-all active:scale-95 w-full sm:w-auto">
                  {isSubmitting ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  Register Asset
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
        {[
          { label: 'Asset Classes', value: products.length, icon: Archive, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Low Liquidity', value: products.filter(p => p.status === 'Low').length, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Stock Exhaustion', value: products.filter(p => p.status === 'Out of Stock').length, icon: Scaling, color: 'text-destructive', bg: 'bg-destructive/10' },
          { label: 'Manufacturers', value: new Set(products.map(p => p.brand)).size, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="border-none glass-card shadow-xl p-6 sm:p-8 flex items-center gap-5 sm:gap-6 group hover:translate-y-[-4px] transition-all duration-500">
            <div className={`h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-3xl flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
              <stat.icon className="h-5 w-5 sm:h-7 sm:w-7" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
              <p className="text-2xl sm:text-3xl font-black font-headline tracking-tighter mt-0.5 sm:mt-1">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-none glass-card shadow-2xl rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden">
        <CardHeader className="p-6 sm:p-10 border-b border-primary/5 bg-primary/[0.02]">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 sm:gap-10">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 sm:left-5 top-4.5 sm:top-5 h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Synchronous search through vault..." 
                className="pl-12 sm:pl-14 h-14 sm:h-16 rounded-xl sm:rounded-2xl bg-secondary/50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-bold text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl sm:rounded-2xl glass font-black text-xs sm:text-sm relative">
                  <Filter className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5" /> 
                  Filter Matrix
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black animate-in zoom-in">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 glass rounded-2xl p-2 sm:p-3">
                <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest opacity-40 px-3 py-2">Stock Availability</DropdownMenuLabel>
                <DropdownMenuCheckboxItem checked={statusFilters.includes('In Stock')} onCheckedChange={() => toggleStatusFilter('In Stock')} className="rounded-xl font-bold py-2.5">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> In Stock
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={statusFilters.includes('Low')} onCheckedChange={() => toggleStatusFilter('Low')} className="rounded-xl font-bold py-2.5">
                  <Clock className="mr-2 h-4 w-4 text-amber-500" /> Low Stock
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={statusFilters.includes('Out of Stock')} onCheckedChange={() => toggleStatusFilter('Out of Stock')} className="rounded-xl font-bold py-2.5">
                  <XCircle className="mr-2 h-4 w-4 text-destructive" /> Out of Stock
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuSeparator className="my-2" />
                
                <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest opacity-40 px-3 py-2">Tax Brackets</DropdownMenuLabel>
                <DropdownMenuCheckboxItem checked={categoryFilters.includes('0%')} onCheckedChange={() => toggleCategoryFilter('0%')} className="rounded-xl font-bold py-2.5">
                  GST 0%
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={categoryFilters.includes('5%')} onCheckedChange={() => toggleCategoryFilter('5%')} className="rounded-xl font-bold py-2.5">
                  GST 5%
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={categoryFilters.includes('18%')} onCheckedChange={() => toggleCategoryFilter('18%')} className="rounded-xl font-bold py-2.5">
                  GST 18%
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={categoryFilters.includes('28%')} onCheckedChange={() => toggleCategoryFilter('28%')} className="rounded-xl font-bold py-2.5">
                  GST 28%
                </DropdownMenuCheckboxItem>
                
                {(activeFilterCount > 0) && (
                  <>
                    <DropdownMenuSeparator className="my-2" />
                    <DropdownMenuItem onClick={() => { setStatusFilters([]); setCategoryFilters([]); }} className="rounded-xl font-black text-xs uppercase tracking-widest justify-center text-primary py-3 hover:bg-primary/5">
                      Reset Filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-20 sm:p-32 text-center space-y-3 sm:space-y-4">
              <RefreshCcw className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-primary animate-spin" />
              <p className="text-base sm:text-lg font-bold text-muted-foreground tracking-tight">Accessing Secure Vault Data...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-20 sm:p-32 text-center space-y-3 sm:space-y-4">
              <Archive className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="text-lg font-black text-muted-foreground tracking-tight uppercase">No assets found in current matrix.</p>
              <Button variant="link" onClick={() => { setSearchTerm(''); setStatusFilters([]); setCategoryFilters([]); }} className="font-black uppercase tracking-widest text-primary">Clear all filters</Button>
            </div>
          ) : (
            <div className="min-w-[1000px]">
              <Table>
                <TableHeader className="bg-primary/[0.01]">
                  <TableRow className="border-none">
                    <TableHead className="py-6 sm:py-8 pl-10 sm:pl-12 font-black uppercase text-[9px] sm:text-[10px] tracking-widest">SKU ID</TableHead>
                    <TableHead className="font-black uppercase text-[9px] sm:text-[10px] tracking-widest">Asset Details</TableHead>
                    <TableHead className="font-black uppercase text-[9px] sm:text-[10px] tracking-widest">Matrix Price</TableHead>
                    <TableHead className="font-black uppercase text-[9px] sm:text-[10px] tracking-widest">Inventory</TableHead>
                    <TableHead className="font-black uppercase text-[9px] sm:text-[10px] tracking-widest">GST Rate</TableHead>
                    <TableHead className="font-black uppercase text-[9px] sm:text-[10px] tracking-widest">Status</TableHead>
                    <TableHead className="pr-10 sm:pr-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((p) => (
                    <TableRow key={p.id} className="border-none hover:bg-primary/[0.03] transition-colors group">
                      <TableCell className="font-mono text-[10px] sm:text-xs font-black text-primary py-6 sm:py-8 pl-10 sm:pl-12 group-hover:translate-x-2 transition-transform duration-500">{p.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm sm:text-base font-black tracking-tight">{p.name}</span>
                          <span className="text-[9px] sm:text-[10px] font-black uppercase text-muted-foreground tracking-widest">{p.brand}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm sm:text-base font-black">₹{p.price.toLocaleString()}</span>
                          {p.mrp > p.price && (
                            <span className="text-[9px] sm:text-[10px] text-muted-foreground font-black line-through">MRP: ₹{p.mrp.toLocaleString()}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="text-base sm:text-lg font-black tracking-tighter">{p.stock}</span>
                          <span className="text-[9px] sm:text-[10px] font-black uppercase text-muted-foreground">{p.unit}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] sm:text-[10px] px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg">{p.gst}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`rounded-lg sm:rounded-xl px-3 sm:px-4 py-0.5 sm:py-1 text-[8px] sm:text-[9px] font-black uppercase tracking-widest border-none shadow-sm ${
                            p.status === 'In Stock' ? 'bg-emerald-500 text-white' : 
                            p.status === 'Low' ? 'bg-amber-500 text-white' : 'bg-destructive text-white'
                          }`}
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-10 sm:pr-12 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl hover:bg-primary/10">
                              <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass rounded-xl sm:rounded-2xl p-1 sm:p-2 w-48 sm:w-56">
                            <DropdownMenuItem className="rounded-lg sm:rounded-xl font-bold py-2 sm:py-3 text-xs sm:text-sm">Update Specifications</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg sm:rounded-xl font-bold py-2 sm:py-3 text-xs sm:text-sm">Audit Log</DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg sm:rounded-xl font-bold py-2 sm:py-3 text-destructive text-xs sm:text-sm">Terminate SKU</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
