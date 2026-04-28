import { useState, useRef, useEffect } from "react";

interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
  time: string;
}

const AI_RESPONSES: Record<string, string> = {
  "backpropagation": "**Backpropagation** is how neural networks learn from mistakes. Think of it like this:\n\n1. The network makes a prediction\n2. We measure how wrong it was (the *loss*)\n3. We trace backward through each layer to figure out which weights caused the error\n4. We nudge those weights slightly to reduce the error\n\nThe key math is the **chain rule** from calculus — it lets us compute how much each weight contributed to the final error. Would you like me to walk through a numerical example?",
  "neural": "A **neural network** is inspired by the human brain. It consists of layers of interconnected nodes (neurons). Each connection has a *weight*, and each neuron applies an *activation function* to decide whether to fire.\n\nThe 3 main types:\n- **Feedforward**: Data flows one direction (input → output)\n- **Convolutional (CNN)**: Specialized for images, uses sliding filters\n- **Recurrent (RNN)**: Has memory, great for sequences like text\n\nWhich type would you like to explore deeper?",
  "transformer": "**Transformers** revolutionized AI in 2017 with the paper \"Attention Is All You Need.\"\n\nThe key innovation is **self-attention**: instead of processing words one-by-one (like RNNs), transformers look at ALL words simultaneously and learn which ones are most relevant to each other.\n\nFor example, in \"The cat sat on the mat because *it* was tired\" — the transformer learns that \"it\" refers to \"cat\", not \"mat.\"\n\nThis parallelism makes transformers extremely fast to train. GPT, BERT, and LLaMA are all transformer-based.",
  "ethics": "**Synthetic Ethics** is a field examining the moral implications of AI systems. Key questions include:\n\n- If an AI causes harm, who is responsible — the developer, the user, or the AI itself?\n- Should AI systems have \"rights\" if they demonstrate consciousness?\n- How do we prevent algorithmic bias from reinforcing social inequalities?\n\nThe **trolley problem** gets particularly interesting when applied to autonomous vehicles. Would you like to discuss a specific ethical framework?",
  "quiz": "Here's a quick practice quiz on Neural Architecture:\n\n**Q1:** What is the primary purpose of an activation function?\na) To normalize inputs\nb) To introduce non-linearity\nc) To reduce overfitting\nd) To speed up training\n\n**Q2:** In a CNN, what does a pooling layer do?\na) Increases spatial dimensions\nb) Reduces spatial dimensions while retaining important features\nc) Adds more parameters\nd) Connects all neurons\n\nTake your time and tell me your answers! 🎯",
  "help": "I can help you with:\n\n🎓 **Explain concepts** — Ask me about any topic from your courses\n📝 **Practice quizzes** — Type \"quiz\" and I'll generate questions\n📖 **Summarize content** — Paste text and I'll summarize it\n💡 **Study tips** — I can suggest what to focus on next\n🔍 **Deep dives** — Ask me to go deeper on any topic\n\nWhat would you like to explore?",
};

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, response] of Object.entries(AI_RESPONSES)) {
    if (lower.includes(key)) return response;
  }
  if (lower.includes("hello") || lower.includes("hi")) {
    return "Hello! 👋 I'm your AI study companion. I have deep knowledge of all your enrolled courses. Ask me anything — from concept explanations to practice quizzes. Type **help** to see what I can do!";
  }
  if (lower.includes("thank")) {
    return "You're welcome! Remember, consistent practice is the key to mastery. Keep up your 14-day study streak! 🔥 Anything else you'd like to explore?";
  }
  return "That's a great question! Based on your current coursework, I'd recommend reviewing the related module in your Learning Room for a deeper understanding. I can also generate a practice quiz on this topic — just say \"quiz\"!\n\nAlternatively, try asking me about specific concepts like **backpropagation**, **transformers**, or **ethics**.";
}

function formatTime(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, role: "ai", text: "Hi Eleanor! 👋 I'm your AI tutor. I've analyzed your course progress — you're doing great in Philosophy but could use some help with Neural Architecture Module 3. What would you like to work on?", time: formatTime() },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  let msgId = useRef(1);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function send() {
    if (!input.trim()) return;
    const userMsg: Message = { id: msgId.current++, role: "user", text: input.trim(), time: formatTime() };
    setMessages((prev) => [...prev, userMsg]);
    const userInput = input.trim();
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const aiText = getAIResponse(userInput);
      const aiMsg: Message = { id: msgId.current++, role: "ai", text: aiText, time: formatTime() };
      setMessages((prev) => [...prev, aiMsg]);
      setTyping(false);
    }, 800 + Math.random() * 1200);
  }

  return (
    <>
      {/* Floating Orb Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-[80] w-14 h-14 rounded-full shadow-xl flex items-center justify-center cursor-pointer transition-all duration-300 ${
          open ? "bg-slate-700 rotate-45 scale-90" : "bg-gradient-to-tr from-primary to-secondary hover:scale-110 hover:shadow-2xl"
        }`}
      >
        <span className="material-symbols-outlined text-white text-2xl">
          {open ? "close" : "smart_toy"}
        </span>
        {!open && <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-[80] w-96 max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-[slideIn_0.3s_ease-out]">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-blue-800 p-5 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-lg">smart_toy</span>
              </div>
              <div>
                <div className="font-bold text-sm">ERUDITE AI Tutor</div>
                <div className="text-xs text-blue-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  Always available
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="ml-auto text-white hover:bg-white/20 rounded-full p-1.5 cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>

          {/* Messages Container - Scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-white rounded-br-md"
                    : "bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-md"
                }`}>
                  <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                  <div className={`text-[10px] mt-1.5 ${msg.role === "user" ? "text-blue-200" : "text-slate-400"}`}>{msg.time}</div>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-700 shadow-sm border border-slate-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef}></div>
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100 shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-slate-50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-secondary/30 border border-slate-100"
              />
              <button type="submit" className="bg-primary hover:bg-primary/90 text-white w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors shrink-0">
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </form>
            <div className="text-[10px] text-slate-400 mt-2 text-center">AI responses are simulated • Try: "backpropagation", "quiz", "help"</div>
          </div>
        </div>
      )}
    </>
  );
}
