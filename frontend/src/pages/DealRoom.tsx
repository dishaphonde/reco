import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const DealRoom = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState("Proposal Shared");

  const statuses = [
    "Initial Discussion",
    "Proposal Shared",
    "Negotiation",
    "Agreement Reached",
    "Closed Won"
  ];

  return (
    <div className="flex flex-col w-full min-h-screen pt-10 pb-24 px-4 bg-slate-50 md:px-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center">
        <button onClick={() => navigate('/matches')} className="mr-4 text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Deal Room {matchId}</h1>
          <p className="text-slate-500 mt-1">Manage documents, requirements, and deal status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Notes & Docs */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-5 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-indigo-500" /> Shared Documents
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-sm font-semibold text-slate-700">Vendor_Agreement_v1.pdf</span>
                <span className="text-xs text-slate-400 font-medium">Added yesterday</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-sm font-semibold text-slate-700">Product_Catalog_2026.pdf</span>
                <span className="text-xs text-slate-400 font-medium">Added 2 days ago</span>
              </div>
              <Button variant="outline" className="w-full mt-2 border-dashed border-2 py-6 text-slate-500 hover:border-indigo-400 hover:text-indigo-600">
                + Upload Document
              </Button>
            </div>
          </Card>

          <Card className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-5">Shared Notes & Requirements</h2>
            <textarea 
              className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none resize-none transition-all duration-200 text-sm text-slate-700"
              placeholder="Jot down meeting notes or specific MOQ requirements here..."
              defaultValue="- Looking for 10,000 units/month&#10;- Delivery required in Mumbai&#10;- Payment terms: Net 30"
            />
            <div className="mt-4 flex justify-end">
              <Button variant="primary">
                Save Notes
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar: Status Tracker */}
        <div className="space-y-8">
          <Card className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-indigo-500" /> Deal Status
            </h2>
            <div className="relative border-l-2 border-slate-200 ml-3 space-y-8">
              {statuses.map((s, idx) => {
                const isActive = s === status;
                const isPast = statuses.indexOf(s) < statuses.indexOf(status);
                
                return (
                  <div key={idx} className="relative pl-8">
                    <div className={`absolute -left-[11px] top-0 w-5 h-5 rounded-full border-2 bg-white transition-all duration-300
                      ${isActive ? 'border-indigo-600 shadow-[0_0_0_4px_rgba(79,70,229,0.15)] scale-110' : isPast ? 'border-green-500 bg-green-500' : 'border-slate-300'}
                    `}>
                      {isPast && <CheckCircle className="w-full h-full text-white" />}
                    </div>
                    <div className={`${isActive ? 'text-indigo-700 font-bold' : isPast ? 'text-slate-800 font-semibold' : 'text-slate-400 font-medium'} text-sm`}>
                      {s}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-10 pt-6 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider">Update Status</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all duration-200"
              >
                {statuses.map((s, i) => (
                  <option key={i} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default DealRoom;
