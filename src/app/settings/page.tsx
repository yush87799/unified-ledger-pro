
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Building2, ShieldCheck, BellRing, Database, Save, Loader2 } from 'lucide-react';
import { INDIAN_STATES } from '@/lib/states';
import { toast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
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
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (err) {
      toast({ title: "Fetch Error", description: "Could not load settings.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        toast({ title: "Settings Saved", description: "Business profile updated successfully." });
      } else {
        throw new Error('Save failed');
      }
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
        <Button className="rounded-full" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="business" className="gap-2">
            <Building2 className="h-4 w-4" /> Business Profile
          </TabsTrigger>
          <TabsTrigger value="compliance" className="gap-2">
            <ShieldCheck className="h-4 w-4" /> GST & Tax
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="font-headline">Organization Details</CardTitle>
              <CardDescription>Primary information used in your invoices and reports.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Business Legal Name</Label>
                  <Input 
                    value={settings.businessName} 
                    onChange={e => setSettings({...settings, businessName: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Brand Display Name</Label>
                  <Input 
                    value={settings.brandName} 
                    onChange={e => setSettings({...settings, brandName: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input 
                    type="email" 
                    value={settings.email} 
                    onChange={e => setSettings({...settings, email: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input 
                    value={settings.phone} 
                    onChange={e => setSettings({...settings, phone: e.target.value})} 
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Registered Office Address</Label>
                  <Input 
                    value={settings.address} 
                    onChange={e => setSettings({...settings, address: e.target.value})} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="font-headline">GST Configuration</CardTitle>
              <CardDescription>Configure your GSTIN and business state for tax calculation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>GSTIN Number</Label>
                  <Input 
                    value={settings.gstin} 
                    className="uppercase" 
                    onChange={e => setSettings({...settings, gstin: e.target.value.toUpperCase()})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Business State (Registration)*</Label>
                  <Select 
                    value={settings.stateCode} 
                    onValueChange={val => setSettings({...settings, stateCode: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Business State" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map(state => (
                        <SelectItem key={state.code} value={state.code}>
                          {state.code} - {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground mt-1">Used to determine CGST/SGST vs IGST.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
