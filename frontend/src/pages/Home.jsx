import React, { useState, useEffect } from 'react';
import { getServices } from '../services/api';
import { 
  Hammer, 
  Clock, 
  ThumbsUp, 
  Briefcase, 
  Wrench,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    getServices()
      .then(res => setServices(res.data))
      .catch(err => console.error("Error fetching services:", err));
  }, []);

  const features = [
    { title: "Professional Craftsmanship", desc: "Our skilled handymen deliver quality work with attention to detail.", icon: <Hammer /> },
    { title: "Timely Service", desc: "We respect your time and ensure timely completion of projects.", icon: <Clock /> },
    { title: "Customer Satisfaction", desc: "Our priority is to exceed customer expectations with every service.", icon: <ThumbsUp /> },
    { title: "Comprehensive Solutions", desc: "We offer a wide range of services to meet all your needs.", icon: <Briefcase /> },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* 1. HERO SECTION - BOLD & SPACIOUS */}
      <section className="py-32 px-6 text-center bg-white border-b border-slate-100 shadow-inner">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600 mb-4 animate-in fade-in slide-in-from-top-10 duration-500">
            Ethiopia's Top-Rated Repair Service
          </p>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tighter leading-tight animate-in fade-in duration-700">
            Get It <span className="text-blue-600">Fixed</span> Right, <span className="text-blue-600">Now.</span>
          </h1>
          <p className="text-slate-600 text-xl max-w-3xl mx-auto mb-12 leading-relaxed animate-in fade-in duration-900">
            Book professional service providers instantly for electric, plumbing, and assembly jobs. Secure, transparent, and hassle-free.
          </p>
          
          <div className="flex flex-col items-center gap-6 animate-in fade-in duration-1000">
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Link to="/request" className="bg-blue-600 text-white px-10 py-5 rounded-full font-black text-lg uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-300 active:scale-95">
                 Book Service in ETB
              </Link>
            </div>
            <Link to="/provider/login" className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-600 transition-colors">
              Already a Pro? Login to Workspace
            </Link>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION (FEATURES GRID) */}
      <section className="max-w-7xl mx-auto py-24 px-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight text-center mb-16">
            Why Choose Handyman Hub?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center group transition-all duration-300 hover:scale-[1.03]">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-md group-hover:shadow-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                {React.cloneElement(feature.icon, { size: 28 })}
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3 leading-snug">
                {feature.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. DYNAMIC SERVICES (FETCHED FROM DB) */}
      <section className="bg-slate-50 py-24 px-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Our Services Catalog</h2>
            <p className="text-slate-400 font-medium mt-2">Available for booking right now.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map(service => (
              <div key={service.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-6">
                  <Wrench size={22} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{service.name}</h3>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  Professional help for all your {service.name.toLowerCase()} needs. 
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Starting Rate</p>
                    <p className="text-xl font-black text-slate-900">{service.unit_price} ETB<span className="text-sm font-normal text-slate-400">/{service.unit_label}</span></p>
                  </div>
                  <Link to="/request" className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 transition-colors shadow-md active:scale-95">
                    <ChevronRight size={24} />
                  </Link>
                </div>
              </div>
            ))}
            {services.length === 0 && (
                <div className="md:col-span-3 text-center py-10 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium">No services currently available.</p>
                </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. TRUST STRIP (REVENUE/RATING BAR) */}
      <section className="bg-slate-900 py-16 px-8 text-center">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          {/* Stats intentionally hardcoded for visual appeal */}
          <div className="text-white">
            <p className="text-4xl font-black italic text-yellow-400">4.9/5</p>
            <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">Average Rating</p>
          </div>
          <div className="text-white">
            <p className="text-4xl font-black italic text-emerald-400">2,500+</p>
            <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">Jobs Completed</p>
          </div>
          <div className="text-white">
            <p className="text-4xl font-black italic text-red-400">5+</p>
            <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">Years Experience</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;