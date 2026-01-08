import { fetchAllProgress } from '@/app/actions/quest';
import { Clock, KeyRound, Lock, Unlock, Tv, Palette, Heart, CheckCircle2, Timer, User, History, PartyPopper } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ResetProgressButton from '@/components/admin/ResetProgressButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const pathIcons = {
  1: Tv,
  2: Palette,
  3: Heart,
};

const pathNames = {
  1: 'Pop Culture',
  2: 'Renaissance',
  3: 'Heart',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const AdminPage = async () => {
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
              <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                <Lock className="h-8 w-8 text-amber-500" />
                Quest Admin Dashboard
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
          <Card className="border-zinc-800 bg-zinc-950">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-purple-500/10 p-3">
                <User className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Total Users</p>
                <p className="text-3xl font-bold">{totalUsers}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-950">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-emerald-500/10 p-3">
                <KeyRound className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Keys Collected</p>
                <p className="text-3xl font-bold">{totalKeys} / {totalUsers * 3}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-950">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-amber-500/10 p-3">
                {totalKeys === totalUsers * 3 ? (
                  <Unlock className="h-6 w-6 text-amber-400" />
                ) : (
                  <Lock className="h-6 w-6 text-amber-400" />
                )}
              </div>
              <div>
                <p className="text-sm text-zinc-400">Vault Status</p>
                <div className="flex items-center gap-2 text-xl font-bold">
                  {totalKeys === totalUsers * 3 ? (
                    <>
                      <PartyPopper className="h-5 w-5 text-amber-400" />
                      <span>Unlocked</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5 text-zinc-500" />
                      <span>Locked</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Progress Table */}
        <Card className="mb-8 border-zinc-800 bg-zinc-950">
          <CardHeader className="border-b border-zinc-800">
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-5 w-5" />
              User Progress
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {allProgress.length === 0 ? (
              <div className="px-6 py-12 text-center text-zinc-500">
                No users yet. Waiting for first visitor...
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-zinc-900/50">
                  <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                    <TableHead className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      User
                    </TableHead>
                    <TableHead className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Pop Culture
                    </TableHead>
                    <TableHead className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Renaissance
                    </TableHead>
                    <TableHead className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Heart
                    </TableHead>
                    <TableHead className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Progress
                    </TableHead>
                    <TableHead className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-zinc-800">
                  {allProgress.map(({ user, progress }) => {
                    const path1 = progress.find((p) => p.pathId === 1);
                    const path2 = progress.find((p) => p.pathId === 2);
                    const path3 = progress.find((p) => p.pathId === 3);
                    const completedCount = progress.filter(
                      (p) => p.isCompleted
                    ).length;

                    return (
                      <TableRow key={user.id} className="border-zinc-800 hover:bg-zinc-900/50">
                        <TableCell className="px-6 py-4">
                          <div className="font-mono text-sm">
                            User #{user.id}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {user.createdAt &&
                              formatDistanceToNow(new Date(user.createdAt), {
                                addSuffix: true,
                              })}
                          </div>
                        </TableCell>

                        {/* Path 1 */}
                        <TableCell className="px-6 py-4">
                          {path1?.isCompleted ? (
                            <div>
                              <Badge variant="default" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                <CheckCircle2 className="h-3 w-3" />
                                Complete
                              </Badge>
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
                            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400">
                              <Timer className="h-3 w-3" />
                              Level {path1.currentLevel}/5
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-zinc-700 bg-zinc-800/50 text-zinc-500">
                              <Lock className="h-3 w-3" />
                              Locked
                            </Badge>
                          )}
                        </TableCell>

                        {/* Path 2 */}
                        <TableCell className="px-6 py-4">
                          {path2?.isCompleted ? (
                            <div>
                              <Badge variant="default" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                <CheckCircle2 className="h-3 w-3" />
                                Complete
                              </Badge>
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
                            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400">
                              <Timer className="h-3 w-3" />
                              Level {path2.currentLevel}/5
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-zinc-700 bg-zinc-800/50 text-zinc-500">
                              <Lock className="h-3 w-3" />
                              Locked
                            </Badge>
                          )}
                        </TableCell>

                        {/* Path 3 */}
                        <TableCell className="px-6 py-4">
                          {path3?.isCompleted ? (
                            <div>
                              <Badge variant="default" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                                <CheckCircle2 className="h-3 w-3" />
                                Complete
                              </Badge>
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
                            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400">
                              <Timer className="h-3 w-3" />
                              Level {path3.currentLevel}/5
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-zinc-700 bg-zinc-800/50 text-zinc-500">
                              <Lock className="h-3 w-3" />
                              Locked
                            </Badge>
                          )}
                        </TableCell>

                        {/* Overall Progress */}
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Progress
                              value={(completedCount / 3) * 100}
                              className="h-2 w-24 bg-zinc-800"
                            />
                            <span className="font-mono text-sm font-medium">
                              {completedCount}/3
                            </span>
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="px-6 py-4">
                          <ResetProgressButton userId={user.id} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card className="border-zinc-800 bg-zinc-950">
          <CardHeader className="border-b border-zinc-800">
            <CardTitle className="flex items-center gap-2 text-xl">
              <History className="h-5 w-5" />
              Activity Timeline
            </CardTitle>
            <CardDescription className="text-zinc-400">Most recent first</CardDescription>
          </CardHeader>

          <CardContent className="divide-y divide-zinc-800 p-0">
            {allActivity.length === 0 ? (
              <div className="px-6 py-12 text-center text-zinc-500">
                No activity yet
              </div>
            ) : (
              allActivity.slice(0, 10).map((activity, idx) => {
                const PathIcon = pathIcons[activity.pathId as keyof typeof pathIcons];
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-900/50"
                  >
                    <div className="rounded-full bg-zinc-800 p-2">
                      <PathIcon className="h-5 w-5 text-zinc-400" />
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
                );
              })
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminPage;
