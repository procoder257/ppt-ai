
import { db } from "../src/server/db";
import { env } from "../src/env";
import fs from "fs";
import path from "path";

// Load .env file manually since we are running a script
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach((line) => {
        const [key, value] = line.split("=");
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, "");
        }
    });
}

const PAYPAL_API = process.env.PAYPAL_MODE === "live"
    ? "https://api.paypal.com"
    : "https://api.sandbox.paypal.com";

async function getAccessToken() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("Missing PayPal credentials in .env");
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to get access token: ${response.status} ${text}`);
    }

    const data = await response.json();
    return data.access_token;
}

async function createProduct(accessToken: string) {
    console.log("Creating PayPal Product...");
    const response = await fetch(`${PAYPAL_API}/v1/catalogs/products`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: "PPT AI Subscription",
            description: "Subscription for PPT AI Pro features",
            type: "SERVICE",
            category: "SOFTWARE",
        }),
    });

    const data = await response.json();
    console.log("Product created:", data.id);
    return data.id;
}

async function createPlan(accessToken: string, productId: string) {
    console.log("Creating PayPal Plan...");
    const response = await fetch(`${PAYPAL_API}/v1/billing/plans`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            product_id: productId,
            name: "PPT AI Pro Monthly",
            description: "Monthly subscription for PPT AI Pro",
            status: "ACTIVE",
            billing_cycles: [
                {
                    frequency: {
                        interval_unit: "MONTH",
                        interval_count: 1,
                    },
                    tenure_type: "REGULAR",
                    sequence: 1,
                    total_cycles: 0, // Infinite
                    pricing_scheme: {
                        fixed_price: {
                            value: "19",
                            currency_code: "USD",
                        },
                    },
                },
            ],
            payment_preferences: {
                auto_bill_outstanding: true,
                setup_fee: {
                    value: "0",
                    currency_code: "USD",
                },
                setup_fee_failure_action: "CONTINUE",
                payment_failure_threshold: 3,
            },
        }),
    });

    const data = await response.json();
    console.log("Plan created:", data.id);
    return data.id;
}

async function main() {
    try {
        console.log("🚀 Starting PayPal Plan Fix...");

        const accessToken = await getAccessToken();
        const productId = await createProduct(accessToken);
        const planId = await createPlan(accessToken, productId);

        console.log(`\n✅ Generated new PayPal Plan ID: ${planId}`);

        // Update Database
        console.log("Updating database...");
        await db.subscriptionPlan.update({
            where: { name: "PRO" },
            data: {
                paypalPlanIdMonthly: planId,
            },
        });

        console.log("✅ Database updated successfully!");

    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

main();
