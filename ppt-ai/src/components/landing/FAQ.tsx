"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";

const faqs = [
  {
    question: "Is PPT AI free to use?",
    answer:
      "Yes. PPT AI offers a free plan that includes 5 AI-generated presentations per month with no credit card required. Upgrade to Pro for unlimited presentations, priority generation, and advanced export options.",
  },
  {
    question: "Can I export presentations to PowerPoint (.pptx)?",
    answer:
      "Absolutely. Every presentation created with PPT AI can be exported as a fully editable .pptx file compatible with Microsoft PowerPoint, Google Slides, and LibreOffice.",
  },
  {
    question: "How is PPT AI different from Gamma or Beautiful.ai?",
    answer:
      "PPT AI is built for speed and accessibility. Unlike Gamma (which requires a paid plan for PowerPoint export) or Beautiful.ai (no free plan), PPT AI gives you free PPTX exports, a faster generation pipeline, and no credit card required to get started. We focus on giving professionals the cleanest, most editable output.",
  },
  {
    question: "Can I convert a PDF into a PowerPoint presentation?",
    answer:
      "Yes. PPT AI can analyze a PDF document and automatically generate a structured, summarized presentation from it — turning dense reports, whitepapers, or research papers into polished slide decks in seconds.",
  },
  {
    question: "What types of presentations can I create?",
    answer:
      "PPT AI supports a wide range of presentation types: business pitch decks, investor presentations, sales decks, educational slide decks, project plans, product roadmaps, quarterly business reviews, and more. Just describe your goal and our AI handles the rest.",
  },
  {
    question: "Does PPT AI support custom branding?",
    answer:
      "Yes. Pro users can upload their brand kit — including logo, colors, and fonts — so every AI-generated presentation automatically matches their company's visual identity.",
  },
  {
    question: "How many slides can I create per presentation?",
    answer:
      "There is no hard limit on slides per presentation. PPT AI generates as many slides as needed to cover your topic effectively, and you can add, remove, or rearrange slides after generation.",
  },
  {
    question: "Is my data safe with PPT AI?",
    answer:
      "Yes. We take privacy seriously. Your presentation content is processed securely and is never used to train AI models without your explicit consent. See our Privacy Policy for full details.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="py-24 bg-background">
      <JsonLd data={faqSchema} />
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Frequently asked <span className="text-primary">questions</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about PPT AI. Can&apos;t find an answer? Reach out to us.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto divide-y divide-border">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                className="w-full flex items-center justify-between py-5 text-left gap-4"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={openIndex === index}
              >
                <span className="font-semibold text-foreground text-lg">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="pb-5 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
