import type { Tender, User, Payment, Review } from './types';

export const mockTenders: Tender[] = [
  { id: 'T001', title: 'Supply of IT Equipment', authority: 'Govt. of Maharashtra', category: 'IT Services', value: '₹45,00,000', status: 'Active', deadline: 'Apr 25, 2026', bids: 12 },
  { id: 'T002', title: 'Construction of Municipal Office', authority: 'AMC, Ahmedabad', category: 'Construction', value: '₹2,10,00,000', status: 'Active', deadline: 'May 10, 2026', bids: 7 },
  { id: 'T003', title: 'Medical Equipment Supply', authority: 'Health Dept. Gujarat', category: 'Medical', value: '₹78,00,000', status: 'Closed', deadline: 'Mar 01, 2026', bids: 19 },
  { id: 'T004', title: 'Road Resurfacing Project', authority: 'NHAI', category: 'Infrastructure', value: '₹3,50,00,000', status: 'Draft', deadline: 'Jun 15, 2026', bids: 0 },
];

export const mockUsers: User[] = [
  { id: 'U001', name: 'Rajesh Kumar', email: 'rajesh@acme.com', plan: 'Professional', joined: 'Jan 12, 2026', status: 'Active' },
  { id: 'U002', name: 'Priya Sharma', email: 'priya@corp.in', plan: 'Starter', joined: 'Feb 3, 2026', status: 'Active' },
  { id: 'U003', name: 'Amit Patel', email: 'amit@biz.io', plan: 'Enterprise', joined: 'Mar 20, 2026', status: 'Suspended' },
];

export const mockPayments: Payment[] = [
  { id: 'INV-001', user: 'Rajesh Kumar', plan: 'Professional', amount: 9439, date: 'Apr 1, 2026', status: 'Paid' },
  { id: 'INV-002', user: 'Priya Sharma', plan: 'Starter', amount: 3539, date: 'Apr 2, 2026', status: 'Paid' },
  { id: 'INV-003', user: 'Amit Patel', plan: 'Enterprise', amount: 23599, date: 'Apr 5, 2026', status: 'Pending' },
];

export const mockReviews: Review[] = [
  { id: 'R001', name: 'Rajesh Kumar', company: 'Acme Ltd', service: 'GeM Registration', rating: 5, message: 'Excellent service, very professional.', date: 'Apr 5, 2026' },
  { id: 'R002', name: 'Meera Shah', company: 'Shah Enterprises', service: 'Training', rating: 4, message: 'Great training modules, very helpful.', date: 'Apr 7, 2026' },
];

export const analyticsCategories = [
  { label: 'IT Services', count: 3840, pct: 75 },
  { label: 'Construction', count: 2100, pct: 55 },
  { label: 'Medical Equipment', count: 1560, pct: 38 },
  { label: 'Infrastructure', count: 980, pct: 24 },
  { label: 'Office Supplies', count: 650, pct: 16 },
];
