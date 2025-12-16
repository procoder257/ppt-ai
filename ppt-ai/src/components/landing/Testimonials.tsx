"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
    {
        id: 1,
        quote: "The AI suggestions are spot on. It saved me hours of tweaking layouts, and the result looks like we hired a professional agency.",
        name: "Sarah Chen",
        role: "Product Manager",
        company: "TechFlow",
        image: "/testimonials/sarah.png",
        rating: 5
    },
    {
        id: 2,
        quote: "Closing deals has never been easier. The decks look professional, persuasive, and I can customize them for each client in minutes.",
        name: "Mark Johnson",
        role: "Sales Director",
        company: "GrowthCorp",
        image: "/testimonials/mark.png",
        rating: 5
    },
    {
        id: 3,
        quote: "I pitched to investors with a deck made in 10 minutes. They were impressed by the clarity and design. Highly recommended!",
        name: "Emily Davis",
        role: "Founder",
        company: "Artisan Startups",
        image: "/testimonials/emily.png",
        rating: 5
    }
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
                        Hear what <span className="text-primary">teams</span> around the world<br />
                        saying about <span className="text-foreground">PPT AI</span>.
                    </h2>
                </div>

                <div className="max-w-6xl mx-auto">
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
                                    <div className="aspect-square relative rounded-2xl overflow-hidden shadow-2xl">
                                        <Image
                                            src={testimonials[currentIndex].image}
                                            alt={testimonials[currentIndex].name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="absolute -bottom-6 -right-6 text-primary/10 hidden md:block">
                                        <Quote size={120} fill="currentColor" />
                                    </div>
                                </div>

                                {/* Right Content */}
                                <div className="md:col-span-8 space-y-8 pl-0 md:pl-8">
                                    <div className="flex gap-1 text-yellow-400">
                                        {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                                            <Star key={i} className="h-6 w-6 fill-current" />
                                        ))}
                                    </div>

                                    <blockquote className="text-2xl md:text-3xl font-medium leading-relaxed text-foreground">
                                        &quot;{testimonials[currentIndex].quote}&quot;
                                    </blockquote>

                                    <div>
                                        <h4 className="text-xl font-bold text-foreground">{testimonials[currentIndex].name}</h4>
                                        <p className="text-muted-foreground">{testimonials[currentIndex].role}, {testimonials[currentIndex].company}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="flex gap-4 absolute bottom-8 right-8 z-10">
                            <Button variant="outline" size="icon" onClick={prev} className="rounded-full h-12 w-12 hover:bg-background">
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={next} className="rounded-full h-12 w-12 hover:bg-background">
                                <ChevronRight className="h-6 w-6" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
