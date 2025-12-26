import { db } from "@/server/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, DollarSign, Activity } from "lucide-react";

export default async function AdminDashboard() {
    // Fetch stats in parallel
    const [userCount, activeSubs, recentUsers, usageStats] = await Promise.all([
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
            take: 10, // Top 10 users by usage
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
        // Assuming monthly price if not specified. Ideally we check billing cycle.
        // For now, use the plan's monthly price.
        return total + (sub.plan?.priceMonthly || 0);
    }, 0);

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
                <Card className="col-span-4">
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

                <Card className="col-span-3">
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
        </div>
    );
}
