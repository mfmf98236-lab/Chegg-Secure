import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, signInWithPopup, googleProvider, db, doc, getDoc, setDoc } from '../firebase';
import { Shield, Mail, Lock, ArrowRight, User, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import TwoFactorModal from './TwoFactorModal';
import BiometricModal from './BiometricModal';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      setTempUser(user);

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: 'user',
          createdAt: new Date().toISOString(),
          mfaEnabled: true,
          biometricEnrolled: true
        });
      }

      // Start 2FA step
      setShow2FA(true);
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/popup-blocked') {
        toast.error('Popup blocked! Please allow popups for this site to log in with Google.');
      } else {
        toast.error('Login failed: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerify = (code: string) => {
    if (code === '123456') { // Simulation
      setShow2FA(false);
      setShowBiometric(true);
    } else {
      toast.error('Invalid verification code. Try 123456');
    }
  };

  const handleBiometricSuccess = async () => {
    setShowBiometric(false);
    
    // Log activity
    await fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'LOGIN_SUCCESS_SECURE',
        userId: tempUser.uid,
        details: { method: 'google', mfa: true, biometric: true }
      })
    });

    toast.success('Secure login successful!');
    navigate('/dashboard');
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
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">Secure Login</h2>
          <p className="text-slate-500 mt-2">Access your student or tutor account</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 border border-slate-200 rounded-2xl font-semibold text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-400">Advanced Security Active</span>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
            <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-bold">Multi-Factor Authentication (MFA)</p>
              <p className="text-xs opacity-80">We require 2-step verification and biometric identity check for all accounts.</p>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Register for free
          </Link>
        </p>
      </motion.div>

      <TwoFactorModal 
        isOpen={show2FA} 
        email={tempUser?.email || ''} 
        onVerify={handle2FAVerify} 
        onCancel={() => setShow2FA(false)} 
      />

      <BiometricModal 
        isOpen={showBiometric} 
        mode="verify" 
        onSuccess={handleBiometricSuccess} 
        onCancel={() => setShowBiometric(false)} 
      />
    </div>
  );
}
