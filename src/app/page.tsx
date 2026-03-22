"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ROLES, UserRole } from '@/lib/roles';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, Zap, ShieldCheck, Globe, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRoleSelect = (roleId: UserRole) => {
    localStorage.setItem('user_role', roleId);
    router.push('/dashboard');
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Floating Theme Toggle */}
      {mounted && (
        <div className="fixed top-4 right-4 sm:top-8 sm:right-8 z-50">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleTheme}
            className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-background border-primary/20 shadow-2xl hover:bg-primary/5 transition-all group"
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
          <div className="inline-flex items-center gap-3 px-4 sm:px-6 py-2 rounded-full glass border-primary/20 mb-2">
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-primary fill-primary" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary">Enterprise Financial Ecosystem</span>
          </div>
          
          <h1 className="font-headline text-4xl font-black tracking-tight sm:text-7xl lg:text-8xl text-foreground leading-[1.1]">
            Unified Ledger <span className="text-gradient">Pro</span>
          </h1>
          
          <p className="text-base sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium px-4">
            Synchronized inventory, intelligent billing, and global tax compliance 
            engineered for high-velocity organizations. Choose your portal to begin.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 opacity-60">
            <div className="flex items-center gap-2 font-bold"><ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /><span className="text-[10px] sm:text-xs tracking-widest uppercase">Secured</span></div>
            <div className="flex items-center gap-2 font-bold"><Globe className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /><span className="text-[10px] sm:text-xs tracking-widest uppercase">Compliant</span></div>
            <div className="flex items-center gap-2 font-bold"><Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /><span className="text-[10px] sm:text-xs tracking-widest uppercase">Real-Time</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 text-left px-4 sm:px-0">
          {Object.values(ROLES).map((role, idx) => (
            <Card 
              key={role.id}
              className="group cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl border-none glass-card animate-in fade-in slide-in-from-bottom-12 fill-mode-both overflow-hidden"
              style={{ animationDelay: `${idx * 100}ms` }}
              onClick={() => handleRoleSelect(role.id as UserRole)}
            >
              <CardHeader className="space-y-6 sm:space-y-8 relative z-10 p-6 sm:p-8 pb-4">
                <div className={cn(
                  "w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110",
                  role.color
                )}>
                  <role.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white fill-white/20" />
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <CardTitle className="font-headline text-2xl sm:text-3xl font-black tracking-tighter">{role.title}</CardTitle>
                  <CardDescription className="text-sm sm:text-base font-medium text-muted-foreground/80 leading-snug">
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
    </div>
  );
}
