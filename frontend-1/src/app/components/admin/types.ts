export type Tab = 'dashboard' | 'tenders' | 'users' | 'payments' | 'reviews' | 'analytics';

export interface Tender {
  id: string;
  title: string;
  authority: string;
  category: string;
  value: string;
  status: 'Active' | 'Closed' | 'Draft';
  deadline: string;
  bids: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  joined: string;
  status: 'Active' | 'Suspended';
}

export interface Payment {
  id: string;
  user: string;
  plan: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending' | 'Failed';
}

export interface Review {
  id: string;
  name: string;
  company: string;
  service: string;
  rating: number;
  message: string;
  date: string;
}
