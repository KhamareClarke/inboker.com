'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBusinessProfile } from '@/lib/hooks/use-business-profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, Save, Image as ImageIcon, Palette, Globe, Phone, Mail, Instagram, Facebook, Twitter, Linkedin, ChevronRight, ChevronLeft, Eye, CheckCircle2, Edit, ExternalLink, Building2, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Section } from '@/components/ui/section';
import { parseCancellationPolicy } from '@/lib/business/cancellation-policy';

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Business name and logo' },
  { id: 2, title: 'Branding', description: 'Colors and style' },
  { id: 3, title: 'Contact', description: 'Contact information' },
  { id: 4, title: 'Booking Page', description: 'Customize booking experience' },
];

export default function BrandProfilePage() {
  const router = useRouter();
  const { profile, loading, error, createProfile, updateProfile, uploadLogo, refresh } = useBusinessProfile();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    business_name: '',
    description: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    primary_color: '#3b82f6',
    secondary_color: '#06b6d4',
    booking_page_title: '',
    booking_page_subtitle: '',
    social_links: {
      instagram: '',
      facebook: '',
      twitter: '',
      linkedin: '',
    },
    free_cancel_hours_before: 24,
    late_cancel_fee_gbp: '0',
    latitude: '',
    longitude: '',
    accepts_new_customers: true,
  });
  const [giftVouchers, setGiftVouchers] = useState<
    { id: string; code: string; balance_pence: number; initial_value_pence: number; status: string; expires_at: string | null }[]
  >([]);
  const [giftVouchersLoading, setGiftVouchersLoading] = useState(false);
  const [giftAmountGbp, setGiftAmountGbp] = useState('25');
  const [giftExpiresDays, setGiftExpiresDays] = useState('365');
  const [creatingPromo, setCreatingPromo] = useState(false);
  const [promoCodes, setPromoCodes] = useState<
    {
      id: string;
      code: string;
      discount_type: string;
      discount_value: number;
      redemptions_count: number;
      max_redemptions: number | null;
      active: boolean;
    }[]
  >([]);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoDiscountType, setPromoDiscountType] = useState<'percent' | 'fixed_pence'>('percent');
  const [promoDiscountValue, setPromoDiscountValue] = useState('10');
  const [promoMaxRedemptions, setPromoMaxRedemptions] = useState('');
  const [creatingVoucher, setCreatingVoucher] = useState(false);
  useEffect(() => {
    if (profile) {
      const pol = parseCancellationPolicy(profile.custom_settings);
      setFormData({
        business_name: profile.business_name || '',
        description: profile.description || '',
        contact_email: profile.contact_email || '',
        contact_phone: profile.contact_phone || '',
        website: profile.website || '',
        primary_color: profile.primary_color || '#3b82f6',
        secondary_color: profile.secondary_color || '#06b6d4',
        booking_page_title: profile.booking_page_title || '',
        booking_page_subtitle: profile.booking_page_subtitle || '',
        social_links: {
          instagram: (profile.social_links as any)?.instagram || '',
          facebook: (profile.social_links as any)?.facebook || '',
          twitter: (profile.social_links as any)?.twitter || '',
          linkedin: (profile.social_links as any)?.linkedin || '',
        },
        free_cancel_hours_before: pol.freeCancelHoursBefore,
        late_cancel_fee_gbp: (pol.lateCancelFeePence / 100).toFixed(2),
        latitude: (profile as { latitude?: number | null }).latitude != null ? String((profile as { latitude?: number | null }).latitude) : '',
        longitude: (profile as { longitude?: number | null }).longitude != null ? String((profile as { longitude?: number | null }).longitude) : '',
        accepts_new_customers: (profile as { accepts_new_customers?: boolean }).accepts_new_customers !== false,
      });
      if (profile.logo_url) {
        setLogoPreview(profile.logo_url);
      }
    }
  }, [profile]);

  useEffect(() => {
    if (!profile?.id || !editing || currentStep !== 4) return;
    let cancelled = false;
    (async () => {
      setGiftVouchersLoading(true);
      try {
        const r = await fetch('/api/gift-vouchers');
        const j = await r.json();
        if (!cancelled && r.ok) setGiftVouchers(j.vouchers || []);
        const pr = await fetch('/api/promo-codes');
        const pj = await pr.json();
        if (!cancelled && pr.ok) setPromoCodes(pj.codes || []);
      } catch {
        if (!cancelled) setGiftVouchers([]);
      } finally {
        if (!cancelled) setGiftVouchersLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile?.id, editing, currentStep]);

  const handleCreateGiftVoucher = async () => {
    const amount = parseFloat(giftAmountGbp.replace(',', '.'));
    const days = parseInt(giftExpiresDays, 10);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }
    setCreatingVoucher(true);
    try {
      const r = await fetch('/api/gift-vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountGbp: amount,
          expiresInDays: Number.isFinite(days) && days > 0 ? days : null,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Failed');
      toast({ title: 'Gift voucher created', description: `Code: ${j.voucher?.code}` });
      const list = await fetch('/api/gift-vouchers').then((x) => x.json());
      setGiftVouchers(list.vouchers || []);
    } catch (e: any) {
      toast({ title: 'Could not create voucher', description: e.message, variant: 'destructive' });
    } finally {
      setCreatingVoucher(false);
    }
  };

  const handleCreatePromo = async () => {
    const code = promoCodeInput.trim().toUpperCase();
    if (code.length < 3) {
      toast({ title: 'Code too short', variant: 'destructive' });
      return;
    }
    const val = parseFloat(promoDiscountValue.replace(',', '.'));
    if (!Number.isFinite(val) || val <= 0) {
      toast({ title: 'Invalid discount value', variant: 'destructive' });
      return;
    }
    const maxR = promoMaxRedemptions.trim() ? parseInt(promoMaxRedemptions, 10) : null;
    setCreatingPromo(true);
    try {
      const r = await fetch('/api/promo-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          discountType: promoDiscountType,
          discountValue: promoDiscountType === 'fixed_pence' ? Math.round(val * 100) : Math.round(val),
          maxRedemptions: maxR != null && Number.isFinite(maxR) ? maxR : null,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Failed');
      toast({ title: 'Promo code created', description: code });
      setPromoCodeInput('');
      const list = await fetch('/api/promo-codes').then((x) => x.json());
      setPromoCodes(list.codes || []);
    } catch (e: any) {
      toast({ title: 'Could not create promo', description: e.message, variant: 'destructive' });
    } finally {
      setCreatingPromo(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('social_links.')) {
      const socialKey = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        social_links: {
          ...prev.social_links,
          [socialKey]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Logo must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select an image file first',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploadingLogo(true);
      const logoUrl = await uploadLogo(file);
      
      if (profile) {
        await updateProfile({ logo_url: logoUrl });
      } else {
        await createProfile({ logo_url: logoUrl });
      }

      setLogoPreview(logoUrl);
      toast({
        title: 'Logo uploaded',
        description: 'Your logo has been uploaded successfully',
      });
      await refresh();
    } catch (err: any) {
      toast({
        title: 'Upload failed',
        description: err.message || 'Failed to upload logo',
        variant: 'destructive',
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    if (!formData.business_name.trim()) {
      toast({
        title: 'Validation error',
        description: 'Business name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      const profileData = {
        business_name: formData.business_name,
        description: formData.description,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        website: formData.website,
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        booking_page_title: formData.booking_page_title,
        booking_page_subtitle: formData.booking_page_subtitle,
        social_links: formData.social_links,
        logo_url: logoPreview || profile?.logo_url || null,
        latitude:
          formData.latitude.trim() === '' ? null : parseFloat(formData.latitude.replace(',', '.')),
        longitude:
          formData.longitude.trim() === '' ? null : parseFloat(formData.longitude.replace(',', '.')),
        accepts_new_customers: formData.accepts_new_customers,
        custom_settings: {
          ...(profile?.custom_settings &&
          typeof profile.custom_settings === 'object' &&
          !Array.isArray(profile.custom_settings)
            ? { ...(profile.custom_settings as Record<string, unknown>) }
            : {}),
          cancellationPolicy: {
            freeCancelHoursBefore: Math.max(
              0,
              Math.round(Number(formData.free_cancel_hours_before)) || 24
            ),
            lateCancelFeePence: Math.max(
              0,
              Math.round(
                (parseFloat(String(formData.late_cancel_fee_gbp).replace(',', '.')) || 0) * 100
              )
            ),
          },
        },
      };

      // Add timeout to prevent hanging
      const savePromise = profile 
        ? updateProfile(profileData)
        : createProfile(profileData);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Save operation timed out. Please try again.')), 30000)
      );

      await Promise.race([savePromise, timeoutPromise]);

      toast({
        title: 'Saved!',
        description: 'Your brand profile has been saved successfully',
      });

      // Reload page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error('Save error:', err);
      console.error('Error stack:', err.stack);
      console.error('Error details:', JSON.stringify(err, null, 2));
      
      // Provide more specific error messages
      let errorMessage = err.message || 'Failed to save profile. Please try again.';
      if (err.message?.includes('Authentication expired') || err.message?.includes('not authenticated')) {
        errorMessage = 'Your session expired. Please refresh the page and try again.';
      } else if (err.message?.includes('timeout') || err.message?.includes('timed out')) {
        errorMessage = 'The request timed out. Please check your internet connection and try again.';
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      toast({
        title: 'Save failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      // Always clear saving state, even on timeout
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleEdit = () => {
    setEditing(true);
    setCurrentStep(1);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setCurrentStep(1);
    // Reload form data from profile
    if (profile) {
      const pol = parseCancellationPolicy(profile.custom_settings);
      setFormData({
        business_name: profile.business_name || '',
        description: profile.description || '',
        contact_email: profile.contact_email || '',
        contact_phone: profile.contact_phone || '',
        website: profile.website || '',
        primary_color: profile.primary_color || '#3b82f6',
        secondary_color: profile.secondary_color || '#06b6d4',
        booking_page_title: profile.booking_page_title || '',
        booking_page_subtitle: profile.booking_page_subtitle || '',
        social_links: {
          instagram: (profile.social_links as any)?.instagram || '',
          facebook: (profile.social_links as any)?.facebook || '',
          twitter: (profile.social_links as any)?.twitter || '',
          linkedin: (profile.social_links as any)?.linkedin || '',
        },
        free_cancel_hours_before: pol.freeCancelHoursBefore,
        late_cancel_fee_gbp: (pol.lateCancelFeePence / 100).toFixed(2),
        latitude: (profile as { latitude?: number | null }).latitude != null ? String((profile as { latitude?: number | null }).latitude) : '',
        longitude: (profile as { longitude?: number | null }).longitude != null ? String((profile as { longitude?: number | null }).longitude) : '',
        accepts_new_customers: (profile as { accepts_new_customers?: boolean }).accepts_new_customers !== false,
      });
      if (profile.logo_url) {
        setLogoPreview(profile.logo_url);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // If profile exists and not editing, show profile view
  if (profile && !editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">White-label branding</h1>
          <p className="text-muted-foreground text-lg">
            Your logo, colors, and company name appear on the login page and across your dashboard.
          </p>
        </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                const slug = profile.business_slug || profile.business_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                router.push(`/${slug}/dashboard`);
              }}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
            <Button
              onClick={handleEdit}
              variant="outline"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader style={{
            background: `linear-gradient(135deg, ${profile.primary_color} 0%, ${profile.secondary_color} 100%)`,
            color: 'white',
          }}>
            <div className="flex items-center gap-4">
              {profile.logo_url && (
                <img
                  src={profile.logo_url}
                  alt={profile.business_name}
                  className="w-16 h-16 object-contain bg-white rounded-lg p-2"
                />
              )}
              <div>
                <CardTitle className="text-white text-2xl">{profile.business_name}</CardTitle>
                <CardDescription className="text-white/90">
                  White-label branding (applies to login and dashboard)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {profile.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{profile.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {profile.contact_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <a href={`mailto:${profile.contact_email}`} className="text-blue-600 hover:underline">
                        {profile.contact_email}
                      </a>
                    </div>
                  )}
                  {profile.contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <a href={`tel:${profile.contact_phone}`} className="text-blue-600 hover:underline">
                        {profile.contact_phone}
                      </a>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {profile.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Brand Colors</h3>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="w-16 h-16 rounded-lg border-2 border-gray-200"
                      style={{ backgroundColor: profile.primary_color }}
                    />
                    <span className="text-sm text-muted-foreground">Primary</span>
                    <code className="text-xs">{profile.primary_color}</code>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className="w-16 h-16 rounded-lg border-2 border-gray-200"
                      style={{ backgroundColor: profile.secondary_color }}
                    />
                    <span className="text-sm text-muted-foreground">Secondary</span>
                    <code className="text-xs">{profile.secondary_color}</code>
                  </div>
                </div>
              </div>
            </div>

            {(profile.social_links as any) && Object.values(profile.social_links as any).some((link: any) => link) && (
              <div>
                <h3 className="font-semibold mb-4">Social Media</h3>
                <div className="flex gap-4">
                  {(profile.social_links as any).instagram && (
                    <a href={(profile.social_links as any).instagram} target="_blank" rel="noopener noreferrer">
                      <Instagram className="h-6 w-6 text-pink-600 hover:text-pink-700" />
                    </a>
                  )}
                  {(profile.social_links as any).facebook && (
                    <a href={(profile.social_links as any).facebook} target="_blank" rel="noopener noreferrer">
                      <Facebook className="h-6 w-6 text-blue-600 hover:text-blue-700" />
                    </a>
                  )}
                  {(profile.social_links as any).twitter && (
                    <a href={(profile.social_links as any).twitter} target="_blank" rel="noopener noreferrer">
                      <Twitter className="h-6 w-6 text-sky-600 hover:text-sky-700" />
                    </a>
                  )}
                  {(profile.social_links as any).linkedin && (
                    <a href={(profile.social_links as any).linkedin} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-6 w-6 text-blue-700 hover:text-blue-800" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {(profile.booking_page_title || profile.booking_page_subtitle) && (
              <div>
                <h3 className="font-semibold mb-4">Booking Page</h3>
                <div className="space-y-2">
                  {profile.booking_page_title && (
                    <div>
                      <span className="text-sm text-muted-foreground">Title: </span>
                      <span className="font-medium">{profile.booking_page_title}</span>
                    </div>
                  )}
                  {profile.booking_page_subtitle && (
                    <div>
                      <span className="text-sm text-muted-foreground">Subtitle: </span>
                      <span className="font-medium">{profile.booking_page_subtitle}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show form (either creating new or editing existing)
  return (
    <Section className="space-y-ds-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="ds-heading-1 mb-ds-1">Brand editor</h1>
          <p className="text-muted-foreground ds-body">
            {profile ? 'Edit your white-label branding' : 'Set your logo, company name, and colors. These apply to the login page and dashboard.'}
          </p>
        </div>
        {profile && editing && (
          <Button
            variant="outline"
            onClick={handleCancelEdit}
          >
            Cancel
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <button
                onClick={() => goToStep(step.id)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep === step.id
                    ? 'bg-blue-600 text-white'
                    : currentStep > step.id
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  step.id
                )}
              </button>
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${currentStep === step.id ? 'text-blue-600' : 'text-gray-600'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`flex-1 h-1 mx-2 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Basic Information</h2>
                <p className="text-muted-foreground">Tell us about your business. These settings are saved and appear on the login page and across your dashboard.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name *</Label>
                  <Input
                    id="business_name"
                    value={formData.business_name}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    placeholder="My Awesome Business"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Tell customers about your business..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {logoPreview ? (
                        <div className="relative">
                          <img
                            src={logoPreview}
                            alt="Business logo preview"
                            className="w-32 h-32 object-contain rounded-lg border-2 border-gray-200"
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Select Image
                        </Button>
                        {logoPreview && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleLogoUpload}
                            disabled={uploadingLogo}
                          >
                            {uploadingLogo ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Logo
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG up to 5MB. Select image to preview, then click Upload.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Branding */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Brand Colors</h2>
                <p className="text-muted-foreground">Customize your brand colors</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary_color">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="primary_color"
                        value={formData.primary_color}
                        onChange={(e) => handleInputChange('primary_color', e.target.value)}
                        className="w-16 h-10 rounded border cursor-pointer"
                      />
                      <Input
                        value={formData.primary_color}
                        onChange={(e) => handleInputChange('primary_color', e.target.value)}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary_color">Secondary Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="secondary_color"
                        value={formData.secondary_color}
                        onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                        className="w-16 h-10 rounded border cursor-pointer"
                      />
                      <Input
                        value={formData.secondary_color}
                        onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                        placeholder="#06b6d4"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-6 rounded-lg border-2" style={{ 
                  background: `linear-gradient(135deg, ${formData.primary_color} 0%, ${formData.secondary_color} 100%)` 
                }}>
                  <p className="text-white font-medium text-center text-lg">Color Preview</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Contact & Social Media</h2>
                <p className="text-muted-foreground">How customers can reach you</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_email">
                        <Mail className="inline h-4 w-4 mr-2" />
                        Contact Email
                      </Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => handleInputChange('contact_email', e.target.value)}
                        placeholder="contact@business.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_phone">
                        <Phone className="inline h-4 w-4 mr-2" />
                        Contact Phone
                      </Label>
                      <Input
                        id="contact_phone"
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">
                        <Globe className="inline h-4 w-4 mr-2" />
                        Website
                      </Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://yourbusiness.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Social Media Links</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="instagram">
                        <Instagram className="inline h-4 w-4 mr-2" />
                        Instagram
                      </Label>
                      <Input
                        id="instagram"
                        type="url"
                        value={formData.social_links.instagram}
                        onChange={(e) => handleInputChange('social_links.instagram', e.target.value)}
                        placeholder="https://instagram.com/yourbusiness"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="facebook">
                        <Facebook className="inline h-4 w-4 mr-2" />
                        Facebook
                      </Label>
                      <Input
                        id="facebook"
                        type="url"
                        value={formData.social_links.facebook}
                        onChange={(e) => handleInputChange('social_links.facebook', e.target.value)}
                        placeholder="https://facebook.com/yourbusiness"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitter">
                        <Twitter className="inline h-4 w-4 mr-2" />
                        Twitter
                      </Label>
                      <Input
                        id="twitter"
                        type="url"
                        value={formData.social_links.twitter}
                        onChange={(e) => handleInputChange('social_links.twitter', e.target.value)}
                        placeholder="https://twitter.com/yourbusiness"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedin">
                        <Linkedin className="inline h-4 w-4 mr-2" />
                        LinkedIn
                      </Label>
                      <Input
                        id="linkedin"
                        type="url"
                        value={formData.social_links.linkedin}
                        onChange={(e) => handleInputChange('social_links.linkedin', e.target.value)}
                        placeholder="https://linkedin.com/company/yourbusiness"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Booking Page */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Booking Page Customization</h2>
                <p className="text-muted-foreground">Customize how your booking page appears to customers</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="booking_page_title">Page Title</Label>
                  <Input
                    id="booking_page_title"
                    value={formData.booking_page_title}
                    onChange={(e) => handleInputChange('booking_page_title', e.target.value)}
                    placeholder="Book an Appointment"
                  />
                  <p className="text-sm text-muted-foreground">
                    Main heading on your booking page
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="booking_page_subtitle">Page Subtitle</Label>
                  <Textarea
                    id="booking_page_subtitle"
                    value={formData.booking_page_subtitle}
                    onChange={(e) => handleInputChange('booking_page_subtitle', e.target.value)}
                    placeholder="Choose a time that works for you..."
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    Subheading or description on your booking page
                  </p>
                </div>

                <div className="rounded-lg border p-4 space-y-4 bg-muted/30">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Cancellation policy
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Shown as guidance when customers cancel in their portal. Fees are not charged automatically yet.
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="free_cancel_hours_before">Free cancellation up to (hours before)</Label>
                      <Input
                        id="free_cancel_hours_before"
                        type="number"
                        min={0}
                        value={formData.free_cancel_hours_before}
                        onChange={(e) =>
                          handleInputChange('free_cancel_hours_before', parseInt(e.target.value, 10) || 0)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="late_cancel_fee_gbp">Late cancellation fee (£)</Label>
                      <Input
                        id="late_cancel_fee_gbp"
                        type="text"
                        inputMode="decimal"
                        value={formData.late_cancel_fee_gbp}
                        onChange={(e) => handleInputChange('late_cancel_fee_gbp', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border p-4 space-y-4 bg-muted/20">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Location & new clients
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Optional coordinates power &quot;near me&quot; in the customer browse. Uncheck if you are waitlist-only for new clients.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        value={formData.latitude}
                        onChange={(e) => handleInputChange('latitude', e.target.value)}
                        placeholder="51.5074"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        value={formData.longitude}
                        onChange={(e) => handleInputChange('longitude', e.target.value)}
                        placeholder="-0.1278"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="accepts_new"
                      checked={formData.accepts_new_customers}
                      onChange={(e) => handleInputChange('accepts_new_customers', e.target.checked)}
                      className="h-4 w-4 rounded border"
                    />
                    <Label htmlFor="accepts_new" className="text-sm font-normal cursor-pointer">
                      Accepting new customers
                    </Label>
                  </div>
                </div>

                <div className="rounded-lg border p-4 space-y-4">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Gift className="h-4 w-4" />
                      Gift vouchers
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Codes apply to the booking total after checkout on the public booking page.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                    <div className="space-y-2 flex-1">
                      <Label>Amount (£)</Label>
                      <Input
                        value={giftAmountGbp}
                        onChange={(e) => setGiftAmountGbp(e.target.value)}
                        placeholder="25"
                      />
                    </div>
                    <div className="space-y-2 flex-1">
                      <Label>Expires in (days, optional)</Label>
                      <Input
                        value={giftExpiresDays}
                        onChange={(e) => setGiftExpiresDays(e.target.value)}
                        placeholder="365"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCreateGiftVoucher}
                      disabled={creatingVoucher || !profile}
                    >
                      {creatingVoucher ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create code'}
                    </Button>
                  </div>
                  {giftVouchersLoading ? (
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading vouchers…
                    </p>
                  ) : giftVouchers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No vouchers yet.</p>
                  ) : (
                    <ul className="text-sm space-y-2 max-h-48 overflow-y-auto">
                      {giftVouchers.map((v) => (
                        <li key={v.id} className="flex justify-between gap-2 border-b border-border/50 pb-2">
                          <code className="font-mono text-xs sm:text-sm">{v.code}</code>
                          <span className="shrink-0 text-muted-foreground">
                            £{(v.balance_pence / 100).toFixed(2)} · {v.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-lg border p-4 space-y-4">
                  <h3 className="font-semibold">Promo & bulk discount codes</h3>
                  <p className="text-sm text-muted-foreground">
                    Percent off or fixed £ discount. Shown at booking when customers enter the code.
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Code</Label>
                      <Input
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                        placeholder="SUMMER20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={promoDiscountType}
                        onChange={(e) => setPromoDiscountType(e.target.value as 'percent' | 'fixed_pence')}
                      >
                        <option value="percent">Percent off</option>
                        <option value="fixed_pence">Fixed amount (£)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>{promoDiscountType === 'percent' ? 'Percent' : 'Amount (£)'}</Label>
                      <Input
                        value={promoDiscountValue}
                        onChange={(e) => setPromoDiscountValue(e.target.value)}
                        placeholder={promoDiscountType === 'percent' ? '10' : '5'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Max redemptions (optional)</Label>
                      <Input
                        value={promoMaxRedemptions}
                        onChange={(e) => setPromoMaxRedemptions(e.target.value)}
                        placeholder="Unlimited"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCreatePromo}
                    disabled={creatingPromo || !profile}
                  >
                    {creatingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create promo code'}
                  </Button>
                  {promoCodes.length > 0 && (
                    <ul className="text-sm space-y-2 max-h-40 overflow-y-auto border-t pt-3">
                      {promoCodes.map((p) => (
                        <li key={p.id} className="flex justify-between gap-2">
                          <code className="font-mono">{p.code}</code>
                          <span className="text-muted-foreground shrink-0">
                            {p.discount_type === 'percent' ? `${p.discount_value}%` : `£${(p.discount_value / 100).toFixed(2)}`} ·{' '}
                            {p.redemptions_count} uses
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep < STEPS.length ? (
            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0"
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Section>
  );
}
