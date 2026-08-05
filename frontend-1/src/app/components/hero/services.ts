import { Laptop, FileText, Send, Zap, GraduationCap, type LucideIcon } from 'lucide-react';

export interface HeroService {
  icon: LucideIcon;
  title: string;
  slug: string;
  desc: string;
  accent: string;
}

export const HERO_SERVICES: HeroService[] = [
  {
    icon: Laptop,
    title: 'GeM Registration',
    slug: 'gem-registration',
    desc: 'Seamless onboarding & catalogue setup on Government e-Marketplace.',
    accent: '#16A34A',
  },
  {
    icon: FileText,
    title: 'Tender Bidding',
    slug: 'tender-bidding',
    desc: 'Expert document prep & compliance review for winning bids.',
    accent: '#14B8A6',
  },
  {
    icon: Send,
    title: 'OEM Panel Setup',
    slug: 'oem-panel',
    desc: 'OEM authorization & panel management on GeM portal.',
    accent: '#10B981',
  },
  {
    icon: Zap,
    title: 'Catalogue Management',
    slug: 'catalogue-management',
    desc: 'Professional product listing & profile optimization.',
    accent: '#059669',
  },
  {
    icon: GraduationCap,
    title: 'Training Services',
    slug: 'training',
    desc: 'Comprehensive GeM & tender bidding training programmes.',
    accent: '#16A34A',
  },
];
