
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
  AlertTriangle 
} from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  icon: React.ReactNode;
  color: string;
}

const KPICard = ({ title, value, trend, icon, color }: KPICardProps) => (
  <Card className="overflow-hidden border-none shadow-md bg-card/50 backdrop-blur-sm">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold font-headline">{value}</div>
      {trend && (
        <p className={`text-xs mt-1 flex items-center gap-1 ${trend.isUp ? 'text-emerald-500' : 'text-destructive'}`}>
          {trend.isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trend.value} <span className="text-muted-foreground ml-1">vs last month</span>
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
          { title: 'Total Sales', value: '₹12,45,200', trend: { value: '12%', isUp: true }, icon: <CreditCard className="h-4 w-4 text-indigo-500" />, color: 'bg-indigo-500' },
          { title: 'Revenue', value: '₹8,90,500', trend: { value: '8.4%', isUp: true }, icon: <TrendingUp className="h-4 w-4 text-emerald-500" />, color: 'bg-emerald-500' },
          { title: 'Profit', value: '₹3,20,400', trend: { value: '2.1%', isUp: false }, icon: <TrendingUp className="h-4 w-4 text-blue-500" />, color: 'bg-blue-500' },
          { title: 'GST Collected', value: '₹1,52,300', icon: <Calculator className="h-4 w-4 text-amber-500" />, color: 'bg-amber-500' },
        ];
      case 'admin':
        return [
          { title: 'Total Users', value: '48', trend: { value: '4', isUp: true }, icon: <Users className="h-4 w-4 text-indigo-500" />, color: 'bg-indigo-500' },
          { title: 'Active Sessions', value: '12', icon: <TrendingUp className="h-4 w-4 text-emerald-500" />, color: 'bg-emerald-500' },
          { title: 'Total Products', value: '1,240', trend: { value: '12', isUp: true }, icon: <Package className="h-4 w-4 text-blue-500" />, color: 'bg-blue-500' },
          { title: 'System Load', value: '14%', trend: { value: '2%', isUp: false }, icon: <TrendingUp className="h-4 w-4 text-amber-500" />, color: 'bg-amber-500' },
        ];
      case 'billing':
        return [
          { title: 'Invoices Today', value: '24', trend: { value: '5', isUp: true }, icon: <CreditCard className="h-4 w-4 text-indigo-500" />, color: 'bg-indigo-500' },
          { title: 'Sales Volume', value: '₹45,000', trend: { value: '12%', isUp: true }, icon: <TrendingUp className="h-4 w-4 text-emerald-500" />, color: 'bg-emerald-500' },
          { title: 'Pending Payments', value: '₹12,400', trend: { value: '₹2k', isUp: false }, icon: <AlertTriangle className="h-4 w-4 text-amber-500" />, color: 'bg-amber-500' },
          { title: 'Customers', value: '12', icon: <Users className="h-4 w-4 text-blue-500" />, color: 'bg-blue-500' },
        ];
      case 'accountant':
        return [
          { title: 'CGST', value: '₹76,150', icon: <Calculator className="h-4 w-4 text-indigo-500" />, color: 'bg-indigo-500' },
          { title: 'SGST', value: '₹76,150', icon: <Calculator className="h-4 w-4 text-emerald-500" />, color: 'bg-emerald-500' },
          { title: 'IGST', value: '₹22,400', icon: <Calculator className="h-4 w-4 text-blue-500" />, color: 'bg-blue-500' },
          { title: 'Total Tax', value: '₹1,74,700', icon: <Calculator className="h-4 w-4 text-amber-500" />, color: 'bg-amber-500' },
        ];
      case 'inventory':
        return [
          { title: 'Total SKUs', value: '1,240', icon: <Package className="h-4 w-4 text-indigo-500" />, color: 'bg-indigo-500' },
          { title: 'Low Stock', value: '24', trend: { value: '8', isUp: true }, icon: <AlertTriangle className="h-4 w-4 text-destructive" />, color: 'bg-destructive' },
          { title: 'Out of Stock', value: '5', icon: <AlertTriangle className="h-4 w-4 text-destructive" />, color: 'bg-destructive' },
          { title: 'New Stock', value: '12', icon: <TrendingUp className="h-4 w-4 text-emerald-500" />, color: 'bg-emerald-500' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {getKPIs().map((kpi, idx) => (
        <KPICard key={idx} {...kpi} />
      ))}
    </div>
  );
}
