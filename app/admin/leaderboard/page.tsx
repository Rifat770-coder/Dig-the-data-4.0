'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTeamsByScore, Team } from '@/lib/teams';

export default function LeaderboardPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isCountdownRunning, setIsCountdownRunning] = useState(false);

  const ADMIN_PASSWORD = 'admin123';

  useEffect(() => {
    const authenticated = sessionStorage.getItem('adminLeaderboardAuth');
    if (authenticated === 'true') {
      setIsAuthenticated(true);
      fetchLeaderboard();
    } else {
      setLoading(false);
    }

    // Load countdown state from localStorage
    const savedEndTime = localStorage.getItem('leaderboardCountdownEndTime');
    const savedIsRunning = localStorage.getItem('leaderboardCountdownRunning');
    
    if (savedEndTime && savedIsRunning === 'true') {
      const endTime = parseInt(savedEndTime);
      const now = Date.now();
      
      if (endTime > now) {
        const remaining = Math.floor((endTime - now) / 1000);
        setTimeRemaining(remaining);
        setIsCountdownRunning(true);
      } else {
        // Countdown has ended
        setTimeRemaining(0);
        setIsCountdownRunning(false);
        localStorage.removeItem('leaderboardCountdownEndTime');
        localStorage.removeItem('leaderboardCountdownRunning');
      }
    }
  }, []);

  // Auto-refresh every 10 seconds when enabled
  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;

    const interval = setInterval(() => {
      fetchLeaderboard();
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefresh]);

  // Countdown timer effect
  useEffect(() => {
    if (!isCountdownRunning || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Countdown finished
          setIsCountdownRunning(false);
          localStorage.removeItem('leaderboardCountdownEndTime');
          localStorage.removeItem('leaderboardCountdownRunning');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isCountdownRunning, timeRemaining]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminLeaderboardAuth', 'true');
      setAuthError('');
      fetchLeaderboard();
    } else {
      setAuthError('Incorrect password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminLeaderboardAuth');
    setPassword('');
  };

  const fetchLeaderboard = async () => {
    try {
      console.log('[Leaderboard] 🔄 Fetching leaderboard data...');
      setLoading(true);
      setError(null);
      const data = await getTeamsByScore();
      console.log('[Leaderboard] ✅ Fetched', data.length, 'teams');
      setTeams(data);
    } catch (err) {
      console.error('[Leaderboard] ❌ Error fetching leaderboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = (minutes: number) => {
    const endTime = Date.now() + (minutes * 60 * 1000);
    localStorage.setItem('leaderboardCountdownEndTime', endTime.toString());
    localStorage.setItem('leaderboardCountdownRunning', 'true');
    setTimeRemaining(minutes * 60);
    setIsCountdownRunning(true);
  };

  const stopCountdown = () => {
    setIsCountdownRunning(false);
    setTimeRemaining(0);
    localStorage.removeItem('leaderboardCountdownEndTime');
    localStorage.removeItem('leaderboardCountdownRunning');
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'from-yellow-500/30 to-yellow-600/30 border-yellow-500/50';
    if (index === 1) return 'from-gray-400/30 to-gray-500/30 border-gray-400/50';
    if (index === 2) return 'from-orange-600/30 to-orange-700/30 border-orange-600/50';
    return 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30';
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 w-full max-w-md shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏆</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Leaderboard Access</h1>
            <p className="text-gray-400">Enter admin password to view real-time scores</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-cyan-300 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 pr-12"
                  placeholder="Enter password"
                  autoFocus
                  suppressHydrationWarning
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  suppressHydrationWarning
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              {authError && (
                <p className="text-red-400 text-sm mt-2">{authError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg"
              suppressHydrationWarning
            >
              Access Leaderboard
            </button>

            <Link
              href="/admin"
              className="block text-center text-cyan-400 hover:text-cyan-300 mt-4"
            >
              ← Back to Admin Panel
            </Link>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 mb-6 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Team Leaderboard</h1>
                <p className="text-gray-400">Real-time score tracking</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  autoRefresh
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title={autoRefresh ? 'Auto-refresh enabled (10s)' : 'Auto-refresh disabled'}
              >
                {autoRefresh ? '🔄 Auto' : '⏸️ Manual'}
              </button>
              
              <button
                onClick={fetchLeaderboard}
                disabled={loading}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : '↻ Refresh'}
              </button>
              
              <Link
                href="/admin"
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                ← Admin
              </Link>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 shadow-xl">
            <h3 className="text-cyan-300 text-sm font-medium uppercase tracking-wider text-center">Total Teams</h3>
            <p className="text-4xl font-bold text-white mt-2 text-center">{teams.length}</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 rounded-2xl p-6 shadow-xl">
            <h3 className="text-green-300 text-sm font-medium uppercase tracking-wider text-center">Highest Score</h3>
            <p className="text-4xl font-bold text-white mt-2 text-center">
              {teams.length > 0 ? (teams[0].score || 0) : 0}
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl border border-orange-500/30 rounded-2xl p-6 shadow-xl">
            <h3 className="text-orange-300 text-sm font-medium uppercase tracking-wider text-center">Time Countdown</h3>
            <div className="mt-2 text-center">
              {isCountdownRunning ? (
                <>
                  <p className={`text-4xl font-bold ${timeRemaining <= 60 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    {formatTime(timeRemaining)}
                  </p>
                  <button
                    onClick={stopCountdown}
                    className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    ⏹️ Stop
                  </button>
                </>
              ) : (
                <>
                  <p className="text-2xl text-gray-400 mb-3">Not Running</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <button
                      onClick={() => startCountdown(30)}
                      className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      30m
                    </button>
                    <button
                      onClick={() => startCountdown(60)}
                      className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      1h
                    </button>
                    <button
                      onClick={() => startCountdown(120)}
                      className="px-3 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      2h
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Leaderboard */}
        {loading && teams.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Loading leaderboard...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="bg-gray-800/50 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-400 text-lg">No teams yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {teams.map((team, index) => (
              <div
                key={team.$id}
                className={`bg-gradient-to-r ${getRankColor(index)} backdrop-blur-xl border rounded-2xl p-6 shadow-xl transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Rank & Team Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-4xl font-bold text-white min-w-[80px] text-center">
                      {getRankIcon(index)}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-1">{team.teamName}</h3>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-300">Code: <span className="font-mono font-semibold">{team.teamCode}</span></span>
                        {team.memberIds && team.memberIds.length > 0 && (
                          <span className="text-gray-300">• {team.memberIds.length} members</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Score Section */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-4xl font-bold text-white">{team.score || 0}</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider">Total Points</div>
                      <div className="text-xs text-cyan-300 mt-1">(Indoor + Outdoor Combined)</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
