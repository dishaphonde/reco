import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../components/AuthContext';
import { useUpsertProfile } from '../hooks/useProfile';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [role, setRole] = useState('Business');
  const [error, setError] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const upsert = useUpsertProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    try {
      await api.post('/api/v1/auth/register', { email, password, role });
      // After successful registration, log the user in automatically and redirect to profile setup
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);
      const res = await api.post('/api/v1/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      await login(res.data.access_token);
      // Upsert initial profile data if provided
      const payload: any = {
        company_name: companyName || undefined,
        industry: industry || undefined,
        city: city || undefined,
        country: country || undefined,
        business_type: role,
      };
      try {
        await upsert.mutateAsync(payload as any);
      } catch (e) {
        console.warn('Profile upsert failed', e);
      }
      navigate('/profile/setup');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to register');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700">Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Company Name (optional)</label>
            <input value={companyName} onChange={e => setCompanyName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Industry (optional)</label>
            <input value={industry} onChange={e => setIndustry(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">City (optional)</label>
              <input value={city} onChange={e => setCity(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Country (optional)</label>
              <input value={country} onChange={e => setCountry(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md">
              <option>Business</option>
              <option>Startup</option>
              <option>Investor</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2 px-4 rounded-md bg-indigo-600 text-white font-semibold">Create Account</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
