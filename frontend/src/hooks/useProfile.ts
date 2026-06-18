import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

export interface BusinessProfile {
  id?: number;
  user_id?: number;
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
  registration_number?: string;
  business_intent: string[];
  products_services: string[];
  moq?: string;
  export_ready: boolean;
  profile_completeness?: number;
}

const PROFILE_KEY = ['profile', 'me'];

export function useGetProfile() {
  return useQuery<BusinessProfile>({
    queryKey: PROFILE_KEY,
    queryFn: async () => {
      const res = await api.get('/api/v1/profile/me');
      return res.data;
    },
    retry: false,
  });
}

export function useSaveProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BusinessProfile) => {
      // Try PUT first, fall back to POST
      try {
        const res = await api.put('/api/v1/profile', data);
        return res.data;
      } catch (err: any) {
        if (err.response?.status === 404) {
          const res = await api.post('/api/v1/profile', data);
          return res.data;
        }
        throw err;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_KEY, data);
    },
  });
}

export function useUpsertProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BusinessProfile) => {
      const res = await api.post('/api/v1/profile/upsert', data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(PROFILE_KEY, data);
    },
  });
}
