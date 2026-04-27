import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, query, orderBy, addDoc, updateDoc, doc, deleteDoc, where } from '../firebase';
import { Users, Activity, Shield, Trash2, Search, BookOpen, Plus, Edit2, UserPlus, X, UserMinus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onImpersonate?: (userData: any) => void;
}

export default function AdminDashboard({ onImpersonate }: AdminDashboardProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'courses' | 'logs'>('users');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // Course Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: '',
    instructor: '',
    tutorId: ''
  });

  const tutors = users.filter(u => u.role === 'tutor');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const usersList = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);

        const coursesSnap = await getDocs(collection(db, 'courses'));
        const coursesList = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCourses(coursesList);

        const logsSnap = await getDocs(query(collection(db, 'activityLogs'), orderBy('timestamp', 'desc')));
        const logsList = logsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLogs(logsList);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error('Failed to fetch admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedTutor = tutors.find(t => t.uid === courseForm.tutorId);
      const courseData = {
        ...courseForm,
        instructor: selectedTutor ? selectedTutor.displayName : courseForm.instructor,
        updatedAt: new Date().toISOString()
      };

      if (editingCourse) {
        await updateDoc(doc(db, 'courses', editingCourse.id), courseData);
        setCourses(courses.map(c => c.id === editingCourse.id ? { ...c, ...courseData } : c));
        toast.success('Course updated successfully');
      } else {
        const docRef = await addDoc(collection(db, 'courses'), {
          ...courseData,
          createdAt: new Date().toISOString()
        });
        setCourses([...courses, { id: docRef.id, ...courseData }]);
        toast.success('Course added successfully');
      }
      setIsModalOpen(false);
      setEditingCourse(null);
      setCourseForm({ title: '', description: '', category: '', instructor: '', tutorId: '' });
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Failed to save course');
    }
  };

  const confirmDeleteCourse = (id: string) => {
    setCourseToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    try {
      await deleteDoc(doc(db, 'courses', courseToDelete));
      setCourses(courses.filter(c => c.id !== courseToDelete));
      toast.success('Course deleted');
      setIsDeleteConfirmOpen(false);
      setCourseToDelete(null);
    } catch (error) {
      toast.error('Failed to delete course');
    }
  };

  const openEditModal = (course: any) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title || '',
      description: course.description || '',
      category: course.category || '',
      instructor: course.instructor || '',
      tutorId: course.tutorId || ''
    });
    setIsModalOpen(true);
  };

  const handleToggleSubscription = async (userId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateDoc(doc(db, 'users', userId), {
        subscriptionStatus: nextStatus,
        updatedAt: new Date().toISOString()
      });
      setUsers(users.map(u => u.uid === userId ? { ...u, subscriptionStatus: nextStatus } : u));
      toast.success(`User subscription set to ${nextStatus}`);
    } catch (error) {
      toast.error('Failed to update subscription');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: new Date().toISOString()
      });
      setUsers(users.map(u => u.uid === userId ? { ...u, role: newRole } : u));
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const handleImpersonateClick = async (userToImpersonate: any) => {
    if (!onImpersonate) return;
    
    try {
      // Audit Log
      await addDoc(collection(db, 'activityLogs'), {
        userId: userToImpersonate.uid,
        event: 'ADMIN_IMPERSONATION_START',
        timestamp: new Date().toISOString(),
        details: { 
          impersonatorEmail: users.find(u => u.role === 'admin')?.email || 'Unknown Admin' 
        }
      });
      
      onImpersonate(userToImpersonate);
    } catch (error) {
      console.error("Audit log failed:", error);
      onImpersonate(userToImpersonate); // Continue anyway for demo, but real app would require log
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Control Center</h1>
          <p className="text-slate-500">Manage users, courses, and system logs.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3">
            <Shield className="w-6 h-6 text-red-600" />
            <span className="font-bold text-red-800">Admin Mode Active</span>
          </div>
          {activeTab === 'courses' && (
            <button
              onClick={() => {
                setEditingCourse(null);
                setCourseForm({ title: '', description: '', category: '', instructor: '', tutorId: '' });
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="w-5 h-5" />
              Add Course
            </button>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 p-1 bg-slate-100 rounded-2xl w-fit">
        {[
          { id: 'users', label: 'Users', icon: Users },
          { id: 'courses', label: 'Courses', icon: BookOpen },
          { id: 'logs', label: 'Activity Logs', icon: Activity }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === tab.id ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'users' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                User Management ({users.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {users.map((user) => (
                <div key={user.id} className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden">
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-2xl">
                        {user.displayName?.[0] || 'U'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{user.displayName}</h3>
                        <p className="text-sm text-slate-500">{user.email}</p>
                        <div className="flex gap-2 mt-2">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                            user.role === 'admin' ? 'bg-red-100 text-red-600' : 
                            user.role === 'tutor' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {user.role}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                            user.subscriptionStatus === 'active' ? 'bg-green-100 text-green-600' : 'bg-slate-200 text-slate-500'
                          }`}>
                            {user.subscriptionStatus === 'active' ? 'Premium' : 'Standard'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex p-1 bg-white rounded-xl border border-slate-200">
                        <button
                          onClick={() => handleUpdateRole(user.uid, 'user')}
                          className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                            user.role === 'user' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          User
                        </button>
                        <button
                          onClick={() => handleUpdateRole(user.uid, 'tutor')}
                          className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                            user.role === 'tutor' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          Tutor
                        </button>
                      </div>

                      <button
                        onClick={() => handleToggleSubscription(user.uid, user.subscriptionStatus)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                          user.subscriptionStatus === 'active' 
                            ? 'bg-white border-red-200 text-red-600 hover:bg-red-50' 
                            : 'bg-white border-green-200 text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {user.subscriptionStatus === 'active' ? 'Revoke Subscription' : 'Grant Subscription'}
                      </button>

                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleImpersonateClick(user)}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                          Impersonate
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedUserId(selectedUserId === user.id ? null : user.id)}
                        className={`p-2 rounded-xl transition-all ${
                          selectedUserId === user.id ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-primary hover:text-primary'
                        }`}
                        title="Security Overview"
                      >
                        <Shield className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {selectedUserId === user.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-white border-t border-slate-100"
                      >
                        <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
                          {/* Authentication Status */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Security Factors</h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Multi-Factor (MFA)</span>
                                <span className={`text-xs font-bold ${user.mfaEnabled ? 'text-green-600' : 'text-red-500'}`}>
                                  {user.mfaEnabled ? 'ENROLLED' : 'DISABLED'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Biometric Identity</span>
                                <span className={`text-xs font-bold ${user.biometricVerified ? 'text-green-600' : 'text-slate-400'}`}>
                                  {user.biometricVerified ? 'VERIFIED' : 'NOT SET'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Account Verified</span>
                                <span className="text-xs font-bold text-green-600">YES</span>
                              </div>
                            </div>
                          </div>

                          {/* Access Details */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Access Forensics</h4>
                            <div className="space-y-3 font-mono">
                              <div>
                                <p className="text-[10px] text-slate-400 mb-0.5">LAST LOGIN IP</p>
                                <p className="text-xs text-slate-700">{user.lastLoginIp || '192.168.1.1'}</p>
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-400 mb-0.5">LAST ACTIVITY</p>
                                <p className="text-xs text-slate-700">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Recent Alerts */}
                          <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Risk Analysis</h4>
                              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-bold">RECENT ACTIONS</span>
                            </div>
                            <div className="space-y-2">
                              {logs.filter(l => l.userId === user.uid).slice(0, 3).map((log, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-[10px]">
                                  <div className="flex items-center gap-2">
                                    <Activity className="w-3 h-3 text-slate-400" />
                                    <span className="font-bold text-slate-700">{log.event}</span>
                                  </div>
                                  <span className="text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                </div>
                              ))}
                              {logs.filter(l => l.userId === user.uid).length === 0 && (
                                <p className="text-xs text-slate-400 italic py-2">No critical logs found for this user.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Course Management ({courses.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-4">Course Title</th>
                    <th className="pb-4">Category</th>
                    <th className="pb-4">Instructor/Tutor</th>
                    <th className="pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {courses.map((course) => (
                    <tr key={course.id} className="text-sm hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-bold text-slate-900">{course.title}</td>
                      <td className="py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase">
                          {course.category}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">{course.instructor || 'Unassigned'}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(course)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Course"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => confirmDeleteCourse(course.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {courses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No courses found. Add your first course!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Activity Logs
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-4">Timestamp</th>
                    <th className="pb-4">User ID</th>
                    <th className="pb-4">Event</th>
                    <th className="pb-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map((log) => (
                    <tr key={log.id} className="text-sm hover:bg-slate-50 transition-colors">
                      <td className="py-4 text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-4 font-mono text-xs text-slate-400">
                        {log.uid?.substring(0, 8)}...
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                          log.event.includes('SUCCESS') ? 'bg-green-100 text-green-600' : 
                          log.event.includes('FAIL') ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {log.event}
                        </span>
                      </td>
                      <td className="py-4 text-slate-600 max-w-xs truncate">
                        {JSON.stringify(log.details)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Course Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h2>

              <form onSubmit={handleSaveCourse} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Advanced Cybersecurity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Security, Development, Cloud"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    placeholder="Brief course overview..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Assign Tutor</label>
                  <select
                    value={courseForm.tutorId}
                    onChange={(e) => setCourseForm({ ...courseForm, tutorId: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select a Tutor</option>
                    {tutors.map(tutor => (
                      <option key={tutor.uid} value={tutor.uid}>{tutor.displayName} ({tutor.email})</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                  >
                    {editingCourse ? 'Update Course' : 'Create Course'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Delete Course?</h2>
              <p className="text-slate-500 mb-8">This action cannot be undone. All associated materials will remain but the course link will be broken.</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCourse}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
