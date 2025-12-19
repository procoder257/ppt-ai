"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { FaGoogle } from "react-icons/fa";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface AuthLayoutProps {
    mode: "signin" | "signup";
    heading: string;
    subheading: string;
    callbackUrl?: string;
}

const slides = [
    "/auth-visuals/slide1.png",
    "/auth-visuals/slide2.png",
    "/auth-visuals/slide3.png",
    "/auth-visuals/slide1.png",
    "/auth-visuals/slide2.png",
    "/auth-visuals/slide3.png"
];

export function AuthLayout({ mode, heading, subheading, callbackUrl: propCallbackUrl }: AuthLayoutProps) {
    const searchParams = useSearchParams();
    const queryCallbackUrl = searchParams.get("callbackUrl");
    const error = searchParams.get("error");

    // Priority: Prop > Query Param > Default "/"
    const callbackUrl = propCallbackUrl ?? queryCallbackUrl ?? "/";

    const handleSignIn = async (provider: string) => {
        await signIn(provider, { callbackUrl });
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left Column: Form */}
            <div className="flex flex-col justify-center items-center p-8 lg:p-12 bg-background relative z-10">
                <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 group">
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                        <span className="text-white font-bold text-lg">P</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight text-foreground">PPT AI</span>
                </Link>

                {mode === "signin" ? (
                    <div className="absolute top-8 right-8 text-sm">
                        Don&apos;t have an account? <Link href="/auth/signup" className="text-primary font-semibold hover:underline">Sign up</Link>
                    </div>
                ) : (
                    <div className="absolute top-8 right-8 text-sm">
                        Already have an account? <Link href="/auth/signin" className="text-primary font-semibold hover:underline">Sign in</Link>
                    </div>
                )}

                <div className="w-full max-w-sm space-y-8">
                    <div className="space-y-3 text-center lg:text-left">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground">{heading}</h1>
                        <p className="text-muted-foreground text-lg">{subheading}</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                            Authentication error. Please try again.
                        </div>
                    )}

                    <div className="space-y-4">
                        <Button
                            size="lg"
                            className="w-full font-semibold h-14 text-lg bg-[#4285F4] hover:bg-[#3367D6] text-white shadow-xl shadow-blue-200/50 flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
                            onClick={() => handleSignIn("google")}
                        >
                            <div className="bg-white p-1.5 rounded-full">
                                <FaGoogle className="h-4 w-4 text-[#4285F4]" />
                            </div>
                            Continue with Google
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Trusted by teams at</span>
                        </div>
                    </div>

                    <div className="flex justify-center gap-6 opacity-40 grayscale">
                        {/* Simple placeholder logos */}
                        <div className="font-bold">Microsoft</div>
                        <div className="font-bold">Google</div>
                        <div className="font-bold">Spotify</div>
                    </div>

                    <p className="text-xs text-center text-muted-foreground px-4 leading-relaxed mt-8">
                        By continuing, you agree to our <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
                    </p>
                </div>

                <div className="absolute bottom-8 text-xs text-muted-foreground">
                    © 2025 PPT AI Inc.
                </div>
            </div>

            {/* Right Column: Visual */}
            <div className="hidden lg:block relative bg-slate-50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 via-indigo-50/30 to-purple-50/50 z-0"></div>

                {/* Animated Columns */}
                <div className="grid grid-cols-2 gap-8 p-8 h-[140vh] transform -rotate-6 scale-110 origin-center translate-x-12 -translate-y-20">
                    {/* Column 1 - Down */}
                    <div className="space-y-8">
                        <motion.div
                            animate={{ y: [0, -1200] }}
                            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                            className="space-y-8"
                        >
                            {[...slides, ...slides].map((img, i) => (
                                <div key={`c1-${i}`} className="w-full rounded-xl overflow-hidden shadow-2xl shadow-indigo-900/10 border border-white/50 bg-white">
                                    <Image
                                        src={img}
                                        alt="Presentation Slide"
                                        width={600}
                                        height={400}
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Column 2 - Up */}
                    <div className="space-y-8 pt-32">
                        <motion.div
                            animate={{ y: [-1200, 0] }}
                            transition={{ repeat: Infinity, duration: 35, ease: "linear" }}
                            className="space-y-8"
                        >
                            {[...slides, ...slides].reverse().map((img, i) => (
                                <div key={`c2-${i}`} className="w-full rounded-xl overflow-hidden shadow-2xl shadow-indigo-900/10 border border-white/50 bg-white">
                                    <Image
                                        src={img}
                                        alt="Presentation Slide"
                                        width={600}
                                        height={400}
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50 pointer-events-none"></div>
            </div>
        </div>
    );
}
