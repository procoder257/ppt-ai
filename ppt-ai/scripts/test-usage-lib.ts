
import { db } from "@/server/db";
import { trackTokenUsage } from "@/lib/usage";

async function main() {
    console.log("🧪 Testing trackTokenUsage function...");

    try {
        // 1. Get Admin User
        const admin = await db.user.findFirst({
            where: { email: "admin@pptai.com" }
        });

        if (!admin) {
            console.error("❌ Admin user not found!");
            return;
        }

        console.log(`Found admin: ${admin.id}`);

        // 2. Track Token Usage
        await trackTokenUsage({
            userId: admin.id,
            feature: "token_usage",
            amount: 123, // Distinct number to look for
            model: "test-model",
            type: "chat", // using 'chat' as specific type
            metadata: {
                test: "manual_verification"
            }
        });

        console.log("✅ trackTokenUsage call completed (no error thrown)");

    } catch (e) {
        console.error("❌ Error testing usage:", e);
    }
}

main();
