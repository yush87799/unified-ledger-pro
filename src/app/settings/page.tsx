"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Building2, ShieldCheck, BellRing, Database, Save } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure your business profile and preferences.</p>
        </div>
        <Button className="rounded-full">
          <Save className="mr-2 h-4 w-4" /> Save Changes
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
          <TabsTrigger value="notifications" className="gap-2">
            <BellRing className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="backup" className="gap-2">
            <Database className="h-4 w-4" /> Data & Backup
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
                  <Input defaultValue="Unified Ledger Pro PVT LTD" />
                </div>
                <div className="space-y-2">
                  <Label>Brand Display Name</Label>
                  <Input defaultValue="Unified Ledger" />
                </div>
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input type="email" defaultValue="hello@unifiedledger.pro" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input defaultValue="+91 98765 43210" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Registered Office Address</Label>
                  <Input defaultValue="Plot 45, Tech Park Phase 2, Bangalore, Karnataka - 560001" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="font-headline">GST Configuration</CardTitle>
              <CardDescription>Configure your GSTIN and regional tax settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>GSTIN Number</Label>
                  <Input defaultValue="29AAAAA0000A1Z5" className="uppercase" />
                </div>
                <div className="space-y-2">
                  <Label>State of Registration</Label>
                  <Input defaultValue="Karnataka (29)" />
                </div>
              </div>
              
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Calculate GST</Label>
                    <p className="text-sm text-muted-foreground">Automatically compute tax components on invoices.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Multi-State Billing</Label>
                    <p className="text-sm text-muted-foreground">Enable IGST calculation for interstate transactions.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="font-headline">Communication Preferences</CardTitle>
              <CardDescription>Manage how the system alerts you and your customers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">Notify inventory staff when items hit threshold.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Invoice Paid Notification</Label>
                    <p className="text-sm text-muted-foreground">Send receipt automatically to customers upon payment.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Daily Financial Summary</Label>
                    <p className="text-sm text-muted-foreground">Email a daily report to business owners.</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
