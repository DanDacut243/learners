import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useToast } from "../../components/shared/Toast";
import apiClient from "~/services/api";

export function meta() {
  return [{ title: "ERUDITE - Course Settings" }];
}

export default function CourseSettings() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Form states
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [capacity, setCapacity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("draft");
  const [creditHours, setCreditHours] = useState("");
  const [prerequisites, setPrerequisites] = useState("");
  const [assessmentMethod, setAssessmentMethod] = useState("weighted");
  const [allowEnrollment, setAllowEnrollment] = useState(true);
  const [enrollmentDeadline, setEnrollmentDeadline] = useState("");
  const [requiresApproval, setRequiresApproval] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  async function fetchCourse() {
    try {
      setLoading(true);
      const res = await apiClient.get(`/courses/${courseId}`);
      const courseData = res.data;
      setCourse(courseData);

      // Populate form fields
      setCourseName(courseData.name || "");
      setCourseDescription(courseData.description || "");
      setCourseCode(courseData.course_code || "");
      setCapacity(courseData.capacity || "");
      setStartDate(courseData.start_date ? courseData.start_date.split(" ")[0] : "");
      setEndDate(courseData.end_date ? courseData.end_date.split(" ")[0] : "");
      setStatus(courseData.status || "draft");
      setCreditHours(courseData.credit_hours || "");
      setPrerequisites(courseData.prerequisites || "");
      setAssessmentMethod(courseData.assessment_method || "weighted");
      setAllowEnrollment(courseData.allow_enrollment !== false);
      setEnrollmentDeadline(courseData.enrollment_deadline ? courseData.enrollment_deadline.split(" ")[0] : "");
      setRequiresApproval(courseData.requires_approval || false);
    } catch (error) {
      console.error("Failed to fetch course:", error);
      toast("Failed to load course settings", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!courseName.trim()) {
      toast("Course name is required", "error");
      return;
    }

    setSaving(true);
    try {
      await apiClient.put(`/courses/${courseId}`, {
        name: courseName,
        description: courseDescription,
        course_code: courseCode,
        capacity: parseInt(capacity) || 0,
        start_date: startDate ? `${startDate} 00:00:00` : null,
        end_date: endDate ? `${endDate} 00:00:00` : null,
        status,
        credit_hours: creditHours ? parseInt(creditHours) : null,
        prerequisites,
        assessment_method: assessmentMethod,
        allow_enrollment: allowEnrollment,
        enrollment_deadline: enrollmentDeadline ? `${enrollmentDeadline} 00:00:00` : null,
        requires_approval: requiresApproval,
      });
      toast("Course settings updated successfully", "success");
      fetchCourse();
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast("Failed to save course settings", "error");
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl">
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate("/instructor/my-courses")}
          className="text-primary hover:text-primary/80 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight mb-2">Course Settings</h1>
          <p className="text-on-surface-variant font-body">{courseName}</p>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-6 py-4 font-bold text-sm transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "general"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab("enrollment")}
            className={`px-6 py-4 font-bold text-sm transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "enrollment"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Enrollment
          </button>
          <button
            onClick={() => setActiveTab("assessment")}
            className={`px-6 py-4 font-bold text-sm transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "assessment"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Assessment
          </button>
        </div>

        <div className="p-8">
          {activeTab === "general" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-primary border-b border-slate-100 pb-2">General Information</h3>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Course Name *</label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-secondary/50"
                    placeholder="e.g., Introduction to AI"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Course Code</label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-secondary/50"
                    placeholder="e.g., CS101"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                <textarea
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-secondary/50 h-32 resize-none"
                  placeholder="Course description and overview..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Capacity</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-secondary/50"
                    placeholder="e.g., 50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Credit Hours</label>
                  <input
                    type="number"
                    value={creditHours}
                    onChange={(e) => setCreditHours(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-secondary/50"
                    placeholder="e.g., 3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-secondary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-secondary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Prerequisites</label>
                <input
                  type="text"
                  value={prerequisites}
                  onChange={(e) => setPrerequisites(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-secondary/50"
                  placeholder="e.g., CS100, Mathematics"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-secondary/50"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === "enrollment" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-primary border-b border-slate-100 pb-2">Enrollment Settings</h3>

              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                <div>
                  <div className="font-bold text-slate-800">Allow Enrollment</div>
                  <div className="text-sm text-slate-500">Allow new students to enroll in this course.</div>
                </div>
                <button
                  onClick={() => setAllowEnrollment(!allowEnrollment)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    allowEnrollment ? "bg-primary" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      allowEnrollment ? "left-7" : "left-1"
                    }`}
                  ></div>
                </button>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Enrollment Deadline</label>
                <input
                  type="date"
                  value={enrollmentDeadline}
                  onChange={(e) => setEnrollmentDeadline(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-secondary/50"
                />
                <p className="text-xs text-slate-500 mt-1">Leave blank for no deadline</p>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-lg">
                <div>
                  <div className="font-bold text-slate-800">Require Enrollment Approval</div>
                  <div className="text-sm text-slate-500">Manually approve student enrollment requests.</div>
                </div>
                <button
                  onClick={() => setRequiresApproval(!requiresApproval)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    requiresApproval ? "bg-primary" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      requiresApproval ? "left-7" : "left-1"
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          )}

          {activeTab === "assessment" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-primary border-b border-slate-100 pb-2">Assessment Settings</h3>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Assessment Method</label>
                <select
                  value={assessmentMethod}
                  onChange={(e) => setAssessmentMethod(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-secondary/50"
                >
                  <option value="weighted">Weighted Average</option>
                  <option value="simple">Simple Average</option>
                  <option value="points">Points-Based</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Assessment Method:</strong> The selected method determines how student grades are calculated.
                </p>
                <ul className="text-xs text-blue-700 mt-2 space-y-1">
                  <li>• <strong>Weighted Average:</strong> Grades weighted by category</li>
                  <li>• <strong>Simple Average:</strong> Equal weight for all assignments</li>
                  <li>• <strong>Points-Based:</strong> Total earned points out of total possible</li>
                  <li>• <strong>Manual:</strong> Manually enter final grades</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-8 justify-end">
        <button
          onClick={() => navigate("/instructor/my-courses")}
          disabled={saving}
          className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          {saving && <span className="animate-spin material-symbols-outlined text-sm">hourglass_bottom</span>}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
