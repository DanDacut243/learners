import { useEffect, useState } from "react";
import { useToast } from "../../components/shared/Toast";
import { useNavigate } from "react-router";
import apiClient from "~/services/api";

interface Course {
  id: number;
  name: string;
}

interface StudentRisk {
  student_id: number;
  student_name: string;
  progress: number;
  avg_quiz_score: number;
  risk_score: number;
  risk_level: "Low" | "Medium" | "High";
  recent_activity: boolean;
  recommendation: string;
}

export function meta() {
  return [{ title: "ERUDITE - AI Assistant" }];
}

export default function InstructorAI() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [riskData, setRiskData] = useState<any>(null);

  // Fetch instructor's courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiClient.get("/courses");
        const myCourses = Array.isArray(res.data) ? res.data : res.data.data || [];
        setCourses(myCourses);
        if (myCourses.length > 0) {
          setSelectedCourseId(String(myCourses[0].id));
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        toast("Failed to load courses", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Analyze course when selected
  useEffect(() => {
    if (selectedCourseId) {
      analyzeRisk();
    }
  }, [selectedCourseId]);

  async function analyzeRisk() {
    if (!selectedCourseId) return;

    setAnalyzing(true);
    try {
      const response = await apiClient.get(`/ai/predict-risk/${selectedCourseId}`);
      setRiskData(response.data);
    } catch (error: any) {
      console.error("Failed to analyze risk:", error);
      toast("Failed to analyze course risks", "error");
    } finally {
      setAnalyzing(false);
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

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">
          auto_stories
        </span>
        <p className="text-slate-500 font-medium mb-2">No courses yet</p>
        <p className="text-slate-400 text-sm mb-6">Create a course to use AI-powered student insights</p>
        <button
          onClick={() => navigate("/instructor/my-courses")}
          className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors"
        >
          Create Course
        </button>
      </div>
    );
  }

  const selectedCourse = courses.find((c) => c.id === parseInt(selectedCourseId));

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-primary tracking-tight mb-2">AI Assistant</h1>
        <p className="text-on-surface-variant font-body">
          AI-powered insights to help you identify at-risk students and improve course engagement.
        </p>
      </div>

      {/* Course Selector */}
      <div className="mb-6">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2 block">
          Select a Course
        </label>
        <div className="flex gap-3">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="flex-1 bg-surface-container-high text-primary px-4 py-3 rounded-lg font-bold text-sm outline-none cursor-pointer"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            onClick={analyzeRisk}
            disabled={analyzing}
            className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            {analyzing ? (
              <span className="material-symbols-outlined animate-spin text-sm">hourglass_bottom</span>
            ) : (
              <span className="material-symbols-outlined text-sm">refresh</span>
            )}
            Refresh Analysis
          </button>
        </div>
      </div>

      {riskData ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                Total Students
              </p>
              <p className="text-3xl font-black text-blue-900">{riskData.total_students}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2">
                At-Risk Students
              </p>
              <p className="text-3xl font-black text-red-900">{riskData.at_risk_count}</p>
              <p className="text-xs text-red-600 mt-1">
                {riskData.total_students > 0
                  ? Math.round((riskData.at_risk_count / riskData.total_students) * 100)
                  : 0}%
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">
                On-Track Students
              </p>
              <p className="text-3xl font-black text-green-900">
                {riskData.total_students - riskData.at_risk_count}
              </p>
            </div>
          </div>

          {/* Student Risk List */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50">
              <h2 className="text-lg font-bold text-primary">Student Risk Analysis</h2>
              <p className="text-sm text-slate-500 mt-1">
                Sorted by risk score. Click on a student to view detailed analytics.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-widest">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-widest">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-widest">
                      Avg Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-widest">
                      Risk Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-widest">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {riskData.students?.map((student: StudentRisk) => (
                    <tr key={student.student_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{student.student_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${student.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-slate-600">{student.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">
                          {student.avg_quiz_score === 0 ? "—" : `${student.avg_quiz_score}%`}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                            student.risk_level === "High"
                              ? "bg-red-50 text-red-700"
                              : student.risk_level === "Medium"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-green-50 text-green-700"
                          }`}
                        >
                          {student.risk_level}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/instructor/students/${student.student_id}/analytics/${selectedCourseId}`)}
                          className="text-primary font-bold hover:underline cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(!riskData.students || riskData.students.length === 0) && (
              <div className="p-6 text-center text-slate-500">
                <p>No students enrolled in this course yet</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">
            insights
          </span>
          <p className="text-slate-500 font-medium">No analysis data available yet</p>
          <p className="text-slate-400 text-sm">Ensure students are enrolled in the course</p>
        </div>
      )}
    </div>
  );
}
