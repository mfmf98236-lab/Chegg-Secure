import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, Zap } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-white pt-24 pb-32">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              <ShieldCheck className="w-4 h-4" />
              Security-First EdTech Platform
            </span>
            <h1 className="text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
              Learn Smarter, <br />
              <span className="text-primary">Study Securer.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              The only EdTech platform built with enterprise-grade security to protect your data while you master your courses. Inspired by Chegg, hardened for the modern web.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:-translate-y-1"
              >
                Start Learning Now
              </Link>
              <Link
                to="/case-study"
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all hover:-translate-y-1"
              >
                View Security Specs
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Lock className="w-8 h-8 text-primary" />,
              title: "End-to-End Encryption",
              desc: "Your study materials and personal data are encrypted with industry-standard algorithms."
            },
            {
              icon: <Eye className="w-8 h-8 text-blue-500" />,
              title: "Activity Monitoring",
              desc: "Real-time logging and suspicious activity detection to prevent unauthorized access."
            },
            {
              icon: <Zap className="w-8 h-8 text-amber-500" />,
              title: "Fast & Reliable",
              desc: "Built on high-performance infrastructure for seamless learning experiences."
            }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
              className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
