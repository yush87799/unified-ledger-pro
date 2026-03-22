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
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
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
      <div className="flex min-h-screen w-full bg-background selection:bg-primary/30 font-body overflow-x-hidden">
        <Sidebar variant="inset" collapsible="icon" className="border-r-0 glass shadow-xl z-50">
          <SidebarHeader className="h-16 flex items-center px-4">
            <div className="flex items-center gap-3 overflow-hidden group">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg group-hover:scale-105 transition-transform">
                <Boxes className="h-6 w-6" />
              </div>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden leading-none">
                <span className="font-headline font-black text-lg tracking-tighter truncate text-foreground">
                  Unified Ledger
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] uppercase font-black tracking-widest text-primary">Pro Edition</span>
                </div>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-3 py-4">
            <SidebarMenu className="space-y-1.5">
              {allowedMenuItems.map((item) => {
                const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        "h-11 rounded-xl px-4 transition-all",
                        isActive 
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                          : "hover:bg-primary/10"
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

          <SidebarFooter className="p-4">
            <div className="flex flex-col gap-2">
              <Button variant="ghost" className="justify-start h-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 text-sm font-bold">
                <HelpCircle className="h-5 w-5 mr-3" />
                <span className="group-data-[collapsible=icon]:hidden">Concierge</span>
              </Button>
              <Button 
                variant="ghost" 
                className="justify-start h-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 text-sm font-black"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span className="group-data-[collapsible=icon]:hidden">Exit System</span>
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-background">
          <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-4 border-b glass px-6 shadow-sm">
            <div className="flex items-center gap-6">
              <SidebarTrigger className="hover:bg-primary/10 rounded-xl h-10 w-10 transition-colors" />
              <div className="hidden lg:flex relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary" />
                <Input
                  type="search"
                  placeholder="Intelligence Search Matrix..."
                  className="w-64 xl:w-80 bg-secondary/30 pl-10 h-10 rounded-xl border-none font-bold text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {mounted && (
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-10 w-10 rounded-xl hover:bg-primary/5">
                  {resolvedTheme === 'dark' ? <Sun className="h-6 w-6 text-amber-400" /> : <Moon className="h-6 w-6 text-indigo-600" />}
                </Button>
              )}
              <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-primary/5">
                <Bell className="h-6 w-6 text-muted-foreground" />
                <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background animate-pulse" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-3 p-1.5 hover:bg-primary/5 rounded-xl h-12">
                    <Avatar className="h-9 w-9 rounded-xl shadow-md overflow-hidden border border-border/50">
                      <AvatarImage src={`https://picsum.photos/seed/${role}/100/100`} />
                      <AvatarFallback className={cn("rounded-xl text-white font-black text-xs uppercase", roleConfig.color)}>
                        {role ? role[0] : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex flex-col items-start text-left leading-none">
                      <span className="text-sm font-black tracking-tight">{roleConfig.title}</span>
                      <span className="text-[10px] uppercase font-black text-primary tracking-widest flex items-center gap-1.5 mt-1.5">
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        Live Matrix
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 glass shadow-2xl border-none">
                  <DropdownMenuItem className="rounded-xl px-4 py-3 cursor-pointer text-sm font-bold">User Profile</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl px-4 py-3 cursor-pointer text-sm font-bold">System Diagnostics</DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem onClick={handleLogout} className="rounded-xl px-4 py-3 cursor-pointer text-sm text-destructive font-black">
                    <LogOut className="mr-3 h-5 w-5" /> Sign Out Matrix
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="mx-auto max-w-[1500px]">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
