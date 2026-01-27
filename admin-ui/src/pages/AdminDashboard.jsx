import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchAdminDashboard, adminGetServiceRequests, adminUpdateServiceRequest, adminDeleteRequest } from '../services/api';
import { LayoutDashboard, ClipboardList, Users, Wrench, LogOut, Trash2, CheckCircle, UserCheck, FileText, MessageSquare } from 'lucide-react'; // Added UserCheck
import toast from 'react-hot-toast';
import AssignProviderModal from '../components/AssignProviderModal';

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ totalRequests: 0, totalProviders: 0, totalFeedback: 0 });
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Helper to open the modal
  // This should already be correct, but verify:
const openAssignModal = (request) => {
    setSelectedRequest(request); // This saves the entire request object, including service_id
    setIsAssignModalOpen(true);
};

  const loadData = async () => {
    if (!token) {
      navigate('/');
      return;
    }
    try {
      const dashboardRes = await fetchAdminDashboard(token);
      const requestsRes = await adminGetServiceRequests(token);
      setStats(dashboardRes.data.summary || { totalRequests: 0, totalProviders: 0, totalFeedback: 0 });
      setRequests(requestsRes.data || []);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
      toast.error("Session expired or failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success("Logged out successfully");
    navigate('/');
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await adminUpdateServiceRequest(token, id, { status: newStatus });
      toast.success(`Request marked as ${newStatus}`);
      loadData(); 
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
        await adminDeleteRequest(token, id);
        toast.success("Request deleted");
        loadData();
      } catch (err) {
        toast.error("Failed to delete request");
      }
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6 space-y-8 sticky top-0 h-screen">
        <h2 className="text-xl font-black tracking-tighter italic">ADMIN PANEL</h2>
        <nav className="space-y-4">
          <Link to="/dashboard" className="flex items-center gap-3 text-blue-400 font-bold"><LayoutDashboard size={20}/> Dashboard</Link>
          <Link to="/services" className="flex items-center gap-3 text-slate-400 hover:text-white transition"><Wrench size={20}/> Services</Link>
          <Link to="/applications" className="flex items-center gap-3 text-slate-400 hover:text-white transition"><Users size={20}/> Applications</Link>
          <Link to="/feedback" className="flex items-center gap-3 text-slate-400 hover:text-white transition"><MessageSquare size={20}/> Feedback</Link>
          <Link to="/providers" className="flex items-center gap-3 text-slate-400 hover:text-white transition"><Users size={20}/> Providers</Link>
          <Link to="/reports" className="flex items-center gap-3 text-slate-400 hover:text-white transition"><FileText size={20}/> Reports</Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-slate-800">Overview</h1>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-red-600 font-medium transition"
          >
            <LogOut size={18}/> Logout
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-sm font-bold uppercase">Total Requests</p>
            <h3 className="text-4xl font-black mt-2 text-blue-600">{stats.totalRequests}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-sm font-bold uppercase">Active Providers</p>
            <h3 className="text-4xl font-black mt-2 text-emerald-500">{stats.totalProviders}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-slate-500 text-sm font-bold uppercase">Feedback</p>
            <h3 className="text-4xl font-black mt-2 text-amber-500">{stats.totalFeedback}</h3>
          </div>
        </div>

        {/* Recent Requests Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-bold">Recent Service Requests</h2>
            <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Internal Use Only</span>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {requests.length > 0 ? requests.map(req => (
                <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-sm text-blue-600 font-bold">{req.referenceId}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-700">{req.first_name} {req.last_name}</div>
                    <div className="text-xs text-slate-400">{req.service_name || 'General Service'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 
                      req.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-700' :
                      req.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex justify-center gap-3">
                    {/* IF PENDING -> SHOW ASSIGN BUTTON */}
                    {req.status === 'PENDING' && (
                      <button 
                        onClick={() => openAssignModal(req)}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold hover:bg-blue-200 flex items-center gap-1"
                      >
                        <UserCheck size={14} /> Assign
                      </button>
                    )}

                    {/* IF ASSIGNED -> SHOW COMPLETE BUTTON */}
                    {req.status === 'ASSIGNED' && (
                      <button 
                        onClick={() => handleStatusUpdate(req.id, 'COMPLETED')}
                        className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold hover:bg-emerald-200 flex items-center gap-1"
                      >
                         <CheckCircle size={14} /> Complete
                      </button>
                    )}

                    <button 
                      onClick={() => handleDelete(req.id)}
                      className="text-red-400 hover:text-red-600 p-1 bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 size={18}/>
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-slate-400">No requests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RENDER THE MODAL HERE */}
      <AssignProviderModal 
        isOpen={isAssignModalOpen} 
        onClose={() => setIsAssignModalOpen(false)} 
        request={selectedRequest}
        onSuccess={loadData}
      />
    </div>
  );
};

export default AdminDashboard;