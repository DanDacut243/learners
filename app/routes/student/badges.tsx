import { useState, useEffect } from 'react';
import apiClient from '~/services/api';
import { useAuth } from '~/context/AuthContext';

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  earned_at?: string;
}

const AVAILABLE_BADGES: Badge[] = [
  {
    id: 1,
    name: 'First Assignment',
    description: 'Submit your first assignment',
    icon: '🎉',
    requirement: 'Submit 1 assignment',
  },
  {
    id: 2,
    name: 'Perfect Score',
    description: 'Achieve 100% on an assignment',
    icon: '💯',
    requirement: 'Score 100% on assignment',
  },
  {
    id: 3,
    name: 'Quick Learner',
    description: 'Achieve 90%+ mastery in learning outcome',
    icon: '⚡',
    requirement: '90%+ mastery',
  },
  {
    id: 4,
    name: 'Master',
    description: 'Achieve 95%+ mastery in all outcomes',
    icon: '🏆',
    requirement: '95%+ avg mastery',
  },
  {
    id: 5,
    name: 'Diligent',
    description: 'Submit 5 assignments on time',
    icon: '📝',
    requirement: '5 on-time submissions',
  },
  {
    id: 6,
    name: 'Engaged',
    description: 'Complete all assignments in a course',
    icon: '✨',
    requirement: 'Complete all assignments',
  },
];

export function meta() {
  return [{ title: 'ERUDITE - Badges' }];
}

export default function StudentBadges() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      // In a real scenario, this would fetch from the API
      // const res = await apiClient.get(`/users/${user?.id}/badges`);
      // For now, simulate earned badges
      const earnedIds = [1, 3, 5]; // Simulate some earned badges
      const earnedBadges = AVAILABLE_BADGES.map((b) => ({
        ...b,
        earned_at: earnedIds.includes(b.id) ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      }));
      setBadges(earnedBadges);
    } catch (error) {
      console.error('Failed to fetch badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const earnedCount = badges.filter((b) => b.earned_at).length;
  const progressPercentage = Math.round((earnedCount / badges.length) * 100);

  if (loading) {
    return <div className="text-center py-8 text-slate-400">Loading badges...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-white mb-2">🏅 Badges</h1>
        <p className="text-slate-400">Unlock achievements as you progress</p>
      </div>

      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-6 border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Your Progress</h2>
          <span className="text-2xl font-bold text-blue-400">
            {earnedCount}/{badges.length}
          </span>
        </div>
        <div className="w-full bg-slate-600 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-400 h-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <p className="text-sm text-slate-400 mt-2">
          {progressPercentage}% complete • {AVAILABLE_BADGES.length - earnedCount} badge{AVAILABLE_BADGES.length - earnedCount !== 1 ? 's' : ''} to unlock
        </p>
      </div>

      {/* Badges Grid */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Available Badges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`relative p-6 rounded-lg border transition ${
                badge.earned_at
                  ? 'bg-gradient-to-br from-slate-700 to-slate-800 border-blue-500/50 shadow-lg shadow-blue-500/20'
                  : 'bg-slate-800 border-slate-700 opacity-70 hover:opacity-100'
              }`}
            >
              {/* Badge Icon */}
              <div className="text-6xl mb-3 text-center">{badge.icon}</div>

              {/* Badge Info */}
              <h3 className="font-bold text-white text-lg mb-1">{badge.name}</h3>
              <p className="text-sm text-slate-400 mb-2">{badge.description}</p>
              <p className="text-xs text-slate-500 mb-3">Requirement: {badge.requirement}</p>

              {/* Earned Badge */}
              {badge.earned_at && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <span>✓ Earned</span>
                  <span className="text-xs text-slate-400">
                    {new Date(badge.earned_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}

              {/* Locked Badge */}
              {!badge.earned_at && (
                <div className="text-yellow-500 text-sm flex items-center gap-1">
                  <span>🔒 Locked</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">💡 Tips to Earn Badges</h2>
        <ul className="space-y-2 text-slate-300">
          <li className="flex gap-2">
            <span className="text-blue-400">→</span>
            <span>Submit assignments regularly to earn "First Assignment" and "Diligent" badges</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400">→</span>
            <span>Aim for high scores on assessments to unlock "Perfect Score" and "Master" badges</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400">→</span>
            <span>Improve your mastery levels to earn "Quick Learner" and other achievement badges</span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-400">→</span>
            <span>Complete all course activities to get the "Engaged" badge</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
