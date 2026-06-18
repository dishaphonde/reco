import React, { useState, useEffect } from 'react';
import { MessageCircle, Handshake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import api from '../lib/api';
import { useQuery } from '@tanstack/react-query';

const Matches: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const res = await api.get('/api/v1/matches');
      return res.data.items;
    }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading matches...</div>;
  }

  const matches = data || [];

  return (
    <div className="flex flex-col w-full min-h-screen pt-10 pb-24 px-4 bg-slate-50 md:px-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Matches</h1>
        <p className="text-slate-500 mt-2">Businesses that have mutually expressed interest.</p>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
          <p className="text-xl text-slate-500">No matches yet. Keep swiping in Discover!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {matches.map((match: any) => {
            const p = match.partner_profile;
            return (
              <Card key={match.id} hoverable className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 font-bold text-xl mr-4 border border-indigo-100">
                      {p.company_name ? p.company_name.charAt(0) : '?'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">{p.company_name}</h3>
                      <p className="text-sm text-slate-500 mt-0.5 font-medium">{p.industry}</p>
                    </div>
                  </div>
                  <Badge variant="success" className="whitespace-nowrap ml-2">
                    {Math.round(match.match_score)}% Match
                  </Badge>
                </div>

                <div className="text-xs text-slate-400 mb-8 flex-1 font-medium">
                  Matched on: {new Date(match.created_at).toLocaleDateString()}
                </div>

                <div className="flex space-x-3 mt-auto">
                  <Button 
                    variant="secondary"
                    className="flex-1"
                    onClick={() => navigate('/messages')}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" /> Chat
                  </Button>
                  <Button 
                    variant="primary"
                    className="flex-1"
                    onClick={() => navigate(`/deal-room/${match.deal_room_id || match.id}`)}
                  >
                    <Handshake className="w-4 h-4 mr-2" /> Deal Room
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Matches;
