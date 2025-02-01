"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fieldUpdateVariants } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface AnimatedFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  className?: string;
  value?: string;
  isUpdating?: boolean;
}

export function AnimatedField({
  label,
  className,
  value,
  isUpdating,
  onChange,
  ...props
}: AnimatedFieldProps) {
  const [key, setKey] = useState(0);
  const [prevValue, setPrevValue] = useState(value);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (value !== prevValue && isUpdating) {
      setKey((k) => k + 1);
      setPrevValue(value);
      setShowSuccess(false);
    }
  }, [value, prevValue, isUpdating]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!isUpdating && value !== prevValue) {
      timeout = setTimeout(() => {
        setShowSuccess(true);
      }, 300);
    }
    return () => clearTimeout(timeout);
  }, [isUpdating, value, prevValue]);

  return (
    <motion.div
      className="grid w-full gap-1.5 relative"
      variants={fieldUpdateVariants.container}
    >
      <Label>{label}</Label>
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={key}
            variants={fieldUpdateVariants.update}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Input
              value={value}
              onChange={onChange}
              className={cn(
                className,
                "transition-colors duration-200",
                isUpdating && "border-blue-500/50 bg-blue-50/5 shadow-[0_0_0_1px_rgba(59,130,246,0.1)]",
                showSuccess && "border-blue-400/40 bg-blue-50/5 shadow-[0_0_0_1px_rgba(59,130,246,0.05)]"
              )}
              {...props}
            />
          </motion.div>
        </AnimatePresence>

        {isUpdating && (
          <>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-blue-400/10 to-blue-500/5 rounded-md pointer-events-none"
              variants={fieldUpdateVariants.highlight}
              initial="initial"
              animate="animate"
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent pointer-events-none"
              variants={fieldUpdateVariants.shimmer}
              initial="initial"
              animate="animate"
            />
          </>
        )}

        <AnimatePresence>
          {showSuccess && (
            <>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-blue-500/10 to-blue-400/5 rounded-md pointer-events-none"
                variants={fieldUpdateVariants.success}
                initial="initial"
                animate="animate"
              />
              <motion.div
                className="absolute inset-0 overflow-hidden rounded-md pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div 
                  className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-blue-200/10 to-transparent"
                  style={{
                    backgroundSize: '200% 100%',
                  }}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
