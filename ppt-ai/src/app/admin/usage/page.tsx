import { db } from "@/server/db";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminUsagePage() {
    // 1. Fetch Token Usage (Variable Cost)
    const usageByFeature = await db.usage.groupBy({
        by: ["feature"],
        _sum: {
            amount: true,
        },
        where: {
            createdAt: {
                gte: new Date(new Date().setDate(1)), // From start of current month
            }
        }
    });

    const totalTokens = usageByFeature.find(u => u.feature === "token_usage")?._sum.amount || 0;
    // Gemini 2.0 Flash-Lite Average: ~$0.25 per 1M tokens (Safety weighted)
    const estimatedTextCost = (totalTokens / 1000000) * 0.25;

    // 2. Fetch Image Usage (Variable Cost)
    // We count actual generated images for accuracy
    const totalImages = await db.generatedImage.count({
        where: {
            createdAt: {
                gte: new Date(new Date().setDate(1)), // From start of current month
            }
        }
    });
    // AI Image Cost: $0.04 per image (High estimate for safety)
    const estimatedImageCost = totalImages * 0.04;

    const totalVariableCost = estimatedTextCost + estimatedImageCost;

    // 3. Fetch Active Subscriptions (Revenue & Fixed Costs)
    const activeProSubs = await db.subscription.count({
        where: {
            status: "ACTIVE",
            plan: {
                name: "PRO"
            }
        }
    });

    // Revenue: $20/user
    const estimatedRevenue = activeProSubs * 20.00;

    // Fixed Costs: $3.00/user (Infra + Support)
    const totalFixedCosts = activeProSubs * 3.00;

    const totalCosts = totalVariableCost + totalFixedCosts;
    const netProfit = estimatedRevenue - totalCosts;
    const netMargin = estimatedRevenue > 0 ? (netProfit / estimatedRevenue) * 100 : 0;

    const recentLogs = await db.usage.findMany({
        take: 20,
        orderBy: {
            createdAt: "desc",
        },
        include: {
            user: true,
        },
    });

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Financial Overview (Est.)</h2>
                <p className="text-muted-foreground">
                    Profitability tracking based on $20/mo strategy.
                </p>
            </div>

            {/* Unit Economics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Est. Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ${estimatedRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {activeProSubs} Active PRO Users
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            ${totalCosts.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Fixed: ${totalFixedCosts.toFixed(2)} | Var: ${totalVariableCost.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                            ${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Target: &gt;$10/user
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Margin</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${netMargin >= 50 ? "text-green-600" : "text-yellow-600"}`}>
                            {netMargin.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Target: 50%+
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Usage Details */}
            <h3 className="text-xl font-semibold mt-8">Usage Metrics (This Month)</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Token Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {(totalTokens / 1000000).toFixed(2)}M
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Est. Cost: ${estimatedTextCost.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">AI Images</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalImages.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Est. Cost: ${estimatedImageCost.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Recent Usage Logs</h3>
                <div className="rounded-md border bg-white dark:bg-gray-800">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Feature</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentLogs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{log.user.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {log.user.email}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{log.feature}</TableCell>
                                    <TableCell>{log.amount.toLocaleString()}</TableCell>
                                    <TableCell>
                                        {format(new Date(log.createdAt), "MMM d, HH:mm:ss")}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {recentLogs.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        className="text-center py-8 text-muted-foreground"
                                    >
                                        No usage logs found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
