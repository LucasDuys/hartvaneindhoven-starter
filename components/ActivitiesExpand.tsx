"use client";
import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";

type Activity = {
  slug: string;
  title: string;
  desc: string;
  hero: string;
};

export default function ActivitiesExpand({ activities }: { activities: Activity[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const selected = useMemo(() => activities.find(a => a.slug === open) || null, [open, activities]);

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-6">
        {activities.map((a, i) => (
          <motion.button
            key={a.slug}
            layoutId={`card-${a.slug}`}
            onClick={() => setOpen(a.slug)}
            className="card p-6 text-left hover:scale-[1.01] transition animate-fade-in focus:outline-none focus:ring-2 focus:ring-accent-500"
            style={{ animationDelay: `${i * 0.1}s` }}
            aria-expanded={open === a.slug}
          >
            <div className="h-40 mb-4 overflow-hidden rounded-xl">
              <motion.img layoutId={`img-${a.slug}`} src={a.hero} alt={a.title} className="w-full h-full object-cover" />
            </div>
            <h3 className="text-xl font-bold mb-2">{a.title}</h3>
            <p className="text-white/70">{a.desc}</p>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setOpen(null)}
            />
            {/* Expanding panel */}
            <motion.div
              key={selected.slug}
              layoutId={`card-${selected.slug}`}
              className="fixed inset-4 md:inset-10 z-50 card overflow-hidden"
            >
              {/* Full backdrop image, blurred and darkened */}
              <div className="absolute inset-0">
                <motion.img
                  layoutId={`img-${selected.slug}`}
                  src={selected.hero}
                  alt={selected.title}
                  className="w-full h-full object-contain blur-md"
                />
                <div className="absolute inset-0 bg-black/60" />
              </div>

              {/* Close button */}
              <button
                onClick={() => setOpen(null)}
                aria-label="Sluiten"
                className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center z-10"
              >
                ×
              </button>

              {/* Foreground content */}
              <div className="relative z-10 p-6 space-y-4">
                <h3 className="text-2xl font-bold">{selected.title}</h3>
                <p className="text-white/80 max-w-2xl">{selected.desc}</p>
                <div className="flex gap-3">
                  <Link href={`/booking?activity=${selected.slug}`} className="btn-primary px-5 py-2">
                    Boek nu
                  </Link>
                  <Link href={`/activities/${selected.slug}`} className="btn px-5 py-2 bg-black/40 border border-white/10 hover:bg-brand-600">
                    Naar details
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
