import { Variants } from "framer-motion";

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const slideDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const scaleUp: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const aiButtonVariants = {
  gradient: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  shimmer: {
    initial: { x: "-100%", opacity: 0 },
    animate: {
      x: ["0%", "100%"],
      opacity: [0, 1, 0],
    },
  },
  icon: {
    initial: { rotate: 0 },
    animate: { rotate: 360 },
  },
};

export const containerVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0 },
};

export const fieldUpdateVariants = {
  container: {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 1 },
  },
  update: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.8
      }
    },
    exit: { opacity: 0, scale: 0.98 },
  },
  highlight: {
    initial: { opacity: 0 },
    animate: {
      opacity: [0, 0.15, 0.1],
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
        times: [0, 0.4, 1]
      }
    },
  },
  shimmer: {
    initial: { opacity: 0, scale: 0.98 },
    animate: {
      opacity: [0, 0.8, 0],
      scale: [0.98, 1, 0.98],
      transition: {
        duration: 1.2,
        ease: [0.22, 1, 0.36, 1],
        times: [0, 0.4, 1]
      }
    },
  },
  success: {
    initial: { opacity: 0, scale: 0.95 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 20,
      }
    }
  }
};
