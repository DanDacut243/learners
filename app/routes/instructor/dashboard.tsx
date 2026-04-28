import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import apiClient from "~/services/api";

export function meta() {
  return [{ title: "ERUDITE - Instructor Dashboard" }];
}

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch instructor's courses
        const coursesRes = await apiClient.get('/courses?instructor_id=me');
        // Handle paginated response
        const coursesData = Array.isArray(coursesRes.data) ? coursesRes.data : coursesRes.data.data || [];
        setMyCourses(coursesData);

        // In a real app, fetch activity log from an /activities endpoint
        // For now, we'll show an empty activity log that can be populated from API
        setActivity([]);
      } catch (error) {
        console.error('Failed to fetch instructor data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  const activeCourses = myCourses.filter(c => c.status === 'active').length;
  const totalStudents = myCourses.reduce((sum, c) => sum + (c.enrollments?.length || 0), 0);
  const avgCompletion = myCourses.length > 0
    ? Math.round(myCourses.reduce((sum, c) => sum + (c.progress || 0), 0) / myCourses.length)
    : 0;
  const pendingReviews = myCourses.filter(c => c.status === 'draft').length;

  return (
    <>
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-primary tracking-tight mb-2">Welcome, {user?.name || 'Instructor'}</h1>
        <p className="text-on-surface-variant font-body">Here's how your courses are performing this semester.</p>
      </div>

      {/* Teaching Metrics */}
      <div className="grid grid-cols-12 gap-6 mb-12">
        <div className="col-span-12 md:col-span-3 bg-surface-container-lowest p-6 rounded-xl shadow-sm">
          <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Active Courses</div>
          <div className="text-3xl font-black text-primary">{activeCourses}</div>
        </div>
        <div className="col-span-12 md:col-span-3 bg-surface-container-lowest p-6 rounded-xl shadow-sm">
          <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Total Students</div>
          <div className="text-3xl font-black text-primary">{totalStudents.toLocaleString()}</div>
        </div>
        <div className="col-span-12 md:col-span-3 bg-surface-container-lowest p-6 rounded-xl shadow-sm">
          <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Avg. Completion</div>
          <div className="text-3xl font-black text-secondary">{avgCompletion}%</div>
        </div>
        <div className="col-span-12 md:col-span-3 bg-primary text-white p-6 rounded-xl shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-2">Pending Reviews</div>
            <div className="text-3xl font-black">{pendingReviews}</div>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-secondary opacity-20 blur-2xl rounded-full"></div>
        </div>
      </div>

      {/* My Courses Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-primary">My Courses</h2>
          <a href="/instructor/my-courses" className="text-sm font-bold text-secondary uppercase tracking-widest hover:underline">View All</a>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Course</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Enrolled</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Completion</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {myCourses.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-primary">{c.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{c.id}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{(c.enrollments?.length || 0).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full" style={{ width: `${c.progress || 0}%` }}></div>
                    </div>
                    <span className="text-sm font-bold text-slate-600">{c.progress || 0}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'}`}>{c.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <a href={`/instructor/my-courses/${c.id}`} className="text-slate-300 group-hover:text-secondary transition-colors">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent Student Activity */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm p-8">
        <h2 className="text-xl font-bold text-primary mb-6">Recent Student Activity</h2>
        <div className="space-y-6">
          {activity.length > 0 ? (
            activity.map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className={`mt-1.5 w-2 h-2 rounded-full ${item.color} shrink-0`}></div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-primary text-sm">{item.action}</span>
                    <span className="text-xs text-slate-400">{item.time}</span>
                  </div>
                  <p className="text-xs text-slate-500">{item.course}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-slate-400 text-sm">
              No recent activity yet.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
