import React, { useState, useEffect } from 'react';
import { getServices, adminCreateService, adminUpdateService, adminDeleteService } from '../services/api';
import { Wrench, Plus, Trash2, Edit2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const ManageServices = () => {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({ 
    name: '', pricing_model: 'FLAT', unit_price: '', unit_label: 'job', is_active: 1 
  });
  const token = localStorage.getItem('token');

  // Fetch Data
  const loadServices = async () => {
    try {
      const res = await getServices();
      setServices(res.data);
    } catch (err) {
      toast.error("Failed to load services");
    }
  };

  useEffect(() => { loadServices(); }, []);

  // Handle Add
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return toast.error("Unauthorized");

    try {
      await adminCreateService(token, formData);
      toast.success("Service created successfully!");
      setFormData({ name: '', pricing_model: 'FLAT', unit_price: '', unit_label: 'job', is_active: 1 }); // Reset form
      loadServices();
    } catch (err) {
      toast.error("Failed to create service");
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if(!window.confirm("Delete this service? Note: You cannot delete services that have existing bookings.")) return;
    try {
      await adminDeleteService(token, id);
      toast.success("Service deleted");
      loadServices();
    } catch (err) {
      toast.error("Could not delete. Try deactivating instead.");
    }
  };

  // Handle Toggle Active
  const toggleActive = async (service) => {
    try {
      await adminUpdateService(token, service.id, { is_active: !service.is_active });
      toast.success(`Service ${service.is_active ? 'Deactivated' : 'Activated'}`);
      loadServices();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-10">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-medium transition-colors">
    <ArrowLeft size={20} /> Back to Dashboard
  </Link>
      <h1 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-2">
        <Wrench className="text-blue-600" /> Manage Services
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Create Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-10">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Plus size={20} className="text-emerald-500"/> Add New Service
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Service Name</label>
                <input required type="text" className="w-full p-3 border rounded-lg bg-slate-50" 
                  placeholder="e.g. TV Mounting"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Price</label>
                  <input required type="number" className="w-full p-3 border rounded-lg bg-slate-50" 
                    placeholder="0.00 ETB"
                    value={formData.unit_price}
                    onChange={e => setFormData({...formData, unit_price: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Per...</label>
                  <input required type="text" className="w-full p-3 border rounded-lg bg-slate-50" 
                    placeholder="hr, job, sqft"
                    value={formData.unit_label}
                    onChange={e => setFormData({...formData, unit_label: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Pricing Model</label>
                <select className="w-full p-3 border rounded-lg bg-slate-50"
                  value={formData.pricing_model}
                  onChange={e => setFormData({...formData, pricing_model: e.target.value})}>
                  <option value="FLAT">Flat Rate (Fixed)</option>
                  <option value="PER_SQM">Per Square Meter</option>
                  <option value="PER_INCH">Per Inch</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition">
                Create Service
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: List of Services */}
        <div className="lg:col-span-2 space-y-4">
          {services.map(service => (
            <div key={service.id} className={`bg-white p-5 rounded-xl shadow-sm border flex justify-between items-center transition-all ${!service.is_active ? 'opacity-60 bg-slate-100' : ''}`}>
              <div>
                <h3 className="font-bold text-lg text-slate-800">{service.name}</h3>
                <p className="text-sm text-slate-500">
                  <span className="font-mono font-bold text-blue-600">{service.unit_price} ETB</span> / {service.unit_label} 
                  <span className="text-xs ml-2 bg-slate-100 px-2 py-0.5 rounded text-slate-500">{service.pricing_model}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Toggle Active Button */}
                <button 
                  onClick={() => toggleActive(service)}
                  title={service.is_active ? "Deactivate" : "Activate"}
                  className={`p-2 rounded-lg ${service.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-200'}`}
                >
                  {service.is_active ? <CheckCircle size={20} /> : <XCircle size={20} />}
                </button>

                {/* Delete Button */}
                <button 
                  onClick={() => handleDelete(service.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
          
          {services.length === 0 && (
            <div className="text-center py-20 text-slate-400">No services found. Add one on the left!</div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ManageServices;