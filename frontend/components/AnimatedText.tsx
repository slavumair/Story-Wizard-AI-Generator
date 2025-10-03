"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const messages = [
  "Let’s make your story ✨",
  "Cooking up some magic 🌟",
  "Stories made fun 🎨",
  "Your adventure awaits 🚀"
];

export default function AnimatedText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setIndex((i) => (i + 1) % messages.length),
      3000
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.p
      key={index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.6 }}
      className="text-lg text-gray-600 mt-2"
    >
      {messages[index]}
    </motion.p>
  );
}
