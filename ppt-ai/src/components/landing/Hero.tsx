
"use client";

import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const ROTATING_WORDS = ["Presentations", "Pitch Decks", "Project Reports", "Infographics"];
const PROMPT_EXAMPLES = [
    "Create a Q4 marketing strategy deck for PPT AI",
    "Generate a startup pitch for a fintech unicorn",
    "Design a quarterly business review for stakeholders",
    "Build a product roadmap timeline for 2025"
];

export function Hero() {
    const [index, setIndex] = useState(0);
    const [promptIndex, setPromptIndex] = useState(0);
    const [displayedPrompt, setDisplayedPrompt] = useState("");
    const [isTyping, setIsTyping] = useState(true);

    // Rotating Text Effect
    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Typing Effect
    useEffect(() => {
        const currentText = PROMPT_EXAMPLES[promptIndex] || "";

        if (isTyping) {
            if (displayedPrompt === currentText) {
                // Finished typing, wait then delete
                setTimeout(() => setIsTyping(false), 2000);
                return;
            }

            const timeout = setTimeout(() => {
                setDisplayedPrompt(currentText.slice(0, displayedPrompt.length + 1));
            }, 50);
            return () => clearTimeout(timeout);
        } else {
            // Deleting
            if (displayedPrompt === "") {
                // Finished deleting, switch to next prompt
                setPromptIndex((prev) => (prev + 1) % PROMPT_EXAMPLES.length);
                setIsTyping(true);
                return;
            }

            const timeout = setTimeout(() => {
                setDisplayedPrompt(displayedPrompt.slice(0, -1));
            }, 30);
            return () => clearTimeout(timeout);
        }
    }, [displayedPrompt, isTyping, promptIndex]);

    return (
        <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 overflow-hidden bg-background">
            {/* Background blobs */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-100/50 rounded-full blur-[100px] -z-10 opacity-60" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[120px] -z-10 opacity-60" />

            <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="text-left space-y-8 z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]"
                    >
                        The World&apos;s Best AI for <br />
                        <span className="text-primary inline-block min-w-[300px]">
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="block"
                                >
                                    {ROTATING_WORDS[index]}
                                </motion.span>
                            </AnimatePresence>
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-xl text-muted-foreground max-w-lg font-medium"
                    >
                        The easiest way to generate professional slides. From idea to deck in seconds.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex items-center gap-4"
                    >
                        <Link href="/auth/signin">
                            <Button size="lg" className="h-14 px-10 text-lg bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 rounded-xl font-bold transition-transform hover:scale-105">
                                Try now
                            </Button>
                        </Link>
                        <span className="text-sm font-handwriting transform -rotate-6 text-muted-foreground mt-8 ml-2 hidden sm:block">
                            *No credit card required
                        </span>
                    </motion.div>

                    {/* Logos */}
                    <div className="pt-12 opacity-60 grayscale scale-90 origin-left">
                        <p className="text-sm font-semibold mb-6 flex items-center gap-2">Trusted by over 10 million presenters</p>
                        <div className="flex gap-8 items-center">
                            {/* Simple placeholder logos for now */}
                            <div className="font-bold text-xl">Microsoft</div>
                            <div className="font-bold text-xl">Google</div>
                            <div className="font-bold text-xl">Adobe</div>
                        </div>
                    </div>
                </div>

                {/* Right Content - Visual */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="relative"
                >
                    {/* Blue card background */}
                    <div className="bg-blue-50/80 rounded-[2rem] p-12 lg:p-16 relative overflow-hidden">
                        {/* Decorative lines */}
                        <div className="absolute top-0 right-0 w-64 h-64 border-[40px] border-white/40 rounded-full translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 border-[20px] border-white/40 rounded-full -translate-x-1/2 translate-y-1/2" />

                        {/* The Input Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-2xl relative z-10 w-full max-w-md mx-auto transform rotate-1 hover:rotate-0 transition-transform duration-500">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">P</div>
                                <div className="h-2 w-24 bg-gray-100 rounded-full"></div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm text-primary font-medium">Enter a prompt. We&apos;ll create a presentation for you.</p>
                                <div className="h-16 flex items-center bg-muted/20 rounded-lg px-4 border border-transparent focus-within:border-primary/20 transition-colors">
                                    <p className="text-lg font-medium text-foreground relative">
                                        {displayedPrompt}
                                        <span className="animate-pulse text-primary">|</span>
                                    </p>
                                </div>

                                <div className="h-14 bg-gradient-to-r from-blue-500 to-primary rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity">
                                    Create <Sparkles className="ml-2 h-5 w-5 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

