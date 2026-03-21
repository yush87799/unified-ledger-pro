
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ROLES, UserRole } from '@/lib/roles';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Boxes, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const handleRoleSelect = (roleId: UserRole) => {
    localStorage.setItem('user_role', roleId);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="max-w-5xl w-full text-center space-y-16">
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="inline-flex items-center justify-center p-4 bg-primary rounded-2xl text-primary-foreground mb-4 shadow-2xl shadow-primary/30 scale-110">
            <Boxes className="h-12 w-12" />
          </div>
          <h1 className="font-headline text-5xl font-bold tracking-tight sm:text-7xl text-foreground">
            Unified Ledger <span className="text-primary">Pro</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Professional enterprise-grade ecosystem for inventory management, 
            automated billing, and seamless GST compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {Object.values(ROLES).map((role, idx) => (
            <Card 
              key={role.id}
              className={`group cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_20px_50px_rgba(102,51,204,0.15)] border-2 border-transparent bg-card/60 backdrop-blur-md animate-in fade-in slide-in-from-bottom-8 fill-mode-both`}
              style={{ animationDelay: `${idx * 150}ms` }}
              onClick={() => handleRoleSelect(role.id as UserRole)}
            >
              <CardHeader className="space-y-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${role.color} text-white shadow-xl shadow-inner transition-all group-hover:rotate-6 group-hover:scale-110`}>
                  <role.icon className="h-7 w-7" />
                </div>
                <div>
                  <CardTitle className="font-headline text-2xl mb-2">{role.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed line-clamp-2">
                    {role.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold text-primary flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                  Enter Dashboard <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="pt-12 animate-in fade-in duration-1000 delay-1000">
          <p className="text-sm text-muted-foreground uppercase tracking-[0.2em] font-bold">
            Secure • Scalable • Compliant
          </p>
        </div>
      </div>
    </div>
  );
}
