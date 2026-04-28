// Instructor Submissions Management
import { useState, useEffect } from "react";
import { useToast } from "../../components/shared/Toast";
import { useAuth } from "../../context/AuthContext";
import apiClient from "../../services/api";

export function meta() {
  return [{ title: "ERUDITE - Student Submissions" }];
}

interface Submission {
  id: number;
  student_name: string;
  student_email: string;
  assignment_title: string;
  status: string;
  submitted_at: string;
  grade?: number;
  feedback?: string;
  content: string;
}

export default function Submissions() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    try {
      setLoading(true);
      
      // Get all submissions (API filters by instructor's courses)
      const submissionsRes = await apiClient.get('/submissions');
      const data = submissionsRes.data.data || submissionsRes.data;
      
      const formattedSubmissions = data.map((sub: any) => ({
        id: sub.id,
        student_name: sub.user?.name || 'Unknown',
        student_email: sub.user?.email || 'N/A',
        assignment_title: sub.assignment?.title || 'Unknown',
        status: sub.status,
        submitted_at: sub.submitted_at,
        grade: sub.grade,
        feedback: sub.feedback,
        content: sub.content,
      }));
      
      setSubmissions(formattedSubmissions.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()));
      
      if (formattedSubmissions.length === 0) {
        toast("No student submissions yet", "info");
      }
    } catch (err: any) {
      toast("Failed to load submissions", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(isoString: string) {
    const date = new Date(isoString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'submitted':
        return "bg-blue-100 text-blue-800";
      case 'graded':
        return "bg-green-100 text-green-800";
      case 'draft':
        return "bg-gray-100 text-gray-800";
      case 'returned':
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  }

  const filtered = submissions.filter((s) => {
    const matchesSearch = 
      s.student_name.toLowerCase().includes(search.toLowerCase()) ||
      s.student_email.toLowerCase().includes(search.toLowerCase()) ||
      s.assignment_title.toLowerCase().includes(search.toLowerCase());
    
    if (filter === "submitted") return matchesSearch && s.status === 'submitted';
    if (filter === "graded") return matchesSearch && s.status === 'graded';
    return matchesSearch;
  });

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
      <div className="mb-8">
        <h1 className="text-display-lg text-4xl font-extrabold text-primary tracking-tight mb-2">Student Submissions</h1>
        <p className="text-on-surface-variant font-body">Review and grade student assignment submissions.</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-low border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-secondary/20 outline-none"
            placeholder="Search by student or assignment..."
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-surface-container-low border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/20 cursor-pointer"
        >
          <option value="all">All Submissions</option>
          <option value="submitted">Pending Review</option>
          <option value="graded">Graded</option>
        </select>
      </div>

      {/* Submissions Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Student</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Assignment</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Grade</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Submitted</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-primary">{sub.student_name}</div>
                  <div className="text-xs text-slate-500">{sub.student_email}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">{sub.assignment_title}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(sub.status)}`}>
                    {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-slate-700">
                    {sub.grade !== null && sub.grade !== undefined ? `${sub.grade}/100` : '—'}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{formatDate(sub.submitted_at)}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setSelectedSubmission(sub)}
                    className="text-primary hover:text-primary/80 text-sm font-bold cursor-pointer"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                  No submissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <div
          className="fixed inset-0 bg-black/40 z-[90] flex items-center justify-center p-4"
          onClick={() => setSelectedSubmission(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-primary">{selectedSubmission.student_name}</h2>
                <p className="text-slate-600 text-sm">{selectedSubmission.student_email}</p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 mb-6 space-y-3">
              <div className="flex justify-between">
                <span className="font-bold text-slate-600">Assignment:</span>
                <span className="text-slate-900">{selectedSubmission.assignment_title}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-600">Status:</span>
                <span className={`font-bold ${getStatusColor(selectedSubmission.status)}`}>
                  {selectedSubmission.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-slate-600">Submitted:</span>
                <span className="text-slate-900">{formatDate(selectedSubmission.submitted_at)}</span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Submission Content</h3>
              <div className="bg-slate-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedSubmission.content}</p>
              </div>
            </div>

            {selectedSubmission.feedback && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Feedback</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-slate-700">{selectedSubmission.feedback}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
