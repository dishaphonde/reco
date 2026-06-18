import React, { useState, useEffect } from 'react';
import SwipeCard from '../components/SwipeCard';
import { useRecordInteraction } from '../hooks/useRecommendations';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { Badge } from '../components/ui/Badge';

const Discover: React.FC = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;

  const recordMutation = useRecordInteraction();

  const mapItems = (data: any[]) =>
    data.map((item: any) => {
      const p = item.profile || {};
      return {
        id: String(p.id || p.user_id || Math.random()),
        company_name: p.company_name || 'Unknown',
        industry: p.industry || '',
        sub_industry: p.sub_industry || '',
        business_type: p.business_type || '',
        team_size: p.team_size || '',
        years_in_business: p.years_in_business || 0,
        location: [p.city, p.state].filter(Boolean).join(', '),
        revenue_band: p.revenue_band || '',
        match_score: item.match_score || 0,
        match_reasons: item.match_reasons || [],
        products_services: p.products_services || [],
        logo_url: p.logo_url || null,
        is_verified: (p.profile_completeness || 0) > 80,
        user_id: p.user_id || p.id,
      };
    });

  const loadNextPage = async () => {
    if (!hasMore) return;
    try {
      const res = await api.get('/api/v1/recommendations/feed', { params: { page, size: PAGE_SIZE } });
      const data = res.data;
      const items = data.items || [];
      const mapped = mapItems(items);
      setProfiles(prev => {
        // dedupe by id
        const existing = new Set(prev.map(p => p.id));
        const filtered = mapped.filter(m => !existing.has(m.id));
        return [...prev, ...filtered];
      });
      const total = data.total || 0;
      const loaded = (page - 1) * PAGE_SIZE + items.length;
      setHasMore(loaded < total);
      setPage(prev => prev + 1);
    } catch (err) {
      console.error('Failed to load recommendations', err);
    }
  };

  useEffect(() => {
    // initial load
    loadNextPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { profile } = useAuth();

  // reload recommendations when profile changes
  useEffect(() => {
    setProfiles([]);
    setPage(1);
    setHasMore(true);
    loadNextPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const handleSwipe = (direction: 'left' | 'right' | 'super', profileId: string) => {
    console.log(`Swiped ${direction} on profile ${profileId}`);
    // In a real app, send API request here
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      const action = direction === 'left' ? 'PASS' : direction === 'right' ? 'LIKE' : 'SUPERLIKE';
      recordMutation.mutate({ target_user_id: Number(profile.user_id), action }, {
        onSuccess: (data) => {
          if (data.matched) {
             navigate('/matches');
          }
        }
      });
    }

    // Remove the swiped profile from the stack
    setProfiles(prev => {
      const next = prev.filter(p => p.id !== profileId);
      // If running low on profiles, fetch next page
      if (next.length < 3) loadNextPage();
      return next;
    });
  };

  const profileCompleteness = profile?.profile_completeness || 0;
  const recommendationsCount = profiles.length;

  return (
    <div className="flex flex-col items-center justify-start w-full min-h-[calc(100vh-80px)] pt-12 pb-24 px-4 bg-slate-50">
      <div className="w-full max-w-[1200px] mx-auto mb-6 flex items-center justify-between px-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Discover Businesses</h1>
          <p className="text-slate-500 mt-2">Find your next supplier, distributor, buyer, or strategic partner.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-600">Recommendations:</div>
          <Badge variant="default">{recommendationsCount}</Badge>
          <div className="text-sm text-slate-600">Profile:</div>
          <div className="text-sm font-semibold text-indigo-600">{profileCompleteness}%</div>
        </div>
      </div>

      <div className="w-full max-w-[1200px] mx-auto px-4">
        <div className="flex flex-col items-center w-full">
          <div className="flex items-center justify-center w-full min-h-[calc(100vh-200px)] mt-4">
            <div className="w-full max-w-[700px] px-4">
              {profiles.length > 0 ? (
                // Centered card stack. Only top card is interactive.
                <div className="relative w-full flex items-center justify-center">
                  {profiles.map((profile, index) => {
                    const isTop = index === 0;
                    const scale = 1 - index * 0.05;
                    const translateY = index * 15;
                    return (
                      <div
                        key={`${profile.id}-${index}`}
                        className="absolute left-0 right-0 flex items-center justify-center"
                        style={{
                          zIndex: profiles.length - index,
                          transform: `scale(${scale}) translateY(${translateY}px)`,
                          opacity: 1 - index * 0.2,
                        }}
                      >
                        {isTop ? (
                          <div className="w-full">
                            <SwipeCard profile={profile} onSwipe={handleSwipe} />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 w-full bg-white rounded-2xl shadow-sm border border-slate-100">
              <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="20" width="140" height="80" rx="12" fill="#F1F5F9" />
                <circle cx="40" cy="60" r="18" fill="#E6EEF8" />
                <rect x="70" y="45" width="70" height="8" rx="4" fill="#E6EEF8" />
                <rect x="70" y="62" width="50" height="8" rx="4" fill="#E6EEF8" />
              </svg>
              <h3 className="text-xl font-bold text-slate-800 mt-6">No More Matches Available</h3>
              <p className="text-slate-500 text-center px-8 mt-2">Update your profile, expand intents, or try again later.</p>
              <div className="mt-6 flex gap-3">
                <button onClick={() => navigate('/profile/setup')} className="px-4 py-2 bg-indigo-600 text-white rounded-md">Complete Profile</button>
                <button onClick={() => { setProfiles([]); setPage(1); loadNextPage(); }} className="px-4 py-2 border border-slate-200 rounded-md">Try again</button>
              </div>
            </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discover;
