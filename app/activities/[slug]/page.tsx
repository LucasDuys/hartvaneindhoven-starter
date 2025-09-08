import Link from "next/link";

type Params = { params: { slug: string } };

const copy: Record<string, {title: string, summary: string}> = {
  "bowlen": { title: "Bowlen", summary: "Unieke bowlingbanen in een kerk met neon vibe. Capaciteit: 6 p.p. per baan." },
  "karaoke": { title: "Karaoke", summary: "Privékamers met top sound. Kies je playlist en zing mee." },
  "beat-the-matrix": { title: "Beat the Matrix", summary: "Interactieve challenge rooms met puzzels en teamwork." }
};

export default function ActivityPage({ params }: Params) {
  const data = copy[params.slug] ?? { title: "Activiteit", summary: "Details volgen." };
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-bold">{data.title}</h1>
      <p className="text-white/80">{data.summary}</p>
      <Link href={`/booking?activity=${params.slug}`} className="btn-primary">Check beschikbaarheid</Link>
      <section className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Prijzen</h2>
          <ul className="mt-3 list-disc list-inside text-white/80">
            <li>Doordeweeks (off-peak): scherp geprijsd</li>
            <li>Weekend/avond (peak): dynamische prijs</li>
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-semibold">Veelgestelde vragen</h2>
          <ul className="mt-3 list-disc list-inside text-white/80">
            <li>Mag ik bumpers? Ja, voor kids.</li>
            <li>Annuleren? Tot 24u van tevoren.</li>
          </ul>
        </div>
      </section>
    </article>
  );
}
