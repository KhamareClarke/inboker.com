'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, closestCorners } from '@dnd-kit/core';
import { Client, PIPELINE_STAGES } from '@/lib/types';
import { PipelineColumn } from './pipeline-column';
import { ClientCard } from './client-card';

interface PipelineBoardProps {
  clientsByStage: Record<string, Client[]>;
  onUpdateStage: (clientId: string, newStage: string) => void;
  onClientClick: (clientId: string) => void;
}

export function PipelineBoard({ clientsByStage, onUpdateStage, onClientClick }: PipelineBoardProps) {
  const [activeClient, setActiveClient] = useState<Client | null>(null);

  const handleDragStart = (event: any) => {
    const { active } = event;
    const stage = Object.keys(clientsByStage).find((stage) =>
      clientsByStage[stage].some((c) => c.id === active.id)
    );
    if (stage) {
      const client = clientsByStage[stage].find((c) => c.id === active.id);
      setActiveClient(client || null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveClient(null);

    if (!over || active.id === over.id) return;

    const activeStage = Object.keys(clientsByStage).find((stage) =>
      clientsByStage[stage].some((c) => c.id === active.id)
    );

    const overId = String(over.id);
    const overStage = PIPELINE_STAGES.find((s) => s.id === overId)?.id;

    if (activeStage && overStage && activeStage !== overStage) {
      onUpdateStage(String(active.id), overStage);
    }
  };

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STAGES.map((stage) => (
          <PipelineColumn
            key={stage.id}
            stage={stage}
            clients={clientsByStage[stage.id] || []}
            onClientClick={onClientClick}
          />
        ))}
      </div>
      <DragOverlay>
        {activeClient ? (
          <div className="rotate-3 opacity-80">
            <ClientCard client={activeClient} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
