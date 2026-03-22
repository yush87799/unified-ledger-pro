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
  Zap,
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
      <div className="flex min-h-screen w-full bg-background selection:bg-primary/30 font-body">
        <Sidebar variant="inset" collapsible="icon" className="border-r-0 glass shadow-2xl z-50">
          <SidebarHeader className="h-16 flex items-center px-4">
            <div className="flex items-center gap-2 overflow-hidden group">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg group-hover:scale-105 transition-transform">
                <Boxes className="h-4 w-4" />
              </div>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden leading-none">
                <span className="font-headline font-black text-base tracking-tighter truncate text-foreground">
                  Unified Ledger
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-black">Pro Edition</span>
                  <Zap className="h-2.5 w-2.5 text-primary fill-primary" />
                </div>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-2 py-2">
            <SidebarMenu className="space-y-0.5">
              {allowedMenuItems.map((item) => {
                const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "h-10 rounded-xl px-3 transition-all",
                        isActive 
                          ? "bg-primary text-primary-foreground shadow-md" 
                          : "hover:bg-primary/10"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className={cn("h-4 w-4", isActive ? "text-white" : "text-muted-foreground")} />
                        <span className="font-bold text-sm tracking-tight">{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3">
            <div className="flex flex-col gap-1">
              <Button variant="ghost" className="justify-start h-9 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 text-xs font-semibold">
                <HelpCircle className="h-4 w-4 mr-2" />
                <span className="group-data-[collapsible=icon]:hidden">Concierge</span>
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start h-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 text-xs font-bold"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="group-data-[collapsible=icon]:hidden">Exit Session</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-background">
          <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-4 border-b glass px-4 sm:px-6 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-primary/10 rounded-lg h-9 w-9 transition-colors" />
              <div className="hidden lg:flex relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary" />
                <Input
                  type="search"
                  placeholder="Intelligence Search..."
                  className="w-48 xl:w-64 bg-secondary/50 pl-9 h-9 rounded-lg border-none font-medium text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {mounted && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleTheme}
                  className="h-9 w-9 rounded-lg hover:bg-primary/5"
                >
                  {resolvedTheme === 'dark' ? (
                    <Sun className="h-4 w-4 text-amber-400" />
                  ) : (
                    <Moon className="h-4 w-4 text-indigo-600" />
                  )}
                </Button>
              )}

              <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg hover:bg-primary/5">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-primary ring-1 ring-background animate-pulse" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 p-1 sm:pr-2 hover:bg-primary/5 rounded-lg h-10">
                    <Avatar className="h-8 w-8 rounded-lg shadow-sm overflow-hidden">
                      <AvatarImage src={`https://picsum.photos/seed/${role}/100/100`} />
                      <AvatarFallback className={cn("rounded-lg text-white font-black text-xs uppercase", roleConfig.color)}>
                        {role ? role[0] : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex flex-col items-start text-left leading-tight">
                      <span className="text-xs font-black tracking-tight">{roleConfig.title}</span>
                      <span className="text-[10px] uppercase font-black text-primary tracking-widest flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        Live
                      </span>
                    </div>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2 glass shadow-xl border-none">
                  <DropdownMenuItem className="rounded-lg px-3 py-2 cursor-pointer text-sm font-semibold">Profile</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg px-3 py-2 cursor-pointer text-sm font-semibold">Security</DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1" />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-lg px-3 py-2 cursor-pointer text-sm text-destructive font-bold">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <div className="mx-auto max-w-[1400px]">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}