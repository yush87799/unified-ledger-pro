
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ROLES, UserRole } from '@/lib/roles';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Boxes } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();

  const handleRoleSelect = (roleId: UserRole) => {
    localStorage.setItem('user_role', roleId);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="max-w-4xl w-full text-center space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-primary rounded-2xl text-primary-foreground mb-4 shadow-xl shadow-primary/20 scale-110">
            <Boxes className="h-10 w-10" />
          </div>
          <h1 className="font-headline text-5xl font-bold tracking-tight sm:text-6xl text-foreground">
            Unified Ledger <span className="text-primary">Pro</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Professional enterprise-grade inventory, billing, and compliance management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {Object.values(ROLES).map((role) => (
            <Card 
              key={role.id}
              className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-primary/50 border-2 border-transparent bg-card/50 backdrop-blur-sm"
              onClick={() => handleRoleSelect(role.id as UserRole)}
            >
              <CardHeader className="space-y-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${role.color} text-white shadow-lg transition-transform group-hover:rotate-6`}>
                  <role.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="font-headline text-xl">{role.title}</CardTitle>
                  <CardDescription className="mt-2 line-clamp-2">
                    {role.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium text-primary inline-flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  Access Dashboard &rarr;
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-sm text-muted-foreground pt-8">
          Secure. Scalable. Simple. Designed for teams of all sizes.
        </p>
      </div>
    </div>
  );
}
