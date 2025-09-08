import Link from "next/link";

export default function Home() {
  return (
    <section className="space-y-8">
      <div className="card p-10">
        <h1 className="text-4xl font-extrabold">Bowlen in een kerk ⛪🎳</h1>
        <p className="mt-3 text-white/80 max-w-2xl">
          Ervaar unieke bowlingbanen, karaoke kamers en interactieve games in het hart van Eindhoven.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/booking" className="btn-primary">Reserveer nu</Link>
          <Link href="/activities" className="btn">Bekijk activiteiten</Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {['Bowlen', 'Karaoke', 'Beat the Matrix'].map((name, i) => (
          <Link key={i} href={`/activities/${name.toLowerCase().replace(/\s+/g, '-')}`} className="card p-6 hover:scale-[1.01] transition">
            <h3 className="text-xl font-bold">{name}</h3>
            <p className="text-white/70 mt-2">Bekijk tijden, prijzen en details.</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
