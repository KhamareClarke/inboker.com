'use client';

import { useState } from 'react';
import { DAYS_OF_WEEK } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Clock, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Shift {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  member: {
    user: {
      full_name: string;
    };
  };
}

interface ShiftScheduleProps {
  shifts: Shift[];
  members: Array<{ id: string; user: { full_name: string } }>;
  onCreateShift: (memberId: string, dayOfWeek: number, startTime: string, endTime: string) => void;
  onDeleteShift: (shiftId: string) => void;
}

export function ShiftSchedule({ shifts, members, onCreateShift, onDeleteShift }: ShiftScheduleProps) {
  const [open, setOpen] = useState(false);
  const [memberId, setMemberId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('0');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');

  const handleSubmit = () => {
    if (memberId) {
      onCreateShift(memberId, parseInt(dayOfWeek), startTime, endTime);
      setOpen(false);
      setMemberId('');
      setDayOfWeek('0');
      setStartTime('09:00');
      setEndTime('17:00');
    }
  };

  const groupedShifts = DAYS_OF_WEEK.map((day) => ({
    day,
    shifts: shifts.filter((s) => s.day_of_week === day.id),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Weekly Schedule</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Shift
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Shift</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Team Member</Label>
                <Select value={memberId} onValueChange={setMemberId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select member" />
                  </SelectTrigger>
                  <SelectContent>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.user.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Day of Week</Label>
                <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.id} value={day.id.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleSubmit} className="w-full">
                Add Shift
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-2">
        {groupedShifts.map(({ day, shifts: dayShifts }) => (
          <Card key={day.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{day.label}</h4>
              <span className="text-sm text-muted-foreground">
                {dayShifts.length} shift{dayShifts.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-2">
              {dayShifts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No shifts scheduled</p>
              ) : (
                dayShifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {shift.member.user.full_name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {shift.start_time} - {shift.end_time}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteShift(shift.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
