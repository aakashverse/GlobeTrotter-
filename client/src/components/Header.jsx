import { useState } from "react";
import useToast from "../hooks/useToast";
import { Plane, User, Settings, BarChart3, LogOut } from 'lucide-react';

export default function Header({ onNavigate, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);
  const { showSuccess } = useToast();

  const handleLogout = async () => {
    setShowMenu(false);
    await onLogout(); // triggers App logout
    showSuccess("Logged out successfully!");
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Plane className="w-10 h-10 text-blue-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            GlobeTrotter
          </h1>
        </div>

        <div className="flex items-center space-x-4 relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all"
          >
            <User className="w-7 h-7 text-gray-700" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-14 bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl p-2 w-56 border z-50 animate-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => { onNavigate('profile'); setShowMenu(false); }}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-all"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </button>

              <button
                onClick={() => { onNavigate('analytics'); setShowMenu(false); }}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-all"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">Admin Panel</span>
              </button>

              <div className="border-t border-gray-100 my-2" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 text-red-600 rounded-xl transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
