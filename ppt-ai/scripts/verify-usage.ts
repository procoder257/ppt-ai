
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyUsage() {
    console.log("🔍 Checking Usage Table for recent entries...");

    try {
        // 1. Get the latest usage records
        const latestUsage = await prisma.usage.findMany({
            where: {
                feature: "token_usage"
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 5,
            include: {
                user: true
            }
        });

        if (latestUsage.length === 0) {
            console.log("⚠️ No token usage records found.");
            console.log("Action: Please generate an outline or presentation in the UI first.");
        } else {
            console.log(`✅ Found ${latestUsage.length} recent usage records:`);
            latestUsage.forEach((record) => {
                console.log("------------------------------------------------");
                console.log(`ID: ${record.id}`);
                console.log(`User: ${record.user.email}`);
                console.log(`Type: ${(record.metadata as any)?.type}`);
                console.log(`Model: ${(record.metadata as any)?.model}`);
                console.log(`Tokens: ${record.amount} (Prompt: ${(record.metadata as any)?.promptTokens}, Completion: ${(record.metadata as any)?.completionTokens})`);
                console.log(`Date: ${record.createdAt.toISOString()}`);
            });
            console.log("------------------------------------------------");
            console.log("✅ Usage tracking is working!");
        }

    } catch (error) {
        console.error("Error verifying usage:", error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyUsage();
