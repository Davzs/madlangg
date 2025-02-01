"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInForm } from "./form";
import { motion } from "framer-motion";
import { BookOpenCheck } from "lucide-react";
import { useTheme } from "next-themes";

export default function SignInPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen w-full flex items-center justify-center animate-gradient-xy p-4 ${
      isDark ? "auth-gradient-dark" : "auth-gradient-light"
    }`}>
      <div className={`absolute inset-0 ${
        isDark ? "bg-grid-dark" : "bg-grid-light"
      } bg-grid-pattern`} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full sm:w-[400px] overflow-hidden border-0 shadow-xl bg-background/60 backdrop-blur-lg">
          <CardHeader className="space-y-4 items-center text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className={`w-16 h-16 rounded-full bg-gradient-to-tr from-primary/80 to-primary flex items-center justify-center ring-2 ring-primary/20`}
            >
              <BookOpenCheck className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <CardTitle className="text-2xl font-bold">
              Welcome Back
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SignInForm />
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-center text-sm"
            >
              Don't have an account?{" "}
              <Link 
                href="/auth/signup" 
                className="text-primary hover:text-primary/80 transition-colors font-medium hover:underline"
              >
                Sign up
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
