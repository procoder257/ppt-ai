"use client";

import { motion } from "framer-motion";
import {
    Wand2,
    LayoutTemplate,
    Palette,
    Download,
    History,
    Globe
} from "lucide-react";

const features = [
    {
        icon: Wand2,
        title: "Effortless Creation",
        description: "Instantly transform ideas into professional presentations with our AI-driven design assistant.",
        color: "bg-blue-100"
    },
    {
        icon: Palette,
        title: "Personalized Design",
        description: "Automatically receive design suggestions tailored to your unique style and content.",
        color: "bg-orange-100"
    },
    {
        icon: LayoutTemplate,
        title: "Anti-fragile Templates",
        description: "Employ templates that effortlessly adapt to your content changes, preserving design integrity.",
        color: "bg-gray-200"
    },
    {
        icon: Download,
        title: "PowerPoint Compatibility",
        description: "Efficiently export your presentations to PowerPoint for seamless offline editing.",
        color: "bg-green-100"
    },
    {
        icon: History,
        title: "Brand Sync",
        description: "Ensure consistent brand representation in all presentations with automatic style alignment.",
        color: "bg-yellow-100"
    },
    {
        icon: Globe,
        title: "Seamless Sharing",
        description: "Share your presentations effortlessly, with real-time sync across all devices.",
        color: "bg-purple-100"
    }
];

export function Features() {
    return (
        <section id="features" className="py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-bold mb-6 text-foreground"
                    >
                        Key features of our <br className="hidden md:block" />
                        <span className="text-foreground">AI presentation maker</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-muted-foreground leading-relaxed"
                    >
                        Use AI to create PPTs, infographics, charts, timelines, project plans, reports, product roadmaps and more - effortless, engaging, and free to try
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group text-center flex flex-col items-center"
                        >
                            <div className={`h-24 w-24 rounded-[2rem] ${feature.color} flex items-center justify-center mb-6 transition-transform hover:scale-105 duration-300`}>
                                <feature.icon className="h-10 w-10 text-slate-800" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
