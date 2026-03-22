
import { 
  LayoutDashboard, 
  Package, 
  ReceiptText, 
  FileCheck, 
  BarChart3, 
  Users, 
  Settings,
  LucideIcon,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Calculator,
  Boxes
} from 'lucide-react';

export type UserRole = 'owner' | 'admin' | 'billing' | 'accountant' | 'inventory';

export interface RoleConfig {
  id: UserRole;
  title: string;
  description: string;
  icon: LucideIcon;
  allowedMenus: string[];
  color: string;
}

export const ROLES: Record<UserRole, RoleConfig> = {
  owner: {
    id: 'owner',
    title: 'Business Owner',
    description: 'Full oversight of finances, sales, and growth insights.',
    icon: TrendingUp,
    allowedMenus: ['dashboard', 'inventory', 'billing', 'gst', 'analytics', 'users', 'settings'],
    color: 'bg-indigo-600'
  },
  admin: {
    id: 'admin',
    title: 'Admin',
    description: 'System configuration, user roles, and operational control.',
    icon: ShieldCheck,
    allowedMenus: ['dashboard', 'inventory', 'billing', 'users', 'settings'],
    color: 'bg-slate-600'
  },
  billing: {
    id: 'billing',
    title: 'Billing Staff',
    description: 'Invoicing, customer payments, and daily transaction tracking.',
    icon: CreditCard,
    allowedMenus: ['dashboard', 'billing'],
    color: 'bg-emerald-600'
  },
  accountant: {
    id: 'accountant',
    title: 'Accountant',
    description: 'GST compliance, tax reporting, and financial auditing.',
    icon: Calculator,
    allowedMenus: ['dashboard', 'gst', 'analytics'],
    color: 'bg-amber-500'
  },
  inventory: {
    id: 'inventory',
    title: 'Inventory Staff',
    description: 'Warehouse operations, stock levels, and supply chain updates.',
    icon: Boxes,
    allowedMenus: ['dashboard', 'inventory'],
    color: 'bg-blue-600'
  }
};

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

export const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'inventory', label: 'Inventory', icon: Package, href: '/inventory' },
  { id: 'billing', label: 'Billing / Invoices', icon: ReceiptText, href: '/billing' },
  { id: 'gst', label: 'GST & Reports', icon: FileCheck, href: '/gst' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { id: 'users', label: 'Users', icon: Users, href: '/users' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
];
