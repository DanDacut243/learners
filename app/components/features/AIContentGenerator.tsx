import React, { useState } from 'react';
import { apiClient } from '../services/api';
import { toast } from 'react-hot-toast';

interface Module {
  title: string;
  objectives: string[];
}

interface AIContentProps {
  courseId: string;
  courseName: string;
}

export default function AIContentGenerator({ courseId, courseName }: AIContentProps) {
  const [activeTab, setActiveTab] = useState<'outline' | 'outcomes' | 'rubric'>('outline');
  const [loading, setLoading] = useState(false);

  // Course Outline State
  const [courseTitle, setCourseTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [numModules, setNumModules] = useState(5);
  const [outline, setOutline] = useState<{ modules: Module[] } | null>(null);

  // Learning Outcomes State
  const [bloomLevel, setBloomLevel] = useState('Understand');
  const [outcomes, setOutcomes] = useState<any>(null);

  // Rubric State
  const [assignmentType, setAssignmentType] = useState('essay');
  const [skillLevel, setSkillLevel] = useState('intermediate');
  const [rubric, setRubric] = useState<any>(null);

  const generateCourseOutline = async () => {
    if (!courseTitle.trim() || !topic.trim()) {
      toast.error('Please fill in course title and topic');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/api/ai/content/generate-course-outline', {
        course_title: courseTitle,
        topic: topic,
        num_modules: numModules,
      });

      setOutline(response.data.outline);
      toast.success('Course outline generated successfully!');
    } catch (error: any) {
      toast.error('Failed to generate course outline');
      console.error('Outline error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateLearningOutcomes = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/api/ai/content/generate-learning-outcomes', {
        course_id: courseId,
        bloom_level: bloomLevel,
      });

      setOutcomes(response.data);
      toast.success('Learning outcomes generated!');
    } catch (error: any) {
      toast.error('Failed to generate learning outcomes');
      console.error('Outcomes error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRubric = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/api/ai/content/rubric-generation', {
        course_id: courseId,
        assignment_type: assignmentType,
        skill_level: skillLevel,
      });

      setRubric(response.data);
      toast.success('Rubric generated successfully!');
    } catch (error: any) {
      toast.error('Failed to generate rubric');
      console.error('Rubric error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">✨</span> AI Content Generator
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          {courseName} - Generate course materials, outcomes, and grading rubrics instantly
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-800 border border-slate-700 rounded-lg p-2">
        {(['outline', 'outcomes', 'rubric'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 rounded font-medium text-sm transition ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab === 'outline' && '📚 Course Outline'}
            {tab === 'outcomes' && '🎯 Learning Outcomes'}
            {tab === 'rubric' && '📋 Rubric'}
          </button>
        ))}
      </div>

      {/* Course Outline Tab */}
      {activeTab === 'outline' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Course Title</label>
              <input
                type="text"
                placeholder="E.g., Web Development Fundamentals"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Topic</label>
              <input
                type="text"
                placeholder="E.g., Building Modern Web Applications"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Number of Modules: {numModules}
            </label>
            <input
              type="range"
              min="2"
              max="20"
              value={numModules}
              onChange={(e) => setNumModules(parseInt(e.target.value))}
              className="w-full"
              disabled={loading}
            />
          </div>

          <button
            onClick={generateCourseOutline}
            disabled={loading || !courseTitle.trim() || !topic.trim()}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? '🔄 Generating...' : '✨ Generate Outline'}
          </button>

          {outline && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-white">📚 Generated Course Outline</h4>
              {outline.modules?.map((module, idx) => (
                <div key={idx} className="bg-slate-700 rounded-lg p-3">
                  <p className="font-medium text-white">Module {idx + 1}: {module.title}</p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-300">
                    {module.objectives?.map((obj, objIdx) => (
                      <li key={objIdx} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Learning Outcomes Tab */}
      {activeTab === 'outcomes' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Bloom's Taxonomy Level</label>
            <select
              value={bloomLevel}
              onChange={(e) => setBloomLevel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              disabled={loading}
            >
              <option>Remember</option>
              <option>Understand</option>
              <option>Apply</option>
              <option>Analyze</option>
              <option>Evaluate</option>
              <option>Create</option>
            </select>
          </div>

          <button
            onClick={generateLearningOutcomes}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? '🔄 Generating...' : '🎯 Generate Outcomes'}
          </button>

          {outcomes && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-white">🎯 Learning Outcomes ({bloomLevel})</h4>
              {outcomes.outcomes?.map((outcome: any, idx: number) => (
                <div key={idx} className="bg-slate-700 rounded-lg p-3">
                  <p className="font-medium text-white">{outcome.title}</p>
                  <p className="text-sm text-slate-300 mt-1">{outcome.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rubric Tab */}
      {activeTab === 'rubric' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Assignment Type</label>
              <select
                value={assignmentType}
                onChange={(e) => setAssignmentType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                disabled={loading}
              >
                <option value="essay">Essay</option>
                <option value="project">Project</option>
                <option value="presentation">Presentation</option>
                <option value="code">Code</option>
                <option value="discussion">Discussion</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Skill Level</label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
                disabled={loading}
              >
                <option value="introductory">Introductory</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <button
            onClick={generateRubric}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? '🔄 Generating...' : '📋 Generate Rubric'}
          </button>

          {rubric && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-white">📋 Grading Rubric</h4>
              {rubric.rubric?.criteria?.map((criterion: any, idx: number) => (
                <div key={idx} className="bg-slate-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-white">{criterion.name}</p>
                    <span className="text-sm text-yellow-400">{criterion.points} pts</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p className="text-green-400">✓ Excellent: {criterion.descriptors?.excellent}</p>
                    <p className="text-blue-400">• Good: {criterion.descriptors?.good}</p>
                    <p className="text-orange-400">~ Fair: {criterion.descriptors?.fair}</p>
                    <p className="text-red-400">✗ Poor: {criterion.descriptors?.poor}</p>
                  </div>
                </div>
              ))}
              <div className="bg-blue-600/20 border border-blue-600/50 rounded-lg p-3 mt-3">
                <p className="text-white font-medium">Total Points: {rubric.rubric?.total_points}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
