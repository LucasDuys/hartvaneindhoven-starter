"use client";
import { LayoutGroup, AnimatePresence } from "framer-motion";
import React from "react";

export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LayoutGroup>
      <AnimatePresence mode="wait">{children}</AnimatePresence>
    </LayoutGroup>
  );
}

