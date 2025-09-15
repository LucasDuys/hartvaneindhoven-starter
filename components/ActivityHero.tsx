"use client";
import { motion } from "framer-motion";

export default function ActivityHero({
  slug,
  imageUrl,
  title,
  summary,
}: {
  slug: string;
  imageUrl: string;
  title: string;
  summary?: string;
}) {
  return (
    <section className="relative overflow-hidden" aria-label={`${title} hero image`}>
      <motion.div layoutId={`card-${slug}`} className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-black/20">
        <motion.img layoutId={`img-${slug}`} src={imageUrl} alt={title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center animate-fade-in max-w-4xl px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          {summary ? <p className="text-xl text-white/90">{summary}</p> : null}
        </div>
      </motion.div>
    </section>
  );
}

