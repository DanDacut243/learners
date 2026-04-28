import { useState, useEffect } from 'react';
import apiClient from '~/services/api';
import { useParams } from 'react-router';

interface LearningOutcome {
  id: number;
  title: string;
  description: string;
  bloom_level: string;
  order: number;
}

export default function LearningOutcomesPage() {
  const { courseId } = useParams();
  const [outcomes, setOutcomes] = useState<LearningOutcome[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', bloom_level: 'understand' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOutcomes();
  }, [courseId]);

  const fetchOutcomes = async () => {
    try {
      const res = await apiClient.get(`/courses/${courseId}/learning-outcomes`);
      setOutcomes(res.data);
    } catch (error) {
      console.error('Failed to fetch outcomes:', error);
    }
  };

  const handleAdd = async () => {
    if (!form.title || !form.description) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(`/courses/${courseId}/learning-outcomes`, form);
      setForm({ title: '', description: '', bloom_level: 'understand' });
      setShowModal(false);
      fetchOutcomes();
    } catch (error) {
      console.error('Failed to create outcome:', error);
      alert('Failed to create outcome');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Learning Outcomes</h1>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            + Add Outcome
          </button>
        </div>

        <div className="grid gap-4">
          {outcomes.map(outcome => (
            <div key={outcome.id} className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-white">{outcome.title}</h3>
                  <p className="text-gray-300 text-sm mt-2">{outcome.description}</p>
                </div>
                <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap">
                  {outcome.bloom_level}
                </span>
              </div>
            </div>
          ))}
        </div>

        {outcomes.length === 0 && (
          <p className="text-gray-400 text-center py-8">No learning outcomes yet</p>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Add Learning Outcome</h3>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) => setForm({...form, title: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-gray-400"
                />

                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-gray-400 h-24"
                />

                <select 
                  value={form.bloom_level}
                  onChange={(e) => setForm({...form, bloom_level: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
                >
                  <option value="remember">Remember</option>
                  <option value="understand">Understand</option>
                  <option value="apply">Apply</option>
                  <option value="analyze">Analyze</option>
                  <option value="evaluate">Evaluate</option>
                  <option value="create">Create</option>
                </select>
              </div>

              <div className="flex gap-2 mt-6">
                <button 
                  onClick={handleAdd}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded py-2 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white rounded py-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
