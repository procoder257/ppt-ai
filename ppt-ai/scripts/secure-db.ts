
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// List of tables identified from Supabase security warnings
const tables = [
    'Account',
    'User',
    'BaseDocument',
    'FavoriteDocument',
    'CustomTheme',
    'GeneratedImage',
    'SubscriptionPlan',
    'Usage',
    'Presentation',
    'Subscription',
    'Payment'
];

async function main() {
    console.log('🔒 Securing database tables by enabling Row Level Security (RLS)...');
    console.log('ℹ️  This blocks public API access but allows Prisma (superuser) to continue working.');

    let successCount = 0;
    let failCount = 0;

    for (const table of tables) {
        try {
            // Execute raw SQL to enable RLS
            // Using quotes to handle potentially case-sensitive table names if Prisma created them as PascalCase
            const query = `ALTER TABLE "public"."${table}" ENABLE ROW LEVEL SECURITY;`;
            await prisma.$executeRawUnsafe(query);
            console.log(`✅ Enabled RLS for table: ${table}`);
            successCount++;
        } catch (error: any) {
            console.error(`❌ Failed to secure table ${table}:`);
            console.error(`   ${error.message}`);
            failCount++;
        }
    }

    console.log('\n-----------------------------------');
    console.log(`Execution Complete.`);
    console.log(`✅ Secured: ${successCount}`);
    console.log(`❌ Failed:  ${failCount}`);

    if (failCount === 0) {
        console.log('🎉 All tables are now secured!');
    } else {
        console.log('⚠️  Some tables failed. Please check table names.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
