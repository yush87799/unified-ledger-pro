"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROLES, UserRole } from '@/lib/roles';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, Zap, ShieldCheck, Globe, Sun, Moon, Building2, Plus, LogIn, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import { useSession, signIn } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const MOCK_ORGS = [
  { id: 'org-1', name: 'Unified Ledger Pro PVT LTD' },
  { id: 'org-2', name: 'Acme Global Corp' },
  { id: 'org-3', name: 'Stark Industries' }
];

export default function LandingPage() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  
  // Super Admin specific state
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [isCreatingOrg, setIsCreatingOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [orgs, setOrgs] = useState(MOCK_ORGS);
  
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("owner");
  const [inviteOrgId, setInviteOrgId] = useState<string>("");
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Standard user redirect bypass
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role;
      if (role !== 'super_admin' && role !== 'owner') {
        router.push('/dashboard');
      }
    }
  }, [status, session, router]);

  const handleRoleSelect = (roleId: UserRole) => {
    localStorage.setItem('impersonated_role', roleId);
    localStorage.setItem('selected_org_id', selectedOrg || '');
    router.push('/dashboard');
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const handleCreateOrg = () => {
    if (!newOrgName.trim()) return;
    const newOrg = { id: `org-${Date.now()}`, name: newOrgName };
    setOrgs([...orgs, newOrg]);
    setSelectedOrg(newOrg.id);
    setIsCreatingOrg(false);
    setNewOrgName("");
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim() || !selectedOrg) return;
    setIsInviting(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole, orgId: selectedOrg })
      });
      toast({ title: 'Access Granted', description: `${inviteEmail} can now log in as ${inviteRole}.` });
      setInviteEmail('');
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to provision user.', variant: 'destructive' });
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden selection:bg-primary/30">
      {/* Floating Theme Toggle */}
      {mounted && (
        <div className="fixed top-4 right-4 sm:top-8 sm:right-8 z-50">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleTheme}
            className="h-10 w-10 sm:h-14 sm:w-14 rounded-2xl bg-background border-primary/20 shadow-2xl hover:bg-primary/5 transition-all group scale-90 sm:scale-100"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 group-hover:-rotate-12 transition-transform" />
            )}
          </Button>
        </div>
      )}

      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0" />
      <div className="absolute -top-24 -left-24 w-48 h-48 sm:w-96 sm:h-96 bg-primary/20 rounded-full blur-[80px] sm:blur-[120px] animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 sm:w-96 sm:h-96 bg-indigo-500/20 rounded-full blur-[80px] sm:blur-[120px] animate-pulse delay-1000" />

      <div className="max-w-6xl w-full text-center space-y-12 sm:space-y-20 relative z-10 py-12">
        <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-top-12 duration-1000">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass border-primary/20 mb-2">
            <Zap className="h-3 w-3 text-primary fill-primary" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-primary">Enterprise Financial Ecosystem</span>
          </div>
          
          <h1 className="font-headline text-4xl font-black tracking-tight sm:text-7xl lg:text-8xl text-foreground leading-[1.1] px-2">
            Unified Ledger <span className="text-gradient">Pro</span>
          </h1>
          
          <p className="text-sm sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium px-4">
            Synchronized inventory, intelligent billing, and global tax compliance 
            engineered for high-velocity organizations. Choose your portal to begin.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 opacity-60 px-4">
            <div className="flex items-center gap-2 font-bold"><ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /><span className="text-[10px] sm:text-xs tracking-widest uppercase text-foreground">Secured</span></div>
            <div className="flex items-center gap-2 font-bold"><Globe className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /><span className="text-[10px] sm:text-xs tracking-widest uppercase text-foreground">Compliant</span></div>
            <div className="flex items-center gap-2 font-bold"><Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /><span className="text-[10px] sm:text-xs tracking-widest uppercase text-foreground">Real-Time</span></div>
          </div>
        </div>

        <div className="min-h-[300px] flex flex-col items-center justify-center">
          {status === 'loading' && <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />}
          
          {status === 'unauthenticated' && (
            <Button 
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="h-14 px-8 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all duration-300"
            >
              <LogIn className="mr-3 h-5 w-5" /> Sign In securely via Google
            </Button>
          )}

          {status === 'authenticated' && ['super_admin', 'owner'].includes((session?.user as any)?.role) && (
            <div className="w-full animate-in fade-in zoom-in-95 duration-500 max-w-5xl mx-auto space-y-12">
              
              {/* OWNER DASHBOARD ENTRY */}
              {(session?.user as any)?.role === 'owner' && (
                <div className="flex flex-col items-center justify-center p-12 glass-card rounded-3xl border-primary/20 text-center shadow-2xl shadow-primary/5">
                  <Building2 className="h-16 w-16 text-primary mb-6" />
                  <h2 className="text-3xl font-black mb-3">Welcome to your workspace</h2>
                  <p className="text-muted-foreground mb-8 text-lg">Manage your inventory, intelligent billing, and tax compliance.</p>
                  <Button onClick={() => router.push('/dashboard')} className="h-14 px-10 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all duration-300">
                    Enter Dashboard <ArrowRight className="ml-3 h-5 w-5" />
                  </Button>
                </div>
              )}

              {/* SUPER ADMIN IMPERSONATION DASHBOARD */}
              {(session?.user as any)?.role === 'super_admin' && (
                <div className="space-y-6">
                  {!selectedOrg ? (
                    <div className="max-w-2xl mx-auto space-y-6">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                          <Building2 className="h-6 w-6 text-primary" /> Select Organization
                        </h2>
                        <Button onClick={() => setIsCreatingOrg(!isCreatingOrg)} variant={isCreatingOrg ? "outline" : "default"} size="sm" className="rounded-xl font-bold">
                          {isCreatingOrg ? 'Cancel' : <><Plus className="h-4 w-4 mr-2"/> New Org</>}
                        </Button>
                      </div>

                  {isCreatingOrg && (
                    <div className="flex gap-3 p-4 rounded-2xl glass-card animate-in slide-in-from-top-4">
                      <Input 
                        value={newOrgName}
                        onChange={(e) => setNewOrgName(e.target.value)}
                        placeholder="Enter organization name..." 
                        className="h-12 rounded-xl font-bold bg-background/50"
                        autoFocus
                      />
                      <Button onClick={handleCreateOrg} disabled={!newOrgName.trim()} className="h-12 px-6 rounded-xl font-bold">
                        Initialize
                      </Button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    {orgs.map((org) => (
                      <Card 
                        key={org.id} 
                        onClick={() => setSelectedOrg(org.id)}
                        className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all glass-card group"
                      >
                        <CardHeader className="p-5">
                          <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{org.name}</CardTitle>
                          <CardDescription className="text-xs uppercase tracking-widest font-black opacity-50 mt-1">ID: {org.id}</CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-10 animate-in slide-in-from-right-8 duration-500">
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-secondary/50 border border-border">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <span className="font-bold text-muted-foreground">Impersonating within:</span>
                    <span className="font-black text-foreground">{orgs.find(o => o.id === selectedOrg)?.name}</span>
                    <Button variant="link" onClick={() => setSelectedOrg(null)} className="h-auto p-0 ml-4 text-xs font-black text-primary">Change</Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 text-left px-4 sm:px-0">
                    {Object.values(ROLES).map((role, idx) => (
                      <Card 
                        key={role.id}
                        className="group cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl border-none glass-card animate-in fade-in slide-in-from-bottom-12 fill-mode-both overflow-hidden relative"
                        style={{ animationDelay: `${idx * 100}ms` }}
                        onClick={() => handleRoleSelect(role.id as UserRole)}
                      >
                        <div className={cn("absolute top-0 right-0 w-32 h-32 opacity-10 -mr-16 -mt-16 blur-2xl rounded-full", role.color)} />
                        <CardHeader className="space-y-6 sm:space-y-8 relative z-10 p-6 sm:p-8 pb-4">
                          <div className={cn(
                            "w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110",
                            role.color
                          )}>
                            <role.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                          </div>
                          <div className="space-y-2 sm:space-y-3">
                            <CardTitle className="font-headline text-2xl sm:text-3xl font-black tracking-tighter">{role.title}</CardTitle>
                            <CardDescription className="text-xs sm:text-base font-medium text-muted-foreground/80 leading-snug">
                              {role.description}
                            </CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6 sm:p-8 pt-4 relative z-10">
                          <div className="pt-4 sm:pt-6 border-t border-primary/10">
                            <div className="text-[10px] sm:text-sm font-black text-primary flex items-center gap-2 group-hover:gap-4 transition-all uppercase tracking-widest">
                              Enter Portal <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
                </div>
              )}

              {/* UNIVERSAL GRANT ACCESS PANEL */}
              <div className="p-6 sm:p-8 rounded-3xl glass-card border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent text-left animate-in fade-in slide-in-from-bottom-8">
                <h3 className="text-xl font-black flex items-center gap-3 mb-2"><UserPlus className="h-6 w-6 text-primary" /> Grant User Access</h3>
                <p className="text-sm text-muted-foreground mb-6 font-medium">Provision new team members into your organization instantly.</p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  {(session?.user as any)?.role === 'super_admin' && (
                    <select 
                      value={inviteOrgId} 
                      onChange={(e) => setInviteOrgId(e.target.value)} 
                      className="h-14 rounded-xl px-5 font-bold bg-background border border-input text-sm shadow-inner outline-none focus:ring-2 focus:ring-primary min-w-[200px]"
                    >
                      <option value="" disabled>Select Business...</option>
                      {orgs.map(o => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                  )}
                  <Input 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="User's Google Email address..." 
                    className="flex-1 h-14 rounded-xl font-medium bg-background shadow-inner"
                  />
                  <select 
                    value={inviteRole} 
                    onChange={(e) => setInviteRole(e.target.value)} 
                    className="h-14 rounded-xl px-5 font-bold bg-background border border-input text-sm shadow-inner outline-none focus:ring-2 focus:ring-primary"
                  >
                    {Object.values(ROLES).map(r => (
                      <option key={r.id} value={r.id}>{r.title}</option>
                    ))}
                  </select>
                  <Button onClick={handleInviteUser} disabled={isInviting || !inviteEmail || ((session?.user as any)?.role === 'super_admin' && !inviteOrgId)} className="h-14 px-8 rounded-xl font-black shadow-xl shadow-primary/20 hover:scale-105 transition-all whitespace-nowrap">
                    {isInviting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Authorize Access'}
                  </Button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}