
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
import { Plus, Search, Filter, MoreVertical, Package, ArrowUpRight, TrendingUp, Save } from 'lucide-react';
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

// GST Category Mapping based on user requirements
const GST_CATEGORIES = [
  { 
    id: 'exempt', 
    name: '0% (Exempt)', 
    rate: 0, 
    examples: 'Fresh fruits/vegetables, milk, bread, salt, life-saving medicines',
    items: ['Fresh Produce', 'Milk & Dairy (Fresh)', 'Bread & Bakery (Basic)', 'Salt', 'Life-saving Medicines', 'Educational Services']
  },
  { 
    id: 'essential', 
    name: '5% (Mass Use/Essential)', 
    rate: 5, 
    examples: 'Packaged food, cooking oil, tea, spices, fertilizers',
    items: ['Packaged Food', 'Cooking Oil', 'Tea & Coffee', 'Spices', 'Fertilizers', 'Basic Medicines']
  },
  { 
    id: 'standard', 
    name: '18% (Standard Rate)', 
    rate: 18, 
    examples: 'Electronics (TVs, laptops), refrigerators, telecom, banking',
    items: ['Electronics (Laptops/TVs)', 'Refrigerators', 'Telecom Services', 'Banking Services', 'Processed Food', 'Cement']
  },
  { 
    id: 'luxury', 
    name: '40% (Luxury/Sin Goods)', 
    rate: 40, 
    examples: 'Luxury cars, personal aircraft, aerated drinks, tobacco',
    items: ['Luxury Cars', 'Personal Aircraft', 'Aerated Drinks', 'Tobacco Products', 'Paan Masala']
  }
];

const initialProducts = [
  { id: 'SKU-8271', name: 'Ergonomic Office Chair', category: 'Standard Rate', price: '₹14,999', stock: 45, status: 'In Stock', gst: '18%' },
  { id: 'SKU-1922', name: 'Wireless Mechanical Keyboard', category: 'Standard Rate', price: '₹7,499', stock: 12, status: 'Low', gst: '18%' },
  { id: 'SKU-0032', name: 'Organic Salt Packet', category: 'Exempt', price: '₹45', stock: 120, status: 'In Stock', gst: '0%' },
  { id: 'SKU-4412', name: 'Premium Sports Sedan', category: 'Luxury/Sin Goods', price: '₹45,00,000', stock: 2, status: 'In Stock', gst: '40%' },
  { id: 'SKU-5521', name: 'Whole Wheat Bread', category: 'Exempt', price: '₹40', stock: 24, status: 'In Stock', gst: '0%' },
];

export default function InventoryPage() {
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    stock: '',
    categoryId: '',
    price: ''
  });

  const [selectedGSTRate, setSelectedGSTRate] = useState<number | null>(null);

  const handleCategoryChange = (val: string) => {
    const category = GST_CATEGORIES.find(c => c.id === val);
    setNewProduct({ ...newProduct, categoryId: val });
    setSelectedGSTRate(category ? category.rate : null);
  };

  const generateSKU = () => {
    return `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.stock || !newProduct.categoryId || !newProduct.price) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all details to add the product.",
        variant: "destructive"
      });
      return;
    }

    const categoryObj = GST_CATEGORIES.find(c => c.id === newProduct.categoryId);
    const stockNum = parseInt(newProduct.stock);
    
    const productToAdd = {
      id: generateSKU(),
      name: newProduct.name,
      category: categoryObj?.name.split(' (')[0] || 'Other',
      price: `₹${parseFloat(newProduct.price).toLocaleString()}`,
      stock: stockNum,
      status: stockNum === 0 ? 'Out of Stock' : stockNum < 10 ? 'Low' : 'In Stock',
      gst: `${categoryObj?.rate}%`
    };

    setProducts([productToAdd, ...products]);
    setIsDialogOpen(false);
    setNewProduct({ name: '', stock: '', categoryId: '', price: '' });
    setSelectedGSTRate(null);
    
    toast({
      title: "Product Added",
      description: `${productToAdd.name} has been added to your inventory with ${productToAdd.gst} GST rate.`,
    });
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">Track stock levels, manage products and auto-calculate GST.</p>
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
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="font-headline text-2xl">Add New Product</DialogTitle>
                <DialogDescription>
                  Enter product details. GST rate will be automatically assigned based on the chosen category.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Product name" 
                    className="col-span-3" 
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Price (₹)</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    placeholder="0.00" 
                    className="col-span-3" 
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">Initial Stock</Label>
                  <Input 
                    id="stock" 
                    type="number" 
                    placeholder="Quantity" 
                    className="col-span-3" 
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Category</Label>
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
                  <div className="col-span-4 p-3 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-between">
                    <span className="text-sm font-medium">Applied GST Rate:</span>
                    <Badge variant="secondary" className="bg-primary text-primary-foreground">
                      {selectedGSTRate}%
                    </Badge>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddProduct}>
                  <Save className="mr-2 h-4 w-4" /> Save Product
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
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
                <Package className="h-6 w-6 text-destructive" />
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
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-card/50">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search products, SKU..." 
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
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[120px]">SKU ID</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>GST %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/10 transition-colors">
                  <TableCell className="font-mono text-xs font-semibold text-primary">{p.id}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell className="font-semibold">{p.price}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">
                      {p.gst}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={p.status === 'In Stock' ? 'default' : p.status === 'Low' ? 'secondary' : 'destructive'}
                      className="rounded-full px-3 py-0.5"
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
                        <DropdownMenuItem>Add Stock</DropdownMenuItem>
                        <DropdownMenuItem>Stock History</DropdownMenuItem>
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
