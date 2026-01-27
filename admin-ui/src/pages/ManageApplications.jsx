import React, { useState, useEffect } from 'react';
import { adminGetApplications, adminApproveApplication } from '../services/api'; // We will add approve function next
import { CheckCircle, Clock, User, Phone, Mail, ArrowLeft} from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ManageApplications = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  // Load Applications
  const loadApps = async () => {
    try {
      const res = await adminGetApplications(token);
      setApps(res.data);
    } catch (err) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadApps();
  }, [token]);

  // Handle Approve (Converts Applicant -> Provider)
  // Ensure you are waiting for the database to complete the transaction

const handleApprove = async (id) => {
    if (!window.confirm("Approve this applicant? They will become an active provider.")) return;
    
    try {
      const token = localStorage.getItem('token');
      // 1. Await the approval and creation process
      await adminApproveApplication(token, id); 

      // 2. Add a slight delay (This often helps the email queue catch up)
      await new Promise(resolve => setTimeout(resolve, 500)); 
      
      toast.success("Applicant approved! Credentials sent via email.");
      loadApps(); // 3. NOW reload the list
    } catch (error) {
      // If the error is 400 (already approved/exists), show a different message
      if (error.response && error.response.status === 400) {
           toast.error("Provider already approved or email is taken.");
           loadApps(); // Reload to update status
      } else {
           toast.error("Approval failed. Check backend terminal for error.");
      }
    }
  };

  if (loading) return <div className="p-10 text-center">Loading applications...</div>;

  return (
    <div className="p-10 min-h-screen bg-slate-50">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-medium transition-colors">
    <ArrowLeft size={20} /> Back to Dashboard
  </Link>
      <h1 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-2">
        <User className="text-blue-600" /> Provider Applications
      </h1>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-100 border-b text-slate-500 text-xs uppercase font-bold">
            <tr>
              <th className="p-4">Applicant</th>
              <th className="p-4">Contact</th>
              <th className="p-4">Skills & Experience</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {apps.map(app => (
              <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-slate-800">{app.first_name} {app.last_name}</div>
                  <div className="text-xs text-slate-400">Applied: {new Date(app.created_at || Date.now()).toLocaleDateString()}</div>
                </td>
                <td className="p-4 text-sm">
                  <div className="flex items-center gap-2 mb-1"><Mail size={14}/> {app.email}</div>
                  <div className="flex items-center gap-2"><Phone size={14}/> {app.phone}</div>
                </td>
                <td className="p-4 max-w-md">
                  <div className="font-bold text-blue-600 text-sm mb-1">{app.skills}</div>
                  <p className="text-xs text-slate-500 line-clamp-2">{app.experience_details}</p>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {app.status || 'PENDING'}
                  </span>
                </td>
                <td className="p-4">
                  {app.status !== 'APPROVED' && (
                    <button 
                      onClick={() => handleApprove(app.id)}
                      className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-600 flex items-center gap-2 transition-all"
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {apps.length === 0 && (
              <tr><td colSpan="5" className="p-10 text-center text-slate-400">No pending applications found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageApplications;