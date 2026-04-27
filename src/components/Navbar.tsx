import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut, auth } from '../firebase';
import { Shield, BookOpen, User, LogOut, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';

interface NavbarProps {
  user: any;
  role: string | null;
}

export default function Navbar({ user, role }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
              <Shield className="w-8 h-8 text-primary" />
              <span className="tracking-tight">Chegg<span className="text-slate-400 font-light">Secure</span></span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/courses" className="text-slate-600 hover:text-primary transition-colors flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              Courses
            </Link>
            <Link to="/case-study" className="text-slate-600 hover:text-primary transition-colors flex items-center gap-1">
              <Shield className="w-4 h-4" />
              Security
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-slate-600 hover:text-primary transition-colors flex items-center gap-1">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                {role === 'admin' && (
                  <Link to="/admin" className="text-red-600 hover:text-red-700 font-medium transition-colors">
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                  <span className="text-sm font-medium text-slate-700">{user.displayName}</span>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-500 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-slate-600 hover:text-primary transition-colors font-medium">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
