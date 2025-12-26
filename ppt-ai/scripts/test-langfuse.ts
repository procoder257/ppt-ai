
import { langfuse, flushLangfuse } from "@/lib/langfuse";

async function testLangfuse() {
    console.log("Testing Langfuse Connection...");

    if (!langfuse) {
        console.error("❌ Langfuse is NOT initialized. Check environment variables.");
        process.exit(1);
    }

    try {
        console.log("Creating test trace...");
        const trace = langfuse.trace({
            name: "test-trace-cli",
            userId: "test-user-cli",
            metadata: {
                source: "cli-script"
            }
        });

        trace.generation({
            name: "test-generation",
            model: "test-model",
            input: "Hello Langfuse",
            output: "Connection Successful",
            usage: {
                total: 1
            }
        });

        console.log("Flushing events to Langfuse cloud...");
        await flushLangfuse();
        console.log("✅ Successfully flushed events to Langfuse!");

    } catch (error) {
        console.error("❌ Error sending to Langfuse:", error);
    }
}

testLangfuse();
