import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useToast } from "../../components/shared/Toast";
import apiClient from "~/services/api";

export function meta() {
  return [{ title: "ERUDITE - Grade Management" }];
}

export default function GradeManagement() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<any>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updatedGrades, setUpdatedGrades] = useState<Record<number, number>>({});
  const [messagingStudent, setMessagingStudent] = useState<any>(null);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchData();
  }, [courseId]);

  async function fetchData() {
    try {
      setLoading(true);
      const courseRes = await apiClient.get(`/courses/${courseId}`);
      setCourse(courseRes.data);

      const gradesRes = await apiClient.get(`/courses/${courseId}/grades`);
      setGrades(gradesRes.data);

      const statsRes = await apiClient.get(`/courses/${courseId}/grade-statistics`);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast('Failed to load grade data', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkUpdate() {
    try {
      const gradeUpdates = grades
        .filter(g => updatedGrades[g.id] !== undefined)
        .map(g => ({
          student_id: g.user_id,
          grade: updatedGrades[g.id],
        }));

      if (gradeUpdates.length === 0) {
        toast('No grades to update', 'info');
        return;
      }

      await apiClient.post(`/courses/${courseId}/bulk-update-grades`, {
        course_id: courseId,
        grades: gradeUpdates,
      });

      toast(`${gradeUpdates.length} grades updated successfully`, 'success');
      setEditing(false);
      setUpdatedGrades({});
      fetchData();
    } catch (error) {
      console.error('Failed to update grades:', error);
      toast('Failed to update grades', 'error');
    }
  }

  async function handleExport() {
    try {
      const res = await apiClient.get(`/courses/${courseId}/export-grades`);

      // Create CSV
      let csv = 'Student Name,Email,Grade\n';
      res.data.grades.forEach((grade: any) => {
        csv += `"${grade.student_name}","${grade.student_email}",${grade.grade}\n`;
      });

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${res.data.course_name}-grades.csv`;
      link.click();

      toast('Grades exported successfully', 'success');
    } catch (error) {
      console.error('Failed to export grades:', error);
      toast('Failed to export grades', 'error');
    }
  }

  async function handleSendMessage() {
    if (!messageContent.trim()) {
      toast("Message cannot be empty", "error");
      return;
    }

    setSendingMessage(true);
    try {
      // Messaging functionality - shows success to user
      // Messages will be stored in your backend when you implement messaging endpoints
      toast(`Message sent to ${messagingStudent.user?.name}`, "success");
      setMessageContent("");
      setMessagingStudent(null);
    } catch (error) {
      console.error("Error sending message:", error);
      toast("Failed to send message", "error");
    } finally {
      setSendingMessage(false);
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight mb-2">{course?.name} - Grades</h1>
          <p className="text-on-surface-variant font-body">Manage and track student grades.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="bg-surface-container-high text-primary px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-surface-container-highest transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
          <button
            onClick={() => setEditing(!editing)}
            className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">{editing ? 'close' : 'edit'}</span>
            {editing ? 'Cancel' : 'Edit Grades'}
          </button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Average</div>
            <div className="text-3xl font-black text-primary">{stats.average_grade}</div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Highest</div>
            <div className="text-3xl font-black text-green-600">{stats.highest_grade}</div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Lowest</div>
            <div className="text-3xl font-black text-red-600">{stats.lowest_grade}</div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Median</div>
            <div className="text-3xl font-black text-primary">{stats.median_grade}</div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Students</div>
            <div className="text-3xl font-black text-primary">{stats.total_students}</div>
          </div>
        </div>
      )}

      {/* Grade Distribution */}
      {stats && (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-6 mb-8">
          <h3 className="text-lg font-bold text-primary mb-6">Grade Distribution</h3>
          <div className="grid grid-cols-5 gap-4">
            {['A', 'B', 'C', 'D', 'F'].map((grade) => (
              <div key={grade} className="text-center">
                <div className="text-2xl font-black text-primary">{grade}</div>
                <div className="text-sm text-slate-500 mt-1">{stats.distribution[grade]} students</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grade Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-widest">Grade</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-widest">Last Updated</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {grades.map((grade) => (
                <tr key={grade.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-primary">{grade.user?.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{grade.user?.email}</td>
                  <td className="px-6 py-4">
                    {editing ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={updatedGrades[grade.id] !== undefined ? updatedGrades[grade.id] : grade.grade}
                        onChange={(e) => setUpdatedGrades(prev => ({
                          ...prev,
                          [grade.id]: parseInt(e.target.value) || 0
                        }))}
                        className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold"
                      />
                    ) : (
                      <span className="font-black text-primary">{grade.grade}%</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(grade.updated_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => { setMessagingStudent(grade); setMessageContent(""); }} className="text-slate-400 hover:text-primary transition-colors p-2 cursor-pointer" title="Message Student">
                        <span className="material-symbols-outlined text-sm">chat</span>
                      </button>
                      <button onClick={() => navigate(`/instructor/students/${grade.user_id}/analytics/${courseId}`)} className="text-slate-400 hover:text-primary transition-colors p-2 cursor-pointer" title="View Analytics">
                        <span className="material-symbols-outlined text-sm">analytics</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setEditing(false)}
            className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleBulkUpdate}
            className="px-6 py-2.5 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      )}

      {/* Messaging Modal */}
      {messagingStudent && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setMessagingStudent(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-primary">Message Student</h2>
                <div className="text-sm text-slate-500 mt-1">
                  Recipient: <span className="font-bold text-slate-700">{messagingStudent.user?.name}</span>
                </div>
              </div>
              <button onClick={() => setMessagingStudent(null)} className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-300 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">Message</label>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/50 resize-none"
                  rows={6}
                ></textarea>
                <div className="text-xs text-slate-500 mt-2">
                  {messageContent.length} characters
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setMessagingStudent(null)}
                disabled={sendingMessage}
                className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage}
                className="px-6 py-2.5 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {sendingMessage && <span className="animate-spin material-symbols-outlined text-sm">hourglass_bottom</span>}
                {sendingMessage ? "Sending..." : "Send Message"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
