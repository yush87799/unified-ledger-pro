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
    <div className="space-y-8 sm:space-y-12 pb-24 sm:pb-32 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8">
        <div className="space-y-2">
          <h1 className="font-headline text-3xl sm:text-5xl font-black tracking-tighter">System <span className="text-muted-foreground/30 font-thin italic">Settings</span></h1>
          <p className="text-sm sm:text-lg text-muted-foreground font-medium">Configure your business profile and tax preferences for the global ledger.</p>
        </div>
        <Button className="h-12 sm:h-14 px-8 rounded-xl sm:rounded-2xl shadow-xl font-black text-base sm:text-lg w-full md:w-auto" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <Save className="mr-3 h-5 w-5" />}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="business" className="space-y-8">
        <TabsList className="bg-secondary/50 p-1 rounded-xl sm:rounded-2xl h-14 sm:h-16 w-full max-w-md glass">
          <TabsTrigger value="business" className="flex-1 rounded-lg sm:rounded-xl font-bold h-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
            <Building2 className="h-4 w-4" /> Business Profile
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex-1 rounded-lg sm:rounded-xl font-bold h-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
            <ShieldCheck className="h-4 w-4" /> GST & Tax
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-8">
          <Card className="border-none glass-card shadow-2xl rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-6 sm:p-10 border-b border-primary/5 bg-primary/[0.02]">
              <CardTitle className="font-headline text-xl sm:text-2xl font-black">Organization Details</CardTitle>
              <CardDescription className="text-xs sm:text-sm font-medium">Primary information used in official financial records.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-12 space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-2">
                  <Label className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-muted-foreground">Business Legal Name</Label>
                  <Input 
                    className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-secondary/50 border-none font-bold text-sm sm:text-base"
                    value={settings.businessName} 
                    onChange={e => setSettings({...settings, businessName: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-muted-foreground">Brand Display Name</Label>
                  <Input 
                    className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-secondary/50 border-none font-bold text-sm sm:text-base"
                    value={settings.brandName} 
                    onChange={e => setSettings({...settings, brandName: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-muted-foreground">Support Email</Label>
                  <Input 
                    className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-secondary/50 border-none font-bold text-sm sm:text-base"
                    type="email" 
                    value={settings.email} 
                    onChange={e => setSettings({...settings, email: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-muted-foreground">Phone Number</Label>
                  <Input 
                    className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-secondary/50 border-none font-bold text-sm sm:text-base"
                    value={settings.phone} 
                    onChange={e => setSettings({...settings, phone: e.target.value})} 
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-muted-foreground">Registered Office Address</Label>
                  <Input 
                    className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-secondary/50 border-none font-bold text-sm sm:text-base"
                    value={settings.address} 
                    onChange={e => setSettings({...settings, address: e.target.value})} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-8">
          <Card className="border-none glass-card shadow-2xl rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-6 sm:p-10 border-b border-primary/5 bg-primary/[0.02]">
              <CardTitle className="font-headline text-xl sm:text-2xl font-black">GST Configuration</CardTitle>
              <CardDescription className="text-xs sm:text-sm font-medium">Configure your GSTIN and jurisdictional business state.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-12 space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-2">
                  <Label className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-muted-foreground">GSTIN Number</Label>
                  <Input 
                    className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-secondary/50 border-none font-bold uppercase text-sm sm:text-base"
                    value={settings.gstin} 
                    onChange={e => setSettings({...settings, gstin: e.target.value.toUpperCase()})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] sm:text-[10px] uppercase font-black tracking-widest text-muted-foreground">Business State (Registration)*</Label>
                  <Select 
                    value={settings.stateCode} 
                    onValueChange={val => setSettings({...settings, stateCode: val})}
                  >
                    <SelectTrigger className="h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-secondary/50 border-none font-bold text-sm sm:text-base">
                      <SelectValue placeholder="Select Business State" />
                    </SelectTrigger>
                    <SelectContent className="glass rounded-2xl p-2">
                      {INDIAN_STATES.map(state => (
                        <SelectItem key={state.code} value={state.code} className="rounded-xl font-bold py-2 sm:py-3 text-sm">
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
