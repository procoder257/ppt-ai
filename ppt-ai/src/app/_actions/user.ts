"use server";

import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const updateUserSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    headline: z.string().max(100).optional(),
    bio: z.string().max(500).optional(),
    website: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export type UpdateUserData = z.infer<typeof updateUserSchema>;

export async function updateUser(userId: string, data: UpdateUserData) {
    const session = await auth();

    if (!session?.user || session.user.id !== userId) {
        throw new Error("Unauthorized");
    }

    const validatedData = updateUserSchema.parse(data);

    try {
        await db.user.update({
            where: { id: userId },
            data: {
                name: validatedData.name,
                headline: validatedData.headline,
                bio: validatedData.bio,
                website: validatedData.website,
            },
        });

        revalidatePath(`/user/${userId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update user:", error);
        return { success: false, error: "Failed to update profile" };
    }
}
