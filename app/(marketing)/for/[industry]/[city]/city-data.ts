export interface CityData {
  slug: string;
  name: string;
  region: string;
  context: string;
  marketSize: string;
  population: string;
}

export const cities: Record<string, CityData> = {
  london: {
    slug: 'london',
    name: 'London',
    region: 'Greater London',
    context: "London is the UK's largest market for appointment-based businesses. With over 9 million residents and millions more visitors, competition is high and clients expect fast, seamless online booking.",
    marketSize: '40,000+ salons, clinics, and wellness businesses',
    population: '9.1 million',
  },
  manchester: {
    slug: 'manchester',
    name: 'Manchester',
    region: 'Greater Manchester',
    context: "Manchester is the North's fastest-growing city for service businesses. A young, tech-savvy population expects mobile-first booking and instant confirmations.",
    marketSize: '8,000+ appointment businesses',
    population: '2.8 million',
  },
  birmingham: {
    slug: 'birmingham',
    name: 'Birmingham',
    region: 'West Midlands',
    context: "Birmingham is England's second city and one of the UK's most diverse markets for appointment-based businesses, with strong demand across beauty, wellness, and healthcare services.",
    marketSize: '10,000+ appointment businesses',
    population: '2.9 million',
  },
  leeds: {
    slug: 'leeds',
    name: 'Leeds',
    region: 'West Yorkshire',
    context: "Leeds has a thriving independent business scene, with a growing demand for professional online booking across salons, clinics, and personal training studios.",
    marketSize: '5,000+ appointment businesses',
    population: '1.9 million',
  },
  bristol: {
    slug: 'bristol',
    name: 'Bristol',
    region: 'South West England',
    context: "Bristol's professional and creative population has high expectations for digital-first services. Appointment businesses here benefit from clients who book online by default.",
    marketSize: '4,500+ appointment businesses',
    population: '470,000',
  },
};

// Which city–industry combinations to build as static pages
export const cityIndustryCombinations: { industry: string; city: string }[] = [
  { industry: 'salons', city: 'london' },
  { industry: 'salons', city: 'manchester' },
  { industry: 'salons', city: 'birmingham' },
  { industry: 'clinics', city: 'london' },
  { industry: 'clinics', city: 'manchester' },
  { industry: 'clinics', city: 'birmingham' },
  { industry: 'personal-trainers', city: 'london' },
  { industry: 'personal-trainers', city: 'manchester' },
  { industry: 'personal-trainers', city: 'birmingham' },
  { industry: 'barbershops', city: 'london' },
];

export function getCityData(slug: string): CityData | null {
  return cities[slug] ?? null;
}

export function getAllCitySlugs(): string[] {
  return Object.keys(cities);
}
