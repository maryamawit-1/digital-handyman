import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <Link to="/" className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tighter">
          <span className="bg-blue-600 text-white p-1 rounded-lg text-lg">🛠️</span>
          TOP HANDYMAN SERVICES
        </Link>
        
        <div className="flex items-center gap-6">
          <Link to="/" className="text-slate-600 font-medium hover:text-blue-600 transition-colors">Home</Link>
          <Link to="/request" className="text-slate-600 font-medium hover:text-blue-600 transition-colors">Book</Link>
          <Link to="/apply" className="text-slate-600 font-medium hover:text-blue-600 transition-colors">Join as Provider</Link>
          <Link to="/feedback" className="text-slate-600 font-medium hover:text-blue-600 transition-colors">Feedback</Link>
          {/* <Link to="/admin" className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition-all">Admin</Link> */}
          {/* <Link to="/track" className="text-slate-600 font-medium hover:text-blue-600 transition-colors">Track Request</Link> */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;