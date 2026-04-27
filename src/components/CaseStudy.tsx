import React from 'react';
import { motion } from 'motion/react';
import { Shield, AlertTriangle, CheckCircle2, Lock, Eye, Activity } from 'lucide-react';

export default function CaseStudy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Security Case Study
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed">
          How Chegg Secure addresses real-world vulnerabilities and protects student data.
        </p>
      </motion.div>

      <div className="space-y-12">
        {/* The Breach */}
        <section className="bg-red-50 p-8 rounded-3xl border border-red-100">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <h2 className="text-2xl font-bold text-red-900">The Chegg Data Breach (2018)</h2>
          </div>
          <p className="text-red-800 mb-6 leading-relaxed">
            In 2018, Chegg experienced a massive data breach affecting approximately 40 million users. The breach exposed sensitive information including names, email addresses, shipping addresses, and hashed passwords.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/50 p-4 rounded-2xl">
              <h3 className="font-bold text-red-900 mb-2">Key Vulnerabilities</h3>
              <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                <li>Weak hashing algorithms (MD5/SHA1)</li>
                <li>Lack of real-time activity monitoring</li>
                <li>Insufficient input sanitization</li>
                <li>No mandatory Multi-Factor Authentication</li>
              </ul>
            </div>
            <div className="bg-white/50 p-4 rounded-2xl">
              <h3 className="font-bold text-red-900 mb-2">Impact</h3>
              <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                <li>Credential stuffing attacks across other sites</li>
                <li>Massive loss of user trust</li>
                <li>Regulatory fines and legal challenges</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Our Solution */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-slate-900">How Chegg Secure Fixes This</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: <Lock className="w-6 h-6 text-primary" />,
                title: "Advanced Hashing",
                desc: "We use Firebase Auth which utilizes secure, salted hashing algorithms that are resistant to rainbow table and brute-force attacks."
              },
              {
                icon: <Activity className="w-6 h-6 text-blue-500" />,
                title: "Real-time Monitoring",
                desc: "Every login and sensitive action is logged and monitored for suspicious patterns using our custom activity logging API."
              },
              {
                icon: <Shield className="w-6 h-6 text-green-500" />,
                title: "Input Sanitization",
                desc: "All user inputs are validated using Zod schemas on the frontend and sanitized before reaching our database."
              },
              {
                icon: <Eye className="w-6 h-6 text-amber-500" />,
                title: "Rate Limiting",
                desc: "Our backend implements strict rate limiting to prevent brute-force attacks and automated scrapers."
              }
            ].map((item, i) => (
              <div key={i} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Implementation Details */}
        <section className="bg-slate-900 p-8 rounded-3xl text-white">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            Security Implementation
          </h2>
          <div className="space-y-4 text-slate-400">
            <div className="flex gap-4">
              <div className="w-1 h-auto bg-primary rounded-full" />
              <div>
                <h3 className="text-white font-bold">JWT & Session Security</h3>
                <p className="text-sm">Secure session handling with HttpOnly cookies and short-lived tokens to minimize the impact of token theft.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1 h-auto bg-primary rounded-full" />
              <div>
                <h3 className="text-white font-bold">XSS & CSRF Protection</h3>
                <p className="text-sm">Using Helmet.js for secure headers and React's built-in escaping to prevent cross-site scripting attacks.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-1 h-auto bg-primary rounded-full" />
              <div>
                <h3 className="text-white font-bold">Firestore Security Rules</h3>
                <p className="text-sm">Granular access control at the database level, ensuring users can only read/write data they explicitly own.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
