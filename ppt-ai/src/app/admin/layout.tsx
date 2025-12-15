import { type ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Settings,
    LogOut
} from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </Button>
                    </Link>

                    <Link href="/admin/users">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <Users className="h-4 w-4" />
                            Users
                        </Button>
                    </Link>

                    <Link href="/admin/subscriptions">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                            <CreditCard className="h-4 w-4" />
                            Subscriptions
                        </Button>
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <Link href="/">
                        <Button variant="outline" className="w-full justify-start gap-2">
                            <LogOut className="h-4 w-4" />
                            Exit Admin
                        </Button>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
