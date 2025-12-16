"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CTA() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10" />

            <div className="container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto bg-card border rounded-3xl p-12 md:p-20 shadow-2xl relative overflow-hidden"
                >
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary" />

                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Ready to create your next masterpiece?
                    </h2>
                    <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                        Join thousands of professionals who are saving time and impressing audiences with PPT AI.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/auth/signin">
                            <Button size="lg" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto bg-primary hover:bg-primary/90">
                                Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/pricing">
                            <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full w-full sm:w-auto">
                                View Pricing
                            </Button>
                        </Link>
                    </div>

                    <p className="mt-6 text-sm text-muted-foreground">
                        No credit card required for free plan.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
