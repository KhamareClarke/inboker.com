'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Loader2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

export default function PublicBookingPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [clientInfo, setClientInfo] = useState({
    full_name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    loadWorkspace();
  }, [slug]);

  const loadWorkspace = async () => {
    try {
      const { data: workspaceData, error: wsError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('slug', slug)
        .single();

      if (wsError || !workspaceData) {
        setLoading(false);
        return;
      }

      setWorkspace(workspaceData);

      const { data: membersData } = await supabase
        .from('workspace_members')
        .select('*, user:users(*)')
        .eq('workspace_id', workspaceData.id)
        .eq('is_active', true);

      setMembers(membersData || []);
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedMember) return;

    setSubmitting(true);
    try {
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('workspace_id', workspace.id)
        .eq('email', clientInfo.email)
        .maybeSingle();

      let clientId = client?.id;

      if (!clientId) {
        const { data: newClient } = await supabase
          .from('clients')
          .insert({
            workspace_id: workspace.id,
            full_name: clientInfo.full_name,
            email: clientInfo.email,
            phone: clientInfo.phone,
            pipeline_stage: 'lead',
          })
          .select()
          .single();

        clientId = newClient.id;
      }

      const startTime = new Date(selectedDate);
      const [hour, min] = selectedTime.split(':');
      startTime.setHours(parseInt(hour), parseInt(min));

      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);

      await supabase.from('bookings').insert({
        workspace_id: workspace.id,
        client_id: clientId,
        provider_id: selectedMember.id,
        title: 'Consultation',
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'pending',
        source: 'public_booking',
      });

      setSuccess(true);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Workspace not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
            <p className="text-muted-foreground mb-4">
              We've sent a confirmation email to {clientInfo.email}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(selectedDate!, 'PPP')} at {selectedTime}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {workspace.name}
          </h1>
          <p className="text-muted-foreground">Book your appointment in 3 easy steps</p>
        </div>

        <Card>
          <CardContent className="p-6">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Step 1: Select a Team Member</h3>
                  <div className="grid gap-4">
                    {members.map((member) => (
                      <Card
                        key={member.id}
                        className={`cursor-pointer transition-all ${selectedMember?.id === member.id ? 'ring-2 ring-blue-600' : ''}`}
                        onClick={() => setSelectedMember(member)}
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{member.user?.full_name || 'Team Member'}</p>
                            <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                <Button onClick={() => setStep(2)} disabled={!selectedMember} className="w-full">
                  Continue to Date Selection
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Step 2: Choose Date & Time</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border" />
                    </div>
                    <div>
                      <Label className="mb-2 block">Available Times</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {timeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} disabled={!selectedDate || !selectedTime} className="flex-1">
                    Continue to Your Info
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Step 3: Your Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={clientInfo.full_name}
                        onChange={(e) => setClientInfo({ ...clientInfo, full_name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={clientInfo.email}
                        onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={clientInfo.phone}
                        onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !clientInfo.full_name || !clientInfo.email}
                    className="flex-1"
                  >
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm Booking
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
