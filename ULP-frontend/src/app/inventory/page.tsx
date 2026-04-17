
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Scaling,
  Warehouse as WarehouseIcon,
  Loader2,
  Trash2,
  Edit2
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
import { Product, BusinessSettings } from '@/lib/types';
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
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  
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
    actualPrice: '',
    buyingPrice: '',
    warehouse: ''
  });

  useEffect(() => { loadInitialData(); }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [prodData, settingsData] = await Promise.all([
        apiClient.inventory.getAll(),
        apiClient.settings.get()
      ]);
      setProducts(prodData);
      setSettings(settingsData);
    } catch (error) {
      toast({ title: "Sync Failed", description: "Database communication error.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const sanitizeNumeric = (value: string) => value.replace(/[^0-9.]/g, '');

  const openAddDialog = () => {
    setIsEditMode(false);
    setCurrentProduct({ 
      id: '', name: '', brand: '', stock: '', unit: 'units', 
      categoryId: 'standard', mrp: '', actualPrice: '', 
      buyingPrice: '', warehouse: settings?.warehouses?.[0] || 'Main Warehouse' 
    });
    // DECOUPLING FIX: Micro-delay ensures UI cleans up before the modal portal opens.
    setTimeout(() => setIsDialogOpen(true), 150);
  };

  const openEditDialog = useCallback((p: Product) => {
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
      actualPrice: p.price.toString(),
      buyingPrice: (p.buyingPrice || 0).toString(),
      warehouse: p.warehouse || settings?.warehouses?.[0] || 'Main Warehouse'
    });
    // DECOUPLING FIX: Ensures DropdownMenu unmounts and releases focus management.
    setTimeout(() => setIsDialogOpen(true), 150);
  }, [settings]);

  const handleSaveProduct = async () => {
    const mrpNum = parseFloat(currentProduct.mrp);
    const priceNum = parseFloat(currentProduct.actualPrice);
    const buyingPriceNum = parseFloat(currentProduct.buyingPrice);

    if (!currentProduct.name || !currentProduct.stock || isNaN(mrpNum) || isNaN(priceNum) || isNaN(buyingPriceNum)) {
      toast({ title: "Required Data Missing", variant: "destructive" });
      return;
    }

    // MRP INTEGRITY GUARDRAILS
    if (priceNum > mrpNum) {
      toast({ title: "Pricing Anomaly", description: "Selling rate cannot exceed MRP.", variant: "destructive" });
      return;
    }
    if (buyingPriceNum > mrpNum) {
      toast({ title: "Financial Risk", description: "Buying price cannot exceed MRP.", variant: "destructive" });
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
      buyingPrice: buyingPriceNum,
      stock: parseInt(currentProduct.stock),
      unit: currentProduct.unit,
      warehouse: currentProduct.warehouse,
      status: parseInt(currentProduct.stock) === 0 ? 'Out of Stock' : parseInt(currentProduct.stock) < 10 ? 'Low' : 'In Stock',
      gst: `${categoryObj?.rate}%`
    };

    try {
      if (isEditMode) {
        await apiClient.inventory.update(productPayload);
      } else {
        await apiClient.inventory.create(productPayload);
      }
      toast({ title: "Operation Complete", description: "Asset specs synchronized." });
      setIsDialogOpen(false);
      loadInitialData();
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
      toast({ title: "Asset Terminated", description: "Removed from vault." });
    } catch (error) {
      toast({ title: "Termination Error", variant: "destructive" });
    }
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           p.warehouse?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilters.length === 0 || statusFilters.includes(p.status);
      return matchesSearch && matchesStatus;
    });
  }, [products, searchTerm, statusFilters]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20">
            <BoxSelect className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-black uppercase tracking-widest text-primary">Global Asset Matrix</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-black tracking-tight leading-none">Inventory <span className="text-muted-foreground/30 font-thin italic">Vault</span></h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 px-4 rounded-xl glass font-bold text-sm" onClick={loadInitialData}>
            <RefreshCcw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} /> Refresh
          </Button>
          <Button className="h-10 px-5 rounded-xl shadow-lg font-black text-sm gap-2" onClick={openAddDialog}>
            <Plus className="h-5 w-5" /> New Asset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Asset Classes', value: products.length, icon: Archive, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Low Liquidity', value: products.filter(p => p.status === 'Low').length, icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Exhaustion', value: products.filter(p => p.status === 'Out of Stock').length, icon: Scaling, color: 'text-destructive', bg: 'bg-destructive/10' },
          { label: 'Warehouses', value: new Set(products.map(p => p.warehouse)).size, icon: WarehouseIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="border-none glass-card shadow-sm p-5 flex items-center gap-4 rounded-2xl">
            <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center", stat.bg, stat.color)}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground leading-none">{stat.label}</p>
              <p className="text-xl font-black font-headline tracking-tighter mt-1.5">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="border-none glass-card shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="p-6 border-b border-primary/5 bg-primary/[0.02]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="relative flex-1 group max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input placeholder="Search Assets, IDs, or Warehouses..." className="pl-10 h-11 rounded-xl bg-secondary/30 border-none font-bold text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 px-5 rounded-xl glass font-black text-sm">
                  <Filter className="mr-2 h-4 w-4" /> Filter Matrix {statusFilters.length > 0 && `(${statusFilters.length})`}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass rounded-2xl p-2 border-none shadow-2xl">
                <DropdownMenuLabel className="text-[11px] uppercase font-black tracking-widest opacity-50 px-2 py-2">Availability State</DropdownMenuLabel>
                <DropdownMenuCheckboxItem checked={statusFilters.includes('In Stock')} onCheckedChange={() => toggleStatusFilter('In Stock')} className="rounded-xl font-bold text-sm py-2.5">Fully Stocked</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={statusFilters.includes('Low')} onCheckedChange={() => toggleStatusFilter('Low')} className="rounded-xl font-bold text-sm py-2.5">Low Inventory</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked={statusFilters.includes('Out of Stock')} onCheckedChange={() => toggleStatusFilter('Out of Stock')} className="rounded-xl font-bold text-sm py-2.5">Exhausted</DropdownMenuCheckboxItem>
                {statusFilters.length > 0 && <><DropdownMenuSeparator className="my-2"/><DropdownMenuItem onClick={() => setStatusFilters([])} className="rounded-xl font-black text-[11px] uppercase tracking-widest justify-center text-primary py-2.5">Clear Filters</DropdownMenuItem></>}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[1000px]">
            <Table>
              <TableHeader className="bg-primary/[0.01]">
                <TableRow className="border-none">
                  <TableHead className="py-6 pl-8 font-black uppercase text-[11px] tracking-widest">Asset Details</TableHead>
                  <TableHead className="font-black uppercase text-[11px] tracking-widest">Warehouse</TableHead>
                  <TableHead className="font-black uppercase text-[11px] tracking-widest">Buy (₹)</TableHead>
                  <TableHead className="font-black uppercase text-[11px] tracking-widest">Sell (₹)</TableHead>
                  <TableHead className="font-black uppercase text-[11px] tracking-widest">Volume</TableHead>
                  <TableHead className="font-black uppercase text-[11px] tracking-widest">GST</TableHead>
                  <TableHead className="font-black uppercase text-[11px] tracking-widest">Status</TableHead>
                  <TableHead className="pr-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow key="loading"><TableCell colSpan={8} className="py-24 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary opacity-30" /></TableCell></TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow key="empty"><TableCell colSpan={8} className="py-24 text-center font-bold text-muted-foreground italic text-sm">No assets recovered.</TableCell></TableRow>
                ) : filteredProducts.map((p, index) => (
                  <TableRow key={p.id || `legacy-item-${index}`} className="border-none hover:bg-primary/[0.04] transition-colors group">
                    <TableCell className="py-6 pl-8">
                      <div className="flex flex-col">
                        <span className="text-sm font-black tracking-tight">{p.name}</span>
                        <span className="text-[11px] font-black uppercase text-muted-foreground tracking-widest opacity-60 mt-1">{p.id} | {p.brand}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="rounded-md border-primary/20 text-primary font-black text-[11px] uppercase tracking-tighter px-2.5 py-0.5">{p.warehouse || 'Default'}</Badge></TableCell>
                    <TableCell className="font-bold text-sm">₹{(p.buyingPrice || 0).toLocaleString()}</TableCell>
                    <TableCell className="font-black text-sm">₹{p.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black tracking-tighter">{p.stock}</span>
                        <span className="text-[11px] font-black uppercase opacity-40">{p.unit}</span>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="font-black text-[11px] rounded-md px-2 py-0.5">{p.gst}</Badge></TableCell>
                    <TableCell>
                      <Badge className={cn(
                        "rounded-md px-3 py-1 text-[11px] font-black uppercase tracking-widest border-none text-white",
                        p.status === 'In Stock' ? 'bg-emerald-500 shadow-md shadow-emerald-500/20' : p.status === 'Low' ? 'bg-amber-500 shadow-md shadow-amber-500/20' : 'bg-destructive shadow-md shadow-destructive/20'
                      )}>{p.status}</Badge>
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/5"><MoreVertical className="h-5 w-5" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass rounded-2xl p-2 w-52 border-none shadow-2xl">
                          <DropdownMenuItem 
                            className="rounded-xl font-bold py-3 text-sm cursor-pointer" 
                            onSelect={(e) => { 
                              e.preventDefault(); 
                              openEditDialog(p); 
                            }}
                          >
                            <Edit2 className="h-4 w-4 mr-3" /> Modify Specs
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-2" />
                          <DropdownMenuItem className="rounded-xl font-black text-sm text-destructive py-3 cursor-pointer" onClick={() => handleDeleteProduct(p.id)}><Trash2 className="h-4 w-4 mr-3" /> Terminate Asset</DropdownMenuItem>
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
        <DialogContent className="max-w-[95vw] sm:max-w-[550px] rounded-3xl border-none glass p-0 overflow-hidden shadow-2xl">
          <DialogHeader className="p-6 bg-primary/5 border-b border-primary/5">
            <DialogTitle className="font-headline text-2xl font-black tracking-tight leading-none">
              {isEditMode ? 'Modify Asset Specs' : 'Register New Enterprise Asset'}
            </DialogTitle>
          </DialogHeader>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-[11px] uppercase font-black tracking-widest opacity-60">Asset Name*</Label>
                <Input className="h-11 rounded-xl bg-secondary/30 border-none font-bold text-sm" value={currentProduct.name} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] uppercase font-black tracking-widest opacity-60">Operational Warehouse*</Label>
                <Select value={currentProduct.warehouse} onValueChange={val => setCurrentProduct({...currentProduct, warehouse: val})}>
                  <SelectTrigger className="h-11 rounded-xl bg-secondary/30 border-none font-bold text-sm"><SelectValue placeholder="Select Warehouse" /></SelectTrigger>
                  <SelectContent className="glass border-none rounded-2xl p-2">
                    {(settings?.warehouses || ['Main Warehouse']).map(w => (
                      <SelectItem key={w} value={w} className="rounded-xl font-bold py-2.5 text-sm">{w}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-[11px] uppercase font-black tracking-widest opacity-60">Stock Volume*</Label>
                <div className="flex gap-3">
                  <Input className="h-11 rounded-xl bg-secondary/30 border-none font-bold text-sm flex-1" value={currentProduct.stock} onChange={e => setCurrentProduct({...currentProduct, stock: sanitizeNumeric(e.target.value)})} />
                  <Select value={currentProduct.unit} onValueChange={val => setCurrentProduct({...currentProduct, unit: val})}>
                    <SelectTrigger className="h-11 w-28 rounded-xl bg-secondary/30 border-none font-bold text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent className="glass border-none rounded-2xl p-2">
                      {UNITS.map(u => <SelectItem key={u.id} value={u.id} className="rounded-xl py-2 text-sm">{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] uppercase font-black tracking-widest opacity-60">Tax Bracket*</Label>
                <Select value={currentProduct.categoryId} onValueChange={val => setCurrentProduct({...currentProduct, categoryId: val})}>
                  <SelectTrigger className="h-11 rounded-xl bg-secondary/30 border-none font-bold text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent className="glass border-none rounded-2xl p-2">
                    {GST_CATEGORIES.map(c => <SelectItem key={c.id} value={c.id} className="rounded-xl py-2 text-sm">{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label className="text-[11px] uppercase font-black tracking-widest opacity-60">MRP Value*</Label>
                <Input className="h-11 rounded-xl bg-secondary/30 border-none font-bold text-sm" value={currentProduct.mrp} onChange={e => setCurrentProduct({...currentProduct, mrp: sanitizeNumeric(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] uppercase font-black tracking-widest opacity-60">Buying Rate*</Label>
                <Input className="h-11 rounded-xl bg-secondary/30 border-none font-bold text-sm" value={currentProduct.buyingPrice} onChange={e => setCurrentProduct({...currentProduct, buyingPrice: sanitizeNumeric(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[11px] uppercase font-black tracking-widest opacity-60">Selling Rate*</Label>
                <Input className="h-11 rounded-xl bg-secondary/30 border-none font-bold text-sm" value={currentProduct.actualPrice} onChange={e => setCurrentProduct({...currentProduct, actualPrice: sanitizeNumeric(e.target.value)})} />
              </div>
            </div>
          </div>
          <DialogFooter className="p-6 bg-primary/5 border-t border-primary/5 gap-4">
            <Button variant="ghost" className="rounded-2xl font-bold text-sm h-12 px-8" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button className="rounded-2xl h-12 px-10 font-black text-sm shadow-xl" onClick={handleSaveProduct} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />} Commit Specs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
