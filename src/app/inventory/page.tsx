"use client";

import React, { useState } from 'react';
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
  Package, 
  ArrowUpRight, 
  TrendingUp, 
  Save, 
  Copy,
  Tag,
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

// Common SI and Commercial Units
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

// GST Category Mapping
const GST_CATEGORIES = [
  { 
    id: 'exempt', 
    name: '0% (Exempt)', 
    rate: 0, 
    examples: 'Fresh fruits/vegetables, milk, bread, salt, life-saving medicines',
  },
  { 
    id: 'essential', 
    name: '5% (Mass Use/Essential)', 
    rate: 5, 
    examples: 'Packaged food, cooking oil, tea, spices, fertilizers',
  },
  { 
    id: 'standard', 
    name: '18% (Standard Rate)', 
    rate: 18, 
    examples: 'Electronics (TVs, laptops), refrigerators, telecom, banking',
  },
  { 
    id: 'luxury', 
    name: '40% (Luxury/Sin Goods)', 
    rate: 40, 
    examples: 'Luxury cars, motorcycles, personal aircraft, aerated drinks, tobacco',
  }
];

const initialProducts = [
  { 
    id: 'SKU-8271', 
    name: 'Ergonomic Office Chair', 
    brand: 'Featherlite',
    category: 'Standard Rate', 
    mrp: 18000, 
    price: 14999, 
    stock: 45, 
    unit: 'pcs',
    status: 'In Stock', 
    gst: '18%' 
  },
  { 
    id: 'SKU-1922', 
    name: 'Wireless Mechanical Keyboard', 
    brand: 'Logitech',
    category: 'Standard Rate', 
    mrp: 8999, 
    price: 7499, 
    stock: 12, 
    unit: 'pcs',
    status: 'Low', 
    gst: '18%' 
  },
  { 
    id: 'SKU-0032', 
    name: 'Organic Salt Packet', 
    brand: 'Tata',
    category: 'Exempt', 
    mrp: 45, 
    price: 45, 
    stock: 120, 
    unit: 'kg',
    status: 'In Stock', 
    gst: '0%' 
  },
];

