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

  // Create Starter Plan
  await prisma.subscriptionPlan.upsert({
    where: { name: "STARTER" },
    update: {
      displayName: "Starter",
      description: "For individuals",
      priceMonthly: 25,
      priceYearly: 240,
      paypalPlanIdMonthly: "P-7P0324366L983593UNFOAVHI",
      paypalPlanIdYearly: "P-38H54828F6197681SNFOAVHQ",
      features: {
        presentationsPerMonth: 10,
        canExportPPTX: true,
        canUseCustomThemes: false,
        canUsePremiumImages: false,
        maxSlidesPerPresentation: 30,
        supportLevel: "email",
        advancedAIModels: false,
      },
      limits: {
        presentations_created: 10,
        api_calls: 100,
        images_generated: 50,
        storage_mb: 500,
      },
    },
    create: {
      name: "STARTER",
      displayName: "Starter",
      description: "For individuals",
      priceMonthly: 25,
      priceYearly: 240,
      paypalPlanIdMonthly: "P-7P0324366L983593UNFOAVHI",
      paypalPlanIdYearly: "P-38H54828F6197681SNFOAVHQ",
      features: {
        presentationsPerMonth: 10,
        canExportPPTX: true,
        canUseCustomThemes: false,
        canUsePremiumImages: false,
        maxSlidesPerPresentation: 30,
        supportLevel: "email",
        advancedAIModels: false,
      },
      limits: {
        presentations_created: 10,
        api_calls: 100,
        images_generated: 50,
        storage_mb: 500,
      },
    },
  });
  console.log("✅ Starter plan created/updated");

  // Create Pro Plan
  await prisma.subscriptionPlan.upsert({
    where: { name: "PRO" },
    update: {
      displayName: "Pro",
      description: "For professionals and teams",
      priceMonthly: 35,
      priceYearly: 360,
      paypalPlanIdMonthly: "P-46U79340SN956652ANFOAVHQ",
      paypalPlanIdYearly: "P-44T34991U8959143KNFOAVHY",
      features: {
        presentationsPerMonth: 30, // Updated from -1 to 30
        canExportPPTX: true,
        canUseCustomThemes: true,
        canUsePremiumImages: true,
        maxSlidesPerPresentation: 25, // Updated from -1 to 25
        supportLevel: "priority",
        advancedAIModels: true,
      },
      limits: {
        presentations_created: 30, // Soft limit per month
        api_calls: -1,
        images_generated: 60, // 60 images/month
        storage_mb: 1000,
      },
    },
    create: {
      name: "PRO",
      displayName: "Pro",
      description: "For professionals and teams",
      priceMonthly: 35,
      priceYearly: 360,
      paypalPlanIdMonthly: "P-46U79340SN956652ANFOAVHQ",
      paypalPlanIdYearly: "P-44T34991U8959143KNFOAVHY",
      features: {
        presentationsPerMonth: 30,
        canExportPPTX: true,
        canUseCustomThemes: true,
        canUsePremiumImages: true,
        maxSlidesPerPresentation: 25,
        supportLevel: "priority",
        advancedAIModels: true,
      },
      limits: {
        presentations_created: 30,
        api_calls: -1,
        images_generated: 60,
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
