import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Star, Users, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db, collection, getDocs } from '../firebase';

interface CourseListProps {
  user: any;
  userData: any;
}

export default function CourseList({ user, userData }: CourseListProps) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        const coursesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        if (coursesData.length === 0) {
          // Mock data for demo
          setCourses([
            { id: 'c1', title: 'Cybersecurity Fundamentals', instructor: 'Dr. Smith', rating: 4.8, students: 1200, category: 'Security' },
            { id: 'c2', title: 'Ethical Hacking 101', instructor: 'Janice Doe', rating: 4.9, students: 850, category: 'Security' },
            { id: 'c3', title: 'Cloud Architecture', instructor: 'Bob Wilson', rating: 4.7, students: 2300, category: 'Cloud' }
          ]);
        } else {
          setCourses(coursesData);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => 
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.instructor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">Explore Courses</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search for courses, instructors, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-2xl font-semibold text-slate-700 hover:bg-slate-50 transition-all">
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map((course, i) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -8 }}
            className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden"
          >
            <div className="h-48 bg-slate-100 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-500/20" />
              <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:scale-110 transition-transform">
                <BookOpen className="w-24 h-24 text-primary" />
              </div>
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-primary uppercase tracking-wider">
                  {course.category}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">
                {course.title}
              </h3>
              <p className="text-sm text-slate-500 mb-4">{course.instructor || 'TBA'}</p>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-bold">{course.rating || 'New'}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">{course.students || 0} students</span>
                </div>
              </div>

              <Link
                to={`/materials/${course.id}`}
                className="block w-full text-center py-3 bg-slate-50 text-slate-700 rounded-xl font-bold hover:bg-primary hover:text-white transition-all"
              >
                View Materials
              </Link>
            </div>
          </motion.div>
        ))}
        {filteredCourses.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-slate-400 text-lg">No courses found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
