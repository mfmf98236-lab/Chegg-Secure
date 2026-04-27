import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { db, collection, getDocs, query, limit, orderBy } from '../firebase';
import { BookOpen, Clock, Shield, Star, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

interface DashboardProps {
  user: any;
  role: string | null;
  userData: any;
}

export default function Dashboard({ user, role, userData }: DashboardProps) {
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'), limit(3));
        const querySnapshot = await getDocs(q);
        const courses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (courses.length === 0) {
          // Fallback dummy data if collection is truly empty
          setRecentCourses([
            { id: '1', title: 'Advanced Cybersecurity', instructor: 'Dr. Alice Smith', progress: 65 },
            { id: '2', title: 'Full Stack Development', instructor: 'John Doe', progress: 30 },
            { id: '3', title: 'Database Security', instructor: 'Prof. Mark Wilson', progress: 90 }
          ]);
        } else {
          setRecentCourses(courses);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        // On permission error, the helper will log/throw
        try {
          handleFirestoreError(error, OperationType.LIST, 'courses');
        } catch (e) {
          // If the helper rethrows, we handle it silently for the dashboard list
        }
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome back, {user.displayName || 'Student'}!</h1>
          <p className="text-slate-500">You're making great progress in your courses.</p>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Recent Courses</h2>
              <Link to="/courses" className="text-primary font-semibold flex items-center gap-1 hover:underline">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentCourses.map((course) => (
                <motion.div
                  key={course.id}
                  whileHover={{ y: -4 }}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-slate-400">#{course.id.slice(0, 4)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{course.title}</h3>
                  <p className="text-sm text-slate-500 mb-4">{course.instructor}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                      <span>Progress</span>
                      <span>{course.progress || 0}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-1000"
                        style={{ width: `${course.progress || 10}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">Security Tip of the Day</h2>
              <p className="text-slate-400 mb-6">Always use Multi-Factor Authentication (MFA) to protect your academic accounts from unauthorized access.</p>
              <Link to="/case-study" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-colors">
                Learn more about our security <Shield className="w-4 h-4" />
              </Link>
            </div>
            <Shield className="absolute bottom-[-20px] right-[-20px] w-48 h-48 text-white/5 rotate-12" />
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Your Stats</h2>
            <div className="space-y-6">
              {[
                { label: 'Courses Completed', value: '12', icon: <CheckCircle2 className="w-5 h-5 text-green-500" /> },
                { label: 'Study Hours', value: '148h', icon: <Clock className="w-5 h-5 text-blue-500" /> },
                { label: 'Achievements', value: '24', icon: <Star className="w-5 h-5 text-amber-500" /> }
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg">{stat.icon}</div>
                    <span className="text-slate-600 font-medium">{stat.label}</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900">{stat.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Account Security</h2>
            
            {userData?.subscriptionStatus !== 'active' && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800">Subscription Required</p>
                  <p className="text-xs text-amber-700">Access to premium solutions is currently restricted.</p>
                </div>
              </div>
            )}

            <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
              userData?.mfaEnabled ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
            }`}>
              <Shield className={`w-5 h-5 mt-0.5 ${userData?.mfaEnabled ? 'text-green-600' : 'text-red-600'}`} />
              <div>
                <p className={`text-sm font-bold ${userData?.mfaEnabled ? 'text-green-800' : 'text-red-800'}`}>
                  Status: {userData?.mfaEnabled ? 'Secure' : 'Unprotected'}
                </p>
                <p className={`text-xs ${userData?.mfaEnabled ? 'text-green-700' : 'text-red-700'}`}>
                  {userData?.mfaEnabled 
                    ? 'MFA is active and sessions are being monitored.' 
                    : 'Please enable MFA in your settings immediately.'}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
