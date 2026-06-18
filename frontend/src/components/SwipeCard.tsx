import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { CheckCircle, X, Heart, Star, MapPin, Building, TrendingUp } from 'lucide-react';

interface Profile {
  id: string;
  company_name: string;
  industry: string;
  location: string;
  revenue_band: string;
  match_score: number;
  match_reasons: string[];
  logo_url?: string;
  is_verified: boolean;
  sub_industry?: string;
  business_type?: string;
  team_size?: string;
  years_in_business?: number;
  moq?: string;
  export_ready?: boolean;
  products_services?: string[];
}

interface SwipeCardProps {
  profile: Profile;
  onSwipe: (direction: 'left' | 'right' | 'super', profileId: string) => void;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ profile, onSwipe }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const [overlay, setOverlay] = useState<string | null>(null);

  const [exitX, setExitX] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Super like (up)
    if (info.offset.y < -120) {
      setExitX(0);
      setIsAnimating(true);
      setTimeout(() => onSwipe('super', profile.id), 300);
      setOverlay(null);
      return;
    }
    if (info.offset.x > 120) {
      setExitX(200);
      setIsAnimating(true);
      setTimeout(() => onSwipe('right', profile.id), 300);
      setOverlay(null);
    } else if (info.offset.x < -100) {
      setExitX(-200);
      setIsAnimating(true);
      setTimeout(() => onSwipe('left', profile.id), 300);
      setOverlay(null);
    }
  };

  const manualSwipe = (direction: 'left' | 'right' | 'super') => {
    setExitX(direction === 'right' || direction === 'super' ? 200 : -200);
    setIsAnimating(true);
    setTimeout(() => onSwipe(direction, profile.id), 300);
  };

  const scoreColor = (s: number) => {
    if (s >= 90) return 'bg-green-100 text-green-700 border-green-200';
    if (s >= 70) return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    if (s >= 50) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center">
      <motion.div
        className="absolute w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 max-w-[460px]"
        style={{ x, y, rotate, opacity }}
        drag
        // allow free drag on both axes for swipe interactions
        onDrag={(e, info) => {
          // overlay feedback
          if (info.offset.y < -80) setOverlay('super');
          else if (info.offset.x > 40) setOverlay('like');
          else if (info.offset.x < -40) setOverlay('pass');
          else setOverlay(null);
        }}
        onDragEnd={handleDragEnd}
        initial={{ scale: 0.98, opacity: 0 }}
        animate={isAnimating ? { x: exitX, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.28 }}
      >
        {/* Overlay feedback (PASS / LIKE / SUPER) */}
        {overlay && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`absolute top-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-sm font-bold ${overlay === 'like' ? 'bg-emerald-100 text-emerald-700' : overlay === 'pass' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}
          >
            {overlay === 'like' ? 'LIKE' : overlay === 'pass' ? 'PASS' : 'SUPER LIKE'}
          </motion.div>
        )}
        <div className="h-56 bg-gradient-to-r from-slate-100 to-white flex items-center justify-center p-6 relative">
          <div className="flex items-center gap-4 w-full px-2">
            <div className="w-28 h-28 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm overflow-hidden flex-shrink-0">
              {profile.logo_url ? (
                <img src={profile.logo_url} alt={profile.company_name} className="w-full h-full object-contain" />
              ) : (
                <Building className="w-12 h-12 text-slate-300" />
              )}
            </div>
            <div className="flex-1 text-left">
              <h2 className="text-2xl font-bold text-slate-900 truncate">{profile.company_name}</h2>
              <div className="flex items-center gap-3 mt-2">
                {profile.is_verified && (
                  <div className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Verified
                  </div>
                )}
                <div className="text-sm text-slate-500 truncate">{profile.industry}</div>
              </div>
            </div>
          </div>
          <div className={`absolute right-4 top-4 px-3 py-1 rounded-full text-sm font-bold border shadow ${scoreColor(profile.match_score)}`}>{profile.match_score}%</div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-slate-600">
            <div className="flex items-center gap-2"><Building className="w-4 h-4 text-slate-400" /> {profile.business_type || '-'}</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {profile.location || '-'}</div>
            <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-slate-400" /> {profile.revenue_band || '-'}</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> {profile.sub_industry || '-'}</div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Why you matched</h4>
            <div className="flex flex-wrap gap-2">
              {profile.match_reasons && profile.match_reasons.length > 0 ? (
                profile.match_reasons.map((reason) => (
                  <span key={reason} className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium border border-indigo-100">✓ {reason}</span>
                ))
              ) : (
                <span className="text-sm text-slate-500">No specific reasons available.</span>
              )}
            </div>
          </div>

          {/* Products & Services tags (if present) */}
          {('products_services' in profile) && (
            <div className="mt-4">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Products & Services</h4>
              <div className="flex flex-wrap gap-2">
                {(profile as any).products_services?.length > 0 ? (
                  (profile as any).products_services.map((p: string) => (
                    <span key={p} className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm">{p}</span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">—</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-6 w-full flex justify-center gap-6 px-6">
          <button
            onClick={() => manualSwipe('left')}
            className="w-16 h-16 bg-white border-2 border-red-100 text-red-500 rounded-full flex items-center justify-center shadow transition-transform hover:scale-105 active:scale-95"
            aria-label="Pass"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={() => manualSwipe('super')}
            className="w-16 h-16 bg-white border-2 border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shadow transition-transform hover:scale-105 active:scale-95"
            aria-label="Super Like"
          >
            <Star className="w-6 h-6" />
          </button>

          <button
            onClick={() => manualSwipe('right')}
            className="w-16 h-16 bg-white border-2 border-green-100 text-green-600 rounded-full flex items-center justify-center shadow transition-transform hover:scale-105 active:scale-95"
            aria-label="Like"
          >
            <Heart className="w-6 h-6" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default SwipeCard;
