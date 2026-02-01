/**
 * 商品詳細モーダルコンポーネント
 *
 * 商品タイルをクリックした時に表示される、商品の詳細情報を表示するモーダル。
 */
"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import type { Product } from "../types";
import { formatPrice } from "@/lib/product-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { PriceBadge } from "./ui/badge-price";
import {
  ModalImageCard,
  ModalContentCard,
  ModalPriceCard,
  ModalCardContent,
  ModalCardHeader,
} from "./ui/card-modal";
import { config } from "@/lib/config";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: config.animationConfig.STAGGER_CHILDREN_SECONDS,
      delayChildren: 0.1,
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

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({
  product,
  isOpen,
  onClose,
}: ProductModalProps) {
  if (!product) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-2xl p-0 overflow-hidden sm:rounded-lg">
        <ScrollArea className="max-h-[90vh]">
          <motion.div
            className="flex flex-col gap-4 p-4 md:p-6 lg:p-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <ModalImageCard>
                <ModalCardHeader>
                  <div className="relative h-[40vh] min-h-[200px] max-h-[450px] md:h-[45vh] md:max-h-[500px] overflow-hidden bg-muted">
                    {product.imageUrl ? (
                      <motion.div
                        className="relative h-full w-full flex items-center justify-center p-4 md:p-6"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 672px"
                          priority
                        />
                      </motion.div>
                    ) : (
                      <div className="h-full w-full bg-linear-to-br from-muted via-muted/80 to-muted/50" />
                    )}
                  </div>
                </ModalCardHeader>
              </ModalImageCard>
            </motion.div>

            <motion.div variants={itemVariants}>
              <ModalContentCard>
                <ModalCardContent>
                  <DialogHeader className="space-y-3 mb-0">
                    <DialogTitle className="whitespace-pre-wrap text-center text-xl font-normal tracking-wide leading-tight text-muted-foreground md:text-2xl lg:text-3xl">
                      {product.name}
                    </DialogTitle>
                    {product.description && (
                      <DialogDescription className="text-center text-sm leading-relaxed text-muted-foreground md:text-base lg:text-lg mt-2">
                        {product.description}
                      </DialogDescription>
                    )}
                  </DialogHeader>
                </ModalCardContent>
              </ModalContentCard>
            </motion.div>

            {(product.priceS || product.priceL) && (
              <motion.div variants={itemVariants}>
                <ModalPriceCard>
                  <ModalCardContent>
                    <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
                      {product.priceS && (
                        <motion.div
                          className="flex flex-col items-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                            Small
                          </span>
                          <PriceBadge className="text-lg md:text-xl">
                            {formatPrice(product.priceS)}
                          </PriceBadge>
                        </motion.div>
                      )}
                      {product.priceS && product.priceL && (
                        <div className="flex flex-col items-center">
                          <Separator
                            orientation="vertical"
                            className="h-12 md:h-16 bg-border/50"
                          />
                        </div>
                      )}
                      {product.priceL && (
                        <motion.div
                          className="flex flex-col items-center gap-2"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                            Large
                          </span>
                          <PriceBadge className="text-lg md:text-xl">
                            {formatPrice(product.priceL)}
                          </PriceBadge>
                        </motion.div>
                      )}
                    </div>
                  </ModalCardContent>
                </ModalPriceCard>
              </motion.div>
            )}
          </motion.div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
