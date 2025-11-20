'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBusinessProfile } from '@/lib/hooks/use-business-profile';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Edit, Trash2, Clock, DollarSign, CheckCircle2, XCircle, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  business_profile_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  color: string;
  created_at: string;
  updated_at: string;
  assigned_staff?: Staff[];
}

interface Staff {
  id: string;
  full_name: string;
}

export default function BusinessServicesPage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useBusinessProfile();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: 60,
    price: 0,
    color: '#3b82f6',
    is_active: true,
  });

  useEffect(() => {
    if (profile) {
      loadServices();
    } else if (!profileLoading) {
      router.push('/dashboard/brand');
    }
  }, [profile, profileLoading]);

  const loadServices = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('business_profile_services')
        .select('*')
        .eq('business_profile_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Load assigned staff for each service
      if (data) {
        const servicesWithStaff = await Promise.all(
          data.map(async (service) => {
            const { data: assignments } = await supabase
              .from('business_profile_staff_services')
              .select('staff_id, business_profile_staff(id, full_name)')
              .eq('service_id', service.id);

            return {
              ...service,
              assigned_staff: assignments?.map((a: any) => a.business_profile_staff).filter(Boolean) || [],
            };
          })
        );
        setServices(servicesWithStaff);
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to load services',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSubmitting(true);
    try {
      if (editingService) {
        const { error } = await supabase
          .from('business_profile_services')
          .update(formData)
          .eq('id', editingService.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Service updated successfully' });
      } else {
        const { error } = await supabase
          .from('business_profile_services')
          .insert({
            ...formData,
            business_profile_id: profile.id,
          });

        if (error) throw error;
        toast({ title: 'Success', description: 'Service created successfully' });
      }

      setDialogOpen(false);
      resetForm();
      loadServices();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to save service',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      duration_minutes: service.duration_minutes,
      price: Number(service.price),
      color: service.color,
      is_active: service.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const { error } = await supabase
        .from('business_profile_services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Success', description: 'Service deleted successfully' });
      loadServices();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete service',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('business_profile_services')
        .update({ is_active: !service.is_active })
        .eq('id', service.id);

      if (error) throw error;
      loadServices();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update service',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration_minutes: 60,
      price: 0,
      color: '#3b82f6',
      is_active: true,
    });
    setEditingService(null);
  };

  if (profileLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Services</h1>
          <p className="text-muted-foreground text-lg">
            Manage your business services
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
              <DialogDescription>
                Create a service that customers can book
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Service Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Haircut, Massage, Consultation..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this service includes..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration_minutes">
                      <Clock className="inline h-4 w-4 mr-2" />
                      Duration (minutes) *
                    </Label>
                    <Input
                      id="duration_minutes"
                      type="number"
                      min="15"
                      step="15"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 60 })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">
                      <DollarSign className="inline h-4 w-4 mr-2" />
                      Price *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-16 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
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
                    'Save Service'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-muted-foreground mb-4">No services yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first service to get started
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <Badge
                      variant={service.is_active ? 'default' : 'secondary'}
                      className="mt-2"
                      onClick={() => toggleActive(service)}
                      style={{ cursor: 'pointer' }}
                    >
                      {service.is_active ? (
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
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: service.color }}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {service.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {service.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {service.duration_minutes} min
                  </div>
                  <div className="flex items-center gap-1 font-semibold">
                    <DollarSign className="h-4 w-4" />
                    {Number(service.price).toFixed(2)}
                  </div>
                </div>

                {/* Assigned Staff */}
                {service.assigned_staff && service.assigned_staff.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">
                        Assigned Staff ({service.assigned_staff.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {service.assigned_staff.map((staff) => (
                        <Badge
                          key={staff.id}
                          variant="outline"
                          className="text-xs"
                        >
                          {staff.full_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(service)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(service.id)}
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
  );
}

