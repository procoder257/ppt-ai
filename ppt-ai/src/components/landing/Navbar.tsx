"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
                scrolled
                    ? "bg-background/80 backdrop-blur-md border-border/50 py-3 shadow-sm"
                    : "bg-transparent py-5"
            )}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="text-white font-bold text-xl">P</span>
                    </div>
                    <span className="text-xl font-bold text-foreground">
                        PPT AI
                    </span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                        Features
                    </Link>
                    <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
                        How it Works
                    </Link>
                    <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
                        Pricing
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/auth/signin">
                        <Button variant="outline" className="hidden sm:inline-flex border-muted-foreground/30 hover:bg-muted font-semibold text-foreground">
                            Login
                        </Button>
                    </Link>
                    <Link href="/auth/signup">
                        <Button size="default" className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/30 rounded-lg px-6">
                            Signup
                        </Button>
                    </Link>
                </div>
            </div>
        </motion.nav>
    );
}
