
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Building2, ShieldCheck, Save, Loader2, Warehouse, Plus, Trash2 } from 'lucide-react';
import { INDIAN_STATES } from '@/lib/states';
import { toast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';
import { BusinessSettings } from '@/lib/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings>({
    businessName: "",
    brandName: "",
    email: "",
    phone: "",
    address: "",
    gstin: "",
    stateCode: "",
    warehouses: []
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await apiClient.settings.get();
      setSettings(data);
    } catch (err) {
      toast({ title: "Fetch Error", description: "Could not load settings.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.settings.update(settings);
      toast({ title: "Settings Saved", description: "Business profile updated successfully." });
    } catch (err) {
      toast({ title: "Save Error", description: "Failed to update settings.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const addWarehouse = () => {
    if (!newWarehouse.trim()) return;
    if (settings.warehouses.includes(newWarehouse.trim())) {
      toast({ title: "Registry Error", description: "Warehouse already exists.", variant: "destructive" });
      return;
    }
    setSettings({
      ...settings,
      warehouses: [...settings.warehouses, newWarehouse.trim()]
    });
    setNewWarehouse("");
  };

  const removeWarehouse = (name: string) => {
    setSettings({
      ...settings,
      warehouses: settings.warehouses.filter(w => w !== name)
    });
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 sm:space-y-8 pb-24 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="font-headline text-3xl sm:text-4xl font-black tracking-tighter">System <span className="text-muted-foreground/30 font-thin italic">Settings</span></h1>
          <p className="text-sm text-muted-foreground font-medium">Configure organization profile and operational matrix.</p>
        </div>
        <Button className="h-11 px-8 rounded-xl shadow-xl font-black text-sm w-full md:w-auto" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Commit Changes
        </Button>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="bg-secondary/50 p-1 rounded-xl h-12 w-full max-w-lg glass">
          <TabsTrigger value="business" className="flex-1 rounded-lg font-bold h-full gap-2 text-xs">
            <Building2 className="h-3.5 w-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="warehouses" className="flex-1 rounded-lg font-bold h-full gap-2 text-xs">
            <Warehouse className="h-3.5 w-3.5" /> Warehouses
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex-1 rounded-lg font-bold h-full gap-2 text-xs">
            <ShieldCheck className="h-3.5 w-3.5" /> GST & Tax
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-6">
          <Card className="border-none glass-card shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="p-6 border-b border-primary/5 bg-primary/[0.02]">
              <CardTitle className="font-headline text-lg font-black">Organization Specs</CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Legal Entity Name</Label>
                  <Input 
                    className="h-11 rounded-xl bg-secondary/30 border-none font-bold text-sm"
                    value={settings.businessName} 
                    onChange={e => setSettings({...settings, businessName: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Brand Display</Label>
                  <Input 
                    className="h-11 rounded-xl bg-secondary/30 border-none font-bold text-sm"
                    value={settings.brandName} 
                    onChange={e => setSettings({...settings, brandName: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Master Email</Label>
                  <Input 
                    className="h-11 rounded-xl bg-secondary/30 border-none font-bold text-sm"
                    type="email" 
                    value={settings.email} 
                    onChange={e => setSettings({...settings, email: e.target.value})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Contact Matrix</Label>
                  <Input 
                    className="h-11 rounded-xl bg-secondary/30 border-none font-bold text-sm"
                    value={settings.phone} 
                    onChange={e => setSettings({...settings, phone: e.target.value})} 
                  />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Primary HQ Address</Label>
                  <Input 
                    className="h-11 rounded-xl bg-secondary/30 border-none font-bold text-sm"
                    value={settings.address} 
                    onChange={e => setSettings({...settings, address: e.target.value})} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouses" className="space-y-6">
          <Card className="border-none glass-card shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="p-6 border-b border-primary/5 bg-primary/[0.02]">
              <CardTitle className="font-headline text-lg font-black">Warehouse Matrix</CardTitle>
              <CardDescription className="text-xs font-medium">Manage centralized storage and store locations.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-8">
              <div className="flex gap-3">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Add New Warehouse</Label>
                  <Input 
                    placeholder="Location Name (e.g. North Sector Hub)"
                    className="h-11 rounded-xl bg-secondary/30 border-none font-bold text-sm"
                    value={newWarehouse} 
                    onChange={e => setNewWarehouse(e.target.value)} 
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addWarehouse} className="h-11 rounded-xl px-6 font-black text-xs gap-2 shadow-lg">
                    <Plus className="h-4 w-4" /> Add to Matrix
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Active Locations</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {settings.warehouses.map((w, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-transparent hover:border-primary/20 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Warehouse className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-bold text-sm">{w}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeWarehouse(w)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {settings.warehouses.length === 0 && (
                    <p className="col-span-full text-center py-10 text-xs font-bold text-muted-foreground italic opacity-60">No warehouses registered.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card className="border-none glass-card shadow-lg rounded-2xl overflow-hidden">
            <CardHeader className="p-6 border-b border-primary/5 bg-primary/[0.02]">
              <CardTitle className="font-headline text-lg font-black">GST Configuration</CardTitle>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">GSTIN Matrix ID</Label>
                  <Input 
                    className="h-11 rounded-xl bg-secondary/30 border-none font-bold uppercase text-sm"
                    value={settings.gstin} 
                    onChange={e => setSettings({...settings, gstin: e.target.value.toUpperCase()})} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Jurisdiction State*</Label>
                  <Select 
                    value={settings.stateCode} 
                    onValueChange={val => setSettings({...settings, stateCode: val})}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-secondary/30 border-none font-bold text-sm">
                      <SelectValue placeholder="Select Area" />
                    </SelectTrigger>
                    <SelectContent className="glass rounded-2xl p-2">
                      {INDIAN_STATES.map(state => (
                        <SelectItem key={state.code} value={state.code} className="rounded-xl font-bold py-2.5 text-sm">
                          {state.code} - {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
