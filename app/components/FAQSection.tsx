/**
 * FAQセクションコンポーネント
 *
 * よくある質問をアコーディオン形式で表示する。
 */
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { QuestionBadge } from "./ui/badge-question";
import { Separator } from "./ui/separator";
import { cn } from "@/lib/utils";
import { useInView } from "../hooks/useInView";
import { scrollAnimationClass } from "@/lib/animation";

export interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
  showTitle?: boolean;
}

export default function FAQSection({
  faqs,
  showTitle = false,
}: FAQSectionProps) {
  const { ref: titleRef, isInView: titleInView } = useInView<HTMLDivElement>();
  const { ref: listRef, isInView: listInView } = useInView<HTMLDivElement>({ margin: "0px 0px -100px 0px" });

  return (
    <section aria-labelledby={showTitle ? "faq-title" : undefined}>
      {showTitle && (
        <div
          ref={titleRef}
          className={`${scrollAnimationClass(titleInView)} mb-10 flex flex-col items-center gap-4 md:mb-12`}
        >
          <h1
            id="faq-title"
            className="text-center text-2xl font-normal tracking-wide text-muted-foreground md:text-3xl lg:text-4xl"
          >
            よくある質問
          </h1>
          <Separator className="w-20 md:w-32" />
        </div>
      )}

      <div ref={listRef}>
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className={scrollAnimationClass(listInView, index)}
            >
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
            </div>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
