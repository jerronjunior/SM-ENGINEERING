export const COMPANY = {
  name: 'SM ENGINEERING & CONSTRUCTION',
  tagline: 'Engineering & Construction',
  founded: '01 January 2026',
  address: 'No.89, Badulla, Gamewela Passara, Passara, 90500',
  phone: '+94 774 222 353',
  email: 'smengconstruction@gmail.com',
  whatsapp: '94774222353',
  qualification: 'NDT Moratuwa – Civil Engineering Technology',
  warranty: '1 Year warranty for projects',
  projectTypes: ['Residential', 'Commercial'],
}

export const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const FALLBACK_PROJECTS = [
  {
    id: 'cp-01',
    title: 'Hill Crest Family Residence',
    description: 'Two-story custom home with RCC frame, exterior finishing, and full utility setup.',
    type: 'residential',
    status: 'completed',
    images: ['/projects/completed-1.svg'],
  },
  {
    id: 'cp-02',
    title: 'Greenline Retail Annex',
    description: 'Commercial extension including steel canopy work, interior partitions, and parking access.',
    type: 'commercial',
    status: 'completed',
    images: ['/projects/completed-2.svg'],
  },
  {
    id: 'og-01',
    title: 'Passara Office Complex',
    description: 'Multi-unit office block currently in structural and blockwork phase.',
    type: 'commercial',
    status: 'ongoing',
    images: ['/projects/ongoing-1.svg'],
  },
  {
    id: 'og-02',
    title: 'Sunridge Villa Renovation',
    description: 'Renovation of an existing villa with roofing upgrades and facade modernization.',
    type: 'residential',
    status: 'ongoing',
    images: ['/projects/ongoing-2.svg'],
  },
  {
    id: 'up-01',
    title: 'Riverbend Apartment Build',
    description: 'Planned apartment project with parking podium and landscaped common areas.',
    type: 'residential',
    status: 'upcoming',
    images: ['/projects/upcoming-1.svg'],
  },
  {
    id: 'up-02',
    title: 'Logistics Warehouse Yard',
    description: 'Upcoming industrial warehouse and loading yard development.',
    type: 'commercial',
    status: 'upcoming',
    images: ['/projects/upcoming-2.svg'],
  },
]
