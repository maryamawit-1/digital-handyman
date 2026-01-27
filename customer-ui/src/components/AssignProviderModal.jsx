import React, { useState, useEffect } from 'react';
import { adminGetAvailableProviders, adminAssignProvider } from '../services/api';
import { X, UserCheck, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import client from '../services/api';

const AssignProviderModal = ({ isOpen, onClose, request, onSuccess }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);

  // Inside AssignProviderModal.jsx

useEffect(() => {
    if (isOpen && request?.service_id) { // Check if modal is open AND request details exist
      setLoading(true);
      const token = localStorage.getItem('token');

      // 1. Get the service ID from the request object passed to the modal
      const serviceId = request.service_id; 

      // 2. Call the API, passing the serviceId as a query parameter
      client.get(`/api/admin/providers/available?serviceId=${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setProviders(res.data))
        .catch(() => toast.error("Could not load filtered providers"))
        .finally(() => setLoading(false));
    }
    // Note: The dependency array must include request, or the modal won't refilter
}, [isOpen, request]); // Dependency on request ensures refiltering when a new job is selected

  const handleAssign = async () => {
    if (!selectedProvider) return toast.error("Please select a provider");
    
    try {
      const token = localStorage.getItem('token');
      await adminAssignProvider(token, request.id, selectedProvider);
      toast.success("Provider Assigned Successfully!");
      onSuccess(); // Refresh parent dashboard
      onClose(); // Close modal
    } catch (err) {
      toast.error("Assignment failed");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <UserCheck size={20} /> Assign Provider
          </h3>
          <button onClick={onClose} className="hover:text-red-400"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-slate-500 mb-4">
            Assigning for Request <span className="font-mono font-bold text-blue-600">{request?.referenceId}</span>
            <br />
            Service: <span className="font-bold">{request?.service_name}</span>
          </p>

          <h4 className="font-bold text-sm uppercase text-slate-400 mb-2">Available Providers (8am - 6pm)</h4>
          
          {loading ? (
            <div className="text-center py-4">Loading providers...</div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto border border-slate-100 rounded-lg p-2">
              {providers.length > 0 ? providers.map(p => (
                <div 
                  key={p.id}
                  onClick={() => setSelectedProvider(p.id)}
                  className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${
                    selectedProvider === p.id 
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' 
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-800">{p.first_name} {p.last_name}</div>
                    <div className="text-xs text-slate-500">{p.skills || 'General Handyman'}</div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                    <Star size={14} fill="currentColor" /> {p.rating}
                  </div>
                </div>
              )) : (
                <div className="text-center text-slate-400 py-4">No providers available right now.</div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg">Cancel</button>
          <button 
            onClick={handleAssign} 
            disabled={!selectedProvider}
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm Assignment
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignProviderModal;