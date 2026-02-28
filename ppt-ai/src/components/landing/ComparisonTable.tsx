"use client";

import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";

const features = [
  "Free plan available",
  "No credit card required",
  "PowerPoint (.pptx) export",
  "AI generation from prompt",
  "PDF to PPT converter",
  "Brand kit",
  "Real-time sharing",
  "Unlimited slides per deck",
];

type FeatureValue = true | false | "partial";

const tools: { name: string; highlight?: boolean; values: FeatureValue[] }[] = [
  {
    name: "PPT AI",
    highlight: true,
    values: [true, true, true, true, true, true, true, true],
  },
  {
    name: "Gamma",
    values: [true, false, true, true, false, true, true, false],
  },
  {
    name: "Beautiful.ai",
    values: [false, false, true, "partial", false, true, true, true],
  },
  {
    name: "Canva",
    values: [true, true, true, "partial", false, true, true, true],
  },
];

function FeatureIcon({ value }: { value: FeatureValue }) {
  if (value === true) return <Check className="h-5 w-5 text-green-500 mx-auto" />;
  if (value === false) return <X className="h-5 w-5 text-red-400 mx-auto" />;
  return <Minus className="h-5 w-5 text-yellow-500 mx-auto" />;
}

export function ComparisonTable() {
  return (
    <section className="py-24 bg-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            How PPT AI compares to{" "}
            <span className="text-primary">the competition</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            We built PPT AI to be the most accessible and powerful AI presentation tool. See how we stack up.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="overflow-x-auto"
        >
          <table className="w-full max-w-4xl mx-auto border-collapse text-sm">
            <thead>
              <tr>
                <th className="text-left py-4 px-4 font-semibold text-muted-foreground w-1/3">Feature</th>
                {tools.map((tool) => (
                  <th
                    key={tool.name}
                    className={`py-4 px-4 text-center font-bold text-base ${
                      tool.highlight
                        ? "bg-primary/10 text-primary rounded-t-xl"
                        : "text-foreground"
                    }`}
                  >
                    {tool.name}
                    {tool.highlight && (
                      <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded-full font-medium">
                        Best Value
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, i) => (
                <tr key={feature} className={i % 2 === 0 ? "bg-background/50" : ""}>
                  <td className="py-3 px-4 text-foreground font-medium">{feature}</td>
                  {tools.map((tool) => (
                    <td
                      key={tool.name}
                      className={`py-3 px-4 text-center ${
                        tool.highlight ? "bg-primary/5" : ""
                      }`}
                    >
                      <FeatureIcon value={tool.values[i] ?? false} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Comparison based on publicly available information as of February 2026. "Partial" indicates limited availability on certain plans.
        </p>
      </div>
    </section>
  );
}
