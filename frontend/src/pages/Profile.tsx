import { useState, useEffect } from 'react';
import {
  Building2, MapPin, Briefcase, Target, Package,
  Save, CheckCircle, Loader2, AlertCircle, X,
  Globe, TrendingUp, ShieldCheck
} from 'lucide-react';
import { useGetProfile, useSaveProfile } from '../hooks/useProfile';
import type { BusinessProfile } from '../hooks/useProfile';
import { Toast, useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

// ─── Static Data ───────────────────────────────────────────────────────────────
const INDUSTRIES: Record<string, string[]> = {
  'FMCG': ['Packaged Foods', 'Beverages', 'Personal Care', 'Household Products'],
  'Technology': ['Software', 'Hardware', 'SaaS', 'AI/ML', 'Cybersecurity', 'Cloud'],
  'Retail': ['Electronics', 'Fashion', 'Home & Living', 'Grocery', 'Luxury'],
  'Logistics': ['Freight Forwarding', 'Last-Mile Delivery', 'Cold Chain', 'Warehousing'],
  'Healthcare': ['Pharmaceuticals', 'Medical Devices', 'Diagnostics', 'Wellness'],
  'Agriculture': ['Produce', 'Agri-Tech', 'Fertilizers', 'Seeds', 'Irrigation'],
  'Automotive': ['Parts', 'EVs', 'Accessories', 'Fleet Management'],
  'Textiles': ['Apparel', 'Technical Textiles', 'Yarn & Fabric', 'Fashion Design'],
  'Finance': ['FinTech', 'Insurance', 'Investment', 'Banking', 'Microfinance'],
  'Education': ['EdTech', 'Vocational Training', 'K-12', 'Higher Education'],
  'Real Estate': ['Commercial', 'Residential', 'PropTech', 'Co-Working'],
  'Energy': ['Renewables', 'Oil & Gas', 'Power Distribution', 'Solar'],
};

const COUNTRIES = ['India', 'UAE', 'USA', 'UK', 'Germany', 'Singapore', 'Australia', 'China', 'Canada', 'Japan'];
const STATES: Record<string, string[]> = {
  'India': ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Telangana', 'West Bengal'],
  'UAE': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman'],
  'USA': ['California', 'Texas', 'New York', 'Florida', 'Illinois'],
  'UK': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  'Germany': ['Bavaria', 'Berlin', 'Hamburg', 'Baden-Württemberg'],
  'Singapore': ['Central Region', 'East Region', 'West Region'],
  'Australia': ['New South Wales', 'Victoria', 'Queensland', 'Western Australia'],
  'China': ['Guangdong', 'Shanghai', 'Beijing', 'Zhejiang'],
  'Canada': ['Ontario', 'British Columbia', 'Quebec', 'Alberta'],
  'Japan': ['Tokyo', 'Osaka', 'Kanagawa', 'Aichi'],
};

const REVENUE_BANDS = ['Pre-revenue', '$0 - $1M', '$1M - $5M', '$5M - $10M', '$10M - $50M', '$50M+'];
const TEAM_SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];
const BUSINESS_TYPES = ['Manufacturer', 'Distributor', 'Service Provider', 'Retail', 'Technology', 'Consulting'];
const MOQS = ['None', '10 units', '50 units', '100 units', '500 units', '1000 units', 'Pallet Load', 'Container Load'];
const AREAS = ['Pan India', 'North India', 'South India', 'East India', 'West India', 'Middle East', 'Southeast Asia', 'Europe', 'Americas', 'Global'];
const INTENTS = [
  'Seeking Distributors',
  'Seeking Suppliers',
  'Looking for Buyers',
  'Looking for Investment',
  'Looking for Export Opportunities',
  'Open to Partnerships',
];

// ─── Profile Completeness Ring ─────────────────────────────────────────────────
const CompletenessRing = ({ pct }: { pct: number }) => {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct < 40 ? '#ef4444' : pct < 70 ? '#f59e0b' : '#22c55e';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="65" cy="65" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
        <text x="65" y="62" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#0f172a">{pct}%</text>
        <text x="65" y="80" textAnchor="middle" fontSize="10" fill="#64748b">Complete</text>
      </svg>
    </div>
  );
};

