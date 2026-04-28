import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { useToast } from "../../components/shared/Toast";
import apiClient from "~/services/api";

export function meta() {
  return [{ title: "ERUDITE - Course Editor" }];
}

const AI_GENERATED_MODULES: Record<string, { title: string; sections: string[] }> = {
  "pooling layers": {
    title: "Pooling Layers & Spatial Reduction",
    sections: [
      "What is Pooling? Max vs Average Pooling",
      "Stride and Kernel Size Parameters",
      "Global Average Pooling in Modern Architectures",
      "Hands-on: Building a Pooling Pipeline in PyTorch",
    ],
  },
  "attention mechanisms": {
    title: "Attention Mechanisms in Deep Learning",
    sections: [
      "The Intuition Behind Attention",
      "Scaled Dot-Product Attention",
      "Multi-Head Attention Explained",
      "Self-Attention vs Cross-Attention",
      "Lab: Implementing Attention from Scratch",
    ],
  },
};

const AI_QUIZ_BANK = [
  "What is the primary advantage of max pooling over average pooling?",
  "Explain the vanishing gradient problem in 2 sentences.",
  "True or False: A 1x1 convolution can change the depth of a feature map.",
  "Describe the difference between valid and same padding.",
  "What role does the softmax function play in attention mechanisms?",
];

