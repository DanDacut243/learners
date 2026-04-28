import { useState, useEffect } from 'react';
import apiClient from '~/services/api';
import { useParams } from 'react-router';

interface Submission {
  id: number;
  user: { name: string; email: string };
  assignment: { title: string };
  status: string;
  content: string;
  grade: number | null;
  feedback: string | null;
  submitted_at: string;
}

export default function GradingPage() {
  const { courseId } = useParams();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [grade, setGrade] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [courseId]);

  const fetchSubmissions = async () => {
    try {
      const res = await apiClient.get('/submissions');
      const filtered = res.data.data.filter((s: any) => s.assignment?.course_id === parseInt(courseId || '0'));
      setSubmissions(filtered);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    }
  };

  const handleGrade = async () => {
    if (!selectedSubmission) return;

    setLoading(true);
    try {
      await apiClient.put(`/submissions/${selectedSubmission.id}/grade`, {
        grade,
        feedback,
      });

      alert('Grade submitted successfully!');
      setShowGradeForm(false);
      setSelectedSubmission(null);
      fetchSubmissions();
    } catch (error) {
      console.error('Failed to grade submission:', error);
      alert('Failed to submit grade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Grade Submissions</h1>

        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-3 px-4">Student</th>
                <th className="text-left py-3 px-4">Assignment</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Grade</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map(submission => (
                <tr key={submission.id} className="border-b border-slate-700 hover:bg-slate-700">
                  <td className="py-3 px-4">{submission.user.name}</td>
                  <td className="py-3 px-4">{submission.assignment.title}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      submission.status === 'graded' ? 'bg-green-600' :
                      submission.status === 'submitted' ? 'bg-blue-600' :
                      'bg-gray-600'
                    }`}>
                      {submission.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{submission.grade ?? '-'}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setGrade(submission.grade || 0);
                        setFeedback(submission.feedback || '');
                        setShowGradeForm(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Grade
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {submissions.length === 0 && (
          <p className="text-gray-400 text-center py-8">No submissions yet</p>
        )}

        {showGradeForm && selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl">
              <h3 className="text-xl font-bold text-white mb-4">
                Grade: {selectedSubmission.user.name} - {selectedSubmission.assignment.title}
              </h3>

              <div className="bg-slate-700 rounded p-4 mb-4">
                <p className="text-gray-300 mb-3 font-bold">Submission:</p>
                <p className="text-gray-300">{selectedSubmission.content}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white mb-2">Grade (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={grade}
                    onChange={(e) => setGrade(parseInt(e.target.value))}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">Feedback</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white h-24"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button 
                  onClick={handleGrade}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded py-2 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Grade'}
                </button>
                <button 
                  onClick={() => setShowGradeForm(false)}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white rounded py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
