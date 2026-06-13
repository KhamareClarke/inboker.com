export interface IndustryData {
  slug: string;
  name: string;
  headline: string;
  subheadline: string;
  description: string;
  painPoints: string[];
  features: { title: string; description: string }[];
  stats: { value: string; label: string }[];
  faqs: { question: string; answer: string }[];
  testimonial: { quote: string; author: string; role: string; business: string };
  metaTitle: string;
  metaDescription: string;
  relatedIndustries: { name: string; slug: string }[];
}

export const industryData: Record<string, IndustryData> = {
  salons: {
    slug: 'salons',
    name: 'Hair Salons',
    headline: 'Booking software built for hair salons',
    subheadline: 'Fill every chair. Eliminate no-shows. Let your stylists focus on clients — not the phone.',
    description:
      'Inboker is the AI-powered booking platform trusted by hair salons across the UK. Manage multiple stylists, services, and walk-ins from one dashboard. Automated SMS reminders cut no-shows by up to 92%.',
    painPoints: [
      'Phone calls and manual bookings eating into appointment time',
      'No-shows leaving chairs empty and revenue lost',
      'Coordinating multiple stylists and their individual availability',
      'Clients booking the wrong service or stylist',
    ],
    features: [
      { title: 'Per-stylist calendars', description: 'Each stylist gets their own schedule. Clients book the person they want, or you assign automatically.' },
      { title: 'Service duration control', description: 'Set custom durations per service — highlights vs. trims have different time needs. Inboker handles the maths.' },
      { title: 'Deposit collection', description: 'Require a deposit at booking to protect against last-minute cancellations and no-shows.' },
      { title: 'SMS reminders', description: 'Automated texts go out 24 hours and 2 hours before appointments — proven to cut no-shows by up to 92%.' },
      { title: 'Client history', description: 'See what service each client had last time, their preferred stylist, and any notes — all in one place.' },
      { title: 'Shareable booking link', description: 'One link for your Instagram bio, website, and Google Business Profile. Clients book in under 60 seconds.' },
    ],
    stats: [
      { value: '92%', label: 'Reduction in no-shows' },
      { value: '38%', label: 'Increase in new bookings' },
      { value: '5 min', label: 'Setup time' },
      { value: '2,000+', label: 'Salons using Inboker' },
    ],
    faqs: [
      { question: 'Can my stylists manage their own bookings?', answer: 'Yes. Each staff member gets their own login and calendar view. You control what they can see and edit.' },
      { question: 'Does Inboker work for walk-in clients?', answer: 'Yes. You can add walk-in bookings manually from the dashboard in seconds, even while managing online bookings simultaneously.' },
      { question: 'Can clients book specific stylists?', answer: 'Absolutely. Clients can choose their preferred stylist, or you can show available slots across all stylists and let them pick.' },
      { question: 'What happens when a stylist is off sick?', answer: 'You can block out time for any staff member instantly, and Inboker will automatically update availability so no new bookings land in that slot.' },
      { question: 'Does it integrate with my website?', answer: 'Yes. Inboker provides an embeddable widget that works on any website — WordPress, Squarespace, Wix, or custom-built sites.' },
    ],
    testimonial: {
      quote: 'Multi-staff scheduling was a nightmare before Inboker. Now everyone sees their shifts and we\'re fully booked every week.',
      author: 'James K.',
      role: 'Owner',
      business: 'Luxe Hair & Beauty',
    },
    metaTitle: 'Booking Software for Hair Salons | Inboker',
    metaDescription: 'Hair salon booking software with per-stylist calendars, SMS reminders, and deposit collection. Reduce no-shows by 92%. Try free for 14 days.',
    relatedIndustries: [
      { name: 'Barbershops', slug: 'barbershops' },
      { name: 'Nail Studios', slug: 'nail-studios' },
      { name: 'Aesthetics', slug: 'aesthetics' },
    ],
  },

  barbershops: {
    slug: 'barbershops',
    name: 'Barbershops',
    headline: 'Online booking for barbershops that want to stay fully booked',
    subheadline: 'Stop taking bookings by DM and phone. Let clients book your barbers 24/7.',
    description:
      'Inboker gives barbershops a professional online booking system with per-barber schedules, automated reminders, and a shareable link that works straight from your Instagram bio.',
    painPoints: [
      'Losing bookings to DMs and WhatsApp that get missed',
      'Double-bookings when multiple barbers share a diary',
      'No-shows with no deposit or reminder system in place',
      'Walk-ins clashing with booked appointments',
    ],
    features: [
      { title: 'Instagram-ready booking link', description: 'One link in your bio. Clients tap, pick their barber, pick a time, and confirm — in under a minute.' },
      { title: 'Per-barber schedules', description: 'Each barber runs their own calendar. No more crossed wires or double-bookings.' },
      { title: 'Deposit at booking', description: 'Charge a small deposit to lock in the slot. Reduce no-shows without turning away genuine clients.' },
      { title: 'SMS reminders', description: 'Clients get a text the day before and an hour before their cut. Fewer no-shows, more revenue.' },
      { title: 'QR code for your shop', description: 'Print a QR code for the counter or window. Walk-ins scan it, book their slot, and wait their turn.' },
      { title: 'No-show tracking', description: 'Track which clients repeatedly no-show. Set automatic deposit requirements for repeat offenders.' },
    ],
    stats: [
      { value: '92%', label: 'Fewer no-shows' },
      { value: '60s', label: 'Client booking time' },
      { value: '5 min', label: 'Setup time' },
      { value: '500+', label: 'Barbershops using Inboker' },
    ],
    faqs: [
      { question: 'Can clients choose their specific barber?', answer: 'Yes. Each barber has their own profile and availability. Clients pick the person they want, not just a time slot.' },
      { question: 'Does it work for walk-ins alongside online bookings?', answer: 'Yes. Walk-ins can be added manually in seconds, and your barbers see all appointments in one view.' },
      { question: 'Can I charge a no-show fee?', answer: 'Yes. You can require a deposit at booking or charge a cancellation fee through Stripe if a client cancels within your set window.' },
      { question: 'Can I use it on my phone?', answer: 'Yes. Inboker is a web app that works on any smartphone. Your barbers can check their schedule from their own phone during the day.' },
    ],
    testimonial: {
      quote: 'The WhatsApp booking link converts like crazy. Bookings straight from the bio. Game changer for us.',
      author: 'Marco P.',
      role: 'Owner',
      business: "Marco's Barber Studio",
    },
    metaTitle: 'Booking Software for Barbershops | Inboker',
    metaDescription: 'Barbershop booking system with per-barber schedules, Instagram booking link, and SMS reminders. Stop losing bookings to DMs. Free 14-day trial.',
    relatedIndustries: [
      { name: 'Hair Salons', slug: 'salons' },
      { name: 'Aesthetics', slug: 'aesthetics' },
      { name: 'Nail Studios', slug: 'nail-studios' },
    ],
  },

  clinics: {
    slug: 'clinics',
    name: 'Clinics',
    headline: 'Appointment booking software for clinics and healthcare practices',
    subheadline: 'GDPR-compliant scheduling for GP surgeries, physio clinics, dental practices, and wellness centres.',
    description:
      'Inboker gives clinics a secure, GDPR-compliant appointment system with digital intake forms, practitioner-specific calendars, automated patient reminders, and Stripe payment integration.',
    painPoints: [
      'Phone-heavy front desks spending hours on bookings instead of patient care',
      'No-shows leaving appointment slots empty and unpaid',
      'Paper intake forms creating admin work before every appointment',
      'Coordinating multiple practitioners and room availability',
    ],
    features: [
      { title: 'Digital intake forms', description: 'Patients complete intake forms before their appointment. No paper, no manual data entry, data ready when they arrive.' },
      { title: 'GDPR-compliant data handling', description: 'All client data is encrypted at rest and in transit. Fully compliant with UK GDPR and the Data Protection Act 2018.' },
      { title: 'Practitioner calendars', description: 'Each doctor, physio, or clinician manages their own schedule. Patients book the right person every time.' },
      { title: 'Automated patient reminders', description: 'SMS and email reminders reduce DNA (Did Not Attend) rates significantly — proven to cut no-shows by up to 92%.' },
      { title: 'Online payments', description: 'Collect consultation fees, deposits, or full payments at booking through Stripe. Reduce no-shows with financial commitment.' },
      { title: 'Multi-location support', description: 'Run multiple clinic sites from one dashboard. Patients book the location nearest to them.' },
    ],
    stats: [
      { value: '92%', label: 'Reduction in no-shows' },
      { value: '100%', label: 'GDPR compliant' },
      { value: '5 min', label: 'Setup time' },
      { value: '300+', label: 'Clinics using Inboker' },
    ],
    faqs: [
      { question: 'Is Inboker GDPR compliant?', answer: 'Yes. All data is encrypted at rest and in transit. We never sell client data. You can export or delete all data at any time. We are fully compliant with UK GDPR and the Data Protection Act 2018.' },
      { question: 'Can patients book specific practitioners?', answer: 'Yes. Each practitioner has their own profile, photo, and availability. Patients choose who they want to see.' },
      { question: 'Does it support multiple clinic locations?', answer: 'Yes. The Business plan supports unlimited locations with a unified admin dashboard across all sites.' },
      { question: 'Can we use digital intake forms?', answer: 'Yes. Create custom intake forms with any fields you need. Patients complete them before their appointment. Data is stored securely and linked to their booking.' },
      { question: 'Can patients pay online at booking?', answer: 'Yes. You can require full payment, a deposit, or allow payment at the clinic. All payments are processed securely by Stripe.' },
    ],
    testimonial: {
      quote: 'Switching to Inboker cut our no-shows nearly in half. Clients rebook themselves — our front desk finally breathes.',
      author: 'Aisha R.',
      role: 'Clinic Manager',
      business: 'Prime Health Clinic',
    },
    metaTitle: 'Clinic Booking Software | GDPR-Compliant Appointment System | Inboker',
    metaDescription: 'GDPR-compliant appointment booking for clinics, GP surgeries, and healthcare practices. Digital intake forms, patient reminders, and Stripe payments. Try free.',
    relatedIndustries: [
      { name: 'Physiotherapy', slug: 'physiotherapy' },
      { name: 'Dental', slug: 'dental' },
      { name: 'Wellness', slug: 'wellness' },
    ],
  },

  physiotherapy: {
    slug: 'physiotherapy',
    name: 'Physiotherapy Practices',
    headline: 'Online booking software for physiotherapists',
    subheadline: 'Let patients book their physio sessions 24/7. Reduce admin. Focus on treatment.',
    description:
      'Inboker gives physiotherapy practices a professional booking system with session-length flexibility, GDPR-compliant intake forms, and automated reminders that reduce missed appointments.',
    painPoints: [
      'Patients struggling to reach the practice by phone to book',
      'Different appointment types (initial assessment vs. follow-up) needing different durations',
      'Paper intake forms creating work before every new patient assessment',
      'No-shows leaving treatment slots empty and clinicians underutilised',
    ],
    features: [
      { title: 'Flexible session lengths', description: 'Initial assessments and follow-up sessions have different durations. Set them once and Inboker handles scheduling automatically.' },
      { title: 'Patient intake forms', description: 'New patients complete medical history and consent forms digitally before their first appointment.' },
      { title: 'Course-of-treatment tracking', description: 'Track patients across multiple sessions. See their history and notes at a glance before each appointment.' },
      { title: 'Automated SMS reminders', description: 'Patients receive appointment reminders by SMS and email, reducing missed appointments across your caseload.' },
      { title: 'Online payments', description: 'Charge for sessions, packages, or take deposits at booking through Stripe.' },
      { title: 'Practitioner calendars', description: 'Each physiotherapist manages their own caseload and availability independently.' },
    ],
    stats: [
      { value: '92%', label: 'Fewer missed appointments' },
      { value: '38%', label: 'More new patient bookings' },
      { value: '100%', label: 'GDPR compliant' },
      { value: '5 min', label: 'Setup time' },
    ],
    faqs: [
      { question: 'Can I set different durations for initial assessments vs. follow-ups?', answer: 'Yes. Each service can have its own duration, price, and availability. Initial assessments can be 60 minutes; follow-ups 30 minutes.' },
      { question: 'Can patients fill in medical history before their appointment?', answer: 'Yes. Create custom intake forms with any fields — medical history, consent, pain scale, contraindications. Patients complete them before arriving.' },
      { question: 'Does Inboker work for a solo physiotherapist?', answer: 'Yes. The Starter plan is designed for solo practitioners. You get your own booking page, intake forms, and SMS reminders from £29/month.' },
    ],
    testimonial: {
      quote: 'The intake forms saved us hours of paperwork. Everything\'s digital, secure, and ready before the patient walks in.',
      author: 'Dr. Patel',
      role: 'Physiotherapist',
      business: 'Active Recovery Physio',
    },
    metaTitle: 'Physiotherapy Booking Software | Online Appointment Scheduling | Inboker',
    metaDescription: 'Online booking for physiotherapists. Flexible session lengths, digital intake forms, GDPR-compliant, SMS reminders. Free 14-day trial. No credit card required.',
    relatedIndustries: [
      { name: 'Clinics', slug: 'clinics' },
      { name: 'Wellness', slug: 'wellness' },
      { name: 'Personal Trainers', slug: 'personal-trainers' },
    ],
  },

  'personal-trainers': {
    slug: 'personal-trainers',
    name: 'Personal Trainers',
    headline: 'Booking software for personal trainers',
    subheadline: 'Spend less time scheduling, more time training. Let clients book sessions 24/7.',
    description:
      'Inboker gives personal trainers a professional booking system to manage 1-to-1 sessions, group classes, and packages — with automated reminders to keep clients showing up.',
    painPoints: [
      'Managing session bookings over WhatsApp and text is chaotic',
      'Clients forgetting sessions and no-shows wasting your time',
      'Tracking session packages and remaining credits manually',
      'No professional booking page to share with new prospects',
    ],
    features: [
      { title: '1-to-1 and group sessions', description: 'Run individual PT sessions alongside group classes from the same booking page.' },
      { title: 'Session package credits', description: 'Sell packages of 5, 10, or 20 sessions. Inboker tracks remaining credits per client automatically.' },
      { title: 'SMS reminders', description: 'Clients get a reminder the day before and an hour before their session. No more forgotten workouts.' },
      { title: 'Shareable booking link', description: 'One link for Instagram, your website, and WhatsApp. New prospects can book a taster session in 60 seconds.' },
      { title: 'Stripe payments', description: 'Charge for single sessions or packages online at booking. Get paid before you train.' },
      { title: 'Client history', description: 'See each client\'s booking history, preferences, and notes from past sessions in one place.' },
    ],
    stats: [
      { value: '92%', label: 'Fewer no-shows' },
      { value: '38%', label: 'More new client bookings' },
      { value: '60s', label: 'Client booking time' },
      { value: '5 min', label: 'Setup time' },
    ],
    faqs: [
      { question: 'Can I sell session packages?', answer: 'Yes. Set up packages (e.g., 10 sessions for £300) and clients can purchase and book individual sessions against their credit balance.' },
      { question: 'Can clients book group classes?', answer: 'Yes. Set a maximum capacity per session. Once the session is full, it shows as unavailable.' },
      { question: 'Does it work alongside my current website?', answer: 'Yes. Embed the Inboker booking widget on any website, or share your unique booking link directly.' },
    ],
    testimonial: {
      quote: 'I went from managing WhatsApp bookings to having a fully automated system in under a week. My clients love it.',
      author: 'Sarah L.',
      role: 'Personal Trainer',
      business: 'Sarah Fit Studio',
    },
    metaTitle: 'Booking Software for Personal Trainers | Session Scheduling App | Inboker',
    metaDescription: 'Online booking for personal trainers. Manage 1-to-1 sessions, group classes, and packages. SMS reminders, Stripe payments. Free 14-day trial.',
    relatedIndustries: [
      { name: 'Yoga Studios', slug: 'yoga-studios' },
      { name: 'Pilates', slug: 'pilates' },
      { name: 'Sports Coaching', slug: 'sports-coaching' },
    ],
  },

  'yoga-studios': {
    slug: 'yoga-studios',
    name: 'Yoga Studios',
    headline: 'Class booking software for yoga studios',
    subheadline: 'Manage class schedules, memberships, and drop-ins from one simple dashboard.',
    description:
      'Inboker gives yoga studios a professional class booking system with capacity limits, waitlists, memberships, and automated reminders — so you can focus on teaching, not admin.',
    painPoints: [
      'Managing class capacity and waitlists manually',
      'Members and drop-ins booking through different systems',
      'Students forgetting class times and no-showing',
      'No easy way to sell class packages or memberships',
    ],
    features: [
      { title: 'Class capacity limits', description: 'Set maximum students per class. Once full, Inboker shows a waitlist option automatically.' },
      { title: 'Waitlist management', description: 'When a spot opens, the first person on the waitlist is notified automatically.' },
      { title: 'Drop-in and package booking', description: 'Sell single drop-in classes or multi-class packages. Track usage per student.' },
      { title: 'Teacher scheduling', description: 'Different teachers for different classes. Each instructor manages their own sessions.' },
      { title: 'SMS and email reminders', description: 'Students get reminded before class. Reduce empty mats and last-minute cancellations.' },
      { title: 'Recurring classes', description: 'Set up weekly, twice-weekly, or monthly recurring class schedules in minutes.' },
    ],
    stats: [
      { value: '92%', label: 'Fewer no-shows' },
      { value: '38%', label: 'Growth in new student bookings' },
      { value: '5 min', label: 'Setup time' },
      { value: '200+', label: 'Yoga studios using Inboker' },
    ],
    faqs: [
      { question: 'Can I manage multiple class types and teachers?', answer: 'Yes. Set up Hatha, Vinyasa, Yin, and any other class types — each with their own teacher, duration, and capacity.' },
      { question: 'Does it support class packages (e.g., 10-class passes)?', answer: 'Yes. Sell multi-class passes and Inboker tracks how many sessions remain per student.' },
      { question: 'Can students join a waitlist when a class is full?', answer: 'Yes. When capacity is reached, a waitlist option appears automatically. If a spot opens, the next student is notified.' },
    ],
    testimonial: {
      quote: 'We went from juggling three tools to just Inboker. Simpler, faster, and our students love the booking page.',
      author: 'Nina T.',
      role: 'Studio Manager',
      business: 'Zen Yoga Studio',
    },
    metaTitle: 'Yoga Studio Booking Software | Class Scheduling System | Inboker',
    metaDescription: 'Class booking software for yoga studios. Manage capacity, waitlists, class packages, and teacher schedules. SMS reminders. Try free for 14 days.',
    relatedIndustries: [
      { name: 'Pilates', slug: 'pilates' },
      { name: 'Personal Trainers', slug: 'personal-trainers' },
      { name: 'Wellness', slug: 'wellness' },
    ],
  },

  aesthetics: {
    slug: 'aesthetics',
    name: 'Aesthetics Practices',
    headline: 'Booking software for aesthetics and beauty clinics',
    subheadline: 'Professional scheduling for botox, fillers, skin treatments, and aesthetics procedures.',
    description:
      'Inboker gives aesthetics practices a GDPR-compliant booking system with digital consent forms, practitioner-specific calendars, online deposits, and automated reminders to maximise your treatment calendar.',
    painPoints: [
      'Paper consent forms creating pre-appointment admin',
      'No-shows on high-value treatment slots losing significant revenue',
      'Clients booking treatments they\'re not suitable for without prior screening',
      'Managing multiple practitioners and treatment rooms',
    ],
    features: [
      { title: 'Digital consent forms', description: 'Clients complete treatment-specific consent and medical history forms before their appointment. Legally compliant, no paper.' },
      { title: 'Deposit collection', description: 'Require deposits on high-value treatment bookings to protect against no-shows and last-minute cancellations.' },
      { title: 'Practitioner calendars', description: 'Each aesthetic practitioner manages their own treatment schedule and client list.' },
      { title: 'Treatment-specific intake', description: 'Different intake forms for different treatments — botox, fillers, microneedling — with the right medical questions for each.' },
      { title: 'Automated reminders', description: 'Clients receive pre-appointment reminders with care instructions and what to expect.' },
      { title: 'Client treatment history', description: 'See each client\'s full treatment history, products used, and notes from previous appointments.' },
    ],
    stats: [
      { value: '92%', label: 'Fewer no-shows' },
      { value: '100%', label: 'GDPR compliant' },
      { value: '0', label: 'Paper forms needed' },
      { value: '5 min', label: 'Setup time' },
    ],
    faqs: [
      { question: 'Can I send different consent forms for different treatments?', answer: 'Yes. Create treatment-specific forms — botox consent, filler medical history, skin peel contraindications — and link them to the relevant services.' },
      { question: 'Can I require a deposit for high-value treatments?', answer: 'Yes. Set a deposit amount per service. Clients pay via Stripe at booking to confirm their slot.' },
      { question: 'Is the client data GDPR compliant?', answer: 'Yes. All data is encrypted, stored securely, and you can export or delete any client record at any time.' },
    ],
    testimonial: {
      quote: 'The intake forms saved us hours of paperwork. Everything\'s digital, secure, and ready before the client walks in.',
      author: 'Dr. Patel',
      role: 'Aesthetic Practitioner',
      business: 'Glow Aesthetics Clinic',
    },
    metaTitle: 'Aesthetics Booking Software | Clinic Appointment System | Inboker',
    metaDescription: 'Booking software for aesthetics clinics. Digital consent forms, deposit collection, GDPR-compliant client records. Free 14-day trial.',
    relatedIndustries: [
      { name: 'Clinics', slug: 'clinics' },
      { name: 'Hair Salons', slug: 'salons' },
      { name: 'Nail Studios', slug: 'nail-studios' },
    ],
  },

  consultants: {
    slug: 'consultants',
    name: 'Consultants',
    headline: 'Online booking for consultants and professional services',
    subheadline: 'Let prospects book discovery calls and client meetings 24/7 — without the email back-and-forth.',
    description:
      'Inboker gives consultants a professional scheduling page for discovery calls, strategy sessions, and ongoing client meetings — with integrated video call links, reminders, and payment collection.',
    painPoints: [
      'Endless email chains to find a meeting time that works',
      'Prospects dropping off before booking a discovery call',
      'No easy way to charge for consulting sessions at the point of booking',
      'Calendar conflicts when managing multiple clients',
    ],
    features: [
      { title: 'Discovery call booking', description: 'Share one link for prospects to book a 30-minute discovery call. No back-and-forth.' },
      { title: 'Paid consultation booking', description: 'Set hourly or fixed rates per session type. Clients pay at booking via Stripe.' },
      { title: 'Intake questionnaires', description: 'Collect brief beforehand — company size, current challenges, goals — before the call starts.' },
      { title: 'SMS and email reminders', description: 'Both you and the client get reminders before every session. Fewer missed meetings.' },
      { title: 'Calendar integration', description: 'Bookings sync to your Inboker calendar. Avoid double-bookings across client accounts.' },
      { title: 'Meeting notes link', description: 'Add a video call or meeting room link that clients see on their confirmation.' },
    ],
    stats: [
      { value: '38%', label: 'More discovery calls booked' },
      { value: '92%', label: 'Fewer no-shows' },
      { value: '60s', label: 'Prospect booking time' },
      { value: '5 min', label: 'Setup time' },
    ],
    faqs: [
      { question: 'Can I charge for consultations at booking?', answer: 'Yes. Set a price per session type and collect payment through Stripe when the client confirms their booking.' },
      { question: 'Can I add a pre-call intake form?', answer: 'Yes. Create a custom form with questions about company size, challenges, and goals. Clients complete it before the meeting.' },
      { question: 'Can I offer free discovery calls alongside paid sessions?', answer: 'Yes. Create separate service types — one free (discovery call) and one paid (strategy session) — and let clients book either.' },
    ],
    testimonial: {
      quote: 'I used to lose prospects in the email back-and-forth. Now they book a call in 60 seconds from my website.',
      author: 'Michael R.',
      role: 'Strategy Consultant',
      business: 'Redfield Consulting',
    },
    metaTitle: 'Booking Software for Consultants | Online Meeting Scheduler | Inboker',
    metaDescription: 'Online scheduling for consultants. Book discovery calls and paid sessions without email back-and-forth. Intake forms, Stripe payments. Free 14-day trial.',
    relatedIndustries: [
      { name: 'Lawyers', slug: 'lawyers' },
      { name: 'Accountants', slug: 'accountants' },
      { name: 'Clinics', slug: 'clinics' },
    ],
  },

  dental: {
    slug: 'dental',
    name: 'Dental Practices',
    headline: 'Appointment booking software for dental practices',
    subheadline: 'GDPR-compliant scheduling for NHS and private dental surgeries. Reduce DNAs. Manage recalls.',
    description: 'Inboker gives dental practices a modern appointment system with digital patient forms, recall reminders, and automated SMS to reduce Did Not Attend rates across your appointment book.',
    painPoints: [
      'High DNA rates leaving treatment chairs empty',
      'Manual recall systems that rely on staff remembering to call',
      'Paper medical history forms creating pre-appointment admin',
      'New patient bookings requiring multiple phone calls',
    ],
    features: [
      { title: 'Digital patient registration', description: 'New patients complete registration and medical history forms online before their first appointment.' },
      { title: 'Recall reminder automation', description: 'Set up 6-month or 12-month recall reminders. Patients get a text or email prompting them to book their next appointment.' },
      { title: 'DNA rate reduction', description: 'Automated day-before and hour-before reminders reduce Did Not Attend rates by up to 92%.' },
      { title: 'Dentist-specific calendars', description: 'Each dentist and hygienist manages their own appointment schedule independently.' },
      { title: 'Online payment at booking', description: 'Collect deposits or full payment for private treatments at the point of booking.' },
      { title: 'GDPR-compliant records', description: 'All patient data is encrypted, securely stored, and exportable on request.' },
    ],
    stats: [
      { value: '92%', label: 'DNA reduction' },
      { value: '100%', label: 'GDPR compliant' },
      { value: '38%', label: 'More new patient bookings' },
      { value: '5 min', label: 'Setup time' },
    ],
    faqs: [
      { question: 'Can patients book online without calling the surgery?', answer: 'Yes. Set up your services (check-up, hygienist, fillings) and patients book directly from your website or booking link.' },
      { question: 'Does Inboker help with recall management?', answer: 'Yes. Automated recall reminders can be set at 3, 6, or 12 months to prompt patients to book their next appointment.' },
      { question: 'Is patient data GDPR compliant?', answer: 'Yes. All data is encrypted at rest and in transit. You can export or delete any patient record at any time.' },
    ],
    testimonial: {
      quote: 'The intake forms saved us hours of paperwork every week. Everything is digital, secure, and ready when the patient arrives.',
      author: 'Dr. Patel',
      role: 'Principal Dentist',
      business: 'Smile Dental Practice',
    },
    metaTitle: 'Dental Practice Booking Software | Appointment Scheduling System | Inboker',
    metaDescription: 'Online appointment booking for dental practices. Reduce DNA rates, automate recalls, digital patient forms. GDPR compliant. Free 14-day trial.',
    relatedIndustries: [
      { name: 'Clinics', slug: 'clinics' },
      { name: 'Physiotherapy', slug: 'physiotherapy' },
      { name: 'Wellness', slug: 'wellness' },
    ],
  },

  wellness: {
    slug: 'wellness',
    name: 'Wellness Centres',
    headline: 'Booking software for wellness and holistic health centres',
    subheadline: 'Manage treatments, therapists, and classes from one calm, organised dashboard.',
    description: 'Inboker gives wellness centres a flexible booking system for treatments, classes, and consultations — with digital intake forms, therapist calendars, and reminders that keep clients coming back.',
    painPoints: [
      'Managing diverse treatment types across multiple therapists',
      'Clients forgetting appointments and no-showing',
      'Paper consultation forms creating admin before each session',
      'No system to track treatment history across multiple visits',
    ],
    features: [
      { title: 'Multi-therapist scheduling', description: 'Each therapist has their own calendar. Clients book the person and treatment they need.' },
      { title: 'Digital consultation forms', description: 'Create intake forms for each treatment type. Clients complete them before arriving.' },
      { title: 'Treatment history tracking', description: 'See every treatment a client has had, products used, therapist notes, and next steps.' },
      { title: 'Automated reminders', description: 'SMS and email reminders before every appointment. Fewer no-shows, more returning clients.' },
      { title: 'Packages and courses', description: 'Sell treatment courses or wellness packages. Track sessions remaining per client.' },
      { title: 'Online payments', description: 'Charge for single treatments or packages at booking through Stripe.' },
    ],
    stats: [
      { value: '92%', label: 'Fewer no-shows' },
      { value: '38%', label: 'More new bookings' },
      { value: '5 min', label: 'Setup time' },
      { value: '400+', label: 'Wellness centres using Inboker' },
    ],
    faqs: [
      { question: 'Can I manage both individual treatments and group classes?', answer: 'Yes. Set up any combination — one-to-one massage, reiki, yoga class — each with their own capacity, duration, and price.' },
      { question: 'Does it work for different types of wellness therapy?', answer: 'Yes. Inboker is used by massage therapists, acupuncturists, reiki practitioners, naturopaths, nutritionists, and more.' },
    ],
    testimonial: {
      quote: 'We went from juggling three tools to just Inboker. Simpler, faster, and our clients love the booking experience.',
      author: 'Nina T.',
      role: 'Centre Manager',
      business: 'Zen Wellness Centre',
    },
    metaTitle: 'Wellness Centre Booking Software | Holistic Health Scheduling | Inboker',
    metaDescription: 'Online booking software for wellness centres and holistic health practices. Multi-therapist scheduling, intake forms, treatment packages. Free 14-day trial.',
    relatedIndustries: [
      { name: 'Clinics', slug: 'clinics' },
      { name: 'Yoga Studios', slug: 'yoga-studios' },
      { name: 'Pilates', slug: 'pilates' },
    ],
  },

  pilates: {
    slug: 'pilates',
    name: 'Pilates Studios',
    headline: 'Class booking software for pilates studios',
    subheadline: 'Manage reformer classes, mat classes, and 1-to-1 sessions from one simple system.',
    description: 'Inboker gives pilates studios a professional booking system for reformer classes, mat classes, and private sessions — with class capacity limits, waitlists, and automated client reminders.',
    painPoints: [
      'Limited reformer equipment creating capacity management headaches',
      'Managing both class and private session bookings separately',
      'Clients dropping in without booking and overcrowding classes',
      'No easy system to sell class passes or course blocks',
    ],
    features: [
      { title: 'Equipment-based capacity', description: 'Set exact capacity per class based on available reformers or mat spaces. No overcrowding.' },
      { title: 'Class and private session booking', description: 'Clients can book group reformer classes, mat classes, or 1-to-1 private Pilates sessions from the same page.' },
      { title: 'Class pass management', description: 'Sell 5, 10, or 20-class passes. Inboker tracks remaining sessions per client automatically.' },
      { title: 'Waitlist system', description: 'When a class is full, clients can join a waitlist and are notified automatically if a spot opens.' },
      { title: 'Instructor scheduling', description: 'Multiple instructors with independent schedules. Clients can choose their preferred teacher.' },
      { title: 'SMS reminders', description: 'Class reminders keep attendance high and reduce last-minute cancellations.' },
    ],
    stats: [
      { value: '92%', label: 'Fewer no-shows' },
      { value: '0', label: 'Overcrowded classes' },
      { value: '38%', label: 'More new student bookings' },
      { value: '5 min', label: 'Setup time' },
    ],
    faqs: [
      { question: 'Can I set different capacities for reformer and mat classes?', answer: 'Yes. Each class type has its own capacity setting. Reformer classes can be capped at 8 while mat classes allow 15.' },
      { question: 'Does Inboker support class passes?', answer: 'Yes. Sell multi-class passes and Inboker automatically tracks how many sessions each client has remaining.' },
    ],
    testimonial: {
      quote: 'Managing reformer class capacity used to be a nightmare. Now it\'s handled automatically and we never overbook.',
      author: 'Clara M.',
      role: 'Studio Owner',
      business: 'Core Pilates Studio',
    },
    metaTitle: 'Pilates Studio Booking Software | Class Scheduling System | Inboker',
    metaDescription: 'Booking software for pilates studios. Class capacity limits, waitlists, class passes, and 1-to-1 session booking. Free 14-day trial.',
    relatedIndustries: [
      { name: 'Yoga Studios', slug: 'yoga-studios' },
      { name: 'Personal Trainers', slug: 'personal-trainers' },
      { name: 'Wellness', slug: 'wellness' },
    ],
  },

  lawyers: {
    slug: 'lawyers',
    name: 'Law Firms',
    headline: 'Client appointment scheduling for law firms and solicitors',
    subheadline: 'Let clients book consultations and case meetings without the phone-tag.',
    description: 'Inboker gives law firms and solicitors a professional client scheduling system for initial consultations, case review meetings, and ongoing client appointments.',
    painPoints: [
      'Coordinating client meetings across multiple solicitors and practice areas',
      'Prospective clients dropping off when they can\'t easily book a consultation',
      'Missed meetings and no-shows wasting billable time',
      'No intake system to qualify clients before the first meeting',
    ],
    features: [
      { title: 'Consultation booking', description: 'Prospective clients book an initial consultation online — 24/7, without calling the firm.' },
      { title: 'Pre-meeting intake forms', description: 'Collect case type, urgency level, and background before the first meeting so solicitors can prepare.' },
      { title: 'Solicitor-specific scheduling', description: 'Each solicitor manages their own diary. Clients book the right person for their matter.' },
      { title: 'Confidential data handling', description: 'All client data is encrypted at rest and in transit. GDPR compliant.' },
      { title: 'Meeting reminders', description: 'Automated reminders reduce missed appointments and ensure clients show up prepared.' },
      { title: 'Paid consultation setup', description: 'Charge a fixed fee for initial consultations through Stripe at the point of booking.' },
    ],
    stats: [
      { value: '38%', label: 'More consultation bookings' },
      { value: '92%', label: 'Fewer missed meetings' },
      { value: '100%', label: 'GDPR compliant' },
      { value: '5 min', label: 'Setup time' },
    ],
    faqs: [
      { question: 'Can I charge for initial consultations?', answer: 'Yes. Set a fixed fee for initial consultations and collect payment via Stripe at booking.' },
      { question: 'Can clients book specific solicitors or practice areas?', answer: 'Yes. Set up separate booking pages per solicitor or by practice area (family law, conveyancing, employment).' },
    ],
    testimonial: {
      quote: 'Prospects used to drop off because they couldn\'t reach us by phone. Now they book a consultation instantly from our website.',
      author: 'Sarah C.',
      role: 'Senior Solicitor',
      business: 'Carlisle & Partners',
    },
    metaTitle: 'Law Firm Appointment Scheduling Software | Client Booking System | Inboker',
    metaDescription: 'Online appointment scheduling for law firms and solicitors. Client intake forms, consultation booking, GDPR compliant. Free 14-day trial.',
    relatedIndustries: [
      { name: 'Consultants', slug: 'consultants' },
      { name: 'Accountants', slug: 'accountants' },
      { name: 'Clinics', slug: 'clinics' },
    ],
  },

  accountants: {
    slug: 'accountants',
    name: 'Accountants',
    headline: 'Client meeting scheduling for accountants and bookkeepers',
    subheadline: 'Manage client appointments across tax season and beyond without the email chaos.',
    description: 'Inboker gives accounting practices a professional scheduling tool for client meetings, review sessions, and new client consultations — with intake forms and automated reminders.',
    painPoints: [
      'Email back-and-forth to schedule client review meetings',
      'Tax season meeting volume overwhelming the front desk',
      'New client onboarding requiring multiple touchpoints before the first meeting',
      'No easy system to charge for consultations or advisory sessions',
    ],
    features: [
      { title: 'Client review meeting booking', description: 'Existing clients book their annual or quarterly review directly in your calendar without calling.' },
      { title: 'New client consultation booking', description: 'Prospects book an initial consultation and complete an intake form before you speak.' },
      { title: 'Pre-meeting document checklist', description: 'Include a document checklist in the confirmation email so clients come prepared.' },
      { title: 'Accountant-specific scheduling', description: 'Each accountant or advisor manages their own client diary independently.' },
      { title: 'Paid advisory session booking', description: 'Charge for specialist tax or advisory sessions at the point of booking through Stripe.' },
      { title: 'Automated meeting reminders', description: 'Clients receive reminders before meetings with any instructions attached.' },
    ],
    stats: [
      { value: '38%', label: 'More consultations booked' },
      { value: '92%', label: 'Fewer missed meetings' },
      { value: '60s', label: 'Client booking time' },
      { value: '5 min', label: 'Setup time' },
    ],
    faqs: [
      { question: 'Can clients book different types of meetings?', answer: 'Yes. Set up separate services for tax reviews, bookkeeping check-ins, and new client consultations — each with their own duration and price.' },
      { question: 'Can I send clients a document checklist before the meeting?', answer: 'Yes. Include instructions and document lists in your booking confirmation emails.' },
    ],
    testimonial: {
      quote: 'Tax season used to mean chaos. Now clients book their own review slots and we just show up prepared.',
      author: 'Daniel W.',
      role: 'Partner',
      business: 'Webb & Associates Accountants',
    },
    metaTitle: 'Client Meeting Scheduling for Accountants | Booking System | Inboker',
    metaDescription: 'Online meeting scheduling for accountants and bookkeepers. Client intake forms, review meeting booking, Stripe payments. Free 14-day trial.',
    relatedIndustries: [
      { name: 'Consultants', slug: 'consultants' },
      { name: 'Lawyers', slug: 'lawyers' },
      { name: 'Clinics', slug: 'clinics' },
    ],
  },

  'nail-studios': {
    slug: 'nail-studios',
    name: 'Nail Studios',
    headline: 'Online booking for nail studios and nail technicians',
    subheadline: 'Let clients book manicures, gel nails, and nail art 24/7. Fill every slot.',
    description: 'Inboker gives nail studios a professional booking system with service-specific scheduling, technician availability, deposit collection, and automated SMS reminders.',
    painPoints: [
      'Managing bookings through Instagram DMs and WhatsApp gets overwhelming',
      'Clients booking the wrong service length and causing schedule chaos',
      'No-shows on nail appointment slots losing revenue',
      'No easy way to charge deposits for longer nail art appointments',
    ],
    features: [
      { title: 'Service-specific durations', description: 'Set different durations for manicures (30 min), gel extensions (90 min), nail art (120 min). No more back-to-back scheduling conflicts.' },
      { title: 'Technician scheduling', description: 'Multiple nail technicians each with their own availability and client list.' },
      { title: 'Deposit collection', description: 'Require a deposit for longer nail art sessions to protect your time against no-shows.' },
      { title: 'Instagram booking link', description: 'One link in your Instagram bio. Clients book in 60 seconds without DMing.' },
      { title: 'SMS reminders', description: 'Automated reminders the day before and day-of to keep your schedule full.' },
      { title: 'Client style history', description: 'See what style and colour each client had last time — personalise every visit.' },
    ],
    stats: [
      { value: '92%', label: 'Fewer no-shows' },
      { value: '38%', label: 'More new client bookings' },
      { value: '60s', label: 'Client booking time' },
      { value: '5 min', label: 'Setup time' },
    ],
    faqs: [
      { question: 'Can I charge a deposit for nail art appointments?', answer: 'Yes. Set a deposit amount per service type. Clients pay via Stripe when they confirm their booking.' },
      { question: 'Can clients book specific nail technicians?', answer: 'Yes. Each technician has their own profile and availability. Clients can choose who they want.' },
    ],
    testimonial: {
      quote: 'No more Instagram DMs for bookings. Clients just tap the link and book themselves. My schedule fills up automatically.',
      author: 'Priya S.',
      role: 'Owner',
      business: 'Petal Nails Studio',
    },
    metaTitle: 'Nail Studio Booking Software | Online Appointment Scheduling | Inboker',
    metaDescription: 'Online booking system for nail studios and nail technicians. Service-specific scheduling, deposit collection, Instagram booking link. Free 14-day trial.',
    relatedIndustries: [
      { name: 'Hair Salons', slug: 'salons' },
      { name: 'Aesthetics', slug: 'aesthetics' },
      { name: 'Barbershops', slug: 'barbershops' },
    ],
  },

  'sports-coaching': {
    slug: 'sports-coaching',
    name: 'Sports Coaches',
    headline: 'Booking software for sports coaches and coaching academies',
    subheadline: 'Manage 1-to-1 coaching sessions, group training, and academies from one platform.',
    description: 'Inboker gives sports coaches and coaching academies a flexible scheduling system for individual sessions, group training, and recurring programmes — with automated reminders and payment collection.',
    painPoints: [
      'Managing session bookings via text and WhatsApp creates confusion',
      'No-shows on paid coaching sessions wasting your time',
      'Tracking session credits for coaching packages manually',
      'No professional booking page to convert website visitors into clients',
    ],
    features: [
      { title: '1-to-1 and group session booking', description: 'Run private coaching and group training from the same booking platform.' },
      { title: 'Coaching package credits', description: 'Sell coaching packages (e.g., 12-session academy block) and track sessions used per athlete.' },
      { title: 'SMS reminders', description: 'Athletes get reminded before sessions. Fewer no-shows, more focus on training.' },
      { title: 'Stripe payment at booking', description: 'Collect payment for single sessions or full packages at the point of booking.' },
      { title: 'Multiple coach scheduling', description: 'Academy with multiple coaches? Each manages their own client calendar.' },
      { title: 'Shareable booking link', description: 'One link for your website, social media, and WhatsApp. New clients book instantly.' },
    ],
    stats: [
      { value: '92%', label: 'Fewer no-shows' },
      { value: '38%', label: 'More new client bookings' },
      { value: '60s', label: 'Client booking time' },
      { value: '5 min', label: 'Setup time' },
    ],
    faqs: [
      { question: 'Can I sell coaching session packages?', answer: 'Yes. Create packages (e.g., 10-session block) and Inboker tracks remaining sessions per client automatically.' },
      { question: 'Does it work for group training sessions?', answer: 'Yes. Set capacity per session and clients book in until it\'s full.' },
    ],
    testimonial: {
      quote: 'My clients used to text me to book sessions. Now they book themselves and I just focus on coaching.',
      author: 'Tom B.',
      role: 'Head Coach',
      business: 'Elite Sports Academy',
    },
    metaTitle: 'Sports Coach Booking Software | Session Scheduling App | Inboker',
    metaDescription: 'Online booking for sports coaches and coaching academies. Package credits, group sessions, Stripe payments. Free 14-day trial.',
    relatedIndustries: [
      { name: 'Personal Trainers', slug: 'personal-trainers' },
      { name: 'Yoga Studios', slug: 'yoga-studios' },
      { name: 'Pilates', slug: 'pilates' },
    ],
  },
};

export function getIndustryData(slug: string): IndustryData | null {
  return industryData[slug] ?? null;
}

export function getAllIndustrySlugs(): string[] {
  return Object.keys(industryData);
}
