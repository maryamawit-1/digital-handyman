import React, { useEffect, useState } from 'react';
import { adminGetReports } from '../services/api';
import { ArrowLeft, Printer, PieChart, DollarSign, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminReports = () => {
  const [data, setData] = useState({ serviceStats: [], overall: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    adminGetReports(token)
      .then(res => setData(res.data))
      .catch(() => toast.error("Failed to load reports"))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print(); // Opens the browser print dialog (Save as PDF)
  };

  if (loading) return <div className="p-10 text-center">Generating Report...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-10 print:bg-white print:p-0">
      
      {/* Header - Hidden when printing */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <Link to="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>
        <button onClick={handlePrint} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2">
          <Printer size={20} /> Print / Save PDF
        </button>
      </div>

      {/* Report Container */}
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-sm border border-slate-100 print:shadow-none print:border-none">
        
        <div className="text-center mb-12 border-b pb-8">
          <h1 className="text-3xl font-black text-slate-900">Performance Report</h1>
          <p className="text-slate-500 mt-2">Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <PieChart className="mx-auto text-blue-500 mb-2" />
            <div className="text-2xl font-black text-slate-800">{data.overall.total_requests}</div>
            <div className="text-xs font-bold text-slate-400 uppercase">Total Bookings</div>
          </div>
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <CheckCircle className="mx-auto text-emerald-500 mb-2" />
            <div className="text-2xl font-black text-slate-800">{data.overall.total_completed}</div>
            <div className="text-xs font-bold text-slate-400 uppercase">Jobs Completed</div>
          </div>
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 text-center">
            <DollarSign className="mx-auto text-amber-500 mb-2" />
            <div className="text-2xl font-black text-slate-800">
              {data.serviceStats.reduce((acc, curr) => acc + (parseFloat(curr.estimated_revenue) || 0), 0)} ETB
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase">Est. Revenue</div>
          </div>
        </div>

        {/* Detailed Table */}
        <h2 className="text-xl font-bold mb-4 text-slate-800">Service Performance Breakdown</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 text-xs uppercase font-bold">
              <th className="p-4 border">Service Category</th>
              <th className="p-4 border text-center">Total Requests</th>
              <th className="p-4 border text-center">Completed</th>
              <th className="p-4 border text-right">Revenue (Est.)</th>
            </tr>
          </thead>
          <tbody>
            {data.serviceStats.map((stat, index) => (
              <tr key={index} className="border-b">
                <td className="p-4 border font-medium text-slate-800">{stat.service_name}</td>
                <td className="p-4 border text-center">{stat.total_bookings}</td>
                <td className="p-4 border text-center">{stat.completed_jobs}</td>
                <td className="p-4 border text-right font-mono text-emerald-600 font-bold">
                  {stat.estimated_revenue || 0} ETB
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-12 text-center text-xs text-slate-400 print:fixed print:bottom-10 print:w-full">
          Digital Handyman Platform • Internal Document
        </div>
      </div>
    </div>
  );
};

export default AdminReports;