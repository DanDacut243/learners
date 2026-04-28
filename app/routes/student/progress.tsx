import { useState, useEffect } from "react";
import { useToast } from "../../components/shared/Toast";
import apiClient from "~/services/api";

export function meta() {
  return [{ title: "ERUDITE - Student Progress" }];
}

export default function ProgressDashboard() {
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  async function fetchEnrollments() {
    try {
      const res = await apiClient.get('/enrollments');
      const enrollData = Array.isArray(res.data) ? res.data : res.data.data || [];
      setEnrollments(enrollData);
      if (enrollData.length > 0) {
        fetchProgress(enrollData[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
      toast('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function fetchProgress(enrollmentId: number) {
    try {
      const res = await apiClient.get(`/enrollments/${enrollmentId}/progress`);
      setProgress(res.data);
      setSelectedEnrollment(enrollmentId);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
      toast('Failed to load progress', 'error');
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-display-lg text-4xl font-extrabold text-primary tracking-tight mb-2">Your Progress</h1>
        <p className="text-on-surface-variant font-body">Track your learning journey across all courses.</p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Course List */}
        <div className="col-span-12 lg:col-span-3">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Your Courses</h3>
            {enrollments.map((enrollment) => (
              <button
                key={enrollment.id}
                onClick={() => fetchProgress(enrollment.id)}
                className={`w-full text-left p-4 rounded-lg transition-colors ${
                  selectedEnrollment === enrollment.id
                    ? 'bg-primary text-white'
                    : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-sm">{enrollment.course.name}</div>
                <div className={`text-xs mt-1 ${selectedEnrollment === enrollment.id ? 'text-blue-100' : 'text-slate-500'}`}>
                  {enrollment.status}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Progress Details */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          {progress && (
            <>
              {/* Overall Progress */}
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-6">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Overall Progress</h4>
                  <div className="text-4xl font-black text-primary mb-2">{progress.progress_percentage}%</div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary" style={{ width: `${progress.progress_percentage}%` }}></div>
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-6">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Modules Completed</h4>
                  <div className="text-4xl font-black text-primary">{progress.modules_completed}/{progress.total_modules}</div>
                  <p className="text-xs text-slate-500 mt-2">Keep going!</p>
                </div>
                <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-6">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Avg Quiz Score</h4>
                  <div className="text-4xl font-black text-primary">{progress.avg_quiz_score}%</div>
                  <p className="text-xs text-slate-500 mt-2">{progress.quiz_count} quizzes taken</p>
                </div>
              </div>

              {/* Module Breakdown */}
              <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-8">
                <h3 className="text-lg font-bold text-primary mb-6">Module Progress</h3>
                <div className="space-y-3">
                  {progress.modules.map((module: any, idx: number) => (
                    <div key={module.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-xs font-bold">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-primary">{module.title}</div>
                          <div className="text-xs text-slate-500">{module.type}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {module.completed ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            Pending
                          </span>
                        )}
                        {module.quiz_score !== null && (
                          <div className="text-right">
                            <div className="text-sm font-bold text-primary">{module.quiz_score}%</div>
                            <div className="text-xs text-slate-500">score</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Quizzes */}
              {progress.recent_quizzes.length > 0 && (
                <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-8">
                  <h3 className="text-lg font-bold text-primary mb-6">Recent Quiz Submissions</h3>
                  <div className="space-y-3">
                    {progress.recent_quizzes.map((quiz: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div>
                          <div className="font-bold text-primary text-sm">{quiz.module_title}</div>
                          <div className="text-xs text-slate-500 mt-1">{new Date(quiz.submitted_at).toLocaleDateString()}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-black ${quiz.score >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                            {quiz.score}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
