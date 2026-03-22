"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole } from '@/lib/roles';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  CreditCard, 
  Calculator, 
  AlertTriangle,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  icon: React.ReactNode;
  colorClass: string;
}

const KPICard = ({ title, value, trend, icon, colorClass }: KPICardProps) => (
  <Card className="overflow-hidden border-none shadow-md glass-card rounded-2xl group hover:scale-[1.02] transition-transform">
    <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 p-5">
      <CardTitle className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
      <div className={cn("p-2.5 rounded-xl shadow-lg transition-transform group-hover:rotate-6", colorClass)}>
        {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 text-white" })}
      </div>
    </CardHeader>
    <CardContent className="p-5 pt-0">
      <div className="text-2xl sm:text-3xl font-black font-headline tracking-tighter">{value}</div>
      {trend && (
        <p className={cn(
          "text-[10px] sm:text-[11px] mt-2 flex items-center gap-1.5 font-bold",
          trend.isUp ? 'text-emerald-500' : 'text-destructive'
        )}>
          {trend.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trend.value} <span className="text-muted-foreground opacity-60">vs last month</span>
        </p>
      )}
    </CardContent>
  </Card>
);

export default function KPISection({ role }: { role: UserRole }) {
  const getKPIs = () => {
    switch (role) {
      case 'owner':
        return [
          { title: 'Gross Revenue', value: '₹12,45,200', trend: { value: '12%', isUp: true }, icon: <CreditCard />, colorClass: 'bg-indigo-600' },
          { title: 'Operating Profit', value: '₹3,20,400', trend: { value: '2.1%', isUp: false }, icon: <TrendingUp />, colorClass: 'bg-emerald-600' },
          { title: 'Tax Liabilities', value: '₹1,52,300', icon: <Calculator />, colorClass: 'bg-amber-500' },
          { title: 'Asset Base', value: '₹48,90,500', trend: { value: '4.2%', isUp: true }, icon: <Package />, colorClass: 'bg-blue-600' },
        ];
      case 'inventory':
        return [
          { title: 'Active SKUs', value: '1,240', icon: <Package />, colorClass: 'bg-blue-600' },
          { title: 'Low Stock Alerts', value: '24', trend: { value: '8', isUp: true }, icon: <AlertTriangle />, colorClass: 'bg-amber-500' },
          { title: 'Out of Stock', value: '5', icon: <AlertTriangle />, colorClass: 'bg-destructive' },
          { title: 'Inbound Flow', value: '12 Items', icon: <TrendingUp />, colorClass: 'bg-emerald-600' },
        ];
      default:
        return [
          { title: 'Operations', value: 'Active', icon: <Activity />, colorClass: 'bg-indigo-600' },
        ];
    }
  };

  const kpis = getKPIs();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {kpis.map((kpi, idx) => (
        <KPICard key={idx} {...kpi} />
      ))}
    </div>
  );
}