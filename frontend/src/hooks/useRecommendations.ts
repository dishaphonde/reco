import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../lib/api';

export interface RecommendationProfile {
  id: number;
  user_id: number;
  company_name: string;
  logo_url?: string;
  industry: string;
  sub_industry?: string;
  business_type: string;
  country: string;
  state: string;
  city: string;
  areas_served: string[];
  revenue_band: string;
  team_size: string;
  years_in_business: number;
  business_intent: string[];
  products_services: string[];
  moq?: string;
  export_ready: boolean;
  profile_completeness: number;
}

export interface RecommendationItem {
  profile: RecommendationProfile;
  match_score: number;
  match_reasons: string[];
}

export interface RecommendationFeed {
  items: RecommendationItem[];
  page: number;
  size: number;
  total: number;
}

export function useRecommendations(page: number = 1, size: number = 20) {
  return useQuery<RecommendationFeed>({
    queryKey: ['recommendations', 'feed', page],
    queryFn: async () => {
      const res = await api.get('/api/v1/recommendations/feed', {
        params: { page, size, min_score: 35 },
      });
      return res.data;
    },
    staleTime: 60_000,
  });
}

export function useRecordInteraction() {
  return useMutation({
    mutationFn: async ({
      target_user_id,
      action,
    }: {
      target_user_id: number;
      action: 'LIKE' | 'PASS' | 'SUPERLIKE';
    }) => {
      const res = await api.post('/api/v1/interactions', { target_user_id, action });
      return res.data as { matched: boolean; match_id: number | null };
    },
  });
}
