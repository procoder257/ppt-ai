
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    try {
        // 0. Clean up dependencies first (due to Foreign Key constraints)
        console.log("Deleting documents...");
        await prisma.customTheme.deleteMany({}); // Delete custom themes first
        await prisma.presentation.deleteMany({}); // Delete presentation content
        await prisma.favoriteDocument.deleteMany({}); // Delete favorites
        await prisma.baseDocument.deleteMany({}); // Delete base documents

        console.log("Deleting generated images...");
        await prisma.generatedImage.deleteMany({});

        console.log("Deleting usage data...");
        await prisma.usage.deleteMany({});

        // 1. Delete all users (cascades to subscriptions, accounts, etc.)
        console.log("Deleting all users...");
        await prisma.user.deleteMany({});
        console.log("All users deleted.");

        // 2. Create the new Admin User
        const adminEmail = "admin@pptai.com";

        console.log(`Creating admin user: ${adminEmail}`);
        await prisma.user.create({
            data: {
                email: adminEmail,
                name: "Super Admin",
                role: "ADMIN",
                hasAccess: true,
                image: "https://ui-avatars.com/api/?name=Super+Admin&background=random",
            },
        });
        console.log("Admin user created in DB.");

    } catch (e) {
        console.error("Error during reset:", e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
