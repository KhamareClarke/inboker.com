'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCircle,
  BookOpen,
  Briefcase,
  Settings,
  LogOut,
  Sparkles,
  Palette,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/lib/providers/auth-provider';
import { useWorkspace } from '@/lib/providers/workspace-provider';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
  { name: 'Bookings', href: '/dashboard/bookings', icon: BookOpen },
  { name: 'CRM', href: '/dashboard/crm', icon: UserCircle },
  { name: 'Services', href: '/dashboard/services', icon: Briefcase },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Brand', href: '/dashboard/brand', icon: Palette },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const businessOwnerNavigation = [
  { name: 'Dashboard', href: '/dashboard/business-owner', icon: LayoutDashboard },
  { name: 'Services', href: '/dashboard/business-owner/services', icon: Briefcase },
  { name: 'Staff', href: '/dashboard/business-owner/staff', icon: Users },
  { name: 'Brand', href: '/dashboard/brand', icon: Palette },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut, role } = useAuth();
  const { workspace } = useWorkspace();
  
  // Only show sidebar for business owners and admins, not customers
  const isCustomer = role === 'customer';
  const isBusinessOwner = role === 'business_owner';
  
  // Filter navigation based on role
  const filteredNavigation = isCustomer ? [] : (isBusinessOwner ? businessOwnerNavigation : navigation);

  return (
    <div className="flex flex-col h-full w-64 border-r bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="p-6 border-b bg-gradient-to-r from-blue-50 via-cyan-50 to-indigo-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-indigo-950/30">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200 dark:border-blue-800 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Inboker
          </h1>
        </div>
        {workspace ? (
          <p className="text-sm text-muted-foreground ml-1">{workspace.name}</p>
        ) : (
          <p className="text-sm text-muted-foreground ml-1">AI Booking Platform</p>
        )}
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        {isCustomer ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <p className="text-sm text-muted-foreground">Customer Portal</p>
            <p className="text-xs text-muted-foreground mt-2">No navigation menu</p>
          </div>
        ) : (
          <nav className="space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-muted-foreground hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        )}
      </ScrollArea>

      <div className="p-3 border-t bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 transition-colors"
          size="sm"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
