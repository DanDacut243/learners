import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useToast } from "../../components/shared/Toast";
import { messagesApi } from "~/services/api";

export function meta() {
  return [{ title: "ERUDITE - Inbox" }];
}

export default function InstructorInbox() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyContent, setReplyContent] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const autoRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll messages
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedMessage?.replies]);

  // Setup auto-refresh interval
  useEffect(() => {
    if (!autoRefreshEnabled) {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
      return;
    }

    // Fetch immediately, then every 30 seconds
    fetchMessages();

    autoRefreshIntervalRef.current = setInterval(() => {
      fetchMessages();
      setLastRefreshed(new Date());
    }, 30000);

    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, [autoRefreshEnabled]);

  useEffect(() => {
    fetchMessages();
  }, []);

  async function fetchMessages() {
    try {
      const response = await messagesApi.getAll();
      const messagesData = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      // Filter to only messages where current user is the recipient (student replies)
      // Sort by newest first
      const sorted = messagesData.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setMessages(sorted);
      setLoading(false);

      // If a message is selected, update it in the list
      if (selectedMessage) {
        const updated = sorted.find(m => m.id === selectedMessage.id);
        if (updated) {
          setSelectedMessage(updated);
        }
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      toast("Failed to load messages", "error");
      setLoading(false);
    }
  }

  async function handleMarkAsRead(messageId: number, isRead: boolean) {
    if (!isRead) {
      try {
        await messagesApi.markAsRead(messageId);
        setMessages(prev =>
          prev.map(m =>
            m.id === messageId ? { ...m, is_read: true, read_at: new Date().toISOString() } : m
          )
        );
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(prev => ({
            ...prev,
            is_read: true,
            read_at: new Date().toISOString(),
          }));
        }
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }
  }

  async function handleSendReply() {
    if (!replyContent.trim()) {
      toast("Reply cannot be empty", "error");
      return;
    }

    if (!selectedMessage) return;

    setSendingReply(true);
    try {
      // Send reply back to student
      await messagesApi.sendToStudent(
        selectedMessage.sender_id,
        replyContent,
        selectedMessage.course_id
      );

      const recipientName = selectedMessage.sender?.name || "Student";
      toast(`Reply sent to ${recipientName} ✓`, "success");
      setReplyContent("");

      // Refresh messages to show reply
      await fetchMessages();
    } catch (error: any) {
      console.error("Error sending reply:", error);
      toast(`Failed to send reply: ${error.message}`, "error");
    } finally {
      setSendingReply(false);
    }
  }

  async function handleDeleteMessage(messageId: number) {
    if (confirm("Are you sure you want to delete this message?")) {
      try {
        await messagesApi.delete(messageId);
        toast("Message deleted", "success");
        setMessages(prev => prev.filter(m => m.id !== messageId));
        setSelectedMessage(null);
      } catch (error: any) {
        console.error("Error deleting message:", error);
        toast(`Failed to delete message: ${error.message}`, "error");
      }
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

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div className="max-w-7xl">
      <div className="mb-8 flex items-center gap-4 justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight mb-2">
            Messages & Inbox
          </h1>
          <p className="text-on-surface-variant font-body">
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}` : 'All messages read'}
          </p>
        </div>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 px-4 py-3 bg-slate-100 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefreshEnabled}
              onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm font-bold text-slate-600">Auto-Refresh (30s)</span>
          </label>
          {lastRefreshed && (
            <div className="px-4 py-3 text-xs text-slate-500">
              Last: {lastRefreshed.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 h-[600px]">
        {/* Messages List */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h2 className="text-lg font-bold text-primary">
              Messages ({messages.length})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {messages.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-30 block">
                  mail
                </span>
                <p>No messages yet</p>
                <p className="text-xs mt-2">Students will message you here</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    handleMarkAsRead(msg.id, msg.is_read);
                  }}
                  className={`p-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                    selectedMessage?.id === msg.id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                  } ${!msg.is_read ? "bg-blue-50" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-sm text-slate-800 truncate">
                          {msg.sender?.name || "Student"}
                        </p>
                        {!msg.is_read && (
                          <span className="bg-primary text-white rounded-full w-2 h-2 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{msg.content}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(msg.created_at).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        {selectedMessage ? (
          <div className="col-span-2 bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-sm text-slate-500">mail_receive</span>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">From</p>
                </div>
                <h3 className="text-lg font-bold text-primary">
                  {selectedMessage.sender?.name || "Student"}
                </h3>
                {selectedMessage.course && (
                  <p className="text-sm text-slate-500 mt-2">
                    <span className="font-semibold">Course:</span> {selectedMessage.course.name || "Course Message"}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  {new Date(selectedMessage.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDeleteMessage(selectedMessage.id)}
                className="text-slate-400 hover:text-red-600 transition-colors"
                title="Delete message"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>

            {/* Message Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-slate-800 whitespace-pre-wrap break-words">
                  {selectedMessage.content}
                </p>
              </div>

              {selectedMessage.read_at && (
                <p className="text-xs text-slate-500 mb-4">
                  ✓ Read on {new Date(selectedMessage.read_at).toLocaleString()}
                </p>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Reply Area */}
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <label className="block text-xs font-bold text-slate-600 mb-2">
                Send Reply to {selectedMessage.sender?.name}
              </label>
              <div className="flex gap-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                  placeholder="Type a reply... (Shift+Enter for new line)"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-primary resize-none"
                  rows={2}
                />
                <button
                  onClick={handleSendReply}
                  disabled={sendingReply || !replyContent.trim()}
                  className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                >
                  {sendingReply ? (
                    <span className="material-symbols-outlined animate-spin text-sm">
                      hourglass_bottom
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">send</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="col-span-2 bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-4 block">
                mail
              </span>
              <p className="text-slate-500">Select a message to read</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
