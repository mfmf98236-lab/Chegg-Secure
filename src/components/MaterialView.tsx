import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Download, Shield, ArrowLeft, Lock, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { db, doc, getDoc } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/error-handler';
import ReactMarkdown from 'react-markdown';
import BiometricModal from './BiometricModal';

interface MaterialViewProps {
  user: any;
  userData: any;
}

export default function MaterialView({ user, userData }: MaterialViewProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBiometric, setShowBiometric] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    async function fetchMaterial() {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, 'materials', id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Access Control Check
          if (data.isPremium && userData?.subscriptionStatus !== 'active') {
            toast.error("This is a premium material. Please upgrade your subscription.");
            navigate('/dashboard');
            return;
          }

          setMaterial({ id: docSnap.id, ...data });
        } else {
          // Fallback for demo
          setMaterial({
            id,
            title: "Security Protocols Deep Dive",
            content: "# Introduction\n\nThis material covers advanced security protocols...\n\n## Content restricted for demonstration.\n\nIn a real platform, this would be fetched from Firestore.",
            isPremium: true
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `materials/${id}`);
      } finally {
        setLoading(false);
      }
    }
    fetchMaterial();
  }, [id, userData, navigate]);

  const handleSecureView = () => {
    setShowBiometric(true);
  };

  const handleBiometricSuccess = () => {
    setShowBiometric(false);
    setIsVerified(true);
    toast.success("Security verification successful. Viewing material content.");
  };

  const handleDownload = (title: string) => {
    if (!isVerified) {
      toast.warning("Please verify your identity before downloading high-value materials.");
      setShowBiometric(true);
      return;
    }

    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          const blob = new Blob([`Secure Content for ${title}`], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${title.replace(/\s+/g, '_')}_Secure.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          resolve(true);
        }, 1500);
      }),
      {
        loading: 'Encrypting and preparing download...',
        success: 'Secure download started!',
        error: 'Download failed'
      }
    );
  };

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link to="/courses" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {material?.isPremium && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase tracking-wider">Premium Content</span>
                )}
                <span className="text-xs font-medium text-slate-400">ID: {material?.id?.slice(0, 8)}</span>
              </div>
              <h1 className="text-4xl font-bold text-slate-900">{material?.title}</h1>
            </div>
            {!isVerified && (
              <button 
                onClick={handleSecureView}
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
              >
                <Eye className="w-4 h-4" /> Secure View
              </button>
            )}
          </header>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden min-h-[400px] relative">
            <AnimatePresence mode="wait">
              {!isVerified ? (
                <motion.div 
                  key="locked"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"
                >
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                    <Lock className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Content Locked</h3>
                  <p className="text-slate-500 max-w-sm mb-8">
                    To prevent automated scraping and ensure academic integrity, please verify your biometric identity to view this content.
                  </p>
                  <button 
                    onClick={handleSecureView}
                    className="px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                  >
                    Unlock Content
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 md:p-12 prose prose-slate max-w-none"
                >
                  <div className="markdown-body">
                    <ReactMarkdown>{material?.content}</ReactMarkdown>
                  </div>
                  <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between items-center">
                    <p className="text-xs text-slate-400 italic">Ending of secure delivery. All actions are monitored.</p>
                    <button 
                      onClick={() => handleDownload(material?.title)}
                      className="flex items-center gap-2 text-primary font-bold hover:underline"
                    >
                      <Download className="w-4 h-4" /> Download PDF
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-8">
          <section className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl shadow-slate-900/20">
            <Shield className="w-10 h-10 mb-4 text-primary" />
            <h2 className="text-xl font-bold mb-2">Access Logs</h2>
            <div className="space-y-4 mt-6">
              {[
                { time: '2 mins ago', event: 'Biometric Check', status: 'Success' },
                { time: '5 mins ago', event: 'Content Access', status: 'Pending' },
                { time: '10 mins ago', event: 'Session Start', status: 'Authenticated' }
              ].map((log, i) => (
                <div key={i} className="flex justify-between items-center text-xs border-b border-white/10 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-bold">{log.event}</p>
                    <p className="text-slate-400">{log.time}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full ${
                    log.status === 'Success' ? 'bg-green-500/20 text-green-400' : 
                    log.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-800">Scraping Warning</p>
                <p className="text-xs text-red-700">Excessive access or automated requests will result in immediate account termination.</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <BiometricModal 
        isOpen={showBiometric} 
        mode="verify" 
        onSuccess={handleBiometricSuccess} 
        onCancel={() => setShowBiometric(false)} 
      />
    </div>
  );
}