// ─── Tag Input ─────────────────────────────────────────────────────────────────
const TagInput = ({
  tags, onChange, placeholder
}: { tags: string[]; onChange: (t: string[]) => void; placeholder?: string }) => {
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput('');
  };

  return (
    <div className="flex flex-wrap gap-2 p-3 border border-slate-300 rounded-xl bg-white min-h-[52px] focus-within:ring-2 focus-within:ring-indigo-200 focus-within:border-indigo-500 transition-all">
      {tags.map(tag => (
        <span key={tag} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-sm font-semibold px-3 py-1 rounded-full border border-indigo-100">
          {tag}
          <button type="button" onClick={() => onChange(tags.filter(t => t !== tag))} className="ml-1 hover:text-red-500">
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
        onBlur={add}
        placeholder={tags.length === 0 ? placeholder : '+ Add more…'}
        className="flex-1 min-w-[140px] outline-none text-sm text-slate-700 bg-transparent"
      />
    </div>
  );
};

// ─── Section Header ────────────────────────────────────────────────────────────
const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-indigo-50 to-slate-50 border-b border-slate-100">
      <span className="text-indigo-600">{icon}</span>
      <h2 className="text-base font-bold text-slate-800">{title}</h2>
    </div>
    <div className="p-6 space-y-5">{children}</div>
  </div>
);

// ─── Form Field helpers ─────────────────────────────────────────────────────────
const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{children}</label>
);

const selectClass = "w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 bg-white outline-none transition-all duration-200 text-sm text-slate-700";
const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 bg-white outline-none transition-all duration-200 text-sm text-slate-700";

// ─── Default Form State ─────────────────────────────────────────────────────────
const DEFAULT_PROFILE: BusinessProfile = {
  company_name: '',
  industry: 'FMCG',
  sub_industry: '',
  business_type: 'Manufacturer',
  country: 'India',
  state: '',
  city: '',
  areas_served: [],
  revenue_band: '',
  team_size: '',
  years_in_business: 0,
  business_intent: [],
  products_services: [],
  moq: 'None',
  export_ready: false,
};

// ─── Completeness Calculator ───────────────────────────────────────────────────
function calcCompleteness(f: BusinessProfile): number {
  const scalar = [f.company_name, f.industry, f.sub_industry, f.business_type, f.country, f.state, f.city, f.revenue_band, f.team_size, f.moq];
  const lists = [f.areas_served, f.business_intent, f.products_services];
  const num = [f.years_in_business];
  let filled = scalar.filter(v => v && String(v).trim()).length;
  filled += lists.filter(v => v && v.length > 0).length;
  filled += num.filter(v => v && v > 0).length;
  return Math.round((filled / (scalar.length + lists.length + num.length)) * 100);
}

