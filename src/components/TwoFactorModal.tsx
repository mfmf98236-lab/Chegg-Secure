import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, ArrowRight, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface TwoFactorModalProps {
  isOpen: boolean;
  onVerify: (code: string) => void;
  onCancel: () => void;
  email: string;
}

export default function TwoFactorModal({ isOpen, onVerify, onCancel, email }: TwoFactorModalProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (isOpen && timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen, timer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = () => {
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      onVerify(fullCode);
    } else {
      toast.error('Please enter the full 6-digit code');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-slate-100"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                <Shield className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">2-Step Verification</h2>
              <p className="text-slate-500 mt-2 text-sm">
                We've sent a 6-digit verification code to <br />
                <span className="font-bold text-slate-700">{email}</span>
              </p>
            </div>

            <div className="flex justify-between gap-2 mb-8">
              {code.map((digit, i) => (
                <input
                  key={i}
                  id={`code-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  className="w-12 h-14 text-center text-2xl font-bold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              ))}
            </div>

            <button
              onClick={handleVerify}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary/90 transition-all mb-4"
            >
              Verify Code <ArrowRight className="w-5 h-5" />
            </button>

            <div className="text-center">
              {timer > 0 ? (
                <p className="text-sm text-slate-400">Resend code in {timer}s</p>
              ) : (
                <button
                  onClick={() => setTimer(30)}
                  className="text-sm text-primary font-bold hover:underline flex items-center justify-center gap-1 mx-auto"
                >
                  <RefreshCw className="w-3 h-3" /> Resend Code
                </button>
              )}
            </div>

            <button
              onClick={onCancel}
              className="w-full mt-6 text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors"
            >
              Cancel and go back
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