export default function CourseEditor() {
  const { courseId } = useParams();
  const { toast } = useToast();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [genOpen, setGenOpen] = useState(false);
  const [genPrompt, setGenPrompt] = useState("");
  const [genResult, setGenResult] = useState<{ title: string; sections: string[] } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<string[]>([]);

  // Curriculum State
  const [modules, setModules] = useState<any[]>([]);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState("");
  const [editingModuleType, setEditingModuleType] = useState("video");
  const [editingModuleDescription, setEditingModuleDescription] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        if (!courseId) return;
        const res = await apiClient.get(`/courses/${courseId}`);
        setCourse(res.data);
        setModules(res.data.modules || []);
      } catch (error) {
        console.error('Failed to fetch course:', error);
        toast('Failed to load course', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  async function moveModule(index: number, direction: 'up' | 'down') {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === modules.length - 1) return;

    const newModules = [...modules];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newModules[index];
    newModules[index] = newModules[swapIndex];
    newModules[swapIndex] = temp;

    // Update order in API
    try {
      const module = newModules[index];
      await apiClient.put(`/modules/${module.id}`, { order: index });

      const moduleAtSwap = newModules[swapIndex];
      await apiClient.put(`/modules/${moduleAtSwap.id}`, { order: swapIndex });

      setModules(newModules);
    } catch (error) {
      console.error('Failed to reorder modules:', error);
      toast('Failed to reorder modules', 'error');
    }
  }

  function handleAddGeneratedModule() {
    if (!genResult) return;
    setModules(prev => [
      ...prev,
      { id: prev.length + 1, title: genResult.title, status: "Draft" }
    ]);
    toast(`"${genResult.title}" added to curriculum`);
    setGenOpen(false);
    setGenPrompt("");
    setGenResult(null);
  }

  function handleGenerate() {
    if (!genPrompt.trim()) return;
    setGenerating(true);
    setGenResult(null);

    setTimeout(() => {
      const lower = genPrompt.toLowerCase();
      let result = AI_GENERATED_MODULES["pooling layers"]; // default
      for (const [key, val] of Object.entries(AI_GENERATED_MODULES)) {
        if (lower.includes(key)) { result = val; break; }
      }
      // Add some dynamic flavor
      if (!Object.keys(AI_GENERATED_MODULES).some(k => lower.includes(k))) {
        result = {
          title: genPrompt.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          sections: [
            `Introduction to ${genPrompt.trim()}`,
            `Core Concepts and Theoretical Framework`,
            `Practical Applications & Case Studies`,
            `Hands-on Lab: Implementation Exercise`,
            `Assessment: Quiz & Reflection`,
          ],
        };
      }
      setGenResult(result);
      setGenerating(false);
    }, 1500);
  }

  function handleGenerateQuiz() {
    setQuizOpen(true);
    const shuffled = [...AI_QUIZ_BANK].sort(() => Math.random() - 0.5);
    setQuizQuestions(shuffled.slice(0, 3));
  }

  async function handlePublish() {
    if (!courseId) return;
    try {
      const newStatus = course.status === 'draft' ? 'active' : course.status;
      await apiClient.put(`/courses/${courseId}`, {
        name: course?.name,
        description: course?.description,
        capacity: course?.capacity,
        status: newStatus
      });
      setCourse(prev => ({ ...prev, status: newStatus }));
      toast('Course updated successfully', 'success');
    } catch (error) {
      console.error('Failed to publish course:', error);
      toast('Failed to update course', 'error');
    }
  }

  async function handleAddModule() {
    if (!courseId) return;
    try {
      const newModule = {
        title: `New Module ${modules.length + 1}`,
        type: 'video',
        order: modules.length,
      };
      const res = await apiClient.post(`/courses/${courseId}/modules`, newModule);
      setModules([...modules, res.data]);
      toast('Module added to curriculum');
    } catch (error) {
      console.error('Failed to add module:', error);
      toast('Failed to add module', 'error');
    }
  }

  function handleEditModule(module: any) {
    setEditingModule(module);
    setEditingModuleTitle(module.title);
    setEditingModuleType(module.type || 'video');
    setEditingModuleDescription(module.description || '');
  }

  async function handleSaveModuleEdit() {
    if (!editingModule) return;
    try {
      await apiClient.put(`/modules/${editingModule.id}`, {
        title: editingModuleTitle,
        type: editingModuleType,
        description: editingModuleDescription
      });
      setModules(prev => prev.map(m =>
        m.id === editingModule.id
          ? { ...m, title: editingModuleTitle, type: editingModuleType, description: editingModuleDescription }
          : m
      ));
      toast(`Module updated: "${editingModuleTitle}"`, 'success');
      setEditingModule(null);
    } catch (error) {
      console.error('Failed to update module:', error);
      toast('Failed to update module', 'error');
    }
  }

  return (
    <div>
      {loading && <div className="text-center py-8">Loading...</div>}
      {!loading && course && (
      <>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <a href="/instructor/my-courses" className="text-slate-400 hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
            </a>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{courseId || "COURSE"}</span>
            <span className="text-xs font-bold text-secondary uppercase tracking-widest">Course Editor</span>
          </div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight mb-2">{course?.name}</h1>
          <p className="text-on-surface-variant font-body">Manage curriculum content, grading rubrics, and student access.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleGenerateQuiz} className="bg-surface-container-high text-primary px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-surface-container-highest transition-colors flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">quiz</span>
            AI Generate Quiz
          </button>
          <button onClick={handlePublish} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">publish</span>
            Publish Updates
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Course Overview */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-8">
            <h3 className="text-lg font-bold text-primary mb-6">Course Overview</h3>
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">Description</label>
                <p className="text-sm text-slate-700 mt-2 leading-relaxed">{course?.description || 'No description provided.'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">Start Date</label>
                  <p className="text-sm text-slate-700 mt-2 font-bold">{course?.start_date ? new Date(course.start_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">End Date</label>
                  <p className="text-sm text-slate-700 mt-2 font-bold">{course?.end_date ? new Date(course.end_date).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">Capacity</label>
                  <p className="text-lg font-black text-primary mt-2">{course?.capacity || 0}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">Enrolled</label>
                  <p className="text-lg font-black text-secondary mt-2">{course?.enrollments?.length || 0}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">Status</label>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                    course?.status === 'active' ? 'bg-green-100 text-green-700' : 
                    course?.status === 'draft' ? 'bg-amber-100 text-amber-700' : 
                    'bg-slate-100 text-slate-700'
                  }`}>{course?.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enrolled Students */}
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-8">
            <h3 className="text-lg font-bold text-primary mb-6">Enrolled Students ({course?.enrollments?.length || 0})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {course?.enrollments && course.enrollments.length > 0 ? (
                course.enrollments.map((enrollment: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-secondary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{enrollment.user?.name?.charAt(0) || '?'}</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">{enrollment.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{enrollment.user?.email || 'N/A'}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      enrollment.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                    }`}>{enrollment.status}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No students enrolled yet.</p>
              )}
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-primary">Curriculum Modules</h3>
              <button onClick={handleAddModule} className="text-secondary text-sm font-bold flex items-center gap-1 hover:underline cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">add</span> Add Module
              </button>
            </div>
            <div className="space-y-3">
              {modules.map((m, index) => (
                <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-secondary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col text-slate-300">
                      <button onClick={() => moveModule(index, 'up')} disabled={index === 0} className="hover:text-primary disabled:opacity-30 cursor-pointer h-4 flex items-center"><span className="material-symbols-outlined text-[18px]">expand_less</span></button>
                      <button onClick={() => moveModule(index, 'down')} disabled={index === modules.length - 1} className="hover:text-primary disabled:opacity-30 cursor-pointer h-4 flex items-center"><span className="material-symbols-outlined text-[18px]">expand_more</span></button>
                    </div>
                    <span className="text-sm font-bold text-slate-500">Module {index + 1}</span>
                    <span className="font-bold text-primary">{m.title}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${m.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-600'}`}>{m.status}</span>
                    <button onClick={() => handleEditModule(m)} className="text-slate-400 hover:text-primary transition-colors cursor-pointer"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Generated Quiz Panel */}
          {quizOpen && (
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border-2 border-secondary/30 p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">auto_awesome</span>
                  <h3 className="text-lg font-bold text-primary">AI-Generated Quiz</h3>
                </div>
                <button onClick={() => setQuizOpen(false)} className="text-slate-400 hover:text-primary cursor-pointer">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <div className="space-y-4">
                {quizQuestions.map((q, i) => (
                  <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">Question {i + 1}</div>
                    <p className="text-sm font-bold text-primary">{q}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => { 
                  setModules(prev => [...prev, { id: prev.length + 1, title: "Knowledge Check: " + modules[modules.length - 1]?.title, status: "Draft" }]);
                  toast("Quiz added to curriculum"); 
                  setQuizOpen(false); 
                }} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors cursor-pointer flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">check</span> Add to Curriculum
                </button>
                <button onClick={handleGenerateQuiz} className="bg-surface-container-high text-primary px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-surface-container-highest transition-colors cursor-pointer flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">refresh</span> Regenerate
                </button>
              </div>
            </div>
          )}
          
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-8">
             <h3 className="text-lg font-bold text-primary mb-6">Course Settings</h3>
             <div className="space-y-4">
               <div className="flex flex-col gap-1.5">
                 <label className="text-sm font-bold text-slate-600">Syllabus Overview</label>
                 <textarea rows={4} className="bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/50 resize-none" defaultValue="This course provides an advanced look into neural networks..."></textarea>
               </div>
               <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <div>
                    <h4 className="font-bold text-primary text-sm">Prerequisite Enforcements</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Students must complete CS201 before enrolling.</p>
                  </div>
                  <div className="w-10 h-5 bg-secondary rounded-full relative shadow-inner">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                  </div>
               </div>
             </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-6">Course Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <span className="text-sm text-slate-600 font-bold">Total Enrolled</span>
                <span className="text-lg font-black text-primary">{(course?.enrollments?.length || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <span className="text-sm text-slate-600 font-bold">Avg. Completion</span>
                <span className="text-lg font-black text-secondary">{course?.progress || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 font-bold">Rating</span>
                <span className="text-lg font-black text-primary flex items-center gap-1">4.8 <span className="material-symbols-outlined text-amber-400 text-[18px]">star</span></span>
              </div>
            </div>
          </div>

          {/* AI Content Generator */}
          <div className="bg-gradient-to-br from-primary to-blue-900 rounded-xl shadow-sm p-6 text-white relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary opacity-20 blur-3xl rounded-full"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-secondary animate-pulse">auto_awesome</span>
                <h3 className="text-sm font-bold text-blue-200 uppercase tracking-widest">AI Content Generator</h3>
              </div>

              {!genOpen ? (
                <>
                  <p className="text-sm text-blue-50 leading-relaxed mb-4">
                    "Module 3 (Convolutional Layers) is currently in Draft. Based on recent student feedback, I suggest expanding the section on pooling layers."
                  </p>
                  <button onClick={() => setGenOpen(true)} className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 rounded-lg text-sm transition-colors border border-white/20 cursor-pointer flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                    Generate Section
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <input
                    value={genPrompt}
                    onChange={(e) => setGenPrompt(e.target.value)}
                    placeholder="e.g., pooling layers, attention mechanisms..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-blue-200 outline-none focus:border-secondary"
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-2.5 rounded-lg text-sm transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">bolt</span>
                        Generate Module Outline
                      </>
                    )}
                  </button>

                  {genResult && (
                    <div className="bg-white/10 rounded-lg p-4 border border-white/20 mt-3">
                      <div className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">Generated Outline</div>
                      <h4 className="font-bold text-white mb-3">{genResult.title}</h4>
                      <ol className="space-y-2">
                        {genResult.sections.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-blue-50">
                            <span className="text-secondary font-bold text-xs mt-0.5">{i + 1}.</span>
                            {s}
                          </li>
                        ))}
                      </ol>
                      <button onClick={handleAddGeneratedModule} className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-lg text-sm transition-colors border border-white/20 cursor-pointer">
                        Add to Curriculum
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
      )}

      {/* Edit Module Modal */}
      {editingModule && (
        <div className="fixed inset-0 bg-black/40 z-[90] flex items-center justify-center p-4" onClick={() => setEditingModule(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-primary mb-6">Edit Module</h2>
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-600">Module Title</label>
                <input
                  value={editingModuleTitle}
                  onChange={(e) => setEditingModuleTitle(e.target.value)}
                  className="bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/50"
                  placeholder="e.g., Introduction to AI"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-600">Module Type</label>
                <select
                  value={editingModuleType}
                  onChange={(e) => setEditingModuleType(e.target.value)}
                  className="bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/50"
                >
                  <option value="video">Video Lecture</option>
                  <option value="quiz">Quiz</option>
                  <option value="assignment">Assignment</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-600">Description</label>
                <textarea
                  value={editingModuleDescription}
                  onChange={(e) => setEditingModuleDescription(e.target.value)}
                  rows={3}
                  className="bg-surface-container-low border-none rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-secondary/50 resize-none"
                  placeholder="Enter module description..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setEditingModule(null)}
                className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModuleEdit}
                className="px-6 py-2.5 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Save Module
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
