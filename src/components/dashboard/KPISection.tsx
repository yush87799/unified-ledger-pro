"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole, DashboardStats } from '@/lib/types';
import { 
  TrendingUp, 
  TrendingDown, 
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
  <Card className="overflow-hidden border-none shadow-md glass-card rounded-2xl group hover:scale-[1.03] transition-all">
    <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 p-6">
      <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
      <div className={cn("p-2.5 rounded-xl shadow-lg transition-transform group-hover:rotate-6", colorClass)}>
        {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 text-white" })}
      </div>
    </CardHeader>
    <CardContent className="p-6 pt-0">
      <div className="text-2xl sm:text-3xl font-black font-headline tracking-tighter">{value}</div>
      {trend && (
        <p className={cn(
          "text-xs mt-2.5 flex items-center gap-2 font-bold",
          trend.isUp ? 'text-emerald-500' : 'text-destructive'
        )}>
          {trend.isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {trend.value} <span className="text-muted-foreground opacity-60 font-medium">vs last cycle</span>
        </p>
      )}
    </CardContent>
  </Card>
);

export default function KPISection({ role, stats }: { role: UserRole; stats: DashboardStats | null }) {
  if (!stats) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-36 rounded-2xl bg-muted animate-pulse" />
      ))}
    </div>
  );

  const getKPIs = () => {
    switch (role) {
      case 'owner':
      case 'accountant':
        return [
          { 
            title: 'Gross Revenue', 
            value: `₹${stats.revenue.value.toLocaleString()}`, 
            trend: { value: `${stats.revenue.trend}%`, isUp: true }, 
            icon: <CreditCard />, 
            colorClass: 'bg-primary shadow-primary/20 shadow-lg' 
          },
          { 
            title: 'Operating Profit', 
            value: `₹${Math.round(stats.profit.value).toLocaleString()}`, 
            trend: { value: `${stats.profit.trend}%`, isUp: stats.profit.trend > 0 }, 
            icon: <TrendingUp />, 
            colorClass: 'bg-emerald-600 shadow-emerald-600/20 shadow-lg' 
          },
          { 
            title: 'Tax Liabilities', 
            value: `₹${Math.round(stats.tax.value).toLocaleString()}`, 
            icon: <Calculator />, 
            colorClass: 'bg-amber-500 shadow-amber-500/20 shadow-lg' 
          },
          { 
            title: 'Asset Base', 
            value: `₹${Math.round(stats.assets.value).toLocaleString()}`, 
            trend: { value: `${stats.assets.trend}%`, isUp: true }, 
            icon: <Package />, 
            colorClass: 'bg-blue-600 shadow-blue-600/20 shadow-lg' 
          },
        ];
      case 'inventory':
        return [
          { title: 'Asset Classes', value: '1,240', icon: <Package />, colorClass: 'bg-blue-600 shadow-blue-600/20 shadow-lg' },
          { title: 'Low Stock', value: '24', icon: <AlertTriangle />, colorClass: 'bg-amber-500 shadow-amber-500/20 shadow-lg' },
          { title: 'Out of Stock', value: '5', icon: <AlertTriangle />, colorClass: 'bg-destructive shadow-destructive/20 shadow-lg' },
          { title: 'Warehouse Health', value: 'Optimal', icon: <Activity />, colorClass: 'bg-emerald-600 shadow-emerald-600/20 shadow-lg' },
        ];
      default:
        return [
          { title: 'Session Active', value: 'Live Matrix', icon: <Activity />, colorClass: 'bg-primary shadow-primary/20 shadow-lg' },
        ];
    }
  };

  const kpis = getKPIs();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, idx) => (
        <KPICard key={idx} {...kpi} />
      ))}
    </div>
  );
}