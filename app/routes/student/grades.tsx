import { useEffect, useState } from "react";
import { useToast } from "../../components/shared/Toast";
import apiClient from "~/services/api";

export function meta() {
  return [{ title: "ERUDITE - My Grades" }];
}

interface Grade {
  id: string;
  course: { id: string; name: string; instructor?: { name: string } };
  grade: string | number;
  created_at: string;
}

export default function StudentGrades() {
  const { toast } = useToast();
  const [semester, setSemester] = useState("Fall 2026");
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const response = await apiClient.get('/grades');
        const gradesData = Array.isArray(response.data) ? response.data : response.data.data || [];
        setGrades(gradesData);
      } catch (error) {
        console.error('Failed to fetch grades:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, []);

  // Calculate cumulative GPA from grades
  const getLetterFromNumeric = (score: number): string => {
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 60) return 'D';
    return 'F';
  };

  const getGradeLabel = (g: Grade): string => {
    if (typeof g.grade === 'number') return getLetterFromNumeric(g.grade);
    return String(g.grade);
  };

  const calculateGPA = () => {
    if (grades.length === 0) return 0;
    const gradeMap: { [key: string]: number } = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D': 1.0, 'F': 0.0
    };
    const total = grades.reduce((sum, g) => {
      const label = getGradeLabel(g);
      const gpa = gradeMap[label] || 0;
      return sum + gpa;
    }, 0);
    return (total / grades.length).toFixed(2);
  };

  const totalCredits = grades.length * 3;

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div>
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight mb-2">Academic Transcript</h1>
          <p className="text-on-surface-variant font-body">Review your academic performance, GPA, and course credits.</p>
        </div>
        <select 
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          className="bg-surface-container-high text-primary px-5 py-3 rounded-lg font-bold text-sm outline-none cursor-pointer"
        >
          <option value="Fall 2026">Fall 2026 (Current)</option>
          <option value="Spring 2026">Spring 2026</option>
          <option value="Fall 2025">Fall 2025</option>
        </select>
      </div>

      <div className="grid grid-cols-12 gap-8 mb-8">
        <div className="col-span-12 md:col-span-4 bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center text-center">
          <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Cumulative GPA</div>
          <div className="text-5xl font-black text-primary mb-2">{calculateGPA()}</div>
          <div className="text-sm font-bold text-green-600 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_upward</span>
            {grades.length > 0 ? `${grades.length} courses graded` : 'No grades yet'}
          </div>
        </div>
        
        <div className="col-span-12 md:col-span-4 bg-surface-container-lowest rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center text-center">
          <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Total Credits</div>
          <div className="text-5xl font-black text-secondary mb-2">{totalCredits}</div>
          <div className="text-sm font-bold text-slate-500 flex items-center gap-1">
            of 120 required for graduation
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 bg-primary rounded-xl shadow-sm p-6 flex flex-col items-center justify-center text-center relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-30 blur-2xl rounded-full -mr-10 -mt-10"></div>
          <div className="relative z-10">
             <div className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-2">Academic Standing</div>
             <div className="text-3xl font-black mb-2 flex items-center justify-center gap-2">
               <span className="material-symbols-outlined text-amber-300 text-3xl">workspace_premium</span>
               Dean's List
             </div>
             <div className="text-sm font-bold text-blue-100">
               Top 10% of Cohort
             </div>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden border border-slate-100">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-primary">{semester} Coursework</h3>
          <button onClick={() => toast("Transcript downloaded as PDF", "success")} className="text-sm font-bold text-secondary flex items-center gap-1 hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Download Official Transcript
          </button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Course</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Instructor</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Credits</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Grade</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {grades.map((g, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-primary">{g.course?.name}</div>
                  <div className="text-xs font-bold text-slate-400 mt-1">{g.course?.id}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{g.course?.instructor?.name || 'Instructor'}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-600">3</td>
                <td className="px-6 py-4">
                  <span className={`text-lg font-black ${(() => { const label = getGradeLabel(g); return label.startsWith('A') ? 'text-green-600' : label.startsWith('B') ? 'text-blue-600' : 'text-slate-400'; })()}`}>
                    {getGradeLabel(g)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
