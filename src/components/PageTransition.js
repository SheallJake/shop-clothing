"use client";

import { motion } from "framer-motion";

// Different transition types
const transitions = {
  spring: {
    type: "spring",
    stiffness: 260,
    damping: 20,
    mass: 1,
  },
  tween: {
    type: "tween",
    duration: 0.3,
    ease: "easeInOut",
  },
  inertia: {
    type: "inertia",
    velocity: 300,
    power: 0.8,
    timeConstant: 200,
  },
};

export default function PageTransition({ children }) {
  // You can change the transition type here
  const currentTransition = transitions.spring;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={currentTransition}
    >
      {children}
    </motion.div>
  );
}
