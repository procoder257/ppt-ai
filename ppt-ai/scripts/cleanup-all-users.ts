import { db } from "../src/server/db";

async function main() {
  console.log("🗑️  Removing all user data and related records...\n");

  try {
    // Count before deletion
    const userCount = await db.user.count();
    const accountCount = await db.account.count();
    const subscriptionCount = await db.subscription.count();
    const paymentCount = await db.payment.count();
    const usageCount = await db.usage.count();
    const documentCount = await db.baseDocument.count();
    const favoriteCount = await db.favoriteDocument.count();
    const themeCount = await db.customTheme.count();
    const imageCount = await db.generatedImage.count();

    console.log("Current database state:");
    console.log(`  - Users: ${userCount}`);
    console.log(`  - Accounts (OAuth): ${accountCount}`);
    console.log(`  - Subscriptions: ${subscriptionCount}`);
    console.log(`  - Payments: ${paymentCount}`);
    console.log(`  - Usage records: ${usageCount}`);
    console.log(`  - Documents: ${documentCount}`);
    console.log(`  - Favorites: ${favoriteCount}`);
    console.log(`  - Custom Themes: ${themeCount}`);
    console.log(`  - Generated Images: ${imageCount}\n`);

    if (userCount === 0) {
      console.log("✅ No users to delete! Database is already clean.\n");
      return;
    }

    console.log("⚠️  WARNING: This will delete ALL user data!");
    console.log("Proceeding with deletion in 2 seconds...\n");

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log("Deleting data...");

    // Delete in correct order to respect foreign key constraints

    // 1. Delete payments (references subscriptions)
    if (paymentCount > 0) {
      await db.payment.deleteMany({});
      console.log(`  ✓ Deleted ${paymentCount} payment(s)`);
    }

    // 2. Delete usage records (references subscriptions and users)
    if (usageCount > 0) {
      await db.usage.deleteMany({});
      console.log(`  ✓ Deleted ${usageCount} usage record(s)`);
    }

    // 3. Delete subscriptions (references users)
    if (subscriptionCount > 0) {
      await db.subscription.deleteMany({});
      console.log(`  ✓ Deleted ${subscriptionCount} subscription(s)`);
    }

    // 4. Delete favorites (references documents and users)
    if (favoriteCount > 0) {
      await db.favoriteDocument.deleteMany({});
      console.log(`  ✓ Deleted ${favoriteCount} favorite(s)`);
    }

    // 5. Delete presentations (references base documents)
    const presentationCount = await db.presentation.count();
    if (presentationCount > 0) {
      await db.presentation.deleteMany({});
      console.log(`  ✓ Deleted ${presentationCount} presentation(s)`);
    }

    // 6. Delete base documents (references users)
    if (documentCount > 0) {
      await db.baseDocument.deleteMany({});
      console.log(`  ✓ Deleted ${documentCount} document(s)`);
    }

    // 7. Delete custom themes (references users)
    if (themeCount > 0) {
      await db.customTheme.deleteMany({});
      console.log(`  ✓ Deleted ${themeCount} custom theme(s)`);
    }

    // 8. Delete generated images (references users)
    if (imageCount > 0) {
      await db.generatedImage.deleteMany({});
      console.log(`  ✓ Deleted ${imageCount} generated image(s)`);
    }

    // 9. Delete OAuth accounts (references users)
    if (accountCount > 0) {
      await db.account.deleteMany({});
      console.log(`  ✓ Deleted ${accountCount} OAuth account(s)`);
    }

    // 10. Finally, delete users
    if (userCount > 0) {
      await db.user.deleteMany({});
      console.log(`  ✓ Deleted ${userCount} user(s)`);
    }

    console.log("\n✅ All user data has been removed!");

    // Verify deletion
    const remainingUsers = await db.user.count();
    const remainingSubscriptions = await db.subscription.count();
    const remainingPayments = await db.payment.count();

    console.log("\nFinal database state:");
    console.log(`  - Users: ${remainingUsers}`);
    console.log(`  - Subscriptions: ${remainingSubscriptions}`);
    console.log(`  - Payments: ${remainingPayments}`);

    // Show what's preserved
    const planCount = await db.subscriptionPlan.count();
    console.log("\nPreserved data:");
    console.log(`  - Subscription Plans: ${planCount} (with PayPal IDs intact)`);

    console.log("\n🎯 Database is completely clean and ready for testing!\n");

  } catch (error) {
    console.error("\n❌ Error during cleanup:", error);
    throw error;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    db.$disconnect();
  });
