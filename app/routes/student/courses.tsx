import { useEffect, useState } from "react";
import { useToast } from "../../components/shared/Toast";
import apiClient from "~/services/api";

export function meta() {
  return [{ title: "ERUDITE - My Courses" }];
}
interface Course {
  id: string;
  name: string;
  instructor?: { name: string };
  progress?: number;
}

interface Available {
  id: string;
  name: string;
  instructor?: { name: string };
  capacity?: number;
}

export default function StudentCourses() {
  const { toast } = useToast();
  const [enrolled, setEnrolled] = useState<Course[]>([]);
  const [available, setAvailable] = useState<Available[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get enrolled courses
        const enrolledRes = await apiClient.get('/my-enrolled-courses');
        const enrolledCourses = Array.isArray(enrolledRes.data) ? enrolledRes.data : enrolledRes.data.data || [];
        setEnrolled(enrolledCourses);

        // Get available courses (API now filters for students automatically)
        const availableRes = await apiClient.get('/courses');
        const availableCourses = Array.isArray(availableRes.data) 
          ? availableRes.data 
          : availableRes.data.data || [];
        setAvailable(availableCourses);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  async function handleEnroll(course: Available) {
    try {
      await apiClient.post('/enrollments', { course_id: course.id });
      setAvailable((prev) => prev.filter((c) => c.id !== course.id));
      setEnrolled((prev) => [...prev, course]);
      toast(`Enrolled in ${course.name}`);
    } catch (error) {
      console.error('Failed to enroll:', error);
      toast('Failed to enroll in course', 'error');
    }
  }

  async function handleDrop(id: string) {
    try {
      // Find enrollment ID from enrolled course
      const enrolledRes = await apiClient.get('/enrollments');
      const enrolledData = Array.isArray(enrolledRes.data) ? enrolledRes.data : enrolledRes.data.data || [];
      const enrollment = enrolledData.find((e: any) => e.course_id === id);
      if (!enrollment) return;

      await apiClient.delete(`/enrollments/${enrollment.id}`);
      const course = enrolled.find((c) => c.id === id);
      if (course) {
        setEnrolled((prev) => prev.filter((c) => c.id !== id));
        setAvailable((prev) => [...prev, course]);
        toast("Course dropped", "info");
      }
    } catch (error) {
      console.error('Failed to drop course:', error);
      toast('Failed to drop course', 'error');
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-primary tracking-tight mb-2">My Courses</h1>
        <p className="text-on-surface-variant font-body">Track your enrolled courses and explore new ones.</p>
      </div>

      <h2 className="text-xl font-bold text-primary mb-4">Currently Enrolled <span className="text-sm font-normal text-slate-500">({enrolled.length})</span></h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {enrolled.map((c) => (
          <div key={c.id} className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-6 group">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{c.id}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-secondary">{c.progress || 0}%</span>
                {(c.progress || 0) === 0 && (
                  <button onClick={() => handleDrop(c.id)} className="text-xs font-bold text-error opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">Drop</button>
                )}
              </div>
            </div>
            <h3 className="text-lg font-bold text-primary mb-1">{c.name}</h3>
            <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">person</span>
              {c.instructor?.name || 'Instructor'}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full transition-all duration-500" style={{ width: `${c.progress || 0}%` }}></div>
              </div>
              <a href={`/student/courses/${c.id}`} className="text-xs font-bold text-secondary bg-secondary-container hover:bg-secondary hover:text-white px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer">
                {(c.progress || 0) === 0 ? "Start Course" : "Continue"}
              </a>
            </div>
          </div>
        ))}
      </div>

      {available.length > 0 && (
        <>
          <h2 className="text-xl font-bold text-primary mb-4">Available to Enroll</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {available.map((c) => (
              <div key={c.id} className="bg-surface-container-lowest rounded-xl shadow-sm border border-dashed border-slate-200 p-6 flex items-center justify-between hover:border-secondary/50 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{c.id}</span>
                    <span className="text-xs text-slate-500">{c.capacity || 0} seats left</span>
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-1">{c.name}</h3>
                  <p className="text-sm text-slate-500">{c.instructor?.name || 'Instructor'}</p>
                </div>
                <button onClick={() => handleEnroll(c)} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 transition-all hover:shadow-md cursor-pointer">Enroll</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
