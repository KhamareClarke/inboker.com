'use client';

import { useState } from 'react';
import { Client, ClientActivity } from '@/lib/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, Calendar, Star, MessageSquare, Plus } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface ClientDetailDrawerProps {
  client: Client & { activities?: ClientActivity[] };
  open: boolean;
  onClose: () => void;
  onAddNote: (note: string) => void;
}

export function ClientDetailDrawer({ client, open, onClose, onAddNote }: ClientDetailDrawerProps) {
  const [note, setNote] = useState('');

  const handleAddNote = () => {
    if (note.trim()) {
      onAddNote(note);
      setNote('');
    }
  };

  const activityIcons = {
    booking: Calendar,
    note: MessageSquare,
    email: Mail,
    call: Phone,
    status_change: Star,
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Client Details</SheetTitle>
        </SheetHeader>

        <div className="mt-6">
          <div className="flex items-start gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={client.avatar_url || undefined} />
              <AvatarFallback className="text-lg">
                {client.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{client.full_name}</h3>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                {client.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {client.email}
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {client.phone}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="secondary">
                  <Star className="h-3 w-3 mr-1 text-yellow-500 fill-yellow-500" />
                  {client.lead_score} points
                </Badge>
                <Badge variant="outline">{client.pipeline_stage}</Badge>
              </div>
              {client.tags && client.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {client.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Tabs defaultValue="activity" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-4">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {client.activities && client.activities.length > 0 ? (
                    client.activities.map((activity) => {
                      const Icon = activityIcons[activity.activity_type];
                      return (
                        <div key={activity.id} className="flex gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{activity.title}</p>
                            {activity.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {activity.description}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(activity.created_at), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No activity yet
                    </p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <div className="space-y-4">
                <div>
                  <Textarea
                    placeholder="Add a note..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={4}
                  />
                  <Button onClick={handleAddNote} className="mt-2 w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>
                <Separator />
                <ScrollArea className="h-[380px]">
                  {client.notes && (
                    <div className="whitespace-pre-wrap text-sm">{client.notes}</div>
                  )}
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
