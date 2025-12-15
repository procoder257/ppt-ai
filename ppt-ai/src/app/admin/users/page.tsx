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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

export default async function AdminUsersPage() {
    const users = await db.user.findMany({
        include: {
            subscription: {
                include: {
                    plan: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 50, // Limit to 50 for now
    });

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Users</h2>
                <p className="text-muted-foreground">
                    Manage your users and view their subscription status.
                </p>
            </div>

            <div className="rounded-md border bg-white dark:bg-gray-800">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Joined</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={user.image || ""} alt={user.name || ""} />
                                        <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{user.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {user.email}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            user.subscription?.status === "ACTIVE"
                                                ? "default"
                                                : "secondary"
                                        }
                                    >
                                        {user.subscription?.status || "NO SUBSCRIPTION"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {user.subscription?.plan?.name || "Free"}
                                </TableCell>
                                <TableCell>
                                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
