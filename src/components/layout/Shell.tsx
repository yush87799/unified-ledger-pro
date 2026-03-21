
"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarSeparator
} from '@/components/ui/sidebar';
import { 
  Bell, 
  Search, 
  Plus, 
  ChevronDown,
  LogOut,
  Boxes,
  HelpCircle,
  Command,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ROLES, MENU_ITEMS, UserRole } from '@/lib/roles';
import Link from 'next/link';
import { useTheme } from 'next-themes';

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedRole = localStorage.getItem('user_role') as UserRole;
    if (!savedRole && pathname !== '/') {
      router.push('/');
    } else {
      setRole(savedRole);
    }
  }, [pathname, router]);

  if (pathname === '/') return <>{children}</>;
  if (!role) return <div className="min-h-screen bg-background" />; 

  const roleConfig = ROLES[role];
  const allowedMenuItems = MENU_ITEMS.filter(item => roleConfig.allowedMenus.includes(item.id));

  const handleLogout = () => {
    localStorage.removeItem('user_role');
    router.push('/');
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background selection:bg-primary selection:text-primary-foreground">
        <Sidebar variant="inset" collapsible="icon" className="border-r-0 shadow-xl">
          <SidebarHeader className="h-20 flex items-center px-6">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                <Boxes className="h-6 w-6" />
              </div>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="font-headline font-bold text-lg tracking-tight truncate">
                  Unified Ledger
                </span>
                <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Pro Edition</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarSeparator className="opacity-50 mx-4" />
          <SidebarContent className="px-3">
            <SidebarMenu className="mt-6 space-y-1">
              {allowedMenuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard')}
                    tooltip={item.label}
                    className="h-12 rounded-xl px-4 transition-all hover:bg-sidebar-accent group-data-[active=true]:bg-primary group-data-[active=true]:text-primary-foreground group-data-[active=true]:shadow-lg group-data-[active=true]:shadow-primary/20"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span className="font-semibold text-sm tracking-wide">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-6">
            <div className="flex flex-col gap-2">
              <SidebarMenuButton className="h-10 text-muted-foreground hover:text-primary rounded-xl">
                <HelpCircle className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">Support Center</span>
              </SidebarMenuButton>
              <SidebarMenuButton 
                className="h-10 text-muted-foreground hover:text-destructive rounded-xl"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">Logout Account</span>
              </SidebarMenuButton>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-background/50">
          <header className="sticky top-0 z-40 flex h-20 shrink-0 items-center justify-between gap-4 border-b bg-card/60 backdrop-blur-xl px-8 shadow-sm">
            <div className="flex items-center gap-6">
              <SidebarTrigger className="-ml-3 hover:bg-muted/50 rounded-xl h-10 w-10" />
              <div className="hidden lg:flex relative max-w-md group">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="search"
                  placeholder="Quick search... (⌘K)"
                  className="w-80 bg-muted/30 pl-10 h-10 rounded-xl border-none ring-offset-background focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                />
                <div className="absolute right-3 top-2.5 hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border bg-background text-[10px] text-muted-foreground font-medium">
                  <Command className="h-2 w-2" /> K
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                className="h-10 w-10 rounded-xl hover:bg-muted/50 transition-all"
              >
                {mounted && resolvedTheme === 'dark' ? (
                  <Sun className="h-5 w-5 text-amber-400" />
                ) : (
                  <Moon className="h-5 w-5 text-slate-700" />
                )}
              </Button>

              <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-muted/50">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-2.5 right-2.5 flex h-2 w-2 rounded-full bg-primary ring-2 ring-card animate-pulse"></span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 p-1.5 pr-4 hover:bg-muted/50 rounded-xl transition-all border border-transparent hover:border-border">
                    <Avatar className="h-8 w-8 rounded-lg shadow-sm">
                      <AvatarImage src={`https://picsum.photos/seed/${role}/100/100`} />
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold">
                        {role[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:flex flex-col items-start text-left">
                      <span className="text-sm font-bold leading-none mb-1">{roleConfig.title}</span>
                      <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Active Now</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-xl p-2 shadow-2xl">
                  <DropdownMenuLabel className="px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground">Organization Control</DropdownMenuLabel>
                  <DropdownMenuItem className="rounded-lg px-3 py-2 cursor-pointer">Account Settings</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg px-3 py-2 cursor-pointer">Security Preferences</DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-lg px-3 py-2 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out Account
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-8 md:p-12 overflow-y-auto">
            <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
