import { useState, useRef } from "react";
import { User } from "lucide-react";
import useToast from "../hooks/useToast"; 

export default function Register({ onBack }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone_number: '',
    city: '',
    country: '',
    additional_info: ''
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const { showSuccess, showError } = useToast(); 

  const handleSubmit = async (e) => {
    // console.log('btn works!');
    
    e.preventDefault();
    
    // Simple validation
    if (!formData.first_name.trim()) {
      alert('First name required');
      return;
    }
    if (formData.password.length < 8) {
      alert('Password must be 8+ characters');
      return;
    }
    
    console.log('Form:', formData);
    setLoading(true);

    try {
      const form = new FormData();
      form.append('first_name', formData.first_name);
      form.append('last_name', formData.last_name);
      form.append('email', formData.email);
      form.append('password', formData.password);
      form.append('phone_number', formData.phone_number);
      form.append('city', formData.city);
      form.append('country', formData.country);
      form.append('additional_info', formData.additional_info);
      
      if (fileInputRef.current?.files[0]) {
        form.append('profile_photo', fileInputRef.current.files[0]);
      }

      console.log('Sending...');
      
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        body: form
      });
      
      console.log('Status:', res.status);
      const data = await res.json();
      console.log('Data:', data);
      
      if (data.success) {
        showSuccess('Registered successfully!');
        onBack();
      } else {
        showError(data.message || 'Registration failed');
      }
      
    } catch (err) {
      console.error('Error:', err);
      showError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Create Account</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="text-blue-600 font-semibold hover:underline"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
