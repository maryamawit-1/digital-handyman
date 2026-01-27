import React, { useState } from 'react';
import { submitProviderApplication } from '../services/api';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { UserPlus, ArrowRight, Check } from 'lucide-react';

const skillOptions = [
  "TV Mounting", "Satellite Dish Installation", "Package Delivery", 
  "Carpentry", "House Cleaning", "Basic Electric Installation", 
  "Plumbing", "Car Cleaning"
];

const ProviderApplication = () => {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', experience_details: ''
  });

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedSkills.length === 0) return toast.error("Please select at least one skill.");

    try {
      const payload = { ...formData, skills: selectedSkills.join(', ') };
      await submitProviderApplication(payload);
      toast.success("Application submitted!");
      setFormData({ first_name: '', last_name: '', email: '', phone: '', experience_details: '' });
      setSelectedSkills([]);
    } catch (error) {
      toast.error("Submission failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex flex-col items-center">
      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl w-full max-w-2xl border border-slate-100">
        <h1 className="text-3xl font-black text-slate-900 text-center mb-10 tracking-tight">Join Our Provider Network</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" required placeholder="First Name" className="w-full p-4 bg-slate-50 rounded-2xl outline-none"
              value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
            <input type="text" required placeholder="Last Name" className="w-full p-4 bg-slate-50 rounded-2xl outline-none"
              value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input type="email" required placeholder="Email" className="w-full p-4 bg-slate-50 rounded-2xl outline-none"
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <input type="text" required placeholder="Phone" className="w-full p-4 bg-slate-50 rounded-2xl outline-none"
              value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Select Expertise</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {skillOptions.map(skill => (
                <div 
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${
                    selectedSkills.includes(skill) ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-50 bg-slate-50 text-slate-500'
                  }`}
                >
                  <span className="text-sm font-bold">{skill}</span>
                  {selectedSkills.includes(skill) && <Check size={16} />}
                </div>
              ))}
            </div>
          </div>

          <textarea required placeholder="Experience Details" className="w-full p-4 bg-slate-50 rounded-2xl outline-none h-32"
            value={formData.experience_details} onChange={e => setFormData({...formData, experience_details: e.target.value})} />

          <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">
            Submit Application
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100 text-center">
          <Link to="/provider/login" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
             Already a pro? Login here
          </Link>
        </div>
      </div>
    </div>
  );
};
export default ProviderApplication;