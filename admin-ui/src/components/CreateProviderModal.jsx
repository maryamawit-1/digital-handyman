// Create frontend/src/components/CreateProviderModal.jsx
import React, { useState } from 'react';
import { adminCreateProvider } from '../services/api';
import { X, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateProviderModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', phone: '', skills: '', password: 'password123' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            await adminCreateProvider(token, formData);
            toast.success("Provider created successfully!");
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Creation failed.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="p-5 border-b flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg flex items-center gap-2"><UserPlus size={20} /> Add New Provider</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <input type="text" name="first_name" required placeholder="First Name" onChange={handleChange} className="w-full p-3 border rounded-lg" />
                    <input type="text" name="last_name" placeholder="Last Name" onChange={handleChange} className="w-full p-3 border rounded-lg" />
                    <input type="email" name="email" required placeholder="Email" onChange={handleChange} className="w-full p-3 border rounded-lg" />
                    <input type="text" name="skills" placeholder="Skills (e.g., Plumbing, Electric)" onChange={handleChange} className="w-full p-3 border rounded-lg" />
                    
                    <div className="flex gap-2">
                        <input type="password" name="password" required placeholder="Temporary Password" onChange={handleChange} value={formData.password} className="w-full p-3 border rounded-lg" />
                        <button type="button" onClick={() => setFormData({...formData, password: generateRandomPassword()})} className="bg-slate-200 text-slate-800 p-2 rounded-lg text-sm font-medium">Generate</button>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold disabled:bg-slate-400">
                        {loading ? 'Saving...' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
};
export default CreateProviderModal;

// This helper is for the modal only (to be clean, it should live here)
function generateRandomPassword() {
    return Math.random().toString(36).substr(2, 8);
}