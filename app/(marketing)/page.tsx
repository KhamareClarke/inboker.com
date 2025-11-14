import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, TrendingUp, Clock, Check, ArrowRight, Briefcase, Shield, Zap, Link as LinkIcon, Bell, FileText, BarChart, Sparkles, Bot, Radio } from 'lucide-react';
import { SocialProof } from '@/components/marketing/social-proof';
import { Stats } from '@/components/marketing/stats';
import { Testimonials } from '@/components/marketing/testimonials';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inboker - AI-Powered Booking Engine for Appointment-Based Businesses',
  description: 'The white-label booking platform for clinics, salons, barbers, and freelancers. AI scheduling, multi-staff support, SMS reminders, and more. Launch in 5 minutes.',
  openGraph: {
    title: 'Inboker - Your bookings, on autopilot',
    description: 'AI-powered booking engine that fills your calendar and reduces no-shows',
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <div className="flex flex-col overflow-hidden">
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-blue-950/30 dark:via-cyan-950/30 dark:to-indigo-950/30" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />

        <div className="container relative mx-auto max-w-screen-xl px-6 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200 dark:border-blue-800">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Powered by Advanced AI
                </span>
              </div>

              <div className="space-y-6">
                <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
                  Your bookings,{' '}
                  <span className="relative inline-block">
                    <span className="absolute inset-0 blur-2xl bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 opacity-30" />
                    <span className="relative bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent">
                      on autopilot
                    </span>
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                  The AI-powered booking engine that fills your calendar, eliminates no-shows, and turns every click into a paying client.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="px-4 py-2 text-sm border border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                  <Bot className="h-3.5 w-3.5 mr-1.5" />
                  AI-Powered
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm border border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
                  <Radio className="h-3.5 w-3.5 mr-1.5" />
                  Real-Time Sync
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm border border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                  <Shield className="h-3.5 w-3.5 mr-1.5" />
                  Enterprise Security
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/signup" className="group">
                  <Button size="lg" className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-700 hover:via-cyan-700 hover:to-blue-700 text-lg px-10 h-16 w-full sm:w-auto shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 bg-[length:200%_100%] hover:bg-right">
                    <span className="relative z-10 flex items-center gap-2">
                      Start Free Trial
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
                <Link href="/demo">
                  <Button size="lg" variant="outline" className="text-lg px-10 h-16 w-full sm:w-auto border-2 hover:bg-muted/50 backdrop-blur-sm transition-all duration-300">
                    Book a Demo
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>5-minute setup</span>
                </div>
              </div>
            </div>

            <div className="relative lg:h-[600px]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-cyan-400 to-indigo-400 rounded-3xl blur-3xl opacity-20 animate-pulse" />
              <div className="relative space-y-4">
                <Card className="shadow-2xl border-2 border-blue-100 dark:border-blue-900 backdrop-blur-sm bg-background/80 hover:shadow-blue-500/20 hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
                  <CardHeader className="border-b bg-gradient-to-r from-blue-50 via-cyan-50 to-indigo-50 dark:from-blue-950/50 dark:via-cyan-950/50 dark:to-indigo-950/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle className="text-lg">Your AI-Powered Space</CardTitle>
                      </div>
                      <Badge className="bg-green-500 text-white border-0">Live</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl border border-blue-100 dark:border-blue-900">
                      <div className="flex items-center gap-3">
                        <Bot className="h-5 w-5 text-blue-600" />
                        <span className="font-semibold">AI Scheduler Active</span>
                      </div>
                      <Badge variant="secondary">92% efficiency</Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <span className="text-sm font-medium">Today's bookings</span>
                        <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0">12 confirmed</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <span className="text-sm font-medium">This week</span>
                        <Badge variant="secondary">48 scheduled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <span className="text-sm font-medium">Revenue</span>
                        <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">+38% ↑</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg text-center border border-blue-100 dark:border-blue-900 hover:scale-105 transition-transform cursor-pointer">
                        <div className="text-xs text-muted-foreground mb-1">9:00 AM</div>
                        <div className="text-sm font-semibold">Open</div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg text-center border-2 border-green-500 shadow-lg shadow-green-500/20 hover:scale-105 transition-transform cursor-pointer">
                        <div className="text-xs text-muted-foreground mb-1">10:00 AM</div>
                        <div className="text-sm font-semibold text-green-700 dark:text-green-400">Booked</div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-lg text-center border border-blue-100 dark:border-blue-900 hover:scale-105 transition-transform cursor-pointer">
                        <div className="text-xs text-muted-foreground mb-1">11:00 AM</div>
                        <div className="text-sm font-semibold">Open</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-2 border-orange-100 dark:border-orange-900 bg-gradient-to-br from-orange-50/50 to-amber-50/50 dark:from-orange-950/20 dark:to-amber-950/20 hover:scale-105 transition-transform">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">92%</div>
                      <div className="text-xs text-muted-foreground mt-1">Less No-Shows</div>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-green-100 dark:border-green-900 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 hover:scale-105 transition-transform">
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">38%</div>
                      <div className="text-xs text-muted-foreground mt-1">Revenue Lift</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SocialProof />

      <section className="container mx-auto max-w-screen-xl px-6 py-20 md:py-32">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="outline" className="px-4 py-2 text-sm">
            <Zap className="h-3.5 w-3.5 mr-1.5 text-yellow-500" />
            Core Capabilities
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold">
            Built for{' '}
            <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent">
              Modern Business
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Enterprise-grade features that work seamlessly together to power your booking flow
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="group relative overflow-hidden border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-2xl mb-2">AI Scheduling Engine</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Real-time availability, timezone intelligence, and zero back-and-forth. Smart slots that respect shifts, time off, and connected calendars.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group relative overflow-hidden border-2 hover:border-cyan-200 dark:hover:border-cyan-800 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                <LinkIcon className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-2xl mb-2">Multi-Channel Links</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                QR codes, Instagram, WhatsApp, Google Maps — unique tracking links per channel with complete analytics from visit to booking.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group relative overflow-hidden border-2 hover:border-green-200 dark:hover:border-green-800 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-2xl mb-2">Smart Reminders</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Automated SMS and email reminders that cut cancellations by 92%. Twilio integration with custom templates and retry logic.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="relative py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-950 dark:via-blue-950/30 dark:to-cyan-950/30" />
        <div className="container relative mx-auto max-w-screen-xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Simple Setup.{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Powerful Results.
              </span>
            </h2>
            <p className="text-xl text-muted-foreground">Get live in three effortless steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-50 transition-opacity duration-500" />
              <Card className="relative border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-500">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 via-cyan-600 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold mx-auto shadow-xl shadow-blue-500/30">
                    1
                  </div>
                  <h3 className="text-2xl font-bold">Create Your Space</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Brand it, connect calendars, add services. Your booking engine in minutes.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-green-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-50 transition-opacity duration-500" />
              <Card className="relative border-2 hover:border-cyan-200 dark:hover:border-cyan-800 transition-all duration-500">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-600 via-teal-600 to-green-600 text-white flex items-center justify-center text-3xl font-bold mx-auto shadow-xl shadow-cyan-500/30">
                    2
                  </div>
                  <h3 className="text-2xl font-bold">Share Everywhere</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Bio links, website embed, QR on your front desk. One link, all channels.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-25 group-hover:opacity-50 transition-opacity duration-500" />
              <Card className="relative border-2 hover:border-green-200 dark:hover:border-green-800 transition-all duration-500">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 text-white flex items-center justify-center text-3xl font-bold mx-auto shadow-xl shadow-green-500/30">
                    3
                  </div>
                  <h3 className="text-2xl font-bold">Watch It Convert</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Clients book, reminders fire, payments clear. Your calendar on autopilot.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-screen-xl px-6 py-20 md:py-32">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="outline" className="px-4 py-2 text-sm">
            <BarChart className="h-3.5 w-3.5 mr-1.5 text-green-600" />
            Complete Platform
          </Badge>
          <h2 className="text-4xl md:text-6xl font-bold">
            Everything You Need.{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Nothing You Don't.
            </span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Bot,
              title: 'AI-Powered Scheduling',
              description: 'Smart slots that respect shifts, time off, and Google Calendar sync',
              gradient: 'from-blue-600 to-cyan-600'
            },
            {
              icon: Users,
              title: 'Team & Shifts',
              description: 'Multi-staff roles, weekly shifts, vacations, and availability board',
              gradient: 'from-cyan-600 to-teal-600'
            },
            {
              icon: LinkIcon,
              title: 'Multi-Channel Links & QR',
              description: 'Channel-specific short links with UTMs and conversion analytics',
              gradient: 'from-teal-600 to-green-600'
            },
            {
              icon: Bell,
              title: 'Smart Reminders',
              description: 'Twilio SMS + SendGrid email with templates and webhook tracking',
              gradient: 'from-green-600 to-emerald-600'
            },
            {
              icon: FileText,
              title: 'Secure Intake Forms',
              description: 'HIPAA/GDPR-ready, encrypted responses, e-signature support',
              gradient: 'from-emerald-600 to-lime-600'
            },
            {
              icon: BarChart,
              title: 'Client CRM',
              description: 'Pipeline Kanban, notes, lead scoring, and activity timeline',
              gradient: 'from-lime-600 to-yellow-600'
            },
          ].map((feature, index) => (
            <Card key={index} className="group hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <Stats />

      <section className="container mx-auto max-w-screen-xl px-6 py-20 md:py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Real Results.{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Real Businesses.
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">See what our customers achieve with Inboker</p>
        </div>
        <Testimonials />
      </section>

      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-600 to-indigo-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />

        <div className="container relative mx-auto max-w-4xl px-6 text-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">
                Join 10,000+ businesses already on Inboker
              </span>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight">
              Start taking bookings in 5 minutes
            </h2>

            <p className="text-xl text-blue-50 max-w-2xl mx-auto">
              Brand it, connect your calendar, go live. No code required. No credit card needed.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="text-lg px-10 h-16 shadow-2xl hover:scale-105 transition-transform">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline" className="text-lg px-10 h-16 bg-white/10 border-white/20 hover:bg-white/20 text-white backdrop-blur-sm">
                  Book a Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
