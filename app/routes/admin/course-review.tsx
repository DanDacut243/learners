import { useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useToast } from "../../components/shared/Toast";
import apiClient from "~/services/api";

export function meta() {
  return [{ title: "ERUDITE - Course Review" }];
}

export default function CourseReview() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [credentialsVerified, setCredentialsVerified] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/courses/${courseId}`);
        const courseData = Array.isArray(res.data) ? res.data[0] : res.data;
        setCourse(courseData);
      } catch (error) {
        console.error('Failed to fetch course:', error);
        toast("Failed to load course", "error");
      } finally {
        setLoading(false);
      }
    };
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  async function handleApprove() {
    if (!credentialsVerified) {
      toast("Please verify instructor credentials", "info");
      return;
    }
    if (!courseId) return;

    try {
      setSubmitting(true);
      await apiClient.put(`/courses/${courseId}`, {
        status: 'active',
        admin_notes: notes
      });
      toast("Course approved and published!", "success");
      navigate("/admin/catalog");
    } catch (error) {
      toast("Failed to approve course", "error");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    if (!courseId) return;

    try {
      setSubmitting(true);
      await apiClient.put(`/courses/${courseId}`, {
        status: 'draft',
        admin_notes: notes
      });
      toast("Course returned to draft", "info");
      navigate("/admin/catalog");
    } catch (error) {
      toast("Failed to reject course", "error");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!course) return <div className="text-center py-8 text-error">Course not found</div>;

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button onClick={() => navigate("/admin/catalog")} className="text-slate-400 hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
            </button>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{course.id}</span>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-widest px-2 py-1 rounded-full">{course.status || "In Review"}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight mb-2">{course.name}</h1>
          <p className="text-on-surface-variant font-body">{course.description}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReject}
            disabled={submitting}
            className="bg-surface-container-high text-error px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">block</span>
            {submitting ? "Rejecting..." : "Reject Draft"}
          </button>
          <button
            onClick={handleApprove}
            disabled={submitting}
            className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            {submitting ? "Publishing..." : "Approve & Publish"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Instructor Profile</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center text-primary font-black">
                {course.instructor?.name?.charAt(0) || "?"}
              </div>
              <div>
                <div className="font-bold text-primary">{course.instructor?.name || "Unknown Instructor"}</div>
                <div className="text-xs text-slate-500">Department</div>
              </div>
            </div>
            <div className="text-sm text-slate-600 pb-4 border-b border-slate-100">
              Instructor profile details and rating information
            </div>
            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Required Action</h4>
              <label className="flex items-center gap-2 text-sm font-bold text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={credentialsVerified}
                  onChange={(e) => setCredentialsVerified(e.target.checked)}
                  className="w-4 h-4 text-secondary rounded border-slate-300 focus:ring-secondary"
                />
                Verify Instructor Credentials
              </label>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-8">
            <h3 className="text-lg font-bold text-primary mb-6 pb-4 border-b border-slate-100">Course Compliance Checklist</h3>
            <div className="space-y-4">
              {[
                { label: "Syllabus outlines clear learning objectives", checked: true },
                { label: "Video content meets accessibility standards (Captions)", checked: true },
                { label: "Assessment rubrics are mathematically sound", checked: false },
                { label: "No copyright violations detected in materials", checked: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.checked ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-300'}`}>
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </div>
                  <span className={`text-sm ${item.checked ? 'text-slate-600' : 'text-slate-400 font-medium'}`}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-8">
            <h3 className="text-lg font-bold text-primary mb-4">Admin Notes</h3>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-secondary/50 resize-none"
              placeholder="Add private reviewer notes here..."
            ></textarea>
          </div>
        </div>
      </div>
    </div>
  );
}
