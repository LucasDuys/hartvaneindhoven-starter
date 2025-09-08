import Link from "next/link";

const activities = [
  { slug: "bowlen", title: "Bowlen", duration: "60–120 min", priceFrom: "€25 per baan" },
  { slug: "karaoke", title: "Karaoke", duration: "60–120 min", priceFrom: "€10 p.p." },
  { slug: "beat-the-matrix", title: "Beat the Matrix", duration: "60 min", priceFrom: "€14 p.p." }
];

export default function Activities() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Activiteiten</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {activities.map(a => (
          <Link key={a.slug} href={`/activities/${a.slug}`} className="card p-6">
            <h3 className="text-xl font-semibold">{a.title}</h3>
            <p className="text-white/70 mt-2">{a.duration} · vanaf {a.priceFrom}</p>
            <div className="mt-4 inline-block btn-primary">Bekijk</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
