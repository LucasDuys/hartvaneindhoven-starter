import Link from "next/link";

const activities = [
  { slug: "bowlen", title: "Bowlen", duration: "60–120 min", priceFrom: "€25 per baan", desc: "Geniet van bowling op historische banen in een unieke kerksetting." },
  { slug: "karaoke", title: "Karaoke", duration: "60–120 min", priceFrom: "€10 p.p.", desc: "Zing je favoriete hits in privé kamers met professionele apparatuur." },
  { slug: "beat-the-matrix", title: "Beat the Matrix", duration: "60 min", priceFrom: "€14 p.p.", desc: "Test je behendigheid in dit spannende interactieve spel." }
];

export default function Activities() {
  return (
    <>
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('https://source.unsplash.com/random/1920x1080/?activities')" }} aria-label="Activities overview">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center animate-fade-in max-w-4xl px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Onze Activiteiten</h1>
          <p className="text-xl text-white/90">Ontdek ons unieke aanbod van entertainment in het hart van Eindhoven.</p>
        </div>
      </section>
      <section className="container py-16 space-y-12">
        <div className="text-center animate-fade-in">
          <h2 className="text-3xl font-bold mb-4">Kies je Avontuur</h2>
          <p className="text-white/70 max-w-2xl mx-auto">Van bowling tot karaoke, vind de perfecte activiteit voor jou en je groep.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {activities.map((a, i) => (
            <Link key={a.slug} href={`/activities/${a.slug}`} className="card p-6 hover:scale-[1.01] transition animate-fade-in" style={{ animationDelay: `${i * 0.2}s` }} aria-label={`Bekijk details voor ${a.title}`}>
              <h3 className="text-xl font-bold mb-2">{a.title}</h3>
              <p className="text-white/70 mb-2">{a.desc}</p>
              <p className="text-sm text-white/60 mb-4">{a.duration} · vanaf {a.priceFrom}</p>
              <div className="inline-block btn-primary px-4 py-2">Bekijk details</div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
