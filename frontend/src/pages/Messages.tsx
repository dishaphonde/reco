import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const res = await api.get('/api/v1/matches');
      return res.data.items || [];
    }
  });

  const matches = data || [];
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const scroller = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (activeMatchId) {
      const raw = localStorage.getItem(`chat:${activeMatchId}`) || '[]';
      setMessages(JSON.parse(raw));
    }
  }, [activeMatchId]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const openChat = (matchId: string) => {
    setActiveMatchId(matchId);
  };

  const sendMessage = () => {
    if (!text.trim() || !activeMatchId) return;
    const msg = { id: Date.now(), from: 'me', text: text.trim(), ts: new Date().toISOString() };
    const next = [...messages, msg];
    setMessages(next);
    localStorage.setItem(`chat:${activeMatchId}`, JSON.stringify(next));
    setText('');
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="flex flex-col w-full min-h-screen pt-10 pb-24 px-4 bg-slate-50 md:px-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Messages</h1>
        <p className="text-slate-500 mt-1 ml-4">Conversations with your matches</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Conversations</h3>
              <Button variant="outline" onClick={() => { localStorage.clear(); setMessages([]); }}>Clear</Button>
            </div>

            <div className="space-y-3">
              {matches.length === 0 && <div className="text-sm text-slate-500">No matches yet.</div>}
              {matches.map((m: any) => {
                const p = m.partner_profile || {};
                return (
                  <div key={m.id} className={`p-3 rounded-lg cursor-pointer hover:bg-slate-50 flex items-center justify-between ${activeMatchId === String(m.id) ? 'bg-indigo-50' : ''}`} onClick={() => openChat(String(m.id))}>
                    <div>
                      <div className="font-semibold text-sm">{p.company_name}</div>
                      <div className="text-xs text-slate-400">{p.industry}</div>
                    </div>
                    <div className="text-xs text-slate-400">{Math.round(m.match_score)}%</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="p-0 flex flex-col h-[70vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-3 text-indigo-500" />
                <div>
                  <div className="font-bold">{activeMatchId ? (matches.find((x:any) => String(x.id) === activeMatchId)?.partner_profile?.company_name) : 'Select a conversation'}</div>
                  <div className="text-xs text-slate-400">{activeMatchId ? `Conversation with your match` : 'Choose a match to start chatting.'}</div>
                </div>
              </div>
              {activeMatchId && (
                <div className="flex items-center gap-3">
                  <Button variant="secondary" onClick={() => navigate(`/deal-room/${activeMatchId}`)}>
                    <ArrowRight className="w-4 h-4 mr-2" /> Deal Room
                  </Button>
                </div>
              )}
            </div>

            <div ref={scroller} className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
              {!activeMatchId && (
                <div className="text-center text-slate-400">Select a conversation to view messages.</div>
              )}

              {activeMatchId && messages.length === 0 && (
                <div className="text-center text-slate-400">No messages yet. Say hello 👋</div>
              )}

              {messages.map((m: any) => (
                <div key={m.id} className={`max-w-lg ${m.from === 'me' ? 'ml-auto text-right' : ''}`}>
                  <div className={`${m.from === 'me' ? 'inline-block bg-indigo-600 text-white' : 'inline-block bg-slate-100 text-slate-900'} rounded-xl px-4 py-2 text-sm`}>{m.text}</div>
                  <div className="text-xs text-slate-400 mt-1">{new Date(m.ts).toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
              <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }} className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white outline-none" placeholder="Write a message..." />
              <Button onClick={sendMessage} className="flex items-center gap-2">
                Send <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;
