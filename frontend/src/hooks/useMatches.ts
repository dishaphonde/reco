import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export interface MatchPartnerProfile {
  user_id: number;
  company_name: string;
  industry: string;
  business_type: string;
  city: string;
  country: string;
  revenue_band: string;
  profile_completeness: number;
  logo_url?: string;
}

export interface Match {
  id: number;
  match_score: number;
  created_at: string;
  partner_profile: MatchPartnerProfile;
  deal_room_id: number | null;
}

export function useMatches() {
  return useQuery<{ items: Match[]; total: number }>({
    queryKey: ['matches'],
    queryFn: async () => {
      const res = await api.get('/api/v1/matches');
      return res.data;
    },
    staleTime: 30_000,
  });
}
