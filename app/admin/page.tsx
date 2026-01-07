import { fetchAllProgress } from '@/app/actions/quest';
import { PATH_METADATA } from '@/store/useQuestStore';
import { Clock, KeyRound, Lock, Unlock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const pathIcons = {
  1: '🎬',
  2: '🎨',
  3: '❤️',
};

const pathNames = {
  1: 'Pop Culture',
  2: 'Renaissance',
  3: 'Heart',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPage() {
  const allProgress = await fetchAllProgress();

  // Calculate stats
  const totalUsers = allProgress.length;
  const totalKeys = allProgress.reduce(
    (sum, { progress }) => sum + progress.filter((p) => p.isCompleted).length,
    0
  );

  // Get all activity sorted by time
  const allActivity = allProgress.flatMap(({ user, progress }) =>
    progress
      .filter((p) => p.completedAt)
      .map((p) => ({
        userId: user.id,
        pathId: p.pathId,
        completedAt: p.completedAt!,
      }))
  );

  allActivity.sort(
    (a, b) => b.completedAt.getTime() - a.completedAt.getTime()
  );

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                🔐 Quest Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                Real-time progress monitoring
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono text-zinc-500">
                {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Overview Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-500/10 p-3">
                <KeyRound className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <div className="text-sm text-zinc-400">Total Users</div>
                <div className="text-3xl font-bold">{totalUsers}</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-500/10 p-3">
                <KeyRound className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <div className="text-sm text-zinc-400">Keys Collected</div>
                <div className="text-3xl font-bold">{totalKeys} / {totalUsers * 3}</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-amber-500/10 p-3">
                {totalKeys === totalUsers * 3 ? (
                  <Unlock className="h-6 w-6 text-amber-400" />
                ) : (
                  <Lock className="h-6 w-6 text-amber-400" />
                )}
              </div>
              <div>
                <div className="text-sm text-zinc-400">Vault Status</div>
                <div className="text-xl font-bold">
                  {totalKeys === totalUsers * 3 ? '🎉 Unlocked' : '🔒 Locked'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Progress Table */}
        <div className="mb-8 rounded-lg border border-zinc-800 bg-zinc-950">
          <div className="border-b border-zinc-800 px-6 py-4">
            <h2 className="text-xl font-bold">👤 User Progress</h2>
          </div>

          <div className="overflow-x-auto">
            {allProgress.length === 0 ? (
              <div className="px-6 py-12 text-center text-zinc-500">
                No users yet. Waiting for first visitor...
              </div>
            ) : (
              <table className="w-full">
                <thead className="border-b border-zinc-800 bg-zinc-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Pop Culture
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Renaissance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Heart
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {allProgress.map(({ user, progress }) => {
                    const path1 = progress.find((p) => p.pathId === 1);
                    const path2 = progress.find((p) => p.pathId === 2);
                    const path3 = progress.find((p) => p.pathId === 3);
                    const completedCount = progress.filter(
                      (p) => p.isCompleted
                    ).length;

                    return (
                      <tr key={user.id} className="hover:bg-zinc-900/50">
                        <td className="px-6 py-4">
                          <div className="font-mono text-sm">
                            User #{user.id}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {user.createdAt &&
                              formatDistanceToNow(new Date(user.createdAt), {
                                addSuffix: true,
                              })}
                          </div>
                        </td>

                        {/* Path 1 */}
                        <td className="px-6 py-4">
                          {path1?.isCompleted ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">✅</span>
                                <span className="text-sm font-medium text-emerald-400">
                                  Complete
                                </span>
                              </div>
                              {path1.completedAt && (
                                <div className="mt-1 text-xs text-zinc-500">
                                  {formatDistanceToNow(
                                    new Date(path1.completedAt),
                                    { addSuffix: true }
                                  )}
                                </div>
                              )}
                            </div>
                          ) : path1 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg">⏳</span>
                              <span className="text-sm text-amber-400">
                                Level {path1.currentLevel}/5
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🔒</span>
                              <span className="text-sm text-zinc-500">
                                Locked
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Path 2 */}
                        <td className="px-6 py-4">
                          {path2?.isCompleted ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">✅</span>
                                <span className="text-sm font-medium text-emerald-400">
                                  Complete
                                </span>
                              </div>
                              {path2.completedAt && (
                                <div className="mt-1 text-xs text-zinc-500">
                                  {formatDistanceToNow(
                                    new Date(path2.completedAt),
                                    { addSuffix: true }
                                  )}
                                </div>
                              )}
                            </div>
                          ) : path2 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg">⏳</span>
                              <span className="text-sm text-amber-400">
                                Level {path2.currentLevel}/5
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🔒</span>
                              <span className="text-sm text-zinc-500">
                                Locked
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Path 3 */}
                        <td className="px-6 py-4">
                          {path3?.isCompleted ? (
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">✅</span>
                                <span className="text-sm font-medium text-emerald-400">
                                  Complete
                                </span>
                              </div>
                              {path3.completedAt && (
                                <div className="mt-1 text-xs text-zinc-500">
                                  {formatDistanceToNow(
                                    new Date(path3.completedAt),
                                    { addSuffix: true }
                                  )}
                                </div>
                              )}
                            </div>
                          ) : path3 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg">⏳</span>
                              <span className="text-sm text-amber-400">
                                Level {path3.currentLevel}/5
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🔒</span>
                              <span className="text-sm text-zinc-500">
                                Locked
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Overall Progress */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-zinc-800">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                style={{
                                  width: `${(completedCount / 3) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="font-mono text-sm font-medium">
                              {completedCount}/3
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-950">
          <div className="border-b border-zinc-800 px-6 py-4">
            <h2 className="text-xl font-bold">📜 Activity Timeline</h2>
            <p className="text-sm text-zinc-400">Most recent first</p>
          </div>

          <div className="divide-y divide-zinc-800">
            {allActivity.length === 0 ? (
              <div className="px-6 py-12 text-center text-zinc-500">
                No activity yet
              </div>
            ) : (
              allActivity.slice(0, 10).map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-900/50"
                >
                  <div className="text-2xl">
                    {pathIcons[activity.pathId as keyof typeof pathIcons]}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {pathNames[activity.pathId as keyof typeof pathNames]}{' '}
                      completed
                    </div>
                    <div className="text-xs text-zinc-500">
                      User #{activity.userId}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(activity.completedAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
