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
    // Fetch usage stats
    const usageByFeature = await db.usage.groupBy({
        by: ["feature"],
        _sum: {
            amount: true,
        },
    });

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
                <h2 className="text-3xl font-bold tracking-tight">Usage Analytics</h2>
                <p className="text-muted-foreground">
                    Monitor API usage and token consumption.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {usageByFeature.map((stat) => (
                    <Card key={stat.feature}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.feature}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stat._sum.amount?.toLocaleString() || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">Total Units</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Recent Activity</h3>
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
