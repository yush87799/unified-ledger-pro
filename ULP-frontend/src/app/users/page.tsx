
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, MoreHorizontal, Mail, Shield, UserCheck } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

const users = [
  { id: 1, name: 'Vikram Singh', email: 'vikram@unifiedledger.pro', role: 'Business Owner', status: 'Active', avatar: '1' },
  { id: 2, name: 'Ananya Iyer', email: 'ananya@accountants.in', role: 'Accountant', status: 'Active', avatar: '2' },
  { id: 3, name: 'Rahul Sharma', email: 'rahul.s@warehouse.com', role: 'Inventory Staff', status: 'Away', avatar: '3' },
  { id: 4, name: 'Priya Verma', email: 'priya.v@billing.com', role: 'Billing Staff', status: 'Active', avatar: '4' },
  { id: 5, name: 'Sanjay Gupta', email: 'sanjay.g@admin.pro', role: 'Admin', status: 'Offline', avatar: '5' },
];

export default function UsersPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage your team and control access levels.</p>
        </div>
        <Button className="rounded-full shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> Invite User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Team', value: '12 Users', icon: Shield, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
          { label: 'Active Now', value: '8 Online', icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Pending Invites', value: '2 Pending', icon: Mail, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-card/50">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-2xl font-bold font-headline">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-none shadow-md overflow-hidden bg-card/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Team Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/10 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-background">
                        <AvatarImage src={`https://picsum.photos/seed/${user.avatar}/100/100`} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{user.role}</span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.status === 'Active' ? 'default' : 'secondary'}
                      className={`rounded-full px-3 py-0.5 text-[10px] uppercase tracking-wider font-bold ${
                        user.status === 'Active' ? 'bg-emerald-500 hover:bg-emerald-600' : ''
                      }`}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    Today, 10:45 AM
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                        <DropdownMenuItem>Permissions</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
