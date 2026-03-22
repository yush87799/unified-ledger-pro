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
  SidebarInset
} from '@/components/ui/sidebar';
import { 
  Bell, 
  Search, 
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
          <SidebarHeader className="h-20 sm:h-24 flex items-center px-4 sm:px-6">
            <div className="flex items-center gap-3 sm:gap-4 overflow-hidden group">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/40 group-hover:scale-105 transition-transform duration-500">
                <Boxes className="h-5 w-5 sm:h-7 sm:w-7" />
              </div>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="font-headline font-black text-lg sm:text-xl tracking-tighter truncate leading-tight text-foreground">
                  Unified Ledger
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-primary font-black">Edition</span>
                  <Zap className="h-2 w-2 text-primary fill-primary" />
                </div>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-3 sm:px-4 py-4">
            <SidebarMenu className="space-y-1.5 sm:space-y-2">
              {allowedMenuItems.map((item) => {
                const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "h-12 sm:h-14 rounded-2xl px-4 sm:px-5 transition-all duration-300",
                        isActive 
                          ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/30 scale-[1.02]" 
                          : "hover:bg-primary/10 hover:translate-x-1"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className={cn("h-4 w-4 sm:h-5 sm:w-5", isActive ? "text-white" : "text-muted-foreground")} />
                        <span className="font-bold text-xs sm:text-sm tracking-tight">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 sm:p-6">
            <div className="flex flex-col gap-2 sm:gap-3">
              <Button variant="ghost" className="justify-start h-10 sm:h-11 rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/5">
                <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                <span className="group-data-[collapsible=icon]:hidden font-semibold text-xs sm:text-sm">Concierge</span>
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start h-10 sm:h-11 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-3" />
                <span className="group-data-[collapsible=icon]:hidden font-semibold text-xs sm:text-sm">Exit Session</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-background">
          <header className="sticky top-0 z-40 flex h-16 sm:h-24 shrink-0 items-center justify-between gap-4 border-b/10 glass px-4 sm:px-12 shadow-sm">
            <div className="flex items-center gap-3 sm:gap-8">
              <SidebarTrigger className="-ml-2 hover:bg-primary/10 rounded-xl sm:rounded-2xl h-10 w-10 sm:h-12 sm:w-12 transition-colors" />
              <div className="hidden lg:flex relative group">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="search"
                  placeholder="Intelligence Search... (⌘K)"
                  className="w-64 xl:w-96 bg-secondary/50 pl-12 h-12 rounded-2xl border-none focus-visible:ring-2 focus-visible:ring-primary/30 transition-all font-medium text-sm"
                />
                <div className="absolute right-4 top-3.5 hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-lg border bg-background text-[10px] text-muted-foreground font-black tracking-tighter">
                  <Command className="h-3 w-3" /> K
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-6">
              {mounted && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleTheme}
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl hover:bg-primary/5 transition-all group"
                >
                  {resolvedTheme === 'dark' ? (
                    <Sun className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 group-hover:rotate-45 transition-transform" />
                  ) : (
                    <Moon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 group-hover:-rotate-12 transition-transform" />
                  )}
                </Button>
              )}

              <Button variant="ghost" size="icon" className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl hover:bg-primary/5">
                <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                <span className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 flex h-2.5 w-2.5 rounded-full bg-primary ring-2 sm:ring-4 ring-background animate-pulse"></span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 sm:gap-4 p-1 sm:p-1.5 sm:pr-5 hover:bg-primary/5 rounded-xl sm:rounded-2xl transition-all border border-transparent hover:border-primary/10">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl shadow-2xl">
                      <AvatarImage src={`https://picsum.photos/seed/${role}/200/200`} />
                      <AvatarFallback className={cn("rounded-lg sm:rounded-xl text-white font-black text-xs sm:text-sm", roleConfig.color)}>
                        {role[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex flex-col items-start text-left">
                      <span className="text-xs sm:text-sm font-black leading-none mb-1 tracking-tight text-foreground">{roleConfig.title}</span>
                      <span className="text-[8px] sm:text-[10px] uppercase font-black text-primary tracking-widest flex items-center gap-1">
                        <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-primary animate-pulse" />
                        Online
                      </span>
                    </div>
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 sm:w-72 rounded-2xl sm:rounded-3xl p-2 sm:p-3 glass shadow-2xl">
                  <DropdownMenuLabel className="px-4 py-2 sm:py-3 text-[9px] sm:text-[10px] uppercase font-black text-muted-foreground tracking-widest">Enterprise Access</DropdownMenuLabel>
                  <DropdownMenuItem className="rounded-xl sm:rounded-2xl px-4 py-2 sm:py-3 cursor-pointer text-xs sm:text-sm font-semibold focus:bg-primary/5">Organization Profile</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl sm:rounded-2xl px-4 py-2 sm:py-3 cursor-pointer text-xs sm:text-sm font-semibold focus:bg-primary/5">Security Credentials</DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 sm:my-2" />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-xl sm:rounded-2xl px-4 py-2 sm:py-3 cursor-pointer text-xs sm:text-sm text-destructive font-bold focus:bg-destructive/5">
                    <LogOut className="mr-3 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Terminate Session
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-10 md:p-16 overflow-y-auto bg-[radial-gradient(circle_at_top_right,var(--primary),transparent)] bg-[length:200px_200px] sm:bg-[length:400px_400px] bg-no-repeat bg-fixed">
            <div className="mx-auto max-w-[1400px] animate-in fade-in slide-in-from-bottom-6 duration-1000 fill-mode-both">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
