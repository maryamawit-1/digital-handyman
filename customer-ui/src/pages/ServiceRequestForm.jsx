import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import { getServices, submitServiceRequest } from '../services/api';
import toast from 'react-hot-toast';
import { Calendar, Clock, MapPin, AlertCircle, ArrowRight } from 'lucide-react';

const ServiceRequestForm = () => {
  // 1. ALL STATES MUST BE HERE
  const [services, setServices] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevents double submission
  const [formData, setFormData] = useState({
  name: '', email: '', phone: '', address: '',
  description: '', service_id: '', service_name: '', unit_price: 0,
  preferred_date: '', 
  preferred_time_start: '', // NEW START TIME
  preferred_time_end: ''    // NEW END TIME
});

  const today = new Date().toISOString().split('T')[0];

  // 2. FETCH SERVICES
  useEffect(() => {
    getServices().then(res => setServices(res.data)).catch(console.error);
  }, []);

  // 3. VALIDATION HELPERS
  const validateTime = (time) => {
    if (!time) return true;
    const [hour] = time.split(':').map(Number);
    if (hour < 8 || hour >= 18) {
      toast.error("Our providers work between 8:00 AM and 6:00 PM.");
      return false;
    }
    return true;
  };

  // 4. SUBMIT LOGIC (WITH PROTECTION)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double clicks
    if (isSubmitting) return; 

    // Validations
    if (!validateTime(formData.preferred_time)) return;
    if (formData.address.length < 10) {
      toast.error("Please provide a more detailed address.");
      return;
    }
    
    setIsSubmitting(true); // Disable button immediately

    try {
      const response = await submitServiceRequest(formData);
      
      toast.success(
        (t) => (
          <span>
            <b>Booking Confirmed!</b><br/>
            Reference ID: <span className="font-mono text-blue-600">{response.data.referenceId}</span>
          </span>
        ), 
        { duration: 6000 }
      );

      // Reset form on success
      setFormData({
        name: '', email: '', phone: '', address: '',
        description: '', service_id: '', service_name: '', unit_price: 0,
        preferred_date: '',  preferred_time_start: '', preferred_time_end: ''
      });

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit request.");
    } finally {
      setIsSubmitting(false); // Re-enable button
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 flex flex-col items-center">
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200 w-full max-w-2xl border border-slate-100">
        <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Book a Provider</h2>
            <p className="text-slate-500 font-medium">Simple, fast home repairs. No account required.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Full Name</label>
              <input type="text" required className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                placeholder="Abebe Balcha" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Phone Number</label>
              <input type="text" required className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                placeholder="0911..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Email Address</label>
            <input type="email" required className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              placeholder="abebe@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Select Service</label>
            <select required className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all appearance-none"
              value={formData.service_id} 
              onChange={e => {
                const selectedId = parseInt(e.target.value);
                const svc = services.find(s => s.id === selectedId);
                setFormData({
                    ...formData, 
                    service_id: selectedId, 
                    service_name: svc?.name,
                    unit_price: svc?.unit_price
                });
              }}>
              <option value="">Choose a Service Category...</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.unit_price} ETB/{s.unit_label})</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Address (Clear Details)</label>
            <textarea required className="w-full p-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 transition-all h-24"
              placeholder="Specific location (e.g., Bole, behind Friendship Mall, House #123)"
              value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
          </div>


<div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
  <div className="flex items-center gap-2 mb-4 text-blue-800 text-xs font-black uppercase tracking-widest">
    <Clock size={16}/> Business Hours: 8:00 AM - 6:00 PM
  </div>
  
  {/* ROW 1: PREFERRED DATE */}
  <div className="mb-4">
    <label className="text-[10px] font-black uppercase text-blue-400 ml-1">Preferred Date</label>
    <input type="date" required min={today} className="w-full p-3 rounded-xl bg-white border-none focus:ring-2 focus:ring-blue-600"
      value={formData.preferred_date} onChange={e => setFormData({...formData, preferred_date: e.target.value})} />
  </div>
  
  {/* ROW 2: START AND END TIME (Side-by-side) */}
  <div className="grid grid-cols-2 gap-4">
    <div>
      <label className="text-[10px] font-black uppercase text-blue-400 ml-1">Start Time</label>
      <input type="time" required className="w-full p-3 rounded-xl bg-white border-none focus:ring-2 focus:ring-blue-600"
        value={formData.preferred_time_start} 
        onChange={e => setFormData({...formData, preferred_time_start: e.target.value})} />
    </div>
    <div>
      <label className="text-[10px] font-black uppercase text-blue-400 ml-1">End Time</label>
      <input type="time" required className="w-full p-3 rounded-xl bg-white border-none focus:ring-2 focus:ring-blue-600"
        value={formData.preferred_time_end} 
        onChange={e => setFormData({...formData, preferred_time_end: e.target.value})} />
    </div>
  </div>
</div>
          {/* DYNAMIC BUTTON */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full py-5 rounded-[1.5rem] font-black uppercase tracking-widest transition-all shadow-xl ${
              isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-blue-600 hover:scale-[1.02]'
            }`}
          >
            {isSubmitting ? 'Processing Your Booking...' : 'Confirm Booking'}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Already booked a provider?</p>
            <Link to="/track" className="inline-flex items-center gap-2 bg-white border-2 border-slate-900 text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-slate-900 hover:text-white transition-all text-sm uppercase">
              Track Request <ArrowRight size={18} />
            </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceRequestForm;