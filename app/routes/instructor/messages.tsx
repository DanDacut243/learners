import { useState, useEffect } from 'react';
import apiClient from '~/services/api';
import { useParams } from 'react-router';
import { useAuth } from '~/context/AuthContext';

interface Student {
  id: number;
  name: string;
  email: string;
}

interface BroadcastRecord {
  id: number;
  message: string;
  created_at: string;
}

export function meta() {
  return [{ title: 'ERUDITE - Send Messages' }];
}

export default function InstructorMessages() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [messageType, setMessageType] = useState<'individual' | 'broadcast'>('individual');
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sentMessages, setSentMessages] = useState<BroadcastRecord[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchEnrolledStudents();
  }, [courseId]);

  const fetchEnrolledStudents = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/courses/${courseId}/enrollments`);
      const enrollments = Array.isArray(res.data) ? res.data : res.data.data || [];
      
      // Filter for students only (not instructors)
      const studentsOnly = enrollments
        .filter((e: any) => e.user?.role === 'student')
        .map((e: any) => ({
          id: e.user.id,
          name: e.user.name,
          email: e.user.email,
        }));
      
      setStudents(studentsOnly);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendIndividualMessage = async () => {
    if (!selectedStudent || !messageContent.trim()) {
      alert('Please select a student and enter a message');
      return;
    }

    try {
      setSending(true);
      await apiClient.post('/messages/send-to-student', {
        recipient_id: selectedStudent,
        course_id: courseId,
        message: messageContent,
      });

      setSuccessMessage('Message sent successfully! ✅');
      setMessageContent('');
      setSelectedStudent(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const sendBroadcastMessage = async () => {
    if (!messageContent.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      setSending(true);
      const res = await apiClient.post('/messages/broadcast', {
        course_id: courseId,
        message: messageContent,
      });

      setSuccessMessage('Broadcast sent to all students! ✅');
      setMessageContent('');
      
      // Add to sent messages list
      setSentMessages([
        ...sentMessages,
        {
          id: Date.now(),
          message: messageContent,
          created_at: new Date().toISOString(),
        },
      ]);

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to send broadcast:', error);
      alert('Failed to send broadcast message');
    } finally {
      setSending(false);
    }
  };

  const handleSend = () => {
    if (messageType === 'individual') {
      sendIndividualMessage();
    } else {
      sendBroadcastMessage();
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-400">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-white mb-2">Send Messages</h1>
        <p className="text-slate-400">Communicate with your students</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-600/20 border border-green-500 text-green-400 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Message Type Selector */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Message Type</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setMessageType('individual')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              messageType === 'individual'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            📧 Individual Message
          </button>
          <button
            onClick={() => setMessageType('broadcast')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${
              messageType === 'broadcast'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            📢 Broadcast to All
          </button>
        </div>
      </div>

      {/* Message Composer */}
      <div className="bg-slate-800 rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">
          {messageType === 'individual' ? 'Send to Student' : 'Broadcast Message'}
        </h2>

        {/* Student Selector (Individual Only) */}
        {messageType === 'individual' && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Select Student
            </label>
            <select
              value={selectedStudent || ''}
              onChange={(e) => setSelectedStudent(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Choose a student...</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
            {students.length === 0 && (
              <p className="text-sm text-slate-400 mt-2">No students enrolled in this course</p>
            )}
          </div>
        )}

        {/* Message Content */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Message
          </label>
          <textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Enter your message here..."
            rows={6}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:border-blue-500 resize-none"
          />
          <p className="text-sm text-slate-400 mt-1">
            {messageContent.length} characters
          </p>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={sending || (messageType === 'individual' && !selectedStudent) || !messageContent.trim()}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium rounded-lg transition"
        >
          {sending ? 'Sending...' : messageType === 'individual' ? 'Send Message' : 'Send Broadcast'}
        </button>
      </div>

      {/* Broadcast History */}
      {messageType === 'broadcast' && sentMessages.length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Broadcasts</h2>
          <div className="space-y-3">
            {sentMessages.map((msg) => (
              <div key={msg.id} className="p-3 bg-slate-700 rounded-lg">
                <p className="text-white">{msg.message}</p>
                <p className="text-sm text-slate-400 mt-1">
                  {new Date(msg.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Student List Info */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Students in Course</h2>
        {students.length === 0 ? (
          <p className="text-slate-400">No students enrolled yet</p>
        ) : (
          <div className="space-y-2">
            {students.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                <div>
                  <p className="text-white font-medium">{student.name}</p>
                  <p className="text-sm text-slate-400">{student.email}</p>
                </div>
                <span className="text-xs bg-blue-600/30 text-blue-400 px-2 py-1 rounded">
                  Student
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
