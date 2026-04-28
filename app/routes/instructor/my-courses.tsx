import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useToast } from "../../components/shared/Toast";
import { coursesApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

interface Course {
  id: number;
  name: string;
  enrollments?: any[];
  status: string;
  start_date?: string;
  end_date?: string;
}

export default function InstructorMyCourses() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCapacity, setFormCapacity] = useState("50");
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      setLoading(true);
      const response = await coursesApi.getAll();
      // API now automatically filters courses for instructors
      const myCourses = Array.isArray(response.data) ? response.data : response.data.data || [];
      setCourses(myCourses);
    } catch (err) {
      toast("Failed to load courses", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!formTitle.trim()) {
      toast("Course title is required", "error");
      return;
    }

    setFormSubmitting(true);
    try {
      const formatDate = (date: Date) => date.toISOString().slice(0, 19).replace('T', ' ');
      await coursesApi.create({
        name: formTitle,
        description: formDescription,
        capacity: parseInt(formCapacity),
        start_date: formatDate(new Date()),
        end_date: formatDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)),
        status: "draft",
      });
      setModalOpen(false);
      setFormTitle("");
      setFormDescription("");
      setFormCapacity("50");
      toast("New course created successfully");
      fetchCourses();
    } catch (err) {
      toast("Failed to create course", "error");
    } finally {
      setFormSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin">
          <span className="material-symbols-outlined text-4xl text-primary">hourglass_bottom</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight mb-2">My Courses</h1>
          <p className="text-on-surface-variant font-body">Manage your curriculum modules, content, and student engagement.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined">add_box</span>
          Create New Course
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400 font-medium">You haven't created any courses yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-primary">{course.name}</h3>
                  <p className="text-sm text-slate-500 mt-2">Status: {course.status}</p>
                  <div className="flex gap-6 mt-4 text-sm text-slate-600">
                    <div>
                      <span className="font-bold text-primary">{course.enrollments?.length || 0}</span> Students
                    </div>
                    <div>
                      Created: {course.start_date ? new Date(course.start_date).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/instructor/my-courses/${course.id}`)} className="px-4 py-2 text-sm font-bold text-primary hover:bg-slate-50 rounded-lg transition-colors cursor-pointer" title="Edit Course Content">
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button onClick={() => navigate(`/instructor/my-courses/${course.id}/settings`)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer" title="Course Settings">
                    <span className="material-symbols-outlined text-sm">settings</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-[90] flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-primary mb-6">Create New Course</h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-600">Course Title</label>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/50"
                  placeholder="e.g., Introduction to AI"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-600">Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/50 h-24 resize-none"
                  placeholder="Course description..."
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-600">Capacity</label>
                <input
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(e.target.value)}
                  type="number"
                  className="bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/50"
                  placeholder="50"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setModalOpen(false)}
                disabled={formSubmitting}
                className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={formSubmitting}
                className="px-6 py-2.5 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
              >
                Create Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
