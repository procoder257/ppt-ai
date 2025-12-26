import { db } from "@/server/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, DollarSign, Activity } from "lucide-react";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { UsageChart } from "@/components/admin/UsageChart";

export default async function AdminDashboard() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch stats in parallel
    const [userCount, activeSubs, recentUsers, usageStats, recentPayments, recentUsage] = await Promise.all([
        db.user.count(),
        db.subscription.findMany({
            where: { status: "ACTIVE" },
            include: { plan: true },
        }),
        db.user.findMany({
            orderBy: { createdAt: "desc" },
            take: 5,
        }),
        db.usage.groupBy({
            by: ["userId"],
            _sum: {
                amount: true,
            },
            orderBy: {
                _sum: {
                    amount: "desc",
                },
            },
            take: 10,
        }),
        // Fetch last 30 days of payments for chart
        db.payment.findMany({
            where: {
                status: "SUCCEEDED",
                createdAt: { gte: thirtyDaysAgo },
            },
            orderBy: { createdAt: "asc" },
        }),
        // Fetch last 30 days of usage for chart
        db.usage.findMany({
            where: {
                createdAt: { gte: thirtyDaysAgo },
            },
            orderBy: { createdAt: "asc" },
        }),
    ]);

    // Fetch user details for the top usage stats
    const usageUserIds = usageStats.map((stat) => stat.userId);
    const usageUsers = await db.user.findMany({
        where: {
            id: {
                in: usageUserIds,
            },
        },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
        },
    });

    // Create a map for easy lookup
    const userMap = new Map(usageUsers.map((u) => [u.id, u]));

    // Calculate MRR (Monthly Recurring Revenue)
    const mrr = activeSubs.reduce((total, sub) => {
        return total + (sub.plan?.priceMonthly || 0);
    }, 0);

    // Aggregate Revenue Data
    const revenueMap = new Map<string, number>();
    recentPayments.forEach(p => {
        const date = p.createdAt.toISOString().split('T')[0] ?? "";
        if (date) {
            revenueMap.set(date, (revenueMap.get(date) || 0) + p.amount);
        }
    });

    const revenueData = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        const dateStr = d.toISOString().split('T')[0] ?? "";
        return {
            rawDate: d,
            date: dateStr.split('-').slice(1).join('/'), // MM/DD
            revenue: revenueMap.get(dateStr) || 0,
        };
    });

    // Aggregate Usage Data
    const usageMap = new Map<string, { tokens: number; requests: number }>();
    recentUsage.forEach(u => {
        const date = u.createdAt.toISOString().split('T')[0] ?? "";
        if (date) {
            const current = usageMap.get(date) || { tokens: 0, requests: 0 };
            // Assuming 'amount' is tokens roughly speaking.
            usageMap.set(date, {
                tokens: current.tokens + u.amount,
                requests: current.requests + 1,
            });
        }
    });

    const usageChartData = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        const dateStr = d.toISOString().split('T')[0] ?? "";
        const stats = usageMap.get(dateStr) || { tokens: 0, requests: 0 };
        return {
            rawDate: d,
            date: dateStr.split('-').slice(1).join('/'),
            tokens: stats.tokens,
            requests: stats.requests,
        };
    });

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">Overview of your platform's performance.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userCount}</div>
                        <p className="text-xs text-muted-foreground">
                            Lifetime users
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeSubs.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Current active plans
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${mrr.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            Estimated MRR
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Users</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{recentUsers.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Recent signups
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <RevenueChart data={revenueData} />

                <div className="col-span-3 grid gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Top AI Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {usageStats.map((stat, i) => {
                                    const user = userMap.get(stat.userId);
                                    return (
                                        <div key={stat.userId} className="flex items-center">
                                            <div className="w-8 font-bold text-gray-500">#{i + 1}</div>
                                            <div className="ml-2 space-y-1">
                                                <p className="text-sm font-medium leading-none">{user?.name || "Unknown"}</p>
                                                <p className="text-sm text-muted-foreground">{user?.email || "No email"}</p>
                                            </div>
                                            <div className="ml-auto font-medium">
                                                {stat._sum.amount?.toLocaleString() || 0} tokens
                                            </div>
                                        </div>
                                    );
                                })}
                                {usageStats.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No usage data found.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <UsageChart data={usageChartData} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-7">
                    <CardHeader>
                        <CardTitle>Recent Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentUsers.map((user) => (
                                <div key={user.id} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.name}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                    <div className="ml-auto font-medium">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                            {recentUsers.length === 0 && (
                                <p className="text-sm text-muted-foreground">No users found.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
