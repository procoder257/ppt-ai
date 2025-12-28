import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { notFound } from "next/navigation";
import { UserProfile } from "@/components/user/UserProfile";

export default async function ProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    const { id: userId } = await params;

    const user = await db.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        notFound();
    }

    const isOwnProfile = session?.user?.id === user.id;

    return <UserProfile user={user} isOwnProfile={isOwnProfile} />;
}
