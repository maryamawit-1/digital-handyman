import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProviderJobs, providerCompleteJob } from '../services/api';
import { LogOut, MapPin, Phone, Clock, CheckCircle, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const ProviderDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Get provider info from storage
  const provider = JSON.parse(localStorage.getItem('provider'));

  const loadJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await getProviderJobs(token, provider.id);
      setJobs(res.data);
    } catch (err) {
      toast.error("Failed to load your assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!provider) { navigate('/provider/login'); return; }
    loadJobs();
  }, []);

  const handleComplete = async (jobId) => {
    if (!window.confirm("Is the work finished? This will send the receipt to the customer.")) return;
    try {
      const token = localStorage.getItem('token');
      await providerCompleteJob(token, provider.id, jobId);
      toast.success("Job Completed! Receipt sent to customer.");
      loadJobs(); // Refresh list
    } catch (err) {
      toast.error("Error updating job status.");
    }
  };

  if (loading) return <div className="p-20 text-center font-bold">Loading Workspace...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Dark Header */}
      <div className="bg-slate-900 text-white p-6 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              PROVIDER ACTIVE
            </h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Staff: {provider?.name}</p>
          </div>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} className="text-slate-400 hover:text-red-400 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-2">
          <Briefcase className="text-blue-600" /> Your Assigned Jobs
        </h2>

        <div className="space-y-6">
          {jobs.map(job => (
            <div key={job.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    job.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {job.status}
                  </span>
                  <span className="text-[10px] text-slate-300 font-mono">ID: {job.referenceId}</span>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{job.service_name}</h3>
                
                <div className="space-y-3 text-sm text-slate-600 font-medium">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-blue-600 shrink-0 mt-0.5" /> 
                    <span>{job.cust_address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock size={18} className="text-blue-600 shrink-0" /> 
                    <span>{job.preferred_date} at {job.preferred_time}</span>
                  </div>
                </div>

                <div className="mt-6 bg-slate-50 p-4 rounded-2xl text-xs italic text-slate-500 border border-slate-100">
                  Notes: "{job.description || 'No special instructions provided.'}"
                </div>
              </div>

              <div className="md:w-64 md:border-l md:pl-8 flex flex-col justify-center space-y-6">
                <div className="text-center md:text-left">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Customer</p>
                  <p className="font-bold text-slate-800">{job.cust_name}</p>
                  <a href={`tel:${job.cust_phone}`} className="text-blue-600 font-black text-sm hover:underline">
                    {job.cust_phone}
                  </a>
                </div>

                {job.status !== 'COMPLETED' ? (
                  <button onClick={() => handleComplete(job.id)} className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 text-xs">
                    <CheckCircle size={18} /> Mark as Finished
                  </button>
                ) : (
                  <div className="text-center text-emerald-600 font-black text-xs uppercase bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                    Job Successful ✓
                  </div>
                )}
              </div>
            </div>
          ))}

          {jobs.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
              <p className="text-slate-400 font-bold uppercase tracking-widest">No active assignments found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;