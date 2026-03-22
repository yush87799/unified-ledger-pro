
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
import { Building2, ShieldCheck, Save, Loader2 } from 'lucide-react';
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
    stateCode: ""
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

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

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure your business profile and tax preferences.</p>
        </div>
        <Button className="rounded-full shadow-lg" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="business" className="gap-2 rounded-xl">
            <Building2 className="h-4 w-4" /> Business Profile
          </TabsTrigger>
          <TabsTrigger value="compliance" className="gap-2 rounded-xl">
            <ShieldCheck className="h-4 w-4" /> GST & Tax
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <Card className="border-none glass-card shadow-2xl rounded-[2rem]">
            <CardHeader className="p-8 border-b border-primary/5 bg-primary/[0.02]">
              <CardTitle className="font-headline">Organization Details</CardTitle>
              <CardDescription>Primary information used in invoices and reports.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest">Business Legal Name</Label>
                  <Input 
                    className="h-12 rounded-xl bg-secondary/50 border-none font-bold"
                    value={settings.businessName} 
                    onChange={e => setSettings({...settings, businessName: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest">Brand Display Name</Label>
                  <Input 
                    className="h-12 rounded-xl bg-secondary/50 border-none font-bold"
                    value={settings.brandName} 
                    onChange={e => setSettings({...settings, brandName: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest">Support Email</Label>
                  <Input 
                    className="h-12 rounded-xl bg-secondary/50 border-none font-bold"
                    type="email" 
                    value={settings.email} 
                    onChange={e => setSettings({...settings, email: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest">Phone Number</Label>
                  <Input 
                    className="h-12 rounded-xl bg-secondary/50 border-none font-bold"
                    value={settings.phone} 
                    onChange={e => setSettings({...settings, phone: e.target.value})} 
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest">Registered Office Address</Label>
                  <Input 
                    className="h-12 rounded-xl bg-secondary/50 border-none font-bold"
                    value={settings.address} 
                    onChange={e => setSettings({...settings, address: e.target.value})} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card className="border-none glass-card shadow-2xl rounded-[2rem]">
            <CardHeader className="p-8 border-b border-primary/5 bg-primary/[0.02]">
              <CardTitle className="font-headline">GST Configuration</CardTitle>
              <CardDescription>Configure your GSTIN and business state for tax calculation.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest">GSTIN Number</Label>
                  <Input 
                    className="h-12 rounded-xl bg-secondary/50 border-none font-bold uppercase"
                    value={settings.gstin} 
                    onChange={e => setSettings({...settings, gstin: e.target.value.toUpperCase()})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest">Business State (Registration)*</Label>
                  <Select 
                    value={settings.stateCode} 
                    onValueChange={val => setSettings({...settings, stateCode: val})}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-secondary/50 border-none font-bold">
                      <SelectValue placeholder="Select Business State" />
                    </SelectTrigger>
                    <SelectContent className="glass">
                      {INDIAN_STATES.map(state => (
                        <SelectItem key={state.code} value={state.code} className="rounded-xl font-bold">
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
