import React, { useState, useEffect } from 'react';
import client from '../services/api'; 
import { Search, User, Clock, Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';


const TrackRequest = () => {
  const [refId, setRefId] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  
  // States for the "Forgot ID" feature
  const [showForgot, setShowForgot] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Load history from browser storage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('recent_bookings') || '[]');
    setRecent(saved);
  }, []);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!refId) return;
    setError('');
    setStatus(null);
    setIsLoading(true); // START loading indicator

    const cleanRefId = refId.trim().toUpperCase(); 

    try {

      const res = await client.get(`/api/requests/track/${refId.toUpperCase()}`);
      setStatus(res.data);

       const updated = [cleanRefId, ...recent.filter(id => id !== cleanRefId)].slice(0, 3);
      localStorage.setItem('recent_bookings', JSON.stringify(updated));
      setRecent(updated);
      
      // ... save history ...
    } catch (err) {
      // If the backend sends 404, we catch it here
      setError("Request not found. Please check your ID.");
    } finally {
      setIsLoading(false); // STOP loading indicator
    }
};

  const handleResend = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
        await client.post('/api/requests/resend-id', { email: recoveryEmail });
        toast.success("Booking IDs sent to your email!");
        setShowForgot(false);
    } catch (err) { 
        toast.error("No bookings found for this email."); 
    } finally {
        setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-12 px-4 pb-20">
      <div className="max-w-lg w-full">
        <Link to="/request" className="flex items-center gap-2 text-slate-400 hover:text-slate-800 mb-8 font-bold text-sm transition-colors uppercase tracking-widest">
            <ArrowLeft size={16} /> Back to Booking
        </Link>

        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight text-center md:text-left">Track Service</h1>
        <p className="text-slate-500 mb-8 font-medium text-center md:text-left">Check your pro's status or recover a lost ID.</p>
        
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100">
          <form onSubmit={handleTrack} className="flex gap-2 mb-6">
            <input 
              type="text" 
              placeholder="e.g. SR-1234" 
              className="flex-1 p-4 bg-slate-50 border-none rounded-2xl font-mono uppercase focus:ring-2 focus:ring-blue-600 outline-none"
              value={refId}
              onChange={e => setRefId(e.target.value)}
            />
            <button 
  type="submit" 
  disabled={isLoading}
  className="bg-slate-900 text-white px-6 rounded-2xl font-bold hover:bg-blue-600 shadow-lg disabled:bg-slate-400"
>
  {isLoading ? 'Searching...' : <Search size={20} />}
</button>
          </form>

          {/* History */}
          {recent.length > 0 && !status && !showForgot && (
            <div className="mb-6 flex flex-wrap gap-2">
              {recent.map(id => (
                <span key={id} onClick={() => setRefId(id)} className="text-xs bg-slate-50 border px-3 py-2 rounded-xl cursor-pointer hover:bg-blue-50 text-slate-500 font-mono">
                  {id}
                </span>
              ))}
            </div>
          )}

          {/* Result Card */}
          {status && (
            <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="font-bold text-xl text-slate-800 tracking-tight">{status.service_name}</h2>
                  <p className="text-xs text-slate-400 font-mono mt-1">{status.referenceId}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                  status.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-600 text-white'
                }`}>
                  {status.status}
                </span>
              </div>
              
              {status.provider_name ? (
                <div className="flex items-center gap-4 text-slate-600 bg-white p-4 rounded-2xl border border-blue-100 shadow-sm">
                  <div className="bg-blue-600 text-white p-3 rounded-xl"><User size={20}/></div>
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400">Assigned Pro</p>
                    <p className="font-bold text-slate-800">{status.provider_name}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-4 rounded-2xl border border-amber-100 font-bold text-sm">
                  <Clock size={18} /> Awaiting assignment...
                </div>
              )}
            </div>
          )}

          {/* Recovery Toggle */}
          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <button onClick={() => setShowForgot(!showForgot)} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600">
                {showForgot ? "Close Recovery" : "Lost your Reference ID?"}
            </button>

            {showForgot && (
                <form onSubmit={handleResend} className="mt-4 space-y-3">
                    <p className="text-xs text-slate-500">Enter your email to receive your booking IDs.</p>
                    <div className="flex gap-2">
                        <input type="email" placeholder="your@email.com" required className="flex-1 p-3 bg-slate-50 rounded-xl text-sm" 
                            onChange={e => setRecoveryEmail(e.target.value)} />
                        <button disabled={isSending} className="bg-blue-600 text-white px-5 rounded-xl font-bold disabled:opacity-50">
                            <Mail size={18} />
                        </button>
                    </div>
                </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackRequest;