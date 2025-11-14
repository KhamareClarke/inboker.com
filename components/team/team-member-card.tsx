'use client';

import { WorkspaceMemberWithUser } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Shield, User, Crown } from 'lucide-react';

interface TeamMemberCardProps {
  member: WorkspaceMemberWithUser;
  onUpdateRole: (memberId: string, role: 'owner' | 'admin' | 'member') => void;
  onDeactivate: (memberId: string) => void;
}

export function TeamMemberCard({ member, onUpdateRole, onDeactivate }: TeamMemberCardProps) {
  const roleConfig = {
    owner: { icon: Crown, label: 'Owner', color: 'bg-yellow-500' },
    admin: { icon: Shield, label: 'Admin', color: 'bg-blue-500' },
    member: { icon: User, label: 'Member', color: 'bg-gray-500' },
  };

  const config = roleConfig[member.role];
  const RoleIcon = config.icon;

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={member.user.avatar_url || undefined} />
          <AvatarFallback>
            {member.user.full_name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{member.user.full_name}</p>
          <p className="text-sm text-muted-foreground">{member.user.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="gap-1">
          <RoleIcon className="h-3 w-3" />
          {config.label}
        </Badge>
        {!member.is_active && (
          <Badge variant="destructive">Inactive</Badge>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {member.role !== 'owner' && (
              <>
                <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'member')}>
                  Make Member
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'admin')}>
                  Make Admin
                </DropdownMenuItem>
              </>
            )}
            {member.is_active && (
              <DropdownMenuItem
                onClick={() => onDeactivate(member.id)}
                className="text-destructive"
              >
                Deactivate
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
