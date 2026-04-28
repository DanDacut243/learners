import { useEffect, useState, useRef } from "react";
import { useToast } from "../../components/shared/Toast";
import apiClient from "~/services/api";

interface Message {
  id: string;
  role: "user" | "ai";
  text: string;
  time: string;
}

export function meta() {
  return [{ title: "ERUDITE - AI Tutor" }];
}

export default function StudentAITutor() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "ai",
      text: "Hello! 👋 I'm your AI tutor. Select a course and ask me anything about the material — I'll help you understand concepts, prepare for quizzes, and more!",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch enrolled courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiClient.get("/my-enrolled-courses");
        const enrolledCourses = Array.isArray(res.data) ? res.data : res.data.data || [];
        setCourses(enrolledCourses);
        if (enrolledCourses.length > 0) {
          setSelectedCourseId(String(enrolledCourses[0].id));
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

  async function handleSendMessage() {
    if (!inputText.trim() || !selectedCourseId) {
      toast("Please select a course and enter a message", "error");
      return;
    }

    const userMessage = inputText.trim();
    setInputText("");

    // Add user message to UI
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: userMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);

    setSending(true);
    try {
      // Call AI API
      const response = await apiClient.post("/ai/chat", {
        message: userMessage,
        course_id: parseInt(selectedCourseId),
        history: messages.map((m) => ({
          role: m.role === "ai" ? "assistant" : "student",
          text: m.text,
        })),
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: response.data.message || "I couldn't generate a response. Please try again.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error: any) {
      console.error("Error sending message:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to get AI response. Please try again.";
      toast(errorMsg, "error");
    } finally {
      setSending(false);
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
    <div className="max-w-4xl mx-auto h-[700px] flex flex-col">
      <div className="mb-6">
        <h1 className="text-4xl font-extrabold text-primary tracking-tight mb-2">AI Tutor</h1>
        <p className="text-on-surface-variant font-body">
          Get instant help with your courses. Ask questions, practice concepts, and learn at your own pace.
        </p>
      </div>

      {/* Course Selector */}
      <div className="mb-4">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2 block">
          Select a Course
        </label>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full bg-surface-container-high text-primary px-4 py-2 rounded-lg font-bold text-sm outline-none cursor-pointer"
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.instructor?.name ? `— ${c.instructor.name}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Chat Container */}
      <div className="flex-1 bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-sm px-4 py-3 rounded-lg ${
                  msg.role === "user"
                    ? "bg-primary text-white rounded-br-none"
                    : "bg-slate-100 text-slate-800 rounded-bl-none"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.role === "user" ? "text-blue-100" : "text-slate-500"}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-slate-100 text-slate-800 px-4 py-3 rounded-lg rounded-bl-none">
                <p className="text-sm">AI is thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-100 p-4 bg-slate-50">
          <div className="flex gap-3">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask me anything about your courses... (Shift+Enter for new line)"
              className="flex-1 px-4 py-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary resize-none"
              rows={2}
              disabled={sending || !selectedCourseId}
            />
            <button
              onClick={handleSendMessage}
              disabled={sending || !inputText.trim() || !selectedCourseId}
              className="bg-primary text-white px-4 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
            >
              {sending ? (
                <span className="material-symbols-outlined animate-spin text-sm">hourglass_bottom</span>
              ) : (
                <span className="material-symbols-outlined text-sm">send</span>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {inputText.length}/2000 characters
          </p>
        </div>
      </div>
    </div>
  );
}
