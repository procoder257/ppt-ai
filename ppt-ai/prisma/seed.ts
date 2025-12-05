import { PrismaClient, SubscriptionPlanName } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create Free Plan
  await prisma.subscriptionPlan.upsert({
    where: { name: "FREE" },
    update: {},
    create: {
      name: "FREE",
      displayName: "Free",
      description: "Perfect for getting started",
      priceMonthly: 0,
      priceYearly: 0,
      features: {
        presentationsPerMonth: 3,
        canExportPPTX: false,
        canUseCustomThemes: false,
        canUsePremiumImages: false,
        maxSlidesPerPresentation: 20,
        supportLevel: "community",
      },
      limits: {
        presentations_created: 3,
        api_calls: 50,
        images_generated: 20,
        storage_mb: 100,
      },
    },
  });
  console.log("✅ Free plan created/updated");

  // Create Pro Plan
  await prisma.subscriptionPlan.upsert({
    where: { name: "PRO" },
    update: {},
    create: {
      name: "PRO",
      displayName: "Pro",
      description: "For professionals and teams",
      priceMonthly: 19,
      priceYearly: 190,
      features: {
        presentationsPerMonth: -1,
        canExportPPTX: true,
        canUseCustomThemes: true,
        canUsePremiumImages: true,
        maxSlidesPerPresentation: -1,
        supportLevel: "priority",
        advancedAIModels: true,
      },
      limits: {
        presentations_created: -1,
        api_calls: -1,
        images_generated: -1,
        storage_mb: 1000,
      },
    },
  });
  console.log("✅ Pro plan created/updated");

  // Create Enterprise Plan
  await prisma.subscriptionPlan.upsert({
    where: { name: "ENTERPRISE" },
    update: {},
    create: {
      name: "ENTERPRISE",
      displayName: "Enterprise",
      description: "For large organizations",
      priceMonthly: 0, // Custom pricing
      priceYearly: 0,
      features: {
        presentationsPerMonth: -1,
        canExportPPTX: true,
        canUseCustomThemes: true,
        canUsePremiumImages: true,
        maxSlidesPerPresentation: -1,
        supportLevel: "dedicated",
        advancedAIModels: true,
        customBranding: true,
        apiAccess: true,
        sla: true,
      },
      limits: {
        presentations_created: -1,
        api_calls: -1,
        images_generated: -1,
        storage_mb: -1,
      },
    },
  });
  console.log("✅ Enterprise plan created/updated");

  console.log("✅ Subscription plans seeded successfully");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
