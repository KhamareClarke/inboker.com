'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, Edit, Trash2, User, Mail, Phone, CheckCircle2, XCircle, Briefcase, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { BusinessProfile } from '@/lib/types';

interface Staff {
  id: string;
  business_profile_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: string;
  avatar_url: string | null;
  bio: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  assigned_services?: Service[];
}

interface Service {
  id: string;
  name: string;
  color: string;
}

export default function BusinessStaffPage() {
  const params = useParams();
  const router = useRouter();
  const businessSlug = params.businessSlug as string;
  const { toast } = useToast();
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'staff',
    bio: '',
    is_active: true,
  });

  useEffect(() => {
    loadBusinessProfile();
  }, [businessSlug]);

  const loadBusinessProfile = async () => {
    if (!businessSlug) return;

    try {
      setLoading(true);
      
      // Find business by slug
      const { data: slugData, error: slugError } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('business_slug', businessSlug)
        .single();

      if (!slugError && slugData) {
        setBusinessProfile(slugData);
        loadData(slugData.id);
        return;
      }

      // Fallback: try to find by business name
      const businessName = businessSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      const { data, error } = await supabase
        .from('business_profiles')
        .select('*')
        .ilike('business_name', businessName)
        .single();

      if (error) {
        console.error('Business profile not found:', error);
        return;
      }

      setBusinessProfile(data);
      loadData(data.id);
    } catch (err) {
      console.error('Error loading business profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async (businessProfileId: string) => {
    try {
      // Load staff with assigned services
      const { data: staffData, error: staffError } = await supabase
        .from('business_profile_staff')
        .select('*')
        .eq('business_profile_id', businessProfileId)
        .order('created_at', { ascending: false });

      if (staffError) throw staffError;

      // Load services
      const { data: servicesData, error: servicesError } = await supabase
        .from('business_profile_services')
        .select('id, name, color')
        .eq('business_profile_id', businessProfileId)
        .eq('is_active', true)
        .order('name');

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Load assignments for each staff member
      if (staffData) {
        const staffWithServices = await Promise.all(
          staffData.map(async (member) => {
            const { data: assignments } = await supabase
              .from('business_profile_staff_services')
              .select('service_id, business_profile_services(id, name, color)')
              .eq('staff_id', member.id);

            return {
              ...member,
              assigned_services: assignments?.map((a: any) => a.business_profile_services).filter(Boolean) || [],
            };
          })
        );
        setStaff(staffWithServices);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to load data',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessProfile) return;

    setSubmitting(true);
    try {
      if (editingStaff) {
        const { error } = await supabase
          .from('business_profile_staff')
          .update(formData)
          .eq('id', editingStaff.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Staff member updated successfully' });
      } else {
        const { error } = await supabase
          .from('business_profile_staff')
          .insert({
            ...formData,
            business_profile_id: businessProfile.id,
          });

        if (error) throw error;
        toast({ title: 'Success', description: 'Staff member added successfully' });
      }

      setDialogOpen(false);
      resetForm();
      if (businessProfile) loadData(businessProfile.id);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save staff member',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignServices = async (selectedServiceIds: string[]) => {
    if (!selectedStaff) return;

    try {
      // Delete all existing assignments for this staff
      const { error: deleteError } = await supabase
        .from('business_profile_staff_services')
        .delete()
        .eq('staff_id', selectedStaff.id);

      if (deleteError) throw deleteError;

      // Insert new assignments
      if (selectedServiceIds.length > 0) {
        const assignments = selectedServiceIds.map(serviceId => ({
          staff_id: selectedStaff.id,
          service_id: serviceId,
        }));

        const { error: insertError } = await supabase
          .from('business_profile_staff_services')
          .insert(assignments);

        if (insertError) throw insertError;
      }

      toast({ title: 'Success', description: 'Services assigned successfully' });
      setAssignDialogOpen(false);
      setSelectedStaff(null);
      if (businessProfile) loadData(businessProfile.id);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to assign services',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setFormData({
      full_name: staffMember.full_name,
      email: staffMember.email || '',
      phone: staffMember.phone || '',
      role: staffMember.role,
      bio: staffMember.bio || '',
      is_active: staffMember.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    try {
      const { error } = await supabase
        .from('business_profile_staff')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Staff member deleted successfully' });
      if (businessProfile) loadData(businessProfile.id);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete staff member',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (staffMember: Staff) => {
    try {
      const { error } = await supabase
        .from('business_profile_staff')
        .update({ is_active: !staffMember.is_active })
        .eq('id', staffMember.id);

      if (error) throw error;
      if (businessProfile) loadData(businessProfile.id);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update staff member',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      role: 'staff',
      bio: '',
      is_active: true,
    });
    setEditingStaff(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!businessProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Business Not Found</h1>
        <Button onClick={() => router.push('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={{
        background: `linear-gradient(135deg, ${businessProfile.primary_color}15 0%, ${businessProfile.secondary_color}15 100%)`
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/${businessSlug}/dashboard`)}
            className="mb-3 sm:mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              {businessProfile.logo_url && (
                <img
                  src={businessProfile.logo_url}
                  alt={businessProfile.business_name}
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain flex-shrink-0"
                />
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Staff</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Manage your team members</p>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Staff
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
                  <DialogDescription>
                    Add a team member to your business
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          <Mail className="inline h-4 w-4 mr-2" />
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          <Phone className="inline h-4 w-4 mr-2" />
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        placeholder="Staff, Manager, Specialist..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell customers about this staff member..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Staff Member'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Assign Services Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Services to {selectedStaff?.full_name}</DialogTitle>
              <DialogDescription>
                Select which services this staff member can provide
              </DialogDescription>
            </DialogHeader>
            <AssignServicesDialog
              staff={selectedStaff}
              services={services}
              assignedServiceIds={selectedStaff?.assigned_services?.map(s => s.id) || []}
              onAssign={handleAssignServices}
              onClose={() => {
                setAssignDialogOpen(false);
                setSelectedStaff(null);
              }}
            />
          </DialogContent>
        </Dialog>

        {staff.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground mb-4">No staff members yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first staff member to get started
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Staff
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {staff.map((staffMember) => (
              <Card key={staffMember.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {staffMember.avatar_url ? (
                        <img
                          src={staffMember.avatar_url}
                          alt={staffMember.full_name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-semibold">
                          {staffMember.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{staffMember.full_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{staffMember.role}</p>
                      </div>
                    </div>
                    <Badge
                      variant={staffMember.is_active ? 'default' : 'secondary'}
                      onClick={() => toggleActive(staffMember)}
                      style={{ cursor: 'pointer' }}
                    >
                      {staffMember.is_active ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {staffMember.bio && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {staffMember.bio}
                    </p>
                  )}
                  <div className="space-y-2 text-sm mb-4">
                    {staffMember.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {staffMember.email}
                      </div>
                    )}
                    {staffMember.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {staffMember.phone}
                      </div>
                    )}
                  </div>

                  {/* Assigned Services */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Assigned Services</Label>
                      <Badge variant="secondary" className="text-xs">
                        {staffMember.assigned_services?.length || 0}
                      </Badge>
                    </div>
                    {staffMember.assigned_services && staffMember.assigned_services.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {staffMember.assigned_services.map((service) => (
                          <Badge
                            key={service.id}
                            variant="secondary"
                            className="text-xs"
                            style={{ backgroundColor: service.color + '20', borderColor: service.color }}
                          >
                            {service.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No services assigned</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedStaff(staffMember);
                        setAssignDialogOpen(true);
                      }}
                    >
                      <Briefcase className="h-4 w-4 mr-1" />
                      Assign
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(staffMember)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(staffMember.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AssignServicesDialog({
  staff,
  services,
  assignedServiceIds,
  onAssign,
  onClose,
}: {
  staff: Staff | null;
  services: Service[];
  assignedServiceIds: string[];
  onAssign: (serviceIds: string[]) => Promise<void>;
  onClose: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>(assignedServiceIds);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelectedIds(assignedServiceIds);
  }, [assignedServiceIds]);

  const handleToggle = (serviceId: string) => {
    setSelectedIds(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onAssign(selectedIds);
    } finally {
      setSaving(false);
    }
  };

  if (!staff) return null;

  return (
    <div className="space-y-4">
      <div className="max-h-64 overflow-y-auto space-y-2">
        {services.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No services available. Create services first.
          </p>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              onClick={() => handleToggle(service.id)}
            >
              <Checkbox
                checked={selectedIds.includes(service.id)}
                onCheckedChange={() => handleToggle(service.id)}
              />
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: service.color }}
              />
              <Label className="flex-1 cursor-pointer">{service.name}</Label>
            </div>
          ))
        )}
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Assignments'
          )}
        </Button>
      </div>
    </div>
  );
}

