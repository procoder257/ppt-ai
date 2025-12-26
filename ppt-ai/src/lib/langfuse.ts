
import { Langfuse } from "langfuse";

const isLangfuseEnabled = !!process.env.LANGFUSE_PUBLIC_KEY && !!process.env.LANGFUSE_SECRET_KEY;

export const langfuse = isLangfuseEnabled
    ? new Langfuse({
        publicKey: process.env.LANGFUSE_PUBLIC_KEY,
        secretKey: process.env.LANGFUSE_SECRET_KEY,
        baseUrl: process.env.LANGFUSE_HOST,
    })
    : null;

export async function flushLangfuse() {
    if (langfuse) {
        await langfuse.shutdownAsync();
    }
}
