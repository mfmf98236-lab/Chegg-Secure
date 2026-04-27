import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, signInWithPopup, googleProvider, db, doc, setDoc } from '../firebase';
import { Shield, UserPlus, CheckCircle2, GraduationCap, User } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import BiometricModal from './BiometricModal';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'user' | 'tutor'>('user');
  const [showBiometric, setShowBiometric] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);

  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setTempUser(user);
      setShowBiometric(true);
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/popup-blocked') {
        toast.error('Popup blocked! Please allow popups for this site to register with Google.');
      } else {
        toast.error('Registration failed: ' + error.message);
      }
      setLoading(false);
    }
  };

  const handleBiometricSuccess = async () => {
    setShowBiometric(false);
    try {
      await setDoc(doc(db, 'users', tempUser.uid), {
        uid: tempUser.uid,
        email: tempUser.email,
        displayName: tempUser.displayName,
        role: role,
        createdAt: new Date().toISOString(),
        mfaEnabled: true,
        biometricEnrolled: true
      });

      // Log activity
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'REGISTER_SUCCESS_SECURE',
          userId: tempUser.uid,
          details: { method: 'google', role: role, biometric: true }
        })
      });

      toast.success(`Account created as ${role === 'user' ? 'Student' : 'Tutor'}!`);
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Failed to save profile: ' + error.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-slate-200/50 p-8 border border-slate-100"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
            <UserPlus className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Create Account</h2>
          <p className="text-slate-500 mt-2">Choose your role and join the community</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setRole('user')}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
              role === 'user' ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'
            }`}
          >
            <User className={`w-6 h-6 ${role === 'user' ? 'text-primary' : 'text-slate-400'}`} />
            <span className={`text-sm font-bold ${role === 'user' ? 'text-primary' : 'text-slate-600'}`}>Student</span>
          </button>
          <button
            onClick={() => setRole('tutor')}
            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
              role === 'tutor' ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'
            }`}
          >
            <GraduationCap className={`w-6 h-6 ${role === 'tutor' ? 'text-primary' : 'text-slate-400'}`} />
            <span className={`text-sm font-bold ${role === 'tutor' ? 'text-primary' : 'text-slate-600'}`}>Tutor</span>
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            {[
              "Biometric identity enrollment",
              "Encrypted academic profile",
              "Role-specific dashboard access",
              "Mandatory 2-Step Verification"
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {benefit}
              </div>
            ))}
          </div>

          <button
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 brightness-0 invert" />
            Continue with Google
          </button>
        </div>

        <p className="text-center mt-8 text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>

      <BiometricModal 
        isOpen={showBiometric} 
        mode="enroll" 
        onSuccess={handleBiometricSuccess} 
        onCancel={() => { setShowBiometric(false); setLoading(false); }} 
      />
    </div>
  );
}
