import { useState, useEffect } from 'react';
import apiClient from '~/services/api';
import { useParams } from 'react-router';

interface Competency {
  id: number;
  learning_outcome: { title: string; bloom_level: string };
  mastery_level: number;
  attempts: number;
}

export default function CompetenciesPage() {
  const { courseId } = useParams();
  const [data, setData] = useState<{ competencies: Competency[], overall_mastery: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompetencies();
  }, [courseId]);

  const fetchCompetencies = async () => {
    try {
      const res = await apiClient.get(`/courses/${courseId}/student-competencies`);
      setData(res.data);
    } catch (error) {
      console.error('Failed to fetch competencies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-white text-center py-8">Loading...</div>;
  if (!data || data.competencies.length === 0) {
    return <div className="text-gray-300 text-center py-8">No competencies yet. Complete quizzes to get started!</div>;
  }

  const getMasteryColor = (level: number) => {
    if (level >= 90) return 'bg-green-500';
    if (level >= 70) return 'bg-yellow-500';
    if (level >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Your Competencies</h1>

        {/* Overall Progress */}
        <div className="bg-slate-700 rounded-lg p-6 mb-8">
          <p className="text-gray-300 mb-3">Overall Mastery</p>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-slate-600 rounded-full h-4">
                <div 
                  className={`h-4 ${getMasteryColor(data.overall_mastery)} rounded-full transition-all`}
                  style={{ width: `${data.overall_mastery}%` }}
                />
              </div>
            </div>
            <span className="text-3xl font-bold text-blue-400">{Math.round(data.overall_mastery)}%</span>
          </div>
        </div>

        {/* Individual Competencies */}
        <div className="space-y-4">
          {data.competencies.map(comp => (
            <div key={comp.id} className="bg-slate-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-white text-lg">{comp.learning_outcome.title}</h3>
                  <p className="text-gray-400 text-sm">Attempts: {comp.attempts}</p>
                </div>
                <span className="text-2xl font-bold text-blue-400">{comp.mastery_level}%</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-3">
                <div 
                  className={`h-3 ${getMasteryColor(comp.mastery_level)} rounded-full transition-all`}
                  style={{ width: `${comp.mastery_level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
