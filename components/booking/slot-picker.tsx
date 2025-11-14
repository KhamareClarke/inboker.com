'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';

interface SlotPickerProps {
  providerId: string;
  onSelectSlot: (date: string, time: string) => void;
  getAvailableSlots: (date: string) => Promise<string[]>;
}

export function SlotPicker({ providerId, onSelectSlot, getAvailableSlots }: SlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      loadSlots(format(selectedDate, 'yyyy-MM-dd'));
    }
  }, [selectedDate]);

  const loadSlots = async (date: string) => {
    setLoading(true);
    try {
      const slots = await getAvailableSlots(date);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Failed to load slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      onSelectSlot(format(selectedDate, 'yyyy-MM-dd'), time);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="p-4">
        <h3 className="font-medium mb-4">Select Date</h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          disabled={(date) => date < new Date()}
          className="rounded-md border"
        />
      </Card>

      <Card className="p-4">
        <h3 className="font-medium mb-4">Available Times</h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No available slots for this date</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {availableSlots.map((slot) => (
              <Button
                key={slot}
                variant={selectedTime === slot ? 'default' : 'outline'}
                onClick={() => handleSelectTime(slot)}
                className="text-sm"
              >
                {slot}
              </Button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
