'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { TimeOffDialog } from '@/components/calendar/time-off-dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeOff, setTimeOff] = useState([]);

  return (
    <div>
      <Header title="Calendar" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            View availability and manage time off
          </p>
          <TimeOffDialog onSubmit={() => {}} />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 md:col-span-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </Card>

          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Time Off Requests</h3>
              {timeOff.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No time off scheduled
                </p>
              ) : (
                <div className="space-y-2">
                  {timeOff.map((item: any) => (
                    <div key={item.id} className="p-3 border rounded-md">
                      <p className="font-medium text-sm">{item.reason}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(item.start_date), 'MMM d')} -{' '}
                        {format(new Date(item.end_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-4">Today's Schedule</h3>
              <p className="text-sm text-muted-foreground text-center py-4">
                No appointments today
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
