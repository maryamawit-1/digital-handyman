import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-12 pb-4 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        
        {/* Column 1: Brand & Contact Highlight */}
        <div className="md:col-span-2">
          <h3 className="text-white font-black text-2xl tracking-tight mb-3">Top Handyman Services</h3>
          <p className="text-sm max-w-sm">Expert repairs, guaranteed quality. Serving Addis Ababa with professionalism and speed.</p>
          
          <div className="mt-6 space-y-1">
            <p className="text-white font-black text-lg">+251 777 673 732</p>
            <p className="text-sm">tophandy2serveu@gmail.com</p>
          </div>
        </div>

        {/* Column 2: Address */}
        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Our Location</h4>
          <address className="text-sm not-italic space-y-1">
            <p className="font-bold">Mulugeta Zeleke Building,</p>
            <p>1st Floor, Megenagna,</p>
            <p>Addis Ababa, Ethiopia</p>
          </address>
        </div>

        {/* Column 3: Quick Links (For better navigation) */}
        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/request" className="hover:text-white transition-colors">Book Service</Link></li>
            <li><Link to="/track" className="hover:text-white transition-colors">Track Request</Link></li>
            <li><Link to="/apply" className="hover:text-white transition-colors">Join Our Team</Link></li>
            {/* <li><Link to="/admin" className="hover:text-white transition-colors">Admin Portal</Link></li> */}
          </ul>
        </div>

      </div>
      
      {/* Copyright Bar (Neatly Separated) */}
      <div className="text-center py-4 border-t border-slate-800">
        <p className="text-xs">
          &copy; {new Date().getFullYear()} Handyman Hub. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;