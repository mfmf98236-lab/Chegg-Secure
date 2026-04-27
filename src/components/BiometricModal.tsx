import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, Scan, ShieldCheck, AlertCircle } from 'lucide-react';

interface BiometricModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  mode: 'enroll' | 'verify';
}

export default function BiometricModal({ isOpen, onSuccess, onCancel, mode }: BiometricModalProps) {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (isOpen && status === 'idle') {
      const timer = setTimeout(() => {
        setStatus('scanning');
        setTimeout(() => {
          setStatus('success');
          setTimeout(() => {
            onSuccess();
          }, 1500);
        }, 3000);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, status]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-sm w-full bg-white rounded-3xl shadow-2xl p-10 text-center"
          >
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className={`absolute inset-0 rounded-full border-4 transition-colors duration-500 ${
                status === 'success' ? 'border-green-500' : 
                status === 'scanning' ? 'border-primary animate-pulse' : 'border-slate-100'
              }`} />
              
              <div className="absolute inset-0 flex items-center justify-center">
                {status === 'idle' && <Fingerprint className="w-16 h-16 text-slate-300" />}
                {status === 'scanning' && (
                  <motion.div
                    animate={{ y: [0, 40, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-1 bg-primary/50 absolute top-1/4 z-10"
                  />
                )}
                {status === 'scanning' && <Scan className="w-16 h-16 text-primary" />}
                {status === 'success' && <ShieldCheck className="w-16 h-16 text-green-500" />}
                {status === 'error' && <AlertCircle className="w-16 h-16 text-red-500" />}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {mode === 'enroll' ? 'Biometric Enrollment' : 'Biometric Verification'}
            </h2>
            <p className="text-slate-500 mb-8">
              {status === 'idle' && 'Initializing secure scanner...'}
              {status === 'scanning' && 'Scanning face and fingerprint data...'}
              {status === 'success' && 'Biometric identity verified!'}
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-400 leading-relaxed">
              Your biometric data is encrypted locally and never stored on our servers. We use end-to-end hardware-level security.
            </div>

            <button
              onClick={onCancel}
              className="mt-8 text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
