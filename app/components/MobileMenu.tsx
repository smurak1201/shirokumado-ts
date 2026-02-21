"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/app/components/ui/sheet";
import { Separator } from "@/app/components/ui/separator";
import { cn } from "@/lib/utils";
import { config } from "@/lib/config";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: config.animationConfig.STAGGER_CHILDREN_SECONDS,
      delayChildren: 0.15,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: config.animationConfig.FADE_IN_DURATION_SECONDS,
      ease: "easeOut",
    },
  },
};

const bottomVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, delay: 0.4, ease: "easeOut" },
  },
};

type NavLink = {
  href: string;
  label: string;
};

interface MobileMenuProps {
  navLinks: readonly NavLink[];
}

export default function MobileMenu({ navLinks }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleLinkClick = (): void => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          className={cn(
            "flex items-center justify-center rounded-full p-2 transition-all",
            "hover:bg-accent active:scale-95",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          aria-label="メニューを開く"
        >
          <Menu className="h-6 w-6 text-foreground/70" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-72 bg-background/95 backdrop-blur-sm"
      >
        <SheetTitle className="sr-only">ナビゲーションメニュー</SheetTitle>

        <motion.nav
          className="mt-8 flex flex-col"
          initial="hidden"
          animate={isOpen ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {navLinks.map((link, index) => (
            <motion.div key={link.href} variants={itemVariants}>
              {index > 0 && <Separator />}
              <Link
                href={link.href}
                onClick={handleLinkClick}
                className={cn(
                  "block py-4 text-base font-normal tracking-wide transition-colors",
                  pathname === link.href
                    ? "text-primary"
                    : "text-foreground/70 hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </motion.nav>

        <motion.div
          className="absolute bottom-8 left-6"
          initial="hidden"
          animate={isOpen ? "visible" : "hidden"}
          variants={bottomVariants}
        >
          <a
            href="https://www.instagram.com/shirokumado2021/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-2 rounded-full p-2 transition-all",
              "hover:bg-accent hover:scale-110 active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            aria-label="Instagram"
          >
            <Image
              src="/logo-instagram.svg"
              alt="Instagram"
              width={24}
              height={24}
              className="h-6 w-6"
            />
          </a>
        </motion.div>
      </SheetContent>
    </Sheet>
  );
}
