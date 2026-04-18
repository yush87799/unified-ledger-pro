"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Shield, Mail, Trash2, Loader2, Key, Users, Building2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';
import { useSession } from 'next-auth/react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: session } = useSession();
  const currentUserRole = (session?.user as any)?.role || 'owner';
  const currentUserOrg = (session?.user as any)?.orgId || 'default-org';

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'sales',
    orgId: ''
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await apiClient.users.getAll();
      // Enforce hierarchy visibility rules
      const filtered = currentUserRole === 'super_admin' 
        ? data 
        : (data || []).filter((u: any) => u.orgId === currentUserOrg && u.role !== 'super_admin');
      setUsers(filtered || []);
    } catch (error) {
      console.error("Failed to load users", error);
      toast({ title: "Sync Failure", description: "Could not fetch users from database.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast({ title: "Incomplete Data", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...newUser,
        orgId: currentUserRole === 'super_admin' ? newUser.orgId : currentUserOrg,
        createdAt: new Date().toISOString()
      };

      if (currentUserRole === 'super_admin' && !payload.orgId) {
        toast({ title: "Incomplete Data", description: "Organization ID is required.", variant: "destructive" });
        setIsSubmitting(false);
        return;
      }

      await apiClient.users.create(payload);
      toast({ title: "Access Granted", description: `${newUser.name} has been added successfully.` });
      setIsAddModalOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'sales', orgId: '' });
      loadUsers();
    } catch (error) {
      console.error("Failed to add user", error);
      toast({ title: "Operation Failed", description: "Could not add access. Ensure backend is running.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeAccess = async (userId: string) => {
    try {
      await apiClient.users.delete(userId);
      toast({ title: "Access Revoked", description: "User has been removed from the system." });
      loadUsers();
    } catch (error) {
      console.error("Failed to remove user", error);
      toast({ title: "Operation Failed", description: "Could not revoke access.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-black uppercase tracking-widest text-primary">Access Control</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-black tracking-tight leading-none">
            System <span className="text-muted-foreground/30 font-thin italic">Users</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-xl opacity-80">
            Manage platform access, roles, and administrative privileges.
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="h-10 rounded-xl font-black text-xs px-5 shadow-lg"
        >
          <UserPlus className="mr-2 h-4 w-4" /> Grant Access
        </Button>
      </div>

      <Card className="border-none glass-card shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className="p-5 border-b border-primary/5 bg-primary/[0.02]">
          <CardTitle className="font-headline text-base font-black flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" /> Active Personnel
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[800px]">
            <Table>
              <TableHeader className="bg-primary/[0.01]">
                <TableRow className="border-none">
                  <TableHead className="py-4 pl-7 font-black uppercase text-[11px] tracking-widest">User Entity</TableHead>
                  <TableHead className="font-black uppercase text-[11px] tracking-widest">Contact Matrix</TableHead>
                  <TableHead className="font-black uppercase text-[11px] tracking-widest">Authorization</TableHead>
                  <TableHead className="font-black uppercase text-[11px] tracking-widest">Organization</TableHead>
                  <TableHead className="font-black uppercase text-[11px] tracking-widest">Status</TableHead>
                  <TableHead className="text-right pr-7 font-black uppercase text-[11px] tracking-widest">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow key="loading">
                    <TableCell colSpan={6} className="text-center py-20">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-50" />
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-4">Loading Identities...</p>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow key="empty">
                    <TableCell colSpan={6} className="text-center py-20 text-sm font-bold text-muted-foreground italic">
                      No users found in the database.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id || user._id} className="border-none hover:bg-primary/[0.03] transition-colors">
                      <TableCell className="py-4 pl-7">
                        <div className="font-black tracking-tight text-sm">{user.name || 'Unnamed'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Mail className="h-3.5 w-3.5 opacity-50" /> {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md border-none ${
                          user.role === 'super_admin' ? 'bg-indigo-500/10 text-indigo-500' :
                          user.role === 'owner' ? 'bg-emerald-500/10 text-emerald-500' :
                          user.role === 'accountant' ? 'bg-blue-500/10 text-blue-500' :
                          user.role === 'inventory' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {user.role ? user.role.replace('_', ' ') : 'User'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          <Building2 className="h-3 w-3 opacity-50" /> {user.orgId || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
                      </TableCell>
                      <TableCell className="text-right pr-7">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleRevokeAccess(user.id || user._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[425px] glass border-none shadow-2xl rounded-3xl p-0 overflow-hidden">
          <div className="bg-primary/5 p-6 border-b border-primary/10">
            <DialogTitle className="font-headline font-black text-xl flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" /> Grant Access
            </DialogTitle>
            <DialogDescription className="text-xs font-medium opacity-70 mt-1">
              Create a new authorized identity in the system.
            </DialogDescription>
          </div>
          <form onSubmit={handleAddAccess} className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-[11px] uppercase font-black tracking-widest opacity-60">Full Name</Label>
              <Input 
                required 
                placeholder="e.g. Jane Doe" 
                className="h-10 rounded-xl bg-secondary/30 border-none font-bold text-sm"
                value={newUser.name}
                onChange={(e) => setNewUser({...newUser, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] uppercase font-black tracking-widest opacity-60">Email Matrix</Label>
              <Input 
                required 
                type="email" 
                placeholder="jane@example.com" 
                className="h-10 rounded-xl bg-secondary/30 border-none font-bold text-sm"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] uppercase font-black tracking-widest opacity-60">Passkey</Label>
              <Input 
                required 
                type="password" 
                placeholder="••••••••" 
                className="h-10 rounded-xl bg-secondary/30 border-none font-bold text-sm"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[11px] uppercase font-black tracking-widest opacity-60">Authorization Level</Label>
              <Select value={newUser.role} onValueChange={(val) => setNewUser({...newUser, role: val})}>
                <SelectTrigger className="h-10 rounded-xl bg-secondary/30 border-none font-bold text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass border-none rounded-2xl p-2">
                  {currentUserRole === 'super_admin' && (
                    <SelectItem value="owner" className="text-sm py-2.5 rounded-xl font-bold text-emerald-500">Business Owner</SelectItem>
                  )}
                  <SelectItem value="accountant" className="text-sm py-2.5 rounded-xl font-bold text-blue-500">Accountant</SelectItem>
                  <SelectItem value="inventory" className="text-sm py-2.5 rounded-xl font-bold text-amber-500">Inventory Manager</SelectItem>
                  <SelectItem value="sales" className="text-sm py-2.5 rounded-xl font-bold text-primary">Sales Representative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {currentUserRole === 'super_admin' && (
              <div className="space-y-2">
                <Label className="text-[11px] uppercase font-black tracking-widest opacity-60">Organization ID*</Label>
                <Input 
                  required 
                  placeholder="e.g. org-123" 
                  className="h-10 rounded-xl bg-secondary/30 border-none font-bold text-sm"
                  value={newUser.orgId}
                  onChange={(e) => setNewUser({...newUser, orgId: e.target.value})}
                />
              </div>
            )}
            <div className="pt-4 flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)} className="flex-1 rounded-xl font-black text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl font-black text-xs shadow-lg">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Access"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
