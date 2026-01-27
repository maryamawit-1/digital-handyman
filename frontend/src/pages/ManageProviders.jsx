import React, { useState, useEffect } from 'react';
import { adminGetAvailableProviders, adminDeleteProvider } from '../services/api';
import { Trash2, User, Star, ArrowLeft, Shield, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import CreateProviderModal from '../components/CreateProviderModal'; 

const ManageProviders = () => {
  const [providers, setProviders] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const token = localStorage.getItem('token');

  // --- DEFINE loadProviders BEFORE useEffect ---
  const loadProviders = async () => {
    try {
      // NOTE: Using adminGetAvailableProviders here, which relies on being logged in
      const res = await adminGetAvailableProviders(token); 
      setProviders(res.data);
    } catch (err) { 
      toast.error("Failed to load providers list."); 
    }
  };

  // --- useEffect CALLS loadProviders ---
  useEffect(() => { 
    if (token) loadProviders(); 
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently remove this provider?")) return;
    try {
      await adminDeleteProvider(token, id);
      toast.success("Provider removed.");
      loadProviders();
    } catch (err) { 
      toast.error("Cannot delete provider with active jobs."); 
    }
  };

  // --- START OF JSX RETURN ---
  return (
    <div className="min-h-screen bg-slate-50 p-10">
      
      {/* 1. BACK LINK */}
      <Link to="/admin/dashboard" className="flex items-center gap-2 text-slate-500 mb-8 font-medium">
        <ArrowLeft size={20}/> Dashboard
      </Link>

      {/* 2. HEADER AND ADD BUTTON (This must be the first thing in the main div) */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-2">
          <Shield className="text-blue-600" /> Active Service Providers
        </h1>
        <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-5 py-2 rounded-full flex items-center gap-2 hover:bg-blue-700 font-bold"
        >
            <Plus size={20} /> Add Provider Manually
        </button>
      </header>

      {/* 3. PROVIDER LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map(p => (
          <div key={p.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><User size={24} /></div>
              <div className="bg-amber-50 px-2 py-1 rounded-lg text-amber-500 font-bold text-xs flex items-center gap-1">
                <Star size={12} fill="currentColor" /> {p.rating}
              </div>
            </div>
            <h3 className="font-bold text-lg text-slate-800">{p.first_name} {p.last_name}</h3>
            <p className="text-xs text-slate-400 font-medium mb-4 uppercase tracking-widest">{p.email}</p>
            <div className="bg-slate-50 p-3 rounded-xl mb-6 flex-grow">
              <p className="text-[10px] font-black text-slate-300 uppercase mb-1">Skills</p>
              <p className="text-xs text-slate-600 font-bold leading-relaxed">{p.skills}</p>
            </div>
            <button onClick={() => handleDelete(p.id)} className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 text-sm">
              <Trash2 size={16} /> Terminate Access
            </button>
          </div>
        ))}
      </div>
      
      {/* 4. RENDER MODAL */}
      <CreateProviderModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={loadProviders}
      />
    </div>
  );
};
export default ManageProviders;