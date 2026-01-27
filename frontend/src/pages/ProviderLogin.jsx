import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { providerLogin } from '../services/api'; 
import toast from 'react-hot-toast';
import { Wrench, ArrowRight } from 'lucide-react';

const ProviderLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const res = await providerLogin({ email, password });
      
      // SAVE DATA CORRECTLY
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('provider', JSON.stringify(res.data.provider));
      
      toast.success(`Access Granted! Welcome back.`);
      navigate('/provider/dashboard');
    } catch (error) {
      console.error("Login Error:", error.response?.data);
      toast.error("Access Denied. Check your email/password.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-900 px-4 py-20">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-blue-200">
            <Wrench size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Provider Portal</h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1 italic">Secure Workspace</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Email Address</label>
            <input 
              type="email" 
              required 
              className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all"
              placeholder="name@example.com" 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Access Key (Password)</label>
            <input 
              type="password" 
              required 
              className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none transition-all"
              placeholder="••••••••" 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoggingIn}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-100 disabled:opacity-50"
          >
            {isLoggingIn ? 'Verifying...' : 'Launch Workspace'} 
            {!isLoggingIn && <ArrowRight size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProviderLogin;