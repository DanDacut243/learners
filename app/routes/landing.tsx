import type { Route } from "./+types/landing";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ERUDITE - The Intelligent Learning Platform" },
    { name: "description", content: "Empower your institution with next-generation academic management." },
  ];
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface-container-lowest font-sans selection:bg-secondary/30">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-surface-container-lowest/80 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-2xl">auto_awesome</span>
            </div>
            <span className="font-manrope text-2xl font-black text-primary tracking-tight">ERUDITE.</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-semibold text-sm text-slate-600">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#platform" className="hover:text-primary transition-colors">Platform</a>
            <a href="#testimonials" className="hover:text-primary transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="font-bold text-sm text-primary hover:text-secondary transition-colors">Sign In</a>
            <a href="/login" className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 hover:shadow-md transition-all cursor-pointer">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden bg-gradient-to-b from-surface-container-low to-surface-container-lowest">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-secondary opacity-10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary opacity-5 rounded-full blur-[80px]"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-800 text-xs font-bold uppercase tracking-widest mb-8 animate-[slideIn_0.5s_ease-out]">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            Erudite OS 2.0 is now live globally
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-primary tracking-tight leading-[1.1] mb-6 animate-[slideIn_0.7s_ease-out]">
            The intelligent operating <br className="hidden md:block" />
            system for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">modern education.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10 animate-[slideIn_0.9s_ease-out]">
            Unify your academic ecosystem. ERUDITE brings AI-driven analytics, dynamic curriculum management, and immersive learning experiences into one beautiful platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-[slideIn_1.1s_ease-out]">
            <a href="/login" className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2">
              Start Your Free Trial
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </a>
            <a href="#features" className="w-full sm:w-auto bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-colors text-center flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-lg">play_circle</span>
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-10 border-y border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Trusted by leading universities globally</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Mock University Logos using text for structural demonstration */}
            <div className="text-xl font-black font-manrope">Stanford</div>
            <div className="text-xl font-black font-manrope">MIT</div>
            <div className="text-xl font-black font-manrope">Oxford</div>
            <div className="text-xl font-black font-manrope">Berkeley</div>
            <div className="text-xl font-black font-manrope">Cambridge</div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-24 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-sm font-bold text-secondary uppercase tracking-widest mb-3">Core Platform</h2>
            <h3 className="text-4xl font-extrabold text-primary tracking-tight mb-6">Everything you need to scale learning.</h3>
            <p className="text-slate-500 text-lg">We've reimagined every aspect of the Learning Management System to be faster, smarter, and infinitely more intuitive.</p>
          </div>

          {/* Feature 1: Admin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
            <div className="order-2 md:order-1 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-secondary/20 to-primary/5 rounded-3xl transform -rotate-3 scale-105"></div>
              <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-slate-800">
                <div className="bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-slate-700">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="ml-4 text-xs text-slate-400 font-mono">admin-dashboard.tsx</div>
                </div>
                <div className="p-6">
                  {/* Mock Dashboard UI */}
                  <div className="flex gap-4 mb-6">
                    <div className="w-1/3 h-20 bg-slate-800 rounded-lg animate-pulse"></div>
                    <div className="w-1/3 h-20 bg-slate-800 rounded-lg animate-pulse"></div>
                    <div className="w-1/3 h-20 bg-secondary/20 border border-secondary/30 rounded-lg"></div>
                  </div>
                  <div className="h-40 bg-slate-800 rounded-lg"></div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-2xl">insights</span>
              </div>
              <h3 className="text-3xl font-bold text-primary mb-4">Command your institution with real-time analytics.</h3>
              <p className="text-slate-500 text-lg leading-relaxed mb-6">
                Administrators get a god's-eye view of campus health. Track enrollment surges, identify at-risk demographics, and manage academic catalogs instantly.
              </p>
              <ul className="space-y-3">
                {['Live enrollment tracking', 'Predictive risk modeling', 'Granular role-based access'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600 font-medium">
                    <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature 2: Instructor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-2xl">auto_fix_high</span>
              </div>
              <h3 className="text-3xl font-bold text-primary mb-4">AI-powered course authoring for educators.</h3>
              <p className="text-slate-500 text-lg leading-relaxed mb-6">
                Instructors can generate module outlines, draft quizzes, and identify struggling students before they fail, all with built-in AI assistants.
              </p>
              <ul className="space-y-3">
                {['Drag-and-drop syllabus builder', 'AI content generation', 'Automated grading workflows'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600 font-medium">
                    <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
               <div className="absolute inset-0 bg-gradient-to-tl from-green-500/10 to-primary/5 rounded-3xl transform rotate-3 scale-105"></div>
               <div className="bg-white rounded-2xl shadow-xl overflow-hidden relative z-10 border border-slate-100 p-8">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                    <div className="font-bold text-primary">Module 3: Neural Networks</div>
                    <span className="text-xs font-bold text-white bg-green-500 px-3 py-1 rounded-full">Published</span>
                  </div>
                  <div className="space-y-4">
                    <div className="h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center px-4">
                       <span className="material-symbols-outlined text-slate-300 mr-2">drag_indicator</span>
                       <div className="w-1/2 h-2 bg-slate-200 rounded"></div>
                    </div>
                    <div className="h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center px-4">
                       <span className="material-symbols-outlined text-slate-300 mr-2">drag_indicator</span>
                       <div className="w-2/3 h-2 bg-slate-200 rounded"></div>
                    </div>
                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 flex items-start gap-3 mt-6">
                      <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
                      <div>
                        <div className="text-sm font-bold text-primary mb-1">AI Suggestion</div>
                        <div className="text-xs text-slate-600">Consider adding a quiz here to reinforce learning.</div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Feature 3: Student */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-primary/5 rounded-3xl transform -rotate-2 scale-105"></div>
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden relative z-10 border border-slate-100">
                <div className="aspect-video bg-slate-900 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center cursor-pointer">
                      <span className="material-symbols-outlined text-white text-3xl">play_arrow</span>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs font-mono px-2 py-1 rounded">14:02</div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-primary">Lecture 4: Quantum Logic</h4>
                    <span className="text-xs font-bold text-secondary">45% Complete</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="w-[45%] h-full bg-secondary"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-2xl">school</span>
              </div>
              <h3 className="text-3xl font-bold text-primary mb-4">Immersive, distraction-free learning.</h3>
              <p className="text-slate-500 text-lg leading-relaxed mb-6">
                Students get a beautiful interface that actually encourages focus. With the integrated AI Tutor, help is always just one click away.
              </p>
              <ul className="space-y-3">
                {['Cinematic video player', '24/7 AI conversational tutor', 'Smart study recommendations'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600 font-medium">
                    <span className="material-symbols-outlined text-secondary text-sm">check_circle</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-primary text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary opacity-20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">Loved by educators worldwide.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: "ERUDITE completely transformed how we deliver online learning. The AI generation tools save our faculty hundreds of hours a semester.", author: "Dr. Sarah Jenkins", role: "Dean of Sciences, Stanford" },
              { text: "The analytics dashboard is a game changer. We can instantly spot students who are struggling and intervene before midterms.", author: "Marcus Thorne", role: "Provost, MIT" },
              { text: "As a student, the interface is gorgeous. The AI tutor actually helped me pass Calculus when office hours were booked.", author: "Eleanor Vance", role: "Student, Class of '26" }
            ].map((t, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/10">
                <div className="flex gap-1 mb-6">
                  {[1,2,3,4,5].map(star => <span key={star} className="material-symbols-outlined text-amber-400 text-sm">star</span>)}
                </div>
                <p className="text-blue-50 text-lg leading-relaxed mb-8">"{t.text}"</p>
                <div>
                  <div className="font-bold text-white">{t.author}</div>
                  <div className="text-sm text-blue-300">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="bg-white border-t border-slate-100">
        <div className="py-24 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <span className="material-symbols-outlined text-primary text-3xl">rocket_launch</span>
            </div>
            <h2 className="text-4xl font-extrabold text-primary tracking-tight mb-6">Ready to elevate your institution?</h2>
            <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto">Join the next generation of academic excellence. Get started with ERUDITE today.</p>
            <div className="flex justify-center gap-4">
              <a href="/login" className="bg-primary text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 transition-all text-center inline-flex items-center gap-2">
                Sign In to Platform
                <span className="material-symbols-outlined text-lg">login</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-100 py-8 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[12px]">auto_awesome</span>
              </div>
              <span className="font-manrope font-black text-primary">ERUDITE.</span>
              <span className="ml-2">&copy; {new Date().getFullYear()} All rights reserved.</span>
            </div>
            <div className="flex gap-8">
              <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="mailto:support@erudite.edu" className="hover:text-primary transition-colors">Contact Sales</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
