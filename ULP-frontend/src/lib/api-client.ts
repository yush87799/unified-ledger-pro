
import { Product, Invoice, BusinessSettings, DashboardStats } from './types';

export const apiClient = {
  inventory: {
    getAll: async (): Promise<Product[]> => {
      const res = await fetch('/api/inventory');
      if (!res.ok) throw new Error('Failed to fetch inventory');
      return res.json();
    },
    create: async (product: Product): Promise<Product> => {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error('Failed to save product');
      return res.json();
    },
    update: async (product: Product): Promise<Product> => {
      const res = await fetch('/api/inventory', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error('Failed to update product');
      return res.json();
    },
    delete: async (id: string): Promise<void> => {
      const res = await fetch(`/api/inventory?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete product');
    }
  },
  invoices: {
    getAll: async (): Promise<Invoice[]> => {
      const res = await fetch('/api/invoices');
      if (!res.ok) throw new Error('Failed to fetch invoices');
      return res.json();
    },
    create: async (invoice: Partial<Invoice>): Promise<Invoice> => {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice),
      });
      if (!res.ok) throw new Error('Failed to save invoice');
      return res.json();
    }
  },
  settings: {
    get: async (): Promise<BusinessSettings> => {
      const res = await fetch('/api/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    },
    update: async (settings: BusinessSettings): Promise<BusinessSettings> => {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      return res.json();
    }
  },
  dashboard: {
    getStats: async (): Promise<DashboardStats> => {
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
      return res.json();
    }
  },
  users: {
    getAll: async (): Promise<any[]> => {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
    create: async (userData: any): Promise<any> => {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!res.ok) throw new Error('Failed to create user');
      return res.json();
    }
  }
};