// ─── Main Profile Page ─────────────────────────────────────────────────────────
const Profile = () => {
  const { data: profileData, isLoading, isError } = useGetProfile();
  const { mutateAsync: saveProfile, isPending } = useSaveProfile();
  const { toast, show: showToast, hide: hideToast } = useToast();

  const [form, setForm] = useState<BusinessProfile>(DEFAULT_PROFILE);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Prefill form when profile data arrives
  useEffect(() => {
    if (profileData && !hasLoaded) {
      setForm({ ...DEFAULT_PROFILE, ...profileData });
      setHasLoaded(true);
    }
  }, [profileData, hasLoaded]);

  const completeness = calcCompleteness(form);
  const navigate = useNavigate();

  const set = <K extends keyof BusinessProfile>(key: K, value: BusinessProfile[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const toggleIntent = (intent: string) => {
    const curr = form.business_intent || [];
    set('business_intent', curr.includes(intent) ? curr.filter(i => i !== intent) : [...curr, intent]);
  };

  const toggleArea = (area: string) => {
    const curr = form.areas_served || [];
    set('areas_served', curr.includes(area) ? curr.filter(a => a !== area) : [...curr, area]);
  };

  const handleSave = async () => {
    try {
      await saveProfile(form);
      showToast('Profile saved successfully!', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.detail || 'Failed to save profile.', 'error');
    }
  };

  // ─── Loading Skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
            <div className="h-5 bg-slate-200 rounded w-1/3" />
            <div className="h-10 bg-slate-100 rounded-xl" />
            <div className="h-10 bg-slate-100 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 pb-24 pt-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Business Profile</h1>
            <p className="text-slate-500 mt-1 text-sm">Keep your profile updated to get better matches.</p>
            {isError && !profileData && (
              <div className="mt-3 flex items-center gap-2 text-amber-600 text-sm font-medium">
                <AlertCircle className="w-4 h-4" />
                No profile yet — fill out the form to create one.
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/profile/setup', { state: { isEditMode: true, initialData: form } })}>
              Edit Profile
            </Button>
          </div>
          {/* Completeness Ring */}
          <div className="flex flex-col items-center gap-1 bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-4">
            <CompletenessRing pct={completeness} />
            <span className={`text-xs font-bold mt-1 ${completeness >= 80 ? 'text-green-600' : completeness >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
              {completeness >= 80 ? '🌟 Great Profile' : completeness >= 50 ? '⚡ Keep Going' : '🚀 Just Started'}
            </span>
          </div>
        </div>

        <div className="space-y-5">

          {/* ── Company Information ── */}
          <Section icon={<Building2 className="w-5 h-5" />} title="Company Information">
            <div>
              <Label>Company Name *</Label>
              <input className={inputClass} placeholder="e.g. Apex Manufacturing Pvt Ltd"
                value={form.company_name} onChange={e => set('company_name', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Role</Label>
                <select className={selectClass} value={form.business_type} onChange={e => set('business_type', e.target.value)}>
                  {BUSINESS_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <Label>Years in Business</Label>
                <input className={inputClass} type="number" min={0} max={200}
                  value={form.years_in_business || ''} placeholder="e.g. 5"
                  onChange={e => set('years_in_business', parseInt(e.target.value) || 0)} />
              </div>
            </div>
          </Section>

          {/* ── Industry Details ── */}
          <Section icon={<Briefcase className="w-5 h-5" />} title="Industry Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Industry *</Label>
                <select className={selectClass} value={form.industry}
                  onChange={e => { set('industry', e.target.value); set('sub_industry', ''); }}>
                  {Object.keys(INDUSTRIES).map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <Label>Sub-Industry</Label>
                <select className={selectClass} value={form.sub_industry || ''}
                  onChange={e => set('sub_industry', e.target.value)}>
                  <option value="">— Select —</option>
                  {(INDUSTRIES[form.industry] || []).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </Section>

          {/* ── Location ── */}
          <Section icon={<MapPin className="w-5 h-5" />} title="Location">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Country *</Label>
                <select className={selectClass} value={form.country}
                  onChange={e => { set('country', e.target.value); set('state', ''); }}>
                  {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label>State / Region</Label>
                <select className={selectClass} value={form.state || ''}
                  onChange={e => set('state', e.target.value)}>
                  <option value="">— Select —</option>
                  {(STATES[form.country] || []).map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label>City</Label>
                <input className={inputClass} placeholder="e.g. Mumbai"
                  value={form.city || ''} onChange={e => set('city', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Areas Served</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {AREAS.map(area => (
                  <button key={area} type="button"
                    onClick={() => toggleArea(area)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                      ${(form.areas_served || []).includes(area)
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                        : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-300 hover:text-indigo-600'}`}>
                    {area}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* ── Business Information ── */}
          <Section icon={<TrendingUp className="w-5 h-5" />} title="Business Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Revenue Band</Label>
                <select className={selectClass} value={form.revenue_band || ''}
                  onChange={e => set('revenue_band', e.target.value)}>
                  <option value="">— Select —</option>
                  {REVENUE_BANDS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <Label>Team Size</Label>
                <select className={selectClass} value={form.team_size || ''}
                  onChange={e => set('team_size', e.target.value)}>
                  <option value="">— Select —</option>
                  {TEAM_SIZES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <Label>Minimum Order Quantity (MOQ)</Label>
              <select className={selectClass} value={form.moq || 'None'}
                onChange={e => set('moq', e.target.value)}>
                {MOQS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </Section>

          {/* ── Business Intent ── */}
          <Section icon={<Target className="w-5 h-5" />} title="Business Intent">
            <p className="text-sm text-slate-500 -mt-2">Select all intents that describe your goals.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INTENTS.map(intent => {
                const active = (form.business_intent || []).includes(intent);
                return (
                  <button key={intent} type="button" onClick={() => toggleIntent(intent)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm font-semibold transition-all text-left
                      ${active
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-700 shadow-sm shadow-indigo-100'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-slate-50'}`}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                      ${active ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                      {active && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                    </div>
                    {intent}
                  </button>
                );
              })}
            </div>
          </Section>

          {/* ── Products & Services ── */}
          <Section icon={<Package className="w-5 h-5" />} title="Products & Services">
            <div>
              <Label>Products / Services (press Enter or comma to add)</Label>
              <TagInput
                tags={form.products_services || []}
                onChange={tags => set('products_services', tags)}
                placeholder="e.g. Electronics, Organic Food, Cloud SaaS…"
              />
            </div>
          </Section>

          {/* ── Additional ── */}
          <Section icon={<Globe className="w-5 h-5" />} title="Additional Information">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-sm font-bold text-slate-800">Export Ready</p>
                <p className="text-xs text-slate-500 mt-0.5">Can you fulfil international orders?</p>
              </div>
              <button type="button"
                onClick={() => set('export_ready', !form.export_ready)}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-300
                  ${form.export_ready ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300
                  ${form.export_ready ? 'translate-x-6' : ''}`} />
              </button>
            </div>

            {/* Verified status (read-only display) */}
            {profileData && (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                <ShieldCheck className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-bold text-green-800">Profile Completeness: {profileData.profile_completeness}%</p>
                  <p className="text-xs text-green-600 mt-0.5">Saved on the server. Higher completeness → better recommendations.</p>
                </div>
              </div>
            )}
          </Section>

          {/* ── Save Button ── */}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 transition-all duration-200 flex items-center justify-center gap-3 text-base disabled:opacity-60"
          >
            {isPending
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving…</>
              : <><Save className="w-5 h-5" /> Save Profile</>}
          </button>

        </div>
      </div>

      {toast.visible && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </div>
  );
};

export default Profile;
