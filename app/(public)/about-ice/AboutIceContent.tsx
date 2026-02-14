"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { Separator } from "@/app/components/ui/separator";
import { config } from "@/lib/config";
import { cn } from "@/lib/utils";
import { aboutIceSections, type AboutIceSection } from "./data";

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

function SectionImages({
  images,
  priority,
}: {
  images: AboutIceSection["images"];
  priority: boolean;
}) {
  if (images.length === 1 && images[0]) {
    const image = images[0];
    return (
      <div className="overflow-hidden rounded-lg">
        <Image
          src={image.src}
          alt={image.alt}
          width={600}
          height={600}
          priority={priority}
          className="aspect-square w-full object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {images.map((image) => (
        <div key={image.src} className="overflow-hidden rounded-lg">
          <Image
            src={image.src}
            alt={image.alt}
            width={300}
            height={300}
            className="aspect-square w-full object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
      ))}
    </div>
  );
}

function Section({
  section,
  index,
}: {
  section: AboutIceSection;
  index: number;
}) {
  const hasImages = section.images.length > 0;
  const isEven = index % 2 === 0;

  return (
    <motion.article
      variants={itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -100px 0px" }}
      className={cn(
        "grid gap-6",
        hasImages && "md:grid-cols-2 md:gap-10 md:items-center"
      )}
    >
      <div className={cn("space-y-4", hasImages && !isEven && "md:order-2")}>
        <h2 className="text-xl font-medium tracking-wide text-foreground md:text-2xl">
          {section.title}
        </h2>
        <div className="space-y-3">
          {section.paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className="text-sm leading-relaxed text-muted-foreground md:text-base"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {hasImages && (
        <div className={cn(!isEven && "md:order-1")}>
          <SectionImages images={section.images} priority={index === 0} />
        </div>
      )}
    </motion.article>
  );
}

export default function AboutIceContent() {
  return (
    <>
      <motion.div
        variants={titleVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="mb-10 flex flex-col items-center gap-4 md:mb-12"
      >
        <h1 className="text-center text-2xl font-normal tracking-wide text-muted-foreground md:text-3xl lg:text-4xl">
          天然氷について
        </h1>
        <Separator className="w-20 md:w-32" />
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -100px 0px" }}
        className="space-y-16 md:space-y-24"
      >
        {aboutIceSections.map((section, index) => (
          <Section key={section.id} section={section} index={index} />
        ))}
      </motion.div>
    </>
  );
}
