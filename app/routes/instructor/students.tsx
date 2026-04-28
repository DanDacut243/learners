import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useToast } from "../../components/shared/Toast";
import apiClient, { messagesApi } from "~/services/api";

export function meta() {
  return [{ title: "ERUDITE - My Students" }];
}

export default function InstructorStudents() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [courseFilter, setCourseFilter] = useState("All");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagingStudent, setMessagingStudent] = useState<any>(null);
  const [messageContent, setMessageContent] = useState("");
  const [messageAll, setMessageAll] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Store messages for persistence
  const [messages, setMessages] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('instructor_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchStudentsData = async () => {
      try {
        // Fetch instructor's courses first
        const coursesRes = await apiClient.get('/courses?instructor_id=me');
        const coursesData = Array.isArray(coursesRes.data) ? coursesRes.data : coursesRes.data.data || [];
        const allEnrollments: any[] = [];

        for (const course of coursesData) {
          try {
            // Try AI-powered risk prediction first
            const riskRes = await apiClient.get(`/ai/predict-risk/${course.id}`);
            const riskStudents = riskRes.data.students || [];
            allEnrollments.push(...riskStudents.map((s: any) => ({
              id: s.student_id,
              name: s.student_name,
              enrollmentId: s.enrollment_id,
              course: course.id,
              courseName: course.name,
              courseId: course.id,
              progress: s.progress,
              grade: s.avg_quiz_score >= 90 ? 'A' : s.avg_quiz_score >= 80 ? 'B' : s.avg_quiz_score >= 70 ? 'C' : s.avg_quiz_score >= 60 ? 'D' : s.avg_quiz_score > 0 ? 'F' : '-',
              score: s.avg_quiz_score,
              risk: s.risk_level,
              riskScore: s.risk_score,
              recommendation: s.recommendation,
              recentActivity: s.recent_activity,
            })));
          } catch {
            // Fallback: basic enrollment data
            const enrollmentsRes = await apiClient.get(`/courses/${course.id}/enrollments`);
            const enrollmentsData = Array.isArray(enrollmentsRes.data) ? enrollmentsRes.data : enrollmentsRes.data.data || [];
            allEnrollments.push(...enrollmentsData.map((e: any) => {
              const progress = e.progress_percentage || e.progress || 0;
              const score = e.grade || 0;
              return {
                ...e.user,
                enrollmentId: e.id,
                course: course.id,
                courseName: course.name,
                courseId: course.id,
                progress: progress,
                grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : score > 0 ? 'F' : '-',
                score: score,
                risk: progress >= 60 ? 'Low' : progress >= 30 ? 'Medium' : 'High',
                riskScore: 0,
                recommendation: '',
                recentActivity: true,
              };
            }));
          }
        }
        setStudents(allEnrollments);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to fetch students:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentsData();
    
    // Set up auto-refresh interval (every 30 seconds)
    let interval: NodeJS.Timeout;
    if (autoRefreshEnabled) {
      interval = setInterval(() => {
        fetchStudentsData();
      }, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefreshEnabled]);

  const [gradingStudent, setGradingStudent] = useState<typeof students[0] | null>(null);
  const [newScore, setNewScore] = useState<number>(0);
  const [feedback, setFeedback] = useState("");

  // Get unique courses
  const uniqueCourses = ['All', ...new Set(students.map(s => s.course))];
  const filtered = courseFilter === "All" ? students : students.filter(s => s.course === courseFilter);

  function getLetterGrade(score: number) {
    if (score >= 97) return "A+";
    if (score >= 93) return "A";
    if (score >= 90) return "A-";
    if (score >= 87) return "B+";
    if (score >= 83) return "B";
    if (score >= 80) return "B-";
    if (score >= 77) return "C+";
    if (score >= 73) return "C";
    if (score >= 70) return "C-";
    if (score >= 60) return "D";
    return "F";
  }

  function handleSaveGrade() {
    if (!gradingStudent) return;

    // Save grade via API - create/update a grade record
    apiClient.post('/grades', {
      user_id: gradingStudent.id,
      course_id: gradingStudent.courseId,
      grade: newScore,
      comments: feedback
    }).then(() => {
      setStudents(prev => prev.map(s => {
        if (s.id === gradingStudent.id && s.courseId === gradingStudent.courseId) {
          return {
            ...s,
            score: newScore,
            grade: getLetterGrade(newScore)
          };
        }
        return s;
      }));

      toast(`Grade saved: ${getLetterGrade(newScore)} for ${gradingStudent.name}`, 'success');
      setGradingStudent(null);
    }).catch((error: any) => {
      toast(`Failed to save grade: ${error.message}`, 'error');
    });
  }

  async function handleSendMessage() {
    if (!messageContent.trim()) {
      toast("Message cannot be empty", "error");
      return;
    }

    if (!messagingStudent?.id && !messageAll) {
      toast("Please select a student", "error");
      return;
    }

    setSendingMessage(true);
    try {
      if (messageAll) {
        // Send to all filtered students individually
        const studentIds = filtered.map(s => s.id);
        
        for (const student of filtered) {
          if (!student.id) {
            console.warn("Student missing ID:", student);
            continue;
          }
          await messagesApi.sendToStudent(
            student.id,
            messageContent,
            student.courseId
          );
        }
        
        toast(`Message sent to ${filtered.length} students ✓`, "success");
      } else {
        // Send to single student
        if (!messagingStudent.id) {
          throw new Error("Student ID is missing");
        }
        
        await messagesApi.sendToStudent(
          messagingStudent.id,
          messageContent,
          messagingStudent.courseId
        );
        
        toast(`Message sent to ${messagingStudent.name} ✓`, "success");
      }
      
      setMessageContent("");
      setMessagingStudent(null);
      setMessageAll(false);
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast(`Failed to send message: ${error.message}`, "error");
    } finally {
      setSendingMessage(false);
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight mb-2">Student Roster & Grading</h1>
          <p className="text-on-surface-variant font-body">Monitor student performance, assign grades, and identify at-risk learners.</p>
        </div>
        <div className="flex gap-3">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="bg-surface-container-high text-primary px-5 py-3 rounded-lg font-bold text-sm outline-none cursor-pointer"
          >
            {uniqueCourses.map((course) => (
              <option key={course} value={course}>
                {course === 'All' ? 'All My Courses' : course}
              </option>
            ))}
          </select>
          <button onClick={() => { setMessageAll(true); setMessageContent(""); }} className="bg-primary text-white px-5 py-3 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined">mail</span>
            Message All
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Student</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Course</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Progress</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Current Grade</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Risk Level</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((student, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-primary">{student.name}</div>
                  <div className="text-xs text-slate-500 mt-1">{student.id}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">{student.courseName}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full w-24">
                      <div className="h-full bg-secondary rounded-full" style={{ width: `${student.progress}%` }}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-500">{student.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-primary w-8">{student.grade}</span>
                    <span className="text-xs text-slate-400">({student.score}/100)</span>
                    <button 
                      onClick={() => {
                        setGradingStudent(student);
                        setNewScore(student.score);
                        setFeedback("");
                      }}
                      className="text-slate-300 hover:text-secondary transition-colors opacity-0 group-hover:opacity-100 cursor-pointer ml-2"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="relative group/risk">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full flex items-center gap-1 w-fit cursor-help ${
                      student.risk === 'Low' ? 'bg-green-100 text-green-800' :
                      student.risk === 'Medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      <span className="material-symbols-outlined text-[12px]">{student.risk === 'High' ? 'warning' : student.risk === 'Medium' ? 'info' : 'check_circle'}</span>
                      {student.risk}
                    </span>
                    {student.recommendation && (
                      <div className="absolute bottom-full left-0 mb-2 w-56 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover/risk:opacity-100 transition-opacity pointer-events-none z-50">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="material-symbols-outlined text-secondary text-[14px]">smart_toy</span>
                          <span className="font-bold text-secondary">AI Recommendation</span>
                        </div>
                        {student.recommendation}
                        <div className="absolute top-full left-4 w-2 h-2 bg-slate-800 rotate-45 -mt-1"></div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => { setMessagingStudent(student); setMessageContent(""); }} className="text-slate-400 hover:text-primary transition-colors p-2 cursor-pointer" title="Message Student">
                    <span className="material-symbols-outlined text-sm">chat</span>
                  </button>
                  <button onClick={() => navigate(`/instructor/students/${student.id}/analytics/${student.courseId}`)} className="text-slate-400 hover:text-primary transition-colors p-2 cursor-pointer" title="View Detailed Report">
                    <span className="material-symbols-outlined text-sm">analytics</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grading Modal */}
      {gradingStudent && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setGradingStudent(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-primary">Grade Assignment</h2>
                <div className="text-sm text-slate-500 mt-1">Student: <span className="font-bold text-slate-700">{gradingStudent.name}</span></div>
              </div>
              <button onClick={() => setGradingStudent(null)} className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-300 transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Submission File */}
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Latest Submission</div>
                <div className="flex items-center gap-3 p-3 bg-surface-container-low border border-slate-100 rounded-lg">
                  <span className="material-symbols-outlined text-secondary">description</span>
                  <div className="flex-1 font-mono text-sm text-slate-700">{gradingStudent.submission}</div>
                  <button className="text-xs font-bold text-primary hover:text-secondary transition-colors cursor-pointer flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Download
                  </button>
                </div>
              </div>

              {/* Grading Input */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Score (0-100)</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={newScore}
                      onChange={(e) => setNewScore(Number(e.target.value))}
                      className="bg-surface-container-low border-none rounded-lg px-4 py-3 text-lg font-bold text-primary w-24 outline-none focus:ring-2 focus:ring-secondary/50" 
                    />
                    <div className="text-2xl font-black text-slate-300">/ 100</div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Calculated Grade</label>
                  <div className="text-3xl font-black text-secondary">{getLetterGrade(newScore)}</div>
                </div>
              </div>

              {/* Feedback Input */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Instructor Feedback</label>
                <textarea 
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Leave constructive feedback for the student..."
                  className="w-full bg-surface-container-low border-none rounded-lg p-4 text-sm outline-none focus:ring-2 focus:ring-secondary/50 resize-none"
                  rows={4}
                ></textarea>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button onClick={() => setGradingStudent(null)} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleSaveGrade} className="px-6 py-2.5 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 cursor-pointer shadow-sm">
                <span className="material-symbols-outlined text-[18px]">save</span>
                Save Grade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messaging Modal */}
      {(messagingStudent || messageAll) && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => { setMessagingStudent(null); setMessageAll(false); }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-primary">
                  {messageAll ? "Message All Students" : "Message Student"}
                </h2>
                {!messageAll && (
                  <div className="text-sm text-slate-500 mt-1">
                    Recipient: <span className="font-bold text-slate-700">{messagingStudent?.name}</span>
                  </div>
                )}
                {messageAll && (
                  <div className="text-sm text-slate-500 mt-1">
                    Recipients: <span className="font-bold text-slate-700">{filtered.length} students</span>
                  </div>
                )}
              </div>
              <button onClick={() => { setMessagingStudent(null); setMessageAll(false); }} className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-300 transition-colors cursor-pointer">
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
                onClick={() => { setMessagingStudent(null); setMessageAll(false); }}
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
