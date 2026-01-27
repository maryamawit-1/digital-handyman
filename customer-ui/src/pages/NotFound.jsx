import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      {/* Fancy Icon */}
      <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-8 animate-bounce">
        <AlertTriangle size={48} />
      </div>

      <h1 className="text-9xl font-black text-slate-100 absolute -z-10 select-none">404</h1>
      
      <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
        Page Not Found
      </h2>
      
      <p className="text-slate-500 text-lg max-w-md mb-10 font-medium">
        The link you followed might be broken, or the page may have been moved. 
        Don't worry, our handymen can fix almost anything—except this link.
      </p>

      <Link 
        to="/" 
        className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-600 transition-all shadow-xl active:scale-95"
      >
        <Home size={20} /> Back to Homepage
      </Link>
    </div>
  );
};

export default NotFound;