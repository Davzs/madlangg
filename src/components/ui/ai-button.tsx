"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2 } from "lucide-react";
import { ButtonHTMLAttributes } from "react";
import { aiButtonVariants } from "@/lib/animations";

interface AIButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function AIButton({
  isLoading,
  loadingText = "Thinking...",
  children,
  className,
  variant = "outline",
  size = "sm",
  ...props
}: AIButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "relative overflow-hidden group transition-all duration-300",
        isLoading && "border-violet-500/50",
        className
      )}
      {...props}
    >
      <AnimatePresence>
        {isLoading && (
          <>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-violet-500/20"
              variants={aiButtonVariants.gradient}
              initial="initial"
              animate="animate"
              exit="exit"
            />
            
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-violet-500/20"
              variants={aiButtonVariants.shimmer}
              initial="initial"
              animate="animate"
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </>
        )}
      </AnimatePresence>

      <motion.span 
        className="relative flex items-center gap-2"
        animate={isLoading ? { scale: 0.98 } : { scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <motion.span
          variants={aiButtonVariants.icon}
          initial="initial"
          animate={isLoading ? "animate" : "initial"}
          transition={
            isLoading
              ? {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear",
                }
              : { duration: 0.2 }
          }
          className="text-violet-500"
        >
          <Wand2 className={cn(
            "h-4 w-4 transition-transform",
            !isLoading && "group-hover:rotate-12 group-hover:scale-110"
          )} />
        </motion.span>
        <span className={cn(
          "transition-colors duration-200",
          isLoading && "text-violet-500"
        )}>
          {isLoading ? loadingText : children}
        </span>
      </motion.span>
    </Button>
  );
}