export default function InventoryPage() {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    stock: '',
    unit: 'units',
    categoryId: '',
    mrp: '',
    actualPrice: ''
  });

  const [selectedGSTRate, setSelectedGSTRate] = useState<number | null>(null);

  const handlePriceInput = (value: string, field: 'mrp' | 'actualPrice') => {
    // Sanitize input: Allow only digits and a single dot. No signs or characters.
    const sanitized = value.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    // Ensure only one decimal point is allowed
    const finalValue = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : sanitized;
    setNewProduct({ ...newProduct, [field]: finalValue });
  };

  const handleCategoryChange = (val: string) => {
    const category = GST_CATEGORIES.find(c => c.id === val);
    setNewProduct({ ...newProduct, categoryId: val });
    setSelectedGSTRate(category ? category.rate : null);
  };

  const generateSKU = () => {
    return `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.stock || !newProduct.categoryId || !newProduct.mrp || !newProduct.actualPrice) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all mandatory details to add the product.",
        variant: "destructive"
      });
      return;
    }

    const mrpNum = parseFloat(newProduct.mrp) || 0;
    const priceNum = parseFloat(newProduct.actualPrice) || 0;

    // Validation: Actual Price cannot be greater than MRP
    if (priceNum > mrpNum) {
      toast({
        title: "Pricing Conflict",
        description: "Selling price cannot be greater than the Maximum Retail Price (MRP).",
        variant: "destructive"
      });
      return;
    }

    const categoryObj = GST_CATEGORIES.find(c => c.id === newProduct.categoryId);
    const stockNum = Math.max(0, parseInt(newProduct.stock) || 0);
    
    const productToAdd = {
      id: generateSKU(),
      name: newProduct.name,
      brand: newProduct.brand || 'Generic',
      category: categoryObj?.name.split(' (')[0] || 'Other',
      mrp: mrpNum,
      price: priceNum,
      stock: stockNum,
      unit: newProduct.unit,
      status: stockNum === 0 ? 'Out of Stock' : stockNum < 10 ? 'Low' : 'In Stock',
      gst: `${categoryObj?.rate}%`
    };

    setProducts([productToAdd, ...products]);
    setIsDialogOpen(false);
    setNewProduct({ name: '', brand: '', stock: '', unit: 'units', categoryId: '', mrp: '', actualPrice: '' });
    setSelectedGSTRate(null);
    
    toast({
      title: "Product Added",
      description: `${productToAdd.name} added to inventory. SKU: ${productToAdd.id}`,
    });
  };

  const calculateDiscount = () => {
    const mrp = parseFloat(newProduct.mrp);
    const price = parseFloat(newProduct.actualPrice);
    if (!mrp || !price || mrp <= 0) return null;
    
    const amount = mrp - price;
    const percentage = (amount / mrp) * 100;
    if (amount < 0) return null;
    return { amount, percentage };
  };

  const discount = calculateDiscount();

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Track stock levels, manage brands and auto-calculate GST/Discounts.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden sm:flex border-primary/20 hover:bg-primary/5">
            <TrendingUp className="mr-2 h-4 w-4 text-primary" /> AI Stock Predictor
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">Add New Product</DialogTitle>
                <DialogDescription>
                  Enter product details. Pricing and GST will be automatically computed.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-5 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name*</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Wireless Mouse" 
                    className="col-span-3" 
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="brand" className="text-right">Brand</Label>
                  <Input 
                    id="brand" 
                    placeholder="Brand name (optional)" 
                    className="col-span-3" 
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="mrp" className="text-right">MRP (₹)*</Label>
                  <Input 
                    id="mrp" 
                    placeholder="Max Retail Price" 
                    className="col-span-3" 
                    value={newProduct.mrp}
                    onChange={(e) => handlePriceInput(e.target.value, 'mrp')}
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="actualPrice" className="text-right">Selling Price*</Label>
                  <div className="col-span-3 flex gap-2">
                    <Input 
                      id="actualPrice" 
                      placeholder="Actual Selling Price" 
                      className="flex-1" 
                      value={newProduct.actualPrice}
                      onChange={(e) => handlePriceInput(e.target.value, 'actualPrice')}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      type="button"
                      onClick={() => setNewProduct({...newProduct, actualPrice: newProduct.mrp})}
                      className="text-[10px] h-10 px-2"
                    >
                      <Copy className="h-3 w-3 mr-1" /> Same as MRP
                    </Button>
                  </div>
                </div>

                {discount && discount.amount > 0 && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="col-start-2 col-span-3 flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded">
                        <Tag className="h-3 w-3" />
                        Save ₹{discount.amount.toLocaleString()} ({discount.percentage.toFixed(1)}% Off)
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">Stock Qty*</Label>
                  <div className="col-span-3 flex gap-2">
                    <Input 
                      id="stock" 
                      type="number" 
                      min="0"
                      placeholder="Qty" 
                      className="flex-1" 
                      value={newProduct.stock}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || parseInt(val) >= 0) {
                          setNewProduct({...newProduct, stock: val});
                        }
                      }}
                    />
                    <Select 
                      onValueChange={(val) => setNewProduct({...newProduct, unit: val})} 
                      value={newProduct.unit}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {UNITS.map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Category*</Label>
                  <Select onValueChange={handleCategoryChange} value={newProduct.categoryId}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select classification" />
                    </SelectTrigger>
                    <SelectContent>
                      {GST_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{cat.name}</span>
                            <span className="text-[10px] text-muted-foreground line-clamp-1">{cat.examples}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedGSTRate !== null && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right text-xs text-muted-foreground">Applied Tax</Label>
                    <div className="col-span-3 p-3 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-between">
                      <span className="text-xs font-medium">Applied GST Rate:</span>
                      <Badge variant="secondary" className="bg-primary text-primary-foreground text-[10px]">
                        {selectedGSTRate}%
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddProduct}>
                  <Save className="mr-2 h-4 w-4" /> Save Product
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-none shadow-sm bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl">
                <Package className="h-6 w-6 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total SKUs</p>
                <p className="text-2xl font-bold font-headline">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <ArrowUpRight className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold font-headline">
                  {products.filter(p => p.status === 'Low').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-destructive/10 rounded-xl">
                <Scaling className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
                <p className="text-2xl font-bold font-headline">
                  {products.filter(p => p.status === 'Out of Stock').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Top Brands</p>
                <p className="text-2xl font-bold font-headline">
                  {new Set(products.map(p => p.brand)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-card/50">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products, brands, SKU..." 
                className="pl-9 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-border">
                <Filter className="mr-2 h-4 w-4" /> Filters
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')}>Clear</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[120px]">SKU ID</TableHead>
                <TableHead>Product / Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price (Selling/MRP)</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>GST</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/10 transition-colors">
                  <TableCell className="font-mono text-xs font-semibold text-primary">{p.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{p.name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-tight">{p.brand}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{p.category}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">₹{p.price.toLocaleString()}</span>
                      {p.mrp > p.price && (
                        <span className="text-[10px] text-muted-foreground line-through decoration-destructive/50">
                          MRP: ₹{p.mrp.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{p.stock}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{p.unit}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 text-[10px]">
                      {p.gst}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={p.status === 'In Stock' ? 'default' : p.status === 'Low' ? 'secondary' : 'destructive'}
                      className="rounded-full px-2 py-0 text-[10px] font-bold"
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Details</DropdownMenuItem>
                        <DropdownMenuItem>Manage Stock</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete Product</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredProducts.length === 0 && (
            <div className="p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
