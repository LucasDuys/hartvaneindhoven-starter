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
    <section className="relative flex items-center justify-center overflow-hidden bg-black min-h-[60vh]" aria-label={`${title} hero image`}>
      {/* Image container with 16:9 aspect ratio (matches homepage) */}
      <motion.div layoutId={`card-${slug}`} className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full max-w-[1600px] aspect-video max-h-[80vh]">
          <motion.img
            layoutId={`img-${slug}`}
            src={imageUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </motion.div>
      {/* Overlay gradient for readability */}
      <div className="absolute inset-0 bg-black/40" />
      {/* Foreground text */}
      <div className="relative z-10 text-center animate-fade-in max-w-4xl px-4">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">{title}</h1>
        {summary ? <p className="text-xl text-white/90">{summary}</p> : null}
      </div>
    </section>
  );
}
