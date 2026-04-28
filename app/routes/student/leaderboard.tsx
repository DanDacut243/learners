import { useState, useEffect } from 'react';
import apiClient from '~/services/api';
import { useParams } from 'react-router';
import { useAuth } from '~/context/AuthContext';

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  name: string;
  email: string;
  total_points: number;
  badges_earned: number;
  avg_mastery: number;
}

export function meta() {
  return [{ title: 'ERUDITE - Leaderboard' }];
}

export default function StudentLeaderboard() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [courseId, timeRange]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      // Simulated leaderboard data (would come from API in production)
      const mockData: LeaderboardEntry[] = [
        {
          rank: 1,
          user_id: 5,
          name: 'Alex Chen',
          email: 'alex@example.com',
          total_points: 950,
          badges_earned: 5,
          avg_mastery: 94,
        },
        {
          rank: 2,
          user_id: 3,
          name: 'Jordan Smith',
          email: 'jordan@example.com',
          total_points: 890,
          badges_earned: 4,
          avg_mastery: 88,
        },
        {
          rank: 3,
          user_id: 7,
          name: 'Sam Johnson',
          email: 'sam@example.com',
          total_points: 820,
          badges_earned: 3,
          avg_mastery: 82,
        },
        {
          rank: 4,
          user_id: 2,
          name: user?.name || 'You',
          email: user?.email || 'your@example.com',
          total_points: 750,
          badges_earned: 3,
          avg_mastery: 75,
        },
        {
          rank: 5,
          user_id: 8,
          name: 'Taylor Davis',
          email: 'taylor@example.com',
          total_points: 680,
          badges_earned: 2,
          avg_mastery: 68,
        },
        {
          rank: 6,
          user_id: 9,
          name: 'Morgan Wilson',
          email: 'morgan@example.com',
          total_points: 620,
          badges_earned: 2,
          avg_mastery: 62,
        },
        {
          rank: 7,
          user_id: 10,
          name: 'Casey Brown',
          email: 'casey@example.com',
          total_points: 550,
          badges_earned: 1,
          avg_mastery: 55,
        },
      ];

      setLeaderboard(mockData);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const userRank = leaderboard.find((entry) => entry.user_id === user?.id);
  const topThree = leaderboard.slice(0, 3);

  if (loading) {
    return <div className="text-center py-8 text-slate-400">Loading leaderboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2">🏆 Leaderboard</h1>
          <p className="text-slate-400">See how you stack up against your classmates</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['all', 'month', 'week'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-2 rounded-lg font-medium transition capitalize ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {range === 'all' ? 'All Time' : range === 'month' ? 'This Month' : 'This Week'}
            </button>
          ))}
        </div>
      </div>

      {/* Your Rank */}
      {userRank && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 border border-blue-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-blue-100 text-sm mb-1">YOUR RANK</p>
              <p className="text-4xl font-bold text-white">{userRank.rank}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{userRank.total_points}</p>
              <p className="text-blue-100">Points</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{userRank.badges_earned}</p>
              <p className="text-blue-100">Badges</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{userRank.avg_mastery}%</p>
              <p className="text-blue-100">Mastery</p>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Top Performers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="bg-slate-800 rounded-lg p-6 border-2 border-slate-600 order-2 md:order-1">
              <div className="text-5xl mb-2 text-center">🥈</div>
              <h3 className="font-bold text-white text-lg text-center">{topThree[1].name}</h3>
              <p className="text-sm text-slate-400 text-center mb-4">{topThree[1].email}</p>
              <div className="space-y-2 bg-slate-700 rounded p-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Points:</span>
                  <span className="font-bold text-white">{topThree[1].total_points}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Badges:</span>
                  <span className="font-bold text-white">{topThree[1].badges_earned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Mastery:</span>
                  <span className="font-bold text-white">{topThree[1].avg_mastery}%</span>
                </div>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <div className="bg-gradient-to-br from-yellow-600/20 to-slate-800 rounded-lg p-6 border-2 border-yellow-500/50 order-1 md:order-2 transform md:scale-105">
              <div className="text-6xl mb-2 text-center">👑</div>
              <h3 className="font-bold text-white text-lg text-center">{topThree[0].name}</h3>
              <p className="text-sm text-slate-400 text-center mb-4">{topThree[0].email}</p>
              <div className="space-y-2 bg-yellow-500/10 rounded p-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Points:</span>
                  <span className="font-bold text-yellow-400">{topThree[0].total_points}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Badges:</span>
                  <span className="font-bold text-yellow-400">{topThree[0].badges_earned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Mastery:</span>
                  <span className="font-bold text-yellow-400">{topThree[0].avg_mastery}%</span>
                </div>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="bg-slate-800 rounded-lg p-6 border-2 border-slate-600 order-3">
              <div className="text-5xl mb-2 text-center">🥉</div>
              <h3 className="font-bold text-white text-lg text-center">{topThree[2].name}</h3>
              <p className="text-sm text-slate-400 text-center mb-4">{topThree[2].email}</p>
              <div className="space-y-2 bg-slate-700 rounded p-3">
                <div className="flex justify-between">
                  <span className="text-slate-300">Points:</span>
                  <span className="font-bold text-white">{topThree[2].total_points}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Badges:</span>
                  <span className="font-bold text-white">{topThree[2].badges_earned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Mastery:</span>
                  <span className="font-bold text-white">{topThree[2].avg_mastery}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Full Rankings</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/50">
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Rank</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Student</th>
                <th className="px-4 py-3 text-center text-slate-400 font-medium">Points</th>
                <th className="px-4 py-3 text-center text-slate-400 font-medium">Badges</th>
                <th className="px-4 py-3 text-center text-slate-400 font-medium">Mastery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {leaderboard.map((entry, idx) => (
                <tr
                  key={entry.user_id}
                  className={`transition ${
                    entry.user_id === user?.id
                      ? 'bg-blue-600/20 border-l-4 border-blue-500'
                      : 'hover:bg-slate-800/50'
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className="font-bold text-lg">
                      {entry.rank === 1 ? '👑' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : entry.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-white">
                        {entry.name}
                        {entry.user_id === user?.id && <span className="text-blue-400 ml-2">(You)</span>}
                      </p>
                      <p className="text-sm text-slate-400">{entry.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-bold text-white">{entry.total_points}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="font-bold text-yellow-400">{entry.badges_earned}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-block">
                      <p className="font-bold text-white">{entry.avg_mastery}%</p>
                      <div className="w-20 h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${entry.avg_mastery}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
