'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Client } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClientCard } from './client-card';

interface PipelineColumnProps {
  stage: { id: string; label: string; color: string };
  clients: Client[];
  onClientClick: (clientId: string) => void;
}

export function PipelineColumn({ stage, clients, onClientClick }: PipelineColumnProps) {
  const { setNodeRef } = useDroppable({ id: stage.id });

  return (
    <Card className="flex-shrink-0 w-80 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: stage.color }}
          />
          <h3 className="font-semibold">{stage.label}</h3>
        </div>
        <Badge variant="secondary">{clients.length}</Badge>
      </div>
      <div ref={setNodeRef} className="space-y-2 min-h-[400px]">
        <SortableContext items={clients.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {clients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onClick={() => onClientClick(client.id)}
            />
          ))}
        </SortableContext>
      </div>
    </Card>
  );
}
