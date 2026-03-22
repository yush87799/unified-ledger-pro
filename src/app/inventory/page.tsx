
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
  Loader2,
  Trash2,
  Edit2,
  ListRestart
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentProduct, setCurrentProduct] = useState({
    id: '',
    name: '',
    brand: '',
    stock: '',
    unit: 'units',
    categoryId: 'standard',
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

  const openAddDialog = () => {
    setIsEditMode(false);
    setCurrentProduct({ id: '', name: '', brand: '', stock: '', unit: 'units', categoryId: 'standard', mrp: '', actualPrice: '' });
    setIsDialogOpen(true);
  };

  const openEditDialog = (p: Product) => {
    // We use a small timeout to ensure the DropdownMenu completely unmounts its portal 
    // before the Dialog starts its own portal lifecycle, preventing background locks.
    setTimeout(() => {
      setIsEditMode(true);
      const cat = GST_CATEGORIES.find(c => c.rate === parseFloat(p.gst))?.id || 'standard';
      setCurrentProduct({
        id: p.id,
        name: p.name,
        brand: p.brand,
        stock: p.stock.toString(),
        unit: p.unit,
        categoryId: cat,
        mrp: p.mrp.toString(),
        actualPrice: p.price.toString()
      });
      setIsDialogOpen(true);
    }, 50);
  };

  const handleSaveProduct = async () => {
    const mrpNum = parseFloat(currentProduct.mrp);
    const priceNum = parseFloat(currentProduct.actualPrice);

    if (!currentProduct.name || !currentProduct.stock || isNaN(mrpNum) || isNaN(priceNum)) {
      toast({ title: "Required Data Missing", variant: "destructive" });
      return;
    }

    if (priceNum > mrpNum) {
      toast({ 
        title: "Pricing Anomaly", 
        description: "Selling rate cannot exceed MRP value.", 
        variant: "destructive" 
      });
      return;
    }

    setIsSubmitting(true);
    const categoryObj = GST_CATEGORIES.find(c => c.id === currentProduct.categoryId);
    const productPayload: Product = {
      id: isEditMode ? currentProduct.id : `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: currentProduct.name,
      brand: currentProduct.brand || 'Generic',
      category: categoryObj?.name.split(' (')[0] || 'Other',
      mrp: mrpNum,
      price: priceNum,
      stock: parseInt(currentProduct.stock),
      unit: currentProduct.unit,
      status: parseInt(currentProduct.stock) === 0 ? 'Out of Stock' : parseInt(currentProduct.stock) < 10 ? 'Low' : 'In Stock',
      gst: `${categoryObj?.rate}%`
    };

    try {
      if (isEditMode) {
        await apiClient.inventory.update(productPayload);
      } else {
        await apiClient.inventory.create(productPayload);
      }
      toast({ title: "Operation Complete", description: "The asset vault has been synchronized." });
      setIsDialogOpen(false);
      loadProducts();
    } catch (error) {
      toast({ title: "Process Error", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await apiClient.inventory.delete(id);
      setProducts(products.filter(p => p.id !== id));
      toast({ title: "Asset Terminated", description: "Product removed from vault." });
    } catch (error) {
      toast({ title: "Termination Error", variant: "destructive" });
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
    <div className="space-y-5 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20">
            <BoxSelect className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-black uppercase tracking-widest text-primary">Global Asset Matrix</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-black tracking-tight leading-none">Inventory <span className="text-muted-foreground/30 font-thin italic">Vault</span></h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 px-4 rounded-xl glass font-bold text-xs" onClick={loadProducts}>
            <RefreshCcw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} /> Refresh
          </Button>
          <Button className="h-10 px-5 rounded-xl shadow-lg font-black text-xs gap-2" onClick={openAddDialog}>
            <Plus className="h-4.5 w-4.5" /> New Asset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Asset Classes', value: products.length, icon: Archive, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Low Liquidity', value: products.filter(p => p.status === 'Low').length, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Exhaustion', value: products.filter(p => p.status === 'Out of Stock').length, icon: Scaling, color: 'text-destructive', bg: 'bg-destructive/10' },
          { label: 'Brand Footprint', value: new Set(products.map(p => p.brand)).size, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="border-none glass-card shadow-sm p-4 flex items-center gap-4 rounded-2xl">
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shadow-inner", stat.bg, stat.color)}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground leading-none">{stat.label}</p>
              <p className="text-xl font-black font-headline tracking-tighter mt-1.5">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-none glass-card shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="p-5 border-b border-primary/5 bg-primary/[0.02]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 group max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input placeholder="Deep Search Assets..." className="pl-10 h-10 rounded-xl bg-secondary/30 border-none font-bold text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 px-4 rounded-xl glass font-black text-xs">
                  <Filter className="mr-2 h-4 w-4" /> Filter Matrix {statusFilters.length > 0 && `(${statusFilters.length})`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass rounded-2xl p-2 border-none shadow-2xl">
                <DropdownMenuLabel className="text-[10px] uppercase font-black tracking-widest opacity-50 px-2 py-1.5">Availability Status</DropdownMenuLabel>
                <DropdownMenuCheckboxItem checked={statusFilters.includes('In Stock')} onCheckedChange={() => toggleStatusFilter('In Stock')} className="rounded-xl font-bold text-sm py-2.5"><CheckCircle2 className="mr-2.5 h-4 w-4 text-emerald-500" /> Fully Stocked</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={statusFilters.includes('Low')} onCheckedChange={() => toggleStatusFilter('Low')} className="rounded-xl font-bold text-sm py-2.5"><Clock className="mr-2.5 h-4 w-4 text-amber-500" /> Low Inventory</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={statusFilters.includes('Out of Stock')} onCheckedChange={() => toggleStatusFilter('Out of Stock')} className="rounded-xl font-bold text-sm py-2.5"><XCircle className="mr-2.5 h-4 w-4 text-destructive" /> Exhausted</DropdownMenuCheckboxItem>
                {statusFilters.length > 0 && <><DropdownMenuSeparator className="my-1.5"/><DropdownMenuItem onClick={() => setStatusFilters([])} className="rounded-xl font-black text-xs uppercase tracking-widest justify-center text-primary py-2.5 hover:bg-primary/5">Clear All Filters</DropdownMenuItem></>}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[850px]">
            <Table>
              <TableHeader className="bg-primary/[0.01]">
                <TableRow className="border-none">
                  <TableHead className="py-5 pl-7 font-black uppercase text-[11px] tracking-widest">SKU ID</TableHead>
                  <TableHead className="font-black uppercase text-[11px] tracking-widest">Asset Details</TableHead>
                  <TableHead className="font-black uppercase text-[11px] tracking-widest">Selling Rate (₹)</TableHead>
                  <TableHead className="font-black uppercase text-[11px] tracking-widest">Inventory</TableHead>
                  <TableHead className="font-black uppercase text-[11px] tracking-widest">Tax Matrix</TableHead>
                  <TableHead className="font-black uppercase text-[11px] tracking-widest">State</TableHead>
                  <TableHead className="pr-7"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary opacity-30" /></TableCell></TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="py-20 text-center font-bold text-muted-foreground italic text-sm">No assets recovered from matrix.</TableCell></TableRow>
                ) : filteredProducts.map((p) => (
                  <TableRow key={p.id} className="border-none hover:bg-primary/[0.04] transition-colors group">
                    <TableCell className="font-mono text-xs font-black text-primary py-5 pl-7">{p.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-black tracking-tight">{p.name}</span>
                        <span className="text-[11px] font-black uppercase text-muted-foreground tracking-widest opacity-60">{p.brand}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col leading-tight">
                        <span className="font-black text-sm">₹{p.price.toLocaleString()}</span>
                        {p.mrp > p.price && <span className="text-[11px] text-muted-foreground font-black line-through opacity-40">₹{p.mrp.toLocaleString()}</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-black tracking-tighter">{p.stock}</span>
                        <span className="text-[11px] font-black uppercase text-muted-foreground opacity-60">{p.unit}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge className="bg-primary/10 text-primary border-none font-black text-[11px] px-2.5 py-0.5 rounded-md">{p.gst}</Badge></TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "rounded-md px-3 py-1 text-[11px] font-black uppercase tracking-widest border-none text-white shadow-sm",
                        p.status === 'In Stock' ? 'bg-emerald-500' : p.status === 'Low' ? 'bg-amber-500' : 'bg-destructive'
                      )}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-7 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10"><MoreVertical className="h-5 w-5" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass rounded-2xl p-2 w-52 border-none shadow-2xl">
                          <DropdownMenuItem className="rounded-xl font-bold py-3 text-sm gap-3" onClick={() => openEditDialog(p)}>
                            <Edit2 className="h-4 w-4 text-primary" /> Modify Specs
                          </DropdownMenuItem>
                          <DropdownMenuItem className="rounded-xl font-bold py-3 text-sm gap-3">
                            <ListRestart className="h-4 w-4 text-blue-500" /> Interaction Log
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1.5" />
                          <DropdownMenuItem className="rounded-xl font-black text-sm text-destructive py-3 gap-3 hover:bg-destructive/10" onClick={() => handleDeleteProduct(p.id)}>
                            <Trash2 className="h-4 w-4" /> Terminate Asset
                          </DropdownMenuItem>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[480px] rounded-3xl border-none glass p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 bg-primary/5 border-b border-primary/5 text-left">
            <DialogTitle className="font-headline text-xl font-black tracking-tight">
              {isEditMode ? 'Modify Asset Specs' : 'Register New Enterprise Asset'}
            </DialogTitle>
          </DialogHeader>
          <div className="p-7 space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-[11px] uppercase font-black tracking-widest opacity-60">Legal Asset Name*</Label>
                <Input className="h-11 rounded-xl bg-secondary/30 border-none font-bold text-sm" value={currentProduct.name} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] uppercase font-black tracking-widest opacity-60">Brand/Maker</Label>
                <Input className="h-11 rounded-xl bg-secondary/30 border-none font-bold text-sm" value={currentProduct.brand} onChange={e => setCurrentProduct({...currentProduct, brand: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-[11px] uppercase font-black tracking-widest opacity-60">Stock Count*</Label>
                <div className="flex gap-2.5">
                  <Input className="h-11 rounded-xl bg-secondary/30 border-none font-bold text-sm flex-1" value={currentProduct.stock} onChange={e => setCurrentProduct({...currentProduct, stock: sanitizeNumeric(e.target.value)})} />
                  <Select value={currentProduct.unit} onValueChange={val => setCurrentProduct({...currentProduct, unit: val})}>
                    <SelectTrigger className="h-11 w-28 rounded-xl bg-secondary/30 border-none font-bold text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent className="glass border-none rounded-2xl p-2">
                      {UNITS.map(u => <SelectItem key={u.id} value={u.id} className="text-sm py-2.5 rounded-xl">{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] uppercase font-black tracking-widest opacity-60">Tax Matrix*</Label>
                <Select value={currentProduct.categoryId} onValueChange={val => setCurrentProduct({...currentProduct, categoryId: val})}>
                  <SelectTrigger className="h-11 rounded-xl bg-secondary/30 border-none font-bold text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass border-none rounded-2xl p-2">
                    {GST_CATEGORIES.map(c => <SelectItem key={c.id} value={c.id} className="text-sm py-2.5 rounded-xl">{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-[11px] uppercase font-black tracking-widest opacity-60">MRP Value*</Label>
                <Input className="h-11 rounded-xl bg-secondary/30 border-none font-bold text-sm" value={currentProduct.mrp} onChange={e => setCurrentProduct({...currentProduct, mrp: sanitizeNumeric(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] uppercase font-black tracking-widest opacity-60">Selling Rate*</Label>
                <Input className="h-11 rounded-xl bg-secondary/30 border-none font-bold text-sm" value={currentProduct.actualPrice} onChange={e => setCurrentProduct({...currentProduct, actualPrice: sanitizeNumeric(e.target.value)})} />
              </div>
            </div>
          </div>
          <DialogFooter className="p-5 bg-primary/5 border-t border-primary/5 gap-3">
            <Button variant="ghost" className="rounded-xl font-bold text-sm h-11 px-6" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button className="rounded-xl h-11 px-8 font-black text-sm shadow-xl" onClick={handleSaveProduct} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2.5" /> : <Save className="h-5 w-5 mr-2.5" />} 
              Commit Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
