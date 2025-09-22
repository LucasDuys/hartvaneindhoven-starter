"use client";
import { useEffect, useMemo, useState } from "react";
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

  // Close on Escape key
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  // Lock background scroll when preview is open
  useEffect(() => {
    if (selected) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [selected]);

  return (
    <div>
      <div className="grid md:grid-cols-3 gap-6">
        {activities.map((a, i) => {
          const isOpen = open === a.slug;
          if (isOpen) {
            // Hide original card while open to avoid duplicate layoutId conflicts
            return (
              <div
                key={a.slug}
                className="card p-6 opacity-0 pointer-events-none"
                aria-hidden
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            );
          }
          return (
            <motion.button
              key={a.slug}
              layoutId={`card-${a.slug}`}
              onClick={() => setOpen(a.slug)}
              className="card p-6 text-left hover:scale-[1.01] transition animate-fade-in focus:outline-none focus:ring-2 focus:ring-accent-500"
              style={{ animationDelay: `${i * 0.1}s` }}
              aria-expanded={isOpen}
            >
              <div className="h-40 mb-4 overflow-hidden rounded-xl">
                <motion.img layoutId={`img-${a.slug}`} src={a.hero} alt={a.title} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-bold mb-2">{a.title}</h3>
              <p className="text-white/70">{a.desc}</p>
            </motion.button>
          );
        })}
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
              className="fixed inset-0 bg-black/70 z-40"
              onClick={() => setOpen(null)}
            />
            {/* Expanding panel */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10" style={{ perspective: '1200px' }}>
            <motion.div
              key={selected.slug}
              layoutId={`card-${selected.slug}`}
              className="relative w-[min(95vw,1100px)] h-[min(85vh,750px)] rounded-2xl overflow-hidden bg-black/40 border border-white/10 backdrop-blur-xl shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
              onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, rotateX: 8, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, rotateX: 0, scale: 1, y: 0 }}
              exit={{ opacity: 0, rotateX: -4, scale: 0.98, y: 12 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              {/* Fullscreen background image for clear preview */}
              <div className="absolute inset-0">
                <motion.img
                  layoutId={`img-${selected.slug}`}
                  src={selected.hero}
                  alt={selected.title}
                  className="w-full h-full object-cover"
                />
                {/* Subtle gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />
              </div>

              {/* Close button */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setOpen(null);
                }}
                aria-label="Sluiten"
                className="absolute top-3 right-3 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors"
              >
                ×
              </button>

              {/* Foreground content */}
              <div className="relative z-10 h-full w-full flex items-end md:items-center">
                <div className="p-6 md:p-12 max-w-3xl space-y-4">
                  <h3 className="text-3xl md:text-5xl font-bold text-white drop-shadow">{selected.title}</h3>
                  <p className="text-white/90 text-lg md:text-xl max-w-2xl drop-shadow">{selected.desc}</p>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Link href={`/booking?activity=${selected.slug}`} className="btn-primary px-6 py-3 text-base">
                      Boek nu
                    </Link>
                    <Link href={`/activities/${selected.slug}`} className="btn px-6 py-3 text-base bg-black/40 border border-white/20 hover:bg-white/10">
                      Bekijk activiteit
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
