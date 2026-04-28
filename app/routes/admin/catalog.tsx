// Admin Academic Catalog
import { useState, useEffect } from "react";
import { useToast } from "../../components/shared/Toast";
import { coursesApi } from "../../services/api";

export function meta() {
  return [{ title: "ERUDITE - Academic Catalog" }];
}

interface Course {
  id: number;
  name: string;
  instructor?: any;
  status: string;
  enrollments?: any[];
}

interface Instructor {
  id: number;
  name: string;
}

export default function Catalog() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formInstructor, setFormInstructor] = useState("");
  const [formCapacity, setFormCapacity] = useState("50");
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
    fetchInstructors();
  }, []);

  async function fetchInstructors() {
    try {
      const res = await import('~/services/api').then(m => m.default.get('/users'));
      const usersData = Array.isArray(res.data) ? res.data : res.data.data || [];
      setInstructors(usersData.filter((u: any) => u.role === 'instructor'));
    } catch (err) {
      console.error('Failed to fetch instructors:', err);
    }
  }

  async function fetchCourses() {
    try {
      setLoading(true);
      const response = await coursesApi.getAll();
      // Handle paginated response from API
      const coursesData = Array.isArray(response.data) ? response.data : response.data.data || [];
      setCourses(coursesData);
    } catch (err) {
      toast("Failed to load courses", "error");
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter === "All" ? courses : courses.filter((c) => c.status === filter);

  async function handleAdd() {
    if (!formTitle.trim() || !formInstructor.trim()) {
      toast("Title and instructor are required", "error");
      return;
    }

    setFormSubmitting(true);
    try {
      // Format dates as Y-m-d H:i:s for backend
      const startDate = new Date();
      const endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

      const formatDate = (date: Date) => {
        return date.toISOString().slice(0, 19).replace('T', ' ');
      };

      await coursesApi.create({
        name: formTitle,
        description: "",
        capacity: parseInt(formCapacity),
        instructor_id: parseInt(formInstructor),
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        status: "draft",
      });
      setModalOpen(false);
      setFormTitle("");
      setFormInstructor("");
      setFormCapacity("50");
      toast("Course created successfully");
      fetchCourses();
    } catch (err) {
      toast("Failed to create course", "error");
    } finally {
      setFormSubmitting(false);
    }
  }

  async function handlePublish(id: number) {
    try {
      await coursesApi.update(id, { status: "active" });
      setMenuOpen(null);
      toast("Course published successfully");
      fetchCourses();
    } catch (err) {
      toast("Failed to publish course", "error");
    }
  }

  async function handleArchive(id: number) {
    try {
      await coursesApi.update(id, { status: "archived" });
      setMenuOpen(null);
      toast("Course archived", "info");
      fetchCourses();
    } catch (err) {
      toast("Failed to archive course", "error");
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
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-display-lg text-4xl font-extrabold text-primary tracking-tight mb-2">Academic Catalog</h1>
          <p className="text-on-surface-variant font-body">Manage curriculum, review drafts, and monitor course engagement.</p>
        </div>
        <div className="flex gap-3">
          {/* Filter Dropdown */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-surface-container-high text-primary px-5 py-3 rounded-lg font-bold text-sm outline-none cursor-pointer"
          >
            <option value="All">All Courses</option>
            <option value="active">Active</option>
            <option value="draft">Drafts</option>
            <option value="archived">Archived</option>
          </select>
          <button
            onClick={() => {
              setFormTitle("");
              setFormInstructor("");
              setFormCapacity("50");
              setModalOpen(true);
            }}
            className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined">add_box</span>
            New Course
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((course) => (
          <div key={course.id} className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-primary">{course.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{course.instructor?.name || "No instructor"}</p>
              </div>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(menuOpen === String(course.id) ? null : String(course.id))}
                  className="text-slate-400 hover:text-primary transition-colors p-2"
                >
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
                {menuOpen === String(course.id) && (
                  <div className="absolute right-0 top-10 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                    {course.status !== "active" && (
                      <button
                        onClick={() => handlePublish(course.id)}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-primary font-bold"
                      >
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => handleArchive(course.id)}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-error font-bold"
                    >
                      Archive
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  course.status === "active"
                    ? "bg-green-100 text-green-800"
                    : course.status === "draft"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
              </span>
              <span className="text-xs text-slate-500">{course.enrollments?.length || 0} students</span>
            </div>

            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-2/3"></div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 font-medium">No courses match the selected filter.</p>
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
                <label className="text-sm font-bold text-slate-600">Instructor</label>
                <select
                  value={formInstructor}
                  onChange={(e) => setFormInstructor(e.target.value)}
                  className="bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/50 cursor-pointer"
                >
                  <option value="">Select an instructor</option>
                  {instructors.map((inst) => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))}
                </select>
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
                onClick={handleAdd}
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
