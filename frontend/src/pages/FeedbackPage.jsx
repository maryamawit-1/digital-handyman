import React, { useState } from 'react';
import { submitFeedback } from '../services/api';
import toast from 'react-hot-toast';

const FeedbackPage = () => {
  const [formData, setFormData] = useState({ referenceId: '', rating: 5, comment: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitFeedback(formData);
      toast.success("Thank you for your feedback!");
      setFormData({ referenceId: '', rating: 5, comment: '' });
    } catch (error) {
      toast.error("Feedback submission failed.");
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white shadow-lg rounded-lg border">
      <h2 className="text-2xl font-bold text-center mb-6">Rate Our Service</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Service Reference ID</label>
          <input type="text" placeholder="SR-XXXX" required className="w-full p-2 border rounded"
            onChange={(e) => setFormData({...formData, referenceId: e.target.value})} value={formData.referenceId} />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Rating (1-5)</label>
          <select className="w-full p-2 border rounded" 
            onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})} value={formData.rating}>
            <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
            <option value="4">⭐⭐⭐⭐ Great</option>
            <option value="3">⭐⭐⭐ Good</option>
            <option value="2">⭐⭐ Fair</option>
            <option value="1">⭐ Poor</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Comments</label>
          <textarea className="w-full p-2 border rounded h-24" placeholder="How was your experience?"
            onChange={(e) => setFormData({...formData, comment: e.target.value})} value={formData.comment}></textarea>
        </div>

        <button className="w-full bg-yellow-500 text-white p-3 rounded font-bold hover:bg-yellow-600">
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default FeedbackPage;