import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, ChevronRight, ChevronLeft, Building2, MapPin, Briefcase, Target, Package } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import api from '../lib/api';
import { useAuth } from '../components/AuthContext';

const intentsList = [
  "Seeking Distributors", "Seeking Suppliers", "Seeking Buyers", 
  "Seeking Investment", "Export Opportunities", "Strategic Partnerships"
];

const Onboarding = ({ isEditMode = false, initialData = null }: { isEditMode?: boolean, initialData?: any }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { fetchProfile } = useAuth();
  
  const stateInitialData = location.state?.initialData || initialData;
  const editMode = location.state?.isEditMode || isEditMode;

  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const [formData, setFormData] = useState({
    company_name: '',
    industry: 'FMCG',
    sub_industry: '',
    business_type: 'Manufacturer',
    country: '',
    state: '',
    city: '',
    areas_served: '',
    revenue_band: 'Pre-revenue',
    team_size: '1-10',
    years_in_business: '',
    business_intent: [] as string[],
    products_services: '',
    moq: '',
    export_ready: false,
  });

  useEffect(() => {
    if (stateInitialData) {
      setFormData({
        ...stateInitialData,
        areas_served: stateInitialData.areas_served?.join(', ') || '',
        products_services: stateInitialData.products_services?.join(', ') || '',
      });
    }
  }, [stateInitialData]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        years_in_business: parseInt(data.years_in_business) || 0,
        areas_served: data.areas_served.split(',').map((s: string) => s.trim()).filter(Boolean),
        products_services: data.products_services.split(',').map((s: string) => s.trim()).filter(Boolean),
      };
      return api.post('/api/v1/profile/upsert', payload);
    },
    onSuccess: async () => {
      await fetchProfile();
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      navigate('/discover');
    }
  });

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleFinish = () => {
    mutation.mutate(formData);
  };

  const handleIntentToggle = (intent: string) => {
    setFormData(prev => {
      const exists = prev.business_intent.includes(intent);
      if (exists) {
        return { ...prev, business_intent: prev.business_intent.filter(i => i !== intent) };
      }
      return { ...prev, business_intent: [...prev.business_intent, intent] };
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center text-indigo-600 mb-2">
              <Building2 className="w-8 h-8 mr-3" />
              <h2 className="text-2xl font-bold text-slate-900">Basic Information</h2>
            </div>
            <Input name="company_name" value={formData.company_name} onChange={handleChange} label="Company Name" placeholder="e.g. Apex Manufacturing" />
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Industry</label>
              <select name="industry" value={formData.industry} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white outline-none transition-all duration-200">
                <option>FMCG</option>
                <option>Technology</option>
                <option>Logistics</option>
                <option>Healthcare</option>
                <option>Retail</option>
                <option>Manufacturing</option>
              </select>
            </div>
            <Input name="sub_industry" value={formData.sub_industry} onChange={handleChange} label="Sub Industry" placeholder="e.g. Packaged Foods" />
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Business Type</label>
              <select name="business_type" value={formData.business_type} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white outline-none transition-all duration-200">
                <option>Manufacturer</option>
                <option>Distributor</option>
                <option>Service Provider</option>
                <option>Retail</option>
                <option>Supplier</option>
              </select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center text-indigo-600 mb-2">
              <MapPin className="w-8 h-8 mr-3" />
              <h2 className="text-2xl font-bold text-slate-900">Location</h2>
            </div>
            <Input name="country" value={formData.country} onChange={handleChange} label="Country" placeholder="e.g. India" />
            <Input name="state" value={formData.state} onChange={handleChange} label="State/Province" placeholder="e.g. Maharashtra" />
            <Input name="city" value={formData.city} onChange={handleChange} label="City" placeholder="e.g. Mumbai" />
            <Input name="areas_served" value={formData.areas_served} onChange={handleChange} label="Areas Served (comma separated)" placeholder="e.g. India, UAE" />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center text-indigo-600 mb-2">
              <Briefcase className="w-8 h-8 mr-3" />
              <h2 className="text-2xl font-bold text-slate-900">Business Details</h2>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Revenue Band</label>
              <select name="revenue_band" value={formData.revenue_band} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white outline-none transition-all duration-200">
                <option>Pre-revenue</option>
                <option>$0 - $1M</option>
                <option>$1M - $5M</option>
                <option>$5M - $10M</option>
                <option>$10M+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Team Size</label>
              <select name="team_size" value={formData.team_size} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white outline-none transition-all duration-200">
                <option>1-10</option>
                <option>11-50</option>
                <option>51-200</option>
                <option>201+</option>
              </select>
            </div>
            <Input name="years_in_business" type="number" value={formData.years_in_business} onChange={handleChange} label="Years in Business" placeholder="e.g. 5" />
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center text-indigo-600 mb-2">
              <Target className="w-8 h-8 mr-3" />
              <h2 className="text-2xl font-bold text-slate-900">Business Intent</h2>
            </div>
            <p className="text-sm text-slate-500 mb-2">Select all that apply to help us match you accurately.</p>
            <div className="grid grid-cols-1 gap-3">
              {intentsList.map((intent, idx) => (
                <label key={idx} className="flex items-center p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-indigo-200 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={formData.business_intent.includes(intent)}
                    onChange={() => handleIntentToggle(intent)}
                    className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" 
                  />
                  <span className="ml-3 text-slate-700 font-semibold">{intent}</span>
                </label>
              ))}
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center text-indigo-600 mb-2">
              <Package className="w-8 h-8 mr-3" />
              <h2 className="text-2xl font-bold text-slate-900">Products & Services</h2>
            </div>
            <Input name="products_services" value={formData.products_services} onChange={handleChange} label="Categories (comma separated)" placeholder="e.g. Electronics, Packaging" />
            <Input name="moq" value={formData.moq} onChange={handleChange} label="Minimum Order Quantity (MOQ)" placeholder="e.g. 1000 units" />
            <label className="flex items-center mt-4">
              <input 
                type="checkbox" 
                name="export_ready"
                checked={formData.export_ready}
                onChange={handleChange}
                className="w-5 h-5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" 
              />
              <span className="ml-3 text-slate-700 font-semibold">We are Export Ready</span>
            </label>
          </div>
        );
      case 6:
        return (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">{editMode ? 'Ready to Update!' : 'Profile Complete!'}</h2>
            <p className="text-slate-500 max-w-sm mx-auto leading-relaxed">
              {editMode ? 'Save your changes to update your profile details.' : 'Your business profile is fully prepared. Our AI recommendation engine is now ready to find the best matches for your business intent.'}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-auto">
        <Card className="py-10 px-8 sm:px-12 relative overflow-hidden">
          {mutation.isPending && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          )}
          
          {/* Progress Bar */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Step {step} of {totalSteps}</span>
              <span className="text-xs font-bold text-slate-400">{Math.round((step/totalSteps)*100)}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500 ease-in-out" 
                style={{ width: `${(step/totalSteps)*100}%` }}
              ></div>
            </div>
          </div>

          {/* Form Area */}
          <div className="min-h-[380px]">
            {renderStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-10 flex justify-between">
            {step > 1 ? (
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            ) : <div></div>}
            
            {step < totalSteps ? (
              <Button onClick={nextStep}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleFinish} className="w-full !bg-green-600 hover:!bg-green-700 shadow-green-200">
                {editMode ? 'Save Changes' : 'Start Discovering Matches'}
              </Button>
            )}
          </div>

        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
