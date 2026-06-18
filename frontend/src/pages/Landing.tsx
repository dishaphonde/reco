import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-slate-50 to-indigo-50">
      <div className="max-w-2xl w-full px-6 py-12 text-center">
        <h1 className="text-4xl font-extrabold text-indigo-600">Bridge</h1>
        <p className="mt-4 text-slate-600 text-lg">Find the Right Business Partners Faster</p>

        <div className="mt-8 flex justify-center gap-4">
          <button onClick={() => navigate('/login')} className="px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition">Login</button>
          <button onClick={() => navigate('/register')} className="px-6 py-3 rounded-full border border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-50 transition">Create Account</button>
        </div>

        <div className="mt-12 text-sm text-slate-500">Bridge is a B2B matchmaking platform connecting verified businesses worldwide.</div>
      </div>
    </div>
  );
};

export default Landing;
