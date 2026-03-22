"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ROLES, UserRole } from '@/lib/roles';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Boxes, ArrowRight, Zap, ShieldCheck, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  const router = useRouter();

  const handleRoleSelect = (roleId: UserRole) => {
    localStorage.setItem('user_role', roleId);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] animate-pulse delay-1000" />

      <div className="max-w-6xl w-full text-center space-y-20 relative z-10">
        <div className="space-y-8 animate-in fade-in slide-in-from-top-12 duration-1000">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass border-primary/20 mb-4">
            <Zap className="h-4 w-4 text-primary fill-primary" />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Next-Gen Ledger System</span>
          </div>
          
          <h1 className="font-headline text-6xl font-black tracking-tight sm:text-8xl text-foreground">
            Unified Ledger <span className="text-gradient">Pro</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
            The definitive enterprise ecosystem for modern commerce. 
            Synchronized inventory, intelligent billing, and global tax compliance 
            engineered for high-scale organizations.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /><span className="text-sm font-bold">MIL-SPEC SECURITY</span></div>
            <div className="flex items-center gap-2"><Globe className="h-5 w-5" /><span className="text-sm font-bold">GLOBAL COMPLIANCE</span></div>
            <div className="flex items-center gap-2"><Zap className="h-5 w-5" /><span className="text-sm font-bold">REAL-TIME SYNC</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 text-left">
          {Object.values(ROLES).map((role, idx) => (
            <Card 
              key={role.id}
              className={`group cursor-pointer transition-all duration-700 hover:scale-[1.05] hover:shadow-[0_40px_100px_rgba(102,51,204,0.25)] border-none glass-card animate-in fade-in slide-in-from-bottom-12 fill-mode-both overflow-hidden`}
              style={{ animationDelay: `${idx * 100}ms` }}
              onClick={() => handleRoleSelect(role.id as UserRole)}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/20 transition-colors" />
              
              <CardHeader className="space-y-8 relative z-10 p-8 pb-4">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${role.color} text-white shadow-2xl transform transition-all duration-500 group-hover:rotate-12 group-hover:scale-110`}>
                  <role.icon className="h-8 w-8" />
                </div>
                <div className="space-y-3">
                  <CardTitle className="font-headline text-3xl font-black tracking-tighter">{role.title}</CardTitle>
                  <CardDescription className="text-lg leading-snug font-medium text-muted-foreground">
                    {role.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-4 relative z-10">
                <div className="pt-6 border-t border-primary/10">
                  <div className="text-sm font-black text-primary flex items-center gap-2 group-hover:gap-4 transition-all uppercase tracking-widest">
                    Launch Module <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="pt-12 animate-in fade-in duration-1000 delay-700">
          <div className="flex items-center justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all">
             <span className="text-2xl font-black font-headline">FORTUNE 500</span>
             <span className="text-2xl font-black font-headline">NASDAQ</span>
             <span className="text-2xl font-black font-headline">S&P 500</span>
          </div>
        </div>
      </div>
    </div>
  );
}