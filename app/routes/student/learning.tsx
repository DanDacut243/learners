import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { useToast } from "../../components/shared/Toast";
import { useAuth } from "../../context/AuthContext";
import apiClient from "~/services/api";

export function meta() {
  return [{ title: "ERUDITE - Learning Environment" }];
}

export default function LearningRoom() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [showCertificate, setShowCertificate] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: string, text: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        if (!courseId) return;
        const res = await apiClient.get(`/courses/${courseId}`);
        setCourse(res.data);
        setModules(res.data.modules || []);
        if (res.data.modules && res.data.modules.length > 0) {
          setActiveModule(res.data.modules[0]);
        }
      } catch (error) {
        console.error('Failed to fetch course:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId]);

  const isCourseComplete = modules.every(m => m.completed);

  async function handleComplete() {
    if (!activeModule || !user) return;
    try {
      // Get enrollment
      const enrollmentsRes = await apiClient.get('/enrollments');
      const enrollment = enrollmentsRes.data.find((e: any) => e.course_id === parseInt(courseId || ''));

      if (enrollment) {
        await apiClient.post('/module-completions', {
          enrollment_id: enrollment.id,
          module_id: activeModule.id,
        });
      }

      setModules(prev => prev.map(m => m.id === activeModule.id ? { ...m, completed: true } : m));
      toast(`Module completed: ${activeModule.title} - Saved to database`, "success");

      const currentIndex = modules.findIndex(m => m.id === activeModule.id);
      if (currentIndex < modules.length - 1) {
        setActiveModule(modules[currentIndex + 1]);
        setQuizAnswers({});
        setQuizSubmitted(false);
        setQuizScore(0);
      }
    } catch (error) {
      console.error('Failed to complete module:', error);
      toast('Failed to complete module', 'error');
    }
  }

  async function handleQuizSubmit() {
    if (!activeModule?.quizData || !user) return;
    try {
      // Get enrollment
      const enrollmentsRes = await apiClient.get('/enrollments');
      const enrollment = enrollmentsRes.data.find((e: any) => e.course_id === parseInt(courseId || ''));

      if (!enrollment) {
        toast('Enrollment not found', 'error');
        return;
      }

      let score = 0;
      let correct = 0;
      activeModule.quizData.questions.forEach((q: any, idx: number) => {
        if (quizAnswers[idx] === q.answer) {
          score++;
          correct++;
        }
      });

      const percentage = Math.round((score / activeModule.quizData.questions.length) * 100);

      // Save quiz result to database
      await apiClient.post('/quiz-results', {
        enrollment_id: enrollment.id,
        module_id: activeModule.id,
        score: percentage,
        total_questions: activeModule.quizData.questions.length,
        correct_answers: correct,
        answers: quizAnswers,
      });

      setQuizScore(score);
      setQuizSubmitted(true);
      toast(`Quiz submitted! Score: ${score}/${activeModule.quizData.questions.length} - Saved to database`, "success");
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      toast('Failed to submit quiz', 'error');
    }
  }

  async function handlePostComment() {
    if (!newComment.trim() || !user || !activeModule) return;
    try {
      // Get enrollment
      const enrollmentsRes = await apiClient.get('/enrollments');
      const enrollment = enrollmentsRes.data.find((e: any) => e.course_id === parseInt(courseId || ''));

      if (enrollment) {
        const res = await apiClient.post('/discussions', {
          enrollment_id: enrollment.id,
          module_id: activeModule.id,
          content: newComment,
        });

        const newMsg = {
          id: res.data.id,
          author: user.name || 'Student',
          role: 'Student',
          text: newComment,
          time: 'Just now'
        };
        setDiscussions([...discussions, newMsg]);
      }

      setNewComment("");
      toast("Question posted to discussion board and saved to database", "success");
    } catch (error) {
      console.error('Failed to post comment:', error);
      toast('Failed to post comment', 'error');
    }
  }

  function handleStartChat() {
    setChatMode(true);
    setChatMessages([]);
    // Send an initial contextual greeting
    sendAiMessage("Hi! I'm studying this course. Can you give me a brief overview of what I should focus on?", true);
  }

  async function sendAiMessage(message: string, isInitial = false) {
    if (!message.trim()) return;

    const userMsg = { role: "student", text: message };
    const updatedHistory = isInitial ? [userMsg] : [...chatMessages, userMsg];

    if (!isInitial) {
      setChatMessages(prev => [...prev, userMsg]);
    } else {
      setChatMessages([userMsg]);
    }
    setChatInput("");
    setIsTyping(true);

    try {
      const res = await apiClient.post('/ai/chat', {
        message: message,
        course_id: parseInt(courseId || '0'),
        module_id: activeModule?.id || null,
        history: updatedHistory,
      });

      const aiResponse = res.data.message || "I'm sorry, I couldn't process that. Could you try rephrasing?";
      setChatMessages(prev => [...prev, { role: "ai", text: aiResponse }]);
    } catch (error) {
      console.error('AI chat error:', error);
      setChatMessages(prev => [...prev, {
        role: "ai",
        text: "I'm having trouble connecting right now. Let me try to help based on your course material — what specific topic are you working on?"
      }]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleSendMessage() {
    if (!chatInput.trim() || isTyping) return;
    sendAiMessage(chatInput);
  }

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!course) return <div className="text-center py-8">Course not found</div>;
  if (!activeModule) return <div className="text-center py-8">Loading module...</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-8 -m-4 sm:m-0">
      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <a href="/student/courses" className="text-slate-400 hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
            </a>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{courseId || "COURSE"}</span>
            <span className="text-xs font-bold text-secondary uppercase tracking-widest">Learning Room</span>
          </div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight mb-1">{course?.name}</h1>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">person</span> {course?.instructor?.name || 'Instructor'}
          </p>
        </div>

        {activeModule?.type === "video" ? (
          <>
            {/* Video Player Placeholder */}
            <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden relative shadow-lg group">
              <div className="absolute inset-0 flex items-center justify-center">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center transition-all cursor-pointer transform group-hover:scale-110"
                >
                  <span className="material-symbols-outlined text-white text-3xl ml-1">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
              </div>
              {/* Video Controls bar */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-4 text-white text-sm">
                  <span className="material-symbols-outlined cursor-pointer hover:text-secondary">volume_up</span>
                  <div className="flex-1 h-1 bg-white/30 rounded-full cursor-pointer relative">
                    <div className="absolute left-0 top-0 h-full bg-secondary rounded-full w-1/3"></div>
                    <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow"></div>
                  </div>
                  <span className="font-mono text-xs">12:04 / {activeModule.duration}</span>
                  <span className="material-symbols-outlined cursor-pointer hover:text-secondary">fullscreen</span>
                </div>
              </div>
            </div>

            {/* Module Controls */}
            <div className="flex items-center justify-between bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-slate-100">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Module</div>
                <h2 className="text-xl font-bold text-primary">{activeModule.title}</h2>
              </div>
              <button onClick={handleComplete} className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-2">
                <span className="material-symbols-outlined">check_circle</span>
                Mark as Complete
              </button>
            </div>

            {/* Transcript/Notes */}
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">description</span>
                Transcript & Notes
              </h3>
              <div className="space-y-4 text-slate-600 font-body text-sm leading-relaxed">
                <p>Welcome to this module. In this session, we will explore the core concepts that define this subject matter. Notice how the architecture forms a coherent system that allows for scalable processing.</p>
                <p>One of the primary challenges is mitigating loss over extended cycles. If you refer to the diagram on screen, you'll see the feedback loop mechanism...</p>
                <div className="p-4 bg-blue-50 text-blue-900 rounded-lg border border-blue-100 my-4">
                  <span className="font-bold">Key Takeaway:</span> Always ensure your gradients are normalized before passing them to the next layer to prevent explosion.
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
              <div>
                <div className="text-xs font-bold text-secondary uppercase tracking-widest mb-1">Knowledge Check</div>
                <h2 className="text-2xl font-extrabold text-primary">{activeModule.title}</h2>
              </div>
              {quizSubmitted && activeModule?.quizData?.questions && (
                <div className={`px-4 py-2 rounded-lg font-bold text-lg ${quizScore === activeModule.quizData.questions.length ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                  Score: {quizScore} / {activeModule.quizData.questions.length}
                </div>
              )}
            </div>

            <div className="space-y-8">
              {activeModule.quizData?.questions?.map((q: any, qIdx: number) => (
                <div key={qIdx} className="space-y-4">
                  <h3 className="font-bold text-slate-800 text-lg">{qIdx + 1}. {q.q}</h3>
                  <div className="grid gap-3">
                    {q.options.map((opt: string, oIdx: number) => {
                      const isSelected = quizAnswers[qIdx] === oIdx;
                      const isCorrect = q.answer === oIdx;
                      let btnClass = "text-left px-5 py-4 rounded-xl border-2 transition-all font-medium text-sm outline-none ";
                      
                      if (!quizSubmitted) {
                        btnClass += isSelected ? "border-secondary bg-secondary/5 text-secondary font-bold" : "border-slate-100 bg-white hover:border-slate-300 text-slate-600 cursor-pointer";
                      } else {
                        if (isCorrect) btnClass += "border-green-500 bg-green-50 text-green-700 font-bold";
                        else if (isSelected && !isCorrect) btnClass += "border-red-500 bg-red-50 text-red-700";
                        else btnClass += "border-slate-100 bg-white text-slate-400 opacity-50";
                      }

                      return (
                        <button 
                          key={oIdx} 
                          disabled={quizSubmitted}
                          onClick={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                          className={btnClass}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end gap-4">
              {!quizSubmitted ? (
                <button 
                  onClick={handleQuizSubmit}
                  disabled={!activeModule?.quizData?.questions || Object.keys(quizAnswers).length < (activeModule?.quizData?.questions?.length || 0)}
                  className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answers
                </button>
              ) : (
                <button 
                  onClick={handleComplete}
                  className="bg-secondary text-white px-8 py-3 rounded-lg font-bold hover:bg-secondary/90 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span>Continue Course</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Discussion / Q&A Section */}
        <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-slate-100 mt-6">
          <h3 className="text-lg font-bold text-primary mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">forum</span>
              Module Discussion
            </div>
            <span className="text-sm font-normal text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{discussions.length} Comments</span>
          </h3>

          <div className="space-y-6 mb-8">
            {discussions.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${comment.role === 'Instructor' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {comment.author.charAt(0)}
                </div>
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold text-primary text-sm">{comment.author}</span>
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded font-bold ${comment.role === 'Instructor' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{comment.role}</span>
                    <span className="text-xs text-slate-400 ml-1">{comment.time}</span>
                  </div>
                  <p className="text-sm text-slate-600 bg-surface-container-low p-4 rounded-xl rounded-tl-none">{comment.text}</p>
                </div>
              </div>
            ))}
            {discussions.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-sm italic">
                No questions yet. Be the first to start the discussion!
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-100">
            <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 flex flex-col gap-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ask a question or share a thought about this module..."
                className="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-secondary/50 resize-none"
                rows={3}
              ></textarea>
              <div className="flex justify-end">
                <button
                  onClick={handlePostComment}
                  disabled={!newComment.trim()}
                  className="bg-primary text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Area */}
      <div className="w-full lg:w-80 space-y-6">
        {/* Course Syllabus */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[500px]">
          <div className="p-5 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-primary">Syllabus</h3>
            <div className="text-xs text-slate-500 mt-1">
              {modules.filter(m => m.completed).length} of {modules.length} modules completed
            </div>
            <div className="mt-3 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-secondary rounded-full transition-all duration-500" 
                style={{ width: `${(modules.filter(m => m.completed).length / modules.length) * 100}%` }}
              ></div>
            </div>
            {isCourseComplete && (
              <button 
                onClick={() => setShowCertificate(true)}
                className="w-full mt-4 bg-gradient-to-r from-amber-400 to-amber-600 text-white font-bold py-2 rounded-lg text-sm shadow-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                View Certificate
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {modules.map((m, index) => (
              <button 
                key={m.id}
                onClick={() => setActiveModule(m)}
                className={`w-full text-left p-3 rounded-lg mb-1 flex items-start gap-3 transition-colors cursor-pointer ${
                  activeModule?.id === m.id 
                    ? "bg-secondary-container text-on-secondary-container font-bold" 
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="mt-0.5">
                  {m.completed ? (
                    <span className="material-symbols-outlined text-[18px] text-green-500">check_circle</span>
                  ) : activeModule?.id === m.id ? (
                    <span className="material-symbols-outlined text-[18px] text-secondary">
                      {m.type === "quiz" ? "quiz" : "play_circle"}
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px] text-slate-300">
                      {m.type === "quiz" ? "help_outline" : "radio_button_unchecked"}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className={`text-sm ${activeModule?.id === m.id ? "text-primary" : "text-slate-600"}`}>
                    {index + 1}. {m.title}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{m.duration}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* AI Tutor Widget */}
        <div className="bg-gradient-to-br from-blue-900 to-primary rounded-xl shadow-md flex flex-col overflow-hidden transition-all" style={{ maxHeight: chatMode ? '70vh' : 'auto', minHeight: chatMode ? '400px' : 'auto' }}>
          <div className="p-6 flex-1 flex flex-col min-h-0">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-30 blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white">
                <span className={`material-symbols-outlined text-secondary ${!chatMode ? 'animate-pulse' : ''}`}>smart_toy</span>
                <h3 className="font-bold text-lg">AI Tutor</h3>
              </div>
              {chatMode && (
                <button onClick={() => setChatMode(false)} className="text-white/60 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>

            {!chatMode ? (
              <div className="relative z-10">
                <p className="text-sm text-blue-100 mb-4 leading-relaxed">
                  I can help you understand <strong className="text-secondary">{activeModule?.title || 'this module'}</strong>. Ask me anything — from concept breakdowns to quiz prep!
                </p>
                <button 
                  onClick={handleStartChat}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-lg text-sm transition-colors cursor-pointer border border-white/20"
                >
                  Start AI Tutor Session
                </button>
              </div>
            ) : (
              <div className="relative z-10 flex-1 flex flex-col min-h-0 gap-3">
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar min-h-0">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'student' ? 'items-end' : 'items-start'}`}>
                      <div className={`text-xs font-bold mb-1 ${msg.role === 'student' ? 'text-blue-200' : 'text-secondary'}`}>
                        {msg.role === 'student' ? 'You' : 'AI Tutor'}
                      </div>
                      <div className={`text-sm p-3 rounded-xl max-w-[90%] ${msg.role === 'student' ? 'bg-white/20 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex items-start">
                      <div className="bg-white p-3 rounded-xl rounded-tl-none">
                        <div className="flex gap-1 items-center h-4">
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask a question..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-blue-200 outline-none focus:border-secondary"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim() || isTyping}
                    className="bg-secondary text-white w-10 rounded-lg flex items-center justify-center hover:bg-secondary/90 disabled:opacity-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificate && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowCertificate(false)}>
          <div className="bg-white w-full max-w-3xl aspect-[1.414/1] rounded-lg shadow-2xl p-1 relative overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Fancy Border Pattern */}
            <div className="absolute inset-2 border-4 border-double border-amber-200 pointer-events-none"></div>
            <div className="absolute inset-4 border border-amber-100 pointer-events-none"></div>
            
            <button 
              onClick={() => setShowCertificate(false)}
              className="absolute top-6 right-6 w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center transition-colors cursor-pointer z-10"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="flex-1 flex flex-col items-center justify-center text-center px-12 relative z-0">
              <span className="material-symbols-outlined text-6xl text-amber-400 mb-6 drop-shadow-md">school</span>
              
              <h4 className="uppercase tracking-[0.3em] text-slate-400 font-bold text-sm mb-2">ERUDITE Learning Platform</h4>
              <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-8 font-serif">Certificate of Completion</h1>
              
              <p className="text-slate-500 mb-4 italic">This is to proudly certify that</p>
              <div className="text-3xl font-bold text-slate-800 border-b-2 border-slate-200 pb-2 mb-6 w-2/3 mx-auto">
                {user?.name || 'Student'}
              </div>
              
              <p className="text-slate-500 mb-2 italic">has successfully completed all requirements for</p>
              <div className="text-2xl font-extrabold text-secondary mb-12">
                {course?.name}
              </div>

              <div className="flex justify-between w-full max-w-lg mt-auto mb-10 border-t border-slate-200 pt-6">
                <div>
                  <div className="font-script text-xl text-slate-700 mb-1" style={{fontFamily: "'Dancing Script', cursive", fontStyle: "italic"}}>{course?.instructor?.name}</div>
                  <div className="text-xs uppercase tracking-widest text-slate-400 font-bold border-t border-slate-300 pt-2 w-32 mx-auto">Instructor</div>
                </div>
                <div className="w-24 h-24 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shadow-inner mt-[-20px]">
                  <span className="material-symbols-outlined text-amber-400 text-4xl">workspace_premium</span>
                </div>
                <div>
                  <div className="text-slate-700 font-bold mb-1">{new Date().toLocaleDateString()}</div>
                  <div className="text-xs uppercase tracking-widest text-slate-400 font-bold border-t border-slate-300 pt-2 w-32 mx-auto">Date Issued</div>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-3 rounded-b-lg">
              <button 
                onClick={() => toast("Certificate downloaded as PDF")}
                className="bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
