import { useState } from "react";
import { Plane } from "lucide-react";
import useToast from "../hooks/useToast";
const API_BASE = import.meta.env.VITE_API_URL;


export default function Login({ onLogin, onRegister }) { 
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const { showSuccess, showError } = useToast(); 
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    // if(isSubmitting) return;
    
    if (!formData.email || !formData.password) {
      showError("Please enter email and password");
      return;
    }
    
    setIsSubmitting(true);
    // const toastId = showLoading("Signing you in..."); 

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData),
      });
      
      console.log(import.meta.env.VITE_API_URL);
      const text = await response.text();
      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        console.error("Invalid JSON from backend:", text);
        throw new Error("Server returned invalid response");
      }

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if(!data.user){
        throw new Error("Invalid server response");
      }

      onLogin(data.user);
      showSuccess("Welcome back! ✈️");
      // console.log(data);
       
    } catch (error) {
      console.error("Login error:", error);
      showError(error.message); 
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4 sm:px-6">
      <div className="w-full max-w-md sm:max-w-lg bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-6 sm:p-8 md:p-10 transition-all duration-300">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-5 flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg">
            <Plane className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">
            GlobeTrotter
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Welcome back! Login to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-md hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {isSubmitting ? "Signing In..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm sm:text-base">
            Don't have an account?{" "}
            <button
              onClick={onRegister}
              disabled={isSubmitting}
              className="font-semibold text-blue-600 hover:text-purple-600 hover:underline transition disabled:opacity-50"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
