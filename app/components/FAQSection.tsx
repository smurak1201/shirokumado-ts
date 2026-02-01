/**
 * FAQセクションコンポーネント
 *
 * よくある質問をアコーディオン形式で表示する。
 */
"use client";

import { motion, type Variants } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { QuestionBadge } from "./ui/badge-question";
import { Separator } from "./ui/separator";
import { config } from "@/lib/config";
import type { FAQ } from "@/app/faq/data";
import { cn } from "@/lib/utils";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: config.animationConfig.STAGGER_CHILDREN_SECONDS,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: config.animationConfig.FADE_IN_DURATION_SECONDS,
      ease: "easeOut",
    },
  },
};

const titleVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: config.animationConfig.SCROLL_ANIMATION_DURATION_SECONDS,
      ease: "easeOut",
    },
  },
};

interface FAQSectionProps {
  faqs: FAQ[];
  showTitle?: boolean;
}

export default function FAQSection({
  faqs,
  showTitle = false,
}: FAQSectionProps) {
  return (
    <>
      {showTitle && (
        <motion.div
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-10 flex flex-col items-center gap-4 md:mb-12"
        >
          <h1 className="text-center text-2xl font-normal tracking-wide text-muted-foreground md:text-3xl lg:text-4xl">
            よくある質問
          </h1>
          <Separator className="w-20 md:w-32" />
        </motion.div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -100px 0px" }}
      >
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div key={faq.question} variants={itemVariants}>
              <AccordionItem
                value={`faq-${index}`}
                className={cn(
                  "rounded-lg border border-border/60 px-4",
                  "transition-all duration-300",
                  "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
                  "data-[state=open]:border-primary/40 data-[state=open]:bg-primary/5"
                )}
              >
                <AccordionTrigger className="gap-3 py-4 hover:no-underline md:gap-4">
                  <div className="flex items-center gap-3 md:gap-4">
                    <QuestionBadge>Q{index + 1}</QuestionBadge>
                    <span className="text-left text-base font-normal leading-relaxed text-foreground md:text-lg">
                      {faq.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="ml-0 pb-2 md:ml-12">
                    <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                      {faq.answer}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </motion.div>
    </>
  );
}
