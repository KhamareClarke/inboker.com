'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Users,
  UserCircle,
  BookOpen,
  Briefcase,
  Settings,
  LogOut,
  Palette,
  CreditCard,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/lib/providers/auth-provider';
import { useWorkspace } from '@/lib/providers/workspace-provider';

const businessOwnerNavigation = [
  { name: 'Dashboard', href: '/dashboard/business-owner', icon: LayoutDashboard },
  { name: 'Bookings', href: '/dashboard/bookings', icon: BookOpen },
  { name: 'Calendar', href: '/dashboard/calendar', icon: CalendarIcon },
  { name: 'Services', href: '/dashboard/business-owner/services', icon: Briefcase },
  { name: 'Staff', href: '/dashboard/business-owner/staff', icon: Users },
  { name: 'CRM', href: '/dashboard/crm', icon: UserCircle },
  { name: 'Brand', href: '/dashboard/brand', icon: Palette },
  { name: 'Billing', href: '/dashboard/business-owner/billing', icon: CreditCard },
  { name: 'Security', href: '/dashboard/security', icon: Shield },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const adminNavigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { signOut, role, user, profile } = useAuth();
  const { workspace } = useWorkspace();

  const isAdmin = role === 'admin';
  const filteredNavigation = isAdmin ? adminNavigation : businessOwnerNavigation;

  const displayName = profile?.full_name || user?.email || 'Account';
  const initials = (profile?.full_name || user?.email || 'U')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col h-full w-64 bg-white border-r border-gray-100">

      {/* Logo */}
      <div className="flex items-center gap-2.5 h-16 px-5 border-b border-gray-100 shrink-0">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 group-hover:bg-blue-500 transition-colors shrink-0">
            <CalendarIcon className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-display text-[16px] font-bold text-gray-900">Inboker</span>
        </Link>
      </div>

      {/* Workspace name */}
      {workspace?.name && (
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Workspace</p>
          <p className="text-[13px] font-semibold text-gray-800 truncate">{workspace.name}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition-all',
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User + sign out */}
      <div className="border-t border-gray-100 p-3 shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold shrink-0">
            {initials}
          </div>
          <p className="text-[12px] text-gray-500 truncate flex-1">{displayName}</p>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] font-medium text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );
}
