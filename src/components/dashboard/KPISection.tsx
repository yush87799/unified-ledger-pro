
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
  <Card className="overflow-hidden border-none shadow-md glass-card rounded-xl group hover:scale-[1.02] transition-all">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4">
      <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
      <div className={cn("p-2 rounded-lg shadow-lg transition-transform group-hover:rotate-6", colorClass)}>
        {React.cloneElement(icon as React.ReactElement, { className: "h-4 w-4 text-white" })}
      </div>
    </CardHeader>
    <CardContent className="p-4 pt-0">
      <div className="text-xl sm:text-2xl font-black font-headline tracking-tighter">{value}</div>
      {trend && (
        <p className={cn(
          "text-[10px] mt-1.5 flex items-center gap-1.5 font-bold",
          trend.isUp ? 'text-emerald-500' : 'text-destructive'
        )}>
          {trend.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trend.value} <span className="text-muted-foreground opacity-60">vs last period</span>
        </p>
      )}
    </CardContent>
  </Card>
);

export default function KPISection({ role, stats }: { role: UserRole; stats: DashboardStats | null }) {
  if (!stats) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
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
            colorClass: 'bg-primary' 
          },
          { 
            title: 'Operating Profit', 
            value: `₹${Math.round(stats.profit.value).toLocaleString()}`, 
            trend: { value: `${stats.profit.trend}%`, isUp: stats.profit.trend > 0 }, 
            icon: <TrendingUp />, 
            colorClass: 'bg-emerald-600' 
          },
          { 
            title: 'Tax Liabilities', 
            value: `₹${Math.round(stats.tax.value).toLocaleString()}`, 
            icon: <Calculator />, 
            colorClass: 'bg-amber-500' 
          },
          { 
            title: 'Asset Base', 
            value: `₹${Math.round(stats.assets.value).toLocaleString()}`, 
            trend: { value: `${stats.assets.trend}%`, isUp: true }, 
            icon: <Package />, 
            colorClass: 'bg-blue-600' 
          },
        ];
      case 'inventory':
        return [
          { title: 'Asset Classes', value: '1,240', icon: <Package />, colorClass: 'bg-blue-600' },
          { title: 'Low Stock', value: '24', icon: <AlertTriangle />, colorClass: 'bg-amber-500' },
          { title: 'Out of Stock', value: '5', icon: <AlertTriangle />, colorClass: 'bg-destructive' },
          { title: 'Warehouse Health', value: 'Optimal', icon: <Activity />, colorClass: 'bg-emerald-600' },
        ];
      default:
        return [
          { title: 'Session Active', value: 'Live', icon: <Activity />, colorClass: 'bg-primary' },
        ];
    }
  };

  const kpis = getKPIs();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => (
        <KPICard key={idx} {...kpi} />
      ))}
    </div>
  );
}
