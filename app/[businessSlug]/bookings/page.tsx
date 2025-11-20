'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Copy, Check, ExternalLink, Calendar, Clock, DollarSign } from 'lucide-react';
import type { BusinessProfile, BusinessProfileService } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

// Utility function to generate slug from service name
function generateServiceSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export default function BusinessBookingsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const businessSlug = params.businessSlug as string;
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [services, setServices] = useState<BusinessProfileService[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadBusinessData();
  }, [businessSlug]);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      
      // Find business by slug
      const { data: slugData, error: slugError } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('business_slug', businessSlug)
        .single();

      if (!slugError && slugData) {
        setProfile(slugData);
        
        // Load active services
        const { data: servicesData, error: servicesError } = await supabase
          .from('business_profile_services')
          .select('*')
          .eq('business_profile_id', slugData.id)
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (!servicesError && servicesData) {
          setServices(servicesData);
        }
      } else {
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
          console.error('Business not found:', error);
          return;
        }

        setProfile(data);
        
        // Load active services
        const { data: servicesData, error: servicesError } = await supabase
          .from('business_profile_services')
          .select('*')
          .eq('business_profile_id', data.id)
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (!servicesError && servicesData) {
          setServices(servicesData);
        }
      }
    } catch (err) {
      console.error('Error loading business data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBookingUrl = (service: BusinessProfileService) => {
    if (typeof window === 'undefined') return '';
    const serviceSlug = generateServiceSlug(service.name);
    return `${window.location.origin}/booking/${serviceSlug}`;
  };

  const handleCopyUrl = (url: string, serviceId: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(serviceId);
    toast({
      title: 'Copied!',
      description: 'Booking URL copied to clipboard',
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Business Not Found</h1>
        <p className="text-muted-foreground mb-4">The business profile you're looking for doesn't exist.</p>
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
        background: `linear-gradient(135deg, ${profile.primary_color}15 0%, ${profile.secondary_color}15 100%)`
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
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
          
          <div className="flex items-center gap-3 sm:gap-4">
            {profile.logo_url && (
              <img
                src={profile.logo_url}
                alt={profile.business_name}
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain flex-shrink-0"
              />
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{profile.business_name}</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Manage Booking Links</p>
            </div>
          </div>
        </div>

        {/* Services List */}
        {services.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-muted-foreground mb-4">No active services yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create and activate services to generate booking links
              </p>
              <Button onClick={() => router.push(`/${businessSlug}/services`)}>
                Go to Services
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.map((service) => {
              const bookingUrl = getBookingUrl(service);
              const isCopied = copiedId === service.id;

              return (
                <Card key={service.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{service.name}</CardTitle>
                        {service.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {service.description}
                          </p>
                        )}
                      </div>
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: service.color }}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{service.duration_minutes} min</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-semibold">${service.price.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Booking URL</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={bookingUrl}
                          readOnly
                          className="text-xs font-mono flex-1"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyUrl(bookingUrl, service.id)}
                        >
                          {isCopied ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(bookingUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open
                      </Button>
                      <Button
                        variant="default"
                        className="flex-1"
                        onClick={() => router.push(bookingUrl)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Test Booking
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

