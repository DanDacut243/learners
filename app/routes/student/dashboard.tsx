import { useEffect, useState } from "react";
import { useAuth } from "~/context/AuthContext";
import apiClient from "~/services/api";

export function meta() {
  return [{ title: "ERUDITE - Student Dashboard" }];
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch enrolled courses
        const enrollRes = await apiClient.get('/enrollments');
        const enrollData = Array.isArray(enrollRes.data) ? enrollRes.data : enrollRes.data.data || [];
        const coursesData = enrollData.map((e: any) => e.course);
        setCourses(coursesData);

        // Fetch grades for deadlines and stats
        const gradesRes = await apiClient.get('/grades');
        const gradesData = Array.isArray(gradesRes.data) ? gradesRes.data : gradesRes.data.data || [];
        setDeadlines(gradesData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  const enrolledCount = courses.length;
  const totalProgress = courses.reduce((acc, c) => acc + (c.progress || 0), 0) / (courses.length || 1);

  return (
    <>
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-primary tracking-tight mb-2">Welcome back, {user?.name || 'Student'}</h1>
        <p className="text-on-surface-variant font-body">Here's your learning progress at a glance.</p>
      </div>

      {/* Student Metrics */}
      <div className="grid grid-cols-12 gap-6 mb-12">
        <div className="col-span-12 md:col-span-3 bg-surface-container-lowest p-6 rounded-xl shadow-sm">
          <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Enrolled Courses</div>
          <div className="text-3xl font-black text-primary">{enrolledCount}</div>
        </div>
        <div className="col-span-12 md:col-span-3 bg-surface-container-lowest p-6 rounded-xl shadow-sm">
          <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Average Progress</div>
          <div className="text-3xl font-black text-secondary">{Math.round(totalProgress)}%</div>
        </div>
        <div className="col-span-12 md:col-span-3 bg-surface-container-lowest p-6 rounded-xl shadow-sm">
          <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Total Courses</div>
          <div className="text-3xl font-black text-primary">{courses.length}</div>
          <div className="text-xs text-slate-500 mt-1">active</div>
        </div>
        <div className="col-span-12 md:col-span-3 bg-primary text-white p-6 rounded-xl shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-2">Status</div>
            <div className="text-xl font-black">In Progress</div>
            <div className="text-xs text-blue-200 mt-1">Keep going! 🚀</div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-secondary opacity-20 blur-2xl rounded-full"></div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Active Courses */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-primary">My Active Courses</h2>
            <a href="/student/courses" className="text-sm font-bold text-secondary uppercase tracking-widest hover:underline">View All</a>
          </div>
          <div className="space-y-4">
            {courses.map((course) => (
              <a key={course.id} href={`/student/courses/${course.id}`} className="flex items-center gap-6 p-4 bg-surface-container-low rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer group">
                <div className="flex-1">
                  <div className="font-bold text-primary text-sm group-hover:text-secondary transition-colors">{course.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{course.instructor?.name || 'Instructor'}</div>
                </div>
                <div className="flex items-center gap-3 w-40">
                  <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: `${course.progress || 0}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-slate-600 w-8">{course.progress || 0}%</span>
                </div>
                <div className="text-xs text-slate-500 w-40 text-right">{course.start_date ? new Date(course.start_date).toLocaleDateString() : 'N/A'}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {deadlines.slice(0, 4).map((d, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0 bg-secondary"></div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-primary">Grade: {d.grade || 'Pending'}</div>
                    <div className="text-xs text-slate-500">{d.course?.name}</div>
                  </div>
                  <div className="text-xs font-bold text-slate-500">{new Date(d.created_at).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 border-l-4 border-secondary">
            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Learning Streak</div>
            <div className="text-3xl font-black text-primary">Active 🔥</div>
            <p className="text-xs text-slate-500 mt-2">You're making great progress!</p>
          </div>
        </div>
      </div>
    </>
  );
}
