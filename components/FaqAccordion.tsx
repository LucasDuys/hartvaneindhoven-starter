"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Item = { q: string; a: string };

export default function FaqAccordion({ items }: { items: Item[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-white/10">
      {items.map((it, idx) => {
        const isOpen = open === idx;
        return (
          <div key={idx} className="py-3">
            <button
              className="w-full text-left flex items-center justify-between gap-4 focus:outline-none"
              onClick={() => setOpen(isOpen ? null : idx)}
              aria-expanded={isOpen}
              aria-controls={`faq-${idx}`}
            >
              <span className="font-medium">{it.q}</span>
              <span className={`transition ${isOpen ? 'rotate-45' : ''}`}>+</span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-${idx}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 text-white/80">
                    {it.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

