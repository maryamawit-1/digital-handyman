import React, { useState, useEffect } from 'react';
// We import the functions here - we do NOT define them again at the bottom
import { adminGetAllFeedback, adminDeleteFeedback } from '../services/api';
import { MessageSquare, Star, Trash2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ManageFeedback = () => {
  const [reviews, setReviews] = useState([]);
  const token = localStorage.getItem('token');

  const loadFeedback = async () => {
    try {
      const res = await adminGetAllFeedback(token);
      setReviews(res.data);
    } catch (err) {
      toast.error("Failed to load feedback");
    }
  };

  useEffect(() => { 
    if (token) loadFeedback(); 
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await adminDeleteFeedback(token, id);
      toast.success("Review deleted");
      loadFeedback();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-10">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-medium transition-colors">
        <ArrowLeft size={20} /> Back to Dashboard
      </Link>
      
      <h1 className="text-3xl font-bold text-slate-800 mb-8 flex items-center gap-2">
        <MessageSquare className="text-blue-600" /> Customer Feedback
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map(review => (
          <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-800">{review.first_name} {review.last_name}</h3>
                <p className="text-xs text-slate-400 font-mono">{review.referenceId}</p>
              </div>
              <div className="flex bg-amber-50 px-2 py-1 rounded-lg text-amber-500 font-bold text-sm items-center gap-1">
                <Star size={14} fill="currentColor" /> {review.rating}
              </div>
            </div>
            
            <p className="text-slate-600 text-sm mb-6 flex-1 italic">"{review.comment}"</p>
            
            <div className="flex justify-between items-center pt-4 border-t mt-auto">
              <span className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString()}</span>
              <button 
                onClick={() => handleDelete(review.id)}
                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageFeedback; // <--- FILE MUST END HERE