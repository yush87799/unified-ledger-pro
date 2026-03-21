
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
import { Plus, Search, Filter, MoreVertical, Package, ArrowUpRight, TrendingUp } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const initialProducts = [
  { id: 'SKU-001', name: 'Ergonomic Office Chair', category: 'Furniture', price: '₹14,999', stock: 45, status: 'In Stock', gst: '18%' },
  { id: 'SKU-002', name: 'Wireless Mechanical Keyboard', category: 'Electronics', price: '₹7,499', stock: 12, status: 'Low', gst: '18%' },
  { id: 'SKU-003', name: 'USB-C Fast Charger', category: 'Electronics', price: '₹1,999', stock: 120, status: 'In Stock', gst: '12%' },
  { id: 'SKU-004', name: 'Standing Desk Converter', category: 'Furniture', price: '₹12,400', stock: 0, status: 'Out of Stock', gst: '18%' },
  { id: 'SKU-005', name: 'Noise Cancelling Headphones', category: 'Audio', price: '₹19,999', stock: 24, status: 'In Stock', gst: '18%' },
  { id: 'SKU-006', name: 'Portable SSD 1TB', category: 'Storage', price: '₹8,999', stock: 8, status: 'Low', gst: '18%' },
];

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = initialProducts.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Track stock levels, manage products and locations.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden sm:flex">
            <TrendingUp className="mr-2 h-4 w-4" /> AI Stock Predictor
          </Button>
          <Button className="rounded-full">
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
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
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold font-headline">1,245</p>
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
                <p className="text-2xl font-bold font-headline">24</p>
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
                <p className="text-2xl font-bold font-headline">5</p>
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
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" /> Filters
              </Button>
              <Button variant="ghost" size="sm">Clear</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
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
                  <TableCell className="font-medium text-xs text-muted-foreground uppercase">{p.id}</TableCell>
                  <TableCell className="font-semibold">{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell>{p.price}</TableCell>
                  <TableCell>{p.stock}</TableCell>
                  <TableCell>{p.gst}</TableCell>
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
