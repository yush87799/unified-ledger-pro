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
  Moon,
  Zap
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
import { cn } from '@/lib/utils';

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
      <div className="flex min-h-screen w-full bg-background selection:bg-primary/30">
        <Sidebar variant="inset" collapsible="icon" className="border-r-0 glass shadow-2xl z-50">
          <SidebarHeader className="h-24 flex items-center px-6">
            <div className="flex items-center gap-4 overflow-hidden group">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/40 group-hover:scale-105 transition-transform duration-500">
                <Boxes className="h-7 w-7" />
              </div>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="font-headline font-black text-xl tracking-tighter truncate leading-tight">
                  Unified Ledger
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-black">Edition</span>
                  <Zap className="h-2 w-2 text-primary fill-primary" />
                </div>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-4 py-4">
            <SidebarMenu className="space-y-2">
              {allowedMenuItems.map((item) => {
                const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "h-14 rounded-2xl px-5 transition-all duration-300",
                        isActive 
                          ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/30 scale-[1.02]" 
                          : "hover:bg-primary/10 hover:translate-x-1"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-muted-foreground")} />
                        <span className="font-bold text-sm tracking-tight">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-6">
            <div className="flex flex-col gap-3">
              <Button variant="ghost" className="justify-start h-11 rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/5">
                <HelpCircle className="h-5 w-5 mr-3" />
                <span className="group-data-[collapsible=icon]:hidden font-semibold">Concierge</span>
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start h-11 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span className="group-data-[collapsible=icon]:hidden font-semibold">Exit Session</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-background">
          <header className="sticky top-0 z-40 flex h-24 shrink-0 items-center justify-between gap-4 border-b/10 glass px-12 shadow-sm">
            <div className="flex items-center gap-8">
              <SidebarTrigger className="-ml-3 hover:bg-primary/10 rounded-2xl h-12 w-12 transition-colors" />
              <div className="hidden lg:flex relative group">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="search"
                  placeholder="Intelligence Search... (⌘K)"
                  className="w-96 bg-secondary/50 pl-12 h-12 rounded-2xl border-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-all font-medium text-sm"
                />
                <div className="absolute right-4 top-3.5 hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-lg border bg-background text-[10px] text-muted-foreground font-black tracking-tighter">
                  <Command className="h-3 w-3" /> K
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme}
                className="h-12 w-12 rounded-2xl hover:bg-primary/5 transition-all group"
              >
                {mounted && resolvedTheme === 'dark' ? (
                  <Sun className="h-6 w-6 text-amber-400 group-hover:rotate-45 transition-transform" />
                ) : (
                  <Moon className="h-6 w-6 text-slate-700 group-hover:-rotate-12 transition-transform" />
                )}
              </Button>

              <Button variant="ghost" size="icon" className="relative h-12 w-12 rounded-2xl hover:bg-primary/5">
                <Bell className="h-6 w-6 text-muted-foreground" />
                <span className="absolute top-3 right-3 flex h-3 w-3 rounded-full bg-primary ring-4 ring-background animate-pulse"></span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-4 p-1.5 pr-5 hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-primary/10">
                    <Avatar className="h-10 w-10 rounded-xl shadow-2xl">
                      <AvatarImage src={`https://picsum.photos/seed/${role}/200/200`} />
                      <AvatarFallback className="rounded-xl bg-primary text-primary-foreground font-black">
                        {role[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:flex flex-col items-start text-left">
                      <span className="text-sm font-black leading-none mb-1 tracking-tight">{roleConfig.title}</span>
                      <span className="text-[10px] uppercase font-black text-primary tracking-widest flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                        Online
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 rounded-3xl p-3 glass shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
                  <DropdownMenuLabel className="px-4 py-3 text-[10px] uppercase font-black text-muted-foreground tracking-widest">Enterprise Access</DropdownMenuLabel>
                  <DropdownMenuItem className="rounded-2xl px-4 py-3 cursor-pointer font-semibold focus:bg-primary/5">Organization Profile</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-2xl px-4 py-3 cursor-pointer font-semibold focus:bg-primary/5">Security Credentials</DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-2xl px-4 py-3 cursor-pointer text-destructive font-bold focus:bg-destructive/5">
                    <LogOut className="mr-3 h-4 w-4" />
                    Terminate Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-10 md:p-16 overflow-y-auto bg-[radial-gradient(circle_at_top_right,var(--primary),transparent)] bg-[length:400px_400px] bg-no-repeat bg-fixed">
            <div className="mx-auto max-w-[1400px] animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}