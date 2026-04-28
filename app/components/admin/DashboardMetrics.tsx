import { useEffect, useState } from "react";
import { usersApi, coursesApi, enrollmentsApi } from "../../services/api";

interface MetricsData {
  totalUsers: number;
  activeCourses: number;
  completionRate: number;
  loading: boolean;
  error: string | null;
}

export function DashboardMetrics() {
  const [metrics, setMetrics] = useState<MetricsData>({
    totalUsers: 0,
    activeCourses: 0,
    completionRate: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const [usersRes, coursesRes, enrollmentsRes] = await Promise.all([
          usersApi.getAll(),
          coursesApi.getAll(),
          enrollmentsApi.getAll(),
        ]);

        // Handle paginated responses
        const usersData = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data.data || [];
        const coursesData = Array.isArray(coursesRes.data) ? coursesRes.data : coursesRes.data.data || [];
        const enrollmentsData = Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data : enrollmentsRes.data.data || [];

        const totalUsers = usersData.length;
        const activeCourses = coursesData.filter((c: any) => c.status === "active").length;
        const completedEnrollments = enrollmentsData.filter((e: any) => e.status === "completed").length;
        const completionRate = enrollmentsData.length > 0 ? (completedEnrollments / enrollmentsData.length) * 100 : 0;

        setMetrics({
          totalUsers,
          activeCourses,
          completionRate: Math.round(completionRate * 10) / 10,
          loading: false,
          error: null,
        });
      } catch (err) {
        setMetrics((prev) => ({ ...prev, loading: false, error: "Failed to load metrics" }));
      }
    };

    fetchMetrics();
  }, []);

  if (metrics.loading) {
    return (
      <div className="grid grid-cols-12 gap-6 mb-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="col-span-12 md:col-span-4 bg-surface-container-lowest p-8 rounded-xl shadow-sm animate-pulse">
            <div className="h-12 bg-slate-200 rounded mb-4"></div>
            <div className="h-8 bg-slate-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6 mb-12">
      {/* Metric 1: Total Users */}
      <div className="col-span-12 md:col-span-4 bg-surface-container-lowest p-8 rounded-xl shadow-sm group hover:bg-primary transition-colors duration-300">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-secondary-container rounded-full group-hover:bg-secondary transition-colors">
            <span className="material-symbols-outlined text-on-secondary-container group-hover:text-white">people</span>
          </div>
          <span className="text-secondary font-bold text-sm">Active</span>
        </div>
        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-blue-200">Total Users</div>
        <div className="text-3xl font-black text-primary group-hover:text-white">{metrics.totalUsers}</div>
        <div className="mt-4 h-1 w-full bg-secondary-container rounded-full overflow-hidden">
          <div className="h-full bg-secondary w-3/4"></div>
        </div>
      </div>

      {/* Metric 2: Active Courses */}
      <div className="col-span-12 md:col-span-4 bg-surface-container-lowest p-8 rounded-xl shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-tertiary-fixed rounded-full">
            <span className="material-symbols-outlined text-on-tertiary-fixed">school</span>
          </div>
          <span className="text-tertiary-fixed-dim font-bold text-sm">Live</span>
        </div>
        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Active Courses</div>
        <div className="text-3xl font-black text-primary">{metrics.activeCourses}</div>
        <div className="mt-4 flex gap-1">
          <div className="h-1 flex-1 bg-tertiary-fixed rounded-full"></div>
          <div className="h-1 flex-1 bg-tertiary-fixed rounded-full"></div>
          <div className="h-1 flex-1 bg-tertiary-fixed rounded-full"></div>
          <div className="h-1 flex-1 bg-surface-container-high rounded-full"></div>
        </div>
      </div>

      {/* Metric 3: Completion Rate */}
      <div className="col-span-12 md:col-span-4 bg-primary text-white p-8 rounded-xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-full">
              <span className="material-symbols-outlined text-tertiary-fixed">trending_up</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-full text-[10px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              Live
            </div>
          </div>
          <div className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-1">Completion Rate</div>
          <div className="text-3xl font-black">{metrics.completionRate.toFixed(1)}%</div>
          <p className="text-xs text-blue-200 mt-2">Overall enrollment completion</p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-20 blur-3xl rounded-full -mr-16 -mt-16"></div>
      </div>
    </div>
  );
}
