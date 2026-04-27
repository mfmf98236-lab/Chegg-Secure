import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, auth, db, doc, getDoc, setDoc, getDocFromServer } from './firebase';
import { Toaster, toast } from 'sonner';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import CaseStudy from './components/CaseStudy';
import CourseList from './components/CourseList';
import MaterialView from './components/MaterialView';
import ErrorBoundary from './components/ErrorBoundary';
import ChatBot from './components/ChatBot';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  // Impersonation State
  const [impersonator, setImpersonator] = useState<any>(null);
  const [isImpersonating, setIsImpersonating] = useState(false);

  const startImpersonation = (targetUserData: any) => {
    if (role !== 'admin' && !isImpersonating) return;
    
    if (!isImpersonating) {
      setImpersonator({ user, userData, role });
    }
    
    setUserData(targetUserData);
    setRole(targetUserData.role);
    setIsImpersonating(true);
    toast.info(`Impersonating ${targetUserData.displayName}`);
  };

  const stopImpersonation = () => {
    if (!impersonator) return;
    
    setUser(impersonator.user);
    setUserData(impersonator.userData);
    setRole(impersonator.role);
    setImpersonator(null);
    setIsImpersonating(false);
    toast.success("Identity restored to Admin");
  };

  // Validate Connection to Firestore (Instruction: CRITICAL CONSTRAINT)
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, '_internal', 'connection-test'));
      } catch (error: any) {
        if (error.message?.includes('offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setRole(data.role);
            setUserData(data);
          } else {
            const newUserData = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              role: 'user',
              subscriptionStatus: 'inactive',
              mfaEnabled: false,
              biometricVerified: false,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString()
            };
            await setDoc(doc(db, 'users', currentUser.uid), newUserData);
            setRole('user');
            setUserData(newUserData);
          }
          setUser(currentUser);
        } catch (error) {
          console.error("Error fetching user role:", error);
          toast.error("Security verification failed. Please log in again.");
          auth.signOut();
        }
      } else {
        setUser(null);
        setRole(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 bg-primary rounded-full animate-ping"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary/20">
          {isImpersonating && (
            <div className="fixed top-0 left-0 right-0 h-10 bg-red-600 text-white z-[100] flex items-center justify-center px-4 shadow-lg animate-pulse">
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                <span>⚠️ Impersonation Mode Active: Viewing as {userData?.displayName} ({role})</span>
                <button 
                  onClick={stopImpersonation}
                  className="bg-white text-red-600 px-3 py-1 rounded-full hover:bg-slate-100 transition-colors"
                >
                  Exit Session
                </button>
              </div>
            </div>
          )}
          <Navbar user={user} role={role} />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Hero />} />
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
              <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
              <Route 
                path="/dashboard" 
                element={user ? <Dashboard user={user} role={role} userData={userData} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/admin" 
                element={role === 'admin' ? <AdminDashboard onImpersonate={startImpersonation} /> : <Navigate to="/dashboard" />} 
              />
              <Route 
                path="/courses" 
                element={user ? <CourseList user={user} userData={userData} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/materials/:id" 
                element={user ? <MaterialView user={user} userData={userData} /> : <Navigate to="/login" />} 
              />
              <Route path="/case-study" element={<CaseStudy />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <ChatBot />
          <Toaster position="top-right" richColors />
        </div>
      </Router>
    </ErrorBoundary>
  );
}
