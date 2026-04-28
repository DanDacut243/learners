import { useState, useEffect } from 'react';
import apiClient from '~/services/api';
import { useParams } from 'react-router';
import { useAuth } from '~/context/AuthContext';

interface Assignment {
  id: number;
  title: string;
  description: string;
  instructions: string;
  due_date: string;
  points: number;
}

export default function AssignmentsPage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, [courseId]);

  const fetchAssignments = async () => {
    try {
      const res = await apiClient.get(`/courses/${courseId}/assignments`);
      setAssignments(res.data);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssignment || !content) {
      alert('Please enter submission content');
      return;
    }

    setLoading(true);
    try {
      // Get enrollment for this course
      const enrollRes = await apiClient.get(`/courses/${courseId}/enrollments`);
      const enrollment = enrollRes.data.find((e: any) => e.user_id === user?.id);

      if (!enrollment) {
        alert('You are not enrolled in this course');
        return;
      }

      await apiClient.post('/submissions', {
        assignment_id: selectedAssignment.id,
        enrollment_id: enrollment.id,
        content,
      });

      alert('Assignment submitted successfully!');
      setContent('');
      setShowForm(false);
      setSelectedAssignment(null);
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      alert('Failed to submit assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Assignments</h1>

        <div className="grid gap-4">
          {assignments.map(assignment => (
            <div key={assignment.id} className="bg-slate-700 rounded-lg p-6 hover:bg-slate-600 transition cursor-pointer">
              <h3 className="text-xl font-bold text-white mb-2">{assignment.title}</h3>
              <p className="text-gray-300 text-sm mb-3">{assignment.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-blue-400">{assignment.points} points</span>
                <button
                  onClick={() => {
                    setSelectedAssignment(assignment);
                    setShowForm(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Submit
                </button>
              </div>
            </div>
          ))}
        </div>

        {assignments.length === 0 && (
          <p className="text-gray-400 text-center py-8">No assignments yet</p>
        )}

        {showForm && selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Submit: {selectedAssignment.title}</h3>

              {selectedAssignment.instructions && (
                <div className="bg-slate-700 rounded p-4 mb-4">
                  <p className="text-gray-300 text-sm">{selectedAssignment.instructions}</p>
                </div>
              )}

              <textarea
                placeholder="Enter your submission here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-gray-400 h-64 mb-4"
              />

              <div className="flex gap-2">
                <button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded py-2 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
                <button 
                  onClick={() => {
                    setShowForm(false);
                    setContent('');
                    setSelectedAssignment(null);
                  }}
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
