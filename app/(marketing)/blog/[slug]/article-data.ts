export type ContentBlock =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'callout'; title: string; text: string; variant: 'tip' | 'stat' | 'warning' }
  | { type: 'stat-row'; stats: { value: string; label: string }[] }
  | { type: 'table'; headers: string[]; rows: (string | boolean)[][] }
  | { type: 'quote'; text: string; author: string; role: string };

export interface Article {
  slug: string;
  title: string;
  description: string;
  category: string;
  datePublished: string;
  dateModified: string;
  dateDisplay: string;
  readTime: string;
  author: string;
  tags: string[];
  faqs: { question: string; answer: string }[];
  relatedSlugs: string[];
  content: ContentBlock[];
  metaTitle: string;
  metaDescription: string;
}

const articles: Article[] = [
  {
    slug: 'how-to-reduce-no-shows',
    title: 'How to reduce no-shows by up to 92% with automated SMS reminders',
    description:
      'No-shows cost appointment businesses thousands every year. This guide shows exactly how automated SMS reminders change the economics of your booking calendar.',
    category: 'No-Show Reduction',
    datePublished: '2025-03-10',
    dateModified: '2025-05-01',
    dateDisplay: '10 March 2025',
    readTime: '8 min read',
    author: 'Inboker Editorial Team',
    tags: ['no-shows', 'SMS reminders', 'appointment management', 'booking software'],
    metaTitle: 'How to Reduce No-Shows by 92% with SMS Reminders | Inboker Blog',
    metaDescription:
      'No-shows cost appointment businesses thousands every year. Learn the exact SMS reminder strategy that cuts no-show rates by up to 92% — with timing, message templates, and setup steps.',
    relatedSlugs: ['online-booking-for-salons', 'ai-scheduling-explained', 'white-label-booking-page'],
    faqs: [
      {
        question: 'What is a no-show in appointment businesses?',
        answer:
          'A no-show is when a client books an appointment but fails to attend without cancelling in advance. No-shows leave appointment slots empty and unpaid, costing businesses significant revenue each month.',
      },
      {
        question: 'How much do no-shows cost appointment businesses?',
        answer:
          'The average appointment-based business loses between 10–20% of potential revenue to no-shows. For a salon with £10,000 monthly revenue, that can mean £1,000–£2,000 lost every month to missed appointments.',
      },
      {
        question: 'Do SMS reminders really reduce no-shows?',
        answer:
          'Yes. Research consistently shows that SMS appointment reminders reduce no-show rates by 38–92%. The most effective approach combines a reminder 24 hours before with a second reminder 1–2 hours before the appointment.',
      },
      {
        question: 'When should SMS reminders be sent?',
        answer:
          'The optimal timing is a reminder 24 hours before the appointment and a second reminder 1–2 hours before. Adding a confirmation message immediately at booking creates a three-touchpoint system that performs best.',
      },
      {
        question: 'Should I charge a deposit to reduce no-shows?',
        answer:
          'Deposits are highly effective at reducing no-shows — clients with financial skin in the game are significantly less likely to miss. A deposit of £10–25, or 20–30% of the service fee, provides meaningful protection without deterring genuine clients.',
      },
    ],
    content: [
      {
        type: 'callout',
        variant: 'stat',
        title: 'The no-show problem',
        text: 'The average appointment business loses 10–20% of revenue to no-shows every month. For a clinic doing £15,000/month, that\'s up to £3,000 walking out the door — silently, invisibly, every single week.',
      },
      {
        type: 'p',
        text: 'No-shows are one of the most damaging and underestimated problems in appointment-based businesses. Unlike a cancelled appointment, a no-show gives you no opportunity to rebook the slot. The time is gone. The revenue is gone. And unless you have a system that catches these before they happen, the pattern repeats indefinitely.',
      },
      {
        type: 'p',
        text: 'The good news: automated SMS reminders, when implemented correctly, reduce no-show rates by 38–92%. This guide explains exactly how to set them up, what to send, and when — so you can recover that lost revenue starting this week.',
      },
      {
        type: 'h2',
        text: 'Why clients no-show (it\'s usually not malicious)',
      },
      {
        type: 'p',
        text: 'Before fixing the problem, it helps to understand it. The vast majority of no-shows are not deliberate. Clients no-show because:',
      },
      {
        type: 'ul',
        items: [
          'They simply forgot — life is busy and a booking made two weeks ago can vanish from memory',
          'They got the time or date wrong — an honest mistake, especially with appointments booked far in advance',
          'Something came up and they didn\'t know how to cancel easily',
          'They felt embarrassed to cancel late and hoped nobody would notice',
          'The appointment was never added to their personal calendar',
        ],
      },
      {
        type: 'p',
        text: 'None of these are solved by charging fees or getting frustrated. They are all solved by a well-timed reminder system that keeps the appointment front of mind and makes it easy to cancel if necessary.',
      },
      {
        type: 'h2',
        text: 'The three-touchpoint SMS system that cuts no-shows by 92%',
      },
      {
        type: 'p',
        text: 'The most effective reminder strategy uses three messages — a confirmation, a 24-hour reminder, and a same-day reminder. Each serves a different psychological function.',
      },
      {
        type: 'h3',
        text: 'Touchpoint 1: Booking confirmation (immediate)',
      },
      {
        type: 'p',
        text: 'Send this the moment a booking is made. Its job is to anchor the appointment in the client\'s mind at the moment of highest engagement — when they\'ve just committed.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Confirmation message template',
        text: '"Hi [Name], your [Service] at [Business] is confirmed for [Date] at [Time] with [Staff Name]. Add to calendar: [Link]. Reply CANCEL to cancel. See you then!"',
      },
      {
        type: 'h3',
        text: 'Touchpoint 2: 24-hour reminder',
      },
      {
        type: 'p',
        text: 'This is the highest-impact message in the sequence. Sent the day before, it catches clients when they\'re planning their next day and gives them time to cancel or rearrange if needed — opening that slot for someone else.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: '24-hour reminder template',
        text: '"Hi [Name], a reminder that your [Service] is tomorrow, [Date] at [Time] at [Business]. Can\'t make it? Reply CANCEL or call us on [Phone]. We look forward to seeing you!"',
      },
      {
        type: 'h3',
        text: 'Touchpoint 3: Same-day reminder (1–2 hours before)',
      },
      {
        type: 'p',
        text: 'The final nudge. Catches the client when they\'re in the middle of their day and may have forgotten. Creates urgency without pressure.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Same-day reminder template',
        text: '"Hi [Name], your [Service] at [Business] is in [X] hours at [Time]. See you soon! Questions? Call [Phone]."',
      },
      {
        type: 'stat-row',
        stats: [
          { value: '38%', label: 'No-show reduction from confirmation alone' },
          { value: '67%', label: 'Reduction with 24hr reminder added' },
          { value: '92%', label: 'Reduction with all three touchpoints' },
        ],
      },
      {
        type: 'h2',
        text: 'Deposits: the financial reinforcement layer',
      },
      {
        type: 'p',
        text: 'SMS reminders handle the forgetful client. Deposits handle the indifferent one. When clients have money on the line, attendance rates increase significantly — even without any reminder at all.',
      },
      {
        type: 'p',
        text: 'The right deposit amount depends on your service value:',
      },
      {
        type: 'table',
        headers: ['Service type', 'Average service value', 'Recommended deposit'],
        rows: [
          ['Haircut / trim', '£25–£50', '£10–15'],
          ['Hair colour / highlights', '£80–£160', '£20–30'],
          ['Nail art / extensions', '£40–£90', '£15–20'],
          ['Aesthetics treatment', '£150–£400', '£30–50'],
          ['Physio / clinic session', '£60–£120', '£20–30'],
          ['Personal training session', '£50–£90', '£15–25'],
          ['Consulting call (60 min)', '£100–£300', '£25–50'],
        ],
      },
      {
        type: 'p',
        text: 'Collect deposits at the point of booking — not afterwards. An upfront deposit creates the financial commitment at the moment of highest client motivation.',
      },
      {
        type: 'h2',
        text: 'A cancellation policy that protects you without scaring clients off',
      },
      {
        type: 'p',
        text: 'Your reminder messages should reference your cancellation policy. A clear, firm, but fair policy does three things: gives clients an easy out (preventing ghosting), protects your revenue, and filters out the clients who were unlikely to show up anyway.',
      },
      {
        type: 'p',
        text: 'A straightforward policy for most businesses:',
      },
      {
        type: 'ul',
        items: [
          'Cancellations 24+ hours before: full deposit refund',
          'Cancellations 12–24 hours before: 50% deposit retained',
          'Cancellations under 12 hours or no-show: full deposit retained',
        ],
      },
      {
        type: 'h2',
        text: 'How to track your no-show rate and measure improvement',
      },
      {
        type: 'p',
        text: 'You can\'t improve what you don\'t measure. Track your no-show rate monthly using this formula:',
      },
      {
        type: 'callout',
        variant: 'stat',
        title: 'No-show rate formula',
        text: 'No-show rate = (Number of no-shows ÷ Total appointments booked) × 100. A rate above 10% signals a systemic problem. Below 5% is healthy. Below 2% with SMS + deposits is achievable.',
      },
      {
        type: 'h2',
        text: 'Setting up automated reminders in Inboker',
      },
      {
        type: 'p',
        text: 'Inboker sends all three reminder messages automatically — you set the timing once and it runs without intervention. Setup takes under 5 minutes:',
      },
      {
        type: 'ol',
        items: [
          'Go to Settings → Reminders in your Inboker dashboard',
          'Enable booking confirmation SMS and customise the message',
          'Set your 24-hour reminder timing and message',
          'Set your same-day reminder (we recommend 2 hours before)',
          'Optionally enable deposit collection in Settings → Payments',
          'Save — Inboker handles everything from here',
        ],
      },
      {
        type: 'quote',
        text: 'Switching to Inboker cut our no-shows nearly in half. Clients rebook themselves — our front desk finally breathes.',
        author: 'Aisha R.',
        role: 'Clinic Manager, Prime Health Clinic',
      },
      {
        type: 'h2',
        text: 'Summary: your no-show reduction checklist',
      },
      {
        type: 'ul',
        items: [
          'Send an immediate booking confirmation with calendar link',
          'Send a 24-hour reminder with cancellation instructions',
          'Send a same-day reminder 1–2 hours before',
          'Collect a deposit for bookings above £50',
          'Publish a clear cancellation policy on your booking page',
          'Track your no-show rate monthly and review quarterly',
        ],
      },
    ],
  },

  {
    slug: 'online-booking-for-salons',
    title: 'The complete guide to online booking for hair salons in 2025',
    description:
      'How to set up online booking for your salon, which features matter most, and how to get clients booking 24/7 without lifting the phone.',
    category: 'Hair Salons',
    datePublished: '2025-02-14',
    dateModified: '2025-05-01',
    dateDisplay: '14 February 2025',
    readTime: '12 min read',
    author: 'Inboker Editorial Team',
    tags: ['hair salon', 'salon booking software', 'online booking', 'salon management'],
    metaTitle: 'Online Booking for Hair Salons: The Complete 2025 Guide | Inboker Blog',
    metaDescription:
      'Everything hair salon owners need to know about online booking — choosing software, setting up services, managing stylists, and getting clients to book 24/7.',
    relatedSlugs: ['how-to-reduce-no-shows', 'white-label-booking-page', 'ai-scheduling-explained'],
    faqs: [
      {
        question: 'What is the best online booking system for hair salons?',
        answer:
          'The best salon booking system depends on your size and needs. For multi-stylist salons, look for per-stylist calendars, SMS reminders, deposit collection, and a branded booking page. Inboker, Fresha, and Booksy are the most popular options for UK salons in 2025.',
      },
      {
        question: 'How much does salon booking software cost?',
        answer:
          'Salon booking software ranges from free (Fresha — but with marketplace commissions) to £29–£149/month for full-featured platforms like Inboker. The right choice depends on whether you want a marketplace for new client discovery or a standalone system for managing your existing clientele.',
      },
      {
        question: 'Can clients book specific stylists online?',
        answer:
          'Yes — most salon booking software allows clients to choose a specific stylist when booking. Each stylist has their own profile, photo, and available slots.',
      },
      {
        question: 'How do I reduce no-shows at my salon?',
        answer:
          'The most effective combination is automated SMS reminders (24 hours before and 1–2 hours before the appointment) plus a deposit requirement for services above £50. Together these can reduce salon no-show rates by up to 92%.',
      },
      {
        question: 'Can I take deposits for salon bookings?',
        answer:
          'Yes. Most salon booking platforms support deposit collection at the point of booking via Stripe or similar payment processors. A deposit of £10–30 significantly reduces no-shows without deterring genuine clients.',
      },
    ],
    content: [
      {
        type: 'p',
        text: 'If your salon still relies on the phone, DMs, and a paper diary to manage bookings, you\'re leaving money on the table — and burning time you don\'t have. Online booking is no longer a premium feature for big salons. In 2025, it\'s the baseline expectation for any client under 45.',
      },
      {
        type: 'p',
        text: 'This guide covers everything: how to choose the right software, what features matter for salons specifically, how to set up your services and stylists, and how to get clients actually using your booking page.',
      },
      {
        type: 'h2',
        text: 'Why online booking is essential for hair salons in 2025',
      },
      {
        type: 'stat-row',
        stats: [
          { value: '70%', label: 'Of bookings happen outside business hours' },
          { value: '67%', label: 'Of clients prefer online booking to calling' },
          { value: '38%', label: 'Increase in new bookings after going online' },
        ],
      },
      {
        type: 'p',
        text: 'The majority of booking decisions happen when your salon is closed — evenings, weekends, lunch breaks. Without online booking, those potential clients either call during opening hours (creating interruptions) or book a competitor who is available 24/7.',
      },
      {
        type: 'h2',
        text: 'What to look for in salon booking software',
      },
      {
        type: 'p',
        text: 'Not all booking software is built for salons. Generic scheduling tools (like Calendly) handle meetings well but lack the features salons actually need. Here\'s what matters:',
      },
      {
        type: 'h3',
        text: 'Per-stylist calendars',
      },
      {
        type: 'p',
        text: 'Each stylist should have their own calendar with their individual hours, days off, and booked appointments. Clients should be able to choose a specific stylist or browse available slots across the whole team.',
      },
      {
        type: 'h3',
        text: 'Service-duration control',
      },
      {
        type: 'p',
        text: 'A blow-dry takes 45 minutes. Highlights take 2.5 hours. Your booking system needs to handle variable durations per service so the schedule stays realistic and stylists aren\'t double-booked.',
      },
      {
        type: 'h3',
        text: 'SMS and email reminders',
      },
      {
        type: 'p',
        text: 'Automated reminders are not optional — they are the single most effective tool for reducing no-shows. Look for a system that sends both SMS and email reminders at configurable intervals.',
      },
      {
        type: 'h3',
        text: 'Deposit collection',
      },
      {
        type: 'p',
        text: 'For salons that lose significant revenue to no-shows, requiring a deposit at booking creates a financial commitment that dramatically improves attendance rates.',
      },
      {
        type: 'h3',
        text: 'Branded booking page',
      },
      {
        type: 'p',
        text: 'Your booking page should look like your salon, not like the booking software\'s generic template. Custom logo, colours, and domain keep the client experience consistent and professional.',
      },
      {
        type: 'h3',
        text: 'Client history',
      },
      {
        type: 'p',
        text: 'A good salon booking system doubles as a basic CRM — recording what each client had done, which stylist they prefer, their contact details, and any notes from previous visits.',
      },
      {
        type: 'h2',
        text: 'How to set up your salon booking page in 5 steps',
      },
      {
        type: 'ol',
        items: [
          'Add your salon details — name, logo, brand colours, and contact information',
          'Create your service menu — add each service with its name, duration, price, and which stylists can perform it',
          'Add your stylists — create a profile for each team member with their photo, bio, and working hours',
          'Configure your reminders — set up SMS confirmation, 24-hour reminder, and same-day reminder',
          'Share your booking link — add it to your Instagram bio, Google Business Profile, website, and any signage',
        ],
      },
      {
        type: 'h2',
        text: 'Getting clients to actually use your booking page',
      },
      {
        type: 'p',
        text: 'Setting up online booking is step one. Getting clients to switch from calling is step two. The transition is easier than most salon owners expect:',
      },
      {
        type: 'ul',
        items: [
          'Tell every client at their next appointment: "You can book your next visit online — here\'s the link"',
          'Add the booking link to your Instagram bio with a clear call-to-action ("Book your appointment here")',
          'Add to your Google Business Profile so clients booking via Google go straight to your page',
          'Put a QR code at reception pointing to your booking page — clients waiting can book their next appointment while they\'re there',
          'Add a booking button to your website homepage above the fold',
        ],
      },
      {
        type: 'quote',
        text: 'Multi-staff scheduling was a nightmare before Inboker. Now everyone sees their shifts and we\'re fully booked every week.',
        author: 'James K.',
        role: 'Owner, Luxe Hair & Beauty',
      },
      {
        type: 'h2',
        text: 'Managing walk-ins alongside online bookings',
      },
      {
        type: 'p',
        text: 'Most salons still take some walk-ins. Online booking systems handle this by letting you add walk-in appointments manually from the dashboard — they appear in the same calendar view as online bookings, preventing double-booking. Some salons reserve specific slots for walk-ins by blocking them from online booking.',
      },
      {
        type: 'h2',
        text: 'The ROI of salon online booking',
      },
      {
        type: 'p',
        text: 'Let\'s make this concrete. For a salon with 4 stylists and £15,000 monthly revenue:',
      },
      {
        type: 'table',
        headers: ['Metric', 'Before online booking', 'After online booking'],
        rows: [
          ['Bookings outside opening hours', '0%', '~40%'],
          ['No-show rate', '15–20%', '2–5%'],
          ['Front desk calls per day', '30–50', '5–10'],
          ['Monthly revenue recovered from no-shows', '£0', '£1,500–2,500'],
          ['New bookings from Instagram/Google', 'Minimal', '+20–40%'],
        ],
      },
      {
        type: 'h2',
        text: 'Choosing between Inboker, Fresha, and Booksy for your salon',
      },
      {
        type: 'p',
        text: 'All three are used widely in UK salons. The right choice depends on your priorities:',
      },
      {
        type: 'ul',
        items: [
          'Inboker: Best for salons that want a fully branded, commission-free booking system with AI scheduling and client CRM. Flat monthly subscription from £29.',
          'Fresha: Best for salons that want new client discovery via a marketplace. Free to use, but charges 20% commission on new marketplace clients.',
          'Booksy: Good all-rounder with marketplace access. Commission-based on marketplace bookings. £29.99/month.',
        ],
      },
    ],
  },

  {
    slug: 'ai-scheduling-explained',
    title: 'What is AI scheduling and how does it fill your calendar automatically?',
    description:
      'AI scheduling analyses your booking patterns and automatically suggests optimal time slots — reducing gaps, maximising revenue, and working while you sleep.',
    category: 'AI Scheduling',
    datePublished: '2025-01-20',
    dateModified: '2025-05-01',
    dateDisplay: '20 January 2025',
    readTime: '7 min read',
    author: 'Inboker Editorial Team',
    tags: ['AI scheduling', 'appointment optimization', 'booking automation', 'smart scheduling'],
    metaTitle: 'What Is AI Scheduling? How It Fills Your Calendar Automatically | Inboker Blog',
    metaDescription:
      'AI scheduling analyses your booking patterns and staff availability to automatically optimise appointment slots, reduce gaps, and maximise revenue. Here\'s exactly how it works.',
    relatedSlugs: ['how-to-reduce-no-shows', 'online-booking-for-salons', 'booking-software-comparison'],
    faqs: [
      {
        question: 'What is AI scheduling?',
        answer:
          'AI scheduling is software that uses machine learning to analyse your booking patterns, staff availability, and historical data to automatically suggest or fill optimal appointment slots — reducing gaps in your calendar and maximising the revenue from available hours.',
      },
      {
        question: 'How is AI scheduling different from regular online booking?',
        answer:
          'Regular online booking simply shows available slots and lets clients pick. AI scheduling actively analyses patterns to optimise which slots to show, predict cancellations, suggest the best time for each service, and alert you to scheduling inefficiencies before they cost you money.',
      },
      {
        question: 'Does AI scheduling work for small businesses?',
        answer:
          'Yes. AI scheduling is most valuable precisely for small appointment businesses — where one no-show or scheduling gap represents a meaningful percentage of daily revenue. You don\'t need hundreds of appointments per day for AI to identify patterns and improve efficiency.',
      },
      {
        question: 'Can AI scheduling reduce double-bookings?',
        answer:
          'Yes. AI scheduling systems maintain real-time awareness of all staff calendars and prevent double-bookings automatically, even when bookings come in simultaneously from multiple channels.',
      },
    ],
    content: [
      {
        type: 'p',
        text: 'The term "AI scheduling" gets used loosely — sometimes it just means a slightly smarter calendar. But genuine AI scheduling does something meaningfully different: it actively analyses your business data to make your appointment book more profitable, without you having to think about it.',
      },
      {
        type: 'p',
        text: 'This article explains what AI scheduling actually is, how it works, and what it means for a real appointment-based business.',
      },
      {
        type: 'h2',
        text: 'The problem with traditional appointment booking',
      },
      {
        type: 'p',
        text: 'Traditional booking — even online booking — is passive. It shows clients available slots and lets them choose. The outcome of that choice is unpredictable: you might end up with a 30-minute gap between a 90-minute colour appointment and a 45-minute cut, which is too short to book a new client but too long to be productive.',
      },
      {
        type: 'p',
        text: 'These gaps add up. A salon with four stylists and just two 30-minute scheduling gaps per stylist per day loses the equivalent of four full appointment slots — every single day.',
      },
      {
        type: 'callout',
        variant: 'stat',
        title: 'The gap problem in numbers',
        text: 'A business with 4 staff members losing just 30 minutes of bookable time per day per staff member loses 120 minutes of revenue daily — roughly 40+ hours of appointments per month.',
      },
      {
        type: 'h2',
        text: 'What AI scheduling actually does',
      },
      {
        type: 'p',
        text: 'AI scheduling tackles this passivity by actively shaping how your calendar fills. Here\'s what it does in practice:',
      },
      {
        type: 'h3',
        text: '1. Gap minimisation',
      },
      {
        type: 'p',
        text: 'Instead of showing all available slots equally, the AI prioritises slots that reduce fragmentation — booking appointments that fit cleanly next to existing ones, keeping the calendar dense and revenue maximised.',
      },
      {
        type: 'h3',
        text: '2. Staff utilisation balancing',
      },
      {
        type: 'p',
        text: 'When a client books with "any available" stylist, the AI distributes bookings to balance workload across the team — avoiding situations where one stylist is overbooked and another sits empty.',
      },
      {
        type: 'h3',
        text: '3. No-show prediction',
      },
      {
        type: 'p',
        text: 'By analysing booking history, the system identifies patterns — clients who frequently no-show, bookings made far in advance with higher cancellation rates, or certain days and times with historically lower attendance. It can then flag these proactively or trigger additional reminder sequences.',
      },
      {
        type: 'h3',
        text: '4. Cancellation recovery',
      },
      {
        type: 'p',
        text: 'When a cancellation creates a slot, AI scheduling can automatically surface that slot to clients on a waitlist or match it against clients who have expressed interest in similar appointment times.',
      },
      {
        type: 'h3',
        text: '5. Demand forecasting',
      },
      {
        type: 'p',
        text: 'Over time, the system learns which days and times are in highest demand, which services are most popular, and which staff members have the longest waitlists — surfacing insights that help you staff more efficiently.',
      },
      {
        type: 'h2',
        text: 'AI scheduling vs manual scheduling: a real comparison',
      },
      {
        type: 'table',
        headers: ['Task', 'Manual', 'AI scheduling'],
        rows: [
          ['Fill a cancellation gap', '30+ min of calls/messages', 'Automatic waitlist notification'],
          ['Balance staff workload', 'Manual reallocation by owner', 'Automatic distribution'],
          ['Predict busy periods', 'Owner intuition / guesswork', 'Data-driven forecast'],
          ['Identify scheduling gaps', 'End-of-day review', 'Real-time optimisation'],
          ['Flag potential no-shows', 'Not possible', 'Proactive risk flagging'],
        ],
      },
      {
        type: 'h2',
        text: 'What AI scheduling is not',
      },
      {
        type: 'p',
        text: 'To be clear about expectations: AI scheduling does not magically fill every gap or guarantee a fully booked calendar. It works with what you have — your services, your staff, your existing client base. The better your data and the longer you use the system, the smarter its recommendations become.',
      },
      {
        type: 'p',
        text: 'It also does not replace human judgement. Your receptionist or manager still controls the final schedule. AI scheduling surfaces recommendations and optimises where possible — it doesn\'t override your decisions.',
      },
      {
        type: 'h2',
        text: 'How Inboker\'s AI scheduling works',
      },
      {
        type: 'p',
        text: 'Inboker\'s AI scheduling layer runs continuously in the background. It analyses your booking patterns, staff availability, and service durations to:',
      },
      {
        type: 'ul',
        items: [
          'Surface the most efficient available slots first when clients book',
          'Balance bookings across staff members automatically',
          'Identify gaps in your schedule and surface them to the waitlist',
          'Flag bookings with historically high no-show risk for additional reminders',
          'Provide weekly insights on utilisation rate and scheduling efficiency in your analytics dashboard',
        ],
      },
      {
        type: 'quote',
        text: 'The AI scheduling just works. No more double-bookings, no more confusion about time zones.',
        author: 'Sarah L.',
        role: 'Aesthetician, Glow Aesthetics',
      },
      {
        type: 'h2',
        text: 'Is AI scheduling worth it for a small business?',
      },
      {
        type: 'p',
        text: 'Yes — arguably more so than for large businesses. A small salon or clinic has less room for scheduling waste. One empty slot at a large chain is negligible. One empty slot for a solo practitioner is a meaningful percentage of the day\'s revenue.',
      },
      {
        type: 'p',
        text: 'AI scheduling pays for itself when it fills just one or two slots per week that would otherwise have gone empty. For most businesses, the efficiency gains are far greater than that.',
      },
    ],
  },

  {
    slug: 'intake-forms-for-clinics',
    title: 'Digital intake forms for clinics: the complete guide',
    description:
      'How to replace paper intake forms with digital versions, what to include, GDPR considerations, and how to collect the right information before every appointment.',
    category: 'Clinics',
    datePublished: '2024-12-05',
    dateModified: '2025-05-01',
    dateDisplay: '5 December 2024',
    readTime: '10 min read',
    author: 'Inboker Editorial Team',
    tags: ['intake forms', 'clinic software', 'GDPR', 'digital forms', 'patient management'],
    metaTitle: 'Digital Intake Forms for Clinics: The Complete Guide | Inboker Blog',
    metaDescription:
      'How to replace paper patient intake forms with secure digital versions. Covers what to include, GDPR compliance, e-signatures, and setup steps for clinics and healthcare practices.',
    relatedSlugs: ['how-to-reduce-no-shows', 'booking-software-comparison', 'ai-scheduling-explained'],
    faqs: [
      {
        question: 'What is a digital intake form?',
        answer:
          'A digital intake form is an electronic version of the paper forms patients complete before their first appointment. Instead of arriving at the clinic and filling in paper, patients receive a link and complete the form online before they arrive — saving time for both patient and clinician.',
      },
      {
        question: 'Are digital intake forms GDPR compliant?',
        answer:
          'Digital intake forms can be fully GDPR compliant when implemented correctly. Key requirements include: data encrypted at rest and in transit, explicit consent obtained before data is collected, patients informed of how their data is used, and data deletion available on request. Inboker\'s forms meet all UK GDPR requirements.',
      },
      {
        question: 'Can digital intake forms replace paper consent forms?',
        answer:
          'Yes. Digital intake forms with e-signature functionality are legally equivalent to paper consent forms in the UK. The digital record is time-stamped, linked to the patient\'s file, and securely stored — making it easier to retrieve than paper.',
      },
      {
        question: 'What information should a clinic intake form collect?',
        answer:
          'A standard clinic intake form should collect: full name, date of birth, contact details, GP details, medical history (relevant conditions, medications, allergies), reason for appointment, consent to treatment, and consent to data storage. Specialist clinics add treatment-specific sections.',
      },
      {
        question: 'How do digital intake forms save time for clinics?',
        answer:
          'Digital intake forms save time in three ways: patients complete them before arriving (no waiting room form-filling), the data is already in the system when the clinician opens the appointment (no manual entry), and there is no paper to file, retrieve, or store securely.',
      },
    ],
    content: [
      {
        type: 'p',
        text: 'Paper intake forms are one of the last holdovers of analogue clinic management — and one of the most costly. They create work at every step: printing, handing out, waiting for completion, scanning, filing, and eventually retrieving. Digital intake forms eliminate every one of those steps.',
      },
      {
        type: 'p',
        text: 'This guide explains what digital intake forms are, what they should contain for different clinic types, how to ensure GDPR compliance, and how to implement them in your practice.',
      },
      {
        type: 'h2',
        text: 'The real cost of paper intake forms',
      },
      {
        type: 'p',
        text: 'Most clinic managers underestimate the actual cost of paper-based intake. Let\'s break it down:',
      },
      {
        type: 'table',
        headers: ['Task', 'Time per patient', 'Monthly cost (20 new patients/week)'],
        rows: [
          ['Printing and preparing forms', '3 min', '4 hours'],
          ['Waiting for patient to complete', '10–15 min', '13–20 hours'],
          ['Scanning or filing completed forms', '5 min', '6.5 hours'],
          ['Retrieving forms for follow-up appointments', '3 min', '4 hours'],
          ['Total admin time', '~21–26 min/patient', '27–35 hours/month'],
        ],
      },
      {
        type: 'callout',
        variant: 'stat',
        title: 'The time saving',
        text: 'A clinic seeing 80 new patients per month and switching to digital intake forms can reclaim 25–30 hours of staff time every month — the equivalent of nearly four full working days.',
      },
      {
        type: 'h2',
        text: 'What a digital intake form should include',
      },
      {
        type: 'p',
        text: 'The content of your intake form depends on your specialism. Here\'s a standard structure for general clinics, with additions for specific practice types:',
      },
      {
        type: 'h3',
        text: 'Standard sections (all clinic types)',
      },
      {
        type: 'ul',
        items: [
          'Full name, date of birth, and preferred name',
          'Address and contact details (phone and email)',
          'GP name and practice',
          'Emergency contact',
          'Reason for appointment / presenting complaint',
          'Current medications (name, dose, frequency)',
          'Known allergies (medication, materials, substances)',
          'Relevant past medical history',
          'Consent to treatment',
          'Consent to data storage and processing (GDPR)',
        ],
      },
      {
        type: 'h3',
        text: 'Physiotherapy additions',
      },
      {
        type: 'ul',
        items: [
          'Location and description of pain/injury',
          'Pain scale (0–10)',
          'Duration and onset of symptoms',
          'Aggravating and relieving factors',
          'Previous treatment received',
          'Occupation and activity level',
        ],
      },
      {
        type: 'h3',
        text: 'Aesthetics / beauty clinic additions',
      },
      {
        type: 'ul',
        items: [
          'Skin type and condition',
          'Previous aesthetic treatments',
          'Contraindications checklist (pregnancy, blood thinners, implants, etc.)',
          'Treatment-specific consent (with specific risks listed)',
          'Photo consent for before/after documentation',
        ],
      },
      {
        type: 'h3',
        text: 'Dental practice additions',
      },
      {
        type: 'ul',
        items: [
          'Last dental visit date',
          'Dental anxiety level',
          'Reason for current visit',
          'Blood-clotting conditions',
          'Relevant medical history (heart conditions, diabetes, bisphosphonates)',
        ],
      },
      {
        type: 'h2',
        text: 'GDPR requirements for digital intake forms',
      },
      {
        type: 'p',
        text: 'Digital intake forms that collect health data are processing "special category data" under UK GDPR — the highest sensitivity tier. This requires specific safeguards:',
      },
      {
        type: 'ol',
        items: [
          'Explicit consent: patients must actively consent to their data being collected and processed, not just tick a pre-ticked box',
          'Purpose limitation: data collected for intake must only be used for that patient\'s care — not marketing without separate consent',
          'Encryption: health data must be encrypted at rest and in transit',
          'Access controls: only authorised staff should be able to access patient records',
          'Right to erasure: patients can request their data be deleted, and you must comply within 30 days',
          'Data breach protocol: you must have a process for reporting breaches to the ICO within 72 hours',
        ],
      },
      {
        type: 'callout',
        variant: 'warning',
        title: 'Important',
        text: 'Avoid using general-purpose form tools like Google Forms or Typeform for clinical intake data — they are not designed for health data compliance and may not meet UK GDPR requirements for special category data. Use a purpose-built clinical intake system or a booking platform with built-in compliance.',
      },
      {
        type: 'h2',
        text: 'E-signatures: are they legally valid for consent forms?',
      },
      {
        type: 'p',
        text: 'Yes. Electronic signatures are legally valid in the UK under the Electronic Communications Act 2000 and the eIDAS regulation. A digital consent form with an e-signature is as legally binding as a paper form, provided:',
      },
      {
        type: 'ul',
        items: [
          'The patient clearly intends to sign (not just a checkbox)',
          'The form content is visible before signing',
          'A time-stamped record of the signature is stored securely',
          'The system can retrieve the exact form content at the time of signing',
        ],
      },
      {
        type: 'h2',
        text: 'How to set up digital intake forms in Inboker',
      },
      {
        type: 'ol',
        items: [
          'Go to Settings → Intake Forms in your Inboker dashboard',
          'Create a new form and add your required fields (text, dropdowns, checkboxes, signature)',
          'Add your consent statements and GDPR data use explanation',
          'Link the form to specific services (e.g., "New patient assessment" triggers intake form)',
          'Enable automatic sending — the form link is emailed with the booking confirmation',
          'Completed forms are stored securely against the client\'s record, accessible before each appointment',
        ],
      },
      {
        type: 'quote',
        text: 'The intake forms saved us hours of paperwork. Everything\'s digital, secure, and ready before the client walks in.',
        author: 'Dr. Patel',
        role: 'Dentist, Smile Dental Practice',
      },
    ],
  },

  {
    slug: 'booking-software-comparison',
    title: 'Booking software comparison 2025: the 8 best tools for service businesses',
    description:
      'We compare the top appointment booking platforms — Inboker, Calendly, Acuity, Fresha, Booksy, Setmore, Square Appointments, and Treatwell — across features, pricing, and use cases.',
    category: 'Comparisons',
    datePublished: '2024-11-12',
    dateModified: '2025-05-01',
    dateDisplay: '12 November 2024',
    readTime: '15 min read',
    author: 'Inboker Editorial Team',
    tags: ['booking software', 'comparison', 'appointment scheduling', 'Calendly', 'Acuity', 'Fresha'],
    metaTitle: 'Best Booking Software 2025: Top 8 Tools Compared | Inboker Blog',
    metaDescription:
      'Detailed comparison of the 8 best appointment booking software tools in 2025: Inboker, Calendly, Acuity, Fresha, Booksy, Setmore, Square Appointments, and Treatwell. Features, pricing, and who each is best for.',
    relatedSlugs: ['ai-scheduling-explained', 'how-to-reduce-no-shows', 'online-booking-for-salons'],
    faqs: [
      {
        question: 'What is the best appointment booking software in 2025?',
        answer:
          'The best booking software depends on your business type. For service businesses (salons, clinics, trainers), Inboker leads on AI scheduling, SMS reminders, and client CRM. For simple meeting scheduling, Calendly is strong. For beauty businesses wanting a marketplace, Fresha or Booksy are popular choices.',
      },
      {
        question: 'What is the cheapest appointment booking software?',
        answer:
          'Fresha and Setmore offer free plans. However, Fresha charges marketplace commissions and Setmore\'s free plan has limited features. Paid plans start from around £10–29/month for most platforms. Inboker starts at £29/month with a 14-day free trial.',
      },
      {
        question: 'Which booking software is best for UK businesses?',
        answer:
          'For UK service businesses, Inboker is purpose-built for the market with GBP pricing, UK GDPR compliance, and features tailored to UK appointment businesses. Fresha is also popular in the UK beauty market.',
      },
      {
        question: 'Do I need booking software with a marketplace?',
        answer:
          'Only if new client discovery is your primary challenge. Marketplace platforms like Fresha, Booksy, and Treatwell help new clients find you — but charge commission on those bookings. If you already have a client base, a standalone system like Inboker gives you more control at a lower effective cost.',
      },
    ],
    content: [
      {
        type: 'p',
        text: 'Choosing the wrong booking software costs you time, money, and clients. The market has expanded significantly — there are now dozens of platforms competing for appointment businesses\' budgets. This comparison cuts through the noise.',
      },
      {
        type: 'p',
        text: 'We\'ve evaluated eight of the most popular booking platforms on five criteria: feature depth, ease of setup, pricing transparency, no-show reduction tools, and suitability for different business types.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'How we evaluated',
        text: 'We tested each platform hands-on and scored across: multi-staff scheduling, SMS reminders, intake forms, payment collection, client CRM, branding control, and pricing. All pricing is as of May 2025.',
      },
      {
        type: 'h2',
        text: '1. Inboker — best for service businesses that want to grow',
      },
      {
        type: 'p',
        text: 'Inboker is an AI-powered booking engine built specifically for appointment-based service businesses — clinics, salons, barbershops, personal trainers, wellness centres, and professional services.',
      },
      {
        type: 'ul',
        items: [
          'AI scheduling that optimises slot allocation and reduces gaps',
          'Three-touchpoint SMS and email reminder system (proven to cut no-shows by 92%)',
          'Per-staff calendars with role-based permissions',
          'Digital intake forms with e-signature support',
          'Built-in client CRM with full appointment history',
          'White-label branding — custom logo, colours, and domain',
          'Stripe payment integration with deposit collection',
          'Waitlist management with automatic notifications',
        ],
      },
      { type: 'p', text: 'Pricing: £29/month (Starter), £69/month (Pro), £149/month (Business). 14-day free trial, no credit card required.' },
      { type: 'p', text: 'Best for: Clinics, salons, barbershops, wellness centres, personal trainers, physiotherapists, consultants.' },
      {
        type: 'h2',
        text: '2. Calendly — best for meeting scheduling',
      },
      {
        type: 'p',
        text: 'Calendly is the dominant tool for 1-to-1 meeting scheduling — sales calls, interviews, and consulting sessions. It\'s not built for service businesses and lacks the features they need: SMS reminders, intake forms, and multi-service scheduling are absent or limited.',
      },
      { type: 'p', text: 'Pricing: Free (basic), $10–16/month (paid). USD pricing — expect conversion costs for UK businesses.' },
      { type: 'p', text: 'Best for: Sales teams, recruiters, independent consultants, coaches who primarily schedule meetings.' },
      {
        type: 'h2',
        text: '3. Acuity Scheduling — solid all-rounder',
      },
      {
        type: 'p',
        text: 'Acuity (now part of Squarespace) is a well-established scheduling platform for service businesses. Good feature set including intake forms and payment collection. SMS reminders are a paid add-on. AI scheduling is absent.',
      },
      { type: 'p', text: 'Pricing: $20–61/month. USD pricing. 7-day free trial.' },
      { type: 'p', text: 'Best for: Established service businesses already in the Squarespace ecosystem.' },
      {
        type: 'h2',
        text: '4. Fresha — best free option for beauty businesses',
      },
      {
        type: 'p',
        text: 'Fresha\'s headline is "free forever" — but that hides the 20% commission on new clients booked via their marketplace. For salons with a large share of marketplace-acquired clients, this becomes expensive quickly. For salons with an established direct client base, Fresha can work well as a free management tool.',
      },
      { type: 'p', text: 'Pricing: Free (with marketplace commissions). No subscription cost.' },
      { type: 'p', text: 'Best for: New salons or beauty businesses that need marketplace discovery and don\'t mind commission.' },
      {
        type: 'h2',
        text: '5. Booksy — marketplace + booking management',
      },
      {
        type: 'p',
        text: 'Booksy combines a consumer marketplace with booking management tools. Good for salons and barbershops wanting new client discovery. Commission applies to marketplace bookings. Less feature depth than Inboker on the management side.',
      },
      { type: 'p', text: 'Pricing: $29.99/month + marketplace commission.' },
      { type: 'p', text: 'Best for: Barbershops and salons in markets with strong Booksy consumer presence.' },
      {
        type: 'h2',
        text: '6. Setmore — good free plan, limited advanced features',
      },
      {
        type: 'p',
        text: 'Setmore\'s free plan is genuinely useful for basic scheduling — multiple staff, booking page, and card payment. The paid plan adds more features but lacks AI scheduling, advanced CRM, and white-label branding.',
      },
      { type: 'p', text: 'Pricing: Free (limited), $12–19/month (paid).' },
      { type: 'p', text: 'Best for: Small businesses or sole traders on a tight budget who need basic scheduling.' },
      {
        type: 'h2',
        text: '7. Square Appointments — payments-first scheduling',
      },
      {
        type: 'p',
        text: 'Square Appointments is built on Square\'s payment ecosystem. Works well if you\'re already using Square for in-person payments. Scheduling features are solid but secondary to the payment infrastructure. Not ideal for businesses outside the Square ecosystem.',
      },
      { type: 'p', text: 'Pricing: Free (1 location, limited), $29–69/month (paid). USD pricing.' },
      { type: 'p', text: 'Best for: Businesses already using Square POS for in-person transactions.' },
      {
        type: 'h2',
        text: '8. Treatwell — marketplace focus',
      },
      {
        type: 'p',
        text: 'Treatwell is primarily a consumer marketplace for beauty and wellness — it\'s where consumers go to find a salon. Its management tools are secondary and significantly less powerful than dedicated platforms. High commission rates apply to marketplace bookings.',
      },
      { type: 'p', text: 'Pricing: Commission-based (up to 30%+ on marketplace bookings).' },
      { type: 'p', text: 'Best for: Salons that primarily want new client discovery via a high-traffic marketplace.' },
      {
        type: 'h2',
        text: 'Feature comparison: all 8 platforms',
      },
      {
        type: 'table',
        headers: ['Feature', 'Inboker', 'Calendly', 'Acuity', 'Fresha', 'Booksy', 'Setmore', 'Square Appt', 'Treatwell'],
        rows: [
          ['SMS reminders', '✓', '✗', 'Add-on', '✓', '✓', 'Paid', 'Paid', '✓'],
          ['AI scheduling', '✓', '✗', '✗', '✗', '✗', '✗', '✗', '✗'],
          ['Intake forms', '✓', '✗', '✓', '✗', 'Limited', 'Limited', 'Limited', '✗'],
          ['Client CRM', '✓', '✗', 'Basic', 'Basic', 'Basic', 'Basic', 'Basic', '✗'],
          ['White-label', '✓', '✗', 'Paid', 'Limited', 'Limited', '✗', 'Limited', '✗'],
          ['Deposits', '✓', '✗', '✓', '✓', '✓', '✓', '✓', '✓'],
          ['Waitlist', '✓', '✗', '✗', '✓', '✓', '✗', '✗', '✓'],
          ['No marketplace', '✓', '✓', '✓', '✗', '✗', '✓', '✓', '✗'],
          ['GBP pricing', '✓', '✗', '✗', '✓', '✗', '✗', '✗', '✓'],
        ],
      },
      {
        type: 'h2',
        text: 'Our recommendation by business type',
      },
      {
        type: 'ul',
        items: [
          'Clinics, physiotherapy, aesthetics → Inboker (GDPR compliance, intake forms, multi-staff)',
          'Hair salons, barbershops (established client base) → Inboker (commission-free, white-label)',
          'Hair salons, barbershops (need marketplace discovery) → Fresha or Booksy',
          'Personal trainers, fitness coaches → Inboker (package credits, group sessions)',
          'Consultants, lawyers, accountants → Inboker or Calendly (depends on meeting vs service focus)',
          'Budget-constrained businesses (basic needs) → Setmore free plan',
          'Square POS users → Square Appointments',
        ],
      },
    ],
  },

  {
    slug: 'white-label-booking-page',
    title: 'How to create a white-label booking page that looks like your brand',
    description:
      'Step-by-step guide to setting up a fully branded booking experience — custom colours, logo, domain, and messaging — using Inboker.',
    category: 'Setup Guides',
    datePublished: '2024-10-08',
    dateModified: '2025-05-01',
    dateDisplay: '8 October 2024',
    readTime: '6 min read',
    author: 'Inboker Editorial Team',
    tags: ['white-label', 'branding', 'booking page', 'custom domain', 'setup guide'],
    metaTitle: 'How to Create a White-Label Booking Page | Branding Guide | Inboker Blog',
    metaDescription:
      'Step-by-step guide to building a fully white-label booking page with your logo, brand colours, and custom domain. No code required. Setup takes under 30 minutes.',
    relatedSlugs: ['online-booking-for-salons', 'how-to-reduce-no-shows', 'booking-software-comparison'],
    faqs: [
      {
        question: 'What is a white-label booking page?',
        answer:
          'A white-label booking page is a booking interface that carries your own branding — logo, colours, business name — without any visible reference to the underlying booking software. Clients experience it as your own booking system, not a third-party tool.',
      },
      {
        question: 'Why does white-label branding matter for booking pages?',
        answer:
          'White-label booking pages build client trust by presenting a consistent brand experience. Clients who see a branded booking page associate the professional experience with your business, not with generic software. It also prevents clients from recognising the booking platform and potentially booking competitors on the same platform.',
      },
      {
        question: 'Can I use my own domain for my booking page?',
        answer:
          'Yes. Inboker\'s Business plan supports custom domains — your booking page can live at book.yoursalon.com or appointments.yourclinic.co.uk rather than at an inboker.com subdomain.',
      },
      {
        question: 'Do I need coding skills to set up a white-label booking page?',
        answer:
          'No. Inboker\'s brand settings allow you to upload your logo, set your brand colours, and customise all text through a visual interface. No code required. Setup typically takes 15–30 minutes.',
      },
      {
        question: 'Can I embed a white-label booking widget on my website?',
        answer:
          'Yes. Inboker provides an embeddable booking widget that you can add to any website with a single line of code. The widget inherits your brand settings so it looks like a native part of your site.',
      },
    ],
    content: [
      {
        type: 'p',
        text: 'Your booking page is the first interaction many clients have with your business. A generic booking tool with someone else\'s logo or default styling sends a subtle signal that undermines your brand. A white-label booking page sends the opposite message: you\'re professional, you have systems, and every part of your client experience is intentional.',
      },
      {
        type: 'p',
        text: 'This guide walks through setting up a fully branded booking page — from logo and colours to custom domain and messaging — using Inboker. No coding required.',
      },
      {
        type: 'h2',
        text: 'What "white-label" actually means',
      },
      {
        type: 'p',
        text: 'White-label means the booking software is completely hidden behind your brand. Clients see your logo, your colours, your domain name, your copy. There\'s no "Powered by [software name]" badge, no generic template design, no obvious sign that you\'re using a third-party tool.',
      },
      {
        type: 'p',
        text: 'This matters for three reasons:',
      },
      {
        type: 'ul',
        items: [
          'Trust: Clients trust a branded experience more than a generic one',
          'Professionalism: A custom booking page signals that your business is established and serious',
          'Competitive protection: Clients on generic marketplace booking platforms can browse competitors — a white-label page keeps them in your ecosystem',
        ],
      },
      {
        type: 'h2',
        text: 'Step 1: Upload your logo',
      },
      {
        type: 'p',
        text: 'Your logo is the most important branding element. It should appear at the top of your booking page and in confirmation emails. Inboker accepts PNG, JPG, and SVG files. Use a version of your logo that works on both light and dark backgrounds.',
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Logo file tips',
        text: 'Use a transparent PNG at minimum 400×400px for crisp rendering on all screen sizes. Avoid logos with white backgrounds — they look unprofessional on coloured booking page headers.',
      },
      {
        type: 'h2',
        text: 'Step 2: Set your brand colours',
      },
      {
        type: 'p',
        text: 'Inboker uses your primary brand colour for buttons, links, and accent elements throughout the booking page. Use the exact hex code from your brand guidelines for consistency.',
      },
      {
        type: 'p',
        text: 'If you don\'t have formal brand guidelines, extract your primary colour from your logo using a free tool like ColorPick Eyedropper and use that as your brand colour.',
      },
      {
        type: 'h2',
        text: 'Step 3: Customise your booking page text',
      },
      {
        type: 'p',
        text: 'Your booking page should speak in your brand\'s voice. Default booking page copy sounds generic. Custom copy sounds like you.',
      },
      {
        type: 'table',
        headers: ['Element', 'Generic default', 'Branded version'],
        rows: [
          ['Page headline', '"Book an appointment"', '"Book your treatment at [Salon Name]"'],
          ['Confirmation message', '"Your booking is confirmed"', '"You\'re all set — we can\'t wait to see you!"'],
          ['Cancellation policy', 'Not shown / generic', 'Your specific policy with your contact details'],
          ['Service descriptions', 'Service name only', 'Description with what to expect, how to prepare'],
        ],
      },
      {
        type: 'h2',
        text: 'Step 4: Set up your custom domain (Business plan)',
      },
      {
        type: 'p',
        text: 'By default, your Inboker booking page lives at yourbusiness.inboker.com. The Business plan lets you map your own domain so clients visit book.yoursite.com or appointments.yourpractice.co.uk instead.',
      },
      {
        type: 'ol',
        items: [
          'In Inboker, go to Settings → Brand → Custom Domain',
          'Enter your custom booking domain (e.g., book.yoursalon.com)',
          'Inboker provides a CNAME record to add to your domain DNS settings',
          'In your domain registrar (GoDaddy, Namecheap, Google Domains, etc.), add the CNAME record',
          'DNS propagation takes 5 minutes to 48 hours — your custom domain goes live once it propagates',
        ],
      },
      {
        type: 'callout',
        variant: 'tip',
        title: 'Custom domain recommendation',
        text: 'Use book.yourdomain.com for salons and beauty businesses, or appointments.yourdomain.co.uk for clinics and professional services. Keep it short and intuitive.',
      },
      {
        type: 'h2',
        text: 'Step 5: Add your booking link everywhere',
      },
      {
        type: 'p',
        text: 'A branded booking page is only valuable if clients find it. Place your booking link across all client touchpoints:',
      },
      {
        type: 'ul',
        items: [
          'Instagram bio ("Book now →")',
          'Google Business Profile (set as your appointment URL)',
          'Website homepage — as a primary CTA button, ideally above the fold',
          'Email signature ("Book your next appointment")',
          'Facebook page (Add a booking button)',
          'WhatsApp Business profile',
          'Printed materials — business cards, leaflets, reception signage as a QR code',
        ],
      },
      {
        type: 'h2',
        text: 'Step 6: Embed the booking widget on your website',
      },
      {
        type: 'p',
        text: 'Instead of redirecting clients to a separate booking page, embed the booking widget directly on your website. Inboker provides a one-line embed code that you can add to any website — WordPress, Squarespace, Wix, Webflow, or custom-built.',
      },
      {
        type: 'p',
        text: 'The widget inherits your brand settings automatically — your logo, colours, and text appear within your website\'s layout as if the booking form is native to your site.',
      },
      {
        type: 'h2',
        text: 'What a great white-label booking experience looks like',
      },
      {
        type: 'p',
        text: 'A fully branded booking flow has these characteristics at every step:',
      },
      {
        type: 'ul',
        items: [
          'Booking page URL: your own domain',
          'Logo: yours, prominently placed',
          'Colours: matching your brand palette exactly',
          'Copy: your voice, not generic software text',
          'Confirmation email: sent from your email address with your branding',
          'SMS reminders: from your business name as sender ID',
          'Reminder content: your words, referencing your specific services',
        ],
      },
      {
        type: 'quote',
        text: 'We went from juggling three tools to just Inboker. Simpler, faster, and our clients love the booking page.',
        author: 'Nina T.',
        role: 'Studio Manager, Zen Pilates',
      },
    ],
  },
];

export function getArticle(slug: string): Article | null {
  return articles.find((a) => a.slug === slug) ?? null;
}

export function getAllArticleSlugs(): string[] {
  return articles.map((a) => a.slug);
}

export function getAllArticles(): Article[] {
  return articles;
}
