export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  home_city?: string;
  created_at: string;
  trip_count?: number;
  shared_count?: number;
}

export interface Destination {
  id: string;
  day_id: string;
  trip_id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  time_start: string;
  time_end: string;
  estimated_cost: number;
  category: 'attraction' | 'food' | 'hotel' | 'transit' | 'activity';
  visit_order: number;
  notes?: string;
}

export interface TripDay {
  id: string;
  trip_id: string;
  day_number: number;
  date: string;
  title?: string;
  notes?: string;
}

export interface Companion {
  id: string;
  trip_id?: string;
  user_id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'editor' | 'viewer';
  added_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  destination_name: string;
  start_date: string;
  end_date: string;
  total_budget: number;
  currency: string;
  cover_image?: string;
  is_public: number;
  share_code: string;
  created_at: string;
  owner_name?: string;
  owner_avatar?: string;
  owner_email?: string;
  total_days?: number;
  total_destinations?: number;
  total_spent?: number;
  companion_count?: number;
  is_collaborator?: number;
}

export interface TripStats {
  totalSpent: number;
  totalBudget: number;
  remainingBudget: number;
  categoryBreakdown: Record<string, number>;
  totalDestinations: number;
  totalDays: number;
}
