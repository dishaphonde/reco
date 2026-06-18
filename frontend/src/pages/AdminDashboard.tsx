import { Users, CheckCircle, Activity, BarChart3, Target, UserX } from 'lucide-react';
import { useState } from 'react';
import { Tabs } from '../components/ui/Tabs';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: 'Total Businesses', value: '1,248', icon: <Users className="text-blue-500 w-6 h-6" />, bg: 'bg-blue-50' },
    { label: 'Verified Businesses', value: '892', icon: <CheckCircle className="text-green-500 w-6 h-6" />, bg: 'bg-green-50' },
    { label: 'Daily Active Users', value: '342', icon: <Activity className="text-purple-500 w-6 h-6" />, bg: 'bg-purple-50' },
    { label: 'Matches Created', value: '4,105', icon: <Target className="text-indigo-500 w-6 h-6" />, bg: 'bg-indigo-50' },
    { label: 'Accept Rate', value: '68%', icon: <BarChart3 className="text-orange-500 w-6 h-6" />, bg: 'bg-orange-50' },
  ];

  const pendingVerifications = [
    { id: 1, company: 'Nexus Technologies', industry: 'Software', date: 'Today, 10:30 AM' },
    { id: 2, company: 'Oceanic Exports', industry: 'Logistics', date: 'Yesterday, 4:15 PM' },
    { id: 3, company: 'Green Valley Farms', industry: 'Agriculture', date: '2 days ago' },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen pt-10 pb-24 px-4 bg-slate-50 md:px-8 lg:px-12 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Portal</h1>
        <p className="text-slate-500 mt-2">Manage users, monitor match statistics, and approve verifications.</p>
      </div>

      <div className="mb-8">
        <Tabs 
          activeTab={activeTab} 
          onChange={setActiveTab} 
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'verifications', label: 'Verifications' }
          ]} 
        />
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {stats.map((stat, idx) => (
              <Card key={idx} className="p-6 flex items-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${stat.bg}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-semibold">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Recommendation Engine Quality</h2>
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="mb-6 md:mb-0 space-y-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                  <span className="text-sm font-semibold text-slate-700">Excellent Matches (80+) : 45%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-indigo-500 mr-3"></div>
                  <span className="text-sm font-semibold text-slate-700">Strong Matches (65-79) : 30%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-400 mr-3"></div>
                  <span className="text-sm font-semibold text-slate-700">Good Matches (50-64) : 25%</span>
                </div>
              </div>
              <div className="w-full md:w-1/2 h-6 bg-slate-100 rounded-full flex overflow-hidden shadow-inner">
                <div className="h-full bg-green-500 transition-all duration-1000 ease-out" style={{ width: '45%' }}></div>
                <div className="h-full bg-indigo-500 transition-all duration-1000 ease-out" style={{ width: '30%' }}></div>
                <div className="h-full bg-yellow-400 transition-all duration-1000 ease-out" style={{ width: '25%' }}></div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'verifications' && (
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-xl font-bold text-slate-900">Pending Verification Requests</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingVerifications.map(req => (
              <div key={req.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-lg font-bold text-slate-900">{req.company}</h3>
                  <div className="flex items-center text-sm text-slate-500 mt-1.5 space-x-3 font-medium">
                    <span className="text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">{req.industry}</span>
                    <span>•</span>
                    <span>Submitted {req.date}</span>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button variant="ghost" className="!text-slate-600 hover:!text-red-600 hover:!bg-red-50">
                    <UserX className="w-4 h-4 mr-2" /> Reject
                  </Button>
                  <Button className="!bg-green-600 hover:!bg-green-700 shadow-green-200">
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  );
};

export default AdminDashboard;
