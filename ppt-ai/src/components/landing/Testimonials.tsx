"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const testimonials = [
    {
        id: 1,
        quote: "The AI suggestions are spot on. It saved me hours of tweaking layouts, and the result looks like we hired a professional agency.",
        name: "Sarah Chen",
        role: "Product Manager",
        company: "TechFlow",
        image: "/testimonials/sarah.png",
        rating: 5,
    },
    {
        id: 2,
        quote: "Closing deals has never been easier. The decks look professional, persuasive, and I can customize them for each client in minutes.",
        name: "Mark Johnson",
        role: "Sales Director",
        company: "GrowthCorp",
        image: "/testimonials/mark.png",
        rating: 5,
    },
    {
        id: 3,
        quote: "I pitched to investors with a deck made in 10 minutes. They were impressed by the clarity and design. Highly recommended!",
        name: "Emily Davis",
        role: "Founder",
        company: "Artisan Startups",
        image: "/testimonials/emily.png",
        rating: 5,
    },
    {
        id: 4,
        quote: "I used to spend entire Sundays on slide decks for Monday morning meetings. Now I generate them in 90 seconds and actually have weekends.",
        name: "James Park",
        role: "Management Consultant",
        company: "Apex Advisory",
        image: "/testimonials/james.png",
        rating: 5,
    },
    {
        id: 5,
        quote: "As a student, I couldn't justify paying for Gamma or Beautiful.ai. PPT AI's free plan gives me everything I need for class presentations.",
        name: "Priya Sharma",
        role: "MBA Student",
        company: "Wharton School",
        image: "/testimonials/priya.png",
        rating: 5,
    },
    {
        id: 6,
        quote: "We switched our whole sales team from Canva to PPT AI. The AI-generated decks are more structured, more persuasive, and take a fraction of the time.",
        name: "Carlos Mendez",
        role: "VP of Sales",
        company: "ScaleForce",
        image: "/testimonials/carlos.png",
        rating: 5,
    },
];

const GRID_TESTIMONIALS = [
    {
        quote: "Used PPT AI for our Series A deck. Closed the round. Enough said.",
        name: "Ravi K.",
        role: "CEO, HealthTech Startup",
        rating: 5,
    },
    {
        quote: "The PowerPoint export is flawless. My clients can open it and edit it without any formatting issues.",
        name: "Anna W.",
        role: "Freelance Consultant",
        rating: 5,
    },
    {
        quote: "I convert all my research PDFs into slide decks now. What used to take 3 hours takes 2 minutes.",
        name: "Dr. Tom R.",
        role: "Research Scientist",
        rating: 5,
    },
];

export function Testimonials() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const next = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const prev = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
                        Loved by <span className="text-primary">10 million+ presenters</span><br />
                        around the world
                    </h2>
                    <div className="flex items-center justify-center gap-2 mt-4">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                        ))}
                        <span className="ml-2 font-semibold text-foreground">4.8/5</span>
                        <span className="text-muted-foreground text-sm">based on 1,250+ reviews</span>
                    </div>
                </div>

                {/* Featured Testimonial Carousel */}
                <div className="max-w-6xl mx-auto mb-16">
                    <div className="relative bg-muted/30 rounded-3xl p-8 md:p-12">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="grid md:grid-cols-12 gap-8 items-center"
                            >
                                {/* Left Image */}
                                <div className="md:col-span-4 relative">
                                    <div className="aspect-square relative rounded-2xl overflow-hidden shadow-2xl bg-muted">
                                        <Image
                                            src={testimonials[currentIndex]?.image ?? ""}
                                            alt={testimonials[currentIndex]?.name ?? "Testimonial"}
                                            fill
                                            className="object-cover"
                                            onError={() => {/* silently fail, bg-muted shows */}}
                                        />
                                    </div>
                                    <div className="absolute -bottom-6 -right-6 text-primary/10 hidden md:block">
                                        <Quote size={120} fill="currentColor" />
                                    </div>
                                </div>

                                {/* Right Content */}
                                <div className="md:col-span-8 space-y-8 pl-0 md:pl-8">
                                    <div className="flex gap-1 text-yellow-400">
                                        {[...Array(testimonials[currentIndex]?.rating ?? 5)].map((_, i) => (
                                            <Star key={i} className="h-6 w-6 fill-current" />
                                        ))}
                                    </div>

                                    <blockquote className="text-2xl md:text-3xl font-medium leading-relaxed text-foreground">
                                        &quot;{testimonials[currentIndex]?.quote}&quot;
                                    </blockquote>

                                    <div>
                                        <h4 className="text-xl font-bold text-foreground">{testimonials[currentIndex]?.name}</h4>
                                        <p className="text-muted-foreground">
                                            {testimonials[currentIndex]?.role}, {testimonials[currentIndex]?.company}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation */}
                        <div className="flex gap-4 absolute bottom-8 right-8 z-10">
                            <Button variant="outline" size="icon" onClick={prev} className="rounded-full h-12 w-12 hover:bg-background">
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={next} className="rounded-full h-12 w-12 hover:bg-background">
                                <ChevronRight className="h-6 w-6" />
                            </Button>
                        </div>

                        {/* Dots */}
                        <div className="flex gap-2 mt-6 justify-center">
                            {testimonials.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentIndex(i)}
                                    className={`h-2 rounded-full transition-all duration-200 ${
                                        i === currentIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Mini Grid */}
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {GRID_TESTIMONIALS.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-6 border rounded-xl bg-card"
                        >
                            <div className="flex gap-1 text-yellow-400 mb-3">
                                {[...Array(t.rating)].map((_, j) => (
                                    <Star key={j} className="h-4 w-4 fill-current" />
                                ))}
                            </div>
                            <p className="text-muted-foreground text-sm mb-4">&quot;{t.quote}&quot;</p>
                            <div>
                                <p className="font-semibold text-sm text-foreground">{t.name}</p>
                                <p className="text-xs text-muted-foreground">{t.role}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
