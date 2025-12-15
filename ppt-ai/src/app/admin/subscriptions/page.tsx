import { db } from "@/server/db";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default async function AdminSubscriptionsPage() {
    const subscriptions = await db.subscription.findMany({
        where: {
            status: "ACTIVE",
        },
        include: {
            user: true,
            plan: true,
        },
        orderBy: {
            updatedAt: "desc",
        },
        take: 50,
    });

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Active Subscriptions</h2>
                <p className="text-muted-foreground">
                    View and manage active subscriptions.
                </p>
            </div>

            <div className="rounded-md border bg-white dark:bg-gray-800">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>PayPal ID</TableHead>
                            <TableHead>Renews On</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subscriptions.map((sub) => (
                            <TableRow key={sub.id}>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{sub.user.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {sub.user.email}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>{sub.plan.name}</TableCell>
                                <TableCell className="font-mono text-xs">
                                    {sub.paypalSubscriptionId}
                                </TableCell>
                                <TableCell>
                                    {sub.currentPeriodEnd
                                        ? format(new Date(sub.currentPeriodEnd), "MMM d, yyyy")
                                        : "N/A"}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="default">ACTIVE</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                        {subscriptions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No active subscriptions found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
